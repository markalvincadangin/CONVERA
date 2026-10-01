# CONVERA SDD-019: Atomic Task Breakdown
# Cross-Stage Research Critique & Blind-Spot Engine (Phase C3)

**Specification ID**: CONVERA-SDD-019  
**Feature Title**: Cross-Stage Research Critique & Blind-Spot Engine  
**Authority Tier**: Tier 2 (Execution Tasks)  
**Governing Standard**: CCDS v2.0  
**Target Feature Branch**: `feature/019-research-critique-blindspot-engine`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `8ada2a7`  

---

## 1. Task Dependency Graph

```
[TASK-019-01: Table 36 Relational Schema & Storage Adapter]
                      │
                      ▼
[TASK-019-02: Pydantic Domain Models & CrossStageCritiqueEngine]
                      │
                      ▼
[TASK-019-03: API Router & Orchestrator Action Dispatch Upgrade]
                      │
                      ▼
[TASK-019-04: Frontend Types & Critique Service Client]
                      │
                      ▼
[TASK-019-05: CritiqueAuditDeck UI & ResearchWorkspaceView Integration]
                      │
                      ▼
[TASK-019-06: Comprehensive Verification, Regression & Graphify Sync]
```

---

## 2. Atomic Task Breakdown

### `TASK-019-01`: Relational Schema & Storage Adapter (`research_critiques`)
- **Status**: ⏳ PENDING
- **Target Files**:
  - `backend/storage/base.py`
  - `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Add Table 36 (`research_critiques`) in `_init_db()` in `sqlite_adapter.py` with foreign keys to `sessions` and `projects` and indices on `session_id`, `project_id`, `status`.
  2. Add abstract methods to `BaseStorageAdapter`:
     - `save_critique_record(critique_data: Dict[str, Any]) -> Dict[str, Any]`
     - `get_critique_record(critique_id: str) -> Optional[Dict[str, Any]]`
     - `list_critique_records(session_id: Optional[str] = None, project_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]`
     - `update_critique_status(critique_id: str, status: str, resolution_notes: str) -> Optional[Dict[str, Any]]`
  3. Implement storage methods in `SQLiteStorageAdapter` with JSON serialization for `target_stages_json` and `cross_stage_claims_json`.
- **Verification**: SQLite schema initializes cleanly; unit tests verify CRUD round-trip.

---

### `TASK-019-02`: Pydantic Models & Cross-Stage Critique Engine (`CrossStageCritiqueEngine`)
- **Status**: ⏳ PENDING
- **Target Files**:
  - `backend/models/critique.py`
  - `backend/engines/cross_stage_critique_engine.py`
- **Actions**:
  1. Author Pydantic domain schemas (`CritiqueType`, `CritiqueSeverity`, `CritiqueStatus`, `CrossStageCritiqueRecord`, `CritiqueEvaluationRequest`, `CritiqueEvaluationResponse`, `ResolveCritiqueRequest`).
  2. Implement `CrossStageCritiqueEngine`:
     - Cross-stage relational state aggregator (fetches Stages A, C, D, E, F).
     - Heuristic tension rules (unaddressed circumscription loops, budget/hardware mismatch, metric gaps).
     - Inverted AI adversarial synthesis (`TaskCategory.ADVERSARIAL_CRITIQUE`).
     - Deterministic consistency scoring formula:
       $$\text{Score} = \max(0.0, 100.0 - (25.0 \times N_{\text{fatal}} + 15.0 \times N_{\text{critical}} + 8.0 \times N_{\text{warning}} + 3.0 \times N_{\text{advisory}}))$$
     - Degraded offline fallback with `is_degraded = True`.
- **Verification**: Engine flags cross-stage tensions and computes scores deterministically in online and offline modes.

---

### `TASK-019-03`: API Router & Research Orchestrator Action Dispatch
- **Status**: ⏳ PENDING
- **Target Files**:
  - `backend/routers/critique.py`
  - `backend/routers/__init__.py`
  - `backend/server.py`
  - `backend/services/research_orchestrator.py`
- **Actions**:
  1. Author FastAPI router `/api/critique`:
     - `POST /evaluate`
     - `GET /session/{session_id}`
     - `POST /resolve`
  2. Mount router in `backend/server.py`.
  3. Upgrade `ResearchOrchestrator.dispatch_action` for `ActionType.CROSS_EXAMINE_EVIDENCE` and `ActionType.STRESS_TEST_PROBLEM` to execute `CrossStageCritiqueEngine`.
- **Verification**: Endpoints return 200 with structured critique payloads; orchestrator actions invoke engine.

---

### `TASK-019-04`: Frontend TypeScript Types & Service Client
- **Status**: ⏳ PENDING
- **Target Files**:
  - `web/src/types/critique.ts`
  - `web/src/services/critiqueService.ts`
- **Actions**:
  1. Create TypeScript types for critique records and summaries.
  2. Implement API client methods (`evaluateCritique()`, `listCritiques()`, `resolveCritique()`).
- **Verification**: `npm run typecheck --prefix web` passes without type errors.

---

### `TASK-019-05`: CritiqueAuditDeck UI & Workspace Integration
- **Status**: ⏳ PENDING
- **Target Files**:
  - `web/src/components/research/critique/CritiqueAuditDeck.tsx`
  - `web/src/components/frameworks/research/ResearchWorkspaceView.tsx`
- **Actions**:
  1. Author `CritiqueAuditDeck.tsx` using CCDS v2.0 styling:
     - Epistemic consistency gauge $[0..100\%]$.
     - Severity filters (`FATAL`, `CRITICAL`, `WARNING`, `ADVISORY`).
     - Cross-stage connector card showing which stages are in tension.
     - Kill question alert with interactive "Address / Mitigate" modal (mandating human rationale).
  2. Mount an Adversarial Critique trigger/button in `ResearchWorkspaceView.tsx` toolbar opening the `CritiqueAuditDeck`.
- **Verification**: UI renders smoothly, modal captures human notes, and critiques transition states.

---

### `TASK-019-06`: Comprehensive Verification, Regression & Graphify Sync
- **Status**: ⏳ PENDING
- **Target Files**:
  - `backend/tests/test_critique_engine.py`
- **Actions**:
  1. Author dedicated test suite verifying Table 36, engine scoring, offline fallback, and resolution API.
  2. Run targeted test suite: `pytest backend/tests/test_critique_engine.py`.
  3. Run full backend offline regression suite: `pytest backend/tests/ -m "not live"`.
  4. Run frontend verification: `npm run typecheck --prefix web` and `npm run build --prefix web`.
  5. Run `graphify update .` to update the AST knowledge graph.
- **Verification**: 100% test pass rate, 0 type errors, clean Next.js build, knowledge graph updated.
