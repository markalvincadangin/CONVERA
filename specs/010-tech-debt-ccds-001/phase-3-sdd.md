# SPEC-TECH-DEBT-CCDS-001 (Phase 3): Physical Namespace Realignment

**Document ID**: `SPEC-TECH-DEBT-CCDS-001-PHASE-3`  
**Classification**: Tier 2 Software Design Document (SDD)  
**Governing Standard**: CONVERA Concept Development Standard (CCDS v2.0) — *“Knowledge != Workflow”*  
**Parent Architectural Authority**: `TECH-DEBT-CCDS-001 — Architectural Decision Record v2.2` (Ratified 2026-09-06)  
**Upstream Authority**: Phase 3 Architectural Decision Pass on Q-FE-1, Q-BE-1, Q-BE-2, Q-BE-3 (Ratified 2026-09-06)  
**Document Status**: 🟢 IMPLEMENTATION ACCEPTED BY HUMAN LEADERSHIP (AMENDED BY AMENDMENT-01)  
**Dedicated Working Branch**: `feature/010-tech-debt-ccds-001-phase-2`  
**Target Branch**: `feature/010-tech-debt-ccds-001-phase-2`  
**Canonical Spec Path**: `specs/010-tech-debt-ccds-001/phase-3-sdd.md`  

---

## 1. Architectural Boundary & Core Philosophy

The foundational principle of CCDS v2.0 is:
> **“Phases are track-specific workflow implementations, not universal architectural abstractions.”**

In the pre-refactoring architecture, the generic term `phases/` existed both in the frontend component tree (`web/src/components/phases/`) and the backend schemas (`backend/schemas/phase*_output.py`). This created two distinct architectural flaws:

1. **Frontend Track Conflation**: Top-level `components/phases/` incorrectly implied that "Phase 1 through 5" was a universal, track-agnostic structure. In reality, CONVERA implements a dual-track architecture: the **Innovation Track** (Stages P1–P5) and the **Research Track** (Stages R1–R5). The Research Track already resides properly in `web/src/components/frameworks/research/`. Locating the Innovation Track under `web/src/components/frameworks/innovation/` establishes symmetric, track-scoped frameworks under the CCDS design system.
2. **Backend Schema Layer Collapsing**: In Phase 2, pure domain models were cleanly extracted into `backend/schemas/domain/`. However, the stage-output pipeline containers remained at the root level (`schemas/phase*_output.py`), blurring the boundary between domain models, pipeline transport containers, and application services.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CONVERA CORE ARCHITECTURE                     │
├───────────────────────────────────┬─────────────────────────────────────┤
│             FRONTEND              │               BACKEND               │
│  components/frameworks/           │  schemas/                           │
│  ├── innovation/ (Phase 3 target) │  ├── domain/   (Extracted Phase 2)  │
│  │   ├── Phase1View.tsx           │  │   ├── problem.py                 │
│  │   ├── Phase2View.tsx           │  │   ├── screening.py               │
│  │   ├── Phase3View.tsx           │  │   ├── validation.py              │
│  │   ├── Phase4View.tsx           │  │   ├── concept.py                 │
│  │   └── Phase5View.tsx           │  │   └── experiment.py              │
│  └── research/   (Live precedent) │  ├── pipeline/ (Phase 3 target)     │
│      ├── ResearchWorkspaceView.tsx│  │   ├── discovery_output.py        │
│      ├── GateReviewModal.tsx      │  │   ├── screening_output.py        │
│      └── CircumscriptionLoopView  │  │   ├── validation_output.py       │
│                                   │  │   ├── mechanism_output.py        │
│                                   │  │   └── economics_output.py        │
│                                   │  └── phase*_output.py (Legacy shims)│
└───────────────────────────────────┴─────────────────────────────────────┘
```

Phase 3 physically realigns both the frontend component hierarchy and the backend pipeline schemas into their permanent architectural homes, backed by backward-compatible shims on the backend and strict static type verification on the frontend.

---

## 2. Ratified Architectural Decisions (Q-FE-1, Q-BE-1, Q-BE-2, Q-BE-3)

On 2026-09-06, Human Leadership formally ratified the resolutions to the four architectural questions raised in the Phase 3 Read-Only Decision Pass:

| Question ID | Architectural Topic | Ratified Resolution | Governing Rationale & Guidance |
| :--- | :--- | :--- | :--- |
| **Q-FE-1** | Frontend Innovation Layout | **Option B: Flat Layout** | Relocate components directly to `components/frameworks/innovation/` without stage subdirectories. Matches the flat pattern established by `components/frameworks/research/` (which hosts `ResearchWorkspaceView`, `GateReviewModal`, `CircumscriptionLoopView` as flat siblings). |
| **Q-BE-1** | Canonical Mechanism Family Import | **YES: Direct Domain Import** | Correct `gates/__init__.py:136` to import `VALID_MECHANISM_FAMILIES` directly from `schemas.domain.concept` instead of importing from `schemas.phase4_output`. Eliminates cross-layer bypass of the domain boundary by methodology gates. |
| **Q-BE-2** | Pipeline Module Naming | **Option B: `_output.py` Suffix** | Modules in `schemas/pipeline/` are named with the `_output.py` suffix: `discovery_output.py`, `screening_output.py`, `validation_output.py`, `mechanism_output.py`, and `economics_output.py`. Completely eliminates naming collisions with `schemas/domain/screening.py` and `schemas/domain/validation.py`. |
| **Q-BE-3** | Canonical Pipeline Namespace | **`backend/schemas/pipeline/`** | The canonical backend directory is `schemas/pipeline/` (representing layer semantics for stage-output containers), cleanly distinguishing it from domain models (`schemas/domain/`) and application services (`services/`). |

---

## 3. Frontend Physical Relocation Specification

### 3.1 Inventory of Relocated Files
All 10 files currently in `web/src/components/phases/` are physically relocated to `web/src/components/frameworks/innovation/`:

```text
SOURCE LOCATION: web/src/components/phases/
├── index.ts
├── phase1/Phase1View.tsx
├── phase2/Phase2View.tsx
├── phase2/DecisionRoomWorkspace.tsx
├── phase2/ProblemComparisonMatrix.tsx
├── phase2/ScreeningScorecardGrid.tsx
├── phase3/Phase3View.tsx
├── phase3/PivotLoopModal.tsx
├── phase4/Phase4View.tsx
└── phase5/Phase5View.tsx

TARGET LOCATION: web/src/components/frameworks/innovation/ (Option B - Flat)
├── index.ts                              # Canonical barrel re-exporting all views and modals
├── Phase1View.tsx                        # Problem Discovery Workspace
├── Phase2View.tsx                        # Problem Screening Workspace
├── DecisionRoomWorkspace.tsx             # Phase 2 Decision Room sub-component
├── ProblemComparisonMatrix.tsx           # Phase 2 Comparison Matrix sub-component
├── ScreeningScorecardGrid.tsx            # Phase 2 Scorecard Grid (also consumed by PresentationModal)
├── Phase3View.tsx                        # Problem Validation & Mom Test Workspace
├── PivotLoopModal.tsx                    # Phase 3 Pivot Loop Dialog
├── Phase4View.tsx                        # Solution Concept & Mechanism Workspace
└── Phase5View.tsx                        # Business Model & Economics Workspace
```

### 3.2 Sibling Import Simplification
Because all components now reside in a single flat directory:
* In `Phase2View.tsx`: imports from `./ScreeningScorecardGrid`, `./ProblemComparisonMatrix`, and `./DecisionRoomWorkspace` remain simple sibling relative imports (`./...`), eliminating the directory boundary.
* In `Phase3View.tsx`: import from `./PivotLoopModal` remains a simple sibling relative import (`./PivotLoopModal`).
* In `index.ts`: the barrel cleanly re-exports from flat siblings:
  ```typescript
  export * from "./Phase1View";
  export * from "./Phase2View";
  export * from "./Phase3View";
  export * from "./Phase4View";
  export * from "./Phase5View";
  export * from "./DecisionRoomWorkspace";
  export * from "./ProblemComparisonMatrix";
  export * from "./ScreeningScorecardGrid";
  export * from "./PivotLoopModal";
  ```

### 3.3 Exhaustive Consumer Migration Map
The read-only consumer trace proved that only **two** external files in the entire project import from `web/src/components/phases`:

| Consumer File | Current Import Statement | Target Import Statement |
| :--- | :--- | :--- |
| `web/src/app/page.tsx:14` | `import { Phase1View, Phase2View, Phase3View, Phase4View, Phase5View } from "@/components/phases";` | `import { Phase1View, Phase2View, Phase3View, Phase4View, Phase5View } from "@/components/frameworks/innovation";` |
| `web/src/components/layout/PresentationModal.tsx:10` | `import { ScreeningScorecardGrid } from "@/components/phases/phase2/ScreeningScorecardGrid";` | `import { ScreeningScorecardGrid } from "@/components/frameworks/innovation/ScreeningScorecardGrid";` |

### 3.4 Deletion of Legacy Directory
Unlike the backend (which requires compatibility shims for tests and dynamic Python consumers), TypeScript provides compile-time guarantee of module resolution. Once `page.tsx` and `PresentationModal.tsx` are updated and `npx tsc --noEmit` passes with zero errors, the legacy `web/src/components/phases/` directory is **completely deleted**.

---

## 4. Backend Physical Relocation Specification

### 4.1 Canonical Pipeline Namespace (`backend/schemas/pipeline/`)
The stage-output pipeline containers are relocated from `backend/schemas/phase*_output.py` to `backend/schemas/pipeline/`:

| Module Path | Primary Symbols / Classes | Model Purpose | Dependencies |
| :--- | :--- | :--- | :--- |
| `backend/schemas/pipeline/__init__.py` | `Phase1Output`, `Phase2Output`, `Phase3Output`, `Phase4Output`, `Phase5Output`, `CONCEPT_VERDICT`, `PHASE4_VERDICT`, `Phase5Verdict` | Master pipeline package barrel | Sibling pipeline modules |
| `backend/schemas/pipeline/discovery_output.py` | `Phase1Output` | Stage P1 discovery batch output container; composes `DiscoveredProblem` | `schemas.domain.problem` |
| `backend/schemas/pipeline/screening_output.py` | `Phase2Output` | Stage P2 screening batch output container; composes `ScreeningResult` | `schemas.domain.screening` |
| `backend/schemas/pipeline/validation_output.py` | `Phase3Output` | Stage P3 validation scorecard container; composes `EvidenceConfidence`, `ProblemAttractiveness` | `schemas.domain.validation` |
| `backend/schemas/pipeline/mechanism_output.py` | `Phase4Output`, `CONCEPT_VERDICT`, `PHASE4_VERDICT` | Stage P4 concept & experiment batch output container; composes `SolutionConcept`, `Assumption`, `ExperimentCard` | `schemas.domain.concept` |
| `backend/schemas/pipeline/economics_output.py` | `Phase5Output`, `Phase5Verdict` | Stage P5 economics audit container; composes `ExperimentAuditResult`, `PivotAnalysis` | `schemas.domain.experiment` |

### 4.2 Legacy Compatibility Shims (`backend/schemas/phase*_output.py`)
To ensure that existing external consumers and test suites (e.g. `test_domain_schemas.py`, `test_gates.py`, `test_schemas.py`) continue executing with zero breakage, the legacy files in `backend/schemas/` are converted into pure backward-compatibility re-export shims:

* `backend/schemas/phase1_output.py`:
  ```python
  from schemas.pipeline.discovery_output import Phase1Output
  from schemas.domain.problem import (
      EvidenceTier,
      SourceTier,
      SECTORS,
      EvidenceSource,
      DiscoveredProblem,
  )
  __all__ = [
      "Phase1Output",
      "EvidenceTier",
      "SourceTier",
      "SECTORS",
      "EvidenceSource",
      "DiscoveredProblem",
  ]
  ```
* `backend/schemas/phase2_output.py`:
  ```python
  from schemas.pipeline.screening_output import Phase2Output
  from schemas.domain.screening import ScreeningResult
  __all__ = ["Phase2Output", "ScreeningResult"]
  ```
* `backend/schemas/phase3_output.py`:
  ```python
  from schemas.pipeline.validation_output import Phase3Output
  from schemas.domain.validation import EvidenceConfidence, ProblemAttractiveness
  __all__ = ["Phase3Output", "EvidenceConfidence", "ProblemAttractiveness"]
  ```
* `backend/schemas/phase4_output.py`:
  ```python
  from schemas.pipeline.mechanism_output import (
      Phase4Output,
      CONCEPT_VERDICT,
      PHASE4_VERDICT,
  )
  from schemas.domain.concept import (
      VALID_MECHANISM_FAMILIES,
      ASSUMPTION_TYPES,
      ConceptScreeningScore,
      SolutionConcept,
      Assumption,
      ExperimentCard,
  )
  __all__ = [
      "Phase4Output",
      "CONCEPT_VERDICT",
      "PHASE4_VERDICT",
      "VALID_MECHANISM_FAMILIES",
      "ASSUMPTION_TYPES",
      "ConceptScreeningScore",
      "SolutionConcept",
      "Assumption",
      "ExperimentCard",
  ]
  ```
* `backend/schemas/phase5_output.py`:
  ```python
  from schemas.pipeline.economics_output import Phase5Output, Phase5Verdict
  from schemas.domain.experiment import (
      CommitmentTier,
      TestArchetype,
      PassFailStatus,
      ExperimentAuditResult,
      PivotAnalysis,
  )
  __all__ = [
      "Phase5Output",
      "Phase5Verdict",
      "CommitmentTier",
      "TestArchetype",
      "PassFailStatus",
      "ExperimentAuditResult",
      "PivotAnalysis",
  ]
  ```
* `backend/schemas/__init__.py`:
  Updated to import canonical pipeline containers directly from `schemas.pipeline.*`, while maintaining re-exports of all domain and pipeline types.

### 4.3 Direct Domain Import in `backend/gates/__init__.py`
Per Ratified Decision **Q-BE-1**:
* Line 136 of `backend/gates/__init__.py` is updated:
  ```python
  # BEFORE:
  from schemas.phase4_output import VALID_MECHANISM_FAMILIES

  # AFTER:
  from schemas.domain.concept import VALID_MECHANISM_FAMILIES
  ```
* Rationale: `VALID_MECHANISM_FAMILIES` is a pure domain vocabulary constant extracted in Phase 2 to `schemas/domain/concept.py`. Importing it from a pipeline container module (`phase4_output.py`) creates an unnecessary indirect dependency.

---

## 5. Architectural Import Direction Matrix

Phase 3 strictly maintains the unidirectional dependency hierarchy of CCDS v2.0:

```text
ALLOWED DEPENDENCY FLOW:
  schemas/domain/   ──[depends on]──> standard library, pydantic
  schemas/pipeline/ ──[depends on]──> schemas/domain/, standard library, pydantic
  services/         ──[depends on]──> schemas/domain/, schemas/pipeline/
  gates/            ──[depends on]──> schemas/domain/, schemas/pipeline/
  routers/engines/  ──[depends on]──> services/, gates/, schemas/pipeline/, schemas/domain/
  web/innovation/   ──[depends on]──> web/common/, web/lib/types, web/services/

FORBIDDEN DEPENDENCY FLOW:
  schemas/domain/   ──X──> schemas/pipeline/    (Domain must never know about pipeline containers)
  schemas/domain/   ──X──> services/            (Domain must never know about application policy)
  schemas/pipeline/ ──X──> services/            (Pipeline schemas must not import application services)
  schemas/pipeline/ ──X──> gates/               (Pipeline schemas must not import gate enforcement)
  schemas/pipeline/ ──X──> routers/engines/     (Pipeline schemas must not import execution routers)
  gates/            ──X──> phase4_output (legacy) (Gates must import domain constants directly from domain)
```

---

## 6. Step-by-Step Execution Sequence (Expand → Migrate → Contract)

Execution must proceed strictly according to the Expand-Migrate-Contract protocol:

```text
PHASE 3.1: EXPAND
├── 1.1 Create directory backend/schemas/pipeline/
├── 1.2 Implement schemas/pipeline/discovery_output.py (Phase1Output)
├── 1.3 Implement schemas/pipeline/screening_output.py (Phase2Output)
├── 1.4 Implement schemas/pipeline/validation_output.py (Phase3Output)
├── 1.5 Implement schemas/pipeline/mechanism_output.py (Phase4Output, CONCEPT_VERDICT, PHASE4_VERDICT)
├── 1.6 Implement schemas/pipeline/economics_output.py (Phase5Output, Phase5Verdict)
├── 1.7 Implement schemas/pipeline/__init__.py (Re-exporting all canonical pipeline containers)
├── 1.8 Create directory web/src/components/frameworks/innovation/
└── 1.9 Populate web/src/components/frameworks/innovation/ with 9 components and barrel index.ts

PHASE 3.2: MIGRATE
├── 2.1 Update backend/schemas/__init__.py to import from schemas.pipeline.*
├── 2.2 Convert backend/schemas/phase*_output.py (1..5) into backward-compatible re-export shims
├── 2.3 Correct backend/gates/__init__.py:136 to import VALID_MECHANISM_FAMILIES from schemas.domain.concept
├── 2.4 Update web/src/app/page.tsx import path to @/components/frameworks/innovation
└── 2.5 Update web/src/components/layout/PresentationModal.tsx import path to @/components/frameworks/innovation/ScreeningScorecardGrid

PHASE 3.3: CONTRACT
├── 3.1 Delete legacy directory web/src/components/phases/
├── 3.2 Audit frontend codebase to confirm 0 matches for "@/components/phases"
├── 3.3 Run Suite P3-FE (Next.js TypeScript check & build)
├── 3.4 Create backend/tests/test_pipeline_schemas.py (Class identity & shim verification)
├── 3.5 Run Suite P3-BE (Full backend regression 167/167 + AST dependency linter)
└── 3.6 Run git status to verify clean tree and zero orphaned artifacts
```

---

## 7. Hardened Verification & Compatibility Test Plan

Verification is divided into two distinct automated suites:

### 7.1 Suite P3-FE: Frontend Verification
| Test ID | Command / Inspection | Pass Criteria | Rationale |
| :--- | :--- | :--- | :--- |
| **P3-FE-1** | `cd web && npx tsc --noEmit` | Exit code 0, zero type errors | Confirms all component imports, props, and type bindings resolve cleanly across relocated files. |
| **P3-FE-2** | `cd web && npm run build` | Successful production build | Confirms Webpack / Next.js bundle compilation succeeds without static analysis or bundling faults. |
| **P3-FE-3** | `grep -rn "@/components/phases" web/src/` | Exactly 0 matches found | Proves zero stale references to the deleted legacy phases directory remain in the frontend codebase. |
| **P3-FE-4** | Static import resolution check | `page.tsx` imports 5 views from `@/components/frameworks/innovation` | Verifies barrel resolution at root view. |
| **P3-FE-5** | Direct import resolution check | `PresentationModal.tsx` imports `ScreeningScorecardGrid` | Verifies deep component import resolution in the flat layout. |

### 7.2 Suite P3-BE: Backend Verification
Codified in a new test file `backend/tests/test_pipeline_schemas.py` and run alongside existing suites:

| Test ID | Method / Assertion | Pass Criteria | Rationale |
| :--- | :--- | :--- | :--- |
| **P3-BE-1** | `pytest backend/tests/ -x` | All 167 tests pass (100% green) | Confirms zero behavioral regression across domain, gates, services, routers, and storage. |
| **P3-BE-2** | Class identity assertions: `Legacy is Canonical` | `assert LegacyPhase1Output is CanonicalPhase1Output`<br>`assert LegacyPhase2Output is CanonicalPhase2Output`<br>`assert LegacyPhase3Output is CanonicalPhase3Output`<br>`assert LegacyPhase4Output is CanonicalPhase4Output`<br>`assert LegacyPhase5Output is CanonicalPhase5Output` | Proves that legacy shims do not subclass or wrap, but re-export the exact same Python class objects. |
| **P3-BE-3** | Verdict identity assertions | `assert LegacyConceptVerdict is CanonicalConceptVerdict`<br>`assert LegacyPhase5Verdict is CanonicalPhase5Verdict` | Proves type literals are preserved across shims. |
| **P3-BE-4** | Re-exported domain identity | `from schemas.phase1_output import DiscoveredProblem`<br>`assert DiscoveredProblem is DomainProblem` | Confirms legacy phase files maintain backward compatibility for domain models re-exported in Phase 2. |
| **P3-BE-5** | Gates canonical import verification | AST inspection of `backend/gates/__init__.py` | Confirms line 136 imports `VALID_MECHANISM_FAMILIES` from `schemas.domain.concept` and NOT `schemas.phase4_output`. |
| **P3-BE-6** | AST Dependency Direction Linter | AST traversal of `backend/schemas/pipeline/*.py` | Confirms zero imports of `services`, `gates`, `routers`, `engines`, `storage`. Confirms `schemas/domain/` has zero imports of `schemas/pipeline/`. |

---

## 8. Governance Invariants & Scope Boundaries

The following invariants are strictly non-negotiable and must be preserved throughout Phase 3:

1. **Zero Database Schema Migrations**: Zero `ALTER TABLE`, `CREATE TABLE`, or DDL statements across all 23 SQLite relational tables in `convera.db`.
2. **Zero Session Data / State Mutations**: `sessions.state_data` JSON keys (`stage_progress`, `current_stage_id`, `current_framework`) and serialization formats remain 100% untouched.
3. **Zero API Route URL Path Mutations**: HTTP API endpoint routes (e.g. `/api/phases/1/...`, `/api/phases/2/...`) remain untouched. Physical file moves do NOT alter API routing.
4. **Zero AI / Prompt Schema Drift**: Pydantic field definitions, field names, default values, and validation rules in `Phase1Output` through `Phase5Output` remain identical. Zero prompt text edits.
5. **Zero Code Changes Before Human Implementation Authorization**: No production code, tests, schemas, or components may be modified until explicit human sign-off is granted for this SDD.

---

## 9. Rollback Strategy & Risk Assessment

| Risk Category | Inherent Risk | Mitigation Strategy | Residual Risk |
| :--- | :--- | :--- | :--- |
| **Frontend path breakages** | Low | TypeScript compiler (`tsc --noEmit`) strictly checks 100% of imports at build time. Only 2 external consumers exist. | Negligible |
| **Backend test breakage via legacy imports** | Medium | Permanent compatibility shims in `schemas/phase*_output.py` preserve all existing import paths with identical class identity. | Negligible |
| **Naming collision between pipeline and domain** | Medium | Ratified Decision Q-BE-2 adopts `_output.py` suffix, completely preventing collision with `domain/screening.py` and `domain/validation.py`. | Zero |
| **Git merge conflicts** | Low | Isolated on `feature/010-tech-debt-ccds-001-phase-2`. Moving files via `git mv` preserves full commit history. | Low |

**Rollback Procedure**:
Because Phase 3 involves zero database mutations and zero state format alterations:
1. Reverting the Git working tree (`git restore .` and `git clean -fd`) immediately and cleanly restores the fully functional Phase 2 baseline (167 passing tests).
2. No database rollback scripts, schema patches, or data repairs are required.

---

## 10. Implementation Authorization & Human Acceptance Gate

```text
Phase 3 Read-Only Decision Pass:    COMPLETE (4 Architectural Questions Analyzed)
Phase 3 Human Ratification Gate:    COMPLETE (Q-FE-1: Option B, Q-BE-1: YES, Q-BE-2: Option B, Q-BE-3: schemas/pipeline/)
Phase 3 Implementation Execution:   COMPLETE (Namespace realignment, flat layout, gates direct import)
Phase 3 SDD Amendment 01:           RATIFIED (2026-09-06T19:06:03+08:00 — Shim contraction & semantic component names)
Automated Multi-Suite Verification: COMPLETE (179 passed pytest, tsc 0 errors, npm run build clean)
Human Leadership Acceptance:        🟢 ACCEPTED (2026-09-06T19:09:10+08:00)
Merge & Promotion Authorization:    🟢 AUTHORIZED FOR develop AND main
```

**Human Leadership Sign-off**:
- **Authorized By**: Human Leadership (Mark C. / Project Lead)
- **Acceptance Timestamp**: 2026-09-06T19:09:10+08:00
- **Governing Specification**: `specs/010-tech-debt-ccds-001/phase-3-sdd.md` as amended by `specs/010-tech-debt-ccds-001/phase-3-sdd-amendment-01.md`.
- **Verified Evidence**: 179/179 pytest passes, 0 TypeScript errors, 4/4 static Next.js production pages, 0 legacy shims, 0 `components/phases` references, 5,298 knowledge graph nodes.

