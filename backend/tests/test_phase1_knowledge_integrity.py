import pytest
from fastapi.testclient import TestClient
from server import app
from storage import get_storage
from engines.provenance_engine import ProvenanceEngine
from engines.freshness_engine import FreshnessEngine
from engines.contradiction_engine import ContradictionEngine
from engines.unknowns_engine import UnknownsEngine


pytestmark = pytest.mark.integration
client = TestClient(app)
storage = get_storage()

def test_provenance_engine_and_endpoints():
    prov_engine = ProvenanceEngine(storage)
    res = prov_engine.record_evidence_provenance(
        source_id="src_doi_10_1234_test",
        connector="openalex",
        original_identifier="https://doi.org/10.1234/test",
        extraction_model="gemini-2.5-flash",
        extraction_prompt="Extract empirical findings on crop disease",
        human_verified=False
    )
    assert res["id"].startswith("prov_")
    assert res["human_verification_state"] == "UNVERIFIED"

    # Verify via API endpoint
    api_res = client.get(f"/api/knowledge/provenance/src_doi_10_1234_test")
    assert api_res.status_code == 200
    assert api_res.json()["provenance"]["connector"] == "openalex"

    # Human verification update
    verif = prov_engine.verify_provenance("src_doi_10_1234_test", is_valid=True)
    assert verif["human_verification_state"] == "VERIFIED_BY_RESEARCHER"

def test_freshness_engine():
    fresh_engine = FreshnessEngine(current_year=2026)
    
    # 2025 AI paper -> 1 yr old in 1.5 yr half life -> FRESH
    res_fresh = fresh_engine.calculate_evidence_freshness(2025, "AI_TECH")
    assert res_fresh["status"] == "FRESH"
    assert res_fresh["staleness_risk"] == "LOW"

    # 2020 AI paper -> 6 yrs old in 1.5 yr half life -> STALE
    res_stale = fresh_engine.calculate_evidence_freshness(2020, "AI_TECH")
    assert res_stale["status"] == "STALE"
    assert res_stale["staleness_risk"] == "HIGH"
    assert "Revalidation required" in res_stale["advisory"]

def test_contradiction_engine_and_contested_claims():
    contra_engine = ContradictionEngine(storage)
    
    claim_id = "CLM-TEST-001"
    res = contra_engine.analyze_claim_epistemic_conflict(
        claim_id=claim_id,
        claim_statement="Farmers in Iloilo experience severe post-harvest storage losses.",
        supporting_sources=[{"id": "src_1", "title": "2024 Iloilo Agri Report"}],
        contradicting_sources=[{"id": "src_2", "title": "2025 Panay Logistics Survey"}]
    )
    assert res["status"] == "CONTESTED"
    assert res["confidence"] == "NOT_DETERMINED"
    assert "CONTESTED EPISTEMIC STATE" in res["advisory_action"]

    # API endpoint verification
    api_res = client.get(f"/api/knowledge/contradictions?claim_id={claim_id}")
    assert api_res.status_code == 200
    contradictions = api_res.json()["contradictions"]
    assert len(contradictions) >= 1
    assert contradictions[0]["status"] == "CONTESTED"

def test_unknowns_map_engine():
    unk_engine = UnknownsEngine(storage)
    proj_id = "proj_test_unknowns_map"
    
    # Add What We Know
    unk_engine.add_unknown_item(
        project_id=proj_id,
        category="WHAT_WE_KNOW",
        statement="Onion post-harvest rot occurs within 14 days without cold chain.",
        risk_level="LOW"
    )
    # Add What We Think
    unk_engine.add_unknown_item(
        project_id=proj_id,
        category="WHAT_WE_THINK",
        statement="Farmers will pay 100 PHP/month for shared solar cold locker subscription.",
        risk_level="HIGH"
    )
    # Add What We Don't Know
    unk_engine.add_unknown_item(
        project_id=proj_id,
        category="WHAT_WE_DONT_KNOW",
        statement="Exact municipal grid power fluctuation frequency in Northern Iloilo.",
        risk_level="CRITICAL"
    )

    # API endpoint verification
    api_res = client.get(f"/api/knowledge/unknowns?project_id={proj_id}")
    assert api_res.status_code == 200
    data = api_res.json()
    assert data["summary"]["what_we_know_count"] >= 1
    assert data["summary"]["what_we_think_count"] >= 1
    assert data["summary"]["what_we_dont_know_count"] >= 1
    assert data["summary"]["critical_unknowns_count"] >= 1

def test_requirements_traceability_graph():
    req_payload = {
        "requirement_id": "FR-07",
        "requirement_text": "System must operate offline and buffer image classifications locally for up to 48 hours.",
        "category": "FUNCTIONAL",
        "linked_decision_id": "DEC-002",
        "linked_assumption_id": "ASM-005",
        "linked_claim_id": "CLM-012",
        "linked_evidence_id": "EVID-044",
        "linked_problem_id": "PRB-001"
    }
    link_res = client.post("/api/traceability/link", json=req_payload)
    assert link_res.status_code == 200
    assert link_res.json()["status"] == "linked"

    # Query graph
    graph_res = client.get("/api/traceability/graph?requirement_id=FR-07")
    assert graph_res.status_code == 200
    records = graph_res.json()["traceability_records"]
    assert len(records) >= 1
    assert records[0]["requirement_id"] == "FR-07"
    assert records[0]["lineage"]["problem"]["id"] == "PRB-001"
    assert records[0]["lineage"]["decision"]["id"] == "DEC-002"
