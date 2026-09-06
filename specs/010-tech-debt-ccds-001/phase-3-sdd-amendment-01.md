# SPEC-TECH-DEBT-CCDS-001 (Phase 3 Amendment 01)
## Legacy Backend Shim Contraction & Frontend Semantic Component Standardization

**Amendment ID:** `SPEC-TECH-DEBT-CCDS-001-PHASE-3-AMENDMENT-01`  
**Parent Specification:** `SPEC-TECH-DEBT-CCDS-001-PHASE-3` (`specs/010-tech-debt-ccds-001/phase-3-sdd.md`)  
**Classification:** Tier 2 Software Design Document (SDD) Amendment  
**Governing Standard:** CONVERA Concept Development Standard (CCDS v2.0) — *“Knowledge != Workflow”*  
**Parent Architectural Authority:** `TECH-DEBT-CCDS-001 — Architectural Decision Record v2.2`  
**Ratification Timestamp:** 2026-09-06T19:06:03+08:00  
**Ratified By:** Human Leadership (Mark C. / Project Lead)  
**Document Status:** 🟢 RATIFIED BY HUMAN LEADERSHIP  

---

### 1. Purpose & Scope of Amendment

This SDD Amendment formally incorporates two architectural scope enhancements into the ratified Phase 3 specification (`SPEC-TECH-DEBT-CCDS-001-PHASE-3`):

1. **Backend Legacy Shim Contraction**: Authorizes the immediate, permanent removal of transitional backward-compatibility shims (`backend/schemas/phase1_output.py` through `backend/schemas/phase5_output.py`), establishing `backend/schemas/pipeline/*_output.py` and `backend/schemas/domain/*` as the sole canonical schema entrypoints.
2. **Frontend Semantic Component Standardization**: Standardizes the Innovation Track workspace components from numeric identifiers (`Phase1View.tsx` .. `Phase5View.tsx`) to canonical semantic track names (`ProblemDiscoveryView.tsx`, `ProblemScreeningView.tsx`, `ProblemValidationView.tsx`, `SolutionConceptView.tsx`, `EconomicsTestingView.tsx`), updating the Innovation barrel and root consumer sites.

---

### 2. Architectural Rationale: Long-Term Platform Vision

This amendment directly aligns CONVERA’s physical code organization with its long-term architectural destination:

> **CONVERA Platform Thesis:**  
> CONVERA is designed as a **methodology-agnostic platform and runtime engine** capable of executing multiple distinct innovation and inquiry frameworks that conform to a common methodology contract.

Under this architecture, distinct methodologies define their own track-specific concerns:
* Stages and progression order
* Quality gates and evaluation rubrics
* State transitions and milestone criteria
* Output artifacts and structured deliverables
* Domain terminology and epistemic labels
* Methodology-specific workspace views and affordances

Meanwhile, the CONVERA core platform provides the shared infrastructure:
* Workflow execution runtime and transition validation (`WorkflowTransitionService`, `DecisionEngine`)
* Epistemic and domain primitives (Problems, Evidence, Assumptions, Hypotheses, Concepts, Experiments)
* Evidence-to-claim credibility scoring and verification structures
* Persistence mechanisms (SQLite relational tables, session state JSON envelopes)
* Global navigation, layout shell, and presentation conventions (CCDS Core Design System)

> **Methodology Contract Principle:**  
> Future methodology frameworks should conform to a stable CONVERA methodology contract rather than requiring methodology-specific modifications to the core workflow runtime.

#### Target Architectural Boundary
* Generic numbers (e.g. "Phase 1", "Phase 2") conflate track-specific stages with platform primitives.
* By renaming `Phase*View` to domain-specific workspace views (`ProblemDiscoveryView`, etc.) and moving pipeline containers to `schemas/pipeline/`, the Innovation Track is placed on symmetrical, peer standing with the Research Track (`ResearchWorkspaceView`, `GateReviewModal`, `CircumscriptionLoopView`).
* **Governance Boundary Enforcement:** This architectural direction is recorded as target/future direction only. **This amendment does NOT authorize generalized multi-methodology runtime abstractions, dynamic UI generators, or registry frameworks in Phase 3.**

---

### 3. Amended Technical Specifications

#### 3.1 Backend Legacy Shim Contraction
1. **Permanent File Deletion**:
   - `backend/schemas/phase1_output.py` [DELETED]
   - `backend/schemas/phase2_output.py` [DELETED]
   - `backend/schemas/phase3_output.py` [DELETED]
   - `backend/schemas/phase4_output.py` [DELETED]
   - `backend/schemas/phase5_output.py` [DELETED]
2. **Canonical Namespace Authority**:
   - `backend/schemas/pipeline/` is the sole canonical location for stage transport/output containers (`discovery_output.py`, `screening_output.py`, `validation_output.py`, `mechanism_output.py`, `economics_output.py`).
   - `backend/schemas/domain/` is the sole canonical location for pure domain entities and value objects.
   - `backend/schemas/__init__.py` re-exports both domain models and pipeline containers.
3. **Deprecation Window Closure**:
   - Legacy import paths `schemas.phase*_output` and `backend.schemas.phase*_output` are formally decommissioned.
   - Class identity and serialization invariance are strictly preserved via the canonical pipeline and domain imports.

#### 3.2 Frontend Semantic Component Standardization
1. **Canonical Component Renaming**:
   * `Phase1View.tsx` → `ProblemDiscoveryView.tsx` (Component: `ProblemDiscoveryView`)
   * `Phase2View.tsx` → `ProblemScreeningView.tsx` (Component: `ProblemScreeningView`)
   * `Phase3View.tsx` → `ProblemValidationView.tsx` (Component: `ProblemValidationView`)
   * `Phase4View.tsx` → `SolutionConceptView.tsx` (Component: `SolutionConceptView`)
   * `Phase5View.tsx` → `EconomicsTestingView.tsx` (Component: `EconomicsTestingView`)
2. **Innovation Barrel (`web/src/components/frameworks/innovation/index.ts`)**:
   - Exports all 5 canonical semantic view components and companion modals/grids.
3. **Transitional Aliases**:
   - Each view file retains `export const Phase*View = ...` and `export type Phase*ViewProps = ...` as non-canonical transitional affordances. They do not constitute the primary architectural naming contract.
4. **Consumer Alignment**:
   - `web/src/app/page.tsx` imports and renders canonical semantic views directly.

---

### 4. Explicit Governance Boundaries (What is NOT Authorized)

This amendment is strictly confined to namespace cleanup and component standardization. It explicitly **DOES NOT** authorize:
1. Generalized multi-methodology framework runtime implementations.
2. Methodology registry or plugin architecture redesign.
3. Dynamic UI component generation or schema-driven rendering.
4. New workflow abstractions, session data schema modifications, or transition rule redesign.
5. Database schema migrations (0 DDL statements across all 23 SQLite tables).
6. HTTP API endpoint modifications (all `/api/phases/*` routes remain unchanged).
7. AI prompt schema, LLM provider, or model configuration changes.
8. Epistemic logic changes, rubric threshold edits, or gate rule modifications.
9. Unrelated opportunistic refactoring.

---

### 5. Amended Verification Contract

The Phase 3 Verification Contract (SDD Section 7) is amended as follows:

| Test ID | Method / Assertion | Pass Criteria | Amended Rationale | Status |
| :--- | :--- | :--- | :--- | :--- |
| **P3-BE-1** | `pytest backend/tests/` | 100% pass (179+ tests green) | Full behavioral regression suite across all backend layers. | ✅ 179 passed |
| **P3-BE-2 (Amended)** | Zero Legacy Schema Files | `len(list(schemas_dir.glob("phase*_output.py"))) == 0` | Verifies full legacy shim contraction and clean namespace. | ✅ 0 files |
| **P3-BE-3 (Amended)** | Zero Legacy Consumer Imports | AST audit across `backend/` confirms 0 imports of `schemas.phase*_output` | Confirms all internal callers migrated to canonical namespaces. | ✅ 0 imports |
| **P3-BE-4** | Gates Canonical Import | AST inspection of `backend/gates/__init__.py:136` | Confirms direct import of `VALID_MECHANISM_FAMILIES` from `schemas.domain.concept`. | ✅ Direct import |
| **P3-BE-5** | Pipeline AST Dependency Direction | AST inspection of `schemas/pipeline/*.py` | Pipeline containers depend only on `schemas/domain/`, pydantic, standard library. | ✅ 0 circular/illegal |
| **P3-BE-6** | Canonical Pipeline Serialization | Pydantic validation & `model_dump()` | Proves pipeline container roundtrip serialization and property invariance. | ✅ Validated |
| **P3-FE-1** | `cd web && npx tsc --noEmit` | Exit code 0, 0 type errors | Verifies all TypeScript type bindings and imports resolve cleanly. | ✅ 0 errors |
| **P3-FE-2** | `cd web && npm run build` | Exit code 0, 4/4 static pages | Confirms Next.js production bundle compilation succeeds. | ✅ 4/4 static pages |
| **P3-FE-3** | `grep -rn "@/components/phases" web/src/` | Exactly 0 matches found | Confirms complete removal of legacy phases directory. | ✅ 0 matches |
| **P3-FE-4 (Amended)** | Canonical Semantic Component Imports | `page.tsx` imports canonical `Problem*View`, `SolutionConceptView`, `EconomicsTestingView` | Confirms root consumer uses canonical CCDS naming. | ✅ Verified |
| **P3-FE-5** | Direct Component Resolution | `PresentationModal.tsx` imports `ScreeningScorecardGrid` | Verifies flat layout direct component imports. | ✅ Verified |
| **P3-ARCH-1** | `graphify update .` | AST knowledge graph exits 0 | AST knowledge graph updated and synchronized. | ✅ Rebuilt 5298 nodes |
| **P3-INV-1** | Invariant Audit | 0 DB migrations, 0 state drift, 0 route changes, 0 prompt changes | Non-negotiable architectural invariant verification. | ✅ Verified |
