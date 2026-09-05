# CONVERA SDD-007: Source-Mediated Epistemic Bridge Specification
**Knowledge-Workflow Integration — Minimum Safe Vertical Slice**

**Specification ID**: CONVERA-SDD-007  
**Classification**: Relational Knowledge Integration, Referential Integrity & Epistemic Calculation  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [IMPLEMENTED & VERIFIED — RATIFIED BY HUMAN]  
**Revision**: 1.0.0 (Ratified Implementation & Verification)  
**Baseline Git Commit**: `4592ebd63e1a5243cc329586a581f5281df32642` (main)  
**Proposed Feature Branch**: `feature/007-source-mediated-epistemic-bridge` (Proposed — Not Created)  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, V, VI, VII, VIII)
- `docs/02-system/ARCHITECTURE.md` (Section 3: Storage Doctrine — SQLite WAL)
- `docs/02-system/DOMAIN_MODEL.md` (Entity 3: ProblemClaim, Entity 4: EvidenceItem, Entity 5: ProvenanceRecord)
- `docs/02-system/EVIDENCE_MODEL.md` (CIIA v1.0 & Epistemic Balance Formula)
- `docs/04-ai/AI_ARCHITECTURE.md` (Section 2.1: "LLM Last, Not LLM First", Section 4: Human-in-the-Loop Boundaries)
- `specs/006-scholarly-evidence-persistence-fts5/spec.md` (`scholarly_works` Relational Entity & FTS5 Indexing)
- `architectural_decision_package_gap_know_01.md` (Ratified Governance Decision Package)

---

## 1. Executive Summary & Problem Statement

### 1.1 The Operational & Architectural Problem
An empirical discovery spike into `GAP-KNOW-01` (Disconnected Knowledge-Workflow Bifurcation) revealed that CONVERA's relational knowledge architecture and deterministic epistemic engines are completely bypassed by active product workflows:

1. **Relational Claim & Assumption Amnesia `[MEASURED FACT]`**: Problems discovered in Phase 1 (`backend/routers/pipeline.py:140`) and Stage A research (`backend/routers/research.py:140`) are written to `problems`, but `assumption_engine.extract_claims_and_assumptions()` is never invoked. Problems enter the database with **zero** rows in `problem_claims` and `problem_assumptions`.
2. **Epistemic Score Defaulting `[MEASURED FACT]`**: In `backend/engines/decision_engine.py:160–162`, candidate composite scoring defaults the epistemic balance score ($S_{epistemic}$) to `50.0` and the assumption risk penalty ($R_{assumptions}$) to `0.0` whenever candidate claims and assumptions are absent. The Decision Room's 35% epistemic weighting is rendered a static, uninformative constant.
3. **Scholarly Citation Type Incompatibility `[MEASURED FACT]`**: SDD-006 introduced `scholarly_works` with `id TEXT PRIMARY KEY` (`SW-DOI-...` / `SW-TTL-...`). However, `claim_evidence_links.source_id` is defined as `INTEGER NOT NULL REFERENCES problem_sources(id) ON DELETE CASCADE`. Published literature cannot be relationally linked to problem claims through the existing schema.
4. **Destructive Cascade Deletion in `update_problem` `[CRITICAL DATA-INTEGRITY BLOCKER]`**: In `backend/storage/sqlite_adapter.py:1682`, `update_problem()` executes `DELETE FROM problem_sources WHERE problem_id = ?` whenever sources are updated. Because `claim_evidence_links` enforces `ON DELETE CASCADE` on `source_id`, any problem metadata update or source attachment in the current codebase **silently and permanently cascade-deletes all existing evidence links** for that problem.
5. **Downstream Workflow Disconnection `[MEASURED FACT]`**: Phase 3 Mom Test validation relies on substring matching (`"PASSED"`, `"COMPLETE"`) on raw LLM text in `sessions.state_data` (`pipeline.py:202`), bypassing `problem_assumptions` and `assumption_validation_tests`. Phase 2 writes to `decision_records`, but downstream phases receive only an unvalidated string statement.

### 1.2 The Architectural Solution: Design 2 (Source-Mediated Bridge)
**Design 2 preserves database-level referential integrity between `problem_sources` and `scholarly_works` while retaining the existing integer-based `claim_evidence_links → problem_sources` relationship.**

SDD-007 establishes the **Minimum Safe Vertical Slice** to prove this integration:
- **Refactored Idempotent Upsert for `problem_sources`**: Eliminates the destructive `DELETE` pattern in `update_problem()`, preventing cascade deletion of evidence links.
- **Additive SQLite Schema Migration**: Adds an optional foreign key `scholarly_work_id TEXT REFERENCES scholarly_works(id) ON DELETE SET NULL` to `problem_sources`.
- **End-to-End Vertical Slice**: Proves the complete relational path from Problem → Claim → Scholarly Work → Problem Source → Claim-Evidence Link → Deterministic Epistemic Calculation → Decision Candidate Scoring.

---

## 2. Specification Precedence & Governing Invariants

```text
CONSTITUTION (docs/00-foundation/CONSTITUTION.md)
       ↓
AUTHORITATIVE SPECIFICATIONS (docs/00 through docs/08)
       ↓
SDD-007 SPECIFICATION (specs/007-source-mediated-epistemic-bridge/spec.md)
       ↓
CURRENT IMPLEMENTATION (backend/storage/, backend/engines/, backend/routers/)
       ↓
AGENT REASONING
```

### Governing Invariants for SDD-007:

1. **`[NORMATIVE INV-007-INTEGRITY]` Database-Level Referential Integrity Invariant**:
   - All relationships between `problem_claims`, `claim_evidence_links`, `problem_sources`, and `scholarly_works` MUST be enforced by native SQLite foreign key constraints (`PRAGMA foreign_keys = ON`).
   - Polymorphic foreign keys, unconstrained text references, and application-only integrity checks are STRICTLY PROHIBITED.
2. **`[NORMATIVE INV-007-NONDESTRUCTIVE]` Non-Destructive Source Reconciliation Invariant**:
   - `storage.update_problem()` and related storage routines MUST NOT execute bulk deletions of `problem_sources` (`DELETE FROM problem_sources WHERE problem_id = ?`).
   - Source updates MUST use an idempotent reconciliation/upsert strategy that preserves existing `problem_sources.id` values and prevents unintended cascade deletions.
3. **`[NORMATIVE INV-007-HUMAN-BOUNDARY]` Epistemic Boundary & Human Verification Invariant**:
   - Claims, assumptions, and evidence links generated or inferred by an LLM MUST NOT become authoritative canonical truth merely because an LLM produced them.
   - LLM extractions MUST enter the system in a non-authoritative state (`HYPOTHESIS` or `UNVERIFIED`) and require explicit human review or confirmation before influencing decision thresholds or triggering invalidation cascades.
4. **`[NORMATIVE INV-007-NO-TIER-INVENTION]` Prohibition of Unratified Authority Heuristics Invariant**:
   - The implementation MUST NOT invent or apply arbitrary authority-tier rules (e.g. `citation_count >= 10 = Tier A` or `peer-reviewed venue = Tier A`) to `scholarly_works`.
   - Authority tier assignment rules for scholarly literature remain an open governance decision and MUST be treated as `[OPEN DECISION]` until explicitly ratified by human governance.
5. **`[NORMATIVE INV-007-DETERMINISTIC-CORE]` Deterministic Epistemic Calculation Invariant**:
   - The Net Epistemic Balance formula ($\text{Balance} = \sum W_{support} - \sum W_{contradict}$) and Candidate Composite Scoring formula ($0.40 S_{rubric} + 0.35 S_{epistemic} + 0.25 S_{impact} - R_{assumptions}$) MUST remain 100% deterministic, transparent, and reproducible with zero probabilistic LLM scoring.
6. **`[NORMATIVE INV-007-ADDITIVE-MIGRATION]` Additive Non-Breaking Migration Invariant**:
   - Schema changes MUST be purely additive (`ALTER TABLE problem_sources ADD COLUMN ...`).
   - Existing records in `problem_sources` (180 measured rows) MUST remain valid without requiring destructive transformations. Existing `scholarly_works` and `claim_evidence_links` schemas MUST NOT be dropped or recreated.
7. **`[NORMATIVE INV-007-SCOPE-ISOLATION]` Strict Scope Isolation Invariant**:
   - SDD-007 is strictly bounded to the Minimum Safe Vertical Slice. It MUST NOT implement automated LLM claim extraction, automated evidence link inference, Phase 3/5 redesign, Research Stages B–F, vector embeddings, or unrelated defect resolutions (`DEF-DATA-001`, `DEF-DEV-007`, `DEF-SCORE-001`).

---

## 3. Database Schema & Architecture

### 3.1 Schema Changes: `problem_sources` Extension

`[NORMATIVE]` An additive column and index are introduced in `backend/storage/sqlite_adapter.py`:

```sql
-- Additive foreign key column linking problem source citations to global scholarly works
ALTER TABLE problem_sources ADD COLUMN scholarly_work_id TEXT REFERENCES scholarly_works(id) ON DELETE SET NULL;

-- Index for efficient reverse traversal (ScholarlyWork -> ProblemSources -> Claims)
CREATE INDEX IF NOT EXISTS idx_problem_sources_sw ON problem_sources(scholarly_work_id);
```

### 3.2 Preserved Entity Schemas

1. **`claim_evidence_links` `[NORMATIVE — UNCHANGED]`**:
   ```sql
   CREATE TABLE IF NOT EXISTS claim_evidence_links (
       id TEXT PRIMARY KEY,
       claim_id TEXT NOT NULL,
       source_id INTEGER NOT NULL,
       relation_type TEXT NOT NULL DEFAULT 'SUPPORTS',   -- 'SUPPORTS' | 'CONTRADICTS' | 'CONTEXTUALIZES'
       evidence_strength TEXT NOT NULL DEFAULT 'STRONG', -- 'STRONG' | 'MODERATE' | 'WEAK'
       rationale TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (claim_id) REFERENCES problem_claims(id) ON DELETE CASCADE,
       FOREIGN KEY (source_id) REFERENCES problem_sources(id) ON DELETE CASCADE
   );
   ```

2. **`scholarly_works` `[NORMATIVE — UNCHANGED]`**:
   ```sql
   CREATE TABLE IF NOT EXISTS scholarly_works (
       id TEXT PRIMARY KEY,                              -- 'SW-DOI-...' or 'SW-TTL-...'
       doi TEXT UNIQUE,
       title TEXT NOT NULL,
       abstract TEXT,
       authors TEXT,
       year INTEGER,
       venue TEXT,
       citation_count INTEGER DEFAULT 0,
       source_connector TEXT NOT NULL,
       source_url TEXT,
       raw_metadata TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **`problem_claims` `[NORMATIVE — UNCHANGED]`**:
   ```sql
   CREATE TABLE IF NOT EXISTS problem_claims (
       id TEXT PRIMARY KEY,
       problem_id TEXT NOT NULL,
       claim_type TEXT NOT NULL,                         -- 'FINANCIAL_FRICTION' | 'TECHNICAL_BOTTLENECK' | etc.
       claim_text TEXT NOT NULL,
       status TEXT DEFAULT 'HYPOTHESIS',                 -- 'HYPOTHESIS' | 'ACTIVE' | 'VERIFIED' | 'CONTRADICTED'
       confidence_score REAL DEFAULT 50.0,
       mode TEXT DEFAULT 'COMMERCIAL',
       evidence_notes TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
   );
   ```

---

## 4. Remediation of Hard Data-Integrity Blocker: `update_problem`

### 4.1 Current Flaw Analysis
In `backend/storage/sqlite_adapter.py:1680–1695`:
```python
# CURRENT FLAWED IMPLEMENTATION:
if "sources" in updates:
    sources = updates["sources"]
    with self._get_connection() as conn:
        conn.execute("DELETE FROM problem_sources WHERE problem_id = ?", (problem_id,)) # <- TRIGGERS CASCADE
        for s in sources:
            conn.execute("""
                INSERT INTO problem_sources (
                    problem_id, source_name, source_url, source_tier, evidence_type, quote_or_summary
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, ...)
```

### 4.2 Normative Upsert / Reconciliation Strategy `[NORMATIVE]`
`sqlite_adapter.update_problem()` MUST be refactored to perform **idempotent reconciliation**:

1. **Reconciliation Key Matching**:
   For each incoming source in `updates["sources"]`:
   - Match by explicit `id` (INTEGER) if provided.
   - Else match by `scholarly_work_id` if present on the incoming source.
   - Else match by normalized `source_url` (case-insensitive, trailing slash stripped) when URL is non-empty.
   - Else match by composite key:
     `source_name + quote_or_summary[:60]`
     when `source_url` is NULL.
   - If multiple existing rows match the fallback criteria, do not update any existing row; `INSERT` the incoming source as a new source to prevent ambiguous cross-linking.
2. **Update Existing Matches**:
   - If a source matches an existing row, execute an `UPDATE` on `problem_sources` preserving its `id`.
   - Update fields: `source_name`, `source_url`, `source_tier`, `evidence_type`, `quote_or_summary`, and `scholarly_work_id`.
   - **Do NOT re-insert or regenerate the `id`**.
3. **Insert Truly New Sources**:
   - If an incoming source has no match, execute `INSERT INTO problem_sources (...)`.
4. **Controlled Deletion Protocol**:
   - Only sources explicitly marked for removal or omitted during a full synchronization replace may be deleted.
   - If an omitted problem source is referenced by active `claim_evidence_links`, deletion MUST be blocked unless `cascade_confirmed=True` is explicitly provided.
   - The storage adapter MUST raise:
     `ValueError("Cannot delete problem source referenced by active claim evidence links without cascade_confirmed=True")`
     when this condition occurs.

---

## 5. Authority Boundaries & Open Policy Decisions

### 5.1 Claim & Assumption Authority Boundary `[NORMATIVE]`
1. When claims or assumptions are created from LLM extraction, they MUST enter with `status = 'HYPOTHESIS'`.
2. `[OPEN DECISION]` **Claim Verification Protocol**:
   - *Option A*: Claims require manual researcher checkbox confirmation in the Problem Bank before being considered `status = 'ACTIVE'`.
   - *Option B*: Claims automatically activate upon stage completion (Phase 1 → Phase 2), with founder ability to challenge/edit.
   - *Governance Requirement*: Until Option A or B is ratified, the vertical slice shall permit manual insertion/activation via storage adapter methods.

### 5.2 Evidence Link Creation & Relation Authority `[NORMATIVE]`
1. Evidence links MUST NOT be automatically created simply because a citation is attached to a problem.
2. Every `claim_evidence_links` entry requires:
   - Specific `claim_id` target.
   - Specific `source_id` target.
   - Explicit `relation_type`: `SUPPORTS`, `CONTRADICTS`, or `CONTEXTUALIZES`.
   - Explicit `evidence_strength`: `STRONG` (multiplier 1.0), `MODERATE` (0.7), or `WEAK` (0.4).
3. `[OPEN DECISION]` **Relation Assignment Protocol**:
   - *Option A*: Purely manual assignment by researcher during evidence review.
   - *Option B*: LLM proposes candidate relation and rationale; researcher must confirm before write.
   - *Governance Requirement*: The vertical slice shall test manual explicit link creation only.

### 5.3 Scholarly Authority Tier Handling `[NORMATIVE]`
1. `knowledge_lifecycle.py` requires a `source_tier` ('A', 'B', 'C') on `problem_sources` to weight epistemic points.
2. `[OPEN DECISION]` **Authority Tier Rule for Scholarly Works**:
   - *Current Fact*: `scholarly_works` has NO `source_tier` column. No citation threshold rule has been ratified.
   - *Option A*: Default all attached scholarly literature to `source_tier = 'B'` (Standard Empirical Evidence, weight 2.0) unless overridden by researcher during Gate 1/2 review.
   - *Option B*: Propose a deterministic formula based on peer review and citations (e.g. peer-reviewed = Tier A) for formal human ratification.
   - *Option C*: Mandatory manual tier selection upon attaching citation.
   - *Governance Requirement*: For the SDD-007 vertical slice, `source_tier` on `problem_sources` remains explicit and manual; no automated tier heuristics shall be implemented.

---

## 6. End-to-End Vertical Slice Workflow

The implementation scope is strictly bounded to proving this single relational chain:

```text
[ Problem Record ] (e.g., P-IL-001)
       ↓
[ 1 Relational Claim ] (problem_claims: id = 'CLM-001', status = 'ACTIVE')
       ↓
[ 1 Scholarly Work ] (scholarly_works: id = 'SW-001', persisted in SQLite)
       ↓
[ 1 Problem Source ] (problem_sources: id = 101, problem_id = 'P-IL-001',
                      scholarly_work_id = 'SW-001', source_tier = 'A')
       ↓
[ 1 Claim-Evidence Link ] (claim_evidence_links: id = 'LNK-001', claim_id = 'CLM-001',
                          source_id = 101, relation_type = 'SUPPORTS', evidence_strength = 'STRONG')
       ↓
[ Deterministic Epistemic Engine Execution ]
compute_claim_epistemic_balance('CLM-001', storage)
       ↓  (Reads claim_evidence_links JOIN problem_sources)
Outputs: net_score = +3.0, normalized_score = 100.0, epistemic_status = 'SUPPORTED'
       ↓
[ Decision Room Candidate Scoring Reflection ]
calculate_candidate_composite_score(candidate_dict, storage)
       ↓  (epistemic_score evaluates to 100.0 instead of 50.0 neutral default)
Composite score calculation consumes calculated epistemic balance.
```

---

## 7. Migration & Rollback Specification

### 7.1 Schema Migration Protocol `[NORMATIVE]`
1. Check if column exists:
   ```sql
   PRAGMA table_info(problem_sources);
   ```
2. If `scholarly_work_id` is missing:
   ```sql
   ALTER TABLE problem_sources ADD COLUMN scholarly_work_id TEXT REFERENCES scholarly_works(id) ON DELETE SET NULL;
   CREATE INDEX IF NOT EXISTS idx_problem_sources_sw ON problem_sources(scholarly_work_id);
   ```
3. Transactional Safety: Executed within a single SQLite transaction.
4. Idempotency: Running migration multiple times produces zero errors and zero duplicate columns.

### 7.2 Data Transformation `[NORMATIVE]`
- **Zero data transformation required**: Existing 180 rows in `problem_sources` retain `scholarly_work_id = NULL`.
- Existing `claim_evidence_links` (0 rows) and `scholarly_works` remain untouched.
- No backfill of existing rows is authorized under SDD-007.

### 7.3 Rollback Protocol `[NORMATIVE]`
SQLite does not support dropping columns with foreign key constraints in older versions without table recreation. However, because `scholarly_work_id` is nullable with `DEFAULT NULL`:
- Software rollback consists of ignoring the `scholarly_work_id` column in application queries.
- Database rollback (if strictly required) consists of backing up database prior to migration (`convera.db.pre-sdd007.bak`).

---

## 8. Explicit Out-of-Scope Declarations

The following items are **strictly excluded** from SDD-007:
1. `[OUT OF SCOPE]` Automated LLM claim extraction prompts or pipeline hooks.
2. `[OUT OF SCOPE]` Automated LLM evidence relationship inference.
3. `[OUT OF SCOPE]` Phase 3 Mom Test Socratic clinic redesign or assumption state mutation.
4. `[OUT OF SCOPE]` Phase 5 MVP audit experiment test result recording.
5. `[OUT OF SCOPE]` Research Track Stages B through F implementation.
6. `[OUT OF SCOPE]` Literature Matrix table persistence in React state (`GAP-LIT-01`).
7. `[OUT OF SCOPE]` Workflow gate enforcement or blocking UI phase transitions.
8. `[OUT OF SCOPE]` Neural embeddings, vector databases, ML frameworks, or rerankers.
9. `[OUT OF SCOPE]` Unrelated defect fixes (`DEF-SCORE-001`, `DEF-DATA-001`, `DEF-DEV-007`).
10. `[OUT OF SCOPE]` Production deployment.

---

## 9. Verification & Acceptance Criteria

| Check ID | Verification Description | Target Component | Acceptance Criteria |
|---|---|---|---|
| `CHK-007-01` | Additive Schema Migration | `backend/storage/sqlite_adapter.py` | `problem_sources` contains `scholarly_work_id TEXT REFERENCES scholarly_works(id) ON DELETE SET NULL`. Index `idx_problem_sources_sw` exists. |
| `CHK-007-02` | Non-Destructive Source Reconciliation | `sqlite_adapter.update_problem` | Calling `update_problem(problem_id, {"sources": ...})` preserves existing `problem_sources.id` values and does NOT cascade-delete existing `claim_evidence_links`. |
| `CHK-007-03` | Foreign Key Integrity Enforcement | SQLite engine | Inserting `problem_sources` with invalid `scholarly_work_id` raises `IntegrityError`. Deleting a `scholarly_works` row sets `scholarly_work_id = NULL` without deleting the source row. |
| `CHK-007-04` | 2-Hop Traversal Query | `sqlite_adapter.py` | Given a `claim_id`, joining `claim_evidence_links` → `problem_sources` → `scholarly_works` retrieves complete bibliographic details. |
| `CHK-007-05` | Epistemic Engine Calculation | `knowledge_lifecycle.py` | `compute_claim_epistemic_balance` for a claim linked to a Tier A source returns calculated points (`net_score = 3.0`, `normalized_score = 100.0`, `epistemic_status = 'SUPPORTED'`). |
| `CHK-007-06` | Decision Candidate Score Activation | `decision_engine.py` | `calculate_candidate_composite_score` for a problem with active claims reflects calculated epistemic score (non-50.0) in composite score. |
| `CHK-007-07` | Zero Package Manifest Growth | `pyproject.toml` | `git diff backend/pyproject.toml` shows zero dependency additions. |
| `CHK-007-08` | Scope Boundary Conformance | Codebase diff | Zero changes to Phase 3, Phase 5, Research Stages B–F, or prompt templates. |
