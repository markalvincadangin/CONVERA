# CONVERA Database Schema Specification

**Document ID**: `CONVERA-DAT-002`  
**Classification**: Physical Relational DDL & WAL Schema (23 Tables)  
**Authority Tier**: Tier 2 Data Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/05-data/DATABASE_SCHEMA.md`  
**Upstream Dependencies**: `02-system/DOMAIN_MODEL.md, 05-data/DATA_ARCHITECTURE.md`  
**Downstream Dependents**: `backend/storage/sqlite_adapter.py, 06-frontend/INFORMATION_ARCHITECTURE.md`  

---

`[EVIDENCE-DERIVED PHYSICAL SCHEMA SPECIFICATION]`
*Document Version: 1.1.0*  
*Last Verified: 2026-09-04*  
*Target Architecture: SQLite 3.45+ (WAL Mode)*  
*Source Authority: Physical schema extracted from `backend/ratchetai.db` & `backend/storage/sqlite_adapter.py`*

---

## 1. Executive Summary & Schema Invariants

This document specifies the **physical relational database schema** for the CONVERA platform. Extracted directly from the operational SQLite database (`backend/ratchetai.db`) and verified against the Inversion-of-Control storage adapter (`backend/storage/sqlite_adapter.py`), this specification documents all 23 physical relational tables, column storage classes, primary and foreign key constraints, composite index topologies, and application-level JSON contracts.

### Core Physical Schema Invariants

* **SCH-01: Engine Topology**: SQLite 3.45+ operating with Write-Ahead Logging (`PRAGMA journal_mode=WAL`), normalized synchronization (`PRAGMA synchronous=NORMAL`), and mandatory foreign key constraint enforcement (`PRAGMA foreign_keys=ON`).
* **SCH-02: Project-Scoped Tenancy**: Every operational table enforces tenancy either via a direct `project_id` foreign key or a formally defined foreign-key ownership path to `projects(id)`.
* **SCH-03: Typed Application Serialization**: Complex epistemic collections, blast-radius vectors, and lineage metadata are stored physically as SQLite `TEXT` containing JSON, deserialized and validated by application-defined schemas and Pydantic models at service boundaries.
* **SCH-04: Non-Destructive Supersession & Immutability**: Historical event tables enforce append-only preservation (`[NORMATIVE]`), tracking supersession via explicit lineage pointers (`superseded_by_id`).
* **SCH-05: Parameterized Query Governance**: 100% parameterization of SQL queries is governed by architectural principle `DATA-03`; the physical schema provides index support for all parameterized lookups.

---

## 2. Conceptual Entity ↔ Physical Relational Table Mapping

The 20 Conceptual Entities (16 Canonical Domain Entities + 4 Support Entities) defined in `docs/02-system/DOMAIN_MODEL.md` map to 23 physical relational tables categorized by architectural domain:

| Domain | Table Name | Conceptual Entity | Table Structural Role |
| :--- | :--- | :--- | :--- |
| **Core Project & Session** | `projects` | ResearchProject (E01) | Direct Entity Table |
| | `project_members` | ProjectMember (Support) | Association / RBAC Table |
| | `sessions` | SessionState (E02) | Direct Entity Table |
| | `session_snapshots` | SessionSnapshot (Support) | Immutable History / State Snapshot |
| **Problem Conception** | `problems` | ProblemStatement (E03) | Direct Entity Table |
| | `problem_sources` | LiteratureSource (E04) | Direct Entity Table |
| | `problem_phase_history` | PhaseTransition (E05) | Historical Event Table |
| | `problem_claims` | ProblemClaim (E06) | Direct Entity Table |
| | `problem_assumptions` | ProblemAssumption (E08) | Direct Entity Table |
| | `problem_alternatives` | ProblemAlternative (E09) | Direct Entity Table |
| | `decision_records` | EpistemicDecision (E10) | Direct Entity Table |
| **Collaboration & Governance** | `problem_comments` | CollaborationComment (E11) | Direct Entity Table |
| | `mentor_signoffs` | MentorSignoff (E12) | Authorization / Audit Table |
| **Evidence & Epistemic Infrastructure** | `claim_evidence_links` | Claim ↔ Evidence Link | Bipartite Association Table |
| | `assumption_validation_tests` | AssumptionTest (E13) | Direct Entity Table |
| | `impact_invalidation_events` | InvalidationEvent (E14) | Historical Event Table |
| | `evidence_provenance` | EvidenceProvenance (E15) | Provenance & Lineage Table |
| | `claim_contradictions` | ContradictionRecord (E16) | Epistemic Conflict Table |
| **Discovery & Traceability** | `project_unknowns` | KnownUnknown (Support) | Support / Discovery Table |
| | `requirements_traceability` | RequirementsTrace (Support) | Support / Traceability Table |
| | `gate_reviews` | GateReview (Support) | Support / Governance Table |
| **Dual-Track Specialization** | `research_domains` | ResearchDomain (Support) | Support / Domain Context Table |
| | `circumscription_iterations` | CircumscriptionIteration (Support) | Support / Iteration History Table |

---

## 3. Physical Table Specifications

### 3.1 Domain 1: Core Project & Session Domain (4 Tables)

#### Table T01: `projects`
* **Domain Entity**: `ResearchProject (E01)`
* **Structural Role**: Root Tenancy Entity Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Project UUID / Unique Identifier |
| `share_code` | `TEXT` | `NO` | None | `UNIQUE` | Human-readable 6-8 char sharing code |
| `name` | `TEXT` | `NO` | None | None | Human-readable project title |
| `created_by` | `TEXT` | `YES` | `'Founder'` | None | Initial project creator identifier |
| `passcode` | `TEXT` | `YES` | None | None | Optional access passcode hash |
| `created_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 creation timestamp |
| `updated_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 last update timestamp |

* **Physical Indices**:
  * `idx_projects_share_code` ON `projects(share_code)`
* **Foreign Key References**: None (Root table)

---

#### Table T02: `project_members`
* **Domain Entity**: `ProjectMember (Support)`
* **Structural Role**: RBAC Membership Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Membership record UUID |
| `project_id` | `TEXT` | `NO` | None | `FK -> projects(id)` | Parent project reference |
| `user_id` | `TEXT` | `NO` | None | None | User / Member identifier |
| `role` | `TEXT` | `NO` | `'researcher'` | None | Role: `'owner'`, `'researcher'`, `'mentor'`, `'observer'` |
| `joined_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 membership timestamp |

* **Physical Indices**:
  * `idx_project_members_project_id` ON `project_members(project_id)`
  * `idx_project_members_user_id` ON `project_members(user_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `project_id` REFERENCES `projects(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

#### Table T03: `sessions`
* **Domain Entity**: `SessionState (E02)`
* **Structural Role**: Direct Entity Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `session_id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Canonical session UUID |
| `data` | `TEXT` | `YES` | None | None | Serialized session context / parameters |
| `created_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 creation timestamp |
| `updated_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 last update timestamp |
| `project_id` | `TEXT` | `YES` | None | `FK -> projects(id)` | Parent project reference |

* **Physical Indices**:
  * `idx_sessions_project_id` ON `sessions(project_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `project_id` REFERENCES `projects(id)` ON DELETE `SET NULL` ON UPDATE `NO ACTION`

---

#### Table T04: `session_snapshots`
* **Domain Entity**: `SessionSnapshot (Support)`
* **Structural Role**: State Snapshot / History Table
* **Immutability Status**: `[NORMATIVE]` Immutable historical snapshots; `[IMPLEMENTED]` Created via append-only snapshot writes.

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `NO` | None | `PRIMARY KEY AUTOINCREMENT` | Snapshot sequence ID |
| `session_id` | `TEXT` | `YES` | None | `FK -> sessions(session_id)` | Referenced session UUID |
| `snapshot_json` | `TEXT` | `NO` | None | None | Complete frozen JSON state payload |
| `created_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 snapshot timestamp |

* **Physical Indices**:
  * `idx_session_snapshots_session_id` ON `session_snapshots(session_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `session_id` REFERENCES `sessions(session_id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

### 3.2 Domain 2: Problem Conception Domain (7 Tables)

#### Table T05: `problems`
* **Domain Entity**: `ProblemStatement (E03)`
* **Structural Role**: Core Problem Framing Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Problem statement UUID |
| `session_id` | `TEXT` | `YES` | None | `FK -> sessions(session_id)` | Associated session UUID |
| `project_id` | `TEXT` | `YES` | None | `FK -> projects(id)` | Scoping project UUID |
| `title` | `TEXT` | `NO` | None | None | Problem statement title / summary |
| `domain` | `TEXT` | `YES` | None | None | Research domain / Venture sector |
| `target_user` | `TEXT` | `YES` | None | None | Identified persona or end-user |
| `current_phase` | `TEXT` | `YES` | `'EXPLORATION'` | None | Current SDD lifecycle phase |
| `status` | `TEXT` | `YES` | `'DRAFT'` | None | Epistemic status: `'DRAFT'`, `'SUBMITTED'`, `'RATIFIED'` |
| `created_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 creation timestamp |
| `updated_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 last update timestamp |
| `phase1_data` | `TEXT` | `YES` | None | None | JSON payload: Phase 1 conception data |
| `phase2_data` | `TEXT` | `YES` | None | None | JSON payload: Phase 2 validation data |
| `phase3_data` | `TEXT` | `YES` | None | None | JSON payload: Phase 3 circumscription data |

* **Physical Indices**:
  * `idx_problems_session_id` ON `problems(session_id)`
  * `idx_problems_project_id` ON `problems(project_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `session_id` REFERENCES `sessions(session_id)` ON DELETE `SET NULL` ON UPDATE `NO ACTION`
  * `project_id` REFERENCES `projects(id)` ON DELETE `SET NULL` ON UPDATE `NO ACTION`

---

#### Table T06: `problem_sources`
* **Domain Entity**: `LiteratureSource (E04)`
* **Structural Role**: Ingested Literature Source Record

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `NO` | None | `PRIMARY KEY AUTOINCREMENT` | Source sequence integer ID |
| `problem_id` | `TEXT` | `YES` | None | `FK -> problems(id)` | Parent problem statement UUID |
| `url` | `TEXT` | `YES` | None | None | Canonical URL or resource URI |
| `title` | `TEXT` | `YES` | None | None | Document or paper title |
| `snippet` | `TEXT` | `YES` | None | None | Extracted excerpt or abstract |
| `source_tier` | `TEXT` | `YES` | `'TIER_B'` | None | Taxonomy tier: `'TIER_A'`, `'TIER_B'`, `'TIER_C'`, `'SYNTHETIC'` |
| `created_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 ingestion timestamp |

* **Physical Indices**:
  * `idx_problem_sources_problem_id` ON `problem_sources(problem_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `problem_id` REFERENCES `problems(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`
* **Application-Level Linkage Note**: `problem_sources.id` (INTEGER) is referenced as an integer FK by `claim_evidence_links.source_id`, and stringified as `TEXT` when referenced by `evidence_provenance.source_id`.

---

#### Table T07: `problem_phase_history`
* **Domain Entity**: `PhaseTransition (E05)`
* **Structural Role**: Historical Phase Progression Table
* **Immutability Status**: `[NORMATIVE]` Append-only transition audit log.

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `NO` | None | `PRIMARY KEY AUTOINCREMENT` | Transition sequence ID |
| `problem_id` | `TEXT` | `YES` | None | `FK -> problems(id)` | Associated problem UUID |
| `from_phase` | `TEXT` | `NO` | None | None | Source phase |
| `to_phase` | `TEXT` | `NO` | None | None | Destination phase |
| `transition_reason` | `TEXT` | `YES` | None | None | Rationale for stage progression |
| `created_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 transition timestamp |

* **Physical Indices**:
  * `idx_problem_phase_history_problem_id` ON `problem_phase_history(problem_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `problem_id` REFERENCES `problems(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

#### Table T08: `problem_claims`
* **Domain Entity**: `ProblemClaim (E06)`
* **Structural Role**: Core Epistemic Claim Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Canonical Claim UUID (`CLM-xxx`) |
| `problem_id` | `TEXT` | `NO` | None | `FK -> problems(id)` | Parent problem statement UUID |
| `claim_text` | `TEXT` | `NO` | None | None | Atomic falsifiable proposition |
| `claim_type` | `TEXT` | `NO` | `'IMPACT'` | None | Type: `'PROBLEM'`, `'ROOT_CAUSE'`, `'IMPACT'`, `'SOLUTION'`, `'MARKET'` |
| `epistemic_status` | `TEXT` | `NO` | `'ASSERTED'` | None | Status: `'ASSERTED'`, `'SUPPORTED'`, `'CONTESTED'`, `'FALSIFIED'`, `'VERIFIED'` |
| `confidence_score` | `REAL` | `NO` | `0.5` | None | Calibrated epistemic confidence $[0.0, 1.0]$ |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 creation timestamp (TEXT) |
| `updated_at` | `TEXT` | `NO` | None | None | ISO-8601 last update timestamp (TEXT) |

* **Physical Indices**:
  * `idx_problem_claims_problem_id` ON `problem_claims(problem_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `problem_id` REFERENCES `problems(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

#### Table T09: `problem_assumptions`
* **Domain Entity**: `ProblemAssumption (E08)`
* **Structural Role**: Critical Assumption & Vulnerability Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Assumption UUID (`ASM-xxx`) |
| `problem_id` | `TEXT` | `NO` | None | `FK -> problems(id)` | Parent problem UUID |
| `assumption_text` | `TEXT` | `NO` | None | None | Underlying operational assumption |
| `criticality` | `TEXT` | `NO` | `'MEDIUM'` | None | Criticality rating: `'LOW'`, `'MEDIUM'`, `'HIGH'`, `'CRITICAL'` |
| `validation_status` | `TEXT` | `NO` | `'UNVALIDATED'` | None | Status: `'UNVALIDATED'`, `'IN_PROGRESS'`, `'VALIDATED'`, `'INVALIDATED'` |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 creation timestamp (TEXT) |
| `updated_at` | `TEXT` | `NO` | None | None | ISO-8601 last update timestamp (TEXT) |

* **Physical Indices**:
  * `idx_problem_assumptions_problem_id` ON `problem_assumptions(problem_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `problem_id` REFERENCES `problems(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

#### Table T10: `problem_alternatives`
* **Domain Entity**: `ProblemAlternative (E09)`
* **Structural Role**: Competing Solutions / Counter-Hypotheses Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Alternative UUID (`ALT-xxx`) |
| `problem_id` | `TEXT` | `NO` | None | `FK -> problems(id)` | Parent problem UUID |
| `title` | `TEXT` | `NO` | None | None | Alternative approach title |
| `description` | `TEXT` | `NO` | None | None | Technical / market solution description |
| `tradeoffs` | `TEXT` | `YES` | None | None | Comparative trade-off analysis |
| `status` | `TEXT` | `NO` | `'PROPOSED'` | None | Status: `'PROPOSED'`, `'UNDER_EVALUATION'`, `'REJECTED'`, `'SELECTED'` |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 creation timestamp (TEXT) |
| `updated_at` | `TEXT` | `NO` | None | None | ISO-8601 last update timestamp (TEXT) |

* **Physical Indices**:
  * `idx_problem_alternatives_problem_id` ON `problem_alternatives(problem_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `problem_id` REFERENCES `problems(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

#### Table T11: `decision_records`
* **Domain Entity**: `EpistemicDecision (E10)`
* **Structural Role**: Formal Epistemic Decision Record

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Decision UUID (`DEC-xxx`) |
| `session_id` | `TEXT` | `YES` | None | None | Associated session UUID |
| `stage` | `TEXT` | `NO` | None | None | SDD Stage: `'STAGE_0'` through `'STAGE_7'` |
| `selected_problem_id` | `TEXT` | `NO` | None | None | Ratified ProblemStatement UUID |
| `rejected_problem_ids` | `TEXT` | `YES` | `'[]'` | None | JSON Array: Rejected alternative IDs |
| `decision_rationale` | `TEXT` | `NO` | None | None | Justification and decision argument |
| `supporting_evidence_ids` | `TEXT` | `YES` | `'[]'` | None | JSON Array: Supporting source/claim IDs |
| `created_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 creation timestamp |

* **Project Ownership Path**:
  ```text
  decision_records.session_id
  → sessions.session_id (sessions.project_id)
  → projects.id
  ```
* **Foreign Key References**: Application-level reference from `session_id` to `sessions(session_id)`.

---

### 3.3 Domain 3: Collaboration & Governance Domain (2 Tables)

#### Table T12: `problem_comments`
* **Domain Entity**: `CollaborationComment (E11)`
* **Structural Role**: Discourse & Review Comments Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `NO` | None | `PRIMARY KEY AUTOINCREMENT` | Comment sequence ID |
| `problem_id` | `TEXT` | `YES` | None | `FK -> problems(id)` | Referenced problem UUID |
| `author` | `TEXT` | `NO` | None | None | Author display name / role |
| `text` | `TEXT` | `NO` | None | None | Feedback or comment body |
| `created_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 creation timestamp |

* **Physical Indices**:
  * `idx_problem_comments_problem_id` ON `problem_comments(problem_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `problem_id` REFERENCES `problems(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

#### Table T13: `mentor_signoffs`
* **Domain Entity**: `MentorSignoff (E12)`
* **Structural Role**: Human Governance Authorization Record
* **Immutability Status**: `[NORMATIVE]` Formal gate authorization record; `[IMPLEMENTED]` Created via explicit sign-off mutation.

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `NO` | None | `PRIMARY KEY AUTOINCREMENT` | Signoff sequence ID |
| `problem_id` | `TEXT` | `YES` | None | None | Target problem UUID |
| `phase` | `TEXT` | `NO` | None | None | Ratified phase identifier |
| `mentor_name` | `TEXT` | `NO` | None | None | Mentor / Reviewer name |
| `feedback` | `TEXT` | `YES` | None | None | Governance commentary |
| `status` | `TEXT` | `YES` | `'APPROVED'` | None | Status: `'APPROVED'`, `'CHANGES_REQUESTED'` |
| `created_at` | `TIMESTAMP` | `YES` | `CURRENT_TIMESTAMP` | None | ISO-8601 authorization timestamp |
| `project_id` | `TEXT` | `YES` | None | `FK -> projects(id)` | Scoping project UUID |

* **Physical Indices**:
  * `idx_mentor_signoffs_project_id` ON `mentor_signoffs(project_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `project_id` REFERENCES `projects(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

### 3.4 Domain 4: Evidence & Epistemic Infrastructure Domain (5 Tables)

#### Table T14: `claim_evidence_links`
* **Primary Domain Mapping**: ProblemClaim (E06) ↔ LiteratureSource (E04) Relationship
* **Structural Role**: Bipartite Association Link Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Link UUID (`LNK-xxx`) |
| `claim_id` | `TEXT` | `NO` | None | `FK -> problem_claims(id)` | Linked claim UUID |
| `source_id` | `INTEGER` | `NO` | None | `FK -> problem_sources(id)` | Linked literature source integer ID |
| `relation_type` | `TEXT` | `NO` | `'SUPPORTS'` | None | Relation: `'SUPPORTS'`, `'CONTRADICTS'`, `'EXTENDS'`, `'QUALIFIES'` |
| `evidence_strength` | `REAL` | `NO` | `0.7` | None | Link corroboration strength $[0.0, 1.0]$ |
| `rationale` | `TEXT` | `YES` | None | None | Explanation of epistemic link |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 creation timestamp (TEXT) |

* **Physical Indices**:
  * `idx_claim_evidence_claim` ON `claim_evidence_links(claim_id)`
  * `idx_claim_evidence_source` ON `claim_evidence_links(source_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `claim_id` REFERENCES `problem_claims(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`
  * `source_id` REFERENCES `problem_sources(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

#### Table T15: `assumption_validation_tests`
* **Domain Entity**: `AssumptionTest (E13)`
* **Structural Role**: Empirical Assumption Test Record

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Test execution UUID (`TST-xxx`) |
| `assumption_id` | `TEXT` | `NO` | None | `FK -> problem_assumptions(id)` | Parent assumption UUID |
| `test_type` | `TEXT` | `NO` | `'EMPIRICAL'` | None | Type: `'EMPIRICAL'`, `'LITERATURE'`, `'EXPERT_INTERVIEW'`, `'PROTOTYPE'` |
| `description` | `TEXT` | `NO` | None | None | Protocol / procedure description |
| `success_criteria` | `TEXT` | `NO` | None | None | Quantitative / qualitative threshold |
| `results` | `TEXT` | `YES` | None | None | Observed empirical outcome |
| `outcome` | `TEXT` | `NO` | `'INCONCLUSIVE'` | None | Result: `'CONFIRMED'`, `'FALSIFIED'`, `'INCONCLUSIVE'` |
| `executed_at` | `TEXT` | `YES` | None | None | ISO-8601 execution timestamp (TEXT) |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 creation timestamp (TEXT) |

* **Physical Indices**:
  * `idx_assumption_validation_tests_assumption_id` ON `assumption_validation_tests(assumption_id)`
* **Foreign Key Constraints (SQLite Enforced)**:
  * `assumption_id` REFERENCES `problem_assumptions(id)` ON DELETE `CASCADE` ON UPDATE `NO ACTION`

---

#### Table T16: `impact_invalidation_events`
* **Domain Entity**: `InvalidationEvent (E14)`
* **Structural Role**: Blast-Radius Invalidation Record
* **Immutability Status**: `[NORMATIVE]` Immutable audit event of epistemic invalidation.

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Event UUID (`INV-xxx`) |
| `source_claim_id` | `TEXT` | `NO` | None | None | Originating falsified claim UUID |
| `invalidation_reason` | `TEXT` | `NO` | None | None | Trigger rationale |
| `affected_entities` | `TEXT` | `NO` | None | None | JSON Array: Downstream entity UUIDs impacted |
| `resolution_status` | `TEXT` | `NO` | `'PENDING'` | None | Status: `'PENDING'`, `'RECALIBRATED'`, `'DISMISSED'` |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 event timestamp (TEXT) |
| `resolved_at` | `TEXT` | `YES` | None | None | ISO-8601 resolution timestamp (TEXT) |

* **Foreign Key References**: Application-level foreign references to `problem_claims(id)` via `source_claim_id`.

---

#### Table T17: `evidence_provenance`
* **Domain Entity**: `EvidenceProvenance (E15)`
* **Structural Role**: Provenance & Retrieval Lineage Record
* **Immutability Status**: `[NORMATIVE]` Append-only provenance lineage; supersessions point forward via `superseded_by_id`.

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Provenance record UUID (`PRV-xxx`) |
| `source_id` | `TEXT` | `NO` | None | None | Referenced source ID (stringified `problem_sources.id` or external identifier) |
| `connector` | `TEXT` | `NO` | None | None | Ingestion service: `'OPENALEX'`, `'CROSSREF'`, `'PUBMED'`, `'EUROPE_PMC'`, `'SEMANTIC_SCHOLAR'`, `'MANUAL'` |
| `original_identifier` | `TEXT` | `YES` | None | None | External DOI, PMID, OpenAlex ID, or URI |
| `retrieval_timestamp` | `TEXT` | `NO` | None | None | ISO-8601 retrieval timestamp (TEXT) |
| `extraction_model` | `TEXT` | `YES` | None | None | AI model ID used for extraction |
| `extraction_prompt_hash` | `TEXT` | `YES` | None | None | SHA-256 hash of extraction prompt |
| `human_verification_state` | `TEXT` | `YES` | `'UNVERIFIED'` | None | Verification: `'UNVERIFIED'`, `'VERIFIED'`, `'CONTESTED'`, `'REJECTED'` |
| `superseded_by_id` | `TEXT` | `YES` | None | None | Lineage pointer to replacing provenance UUID |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 creation timestamp (TEXT) |

* **Application-Level Linkage & Storage Class Note**: `source_id` is stored as SQLite `TEXT` without an engine-level FK constraint to support both local integer primary keys (`problem_sources.id`) and raw external repository identifiers without schema mutation.

---

#### Table T18: `claim_contradictions`
* **Domain Entity**: `ContradictionRecord (E16)`
* **Structural Role**: Contradiction Pair & Epistemic Tension Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Contradiction UUID (`CTD-xxx`) |
| `claim_id` | `TEXT` | `NO` | None | None | Focus claim UUID |
| `supporting_evidence_id` | `TEXT` | `NO` | None | None | Supporting link/source UUID |
| `contradicting_evidence_id` | `TEXT` | `NO` | None | None | Contradicting link/source UUID |
| `status` | `TEXT` | `NO` | `'CONTESTED'` | None | Epistemic status: `'CONTESTED'`, `'RESOLVED_SUPPORTED'`, `'RESOLVED_FALSIFIED'`, `'DIALECTIC_SYNTHESIS'` |
| `investigation_notes` | `TEXT` | `YES` | None | None | Dialectic analysis commentary |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 discovery timestamp (TEXT) |
| `updated_at` | `TEXT` | `NO` | None | None | ISO-8601 resolution timestamp (TEXT) |

* **Application-Level Foreign References**:
  * `claim_id`: References `problem_claims(id)`
  * `supporting_evidence_id`: References `claim_evidence_links(id)` or `problem_sources(id)`
  * `contradicting_evidence_id`: References `claim_evidence_links(id)` or `problem_sources(id)`

---

### 3.5 Domain 5: Discovery & Traceability Support Domain (3 Tables)

#### Table T19: `project_unknowns`
* **Domain Entity**: `KnownUnknown (Support)`
* **Structural Role**: Active Inquiry & Uncertainty Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Unknown UUID (`UNK-xxx`) |
| `project_id` | `TEXT` | `NO` | None | None | Scoping project UUID |
| `session_id` | `TEXT` | `YES` | None | None | Associated session UUID |
| `category` | `TEXT` | `NO` | None | None | Taxonomy: `'MARKET'`, `'TECHNICAL'`, `'EPISTEMIC'`, `'REGULATORY'` |
| `description` | `TEXT` | `NO` | None | None | Articulated uncertainty statement |
| `inquiry_strategy` | `TEXT` | `YES` | None | None | Investigation protocol |
| `status` | `TEXT` | `NO` | `'ACTIVE'` | None | Status: `'ACTIVE'`, `'INVESTIGATING'`, `'RESOLVED'`, `'ACCEPTED'` |
| `discovered_at` | `TEXT` | `NO` | None | None | ISO-8601 discovery timestamp (TEXT) |
| `resolved_at` | `TEXT` | `YES` | None | None | ISO-8601 resolution timestamp (TEXT) |

* **Foreign Key References**: Application-level reference from `project_id` to `projects(id)`.

---

#### Table T20: `requirements_traceability`
* **Domain Entity**: `RequirementsTrace (Support)`
* **Structural Role**: Cross-Phase Bidirectional Traceability Link

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Trace UUID (`TRC-xxx`) |
| `project_id` | `TEXT` | `NO` | None | None | Scoping project UUID |
| `source_phase` | `TEXT` | `NO` | None | None | Upstream lifecycle phase |
| `source_entity_id` | `TEXT` | `NO` | None | None | Upstream entity UUID |
| `target_phase` | `TEXT` | `NO` | None | None | Downstream lifecycle phase |
| `target_entity_id` | `TEXT` | `NO` | None | None | Downstream entity UUID |
| `trace_type` | `TEXT` | `NO` | `'DERIVES_FROM'` | None | Type: `'DERIVES_FROM'`, `'VALIDATES'`, `'DEPENDS_ON'`, `'CONFLICTS_WITH'` |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 creation timestamp (TEXT) |

* **Foreign Key References**: Application-level references to `projects(id)`, `source_entity_id`, and `target_entity_id`.

---

#### Table T21: `gate_reviews`
* **Domain Entity**: `GateReview (Support)`
* **Structural Role**: Stage-Gate Human Governance Review Record
* **Immutability Status**: `[NORMATIVE]` Formal human authorization record.

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Gate review UUID (`GAT-xxx`) |
| `project_id` | `TEXT` | `NO` | None | None | Scoping project UUID |
| `phase` | `TEXT` | `NO` | None | None | Reviewed lifecycle phase |
| `reviewer_id` | `TEXT` | `NO` | None | None | Reviewing human authority ID |
| `verdict` | `TEXT` | `NO` | None | None | Verdict: `'PASSED'`, `'FAILED'`, `'CONDITIONALLY_PASSED'` |
| `feedback` | `TEXT` | `YES` | None | None | Structured governance feedback |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 review timestamp (TEXT) |

* **Foreign Key References**: Application-level reference from `project_id` to `projects(id)`.

---

### 3.6 Domain 6: Dual-Track Specialization Domain (2 Tables)

#### Table T22: `research_domains`
* **Domain Entity**: `ResearchDomain (Support)`
* **Structural Role**: Track 2 Computing Context Table

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Domain UUID (`RSD-xxx`) |
| `project_id` | `TEXT` | `NO` | None | None | Scoping project UUID |
| `domain_name` | `TEXT` | `NO` | None | None | Computing sub-discipline name |
| `sub_fields` | `TEXT` | `YES` | `'[]'` | None | JSON Array: Specialized sub-disciplines |
| `primary_benchmarks` | `TEXT` | `YES` | `'[]'` | None | JSON Array: Standard benchmark datasets |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 creation timestamp (TEXT) |

* **Foreign Key References**: Application-level reference from `project_id` to `projects(id)`.

---

#### Table T23: `circumscription_iterations`
* **Domain Entity**: `CircumscriptionIteration (Support)`
* **Structural Role**: Iterative Empirical Testing History
* **Immutability Status**: `[NORMATIVE]` Empirical test iteration history record.

| Column Name | SQLite Storage Class | Nullable | Default | PK / FK Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | None | `PRIMARY KEY` | Iteration UUID (`CIR-xxx`) |
| `project_id` | `TEXT` | `NO` | None | None | Scoping project UUID |
| `session_id` | `TEXT` | `YES` | None | None | Associated session UUID |
| `artifact_name` | `TEXT` | `NO` | None | None | System/Model artifact tested |
| `iteration_number` | `INTEGER` | `NO` | None | None | Sequence integer |
| `test_run_name` | `TEXT` | `NO` | None | None | Test scenario identifier |
| `metric_name` | `TEXT` | `NO` | None | None | Measured performance metric |
| `observed_value` | `REAL` | `NO` | None | None | Measured numerical outcome |
| `target_value` | `REAL` | `NO` | None | None | Required threshold value |
| `status` | `TEXT` | `NO` | None | None | Outcome: `'PASSED'`, `'FAILED_LOOPBACK'` |
| `failure_mode` | `TEXT` | `YES` | None | None | Boundary condition diagnosis |
| `constraint_extracted` | `TEXT` | `YES` | None | None | Invariant derived from iteration |
| `target_phase_loopback` | `TEXT` | `YES` | `'PHASE_D'` | None | Upstream phase targeted for loopback |
| `created_at` | `TEXT` | `NO` | None | None | ISO-8601 timestamp (Stored as TEXT) |

* **Foreign Key References**: Application-level references to `projects(id)` and `sessions(session_id)`.

---

## 4. Foreign Key & Cascade Constraint Matrix

The CONVERA database implements a hybrid constraint architecture: core transactional entities enforce database-level relational constraints via SQLite foreign keys, while event logs, external provenance, and polymorphic traceability links maintain application-level references.

### 4.1 Database-Enforced SQLite Foreign Keys (13 Relationships)

| Child Table | Foreign Key Column | Parent Table | Parent Key Column | ON DELETE Action | ON UPDATE Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `project_members` | `project_id` | `projects` | `id` | `CASCADE` | `NO ACTION` |
| `sessions` | `project_id` | `projects` | `id` | `SET NULL` | `NO ACTION` |
| `session_snapshots` | `session_id` | `sessions` | `session_id` | `CASCADE` | `NO ACTION` |
| `problems` | `session_id` | `sessions` | `session_id` | `SET NULL` | `NO ACTION` |
| `problems` | `project_id` | `projects` | `id` | `SET NULL` | `NO ACTION` |
| `problem_sources` | `problem_id` | `problems` | `id` | `CASCADE` | `NO ACTION` |
| `problem_phase_history` | `problem_id` | `problems` | `id` | `CASCADE` | `NO ACTION` |
| `problem_claims` | `problem_id` | `problems` | `id` | `CASCADE` | `NO ACTION` |
| `problem_assumptions` | `problem_id` | `problems` | `id` | `CASCADE` | `NO ACTION` |
| `problem_alternatives` | `problem_id` | `problems` | `id` | `CASCADE` | `NO ACTION` |
| `problem_comments` | `problem_id` | `problems` | `id` | `CASCADE` | `NO ACTION` |
| `mentor_signoffs` | `project_id` | `projects` | `id` | `CASCADE` | `NO ACTION` |
| `claim_evidence_links` | `claim_id` | `problem_claims` | `id` | `CASCADE` | `NO ACTION` |
| `claim_evidence_links` | `source_id` | `problem_sources` | `id` | `CASCADE` | `NO ACTION` |
| `assumption_validation_tests` | `assumption_id` | `problem_assumptions` | `id` | `CASCADE` | `NO ACTION` |

### 4.2 Application-Managed Foreign References

| Dependent Table | Reference Column | Logical Target | Cardinality | Resolution & Integrity Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| `decision_records` | `session_id` | `sessions(session_id)` | $N : 1$ | Scoped via Session ownership path to `projects(id)` |
| `impact_invalidation_events` | `source_claim_id` | `problem_claims(id)` | $N : 1$ | Blast-radius query resolution via `StorageAdapter` |
| `evidence_provenance` | `source_id` | `problem_sources(id)` / URI | $N : 1$ | Resolves to local integer ID string or external DOI/URI |
| `claim_contradictions` | `claim_id` | `problem_claims(id)` | $N : 1$ | Application-level epistemic tension queries |
| `claim_contradictions` | `supporting_evidence_id` | `claim_evidence_links(id)` | $N : 1$ | Application-level resolution |
| `claim_contradictions` | `contradicting_evidence_id`| `claim_evidence_links(id)` | $N : 1$ | Application-level resolution |
| `project_unknowns` | `project_id` | `projects(id)` | $N : 1$ | Scoped via project tenancy queries |
| `requirements_traceability` | `project_id` | `projects(id)` | $N : 1$ | Scoped via project tenancy queries |
| `requirements_traceability` | `source_entity_id` | Polymorphic Entity ID | $N : 1$ | Dynamic graph edge resolution |
| `requirements_traceability` | `target_entity_id` | Polymorphic Entity ID | $N : 1$ | Dynamic graph edge resolution |
| `gate_reviews` | `project_id` | `projects(id)` | $N : 1$ | Scoped via project tenancy queries |
| `research_domains` | `project_id` | `projects(id)` | $N : 1$ | Scoped via project tenancy queries |
| `circumscription_iterations` | `project_id` | `projects(id)` | $N : 1$ | Scoped via project tenancy queries |

---

## 5. Application Serialization Contracts (JSON Columns)

Where complex or polymorphic data is stored within SQLite `TEXT` columns, the application layer enforces specific JSON serialization schemas:

```
SQLite Physical Storage (TEXT)
        │
        ▼ (JSON Deserialization)
Application Serialization Contract
        │
        ▼ (Typed Validation at Service Boundary)
Pydantic Schemas / Structured Types (where implemented)
```

| Table | Column | Serialization Format | Application Contract / Pydantic Model |
| :--- | :--- | :--- | :--- |
| `session_snapshots` | `snapshot_json` | `Dict[str, Any]` | Full serialized `SessionState` snapshot |
| `problems` | `phase1_data` | `Dict[str, Any]` | Phase 1 Framing & Ingestion Output |
| `problems` | `phase2_data` | `Dict[str, Any]` | `Phase2Output` (Rigorous validation & falsification) |
| `problems` | `phase3_data` | `Dict[str, Any]` | Phase 3 Circumscription & Synthesis Output |
| `decision_records` | `rejected_problem_ids` | `List[str]` | Array of rejected problem UUID strings |
| `decision_records` | `supporting_evidence_ids` | `List[str]` | Array of supporting evidence/claim UUID strings |
| `impact_invalidation_events`| `affected_entities` | `List[str]` | Blast-radius downstream impacted entity UUIDs |
| `research_domains` | `sub_fields` | `List[str]` | Computing sub-disciplines list |
| `research_domains` | `primary_benchmarks` | `List[str]` | Standard benchmark dataset names |

---

## 6. Schema Ratification & Compliance Verification

| Verification Dimension | Criterion | Implemented Status | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **Physical Table Extraction** | 23 tables extracted | 🟢 Complete | Verified against `backend/ratchetai.db` |
| **Engine Configuration** | WAL Mode & Foreign Keys | 🟢 Enforced | `PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;` in `sqlite_adapter.py` |
| **Relational Integrity** | 13 SQLite FKs | 🟢 Verified | Extracted via `PRAGMA foreign_key_list()` |
| **Tenancy Scoping** | Project ownership path | 🟢 Verified | Direct or transitive `project_id` path across all 23 tables |
| **JSON Serialization** | Strict serialization contracts | 🟢 Aligned | Validated via `backend/schemas/` models and adapter serializers |
