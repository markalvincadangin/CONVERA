# CONVERA Data Model & Schemas: SDD-023
# Ecosystem Integrations & Research Dissemination Bridge (Phase E)

**Specification ID**: `CONVERA-SDD-023`  
**Feature Title**: Ecosystem Integrations & Research Dissemination Bridge (Phase E)  
**Authority Tier**: Tier 2 (Data Architecture & Schema Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  

---

## 1. Relational Database Schema: Table 38 (`ecosystem_sync_records`)

To maintain verifiable audit trails (Articles I & II) across external research disseminations, CONVERA adds Table 38 to its SQLite WAL schema:

```sql
CREATE TABLE IF NOT EXISTS ecosystem_sync_records (
    id TEXT PRIMARY KEY,                           -- UUID
    session_id TEXT NOT NULL,                     -- Foreign key to sessions
    provider TEXT NOT NULL,                       -- 'notion', 'zotero', 'github'
    action_type TEXT NOT NULL,                    -- 'export_proposal', 'export_citations', 'export_issues', 'import_notes'
    status TEXT NOT NULL,                         -- 'success', 'dry_run', 'failed'
    target_identifier TEXT,                       -- e.g., Notion Page ID, Zotero Collection Key, GitHub Repo
    items_count INTEGER NOT NULL DEFAULT 0,       -- Count of records synchronized
    state_hash TEXT NOT NULL,                     -- SHA-256 of the synchronized payload
    external_url TEXT,                            -- Direct URL to external resource (if online)
    error_message TEXT,                           -- Detailed error if failed
    metadata JSON DEFAULT '{}',                   -- Provider-specific execution metadata
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_sync_session ON ecosystem_sync_records(session_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_sync_provider ON ecosystem_sync_records(provider);
```

---

## 2. Pydantic Domain Schemas (`backend/models/ecosystem.py`)

### 2.1 Enums & Basic Types

```python
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class EcosystemProvider(str, Enum):
    NOTION = "notion"
    ZOTERO = "zotero"
    GITHUB = "github"

class SyncActionType(str, Enum):
    EXPORT_PROPOSAL = "export_proposal"
    EXPORT_CITATIONS = "export_citations"
    EXPORT_ISSUES = "export_issues"
    IMPORT_NOTES = "import_notes"

class SyncStatus(str, Enum):
    SUCCESS = "success"
    DRY_RUN = "dry_run"
    FAILED = "failed"
```

### 2.2 Export Payloads & Requests

```python
class NotionExportRequest(BaseModel):
    session_id: str
    target_page_id: Optional[str] = None
    target_database_id: Optional[str] = None
    include_literature_matrix: bool = True
    include_evidence_chain: bool = True
    dry_run: bool = False

class ZoteroExportRequest(BaseModel):
    session_id: str
    collection_name: Optional[str] = None
    format: str = Field("bibtex", description="'bibtex' or 'csl_json'")
    dry_run: bool = False

class GitHubExportRequest(BaseModel):
    session_id: str
    repository: Optional[str] = None  # "owner/repo"
    create_milestone: bool = True
    include_srs_specs: bool = True
    dry_run: bool = False

class NotionImportRequest(BaseModel):
    session_id: str
    source_page_id: Optional[str] = None
    source_database_id: Optional[str] = None
    sector: str = "Agriculture"
    limit: int = 20
```

### 2.3 Sync Results & Audit Records

```python
class EcosystemSyncResult(BaseModel):
    sync_id: str
    session_id: str
    provider: EcosystemProvider
    action_type: SyncActionType
    status: SyncStatus
    items_count: int
    state_hash: str
    preview_content: Optional[str] = None
    external_url: Optional[str] = None
    error_message: Optional[str] = None
    synced_at: str

class EcosystemAuditRecord(BaseModel):
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
```
