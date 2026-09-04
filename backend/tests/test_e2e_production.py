import pytest
from fastapi.testclient import TestClient
from server import app


pytestmark = pytest.mark.integration
client = TestClient(app)

def test_full_production_lifecycle_e2e():
    # 1. Start Session via POST /api/sessions
    res = client.post("/api/sessions", json={
        "project_name": "E2E Production Agri Venture"
    })
    assert res.status_code == 200
    sess_data = res.json()
    session_id = sess_data["session_id"]
    project_id = sess_data.get("project_id") or f"proj_{session_id}"
    assert session_id is not None
    
    # 2. Set & Verify Workspace Passcode (PIN)
    set_res = client.post(f"/api/projects/{project_id}/set-passcode", json={"passcode": "7788"})
    assert set_res.status_code == 200
    assert set_res.json()["status"] == "success"
    
    # Valid PIN
    v_res = client.post(f"/api/projects/{project_id}/verify-passcode", json={"passcode": "7788"})
    assert v_res.status_code == 200
    assert v_res.json()["valid"] is True
    
    # Invalid PIN
    inv_res = client.post(f"/api/projects/{project_id}/verify-passcode", json={"passcode": "0000"})
    assert inv_res.status_code == 200
    assert inv_res.json()["valid"] is False
    
    # 3. Team Member Management
    m_res = client.post(f"/api/projects/{project_id}/members", json={
        "name": "Alex Cruz",
        "role": "FOUNDER_LEAD",
        "avatar": "founder"
    })
    assert m_res.status_code == 200
    
    list_m_res = client.get(f"/api/projects/{project_id}/members")
    assert list_m_res.status_code == 200
    members = list_m_res.json()["members"]
    assert any(m["name"] == "Alex Cruz" for m in members)
    
    # 4. Ingest Problem Record with Sanitization
    p_res = client.post("/api/problems", json={
        "id": "**E2E-AGR-01**",
        "project_id": project_id,
        "session_id": session_id,
        "sector": "Agriculture & Fisheries",
        "sufferer_occupation": "Bulb onion (*sibuyas*) farmers",
        "sufferer_location": "**Miagao, Iloilo**",
        "problem_statement": "Post-harvest bulb onion spoilage up to 40% <br> due to humidity.",
        "evidence_tier": "STRONGLY_DOCUMENTED",
        "workaround": "Selling at fire-sale prices",
        "quantified_impact": "P15,000 lost per harvest"
    })
    assert p_res.status_code == 200
    prob_data = p_res.json()["problem"]
    assert prob_data["id"] == "E2E-AGR-01"  # Sanitized!
    assert "**" not in prob_data["sufferer_location"]
    assert "<br>" not in prob_data["problem_statement"]
    
    # 5. Upvote Problem
    v_res = client.post(f"/api/problems/{prob_data['id']}/vote", json={"vote_type": "up"})
    assert v_res.status_code == 200
    assert v_res.json()["problem"]["votes"] >= 1
    
    # 6. Add Threaded Comment
    c_res = client.post(f"/api/problems/{prob_data['id']}/comments", json={
        "user_name": "Prof. Elena Santos",
        "user_role": "MENTOR_PROFESSOR",
        "user_avatar": "mentor",
        "comment": "Verified field observation with Miagao agriculture office."
    })
    assert c_res.status_code == 200
    
    get_c_res = client.get(f"/api/problems/{prob_data['id']}/comments")
    assert get_c_res.status_code == 200
    comments = get_c_res.json()["comments"]
    assert len(comments) >= 1
    assert comments[0]["user_role"] == "MENTOR_PROFESSOR"
    
    # 7. Mentor Signoff
    s_res = client.post(f"/api/projects/{project_id}/mentor-signoff", json={
        "phase_number": 1,
        "mentor_name": "Prof. Elena Santos",
        "notes": "Discovery landscape thoroughly corroborated."
    })
    assert s_res.status_code == 200
    assert s_res.json()["status"] == "success"
    
    # 8. Snapshot & Rollback
    snap_res = client.post(f"/api/sessions/{session_id}/snapshots", json={
        "label": "Pre-Phase 2 Checkpoint",
        "phase_number": 1
    })
    assert snap_res.status_code == 200
    
    list_snaps = client.get(f"/api/sessions/{session_id}/snapshots")
    assert list_snaps.status_code == 200
    assert len(list_snaps.json()) >= 1
