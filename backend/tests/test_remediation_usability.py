"""
Test suite for SPEC-REMEDIATION-USABILITY-001.

Verifies:
1. Session persistence across reload (DEF-PERSIST-001).
2. Share code generation default to CONV- while preserving historical RATCH-* lookup (DEF-UX-003).
3. Session router update endpoint contract compatibility (TASK-REM-13).
"""

import pytest
from storage.sqlite_adapter import SQLiteStorageAdapter, generate_share_code


@pytest.fixture
def temp_adapter(tmp_path):
    db_file = tmp_path / "test_convera.db"
    return SQLiteStorageAdapter(db_path=str(db_file))


def test_share_code_generation_default():
    """Verify that generate_share_code defaults to CONV- prefix."""
    code = generate_share_code()
    assert code.startswith("CONV-")
    assert len(code) == 9  # CONV-XXXX


def test_share_code_historical_compatibility(temp_adapter):
    """Verify that both historical RATCH-* codes and new CONV-* codes resolve seamlessly."""
    # Create project 1 with save_session
    s1 = temp_adapter.save_session("session_legacy", {
        "session_id": "session_legacy",
        "project_id": "proj_legacy",
        "project_name": "Legacy Project",
    })
    # Manually assign historical RATCH share code to project
    with temp_adapter._get_connection() as conn:
        conn.execute("UPDATE projects SET share_code = ? WHERE id = ?", ("RATCH-9999", "proj_legacy"))

    # Create project 2 with save_session (gets new default CONV- share code)
    s2 = temp_adapter.save_session("session_new", {
        "session_id": "session_new",
        "project_id": "proj_new",
        "project_name": "New Venture",
    })

    # Verify both can be retrieved via get_project_by_code
    found_legacy = temp_adapter.get_project_by_code("RATCH-9999")
    assert found_legacy is not None
    assert found_legacy["id"] == "proj_legacy"
    assert found_legacy["name"] == "Legacy Project"

    # Verify case-insensitive lookup
    found_legacy_lower = temp_adapter.get_project_by_code("ratch-9999")
    assert found_legacy_lower is not None
    assert found_legacy_lower["id"] == "proj_legacy"

    # Verify new CONV code lookup
    sessions = temp_adapter.list_sessions()
    new_sess = next(s for s in sessions if s["session_id"] == "session_new")
    conv_code = new_sess["share_code"]
    assert conv_code.startswith("CONV-")
    found_new = temp_adapter.get_project_by_code(conv_code)
    assert found_new is not None
    assert found_new["id"] == "proj_new"


def test_session_state_persistence_across_reload(temp_adapter):
    """
    Verify DEF-PERSIST-001:
    create/update state -> save -> reload -> verify state retained.
    """
    session_id = "sess_test_persistence_001"
    initial_state = {
        "session_id": session_id,
        "project_name": "AgriTech Venture",
        "framework_id": "INNOVATION",
        "phase1_complete": True,
        "phase1_response": "Market signals indicate severe cold chain spoilage in Iloilo.",
        "phase2_complete": True,
        "phase2_response": "Decision Room selected Candidate A: Decentralized Solar Cold-Hub.",
        "phase3_problem": "Smallholder tomato farmers lose 40% harvest to heat spoilage before reaching Iloilo terminal market.",
        "completed_levels": [1, 2, 3],
        "phase3_history": [
            {"role": "assistant", "content": "Who is the specific sufferer?"},
            {"role": "user", "content": "15 tomato farmers in Barangay Poblacion, Pototan."},
        ],
    }

    # Save initial state
    saved = temp_adapter.save_session(session_id, initial_state)
    assert saved["session_id"] == session_id

    # Reload session from storage
    reloaded = temp_adapter.get_session(session_id)
    assert reloaded is not None
    assert reloaded["project_name"] == "AgriTech Venture"
    assert reloaded["phase1_complete"] is True
    assert reloaded["phase1_response"] == "Market signals indicate severe cold chain spoilage in Iloilo."
    assert reloaded["phase2_complete"] is True
    assert reloaded["phase3_problem"] == "Smallholder tomato farmers lose 40% harvest to heat spoilage before reaching Iloilo terminal market."
    assert reloaded["completed_levels"] == [1, 2, 3]
    assert len(reloaded["phase3_history"]) == 2

    # Advance Phase 3 and save update
    updated_state = dict(reloaded)
    updated_state["completed_levels"] = [1, 2, 3, 4, 5, 6]
    updated_state["phase3_complete"] = True
    temp_adapter.save_session(session_id, updated_state)

    # Reload again
    reloaded_after_advance = temp_adapter.get_session(session_id)
    assert reloaded_after_advance["phase3_complete"] is True
    assert len(reloaded_after_advance["completed_levels"]) == 6


def test_save_session_kwargs_and_state_data_compatibility(temp_adapter):
    """
    Verify TASK-REM-13:
    save_session handles keyword arguments (state_data=...) gracefully without TypeError.
    """
    session_id = "sess_test_kwargs_compat"
    # Call using state_data keyword argument (as passed by router)
    res = temp_adapter.save_session(
        session_id=session_id,
        state_data={
            "session_id": session_id,
            "project_name": "Keyword Compat Project",
            "phase1_complete": True,
        },
        phase1_complete=True,
        phase2_complete=False,
    )
    assert res is not None
    assert res["project_name"] == "Keyword Compat Project"

    # Verify retrieval
    loaded = temp_adapter.get_session(session_id)
    assert loaded is not None
    assert loaded["phase1_complete"] is True


def test_partial_session_update_preserves_unrelated_state(temp_adapter):
    """
    Verify Requirement 6:
    Partial session updates merge with existing state in SQLite rather than
    overwriting or obliterating unrelated fields.
    """
    session_id = "sess_test_partial_merge"

    # Step 1: Initial state written (e.g. Phase 1 completes)
    initial_state = {
        "session_id": session_id,
        "project_name": "AgriTech Cold Chain",
        "phase1_complete": True,
        "phase1_response": "Cold chain post-harvest loss signals",
        "custom_metadata": {"author": "Student Team Pototan"},
    }
    temp_adapter.save_session(session_id, initial_state)

    # Step 2: Partial update written (e.g. Phase 2 completion only)
    partial_update = {
        "phase2_complete": True,
        "phase2_response": "Selected Solar Cold-Hub candidate",
        "phase3_problem": "Lack of decentralized cooling at farmgate",
    }
    temp_adapter.save_session(session_id, partial_update)

    # Step 3: Verify merged state retains prior fields
    merged = temp_adapter.get_session(session_id)
    assert merged is not None
    assert merged["phase1_complete"] is True
    assert merged["phase1_response"] == "Cold chain post-harvest loss signals"
    assert merged["phase2_complete"] is True
    assert merged["phase2_response"] == "Selected Solar Cold-Hub candidate"
    assert merged["phase3_problem"] == "Lack of decentralized cooling at farmgate"
    assert merged["project_name"] == "AgriTech Cold Chain"
    assert merged["custom_metadata"] == {"author": "Student Team Pototan"}


def test_full_api_persistence_lifecycle(temp_adapter, monkeypatch):
    """
    Verify complete persistence lifecycle across HTTP API:
    POST /api/sessions/{id} (initial) -> POST /api/sessions/{id} (partial update) -> GET /api/sessions/{id}.
    """
    from fastapi.testclient import TestClient
    from server import app
    import routers.sessions as sess_module

    # Monkeypatch get_storage in sessions router to use our isolated temp_adapter
    monkeypatch.setattr(sess_module, "get_storage", lambda: temp_adapter)

    client = TestClient(app)
    session_id = "sess_api_lifecycle_001"

    # 1. UI mutation -> updateSession (Phase 1 completion)
    p1_payload = {
        "state_data": {
            "session_id": session_id,
            "project_name": "Iloilo Fisheries AI",
            "phase1_complete": True,
            "phase1_response": "Severe fish spoilage in Estancia port",
        },
        "phase1_complete": True,
    }
    res1 = client.post(f"/api/sessions/{session_id}", json=p1_payload)
    assert res1.status_code == 200, res1.text
    body1 = res1.json()
    assert body1["session_id"] == session_id
    assert body1["session"]["phase1_complete"] is True

    # 2. UI mutation -> updateSession (Phase 2 partial update)
    p2_payload = {
        "state_data": {
            "phase2_complete": True,
            "phase2_response": "Ice slurry cooling network",
            "phase3_problem": "Estancia fishermen lack rapid slush-ice cooling",
        },
        "phase2_complete": True,
    }
    res2 = client.post(f"/api/sessions/{session_id}", json=p2_payload)
    assert res2.status_code == 200, res2.text

    # 3. Reload -> getSession
    res_get = client.get(f"/api/sessions/{session_id}")
    assert res_get.status_code == 200, res_get.text
    restored = res_get.json()

    # Verify both Phase 1 and Phase 2 data exist in reconstructed state
    assert restored["project_name"] == "Iloilo Fisheries AI"
    assert restored["phase1_complete"] is True
    assert restored["phase1_response"] == "Severe fish spoilage in Estancia port"
    assert restored["phase2_complete"] is True
    assert restored["phase2_response"] == "Ice slurry cooling network"
    assert restored["phase3_problem"] == "Estancia fishermen lack rapid slush-ice cooling"
