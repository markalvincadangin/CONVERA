"""
CONVERA Connectors Router
=========================
Handles scholarly discovery, connector registry inspection, and health monitoring.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from connectors.hub import connector_hub

router = APIRouter(prefix="/api/connectors", tags=["Connectors"])


class FederatedSearchRequest(BaseModel):
    query: str
    limit_per_source: Optional[int] = 5
    connector_ids: Optional[List[str]] = None


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
    """Perform deduplicated search across registered academic connectors."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    results = await connector_hub.federated_search(
        query=req.query.strip(),
        limit_per_source=req.limit_per_source or 5,
        connector_ids=req.connector_ids
    )
    return {
        "query": req.query,
        "count": len(results),
        "results": [r.model_dump() for r in results]
    }
