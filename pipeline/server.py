from __future__ import annotations

"""
RatchetAI FastAPI Backend Server
Evidence-Ratcheted Problem-to-Solution Multi-Agent Pipeline v2.0
Powered by Universal Multi-Provider LLM Gateway (Gemini, Groq, OpenRouter, Ollama)
Integrated with High-Concurrency SQLite WAL / PostgreSQL Database Engine
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

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
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

from main import ALL_SECTORS
from gates import (
    LEVEL_ORDER, LEVEL_LABELS, LEVEL_INSTRUCTIONS,
    get_current_level, get_level_label, get_level_instruction,
    mark_level_complete, all_levels_complete, check_concept_minimum,
    format_concept_shortfall
)
from llm_gateway import generate_response_with_fallback, generate_with_meta
from prompts.phase1_system import PHASE1_SYSTEM
from prompts.phase2_system import PHASE2_SYSTEM
from prompts.phase3_system import PHASE3_SYSTEM
from prompts.phase4_system import PHASE4_SYSTEM
from prompts.phase5_system import PHASE5_SYSTEM

app = FastAPI(
    title="RatchetAI Venture Engine API",
    description="Backend API with Universal Multi-Provider LLM Gateway & Persistent Database Storage",
    version="2.0.0",
)

# Enable CORS for Next.js frontend and LAN access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

class Phase3InitRequest(BaseModel):
    session_id: str
    problem_statement: str

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
    pass_threshold: float
    fail_threshold: float
    evidence_desc: str


# ----------------------------------------------------------------------
# Session Management & Snapshot Endpoints
# ----------------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "sqlite_wal",
        "version": "2.0.0"
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
        f"# {pname} — RatchetAI Venture Dossier",
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
# Phase 1 Endpoints (Problem Discovery)
# ----------------------------------------------------------------------

@app.post("/api/phases/1/discover")
async def phase1_discover(req: Phase1DiscoverRequest):
    state = load_session_state(req.session_id)

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

    state["phase1_response"] = response
    state["phase1_model_meta"] = meta
    state["phase1_complete"] = True
    save_session_state(req.session_id, state)
    return {"state": state, "response": response, "model_meta": meta}


@app.post("/api/phases/1/additions")
async def phase1_additions(req: Phase1AdditionsRequest):
    state = load_session_state(req.session_id)
    current_p1 = state.get("phase1_response", "")

    prompt = (
        f"CURRENT PROBLEM LANDSCAPE:\n{current_p1}\n\n"
        f"USER FIELD CORRECTIONS & NEW PRIMARY OBSERVATIONS:\n{req.additions}\n\n"
        "Integrate these corrections into the existing landscape. Return the updated Problem Landscape Table."
    )

    try:
        response, meta = await generate_with_meta(
            system_instruction=PHASE1_SYSTEM,
            prompt=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    state["phase1_response"] = response
    state["phase1_model_meta"] = meta
    save_session_state(req.session_id, state)
    return {"state": state, "response": response, "model_meta": meta}


# ----------------------------------------------------------------------
# Phase 2 Endpoints (Problem Screening & Scorecard)
# ----------------------------------------------------------------------

@app.post("/api/phases/2/screen")
async def phase2_screen(req: Phase2ScreenRequest):
    state = load_session_state(req.session_id)
    landscape = req.problem_landscape or state.get("phase1_response", "")

    if not landscape.strip():
        raise HTTPException(status_code=400, detail="No Phase 1 problem landscape provided.")

    prompt = (
        f"PHASE 1 PROBLEM CANDIDATES:\n{landscape}\n\n"
        "Evaluate every problem candidate against the 5 screening criteria and Winnability check. "
        "Assign scores (1-5), red flags, and verdicts (ADVANCE, SECOND_LOOK, or PARK). "
        "Enforce mandatory exit conditions for SECOND_LOOK candidates."
    )

    try:
        response = await generate_response_with_fallback(
            system_instruction=PHASE2_SYSTEM,
            prompt=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    state["phase2_response"] = response
    state["phase2_complete"] = True
    save_session_state(req.session_id, state)
    return {"state": state, "response": response}


# ----------------------------------------------------------------------
# Phase 3 Endpoints (Socratic Mom Test Clinic)
# ----------------------------------------------------------------------

@app.post("/api/phases/3/init")
async def phase3_init(req: Phase3InitRequest):
    state = load_session_state(req.session_id)
    state["phase3_problem"] = req.problem_statement
    state["completed_levels"] = []
    state["phase3_complete"] = False

    initial_context = (
        f"PROBLEM CANDIDATE TO VALIDATE:\n{req.problem_statement}\n\n"
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
