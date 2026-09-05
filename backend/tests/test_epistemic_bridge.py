import os
import sqlite3
import pytest
import tempfile
from typing import Generator

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.knowledge_lifecycle import compute_claim_epistemic_balance
from engines.decision_engine import calculate_candidate_composite_score


@pytest.fixture
def temp_db_path() -> Generator[str, None, None]:
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        path = f.name
    try:
        yield path
    finally:
        for p in [path, f"{path}-wal", f"{path}-shm"]:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except OSError:
                    pass


@pytest.fixture
def storage(temp_db_path: str) -> SQLiteStorageAdapter:
    return SQLiteStorageAdapter(db_path=temp_db_path)


# ---------------------------------------------------------------------------
# 1. Schema Migration & Index Idempotency Tests (TASK-007-02, CHK-007-03, CHK-007-04)
# ---------------------------------------------------------------------------

def test_schema_migration_and_index_idempotency(storage: SQLiteStorageAdapter, temp_db_path: str):
    """Verify that problem_sources contains scholarly_work_id, supporting index exists, and repeated init is idempotent."""
    with storage._get_connection() as conn:
        cursor = conn.execute("PRAGMA table_info(problem_sources);")
        cols = {row["name"]: row["type"] for row in cursor.fetchall()}
        assert "scholarly_work_id" in cols
        assert "TEXT" in cols["scholarly_work_id"].upper()

        idx_cursor = conn.execute("PRAGMA index_list(problem_sources);")
        indices = [row["name"] for row in idx_cursor.fetchall()]
        assert "idx_problem_sources_sw" in indices

    # Re-initialize to verify idempotency
    storage2 = SQLiteStorageAdapter(db_path=temp_db_path)
    with storage2._get_connection() as conn:
        cursor = conn.execute("PRAGMA table_info(problem_sources);")
        cols = {row["name"]: row["type"] for row in cursor.fetchall()}
        assert "scholarly_work_id" in cols


# ---------------------------------------------------------------------------
# 2. Foreign Key Enforcement & Nullification (TASK-007-02, CHK-007-05, CHK-007-06)
# ---------------------------------------------------------------------------

def test_foreign_key_enforcement(storage: SQLiteStorageAdapter):
    """Inserting problem_sources with a non-existent scholarly_work_id must raise IntegrityError."""
    storage.add_problem({
        "id": "P-FK-001",
        "sector": "Health & Wellness",
        "sufferer_occupation": "Nurses",
        "sufferer_location": "Iloilo",
        "problem_statement": "Medical supply chain disruption in rural clinics.",
        "evidence_tier": "DOCUMENTED",
        "workaround": "Borrowing supplies",
        "quantified_impact": "Hours delayed",
        "sources": []
    })

    with pytest.raises(sqlite3.IntegrityError):
        storage.add_problem_sources("P-FK-001", [{
            "source_name": "Invalid Work Citation",
            "scholarly_work_id": "SW-NON-EXISTENT-999",
            "source_tier": "A"
        }])


def test_foreign_key_nullification_on_delete(storage: SQLiteStorageAdapter):
    """Deleting a scholarly_works row must set scholarly_work_id = NULL on linked problem_sources."""
    # Persist a valid scholarly work
    persisted = storage.upsert_scholarly_works([{
        "doi": "10.1016/j.test.2025.01",
        "title": "Study on Cold Chain Management in Western Visayas",
        "abstract": "Full abstract of cold chain management study...",
        "authors": "Dela Cruz, J.",
        "year": 2025,
        "venue": "Philippine Journal of Public Health",
        "citation_count": 14,
        "source_connector": "crossref"
    }])
    sw_id = persisted[0]["id"]

    prob = storage.add_problem({
        "id": "P-DEL-001",
        "sector": "Health & Wellness",
        "sufferer_occupation": "Pharmacists",
        "sufferer_location": "Iloilo City",
        "problem_statement": "Vaccine temperature compromise during transit.",
        "evidence_tier": "STRONGLY_DOCUMENTED",
        "workaround": "Manual ice packs",
        "quantified_impact": "Loss of vials",
        "sources": [{
            "source_name": "Cold Chain Study",
            "scholarly_work_id": sw_id,
            "source_tier": "A"
        }]
    })

    sources = prob["sources"]
    assert len(sources) == 1
    assert sources[0]["scholarly_work_id"] == sw_id
    source_id = sources[0]["id"]

    # Delete the scholarly work
    with storage._get_connection() as conn:
        conn.execute("DELETE FROM scholarly_works WHERE id = ?", (sw_id,))

    # Verify problem_source remains intact, but scholarly_work_id is nullified
    p_updated = storage.get_problem("P-DEL-001")
    updated_sources = p_updated["sources"]
    assert len(updated_sources) == 1
    assert updated_sources[0]["id"] == source_id
    assert updated_sources[0]["scholarly_work_id"] is None


# ---------------------------------------------------------------------------
# 3. Source Reconciliation Precedence Tests (TASK-007-01, CHK-007-01)
# ---------------------------------------------------------------------------

def test_reconciliation_level1_explicit_id(storage: SQLiteStorageAdapter):
    """Level 1: Match by explicit id (INTEGER) if provided."""
    prob = storage.add_problem({
        "id": "P-REC-001",
        "sector": "Agriculture & Fisheries",
        "sufferer_occupation": "Farmers",
        "sufferer_location": "Miagao",
        "problem_statement": "Post-harvest onion rot.",
        "sources": [
            {"source_name": "Field Interview 1", "quote_or_summary": "Rot reaches 30%"}
        ]
    })
    orig_id = prob["sources"][0]["id"]

    # Update with explicit id
    updated = storage.update_problem("P-REC-001", {
        "sources": [
            {"id": orig_id, "source_name": "Updated Field Interview 1", "quote_or_summary": "Rot reaches 35%"}
        ]
    })
    assert len(updated["sources"]) == 1
    assert updated["sources"][0]["id"] == orig_id
    assert updated["sources"][0]["source_name"] == "Updated Field Interview 1"
    assert updated["sources"][0]["quote_or_summary"] == "Rot reaches 35%"


def test_reconciliation_level2_scholarly_work_id(storage: SQLiteStorageAdapter):
    """Level 2: Match by scholarly_work_id when id is omitted."""
    persisted = storage.upsert_scholarly_works([{
        "doi": "10.1000/rec.002",
        "title": "Onion Storage Preservation",
        "source_connector": "openalex"
    }])
    sw_id = persisted[0]["id"]

    prob = storage.add_problem({
        "id": "P-REC-002",
        "sector": "Agriculture & Fisheries",
        "sufferer_occupation": "Farmers",
        "sufferer_location": "Miagao",
        "problem_statement": "Post-harvest onion rot.",
        "sources": [
            {"source_name": "Initial Ref", "scholarly_work_id": sw_id, "source_tier": "B"}
        ]
    })
    orig_id = prob["sources"][0]["id"]

    # Update omitting id, but providing matching scholarly_work_id
    updated = storage.update_problem("P-REC-002", {
        "sources": [
            {"source_name": "Updated Paper Reference", "scholarly_work_id": sw_id, "source_tier": "A"}
        ]
    })
    assert len(updated["sources"]) == 1
    assert updated["sources"][0]["id"] == orig_id
    assert updated["sources"][0]["source_name"] == "Updated Paper Reference"
    assert updated["sources"][0]["source_tier"] == "A"


def test_reconciliation_level3_normalized_url(storage: SQLiteStorageAdapter):
    """Level 3: Match by normalized source_url (case-insensitive, trailing slash stripped)."""
    prob = storage.add_problem({
        "id": "P-REC-003",
        "sector": "MSMEs & Retail",
        "sufferer_occupation": "Vendors",
        "sufferer_location": "Jaro",
        "problem_statement": "Credit constraints.",
        "sources": [
            {"source_name": "PSA Report", "source_url": "https://psa.gov.ph/data/msme/report/"}
        ]
    })
    orig_id = prob["sources"][0]["id"]

    # Update with different casing and stripped trailing slash
    updated = storage.update_problem("P-REC-003", {
        "sources": [
            {"source_name": "PSA Report 2025", "source_url": "HTTPS://PSA.GOV.PH/DATA/MSME/REPORT"}
        ]
    })
    assert len(updated["sources"]) == 1
    assert updated["sources"][0]["id"] == orig_id
    assert updated["sources"][0]["source_name"] == "PSA Report 2025"


def test_reconciliation_level4_composite_key(storage: SQLiteStorageAdapter):
    """Level 4: Match by composite key: source_name + quote_or_summary[:60] when source_url is NULL."""
    quote = "Direct interviews conducted at Iloilo Central Market revealing 20% daily borrow rates."
    prob = storage.add_problem({
        "id": "P-REC-004",
        "sector": "MSMEs & Retail",
        "sufferer_occupation": "Vendors",
        "sufferer_location": "Iloilo City",
        "problem_statement": "Credit constraints.",
        "sources": [
            {"source_name": "Market Interview", "source_url": None, "quote_or_summary": quote}
        ]
    })
    orig_id = prob["sources"][0]["id"]

    # Same source_name and same first 60 chars of quote, with minor trailing difference
    matching_quote = quote[:60] + " with further details added later."
    updated = storage.update_problem("P-REC-004", {
        "sources": [
            {"source_name": "Market Interview", "source_url": None, "quote_or_summary": matching_quote, "source_tier": "A"}
        ]
    })
    assert len(updated["sources"]) == 1
    assert updated["sources"][0]["id"] == orig_id
    assert updated["sources"][0]["source_tier"] == "A"


def test_reconciliation_source_name_alone_does_not_match(storage: SQLiteStorageAdapter):
    """source_name alone is never sufficient as a fallback match when quote differs."""
    prob = storage.add_problem({
        "id": "P-REC-005",
        "sector": "MSMEs & Retail",
        "sufferer_occupation": "Vendors",
        "sufferer_location": "Iloilo City",
        "problem_statement": "Credit constraints.",
        "sources": [
            {"source_name": "General Interview", "source_url": None, "quote_or_summary": "Summary A: focus on inventory"}
        ]
    })
    orig_id = prob["sources"][0]["id"]

    # Same name, completely different quote -> must NOT match -> old omitted, new inserted
    updated = storage.update_problem("P-REC-005", {
        "sources": [
            {"source_name": "General Interview", "source_url": None, "quote_or_summary": "Summary B: completely different topic"}
        ]
    })
    assert len(updated["sources"]) == 1
    assert updated["sources"][0]["id"] != orig_id
    assert updated["sources"][0]["quote_or_summary"] == "Summary B: completely different topic"


def test_ambiguous_fallback_matches_insert_rather_than_update(storage: SQLiteStorageAdapter):
    """If multiple rows match fallback criteria, INSERT new row rather than guessing an UPDATE target."""
    prob = storage.add_problem({
        "id": "P-AMB-001",
        "sector": "Health & Wellness",
        "sufferer_occupation": "Clinicians",
        "sufferer_location": "Pototan",
        "problem_statement": "Diagnostic delays.",
        "sources": [
            {"source_name": "Shared Source", "source_url": "https://example.com/clinic", "quote_or_summary": "Clinic report 1"},
            {"source_name": "Shared Source", "source_url": "https://example.com/clinic", "quote_or_summary": "Clinic report 2"},
        ]
    })
    orig_ids = [s["id"] for s in prob["sources"]]
    assert len(orig_ids) == 2

    # Provide an incoming source with the same URL (which matches 2 rows).
    # Ambiguous match must INSERT, leaving existing rows untouched or omitted.
    updated = storage.update_problem("P-AMB-001", {
        "sources": [
            {"id": orig_ids[0], "source_name": "Shared Source", "source_url": "https://example.com/clinic", "quote_or_summary": "Clinic report 1"},
            {"id": orig_ids[1], "source_name": "Shared Source", "source_url": "https://example.com/clinic", "quote_or_summary": "Clinic report 2"},
            {"source_name": "Shared Source", "source_url": "https://example.com/clinic", "quote_or_summary": "Clinic report 3"}
        ]
    })
    assert len(updated["sources"]) == 3
    new_ids = [s["id"] for s in updated["sources"]]
    assert orig_ids[0] in new_ids
    assert orig_ids[1] in new_ids


# ---------------------------------------------------------------------------
# 4. Deletion Protection Contract & Cascade Tests (TASK-007-01, CHK-007-02)
# ---------------------------------------------------------------------------

def test_deletion_safeguard_raises_value_error(storage: SQLiteStorageAdapter):
    """If an omitted source is referenced by active claim_evidence_links, raise ValueError without cascade_confirmed."""
    prob = storage.add_problem({
        "id": "P-SAFE-001",
        "sector": "Health & Wellness",
        "sufferer_occupation": "BHWs",
        "sufferer_location": "Leon",
        "problem_statement": "Maternal health logistics.",
        "sources": [
            {"source_name": "Crucial Source", "quote_or_summary": "Evidence on transit delays", "source_tier": "A"}
        ],
        "claims": [
            {"id": "CLM-SAFE-001", "claim_text": "Transit times exceed 2 hours", "claim_type": "FRICTION_REALITY"}
        ]
    })
    source_id = prob["sources"][0]["id"]

    # Link claim to source
    storage.link_claim_evidence(
        claim_id="CLM-SAFE-001",
        source_id=source_id,
        relation_type="SUPPORTS",
        evidence_strength="STRONG"
    )

    # Attempt to omit this source from update_problem without cascade_confirmed
    with pytest.raises(ValueError) as excinfo:
        storage.update_problem("P-SAFE-001", {"sources": []})

    assert "Cannot delete problem source referenced by active claim evidence links without cascade_confirmed=True" in str(excinfo.value)

    # Verify source and link still exist
    p_check = storage.get_problem("P-SAFE-001")
    assert len(p_check["sources"]) == 1
    assert p_check["sources"][0]["id"] == source_id
    links = storage.list_claim_evidence_links(claim_id="CLM-SAFE-001")
    assert len(links) == 1


def test_deletion_with_cascade_confirmed(storage: SQLiteStorageAdapter):
    """With cascade_confirmed=True, deletion proceeds and cascades to claim_evidence_links."""
    prob = storage.add_problem({
        "id": "P-CASC-001",
        "sector": "Health & Wellness",
        "sufferer_occupation": "BHWs",
        "sufferer_location": "Leon",
        "problem_statement": "Maternal health logistics.",
        "sources": [
            {"source_name": "Crucial Source", "quote_or_summary": "Evidence on transit delays", "source_tier": "A"}
        ],
        "claims": [
            {"id": "CLM-CASC-001", "claim_text": "Transit times exceed 2 hours", "claim_type": "FRICTION_REALITY"}
        ]
    })
    source_id = prob["sources"][0]["id"]

    storage.link_claim_evidence(
        claim_id="CLM-CASC-001",
        source_id=source_id,
        relation_type="SUPPORTS",
        evidence_strength="STRONG"
    )

    # Update with cascade_confirmed=True
    updated = storage.update_problem("P-CASC-001", {"sources": []}, cascade_confirmed=True)
    assert len(updated["sources"]) == 0

    # Verify link was cascade deleted
    links = storage.list_claim_evidence_links(claim_id="CLM-CASC-001")
    assert len(links) == 0


# ---------------------------------------------------------------------------
# 5. 2-Hop Bibliographic Join Query (TASK-007-04, CHK-007-07)
# ---------------------------------------------------------------------------

def test_two_hop_bibliographic_query(storage: SQLiteStorageAdapter):
    """Calling list_claim_evidence_links returns enriched fields from scholarly_works via problem_sources."""
    persisted = storage.upsert_scholarly_works([{
        "doi": "10.1016/j.jvb.2025.101",
        "title": "Cold-Chain Integrity in Island Provinces",
        "authors": "Santos, M., Dela Cruz, J.",
        "year": 2025,
        "venue": "Journal of Tropical Medicine",
        "source_connector": "crossref"
    }])
    sw_id = persisted[0]["id"]

    prob = storage.add_problem({
        "id": "P-2HOP-001",
        "sector": "Health & Wellness",
        "sufferer_occupation": "Logistics Officers",
        "sufferer_location": "Guimaras",
        "problem_statement": "Off-grid vaccine cold-chain spoilage.",
        "sources": [{
            "source_name": "Santos 2025 Island Study",
            "scholarly_work_id": sw_id,
            "source_tier": "A"
        }],
        "claims": [{
            "id": "CLM-2HOP-001",
            "claim_text": "Island vaccine spoilage exceeds 18% annually",
            "claim_type": "EMPIRICAL_OBSERVATION"
        }]
    })
    source_id = prob["sources"][0]["id"]

    storage.link_claim_evidence(
        claim_id="CLM-2HOP-001",
        source_id=source_id,
        relation_type="SUPPORTS",
        evidence_strength="STRONG",
        rationale="Empirical study verifies high spoilage in off-grid conditions"
    )

    # Query links by claim_id
    links = storage.list_claim_evidence_links(claim_id="CLM-2HOP-001")
    assert len(links) == 1
    link = links[0]
    assert link["scholarly_work_id"] == sw_id
    assert link["scholarly_title"] == "Cold-Chain Integrity in Island Provinces"
    assert link["scholarly_doi"] == "10.1016/j.jvb.2025.101"
    assert "Santos, M., Dela Cruz, J." in link["scholarly_authors"]
    assert link["scholarly_year"] == 2025
    assert link["scholarly_venue"] == "Journal of Tropical Medicine"

    # Query links across problem_id
    p_links = storage.list_claim_evidence_links(problem_id="P-2HOP-001")
    assert len(p_links) == 1
    assert p_links[0]["scholarly_title"] == "Cold-Chain Integrity in Island Provinces"


# ---------------------------------------------------------------------------
# 6. End-to-End Vertical Slice Epistemic Scoring (TASK-007-06, CHK-007-08, CHK-007-09)
# ---------------------------------------------------------------------------

def test_vertical_slice_epistemic_balance_and_candidate_scoring(storage: SQLiteStorageAdapter):
    """
    Vertical slice proof:
    Problem -> Claim (ACTIVE) -> Scholarly Work -> Problem Source -> Claim-Evidence Link
    -> compute_claim_epistemic_balance() -> calculate_candidate_composite_score()
    """
    # 1. Scholarly Work in SQLite
    persisted = storage.upsert_scholarly_works([{
        "doi": "10.1038/s41598-025-00123-x",
        "title": "Empirical Verification of Post-Harvest Losses in Western Visayas",
        "authors": "Reyes, A., Tan, C.",
        "year": 2025,
        "venue": "Scientific Reports",
        "citation_count": 28,
        "source_connector": "openalex"
    }])
    sw_id = persisted[0]["id"]

    # 2. Problem with Claim and Problem Source pointing to Scholarly Work
    prob = storage.add_problem({
        "id": "P-VS-001",
        "sector": "Agriculture & Fisheries",
        "sufferer_occupation": "Onion Farmers",
        "sufferer_location": "Miagao, Iloilo",
        "problem_statement": "Post-harvest rot claims 30% of onion crops before market delivery.",
        "evidence_tier": "STRONGLY_DOCUMENTED",
        "workaround": "Selling immediately at distressed prices",
        "quantified_impact": "40,000 PHP annual loss per farmer",
        "sources": [{
            "source_name": "Reyes & Tan 2025 Study",
            "scholarly_work_id": sw_id,
            "source_tier": "A",
            "evidence_type": "Scholarly Literature",
            "quote_or_summary": "Empirical survey of 120 smallholder onion farmers confirms 28-32% rot."
        }],
        "claims": [{
            "id": "CLM-VS-001",
            "claim_text": "Ambient storage humidity causes 30% bacterial soft rot within 14 days",
            "claim_type": "FRICTION_REALITY",
            "status": "ACTIVE"
        }]
    })

    source_id = prob["sources"][0]["id"]
    claim_id = "CLM-VS-001"

    # 3. Create Claim-Evidence Link
    storage.link_claim_evidence(
        claim_id=claim_id,
        source_id=source_id,
        relation_type="SUPPORTS",
        evidence_strength="STRONG",
        rationale="Rigorous empirical data from Western Visayas smallholder farms"
    )

    # 4. Compute Epistemic Balance
    balance = compute_claim_epistemic_balance(claim_id, storage)
    assert balance["claim_id"] == claim_id
    assert balance["net_score"] == 3.0  # Tier A (3.0) * STRONG (1.0)
    assert balance["normalized_score"] == 100.0
    assert balance["epistemic_status"] == "SUPPORTED"
    assert balance["verdict"] == "EMPIRICALLY_SUPPORTED"
    assert balance["supporting_count"] == 1
    assert balance["contradicting_count"] == 0

    # 5. Candidate Composite Scoring Reflection
    candidate = {
        "id": "P-VS-001",
        "problem_id": "P-VS-001",
        "title": "Onion Rot Solution",
        "sector": "Agriculture & Fisheries",
        "problem_statement": "Post-harvest rot claims 30% of onion crops before market delivery.",
        "quantified_impact": "40,000 PHP",
        "evidence_tier": "STRONGLY_DOCUMENTED",
        "claims": prob["claims"],
        "assumptions": []
    }

    score_result = calculate_candidate_composite_score(candidate, storage)
    assert "composite_score" in score_result
    assert "epistemic_score" in score_result

    # Epistemic score must reflect authentic normalized score (100.0) rather than default 50.0
    assert score_result["epistemic_score"] == 100.0
    assert score_result["composite_score"] > 50.0

    # Test comparison against candidate with zero claims (neutral 50.0 baseline)
    candidate_neutral = {**candidate, "claims": []}
    neutral_score = calculate_candidate_composite_score(candidate_neutral, storage)
    assert neutral_score["epistemic_score"] == 50.0
    # Difference must be exactly (100.0 - 50.0) * 0.35 = +17.5 points on composite score
    assert round(score_result["composite_score"] - neutral_score["composite_score"], 1) == 17.5
