# CONVERA SDD-015: Data Model & Schema Specification
# Scholarly Ingestion & Live Connectors (CIIA v1.0 Relational Contracts)

**Specification ID**: CONVERA-SDD-015  
**Classification**: Data Model, Entity Relational Contracts & API Payloads  
**Authority Tier**: Tier 2 (Technical Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/015-scholarly-ingestion-connectors`  
**Target Integration Branch**: `develop`  

---

## 1. Pydantic Domain Models (`backend/connectors/base.py` & `backend/routers/connectors.py`)

### 1.1 `ProvenanceMetadata`
Represents the cryptographic and methodological lineage of any retrieved piece of external literature.

```python
class ProvenanceMetadata(BaseModel):
    source_name: str
    source_url: Optional[str] = None
    doi: Optional[str] = None
    retrieval_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    authority_tier: str = "PEER_REVIEWED"  # PEER_REVIEWED, OFFICIAL_DATA, FIELD_INTERVIEW, WEB_SIGNAL, BENCHMARK
    methodology_notes: Optional[str] = None
```

### 1.2 `NormalizedScholarlyWork`
The universal scholarly work representation across all external connectors (OpenAlex, Semantic Scholar, Crossref, PubMed).

```python
class NormalizedScholarlyWork(BaseModel):
    id: Optional[str] = None
    doi: Optional[str] = None
    title: str
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    venue: Optional[str] = None
    citation_count: int = 0
    influential_citation_count: Optional[int] = 0
    abstract: Optional[str] = None
    url: Optional[str] = None
    open_access_pdf_url: Optional[str] = None
    topics: List[str] = Field(default_factory=list)
    provenance: ProvenanceMetadata
    is_offline: bool = False
    is_cached: bool = False
```

### 1.3 Ingestion & Claim Linking API Payloads

```python
class FederatedSearchRequest(BaseModel):
    query: str
    limit_per_source: Optional[int] = 5
    connector_ids: Optional[List[str]] = None

class IngestScholarlyWorkRequest(BaseModel):
    problem_id: str
    scholarly_work_id: Optional[str] = None
    # In case work is not yet persisted:
    work_payload: Optional[NormalizedScholarlyWork] = None
    source_tier: Optional[str] = "A"  # Tier A: Peer-reviewed, Tier B: Industry/Govt, Tier C: Gray
    evidence_type: Optional[str] = "ACADEMIC_LITERATURE"
    quote_or_summary: Optional[str] = None

class LinkClaimEvidenceRequest(BaseModel):
    claim_id: str
    source_id: int
    relation_type: str = "SUPPORTS"  # SUPPORTS, CONTRADICTS, CONTEXTUALIZES
    evidence_strength: str = "STRONG"  # WEAK, MODERATE, STRONG
    rationale: Optional[str] = None
```

---

## 2. Relational SQLite Schema Contracts

The canonical SQLite WAL storage schema coordinates the persistent evidence entities across 4 relational tables:

### 2.1 `scholarly_works` & `scholarly_works_fts` (From SDD-006)
```sql
CREATE TABLE IF NOT EXISTS scholarly_works (
    id TEXT PRIMARY KEY,
    doi TEXT,
    title TEXT NOT NULL,
    abstract TEXT,
    authors TEXT,          -- JSON serialized list of author names
    year INTEGER,
    venue TEXT,
    citation_count INTEGER DEFAULT 0,
    source_connector TEXT NOT NULL, -- 'openalex', 'semantic_scholar', 'crossref', etc.
    source_url TEXT,
    raw_metadata TEXT,     -- JSON serialized original provider payload
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scholarly_works_doi ON scholarly_works(doi);
CREATE INDEX IF NOT EXISTS idx_scholarly_works_year ON scholarly_works(year);
CREATE INDEX IF NOT EXISTS idx_scholarly_works_connector ON scholarly_works(source_connector);

CREATE VIRTUAL TABLE IF NOT EXISTS scholarly_works_fts USING fts5(
    title,
    abstract,
    venue,
    content='scholarly_works',
    content_rowid='rowid'
);
```

### 2.2 `problem_sources` (Ground Truth Link to Problem)
```sql
CREATE TABLE IF NOT EXISTS problem_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT,
    source_tier TEXT DEFAULT 'A',
    evidence_type TEXT,
    quote_or_summary TEXT,
    scholarly_work_id TEXT REFERENCES scholarly_works(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_problem_sources_problem_id ON problem_sources(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_sources_work_id ON problem_sources(scholarly_work_id);
```

### 2.3 `claim_evidence_links` (Epistemic Mediation from SDD-007)
```sql
CREATE TABLE IF NOT EXISTS claim_evidence_links (
    id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    relation_type TEXT NOT NULL DEFAULT 'SUPPORTS',   -- 'SUPPORTS', 'CONTRADICTS', 'CONTEXTUALIZES'
    evidence_strength TEXT NOT NULL DEFAULT 'STRONG', -- 'WEAK', 'MODERATE', 'STRONG'
    rationale TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES problem_claims(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES problem_sources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON claim_evidence_links(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_source ON claim_evidence_links(source_id);
```

---

## 3. Data Mapping & Schema Transformation Matrix

| Source Field (OpenAlex) | Source Field (Semantic Scholar) | Target Field (`NormalizedScholarlyWork`) | SQLite Storage Field (`scholarly_works`) |
|:---|:---|:---|:---|
| `doi` (stripped) | `externalIds.DOI` | `doi` | `scholarly_works.doi` |
| `title` | `title` | `title` | `scholarly_works.title` |
| `abstract_inverted_index` (reconstructed) | `abstract` | `abstract` | `scholarly_works.abstract` |
| `authorships[].author.display_name` | `authors[].name` | `authors` | `scholarly_works.authors` (JSON list) |
| `publication_year` | `year` | `year` | `scholarly_works.year` |
| `primary_location.source.display_name` | `venue` | `venue` | `scholarly_works.venue` |
| `cited_by_count` | `citationCount` | `citation_count` | `scholarly_works.citation_count` |
| N/A | `influentialCitationCount` | `influential_citation_count` | Included in `raw_metadata` |
| `open_access.oa_url` | `openAccessPdf.url` | `open_access_pdf_url` | Included in `raw_metadata` |
| `topics[].display_name` | N/A | `topics` | Included in `raw_metadata` |
| OpenAlex API metadata | Semantic Scholar Graph API | `provenance` | `source_connector`, `source_url` |
