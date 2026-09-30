# CONVERA SDD-016: Atomic Task Breakdown
# Structured Ideation & 4 DSR Artifact Formulation Engine

**Specification ID**: CONVERA-SDD-016  
**Classification**: Implementation Tasks & Dependency Ordering  
**Authority Tier**: Tier 2 (Execution Tasks)  
**Document Status**: 🟢 COMPLETED & VERIFIED  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/016-dsr-artifact-ideation`  
**Target Integration Branch**: `develop`  

---

## 1. Task Dependency Graph

```
[TASK-016-01: Relational Schema & Storage Adapter (Table 33)]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[TASK-016-02: IdeationEngine]  [TASK-016-03: API Router Endpoints]
        │                           │
        └─────────────┬─────────────┘
                      ▼
[TASK-016-04: Orchestrator Action Dispatch & Recommendation]
                      │
                      ▼
[TASK-016-05: Frontend Service (ideationService.ts)]
                      │
                      ▼
[TASK-016-06: Interactive 4-Quadrant DSR Matrix Canvas]
                      │
                      ▼
[TASK-016-07: Test Suite, Full Regression & Graphify Sync]
```

---

## 2. Atomic Task Breakdown

### `TASK-016-01`: Relational Schema & Storage Adapter (`dsr_artifacts`)
- **Status**: ✅ COMPLETED & VERIFIED
- **Target Files**:
  - `backend/storage/base.py`
  - `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Add `dsr_artifacts` table definition to `_init_db()` in `sqlite_adapter.py` with foreign keys and check constraints.
  2. Add abstract methods to `backend/storage/base.py`:
     - `create_dsr_artifact(artifact_data)`
     - `get_dsr_artifact(artifact_id)`
     - `list_dsr_artifacts(problem_id, dsr_class)`
     - `update_dsr_artifact(artifact_id, updates)`
     - `delete_dsr_artifact(artifact_id)`
  3. Implement methods in `sqlite_adapter.py` with parameterized queries and JSON serialization for `targeted_gap_ids`, `linked_claim_ids`, `contextual_constraints`, and `provenance`.
- **Verification**: SQLite schema initializes cleanly, CRUD operations succeed.

---

### `TASK-016-02`: Domain Engine Implementation (`backend/engines/ideation_engine.py`)
- **Status**: ✅ COMPLETED & VERIFIED
- **Target Files**:
  - `backend/engines/ideation_engine.py`
  - `backend/models/ideation.py`
- **Actions**:
  1. Author Pydantic domain models in `backend/models/ideation.py` (`DSRArtifactClass`, `DSRArtifactStatus`, `DSRArtifactModel`, request/response models).
  2. Author `IdeationEngine` in `backend/engines/ideation_engine.py`:
     - `generate_dsr_candidates(problem_id, context, prompt_guidance)`:
       - Extracts problem brief, claims, and literature gaps.
       - Constructs structured prompt demanding 4 DSR classes (Construct, Model, Method, Instantiation).
       - Demands explicit Kernel Theory and simpler baseline alternative (Rules 5 & 6).
       - Invokes LLM gateway with robust fallback mock generator.
- **Verification**: Isolated unit test verifies candidate generation and parsing.

---

### `TASK-016-03`: API Router Implementation (`backend/routers/ideation.py`)
- **Status**: ✅ COMPLETED & VERIFIED
- **Target Files**:
  - `backend/routers/ideation.py`
  - `backend/server.py`
- **Actions**:
  1. Author `backend/routers/ideation.py` with endpoints:
     - `POST /api/ideation/generate`: Triggers candidate generation.
     - `GET /api/ideation/problem/{problem_id}/artifacts`: Lists artifacts for problem.
     - `POST /api/ideation/artifacts`: Creates custom artifact.
     - `PATCH /api/ideation/artifacts/{artifact_id}`: Updates status/fields.
     - `DELETE /api/ideation/artifacts/{artifact_id}`: Deletes artifact.
  2. Register router in `backend/server.py`.
- **Verification**: FastHTML/FastAPI test client verifies all endpoints.

---

### `TASK-016-04`: Research Orchestrator Action Dispatch & Recommendation
- **Status**: ✅ COMPLETED & VERIFIED
- **Target Files**:
  - `backend/models/orchestrator.py`
  - `backend/services/research_orchestrator.py`
- **Actions**:
  1. Add `FORMULATE_DSR_ARTIFACT = "FORMULATE_DSR_ARTIFACT"` to `ActionType` in `backend/models/orchestrator.py`.
  2. In `ResearchOrchestrator._evaluate_research_track()`:
     - When at `stage_d_formulation`, inspect `storage.list_dsr_artifacts(problem_id)`.
     - If no artifact is `SELECTED`, emit `FORMULATE_DSR_ARTIFACT` recommendation.
  3. In `ResearchOrchestrator.dispatch_action()`:
     - Handle `ActionType.FORMULATE_DSR_ARTIFACT`: call `ideation_engine.generate_dsr_candidates()`, persist to SQLite, log event in `orchestration_events`.
- **Verification**: Pytest test verifies orchestrator recommendation and action dispatch.

---

### `TASK-016-05`: Frontend Service Client (`web/src/services/ideationService.ts`)
- **Status**: ✅ COMPLETED & VERIFIED
- **Target Files**:
  - `web/src/services/ideationService.ts`
- **Actions**:
  1. Author `ideationService.ts` with complete TypeScript interfaces:
     - `DSRArtifactClass`, `DSRArtifactStatus`, `DSRArtifactRecord`, request and response types.
  2. Implement client methods:
     - `generateCandidates(problemId, sessionId, promptGuidance)`
     - `listArtifacts(problemId, dsrClass)`
     - `createArtifact(payload)`
     - `updateArtifact(artifactId, updates)`
     - `deleteArtifact(artifactId)`
- **Verification**: `npm run typecheck --prefix web` passes.

---

### `TASK-016-06`: Interactive 4-Quadrant DSR Matrix Canvas (`DSRArtifactCanvas.tsx`)
- **Status**: ✅ COMPLETED & VERIFIED
- **Target Files**:
  - `web/src/components/research/DSRArtifactCanvas.tsx`
  - `web/src/components/frameworks/research/ResearchWorkspaceView.tsx`
- **Actions**:
  1. Author `web/src/components/research/DSRArtifactCanvas.tsx`:
     - 4-Quadrant Matrix: Construct, Model, Method, Instantiation.
     - "Abductive Suggestion" generation trigger with loading state.
     - "Add Custom Artifact" modal dialog for manual researcher authoring.
     - Artifact cards with class badge, Kernel Theory, targeted gaps, simpler baseline notice, expandable formal specification, and primary thesis selection action.
  2. Integrate `DSRArtifactCanvas` into Phase D of `ResearchWorkspaceView.tsx`.
- **Verification**: Frontend builds with 0 errors; interactive flow verified.

---

### `TASK-016-07`: Test Suite, Full Regression & Graphify Sync
- **Status**: ✅ COMPLETED & VERIFIED
- **Target Files**:
  - `backend/tests/test_dsr_artifact_ideation.py`
- **Actions**:
  1. Author unit and integration tests covering:
     - SQLite `dsr_artifacts` CRUD.
     - `IdeationEngine` candidate generation and parsing.
     - Router endpoints (`/generate`, `/artifacts`, status update).
     - Orchestrator action dispatch (`FORMULATE_DSR_ARTIFACT`).
  2. Execute full regression test suite (`pytest backend/tests -m "not live"`).
  3. Execute `npm run typecheck --prefix web` and `npm run build --prefix web`.
  4. Run `graphify update .` to synchronize knowledge graph.
- **Verification**: 100% test pass rate across backend (289/289 passed) and frontend (clean typecheck and build).
