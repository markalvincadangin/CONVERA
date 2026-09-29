"""
CONVERA Frameworks Router (Backward-Compatibility Layer)
========================================================
Governed by: CONVERA Concept Development Standard (CCDS v2.0)

Backward-compatible endpoints for /api/frameworks, delegating directly
to authoritative MethodologyContract instances.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from contracts.methodology import list_methodologies, get_methodology_contract

router = APIRouter(prefix="/api/frameworks", tags=["Frameworks (Compatibility)"])


@router.get("")
async def api_list_frameworks():
    """List all registered CONVERA frameworks (delegated to contracts.methodology)."""
    return {"frameworks": list_methodologies()}


@router.get("/{framework_id}")
async def api_get_framework(framework_id: str):
    """Retrieve full specification, stages, activities, and gates for a framework."""
    contract = get_methodology_contract(framework_id)
    if not contract:
        raise HTTPException(status_code=404, detail=f"Framework '{framework_id}' not found")
    return contract.model_dump()
