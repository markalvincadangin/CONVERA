# CONVERA - Development Workflow & Engineering Lifecycle

**Document ID**: `CONVERA-ENG-002`  
**Classification**: Git, Branching & Pull Request Governance  
**Authority Tier**: Tier 2 Engineering Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/03-engineering/DEVELOPMENT_WORKFLOW.md`  
**Upstream Dependencies**: `03-engineering/ENGINEERING_PRINCIPLES.md`  
**Downstream Dependents**: `03-engineering/SDD_WORKFLOW.md`  

---

> **Change Classification, Development Lifecycle, Git Conventions & Verification Gates.**
> This document authoritatively establishes the standard engineering workflow for contributing, modifying, and verifying code across the CONVERA platform. It operationalizes `ENGINEERING_PRINCIPLES.md` into a concrete, reproducible development methodology.

---

## 1. Governing Lifecycle Overview

CONVERA follows an 8-stage verification-first development lifecycle. For consequential changes, this workflow delegates detailed specification, task decomposition, and convergence execution to the **Spec-Driven Development (SDD) Workflow** (SDD_WORKFLOW.md):

`	ext
+-----------------------------------------------------------------------------+
|                        CONVERA DEVELOPMENT LIFECYCLE                        |
+-----------------------------------------------------------------------------+
  1. INTENT             Identify user requirement, defect, or research goal.
        |
        v
  2. CLASSIFY CHANGE    Determine whether change is Trivial or Consequential.
        |
        v
  3. SPECIFY / CLARIFY  (If consequential) Invoke SDD Workflow (Specify -> Clarify)
        |
        v
  4. PLAN & TASKS       (If consequential) SDD Plan -> Checklist -> Tasks -> Analyze
        |
        v
  5. IMPLEMENT          Execute atomic code changes adhering to 5 areas.
        |
        v
  6. VERIFY & CONVERGE  Run required verification categories & invariant tests.
        |
        v
  7. REVIEW & ACCEPT    Human evaluation, implementation acceptance, & ratification.
        |
        v
  8. COMMIT & SYNC      Atomic Git commit & documentation synchronization.
+-----------------------------------------------------------------------------+
`

---

## 2. Change Classification Framework

> **Impact-Based Classification Invariant:**
> A change is classified by its actual behavioral, architectural, epistemic, persistence, security, or contract impact—not solely by the apparent size or type of the code edit. A small change is not automatically trivial, and a large change is not automatically consequential. Impact determines classification.

`	ext
+-----------------------------------------------------------------------------+
|                        CHANGE CLASSIFICATION MATRIX                         |
+------------------+------------------------------+---------------------------+
| Category         | Scope & Criteria             | Required Governance Path  |
+------------------+------------------------------+---------------------------+
| TRIVIAL          | * UI CSS styling & alignment | Direct Implementation &   |
| (Non-Consequent.)| * Typo & grammar fixes       | Local Verification        |
|                  | * Local non-contract renames | (No formal spec required) |
|                  | * Isolated obvious bug fixes |                           |
+------------------+------------------------------+---------------------------+
| CONSEQUENTIAL    | * Domain entities & models   | Spec-Driven Development   |
| (Requires SDD)   | * Epistemic scoring formulas | (SDD) Mandatory           |
|                  | * Database schema/migrations | (Spec -> Clarify -> Plan  |
|                  | * API contracts & routers    |  -> Checklist -> Tasks    |
|                  | * Security & auth boundaries |  -> Analyze -> Implement  |
|                  | * CIIA connector interfaces  |  -> Converge -> Ratify)   |
+------------------+------------------------------+---------------------------+
`

---

## 3. Step-by-Step Engineering Execution Protocol

### Stage 1: Intent & Problem Formulation
* Identify the functional requirement, architectural defect, or research objective.
* Map the intent to target architectural areas (Presentation, Router API, Domain Engine, Persistence, CIIA).

### Stage 2: Change Classification & Scope Assessment
* Apply Section 2 criteria to determine if the change is **Trivial** or **Consequential** based on impact.
* If Trivial, proceed directly to Stage 5 (Implementation) with strict test verification.
* If Consequential, halt implementation and invoke the SDD Workflow (SDD_WORKFLOW.md).

### Stage 3: Specification & Clarification (Consequential Track)
* For consequential changes, formulate formal specifications in .specify/ or docs/.
* Clarify edge cases, boundary conditions, and constitutional alignment before writing code.

### Stage 4: Planning, Checklists & Task Decomposition
* Decompose work into atomic, testable tasks and explicit verification checklists.

### Stage 5: Implementation & Boundary Discipline
* Write clean, type-safe Python and TypeScript code strictly adhering to ENGINEERING_PRINCIPLES.md.
* Never bypass abstract storage ports (BaseStorageAdapter) or vendor AI gateway abstractions (LLMGateway).
* Maintain single-objective focus; avoid bundled unrelated refactoring.

### Stage 6: Verification & Convergence
* Execute the required repository verification pipeline categories (detailed in Section 5).
* Verify that no epistemic, architectural, or regression invariants are violated.

### Stage 7: Human Review, Acceptance & Doctrine Ratification
* **Implementation Acceptance:** Human review and evaluation of verification results are required before consequential code is accepted.
* **Doctrine Ratification:** Formal human ratification is specifically required when a change alters requirements, ratified specifications, architectural doctrine, constitutional principles, or governed decisions. Implementing an already-ratified requirement does not create a new doctrine ratification event.

### Stage 8: Atomic Commit & Documentation Synchronization
* Commit changes following semantic commit message conventions.
* **Documentation Authority Hierarchy:**
  - `docs/` is the canonical, human-facing documentation authority.
  - `.specify/` is the Spec Kit operational projection.
  - `.agents/` is the agent operational projection.
* Canonical changes originate in docs/; operational projections (e.g., .specify/memory/constitution.md) are synchronized from canonical sources and must not become competing authorities.

---

## 4. Git Strategy & Branching Conventions

* **Trunk-Based / Short-Lived Feature Branches:** Work is performed on descriptive feature branches branched from main.
* **Branch Naming Conventions:**
  - `feat/<feature-name>`: New capability or functional addition.
  - `fix/<bug-description>`: Defect repair.
  - `docs/<topic>`: Documentation, specification, or ratification updates.
  - `refactor/<scope>`: Non-functional architectural cleanup.
  - `test/<scope>`: Test suite additions or benchmarking.
* **Semantic Commit Messages:**
  Commits must be atomic, reversible, and use standard prefixes:
  `	ext
  feat(domain): add claim contradiction registration in knowledge_lifecycle
  fix(storage): correct foreign key cascade constraint on decision_records
  docs(system): ratify traceability model specification
  test(impact): add blast-radius traversal regression test
  `

---

## 5. Verification Categories & Failure Protocol

### A. Required Verification Categories
Verification must include, where configured by the repository:
1. **Formatting & Linting:** Code style and syntax checks.
2. **Static Type Checking:** Type safety verification across Python and TypeScript.
3. **Unit & Integration Tests:** Deterministic execution against isolated test SQLite databases.
4. **API & Contract Checks:** Pydantic schema validation and router contract consistency.
5. **Architecture & Dependency Checks:** Verification of zero circular or leaky dependencies.
6. **Database & Schema Checks:** Migration integrity and table schema verification.
7. **Security Checks:** Credential boundary and path traversal protections.
8. **End-to-End Checks:** Core user workflow validation where configured.
9. **Documentation Consistency Checks:** Cross-reference validation across documentation.
10. **Epistemic & AI Behavior Checks:** Net Balance, confidence decoupling, and degraded fallback verification.

> **Note:** Concrete commands, test runners, and coverage thresholds are authoritatively defined in TESTING_STRATEGY.md.

### B. Verification Failure & Diagnostic Protocol
When any verification category fails:
`	ext
  [Verification Failure Detected]
                |
                v
  [Halt Progression Toward Acceptance]  <-- Zero Bypass: never use @ts-ignore or skip
                |
                v
  [Targeted Diagnostic Verification]    <-- Run focused test to isolate defect
                |
                v
  [Repair Defect or Safely Revert]
                |
                v
  [Verify Affected Behavior]
                |
                v
  [Run Full Required Verification Suite]
                |
                v
  [Proceed Only After Full Suite Passes]
`

> **Diagnostic Rule:**  
> Targeted tests may be used for diagnosis, but targeted verification must never be represented as full verification.

### C. Rollback Protocol
* **Uncommitted Changes:** Restore or revert working changes using non-destructive file checkout or discard procedures.
* **Committed Changes:** Use git revert to create clean, historical revert commits without destroying audit history.
* **Human Authorization for Destructive Actions:** Destructive operations (such as discarding uncommitted work across the repository) require explicit human authorization to prevent accidental data loss.
* **Core Principle:** Rollback must preserve recoverability and must not silently destroy unrelated work.

---

## 6. AI-Assisted Development Protocol

When AI assistants (e.g., Antigravity, CIIA, or automated subagents) participate in engineering:
* **Socratic Proposer Role:** AI explores dependencies, drafts implementations, and formulates test cases.
* **Explicit Verification State Reporting:** AI execution reports must explicitly declare verification state:
  - VERIFIED: All required verification categories executed and passed.
  - PARTIALLY VERIFIED: Subsets passed (e.g., unit tests pass, E2E not run).
  - UNVERIFIED: Code drafted but verification suite not executed.
  - BLOCKED: Verification blocked by environment or dependency failure.
  - DEGRADED: Fallback path active; operation is non-evidentiary.
* **No Phantom Claims:** AI assistants must not report a task as complete when required verification remains unexecuted, failed, blocked, or degraded.
* **Human Ratification Gate:** AI must never self-ratify consequential architectural changes or rewrite constitutional doctrine.
