"""
CONVERA Document Intelligence & Inbox Router
============================================
Handles qualitative note parsing, interview transcript claim extraction,
and portfolio duplicate/similarity detection.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from engines.document_parser import parse_and_extract_document
from engines.similarity_engine import check_portfolio_similarity
from storage import get_storage

router = APIRouter(tags=["Document Intelligence & Inbox"])


class DocumentIngestRequest(BaseModel):
    raw_content: str
    source_name: Optional[str] = "Research Inbox Note"
    source_url: Optional[str] = None
    doi: Optional[str] = None
    authority_tier: Optional[str] = "FIELD_INTERVIEW"


class SimilarityCheckRequest(BaseModel):
    problem_statement: str
    sector: Optional[str] = None
    candidate_id: Optional[str] = "CANDIDATE"
    session_id: Optional[str] = None


@router.post("/api/inbox/ingest")
async def api_inbox_ingest(req: DocumentIngestRequest):
    """Parse unstructured text into grounded problem claims and evidence candidates."""
    if not req.raw_content.strip():
        raise HTTPException(status_code=400, detail="Raw content cannot be empty")
    
    result = await parse_and_extract_document(
        raw_content=req.raw_content.strip(),
        source_name=req.source_name or "Research Inbox Note",
        source_url=req.source_url,
        doi=req.doi,
        authority_tier=req.authority_tier or "FIELD_INTERVIEW"
    )
    return result.model_dump()


@router.post("/api/similarity/check")
async def api_check_similarity(req: SimilarityCheckRequest):
    """Analyze a candidate statement against existing Problem Bank items to detect duplicates/similarities."""
    if not req.problem_statement.strip():
        raise HTTPException(status_code=400, detail="Problem statement cannot be empty")
    storage = get_storage()
    existing_problems = storage.list_problems()
    result = check_portfolio_similarity(
        candidate={
            "id": req.candidate_id,
            "problem_statement": req.problem_statement,
            "sector": req.sector or ""
        },
        existing_problems=existing_problems
    )
    return result
