# SPEC-TECH-DEBT-CCDS-001 (Phase 2): Domain Extraction & Schema Decoupling

**Document ID**: `SPEC-TECH-DEBT-CCDS-001-PHASE-2`  
**Classification**: Tier 2 Software Design Document (SDD)  
**Governing Standard**: CONVERA Concept Development Standard (CCDS v2.0) — *“Knowledge != Workflow”*  
**Parent Architectural Authority**: `TECH-DEBT-CCDS-001 — Architectural Decision Record v2.2` (Ratified 2026-09-06)  
**Upstream Authority**: Architectural Decision Pass on Q1–Q4 (Ratified 2026-09-06)  
**Document Status**: 🟡 PRECISION REVISED — PENDING HUMAN RATIFICATION & IMPLEMENTATION AUTHORIZATION  
**Dedicated Working Branch**: `feature/010-tech-debt-ccds-001-phase-2`  
**Target Branch**: `feature/010-tech-debt-ccds-001-phase-2`  
**Canonical Spec Path**: `specs/010-tech-debt-ccds-001/phase-2-sdd.md`  

---

## 1. Architectural Boundary & Core Philosophy

The foundational principle of CCDS v2.0 is:
> **“Domain state answers ‘what is known?’, while workflow state answers ‘what has happened / what may happen next?’”**

This establishes an immutable, unidirectional dependency chain:

```text
┌─────────────────────────────────────────────────────────┐
│                         DOMAIN                          │
│  Pure business knowledge, entities, value objects,      │
│  domain vocabulary, and intrinsic derived values        │
│  (Zero workflow awareness, zero service imports)        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION POLICY                    │
│  Business rules, eligibility criteria, screening       │
│  evaluations, gate readiness calculators                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  WORKFLOW TRANSITIONS                   │
│  Stage progression, stage_progress, gate status,        │
│  session lifecycle mutations, pivot loops               │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                           UI                            │
│  React workspace views, cards, badges, indicators       │
└─────────────────────────────────────────────────────────┘
```

Phase 2 operationalizes this boundary by extracting core domain entities currently embedded inside pipeline output models (`backend/schemas/phase*_output.py`) into dedicated domain modules under `backend/schemas/domain/`.

---

## 2. Ratified Architectural Inputs (Q1–Q4 Decisions)

The following architectural decisions were established by the empirical decision pass, ratified by Human Leadership, and refined in the Precision Pass:

| Question | Architectural Decision | Ratified Resolution & Precision Guidance |
| :--- | :--- | :--- |
| **Q1 — `eligible_for_phase2` & `phase2_eligible`** | **Option A: Complete Removal** | Removed entirely from `DiscoveredProblem` **and** removed from `Phase1Output`. Pipeline schemas must not leak or embed application policy. Eligibility is evaluated exclusively at the application layer via `ProblemEligibilityService`. Domain entities must NOT import or call this service. |
| **Q2 — `ConceptScreeningScore.verdict`** | **Option C: Separate Domain from Policy** | `ConceptScreeningScore` retains 6 numeric ratings and intrinsic quality checks (`total_score`, `has_fatal_flaw`). Routing verdicts (`ADVANCE_TO_HYPOTHESIS`, `REVISE`, `DROP`) belong to application/pipeline evaluation. `CONCEPT_VERDICT` is an application type and is kept OUT of `schemas/domain/`. No standalone `ConceptScreeningPolicy` service is created without a concrete consumer. |
| **Q3 — `DecisionRecord` / `PivotRecord`** | **Deferred** | `PivotRecord` does not exist and will NOT be created. `DecisionRecord` is an existing SQLite storage table (`sqlite_adapter.py:397`) and is deferred from Phase 2 domain extraction to avoid out-of-scope storage refactoring. |
| **Q4 — `Assumption.priority`** | **Option A: Domain-Derived Value** | Retained as an intrinsic domain property. The 2×2 epistemic risk calculation (Importance × Uncertainty → P1–P4) requires no external state and is intrinsic to an assumption. Gate rules requiring cards for P1 are application-layer policies. |

---

## 3. Explicit 4-Tier Scope Classification

To ensure architectural precision and avoid a mechanical “move everything out of phase files” approach, every artifact in `backend/schemas/` is explicitly classified into one of four architectural categories:

```text
1. Domain Entities & Value Objects (11 Verified Models)
   └── schemas/domain/
2. Domain Vocabulary & Types (Genuinely Domain-Owned Constants/Enums)
   └── schemas/domain/
3. Application & Workflow Types (Routing verdicts, gate dispositions)
   └── Outside schemas/domain/ (e.g. schemas/phase*_output.py, services/)
4. Pipeline Containers (Transport/batch DTOs)
   └── schemas/phase*_output.py
```

### 3.1 Tier 1: 11 Verified Live Domain Models

| Model Name | Current Location | Model Archetype | Target Location | Migration Invariants |
| :--- | :--- | :--- | :--- | :--- |
| `EvidenceSource` | `phase1_output.py:21` | Value Object | `schemas/domain/problem.py` | Represents citation/source metadata. Pure domain data. |
| `DiscoveredProblem` | `phase1_output.py:30` | Entity | `schemas/domain/problem.py` | Core problem representation. **`eligible_for_phase2` completely removed**. |
| `ScreeningResult` | `phase2_output.py:6` | Evaluation Value Object | `schemas/domain/screening.py` | Multi-dimensional problem score (1–5). Retains scores, labels, red flags. |
| `EvidenceConfidence` | `phase3_output.py:6` | Scorecard Value Object | `schemas/domain/validation.py` | Epistemic scorecard measuring user evidence (0–24). Retains `total`. |
| `ProblemAttractiveness`| `phase3_output.py:24`| Scorecard Value Object | `schemas/domain/validation.py` | Scorecard measuring problem severity (0–20). Retains `total`. |
| `ConceptScreeningScore`| `phase4_output.py:28`| Scorecard Value Object | `schemas/domain/concept.py` | 6-dimension concept score (1–3). Retains derived `has_fatal_flaw` & `total_score`. |
| `SolutionConcept` | `phase4_output.py:48`| Entity | `schemas/domain/concept.py` | Concept entity targeting causal link. |
| `Assumption` | `phase4_output.py:67`| Entity | `schemas/domain/concept.py` | Epistemic assumption. Retains intrinsic `priority` (P1–P4). |
| `ExperimentCard` | `phase4_output.py:93`| Entity | `schemas/domain/concept.py` | Test specification card testing an assumption. |
| `ExperimentAuditResult`| `phase5_output.py:28`| Evaluation Value Object | `schemas/domain/experiment.py` | Audited empirical metrics from an executed experiment. |
| `PivotAnalysis` | `phase5_output.py:44`| Evaluation Value Object | `schemas/domain/experiment.py` | Diagnostic evaluation of experiment failure locus and pivot direction. |

### 3.2 Tier 2: Domain Vocabulary & Types (Extracted to Domain)

These types and constants represent genuine domain concepts, vocabularies, and classification taxonomies independent of workflow progression:

| Symbol Name | Type Archetype | Target Location | Description |
| :--- | :--- | :--- | :--- |
| `EvidenceTier` | Type Literal | `schemas/domain/problem.py` | Epistemic tiers (`STRONGLY_DOCUMENTED`, `DOCUMENTED`, etc.). |
| `SourceTier` | Type Literal | `schemas/domain/problem.py` | Source tiers (`TIER_1_PRIMARY`, `TIER_2_OFFICIAL`, etc.). |
| `SECTORS` | List Constant | `schemas/domain/problem.py` | Iloilo sector taxonomy (Agriculture, Healthcare, etc.). |
| `VALID_MECHANISM_FAMILIES` | Set Constant | `schemas/domain/concept.py` | 15 mechanism families (Prevention, Coordination, Automation, etc.). |
| `ASSUMPTION_TYPES` | Type Literal | `schemas/domain/concept.py` | 5 assumption dimensions (`Desirability`, `Feasibility`, etc.). |
| `CommitmentTier` | Type Literal | `schemas/domain/experiment.py` | 5 commitment tiers (`TIER_1_FINANCIAL` to `TIER_5_POLITE_INTEREST`). |
| `TestArchetype` | Type Literal | `schemas/domain/experiment.py` | 6 test archetypes (`CONCIERGE_MVP`, `WIZARD_OF_OZ`, etc.). |
| `PassFailStatus` | Type Literal | `schemas/domain/experiment.py` | Empirical status (`PASS`, `FAIL`, `INCONCLUSIVE`). |

### 3.3 Tier 3: Application & Workflow Policy Types (Kept OUT of `schemas/domain/`)

These types represent routing verdicts and methodology gate dispositions. In accordance with CCDS boundary rules, they **MUST NOT** be placed into `schemas/domain/`:

| Symbol Name | Layer / Location | Reason for Exclusion from Domain |
| :--- | :--- | :--- |
| `CONCEPT_VERDICT` | `schemas/phase4_output.py` | Represents workflow routing (`ADVANCE_TO_HYPOTHESIS`, `REVISE`, `DROP`). |
| `PHASE4_VERDICT` | `schemas/phase4_output.py` | Represents phase gate outcome (`READY_TO_TEST`, `RE_IDEATE`, `RETURN_TO_PROBLEM`). |
| `Phase5Verdict` | `schemas/phase5_output.py` | Represents project milestone directive (`PURSUE`, `PIVOT`, `RETIRE_CONCEPT`). |
| `GateStatus` | `services/workflow_transition_service.py` | Represents methodology gate transition status (`PASSED`, `BLOCKED`, `PENDING`). |

### 3.4 Tier 4: Pipeline Containers (Kept in `schemas/phase*_output.py`)

These schemas compose domain models to represent the batch output of an LLM pipeline phase:
* `Phase1Output` (composes `DiscoveredProblem`)
* `Phase2Output` (composes `ScreeningResult`)
* `Phase3Output` (composes `EvidenceConfidence`, `ProblemAttractiveness`)
* `Phase4Output` (composes `SolutionConcept`, `Assumption`, `ExperimentCard`)
* `Phase5Output` (composes `ExperimentAuditResult`, `PivotAnalysis`)

### 3.5 Status of Speculative Models
The following 6 models appeared in exploratory discussions but **do not exist** in the active codebase:
`FalsificationCriterion`, `HypothesisCard`, `MarketValidationScore`, `InterviewLog`, `SegmentSignal`, `ValidationScorecard`.
**Rule**: These models will **NOT** be created in Phase 2.

---

## 4. File Structure & Target Topology

```text
backend/schemas/
├── __init__.py                  # Backward-compatible re-exports of all models
├── domain/                      # NEW: Extracted domain models & vocabulary
│   ├── __init__.py              # Re-exports all 11 domain models & domain types
│   ├── problem.py               # DiscoveredProblem, EvidenceSource, EvidenceTier, SourceTier, SECTORS
│   ├── screening.py             # ScreeningResult
│   ├── validation.py            # EvidenceConfidence, ProblemAttractiveness
│   ├── concept.py               # ConceptScreeningScore, SolutionConcept, Assumption, ExperimentCard, VALID_MECHANISM_FAMILIES, ASSUMPTION_TYPES
│   └── experiment.py            # ExperimentAuditResult, PivotAnalysis, CommitmentTier, TestArchetype, PassFailStatus
├── phase1_output.py             # Pipeline output schema (imports from domain.problem)
├── phase2_output.py             # Pipeline output schema (imports from domain.screening)
├── phase3_output.py             # Pipeline output schema (imports from domain.validation)
├── phase4_output.py             # Pipeline output schema (imports from domain.concept; retains CONCEPT_VERDICT)
└── phase5_output.py             # Pipeline output schema (imports from domain.experiment; retains Phase5Verdict)
```

---

## 5. Import-Direction & Architectural Enforcement Rules

```text
ALLOWED:
  domain → domain (sibling modules)
  domain → standard library (typing, uuid, datetime, re)
  domain → pydantic (BaseModel, Field, model_validator, computed_field)
  phase*_output → domain
  services → domain
  routers/engines → services, phase*_output, domain

FORBIDDEN:
  domain ✕ phase*_output
  domain ✕ services
  domain ✕ routers
  domain ✕ engines
  domain ✕ storage
  phase*_output ✕ services (Pipeline schemas must not import application services)
```

### Automated Enforcement:
An AST dependency linter test in `backend/tests/test_domain_schemas.py` will inspect all files in `backend/schemas/domain/` and `backend/schemas/phase*_output.py` to ensure no illegal imports occur.

---

## 6. Treatment of Specific Models & Services

### 6.1 `DiscoveredProblem`, `Phase1Output`, and `ProblemEligibilityService`
* **Removal from Domain Entity**: `@property def eligible_for_phase2` is deleted from `DiscoveredProblem`.
* **Removal from Pipeline Schema**: `@property def phase2_eligible` is **completely removed** from `Phase1Output`.
  * *Consumer Audit Evidence*: Live tracing confirmed 0 callers in `routers/`, `engines/`, `storage/`, `main.py`, `backend/tests/`, and `web/`.
  * *`landscape_summary()` Audit Evidence*: Tracing confirmed `landscape_summary()` has 0 callers across the entire codebase. It is updated to summarize problem counts by evidence tier without referencing `phase2_eligible`, preserving formatting capability without leaking application policy into the schema.
* **New Application Service**:
  ```python
  # backend/services/problem_eligibility_service.py
  from typing import Sequence
  from schemas.domain.problem import DiscoveredProblem

  class ProblemEligibilityService:
      ELIGIBLE_TIERS: set[str] = {"DOCUMENTED", "STRONGLY_DOCUMENTED", "DOCUMENTED_PRIMARY_ONLY"}

      @classmethod
      def is_eligible_for_phase2(cls, problem: DiscoveredProblem) -> bool:
          return problem.evidence_tier in cls.ELIGIBLE_TIERS

      @classmethod
      def filter_phase2_eligible(cls, problems: Sequence[DiscoveredProblem]) -> list[DiscoveredProblem]:
          return [p for p in problems if cls.is_eligible_for_phase2(p)]
  ```

### 6.2 `ConceptScreeningScore` & Verdict Separation
* **In Domain Model (`schemas/domain/concept.py`)**:
  `ConceptScreeningScore` holds the 6 integer scores (1–3). It provides domain-derived predicates:
  ```python
  @computed_field
  @property
  def total_score(self) -> int:
      return (self.problem_fit + self.user_desirability + self.advantage_over_status_quo +
              self.feasibility + self.viability + self.evidence_testability)

  @computed_field
  @property
  def has_fatal_flaw(self) -> bool:
      return self.problem_fit == 1 or (self.feasibility == 1 and self.viability == 1)
  ```
* **In Application / Phase Schema (`schemas/phase4_output.py`)**:
  `CONCEPT_VERDICT` is retained in `phase4_output.py`.
  `Phase4Output.advance_concepts` applies the threshold logic directly on the screening scores without leaking the routing verdict into the domain model.
  *No standalone `ConceptScreeningPolicy` service is created in Phase 2*, as there is no external consumer requiring it.

### 6.3 `Assumption.priority`
* **In Domain Model (`schemas/domain/concept.py`)**:
  Retains the `@computed_field @property def priority(self) -> int:` calculation mapping `(importance, uncertainty)` to `P1..P4`. This is recognized as an intrinsic epistemic risk classification.

---

## 7. Migration Sequence: Expand → Migrate → Contract

```text
STEP 1: EXPAND
├── 1.1 Create backend/schemas/domain/ package
├── 1.2 Implement schemas/domain/problem.py (DiscoveredProblem without eligible_for_phase2, EvidenceSource, types)
├── 1.3 Implement schemas/domain/screening.py (ScreeningResult)
├── 1.4 Implement schemas/domain/validation.py (EvidenceConfidence, ProblemAttractiveness)
├── 1.5 Implement schemas/domain/concept.py (ConceptScreeningScore, SolutionConcept, Assumption, ExperimentCard)
├── 1.6 Implement schemas/domain/experiment.py (ExperimentAuditResult, PivotAnalysis, types)
├── 1.7 Implement schemas/domain/__init__.py (Re-export 11 domain models & domain vocabulary)
├── 1.8 Implement backend/services/problem_eligibility_service.py
└── 1.9 Add test_domain_schemas.py test suite covering domain models & eligibility service

STEP 2: MIGRATE
├── 2.1 Update schemas/phase1_output.py (Import domain models; remove phase2_eligible; update landscape_summary)
├── 2.2 Update schemas/phase2_output.py (Import ScreeningResult; re-export for compatibility)
├── 2.3 Update schemas/phase3_output.py (Import scorecards; re-export for compatibility)
├── 2.4 Update schemas/phase4_output.py (Import concept models; retain CONCEPT_VERDICT; re-export for compatibility)
├── 2.5 Update schemas/phase5_output.py (Import experiment models; re-export for compatibility)
├── 2.6 Update schemas/__init__.py (Re-export all domain models & phase schemas)
└── 2.7 Verify existing test suite passes without modification

STEP 3: CONTRACT
├── 3.1 Verify exact class identity: LegacyImport is DomainClass across all 11 models
├── 3.2 Run Q1 regression: assert not hasattr(DiscoveredProblem, "eligible_for_phase2")
├── 3.3 Run Q2 regression: assert Phase 4 concept advance logic behaves identically
├── 3.4 Run AST dependency-direction audit
└── 3.5 Run full backend regression (158/158 pytest) and TypeScript check (0 errors)
```

---

## 8. Hardened Verification & Compatibility Test Plan

Implementation verification will be codified in `backend/tests/test_domain_schemas.py` and executed against the full system:

### Suite A: Class Identity & Compatibility Shims
For every one of the 11 migrated models, assert exact Python class identity:
```python
from schemas.phase1_output import DiscoveredProblem as LegacyDiscoveredProblem
from schemas.domain.problem import DiscoveredProblem as DomainDiscoveredProblem
assert LegacyDiscoveredProblem is DomainDiscoveredProblem

from schemas.phase4_output import Assumption as LegacyAssumption
from schemas.domain.concept import Assumption as DomainAssumption
assert LegacyAssumption is DomainAssumption
```

### Suite B: Validation & Serialization Invariance
* Instantiate each domain model with valid and invalid payloads.
* Assert identical validation errors (`ValidationError`) on constraint breaches.
* Assert that `model_dump()` and `model_dump_json()` outputs match expected JSON representations exactly.
* Assert computed properties (`Assumption.priority`, `EvidenceConfidence.total`, `ProblemAttractiveness.total`) produce identical values.

### Suite C: Q1 & Q2 Specific Regressions
* **Q1 Regression**:
  ```python
  prob = DiscoveredProblem(...)
  assert not hasattr(prob, "eligible_for_phase2")
  assert not hasattr(Phase1Output, "phase2_eligible")
  # Verify ProblemEligibilityService works correctly
  assert ProblemEligibilityService.is_eligible_for_phase2(prob_strongly_documented) is True
  assert ProblemEligibilityService.is_eligible_for_phase2(prob_signal) is False
  ```
* **Q2 Regression**:
  ```python
  # Verify Phase 4 advance_concepts yields identical results after score decoupling
  phase4 = Phase4Output(...)
  assert [c.label for c in phase4.advance_concepts] == expected_advanced_labels
  ```

### Suite D: Architectural Dependency Direction AST Linter
* Parse AST of all files in `backend/schemas/domain/`.
* Assert 0 imports containing: `schemas.phase`, `routers`, `engines`, `storage`, or `services`.
* Parse AST of `backend/schemas/phase*_output.py`.
* Assert 0 imports containing `services` (no pipeline schema imports application services).

### Suite E: System Regression
* `pytest backend/tests/` (Must maintain 158/158 passing tests).
* `cd web && npx tsc --noEmit` (Must maintain 0 TypeScript errors).

---

## 9. Non-Goals & Invariant Boundaries

The following operations are strictly **PROHIBITED** during Phase 2:
1. **Zero Database Schema Changes**: No `ALTER TABLE`, `CREATE TABLE`, or DDL modifications across all 23 SQLite tables.
2. **Zero API Changes**: Zero modifications to HTTP endpoint paths, request bodies, or response schemas.
3. **Zero Workflow State Changes**: Zero modifications to `state_data`, `stage_progress`, or legacy migration logic.
4. **Zero AI/LLM Changes**: Prompts, system instructions, and LLM call protocols remain untouched.
5. **Zero Speculative Entities**: No creation of `DecisionRecord`, `PivotRecord`, `FalsificationCriterion`, etc.
6. **Zero Frontend Changes**: No edits to Next.js components or TypeScript definitions.

---

## 10. Rollback Strategy

Because Phase 2 introduces pure schema restructuring with zero database migrations:
1. **Dedicated Feature Branch**: All work is isolated on `feature/010-tech-debt-ccds-001-phase-2`.
2. **Atomic Reversion**: Reverting the feature branch or git commit cleanly and instantaneously restores the pre-Phase 2 state without any data repair.
3. **Shim Safety**: Legacy module paths in `schemas/` remain intact via re-exports throughout execution.

---

## 11. Governance Gate & Implementation Authorization

```text
Current State:
  Architectural Decision Pass: COMPLETE (Q1–Q4 Resolved & Ratified)
  Phase 2 SDD Drafting:        COMPLETE
  SDD Precision Revision:      COMPLETE (Incorporates user feedback 1–10)
  Implementation Gate:         🟡 PENDING HUMAN RATIFICATION & AUTHORIZATION
```

**Implementation authorization is withheld until explicit human sign-off on this revised SDD.**
