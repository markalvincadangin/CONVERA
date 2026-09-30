# CONVERA SDD-016: Implementation & Architecture Plan
# Structured Ideation & 4 DSR Artifact Formulation Engine

**Specification ID**: CONVERA-SDD-016  
**Classification**: Implementation Plan & Architectural Roadmap  
**Authority Tier**: Tier 2 (Engineering Execution Plan)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/016-dsr-artifact-ideation`  
**Target Integration Branch**: `develop`  

---

## 1. System Architecture Overview

The **Structured Ideation & 4 DSR Artifact Formulation Engine** provides the missing bridge between Literature Gap Analysis (Phase C) and Controlled Evaluation (Phase E) in the Computing Research Track.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Research Cockpit / Stage D                      │
│                  (web/src/components/research/DSRArtifactCanvas.tsx)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Frontend Service (ideationService.ts)                  │
│    generateDSRCandidates()             listDSRArtifacts()              │
│    createDSRArtifact()                 updateDSRArtifact()             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               API Router (backend/routers/ideation.py)                 │
│    POST /api/ideation/generate           GET /api/ideation/artifacts   │
│    POST /api/ideation/artifacts          PATCH /api/ideation/artifacts │
└─────────────────┬────────────────────────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌────────────────────────────────────┐ ┌─────────────────────────────────┐
│   IdeationEngine (backend/engines) │ │      ResearchOrchestrator       │
│   - Abductive Prompting            │ │ (FORMULATE_DSR_ARTIFACT Action) │
│   - 4-Class Classification         │ └─────────────────────────────────┘
│   - Kernel Theory Association      │
│   - Simpler Baseline Formulation   │
└─────────────────┬──────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│           SQLite Storage Adapter (backend/storage/sqlite_adapter.py)   │
│                    New Table: dsr_artifacts (Table 33)                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Stack & Invariants

| Layer | Component | Language / Framework | Dependency Constraints |
|:---|:---|:---|:---|
| **Presentation** | `DSRArtifactCanvas.tsx` | Next.js 15, React 19, Tailwind CSS, Lucide | Strictly 0 new npm packages (Article VII) |
| **Frontend API** | `ideationService.ts` | TypeScript 5 | Native Fetch API |
| **API Transport** | `routers/ideation.py` | FastAPI, Pydantic v2 | Starlette routing |
| **Domain Logic** | `engines/ideation_engine.py` | Python 3.13 | LLM Gateway / regex fallback |
| **Workflow Routing** | `services/research_orchestrator.py` | Python 3.13 | Methodology Contracts |
| **Persistence** | `storage/sqlite_adapter.py` | SQLite 3 (WAL mode) | Relational SQL, Parameterized |

---

## 3. Detailed Component Plan

### 3.1 Relational Storage Layer (`backend/storage/`)
1. Create table `dsr_artifacts` in `backend/storage/sqlite_adapter.py` schema initialization.
2. Add abstract methods to `backend/storage/base.py`:
   - `create_dsr_artifact(artifact_data: Dict[str, Any]) -> Dict[str, Any]`
   - `get_dsr_artifact(artifact_id: str) -> Optional[Dict[str, Any]]`
   - `list_dsr_artifacts(problem_id: str, dsr_class: Optional[str] = None) -> List[Dict[str, Any]]`
   - `update_dsr_artifact(artifact_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]`
   - `delete_dsr_artifact(artifact_id: str) -> bool`
3. Implement methods in `backend/storage/sqlite_adapter.py` with parameterized queries and JSON serialization for lists.

### 3.2 Domain Engine (`backend/engines/ideation_engine.py`)
1. Create `IdeationEngine`:
   - `generate_dsr_candidates(problem_id: str, context: Dict[str, Any], prompt_guidance: Optional[str] = None) -> List[Dict[str, Any]]`:
     - Reads problem brief, claims, and synthesized gaps (`GAP-01`, etc.).
     - Assembles structured prompt demanding 4 distinct DSR artifacts (`CONSTRUCT`, `MODEL`, `METHOD`, `INSTANTIATION`).
     - Demands explicit `kernel_theory` for each.
     - Demands `simpler_baseline_alternative` for each (Rule 5 & Rule 6).
     - Invokes LLM gateway with fallback mock generation if offline or unconfigured.
     - Normalizes and validates candidate objects.

### 3.3 Router Layer (`backend/routers/ideation.py`)
1. Create `router = APIRouter(prefix="/api/ideation", tags=["ideation"])`.
2. Define request/response Pydantic models:
   - `GenerateDSRCandidatesRequest`
   - `CreateDSRArtifactRequest`
   - `UpdateDSRArtifactRequest`
3. Implement endpoints:
   - `POST /api/ideation/generate`
   - `GET /api/ideation/problem/{problem_id}/artifacts`
   - `POST /api/ideation/artifacts`
   - `PATCH /api/ideation/artifacts/{artifact_id}`
   - `DELETE /api/ideation/artifacts/{artifact_id}`
4. Register router in `backend/server.py`.

### 3.4 Research Orchestrator Integration (`backend/services/research_orchestrator.py`)
1. Add `FORMULATE_DSR_ARTIFACT = "FORMULATE_DSR_ARTIFACT"` to `ActionType` in `backend/models/orchestrator.py`.
2. In `ResearchOrchestrator._evaluate_research_track()`:
   - If current stage is `stage_d_formulation`, query `storage.list_dsr_artifacts(problem_id)`.
   - If no artifact has `status == "SELECTED"`, recommend `FORMULATE_DSR_ARTIFACT` with `priority: ActionPriority.HIGH` and `target_engine: "ideation_engine"`.
3. In `ResearchOrchestrator.dispatch_action()`:
   - Handle `ActionType.FORMULATE_DSR_ARTIFACT`: call `ideation_engine.generate_dsr_candidates()`, persist candidates to `dsr_artifacts`, and log event in `orchestration_events`.

### 3.5 Frontend Service (`web/src/services/ideationService.ts`)
1. Define interfaces:
   - `DSRArtifactClass = "CONSTRUCT" | "MODEL" | "METHOD" | "INSTANTIATION"`
   - `DSRArtifactStatus = "PROPOSED" | "SELECTED" | "REFUTED" | "ARCHIVED"`
   - `DSRArtifactRecord`
2. Export methods:
   - `generateCandidates(problemId, sessionId, promptGuidance)`
   - `listArtifacts(problemId, dsrClass)`
   - `createArtifact(payload)`
   - `updateArtifact(artifactId, updates)`
   - `deleteArtifact(artifactId)`

### 3.6 Frontend UI (`web/src/components/research/DSRArtifactCanvas.tsx`)
1. Implement 4-Quadrant DSR Matrix:
   - Quadrant 1: `CONSTRUCT` (Indigo)
   - Quadrant 2: `MODEL` (Cyan)
   - Quadrant 3: `METHOD` (Emerald)
   - Quadrant 4: `INSTANTIATION` (Amber)
2. Interactive Actions:
   - "Abductive Suggestion" button triggering candidate generation with pulse animation.
   - "Add Custom Artifact" modal dialog for manual researcher authoring.
   - "Select as Primary Thesis Artifact" action (Article IV Human Sovereignty).
   - Expandable Formal Specification preview.
3. Integrate into Phase D of `ResearchWorkspaceView.tsx`.

---

## 4. Verification & Testing Strategy

1. **Unit Tests**:
   - Schema validation, CRUD operations on `dsr_artifacts`.
   - `IdeationEngine` candidate generation, prompt formulation, and fallback behavior.
2. **Integration Tests**:
   - Router endpoints: `/generate`, `/artifacts`, status updates.
   - Orchestrator action dispatch: `FORMULATE_DSR_ARTIFACT` logging and persistence.
3. **Full System Regression**:
   - Pytest offline suite ($\ge 283$ tests).
   - TypeScript compilation (`npm run typecheck --prefix web`).
   - Next.js production build (`npm run build --prefix web`).
   - Knowledge graph sync (`graphify update .`).
