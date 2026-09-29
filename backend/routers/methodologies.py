"""
CONVERA Methodologies Router
============================
Governed by: CONVERA Concept Development Standard (CCDS v2.0)
Core Axiom: Knowledge != Workflow

Canonical API endpoints for methodology discovery and contract retrieval,
powered by authoritative MethodologyContract instances.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from contracts.methodology import list_methodologies, get_methodology_contract

router = APIRouter(prefix="/api/methodologies", tags=["Methodologies"])


@router.get("")
async def api_list_methodologies():
    """List all registered CONVERA methodology tracks (Innovation, Research)."""
    return {"methodologies": list_methodologies()}


@router.get("/{methodology_id}")
async def api_get_methodology(methodology_id: str):
    """Retrieve full contract specification, stages, gates, and metadata for a methodology."""
    contract = get_methodology_contract(methodology_id)
    if not contract:
        raise HTTPException(status_code=404, detail=f"Methodology contract '{methodology_id}' not found")
    return contract.model_dump()
