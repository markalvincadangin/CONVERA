# CONVERA - Spec-Driven Development (SDD) Workflow

**Document ID**: `CONVERA-ENG-003`  
**Classification**: 8-Phase Spec-Driven Development Process  
**Authority Tier**: Tier 2 Engineering Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/03-engineering/SDD_WORKFLOW.md`  
**Upstream Dependencies**: `03-engineering/DEVELOPMENT_WORKFLOW.md`  
**Downstream Dependents**: `03-engineering/TESTING_STRATEGY.md`  

---

> **Spec Kit Integration, 8-Stage SDD Lifecycle, Artifact Ownership & Governance Gates.**
> This document authoritatively establishes the Spec-Driven Development (SDD) methodology governing all consequential changes in CONVERA. It operationalizes `DEVELOPMENT_WORKFLOW.md` and bridges the high-level governance rules of `CONSTITUTION.md` with the operational tooling of Spec Kit and Antigravity.

---

## 1. SDD Philosophy & Governing Axioms

Spec-Driven Development (SDD) in CONVERA is the operational embodiment of the constitutional axiom:

> **"Evidence before assertion; traceability before transformation."**
> **"Specification before implementation."**

> **Governance Rule:**
> Code must **never** be written before the specification is formulated, clarified, planned, and approved for implementation through the applicable human governance gate. Formal ratification is specifically required when the specification changes constitutional principles, ratified requirements, architectural doctrine, or other governed artifacts.

---

## 2. Document Responsibility Boundaries

To maintain clear governance separation across the engineering documentation layer:

`	ext
+-----------------------------------------------------------------------------+
|                     DOCUMENT RESPONSIBILITY MATRIX                          |
+--------------------------+--------------------------------------------------+
| Document                 | Governance Role & Scope                          |
+--------------------------+--------------------------------------------------+
| CONSTITUTION.md          | Supreme law; requires formal human ratification. |
| ENGINEERING_PRINCIPLES.md| Implementation rules, IoC ports, & invariants.   |
| DEVELOPMENT_WORKFLOW.md  | High-level lifecycle & change classification.    |
| SDD_WORKFLOW.md          | Consequential specification & execution process. |
| TESTING_STRATEGY.md      | Concrete test suites, runners, & thresholds.     |
| SECURITY.md              | Threat models, credentials, & audit security.    |
+--------------------------+--------------------------------------------------+
`

---

## 3. The 8-Stage SDD Lifecycle

`	ext
+-----------------------------------------------------------------------------+
|                         CONVERA SDD LIFECYCLE                               |
+-----------------------------------------------------------------------------+
  1. SPECIFY      Formulate user stories, acceptance criteria, & boundaries.  |
        |                                                                     |
        v                                                                     |
  2. CLARIFY      Identify ambiguities, edge cases, & constitutional bounds.  |
        |                                                                     |
        v                                                                     |
  3. PLAN         Define technical architecture, component diffs, & strategies|
        |                                                                     |
        v                                                                     |
  4. CHECKLIST    Establish verification criteria, test matrix, & invariants. |
        |                                                                     |
        v                                                                     |
  5. TASKS        Decompose into atomic, sequenced, testable units of work.   |
        |                                                                     |
        v                                                                     |
  6. ANALYZE      Pre-flight dependency & impact check before execution.      |
        |                                                                     |
        v                                                                     |
  7. IMPLEMENT    Execute atomic tasks with strict boundary & type discipline.|
        |                                                                     |
        v                                                                     |
  8. CONVERGE     Run test suite, verify checklists, & synchronize docs.      |
+-----------------------------------------------------------------------------+
`

---

## 4. Artifact Hierarchy & Authority Boundaries

SDD coordinates artifacts across three distinct operational layers:

`	ext
+-----------------------------------------------------------------------------+
|                       SDD ARTIFACT HIERARCHY                                |
+--------------------+-------------------------+------------------------------+
| Layer              | Path / Container        | Governance Role              |
+--------------------+-------------------------+------------------------------+
| 1. CANONICAL DOCS  | docs/                   | Canonical human-facing       |
|    (Human Master)  | (docs/00-foundation/    | documentation authority      |
|                    |  through                | across all 9 areas.          |
|                    |  docs/08-operations/)   |                              |
+--------------------+-------------------------+------------------------------+
| 2. SPEC KIT        | .specify/specs/<feat>/  | Operational feature specs,   |
|    (Feature Level) |   spec.md               | implementation plans, task   |
|                    |   plan.md               | lists, and checklists.       |
|                    |   tasks.md              |                              |
|                    |   checklist.md          |                              |
|                    | .specify/memory/        | Operational projection of    |
|                    |   constitution.md       | CONSTITUTION.md.             |
+--------------------+-------------------------+------------------------------+
| 3. AGENT MEMORY    | .agents/rules/          | Antigravity & CIIA           |
|    (Operational)   | .agents/skills/         | execution constraints.       |
+--------------------+-------------------------+------------------------------+
`

> **Authority Invariant:**  
> Canonical specifications reside in `docs/`. Files in `.specify/` and `.agents/` are operational projections and must remain strictly synchronized with canonical documentation.

---

## 5. Step-by-Step Execution Protocol

### Stage 1: SPECIFY
* **Objective:** Define *what* needs to be built and *why*, without committing to implementation details.
* **Outputs:** `.specify/specs/<feature>/spec.md` containing:
  - Problem context and user requirements.
  - Functional and non-functional requirements.
  - Acceptance criteria and constitutional boundaries.

### Stage 2: CLARIFY
* **Objective:** Resolve underspecified requirements, ambiguities, and design assumptions before planning.
* **Procedure:**
  - AI assistant inspects the specification against existing domain models and raises clarifying questions.
  - Human engineer resolves decisions and locks the clarified scope.

### Stage 3: PLAN
* **Objective:** Formulate the technical implementation approach adhering to `SYSTEM_ARCHITECTURE.md` and `ENGINEERING_PRINCIPLES.md`.
* **Outputs:** `.specify/specs/<feature>/plan.md` detailing:
  - Affected architectural areas (Presentation, Router API, Domain Engine, Persistence, CIIA).
  - Component-by-component file modifications ([NEW], [MODIFY], [DELETE]).
  - Dependency flow and Inversion of Control interface usage.

### Stage 4: CHECKLIST
* **Objective:** Define the complete verification matrix required for acceptance.
* **Outputs:** `.specify/specs/<feature>/checklist.md` defining criteria across:
  - Type safety and linting passing.
  - Invariant and regression test cases.
  - Database schema integrity.
  - Documentation synchronization requirements.

### Stage 5: TASKS
* **Objective:** Decompose the plan into sequenced, atomic, independently verifiable tasks.
* **Outputs:** `.specify/specs/<feature>/tasks.md` with explicit task IDs and verification conditions.

### Stage 6: ANALYZE (Pre-Flight Check)
* **Objective:** Verify readiness before executing code changes.
* **Verification Checks:**
  - Are all dependencies and files available?
  - Does the plan respect the 5-area boundaries?
  - Are there unverified assumptions or unaddressed contradictions?

### Stage 7: IMPLEMENT
* **Objective:** Execute tasks atomically in the exact planned sequence.
* **Execution Rules:**
  - Follow `ENGINEERING_PRINCIPLES.md` (IoC storage ports, LLM Gateway, Pydantic/TypeScript contracts).
  - Perform localized verification after each task.
  - Do not proceed to task +1$ if task $ fails verification.

### Stage 8: CONVERGE
* **Objective:** Validate complete feature execution and achieve acceptance readiness.
* **Convergence Gate Checklist:**
  1. All tasks in 	asks.md completed.
  2. All items in checklist.md verified.
  3. Full required test suite passes without skips.
  4. Documentation in docs/ updated and synchronized to .specify/ and .agents/.
  5. Human implementation acceptance obtained, and any required specification, architectural, constitutional, or governed-decision ratification obtained.

---

## 6. Mid-Flight Amendment & Re-Entry Protocol

When an unforeseen technical blocker, empirical refutation, or verification failure emerges during IMPLEMENT or CONVERGE:

`	ext
  [Blocker / Contradiction / Verification Failure]
                        |
                        v
  [Halt Progression Toward Acceptance]  <-- Zero Bypass: diagnose without masquerading
                        |
                        v
  [Assess Scope & Architecture Impact]
                        |
        +---------------+---------------+
        |                               |
        v (Implementation Adjustment)   v (Consequential Scope/Spec Change)
  [Re-Plan at Stage 3: PLAN]      [Re-Specify at Stage 1: SPECIFY]
        |                               |
        +---------------+---------------+
                        |
                        v
  [Appropriate Human Approval / Ratification]
                        |
                        v
  [Resume Implementation from Updated Tasks]
                        |
                        v
  [Re-Run Verification Suite & Converge]
`

### Governance Scoping on Amendments:
* **Technical Implementation Adjustments:** Require engineering review and approval before resuming.
* **Requirement / Scope Changes:** Require formal re-specification and human approval.
* **Constitutional / Doctrine Changes:** Require explicit human ratification before proceeding.

---

## 7. Traceability Integration & Epistemic Governance

Every consequential SDD cycle must maintain full integration with the **Traceability Model** (`TRACEABILITY_MODEL.md`):
* **Requirement Representation:** Requirements defined in `spec.md` must be represented through `RequirementsTraceability` records (Entity 12) with an auditable governance or epistemic basis. Where a requirement is decision-derived, its `decision_id` links it to the governing `DecisionRecord` (Entity 10).
* **No Ungrounded Artifacts:** Features must not implement code without an auditable traceability link to requirements, decisions, or empirical claims.
* **Verification Artifact Linking:** Upon convergence, test execution records and benchmark runs are bound to `verification_artifact_ref` in `RequirementsTraceability`, transitioning requirement states to `VERIFIED_PASS`.
