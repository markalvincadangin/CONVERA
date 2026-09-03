"""
Research Intelligence Router for CONVERA.
Endpoints for generating the Literature Matrix, identifying research gaps,
and formulating DSR problem briefs for computing capstones.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from storage.factory import get_storage
from engines.literature_matrix import LiteratureMatrixEngine
from engines.research_client import FreeResearchClient

router = APIRouter(prefix="/api/research", tags=["Research Intelligence & Literature Matrix"])

class GenerateMatrixRequest(BaseModel):
    query: str
    limit: int = Field(8, ge=2, le=25)
    project_id: Optional[str] = "default_proj"

class SynthesizeGapsRequest(BaseModel):
    query: str
    matrix_rows: Optional[List[Dict[str, Any]]] = None

@router.post("/matrix/generate")
async def generate_literature_matrix(req: GenerateMatrixRequest):
    client = FreeResearchClient()
    sources = await client.search_all_async(req.query, limit_per_source=max(2, req.limit // 3))
    
    engine = LiteratureMatrixEngine()
    result = engine.build_literature_matrix(sources)
    return result

@router.post("/gaps/synthesize")
async def synthesize_research_gaps(req: SynthesizeGapsRequest):
    engine = LiteratureMatrixEngine()
    if req.matrix_rows:
        matrix = {"matrix_rows": req.matrix_rows}
    else:
        client = FreeResearchClient()
        sources = await client.search_all_async(req.query, limit_per_source=3)
        matrix = engine.build_literature_matrix(sources)

    return {
        "query": req.query,
        "gaps": matrix.get("synthesized_gaps", []),
        "count": len(matrix.get("synthesized_gaps", []))
    }
