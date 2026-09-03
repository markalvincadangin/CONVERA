"""
CONVERA Problem Bank Router
===========================
Manages persistent problem claims, scoring, voting, threaded comments, and history.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from storage import get_storage
from engines.evidence_scorer import calculate_score_breakdown
from llm_gateway import generate_response_with_fallback, TaskCategory

router = APIRouter(prefix="/api/problems", tags=["Problem Bank"])


class ProblemCreateRequest(BaseModel):
    id: Optional[str] = None
    sector: str
    sufferer_occupation: str
    sufferer_location: str
    problem_statement: str
    quantified_impact: Optional[str] = "Unquantified"
    current_workaround: Optional[str] = "Manual workaround"
    workaround: Optional[str] = None
    evidence_tier: Optional[str] = "DISCOVERY_SIGNAL"
    confidence_score: Optional[float] = 0.5
    raw_quote: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    project_id: Optional[str] = None
    session_id: Optional[str] = None
    sources: Optional[List[Dict[str, Any]]] = None


class ProblemUpdateRequest(BaseModel):
    problem_statement: Optional[str] = None
    sector: Optional[str] = None
    sufferer_occupation: Optional[str] = None
    sufferer_location: Optional[str] = None
    quantified_impact: Optional[str] = None
    current_workaround: Optional[str] = None
    evidence_tier: Optional[str] = None
    status: Optional[str] = None
    confidence_score: Optional[float] = None
    notes: Optional[str] = None


class ProblemVoteRequest(BaseModel):
    vote: Optional[int] = None
    vote_type: Optional[str] = "up"  # "up" or "down"



class ProblemCommentRequest(BaseModel):
    user_name: str
    user_role: Optional[str] = "contributor"
    user_avatar: Optional[str] = None
    comment: str


@router.get("")
async def list_problems(
    project_id: Optional[str] = None,
    session_id: Optional[str] = None,
    sector: Optional[str] = None,
    status: Optional[str] = None,
    evidence_tier: Optional[str] = None,
    search: Optional[str] = None
):
    """List and filter grounded problems in the Problem Bank."""
    storage = get_storage()
    problems = storage.list_problems(
        project_id=project_id,
        sector=sector,
        evidence_tier=evidence_tier,
        status=status,
        search=search
    )
    return problems


@router.post("")
async def create_problem(req: ProblemCreateRequest):
    """Add a new validated problem to the Problem Bank."""
    storage = get_storage()
    created = storage.add_problem(req.model_dump())
    return {"problem": created}


@router.post("/bulk")
async def bulk_create_problems(problems: List[ProblemCreateRequest]):
    """Bulk ingest a collection of problems."""
    storage = get_storage()
    results = []
    for p in problems:
        created = storage.add_problem(p.model_dump())
        results.append(created)
    return {"count": len(results), "problems": results}


@router.get("/{problem_id}")
async def get_problem(problem_id: str):
    """Retrieve full details of a problem including claims and sources."""
    storage = get_storage()
    prob = storage.get_problem(problem_id)
    if not prob:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")
    return prob


@router.put("/{problem_id}")
async def update_problem(problem_id: str, req: ProblemUpdateRequest):
    """Update problem fields or status."""
    storage = get_storage()
    updated = storage.update_problem(problem_id, req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")
    return {"problem": updated}


@router.delete("/{problem_id}")
async def delete_problem(problem_id: str):
    """Delete a problem record."""
    storage = get_storage()
    success = storage.delete_problem(problem_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")
    return {"deleted": True, "id": problem_id}


@router.post("/{problem_id}/vote")
async def vote_problem(problem_id: str, req: ProblemVoteRequest):
    """Record a team member vote on a problem candidate."""
    storage = get_storage()
    vtype = req.vote_type if req.vote_type else ("up" if (req.vote or 1) > 0 else "down")
    updated = storage.vote_problem(problem_id, vtype)
    return {"status": "success", "problem": updated}


@router.get("/{problem_id}/score-breakdown")
@router.get("/{problem_id}/score")
@router.post("/{problem_id}/score")
async def score_problem(problem_id: str):
    """Calculate 4-dimension objective evidence score breakdown."""
    storage = get_storage()
    prob = storage.get_problem(problem_id)
    if not prob:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")
    
    score_data = calculate_score_breakdown(prob, prob.get("sources", []))
    return score_data


@router.get("/{problem_id}/comments")
async def get_problem_comments(problem_id: str):
    """Get discussion comments for a problem."""
    storage = get_storage()
    comments = storage.list_problem_comments(problem_id)
    return {"problem_id": problem_id, "comments": comments}


@router.post("/{problem_id}/comments")
async def add_problem_comment(problem_id: str, req: ProblemCommentRequest):
    """Add a new comment or mentor signoff note to a problem."""
    storage = get_storage()
    comment = storage.add_problem_comment(
        problem_id=problem_id,
        comment_data=req.model_dump()
    )
    return {"status": "success", "comment": comment}


@router.get("/{problem_id}/history")
async def get_problem_history(problem_id: str):
    """Get audit trail of phase decisions and LLM outputs for a problem."""
    storage = get_storage()
    history = storage.get_problem_history(problem_id)
    return {"problem_id": problem_id, "history": history}
