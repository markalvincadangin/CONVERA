"""
CONVERA Provenance Router (SDD-022)
FastAPI endpoints for interactive evidence chain visualization, node lineage, and provenance export.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from storage.factory import get_storage
from storage.base import BaseStorageAdapter
from engines.provenance_graph_engine import ProvenanceGraphEngine
from models.provenance import (
    ProvenanceGraphPayload,
    ProvenanceFilterQuery,
)

router = APIRouter(
    prefix="/api/provenance",
    tags=["provenance"],
)


def get_provenance_engine(
    storage: BaseStorageAdapter = Depends(get_storage),
) -> ProvenanceGraphEngine:
    return ProvenanceGraphEngine(storage)


@router.get("/graph", response_model=ProvenanceGraphPayload)
def get_provenance_graph(
    session_id: str = Query(..., description="Research session ID"),
    min_confidence: float = Query(0.0, ge=0.0, le=1.0, description="Minimum confidence threshold"),
    stages: Optional[str] = Query(None, description="Comma-separated methodology stages (e.g. 'stage_a,stage_b')"),
    tiers: Optional[str] = Query(None, description="Comma-separated epistemic tiers (e.g. '0,1,2')"),
    include_orphans: bool = Query(True, description="Whether to include isolated nodes"),
    search: Optional[str] = Query(None, description="Search term for labels and descriptions"),
    engine: ProvenanceGraphEngine = Depends(get_provenance_engine),
):
    """
    Retrieve the multi-tier research provenance Directed Acyclic Graph (DAG) for a session.
    """
    parsed_stages = [s.strip() for s in stages.split(",") if s.strip()] if stages else None
    parsed_tiers = [int(t.strip()) for t in tiers.split(",") if t.strip().isdigit()] if tiers else None

    filters = ProvenanceFilterQuery(
        session_id=session_id,
        min_confidence=min_confidence,
        stages=parsed_stages,
        tiers=parsed_tiers,
        include_orphans=include_orphans,
        search_term=search,
    )

    try:
        return engine.build_provenance_graph(session_id, filters)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate provenance graph: {str(e)}",
        )


@router.get("/node/{node_id}")
def get_node_lineage(
    node_id: str,
    session_id: str = Query(..., description="Research session ID"),
    engine: ProvenanceGraphEngine = Depends(get_provenance_engine),
):
    """
    Retrieve direct ancestor and descendant lineage for a specific graph node.
    """
    lineage = engine.get_node_lineage(session_id, node_id)
    if "error" in lineage:
        raise HTTPException(status_code=404, detail=lineage["error"])
    return lineage


@router.get("/export/{session_id}")
def export_provenance_bundle(
    session_id: str,
    engine: ProvenanceGraphEngine = Depends(get_provenance_engine),
):
    """
    Export the canonical provenance graph JSON archive with SHA-256 integrity hash.
    """
    try:
        graph = engine.build_provenance_graph(session_id)
        payload = graph.model_dump()
        return JSONResponse(
            content=payload,
            headers={
                "Content-Disposition": f'attachment; filename="convera_provenance_{session_id}.json"',
                "X-CONVERA-State-Hash": graph.state_hash,
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export provenance bundle: {str(e)}",
        )
