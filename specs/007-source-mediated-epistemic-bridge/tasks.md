# CONVERA SDD-007: Work Breakdown & Implementation Tasks
**Source-Mediated Epistemic Bridge (Knowledge-Workflow Integration)**

**Specification ID**: CONVERA-SDD-007  
**Classification**: Work Breakdown & Implementation Tasks  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [IMPLEMENTED & VERIFIED — RATIFIED BY HUMAN]  
**Revision**: 1.0.0 (Ratified Implementation & Verification)  
**Baseline Git Commit**: `4592ebd63e1a5243cc329586a581f5281df32642` (main)  
**Proposed Feature Branch**: `feature/007-source-mediated-epistemic-bridge` (Proposed — Not Created)  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/007-source-mediated-epistemic-bridge/spec.md`
- `specs/007-source-mediated-epistemic-bridge/plan.md`

---

## 1. Task Dependency Graph & Execution Sequence

```text
[Phase 1: Remediation of Hard Data-Integrity Blocker]
       │
       ▼
   TASK-007-01: Refactor update_problem() to eliminate destructive DELETE and implement idempotent upsert [COMPLETED]
       │
       ▼
[Phase 2: Additive SQLite Schema Migration]
       │
       ▼
   TASK-007-02: Implement additive schema migration for problem_sources.scholarly_work_id in sqlite_adapter.py [COMPLETED]
       │
       ▼
[Phase 3: Storage Adapter Traversal Integration]
       │
       ▼
   TASK-007-03: Extend add_problem_sources() to accept and persist scholarly_work_id [COMPLETED]
       │
       ▼
   TASK-007-04: Extend list_claim_evidence_links() with 2-hop LEFT JOIN to scholarly_works [COMPLETED]
       │
       ▼
[Phase 4: Automated Verification Suite]
       │
       ▼
   TASK-007-05: Implement test_epistemic_bridge.py covering schema, foreign keys, and non-destructive upsert [COMPLETED]
       │
       ▼
   TASK-007-06: Implement vertical slice test verifying epistemic balance calculation and candidate scoring activation [COMPLETED]
       │
       ▼
[Phase 5: Regression & Boundary Verification]
       │
       ▼
   TASK-007-07: Execute full offline test suite (Tier 1 + Tier 2) verifying no test failures in offline regression suite [COMPLETED]
       │
       ▼
   TASK-007-08: Scope & anti-creep compliance audit (verify zero changes to excluded components) [COMPLETED]
```

---

## 2. Detailed Task Specifications

### `TASK-007-01`: Refactor `update_problem` to Non-Destructive Idempotent Upsert `[NORMATIVE]`
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Precondition**: Review lines 1680–1695 of `sqlite_adapter.py`.
- **Actions**:
  1. Remove `conn.execute("DELETE FROM problem_sources WHERE problem_id = ?", (problem_id,))`.
  2. Implement source matching algorithm following exact deterministic precedence:
     1. Explicit `id` (INTEGER) if provided.
     2. `scholarly_work_id` if present on the incoming source.
     3. Normalized `source_url` (case-insensitive, trailing slash stripped) when URL is non-empty.
     4. Composite key `source_name + quote_or_summary[:60]` when `source_url` is NULL.
     5. Ambiguous fallback matches (multiple rows matching fallback criteria) result in `INSERT` rather than a guessed `UPDATE` to prevent cross-linking.
  3. Update existing matched rows via `UPDATE problem_sources SET ... WHERE id = existing_id`.
  4. Insert truly new unmatched sources via `INSERT INTO problem_sources (...)`.
  5. Enforce deletion safeguard: raise `ValueError("Cannot delete problem source referenced by active claim evidence links without cascade_confirmed=True")` if an omitted source has active evidence links.
- **Pass Criteria**: `update_problem()` preserves existing `problem_sources.id` values. Ambiguous matches insert cleanly. Existing `claim_evidence_links` survive repeated problem updates without deletion.

---

### `TASK-007-02`: Implement Additive Schema Migration for `problem_sources.scholarly_work_id` `[NORMATIVE]`
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Precondition**: `TASK-007-01` completed.
- **Actions**:
  1. In `sqlite_adapter._init_db()`, query `PRAGMA table_info(problem_sources)` to inspect column existence.
  2. If `scholarly_work_id` is missing, execute:
     ```sql
     ALTER TABLE problem_sources ADD COLUMN scholarly_work_id TEXT REFERENCES scholarly_works(id) ON DELETE SET NULL;
     CREATE INDEX IF NOT EXISTS idx_problem_sources_sw ON problem_sources(scholarly_work_id);
     ```
  3. Ensure idempotency on repeated initialization.
- **Pass Criteria**: `scholarly_work_id` exists in table info; foreign key constraint is enforced; existing 180 rows remain intact with `NULL` value.

---

### `TASK-007-03`: Extend `add_problem_sources` to Persist `scholarly_work_id` `[NORMATIVE]`
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Precondition**: `TASK-007-02` completed.
- **Actions**:
  1. Update `add_problem_sources()` SQL insert statement to include `scholarly_work_id`.
  2. Map `s.get("scholarly_work_id")` from source dictionaries.
- **Pass Criteria**: Sources passed with `scholarly_work_id` persist the text key correctly.

---

### `TASK-007-04`: Extend `list_claim_evidence_links` with 2-Hop Bibliographic Join `[NORMATIVE]`
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Precondition**: `TASK-007-03` completed.
- **Actions**:
  1. Update `list_claim_evidence_links()` to `LEFT JOIN scholarly_works sw ON s.scholarly_work_id = sw.id`.
  2. Return enriched fields: `scholarly_title`, `scholarly_doi`, `scholarly_authors`, `scholarly_year`, `scholarly_venue`.
- **Pass Criteria**: Calling `list_claim_evidence_links(claim_id)` returns attached scholarly literature metadata when linked.

---

### `TASK-007-05`: Author Unit Test Suite `test_epistemic_bridge.py` `[VERIFICATION]`
- **Target File**: `backend/tests/test_epistemic_bridge.py` `[NEW]`
- **Precondition**: Tasks 01–04 completed.
- **Actions**:
  1. Test schema migration idempotency.
  2. Test foreign key enforcement (assert `sqlite3.IntegrityError` when inserting non-existent `scholarly_work_id`).
  3. Test `ON DELETE SET NULL` behavior when a referenced `scholarly_works` row is deleted.
  4. Test non-destructive upsert in `update_problem()` (verify source ID preservation and evidence link survival).
- **Pass Criteria**: All unit tests pass with zero failures.

---

### `TASK-007-06`: Implement Vertical Slice Epistemic Calculation Test `[VERIFICATION]`
- **Target File**: `backend/tests/test_epistemic_bridge.py`
- **Precondition**: `TASK-007-05` completed.
- **Actions**:
  1. Construct end-to-end fixture:
     - Problem `P-TEST-001`.
     - Claim `CLM-TEST-001` (`status = 'ACTIVE'`).
     - Scholarly Work `SW-TEST-001` in `scholarly_works`.
     - Source in `problem_sources` linking `scholarly_work_id = 'SW-TEST-001'` with `source_tier = 'A'`.
     - Link in `claim_evidence_links` with `relation_type = 'SUPPORTS'` and `evidence_strength = 'STRONG'`.
  2. Call `compute_claim_epistemic_balance('CLM-TEST-001', adapter)`:
     - Assert `net_score == 3.0`.
     - Assert `normalized_score == 100.0`.
     - Assert `epistemic_status == 'SUPPORTED'`.
  3. Call `calculate_candidate_composite_score(candidate, adapter)`:
     - Assert `epistemic_score == 100.0` (non-default).
     - Assert composite score reflects positive contribution from epistemic balance.
- **Pass Criteria**: Vertical slice completes end-to-end; score calculations verify deterministic mathematics.

---

### `TASK-007-07`: Full Offline Suite Regression Verification `[VERIFICATION]`
- **Target Component**: Full test runner (`pytest backend/tests/`).
- **Precondition**: `TASK-007-06` completed.
- **Actions**:
  1. Run `pytest -q backend/tests/`.
  2. Verify all existing tests (including `test_scholarly_persistence.py`, `test_decision_engine.py`, `test_impact_engine.py`) continue to pass.
- **Pass Criteria**: 100% pass rate across offline test suite.

---

### `TASK-007-08`: Scope & Anti-Creep Audit `[VERIFICATION]`
- **Target Component**: Git status and diff.
- **Precondition**: All prior tasks completed.
- **Actions**:
  1. Verify zero modifications to:
     - `pyproject.toml` (zero dependency additions).
     - Phase 3, Phase 4, Phase 5 routers.
     - Research Stages B–F.
     - LLM prompts.
  2. Confirm `DEF-DATA-001`, `DEF-DEV-007`, and `DEF-SCORE-001` remain untouched.
- **Pass Criteria**: Audit passes cleanly.
