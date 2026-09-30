# CONVERA SDD-017: Atomic Task Breakdown
# Concept Evaluation Framework (Stage E Multi-Criteria Rigor Assessment)

**Specification ID**: CONVERA-SDD-017  
**Classification**: Implementation Tasks & Dependency Ordering  
**Authority Tier**: Tier 2 (Execution Tasks)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/017-concept-evaluation-framework`  
**Target Integration Branch**: `develop`  

---

## 1. Task Dependency Graph

```
[TASK-017-01: Relational Schema & Storage Adapter (Table 34)]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[TASK-017-02: ConceptEvaluationEngine]  [TASK-017-03: API Router Endpoints]
        │                           │
        └─────────────┬─────────────┘
                      ▼
[TASK-017-04: Orchestrator Action Dispatch & Recommendations]
                      │
                      ▼
[TASK-017-05: Frontend Service & TypeScript Types]
                      │
                      ▼
[TASK-017-06: ConceptEvaluationCard & ConceptComparisonGrid UI]
                      │
                      ▼
[TASK-017-07: Test Suite, Full Regression & Graphify Sync]
```

---

## 2. Atomic Task Breakdown

### `TASK-017-01`: Relational Schema & Storage Adapter (`concept_evaluations`)
- **Status**: ⏳ PENDING
- **Target Files**:
  - `backend/storage/base.py`
  - `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Add table 34 (`concept_evaluations`) to `_init_db()` in `backend/storage/sqlite_adapter.py` with foreign keys to `dsr_artifacts(id)` and `sessions(session_id)`.
  2. Add abstract methods to `backend/storage/base.py`:
     - `save_concept_evaluation(data: Dict[str, Any]) -> Dict[str, Any]`
     - `get_concept_evaluation(evaluation_id: str) -> Optional[Dict[str, Any]]`
     - `list_concept_evaluations(concept_id: Optional[str] = None, session_id: Optional[str] = None) -> List[Dict[str, Any]]`
  3. Implement methods in `backend/storage/sqlite_adapter.py` with parameterized SQL queries and JSON serialization for `dimension_scores`, `strengths`, and `vulnerabilities`.
- **Verification**: SQLite schema initializes cleanly, unit tests verify round-trip storage.

---

### `TASK-017-02`: Pydantic Models & Domain Engine (`ConceptEvaluationEngine`)
- **Status**: ⏳ PENDING
- **Target Files**:
  - `backend/models/concept_evaluation.py`
  - `backend/engines/concept_evaluation_engine.py`
- **Actions**:
  1. Create Pydantic v2 schemas for dimension scores, evaluations, and multi-candidate comparisons.
  2. Implement `ConceptEvaluationEngine`:
     - Deterministic 7-dimension scoring logic ($[0.0, 100.0]$ scale).
     - Weighted composite calculation with configurable weights.
     - Inverted LLM qualitative synthesis (strengths, vulnerabilities, falsification advisory).
     - Deterministic multi-candidate comparison with total ordering and pairwise trade-off matrix.
     - Resilient deterministic fallback with `is_degraded = True`.
- **Verification**: Engine evaluates concepts accurately with and without active LLM credentials.

---

### `TASK-017-03`: FastAPI Router Endpoints (`backend/routers/evaluations.py`)
- **Status**: ⏳ PENDING
- **Target Files**:
  - `backend/routers/evaluations.py`
  - `backend/server.py`
- **Actions**:
  1. Implement FastAPI router with prefix `/api/evaluations`.
  2. Create endpoints:
     - `POST /evaluate-concept`
     - `POST /compare-concepts`
     - `GET /concept/{concept_id}`
     - `GET /session/{session_id}`
     - `POST /human-review`
  3. Register router in `backend/server.py`.
- **Verification**: Endpoints return correct JSON payloads and 200/400/404 HTTP codes.

---

### `TASK-017-04`: Research Orchestrator Action Dispatch & Recommendations
- **Status**: ⏳ PENDING
- **Target Files**:
  - `backend/models/orchestrator.py`
  - `backend/services/research_orchestrator.py`
- **Actions**:
  1. Add `ActionType.EVALUATE_CONCEPT` to `backend/models/orchestrator.py`.
  2. In `dispatch_action()`, add handler for `ActionType.EVALUATE_CONCEPT` delegating to `ConceptEvaluationEngine` and recording audit event.
  3. In `evaluate()`, trigger recommended action `EVALUATE_CONCEPT` when in `stage_d_formulation` or `stage_e_evaluation` with un-evaluated concepts.
- **Verification**: Orchestrator emits and executes `EVALUATE_CONCEPT` without regression.

---

### `TASK-017-05`: Frontend Service & TypeScript Types
- **Status**: ⏳ PENDING
- **Target Files**:
  - `web/src/types/evaluation.ts`
  - `web/src/services/evaluationService.ts`
- **Actions**:
  1. Define TypeScript interfaces for `EvaluatorType`, `EvaluationRecommendation`, `DimensionScores`, `ConceptEvaluationRecord`, and `ConceptComparisonResult`.
  2. Implement client methods in `web/src/services/evaluationService.ts` using native `fetch`.
- **Verification**: TypeScript typecheck passes with 0 errors.

---

### `TASK-017-06`: Interactive Stage E Evaluation & Comparison UI Components
- **Status**: ⏳ PENDING
- **Target Files**:
  - `web/src/components/research/evaluation/ConceptEvaluationCard.tsx`
  - `web/src/components/research/evaluation/ConceptComparisonGrid.tsx`
  - `web/src/components/research/ResearchWorkspaceView.tsx`
- **Actions**:
  1. Build `ConceptEvaluationCard.tsx` displaying 7-dimension progress bars, recommendation pill, strengths, vulnerabilities, and falsification advisory alert.
  2. Build `ConceptComparisonGrid.tsx` for side-by-side trade-off comparison across candidates.
  3. Mount components inside Stage E (`currentPhaseId === "E"`) in `ResearchWorkspaceView.tsx`.
- **Verification**: Stage E displays evaluation cards and comparison matrix cleanly without console errors.

---

### `TASK-017-07`: Test Suite, Full Regression & Graphify Sync
- **Status**: ⏳ PENDING
- **Target Files**:
  - `backend/tests/test_concept_evaluation.py`
- **Actions**:
  1. Create integration test suite covering single evaluation, multi-candidate comparison, fallback resilience, and human review.
  2. Run full regression test suite (`pytest backend/tests -m "not live"`).
  3. Run TypeScript validation (`npm run typecheck --prefix web`).
  4. Run Next.js production build (`npm run build --prefix web`).
  5. Synchronize knowledge graph via `graphify update .`.
- **Verification**: 100% test pass rate, 0 type errors, clean build, updated graph.
