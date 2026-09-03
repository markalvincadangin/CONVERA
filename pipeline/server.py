from __future__ import annotations

"""
RatchetAI FastAPI Backend Server
Evidence-Ratcheted Problem-to-Solution Multi-Agent Pipeline v3.0
Powered by Universal Multi-Provider LLM Gateway (Gemini, Groq, OpenRouter, Ollama)
Integrated with High-Concurrency SQLite WAL / PostgreSQL Database Engine,
Structured Problem Bank, Devil's Advocate Adversarial Agent & Blind Spot Portfolio Auditor
"""

import os
import sys
import io
import json
import time
import random
import asyncio
import warnings
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Suppress internal genai warnings
warnings.filterwarnings("ignore")
logging.getLogger("google.genai").setLevel(logging.ERROR)
logging.getLogger("google.adk").setLevel(logging.ERROR)

load_dotenv(Path(__file__).parent / ".env")

# Setup storage engine (SQLite WAL default with PostgreSQL cloud fallback)
from storage import get_storage

storage = get_storage()

from main import ALL_SECTORS
from gates import (
    LEVEL_ORDER, LEVEL_LABELS, LEVEL_INSTRUCTIONS,
    get_current_level, get_level_label, get_level_instruction,
    mark_level_complete, all_levels_complete, check_concept_minimum,
    format_concept_shortfall
)
from llm_gateway import generate_response_with_fallback, generate_with_meta
from problem_parser import parse_phase1_markdown
from problem_enricher import enrich_manual_problem_input
from devils_advocate import challenge_problem_with_agent
from blind_spot_detector import detect_portfolio_blind_spots
from evidence_scorer import calculate_score_breakdown
from research_client import FreeResearchClient

from prompts.phase1_system import PHASE1_SYSTEM
from prompts.phase2_system import PHASE2_SYSTEM
from prompts.phase3_system import PHASE3_SYSTEM
from prompts.phase4_system import PHASE4_SYSTEM
from prompts.phase5_system import PHASE5_SYSTEM

app = FastAPI(
    title="RatchetAI Venture Engine API",
    description="Backend API with Universal Multi-Provider LLM Gateway, Structured Problem Bank, Devil's Advocate Agent & Persistent Database Storage",
    version="3.0.0",
)

# Enable CORS for Next.js frontend and LAN access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_sync_problems():
    """Ensure all Phase 1 problem discoveries from stored sessions are synchronized to Problem Bank on boot."""
    try:
        sessions = storage.list_sessions(limit=50)
        for s in sessions:
            sess_id = s["session_id"]
            state = storage.get_session(sess_id)
            if state and state.get("phase1_response"):
                parsed = parse_phase1_markdown(
                    state["phase1_response"],
                    session_id=sess_id,
                    project_id=state.get("project_id")
                )
                if parsed:
                    storage.bulk_upsert_problems(parsed)
        logging.info("[OK] Problem Bank synchronization complete on startup.")
    except Exception as e:
        logging.warning(f"Problem Bank startup sync notice: {e}")



def load_session_state(session_id: str) -> dict:
    storage = get_storage()
    state = storage.get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return state


def save_session_state(session_id: str, state: dict):
    storage = get_storage()
    state["updated_at"] = datetime.now().isoformat()
    storage.save_session(session_id, state)


# ----------------------------------------------------------------------
# Request / Response Models
# ----------------------------------------------------------------------

class CreateSessionRequest(BaseModel):
    session_id: Optional[str] = None
    project_name: Optional[str] = None

class RenameSessionRequest(BaseModel):
    project_name: str

class CreateSnapshotRequest(BaseModel):
    label: str
    phase_number: int = 1

class Phase1DiscoverRequest(BaseModel):
    session_id: str
    sectors: List[str] = Field(default_factory=lambda: ALL_SECTORS)
    field_observations: Optional[str] = None

class Phase1AdditionsRequest(BaseModel):
    session_id: str
    additions: str

class Phase2ScreenRequest(BaseModel):
    session_id: str
    problem_landscape: Optional[str] = None
    selected_problem_ids: Optional[List[str]] = None

class Phase3InitRequest(BaseModel):
    session_id: str
    problem_statement: str
    problem_id: Optional[str] = None

class Phase3TurnRequest(BaseModel):
    session_id: str
    answer: str

class Phase4StepRequest(BaseModel):
    session_id: str
    step: str
    user_input: Optional[str] = None
    concepts: Optional[List[Dict[str, Any]]] = None

class Phase5AuditRequest(BaseModel):
    session_id: str
    concept_label: str
    assumption_tested: str
    test_archetype: str
    cohort: str
    sample_size: int
    actions_count: int
    pass_threshold: Any = "30%"
    fail_threshold: Any = "15%"
    evidence_desc: str

# Problem Bank Models

class ReindexRequest(BaseModel):
    project_id: Optional[str] = None

class MergeProblemsRequest(BaseModel):
    primary_id: str
    duplicate_ids: List[str]

class BulkDeleteProblemsRequest(BaseModel):
    problem_ids: List[str]

class AddProblemRequest(BaseModel):
    id: Optional[str] = None
    project_id: Optional[str] = None
    session_id: Optional[str] = None
    sector: str = "General"
    sufferer_occupation: Optional[str] = ""
    sufferer_location: Optional[str] = ""
    problem_statement: str
    evidence_tier: Optional[str] = "SIGNAL"
    workaround: Optional[str] = ""
    quantified_impact: Optional[str] = ""
    evidence_types: Optional[List[str]] = Field(default_factory=list)
    source: Optional[str] = "manual"
    source_detail: Optional[str] = "Manual Entry"
    tags: Optional[List[str]] = Field(default_factory=list)
    status: Optional[str] = "discovered"
    notes: Optional[str] = ""
    sources: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class UpdateProblemRequest(BaseModel):
    sector: Optional[str] = None
    sufferer_occupation: Optional[str] = None
    sufferer_location: Optional[str] = None
    problem_statement: Optional[str] = None
    evidence_tier: Optional[str] = None
    workaround: Optional[str] = None
    quantified_impact: Optional[str] = None
    evidence_types: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    phase2_verdict: Optional[str] = None
    phase3_verdict: Optional[str] = None
    notes: Optional[str] = None
    votes: Optional[int] = None
    sources: Optional[List[Dict[str, Any]]] = None

class ResearchQueryRequest(BaseModel):
    query: str
    engine: Optional[str] = "ALL"  # OPENALEX, EUROPE_PMC, REGIONAL_NEWS, ALL
    limit: Optional[int] = 5

class UpdateClaimRequest(BaseModel):
    status: str
    confidence_score: Optional[float] = None
    evidence_notes: Optional[str] = None

class UpdateAssumptionRequest(BaseModel):
    status: str

class GenerateAssumptionsRequest(BaseModel):
    mode: Optional[str] = "COMMERCIAL"

class ArchiveProblemRequest(BaseModel):
    reason: str
    author: Optional[str] = "Team Member"

class AttachSourcesRequest(BaseModel):
    sources: List[Dict[str, Any]]

class EnrichProblemRequest(BaseModel):
    raw_note: str
    project_id: Optional[str] = None
    session_id: Optional[str] = None

class ParsePhase1Request(BaseModel):
    markdown: str
    session_id: Optional[str] = None
    project_id: Optional[str] = None

class VoteProblemRequest(BaseModel):
    vote_type: str = "up"  # "up" | "down"

class ChallengeCustomRequest(BaseModel):
    id: Optional[str] = "CUSTOM"
    sector: Optional[str] = "General"
    sufferer_occupation: Optional[str] = "Target Actor"
    sufferer_location: Optional[str] = "Iloilo"
    problem_statement: str
    workaround: Optional[str] = ""
    quantified_impact: Optional[str] = ""
    evidence_tier: Optional[str] = "SIGNAL"


# ----------------------------------------------------------------------
# System & Session Management Endpoints
# ----------------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "sqlite_wal",
        "version": "3.0.0"
    }


@app.get("/api/sessions")
async def list_sessions():
    storage = get_storage()
    return storage.list_sessions()


@app.post("/api/sessions")
async def create_session(req: CreateSessionRequest):
    session_id = req.session_id.strip() if req.session_id else datetime.now().strftime("%Y%m%d_%H%M%S")
    project_name = req.project_name.strip() if req.project_name else "Iloilo Technopreneurship Project"

    initial_state = {
        "session_id": session_id,
        "project_name": project_name,
        "phase1_response": None,
        "phase2_response": None,
        "phase3_problem": None,
        "phase3_history": [],
        "completed_levels": [],
        "phase3_response": None,
        "phase4_concepts": [],
        "phase4_response": None,
        "phase5_response": None,
        "phase1_complete": False,
        "phase2_complete": False,
        "phase3_complete": False,
        "phase4_complete": False,
        "phase5_complete": False,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    save_session_state(session_id, initial_state)
    return {"session_id": session_id, "state": initial_state}


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    return load_session_state(session_id)


@app.post("/api/sessions/{session_id}")
async def update_session(session_id: str, payload: dict):
    state = load_session_state(session_id)
    state.update(payload)
    save_session_state(session_id, state)
    return {"session_id": session_id, "state": state}


@app.put("/api/sessions/{session_id}/rename")
async def rename_session(session_id: str, req: RenameSessionRequest):
    storage = get_storage()
    clean_name = req.project_name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Project name cannot be empty.")
    
    state = load_session_state(session_id)
    state["project_name"] = clean_name
    save_session_state(session_id, state)
    
    # Update SQLite database rows
    proj_id = state.get("project_id") or f"proj_{session_id}"
    with storage._get_connection() as conn:
        conn.execute("UPDATE projects SET name = ? WHERE id = ?", (clean_name, proj_id))
        conn.execute("UPDATE sessions SET project_name = ? WHERE session_id = ?", (clean_name, session_id))

    return {"session_id": session_id, "project_name": clean_name, "status": "success"}


@app.delete("/api/sessions/{session_id}")
async def delete_session_endpoint(session_id: str):
    storage = get_storage()
    success = storage.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return {"session_id": session_id, "status": "deleted"}


@app.get("/api/sessions/{session_id}/snapshots")
async def list_snapshots(session_id: str):
    storage = get_storage()
    return storage.list_snapshots(session_id)


@app.post("/api/sessions/{session_id}/snapshots")
async def create_snapshot(session_id: str, req: CreateSnapshotRequest):
    storage = get_storage()
    return storage.create_snapshot(session_id, req.label, req.phase_number)


@app.post("/api/sessions/{session_id}/snapshots/{snapshot_id}/restore")
async def restore_snapshot(session_id: str, snapshot_id: int):
    storage = get_storage()
    state = storage.restore_snapshot(session_id, snapshot_id)
    if not state:
        raise HTTPException(status_code=404, detail="Snapshot not found.")
    return {"session_id": session_id, "state": state}


@app.get("/api/projects/by-code/{share_code}")
async def get_project_by_share_code(share_code: str):
    storage = get_storage()
    proj = storage.get_project_by_code(share_code)
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project with room code '{share_code}' not found.")
    return proj


@app.get("/api/sessions/{session_id}/export")
async def export_dossier(session_id: str):
    state = load_session_state(session_id)
    pname = state.get("project_name", "Iloilo Venture Project")

    md = [
        f"# {pname} - RatchetAI Venture Dossier",
        f"**Session ID:** `{session_id}`  ",
        f"**Generated:** {datetime.now().strftime('%B %d, %Y - %I:%M %p')}  \n",
        "---",
        "## Phase 1: Problem Landscape Discovery",
        state.get("phase1_response") or "*Not yet completed.*",
        "\n---",
        "## Phase 2: Problem Screening & Shortlisting Matrix",
        state.get("phase2_response") or "*Not yet completed.*",
        "\n---",
        "## Phase 3: Socratic Mom Test Validation Dossier",
        f"**Target Problem:** {state.get('phase3_problem', 'N/A')}\n",
        state.get("phase3_response") or "*Not yet completed.*",
        "\n---",
        "## Phase 4: Solution Ideation & SVB Canvas",
        state.get("phase4_response") or "*Not yet completed.*",
        "\n---",
        "## Phase 5: MVP Empirical Validation Audit",
        state.get("phase5_response") or "*Not yet completed.*",
    ]
    return {"session_id": session_id, "markdown": "\n\n".join(md)}


# ----------------------------------------------------------------------
# Problem Bank Endpoints (Structured Data Layer)
# ----------------------------------------------------------------------

@app.get("/api/problems")
async def list_problems(
    project_id: Optional[str] = None,
    sector: Optional[str] = None,
    evidence_tier: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    storage = get_storage()
    return storage.list_problems(
        project_id=project_id,
        sector=sector,
        evidence_tier=evidence_tier,
        status=status,
        search=search,
        limit=limit,
        offset=offset
    )


@app.post("/api/problems")
async def create_problem(req: AddProblemRequest):
    storage = get_storage()
    data = req.model_dump()
    created = storage.add_problem(data)
    return {"status": "success", "problem": created}


@app.get("/api/problems/{problem_id}")
async def get_problem_detail(problem_id: str):
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found.")
    return problem


@app.put("/api/problems/{problem_id}")
async def update_problem_detail(problem_id: str, req: UpdateProblemRequest):
    storage = get_storage()
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    updated = storage.update_problem(problem_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found.")
    return {"status": "success", "problem": updated}


@app.delete("/api/problems/{problem_id}")
async def delete_problem_item(problem_id: str):
    storage = get_storage()
    success = storage.delete_problem(problem_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found.")
    return {"status": "success", "deleted": True}


@app.post("/api/problems/{problem_id}/vote")
async def vote_problem_item(problem_id: str, req: VoteProblemRequest):
    storage = get_storage()
    updated = storage.vote_problem(problem_id, req.vote_type)
    return {"status": "success", "problem": updated}


@app.get("/api/problems/{problem_id}/score-breakdown")
async def get_problem_score_breakdown(problem_id: str):
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found.")
    breakdown = calculate_score_breakdown(problem, problem.get("sources", []))
    return breakdown


@app.post("/api/problems/{problem_id}/challenge")
async def challenge_problem_endpoint(problem_id: str):
    """Devil's Advocate Adversarial Challenge: attacks assumptions, identifies gaps and kill questions."""
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found.")

    try:
        critique = await challenge_problem_with_agent(problem)
        # Store critique in the problem record
        storage.update_problem(problem_id, {"devils_advocate_data": critique})
        storage.record_problem_history(problem_id, 1, "devils_advocate_challenged", verdict=critique.get("verdict"))
        return {"status": "success", "critique": critique}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Devil's Advocate challenge failed: {str(e)}")


@app.post("/api/problems/challenge-custom")
async def challenge_custom_problem(req: ChallengeCustomRequest):
    """Devil's Advocate on ad-hoc or unpersisted problem statements."""
    try:
        critique = await challenge_problem_with_agent(req.model_dump())
        return {"status": "success", "critique": critique}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Devil's Advocate challenge failed: {str(e)}")


@app.post("/api/problems/blind-spots")
async def detect_blind_spots_endpoint(project_id: Optional[str] = None):
    """Analyze entire portfolio in Problem Bank for sector gaps and cognitive biases."""
    storage = get_storage()
    problems = storage.list_problems(project_id=project_id, limit=300)
    try:
        analysis = await detect_portfolio_blind_spots(problems)
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blind Spot detection failed: {str(e)}")


@app.post("/api/problems/enrich")
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




@app.get("/api/problems/detect-duplicates")
async def detect_duplicates_endpoint(project_id: Optional[str] = None):
    """Analyze database for duplicate or overlapping problem ideas."""
    storage = get_storage()
    duplicates = storage.find_duplicates(project_id=project_id, threshold=0.55)
    return {"status": "success", "duplicates": duplicates}

@app.post("/api/problems/auto-merge-exact")
async def auto_merge_exact_endpoint(req: ReindexRequest):
    """Automatically consolidate 90%+ and 100% exact duplicate problem records."""
    storage = get_storage()
    merged_count = storage.auto_merge_exact_duplicates(project_id=req.project_id)
    # Reindex sequentially
    updated = storage.normalize_problem_ids(project_id=req.project_id)
    return {"status": "success", "merged_count": merged_count, "problems": updated}

@app.post("/api/problems/reindex-ids")
async def reindex_problem_ids(req: ReindexRequest):
    """Re-index all problem IDs into canonical, sequential sector codes (AGR-001, HLT-001, etc.)."""
    storage = get_storage()
    updated_problems = storage.normalize_problem_ids(project_id=req.project_id)
    return {"status": "success", "count": len(updated_problems), "problems": updated_problems}

@app.post("/api/problems/merge")
async def merge_problems_endpoint(req: MergeProblemsRequest):
    """Merge duplicate problems into a single primary record, combining citations and votes."""
    storage = get_storage()
    merged = storage.merge_problems(req.primary_id, req.duplicate_ids)
    if not merged:
        raise HTTPException(status_code=404, detail=f"Primary problem '{req.primary_id}' not found.")
    return {"status": "success", "problem": merged}

@app.post("/api/problems/bulk-delete")
async def bulk_delete_endpoint(req: BulkDeleteProblemsRequest):
    """Bulk delete multiple problem records."""
    storage = get_storage()
    deleted_count = storage.bulk_delete_problems(req.problem_ids)
    return {"status": "success", "deleted_count": deleted_count}

@app.post("/api/problems/parse-phase1")
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


# ----------------------------------------------------------------------
# Academic & Web Research Endpoints
# ----------------------------------------------------------------------

research_client = FreeResearchClient()

@app.post("/api/research/query")
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
        # All engines in parallel
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

@app.post("/api/problems/{problem_id}/auto-research")
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

@app.get("/api/problems/{problem_id}/knowledge-graph")
async def get_knowledge_graph_endpoint(problem_id: str):
    """Retrieve relational knowledge graph (claims, assumptions, alternatives, sources)."""
    storage = get_storage()
    kg = storage.get_problem_knowledge_graph(problem_id)
    if not kg or not kg.get("problem"):
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"status": "success", "knowledge_graph": kg}

@app.post("/api/problems/{problem_id}/generate-assumptions")
async def generate_assumptions_endpoint(problem_id: str, req: GenerateAssumptionsRequest):
    """Generate and persist structured claims, prioritized assumptions, and alternatives."""
    from assumption_engine import extract_claims_and_assumptions
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

@app.patch("/api/problems/{problem_id}/claims/{claim_id}")
async def update_claim_endpoint(problem_id: str, claim_id: str, req: UpdateClaimRequest):
    """Update claim validation status and confidence score."""
    storage = get_storage()
    updated = storage.update_claim_status(claim_id, req.status, req.confidence_score, req.evidence_notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"status": "success", "claim": updated}

@app.patch("/api/problems/{problem_id}/assumptions/{assumption_id}")
async def update_assumption_endpoint(problem_id: str, assumption_id: str, req: UpdateAssumptionRequest):
    """Update assumption testing status."""
    storage = get_storage()
    updated = storage.update_assumption_status(assumption_id, req.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Assumption not found")
    return {"status": "success", "assumption": updated}

@app.post("/api/problems/{problem_id}/archive")
async def archive_problem_endpoint(problem_id: str, req: ArchiveProblemRequest):
    """Archive a problem into the Decision Graveyard with a recorded rejection rationale."""
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    rejection_note = f"[ARCHIVED by {req.author} on {datetime.now().strftime('%Y-%m-%d %H:%M')}]: {req.reason.strip()}"
    existing_notes = problem.get("notes") or ""
    updated_notes = f"{rejection_note}

{existing_notes}".strip()

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

@app.post("/api/problems/{problem_id}/restore")
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

@app.post("/api/problems/{problem_id}/attach-sources")
async def attach_sources_endpoint(problem_id: str, req: AttachSourcesRequest):
    """Attach selected verified citations to a problem in SQLite and recalculate rubric score."""
    storage = get_storage()
    problem = storage.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    existing_sources = problem.get("sources") or []
    # Deduplicate incoming sources by URL or name
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

    # Update in SQLite
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

# ----------------------------------------------------------------------
# Phase 1 Endpoints (Problem Discovery)
# ----------------------------------------------------------------------

@app.post("/api/phases/1/discover")
async def phase1_discover(req: Phase1DiscoverRequest):
    state = load_session_state(req.session_id)
    storage = get_storage()

    sectors_str = ", ".join(req.sectors) if req.sectors else ", ".join(ALL_SECTORS)
    prompt = (
        f"Execute Phase 1 Startup Problem Discovery for the following sectors in the Western Visayas (Iloilo/Panay) region:\n"
        f"TARGET SECTORS: {sectors_str}\n\n"
    )
    if req.field_observations:
        prompt += f"PRIMARY FIELD OBSERVATIONS & FIRSTHAND TEAM DATA:\n{req.field_observations}\n\n"

    prompt += (
        "Output the complete Problem Landscape Table with the 8 standard columns. "
        "Eliminate solutions-in-disguise and ensure every problem has a quantified sufferer and current workaround."
    )

    try:
        response, meta = await generate_with_meta(
            system_instruction=PHASE1_SYSTEM,
            prompt=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    # Auto-parse and save to Problem Bank
    parsed_count = 0
    try:
        parsed = parse_phase1_markdown(
            markdown=response,
            session_id=req.session_id,
            project_id=state.get("project_id")
        )
        if parsed:
            upsert_res = storage.bulk_upsert_problems(parsed)
            parsed_count = upsert_res["total_count"]
            state["phase1_ingestion_summary"] = {
                "total_count": upsert_res["total_count"],
                "new_created_count": upsert_res["new_created_count"],
                "merged_count": upsert_res["merged_count"],
                "created_ids": upsert_res["created_ids"],
                "merged_ids": upsert_res["merged_ids"],
            }
    except Exception as err:
        print(f"[!] Warning: Auto-parsing Phase 1 problems failed: {err}")

    state["phase1_response"] = response
    state["phase1_model_meta"] = meta
    state["phase1_complete"] = True
    save_session_state(req.session_id, state)
    return {
        "state": state,
        "response": response,
        "model_meta": meta,
        "problem_bank_count": parsed_count
    }


@app.post("/api/phases/1/additions")
async def phase1_additions(req: Phase1AdditionsRequest):
    state = load_session_state(req.session_id)
    storage = get_storage()
    current_p1 = state.get("phase1_response", "")

    prompt = (
        f"CURRENT PROBLEM LANDSCAPE:\n{current_p1}\n\n"
        f"USER FIELD CORRECTIONS & NEW PRIMARY OBSERVATIONS:\n{req.additions}\n\n"
        "Integrate these corrections into the existing landscape. Return the updated Problem Landscape Table."
    )

    try:
        response = await generate_response_with_fallback(
            system_instruction=PHASE1_SYSTEM,
            prompt=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    try:
        parsed = parse_phase1_markdown(
            markdown=response,
            session_id=req.session_id,
            project_id=state.get("project_id")
        )
        if parsed:
            storage.bulk_upsert_problems(parsed)
    except Exception as err:
        print(f"[!] Warning: Auto-parsing Phase 1 additions failed: {err}")

    state["phase1_response"] = response
    state["phase1_complete"] = True
    save_session_state(req.session_id, state)
    return {"state": state, "response": response}


# ----------------------------------------------------------------------
# Phase 2 Endpoints (Problem Screening)
# ----------------------------------------------------------------------

@app.post("/api/phases/2/screen")
async def phase2_screen(req: Phase2ScreenRequest):
    state = load_session_state(req.session_id)
    storage = get_storage()

    # If specific problems were selected from the bank, build targeted screening context
    if req.selected_problem_ids:
        selected_problems = []
        for pid in req.selected_problem_ids:
            prob = storage.get_problem(pid)
            if prob:
                selected_problems.append(prob)
        
        if selected_problems:
            table_lines = [
                "| Problem ID | Sufferer (Occupation + Location) | Problem Statement | Evidence Tier | Workaround | Quantified Impact | Sources |",
                "|---|---|---|---|---|---|---|"
            ]
            for p in selected_problems:
                src_str = "; ".join([s["source_name"] for s in p.get("sources", [])]) or "Manual"
                table_lines.append(
                    f"| {p['id']} | {p['sufferer_occupation']} in {p['sufferer_location']} | {p['problem_statement']} | {p['evidence_tier']} | {p['workaround']} | {p['quantified_impact']} | {src_str} |"
                )
            p1_landscape = "\n".join(table_lines)
        else:
            p1_landscape = req.problem_landscape or state.get("phase1_response", "No landscape provided.")
    else:
        p1_landscape = req.problem_landscape or state.get("phase1_response", "No landscape provided.")

    prompt = (
        f"PHASE 1 DISCOVERED PROBLEM LANDSCAPE FOR SCREENING:\n\n{p1_landscape}\n\n"
        "Screen every problem in the batch across the 5 Core Plausibility Criteria. "
        "Eliminate solutions-in-disguise, enforce revealed sacrifice over opinions, and output the Triage Matrix with Winnability Advisories."
    )

    try:
        response, meta = await generate_with_meta(
            system_instruction=PHASE2_SYSTEM,
            prompt=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    for pid in (req.selected_problem_ids or []):
        if f"{pid}" in response:
            verdict = "ADVANCE" if "ADVANCE" in response else "SECOND_LOOK"
            storage.update_problem(pid, {"phase2_verdict": verdict, "status": "shortlisted"})
            storage.record_problem_history(pid, 2, "screened", verdict, model_used=meta.get("display_name"))

    state["phase2_response"] = response
    state["phase2_model_meta"] = meta
    state["phase2_complete"] = True
    save_session_state(req.session_id, state)
    return {"state": state, "response": response, "model_meta": meta}


# ----------------------------------------------------------------------
# Phase 3 Endpoints (Socratic Problem Validation)
# ----------------------------------------------------------------------

@app.post("/api/phases/3/init")
async def phase3_init(req: Phase3InitRequest):
    state = load_session_state(req.session_id)
    storage = get_storage()
    state["phase3_problem"] = req.problem_statement
    state["completed_levels"] = []
    state["phase3_complete"] = False

    if req.problem_id:
        storage.update_problem(req.problem_id, {"status": "validating"})
        storage.record_problem_history(req.problem_id, 3, "started_validation")

    initial_context = (
        f"TARGET PROBLEM FOR VALIDATION:\n{req.problem_statement}\n\n"
        "Initiate Level-by-Level Socratic Validation. "
        "Start with Level 1: Specific Sufferer. Ask exactly one question for Level 1. Do not stack questions or pitch solutions."
    )

    try:
        agent_response = await generate_response_with_fallback(
            system_instruction=PHASE3_SYSTEM,
            prompt=initial_context,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    state["phase3_history"] = [
        {"role": "user", "content": initial_context},
        {"role": "assistant", "content": agent_response}
    ]
    save_session_state(req.session_id, state)
    return {"state": state, "agent_message": agent_response}


@app.post("/api/phases/3/turn")
async def phase3_turn(req: Phase3TurnRequest):
    state = load_session_state(req.session_id)
    history = state.get("phase3_history", [])
    completed_levels = state.get("completed_levels", [])
    current_level = get_current_level(state)

    prompt = (
        f"STUDENT EVIDENCE RESPONSE (Current Stage: {current_level}):\n"
        f"{req.answer}\n\n"
        "CLINICAL INSTRUCTIONS:\n"
        "1. Evaluate the student answer for evidence rigor (past actions, concrete numbers, specific locations). Reject opinions, pitches, or future hypotheticals.\n"
        "2. If the answer satisfies the current level criteria, include the tag [LEVEL_COMPLETE:<level_name>] and provide the question for the next level.\n"
        "3. If the answer is insufficient, challenge the student with a targeted reframing question to extract real field evidence.\n"
        "4. If Level 6 (Economic Consequence) is completed, output the 2-Dimension Scorecard and final verdict: VALIDATED, REVALIDATE, or REJECT."
    )

    history.append({"role": "user", "content": prompt})

    try:
        agent_response = await generate_response_with_fallback(
            system_instruction=PHASE3_SYSTEM,
            prompt=prompt,
            history=history,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    history.append({"role": "assistant", "content": agent_response})

    for lvl in LEVEL_ORDER:
        tag = f"[LEVEL_COMPLETE:{lvl}]"
        if tag in agent_response and lvl not in completed_levels:
            completed_levels.append(lvl)
            state["completed_levels"] = completed_levels

    if all_levels_complete(state) or "[LEVEL_COMPLETE:economic_consequence]" in agent_response:
        state["phase3_complete"] = True
        state["phase3_response"] = agent_response

    state["phase3_history"] = history
    save_session_state(req.session_id, state)
    return {
        "state": state,
        "agent_message": agent_response,
        "completed_levels": completed_levels,
        "is_complete": state.get("phase3_complete", False)
    }


# ----------------------------------------------------------------------
# Phase 4 Endpoints (Solution Ideation & SVB)
# ----------------------------------------------------------------------

@app.post("/api/phases/4/step")
async def phase4_step(req: Phase4StepRequest):
    state = load_session_state(req.session_id)
    step = req.step
    concepts = req.concepts if req.concepts is not None else state.get("phase4_concepts", [])

    p3_evidence = state.get("phase3_response", state.get("phase3_problem", "Validated Iloilo Problem"))

    prompts_map = {
        "solution_brief": (
            f"PHASE 3 VALIDATED PROBLEM DOSSIER:\n{p3_evidence}\n\n"
            "Generate Step 1: Solution Brief. Synthesize target actor, location, quantified pain, current workaround, and market size into a crisp reference card."
        ),
        "opportunity_question": (
            f"PHASE 3 EVIDENCE:\n{p3_evidence}\n\n"
            "Generate Step 2: Opportunity Question (How might we enable [target actor] in [location] to [solve problem / bypass workaround] without [key friction]?)."
        ),
        "decomposition": (
            f"PHASE 3 EVIDENCE:\n{p3_evidence}\n\n"
            "Generate Step 3: Root-Mechanism Decomposition. Break down the problem into its causal chain: Trigger Event -> Mechanism Types -> Pain Point -> Coping Behavior -> Economic Consequence."
        ),
        "divergent_ideation": (
            f"PHASE 3 EVIDENCE:\n{p3_evidence}\n\n"
            "Generate Step 4: Divergent Concept Generation across the 15 Mechanism Families. Produce at least 5 distinct solution hypotheses spanning 3+ mechanism families."
        ),
        "screening": (
            f"CONCEPTS TO SCREEN:\n{json.dumps(concepts, indent=2)}\n\n"
            "Screen each concept against Criteria 1-6. Produce the Concept Screening Matrix with ADVANCE_TO_HYPOTHESIS, REVISE, or DROP verdicts."
        ),
        "assumptions_svb": (
            f"SCREENED CONCEPTS & PHASE 3 EVIDENCE:\n{json.dumps(concepts, indent=2)}\n\n"
            "Generate Step 6: Assumption Priority Register (P1-P4) and the Simplified Validation Board (SVB Canvas) with actionable Experiment Cards."
        )
    }

    prompt = prompts_map.get(step, "Generate Phase 4 ideation step.")
    if req.user_input and req.user_input.strip():
        prompt += f"\n\n[USER CUSTOM INPUT]:\n{req.user_input.strip()}"

    try:
        response = await generate_response_with_fallback(
            system_instruction=PHASE4_SYSTEM,
            prompt=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    if step in ("assumptions_svb", "screening"):
        state["phase4_complete"] = True
        state["phase4_response"] = response

    state["phase4_concepts"] = concepts
    save_session_state(req.session_id, state)
    return {"state": state, "response": response, "concepts": concepts}


# ----------------------------------------------------------------------
# Phase 5 Endpoints (MVP Validation Audit & Pivot Analysis)
# ----------------------------------------------------------------------

@app.post("/api/phases/5/audit")
async def phase5_audit(req: Phase5AuditRequest):
    state = load_session_state(req.session_id)

    conversion_rate = (req.actions_count / req.sample_size * 100) if req.sample_size > 0 else 0.0

    prompt = (
        "AUDIT EMPIRICAL MVP EXPERIMENT DATA (Phase 5 Build-Measure-Learn):\n\n"
        f"- Concept Tested: {req.concept_label}\n"
        f"- Tested P1 Assumption: {req.assumption_tested}\n"
        f"- Test Archetype: {req.test_archetype}\n"
        f"- Target Participant Cohort: {req.cohort}\n"
        f"- Sample Size Exposed (N): {req.sample_size}\n"
        f"- Concrete Actions Observed: {req.actions_count}\n"
        f"- Calculated Conversion Rate: {conversion_rate:.1f}%\n"
        f"- Pre-set PASS Threshold: {req.pass_threshold}\n"
        f"- Pre-set FAIL Threshold: {req.fail_threshold}\n"
        f"- Observed Evidence Description & Behaviors:\n{req.evidence_desc}\n\n"
        "CLINICAL AUDIT REQUIREMENTS:\n"
        "1. Evaluate conversion rate against the pre-set Pass/Fail thresholds (PASS, FAIL, or INCONCLUSIVE).\n"
        "2. Enforce the Behavioral Commitment Hierarchy (Tiers 1-5). Explicitly classify the highest tier achieved. Discard verbal praise (Tier 5) as zero validation evidence.\n"
        "3. Conduct structured Failure / Pivot Analysis if threshold was not met (Mechanism Pivot, Customer Segment Pivot, or Return to Problem).\n"
        "4. Assign final Phase 5 verdict: PURSUE, PIVOT, or RETIRE_CONCEPT.\n"
        "5. Produce the comprehensive Phase 5 MVP Validation Audit Report."
    )

    try:
        response = await generate_response_with_fallback(
            system_instruction=PHASE5_SYSTEM,
            prompt=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    state["phase5_response"] = response
    state["phase5_complete"] = True
    save_session_state(req.session_id, state)
    return {"state": state, "response": response}

# ----------------------------------------------------------------------
# Automated Deliverables Endpoints (Lean Canvas, SWOT, Pitch Deck)
# ----------------------------------------------------------------------

from deliverables_generator import (
    generate_lean_canvas,
    generate_swot_analysis,
    generate_pitch_deck
)

@app.get("/api/sessions/{session_id}/deliverables")
async def get_deliverables(session_id: str):
    """Retrieve all cached deliverables for the session."""
    state = load_session_state(session_id)
    return {
        "session_id": session_id,
        "lean_canvas": state.get("deliverable_lean_canvas"),
        "swot": state.get("deliverable_swot"),
        "pitch_deck": state.get("deliverable_pitch_deck"),
    }


@app.post("/api/sessions/{session_id}/deliverables/lean-canvas")
async def create_lean_canvas(session_id: str):
    """Generate a structured 9-box Lean Canvas from the session evidence dossier."""
    state = load_session_state(session_id)
    try:
        canvas = await generate_lean_canvas(state)
        state["deliverable_lean_canvas"] = canvas
        save_session_state(session_id, state)
        return {"status": "success", "lean_canvas": canvas}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lean Canvas generation failed: {str(e)}")


@app.post("/api/sessions/{session_id}/deliverables/swot")
async def create_swot_matrix(session_id: str):
    """Generate a 2x2 SWOT and Competitor Differentiation Matrix."""
    state = load_session_state(session_id)
    try:
        swot = await generate_swot_analysis(state)
        state["deliverable_swot"] = swot
        save_session_state(session_id, state)
        return {"status": "success", "swot": swot}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SWOT Matrix generation failed: {str(e)}")


@app.post("/api/sessions/{session_id}/deliverables/pitch-deck")
async def create_pitch_deck(session_id: str):
    """Generate a 10-Slide Pitch Deck presentation narrative with speaker notes."""
    state = load_session_state(session_id)
    try:
        deck = await generate_pitch_deck(state)
        state["deliverable_pitch_deck"] = deck
        save_session_state(session_id, state)
        return {"status": "success", "pitch_deck": deck}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pitch Deck generation failed: {str(e)}")


# ----------------------------------------------------------------------
# Team Members, Passcodes, and Mentor Review Endpoints (Option A)
# ----------------------------------------------------------------------

class PasscodePayload(BaseModel):
    passcode: str

class MemberPayload(BaseModel):
    id: Optional[str] = None
    name: str
    role: str = "RESEARCHER"
    avatar: str = "👩‍💻"

class CommentPayload(BaseModel):
    user_name: str
    user_role: str = "RESEARCHER"
    user_avatar: str = "👩‍💻"
    comment: str

class MentorSignoffPayload(BaseModel):
    phase_number: int
    mentor_name: str
    notes: Optional[str] = None


@app.post("/api/projects/{project_id}/verify-passcode")
async def verify_passcode(project_id: str, payload: PasscodePayload):
    is_valid = storage.verify_project_passcode(project_id, payload.passcode)
    return {"valid": is_valid, "project_id": project_id}


@app.post("/api/projects/{project_id}/set-passcode")
async def set_passcode(project_id: str, payload: PasscodePayload):
    success = storage.set_project_passcode(project_id, payload.passcode)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "message": "Passcode updated successfully"}


@app.get("/api/projects/{project_id}/members")
async def get_members(project_id: str):
    members = storage.list_project_members(project_id)
    return {"project_id": project_id, "members": members}


@app.post("/api/projects/{project_id}/members")
async def join_or_update_member(project_id: str, payload: MemberPayload):
    member = storage.upsert_project_member(project_id, payload.model_dump())
    return {"status": "success", "member": member}


@app.get("/api/problems/{problem_id}/comments")
async def get_comments(problem_id: str):
    comments = storage.list_problem_comments(problem_id)
    return {"problem_id": problem_id, "comments": comments}


@app.post("/api/problems/{problem_id}/comments")
async def add_comment(problem_id: str, payload: CommentPayload):
    comment = storage.add_problem_comment(problem_id, payload.model_dump())
    return {"status": "success", "comment": comment}


@app.post("/api/projects/{project_id}/mentor-signoff")
async def create_mentor_signoff(project_id: str, payload: MentorSignoffPayload):
    signoff = storage.record_mentor_signoff(
        project_id,
        phase_number=payload.phase_number,
        mentor_name=payload.mentor_name,
        notes=payload.notes or "Phase validated and approved by mentor."
    )
    return {"status": "success", "signoff": signoff}


@app.get("/api/projects/{project_id}/mentor-signoffs")
async def get_mentor_signoffs(project_id: str):
    signoffs = storage.list_mentor_signoffs(project_id)
    return {"project_id": project_id, "signoffs": signoffs}
