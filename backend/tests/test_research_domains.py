import pytest
from fastapi.testclient import TestClient
from server import app
from storage.sqlite_adapter import SQLiteStorageAdapter


pytestmark = pytest.mark.integration
@pytest.fixture
def client():
    return TestClient(app)

def test_list_and_seed_research_domains(client):
    res = client.get("/api/research/domains")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["count"] >= 25
    domains = data["domains"]
    ids = [d["id"] for d in domains]
    assert "D01" in ids
    assert "D25" in ids

def test_create_update_delete_custom_domain(client):
    # 1. Create
    create_payload = {
        "title": "Quantum Sensor Telemetry & Key Distribution",
        "domain_type": "Specialized",
        "description": "Entangled photon telemetry in noisy maritime environments.",
        "context_setting": "Guimaras Strait Maritime Research Station",
        "stakeholders": "Naval operators & telecommunication engineers",
        "processes_to_explore": "Decoherence logging, quantum bit error rate calibration",
        "project_id": "test_proj_123"
    }
    res = client.post("/api/research/domains", json=create_payload)
    assert res.status_code == 200
    domain = res.json()["domain"]
    domain_id = domain["id"]
    assert domain["title"] == "Quantum Sensor Telemetry & Key Distribution"
    assert domain["is_custom"] == 1

    # 2. Update
    update_payload = {
        "description": "Updated description with noise mitigation protocols."
    }
    res_up = client.put(f"/api/research/domains/{domain_id}", json=update_payload)
    assert res_up.status_code == 200
    assert res_up.json()["domain"]["description"] == "Updated description with noise mitigation protocols."

    # 3. Delete
    res_del = client.delete(f"/api/research/domains/{domain_id}")
    assert res_del.status_code == 200
    assert res_del.json()["deleted"] is True


def test_seed_research_problem_bank(client):
    import uuid
    test_pid = f"test_proj_{uuid.uuid4().hex[:6]}"
    res = client.post("/api/research/problems/seed", json={"project_id": test_pid})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["seeded_count"] == 34
    
    # Verify in Problem Bank listing
    res_list = client.get(f"/api/problems?project_id={test_pid}")
    assert res_list.status_code == 200
    problems = res_list.json()
    assert len(problems) >= 34
    c_ids = [p["id"] for p in problems]
    assert any("C01" in cid for cid in c_ids)
    assert any("C34" in cid for cid in c_ids)
