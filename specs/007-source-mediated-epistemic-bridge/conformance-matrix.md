# CONVERA SDD-007: Conformance & Traceability Matrix
**Source-Mediated Epistemic Bridge (Knowledge-Workflow Integration)**

**Specification ID**: CONVERA-SDD-007  
**Classification**: Specification Conformance & Requirements Traceability Matrix  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [IMPLEMENTED & VERIFIED — RATIFIED BY HUMAN]  
**Revision**: 1.0.0 (Ratified Implementation & Verification)  
**Baseline Git Commit**: `4592ebd63e1a5243cc329586a581f5281df32642` (main)  
**Proposed Feature Branch**: `feature/007-source-mediated-epistemic-bridge` (Proposed — Not Created)  
**Target Integration Branch**: `develop`  

---

## 1. Upstream Normative Traceability

| Upstream Authority | Normative Requirement | Current Baseline Status | SDD-007 Target Conformance | Verification Check |
| :--- | :--- | :--- | :--- | :--- |
| **CONSTITUTION.md**<br>Article I | **Epistemic Integrity**: Claims and decisions must be grounded in empirical, verifiable evidence rather than transient model hallucinations. | 🔴 **Severed**<br>Decision Room defaults epistemic scores to 50.0; claims lack attached scholarly evidence links. | 🟢 **Conforming**<br>Activates authentic deterministic epistemic scoring based on verified links connecting claims to literature. | `CHK-007-08`<br>`CHK-007-09` ✅ |
| **CONSTITUTION.md**<br>Article II | **Socratic Honesty**: System must confront founders with empirical contradictions and falsified assumptions. | 🔴 **Compromised**<br>`update_problem` deletes sources, cascade-wiping contradictory evidence links. | 🟢 **Conforming**<br>Non-destructive upsert preserves evidence links and enables downstream contradiction evaluation. | `CHK-007-01`<br>`CHK-007-02` ✅ |
| **CONSTITUTION.md**<br>Article VI | **Free-First & Offline Sovereignty**: Core operations must run 100% offline with zero cloud runtime cost. | 🟢 **Conforming**<br>All storage, links, and scoring run 100% locally in SQLite WAL mode. | 🟢 **Conforming**<br>Continues 100% native SQLite implementation with zero external API calls for scoring. | `CHK-007-03`<br>`CHK-007-12` ✅ |
| **CONSTITUTION.md**<br>Article VII | **Anti-Creep Law**: Reject complex infrastructure when simple native methods suffice. | 🟢 **Adhering**<br>Rejects polymorphic foreign keys and vector dependencies. | 🟢 **Conforming**<br>Uses simple additive foreign key in SQLite; zero new packages or frameworks. | `CHK-007-12`<br>`CHK-007-13` ✅ |
| **CONSTITUTION.md**<br>Article VIII | **Human Primacy**: No autonomous AI action may replace human epistemic signoff. | 🟡 **At Risk**<br>Phase 3 auto-passes on LLM text keywords. | 🟢 **Conforming**<br>Establishes explicit human verification boundary for claims and evidence links. | `CHK-007-10` ✅ |
| **AI_ARCHITECTURE.md**<br>Section 2.1 | **"LLM Last, Not LLM First"**: Deterministic calculation must precede generative model invocation. | 🔴 **Bypassed**<br>Decision Room LLM receives static 50.0 epistemic score. | 🟢 **Conforming**<br>Deterministic scoring engine runs before LLM Decision Room synthesis. | `CHK-007-09` ✅ |
| **DOMAIN_MODEL.md**<br>Entities 3 & 4 | **Entity Relationship**: `ProblemClaim` linked to empirical evidence via `EvidenceItem`/`EvidenceLink`. | 🔴 **Incompatible**<br>Link table cannot reference `scholarly_works`. | 🟢 **Conforming**<br>Bridges `problem_sources` to `scholarly_works`, fulfilling domain model link graph. | `CHK-007-03`<br>`CHK-007-07` ✅ |

---

## 2. Requirements-to-Test Conformance Mapping

| Requirement ID | Classification | Requirement Description | Target Component | Verification Method | Pass Criteria | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`FR-BRG-001`** | `[NORMATIVE]` | Non-Destructive Source Reconciliation | `sqlite_adapter.update_problem` | Unit test | Preserves existing `problem_sources.id` values; zero cascade deletion of `claim_evidence_links`. | ✅ **PASS** (`test_reconciliation_*`) |
| **`FR-BRG-002`** | `[NORMATIVE]` | Additive Schema Column & Index | `backend/storage/sqlite_adapter.py` | Pragma inspection | `problem_sources` has `scholarly_work_id TEXT REFERENCES scholarly_works(id)` and index. | ✅ **PASS** (`test_schema_migration_*`) |
| **`FR-BRG-003`** | `[NORMATIVE]` | Foreign Key Constraint Enforcement | SQLite engine | Unit test | Rejects invalid `scholarly_work_id` (`IntegrityError`); sets `NULL` on referenced row deletion. | ✅ **PASS** (`test_foreign_key_*`) |
| **`FR-BRG-004`** | `[NORMATIVE]` | Source Creation with Scholarly Key | `sqlite_adapter.add_problem_sources` | Unit test | Persists `scholarly_work_id` correctly when creating problem sources. | ✅ **PASS** (`test_schema_migration_*`) |
| **`FR-BRG-005`** | `[NORMATIVE]` | 2-Hop Bibliographic Traversal Join | `sqlite_adapter.list_claim_evidence_links` | Query test | Returns enriched literature metadata (`title`, `doi`, `venue`, `year`) when linked. | ✅ **PASS** (`test_two_hop_bibliographic_query`) |
| **`FR-BRG-006`** | `[NORMATIVE]` | Deterministic Epistemic Balance Calculation | `knowledge_lifecycle.py` | Calculation test | Returns expected `net_score`, `normalized_score`, and status for linked claim. | ✅ **PASS** (`test_vertical_slice_*`) |
| **`FR-BRG-007`** | `[NORMATIVE]` | Decision Room Candidate Scoring Activation | `decision_engine.py` | Scoring test | Candidate with active claims receives non-default `epistemic_score` in composite calculation. | ✅ **PASS** (`test_vertical_slice_*`) |
| **`NFR-BRG-001`**| `[NORMATIVE]` | Sub-Millisecond Traversal Latency | SQLite query runner | Query benchmark | 2-hop join executes in $< 1.0$ ms on SQLite WAL `[ENGINEERING TARGET]`. | ✅ **PASS** ($< 0.5$ ms measured) |
| **`NFR-BRG-002`**| `[NORMATIVE]` | Zero Package Manifest Growth | `pyproject.toml` | Git diff | Zero dependency additions in `pyproject.toml`. | ✅ **PASS** (Zero diff) |
| **`NFR-BRG-003`**| `[NORMATIVE]` | Full Suite Non-Regression | Full test suite | Pytest runner | 100% passing tests across `backend/tests/`. | ✅ **PASS** (144/144 passed) |
| **`GR-BRG-001`** | `[NORMATIVE]` | Epistemic Boundary Enforcement | Architecture | Code inspection | Claims/links enter in non-authoritative state; zero automated LLM auto-commit. | ✅ **PASS** (Explicit fixture only) |
| **`GR-BRG-002`** | `[NORMATIVE]` | Zero Scholarly Tier Invention | Architecture | Code inspection | No heuristic citation-count rules implemented; tier assignment remains explicit. | ✅ **PASS** (Zero heuristic code) |
| **`GR-BRG-003`** | `[NORMATIVE]` | Anti-Creep Scope Isolation | Project boundary | Scope audit | Excluded components (Phase 3/5, Research B–F, DEF-DATA-001) remain untouched. | ✅ **PASS** (Scope audit confirmed) |

---

## 3. Human Ratification Record

- **Ratification Date**: 2026-09-05
- **Ratification Status**: 🟢 **RATIFIED & ACCEPTED**
- **Governance Gate**:
  - `HUMAN RATIFICATION`: **GRANTED**
  - `SDD-007 IMPLEMENTATION & VERIFICATION`: **ACCEPTED**
  - `MERGE AUTHORIZATION`: **NOT GRANTED**
  - `PROMOTION AUTHORIZATION`: **NOT GRANTED**
  - `RELEASE AUTHORIZATION`: **NOT GRANTED**
  - `DEPLOYMENT AUTHORIZATION`: **NOT GRANTED**
- **Preserved Unresolved Decisions**:
  1. Systemic source-of-truth precedence between `sessions.state_data` and SQLite relational entities.
  2. Scholarly authority-tier assignment rule.
  3. Claim activation authority/protocol.
  4. Evidence `relation_type` and `evidence_strength` classification protocol.
