import pytest
from fastapi.testclient import TestClient
from server import app
from storage import get_storage
from engines.circumscription_engine import CircumscriptionEngine
from engines.proposal_exporter import ProposalExporter

client = TestClient(app)
storage = get_storage()

def test_circumscription_iteration_lifecycle():
    engine = CircumscriptionEngine(storage)
    proj_id = "proj_circ_lifecycle_test"

    # Run 1: Failed evaluation (Accuracy: 72% vs Target: 85%) -> Loopback
    run1 = engine.record_iteration(
        project_id=proj_id,
        artifact_name="Quantized MobileNetV3 Node",
        test_run_name="Lab Plot Trial #1",
        metric_name="Precision (%)",
        observed_value=72.4,
        target_value=85.0,
        failure_mode="Quantization noise causes false positive leaf blight detections.",
        constraint_extracted="Require batch normalization layer recalibration post-quantization.",
        target_phase_loopback="PHASE_D"
    )
    assert run1["status"] == "FAILED_LOOPBACK"
    assert "Require batch normalization" in run1["constraint_extracted"]

    # Run 2: Passed evaluation (Accuracy: 88.5% vs Target: 85%) -> Passed
    run2 = engine.record_iteration(
        project_id=proj_id,
        artifact_name="Quantized MobileNetV3 Node (v2)",
        test_run_name="Lab Plot Trial #2",
        metric_name="Precision (%)",
        observed_value=88.5,
        target_value=85.0,
        failure_mode="",
        constraint_extracted=""
    )
    assert run2["status"] == "PASSED"

    summary = engine.get_iteration_summary(project_id=proj_id)
    assert summary["total_iterations"] >= 2
    assert summary["failed_loopbacks"] >= 1
    assert summary["passed_benchmarks"] >= 1
    assert summary["is_converged"] is True

def test_dsr_proposal_export_endpoint():
    proj_id = "proj_export_test"
    res = client.get(f"/api/export/dsr-proposal?project_id={proj_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["document_type"] == "DSR_CAPSTONE_PROPOSAL"
    md = data["markdown_content"]
    assert "# Design Science Research Capstone Proposal" in md
    assert "## 1. Problem Definition & Scouting" in md
    assert "## 3. Literature Matrix" in md
    assert "## 4. Evaluation Trapping & Circumscription Loop" in md
    assert "## 6. Formal Quality Gate Review Sign-offs" in md

def test_circumscription_api_endpoints():
    proj_id = "proj_circ_api_test"
    payload = {
        "project_id": proj_id,
        "artifact_name": "Dynamic Duty Cycling Module",
        "test_run_name": "Continuous 72h Run",
        "metric_name": "Autonomy (Hours)",
        "observed_value": 78.0,
        "target_value": 72.0,
        "failure_mode": "",
        "constraint_extracted": "",
        "target_phase_loopback": "PHASE_D"
    }
    rec_res = client.post("/api/circumscription/iterations", json=payload)
    assert rec_res.status_code == 200
    assert rec_res.json()["iteration"]["status"] == "PASSED"

    get_res = client.get(f"/api/circumscription/iterations?project_id={proj_id}")
    assert get_res.status_code == 200
    assert get_res.json()["is_converged"] is True
