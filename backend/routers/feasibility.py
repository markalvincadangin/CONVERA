"""
FastAPI Router for Research Stage F: Relevance, Ethics, Feasibility & Gate 4 Proposal Canvas (SDD-018)
Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query

from engines.feasibility_engine import FeasibilityEngine
from engines.proposal_exporter import ProposalExporter
from models.feasibility import (
    FeasibilityEvaluationRequest,
    MentorSignoffRequest,
    ProposalCompilationRequest,
)
from storage.factory import get_storage

router = APIRouter(prefix="/api/feasibility", tags=["Stage F Feasibility & Proposal Canvas"])


@router.post("/evaluate")
async def evaluate_feasibility_endpoint(req: FeasibilityEvaluationRequest) -> Dict[str, Any]:
    """
    Evaluates regulatory compliance (RA 10173, IRB), roadmap alignment (SDGs, DOST-PCIEERD),
    budget feasibility, and generates non-authoritative AI advisory notes.
    """
    storage = get_storage()
    engine = FeasibilityEngine(storage=storage)
    try:
        record = await engine.evaluate_feasibility(req)
        return {"status": "success", "feasibility": record.model_dump()}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Feasibility evaluation failed: {str(e)}"
        )


@router.get("/session/{session_id}")
async def get_feasibility_record_endpoint(session_id: str) -> Dict[str, Any]:
    """Retrieves the active Stage F feasibility evaluation record for a session."""
    storage = get_storage()
    record = storage.get_feasibility_record(session_id)
    if not record:
        return {"status": "success", "session_id": session_id, "feasibility": None}
    return {"status": "success", "session_id": session_id, "feasibility": record}


@router.post("/compile-proposal")
async def compile_proposal_endpoint(req: ProposalCompilationRequest) -> Dict[str, Any]:
    """
    Aggregates live relational project knowledge across all 6 stages of the Computing
    Research Track into a publication-ready DSR Thesis/Capstone Proposal Monograph.
    """
    storage = get_storage()
    exporter = ProposalExporter(storage=storage)
    try:
        monograph = exporter.compile_proposal_canvas(
            project_id=req.project_id,
            session_id=req.session_id,
        )
        return {"status": "success", "proposal": monograph}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Proposal compilation failed: {str(e)}"
        )


@router.post("/mentor-signoff")
async def record_mentor_signoff_endpoint(req: MentorSignoffRequest) -> Dict[str, Any]:
    """
    Records an attributable human advisor or committee panel defense sign-off
    in strict adherence to Article IV (Human Sovereignty).
    """
    storage = get_storage()
    try:
        signoff = storage.record_mentor_signoff(
            project_id=req.project_id,
            phase_number=req.phase_number,
            mentor_name=req.mentor_name,
            notes=req.notes or "",
        )
        return {"status": "success", "signoff": signoff}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Recording mentor sign-off failed: {str(e)}"
        )


@router.get("/mentor-signoff/{project_id}")
async def list_mentor_signoffs_endpoint(project_id: str) -> Dict[str, Any]:
    """Lists all historical human mentor/advisor sign-offs for a given project."""
    storage = get_storage()
    signoffs = storage.list_mentor_signoffs(project_id=project_id)
    return {
        "status": "success",
        "project_id": project_id,
        "count": len(signoffs),
        "signoffs": signoffs,
    }
