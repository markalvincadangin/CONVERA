import pytest
import pytest_asyncio
from storage import get_storage
from engines.decision_engine import synthesize_decision_room, execute_pivot_loop

def test_decision_records_storage():
    storage = get_storage()
    
    record = storage.create_decision_record({
        "session_id": "test-session-123",
        "stage": "PHASE_2_DECISION_ROOM",
        "selected_problem_id": "AGR-003",
        "rejected_problem_ids": ["AGR-001", "RET-002"],
        "decision_rationale": "Direct farmer interview evidence shows 35% spoilage.",
        "supporting_evidence_ids": ["https://doi.org/10.1016/j.heliyon.2023.e19482"]
    })
    
    assert record is not None
    assert record["selected_problem_id"] == "AGR-003"
    assert "id" in record
    
    # List decisions
    decisions = storage.list_decision_records(session_id="test-session-123")
    assert len(decisions) >= 1
    assert decisions[0]["selected_problem_id"] == "AGR-003"

@pytest.mark.asyncio
async def test_decision_room_synthesis():
    storage = get_storage()
    hou = storage.get_problem("HOU-001") or {"id": "HOU-001", "problem_statement": "Flood risk", "score": 90}
    agr = storage.get_problem("AGR-003") or {"id": "AGR-003", "problem_statement": "Onion spoilage", "score": 95}
    
    res = await synthesize_decision_room([agr, hou])
    assert "recommended_winner_id" in res
    assert "recommendation_summary" in res
    assert len(res["candidate_breakdowns"]) == 2

def test_pivot_loop_execution():
    storage = get_storage()
    # Create test session
    storage.save_session("pivot-test-session", {
        "session_id": "pivot-test-session",
        "phase1_complete": True,
        "phase2_complete": True,
        "phase3_complete": False,
        "phase3_problem": "AGR-003"
    })
    
    res = execute_pivot_loop(
        session_id="pivot-test-session",
        current_problem_id="AGR-003",
        pivot_reason="Miagao farmers cannot afford private cold storage fees.",
        author="Lead Researcher"
    )
    
    assert res["status"] == "success"
    assert "decision_record" in res
    
    # Verify session was safely reopened at Phase 2
    session = storage.get_session("pivot-test-session")
    assert session["phase2_complete"] is False
    assert len(session["pivot_history"]) >= 1
