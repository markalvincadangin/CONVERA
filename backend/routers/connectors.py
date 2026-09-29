"""
CONVERA Connectors Router
=========================
Handles scholarly discovery, connector registry inspection, health monitoring,
scholarly ingestion into problem sources, and epistemic claim linking.
Governed by: CIIA v1.0 and SDD-015
"""

import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from connectors.hub import connector_hub

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/connectors", tags=["Connectors"])


def _get_storage():
    try:
        from storage import get_storage
        return get_storage()
    except Exception:
        from storage.sqlite_adapter import get_storage
        return get_storage()


class FederatedSearchRequest(BaseModel):
    query: str
    limit_per_source: Optional[int] = 5
    connector_ids: Optional[List[str]] = None


class IngestScholarlyWorkRequest(BaseModel):
    problem_id: str
    scholarly_work_id: Optional[str] = None
    work_payload: Optional[Dict[str, Any]] = None
    source_tier: Optional[str] = "A"
    evidence_type: Optional[str] = "ACADEMIC_LITERATURE"
    quote_or_summary: Optional[str] = None


class LinkClaimEvidenceRequest(BaseModel):
    claim_id: str
    source_id: int
    relation_type: Optional[str] = "SUPPORTS"
    evidence_strength: Optional[str] = "STRONG"
    rationale: Optional[str] = None


@router.get("")
async def list_connectors():
    """List all registered research and tool connectors."""
    connectors = await connector_hub.list_connectors()
    return {"connectors": connectors}


@router.get("/health")
async def check_connectors_health():
    """Ping all registered connectors and report health/latency."""
    health_reports = await connector_hub.check_all_health()
    return {"health": health_reports}


@router.post("/search")
async def federated_search(req: FederatedSearchRequest):
    """Perform deduplicated search across registered academic connectors with offline fallback."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    results = await connector_hub.federated_search(
        query=req.query.strip(),
        limit_per_source=req.limit_per_source or 5,
        connector_ids=req.connector_ids,
    )
    return {
        "query": req.query,
        "count": len(results),
        "results": [r.model_dump() for r in results],
    }


@router.post("/ingest")
async def ingest_scholarly_work(req: IngestScholarlyWorkRequest):
    """
    Ingest a discovered scholarly work into a problem's persistent sources.
    Links the scholarly work to the problem record in SQLite WAL storage.
    """
    storage = _get_storage()
    problem = storage.get_problem(req.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{req.problem_id}' not found.")

    work_id = req.scholarly_work_id
    work_record = None

    if work_id:
        work_record = storage.get_scholarly_work(work_id)

    # If work is not yet persisted in SQLite but raw payload is provided, upsert it
    if not work_record and req.work_payload:
        upserted = storage.upsert_scholarly_works([req.work_payload])
        if upserted:
            work_id = upserted[0]["id"]
            work_record = storage.get_scholarly_work(work_id)

    source_name = (
        work_record.get("title")
        if work_record
        else (req.work_payload.get("title") if req.work_payload else "Scholarly Publication")
    )
    source_url = (
        work_record.get("source_url")
        if work_record
        else (req.work_payload.get("url") if req.work_payload else None)
    )

    source_data = {
        "source_name": source_name,
        "source_url": source_url,
        "source_tier": req.source_tier or "A",
        "evidence_type": req.evidence_type or "ACADEMIC_LITERATURE",
        "quote_or_summary": req.quote_or_summary or (work_record.get("abstract") if work_record else ""),
        "scholarly_work_id": work_id,
    }

    new_source = storage.add_problem_source(problem_id=req.problem_id, source=source_data)
    return {
        "success": True,
        "problem_id": req.problem_id,
        "source": new_source,
    }


@router.post("/link-claim")
async def link_claim_evidence(req: LinkClaimEvidenceRequest):
    """
    Bind an ingested problem source to a problem claim with explicit epistemic relation
    (SUPPORTS, CONTRADICTS, CONTEXTUALIZES) and evidence strength.
    """
    storage = _get_storage()
    link_fn = getattr(storage, "link_claim_evidence", None) or getattr(storage, "link_evidence_to_claim", None)
    if not link_fn:
        raise HTTPException(status_code=500, detail="Storage adapter missing claim evidence linking capability.")

    link_record = link_fn(
        claim_id=req.claim_id,
        source_id=req.source_id,
        relation_type=req.relation_type or "SUPPORTS",
        evidence_strength=req.evidence_strength or "STRONG",
        rationale=req.rationale,
    )


    # If evidence supports the claim, update the claim status if needed
    if (req.relation_type or "SUPPORTS").upper() == "SUPPORTS":
        try:
            storage.update_claim_status(
                claim_id=req.claim_id,
                status="VALIDATED",
                evidence_notes=req.rationale or "Empirically validated via peer-reviewed scholarly citation.",
            )
        except Exception as e:
            logger.warning(f"Could not auto-update claim status: {e}")

    return {
        "success": True,
        "link": link_record,
    }


@router.get("/problem/{problem_id}/sources")
async def get_problem_sources(problem_id: str):
    """
    Retrieve all sources attached to a problem with joined scholarly_works metadata
    and their associated claim evidence links.
    """
    storage = _get_storage()
    sources = storage.get_problem_sources_with_links(problem_id)
    return {
        "problem_id": problem_id,
        "sources": sources,
        "count": len(sources),
    }


@router.get("/problem/{problem_id}/claims")
async def get_problem_claims(problem_id: str):
    """
    Retrieve all claims associated with a given problem.
    """
    storage = _get_storage()
    kg = storage.get_problem_knowledge_graph(problem_id) if hasattr(storage, "get_problem_knowledge_graph") else {}
    claims = kg.get("claims", []) if isinstance(kg, dict) else []
    return {
        "problem_id": problem_id,
        "claims": claims,
        "count": len(claims),
    }

