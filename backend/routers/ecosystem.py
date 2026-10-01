"""
CONVERA Ecosystem Sync Router (SDD-023)
=======================================
FastAPI endpoints for bi-directional research dissemination with Notion, Zotero, and GitHub.
Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status

from models.ecosystem import (
    NotionExportRequest,
    NotionImportRequest,
    ZoteroExportRequest,
    GitHubExportRequest,
    EcosystemSyncResult,
    EcosystemAuditRecord,
)
from engines.ecosystem_sync_engine import EcosystemSyncEngine
from storage import get_storage


router = APIRouter(prefix="/api/ecosystem", tags=["Ecosystem Sync"])


def get_sync_engine() -> EcosystemSyncEngine:
    return EcosystemSyncEngine(storage=get_storage())


@router.post("/notion/export", response_model=EcosystemSyncResult)
async def export_notion(
    request: NotionExportRequest,
    engine: EcosystemSyncEngine = Depends(get_sync_engine),
):
    """
    Export research proposal canvas and literature matrix to Notion.
    """
    try:
        return await engine.export_to_notion(request.session_id, request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Notion export failed: {str(e)}",
        )


@router.post("/notion/import")
async def import_notion(
    request: NotionImportRequest,
    engine: EcosystemSyncEngine = Depends(get_sync_engine),
):
    """
    Ingest research notes from Notion into CONVERA Problem Bank.
    """
    try:
        return await engine.import_from_notion(request.session_id, request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Notion note import failed: {str(e)}",
        )


@router.post("/zotero/export", response_model=EcosystemSyncResult)
async def export_zotero(
    request: ZoteroExportRequest,
    engine: EcosystemSyncEngine = Depends(get_sync_engine),
):
    """
    Export session scholarly literature as formatted BibTeX or CSL-JSON reference bundle.
    """
    try:
        return await engine.export_to_zotero(request.session_id, request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Zotero export failed: {str(e)}",
        )


@router.post("/github/export", response_model=EcosystemSyncResult)
async def export_github(
    request: GitHubExportRequest,
    engine: EcosystemSyncEngine = Depends(get_sync_engine),
):
    """
    Translate DSR artifacts & SRS specifications into GitHub Issue batch manifests.
    """
    try:
        return await engine.export_to_github(request.session_id, request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"GitHub export failed: {str(e)}",
        )


@router.get("/audit-trail/{session_id}", response_model=List[EcosystemAuditRecord])
def get_audit_trail(
    session_id: str,
    engine: EcosystemSyncEngine = Depends(get_sync_engine),
):
    """
    Retrieve historical sync audit records for a research session with SHA-256 state hashes.
    """
    try:
        return engine.get_sync_history(session_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch ecosystem sync audit history: {str(e)}",
        )
