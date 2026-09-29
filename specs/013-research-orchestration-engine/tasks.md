# CONVERA SDD-013: Work Breakdown & Implementation Tasks
# Research Orchestration Engine (Unified Intelligence & Research Loop)

**Specification ID**: CONVERA-SDD-013  
**Classification**: Implementation Tasks & Execution Sequence  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Canonical Path**: `specs/013-research-orchestration-engine/tasks.md`  
**Upstream Dependencies**: `specs/013-research-orchestration-engine/spec.md`, `specs/013-research-orchestration-engine/plan.md`, `specs/013-research-orchestration-engine/checklist.md`  

---

## 1. Task Dependency & Execution Graph

```text
TASK-013-01: Author Pydantic Domain Models (backend/models/orchestrator.py)
       │
       ▼
TASK-013-02: SQLite Schema Migration & Event Storage (backend/storage/sqlite_adapter.py)
       │
       ▼
TASK-013-03: Implement Research Context Aggregator & Stage Contract Evaluator
       │
       ▼
TASK-013-04: Implement Critique Synthesizer & Overconfidence Guardrail
       │
       ▼
TASK-013-05: Implement Deterministic Action Recommender & Dispatcher Logic
       │
       ▼
TASK-013-06: Author Orchestrator Router & Mount in server.py
       │
       ▼
TASK-013-07: Implement Automated Test Suite (backend/tests/test_research_orchestrator.py)
       │
       ▼
TASK-013-08: Execute Full Offline Regression Suite & Graphify Update
```

---

## 2. Detailed Task Breakdown

### TASK-013-01: Author Pydantic Domain Models
- **Target File**: `backend/models/orchestrator.py`
- **Dependency**: None
- **Scope**: Define `ActionPriority`, `ActionType`, `RecommendedAction`, `OrchestrationStageStatus`, `EpistemicHealthSummary`, `CritiqueSummary`, `OrchestrationEvaluationResult`, `OrchestrationActionDispatchRequest`, and `OrchestrationActionDispatchResult`.
- **Verification**: Import models and instantiate mock instances with Pydantic validation.

### TASK-013-02: SQLite Schema Migration & Storage Adapter Methods
- **Target File**: `backend/storage/sqlite_adapter.py`, `backend/storage/base.py`
- **Dependency**: `TASK-013-01`
- **Scope**:
  - Add `orchestration_events` table creation and indexes to `_init_db()`.
  - Add `record_orchestration_event(event: Dict[str, Any]) -> str` to `SQLiteStorageAdapter`.
  - Add `get_orchestration_events(session_id: str, limit: int = 50) -> List[Dict[str, Any]]` to `SQLiteStorageAdapter`.
- **Verification**: Unit test creating an event record, querying it back, and verifying foreign key cascade.

### TASK-013-03: Context Aggregator & Stage Contract Evaluator
- **Target File**: `backend/services/research_orchestrator.py`
- **Dependency**: `TASK-013-02`
- **Scope**:
  - Implement `aggregate_session_context(session_id: str, storage: BaseStorageAdapter) -> Dict[str, Any]`.
  - Pull active problem, claims, evidence items, and decisions.
  - Query `methodology_contract_service.get_contract(framework_id)`.
  - Evaluate current stage required inputs and outputs; compute `prerequisites_satisfied` and `gate_ready`.
- **Verification**: Pass mock session with missing inputs; verify `prerequisites_satisfied = False` and `missing_prerequisites` accurately populated.

### TASK-013-04: Critique Synthesizer & Overconfidence Guardrail
- **Target File**: `backend/services/research_orchestrator.py`
- **Dependency**: `TASK-013-03`
- **Scope**:
  - Query active claims and assumptions.
  - Invoke `DevilsAdvocateEngine` and `BlindSpotDetector` to generate critical questions.
  - Calculate `EpistemicHealthSummary` including `net_epistemic_balance`.
  - Enforce Article II Overconfidence Guardrail: if AI confidence $\ge 0.80$ while evidence strength $\le 0.40$, set `overconfidence_risk = True`.
- **Verification**: Provide mock claim with high AI certainty and 0 evidence; verify `overconfidence_risk = True`.

### TASK-013-05: Deterministic Action Recommender & Dispatcher Logic
- **Target File**: `backend/services/research_orchestrator.py`
- **Dependency**: `TASK-013-04`
- **Scope**:
  - Implement rule-based recommendation ranking (Urgent $\rightarrow$ High $\rightarrow$ Medium $\rightarrow$ Low).
  - Implement action dispatch handlers:
    - `ACQUIRE_EVIDENCE`: Executes FTS5/connector search.
    - `EXECUTE_CRITIQUE`: Emits Socratic questions and records to session notes.
    - `SYNTHESIZE_LITERATURE`: Compiles literature matrix.
  - Persist event record via `storage.record_orchestration_event()`.
- **Verification**: Evaluate state; verify top recommendation matches highest-priority gap.

### TASK-013-06: FastAPI Router & Server Assembly
- **Target Files**: `backend/routers/orchestrator.py`, `backend/server.py`
- **Dependency**: `TASK-013-05`
- **Scope**:
  - Create router exposing:
    - `POST /api/orchestrator/evaluate`
    - `POST /api/orchestrator/dispatch-action`
    - `GET /api/orchestrator/session/{session_id}/events`
  - Mount router in `backend/server.py` with standard error handling.
- **Verification**: Test API endpoints with mock request payloads via TestClient.

### TASK-013-07: Automated Verification Test Suite
- **Target File**: `backend/tests/test_research_orchestrator.py`
- **Dependency**: `TASK-013-06`
- **Scope**: Author comprehensive tests covering:
  - Missing stage prerequisite detection.
  - Overconfidence guardrail trigger.
  - Gate review readiness when all outputs are satisfied.
  - Action dispatch execution and database event recording.
  - 100% offline execution without cloud API dependency.
- **Verification**: `./backend/.venv/bin/pytest backend/tests/test_research_orchestrator.py -v`.

### TASK-013-08: Full Regression Suite & Knowledge Graph Update
- **Target File**: Entire repository
- **Dependency**: `TASK-013-07`
- **Scope**:
  - Run full offline backend suite: `./backend/.venv/bin/pytest backend/tests -m "not live"` ($\ge 266$ passing).
  - Run frontend typecheck: `npm run typecheck --prefix web` (0 errors).
  - Update knowledge graph: `graphify update .`.
- **Verification**: Zero regressions detected across existing functionality.
