"""
Tests for Parameterized WorkflowTransitionService via Methodology Contracts
===========================================================================
Governed by: CONVERA Concept Development Standard (CCDS v2.0)
Verification Protocol: SPEC-METHODOLOGY-CONTRACT-001-SDD-01-REV-01
"""
import pytest
from storage.sqlite_adapter import SQLiteStorageAdapter, WorkflowStateCorruptedError
from services.workflow_transition_service import WorkflowTransitionService
from contracts.methodology import (
    INNOVATION_CONTRACT,
    RESEARCH_CONTRACT,
    MethodologyContract,
    StageContract,
    GateContract,
)


@pytest.fixture
def temp_adapter(tmp_path):
    """Isolated SQLite adapter fixture that does not mutate convera.db."""
    db_file = tmp_path / "contracts_test.db"
    return SQLiteStorageAdapter(db_path=str(db_file))


@pytest.fixture
def transition_service(temp_adapter):
    return WorkflowTransitionService(storage=temp_adapter)


def test_innovation_full_transition_lifecycle(temp_adapter, transition_service):
    """Verify Innovation lifecycle transitions driven by INNOVATION_CONTRACT."""
    session_id = "sess_innov_lifecycle"
    temp_adapter.save_session(session_id, {
        "session_id": session_id,
        "project_id": "proj_innov_01",
        "framework_id": "INNOVATION",
        "phase1_complete": True,
        "phase2_complete": False,
    })

    # Gate 1 clearance (p2_screening -> p3_mom_test)
    temp_adapter.record_gate_review({
        "project_id": "proj_innov_01",
        "gate_id": "GATE_1",
        "verdict": "PASSED",
        "overall_score": 88.0,
    })
    res_p2 = transition_service.process_gate_transition(session_id, "p2_screening", "GATE_1")
    assert res_p2["transition_applied"] is True
    assert res_p2["previous_stage_id"] == "p2_screening"
    assert res_p2["current_stage_id"] == "p3_mom_test"
    assert res_p2["stage_progress"]["stages"]["p2_screening"]["status"] == "COMPLETED"
    assert res_p2["stage_progress"]["stages"]["p2_screening"]["gate_status"] == "PASSED"
    assert res_p2["stage_progress"]["stages"]["p3_mom_test"]["status"] == "IN_PROGRESS"

    # Gate 2 clearance (p3_mom_test -> p4_mechanism)
    temp_adapter.record_gate_review({
        "project_id": "proj_innov_01",
        "gate_id": "GATE_2",
        "verdict": "PASSED",
        "overall_score": 92.0,
    })
    res_p3 = transition_service.process_gate_transition(session_id, "p3_mom_test", "GATE_2")
    assert res_p3["transition_applied"] is True
    assert res_p3["current_stage_id"] == "p4_mechanism"
    assert res_p3["stage_progress"]["stages"]["p3_mom_test"]["status"] == "COMPLETED"
    assert res_p3["stage_progress"]["stages"]["p4_mechanism"]["status"] == "IN_PROGRESS"

    # Advance p4 to p5 directly (p4 has no gate)
    sess = temp_adapter.get_session(session_id)
    sess["stage_progress"]["stages"]["p4_mechanism"]["status"] = "COMPLETED"
    sess["stage_progress"]["stages"]["p5_economics"]["status"] = "IN_PROGRESS"
    sess["stage_progress"]["current_stage_id"] = "p5_economics"
    temp_adapter.save_session(session_id, sess)

    # Gate 3 clearance (p5_economics -> studio)
    temp_adapter.record_gate_review({
        "project_id": "proj_innov_01",
        "gate_id": "GATE_3",
        "verdict": "PASSED",
        "overall_score": 95.0,
    })
    res_p5 = transition_service.process_gate_transition(session_id, "p5_economics", "GATE_3")
    assert res_p5["transition_applied"] is True
    assert res_p5["current_stage_id"] == "studio"
    assert res_p5["stage_progress"]["stages"]["p5_economics"]["status"] == "COMPLETED"
    assert res_p5["stage_progress"]["stages"]["p5_economics"]["gate_status"] == "PASSED"


def test_research_full_transition_lifecycle(temp_adapter, transition_service):
    """Verify Research lifecycle transitions driven by RESEARCH_CONTRACT."""
    session_id = "sess_research_lifecycle"
    temp_adapter.save_session(session_id, {
        "session_id": session_id,
        "project_id": "proj_research_01",
        "framework_id": "RESEARCH",
    })

    # Gate 1 clearance (stage_b_validation -> stage_c_opportunity)
    temp_adapter.record_gate_review({
        "project_id": "proj_research_01",
        "gate_id": "GATE_1",
        "verdict": "PASSED",
        "overall_score": 85.0,
    })
    res_b = transition_service.process_gate_transition(session_id, "stage_b_validation", "GATE_1")
    assert res_b["transition_applied"] is True
    assert res_b["current_stage_id"] == "stage_c_opportunity"
    assert res_b["stage_progress"]["stages"]["stage_b_validation"]["status"] == "COMPLETED"

    # Gate 2 clearance (stage_c_opportunity -> stage_d_formulation)
    temp_adapter.record_gate_review({
        "project_id": "proj_research_01",
        "gate_id": "GATE_2",
        "verdict": "PASSED",
        "overall_score": 87.0,
    })
    res_c = transition_service.process_gate_transition(session_id, "stage_c_opportunity", "GATE_2")
    assert res_c["transition_applied"] is True
    assert res_c["current_stage_id"] == "stage_d_formulation"

    # Advance stage_d to stage_e (stage_d has no gate)
    sess = temp_adapter.get_session(session_id)
    sess["stage_progress"]["stages"]["stage_d_formulation"]["status"] = "COMPLETED"
    sess["stage_progress"]["stages"]["stage_e_evaluation"]["status"] = "IN_PROGRESS"
    sess["stage_progress"]["current_stage_id"] = "stage_e_evaluation"
    temp_adapter.save_session(session_id, sess)

    # Gate 3 clearance (stage_e_evaluation -> stage_f_feasibility)
    temp_adapter.record_gate_review({
        "project_id": "proj_research_01",
        "gate_id": "GATE_3",
        "verdict": "PASSED",
        "overall_score": 90.0,
    })
    res_e = transition_service.process_gate_transition(session_id, "stage_e_evaluation", "GATE_3")
    assert res_e["transition_applied"] is True
    assert res_e["current_stage_id"] == "stage_f_feasibility"
    assert res_e["stage_progress"]["stages"]["stage_e_evaluation"]["status"] == "COMPLETED"
    assert res_e["stage_progress"]["stages"]["stage_f_feasibility"]["status"] == "IN_PROGRESS"

    # Gate 4 clearance (stage_f_feasibility -> studio)
    temp_adapter.record_gate_review({
        "project_id": "proj_research_01",
        "gate_id": "GATE_4",
        "verdict": "PASSED",
        "overall_score": 94.0,
    })
    res_f = transition_service.process_gate_transition(session_id, "stage_f_feasibility", "GATE_4")
    assert res_f["transition_applied"] is True
    assert res_f["current_stage_id"] == "studio"
    assert res_f["stage_progress"]["stages"]["stage_f_feasibility"]["status"] == "COMPLETED"


def test_transition_negative_cases_and_error_parity(temp_adapter, transition_service):
    """Verify exact specified error behavior for invalid requests."""
    # 1. Non-existent session
    with pytest.raises(ValueError, match="Session 'sess_missing' not found"):
        transition_service.process_gate_transition("sess_missing", "p2_screening", "GATE_1")

    # 2. Corrupted stage_progress (corrupted in DB to bypass save_session schema validation)
    temp_adapter.save_session("sess_corrupted", {
        "session_id": "sess_corrupted",
        "framework_id": "INNOVATION",
    })
    with temp_adapter._get_connection() as conn:
        conn.execute(
            "UPDATE sessions SET state_data = ? WHERE session_id = ?",
            ('{"session_id": "sess_corrupted", "framework_id": "INNOVATION", "stage_progress": "not_a_dict"}', "sess_corrupted")
        )
    with pytest.raises(WorkflowStateCorruptedError, match="has invalid/corrupted stage_progress schema"):
        transition_service.process_gate_transition("sess_corrupted", "p2_screening", "GATE_1")

    # 3. Missing / empty framework_id (No silent fallback!)
    temp_adapter.save_session("sess_empty_fw", {
        "session_id": "sess_empty_fw",
        "project_id": "default_proj",
        "framework_id": "",
        "stage_progress": {"schema_version": 1, "framework_id": "", "current_stage_id": "p2_screening", "stages": {"p2_screening": {"status": "IN_PROGRESS"}}},
    })
    with pytest.raises(ValueError, match="Methodology framework identity is missing or empty"):
        transition_service.process_gate_transition("sess_empty_fw", "p2_screening", "GATE_1")

    # 4. Unknown / unsupported framework_id (No silent fallback!)
    temp_adapter.save_session("sess_unknown_fw", {
        "session_id": "sess_unknown_fw",
        "project_id": "default_proj",
        "framework_id": "HYPOTHETICAL_UNKNOWN_V9",
        "stage_progress": {"schema_version": 1, "framework_id": "HYPOTHETICAL_UNKNOWN_V9", "current_stage_id": "p2_screening", "stages": {"p2_screening": {"status": "IN_PROGRESS"}}},
    })
    with pytest.raises(ValueError, match="Unknown or unsupported methodology framework: 'HYPOTHETICAL_UNKNOWN_V9'"):
        transition_service.process_gate_transition("sess_unknown_fw", "p2_screening", "GATE_1")

    # 5. Unrecognized stage for framework
    temp_adapter.save_session("sess_valid_innov", {
        "session_id": "sess_valid_innov",
        "project_id": "default_proj",
        "framework_id": "INNOVATION",
        "phase1_complete": True,
        "current_stage_id": "p2_screening",
    })
    with pytest.raises(ValueError, match="Stage 'stage_b_validation' is not recognized for framework 'INNOVATION'"):
        transition_service.process_gate_transition("sess_valid_innov", "stage_b_validation", "GATE_1")

    # 6. Ungated stage transition attempt (e.g. p1_discovery has no gate)
    with pytest.raises(ValueError, match="Stage 'p1_discovery' does not require a quality gate transition in framework 'INNOVATION'"):
        transition_service.process_gate_transition("sess_valid_innov", "p1_discovery", "GATE_1")

    # 7. Gate mismatch (e.g. GATE_2 on p2_screening which expects GATE_1)
    with pytest.raises(ValueError, match="Gate mismatch: submitted gate 'GATE_2' does not match expected gate 'GATE_1'"):
        transition_service.process_gate_transition("sess_valid_innov", "p2_screening", "GATE_2")

    # 8. Missing gate review record
    with pytest.raises(ValueError, match="No gate review record found for gate 'GATE_1'"):
        transition_service.process_gate_transition("sess_valid_innov", "p2_screening", "GATE_1")

    # 9. Gate review with REVISE verdict (does not advance)
    temp_adapter.record_gate_review({
        "project_id": "default_proj",
        "gate_id": "GATE_1",
        "verdict": "REVISE",
        "overall_score": 65.0,
    })
    res_revise = transition_service.process_gate_transition("sess_valid_innov", "p2_screening", "GATE_1")
    assert res_revise["transition_applied"] is False
    assert "Gate review verdict is 'REVISE'" in res_revise["reason"]
    assert res_revise["current_stage_id"] == "p2_screening"
    assert res_revise["stage_progress"]["stages"]["p2_screening"]["gate_status"] == "REVISE"

    # 10. Gate review with FAILED verdict (does not advance)
    temp_adapter.record_gate_review({
        "project_id": "default_proj",
        "gate_id": "GATE_1",
        "verdict": "FAILED",
        "overall_score": 40.0,
    })
    res_fail = transition_service.process_gate_transition("sess_valid_innov", "p2_screening", "GATE_1")
    assert res_fail["transition_applied"] is False
    assert "Gate review verdict is 'FAILED'" in res_fail["reason"]
    assert res_fail["stage_progress"]["stages"]["p2_screening"]["gate_status"] == "FAILED"


def test_custom_contract_resolver_injection(temp_adapter):
    """Verify that WorkflowTransitionService accepts custom contract resolver."""
    custom_contract = MethodologyContract(
        id="CUSTOM_PILOT",
        name="Custom Pilot Methodology",
        version="1.0.0",
        stage_sequence=["stage_alpha", "stage_beta", "studio"],
        gate_map={"stage_alpha": "GATE_ALPHA"},
        stages=[
            StageContract(id="stage_alpha", number=1, code="Alpha", label="Alpha Stage", short_description="Initial pilot stage", gate_id="GATE_ALPHA"),
            StageContract(id="stage_beta", number=2, code="Beta", label="Beta Stage", short_description="Second pilot stage"),
        ],
        gates=[
            GateContract(id="GATE_ALPHA", name="Gate Alpha", stage_id="stage_alpha"),
        ],
    )

    def custom_resolver(framework_id: str):
        if framework_id == "CUSTOM_PILOT":
            return custom_contract
        return None

    service = WorkflowTransitionService(storage=temp_adapter, contract_resolver=custom_resolver)

    temp_adapter.save_session("sess_custom", {
        "session_id": "sess_custom",
        "project_id": "default_proj",
        "framework_id": "CUSTOM_PILOT",
        "stage_progress": {
            "schema_version": 1,
            "framework_id": "CUSTOM_PILOT",
            "current_stage_id": "stage_alpha",
            "stages": {
                "stage_alpha": {"status": "IN_PROGRESS", "gate_status": "NOT_REQUIRED"},
                "stage_beta": {"status": "LOCKED", "gate_status": "NOT_REQUIRED"},
            }
        }
    })
    temp_adapter.record_gate_review({
        "project_id": "default_proj",
        "gate_id": "GATE_ALPHA",
        "verdict": "PASSED",
        "overall_score": 90.0,
    })

    res = service.process_gate_transition("sess_custom", "stage_alpha", "GATE_ALPHA")
    assert res["transition_applied"] is True
    assert res["current_stage_id"] == "stage_beta"
    assert res["stage_progress"]["stages"]["stage_alpha"]["status"] == "COMPLETED"
    assert res["stage_progress"]["stages"]["stage_beta"]["status"] == "IN_PROGRESS"

