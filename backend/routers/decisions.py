from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from storage.factory import get_storage
from engines.decision_engine import synthesize_decision_room, execute_pivot_loop

router = APIRouter(prefix="/api/decisions", tags=["Decision Room & Pivot Loop"])

class SynthesizeDecisionRoomRequest(BaseModel):
    candidate_ids: List[str]

class CommitDecisionRequest(BaseModel):
    session_id: Optional[str] = None
    stage: str
    selected_problem_id: str
    rejected_problem_ids: List[str] = Field(default_factory=list)
    decision_rationale: str
    supporting_evidence_ids: List[str] = Field(default_factory=list)

class PivotLoopRequest(BaseModel):
    session_id: str
    current_problem_id: str
    pivot_reason: str
    invalidated_assumption_id: Optional[str] = None
    author: Optional[str] = "Founder"

@router.post("/synthesize")
async def synthesize_decision_room_endpoint(req: SynthesizeDecisionRoomRequest):
    """Synthesize multi-candidate decision comparison."""
    storage = get_storage()
    candidates = []
    for pid in req.candidate_ids:
        p = storage.get_problem(pid)
        if p:
            candidates.append(p)

    if not candidates:
        raise HTTPException(status_code=400, detail="No valid candidates found.")

    res = await synthesize_decision_room(candidates)
    return {"status": "success", "synthesis": res}

@router.post("/commit")
async def commit_decision_endpoint(req: CommitDecisionRequest):
    """Log an immutable decision record (Selection / Winner)."""
    storage = get_storage()
    record = storage.create_decision_record({
        "session_id": req.session_id,
        "stage": req.stage,
        "selected_problem_id": req.selected_problem_id,
        "rejected_problem_ids": req.rejected_problem_ids,
        "decision_rationale": req.decision_rationale,
        "supporting_evidence_ids": req.supporting_evidence_ids,
    })
    return {"status": "success", "decision_record": record}

@router.post("/pivot")
async def execute_pivot_endpoint(req: PivotLoopRequest):
    """Execute a structured Pivot Loop back to Phase 2 with recorded history."""
    res = execute_pivot_loop(
        session_id=req.session_id,
        current_problem_id=req.current_problem_id,
        pivot_reason=req.pivot_reason,
        invalidated_assumption_id=req.invalidated_assumption_id,
        author=req.author or "Founder",
    )
    return res

@router.get("")
async def list_decisions_endpoint(session_id: Optional[str] = None):
    """List chronological decision records audit trail."""
    storage = get_storage()
    records = storage.list_decision_records(session_id=session_id)
    return {"status": "success", "decisions": records}
