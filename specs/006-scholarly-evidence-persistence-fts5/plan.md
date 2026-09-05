# CONVERA SDD-006: Architectural Implementation Plan
**Scholarly Evidence Persistence & Native Lexical Retrieval (SQLite FTS5 / BM25)**

**Specification ID**: CONVERA-SDD-006  
**Classification**: Technical & Architectural Implementation Plan  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [RATIFIED & AUTHORIZED FOR IMPLEMENTATION]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `dac0f0f6e7e252dbcf036417441dd92b4d56d2cd`  
**Proposed Feature Branch**: `feature/006-scholarly-evidence-persistence-fts5`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/006-scholarly-evidence-persistence-fts5/spec.md`  
- `docs/00-foundation/CONSTITUTION.md`  
- `docs/02-system/ARCHITECTURE.md`  
- `docs/04-ai/AI_ARCHITECTURE.md`  

---

## 1. System Boundary & Component Architecture

SDD-006 modifies strictly the persistence, retrieval, and research agent ingestion components within the backend:

```text
External Academic APIs (OpenAlex, Semantic Scholar, Crossref, PubMed)
       │
       ▼
Federated Connector Hub (backend/connectors/hub.py)
 ├── Ingestion & Normalization (NormalizedScholarlyWork)
 ├── Auto-Persistence Hook (storage.upsert_scholarly_works)
 └── Offline Resilience Router (Falls back to local FTS5 if APIs fail; stamps is_cached=True)
       │
       ▼
SQLite Storage Layer (backend/storage/sqlite_adapter.py)
 ├── Relational Table: scholarly_works (Full text, untruncated abstract, metadata)
 ├── FTS5 Virtual Table: scholarly_works_fts (External content table; Porter stemming + unicode61)
 ├── Synchronized DB Triggers (INSERT / UPDATE / DELETE lifecycle + 'rebuild' support)
 └── Lexical Retrieval Engine: search_scholarly_works_fts (Native BM25 + Citation Weighting)
       │
       ▼
Downstream Research Workflows
 ├── Research Agent (backend/agents/research_agent.py: Full abstract context injection)
 ├── Literature Matrix (backend/routers/research.py: Local matrix synthesis)
 └── Epistemic Evidence Ledgers (CIIA v1.0 provenance preservation; non-elevated cached tier)
```

---

## 2. Staged Implementation Architecture

Implementation is structured across 5 strictly sequential stages:

### Stage 1: Storage Layer Schema, Triggers & Ingestion Protocol
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Add table definition for `scholarly_works` with indexes on `doi`, `year`, `source_connector`.
  2. Add external content FTS5 virtual table `scholarly_works_fts(title, abstract, venue, content='scholarly_works', content_rowid='rowid', tokenize='porter unicode61 remove_diacritics 1')`.
  3. Add 3 database triggers (`trg_scholarly_works_ai`, `trg_scholarly_works_ad`, `trg_scholarly_works_au`) for automatic index maintenance.
  4. Implement two-stage conflict resolution in `upsert_scholarly_works(works)`:
     - Stage 1: Preflight lookup by `doi` or title-year hash ID `SW-TTL-...`.
     - Stage 2: `INSERT ... ON CONFLICT(id) DO UPDATE SET ...` to guarantee 100% idempotent updates for both DOI and DOI-less records.
  5. Implement `search_scholarly_works_fts(query: str, limit: int = 10)` utilizing composite ranking:
     $$S_{\text{retrieval}} = (-\text{bm25}(5.0, 2.0, 1.0)) \times \log_{10}(10 + \text{citation\_count})$$
  6. Implement `rebuild_scholarly_fts()` calling `INSERT INTO scholarly_works_fts(scholarly_works_fts) VALUES('rebuild')`.

### Stage 2: Connector Hub Auto-Persistence & Offline Routing
- **Target File**: `backend/connectors/hub.py`
- **Actions**:
  1. Update `ConnectorHub.federated_search()`:
     - Bulk-upsert deduplicated works via `storage.upsert_scholarly_works(deduped_works)`.
     - Assign canonical database `id` to each returned `NormalizedScholarlyWork`.
  2. Implement offline fallback with strict epistemic preservation (`INV-006-EPISTEMIC`):
     - Catch connector exceptions/network failures.
     - Call `storage.search_scholarly_works_fts(query)`.
     - Stamp fallback records with `is_offline = True`, `is_cached = True`, `cached_at = <timestamp>`.
     - Preserve original source authority tier (do NOT upgrade to `EMPIRICAL`).

### Stage 3: Research Agent Context Optimization
- **Target File**: `backend/agents/research_agent.py`
- **Actions**:
  1. Remove artificial abstract truncation `w.abstract[:400]`.
  2. Format dossier using full abstracts (up to 2,000 characters per paper to respect prompt token budgets).
  3. Include persistent `scholarly_work_id` in extracted claims and evidence candidate references.

### Stage 4: Historical Data Backfill Routine (`problem_sources`: 180 rows)
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Scan existing `problem_sources` records (180 measured rows).
  2. Extract academic titles, URLs, and summaries; populate stub records into `scholarly_works`.
  3. Execute `rebuild_scholarly_fts()` to ensure 100% index synchrony across backfilled data.

### Stage 5: Verification & Automated Test Suite Tiering
- **Target Files**: `backend/tests/test_scholarly_persistence.py`, `backend/tests/test_connectors.py`
- **Actions**:
  1. Implement dedicated FTS5 lifecycle tests:
     - `test_fts5_insert_lifecycle`
     - `test_fts5_update_lifecycle`
     - `test_fts5_delete_lifecycle`
     - `test_fts5_rebuild_command`
  2. Implement DOI-less deduplication tests:
     - `test_doi_less_deduplication_idempotency`
     - `test_doi_enrichment_of_doi_less_record`
  3. Implement offline epistemic tagging test:
     - `test_offline_fallback_epistemic_marking`
  4. Verify offline regression suite execution time remains $\le 10$ seconds `[ENGINEERING TARGET]`.

---

## 3. File Modification Matrix

| Component | File Path | Scope of Change | Classification |
| :--- | :--- | :--- | :--- |
| **Storage Engine** | `backend/storage/sqlite_adapter.py` | Schema addition, triggers, rebuild method, `upsert_scholarly_works`, `search_scholarly_works_fts`. | **CORE** |
| **Connector Hub** | `backend/connectors/hub.py` | Auto-persistence hook, offline FTS5 fallback with epistemic cached stamping. | **CORE** |
| **Research Agent** | `backend/agents/research_agent.py` | Full abstract context retention, persistent work ID linkage. | **INTEGRATION** |
| **Test Suite** | `backend/tests/test_scholarly_persistence.py` | 10 dedicated unit & integration verification tests. | **NEW TEST** |
| **Test Suite** | `backend/tests/test_connectors.py` | Connector hub offline fallback tests. | **VERIFICATION** |

---

## 4. Invariant Preservation & Anti-Creep Guarantees

1. **Zero New Dependencies**: No entries added to `backend/pyproject.toml` or `package.json`.
2. **Strict Scope Isolation**:
   - `DEF-DEV-007` (integration test timeout) remains separate.
   - `DEF-DATA-001` (Problem Bank duplicate storage bypass) is strictly excluded and logged.
   - `evidence_scorer.py` heuristic hardening is strictly separated for the subsequent scope.
3. **Rollback & Disaster Recovery**:
   - Dropping virtual table and triggers does not affect relational data in `scholarly_works`.
