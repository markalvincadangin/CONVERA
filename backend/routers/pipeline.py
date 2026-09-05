from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from storage.factory import get_storage
from llm_gateway import generate_response_with_fallback, TaskCategory
from engines.problem_enricher import enrich_manual_problem_input
from engines.problem_parser import parse_phase1_markdown
from engines.devils_advocate import challenge_problem_with_agent
from engines.blind_spot_detector import detect_portfolio_blind_spots
from engines.research_client import FreeResearchClient
from engines.srs_generator import generate_project_srs
from prompts.innovation_phase_1_system import INNOVATION_PHASE_1_SYSTEM as PHASE1_SYSTEM
from prompts.innovation_phase_2_system import INNOVATION_PHASE_2_SYSTEM as PHASE2_SYSTEM
from prompts.innovation_phase_3_system import INNOVATION_PHASE_3_SYSTEM as PHASE3_SYSTEM
from prompts.innovation_phase_4_system import INNOVATION_PHASE_4_SYSTEM as PHASE4_SYSTEM
from prompts.innovation_phase_5_system import INNOVATION_PHASE_5_SYSTEM as PHASE5_SYSTEM


router = APIRouter(tags=["Pipeline & Phase Execution"])

# Pydantic Request Models
class Phase1DiscoverRequest(BaseModel):
    session_id: str
    sectors: List[str]
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
    pass_threshold: Any
    fail_threshold: Any
    evidence_desc: str

class GenerateSRSRequest(BaseModel):
    session_id: str
    mode: str = "CAPSTONE"

class RunPhaseRequest(BaseModel):
    session_id: str
    phase_number: int
    user_input: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

# Phase 1: Startup Problem Discovery
@router.post("/api/phases/1/discover")
async def phase1_discover(req: Phase1DiscoverRequest):
    storage = get_storage()
    state = storage.get_session(req.session_id) or {"session_id": req.session_id}

    user_prompt = f"Target Sectors: {', '.join(req.sectors)}\n"
    if req.field_observations:
        user_prompt += f"Firsthand Field Observations:\n{req.field_observations}\n"
    user_prompt += "Generate a grounded problem landscape for Western Visayas following the Phase 1 schema."

    raw_response = await generate_response_with_fallback(
        system_instruction=PHASE1_SYSTEM,
        prompt=user_prompt,
        task_category=TaskCategory.FAST_EXTRACTION,
    )

    state["phase1_complete"] = True
    state["phase1_text"] = raw_response
    state["target_sectors"] = req.sectors
    state["field_observations"] = req.field_observations

    # Auto-extract and enrich problems into Problem Bank
    try:
        extracted_problems = parse_phase1_markdown(raw_response, session_id=req.session_id)
        if extracted_problems:
            upsert_res = storage.bulk_upsert_problems(extracted_problems)
            state["problem_candidates"] = upsert_res.get("problems", extracted_problems)
            state["phase1_ingestion_summary"] = {
                "new_created_count": upsert_res.get("new_created_count", 0),
                "created_ids": upsert_res.get("created_ids", []),
                "merged_count": upsert_res.get("merged_count", 0),
                "merged_ids": upsert_res.get("merged_ids", []),
            }
    except Exception as e:
        print(f"[!] Warning: Auto-extraction failed ({e})")

    storage.save_session(req.session_id, state)
    return {"response": raw_response, "state": state}

@router.post("/api/phases/1/additions")
async def phase1_additions(req: Phase1AdditionsRequest):
    storage = get_storage()
    state = storage.get_session(req.session_id) or {"session_id": req.session_id}

    prev_text = state.get("phase1_text", "")
    user_prompt = f"Previous Landscape:\n{prev_text}\n\nAdditional Founder Observations:\n{req.additions}\nIntegrate these observations into the problem landscape."

    raw_response = await generate_response_with_fallback(
        system_instruction=PHASE1_SYSTEM,
        prompt=user_prompt,
        task_category=TaskCategory.FAST_EXTRACTION,
    )

    state["phase1_text"] = raw_response
    storage.save_session(req.session_id, state)
    return {"response": raw_response, "state": state}

# Phase 2: Screening & Triage
@router.post("/api/phases/2/screen")
async def phase2_screen(req: Phase2ScreenRequest):
    storage = get_storage()
    state = storage.get_session(req.session_id) or {"session_id": req.session_id}

    landscape = req.problem_landscape or state.get("phase1_text", "")
    candidates = storage.list_problems(session_id=req.session_id, limit=20)
    candidates_text = "\n\n".join([
        f"ID: {p['id']}\nSector: {p['sector']}\nStatement: {p['problem_statement']}\nWorkaround: {p.get('workaround')}\nImpact: {p.get('quantified_impact')}"
        for p in candidates
    ])

    user_prompt = f"Problem Landscape:\n{landscape}\n\nProblem Candidates from Problem Bank:\n{candidates_text}\n\nScreen and triage these candidates according to Phase 2 criteria."

    raw_response = await generate_response_with_fallback(
        system_instruction=PHASE2_SYSTEM,
        prompt=user_prompt,
        task_category=TaskCategory.DECISION_JUDGE,
    )

    state["phase2_complete"] = True
    state["phase2_text"] = raw_response
    if req.selected_problem_ids:
        state["selected_problem_ids"] = req.selected_problem_ids
    storage.save_session(req.session_id, state)
    return {"response": raw_response, "state": state}

# Phase 3: Socratic Mom Test Validation Clinic
@router.post("/api/phases/3/init")
async def phase3_init(req: Phase3InitRequest):
    storage = get_storage()
    state = storage.get_session(req.session_id) or {"session_id": req.session_id}

    user_prompt = f"Selected Problem Candidate for Validation:\n{req.problem_statement}\nBegin Level 1 of the Mom Test Socratic Interrogation."

    raw_response = await generate_response_with_fallback(
        system_instruction=PHASE3_SYSTEM,
        prompt=user_prompt,
        task_category=TaskCategory.SOCRATIC_CLINIC,
    )

    state["phase3_problem"] = req.problem_statement
    state["phase3_problem_id"] = req.problem_id
    state["phase3_current_level"] = "L1"
    state["phase3_history"] = [{"role": "assistant", "content": raw_response}]
    storage.save_session(req.session_id, state)

    return {
        "agent_response": raw_response,
        "current_level": "L1",
        "level_label": "Level 1: Problem Authenticity",
        "state": state,
    }

@router.post("/api/phases/3/turn")
async def phase3_turn(req: Phase3TurnRequest):
    storage = get_storage()
    state = storage.get_session(req.session_id) or {"session_id": req.session_id}

    history = state.get("phase3_history", [])
    history.append({"role": "user", "content": req.answer})

    conversation_text = "\n\n".join([f"{h['role'].upper()}: {h['content']}" for h in history])
    user_prompt = f"Conversation History:\n{conversation_text}\n\nEvaluate the founder's response against the Mom Test rules and advance or challenge the level."

    raw_response = await generate_response_with_fallback(
        system_instruction=PHASE3_SYSTEM,
        prompt=user_prompt,
        task_category=TaskCategory.SOCRATIC_CLINIC,
    )

    history.append({"role": "assistant", "content": raw_response})
    state["phase3_history"] = history

    # Check for completion keywords
    if "PASSED" in raw_response or "COMPLETE" in raw_response or "LEVEL 6 PASSED" in raw_response.upper():
        state["phase3_complete"] = True

    storage.save_session(req.session_id, state)
    return {
        "agent_response": raw_response,
        "current_level": state.get("phase3_current_level", "L1"),
        "level_label": "Validation Clinic in Progress",
        "passed_levels": ["L1"],
        "is_complete": state.get("phase3_complete", False),
        "state": state,
    }

# Phase 4: Ideation & SVB
@router.post("/api/phases/4/step")
async def phase4_step(req: Phase4StepRequest):
    storage = get_storage()
    state = storage.get_session(req.session_id) or {"session_id": req.session_id}

    validated_problem = state.get("phase3_problem") or "Validated agriculture friction"
    user_prompt = f"Validated Problem:\n{validated_problem}\nStep: {req.step}\nUser Input: {req.user_input or 'None'}\nGenerate mechanism combinations and SVB statements."

    raw_response = await generate_response_with_fallback(
        system_instruction=PHASE4_SYSTEM,
        prompt=user_prompt,
        task_category=TaskCategory.BALANCED_SYNTHESIS,
    )

    state["phase4_complete"] = True
    state["phase4_text"] = raw_response
    if req.concepts:
        state["concepts"] = req.concepts
    storage.save_session(req.session_id, state)

    return {
        "response": raw_response,
        "step": req.step,
        "concepts": req.concepts or [],
        "state": state,
    }

# Phase 5: MVP Audit
@router.post("/api/phases/5/audit")
async def phase5_audit(req: Phase5AuditRequest):
    storage = get_storage()
    state = storage.get_session(req.session_id) or {"session_id": req.session_id}

    conversion_rate = (req.actions_count / req.sample_size * 100) if req.sample_size > 0 else 0.0

    prompt = f"""AUDIT EMPIRICAL MVP EXPERIMENT DATA (Phase 5 Build-Measure-Learn):

- Concept Tested: {req.concept_label}
- Tested P1 Assumption: {req.assumption_tested}
- Test Archetype: {req.test_archetype}
- Target Participant Cohort: {req.cohort}
- Sample Size Exposed (N): {req.sample_size}
- Concrete Actions Observed: {req.actions_count}
- Calculated Conversion Rate: {conversion_rate:.1f}%
- Pre-set PASS Threshold: {req.pass_threshold}
- Pre-set FAIL Threshold: {req.fail_threshold}
- Observed Evidence Description & Behaviors:
{req.evidence_desc}

CLINICAL AUDIT REQUIREMENTS:
1. Evaluate conversion rate against the pre-set Pass/Fail thresholds (PASS, FAIL, or INCONCLUSIVE).
2. Enforce the Behavioral Commitment Hierarchy (Tiers 1-5). Explicitly classify the highest tier achieved. Discard verbal praise (Tier 5) as zero validation evidence.
3. Conduct structured Failure / Pivot Analysis if threshold was not met (Mechanism Pivot, Customer Segment Pivot, or Return to Problem).
4. Assign final Phase 5 verdict: PURSUE, PIVOT, or RETIRE_CONCEPT.
5. Produce the comprehensive Phase 5 MVP Validation Audit Report."""

    response = await generate_response_with_fallback(
        system_instruction=PHASE5_SYSTEM,
        prompt=prompt,
        task_category=TaskCategory.DECISION_JUDGE,
    )

    state["phase5_response"] = response
    state["phase5_complete"] = True
    storage.save_session(req.session_id, state)
    return {"state": state, "response": response}

# IEEE 830 SRS Specification Generator
@router.post("/api/deliverables/generate-srs")
async def generate_srs_endpoint(req: GenerateSRSRequest):
    storage = get_storage()
    state = storage.get_session(req.session_id) or {"session_id": req.session_id}
    srs_spec = await generate_project_srs(state, mode=req.mode)
    return {"status": "success", "srs": srs_spec}

# General Phase Runner
@router.post("/api/run-phase")
async def run_phase(req: RunPhaseRequest):
    storage = get_storage()
    state = storage.get_session(req.session_id) or {"session_id": req.session_id}

    phase_prompts = {
        1: (PHASE1_SYSTEM, "Conduct Phase 1 Startup Problem Discovery for target sectors.", TaskCategory.FAST_EXTRACTION),
        2: (PHASE2_SYSTEM, "Screen and rank candidate problems.", TaskCategory.DECISION_JUDGE),
        3: (PHASE3_SYSTEM, "Run Mom Test validation interrogation.", TaskCategory.SOCRATIC_CLINIC),
        4: (PHASE4_SYSTEM, "Generate mechanism combinations and SVB hypothesis.", TaskCategory.BALANCED_SYNTHESIS),
        5: (PHASE5_SYSTEM, "Audit skin-in-the-game MVP commitment.", TaskCategory.DECISION_JUDGE),
    }

    if req.phase_number not in phase_prompts:
        raise HTTPException(status_code=400, detail=f"Invalid phase number: {req.phase_number}")

    sys_prompt, user_tmpl, category = phase_prompts[req.phase_number]
    user_prompt = f"{user_tmpl}\nUser Input:\n{req.user_input or 'Default parameters'}"

    raw_response = await generate_response_with_fallback(
        system_instruction=sys_prompt,
        prompt=user_prompt,
        task_category=category,
    )

    state[f"phase{req.phase_number}_complete"] = True
    state[f"phase{req.phase_number}_text"] = raw_response
    storage.save_session(req.session_id, state)

    return {"status": "success", "phase_number": req.phase_number, "response": raw_response, "state": state}
