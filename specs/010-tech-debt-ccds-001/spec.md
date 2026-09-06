# SPEC-TECH-DEBT-CCDS-001: Phase 1 Workflow Safety & Defect Resolution

**Document ID**: `SPEC-TECH-DEBT-CCDS-001`  
**Classification**: Tier 2 Engineering & Architectural Specification  
**Authority Tier**: Tier 2 Engineering Specification (Operationalized under `CONSTITUTION.md` and `SDD_WORKFLOW.md`)  
**Parent Architectural Authority**: `TECH-DEBT-CCDS-001 — Architectural Decision Record v2.2` (Ratified 2026-09-06)  
**Standard**: CONVERA Concept Development Standard (CCDS v2.0) — *“Knowledge != Workflow”*  
**Document Status**: 🟢 SPECIFICATION RATIFIED (ADR v2.2) — PENDING HUMAN IMPLEMENTATION AUTHORIZATION  
**Active Working Branch**: `feature/009-ux-iteration-problem-discovery`  
**Target Feature Branch**: `feature/010-workflow-safety-defect-resolution`  
**Canonical Spec Path**: `specs/010-tech-debt-ccds-001/spec.md`  
**Authoritative Evidence Base**:
- `docs/00-foundation/CONSTITUTION.md` (`CONVERA-FND-001`, Articles I through VIII)
- `docs/03-engineering/DEVELOPMENT_WORKFLOW.md` (`CONVERA-ENG-002`, Section 2 "Change Classification Matrix")
- `docs/03-engineering/SDD_WORKFLOW.md` (`CONVERA-ENG-003`, 8-Stage SDD Lifecycle)
- `docs/03-engineering/ENGINEERING_PRINCIPLES.md` (`CONVERA-ENG-001`, Invariants 1, 4, 5, 6, 8, 9, 10)
- `docs/07-tracks/TRACK_GOVERNANCE.md` (CCDS Dual-Track Operational Governance)
- `backend/convera.db` (13 Active Production Sessions Baseline)

---

## 1. Document Identity & Sole Authoritative Status

```text
Document Reference: SPEC-TECH-DEBT-CCDS-001
Title:              Phase 1 Workflow Safety & Defect Resolution
Classification:     Lane B Architectural Realignment & Defect Elimination
Parent ADR:         TECH-DEBT-CCDS-001 ADR v2.2 (Ratified 2026-09-06)
Authority:          Human Leadership / Project Lead
Ratification State: ARCHITECTURALLY RATIFIED (2026-09-06)
Implementation:     AWAITING HUMAN IMPLEMENTATION AUTHORIZATION
```

### Sole Authoritative Specification Guarantee
To eliminate governance ambiguity and ensure absolute fidelity to the ratified architecture:
- **`SPEC-TECH-DEBT-CCDS-001` is the single authoritative engineering specification** governing the implementation of Phase 1 of Progressive Realignment (Option C).
- It operationalizes the 5 ratified architectural decisions from **ADR v2.2 Section 18**:
  1. *DECISION 1 — Implementation Strategy*: Progressive Realignment (Option C), staged into Phase 1 (Workflow Safety) and Phase 2 (Domain Boundary Extraction).
  2. *DECISION 2 — Authority Rule*: Framework-scoped `stage_progress` is the sole canonical workflow-state authority for migrated sessions. Legacy `phase1..5_complete` fields are read projections only.
  3. *DECISION 3 — Migration Determinism*: Legacy session migration to `stage_progress` is deterministic, idempotent, and non-destructive, with controlled handling of invalid/corrupt state.
  4. *DECISION 4 — Architectural Gate Semantics*: Gate evaluation and workflow-stage state are distinct. Gate-to-stage transitions occur exclusively through explicit, methodology-authorized application-layer transition rules. Methodology thresholds and rubrics remain subordinate to CCDS.
  5. *DECISION 5 — Navigation Model*: Numeric phase indexes (`0..6`) are replaced with framework-scoped semantic stage IDs (`InnovationStageId` and `ResearchStageId`).

---

## 2. Foundational Axioms & Source-of-Truth Hierarchy

### The Epistemic Axiom
$$\text{Knowledge} \neq \text{Workflow}$$

Persistent domain understanding (problems, claims, empirical evidence, theoretical assumptions, validated decisions) exists independently of the transient methodology or workflow stage used to acquire it.

### Source-of-Truth Hierarchy
The engineering implementation must strictly adhere to the following dependency and authority hierarchy:

```text
GOVERNANCE & METHODOLOGY                    EPISTEMIC DOMAIN
         │                                         │
         ▼                                         ▼
   CONSTITUTION                             DOMAIN KNOWLEDGE
(Fundamental Law)                    (Problems, Claims, Evidence)
         │                                         │
         ▼                                         ▼
CCDS / RATIFIED METHODOLOGY                 EVIDENTIARY TIERS
(Thresholds, Rubrics, Gates)               (Tier 1 Empirical Grounding)
         │                                         │
         ▼                                         │
WORKFLOW SPECIFICATION                             │
(Stage Definitions, Sequences)                     │
         │                                         │
         ▼                                         │
APPLICATION WORKFLOW STATE                         │
(Canonical stage_progress)                         │
         │                                         │
         ├──────────────────────┐                  │
         ▼                      ▼                  ▼
COMPATIBILITY PROJECTION   UI/NAVIGATION      APPLICATION
 (Legacy phase1..5)     (Semantic Stage IDs)  POLICY EVALUATION
```

> **Core Hierarchy Rule**:
> 1. **Methodology** determines *what should happen*.
> 2. **Workflow state** records *what has happened*.
> 3. **Domain state** records *what is known*.
> 4. **UI** represents *those states*.

---

## 3. Governing Architectural Invariants

Every code modification executed under this specification must strictly enforce the following six invariants:

### `INV-CCDS-001-WORKFLOW-001` — Framework-Scoped Workflow State Authority
> Canonical workflow state is the versioned `stage_progress` representation stored inside `sessions.state_data`, scoped to a session and framework (`framework_id`). Canonical workflow state MUST be interpreted within its associated `framework_id`; a stage ID MUST NOT be interpreted across frameworks. `stage_progress` is the sole authoritative representation of current workflow-stage progression for migrated workflows. Legacy `phase1_complete`..`phase5_complete` fields MUST NOT independently determine workflow progression once `stage_progress` exists. Legacy fields MAY be maintained as compatibility projections for existing consumers but MUST NOT constitute a second source of truth.

### `INV-CCDS-001-WORKFLOW-002` — Deterministic Migration
> Legacy session state MUST produce the same canonical `stage_progress` for the same legacy inputs. Migration MUST be deterministic, idempotent, and non-destructive. Reading an already-migrated session MUST NOT rewrite or recalculate `stage_progress`.

### `INV-CCDS-001-WORKFLOW-003` — No Implicit Transition
> Reading, rendering, or persisting a gate review MUST NOT advance workflow state unless an explicit methodology-authorized transition is executed.

### `INV-CCDS-001-COMPAT-001` — Projection Non-Authority & Prohibition of Reverse Sync
> Legacy phase flags MUST NOT be read as workflow authority once canonical `stage_progress` exists. Once a valid `stage_progress` exists for a migrated session, no application path may derive, overwrite, or advance canonical workflow state from `phase1_complete`, `phase2_complete`, `phase3_complete`, `phase4_complete`, or `phase5_complete`. Changes to legacy phase flags MUST NOT be promoted back into `stage_progress` for migrated sessions. Legacy phase flags MUST be treated as compatibility artifacts whose historical semantics are explicitly characterized before projection rules are finalized.

### `INV-CCDS-001-DOMAIN-001` — Domain/Workflow Independence
> Domain entities MUST NOT require knowledge of the current workflow stage to remain valid domain representations. Domain entities describe what is true; workflow state determines what the user may do next.

### `INV-CCDS-001-GATE-001` — Gate/Stage Semantics
> A gate review record (`gate_reviews` row) and a workflow-stage completion record (`stage_progress` entry) represent distinct concepts. A gate MAY cause a workflow transition only through an explicitly defined application-layer transition rule. The existence of a `gate_reviews` row MUST NOT implicitly imply stage completion unless the ratified methodology defines that relationship.

---

## 4. Problem Statement & Verified Runtime Defects

CONVERA currently suffers from a dual-track technical debt where the Computing Research Track (Stages A–F) was overlaid onto a legacy 5-phase venture architecture. This produces four confirmed runtime interaction defects:

```text
+---------------------------------------------------------------------------------------------------------+
|                                    CONFIRMED RUNTIME DEFECT MATRIX                                      |
+--------------+----------+----------------------------------------------+--------------------------------+
| Defect ID    | Severity | Impacted Files                               | Verified Root Cause            |
+--------------+----------+----------------------------------------------+--------------------------------+
| DEF-NAV-001  | HIGH     | web/src/components/common/                   | MethodologyHudCard sets        |
|              |          | MethodologyHudCard.tsx:146                   | targetPhase: 3 for Gate 3,     |
|              |          |                                              | routing Stage E to Stage C     |
+--------------+----------+----------------------------------------------+--------------------------------+
| DEF-PERSIST- | HIGH     | web/src/components/layout/                   | PipelineStepper maps both      |
| 002          |          | PipelineStepper.tsx:215                      | Stage E and Stage F to         |
|              |          |                                              | session.phase5_complete        |
+--------------+----------+----------------------------------------------+--------------------------------+
| DEF-TRANS-   | HIGH     | web/src/components/frameworks/research/      | ResearchWorkspaceView defines  |
| 001          |          | ResearchWorkspaceView.tsx:963                | onGatePassed as console.log;   |
|              |          |                                              | gate reviews do not persist    |
+--------------+----------+----------------------------------------------+--------------------------------+
| DEF-NAV-002  | MEDIUM   | web/src/app/page.tsx:354-367                 | Integer slot 6 maps to Studio  |
|              |          |                                              | in Innovation, but Stage F in  |
|              |          |                                              | Research (Studio is slot 7)    |
+--------------+----------+----------------------------------------------+--------------------------------+
```

---

## 5. Phased Architecture & Scope Boundary

Under ratified **Option C (Progressive Realignment)**, changes are strictly segmented into four sequential phases. **This specification authorizes only Phase 1.**

```text
+─────────────────────────────────────────────────────────────────────────────+
|                         PROGRESSIVE REALIGNMENT PHASES                      |
+─────────────────────────────────────────────────────────────────────────────+
  PHASE 1: Workflow Safety & Defect Resolution [THIS SPECIFICATION]
  ├── Canonical semantic stage IDs (InnovationStageId, ResearchStageId)
  ├── Framework-scoped transitional stage_progress persistence in state_data
  ├── Deterministic, idempotent lazy migration for legacy sessions
  ├── Single-writer legacy read-compatibility projection
  ├── 9-step Application Transition Evaluator with expected-gate verification
  └── Complete elimination of Defects 1, 2, 3, and 4
        │
        v
  PHASE 2: Domain Boundary Extraction [DEFERRED TO FUTURE SPEC]
  ├── Move domain entities out of schemas/phase*_output.py into schemas/domain/
  └── Replace eligible_for_phase2 with ProblemEligibilityService policy
        │
        v
  PHASE 3: Physical Namespace Restructuring [DEFERRED TO FUTURE SPEC]
  └── Relocate web/src/components/phases/ to web/src/components/frameworks/innovation/
        │
        v
  PHASE 4: Relational Persistence Normalization [CONDITIONAL / DEFERRED]
  └── Migrate stage_progress from JSON to normalized session_stage_progress table
```

---

## 6. Technical Architecture & Component Specifications

### 6.1. Semantic Stage Navigation & Types (`web/src/lib/types.ts`)

Replace all numeric phase indexing with strongly typed, framework-scoped semantic stage unions:

```typescript
/**
 * Innovation Track Stage Identifiers (Venture Validation Track)
 */
export type InnovationStageId =
  | "bank"
  | "p1_discovery"
  | "p2_screening"
  | "p3_mom_test"
  | "p4_mechanism"
  | "p5_economics"
  | "studio";

/**
 * Computing Research Track Stage Identifiers (CRCDP Track)
 */
export type ResearchStageId =
  | "bank"
  | "stage_a_scouting"
  | "stage_b_validation"
  | "stage_c_opportunity"
  | "stage_d_formulation"
  | "stage_e_evaluation"
  | "stage_f_feasibility"
  | "studio";

/**
 * Universal Canonical Stage Identifier
 */
export type CanonicalStageId = InnovationStageId | ResearchStageId;

/**
 * Stage Execution Status Lifecycle
 */
export type StageStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";

/**
 * Stage Gate Lifecycle Evaluation Status
 */
export type GateStatus = "NOT_REQUIRED" | "PENDING" | "REVISE" | "PASSED" | "FAILED";

/**
 * Canonical Stage Progress Item
 */
export interface StageProgressItem {
  status: StageStatus;
  gate_id: string | null;
  gate_status: GateStatus;
  started_at?: string | null;
  completed_at?: string | null;
}

/**
 * Canonical Workflow State Representation (Stored in sessions.state_data)
 */
export interface WorkflowProgressState {
  schema_version: number;
  framework_id: "INNOVATION" | "RESEARCH";
  current_stage_id: CanonicalStageId;
  stages: Record<string, StageProgressItem>;
}

/**
 * Application Navigation Stage Descriptor (Presentation/UI Descriptor only; NOT a Domain Entity)
 */
export interface WorkflowStageDescriptor {
  id: CanonicalStageId;
  label: string;
  shortName: string;
  position: number;
  gateId?: string;
  isStudio?: boolean;
  isBank?: boolean;
}
```

---

### 6.2. Transitional Canonical Persistence Model

Store `stage_progress` within the existing `sessions.state_data` JSON column. This guarantees **zero SQLite schema alterations** while providing full structural fidelity.

#### Illustrative Canonical Research Workflow State:
```json
{
  "schema_version": 1,
  "framework_id": "RESEARCH",
  "current_stage_id": "stage_e_evaluation",
  "stages": {
    "stage_a_scouting": {
      "status": "COMPLETED",
      "gate_id": null,
      "gate_status": "NOT_REQUIRED",
      "completed_at": "2026-09-06T10:00:00Z"
    },
    "stage_b_validation": {
      "status": "COMPLETED",
      "gate_id": "GATE_1",
      "gate_status": "PASSED",
      "completed_at": "2026-09-06T10:15:00Z"
    },
    "stage_c_opportunity": {
      "status": "COMPLETED",
      "gate_id": "GATE_2",
      "gate_status": "PASSED",
      "completed_at": "2026-09-06T10:30:00Z"
    },
    "stage_d_formulation": {
      "status": "COMPLETED",
      "gate_id": null,
      "gate_status": "NOT_REQUIRED",
      "completed_at": "2026-09-06T10:45:00Z"
    },
    "stage_e_evaluation": {
      "status": "IN_PROGRESS",
      "gate_id": "GATE_3",
      "gate_status": "PENDING"
    },
    "stage_f_feasibility": {
      "status": "LOCKED",
      "gate_id": "GATE_4",
      "gate_status": "NOT_REQUIRED"
    }
  }
}
```

---

### 6.3. Deterministic Three-Case Session Load & Migration Engine (`backend/storage/sqlite_adapter.py`)

Sessions loaded from SQLite are evaluated against three explicit cases, strictly distinguishing read-only operations from intentional lazy migration writes:

```text
                  ┌─────────────────────────────────┐
                  │          SESSION LOAD           │
                  └────────────────┬────────────────┘
                                   │
                    Does state_data contain valid
                           stage_progress?
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
                 NO                                YES
                  │                                 │
     Is legacy data intact?            Is stage_progress valid schema?
                  │                                 │
         ┌────────┴────────┐               ┌────────┴────────┐
         ▼                 ▼               ▼                 ▼
        YES               NO              YES               NO
         │                 │               │                 │
         ▼                 ▼               ▼                 ▼
     [CASE B:          [CASE C:        [CASE A:          [CASE C:
     LEGACY]           CORRUPT]        MIGRATED]         INVALID]
         │                 │               │                 │
    Deterministic     Controlled       READ ONLY;        Controlled
    synthesis;        Recovery /       No write;         Recovery /
    Validate;         Surface          Authoritative;    Surface
    Persist write     Error            No recalculate    Error
```

#### Explicit Load Semantics:
1. **CASE A — MIGRATED SESSION (Read-Only Load)**:
   - *Condition*: `sessions.state_data` contains valid, schema-conforming `stage_progress`.
   - *Operation*: **STRICTLY READ-ONLY**. Zero workflow-state writes are performed.
   - *Authority*: `stage_progress` is used as the sole canonical authority.
   - *Guarantee*: The adapter MUST NOT rewrite, recalculate, or re-migrate the session.
2. **CASE B — LEGACY SESSION (Intentional Lazy Migration Write)**:
   - *Condition*: `stage_progress` is absent, but legacy phase flags exist.
   - *Operation*: **READ $\rightarrow$ DETERMINISTIC SYNTHESIS $\rightarrow$ SCHEMA VALIDATION $\rightarrow$ PERSIST MIGRATION $\rightarrow$ RETURN CANONICAL STATE**.
   - *Semantics*: Lazy migration is an **intentional application-state mutation** executed on load to synthesize and persist canonical `stage_progress`, eliminating downstream dual-write drift.
   - *Synthesis Determinism*:
     - *Innovation Session*: Synthesizes `p1_discovery`..`p5_economics` from `phase1..5_complete`. `current_stage_id` is the earliest incomplete stage, or `"studio"`.
     - *Research Session*: Synthesizes `stage_a_scouting`..`stage_d_formulation` from `phase1..4_complete`. If legacy `phase5_complete == True`, marks `stage_e_evaluation` and `stage_f_feasibility` completed for historical compatibility. If `False`, sets Stage E to `IN_PROGRESS` and Stage F to `LOCKED`.
   - *Idempotence & Non-Destruction*: Conversion MUST be deterministic and idempotent. Loading the migrated session again immediately transitions it to **CASE A (Read-Only)**.
3. **CASE C — INVALID / CORRUPT SESSION (Controlled Failure)**:
   - *Condition*: `stage_progress` is corrupted, partially unparseable, or schema validation fails.
   - *Safety Invariant*: **DO NOT silently overwrite. DO NOT guess. DO NOT attempt migration.**
   - *Operation*: The adapter MUST raise `WorkflowStateCorruptedError`, halting execution and requiring controlled administrative recovery.

---

### 6.4. Legacy Read-Compatibility Projection Engine (`backend/storage/sqlite_adapter.py`)

To preserve 100% backward compatibility with active `/api/phases/1..5` endpoints, the SQLite persistence layer implements a single-writer pure projection function invoked exclusively during session persistence:

```python
def derive_legacy_phase_projection(framework_id: str, stage_progress: dict) -> dict:
    """
    Pure projection from canonical stage_progress to legacy boolean columns.
    Single-writer: Called ONLY during persistence.
    Enforces INV-CCDS-001-COMPAT-001 (Prohibition of reverse synchronization).
    """
    stages = stage_progress.get("stages", {})
    if framework_id == "RESEARCH":
        return {
            "phase1_complete": stages.get("stage_a_scouting", {}).get("status") == "COMPLETED",
            "phase2_complete": stages.get("stage_b_validation", {}).get("status") == "COMPLETED",
            "phase3_complete": stages.get("stage_c_opportunity", {}).get("status") == "COMPLETED",
            "phase4_complete": stages.get("stage_d_formulation", {}).get("status") == "COMPLETED",
            # Legacy phase 5 represented terminal research readiness
            "phase5_complete": (
                stages.get("stage_e_evaluation", {}).get("status") == "COMPLETED"
                and stages.get("stage_f_feasibility", {}).get("status") == "COMPLETED"
            ),
        }
    else:
        return {
            "phase1_complete": stages.get("p1_discovery", {}).get("status") == "COMPLETED",
            "phase2_complete": stages.get("p2_screening", {}).get("status") == "COMPLETED",
            "phase3_complete": stages.get("p3_mom_test", {}).get("status") == "COMPLETED",
            "phase4_complete": stages.get("p4_mechanism", {}).get("status") == "COMPLETED",
            "phase5_complete": stages.get("p5_economics", {}).get("status") == "COMPLETED",
        }
```

#### Normative Implementation Requirement (No Reverse Synchronization):
> **`REQ-CCDS-001-COMPAT-01`**: Once a valid `stage_progress` exists for a migrated session, no application path, service method, or API endpoint may derive, overwrite, or advance canonical workflow state from `phase1_complete`, `phase2_complete`, `phase3_complete`, `phase4_complete`, or `phase5_complete`. Legacy fields are strictly derived projections from `stage_progress` and MUST NOT be read as workflow authority.

---

### 6.5. 9-Step Application Transition Evaluator & Transactional Boundary

Transitions between workflow stages must execute through an explicit application-layer transition evaluator (`WorkflowTransitionService`), strictly separating gate evaluation from workflow progression:

```text
Gate Review Submitted (POST /api/sessions/{id}/workflow/transition)
      ↓
1. Load Current Workflow (Retrieve session and framework_id)
      ↓
2. Identify Current Stage (Resolve active stage from stage_progress)
      ↓
3. Identify Expected Gate for Current Stage (Verify if current stage requires a gate)
      ↓
4. Verify Submitted Gate Matches Expected Gate (REJECT mismatches e.g. GATE_4 submitted on Stage B)
      ↓
5. Validate Methodology Criteria & Evaluation Rules (Fixtures subordinate to CCDS; check minimum scores)
      ↓
6. Validate Gate Verdict (Evaluate if verdict is PASSED vs. REVISE or FAILED)
      ↓
7. Transition Workflow State (Advance to next stage if PASSED; retain current stage if REVISE/FAILED)
      ↓
8. Persist Canonical Workflow State (Transactionally save updated stage_progress in state_data)
      ↓
9. Project Legacy Compatibility Flags (Execute single-writer derive_legacy_phase_projection)
```

#### 6.5.1. Transactional State-Update Boundary Contract [IMPLEMENTATION REQUIREMENT]

The workflow transition operation requires an explicit state-update boundary separating logical transition evaluation from database persistence:

```text
Logical Gate & Criteria Validation (Steps 1–6)
                  │
                  ▼
Transition Decision Evaluated (Step 7)
                  │
                  ▼
┌───────────────────────────────────────────────────────────┐
│               PERSISTENCE TRANSACTION BOUNDARY            │
│  BEGIN TRANSACTION (Atomic Storage Boundary)              │
│    ├── Serialize updated canonical stage_progress         │
│    ├── Write stage_progress into sessions.state_data      │
│    ├── Compute derive_legacy_phase_projection()           │
│    ├── Update legacy phase1_complete..phase5_complete     │
│    └── Update sessions.updated_at                         │
│  COMMIT                                                   │
└───────────────────────────────────────────────────────────┘
```

The implementation must fulfill the following contractual guarantees:
1. **Consistency**: Canonical `stage_progress` within `state_data` and its corresponding legacy projection columns (`phase1_complete`..`phase5_complete`) MUST be committed in the same database transaction.
2. **Failure Atomicity**: If validation fails, if the verdict does not authorize transition, or if a database write error occurs, the transition MUST abort cleanly. A failed transition MUST NOT leave a partially updated workflow state or desynchronized legacy columns.
3. **Isolation**: The adapter MUST use an appropriate persistence transaction boundary (e.g. SQLite `BEGIN IMMEDIATE` / `COMMIT`) to guarantee that concurrent read or write operations cannot observe uncommitted intermediate workflow states.

#### API Endpoint Specification:
- **Route**: `POST /api/sessions/{session_id}/workflow/transition`
- **Request Body**:
  ```json
  {
    "stage_id": "stage_e_evaluation",
    "gate_id": "GATE_3",
    "gate_review_id": "gr_abc123"
  }
  ```
- **Response**:
  ```json
  {
    "transition_applied": true,
    "previous_stage_id": "stage_e_evaluation",
    "current_stage_id": "stage_f_feasibility",
    "stage_progress": { ... }
  }
  ```

---

## 7. Component-Level Remediation Specifications

### 7.1. Defect 1: Gate 3 HUD Misrouting Fix
- **Target File**: `web/src/components/common/MethodologyHudCard.tsx`
- **Change Description**:
  - Replace `targetPhase: number` with `targetStageId: CanonicalStageId`.
  - Update `GATE_CONFIGS["GATE_3"]` from `targetPhase: 3` to `targetStageId: "stage_e_evaluation"`.
  - Ensure clicking Gate 3 directly routes to the Stage E evaluation view rather than Stage C.

### 7.2. Defect 2: Stage E/F Stepper Separation Fix
- **Target File**: `web/src/components/layout/PipelineStepper.tsx`
- **Change Description**:
  - Replace dependency on `session.phase5_complete` for Stage E and Stage F with direct inspection of `stage_progress.stages`.
  - Check `stages["stage_e_evaluation"]?.status === "COMPLETED"` for Stage E status.
  - Check `stages["stage_f_feasibility"]?.status === "COMPLETED"` for Stage F status.
  - Enable independent locking, active rendering, and milestone completion for both stages.

### 7.3. Defect 3: Disconnected Gate Callback Fix
- **Target File**: `web/src/components/frameworks/research/ResearchWorkspaceView.tsx`
- **Change Description**:
  - Replace `console.log("Gate passed:", gateId)` with an explicit async call to `sessionService.transitionWorkflowStage(sessionId, currentStageId, gateId, gateReviewId)`.
  - On successful response, update local session state and advance the active view to the next unlocked stage.

### 7.4. Defect 4: Deliverables Studio Route Collision Fix
- **Target File**: `web/src/app/page.tsx`
- **Change Description**:
  - Refactor `activePhase: number` state to `activeStageId: CanonicalStageId`.
  - In Innovation Track, map `"studio"` to the Deliverables Studio view (formerly index 6).
  - In Research Track, map `"stage_f_feasibility"` to Stage F (formerly colliding index 6) and `"studio"` to Research Deliverables Studio (formerly index 7).
  - Eliminate all magic index comparisons (`activePhase === 6`).

---

## 8. Behavioral Compatibility Test Matrix

To fulfill the requirements of `INV-CCDS-001-WORKFLOW-002`, `INV-CCDS-001-COMPAT-001`, and ensure zero regression across active sessions, seven automated test suites and one idempotence verification suite must pass:

### Suite 1: Legacy Session Ingestion Test
- **Target**: Load all **13 active SQLite sessions** from `convera.db`.
- **Verification**:
  - Every session must synthesize valid canonical `stage_progress`.
  - Saving the loaded session must yield identical `phase1_complete`..`phase5_complete` flags with **zero state drift**.
  - All existing problem bank entries and session parameters must remain 100% accessible.

### Suite 2: Research Track Workflow State Test [METHODOLOGY RESERVATION]
- **Target**: Execute Stages A through F sequentially against existing test fixtures.
- **Verification**:
  - Verify independent status progression for Stage E and Stage F.
  - Verify that passing Gate 3 unlocks Stage F and marks Stage E completed.
  - Verify that completing Stage F unlocks Deliverables Studio.
- **Methodology Authority Reservation**:
  > Suite 2 verifies architectural workflow-state behavior against the currently implemented Research stage/gate definitions as test fixtures. It does not ratify, redefine, or elevate those methodology definitions into architectural authority. Research methodology thresholds, gate rubrics, and Stage A–F completion criteria remain strictly subordinate to the CCDS and the governing methodology specifications.

### Suite 3: Innovation Track Workflow State Test
- **Target**: Execute Phases 1 through 5 sequentially.
- **Verification**:
  - Verify Socratic level sequencing and Mom Test validation.
  - Verify that completing Phase 5 unlocks Deliverables Studio.
  - Verify legacy phase flags are accurately projected on save.

### Suite 4: Legacy API Invariance Test
- **Target**: Exercise all `/api/phases/1..5` endpoints.
- **Verification**:
  - Response payloads and contracts must remain 100% backward-compatible.
  - Existing frontend consumers must function without modification.

### Suite 5: Navigation Traversal & Compatibility Test
- **Target**: End-to-end traversal across both tracks.
- **Verification**:
  - Innovation Track: `problem_bank` $\rightarrow$ `p1_discovery` $\rightarrow$ `p2_screening` $\rightarrow$ `p3_mom_test` $\rightarrow$ `p4_mechanism` $\rightarrow$ `p5_economics` $\rightarrow$ `studio`.
  - Research Track: `problem_bank` $\rightarrow$ `stage_a_scouting` $\rightarrow$ `stage_b_validation` $\rightarrow$ `stage_c_opportunity` $\rightarrow$ `stage_d_formulation` $\rightarrow$ `stage_e_evaluation` $\rightarrow$ `stage_f_feasibility` $\rightarrow$ `studio`.
  - Explicitly verify Defect 1 (Gate 3 $\rightarrow$ Stage E) and Defect 4 (Stage F vs. Studio).

### Suite 6: Repeated Migration & Idempotence Verification
- **Target**: `legacy -> migrate -> reload -> migrate again -> reload`.
- **Verification**:
  - Verify $\text{state}_1 == \text{state}_2 == \text{state}_3$ with zero drift and zero side-effects.
  - Directly verifies `INV-CCDS-001-WORKFLOW-002`.

### Suite 7: No-Reverse-Synchronization Invariant Test [ISOLATED FIXTURE]
- **Target**: Isolated SQLite test fixture (MUST NOT mutate `convera.db`).
- **Verification Sequence**:
  1. Initialize a migrated session with canonical `stage_progress`.
  2. Record canonical `stage_progress`.
  3. Directly alter one or more legacy columns (`phase2_complete = False` or `phase5_complete = True`) in the database row.
  4. Reload the session via `sqlite_adapter.load_session()`.
  5. Verify `stage_progress` remains strictly identical to the recorded state.
  6. Verify legacy column modifications do NOT cause workflow progression, regression, or stage unlocking.
  7. Verify that saving the session re-projects legacy flags strictly from `stage_progress`, restoring projection consistency under `INV-CCDS-001-COMPAT-001`.

---

## 9. Explicit Out-of-Scope Items

The following actions are strictly prohibited during Phase 1:
- ❌ **No SQLite Schema Mutations**: Zero `ALTER TABLE`, `CREATE TABLE`, or `DROP TABLE` statements.
- ❌ **No Production Code Implementation During Specification**: Zero code writes until explicit Human Implementation Authorization.
- ❌ **No Physical Namespace Restructuring**: `web/src/components/phases/` must NOT be moved or renamed in Phase 1 (deferred to Phase 3).
- ❌ **No Schema DTO Relocation**: `backend/schemas/phase*_output.py` must NOT be moved or split in Phase 1 (deferred to Phase 2).
- ❌ **No Epistemic Algorithm Alterations**: Mom Test scoring, evidence ratchets, and gap analysis logic must remain untouched.
- ❌ **No Dependency Additions**: Zero new npm or Python packages may be installed.

---

## 10. Governance Sequence & Human Implementation Authorization Gate

```text
TECH-DEBT-CCDS-001 ADR v2.2 (Ratified)
                  │
                  ▼
SPEC-TECH-DEBT-CCDS-001 (Formally Created & Precision-Checked)
                  │
                  ▼
[GATE: HUMAN IMPLEMENTATION AUTHORIZATION]  <─── WE ARE HERE (STOP CONDITION)
                  │
                  ▼ (Upon Explicit Authorization Only)
Phase 1 Implementation Execution:
  1. web/src/lib/types.ts (Semantic Stage IDs & Progress Types)
  2. backend/storage/sqlite_adapter.py (Lazy Migration & Pure Projection)
  3. backend/services/workflow_transition_service.py (9-Step Transition Contract)
  4. backend/routers/gates.py (Transition Endpoint)
  5. web/src/components/common/MethodologyHudCard.tsx (Defect 1 Fix)
  6. web/src/components/layout/PipelineStepper.tsx (Defect 2 Fix)
  7. web/src/components/frameworks/research/ResearchWorkspaceView.tsx (Defect 3 Fix)
  8. web/src/app/page.tsx (Defect 4 Fix)
                  │
                  ▼
Verification Pass (Suites 1 through 7 + Pytest + TypeScript + Build)
                  │
                  ▼
Human Acceptance Gate
```

> **STOP CONDITION MANDATE**:
> In strict accordance with the Human Architectural Ratification instructions, this SDD has been fully documented and saved.
> **Zero production code, schemas, databases, or APIs have been modified.**
> Antigravity will now halt and await **HUMAN IMPLEMENTATION AUTHORIZATION** before beginning Phase 1 execution.
