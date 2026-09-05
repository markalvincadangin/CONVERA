"""
CONVERA Sessions, Deliverables & Collaboration Router
=====================================================
Handles session lifecycle, framework switching, snapshots, SRS generation,
deliverables studio, phase execution, room security, and team collaboration.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid

from storage import get_storage
from engines.framework_engine import get_framework
from engines.deliverables_generator import (
    generate_lean_canvas,
    generate_swot_analysis,
    generate_pitch_deck
)
from engines.srs_generator import generate_project_srs, format_srs_markdown
from engines.decision_engine import synthesize_decision_room, execute_pivot_loop

router = APIRouter(tags=["Sessions, Phases & Deliverables"])


# Request Models
class SessionCreateRequest(BaseModel):
    session_id: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = "Untitled Project"
    framework_id: Optional[str] = "INNOVATION"


class SessionUpdateRequest(BaseModel):
    state_data: Optional[Dict[str, Any]] = None
    phase1_complete: Optional[bool] = False
    phase2_complete: Optional[bool] = False
    phase3_complete: Optional[bool] = False
    phase4_complete: Optional[bool] = False
    phase5_complete: Optional[bool] = False


class SessionRenameRequest(BaseModel):
    project_name: str


class SwitchFrameworkRequest(BaseModel):
    framework_id: str


class SnapshotCreateRequest(BaseModel):
    label: str
    phase_number: Optional[int] = 1


class SrsGenerateRequest(BaseModel):
    include_markdown: Optional[bool] = True


class PasscodeVerifyRequest(BaseModel):
    passcode: str


class MemberCreateRequest(BaseModel):
    name: str
    role: Optional[str] = "editor"
    avatar: Optional[str] = None


class SignoffCreateRequest(BaseModel):
    phase_number: int
    mentor_name: str
    notes: Optional[str] = None


class DecisionSynthesizeRequest(BaseModel):
    session_id: str
    stage: Optional[str] = "PHASE_2_SCREENING"


class DecisionPivotRequest(BaseModel):
    session_id: str
    current_problem_id: str
    kill_reason: str
    next_candidate_id: str


# ---------------------------------------------------------------------------
# Sessions & Snapshots
# ---------------------------------------------------------------------------

@router.get("/api/sessions")
async def list_sessions():
    """List all saved sessions with project metadata."""
    storage = get_storage()
    sessions = storage.list_sessions()
    return {"sessions": sessions}


@router.post("/api/sessions")
async def create_session(req: SessionCreateRequest):
    """Create a new session with initial state."""
    storage = get_storage()
    session_id = req.session_id.strip() if req.session_id else f"sess_{uuid.uuid4().hex[:12]}"
    project_name = req.project_name.strip() if req.project_name else "Iloilo Technopreneurship Project"
    project_id = req.project_id or f"proj_{session_id}"
    
    initial_state = {
        "session_id": session_id,
        "project_id": project_id,
        "project_name": project_name,
        "framework_id": req.framework_id or "INNOVATION",
        "phase1_response": None,
        "phase2_response": None,
        "phase3_problem": None,
        "phase3_history": [],
        "completed_levels": [],
        "phase3_response": None,
        "phase4_concepts": [],
        "phase4_response": None,
        "phase5_audit": None,
        "phase5_response": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    storage.save_session(session_id, initial_state)
    return initial_state


@router.post("/api/sessions/create-with-framework")
async def create_session_with_framework(req: SessionCreateRequest):
    """Create a new session initialized with a specific framework."""
    return await create_session(req)


@router.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """Get full state data for a specific session."""
    storage = get_storage()
    sess = storage.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return sess.get("state_data", sess)


@router.post("/api/sessions/{session_id}")
async def update_session(session_id: str, request: Request):
    """Update active state data for a session."""
    storage = get_storage()
    payload = await request.json()
    
    state_data = payload.get("state_data", payload)
    if not isinstance(state_data, dict):
        state_data = {}
    for flag in ["phase1_complete", "phase2_complete", "phase3_complete", "phase4_complete", "phase5_complete"]:
        if flag in payload and flag not in state_data:
            state_data[flag] = payload[flag]

    updated = storage.save_session(session_id=session_id, state=state_data)
    return {"session_id": session_id, "state": state_data, "session": updated}


@router.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session."""
    storage = get_storage()
    storage.delete_session(session_id)
    return {"session_id": session_id, "status": "deleted", "deleted": True}


@router.put("/api/sessions/{session_id}/rename")
async def rename_session(session_id: str, req: SessionRenameRequest):
    """Rename a session's project name."""
    storage = get_storage()
    updated = storage.rename_session(session_id, req.project_name)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return {"session": updated}


@router.post("/api/sessions/{session_id}/switch-framework")
async def switch_session_framework(session_id: str, req: SwitchFrameworkRequest):
    """Switch active framework on an existing session."""
    fw = get_framework(req.framework_id)
    if not fw:
        raise HTTPException(status_code=400, detail=f"Invalid framework '{req.framework_id}'")
    
    storage = get_storage()
    updated = storage.switch_session_framework(session_id, req.framework_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return {"status": "success", "session_id": session_id, "framework_id": fw.id, "state": updated, "session": updated, "framework": fw.model_dump()}


@router.get("/api/sessions/{session_id}/snapshots")
async def list_session_snapshots(session_id: str):
    """List historical snapshots for a session."""
    storage = get_storage()
    return storage.list_snapshots(session_id)


@router.post("/api/sessions/{session_id}/snapshots")
async def create_session_snapshot(session_id: str, req: SnapshotCreateRequest):
    """Create a point-in-time state checkpoint."""
    storage = get_storage()
    snap = storage.create_snapshot(
        session_id=session_id,
        label=req.label,
        phase_number=req.phase_number or 1
    )
    return snap


@router.post("/api/sessions/{session_id}/snapshots/{snapshot_id}/restore")
async def restore_session_snapshot(session_id: str, snapshot_id: int):
    """Restore a session's state from a historical snapshot."""
    storage = get_storage()
    restored = storage.restore_snapshot(session_id, snapshot_id)
    if not restored:
        raise HTTPException(status_code=404, detail="Snapshot or session not found")
    return {"session_id": session_id, "state": restored, "session": restored}


@router.get("/api/sessions/{session_id}/export")
async def export_session_data(session_id: str):
    """Export complete session package with state, problems, and decisions."""
    storage = get_storage()
    sess = storage.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    
    problems = storage.list_problems(session_id=session_id)
    decisions = storage.get_decision_records(session_id=session_id)
    
    return {
        "session": sess,
        "problems": problems,
        "decisions": decisions,
        "exported_at": datetime.now(timezone.utc).isoformat()
    }


# ---------------------------------------------------------------------------
# Deliverables Studio & IEEE 830 SRS Generation
# ---------------------------------------------------------------------------

@router.get("/api/sessions/{session_id}/deliverables")
async def get_session_deliverables(session_id: str):
    """Get all cached deliverables for a session."""
    storage = get_storage()
    sess = storage.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    deliverables = sess.get("state_data", {}).get("deliverables", {})
    return {"session_id": session_id, "deliverables": deliverables}


@router.post("/api/sessions/{session_id}/deliverables/lean-canvas")
async def generate_lean_canvas_endpoint(session_id: str):
    """Generate Lean Canvas deliverable from session state."""
    storage = get_storage()
    sess = storage.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    
    canvas = await generate_lean_canvas(sess.get("state_data", {}))
    return {"status": "success", "lean_canvas": canvas}


@router.post("/api/sessions/{session_id}/deliverables/swot")
async def generate_swot_endpoint(session_id: str):
    """Generate SWOT Matrix deliverable from session state."""
    storage = get_storage()
    sess = storage.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    
    swot = await generate_swot_analysis(sess.get("state_data", {}))
    return {"status": "success", "swot": swot}


@router.post("/api/sessions/{session_id}/deliverables/pitch-deck")
async def generate_pitch_deck_endpoint(session_id: str):
    """Generate Pitch Deck deliverable from session state."""
    storage = get_storage()
    sess = storage.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    
    deck = await generate_pitch_deck(sess.get("state_data", {}))
    return {"status": "success", "pitch_deck": deck}


@router.post("/api/sessions/{session_id}/srs-spec")
async def generate_srs_endpoint(session_id: str, req: SrsGenerateRequest):
    """Generate IEEE 830 / ISO 29148 System Requirements Specification."""
    storage = get_storage()
    sess = storage.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    
    spec = await generate_project_srs(sess.get("state_data", {}))
    response_data = dict(spec)
    if req.include_markdown:
        response_data["markdown"] = format_srs_markdown(spec)
    return response_data


# ---------------------------------------------------------------------------
# Decision Room & Pivot Loops
# ---------------------------------------------------------------------------

@router.post("/api/decision-room/synthesize")
async def api_synthesize_decision_room(req: DecisionSynthesizeRequest):
    """Synthesize multi-candidate decision analysis with explainable scoring."""
    storage = get_storage()
    sess = storage.get_session(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    
    state_data = sess.get("state_data", {})
    candidate_ids = state_data.get("candidate_ids") or []
    candidates = [storage.get_problem(cid) for cid in candidate_ids if storage.get_problem(cid)]
    if not candidates:
        project_id = sess.get("project_id")
        if project_id:
            candidates = storage.list_problems(project_id=project_id)[:4]
    if not candidates:
        active_problem_id = sess.get("active_problem_id") or state_data.get("active_problem_id")
        if active_problem_id:
            p = storage.get_problem(active_problem_id)
            if p:
                candidates = [p]

    result = await synthesize_decision_room(candidates, storage=storage)
    return result


@router.post("/api/decision-room/pivot")
async def api_execute_pivot_loop(req: DecisionPivotRequest):
    """Execute evidence-grounded pivot loop and record decision rationale."""
    # execute_pivot_loop is synchronous; do not await.
    # Semantic Separation: req.next_candidate_id is a candidate identifier,
    # NOT an assumption identifier. Do NOT map next_candidate_id -> invalidated_assumption_id.
    # Leave invalidated_assumption_id unset (None) when not provided by request.
    result = execute_pivot_loop(
        session_id=req.session_id,
        current_problem_id=req.current_problem_id,
        pivot_reason=req.kill_reason,
        invalidated_assumption_id=None,
    )
    return result


# ---------------------------------------------------------------------------
# Room Security & Collaboration
# ---------------------------------------------------------------------------

@router.get("/api/projects/{share_code}")
@router.get("/api/projects/by-code/{share_code}")
async def get_project_by_share_code(share_code: str):
    """Retrieve project metadata by human-friendly share code."""
    storage = get_storage()
    proj = storage.get_project_by_code(share_code) or storage.get_project_by_share_code(share_code)
    if not proj:
        raise HTTPException(status_code=404, detail="Room code not found")
    return proj


@router.post("/api/projects/{share_code}/verify-passcode")
async def verify_room_passcode(share_code: str, req: PasscodeVerifyRequest):
    """Verify room passcode."""
    storage = get_storage()
    valid = storage.verify_project_passcode(share_code, req.passcode)
    return {"valid": valid, "status": "success"}


@router.post("/api/projects/{share_code}/set-passcode")
async def set_room_passcode(share_code: str, req: PasscodeVerifyRequest):
    """Set or update room passcode."""
    storage = get_storage()
    storage.set_project_passcode(share_code, req.passcode)
    return {"status": "success", "success": True}


@router.get("/api/projects/{project_id}/members")
async def list_project_members(project_id: str):
    """List online collaborators for a project."""
    storage = get_storage()
    members = storage.list_project_members(project_id)
    return {"members": members}


@router.post("/api/projects/{project_id}/members")
async def add_project_member(project_id: str, req: MemberCreateRequest):
    """Register or heartbeat an active member."""
    storage = get_storage()
    member = storage.upsert_project_member(
        project_id=project_id,
        member_data=req.model_dump()
    )
    return {"member": member, "status": "success"}


@router.delete("/api/projects/{project_id}/members/{member_id}")
async def remove_project_member(project_id: str, member_id: str):
    """Remove a member from the active collaborator list."""
    storage = get_storage()
    with storage._get_connection() as conn:
        conn.execute("DELETE FROM project_members WHERE id = ?", (member_id,))
    return {"removed": True, "status": "success"}


@router.get("/api/projects/{project_id}/signoffs")
async def list_mentor_signoffs(project_id: str):
    """List formal mentor signoffs across phases."""
    storage = get_storage()
    signoffs = storage.list_mentor_signoffs(project_id)
    return {"signoffs": signoffs}


@router.post("/api/projects/{project_id}/signoffs")
@router.post("/api/projects/{project_id}/mentor-signoff")
async def add_mentor_signoff(project_id: str, req: SignoffCreateRequest):
    """Record a mentor approval for a phase gate."""
    storage = get_storage()
    signoff = storage.record_mentor_signoff(
        project_id=project_id,
        phase_number=req.phase_number,
        mentor_name=req.mentor_name,
        notes=req.notes or ""
    )
    return {"status": "success", "signoff": signoff}
