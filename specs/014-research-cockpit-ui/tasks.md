# CONVERA SDD-014: Work Breakdown & Implementation Tasks
# Active Research Cockpit & Orchestration Frontend Integration

**Specification ID**: CONVERA-SDD-014  
**Classification**: Implementation Tasks & Execution Sequence  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 COMPLETED & VERIFIED  
**Revision**: 1.1.0  
**Canonical Path**: `specs/014-research-cockpit-ui/tasks.md`  
**Upstream Dependencies**: `specs/014-research-cockpit-ui/spec.md`, `specs/014-research-cockpit-ui/plan.md`  

---

## 1. Task Dependency & Execution Graph

```text
[COMPLETED] TASK-014-01: Create TypeScript Orchestrator API Service (web/src/services/orchestratorService.ts)
       │
       ▼
[COMPLETED] TASK-014-02: Author Sub-Components (StageGateMonitor, EpistemicHealthMeter, OverconfidenceBanner, RecommendedActionCard)
       │
       ▼
[COMPLETED] TASK-014-03: Author Orchestration Events Drawer (web/src/components/research/cockpit/OrchestrationEventsDrawer.tsx)
       │
       ▼
[COMPLETED] TASK-014-04: Assemble Root Research Cockpit Container & Barrel Export
       │
       ▼
[COMPLETED] TASK-014-05: Integrate Research Cockpit into Workspace Layout (web/src/app/page.tsx)
       │
       ▼
[COMPLETED] TASK-014-06: Verification Suite (npm run typecheck, regression check, graphify update)
```

---

## 2. Detailed Task Breakdown & Execution Status

### TASK-014-01: Create TypeScript Orchestrator API Service
- **Target File**: `web/src/services/orchestratorService.ts`
- **Status**: 🟢 COMPLETED
- **Scope**:
  - Implement `orchestratorService.evaluate(sessionId, problemId)` calling `POST /api/orchestrator/evaluate`.
  - Implement `orchestratorService.dispatchAction(request)` calling `POST /api/orchestrator/dispatch-action`.
  - Implement `orchestratorService.listEvents(sessionId, limit)` calling `GET /api/orchestrator/session/{session_id}/events`.
- **Verification**: Verified via `npm run typecheck` and Next.js build.

### TASK-014-02: Author Cockpit Sub-Components
- **Target Directory**: `web/src/components/research/cockpit/`
- **Status**: 🟢 COMPLETED
- **Files**:
  - `OverconfidenceBanner.tsx`: Article II warning with direct action challenge button.
  - `StageGateMonitor.tsx`: Prerequisite checklist, required outputs, and gate review status.
  - `EpistemicHealthMeter.tsx`: Facts vs assumptions ratio, evidence items, and balance bar.
  - `RecommendedActionCard.tsx`: Prioritized action display with one-click dispatch trigger.
- **Verification**: Adheres strictly to CCDS v2.0 Obsidian Dark design tokens and button wrap rules.

### TASK-014-03: Author Orchestration Events Drawer
- **Target File**: `web/src/components/research/cockpit/OrchestrationEventsDrawer.tsx`
- **Status**: 🟢 COMPLETED
- **Scope**:
  - Slide-over drawer listing recent actions, execution summaries, and status badges.
- **Verification**: Verified via Next.js compilation and typecheck.

### TASK-014-04: Assemble Root Research Cockpit Container
- **Target Files**:
  - `web/src/components/research/cockpit/ResearchCockpit.tsx`
  - `web/src/components/research/cockpit/index.ts`
- **Status**: 🟢 COMPLETED
- **Scope**:
  - Container managing evaluation lifecycle, loading state, error boundary, and action dispatch callbacks.
- **Verification**: Complete component tree compiled and typechecked.

### TASK-014-05: Integrate Research Cockpit into Workspace Layout
- **Target File**: `web/src/app/page.tsx`
- **Status**: 🟢 COMPLETED
- **Scope**:
  - Mount `ResearchCockpit` prominently above the workspace views in the main area.
  - Wire session re-evaluation triggers.
- **Verification**: Production bundle successfully generated (`npm run build --prefix web`).

### TASK-014-06: Verification Suite & Knowledge Graph Update
- **Target**: Entire repository
- **Status**: 🟢 COMPLETED
- **Scope**:
  - `npm run typecheck --prefix web` (0 errors).
  - Next.js production build (`npm run build --prefix web`) (0 errors).
  - Backend regression check: `pytest backend/tests -m "not live"` (273 passing).
  - Update knowledge graph: `graphify update .`.
- **Verification**: Zero regressions detected; knowledge graph updated (6,568 nodes, 9,504 edges, 501 communities).
