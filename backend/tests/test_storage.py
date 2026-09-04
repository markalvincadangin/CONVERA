import pytest
import os
import shutil
from storage.sqlite_adapter import SQLiteStorageAdapter


pytestmark = pytest.mark.integration
@pytest.fixture
def test_storage(tmp_path):
    db_file = tmp_path / "test_convera.db"
    storage = SQLiteStorageAdapter(db_path=str(db_file))
    yield storage

def test_save_and_get_session(test_storage):
    test_state = {
        "session_id": "test_session_001",
        "project_name": "Dumangas Cold Hub",
        "phase1_response": "Table of agricultural problems in Panay",
        "phase1_complete": True,
        "phase2_complete": False,
    }
    saved = test_storage.save_session("test_session_001", test_state)
    assert saved["session_id"] == "test_session_001"

    loaded = test_storage.get_session("test_session_001")
    assert loaded is not None
    assert loaded["project_name"] == "Dumangas Cold Hub"
    assert loaded["phase1_complete"] is True

def test_list_sessions(test_storage):
    test_storage.save_session("s1", {"session_id": "s1", "project_name": "Project 1"})
    test_storage.save_session("s2", {"session_id": "s2", "project_name": "Project 2"})

    sessions = test_storage.list_sessions()
    assert len(sessions) == 2
    ids = [s["session_id"] for s in sessions]
    assert "s1" in ids and "s2" in ids

def test_create_and_restore_snapshot(test_storage):
    state_v1 = {
        "session_id": "snap_session",
        "project_name": "Onion Storage",
        "phase1_response": "Version 1",
    }
    test_storage.save_session("snap_session", state_v1)

    snap = test_storage.create_snapshot("snap_session", "Pre-Phase 2 Screening", 1)
    assert snap["id"] is not None
    assert snap["label"] == "Pre-Phase 2 Screening"

    # Modify state to Version 2
    state_v2 = {
        "session_id": "snap_session",
        "project_name": "Onion Storage",
        "phase1_response": "Version 2 (Modified)",
    }
    test_storage.save_session("snap_session", state_v2)
    assert test_storage.get_session("snap_session")["phase1_response"] == "Version 2 (Modified)"

    # Restore snapshot v1
    restored = test_storage.restore_snapshot("snap_session", snap["id"])
    assert restored is not None
    assert restored["phase1_response"] == "Version 1"

def test_get_project_by_share_code(test_storage):
    state = {
        "session_id": "shared_session",
        "project_id": "proj_123",
        "project_name": "Panay MSME Logistics",
    }
    test_storage.save_session("shared_session", state)

    sessions = test_storage.list_sessions()
    target = next((s for s in sessions if s["session_id"] == "shared_session"), None)
    assert target is not None
    code = target.get("share_code")
    assert code is not None

    found = test_storage.get_project_by_code(code)
    assert found is not None
    assert found["id"] == "proj_123"
    assert found["name"] == "Panay MSME Logistics"
