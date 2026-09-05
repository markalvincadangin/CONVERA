# CONVERA SDD-007: Quality & Governance Checklist
**Source-Mediated Epistemic Bridge (Knowledge-Workflow Integration)**

**Specification ID**: CONVERA-SDD-007  
**Classification**: Quality Assurance, Referential Integrity & Governance Checklist  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [IMPLEMENTED & VERIFIED — RATIFIED BY HUMAN]  
**Revision**: 1.0.0 (Ratified Implementation & Verification)  
**Baseline Git Commit**: `4592ebd63e1a5243cc329586a581f5281df32642` (main)  
**Proposed Feature Branch**: `feature/007-source-mediated-epistemic-bridge` (Proposed — Not Created)  
**Target Integration Branch**: `develop`  

---

## 1. Quality & Verification Checklist Items

| Item ID | Category | Verification Requirement | Pass Criteria | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`CHK-007-01`** | **Data Integrity** | Non-Destructive Source Reconciliation | `update_problem(problem_id, {"sources": ...})` does NOT execute bulk deletion and preserves existing `problem_sources.id` values. | Automated unit test (`test_epistemic_bridge.py`) | ✅ VERIFIED |
| **`CHK-007-02`** | **Data Integrity** | Cascade Deletion Prevention | Existing `claim_evidence_links` survive repeated problem updates and source attachments without being cascade-deleted; deletions blocked without `cascade_confirmed=True`. | Automated unit test (`test_epistemic_bridge.py`) | ✅ VERIFIED |
| **`CHK-007-03`** | **Database Schema** | Additive Schema Migration | `problem_sources` contains column `scholarly_work_id TEXT REFERENCES scholarly_works(id) ON DELETE SET NULL`. | `PRAGMA table_info` (`test_epistemic_bridge.py`) | ✅ VERIFIED |
| **`CHK-007-04`** | **Database Schema** | Reverse Traversal Index | Index `idx_problem_sources_sw` exists on `problem_sources(scholarly_work_id)`. | SQLite index pragma (`test_epistemic_bridge.py`) | ✅ VERIFIED |
| **`CHK-007-05`** | **Integrity** | Foreign Key Enforcement | Attempting to insert a `problem_sources` row with a non-existent `scholarly_work_id` raises `sqlite3.IntegrityError`. | Automated unit test (`test_epistemic_bridge.py`) | ✅ VERIFIED |
| **`CHK-007-06`** | **Integrity** | Foreign Key Nullification | Deleting a `scholarly_works` row sets `scholarly_work_id = NULL` on linked `problem_sources` without deleting the source row. | Automated unit test (`test_epistemic_bridge.py`) | ✅ VERIFIED |
| **`CHK-007-07`** | **Query** | 2-Hop Traversal Query | `list_claim_evidence_links(claim_id)` returns enriched bibliographic fields from `scholarly_works` via `problem_sources`. | Automated unit test (`test_epistemic_bridge.py`) | ✅ VERIFIED |
| **`CHK-007-08`** | **Epistemic** | Net Epistemic Balance Activation | `compute_claim_epistemic_balance` calculates authentic score (e.g. Net = +3.0, Normalized = 100.0) for active claim linked to Tier A source. | Automated unit test (`test_epistemic_bridge.py`) | ✅ VERIFIED |
| **`CHK-007-09`** | **Decision** | Candidate Scoring Activation | `calculate_candidate_composite_score` for candidate with active claims reflects calculated epistemic score (non-50.0). | Automated unit test (`test_epistemic_bridge.py`) | ✅ VERIFIED |
| **`CHK-007-10`** | **Governance** | Epistemic Boundary Conformance | Claims and links require explicit human or test fixture creation; zero unverified LLM extractions are auto-promoted to authoritative truth. | Code inspection | ✅ VERIFIED |
| **`CHK-007-11`** | **Governance** | Zero Authority-Tier Invention | No automated citation-count or venue heuristics are implemented; tier assignment remains explicit or default. | Code inspection | ✅ VERIFIED |
| **`CHK-007-12`** | **Anti-Creep** | Zero Package Manifest Growth | `git diff backend/pyproject.toml` shows zero dependency additions. | Git diff inspection | ✅ VERIFIED |
| **`CHK-007-13`** | **Anti-Creep** | Strict Scope Isolation | No modifications to Phase 3/5 routers, Research Stages B–F, or unrelated defects (`DEF-DATA-001`, `DEF-DEV-007`, `DEF-SCORE-001`). | Git diff audit | ✅ VERIFIED |
| **`CHK-007-14`** | **Regression** | Full Offline Suite Non-Regression | `pytest backend/tests/` passes with 100% pass rate (144 passed, 12 deselected; no regressions detected by executed suite). | Pytest execution | ✅ VERIFIED |

---

## 2. Gate Verification Sign-Off Protocol

To transition SDD-007 from `DRAFT` to `RATIFIED FOR IMPLEMENTATION`, the human reviewer must explicitly confirm:
1. All checklist items above are agreed as necessary and sufficient.
2. The scope boundary remains strictly confined to the Minimum Safe Vertical Slice.
3. No code has been executed or committed prior to formal authorization.

---

## 3. Human Ratification Record

- **Gate Status**: 🟢 **RATIFIED & ACCEPTED**
- **Date**: 2026-09-05
- **Ratification Authority**: Human System Architect / Principal Founder
- **Ratified Confirmations**:
  - Implementation stayed strictly within ratified SDD-007 scope.
  - Design 2 (Source-Mediated Epistemic Bridge) implemented as authorized.
  - Additive `problem_sources.scholarly_work_id` schema change accepted.
  - Five-level source reconciliation behavior accepted.
  - Ambiguous fallback matches inserting rather than guessing update target accepted.
  - Deletion safeguard and exact `ValueError` contract accepted.
  - Two-hop scholarly bibliographic retrieval accepted.
  - Bounded vertical slice verification accepted.
  - SDD-007 test suite passed (13/13).
  - Offline regression suite passed (144 passed, no regressions detected by executed suite).
  - Frontend typecheck passed (`npm run typecheck --prefix web` exit code 0).
  - Zero unauthorized dependencies, UI changes, unrelated refactoring, or out-of-scope features introduced.
- **Preserved Unresolved Decisions**:
  1. Systemic source-of-truth precedence between `sessions.state_data` and SQLite relational entities.
  2. Scholarly authority-tier assignment rule.
  3. Claim activation authority/protocol.
  4. Evidence `relation_type` and `evidence_strength` classification protocol.
- **Governance Gate Enforcement**:
  - `HUMAN RATIFICATION`: **GRANTED**
  - `SDD-007 IMPLEMENTATION & VERIFICATION`: **ACCEPTED**
  - `MERGE AUTHORIZATION`: **NOT GRANTED**
  - `PROMOTION AUTHORIZATION`: **NOT GRANTED**
  - `RELEASE AUTHORIZATION`: **NOT GRANTED**
  - `DEPLOYMENT AUTHORIZATION`: **NOT GRANTED**
