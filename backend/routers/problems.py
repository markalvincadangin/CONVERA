"""
CONVERA Problem Bank Router
===========================
Manages persistent problem claims, scoring, voting, threaded comments, and history.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from storage import get_storage
from engines.evidence_scorer import calculate_score_breakdown
from engines.devils_advocate import challenge_problem_with_agent
from engines.blind_spot_detector import detect_portfolio_blind_spots
from engines.problem_enricher import enrich_manual_problem_input
from engines.problem_parser import parse_phase1_markdown
from engines.research_client import FreeResearchClient
from llm_gateway import generate_response_with_fallback, TaskCategory

router = APIRouter(prefix="/api/problems", tags=["Problem Bank"])
research_router = APIRouter(prefix="/api/research", tags=["Academic & Live Research"])
research_client = FreeResearchClient()


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
    workaround: Optional[str] = None
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


class ChallengeCustomRequest(BaseModel):
    problem_statement: str
    sector: str
    sufferer_occupation: Optional[str] = "Target user"
    quantified_impact: Optional[str] = "Unspecified"
    workaround: Optional[str] = "Manual"


class EnrichProblemRequest(BaseModel):
    raw_note: str
    project_id: Optional[str] = None
    session_id: Optional[str] = None


class ReindexRequest(BaseModel):
    project_id: Optional[str] = None


class MergeProblemsRequest(BaseModel):
    primary_id: str
    duplicate_ids: List[str]


class BulkDeleteProblemsRequest(BaseModel):
    problem_ids: List[str]


class ParsePhase1Request(BaseModel):
    markdown: str
    session_id: Optional[str] = None
    project_id: Optional[str] = None


class ResearchQueryRequest(BaseModel):
    query: str
    engine: Optional[str] = "ALL"
    limit: Optional[int] = 5


class GenerateAssumptionsRequest(BaseModel):
    mode: Optional[str] = "COMMERCIAL"


class UpdateClaimRequest(BaseModel):
    status: str
    confidence_score: Optional[float] = None
    evidence_notes: Optional[str] = None


class UpdateAssumptionRequest(BaseModel):
    status: str


class ArchiveProblemRequest(BaseModel):
    reason: str
    author: Optional[str] = "Founder"


class AttachSourcesRequest(BaseModel):
    sources: List[Dict[str, Any]]


# ----------------------------------------------------------------------
# Problem Bank Core Endpoints
# ----------------------------------------------------------------------

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


@router.post("/blind-spots")
async def detect_blind_spots_endpoint(project_id: Optional[str] = None):
    """Analyze entire portfolio in Problem Bank for sector gaps and cognitive biases."""
    storage = get_storage()
    problems = storage.list_problems(project_id=project_id, limit=300)
    try:
        analysis = await detect_portfolio_blind_spots(problems)
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blind Spot detection failed: {str(e)}")


@router.post("/enrich")
async def enrich_manual_note(req: EnrichProblemRequest):
    """Takes free-form field notes and returns a structured, rubric-validated problem record."""
    if not req.raw_note or not req.raw_note.strip():
        raise HTTPException(status_code=400, detail="Raw note text cannot be empty.")
    try:
        enriched = await enrich_manual_problem_input(
            raw_note=req.raw_note,
            project_id=req.project_id,
            session_id=req.session_id
        )
        return {"status": "success", "problem": enriched}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI enrichment failed: {str(e)}")


@router.get("/detect-duplicates")
async def detect_duplicates_endpoint(project_id: Optional[str] = None):
    """Analyze database for duplicate or overlapping problem ideas."""
    storage = get_storage()
    duplicates = storage.find_duplicates(project_id=project_id, threshold=0.55)
    return {"status": "success", "duplicates": duplicates}


@router.post("/auto-merge-exact")
async def auto_merge_exact_endpoint(req: ReindexRequest):
    """Automatically consolidate 90%+ and 100% exact duplicate problem records."""
    storage = get_storage()
    merged_count = storage.auto_merge_exact_duplicates(project_id=req.project_id)
    updated = storage.normalize_problem_ids(project_id=req.project_id)
    return {"status": "success", "merged_count": merged_count, "problems": updated}


@router.post("/reindex-ids")
async def reindex_problem_ids(req: ReindexRequest):
    """Re-index all problem IDs into canonical, sequential sector codes (AGR-001, HLT-001, etc.)."""
    storage = get_storage()
    updated_problems = storage.normalize_problem_ids(project_id=req.project_id)
    return {"status": "success", "count": len(updated_problems), "problems": updated_problems}


@router.post("/merge")
async def merge_problems_endpoint(req: MergeProblemsRequest):
    """Merge duplicate problems into a single primary record, combining citations and votes."""
    storage = get_storage()
    merged = storage.merge_problems(req.primary_id, req.duplicate_ids)
    if not merged:
        raise HTTPException(status_code=404, detail=f"Primary problem '{req.primary_id}' not found.")
    return {"status": "success", "problem": merged}


@router.post("/bulk-delete")
async def bulk_delete_endpoint(req: BulkDeleteProblemsRequest):
    """Bulk delete multiple problem records."""
    storage = get_storage()
    deleted_count = storage.bulk_delete_problems(req.problem_ids)
    return {"status": "success", "deleted_count": deleted_count}


@router.post("/parse-phase1")
async def parse_phase1_output(req: ParsePhase1Request):
    """Parse Phase 1 markdown output and automatically store records in Problem Bank."""
    storage = get_storage()
    parsed = parse_phase1_markdown(
        markdown=req.markdown,
        session_id=req.session_id,
        project_id=req.project_id
    )
    if parsed:
        upsert_res = storage.bulk_upsert_problems(parsed)
        return {
            "status": "success",
            "count": upsert_res["total_count"],
            "new_created_count": upsert_res["new_created_count"],
            "merged_count": upsert_res["merged_count"],
            "created_ids": upsert_res["created_ids"],
            "merged_ids": upsert_res["merged_ids"],
            "problems": upsert_res["problems"]
        }
    return {"status": "success", "count": 0, "new_created_count": 0, "merged_count": 0, "problems": []}


@router.post("/challenge-custom")
async def challenge_custom_problem(req: ChallengeCustomRequest):
    """Challenge custom uncommitted problem statement with Devil's Advocate."""
    try:
        mock_prob = {
            "problem_statement": req.problem_statement,
            "sector": req.sector,
            "sufferer_occupation": req.sufferer_occupation,
            "quantified_impact": req.quantified_impact,
            "workaround": req.workaround,
            "sources": []
        }
        critique = await challenge_problem_with_agent(mock_prob)
        return {"status": "success", "critique": critique}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Devil's Advocate challenge failed: {str(e)}")


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


@router.post("/{problem_id}/challenge")
async def challenge_problem_endpoint(problem_id: str):
    """Subject a problem record to Devil's Advocate Socratic interrogation."""
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")
    try:
        critique = await challenge_problem_with_agent(problem)
        storage.update_problem(problem_id, {"devils_advocate_data": critique})
        return {"status": "success", "critique": critique}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Devil's Advocate challenge failed: {str(e)}")


@router.post("/{problem_id}/auto-research")
async def auto_research_problem_endpoint(problem_id: str):
    """Auto-fetch empirical peer-reviewed papers and regional news matching a specific problem."""
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    research_data = await research_client.auto_research_problem(problem)
    return {
        "status": "success",
        "problem_id": problem_id,
        "results": research_data,
    }


@router.get("/{problem_id}/knowledge-graph")
async def get_knowledge_graph_endpoint(problem_id: str):
    """Retrieve relational knowledge graph (claims, assumptions, alternatives, sources)."""
    storage = get_storage()
    kg = storage.get_problem_knowledge_graph(problem_id)
    if not kg or not kg.get("problem"):
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"status": "success", "knowledge_graph": kg}


@router.post("/{problem_id}/generate-assumptions")
async def generate_assumptions_endpoint(problem_id: str, req: GenerateAssumptionsRequest):
    """Generate and persist structured claims, prioritized assumptions, and alternatives."""
    from engines.assumption_engine import extract_claims_and_assumptions
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    mode = req.mode or "COMMERCIAL"
    extracted = await extract_claims_and_assumptions(problem, mode=mode)

    if extracted.get("claims"):
        storage.set_problem_claims(problem_id, extracted["claims"])
    if extracted.get("assumptions"):
        storage.set_problem_assumptions(problem_id, extracted["assumptions"])
    if extracted.get("alternatives"):
        storage.set_problem_alternatives(problem_id, extracted["alternatives"])

    updated_kg = storage.get_problem_knowledge_graph(problem_id)
    return {"status": "success", "knowledge_graph": updated_kg}


@router.patch("/{problem_id}/claims/{claim_id}")
async def update_claim_endpoint(problem_id: str, claim_id: str, req: UpdateClaimRequest):
    """Update claim validation status and confidence score."""
    storage = get_storage()
    updated = storage.update_claim_status(claim_id, req.status, req.confidence_score, req.evidence_notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"status": "success", "claim": updated}


@router.patch("/{problem_id}/assumptions/{assumption_id}")
async def update_assumption_endpoint(problem_id: str, assumption_id: str, req: UpdateAssumptionRequest):
    """Update assumption testing status."""
    storage = get_storage()
    updated = storage.update_assumption_status(assumption_id, req.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Assumption not found")
    return {"status": "success", "assumption": updated}


@router.post("/{problem_id}/archive")
async def archive_problem_endpoint(problem_id: str, req: ArchiveProblemRequest):
    """Archive a problem into the Decision Graveyard with a recorded rejection rationale."""
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    rejection_note = f"[ARCHIVED by {req.author} on {datetime.now().strftime('%Y-%m-%d %H:%M')}]: {req.reason.strip()}"
    existing_notes = problem.get("notes") or ""
    updated_notes = f"{rejection_note}\n\n{existing_notes}".strip()

    updated = storage.update_problem(problem_id, {
        "status": "archived",
        "notes": updated_notes,
    })

    return {
        "status": "success",
        "problem_id": problem_id,
        "message": "Problem moved to Decision Graveyard.",
        "problem": updated,
    }


@router.post("/{problem_id}/restore")
async def restore_problem_endpoint(problem_id: str):
    """Restore an archived problem back to active status in the Problem Bank."""
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    updated = storage.update_problem(problem_id, {
        "status": "discovered",
    })

    return {
        "status": "success",
        "problem_id": problem_id,
        "message": "Problem restored to active bank.",
        "problem": updated,
    }


@router.post("/{problem_id}/attach-sources")
async def attach_sources_endpoint(problem_id: str, req: AttachSourcesRequest):
    """Attach selected verified citations to a problem in SQLite and recalculate rubric score."""
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    existing_sources = problem.get("sources") or []
    merged_sources = list(existing_sources)
    existing_urls = {str(s.get("source_url", "")).strip().lower() for s in existing_sources if s.get("source_url")}
    existing_names = {str(s.get("source_name", "")).strip().lower() for s in existing_sources}

    added_count = 0
    for new_src in req.sources:
        url_key = str(new_src.get("source_url", "")).strip().lower()
        name_key = str(new_src.get("source_name", "")).strip().lower()
        if (url_key and url_key not in existing_urls) or (name_key not in existing_names):
            merged_sources.append(new_src)
            if url_key:
                existing_urls.add(url_key)
            existing_names.add(name_key)
            added_count += 1

    updated = storage.update_problem(problem_id, {"sources": merged_sources})
    breakdown = calculate_score_breakdown(updated or problem, merged_sources)

    return {
        "status": "success",
        "problem_id": problem_id,
        "added_count": added_count,
        "total_sources_count": len(merged_sources),
        "problem": updated,
        "breakdown": breakdown,
    }


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


# ----------------------------------------------------------------------
# Research Router Endpoints
# ----------------------------------------------------------------------

@research_router.post("/query")
async def query_research(req: ResearchQueryRequest):
    """Search OpenAlex, Europe PMC, or Regional News for academic literature and live articles."""
    engine = (req.engine or "ALL").upper()
    limit = req.limit or 5

    if engine == "OPENALEX":
        results = await research_client.search_academic_openalex(req.query, limit=limit)
        return {"status": "success", "engine": "OPENALEX", "count": len(results), "results": results}
    elif engine == "EUROPE_PMC":
        results = await research_client.search_europe_pmc(req.query, limit=limit)
        return {"status": "success", "engine": "EUROPE_PMC", "count": len(results), "results": results}
    elif engine == "REGIONAL_NEWS":
        results = await research_client.search_regional_news(req.query, limit=limit)
        return {"status": "success", "engine": "REGIONAL_NEWS", "count": len(results), "results": results}
    else:
        openalex = await research_client.search_academic_openalex(req.query, limit=limit)
        europe_pmc = await research_client.search_europe_pmc(req.query, limit=limit)
        news = await research_client.search_regional_news(req.query, limit=limit)
        return {
            "status": "success",
            "engine": "ALL",
            "openalex": openalex,
            "europe_pmc": europe_pmc,
            "regional_news": news,
            "all_combined": openalex + europe_pmc + news,
        }
