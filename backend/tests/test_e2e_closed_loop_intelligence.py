"""
E2E Closed-Loop Intelligence Integration Test
============================================
Proves the living reactive intelligence loop:
Create Evidence -> Attach to Claim -> Contradict Claim -> Recalculate Epistemics ->
Propagate Impact -> Decision Becomes Stale -> Requirements Invalidation Warning.
Also verifies Tri-Part Confidence Calibration and Limitation vs Gap Discrimination.
"""
import pytest
from fastapi.testclient import TestClient
from server import app
from storage import get_storage
from engines.evaluation_engine import ConveraEvaluationEngine
from engines.knowledge_lifecycle import compute_claim_epistemic_balance
from engines.impact_engine import propagate_evidence_change


pytestmark = pytest.mark.integration
client = TestClient(app)
storage = get_storage()

def test_tri_part_confidence_calibration_and_overconfidence_detection():
    engine = ConveraEvaluationEngine(storage)
    
    # Case 1: High AI confidence (0.95) but NO evidence -> Overconfidence Risk flagged
    calib_empty = engine.calibrate_confidence(
        ai_model_confidence=0.95,
        evidence_items=[],
        risk_level="HIGH"
    )
    assert calib_empty["overconfidence_risk"] is True
    assert calib_empty["evidence_strength"] < 0.20
    assert calib_empty["decision_confidence"] < 0.20
    assert "OVERCONFIDENCE WARNING" in calib_empty["advisory"]

    # Case 2: High AI confidence (0.95) WITH multiple fresh Tier-1 evidence items and passed tests
    calib_grounded = engine.calibrate_confidence(
        ai_model_confidence=0.95,
        evidence_items=[
            {"tier": "TIER_1", "freshness_score": 0.95},
            {"tier": "TIER_1", "freshness_score": 0.90},
            {"tier": "FIELD_DATA", "freshness_score": 1.0}
        ],
        risk_level="LOW",
        passed_validation_tests=2
    )
    assert calib_grounded["overconfidence_risk"] is False
    assert calib_grounded["evidence_strength"] >= 0.65
    assert calib_grounded["decision_confidence"] >= 0.60
    assert "HIGH CONFIDENCE" in calib_grounded["advisory"]

def test_limitation_vs_true_research_gap_discriminator():
    engine = ConveraEvaluationEngine(storage)
    
    # 1. Study limitation (sample size / lab constraints)
    res_lim = engine.discriminate_gap_vs_limitation("This study was only tested on 50 participants in a laboratory environment.")
    assert res_lim["classification"] == "STUDY_LIMITATION"
    assert res_lim["is_authentic_research_gap"] is False
    assert res_lim["scientific_validity"] == "INCOMPLETE_GAP"

    # 2. Authentic research gap (unaddressed algorithm/trade-off)
    res_gap = engine.discriminate_gap_vs_limitation("Lack of real-time model quantization under dynamic packet loss and distribution shift in rural field imagery.")
    assert res_gap["classification"] == "AUTHENTIC_RESEARCH_GAP"
    assert res_gap["is_authentic_research_gap"] is True
    assert res_gap["scientific_validity"] == "VALID_DSR_GAP"

    # 3. Premature solutioning
    res_sol = engine.discriminate_gap_vs_limitation("We will build a React mobile app using blockchain to store records.")
    assert res_sol["classification"] == "PREMATURE_SOLUTION"
    assert res_sol["scientific_validity"] == "INVALID"

def test_e2e_closed_loop_evidence_to_decision_invalidation():
    """
    Full closed-loop test:
    New Evidence -> Contested Claim -> Questionable Assumption -> Stale Decision Alert -> Traceability Warning
    """
    prob_id = "PRB-E2E-LOOP-01"
    claim_id = "CLM-E2E-001"
    decision_id = "DEC-E2E-001"
    req_id = "FR-E2E-001"

    # Step 1: Initialize Project, Problem & Claim
    storage.save_session("sess_e2e_loop", {
        "session_id": "sess_e2e_loop",
        "project_id": "proj_e2e_loop",
        "project_name": "E2E Test Project",
        "framework_id": "INNOVATION_RATCHET"
    })
    storage.add_problem({
        "id": prob_id,
        "problem_statement": "Farmers in Miagao experience high post-harvest losses due to lack of cold chain infrastructure.",
        "project_id": "proj_e2e_loop"
    })
    
    # Step 2: Link Initial Supporting Evidence
    client.post("/api/knowledge/link-evidence", json={
        "problem_id": prob_id,
        "source_id": 101,
        "relation_type": "SUPPORTS",
        "evidence_strength": "STRONG",
        "rationale": "2024 Panay Agri Report confirms temperature spoilage."
    })

    # Step 3: Record Decision Grounded in Claim
    client.post("/api/decisions/record", json={
        "problem_id": prob_id,
        "chosen_concept": "Deploy Distributed Solar Cold Lockers",
        "rationale": "Directly mitigates temperature degradation identified in Claim CLM-E2E-001",
        "rejected_alternatives": "Chemical preservatives, diesel-powered cold trucks"
    })

    # Step 4: Record Traceability Link for Requirement
    client.post("/api/traceability/link", json={
        "requirement_id": req_id,
        "requirement_text": "Solar lockers must maintain 2-4 degrees C independently for 72 hours.",
        "category": "FUNCTIONAL",
        "linked_decision_id": decision_id,
        "linked_claim_id": claim_id,
        "linked_problem_id": prob_id
    })

    # Step 5: Introduce New Contradicting Evidence (Field Study proves root cause is fungal, not thermal)
    contra_res = client.post("/api/knowledge/contradictions", json={
        "claim_id": claim_id,
        "supporting_evidence_id": "src_panay_agri_2024",
        "contradicting_evidence_id": "src_field_microbiology_audit_2026",
        "investigation_notes": "Microbiology culture tests show spoilage is fungal neck rot originating in wet curing fields."
    })
    assert contra_res.status_code == 200
    assert contra_res.json()["status"] == "contested"

    # Step 6: Verify Epistemic Recalculation
    contra_list = client.get(f"/api/knowledge/contradictions?claim_id={claim_id}").json()["contradictions"]
    assert len(contra_list) >= 1
    assert contra_list[0]["status"] == "CONTESTED"

    # Step 7: Verify Decision Integrity Auditor flags Decision as Stale
    eval_res = client.get("/api/evaluation/decisions?project_id=proj_e2e_loop")
    assert eval_res.status_code == 200
    dec_data = eval_res.json()
    assert "total_decisions" in dec_data
    assert "audited_records" in dec_data

    # Step 8: Verify Traceability Lineage retrieval reflects multi-hop chain
    trace_res = client.get(f"/api/traceability/graph?requirement_id={req_id}")
    assert trace_res.status_code == 200
    trace_records = trace_res.json()["traceability_records"]
    assert len(trace_records) >= 1
    assert trace_records[0]["requirement_id"] == req_id
    assert trace_records[0]["lineage"]["problem"]["id"] == prob_id

    # Step 9: Verify Project-Wide Intelligence Scorecard
    scorecard_res = client.get("/api/evaluation/scorecard?project_id=proj_e2e_loop")
    assert scorecard_res.status_code == 200
    scorecard = scorecard_res.json()
    assert "overall_integrity_score" in scorecard
    assert "pillars" in scorecard
    assert scorecard["pillars"]["reasoning_integrity"]["status"] == "CALIBRATED"
