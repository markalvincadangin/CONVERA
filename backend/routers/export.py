"""
CONVERA Export & Circumscription Router (SDD-020 Upgrade)
=========================================================
Endpoints for circumscription iteration tracking and multi-format DSR proposal compilation:
- Markdown (.md)
- LaTeX (.tex)
- BibTeX (.bib)
- Printable HTML (.html)
- Provenance JSON (.json)
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from engines.circumscription_engine import CircumscriptionEngine
from engines.proposal_exporter import ProposalExporter
from models.export import (
    ExportFormat,
    DSRProposalCompilationRequest,
    DSRProposalCompilationResponse,
)

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
        session_id=req.session_id,
    )
    return {"status": "recorded", "iteration": record}


@router.get("/circumscription/iterations")
async def get_circumscription_summary(project_id: str = "default_proj"):
    engine = CircumscriptionEngine()
    return engine.get_iteration_summary(project_id=project_id)


@router.get("/export/dsr-proposal")
async def export_dsr_proposal(
    project_id: str = Query("default_proj"),
    session_id: Optional[str] = Query(None),
    problem_id: Optional[str] = Query(None),
    format: ExportFormat = Query(ExportFormat.MARKDOWN),
):
    """
    Exports the compiled DSR proposal in the requested format with backward-compatible fields.
    """
    exporter = ProposalExporter()
    req = DSRProposalCompilationRequest(
        project_id=project_id,
        session_id=session_id,
        problem_id=problem_id,
        format=format,
    )
    compiled = exporter.compile_proposal(req)
    
    # Return backward-compatible response dictionary
    resp = compiled.model_dump()
    resp["document_type"] = "DSR_CAPSTONE_PROPOSAL"
    resp["markdown_content"] = compiled.content if format == ExportFormat.MARKDOWN else compiled.auxiliary_files.get("proposal.md", compiled.content)
    return resp


@router.post("/export/compile", response_model=DSRProposalCompilationResponse)
async def compile_proposal_endpoint(req: DSRProposalCompilationRequest):
    """
    Fine-grained proposal compilation endpoint supporting LaTeX, BibTeX, HTML, JSON, and BUNDLE.
    """
    exporter = ProposalExporter()
    return exporter.compile_proposal(req)


@router.get("/export/bibtex", response_class=PlainTextResponse)
async def export_bibtex_endpoint(
    project_id: str = Query("default_proj"),
    session_id: Optional[str] = Query(None),
    problem_id: Optional[str] = Query(None),
):
    """
    Generates and returns the BibTeX bibliography (.bib) file directly.
    """
    exporter = ProposalExporter()
    req = DSRProposalCompilationRequest(
        project_id=project_id,
        session_id=session_id,
        problem_id=problem_id,
        format=ExportFormat.BIBTEX,
    )
    compiled = exporter.compile_proposal(req)
    return PlainTextResponse(
        compiled.content,
        media_type="application/x-bibtex",
        headers={"Content-Disposition": f'attachment; filename="references_{project_id}.bib"'},
    )
