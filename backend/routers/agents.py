"""
CONVERA Specialized Intelligence Agents Router (Phase 5)
=========================================================
Exposes autonomous Research, Socratic Critic, and Citation Verifier agents.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from agents.research_agent import execute_research_agent
from agents.critic_agent import execute_critic_agent
from agents.verifier_agent import execute_verifier_agent

router = APIRouter(prefix="/api/agents", tags=["Specialized Agents"])


class ResearchAgentRequest(BaseModel):
    query: str
    sector: Optional[str] = None
    location: Optional[str] = None
    limit_per_source: Optional[int] = 3
    connector_ids: Optional[List[str]] = None


class CriticAgentRequest(BaseModel):
    problem_statement: str
    sector: Optional[str] = None
    target_user: Optional[str] = None
    current_workaround: Optional[str] = None
    quantified_impact: Optional[str] = None


class VerifierAgentRequest(BaseModel):
    claim_text: str
    doi: Optional[str] = None
    source_name: Optional[str] = None
    supporting_quote: Optional[str] = None
    context_text: Optional[str] = None


@router.post("/research")
async def api_agent_research(req: ResearchAgentRequest):
    """Execute autonomous Research Intelligence Agent across scholarly connectors."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    report = await execute_research_agent(
        query=req.query.strip(),
        sector=req.sector,
        location=req.location,
        limit_per_source=req.limit_per_source or 3,
        connector_ids=req.connector_ids
    )
    return report.model_dump()


@router.post("/critic")
async def api_agent_critic(req: CriticAgentRequest):
    """Execute Socratic Interrogator & Mom Test Devil's Advocate on problem statements."""
    if not req.problem_statement.strip():
        raise HTTPException(status_code=400, detail="Problem statement cannot be empty")
    report = await execute_critic_agent(
        problem_statement=req.problem_statement.strip(),
        sector=req.sector,
        target_user=req.target_user,
        current_workaround=req.current_workaround,
        quantified_impact=req.quantified_impact
    )
    return report.model_dump()


@router.post("/verifier")
async def api_agent_verifier(req: VerifierAgentRequest):
    """Execute Citation Verifier & Contradiction Audit Agent on specific claims."""
    if not req.claim_text.strip():
        raise HTTPException(status_code=400, detail="Claim text cannot be empty")
    report = await execute_verifier_agent(
        claim_text=req.claim_text.strip(),
        doi=req.doi,
        source_name=req.source_name,
        supporting_quote=req.supporting_quote,
        context_text=req.context_text
    )
    return report.model_dump()
