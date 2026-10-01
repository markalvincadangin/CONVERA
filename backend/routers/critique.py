"""
FastAPI Router for Cross-Stage Research Critique & Blind-Spot Engine (SDD-019)
Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query

from engines.cross_stage_critique_engine import CrossStageCritiqueEngine
from models.critique import (
    CritiqueEvaluationRequest,
    CritiqueEvaluationResponse,
    ResolveCritiqueRequest,
    CrossStageCritiqueRecord,
)
from storage.factory import get_storage

router = APIRouter(prefix="/api/critique", tags=["Cross-Stage Research Critique"])


@router.post("/evaluate")
async def evaluate_critique_endpoint(req: CritiqueEvaluationRequest) -> Dict[str, Any]:
    """
    Executes cross-stage critique evaluation across Stages A, C, D, E, F.
    Computes deterministic consistency score and surfaces blind spots.
    """
    storage = get_storage()
    engine = CrossStageCritiqueEngine(storage=storage)
    try:
        response: CritiqueEvaluationResponse = await engine.evaluate_critique(req)
        return {"status": "success", "evaluation": response.model_dump()}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Cross-stage critique evaluation failed: {str(e)}"
        )


@router.get("/session/{session_id}")
async def get_session_critiques_endpoint(
    session_id: str,
    project_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
) -> Dict[str, Any]:
    """
    Retrieves all persisted cross-stage critique records for a session
    and calculates current epistemic consistency metrics.
    """
    storage = get_storage()
    engine = CrossStageCritiqueEngine(storage=storage)
    raw_records = storage.list_critique_records(
        session_id=session_id, project_id=project_id, status=status
    )
    critique_models = [CrossStageCritiqueRecord(**r) for r in raw_records]
    scores = engine.calculate_consistency_score(critique_models)

    return {
        "status": "success",
        "session_id": session_id,
        "consistency_score": scores["consistency_score"],
        "total_critiques": scores["total_critiques"],
        "open_critiques": scores["open_critiques"],
        "fatal_count": scores["fatal_count"],
        "critical_count": scores["critical_count"],
        "warning_count": scores["warning_count"],
        "advisory_count": scores["advisory_count"],
        "critiques": [c.model_dump() for c in critique_models],
    }


@router.post("/resolve")
async def resolve_critique_endpoint(req: ResolveCritiqueRequest) -> Dict[str, Any]:
    """
    Resolves or dismisses a critique record with mandatory human rationale (Article IV).
    """
    storage = get_storage()
    engine = CrossStageCritiqueEngine(storage=storage)
    try:
        updated = engine.resolve_critique(req)
        return {"status": "success", "critique": updated.model_dump()}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Critique status update failed: {str(e)}"
        )
