import pytest
from fastapi.testclient import TestClient
from server import app
from storage import get_storage
from engines.gate_engine import GateEngine

client = TestClient(app)
storage = get_storage()

def test_gate_engine_evaluation_logic():
    engine = GateEngine(storage)
    proj_id = "proj_gate_eval_test"

    # Case 1: Pass Gate 1 (All criteria checked + 88% average score)
    res_pass = engine.evaluate_gate(
        gate_id="GATE_1",
        rubric_scores={"significance": 90.0, "literature": 85.0, "variables": 90.0},
        checked_criteria_ids=["G1_C1", "G1_C2", "G1_C3", "G1_C4"],
        reviewer_feedback="Excellent localized grounding in Iloilo onion farmers.",
        project_id=proj_id
    )
    assert res_pass["verdict"] == "PASS"
    assert res_pass["overall_score"] >= 75.0
    assert len(res_pass["failed_criteria"]) == 0

    # Case 2: Revise Gate 2 (Missing one criteria)
    res_revise = engine.evaluate_gate(
        gate_id="GATE_2",
        rubric_scores={"gap_quality": 70.0, "rq_clarity": 65.0},
        checked_criteria_ids=["G2_C1", "G2_C2"], # Missing G2_C3, G2_C4
        reviewer_feedback="Please formulate sub-RQs.",
        project_id=proj_id
    )
    assert res_revise["verdict"] == "REVISE"
    assert len(res_revise["failed_criteria"]) >= 1

def test_gate_endpoints():
    proj_id = "proj_gate_api_test"
    payload = {
        "project_id": proj_id,
        "gate_id": "GATE_3",
        "rubric_scores": {"dsr_artifact": 90.0, "kothari_design": 85.0, "circumscription": 85.0},
        "checked_criteria_ids": ["G3_C1", "G3_C2", "G3_C3", "G3_C4"],
        "reviewer_feedback": "CRD bench evaluation controls are sound.",
        "reviewer_role": "CAPSTONE_PANEL_CHAIR"
    }

    eval_res = client.post("/api/gates/evaluate", json=payload)
    assert eval_res.status_code == 200
    data = eval_res.json()["gate_review"]
    assert data["verdict"] == "PASS"
    assert data["gate_id"] == "GATE_3"

    # Query gate status
    status_res = client.get(f"/api/gates/status?gate_id=GATE_3&project_id={proj_id}")
    assert status_res.status_code == 200
    assert status_res.json()["verdict"] == "PASS"

    # List all gate reviews
    all_res = client.get(f"/api/gates/all?project_id={proj_id}")
    assert all_res.status_code == 200
    assert len(all_res.json()["gate_reviews"]) >= 1
