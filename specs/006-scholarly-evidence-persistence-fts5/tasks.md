# CONVERA SDD-006: Work Breakdown & Implementation Tasks
**Scholarly Evidence Persistence & Native Lexical Retrieval (SQLite FTS5 / BM25)**

**Specification ID**: CONVERA-SDD-006  
**Classification**: Work Breakdown & Implementation Tasks  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [RATIFIED & AUTHORIZED FOR IMPLEMENTATION]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `dac0f0f6e7e252dbcf036417441dd92b4d56d2cd`  
**Proposed Feature Branch**: `feature/006-scholarly-evidence-persistence-fts5`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/006-scholarly-evidence-persistence-fts5/spec.md`  
- `specs/006-scholarly-evidence-persistence-fts5/plan.md`  

---

## 1. Task Breakdown & Execution Sequence

```text
[Phase 1: SQLite Storage Schema, Triggers & Ingestion Protocol]
       │
       ▼
   TASK-006-01: Implement scholarly_works schema, FTS5 external content table, and sync triggers in sqlite_adapter.py
       │
       ▼
   TASK-006-02: Implement two-stage upsert_scholarly_works (DOI + DOI-less hash idempotency) and search_scholarly_works_fts
       │
       ▼
   TASK-006-03: Implement rebuild_scholarly_fts helper in sqlite_adapter.py
       │
       ▼
[Phase 2: Historical Data Backfill]
       │
       ▼
   TASK-006-04: Implement backfill routine from 180 problem_sources rows into scholarly_works with post-backfill rebuild
       │
       ▼
[Phase 3: Connector Hub Persistence & Epistemic Offline Routing]
       │
       ▼
   TASK-006-05: Hook federated_search to auto-persist works and assign persistent IDs
       │
       ▼
   TASK-006-06: Implement graceful offline fallback in ConnectorHub stamping is_offline=True, is_cached=True without tier elevation
       │
       ▼
[Phase 4: Research Agent Context Retention]
       │
       ▼
   TASK-006-07: Remove 400-char truncation in research_agent.py and format full abstract dossier
       │
       ▼
[Phase 5: Automated Verification Suite]
       │
       ▼
   TASK-006-08: Author test_scholarly_persistence.py (FTS5 lifecycle, DOI-less upsert, offline epistemic tests)
       │
       ▼
   TASK-006-09: Execute offline regression suite (Tier 1 + Tier 2) and verify zero drift
```

---

## 2. Detailed Task Specifications

### TASK-006-01: SQLite Schema, Virtual Table & Synchronized Triggers
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Dependency**: None
- **Description**: Add `scholarly_works` table, `scholarly_works_fts` external content virtual table (`content='scholarly_works'`), and 3 sync triggers (`trg_scholarly_works_ai`, `trg_scholarly_works_ad`, `trg_scholarly_works_au`) inside `_init_db()`.
- **Verification**: Verify table, virtual table, and triggers exist via SQLite pragma queries.

### TASK-006-02: Two-Stage Upsert & BM25 Lexical Retrieval
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Dependency**: `TASK-006-01`
- **Description**: Implement:
  - `upsert_scholarly_works(works: List[Dict[str, Any]]) -> List[Dict[str, Any]]`:
    - Stage 1: Preflight lookup by `doi` or `id` (`SW-TTL-...`).
    - Stage 2: `INSERT ... ON CONFLICT(id) DO UPDATE SET ...` to handle both DOI and DOI-less records idempotently.
  - `search_scholarly_works_fts(query: str, limit: int = 10) -> List[Dict[str, Any]]` utilizing composite $(-\text{bm25}) \times \log_{10}(10 + \text{citation\_count})$.
  - `get_scholarly_work(work_id: str) -> Optional[Dict[str, Any]]`.
- **Verification**: Insert DOI and DOI-less records; verify exact retrieval and ranking order.

### TASK-006-03: FTS5 Rebuild Command Helper
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Dependency**: `TASK-006-01`
- **Description**: Implement `rebuild_scholarly_fts()` executing `INSERT INTO scholarly_works_fts(scholarly_works_fts) VALUES('rebuild')`.
- **Verification**: Corrupt or clear FTS5 rows manually; run rebuild; verify all rows restored in index.

### TASK-006-04: Historical Problem Sources Backfill
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Dependency**: `TASK-006-02`, `TASK-006-03`
- **Description**: Add migration helper that scans the 180 existing `problem_sources` records, normalizes academic references, populates `scholarly_works` idempotently, and triggers index rebuild.
- **Verification**: Check count of `scholarly_works` matches valid source entries and FTS5 search finds them.

### TASK-006-05: ConnectorHub Auto-Persistence Hook
- **Target File**: `backend/connectors/hub.py`
- **Dependency**: `TASK-006-02`
- **Description**: In `ConnectorHub.federated_search()`, convert deduplicated works into storage records, call `storage.upsert_scholarly_works()`, and attach permanent database `id` to returned works.
- **Verification**: Call `federated_search()`; verify newly fetched works appear in SQLite.

### TASK-006-06: ConnectorHub Offline Fallback with Epistemic Non-Elevation
- **Target File**: `backend/connectors/hub.py`
- **Dependency**: `TASK-006-05`
- **Description**: Wrap external connector calls in try/except; on complete connector failure/network disconnect, return results from `storage.search_scholarly_works_fts()` stamped with `is_offline = True`, `is_cached = True`, without upgrading authority tier.
- **Verification**: Mock external connectors with network errors; verify search returns cached works with correct epistemic tags.

### TASK-006-07: Research Agent Full Abstract Context Injection
- **Target File**: `backend/agents/research_agent.py`
- **Dependency**: `TASK-006-05`
- **Description**: Eliminate `w.abstract[:400]`; format dossier with full abstracts (capped at 2,000 chars per work for prompt budget); pass `work_id` into claim extraction prompt.
- **Verification**: Verify formatted dossier length and empirical extraction accuracy.

### TASK-006-08: Scholarly Persistence Test Suite
- **Target File**: `backend/tests/test_scholarly_persistence.py`
- **Dependency**: `TASK-006-01` through `TASK-006-07`
- **Description**: Implement comprehensive test suite covering:
  - FTS5 insert, update, delete, and rebuild lifecycle.
  - DOI-less deduplication idempotency and DOI enrichment.
  - Offline fallback epistemic tagging.
  - Full abstract retention and stemmed BM25 ranking.
- **Verification**: `./backend/.venv/bin/pytest backend/tests/test_scholarly_persistence.py -v`.

### TASK-006-09: Full Regression Suite & Performance Check
- **Target File**: Whole repository
- **Dependency**: `TASK-006-08`
- **Description**: Run complete offline test suite (`npm run test:backend:unit` and `npm run test:backend:integration`); verify runtime $\le 10$ seconds `[ENGINEERING TARGET]` and zero regressions.
- **Verification**: `./backend/.venv/bin/pytest backend/tests -m "not live"`.
