# CONVERA SDD-016: Quality Assurance & Verification Checklist
# Structured Ideation & 4 DSR Artifact Formulation Engine

**Specification ID**: CONVERA-SDD-016  
**Classification**: Quality Assurance, Verification & Invariant Enforcement  
**Authority Tier**: Tier 2 (Engineering Checklist)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/016-dsr-artifact-ideation`  
**Target Integration Branch**: `develop`  

---

## 1. Specification Compliance Checklist

- [ ] **CHK-016-01**: SQLite WAL table `dsr_artifacts` created with foreign key to `problems(id)`, class checks (`CONSTRUCT`, `MODEL`, `METHOD`, `INSTANTIATION`), and status checks.
- [ ] **CHK-016-02**: `backend/storage/sqlite_adapter.py` implements complete parameterized CRUD for `dsr_artifacts` with JSON array serialization.
- [ ] **CHK-016-03**: `IdeationEngine.generate_dsr_candidates()` generates structured artifacts strictly mapped to the 4 DSR classes.
- [ ] **CHK-016-04**: Generated artifacts include explicit `kernel_theory` attribution (Walls et al., Gregor & Jones).
- [ ] **CHK-016-05**: Generated artifacts include audited `simpler_baseline_alternative` adhering to Epistemic Rules 5 & 6.
- [ ] **CHK-016-06**: `backend/routers/ideation.py` exposes `/generate`, `/problem/{problem_id}/artifacts`, and CRUD endpoints with validation.
- [ ] **CHK-016-07**: `ResearchOrchestrator` recommends `FORMULATE_DSR_ARTIFACT` when session is at `stage_d_formulation` with 0 selected artifacts.
- [ ] **CHK-016-08**: `web/src/services/ideationService.ts` implements typed client methods for candidate generation, retrieval, and status mutation.
- [ ] **CHK-016-09**: `web/src/components/research/DSRArtifactCanvas.tsx` displays the 4-Quadrant DSR Matrix with interactive abductive generation, specification drawer, and selection actions.
- [ ] **CHK-016-10**: Phase D of `ResearchWorkspaceView.tsx` renders `DSRArtifactCanvas` when `currentPhaseId === "D"`.

---

## 2. CCDS v2.0 Design Tokens & UX Standards Checklist

- [ ] **DES-016-01**: 4-Quadrant Matrix adheres to obsidian dark mode (`bg-slate-950`, `bg-slate-900`, `border-slate-800`).
- [ ] **DES-016-02**: Distinct semantic colors for DSR classes: Construct (Indigo), Model (Cyan), Method (Emerald), Instantiation (Amber).
- [ ] **DES-016-03**: Action buttons enforce `whitespace-nowrap inline-flex items-center justify-center gap-1.5` with standard icons.
- [ ] **DES-016-04**: Loading states render subtle pulse or spin animations during generation.
- [ ] **DES-016-05**: Expandable formal specification accordion provides code/equation formatting in monospace font.

---

## 3. Invariant & Governance Safety Checklist

- [ ] **INV-016-01 (Article VII Anti-Creep Law)**: Zero new third-party dependencies added to `backend/pyproject.toml` or `web/package.json`.
- [ ] **INV-016-02 (Article II Tri-Part Confidence)**: Artifact novelty and feasibility scores are strictly decoupled from AI linguistic confidence.
- [ ] **INV-016-03 (Article IV Human Sovereignty)**: Generated artifacts default to `PROPOSED`; human researcher selection or manual creation is strictly required before locking as primary thesis artifact.
- [ ] **INV-016-04 (Rule 5 & Rule 6 Compliance)**: Every candidate formulation specifies an audited simpler baseline alternative and justifies novelty in the computational mechanism rather than buzzwords.

---

## 4. Conformance & Build Acceptance Checklist

- [ ] **CONF-016-01**: Comprehensive pytest suite (`backend/tests/test_dsr_artifact_ideation.py`) passes with 100% assertions.
- [ ] **CONF-016-02**: Full offline regression test suite (`pytest backend/tests -m "not live"`) passes (>= 283 tests).
- [ ] **CONF-016-03**: Frontend TypeScript check (`npm run typecheck --prefix web`) passes with 0 errors.
- [ ] **CONF-016-04**: Next.js production build (`npm run build --prefix web`) succeeds with 0 compile errors.
- [ ] **CONF-016-05**: Codebase knowledge graph synchronized via `graphify update .`.
