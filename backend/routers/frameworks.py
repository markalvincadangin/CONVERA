"""
CONVERA Frameworks Router
=========================
Handles multi-framework discovery, specification retrieval, and criteria inspection.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from engines.framework_engine import list_frameworks, get_framework

router = APIRouter(prefix="/api/frameworks", tags=["Frameworks"])


@router.get("")
async def api_list_frameworks():
    """List all registered CONVERA frameworks (Innovation, Research, Capstone, Product)."""
    return {"frameworks": list_frameworks()}


@router.get("/{framework_id}")
async def api_get_framework(framework_id: str):
    """Retrieve full specification, stages, activities, and gates for a framework."""
    fw = get_framework(framework_id)
    if not fw:
        raise HTTPException(status_code=404, detail=f"Framework '{framework_id}' not found")
    return fw.model_dump()
