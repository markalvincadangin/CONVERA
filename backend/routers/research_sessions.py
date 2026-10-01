"""
CONVERA Research Sessions Router (SDD-021)
===========================================
REST endpoints for managing research session lifecycle, portfolio listing,
turnkey resumption, milestone checkpointing, and session cloning.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status

from storage.factory import get_storage
from engines.session_state_engine import SessionStateEngine
from models.research_session import (
    ResearchSessionSummary,
    CreateResearchSessionRequest,
    CreateCheckpointRequest,
    ResearchSessionCheckpointRecord,
    SyncStageRequest,
    ResearchSessionResumePayload,
    CloneResearchSessionRequest,
)

router = APIRouter(prefix="/api/research-sessions", tags=["Research Sessions"])


def _get_engine() -> SessionStateEngine:
    return SessionStateEngine(get_storage())


@router.get("", response_model=List[ResearchSessionSummary])
def list_research_sessions(
    limit: int = Query(50, ge=1, le=100, description="Max sessions to return")
):
    """
    List all active research sessions with stage stepper badges, completion %,
    active problem statement, and gate status chips.
    """
    storage = get_storage()
    records = storage.list_research_sessions(limit=limit)
    return [ResearchSessionSummary(**r) for r in records]


@router.post("", response_model=ResearchSessionSummary, status_code=status.HTTP_201_CREATED)
def create_research_session(request: CreateResearchSessionRequest):
    """
    Creates a new dedicated research session initialized with the 6-stage
    Research framework contract (starting at Stage A: Scouting).
    """
    storage = get_storage()
    import uuid
    from datetime import datetime, timezone

    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()

    from contracts.methodology import RESEARCH_CONTRACT
    initial_stage_progress = RESEARCH_CONTRACT.create_initial_stage_progress()

    initial_state = {
        "session_id": session_id,
        "project_id": request.project_id,
        "project_name": request.project_name,
        "framework_id": "RESEARCH",
        "current_stage_id": "scouting",
        "current_research_stage": "scouting",
        "stage_completion_pct": 0.0,
        "active_domain_id": request.domain_id,
        "created_at": now,
        "updated_at": now,
        "stage_progress": initial_stage_progress,
    }

    storage.save_session(session_id, initial_state)
    storage.update_research_session_stage(
        session_id=session_id,
        stage_id="scouting",
        stage_index=0,
        stage_completion_pct=0.0,
        active_domain_id=request.domain_id,
    )

    # If initial topic provided, create initial problem brief
    if request.initial_topic:
        prob_id = f"PRB-{uuid.uuid4().hex[:8].upper()}"
        added = storage.add_problem({
            "id": prob_id,
            "session_id": session_id,
            "project_id": request.project_id,
            "sector": "Computing Research",
            "problem_statement": request.initial_topic,
            "evidence_tier": "SIGNAL",
            "source": "manual_entry",
            "status": "discovered",
        })
        canonical_prob_id = added.get("id") if added else prob_id
        storage.update_research_session_stage(
            session_id=session_id,
            stage_id="scouting",
            stage_index=0,
            stage_completion_pct=16.6,
            active_problem_id=canonical_prob_id,
            active_domain_id=request.domain_id,
        )

    # Return refreshed summary
    summaries = storage.list_research_sessions(limit=50)
    for s in summaries:
        if s["session_id"] == session_id:
            return ResearchSessionSummary(**s)

    # Fallback summary
    return ResearchSessionSummary(
        session_id=session_id,
        project_id=request.project_id,
        project_name=request.project_name,
        framework_id="RESEARCH",
        current_stage_id="scouting",
        current_stage_name="Phase A: Scouting & Discovery",
        stage_index=0,
        stage_completion_pct=0.0,
        active_domain_id=request.domain_id,
        created_at=now,
        updated_at=now,
    )


@router.get("/{session_id}/resume", response_model=ResearchSessionResumePayload)
def resume_research_session(session_id: str):
    """
    Turnkey resume endpoint assembling full session state, summary metadata,
    checkpoint history, active problem details, and recent orchestrator events.
    """
    engine = _get_engine()
    try:
        payload = engine.assemble_resume_payload(session_id)
        return ResearchSessionResumePayload(**payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assemble resume payload: {e}")


@router.post("/{session_id}/sync-stage")
def sync_research_session_stage(session_id: str, request: SyncStageRequest):
    """
    Persists stage transition to SQLite, updating `current_research_stage`,
    `stage_completion_pct`, and active pointers.
    """
    storage = get_storage()
    session = storage.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

    engine = _get_engine()
    _, stage_idx = engine.STAGE_LOOKUP.get(request.stage_id, (request.stage_id, request.stage_index or 0))
    pct = request.stage_completion_pct
    if pct is None:
        pct = round(((stage_idx + 1) / 6.0) * 100.0, 1)

    updated = storage.update_research_session_stage(
        session_id=session_id,
        stage_id=request.stage_id,
        stage_index=stage_idx,
        stage_completion_pct=pct,
        active_problem_id=request.active_problem_id,
        active_domain_id=request.active_domain_id,
    )

    # Also update state_data.current_stage_id
    session["current_stage_id"] = request.stage_id
    session["current_research_stage"] = request.stage_id
    session["stage_completion_pct"] = pct
    if "stage_progress" in session and isinstance(session["stage_progress"], dict):
        session["stage_progress"]["current_stage_id"] = request.stage_id
    storage.save_session(session_id, session)

    return {
        "status": "success",
        "session_id": session_id,
        "current_stage_id": request.stage_id,
        "stage_completion_pct": pct,
    }


@router.post("/{session_id}/checkpoint", response_model=ResearchSessionCheckpointRecord)
def create_checkpoint(session_id: str, request: CreateCheckpointRequest):
    """
    Creates an immutable milestone checkpoint capturing full state snapshot
    and deterministic SHA-256 provenance hash.
    """
    engine = _get_engine()
    try:
        rec = engine.create_checkpoint(
            session_id=session_id,
            checkpoint_name=request.checkpoint_name,
            description=request.description,
            created_by=request.created_by,
        )
        return ResearchSessionCheckpointRecord(**rec)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkpoint: {e}")


@router.get("/{session_id}/checkpoints", response_model=List[ResearchSessionCheckpointRecord])
def list_checkpoints(session_id: str):
    """List all historical checkpoints for a given research session."""
    storage = get_storage()
    session = storage.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    records = storage.list_research_session_checkpoints(session_id)
    return [ResearchSessionCheckpointRecord(**r) for r in records]


@router.post("/{session_id}/restore/{checkpoint_id}")
def restore_checkpoint(session_id: str, checkpoint_id: str):
    """
    Rolls back research session to a prior milestone checkpoint after
    verifying cryptographic SHA-256 hash match.
    """
    engine = _get_engine()
    try:
        restored_session = engine.restore_checkpoint(session_id, checkpoint_id)
        return {
            "status": "restored",
            "session_id": session_id,
            "checkpoint_id": checkpoint_id,
            "current_stage_id": restored_session.get("current_research_stage") or restored_session.get("current_stage_id"),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkpoint restore failed: {e}")


@router.delete("/{session_id}/checkpoint/{checkpoint_id}")
def delete_checkpoint(session_id: str, checkpoint_id: str):
    """Deletes a specific milestone checkpoint."""
    storage = get_storage()
    chk = storage.get_research_session_checkpoint(checkpoint_id)
    if not chk or chk["session_id"] != session_id:
        raise HTTPException(status_code=404, detail="Checkpoint not found for this session.")
    deleted = storage.delete_research_session_checkpoint(checkpoint_id)
    return {"status": "deleted", "checkpoint_id": checkpoint_id, "success": deleted}


@router.post("/{session_id}/clone", response_model=ResearchSessionSummary)
def clone_research_session(session_id: str, request: CloneResearchSessionRequest):
    """
    Deep-clones a research session, duplicating state with new IDs to allow
    parallel investigation of competing hypotheses.
    """
    engine = _get_engine()
    try:
        cloned_session = engine.clone_session(
            source_session_id=session_id,
            new_project_name=request.new_project_name,
            include_literature=request.include_literature,
        )
        storage = get_storage()
        summaries = storage.list_research_sessions(limit=50)
        for s in summaries:
            if s["session_id"] == cloned_session["session_id"]:
                return ResearchSessionSummary(**s)
        raise RuntimeError("Cloned session summary not found.")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clone failed: {e}")
