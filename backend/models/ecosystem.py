"""
CONVERA Ecosystem Integration Models (SDD-023)
==============================================
Pydantic domain models for bi-directional research dissemination with Notion, Zotero, and GitHub.
Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class EcosystemProvider(str, Enum):
    """External researcher toolchain provider."""
    NOTION = "notion"
    ZOTERO = "zotero"
    GITHUB = "github"


class SyncActionType(str, Enum):
    """Semantic action performed by the ecosystem bridge."""
    EXPORT_PROPOSAL = "export_proposal"
    EXPORT_CITATIONS = "export_citations"
    EXPORT_ISSUES = "export_issues"
    IMPORT_NOTES = "import_notes"


class SyncStatus(str, Enum):
    """Execution status of the external sync operation."""
    SUCCESS = "success"
    DRY_RUN = "dry_run"
    FAILED = "failed"


class NotionExportRequest(BaseModel):
    """Request to export proposal canvas or literature matrix to Notion."""
    session_id: str = Field(..., description="Target CONVERA research session ID")
    target_page_id: Optional[str] = Field(None, description="Target Notion parent page ID")
    target_database_id: Optional[str] = Field(None, description="Target Notion database ID")
    include_literature_matrix: bool = Field(True, description="Whether to include literature matrix table")
    include_evidence_chain: bool = Field(True, description="Whether to include evidence chain DAG summary")
    dry_run: bool = Field(False, description="Preview payload without making external API requests")


class NotionImportRequest(BaseModel):
    """Request to ingest research notes from Notion into CONVERA Problem Bank."""
    session_id: str = Field(..., description="Target CONVERA research session ID")
    source_page_id: Optional[str] = Field(None, description="Source Notion page ID to read")
    source_database_id: Optional[str] = Field(None, description="Source Notion database ID to query")
    sector: str = Field("Agriculture", description="Default sector categorization")
    limit: int = Field(20, ge=1, le=100, description="Maximum items to ingest")


class ZoteroExportRequest(BaseModel):
    """Request to export scholarly literature to a Zotero collection."""
    session_id: str = Field(..., description="CONVERA research session ID")
    collection_name: Optional[str] = Field(None, description="Target collection name in Zotero")
    format: str = Field("bibtex", description="'bibtex' or 'csl_json'")
    dry_run: bool = Field(False, description="Preview citations without making external API requests")


class GitHubExportRequest(BaseModel):
    """Request to export DSR technical specifications & requirements as GitHub Issues."""
    session_id: str = Field(..., description="CONVERA research session ID")
    repository: Optional[str] = Field(None, description="Target GitHub repository (e.g. 'org/repo')")
    create_milestone: bool = Field(True, description="Whether to group issues under a research milestone")
    milestone_title: Optional[str] = Field(None, description="Milestone title (defaults to project name)")
    include_srs_specs: bool = Field(True, description="Whether to include SRS requirements")
    dry_run: bool = Field(False, description="Preview issues manifest without posting to GitHub")


class EcosystemSyncResult(BaseModel):
    """Structured response detailing the result of an external sync event."""
    sync_id: str = Field(..., description="Unique sync operation identifier")
    session_id: str = Field(..., description="Associated research session ID")
    provider: EcosystemProvider = Field(..., description="Ecosystem provider")
    action_type: SyncActionType = Field(..., description="Action executed")
    status: SyncStatus = Field(..., description="Execution outcome")
    items_count: int = Field(0, description="Count of entities synchronized")
    state_hash: str = Field(..., description="Deterministic SHA-256 hash of the synchronized payload")
    preview_content: Optional[str] = Field(None, description="Formatted preview snippet (Markdown/BibTeX/JSON)")
    external_url: Optional[str] = Field(None, description="Direct URL to external page/repo if published")
    error_message: Optional[str] = Field(None, description="Error detail if failed")
    synced_at: str = Field(..., description="ISO 8601 timestamp")


class EcosystemAuditRecord(BaseModel):
    """Relational audit record stored in SQLite Table 38."""
    id: str
    session_id: str
    provider: str
    action_type: str
    status: str
    target_identifier: Optional[str] = None
    items_count: int
    state_hash: str
    external_url: Optional[str] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    synced_at: str
