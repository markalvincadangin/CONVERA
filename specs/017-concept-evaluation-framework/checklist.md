# CONVERA SDD-017: Quality Assurance & Verification Checklist
# Concept Evaluation Framework (Stage E Multi-Criteria Rigor Assessment)

**Specification ID**: CONVERA-SDD-017  
**Classification**: Quality Assurance, Verification & Invariant Enforcement  
**Authority Tier**: Tier 2 (Engineering Checklist)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/017-concept-evaluation-framework`  
**Target Integration Branch**: `develop`  

---

## 1. Specification Compliance Checklist

- [ ] **CHK-017-01**: SQLite WAL table `concept_evaluations` (Table 34) created with foreign keys to `dsr_artifacts(id)` and `sessions(session_id)`.
- [ ] **CHK-017-02**: `backend/storage/sqlite_adapter.py` implements complete parameterized CRUD for `concept_evaluations` with JSON serialization.
- [ ] **CHK-017-03**: `ConceptEvaluationEngine` calculates deterministic scores across all 7 canonical dimensions: problem relevance, evidence grounding, gap validity, stakeholder impact, technical feasibility, novelty contribution, methodology fit.
- [ ] **CHK-017-04**: Inverted AI synthesis generates grounded strengths, vulnerabilities, and an actionable empirical falsification advisory without modifying deterministic scores.
- [ ] **CHK-017-05**: Deterministic total ordering and tie-breaking implemented for multi-candidate concept comparison.
- [ ] **CHK-017-06**: `backend/routers/evaluations.py` exposes evaluation, comparison, history, and human review endpoints with full Pydantic v2 validation.
- [ ] **CHK-017-07**: `ResearchOrchestrator` handles `ActionType.EVALUATE_CONCEPT` in `dispatch_action()` and logs audit events to `orchestration_events`.
- [ ] **CHK-017-08**: `web/src/services/evaluationService.ts` implements typed client methods for single evaluation, comparison, and human expert reviews.
- [ ] **CHK-017-09**: `web/src/components/research/evaluation/ConceptEvaluationCard.tsx` renders 7-dimension progress bars, recommendation pill, strengths/vulnerabilities, and falsification advisory alert.
- [ ] **CHK-017-10**: `web/src/components/research/evaluation/ConceptComparisonGrid.tsx` displays side-by-side trade-off matrix across DSR artifact candidates.
- [ ] **CHK-017-11**: Stage E of `ResearchWorkspaceView.tsx` renders evaluation cards and comparison matrix when `currentPhaseId === "E"`.

---

## 2. CCDS v2.0 Design Tokens & UX Standards Checklist

- [ ] **DES-017-01**: Dark obsidian color palette (`bg-slate-950`, `bg-slate-900`, `border-slate-800/80`).
- [ ] **DES-017-02**: Clear visual indicator for recommendation tiers: Recommended (Emerald), Viable with Refinement (Cyan/Blue), High Risk (Amber), Reject (Rose).
- [ ] **DES-017-03**: Interactive dimension breakdown with color-coded meters and tooltip explanations for the 7 criteria.
- [ ] **DES-017-04**: Falsification Advisory alert card formatted with distinct amber/crimson callout styling.
- [ ] **DES-017-05**: Human review drawer/modal allows input of expert adjustments and notes with clean feedback toasts.

---

## 3. Invariant & Governance Safety Checklist

- [ ] **INV-017-01 (Article VII Anti-Creep Law)**: Strictly zero new third-party dependencies added to `backend/pyproject.toml` or `web/package.json`.
- [ ] **INV-017-02 (Article II Tri-Part Confidence)**: Multi-criteria composite score is purely deterministic; AI commentary is strictly advisory.
- [ ] **INV-017-03 (Article IV Human Sovereignty)**: Stage Gate 3 clearance and primary thesis selection require explicit human researcher confirmation.
- [ ] **INV-017-04 (Article VIII Degraded Resilience)**: Deterministic evaluation functions offline without external network or LLM availability (`is_degraded = True`).
- [ ] **INV-017-05 (Immutable Evaluation History)**: Every evaluation run is appended to SQLite with an immutable timestamp and unique ID.

---

## 4. Conformance & Build Acceptance Checklist

- [ ] **CONF-017-01**: Dedicated test suite (`backend/tests/test_concept_evaluation.py`) passes with 100% assertions.
- [ ] **CONF-017-02**: Full backend regression suite (`pytest backend/tests -m "not live"`) passes (290+ tests passing, 0 failing).
- [ ] **CONF-017-03**: Frontend TypeScript check (`npm run typecheck --prefix web`) passes with 0 errors.
- [ ] **CONF-017-04**: Next.js production build (`npm run build --prefix web`) succeeds with 0 compile errors.
- [ ] **CONF-017-05**: Knowledge graph synchronized via `graphify update .`.
