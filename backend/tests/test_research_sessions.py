"""
Integration & Unit Tests for Research Session Persistence & Resume (SDD-021)
=============================================================================
Governed by: CONVERA Constitution Article I (Grounded Cognition),
             Article II (Tri-Part Confidence),
             Article IV (Human Sovereignty),
             Article VII (Anti-Creep Law),
             Article VIII (Degraded-State Resilience)
"""

import os
import tempfile
import pytest
from typing import Generator
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.session_state_engine import SessionStateEngine
from server import app

pytestmark = pytest.mark.integration


@pytest.fixture
def storage() -> Generator[SQLiteStorageAdapter, None, None]:
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    adapter = SQLiteStorageAdapter(db_path=path)
    yield adapter
    if os.path.exists(path):
        try:
            os.remove(path)
        except Exception:
            pass


@pytest.fixture
def engine(storage: SQLiteStorageAdapter) -> SessionStateEngine:
    return SessionStateEngine(storage=storage)


@pytest.fixture
def client(storage: SQLiteStorageAdapter) -> Generator[TestClient, None, None]:
    import storage.factory as storage_factory
    original_global = storage_factory._GLOBAL_STORAGE
    storage_factory._GLOBAL_STORAGE = storage
    original_storage = getattr(app.state, "storage", None)
    app.state.storage = storage
    with TestClient(app) as test_client:
        yield test_client
    storage_factory._GLOBAL_STORAGE = original_global
    if original_storage is not None:
        app.state.storage = original_storage


def _seed_workspace_and_problem(storage: SQLiteStorageAdapter):
    ws_id = "ws_persistence_test"
    with storage._get_connection() as conn:
        conn.execute("INSERT OR IGNORE INTO projects (id, name, share_code) VALUES (?, ?, ?)", (ws_id, "Persistence Test Lab", "PERSIST"))
    storage.save_session(
        session_id="sess_init_seed",
        state={"project_id": ws_id, "project_name": "Persistence Test Lab"}
    )
    prob_data = {
        "id": "PROB-021-01",
        "sector": "Distributed Systems",
        "sufferer_occupation": "System Engineers",
        "sufferer_location": "Global",
        "problem_statement": "Knowledge Gap in Distributed Consensus",
        "evidence_tier": "STRONGLY_DOCUMENTED",
        "tags": ["consensus", "distributed"],
    }
    prob = storage.add_problem(prob_data)
    return {"id": ws_id, "name": "Persistence Test Lab"}, prob


def test_create_research_session(client: TestClient, storage: SQLiteStorageAdapter):
    ws, prob = _seed_workspace_and_problem(storage)

    resp = client.post(
        "/api/research-sessions",
        json={
            "project_name": "Autonomous Agent Investigation",
            "project_id": ws["id"],
            "domain_id": "D01",
            "initial_topic": "Exploring fault tolerance under network partitions",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["project_name"] == "Autonomous Agent Investigation"
    assert data["current_stage_id"] == "scouting"
    assert data["stage_index"] == 0
    assert data["stage_completion_pct"] > 0
    assert "session_id" in data
    assert data["session_id"].startswith("sess_")
    assert data["active_problem_id"] is not None


def test_list_research_sessions(client: TestClient, storage: SQLiteStorageAdapter):
    ws, prob = _seed_workspace_and_problem(storage)

    client.post(
        "/api/research-sessions",
        json={"project_name": "Session Alpha", "project_id": ws["id"]},
    )
    client.post(
        "/api/research-sessions",
        json={"project_name": "Session Beta", "project_id": ws["id"]},
    )

    resp = client.get("/api/research-sessions?limit=10")
    assert resp.status_code == 200
    sessions = resp.json()
    assert len(sessions) >= 2
    names = [s["project_name"] for s in sessions]
    assert "Session Alpha" in names
    assert "Session Beta" in names


def test_resume_research_session(client: TestClient, storage: SQLiteStorageAdapter):
    ws, prob = _seed_workspace_and_problem(storage)

    create_resp = client.post(
        "/api/research-sessions",
        json={
            "project_name": "Resumable Session",
            "project_id": ws["id"],
            "initial_topic": "Evaluating decentralized Byzantine agreements",
        },
    )
    assert create_resp.status_code == 201
    session_id = create_resp.json()["session_id"]

    # Resume the session
    resume_resp = client.get(f"/api/research-sessions/{session_id}/resume")
    assert resume_resp.status_code == 200
    payload = resume_resp.json()

    assert payload["summary"]["session_id"] == session_id
    assert payload["summary"]["project_name"] == "Resumable Session"
    assert payload["summary"]["current_stage_id"] == "scouting"
    assert payload["active_problem"] is not None
    assert "problem_statement" in payload["active_problem"]
    assert isinstance(payload["checkpoints"], list)
    assert isinstance(payload["recent_events"], list)


def test_checkpoint_lifecycle_and_hashing(client: TestClient, storage: SQLiteStorageAdapter):
    ws, prob = _seed_workspace_and_problem(storage)

    create_resp = client.post(
        "/api/research-sessions",
        json={"project_name": "Checkpoint Test Session", "project_id": ws["id"]},
    )
    assert create_resp.status_code == 201
    session_id = create_resp.json()["session_id"]

    # Create Checkpoint
    chk_resp = client.post(
        f"/api/research-sessions/{session_id}/checkpoint",
        json={
            "checkpoint_name": "Pre-Gate 1 Baseline",
            "description": "Captured before hypothesis stress-testing",
            "created_by": "Lead Researcher",
        },
    )
    assert chk_resp.status_code == 200
    chk_data = chk_resp.json()
    assert chk_data["checkpoint_name"] == "Pre-Gate 1 Baseline"
    assert "scouting" in chk_data["stage_id"]
    assert len(chk_data["state_hash"]) == 64  # SHA-256 hex string
    checkpoint_id = chk_data["checkpoint_id"]

    # List Checkpoints
    list_chk_resp = client.get(f"/api/research-sessions/{session_id}/checkpoints")
    assert list_chk_resp.status_code == 200
    chk_list = list_chk_resp.json()
    assert len(chk_list) == 1
    assert chk_list[0]["checkpoint_id"] == checkpoint_id

    # Delete Checkpoint
    del_resp = client.delete(f"/api/research-sessions/{session_id}/checkpoint/{checkpoint_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["success"] is True

    # Check list is now empty
    list_after = client.get(f"/api/research-sessions/{session_id}/checkpoints").json()
    assert len(list_after) == 0


def test_restore_checkpoint_integrity(client: TestClient, storage: SQLiteStorageAdapter):
    ws, prob = _seed_workspace_and_problem(storage)

    create_resp = client.post(
        "/api/research-sessions",
        json={"project_name": "Rollback Session", "project_id": ws["id"]},
    )
    assert create_resp.status_code == 201
    session_id = create_resp.json()["session_id"]

    # Create checkpoint at initial scouting stage
    chk_resp = client.post(
        f"/api/research-sessions/{session_id}/checkpoint",
        json={"checkpoint_name": "Early Checkpoint"},
    )
    assert chk_resp.status_code == 200
    checkpoint_id = chk_resp.json()["checkpoint_id"]

    # Advance stage to matrix / 33.3%
    sync_resp = client.post(
        f"/api/research-sessions/{session_id}/sync-stage",
        json={"stage_id": "matrix", "stage_completion_pct": 33.3},
    )
    assert sync_resp.status_code == 200
    assert sync_resp.json()["current_stage_id"] == "matrix"

    # Restore from Early Checkpoint
    restore_resp = client.post(f"/api/research-sessions/{session_id}/restore/{checkpoint_id}")
    assert restore_resp.status_code == 200
    restored = restore_resp.json()
    assert restored["status"] == "restored"
    assert "scouting" in restored["current_stage_id"]

    # Verify resume payload reflects restored state
    resume_after = client.get(f"/api/research-sessions/{session_id}/resume").json()
    assert "scouting" in resume_after["summary"]["current_stage_id"]


def test_clone_research_session(client: TestClient, storage: SQLiteStorageAdapter):
    ws, prob = _seed_workspace_and_problem(storage)

    create_resp = client.post(
        "/api/research-sessions",
        json={"project_name": "Master Template", "project_id": ws["id"]},
    )
    assert create_resp.status_code == 201
    parent_id = create_resp.json()["session_id"]

    # Advance parent stage to matrix
    client.post(
        f"/api/research-sessions/{parent_id}/sync-stage",
        json={"stage_id": "matrix", "stage_completion_pct": 33.3},
    )

    # Clone session
    clone_resp = client.post(
        f"/api/research-sessions/{parent_id}/clone",
        json={"new_project_name": "Forked Experiment Alpha", "include_literature": True},
    )
    assert clone_resp.status_code == 200
    clone_data = clone_resp.json()
    assert clone_data["project_name"] == "Forked Experiment Alpha"
    assert clone_data["session_id"] != parent_id
    assert clone_data["current_stage_id"] == "matrix"


def test_sync_stage_invalid_percentage(client: TestClient, storage: SQLiteStorageAdapter):
    ws, prob = _seed_workspace_and_problem(storage)

    create_resp = client.post(
        "/api/research-sessions",
        json={"project_name": "Validation Session", "project_id": ws["id"]},
    )
    assert create_resp.status_code == 201
    session_id = create_resp.json()["session_id"]

    # Percentage > 100 should fail validation
    resp = client.post(
        f"/api/research-sessions/{session_id}/sync-stage",
        json={"stage_id": "matrix", "stage_completion_pct": 150.0},
    )
    assert resp.status_code == 422


def test_nonexistent_session_404(client: TestClient):
    resp = client.get("/api/research-sessions/sess_nonexistent_999/resume")
    assert resp.status_code == 404
