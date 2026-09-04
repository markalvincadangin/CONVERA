# DATA ARCHITECTURE & PERSISTENCE SPECIFICATION

**Document ID**: `CONVERA-DATA-001`  
**Classification**: Persistence Layer Architecture & Storage Specification  
**Authority Tier**: Tier 1 Normative / Tier 2 Descriptive  
**Status**: 🟢 RATIFICATION-READY  
**Canonical Path**: `docs/05-data/DATA_ARCHITECTURE.md`  
**Upstream Dependencies**: `CONSTITUTION.md` (Articles III, VI, VII), `SYSTEM_ARCHITECTURE.md` (Area 4), `DOMAIN_MODEL.md`, `KNOWLEDGE_MODEL.md`, `EVIDENCE_MODEL.md`, `DECISION_MODEL.md`, `TRACEABILITY_MODEL.md`, `ENGINEERING_PRINCIPLES.md`, `SECURITY.md`  
**Downstream Dependents**: `docs/05-data/DATABASE_SCHEMA.md`, `docs/05-data/PROVENANCE.md`, `backend/storage/*`  

---

## 1. Executive Summary & Architectural Scope

The **Data Architecture & Persistence Layer** constitutes Topological Area 4 of the CONVERA platform. It is the sovereign, local-first storage foundation responsible for maintaining transactional integrity, non-destructive epistemic lineage, and relational consistency across all venture and research state.

In accordance with Constitution Article III (*Sovereign Local-First Persistence*), the storage architecture operates under the governing axiom:

$$\begin{aligned}
\mathbf{\text{Persistence Axiom:}} \quad &\text{All project entities, epistemic claims, evidence links, decision records, and audit lineages} \\
&\text{MUST persist strictly on local user-controlled storage via an Inversion-of-Control abstraction.}
\end{aligned}$$

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     DATA ARCHITECTURAL PILLARS                          │
├─────────────────────────────────────────────────────────────────────────┤
│  1. SOVEREIGN LOCAL-FIRST PERSISTENCE ($0 POSTURE)                      │
│     Persistence exclusively local (SQLite WAL); zero forced cloud sync. │
│                                                                         │
│  2. INVERSION-OF-CONTROL STORAGE ADAPTER BOUNDARY                       │
│     All persistence mediated through BaseStorageAdapter.                │
│                                                                         │
│  3. PARAMETERIZED QUERY SAFETY INVARIANT                                │
│     Mandatory parameter binding; zero raw SQL string formatting.        │
│                                                                         │
│  4. PROJECT-SCOPED OWNERSHIP & ISOLATION                                │
│     Strict project-scoped ownership boundaries across all tables.       │
│                                                                         │
│  5. NON-DESTRUCTIVE AUDIT LINEAGE & TRANSACTION INTEGRITY               │
│     Historical event immutability preserved alongside revisable state.  │
└─────────────────────────────────────────────────────────────────────────┘
```

The fundamental architectural hierarchy governing Phase 5 is:

```text
                    CONVERA DOMAIN MODEL
                           │
                           │ semantic authority
                           ▼
              ┌────────────────────────────┐
              │ 16 Canonical Entities      │
              │ + 4 Support Entities       │
              └─────────────┬──────────────┘
                            │
                            │ persistence mapping
                            ▼
              ┌────────────────────────────┐
              │ DATA ARCHITECTURE          │
              │ ownership / boundaries /   │
              │ transactions / isolation   │
              └─────────────┬──────────────┘
                            │
                            │ physical realization
                            ▼
              ┌────────────────────────────┐
              │ 23 RELATIONAL TABLES       │
              │ DATABASE_SCHEMA.md         │
              └─────────────┬──────────────┘
                            │
                            ▼
                    SQLite + WAL
```

---

## 2. Statement Classification Framework

Following the governance standards established across Phases 1–4, all specifications in this document adhere to four explicit classification markers:

| Class | Definition | Normative Authority |
| :--- | :--- | :--- |
| **`[NORMATIVE]`** | Inviolable architectural law that data implementations **MUST** satisfy. | Mandatory baseline constraint. |
| **`[IMPLEMENTED]`** | Architecture verified against the active codebase in `backend/storage/`. | Active code in `backend/`. |
| **`[TARGET]`** | Planned architectural capabilities scheduled for progressive development. | Governed implementation target. |
| **`[VERIFICATION]`** | The explicit test suite or inspection establishing architectural compliance. | Verification contract (`TESTING_STRATEGY.md`). |

---

## 3. Persistence Area Topology & Storage Boundaries

Within CONVERA’s 5-area architecture, Area 4 (Persistence) encapsulates all physical storage interactions. Domain Engine services (Area 3) and CIIA (Area 5) interact with storage exclusively through the `BaseStorageAdapter` interface:

```text
                               ┌───────────────────────────┐
                               │  Area 1: Presentation     │
                               │  (React / Next.js UI)     │
                               └─────────────┬─────────────┘
                                             │ HTTP REST
                               ┌─────────────▼─────────────┐
                               │  Area 2: Router API       │
                               │  (FastAPI Routers)        │
                               └─────────────┬─────────────┘
                                             │
                               ┌─────────────▼─────────────┐
                               │  Area 3: Domain Engine    │
                               │  (Epistemic / Business)   │
                               └───────┬───────────┬───────┘
                                       │           │
                     ┌─────────────────┘           └─────────────────┐
                     │ Service Call                                  │ Tool / Gateway Call
       ┌─────────────▼─────────────┐                   ┌─────────────▼─────────────┐
       │  Area 4: Persistence      │                   │  Area 5: CIIA Subsystem   │
       │  (BaseStorageAdapter)     │                   │  (Cognitive Agents / LLM) │
       │  • SQLiteAdapter (WAL)    │                   │  • Gateway & Connectors   │
       │  • Parameterized SQL Bind │                   │  (NO DIRECT STORAGE READ) │
       └─────────────┬─────────────┘                   └───────────────────────────┘
                     │
       ┌─────────────▼─────────────┐
       │  Physical Storage         │
       │  • convera.db (SQLite)    │
       │  • Session Snapshot Data  │
       │  • Relational Indexes     │
       └───────────────────────────┘
```

### Architectural Storage Invariants
1. **`[NORMATIVE]` Storage Inversion-of-Control**: Domain Engine services and API routers MUST NOT instantiate direct SQLite connections or execute raw SQL queries outside the storage adapter. All database access must execute through `BaseStorageAdapter` methods or repository abstractions.
2. **`[NORMATIVE]` No CIIA Persistence Bypass**: Area 5 (CIIA / AI Gateway / MCP Server) is strictly prohibited from bypassing Domain Engine services to write directly to SQLite tables.
3. **`[NORMATIVE]` Local-First Sovereignty**: The canonical persistent database resides at `data/convera.db` (or user-configured local path) under exclusive local ownership.

---

## 4. SQLite WAL Mode & Concurrency Architecture

To guarantee transactional durability, read/write concurrency, and resistance to database corruption during multi-step research sessions, CONVERA implements SQLite Write-Ahead Logging (WAL):

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    SQLITE WAL CONCURRENCY MODEL                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Shared Database File (convera.db)                                     │
│   ├── Journal Mode: PRAGMA journal_mode=WAL;                           │
│   ├── Synchronization: PRAGMA synchronous=NORMAL;                      │
│   ├── Busy Timeout: PRAGMA busy_timeout=5000;                           │
│   └── Foreign Keys: PRAGMA foreign_keys=ON;                            │
│                                                                         │
│   Concurrency Rules:                                                    │
│   • WAL permits concurrent reader access while a writer transaction    │
│     is active, subject to SQLite locking and checkpoint behavior.       │
│   • SQLite serializes write transactions.                               │
│   • Configured busy handling prevents immediate failure under          │
│     transient lock contention.                                          │
│   • Checkpoint behavior follows the configured SQLite/runtime policy.   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Pragmas and Transaction Management
* **`[NORMATIVE]` Connection Pragmas**: SQLite connections opened by `SQLiteAdapter` MUST enforce:
  ```sql
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
  ```
* **`[NORMATIVE]` Transaction Atomicity**: Multi-table state mutations that must succeed or fail as one logical state transition MUST execute within explicit atomic database transactions (`BEGIN TRANSACTION ... COMMIT`). If any statement fails, the entire transaction MUST be rolled back (`ROLLBACK`).

---

## 5. Domain-to-Relational Mapping & The 23 Physical Tables

### 5.1 Domain-to-Relational Mapping Principle
* **`[NORMATIVE]` Conceptual vs. Physical Layer Separation**: The 23 physical relational tables MUST NOT be interpreted as a simplistic 1:1 enumeration of domain entities. The `DOMAIN_MODEL.md` defines conceptual entities and their semantic ownership, whereas the Persistence Layer maps those entities into normalized relational structures, including direct entity tables, relationship/link tables, historical/event logs, and support/workspace tables:

$$\begin{aligned}
\mathbf{	ext{Mapping Principle:}} \quad &	ext{20 Conceptual Entities (16 Canonical + 4 Support)} \
&\longrightarrow \quad \mathbf{	ext{23 Physical Relational Tables}}
\end{aligned}$$

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE 23 RELATIONAL DATABASE TABLES                               │
├──────┬────────────────────────────────┬──────────────────────────┬─────────────────────┤
│ Ref  │ Physical Table Name            │ Primary Domain Mapping   │ Structural Role     │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T01  │ projects                       │ Project (E01)            │ Primary Container   │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T02  │ project_members                │ ProjectMember (Support)  │ Multi-User Scoping  │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T03  │ sessions                       │ SessionState (Support)   │ Session Workspace   │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T04  │ session_snapshots              │ SessionSnapshot (Support)│ Point-in-Time State │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T05  │ problems                       │ ProblemRecord (E03)      │ Dual-Track Problem  │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T06  │ problem_sources                │ ProblemRecord (Support)  │ Raw Signal Links    │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T07  │ problem_phase_history          │ ProblemRecord (Support)  │ Lifecycle History   │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T08  │ problem_claims                 │ ProblemClaim (E04)       │ Epistemic Claims    │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T09  │ problem_assumptions            │ ProblemAssumption (E05)  │ Market/Sci Assump.  │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T10  │ problem_alternatives           │ ProblemAlternative (E06) │ Competing Solutions │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T11  │ decision_records               │ DecisionRecord (E10)     │ Governed Decisions  │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T12  │ problem_comments               │ ProblemRecord (Support)  │ Socratic Feedback   │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T13  │ mentor_signoffs                │ MentorSignoff (Support)  │ Sign-Off Records    │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T14  │ claim_evidence_links           │ EvidenceItem (E07)       │ Bipartite Rigor Map │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T15  │ assumption_validation_tests    │ AssumptionValidationTest │ Falsification Tests │
│      │                                │ (E09)                    │                     │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T16  │ impact_invalidation_events     │ ImpactInvalidationEvent  │ Blast-Radius Log    │
│      │                                │ (E13)                    │                     │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T17  │ evidence_provenance            │ ProvenanceRecord (E15)   │ Lineage Metadata    │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T18  │ claim_contradictions           │ ClaimContradiction (E08) │ Epistemic Conflicts │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T19  │ project_unknowns               │ ProjectUnknown (E11)     │ Explicit Gaps       │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T20  │ requirements_traceability      │ RequirementsTraceability │ Traceability Matrix │
│      │                                │ (E12)                    │                     │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T21  │ gate_reviews                   │ GateReview (E14)         │ Ratification Gates  │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T22  │ research_domains               │ ResearchDomain (E16)     │ Dual-Track Context  │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ T23  │ circumscription_iterations     │ Circumscription (Support)│ Discovery History   │
└──────┴────────────────────────────────┴──────────────────────────┴─────────────────────┘
```

---

## 6. Query Parameterization & SQL Injection Defense

In strict compliance with Invariant S4 of `SECURITY.md`, all persistence operations enforce parameter binding:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    PARAMETER BINDING INVARIANTS                         │
├─────────────────────────────────────────────────────────────────────────┤
│  REQUIRED: Parameterized Query Binding (Positional '?' or Named ':k')   │
│  ```python                                                              │
│  # Compliant: Parameter binding                                         │
│  cursor.execute(                                                        │
│      "SELECT * FROM problem_claims WHERE project_id = ? AND status = ?",│
│      (project_id, claim_status)                                         │
│  )                                                                      │
│  ```                                                                    │
│                                                                         │
│  FORBIDDEN: Raw String Formatting / Interpolation                      │
│  ```python                                                              │
│  # Violation: Security breach & injection vulnerability                 │
│  cursor.execute(f"SELECT * FROM problem_claims WHERE id = '{claim_id}'")│
│  ```                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

* **`[NORMATIVE]` Universal Parameterization**: All SQL queries executed by storage adapters MUST utilize parameterized bindings. Direct formatting (`f"..."`, `"...".format()`, `"... % ..."`) of dynamic variables into SQL statements is strictly prohibited.

---

## 7. Project-Scoped Ownership & Isolation

To prevent cross-project data leakage and guarantee tenant isolation in multi-project local environments, CONVERA enforces project-scoped ownership:

```text
                               ┌───────────────────────────┐
                               │         projects          │
                               │        (project_id)       │
                               └─────────────┬─────────────┘
                                             │
         ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
         │ (1:N)             │ (1:N)                         │ (1:N)             │ (1:N)
┌────────▼──────────┐ ┌──────▼───────────┐          ┌────────▼───────────┐ ┌─────▼─────────────┐
│     problems      │ │  decision_records│          │requirements_trace. │ │ project_unknowns  │
│(FK: project_id)   │ │ (FK: project_id) │          │ (FK: project_id)   │ │ (FK: project_id)  │
└───────────────────┘ └──────────────────┘          └────────────────────┘ └───────────────────┘
```

### Scoping Rules
1. **`[NORMATIVE]` Unambiguous Project Ownership**: Every project-owned persistence record MUST be unambiguously attributable to exactly one project through a direct `project_id` foreign key or a formally defined foreign-key ownership path.
2. **`[NORMATIVE]` Scoped Query Enclosure**: Public storage operations MUST enforce project scope at the query boundary and MUST NOT permit cross-project retrieval or mutation.

---

## 8. Non-Destructive Audit Lineage & Historical Immutability

The persistence layer operationalizes the constitutional distinction between **immutable historical event records** and **revisable current validity states**:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    IMMUTABILITY VS REVISABILITY                         │
├─────────────────────────────────────────────────────────────────────────┤
│  1. IMMUTABLE EVENT & LINEAGE LOGS (Append-Only)                        │
│     • impact_invalidation_events (Logs blast-radius invalidations)      │
│     • problem_phase_history (Logs problem circumscription transitions)  │
│     • circumscription_iterations (Logs progressive hypothesis discovery)│
│     • session_snapshots (Logs point-in-time workspace captures)         │
│     • evidence_provenance (Logs original extraction lineage)            │
│     • mentor_signoffs & gate_reviews (Logs formal human authorizations) │
├─────────────────────────────────────────────────────────────────────────┤
│  2. REVISABLE CURRENT VALIDITY STATES                                   │
│     • problem_claims.status (ACTIVE → CONTRADICTED / FALSIFIED)         │
│     • decision_records.validity_status (ACTIVE → SUPERSEDED_PIVOT)      │
│     • requirements_traceability.verification_status (PASS → STALE)      │
└─────────────────────────────────────────────────────────────────────────┘
```

* **`[NORMATIVE]` Historical Event Immutability**: Historical event and authorization records cannot be rewritten or deleted to alter history. When state revisions occur, new event rows are appended, preserving complete audit lineage.

---

## 9. Verification & Compliance Checklist

Before any code modification affecting the Persistence Layer is accepted, it must satisfy the following verification criteria:

| Check ID | Architectural Requirement | Verification Method | Acceptance Standard |
| :--- | :--- | :--- | :--- |
| **DATA-01** | Storage Inversion-of-Control. | Codebase architectural import scan. | Zero direct `sqlite3.connect` calls in routers/domain. |
| **DATA-02** | SQLite WAL mode initialization. | Database connection pragma test. | `PRAGMA journal_mode` returns `wal`. |
| **DATA-03** | Parameterized query safety. | AST static analysis & query test suite. | Zero raw SQL string interpolation in storage layer. |
| **DATA-04** | Project-scoped data isolation. | Negative cross-project query integration tests. | Queries reject or return empty when `project_id` mismatches. |
| **DATA-05** | Relational foreign key enforcement. | Cascade deletion and orphan insert tests. | SQLite rejects orphan records (`foreign_keys = ON`). |
| **DATA-06** | Transaction atomicity & rollback. | Fault injection during multi-table writes. | Failed multi-table write rolls back completely. |
| **DATA-07** | Unit and integration test pass rate. | Execution of persistence test suite. | 100% applicable tests pass. |

---

## 10. Ratification & Version History

| Version | Date | Author / Governance | Key Changes & Rationale | Status |
| :--- | :--- | :--- | :--- | :--- |
| `1.0.0` | `2026-09-04` | Antigravity AI Engine & Architectural Governance | Initial formal specification establishing persistence architecture, SQLite WAL concurrency, 23-table mapping, query parameterization, and non-destructive audit lineage. | 🟢 RATIFICATION-READY |
