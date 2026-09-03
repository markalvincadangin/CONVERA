"""
CONVERA Quality Gate Evaluation Router
======================================
Endpoints for evaluating, scoring, and signing off on Gates 1 through 4.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from engines.gate_engine import GateEngine

router = APIRouter(prefix="/api/gates", tags=["Quality Gate Reviews"])

class EvaluateGateRequest(BaseModel):
    project_id: str = "default_proj"
    session_id: Optional[str] = None
    gate_id: str = Field(..., description="GATE_1, GATE_2, GATE_3, GATE_4")
    rubric_scores: Dict[str, float] = Field(default_factory=dict)
    checked_criteria_ids: List[str] = Field(default_factory=list)
    reviewer_feedback: Optional[str] = ""
    reviewer_role: str = "RESEARCH_ADVISOR"

@router.post("/evaluate")
async def evaluate_gate(req: EvaluateGateRequest):
    engine = GateEngine()
    try:
        result = engine.evaluate_gate(
            gate_id=req.gate_id,
            rubric_scores=req.rubric_scores,
            checked_criteria_ids=req.checked_criteria_ids,
            reviewer_feedback=req.reviewer_feedback or "",
            reviewer_role=req.reviewer_role,
            project_id=req.project_id,
            session_id=req.session_id
        )
        return {"status": "recorded", "gate_review": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status")
async def get_gate_status(
    gate_id: str = Query(..., description="GATE_1, GATE_2, GATE_3, GATE_4"),
    project_id: str = "default_proj"
):
    engine = GateEngine()
    try:
        return engine.get_gate_status(project_id=project_id, gate_id=gate_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all")
async def list_all_gate_reviews(project_id: str = "default_proj"):
    engine = GateEngine()
    reviews = engine.storage.list_gate_reviews(project_id=project_id)
    return {"project_id": project_id, "gate_reviews": reviews}
