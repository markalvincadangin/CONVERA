# CONVERA SDD-017: Concept Evaluation Framework
# System Design Document & Functional Specification

**Specification ID**: CONVERA-SDD-017  
**Classification**: Research Track Core Intelligence (Stage E Concept & Artifact Evaluation)  
**Authority Tier**: Tier 2 (Technical Specification & Design Contract)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/017-concept-evaluation-framework`  
**Target Integration Branch**: `develop`  
**Governing Standard**: CONVERA Core Design System (CCDS v2.0), Computing Research Concept Development Framework (§3.12), Prat et al. (2015), Venable et al. (2016)  
**Constitutional Articles**: Article I (Grounded Epistemology), Article II (Tri-Part Confidence), Article IV (Human Sovereignty), Article VII (Anti-Creep Law), Article VIII (Degraded Resilience)  

---

## 1. Context, Motivation & Problem Statement

### 1.1 Context
In the computing research lifecycle governed by the Design Science Research (DSR) paradigm (Hevner et al., 2004; Prat et al., 2015; Venable et al., 2016), research progresses from:
1. **Stage A**: Domain Scouting & Problem Formulation.
2. **Stage B**: Academic Grounding & Dual-Literature Retrieval (Gate 1).
3. **Stage C**: Opportunity Framing & Literature Gap Synthesis (Gate 2).
4. **Stage D**: Artifact Formulation & Design Synthesis (SDD-016).
5. **Stage E**: **Controlled Evaluation & Multi-Criteria Rigor Assessment (Gate 3)**.
6. **Stage F**: Feasibility, Ethics & Defense Readiness (Gate 4).

Through **CONVERA-SDD-016**, the system introduced the **Structured Ideation & 4 DSR Artifact Formulation Engine**, allowing researchers to generate, persist, and refine candidate artifacts across four March & Smith (1995) classes (`CONSTRUCT`, `MODEL`, `METHOD`, `INSTANTIATION`) with kernel theory grounding.

### 1.2 The Problem
Currently, **Stage E** in CONVERA lacks an objective, auditable framework for evaluating and comparing these candidate concepts:
1. **Subjective or Opaque Assessment**: Researchers choose solution directions based on subjective intuition, technological infatuation (e.g. "let's use deep learning/LLMs because it's trendy"), or opaque single-number AI scores that cannot be audited or explained.
2. **Missing Multi-Criteria Rigor Model**: Unlike problem ranking (handled by `DecisionEngine` for 2–4 problems in Phase 3), CONVERA has no multi-criteria evaluation model tailored to **solution artifacts**, assessing technical feasibility, research gap validity, stakeholder impact, novelty, and empirical falsifiability.
3. **Absence of Evaluation Persistence & Auditability**: There is no relational storage (`concept_evaluations`) tracking evaluation rubrics, dimension breakdowns, detected vulnerabilities, falsification tests, and human researcher overrides (violating Article IV Human Sovereignty and Article II Tri-Part Confidence).

---

## 2. Core Epistemic Foundations

### 2.1 The Seven Canonical Evaluation Dimensions (Prat et al., 2015; Venable et al., 2016)
Every candidate concept or DSR artifact is evaluated across seven transparent, mathematically weighted dimensions ($W = \{w_1, \dots, w_7\}$ where $\sum w_i = 1.0$):

1. **`problem_relevance` ($w_1 = 0.20$)**:
   - Degree of direct alignment with the validated problem friction, sufferer context, and active workarounds.
   - Evaluates whether the concept solves the root cause or merely treats superficial symptoms.
2. **`evidence_grounding` ($w_2 = 0.15$)**:
   - Volume, quality, and relevance of attached academic literature, empirical datasets, and domain benchmarks.
   - Grounded in SQLite FTS5 index and live connectors (OpenAlex, Semantic Scholar).
3. **`gap_validity` ($w_3 = 0.15$)**:
   - Authenticity and precision of the targeted scientific/technological gap.
   - Verifies whether the proposed artifact actually fills an unaddressed literature delta rather than re-implementing solved baselines.
4. **`stakeholder_impact` ($w_4 = 0.15$)**:
   - Feasibility of real-world adoption by target beneficiaries given institutional, economic, and behavioral constraints.
5. **`technical_feasibility` ($w_5 = 0.15$)**:
   - Computational mechanism plausibility, algorithmic complexity, architectural soundness, and resource boundedness.
6. **`novelty_contribution` ($w_6 = 0.10$)**:
   - Genuine design science knowledge contribution (new construct, model, method, or instantiation).
   - Enforces Epistemic Rules 5 & 6 (audited simpler baseline and computational mechanism justification).
7. **`methodology_fit` ($w_7 = 0.10$)**:
   - Measurability, benchmark availability, and clear empirical falsification criteria (FEDS framework, Venable et al., 2016).

### 2.2 Inverted Architecture & Tri-Part Confidence
In strict compliance with **CONVERA Constitution Article II**:
- The composite score ($S = \sum w_i \cdot d_i$) is computed **purely deterministically** on a 0.0 to 100.0 scale.
- Qualitative critique, strengths, vulnerabilities, and falsification advisory are synthesized by the LLM Gateway as **advisory commentary only**.
- The deterministic math and rank ordering are immutable invariants; the LLM cannot manipulate the mathematical composite score.

### 2.3 Article IV Human Sovereignty & Gate 3 Clearance
- Automated evaluations classify concepts into recommendation tiers:
  - `RECOMMENDED` ($S \ge 75.0$, all $d_i \ge 50.0$)
  - `VIABLE_WITH_REFINEMENT` ($60.0 \le S < 75.0$)
  - `HIGH_RISK_REVISE` ($40.0 \le S < 60.0$ or any critical vulnerability)
  - `REJECT` ($S < 40.0$)
- In accordance with **Article IV**, the AI never automatically clears Gate 3 or locks in a primary thesis concept without explicit, logged human researcher confirmation.

---

## 3. User Scenarios & Acceptance Criteria

### User Scenario 1: Automated Multi-Criteria Concept Evaluation
- **Given** an active problem record and a formulated DSR artifact (e.g. from SDD-016),
- **When** the researcher requests an evaluation of the artifact,
- **Then** `ConceptEvaluationEngine` calculates scores across all 7 dimensions, synthesizes grounded strengths, vulnerabilities, and a falsification advisory, and stores the evaluation in `concept_evaluations`.

### User Scenario 2: Comparative Tradeoff Matrix
- **Given** multiple candidate artifacts in the session (e.g., a `MODEL` vs. a `METHOD` vs. an `INSTANTIATION`),
- **When** the researcher triggers "Compare Candidates",
- **Then** the system produces a side-by-side comparison matrix showing dimension-by-dimension breakdowns, ranking, and trade-off highlights.

### User Scenario 3: Human Researcher Overrides & Gate 3 Acceptance
- **Given** an automated evaluation that highlights a technical feasibility risk,
- **When** the human researcher provides empirical mitigation evidence and updates the rubric score or adds notes,
- **Then** the updated evaluation is recorded as a `HUMAN_EXPERT` evaluation record, preserving provenance and enabling Stage Gate 3 clearance.

---

## 4. Functional Requirements

### 4.1 Storage & Relational Persistence
- **FR-017-01**: Maintain table `concept_evaluations` in SQLite WAL with foreign keys to `dsr_artifacts(id)` and `sessions(session_id)`.
- **FR-017-02**: Store fields: `id`, `concept_id`, `session_id`, `evaluator_type`, `composite_score`, `dimension_scores`, `strengths`, `vulnerabilities`, `falsification_advisory`, `recommendation`, `narrative_summary`, `is_degraded`, `created_at`.
- **FR-017-03**: Support CRUD operations in `SQLiteStorageAdapter`: `save_concept_evaluation()`, `get_concept_evaluation()`, `list_concept_evaluations_for_concept()`, `list_concept_evaluations_for_session()`.

### 4.2 Domain Engine (`ConceptEvaluationEngine`)
- **FR-017-04**: Implement `ConceptEvaluationEngine` in `backend/engines/concept_evaluation_engine.py`.
- **FR-017-05**: Implement deterministic rubric scoring function `calculate_concept_scores(concept, context) -> Dict[str, Any]` enforcing the 7 dimensions.
- **FR-017-06**: Implement `evaluate_concept(concept_id, session_id, human_inputs)` synthesizing qualitative narrative, strengths, vulnerabilities, and falsification advisory.
- **FR-017-07**: Implement `compare_concepts(concept_ids, session_id)` returning an ordinal ranking and comparative tradeoff matrix.
- **FR-017-08**: Guarantee deterministic fallback if the LLM gateway is offline or errors, setting `is_degraded = True`.

### 4.3 API Router Endpoints
- **FR-017-09**: `POST /api/evaluations/evaluate-concept`: Evaluates a single candidate concept or DSR artifact.
- **FR-017-10**: `POST /api/evaluations/compare-concepts`: Compares multiple concepts side-by-side.
- **FR-017-11**: `GET /api/evaluations/concept/{concept_id}`: Retrieves evaluations for a concept.
- **FR-017-12**: `GET /api/evaluations/session/{session_id}`: Retrieves evaluations for a session.
- **FR-017-13**: `POST /api/evaluations/human-review`: Submits human expert review and score overrides.

### 4.4 Research Orchestrator Integration
- **FR-017-14**: Add `ActionType.EVALUATE_CONCEPT` to `backend/models/orchestrator.py`.
- **FR-017-15**: In `ResearchOrchestrator.dispatch_action()`, handle `ActionType.EVALUATE_CONCEPT` by delegating to `ConceptEvaluationEngine` and logging the audit event.
- **FR-017-16**: When session is at `stage_d_formulation` or `stage_e_evaluation` with un-evaluated DSR artifacts, recommend `EVALUATE_CONCEPT`.

### 4.5 Frontend UI Components
- **FR-017-17**: Implement `ConceptEvaluationCard.tsx` with dimension visualizer (radar or breakdown bars), score badge, strengths/vulnerabilities, and falsification advisory.
- **FR-017-18**: Implement `ConceptComparisonView.tsx` displaying the comparative tradeoff matrix.
- **FR-017-19**: Implement `evaluationService.ts` for type-safe API communication.
- **FR-017-20**: Integrate evaluation components into `ResearchWorkspaceView.tsx` (Stage E).
- **FR-017-21**: Zero new third-party dependencies in `package.json` (Article VII Anti-Creep Law).

---

## 5. Non-Functional & Boundary Invariants

- **INV-017-01 (Article VII Anti-Creep Law)**: Zero additions to `backend/pyproject.toml` or `web/package.json`.
- **INV-017-02 (Article II Tri-Part Confidence)**: Deterministic multi-criteria score is decoupled from AI narrative; mathematical ranks cannot be inverted by LLM output.
- **INV-017-03 (Article IV Human Sovereignty)**: Automated evaluation is strictly advisory; stage gate transition requires explicit human confirmation.
- **INV-017-04 (Article VIII Degraded Resilience)**: Deterministic evaluation functions offline without external network or LLM availability.
- **INV-017-05 (Deterministic Total Ordering)**: Multi-candidate comparison guarantees strict, reproducible ordering using tie-breaking heuristics.
