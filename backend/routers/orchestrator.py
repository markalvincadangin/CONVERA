"""
CONVERA Research Orchestrator Engine Router (SDD-013)
=====================================================
Exposes REST endpoints for unified research orchestration:
- POST /api/orchestrator/evaluate: Full stage & epistemic health evaluation with ranked next actions.
- POST /api/orchestrator/dispatch-action: Human-sovereign execution of recommended orchestration actions.
- GET /api/orchestrator/session/{session_id}/events: Complete audit trail of orchestration events.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from storage.factory import get_storage
from services.research_orchestrator import ResearchOrchestrator
from models.orchestrator import (
    OrchestrationEvaluationResult,
    OrchestrationActionDispatchRequest,
    OrchestrationActionDispatchResult,
)

router = APIRouter(prefix="/api/orchestrator", tags=["Research Orchestrator Engine"])


class EvaluateSessionRequest(BaseModel):
    session_id: str = Field(..., description="Target research session identifier")
    problem_id: Optional[str] = Field(None, description="Optional active problem identifier override")


@router.post(
    "/evaluate",
    response_model=OrchestrationEvaluationResult,
    status_code=status.HTTP_200_OK,
    summary="Evaluate session research status & generate recommendations",
)
async def evaluate_orchestration(request: EvaluateSessionRequest) -> OrchestrationEvaluationResult:
    """
    Evaluates current stage prerequisites, epistemic health balance,
    blind spot critiques, and generates deterministically ranked recommended actions.
    """
    storage = get_storage()
    orchestrator = ResearchOrchestrator(storage=storage)
    try:
        result = await orchestrator.evaluate(
            session_id=request.session_id,
            problem_id=request.problem_id,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Orchestration evaluation failure: {str(e)}",
        )


@router.post(
    "/dispatch-action",
    response_model=OrchestrationActionDispatchResult,
    status_code=status.HTTP_200_OK,
    summary="Dispatch a recommended orchestration action",
)
async def dispatch_orchestration_action(
    request: OrchestrationActionDispatchRequest,
) -> OrchestrationActionDispatchResult:
    """
    Executes a recommended action under human direction and persists
    an auditable orchestration event to the database.
    """
    storage = get_storage()
    orchestrator = ResearchOrchestrator(storage=storage)
    try:
        result = await orchestrator.dispatch_action(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Action dispatch failure: {str(e)}",
        )


@router.get(
    "/session/{session_id}/events",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Retrieve orchestration audit events for a session",
)
async def get_session_orchestration_events(
    session_id: str,
    limit: int = Query(50, ge=1, le=200, description="Maximum events to return"),
) -> Dict[str, Any]:
    """
    Retrieves chronological orchestration events for the given session.
    """
    storage = get_storage()
    events = storage.get_orchestration_events(session_id=session_id, limit=limit)
    return {
        "status": "success",
        "session_id": session_id,
        "count": len(events),
        "events": events,
    }
