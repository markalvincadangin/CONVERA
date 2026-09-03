"""
CONVERA Export & Circumscription Router
======================================
Endpoints for circumscription iteration tracking and DSR proposal compilation.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from engines.circumscription_engine import CircumscriptionEngine
from engines.proposal_exporter import ProposalExporter

router = APIRouter(prefix="/api", tags=["Circumscription & Export"])

class RecordIterationRequest(BaseModel):
    project_id: str = "default_proj"
    session_id: Optional[str] = None
    artifact_name: str = "DSR Artifact Model"
    test_run_name: str = "Benchmark Run"
    metric_name: str = "Accuracy (%)"
    observed_value: float = Field(..., description="Observed quantitative metric value")
    target_value: float = Field(..., description="Target threshold")
    failure_mode: Optional[str] = ""
    constraint_extracted: Optional[str] = ""
    target_phase_loopback: str = "PHASE_D"

@router.post("/circumscription/iterations")
async def record_circumscription_iteration(req: RecordIterationRequest):
    engine = CircumscriptionEngine()
    record = engine.record_iteration(
        project_id=req.project_id,
        artifact_name=req.artifact_name,
        test_run_name=req.test_run_name,
        metric_name=req.metric_name,
        observed_value=req.observed_value,
        target_value=req.target_value,
        failure_mode=req.failure_mode or "",
        constraint_extracted=req.constraint_extracted or "",
        target_phase_loopback=req.target_phase_loopback,
        session_id=req.session_id
    )
    return {"status": "recorded", "iteration": record}

@router.get("/circumscription/iterations")
async def get_circumscription_summary(project_id: str = "default_proj"):
    engine = CircumscriptionEngine()
    return engine.get_iteration_summary(project_id=project_id)

@router.get("/export/dsr-proposal")
async def export_dsr_proposal(project_id: str = "default_proj"):
    exporter = ProposalExporter()
    return exporter.generate_dsr_proposal_markdown(project_id=project_id)
