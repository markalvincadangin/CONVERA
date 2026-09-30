# CONVERA SDD-018: Atomic Task Breakdown
# Research Stage F Proposal Canvas & Feasibility Engine

**Specification ID**: CONVERA-SDD-018  
**Classification**: Implementation Tasks & Dependency Ordering  
**Authority Tier**: Tier 2 (Execution Tasks)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/018-research-stage-f-proposal-canvas`  
**Target Integration Branch**: `develop`  

---

## 1. Task Dependency Graph

```
[TASK-018-01: Relational Schema & Storage Adapter (Table 35)]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[TASK-018-02: FeasibilityEngine & Models]  [TASK-018-03: Dynamic ProposalExporter Upgrade]
        │                           │
        └─────────────┬─────────────┘
                      ▼
[TASK-018-04: API Router & Orchestrator Action Dispatch]
                      │
                      ▼
[TASK-018-05: Frontend Service & TypeScript Types]
                      │
                      ▼
[TASK-018-06: StageFFeasibilityView Interactive UI & Workspace Mounting]
                      │
                      ▼
[TASK-018-07: Test Suite, Full Regression & Graphify Sync]
```

---

## 2. Atomic Task Breakdown

### `TASK-018-01`: Relational Schema & Storage Adapter (`research_feasibility_records`)
- **Status**: ✅ COMPLETED
- **Target Files**:
  - `backend/storage/base.py`
  - `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Add Table 35 (`research_feasibility_records`) to `_init_db()` in `backend/storage/sqlite_adapter.py` with foreign keys to `sessions(session_id)` and `projects(id)`.
  2. Add abstract methods to `backend/storage/base.py`:
     - `save_feasibility_record(data: Dict[str, Any]) -> Dict[str, Any]`
     - `get_feasibility_record(session_id: str) -> Optional[Dict[str, Any]]`
     - `list_feasibility_records(project_id: Optional[str] = None) -> List[Dict[str, Any]]`
  3. Implement methods in `backend/storage/sqlite_adapter.py` with parameterized SQL queries and JSON serialization for `ethics_checklist_json`, `sdg_alignments_json`, `dost_alignments_json`, and `budget_breakdown_json`.
- **Verification**: SQLite schema initializes cleanly; unit tests verify round-trip storage.

---

### `TASK-018-02`: Pydantic Models & Feasibility Engine (`FeasibilityEngine`)
- **Status**: ✅ COMPLETED
- **Target Files**:
  - `backend/models/feasibility.py`
  - `backend/engines/feasibility_engine.py`
- **Actions**:
  1. Create Pydantic v2 domain schemas (`EthicsChecklist`, `SDGMapping`, `DOSTPriorityMapping`, `BudgetBreakdown`, `FeasibilityEvaluationRequest`, `FeasibilityRecord`).
  2. Implement `FeasibilityEngine`:
     - Deterministic compliance checker (RA 10173, consent protocol, IRB tier).
     - Strategic roadmap alignment evaluator (SDGs & DOST-PCIEERD / NAIR priorities).
     - Resource budget calculator and timeline feasibility check.
     - Deterministic composite feasibility score $[0.0, 100.0]$.
     - Inverted AI ethics & risk mitigation narrative synthesis (`TaskCategory.ETHICAL_REVIEW`).
     - Resilient offline fallback with `is_degraded = True`.
- **Verification**: Engine evaluates compliance, score, and advisory with and without active LLM credentials.

---

### `TASK-018-03`: Dynamic Proposal Exporter Upgrade (`ProposalExporter`)
- **Status**: ✅ COMPLETED
- **Target Files**:
  - `backend/engines/proposal_exporter.py`
- **Actions**:
  1. Upgrade `ProposalExporter` to query and bind live database state from all 6 stages:
     - Stage A: `ProblemRecord` (sufferer context, problem statement, variables).
     - Stages B & C: `claim_evidence_links` and `scholarly_works` (citations, literature matrix, RQs).
     - Stage D: `dsr_artifacts` (primary artifact class, architecture, kernel theories).
     - Stage E: `concept_evaluations` and `circumscription_iterations` (rubric score, experimental design, iteration loopbacks).
     - Stage F: `research_feasibility_records` and `mentor_signoffs` (ethics, SDGs, budget, advisor defense approval).
  2. Implement `compile_proposal_canvas(project_id: str, session_id: Optional[str]) -> Dict[str, Any]` returning publication-grade Markdown and structured section payloads.
- **Verification**: Generates rich live DSR proposal from session records without static dummy defaults when session data exists.

---

### `TASK-018-04`: API Router & Orchestrator Action Dispatch
- **Status**: ✅ COMPLETED
- **Target Files**:
  - `backend/routers/feasibility.py`
  - `backend/models/orchestrator.py`
  - `backend/services/research_orchestrator.py`
  - `backend/server.py`
- **Actions**:
  1. Implement FastAPI router with prefix `/api/feasibility`:
     - `POST /evaluate`
     - `GET /session/{session_id}`
     - `POST /compile-proposal`
     - `POST /mentor-signoff`
     - `GET /mentor-signoff/{project_id}`
  2. Mount router in `backend/server.py`.
  3. Extend `ActionType` in `backend/models/orchestrator.py` with:
     - `AUDIT_COMPLIANCE_FEASIBILITY`
     - `COMPILE_PROPOSAL_CANVAS`
  4. Extend `ResearchOrchestrator.dispatch_action` to execute these actions and persist orchestration events.
- **Verification**: Endpoints return valid 200 responses; orchestrator action dispatches succeed.

---

### `TASK-018-05`: Frontend Service & TypeScript Contracts
- **Status**: ✅ COMPLETED
- **Target Files**:
  - `web/src/services/feasibilityService.ts`
  - `web/src/types/index.ts` (if applicable)
- **Actions**:
  1. Create TypeScript types for `EthicsChecklist`, `SDGMapping`, `DOSTPriorityMapping`, `BudgetBreakdown`, `FeasibilityRecord`, `DSRProposalMonograph`.
  2. Implement typed API service methods:
     - `evaluateFeasibility()`
     - `getFeasibilityRecord()`
     - `compileDSRProposal()`
     - `submitMentorSignoff()`
     - `listMentorSignoffs()`
- **Verification**: `npm run typecheck --prefix web` passes without type errors.

---

### `TASK-018-06`: StageFFeasibilityView Interactive UI & Workspace Mounting
- **Status**: ✅ COMPLETED
- **Target Files**:
  - `web/src/components/research/feasibility/StageFFeasibilityView.tsx`
  - `web/src/components/frameworks/research/ResearchWorkspaceView.tsx`
- **Actions**:
  1. Build `StageFFeasibilityView.tsx` with CCDS v2.0 styling:
     - Tab 1: *Regulatory & Ethics Checklist* (RA 10173, consent, IRB status).
     - Tab 2: *Roadmap Alignment* (interactive SDG cards, DOST-PCIEERD priority sectors).
     - Tab 3: *Resource Budget & Timeline* (hardware, compute, sample size, Gantt schedule).
     - Tab 4: *Living DSR Proposal Canvas* (interactive tabbed monograph with Copy/Download Markdown).
     - Tab 5: *Gate 4 Defense Clearance* (rubric verification + attributable mentor sign-off card).
  2. Replace static placeholder card in `web/src/components/frameworks/research/ResearchWorkspaceView.tsx` with `<StageFFeasibilityView />`.
- **Verification**: UI renders smoothly, tabs switch cleanly, forms submit and persist, and proposal previews accurately.

---

### `TASK-018-07`: Test Suite, Full Regression & Graphify Sync
- **Status**: ✅ COMPLETED
- **Target Files**:
  - `backend/tests/test_feasibility_engine.py`
- **Actions**:
  1. Author comprehensive unit and integration tests covering:
     - Table 35 CRUD & session linkage.
     - FeasibilityEngine deterministic score calculations & offline fallback.
     - ProposalExporter live 6-stage compilation.
     - API router endpoints & orchestrator dispatch.
     - Gate 4 and mentor signoff lifecycle.
  2. Run targeted test suite: `PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/test_feasibility_engine.py`.
  3. Run full offline regression suite: `PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/ -m "not live"`.
  4. Run frontend verification: `npm run typecheck --prefix web` and `npm run build --prefix web`.
  5. Run `graphify update .` to synchronize knowledge graph.
- **Verification**: 100% test pass rate (303/303 backend tests passed), 0 type errors, clean Next.js build, updated knowledge graph.
