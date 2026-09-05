"""
CONVERA SDD-006 Verification Suite: Scholarly Evidence Persistence & Native Lexical Retrieval (FTS5 / BM25)
=============================================================================================================
Verifies:
1. SQLite WAL schema initialization for scholarly_works and scholarly_works_fts
2. 100% FTS5 trigger lifecycle synchronization (INSERT, UPDATE, DELETE, REBUILD)
3. Full abstract retention without truncation
4. Two-stage idempotent deduplication (DOI and DOI-less hash resolution)
5. Native BM25 relevance ranking and Porter stemming
6. ConnectorHub auto-persistence and graceful offline fallback with epistemic non-elevation
7. Backfill routine synchronization
"""

import pytest
import os
import json
from unittest.mock import patch, AsyncMock
from storage.sqlite_adapter import SQLiteStorageAdapter
from connectors.hub import ConnectorHub
from connectors.base import NormalizedScholarlyWork, ProvenanceMetadata
from agents.research_agent import execute_research_agent


@pytest.fixture
def temp_adapter(tmp_path):
    db_file = str(tmp_path / "test_scholarly.db")
    adapter = SQLiteStorageAdapter(db_path=db_file)
    return adapter


# ----------------------------------------------------------------------
# 1. Schema & FTS5 Lifecycle Invariant Tests
# ----------------------------------------------------------------------

@pytest.mark.unit
def test_scholarly_works_schema_and_triggers_initialization(temp_adapter):
    """Verify that scholarly_works, scholarly_works_fts, and all 3 triggers are created properly."""
    with temp_adapter._get_connection() as conn:
        tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        assert "scholarly_works" in tables
        assert "scholarly_works_fts" in tables

        triggers = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='trigger'").fetchall()]
        assert "trg_scholarly_works_ai" in triggers
        assert "trg_scholarly_works_ad" in triggers
        assert "trg_scholarly_works_au" in triggers


@pytest.mark.unit
def test_full_abstract_retention(temp_adapter):
    """Verify full, untruncated abstract persistence (exceeding legacy 400-char cap)."""
    long_abstract = "Empirical study on post-harvest cold chain logistics. " * 60  # ~3,240 chars
    works = [{
        "doi": "10.1145/long.abstract.test",
        "title": "Comprehensive Post-Harvest Cold Chain Study",
        "abstract": long_abstract,
        "authors": ["Santos, J.", "Reyes, M."],
        "year": 2024,
        "venue": "Philippine Agricultural Engineering Journal",
        "citation_count": 25,
        "source_connector": "openalex"
    }]

    persisted = temp_adapter.upsert_scholarly_works(works)
    assert len(persisted) == 1
    work_id = persisted[0]["id"]

    retrieved = temp_adapter.get_scholarly_work(work_id)
    assert retrieved is not None
    assert retrieved["abstract"] == long_abstract.strip()
    assert len(retrieved["abstract"]) == len(long_abstract.strip())


@pytest.mark.unit
def test_fts5_insert_lifecycle(temp_adapter):
    """Verify INSERT trigger immediately indexes text in FTS5 virtual table."""
    works = [{
        "doi": "10.1145/fts.insert.001",
        "title": "Cryogenic freezing of tilapia catch in Iloilo",
        "abstract": "Evaluation of rapid refrigeration technology for municipal fisherfolk.",
        "authors": ["Cruz, A."],
        "year": 2023,
        "source_connector": "semantic_scholar"
    }]
    temp_adapter.upsert_scholarly_works(works)

    results = temp_adapter.search_scholarly_works_fts("cryogenic tilapia")
    assert len(results) == 1
    assert results[0]["title"] == "Cryogenic freezing of tilapia catch in Iloilo"


@pytest.mark.unit
def test_fts5_update_lifecycle(temp_adapter):
    """Verify UPDATE trigger updates FTS5 virtual table without ghost matches."""
    works = [{
        "doi": "10.1145/fts.update.001",
        "title": "Solar Powered Cold Storage Units",
        "abstract": "Original description of solar cooling.",
        "year": 2022,
        "source_connector": "crossref"
    }]
    temp_adapter.upsert_scholarly_works(works)

    # Initial search matches original terms
    assert len(temp_adapter.search_scholarly_works_fts("solar cooling")) == 1

    # Update with new content
    updated_works = [{
        "doi": "10.1145/fts.update.001",
        "title": "Geothermal Heat Pump Refrigeration",
        "abstract": "Updated text describing geothermal cold preservation.",
        "year": 2022,
        "source_connector": "crossref"
    }]
    temp_adapter.upsert_scholarly_works(updated_works)

    # FTS5 search for old term must return 0
    assert len(temp_adapter.search_scholarly_works_fts("solar cooling")) == 0
    # FTS5 search for new term must return 1
    new_match = temp_adapter.search_scholarly_works_fts("geothermal preservation")
    assert len(new_match) == 1
    assert new_match[0]["title"] == "Geothermal Heat Pump Refrigeration"


@pytest.mark.unit
def test_fts5_delete_lifecycle(temp_adapter):
    """Verify DELETE trigger completely purges record from FTS5 index."""
    works = [{
        "doi": "10.1145/fts.delete.001",
        "title": "Disposable Sensory Packaging for Mangoes",
        "abstract": "Biodegradable ethylene gas absorption pads.",
        "year": 2024,
        "source_connector": "pubmed"
    }]
    persisted = temp_adapter.upsert_scholarly_works(works)
    work_id = persisted[0]["id"]

    assert len(temp_adapter.search_scholarly_works_fts("mangoes ethylene")) == 1

    # Delete row from base table
    with temp_adapter._get_connection() as conn:
        conn.execute("DELETE FROM scholarly_works WHERE id = ?", (work_id,))

    # FTS5 search must return 0
    assert len(temp_adapter.search_scholarly_works_fts("mangoes ethylene")) == 0


@pytest.mark.unit
def test_fts5_rebuild_command(temp_adapter):
    """Verify explicit 'rebuild' command completely reconstructs FTS5 index."""
    works = [
        {"title": "Rice Milling Breakdown", "abstract": "Mechanical failures in rural mills.", "year": 2023},
        {"title": "Corn Drying Silos", "abstract": "Moisture control in bulk storage silos.", "year": 2024}
    ]
    temp_adapter.upsert_scholarly_works(works)

    # Clear FTS5 table directly to simulate desynchronization
    with temp_adapter._get_connection() as conn:
        conn.execute("INSERT INTO scholarly_works_fts(scholarly_works_fts) VALUES('delete-all');")
    
    # Assert FTS5 is empty
    assert len(temp_adapter.search_scholarly_works_fts("milling silos")) == 0

    # Execute rebuild
    assert temp_adapter.rebuild_scholarly_fts() is True

    # Assert all rows are re-indexed
    assert len(temp_adapter.search_scholarly_works_fts("milling")) == 1
    assert len(temp_adapter.search_scholarly_works_fts("silos")) == 1


# ----------------------------------------------------------------------
# 2. Ingestion & Deduplication Invariant Tests (DOI & DOI-less)
# ----------------------------------------------------------------------

@pytest.mark.unit
def test_doi_less_deduplication_idempotency(temp_adapter):
    """Verify two-stage upsert on DOI-less records merges cleanly on title-year hash."""
    work1 = {
        "title": "Evaluating Micro-Hydro Power for Irrigation Pumps",
        "abstract": "Initial preliminary field abstract.",
        "authors": ["Marquez, R."],
        "year": 2023,
        "citation_count": 3
    }
    persisted1 = temp_adapter.upsert_scholarly_works([work1])
    id1 = persisted1[0]["id"]
    assert id1.startswith("SW-TTL-")

    # Second upsert with longer abstract and higher citation count
    work2 = {
        "title": "Evaluating Micro-Hydro Power for Irrigation Pumps",
        "abstract": "Comprehensive finalized abstract with detailed turbine flow rate benchmarks.",
        "authors": ["Marquez, R.", "Tan, L."],
        "year": 2023,
        "citation_count": 8
    }
    persisted2 = temp_adapter.upsert_scholarly_works([work2])
    id2 = persisted2[0]["id"]

    assert id1 == id2
    with temp_adapter._get_connection() as conn:
        count = conn.execute("SELECT COUNT(*) FROM scholarly_works").fetchone()[0]
        assert count == 1  # No duplicate row inserted

    retrieved = temp_adapter.get_scholarly_work(id1)
    assert retrieved["citation_count"] == 8
    assert "detailed turbine flow rate benchmarks" in retrieved["abstract"]


@pytest.mark.unit
def test_doi_enrichment_of_doi_less_record(temp_adapter):
    """Verify that a DOI-less record is safely enriched when a DOI is later discovered."""
    title = "IoT Sensor Networks for Brackishwater Aquaculture"
    work_without_doi = {
        "title": title,
        "abstract": "Unpublished conference preprint abstract.",
        "year": 2024
    }
    p1 = temp_adapter.upsert_scholarly_works([work_without_doi])
    id1 = p1[0]["id"]

    # Same paper later discovered with canonical DOI
    work_with_doi = {
        "doi": "10.1016/j.aquaculture.2024.05.012",
        "title": title,
        "abstract": "Published peer-reviewed journal version abstract with statistical data.",
        "year": 2024,
        "citation_count": 14
    }
    p2 = temp_adapter.upsert_scholarly_works([work_with_doi])

    with temp_adapter._get_connection() as conn:
        rows = conn.execute("SELECT id, doi, citation_count FROM scholarly_works").fetchall()
        assert len(rows) == 1
        assert rows[0]["doi"] == "10.1016/j.aquaculture.2024.05.012"
        assert rows[0]["citation_count"] == 14


# ----------------------------------------------------------------------
# 3. Lexical Retrieval & Stemming Tests
# ----------------------------------------------------------------------

@pytest.mark.unit
def test_stemmed_bm25_retrieval(temp_adapter):
    """Verify Porter stemming matches inflected words (e.g. 'harvesting' -> 'harvest')."""
    works = [
        {"title": "Post-harvest Loss Prevention", "abstract": "Techniques for farmers handling harvest yields.", "citation_count": 50},
        {"title": "Urban Traffic Management", "abstract": "Congestion pricing algorithms.", "citation_count": 10},
        {"title": "Smart Water Metering", "abstract": "Pipeline leakage telemetry.", "citation_count": 5}
    ]
    temp_adapter.upsert_scholarly_works(works)

    # Search for inflected form 'harvesting'
    results = temp_adapter.search_scholarly_works_fts("harvesting")
    assert len(results) == 1
    assert results[0]["title"] == "Post-harvest Loss Prevention"
    assert results[0]["relevance_score"] > 0


# ----------------------------------------------------------------------
# 4. Connector Hub Auto-Persistence & Offline Fallback Tests
# ----------------------------------------------------------------------

@pytest.mark.integration
@pytest.mark.asyncio
async def test_connector_hub_auto_persistence(temp_adapter):
    """Verify that ConnectorHub.federated_search automatically persists results to SQLite."""
    mock_works = [
        NormalizedScholarlyWork(
            doi="10.1145/hub.test.001",
            title="Automated Soil Nitrogen Sensing via Optical Fiber",
            authors=["Flores, C."],
            year=2024,
            venue="IEEE Sensors Journal",
            citation_count=9,
            abstract="In-situ optical measurement of nitrogen in clay loam soils.",
            provenance=ProvenanceMetadata(
                source_name="OpenAlex",
                source_url="https://openalex.org/W12345"
            )
        )
    ]

    hub = ConnectorHub()
    with patch("storage.get_storage", return_value=temp_adapter):
        with patch.object(hub, "federated_search", wraps=hub.federated_search):
            # Mock the connectors to return mock_works
            for c in hub._connectors.values():
                c.search = AsyncMock(return_value=[])
            # Set first connector to return our mock work
            list(hub._connectors.values())[0].search = AsyncMock(return_value=mock_works)

            results = await hub.federated_search("soil nitrogen sensing")
            assert len(results) == 1
            assert results[0].id is not None
            assert results[0].id.startswith("SW-DOI-")

            # Verify it exists in SQLite
            persisted = temp_adapter.get_scholarly_work(results[0].id)
            assert persisted is not None
            assert persisted["title"] == "Automated Soil Nitrogen Sensing via Optical Fiber"


@pytest.mark.integration
@pytest.mark.asyncio
async def test_offline_fallback_epistemic_marking(temp_adapter):
    """Verify graceful offline fallback returns cached works with is_offline=True and non-elevated tier."""
    # Pre-populate local cache
    cached_work = {
        "doi": "10.1145/offline.cache.001",
        "title": "Cold Chain Logistics in Western Visayas",
        "abstract": "Empirical survey of refrigerated vans in Panay island.",
        "authors": ["Villanueva, E."],
        "year": 2023,
        "venue": "Philippine Logistics Review",
        "citation_count": 15,
        "source_connector": "openalex"
    }
    temp_adapter.upsert_scholarly_works([cached_work])

    hub = ConnectorHub()
    # Mock all external connectors to raise network exceptions
    for c in hub._connectors.values():
        c.search = AsyncMock(side_effect=Exception("Connection timed out (Network Unreachable)"))

    with patch("storage.get_storage", return_value=temp_adapter):
        results = await hub.federated_search("cold chain panay")
        assert len(results) == 1
        work = results[0]

        # Verify offline provenance and epistemic tags
        assert work.is_offline is True
        assert work.is_cached is True
        assert "Local Cache" in work.provenance.source_name
        # Epistemic tier must NOT be elevated to EMPIRICAL
        assert work.provenance.authority_tier != "EMPIRICAL"
        assert work.provenance.authority_tier == "BENCHMARK"


# ----------------------------------------------------------------------
# 5. Backfill & Research Agent Dossier Tests
# ----------------------------------------------------------------------

@pytest.mark.integration
def test_backfill_problem_sources_to_scholarly_works(temp_adapter):
    """Verify backfill routine imports records from problem_sources into scholarly_works and FTS5."""
    with temp_adapter._get_connection() as conn:
        # Create a dummy problem and 2 problem_sources
        conn.execute("INSERT INTO problems (id, sector, problem_statement) VALUES ('P-TEST-01', 'Agriculture', 'Losses in onions.')")
        conn.execute("""
            INSERT INTO problem_sources (problem_id, source_name, source_url, quote_or_summary)
            VALUES ('P-TEST-01', 'Philippine Onion Storage Study', 'https://doi.org/10.1000/onion.2023', 'Losses reach 45% in warm humid barns.')
        """)
        conn.execute("""
            INSERT INTO problem_sources (problem_id, source_name, source_url, quote_or_summary)
            VALUES ('P-TEST-01', 'Bureau of Plant Industry Annual Report', 'https://da.gov.ph/report.pdf', 'Regional production data.')
        """)
        conn.commit()

    stats = temp_adapter.backfill_problem_sources_to_scholarly_works()
    assert stats["scanned_rows"] == 2
    assert stats["persisted_works"] == 2

    # Verify searchable via FTS5
    fts_results = temp_adapter.search_scholarly_works_fts("onion storage barns")
    assert len(fts_results) >= 1
    assert "Onion Storage" in fts_results[0]["title"]


@pytest.mark.integration
@pytest.mark.asyncio
async def test_research_agent_dossier_contains_full_abstract():
    """Verify research_agent formats dossier with full abstracts beyond 400 characters."""
    long_abstract = "Empirical benchmark evaluation of cold storage telemetry. " * 30  # ~1,740 chars
    mock_work = NormalizedScholarlyWork(
        id="SW-DOI-test-full-abstract",
        doi="10.1145/agent.test.001",
        title="Cold Chain Telemetry Benchmarks",
        authors=["Alvarez, T."],
        year=2024,
        venue="IoT Systems",
        citation_count=18,
        abstract=long_abstract,
        provenance=ProvenanceMetadata(
            source_name="OpenAlex",
            source_url="https://openalex.org/W999"
        )
    )

    with patch("connectors.hub.connector_hub.federated_search", new=AsyncMock(return_value=[mock_work])):
        with patch("agents.research_agent.generate_response_with_fallback") as mock_llm:
            mock_llm.return_value = json.dumps({
                "synthesized_summary": "Academic consensus confirms cold chain losses.",
                "macro_statistics": ["40% loss reported"],
                "extracted_claims": [{
                    "claim_text": "Sensors reduce transport spoilage by 25%",
                    "claim_type": "FRICTION_REALITY",
                    "evidence_strength": "STRONG",
                    "supporting_quote": "Sensors reduce transport spoilage"
                }],
                "contradictions_found": [],
                "recommended_next_queries": []
            })

            report = await execute_research_agent(query="telemetry benchmarks")
            assert report.sources_discovered == 1
            assert len(report.evidence_candidates) == 1

            # Verify prompt received by LLM contains the full abstract (> 400 chars)
            call_args = mock_llm.call_args
            prompt_text = call_args.kwargs.get("prompt") or call_args.args[1]
            assert "Cold Chain Telemetry Benchmarks" in prompt_text
            assert "Work ID: SW-DOI-test-full-abstract" in prompt_text
            # Crucial verification: Abstract in prompt exceeds legacy 400-char truncation!
            assert len(long_abstract) > 1000
            assert long_abstract[:1000] in prompt_text
