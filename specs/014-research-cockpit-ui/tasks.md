# CONVERA SDD-014: Work Breakdown & Implementation Tasks
# Active Research Cockpit & Orchestration Frontend Integration

**Specification ID**: CONVERA-SDD-014  
**Classification**: Implementation Tasks & Execution Sequence  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 FORMULATED / PENDING HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Canonical Path**: `specs/014-research-cockpit-ui/tasks.md`  
**Upstream Dependencies**: `specs/014-research-cockpit-ui/spec.md`, `specs/014-research-cockpit-ui/plan.md`  

---

## 1. Task Dependency & Execution Graph

```text
TASK-014-01: Create TypeScript Orchestrator API Service (web/src/services/orchestratorService.ts)
       │
       ▼
TASK-014-02: Author Sub-Components (StageGateMonitor, EpistemicHealthMeter, OverconfidenceBanner, RecommendedActionCard)
       │
       ▼
TASK-014-03: Author Orchestration Events Drawer (web/src/components/research/cockpit/OrchestrationEventsDrawer.tsx)
       │
       ▼
TASK-014-04: Assemble Root Research Cockpit Container & Barrel Export
       │
       ▼
TASK-014-05: Integrate Research Cockpit into Workspace Layout (web/src/app/page.tsx)
       │
       ▼
TASK-014-06: Verification Suite (npm run typecheck, regression check, graphify update)
```

---

## 2. Detailed Task Breakdown

### TASK-014-01: Create TypeScript Orchestrator API Service
- **Target File**: `web/src/services/orchestratorService.ts`
- **Scope**:
  - Implement `orchestratorService.evaluate(sessionId, problemId)` calling `POST /api/orchestrator/evaluate`.
  - Implement `orchestratorService.dispatchAction(request)` calling `POST /api/orchestrator/dispatch-action`.
  - Implement `orchestratorService.listEvents(sessionId, limit)` calling `GET /api/orchestrator/session/{session_id}/events`.
- **Verification**: Typecheck passes and mocked endpoints respond with proper typings.

### TASK-014-02: Author Cockpit Sub-Components
- **Target Directory**: `web/src/components/research/cockpit/`
- **Files**:
  - `OverconfidenceBanner.tsx`: Article II warning with direct action challenge button.
  - `StageGateMonitor.tsx`: Prerequisite checklist, required outputs, and gate review status.
  - `EpistemicHealthMeter.tsx`: Facts vs assumptions ratio, evidence items, and balance bar.
  - `RecommendedActionCard.tsx`: Prioritized action display with one-click dispatch trigger.
- **Verification**: Adheres strictly to CCDS v2.0 Obsidian Dark design tokens and button wrap rules.

### TASK-014-03: Author Orchestration Events Drawer
- **Target File**: `web/src/components/research/cockpit/OrchestrationEventsDrawer.tsx`
- **Scope**:
  - Slide-over drawer listing recent actions, execution summaries, and status badges.
- **Verification**: Drawer opens and closes smoothly via standard Modal/Drawer primitive.

### TASK-014-04: Assemble Root Research Cockpit Container
- **Target Files**:
  - `web/src/components/research/cockpit/ResearchCockpit.tsx`
  - `web/src/components/research/cockpit/index.ts`
- **Scope**:
  - Container managing evaluation lifecycle, loading state, error boundary, and action dispatch callbacks.
- **Verification**: Independent rendering with mock evaluation data.

### TASK-014-05: Integrate Research Cockpit into Workspace Layout
- **Target File**: `web/src/app/page.tsx`
- **Scope**:
  - Mount `ResearchCockpit` prominently above the workspace views or inside the HUD area.
  - Wire refresh triggers so executing actions re-evaluates session state seamlessly.
- **Verification**: Render page in browser/typecheck with zero regressions.

### TASK-014-06: Verification Suite & Knowledge Graph Update
- **Target**: Entire repository
- **Scope**:
  - `npm run typecheck --prefix web` (0 errors).
  - Backend regression check: `pytest backend/tests -m "not live"` (273 passing).
  - Update knowledge graph: `graphify update .`.
- **Verification**: Complete verification across both frontend and backend.
