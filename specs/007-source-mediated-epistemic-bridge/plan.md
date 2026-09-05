# CONVERA SDD-007: Architectural Implementation Plan
**Source-Mediated Epistemic Bridge (Knowledge-Workflow Integration)**

**Specification ID**: CONVERA-SDD-007  
**Classification**: Technical & Architectural Implementation Plan  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [IMPLEMENTED & VERIFIED — RATIFIED BY HUMAN]  
**Revision**: 1.0.0 (Ratified Implementation & Verification)  
**Baseline Git Commit**: `4592ebd63e1a5243cc329586a581f5281df32642` (main)  
**Proposed Feature Branch**: `feature/007-source-mediated-epistemic-bridge` (Proposed — Not Created)  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/007-source-mediated-epistemic-bridge/spec.md`
- `docs/00-foundation/CONSTITUTION.md`
- `docs/02-system/ARCHITECTURE.md`
- `docs/02-system/DOMAIN_MODEL.md`
- `docs/04-ai/AI_ARCHITECTURE.md`

---

## 1. System Boundary & Component Architecture

SDD-007 modifies strictly the persistence layer, reconciliation logic, and vertical-slice test harnesses in the backend:

```text
Problem Entity (problems)
       │
       ├── 1:N ──> problem_claims (Relational Claims: status='ACTIVE')
       │                 ▲
       │                 │ (claim_id: TEXT)
       │                 │
       │           claim_evidence_links (Epistemic Links: relation_type, strength)
       │                 │
       │                 │ (source_id: INTEGER)
       │                 ▼
       └── 1:N ──> problem_sources (Local Citations / Problem Evidence)
                         │
                         │ [NEW ADDITIVE FOREIGN KEY]
                         │ (scholarly_work_id: TEXT REFERENCES scholarly_works(id))
                         ▼
                   scholarly_works (SDD-006 Deduplicated Literature Repository)
```

### Affected Components:
1. `backend/storage/sqlite_adapter.py`:
   - Schema DDL migration: `problem_sources.scholarly_work_id` foreign key & index.
   - Non-destructive upsert logic in `update_problem()`.
   - Enhanced `list_claim_evidence_links()` joining `scholarly_works` for full bibliographic context.
2. `backend/engines/knowledge_lifecycle.py`:
   - Validated against the 2-hop traversal without code changes (consumes `problem_sources` attributes).
3. `backend/engines/decision_engine.py`:
   - Validated against candidates with active claims, proving that `epistemic_score` reflects authentic calculation rather than the `50.0` neutral fallback.
4. `backend/tests/test_epistemic_bridge.py` `[NEW TEST SUITE]`:
   - Dedicated unit and integration tests verifying referential integrity, non-destructive upsert, cascade prevention, and scoring activation.

---

## 2. Staged Implementation Sequence

Implementation is organized into 5 strictly sequential stages:

```text
[Stage 1: Remediate Hard Data-Integrity Blocker in update_problem]
       │
       ▼
[Stage 2: Additive SQLite Schema Migration]
       │
       ▼
[Stage 3: Storage Adapter Traversal & Link Query Integration]
       │
       ▼
[Stage 4: Automated Verification Suite (test_epistemic_bridge.py)]
       │
       ▼
[Stage 5: Decision Room Candidate Scoring Activation Verification]
```

### Stage 1: Remediate Hard Data-Integrity Blocker (`update_problem`)
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Refactor `update_problem()` lines 1680–1695.
  2. Eliminate `DELETE FROM problem_sources WHERE problem_id = ?`.
  3. Implement the reconciliation algorithm:
     - Fetch existing `problem_sources` for `problem_id`.
     - Match incoming items against existing items by exact precedence:
       1. Match by explicit id (INTEGER) if provided.
       2. Else match by scholarly_work_id if present on the incoming source.
       3. Else match by normalized source_url (case-insensitive, trailing slash stripped) when URL is non-empty.
       4. Else match by composite key:
          `source_name + quote_or_summary[:60]`
          when source_url is NULL.
       5. If multiple existing rows match the fallback criteria, do not update any existing row; INSERT the incoming source as a new source to prevent ambiguous cross-linking.
     - Source update / insert handling:
       - A uniquely identified source may be updated using its existing id.
       - A fallback composite match may be updated only when exactly one existing row matches.
       - If multiple rows match the fallback criteria, INSERT the incoming source as a new row rather than selecting an existing row.
       - The implementation MUST NOT guess an update target.
     - For unmatched sources: execute `INSERT INTO problem_sources (...)`.
     - Deletion contract:
       - If an omitted problem source is referenced by active claim_evidence_links, deletion MUST be blocked unless `cascade_confirmed=True` is explicitly provided.
       - The storage adapter MUST raise:
         `ValueError("Cannot delete problem source referenced by active claim evidence links without cascade_confirmed=True")`
         when deletion is attempted without `cascade_confirmed=True`.

### Stage 2: Additive SQLite Schema Migration
- **Target File**: `backend/storage/sqlite_adapter.py` (`_init_db`)
- **Actions**:
  1. Add table definition update or migration pragma:
     ```sql
     ALTER TABLE problem_sources ADD COLUMN scholarly_work_id TEXT REFERENCES scholarly_works(id) ON DELETE SET NULL;
     CREATE INDEX IF NOT EXISTS idx_problem_sources_sw ON problem_sources(scholarly_work_id);
     ```
  2. Implement programmatic check in `_init_db()` inspecting `PRAGMA table_info(problem_sources)` before executing `ALTER TABLE`.
  3. Ensure idempotency on repeated runs.

### Stage 3: Storage Adapter Traversal & Link Query Integration
- **Target File**: `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Extend `list_claim_evidence_links()` to execute a 2-hop `LEFT JOIN`:
     ```sql
     SELECT l.*, s.source_name, s.source_url, s.source_tier, s.quote_or_summary,
            s.scholarly_work_id, sw.title AS scholarly_title, sw.doi AS scholarly_doi,
            sw.authors AS scholarly_authors, sw.year AS scholarly_year, sw.venue AS scholarly_venue
     FROM claim_evidence_links l
     LEFT JOIN problem_sources s ON l.source_id = s.id
     LEFT JOIN scholarly_works sw ON s.scholarly_work_id = sw.id
     WHERE l.claim_id = ?
     ```
  2. Extend `add_problem_sources()` to accept and persist `scholarly_work_id`.

### Stage 4: Automated Verification Suite
- **Target File**: `backend/tests/test_epistemic_bridge.py` `[NEW]`
- **Actions**:
  1. Author tests verifying:
     - Schema column and foreign key creation.
     - Non-destructive upsert in `update_problem()` (verifies that `problem_sources.id` is preserved and `claim_evidence_links` survive problem updates).
     - Strict foreign key enforcement (`IntegrityError` on invalid `scholarly_work_id`).
     - `ON DELETE SET NULL` behavior when a `scholarly_works` row is deleted.
     - Epistemic balance calculation via `compute_claim_epistemic_balance()`.

### Stage 5: Decision Room Candidate Scoring Activation Verification
- **Target File**: `backend/tests/test_epistemic_bridge.py`
- **Actions**:
  1. Construct candidate test fixture containing:
     - 1 Problem with 1 Claim.
     - 1 Attached Source pointing to a Scholarly Work.
     - 1 Claim-Evidence Link with `relation_type = 'SUPPORTS'`, `evidence_strength = 'STRONG'`, and `source_tier = 'A'`.
  2. Invoke `calculate_candidate_composite_score()`.
  3. Assert `breakdown["epistemic_score"] == 100.0` (rather than the default `50.0`).
  4. Assert composite score reflects authentic epistemic points ($0.35 \times 100.0 = 35.0$).

---

## 3. Risk Mitigation & Failure Modes

| Risk / Failure Mode | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|
| **Foreign Key Violation on Invalid `scholarly_work_id`** | Low | High | Storage adapter validates that `scholarly_work_id` exists in `scholarly_works` before linking, or lets SQLite enforce foreign key constraint within a transaction. |
| **Cascade Deletion of Evidence Links** | High (in current code) | Critical | **Stage 1 prerequisite**: Refactor `update_problem()` to an upsert pattern before any claim-evidence links are written. Verified by automated test before schema changes. |
| **Concurrent Write Lock Contention** | Low | Low | SQLite WAL mode handles single-writer / multi-reader concurrency. Operations use standard timeout (`busy_timeout = 5000`). |
| **Drift Between Session JSON and DB** | Medium | Medium | [OPEN DECISION] Systemic Source-of-Truth Precedence:<br>The broader architectural precedence between sessions.state_data JSON and SQLite relational entities remains an open governance decision. The SDD-007 vertical slice does not resolve this precedence and operates only through storage adapter methods, SQLite schema integrity, and test fixtures. |

---

## 4. Rollback Plan

If SDD-007 implementation encounters unresolvable defects:
1. **Application Code Rollback**: Revert `sqlite_adapter.py` changes using git.
2. **Database Rollback**:
   - `scholarly_work_id` is a nullable column. Reverting application code safely ignores the column.
   - For complete database restoration, standard automated backup (`scripts/deploy-prod.sh`) is executed prior to migration.
