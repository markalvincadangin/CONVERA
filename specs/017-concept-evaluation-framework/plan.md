# CONVERA SDD-017: Implementation & Architecture Plan
# Concept Evaluation Framework (Stage E Multi-Criteria Rigor Assessment)

**Specification ID**: CONVERA-SDD-017  
**Classification**: Implementation Plan & Architectural Roadmap  
**Authority Tier**: Tier 2 (Engineering Execution Plan)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/017-concept-evaluation-framework`  
**Target Integration Branch**: `develop`  

---

## 1. System Architecture Overview

The **Concept Evaluation Framework** provides the rigorous, auditable Stage E evaluation gateway for candidate research concepts and DSR artifacts formulated in Stage D.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Research Cockpit / Stage E                      │
│     (web/src/components/research/evaluation/ConceptEvaluationCard.tsx) │
│     (web/src/components/research/evaluation/ConceptComparisonGrid.tsx) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Frontend Service (evaluationService.ts)                  │
│    evaluateConcept()                   compareConcepts()               │
│    listConceptEvaluations()            submitHumanEvaluation()         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             API Router (backend/routers/evaluations.py)                │
│    POST /api/evaluations/evaluate-concept                              │
│    POST /api/evaluations/compare-concepts                              │
│    GET  /api/evaluations/concept/{concept_id}                          │
│    POST /api/evaluations/human-review                                  │
└─────────────────┬────────────────────────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│ ConceptEvaluationEngine              │ │     ResearchOrchestrator      │
│ (backend/engines/)                   │ │ (EVALUATE_CONCEPT Action)     │
│ - 7-Dimension Deterministic Scoring  │ └───────────────────────────────┘
│ - Inverted Qualitative AI Narrative  │
│ - Trade-off Matrix & Total Ordering  │
│ - Degraded Fallback Diagnostics      │
└─────────────────┬────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│           SQLite Storage Adapter (backend/storage/sqlite_adapter.py)   │
│                 New Table: concept_evaluations (Table 34)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Stack & Invariants

| Layer | Component | Language / Framework | Constraints |
|:---|:---|:---|:---|
| **Presentation** | `ConceptEvaluationCard.tsx`, `ConceptComparisonGrid.tsx` | Next.js 15, React 19, Tailwind CSS | Strictly 0 new npm packages (Article VII) |
| **Frontend API** | `evaluationService.ts` | TypeScript 5 | Native Fetch API |
| **API Transport** | `routers/evaluations.py` | FastAPI, Pydantic v2 | Standard Starlette routing |
| **Domain Logic** | `engines/concept_evaluation_engine.py` | Python 3.13 | Deterministic core + LLM Gateway |
| **Workflow Routing** | `services/research_orchestrator.py` | Python 3.13 | Methodology Contracts & Provenance |
| **Persistence** | `storage/sqlite_adapter.py` | SQLite 3 (WAL mode) | Parameterized SQL, Table 34 |

---

## 3. Detailed Component Plan

### 3.1 Relational Storage Layer (`backend/storage/`)
1. Create table `concept_evaluations` (Table 34) in `backend/storage/sqlite_adapter.py`:
   - Enforce foreign keys to `dsr_artifacts(id)` and `sessions(session_id)`.
   - Store 7-dimension breakdowns, strengths, vulnerabilities, and falsification advisories as JSON text.
2. Add abstract storage contract methods in `backend/storage/base.py`:
   - `save_concept_evaluation(data: Dict[str, Any]) -> Dict[str, Any]`
   - `get_concept_evaluation(evaluation_id: str) -> Optional[Dict[str, Any]]`
   - `list_concept_evaluations(concept_id: Optional[str] = None, session_id: Optional[str] = None) -> List[Dict[str, Any]]`
3. Implement parameterized SQL queries in `backend/storage/sqlite_adapter.py`.

### 3.2 Domain Engine (`backend/engines/concept_evaluation_engine.py`)
1. **Deterministic Multi-Criteria Math**:
   - `calculate_concept_scores(concept: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, float]`:
     - Computes raw $[0, 100]$ score for each of the 7 dimensions based on attached evidence, gap validity, problem metrics, and kernel theory grounding.
     - Computes composite score: $S = \sum w_i \cdot d_i$.
2. **Inverted Qualitative AI Synthesis**:
   - `evaluate_concept(...)`:
     - Locks in deterministic dimension scores and composite score.
     - Calls `generate_response_with_fallback` to generate structured JSON commentary (strengths, vulnerabilities, falsification advisory, recommendation rationale).
     - Asserts invariant: AI cannot alter deterministic scores or recommendation tier.
3. **Multi-Candidate Tradeoff Comparison**:
   - `compare_concepts(candidates: List[Dict[str, Any]], session_id: Optional[str]) -> Dict[str, Any]`:
     - Evaluates all candidates deterministically.
     - Ranks candidates in descending order of composite score with deterministic tie-breaking (evidence grounding $\rightarrow$ problem relevance $\rightarrow$ technical feasibility).
     - Generates pairwise trade-off matrix.
4. **Resilient Fallback**:
   - On LLM failure or timeout, returns deterministic evaluation with `is_degraded = True` and rule-based advisory.

### 3.3 API Transport Layer (`backend/routers/evaluations.py`)
1. Define Pydantic request and response schemas:
   - `ConceptEvaluationRequest`, `ConceptComparisonRequest`, `HumanReviewRequest`.
   - `ConceptEvaluationResponse`, `ConceptComparisonResponse`.
2. Implement endpoints:
   - `POST /api/evaluations/evaluate-concept`
   - `POST /api/evaluations/compare-concepts`
   - `GET /api/evaluations/concept/{concept_id}`
   - `GET /api/evaluations/session/{session_id}`
   - `POST /api/evaluations/human-review`
3. Register router in `backend/server.py`.

### 3.4 Orchestrator Workflow Integration (`backend/services/research_orchestrator.py`)
1. Extend `ActionType` enum in `backend/models/orchestrator.py` with `EVALUATE_CONCEPT`.
2. In `dispatch_action()`, add concrete `elif action_type == ActionType.EVALUATE_CONCEPT` handler invoking `ConceptEvaluationEngine`.
3. In `evaluate()`, recommend `EVALUATE_CONCEPT` as URGENT/HIGH priority when session is in Stage D or E and un-evaluated artifacts exist.

### 3.5 Frontend UI Layer (`web/src/components/research/evaluation/`)
1. `ConceptEvaluationCard.tsx`:
   - Interactive breakdown of the 7 criteria with progress indicators.
   - Recommendation status pill (`RECOMMENDED`, `VIABLE_WITH_REFINEMENT`, `HIGH_RISK_REVISE`, `REJECT`).
   - Grounded strengths, critical vulnerabilities, and falsification advisory alert box.
   - Human review drawer/form allowing score adjustment and notes (Article IV).
2. `ConceptComparisonGrid.tsx`:
   - Side-by-side comparison of candidate concepts (Construct, Model, Method, Instantiation).
   - Visual trade-off indicators highlighting which candidate leads in feasibility vs. novelty vs. evidence.
3. `evaluationService.ts`:
   - Type-safe wrapper for `/api/evaluations/*` routes.
4. Integration into Stage E in `ResearchWorkspaceView.tsx`.

---

## 4. Phased Implementation Roadmap

- **Phase 1: Persistence & Data Contracts**
  - Implement Table 34 in `sqlite_adapter.py` and `base.py`.
  - Unit tests for evaluation persistence and queries.
- **Phase 2: Domain Engine & Inverted Math**
  - Implement `ConceptEvaluationEngine` in `backend/engines/concept_evaluation_engine.py`.
  - Implement multi-candidate ranking and deterministic fallback.
- **Phase 3: API Routing & Orchestrator Action Dispatch**
  - Implement `routers/evaluations.py` and mount in `server.py`.
  - Add `ActionType.EVALUATE_CONCEPT` to orchestrator models and dispatch logic.
- **Phase 4: Frontend UI Components**
  - Implement `evaluationService.ts`, `ConceptEvaluationCard.tsx`, `ConceptComparisonGrid.tsx`.
  - Wire into `ResearchWorkspaceView.tsx` Stage E.
- **Phase 5: End-to-End Verification & Gate Clearance**
  - Integration test suite: `backend/tests/test_concept_evaluation.py`.
  - Full regression suite, TypeScript validation, Next.js build, and graphify update.
