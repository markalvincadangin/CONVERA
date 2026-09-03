"""
CONVERA Pipeline & Analysis Router
==================================
Handles phase LLM execution, Devil's Advocate challenges, blind spot detection,
and automated academic background research.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from engines.devils_advocate import challenge_problem_with_agent
from engines.blind_spot_detector import detect_portfolio_blind_spots
from engines.research_client import FreeResearchClient
from storage import get_storage
from llm_gateway import generate_response_with_fallback, TaskCategory

router = APIRouter(tags=["Pipeline & Quality Boosters"])


class RunPhaseRequest(BaseModel):
    phase_number: int
    user_inputs: Dict[str, Any]
    session_id: Optional[str] = None


class ChallengeProblemRequest(BaseModel):
    problem: Dict[str, Any]
    intensity: Optional[str] = "moderate"


class BlindSpotRequest(BaseModel):
    problems: List[Dict[str, Any]]


class AutoResearchRequest(BaseModel):
    problem_statement: str
    sector: Optional[str] = None


@router.post("/api/challenge-problem")
async def api_challenge_problem(req: ChallengeProblemRequest):
    """Challenge a problem statement using the Mom Test Devil's Advocate engine."""
    result = await challenge_problem_with_agent(req.problem, req.intensity or "moderate")
    return result


@router.post("/api/detect-blind-spots")
async def api_detect_blind_spots(req: BlindSpotRequest):
    """Detect portfolio blind spots and ungrounded assumptions across problems."""
    result = await detect_portfolio_blind_spots(req.problems)
    return result


@router.post("/api/auto-research-problem")
async def api_auto_research(req: AutoResearchRequest):
    """Find academic papers and background literature for a problem statement."""
    client = FreeResearchClient()
    papers = await client.auto_research_problem({"problem_statement": req.problem_statement, "sector": req.sector or "Technology"})
    return {"papers": papers}


@router.post("/api/run-phase")
async def api_run_phase(req: RunPhaseRequest):
    """Execute pipeline phase with structured prompt generation and LLM validation."""
    from prompts import (
        PHASE1_SYSTEM, PHASE1_USER,
        PHASE2_SYSTEM, PHASE2_USER,
        PHASE3_SYSTEM, PHASE3_USER,
        PHASE4_SYSTEM, PHASE4_USER,
        PHASE5_SYSTEM, PHASE5_USER
    )
    
    phase_prompts = {
        1: (PHASE1_SYSTEM, PHASE1_USER, TaskCategory.STRUCTURED_EXTRACTION),
        2: (PHASE2_SYSTEM, PHASE2_USER, TaskCategory.DECISION_JUDGE),
        3: (PHASE3_SYSTEM, PHASE3_USER, TaskCategory.CRITICAL_REASONING),
        4: (PHASE4_SYSTEM, PHASE4_USER, TaskCategory.STRUCTURED_EXTRACTION),
        5: (PHASE5_SYSTEM, PHASE5_USER, TaskCategory.BALANCED_SYNTHESIS),
    }
    
    if req.phase_number not in phase_prompts:
        raise HTTPException(status_code=400, detail=f"Invalid phase number {req.phase_number}")
    
    sys_prompt, user_tmpl, category = phase_prompts[req.phase_number]
    
    # Format user prompt with inputs
    try:
        user_prompt = user_tmpl.format(**req.user_inputs)
    except Exception:
        # Fallback to string representation if formatting fails
        formatted_inputs = "\n".join([f"{k}: {v}" for k, v in req.user_inputs.items()])
        user_prompt = f"Inputs:\n{formatted_inputs}"
    
    response = await generate_response_with_fallback(
        system_instruction=sys_prompt,
        prompt=user_prompt,
        task_category=category
    )
    
    return {
        "phase_number": req.phase_number,
        "raw_response": response,
        "status": "success"
    }
