"""
Integration & Unit Tests for Research Orchestrator Engine (SDD-013)
===================================================================
Governed by: CONVERA Constitution Article II (Tri-Part Confidence) &
             Article IV (Human Sovereignty)
Verifies:
1. Stage prerequisite and gate readiness evaluation across methodology frameworks.
2. Epistemic health and Article II Overconfidence Guardrail enforcement.
3. Deterministic action recommendation ranking.
4. Action dispatch lifecycle and persistent audit event logging.
5. FastAPI router endpoints (/api/orchestrator/evaluate, dispatch-action, events).
"""

import os
import uuid
import tempfile
import pytest
from typing import Generator
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from services.research_orchestrator import ResearchOrchestrator
from models.orchestrator import (
    ActionPriority,
    ActionType,
    OrchestrationActionDispatchRequest,
)
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
def orchestrator(storage: SQLiteStorageAdapter) -> ResearchOrchestrator:
    return ResearchOrchestrator(storage=storage)


@pytest.mark.asyncio
async def test_evaluate_empty_session_stage_prerequisites(
    storage: SQLiteStorageAdapter, orchestrator: ResearchOrchestrator
):
    """Verify missing problem & sector flags stage 0 prerequisites as unsatisfied."""
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    storage.save_session(
        session_id,
        {"project_name": "Initial Seed Session", "framework_id": "INNOVATION"},
    )

    eval_res = await orchestrator.evaluate(session_id=session_id)

    assert eval_res.session_id == session_id
    assert eval_res.framework_id == "INNOVATION"
    assert eval_res.stage_status.stage_id == "p1_discovery"
    assert eval_res.stage_status.prerequisites_satisfied is False
    assert len(eval_res.stage_status.missing_prerequisites) > 0
    assert eval_res.stage_status.gate_ready is False

    # Must recommend acquiring evidence / defining prerequisites with URGENT priority
    urgent_actions = [
        a for a in eval_res.recommended_actions if a.priority == ActionPriority.URGENT
    ]
    assert len(urgent_actions) >= 1
    assert urgent_actions[0].action_type == ActionType.ACQUIRE_EVIDENCE
    assert urgent_actions[0].blocking_stage_progression is True


@pytest.mark.asyncio
async def test_evaluate_complete_stage_inputs_satisfied(
    storage: SQLiteStorageAdapter, orchestrator: ResearchOrchestrator
):
    """Verify that providing problem statement and sector satisfies stage 0 prerequisites."""
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    storage.save_session(
        session_id,
        {"project_name": "Configured Venture", "framework_id": "INNOVATION"},
    )

    prob = storage.add_problem({
        "session_id": session_id,
        "title": "Post-Harvest Grain Loss",
        "problem_statement": "Smallholder farmers experience 25% grain spoilage due to inadequate solar drying controls.",
        "sector": "Agriculture & Fisheries",
        "sufferer_occupation": "Grain Farmers",
        "sufferer_location": "Iloilo Province",
        "status": "active",
    })
    prob_id = prob["id"]
    storage.save_session(session_id, {"active_problem_id": prob_id})

    eval_res = await orchestrator.evaluate(session_id=session_id)

    assert eval_res.stage_status.prerequisites_satisfied is True
    assert len(eval_res.stage_status.missing_prerequisites) == 0


@pytest.mark.asyncio
async def test_article_ii_overconfidence_guardrail(
    storage: SQLiteStorageAdapter, orchestrator: ResearchOrchestrator
):
    """
    Constitutional Article II Guardrail:
    Decoupled AI certainty != Evidence strength.
    AI certainty >= 0.80 with evidence <= 0.40 MUST flag overconfidence_risk
    and emit an URGENT CHALLENGE_ASSUMPTION action.
    """
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    storage.save_session(
        session_id,
        {"project_name": "Overconfidence Test Session", "framework_id": "INNOVATION"},
    )

    prob = storage.add_problem({
        "session_id": session_id,
        "title": "Irrigation Automation",
        "problem_statement": "Automated solar sensors optimize moisture retention.",
        "sector": "Agriculture & Fisheries",
        "status": "active",
    })
    prob_id = prob["id"]
    storage.save_session(session_id, {"active_problem_id": prob_id})

    # High AI confidence (0.92) with zero empirical literature evidence (0.0 <= 0.40)
    storage.set_problem_claims(prob_id, [
        {
            "id": "CLM-OVERCONF-001",
            "claim_text": "Neural network water allocation is 100% infallible in all regional topographies.",
            "confidence_score": 0.92,
            "evidence_confidence": 0.10,
            "status": "ACTIVE",
            "evidence_notes": "Pure model speculation",
        }
    ])

    eval_res = await orchestrator.evaluate(session_id=session_id)

    # Overconfidence risk must be triggered
    assert eval_res.epistemic_health.overconfidence_risk is True
    assert eval_res.epistemic_health.overconfidence_details is not None
    assert "Constitutional Article II" in eval_res.epistemic_health.overconfidence_details

    # An URGENT CHALLENGE_ASSUMPTION action must be emitted and block stage progression
    challenge_actions = [
        a for a in eval_res.recommended_actions
        if a.action_type == ActionType.CHALLENGE_ASSUMPTION
    ]
    assert len(challenge_actions) > 0
    top_challenge = challenge_actions[0]
    assert top_challenge.priority == ActionPriority.URGENT
    assert top_challenge.blocking_stage_progression is True


@pytest.mark.asyncio
async def test_action_dispatch_lifecycle_and_audit_trail(
    storage: SQLiteStorageAdapter, orchestrator: ResearchOrchestrator
):
    """Verify action dispatch executes safely and creates immutable audit events."""
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    storage.save_session(
        session_id,
        {"project_name": "Action Dispatch Session", "framework_id": "INNOVATION"},
    )

    # 1. Dispatch ACQUIRE_EVIDENCE
    dispatch_req1 = OrchestrationActionDispatchRequest(
        session_id=session_id,
        action_type=ActionType.ACQUIRE_EVIDENCE,
        target_engine="scholarly_retrieval",
        parameters={"query": "coastal erosion Panay"},
    )
    res1 = await orchestrator.dispatch_action(dispatch_req1)
    assert res1.status == "SUCCESS"
    assert res1.event_id.startswith("ORCH-EVT-")
    assert "scholarly works" in res1.execution_summary.lower()

    # 2. Dispatch CHALLENGE_ASSUMPTION
    dispatch_req2 = OrchestrationActionDispatchRequest(
        session_id=session_id,
        action_type=ActionType.CHALLENGE_ASSUMPTION,
        target_engine="devils_advocate",
        parameters={"claim_text": "All mangroves survive rising sea levels"},
    )
    res2 = await orchestrator.dispatch_action(dispatch_req2)
    assert res2.status in ("SUCCESS", "DEGRADED")
    assert res2.event_id.startswith("ORCH-EVT-")

    # 3. Dispatch REQUEST_GATE_REVIEW (Article IV Human Sovereignty check)
    dispatch_req3 = OrchestrationActionDispatchRequest(
        session_id=session_id,
        action_type=ActionType.REQUEST_GATE_REVIEW,
        target_engine="human_gatekeeper",
        parameters={"stage_id": "p1_discovery", "notes": "Prepared for gate inspection"},
    )
    res3 = await orchestrator.dispatch_action(dispatch_req3)
    assert res3.status == "SUCCESS"
    assert "human sign-off" in res3.execution_summary.lower()

    # Verify persistent audit trail via storage adapter
    events = storage.get_orchestration_events(session_id=session_id, limit=10)
    assert len(events) == 3
    event_types = [e["event_type"] for e in events]
    assert "ACTION_DISPATCHED" in event_types
    # Payloads must be properly deserialized
    assert isinstance(events[0]["payload"], dict)


@pytest.mark.asyncio
async def test_deterministic_action_ranking(
    storage: SQLiteStorageAdapter, orchestrator: ResearchOrchestrator
):
    """Verify actions are deterministically ranked: URGENT -> HIGH -> MEDIUM -> LOW."""
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    storage.save_session(
        session_id,
        {"project_name": "Ranking Test Session", "framework_id": "INNOVATION"},
    )

    eval_res = await orchestrator.evaluate(session_id=session_id)
    actions = eval_res.recommended_actions
    assert len(actions) > 0

    priority_order = {
        ActionPriority.URGENT: 0,
        ActionPriority.HIGH: 1,
        ActionPriority.MEDIUM: 2,
        ActionPriority.LOW: 3,
    }

    priorities = [priority_order[a.priority] for a in actions]
    assert priorities == sorted(priorities), "Recommended actions are not in strict deterministic priority order"


@pytest.mark.asyncio
async def test_research_methodology_contract_support(
    storage: SQLiteStorageAdapter, orchestrator: ResearchOrchestrator
):
    """Verify Orchestrator functions seamlessly with 6-stage RESEARCH methodology contract."""
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    storage.save_session(
        session_id,
        {"project_name": "Academic Research Session", "framework_id": "RESEARCH"},
    )

    eval_res = await orchestrator.evaluate(session_id=session_id)
    assert eval_res.framework_id == "RESEARCH"
    # Stage 0 of RESEARCH contract is Domain Scouting & Problem Identification
    assert eval_res.stage_status.stage_id == "stage_a_scouting"
    assert "Domain Scouting" in eval_res.stage_status.stage_name


def test_orchestrator_fastapi_endpoints():
    """Verify HTTP API integration for /api/orchestrator routes."""
    client = TestClient(app)

    # 1. 404 on nonexistent session
    resp = client.post("/api/orchestrator/evaluate", json={"session_id": "sess_nonexistent_xyz"})
    assert resp.status_code == 404

    # 2. Evaluate existing session
    # Create session via sessions endpoint
    create_resp = client.post("/api/sessions", json={"name": "API Test Session", "framework_id": "INNOVATION"})
    if create_resp.status_code == 200:
        session_id = create_resp.json().get("session_id") or create_resp.json().get("id")
    else:
        # Fallback to direct storage creation if /api/sessions signature varies
        from storage import get_storage
        storage = get_storage()
        session_id = f"sess_api_{uuid.uuid4().hex[:8]}"
        storage.save_session(session_id, {"project_name": "API Test Session", "framework_id": "INNOVATION"})

    eval_resp = client.post("/api/orchestrator/evaluate", json={"session_id": session_id})
    assert eval_resp.status_code == 200
    data = eval_resp.json()
    assert data["session_id"] == session_id
    assert "stage_status" in data
    assert "epistemic_health"
    assert "recommended_actions" in data

    # 3. Dispatch an action via API
    dispatch_payload = {
        "session_id": session_id,
        "action_type": "ACQUIRE_EVIDENCE",
        "target_engine": "scholarly_retrieval",
        "parameters": {"query": "aquaculture yield"},
    }
    dispatch_resp = client.post("/api/orchestrator/dispatch-action", json=dispatch_payload)
    assert dispatch_resp.status_code == 200
    dispatch_data = dispatch_resp.json()
    assert dispatch_data["status"] == "SUCCESS"
    assert "event_id" in dispatch_data

    # 4. Query events endpoint
    events_resp = client.get(f"/api/orchestrator/session/{session_id}/events")
    assert events_resp.status_code == 200
    events_data = events_resp.json()
    assert events_data["status"] == "success"
    assert events_data["count"] >= 1
    assert len(events_data["events"]) >= 1
