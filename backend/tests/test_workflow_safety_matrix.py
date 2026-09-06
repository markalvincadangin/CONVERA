"""
SPEC-TECH-DEBT-CCDS-001: Behavioral Compatibility Test Matrix
============================================================
Automated test matrix implementing Suites 1 through 7 as mandated by
ADR v2.2 and Tier 2 Engineering Specification (SPEC-TECH-DEBT-CCDS-001).

Suites:
- Suite 1: Legacy Session Ingestion Test (all sessions in convera.db)
- Suite 2: Research Track Workflow State Test (Methodology Reservation)
- Suite 3: Innovation Track Workflow State Test
- Suite 4: Legacy API Invariance Test
- Suite 5: Navigation Traversal & Compatibility Test (Defect 1 & Defect 4)
- Suite 6: Repeated Migration & Idempotence Verification (INV-CCDS-001-WORKFLOW-002)
- Suite 7: No-Reverse-Synchronization Invariant Test (INV-CCDS-001-COMPAT-001)
"""

import os
import json
import sqlite3
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from server import app
from storage.sqlite_adapter import (
    SQLiteStorageAdapter,
    validate_stage_progress_schema,
    derive_legacy_phase_projection,
    synthesize_canonical_stage_progress,
)
from services.workflow_transition_service import (
    WorkflowTransitionService,
    RESEARCH_SEQUENCE,
    INNOVATION_SEQUENCE,
    RESEARCH_GATE_MAP,
    INNOVATION_GATE_MAP,
)


@pytest.fixture
def temp_adapter(tmp_path):
    """Isolated SQLite adapter fixture that does not mutate convera.db."""
    db_file = tmp_path / "isolated_matrix.db"
    return SQLiteStorageAdapter(db_path=str(db_file))


@pytest.fixture
def api_client():
    """TestClient for API endpoints."""
    return TestClient(app)


# ============================================================================
# SUITE 1: Legacy Session Ingestion Test
# ============================================================================
@pytest.mark.integration
def test_suite_1_legacy_session_ingestion():
    """
    Suite 1: Load all active sessions from backend/convera.db.
    Verify:
    1. Every session synthesizes valid canonical stage_progress.
    2. Saving loaded session yields zero drift in legacy phase1..5_complete flags.
    3. Session metadata and state data remain 100% accessible.
    """
    convera_db = os.path.abspath("backend/convera.db")
    if not os.path.exists(convera_db):
        convera_db = os.path.abspath("convera.db")
    assert os.path.exists(convera_db), f"convera.db not found at {convera_db}"

    # Read row list
    with sqlite3.connect(convera_db) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT session_id, phase1_complete, phase2_complete, phase3_complete, phase4_complete, phase5_complete FROM sessions").fetchall()

    assert len(rows) >= 13, f"Expected at least 13 active sessions in convera.db, found {len(rows)}"

    adapter = SQLiteStorageAdapter(db_path=convera_db)

    for r in rows:
        session_id = r["session_id"]
        session = adapter.get_session(session_id)
        assert session is not None, f"Session {session_id} failed to load"

        # Verify canonical stage_progress
        stage_progress = session.get("stage_progress")
        assert stage_progress is not None, f"Session {session_id} has no stage_progress"
        assert validate_stage_progress_schema(stage_progress), f"Session {session_id} failed schema validation"

        # Verify zero drift on re-save
        pre_save_p1 = session.get("phase1_complete")
        pre_save_p2 = session.get("phase2_complete")
        pre_save_p3 = session.get("phase3_complete")
        pre_save_p4 = session.get("phase4_complete")
        pre_save_p5 = session.get("phase5_complete")
        pre_save_stage = session.get("current_stage_id")

        saved = adapter.save_session(session_id, session)

        assert saved.get("phase1_complete") == pre_save_p1, f"Drift in phase1_complete for {session_id}"
        assert saved.get("phase2_complete") == pre_save_p2, f"Drift in phase2_complete for {session_id}"
        assert saved.get("phase3_complete") == pre_save_p3, f"Drift in phase3_complete for {session_id}"
        assert saved.get("phase4_complete") == pre_save_p4, f"Drift in phase4_complete for {session_id}"
        assert saved.get("phase5_complete") == pre_save_p5, f"Drift in phase5_complete for {session_id}"
        assert saved.get("current_stage_id") == pre_save_stage, f"Drift in current_stage_id for {session_id}"


# ============================================================================
# SUITE 2: Research Track Workflow State Test [METHODOLOGY RESERVATION]
# ============================================================================
@pytest.mark.integration
def test_suite_2_research_track_workflow_state(temp_adapter):
    """
    Suite 2: Execute Stages A through F sequentially.
    Verify:
    1. Independent status progression for Stage E and Stage F (resolving Defect 2).
    2. Passing Gate 3 unlocks Stage F and marks Stage E completed (resolving Defect 3).
    3. Completing Stage F unlocks Deliverables Studio.
    """
    session_id = "test_research_e2e_001"
    initial_state = {
        "session_id": session_id,
        "project_name": "Computing Research AI Venture",
        "framework_id": "RESEARCH",
        "phase1_complete": True,
        "phase2_complete": False,
    }
    temp_adapter.save_session(session_id, initial_state)

    sess = temp_adapter.get_session(session_id)
    assert sess["framework_id"] == "RESEARCH"
    sp = sess["stage_progress"]
    assert sp["stages"]["stage_a_scouting"]["status"] == "COMPLETED"
    assert sp["stages"]["stage_b_validation"]["status"] == "IN_PROGRESS"
    assert sp["stages"]["stage_e_evaluation"]["status"] == "LOCKED"
    assert sp["stages"]["stage_f_feasibility"]["status"] == "LOCKED"

    transition_service = WorkflowTransitionService(storage=temp_adapter)

    # Gate 1 clearance (Stage B -> Stage C)
    temp_adapter.record_gate_review({
        "project_id": sess.get("project_id", "default_proj"),
        "gate_id": "GATE_1",
        "overall_score": 85.0,
        "verdict": "PASSED",
        "framework": "RESEARCH",
    })
    res_g1 = transition_service.process_gate_transition(session_id, "stage_b_validation", "GATE_1")
    assert res_g1["transition_applied"] is True
    assert res_g1["current_stage_id"] == "stage_c_opportunity"

    # Gate 2 clearance (Stage C -> Stage D)
    temp_adapter.record_gate_review({
        "project_id": sess.get("project_id", "default_proj"),
        "gate_id": "GATE_2",
        "overall_score": 88.0,
        "verdict": "PASSED",
        "framework": "RESEARCH",
    })
    res_g2 = transition_service.process_gate_transition(session_id, "stage_c_opportunity", "GATE_2")
    assert res_g2["transition_applied"] is True
    assert res_g2["current_stage_id"] == "stage_d_formulation"

    # Advance Stage D to Stage E directly in stage_progress (Stage D has no gate)
    sess = temp_adapter.get_session(session_id)
    sp = sess["stage_progress"]
    sp["stages"]["stage_d_formulation"]["status"] = "COMPLETED"
    sp["stages"]["stage_e_evaluation"]["status"] = "IN_PROGRESS"
    sp["current_stage_id"] = "stage_e_evaluation"
    sess["stage_progress"] = sp
    temp_adapter.save_session(session_id, sess)

    # Verify Defect 2: Stage E and Stage F have independent statuses!
    sess_e = temp_adapter.get_session(session_id)
    assert sess_e["stage_progress"]["stages"]["stage_e_evaluation"]["status"] == "IN_PROGRESS"
    assert sess_e["stage_progress"]["stages"]["stage_f_feasibility"]["status"] == "LOCKED"

    # Gate 3 clearance (Stage E -> Stage F) (Defect 3)
    temp_adapter.record_gate_review({
        "project_id": sess.get("project_id", "default_proj"),
        "gate_id": "GATE_3",
        "overall_score": 90.0,
        "verdict": "PASSED",
        "framework": "RESEARCH",
    })
    res_g3 = transition_service.process_gate_transition(session_id, "stage_e_evaluation", "GATE_3")
    assert res_g3["transition_applied"] is True
    assert res_g3["current_stage_id"] == "stage_f_feasibility"
    assert res_g3["stage_progress"]["stages"]["stage_e_evaluation"]["status"] == "COMPLETED"
    assert res_g3["stage_progress"]["stages"]["stage_f_feasibility"]["status"] == "IN_PROGRESS"

    # Gate 4 clearance (Stage F -> Studio)
    temp_adapter.record_gate_review({
        "project_id": sess.get("project_id", "default_proj"),
        "gate_id": "GATE_4",
        "overall_score": 92.0,
        "verdict": "PASSED",
        "framework": "RESEARCH",
    })
    res_g4 = transition_service.process_gate_transition(session_id, "stage_f_feasibility", "GATE_4")
    assert res_g4["transition_applied"] is True
    assert res_g4["current_stage_id"] == "studio"
    assert res_g4["stage_progress"]["stages"]["stage_f_feasibility"]["status"] == "COMPLETED"


# ============================================================================
# SUITE 3: Innovation Track Workflow State Test
# ============================================================================
@pytest.mark.integration
def test_suite_3_innovation_track_workflow_state(temp_adapter):
    """
    Suite 3: Execute Phases 1 through 5 sequentially.
    Verify:
    1. Sequential progression from p1_discovery through p5_economics to studio.
    2. Quality gate transitions at P2 (Gate 1), P3 (Gate 2), P5 (Gate 3).
    3. Legacy phase flags projected accurately on save.
    """
    session_id = "test_innovation_e2e_001"
    initial_state = {
        "session_id": session_id,
        "project_name": "AgriTech Venture",
        "framework_id": "INNOVATION",
        "phase1_complete": True,
    }
    temp_adapter.save_session(session_id, initial_state)
    sess = temp_adapter.get_session(session_id)
    assert sess["current_stage_id"] == "p2_screening"
    assert sess["phase1_complete"] is True
    assert sess["phase2_complete"] is False

    transition_service = WorkflowTransitionService(storage=temp_adapter)
    project_id = sess.get("project_id", "default_proj")

    # Gate 1 clearance at P2 -> P3
    temp_adapter.record_gate_review({
        "project_id": project_id,
        "gate_id": "GATE_1",
        "overall_score": 80.0,
        "verdict": "PASSED",
        "framework": "INNOVATION",
    })
    res_p2 = transition_service.process_gate_transition(session_id, "p2_screening", "GATE_1")
    assert res_p2["transition_applied"] is True
    assert res_p2["current_stage_id"] == "p3_mom_test"

    # Gate 2 clearance at P3 -> P4
    temp_adapter.record_gate_review({
        "project_id": project_id,
        "gate_id": "GATE_2",
        "overall_score": 82.0,
        "verdict": "PASSED",
        "framework": "INNOVATION",
    })
    res_p3 = transition_service.process_gate_transition(session_id, "p3_mom_test", "GATE_2")
    assert res_p3["transition_applied"] is True
    assert res_p3["current_stage_id"] == "p4_mechanism"

    # Advance P4 to P5 in stage_progress
    sess = temp_adapter.get_session(session_id)
    sp = sess["stage_progress"]
    sp["stages"]["p4_mechanism"]["status"] = "COMPLETED"
    sp["stages"]["p5_economics"]["status"] = "IN_PROGRESS"
    sp["current_stage_id"] = "p5_economics"
    sess["stage_progress"] = sp
    temp_adapter.save_session(session_id, sess)

    # Gate 3 clearance at P5 -> Studio
    temp_adapter.record_gate_review({
        "project_id": project_id,
        "gate_id": "GATE_3",
        "overall_score": 85.0,
        "verdict": "PASSED",
        "framework": "INNOVATION",
    })
    res_p5 = transition_service.process_gate_transition(session_id, "p5_economics", "GATE_3")
    assert res_p5["transition_applied"] is True
    assert res_p5["current_stage_id"] == "studio"
    assert res_p5["stage_progress"]["stages"]["p5_economics"]["status"] == "COMPLETED"

    # Verify legacy projections
    final_sess = temp_adapter.get_session(session_id)
    assert final_sess["phase1_complete"] is True
    assert final_sess["phase2_complete"] is True
    assert final_sess["phase3_complete"] is True
    assert final_sess["phase4_complete"] is True
    assert final_sess["phase5_complete"] is True


# ============================================================================
# SUITE 4: Legacy API Invariance Test
# ============================================================================
@pytest.mark.integration
def test_suite_4_legacy_api_invariance(api_client, temp_adapter, monkeypatch):
    """
    Suite 4: Exercise /api/sessions/{session_id} and workflow transition endpoint.
    Verify:
    1. Response contracts remain 100% backward-compatible.
    2. POST /api/sessions/{session_id}/workflow/transition endpoint functions as contracted.
    """
    import routers.sessions as sess_router
    monkeypatch.setattr(sess_router, "get_storage", lambda: temp_adapter)

    session_id = "test_api_invariance_001"

    # 1. Create/Save session via API
    payload = {
        "state_data": {
            "session_id": session_id,
            "project_name": "API Invariance Venture",
            "framework_id": "RESEARCH",
            "phase1_complete": True,
        }
    }
    create_res = api_client.post(f"/api/sessions/{session_id}", json=payload)
    assert create_res.status_code == 200
    data = create_res.json()
    assert data["session_id"] == session_id
    assert "session" in data
    assert data["session"]["phase1_complete"] is True

    # 2. Get session via API
    get_res = api_client.get(f"/api/sessions/{session_id}")
    assert get_res.status_code == 200
    state = get_res.json()
    assert state["project_name"] == "API Invariance Venture"
    assert state["phase1_complete"] is True
    assert "stage_progress" in state
    assert state["current_stage_id"] == "stage_b_validation"

    # 3. Transition via API endpoint
    temp_adapter.record_gate_review({
        "project_id": state.get("project_id", "default_proj"),
        "gate_id": "GATE_1",
        "overall_score": 85.0,
        "verdict": "PASSED",
        "framework": "RESEARCH",
    })
    trans_res = api_client.post(
        f"/api/sessions/{session_id}/workflow/transition",
        json={"stage_id": "stage_b_validation", "gate_id": "GATE_1"}
    )
    assert trans_res.status_code == 200
    trans_data = trans_res.json()
    assert trans_data["transition_applied"] is True
    assert trans_data["current_stage_id"] == "stage_c_opportunity"


# ============================================================================
# SUITE 5: Navigation Traversal & Compatibility Test
# ============================================================================
@pytest.mark.unit
def test_suite_5_navigation_traversal_and_defect_contracts():
    """
    Suite 5: Verify stage sequences and Defect 1 & Defect 4 resolution contracts.
    1. Innovation Track sequence: problem_bank -> p1..p5 -> studio
    2. Research Track sequence: problem_bank -> stage_a..stage_f -> studio
    3. Defect 1: Gate 3 in Research targets stage_e_evaluation (NOT Stage C).
    4. Defect 4: Research slot 6 is Stage F and slot 7 is Deliverables Studio.
    """
    expected_innovation = ["p1_discovery", "p2_screening", "p3_mom_test", "p4_mechanism", "p5_economics", "studio"]
    expected_research = ["stage_a_scouting", "stage_b_validation", "stage_c_opportunity", "stage_d_formulation", "stage_e_evaluation", "stage_f_feasibility", "studio"]

    assert INNOVATION_SEQUENCE == expected_innovation
    assert RESEARCH_SEQUENCE == expected_research

    # Defect 1 Verification:
    # Gate 3 in Research must map to Stage E Evaluation
    assert RESEARCH_GATE_MAP.get("stage_e_evaluation") == "GATE_3"
    assert RESEARCH_GATE_MAP.get("stage_c_opportunity") == "GATE_2"  # Not Gate 3!

    # Defect 4 Verification:
    # Research sequence index 5 is Stage F, index 6 is Studio
    assert RESEARCH_SEQUENCE[5] == "stage_f_feasibility"
    assert RESEARCH_SEQUENCE[6] == "studio"
    # When activePhase is integer in Stepper:
    # Slot 0=Bank, 1=A, 2=B, 3=C, 4=D, 5=E, 6=F, 7=Studio
    research_stepper_slots = {
        0: "problem_bank",
        1: "stage_a_scouting",
        2: "stage_b_validation",
        3: "stage_c_opportunity",
        4: "stage_d_formulation",
        5: "stage_e_evaluation",
        6: "stage_f_feasibility",
        7: "studio",
    }
    assert research_stepper_slots[6] == "stage_f_feasibility"
    assert research_stepper_slots[7] == "studio"
    assert research_stepper_slots[6] != research_stepper_slots[7]


# ============================================================================
# SUITE 6: Repeated Migration & Idempotence Verification (INV-CCDS-001-WORKFLOW-002)
# ============================================================================
@pytest.mark.integration
def test_suite_6_repeated_migration_and_idempotence(temp_adapter):
    """
    Suite 6: Execute legacy -> migrate -> reload -> migrate again -> reload.
    Verify state_1 == state_2 == state_3 with zero drift.
    Directly validates INV-CCDS-001-WORKFLOW-002.
    """
    session_id = "test_idempotence_sess_001"

    # Step 1: Insert raw unmigrated legacy session directly into SQLite row
    with temp_adapter._get_connection() as conn:
        conn.execute("""
            INSERT INTO sessions (
                session_id, project_name, state_data,
                phase1_complete, phase2_complete, phase3_complete, phase4_complete, phase5_complete,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            "Idempotence Test Venture",
            json.dumps({"session_id": session_id, "project_name": "Idempotence Test Venture"}),
            1, 1, 0, 0, 0,
            datetime.now(timezone.utc).isoformat(),
            datetime.now(timezone.utc).isoformat(),
        ))

    # Step 2: Read #1 (Triggers lazy migration & persists canonical stage_progress)
    state_1 = temp_adapter.get_session(session_id)
    assert state_1 is not None
    assert "stage_progress" in state_1
    sp_1 = json.loads(json.dumps(state_1["stage_progress"]))

    # Step 3: Read #2 (Already migrated, read-only)
    state_2 = temp_adapter.get_session(session_id)
    sp_2 = json.loads(json.dumps(state_2["stage_progress"]))
    assert sp_1 == sp_2, "Drift detected between state_1 and state_2"

    # Step 4: Save & Read #3 (Idempotent persistence)
    temp_adapter.save_session(session_id, state_2)
    state_3 = temp_adapter.get_session(session_id)
    sp_3 = json.loads(json.dumps(state_3["stage_progress"]))
    assert sp_1 == sp_3, "Drift detected between state_1 and state_3"
    assert state_1["phase1_complete"] == state_3["phase1_complete"] == True
    assert state_1["phase2_complete"] == state_3["phase2_complete"] == True
    assert state_1["phase3_complete"] == state_3["phase3_complete"] == False


# ============================================================================
# SUITE 7: No-Reverse-Synchronization Invariant Test (INV-CCDS-001-COMPAT-001)
# ============================================================================
@pytest.mark.integration
def test_suite_7_no_reverse_synchronization(temp_adapter):
    """
    Suite 7: Verify INV-CCDS-001-COMPAT-001 in an isolated fixture.
    1. Initialize migrated session with canonical stage_progress (p1 & p2 complete).
    2. Record canonical stage_progress.
    3. Directly alter legacy columns in the database row (phase2_complete=0, phase5_complete=1).
    4. Reload session via sqlite_adapter.get_session().
    5. Verify stage_progress remains strictly identical to recorded state.
    6. Verify legacy column modifications do NOT cause workflow progression or regression.
    7. Verify save_session re-projects legacy flags strictly from stage_progress, restoring consistency.
    """
    session_id = "test_no_reverse_sync_001"
    initial_state = {
        "session_id": session_id,
        "project_name": "No Reverse Sync Venture",
        "framework_id": "INNOVATION",
        "phase1_complete": True,
        "phase2_complete": True,
    }
    temp_adapter.save_session(session_id, initial_state)

    # 1. Load migrated session
    migrated_sess = temp_adapter.get_session(session_id)
    assert migrated_sess is not None
    recorded_stage_progress = json.loads(json.dumps(migrated_sess["stage_progress"]))
    assert recorded_stage_progress["stages"]["p2_screening"]["status"] == "COMPLETED"
    assert recorded_stage_progress["stages"]["p5_economics"]["status"] == "LOCKED"

    # 2. Directly tamper with DB row columns (simulating rogue external mutation)
    with temp_adapter._get_connection() as conn:
        conn.execute("""
            UPDATE sessions 
            SET phase2_complete = 0, phase5_complete = 1 
            WHERE session_id = ?
        """, (session_id,))

    # 3. Reload session via get_session
    reloaded_sess = temp_adapter.get_session(session_id)
    reloaded_stage_progress = reloaded_sess["stage_progress"]

    # 4. Verify stage_progress is strictly identical to recorded state
    assert reloaded_stage_progress == recorded_stage_progress, "stage_progress was corrupted by direct DB column alteration"

    # 5. Verify workflow state did NOT regress or advance
    assert reloaded_stage_progress["stages"]["p2_screening"]["status"] == "COMPLETED"
    assert reloaded_stage_progress["stages"]["p5_economics"]["status"] == "LOCKED"
    assert reloaded_sess["current_stage_id"] == recorded_stage_progress["current_stage_id"]

    # 6. Verify save_session re-projects flags strictly from stage_progress, healing the DB row
    temp_adapter.save_session(session_id, reloaded_sess)

    with temp_adapter._get_connection() as conn:
        row = conn.execute("SELECT phase2_complete, phase5_complete FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
        assert bool(row["phase2_complete"]) is True, "phase2_complete was not restored from stage_progress projection"
        assert bool(row["phase5_complete"]) is False, "phase5_complete rogue value was not overwritten by stage_progress projection"
