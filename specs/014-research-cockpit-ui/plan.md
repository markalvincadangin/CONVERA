# CONVERA SDD-014: Research Cockpit UI Technical Plan
# Active Research Cockpit & Orchestration Frontend Integration

**Specification ID**: CONVERA-SDD-014  
**Classification**: Technical & Architectural Implementation Plan  
**Authority Tier**: Tier 2 (Engineering Plan)  
**Document Status**: 🟡 FORMULATED / PENDING HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Canonical Path**: `specs/014-research-cockpit-ui/plan.md`  
**Parent Specification**: `specs/014-research-cockpit-ui/spec.md`  

---

## 1. Technical Architecture & Component Tree

The Research Cockpit provides a unified, reactive control deck mounted above or within the active workspace view, continuously synchronized with the backend Orchestrator Engine.

```text
[ResearchCockpit Container]
  │
  ├── [OverconfidenceBanner] (Conditional: overconfidence_risk === true)
  │     ├── Warning text with decoupled AI confidence telemetry
  │     └── Action: "Challenge with Socratic Critique" (Dispatch)
  │
  ├── [Grid: 2 Columns on Desktop, 1 on Mobile]
  │     │
  │     ├── [Left Column: Tactical Execution]
  │     │     ├── [StageGateMonitor]
  │     │     │     ├── Active Stage Badge & Gate Status (Locked / Ready)
  │     │     │     ├── Prerequisites satisfied vs missing checklist
  │     │     │     └── Required deliverables checklist
  │     │     │
  │     │     └── [RecommendedActionCard]
  │     │           ├── Top Priority Action Card (URGENT / HIGH / MEDIUM / LOW)
  │     │           ├── Target Engine Badge (scholarly_retrieval, devils_advocate, etc.)
  │     │           ├── Rationale & Action Description
  │     │           └── "Execute Action" Button (Dispatches & triggers UI refresh)
  │     │
  │     └── [Right Column: Epistemic Telemetry & Governance]
  │           ├── [EpistemicHealthMeter]
  │           │     ├── Net Epistemic Balance Meter (-1.00 to +1.00)
  │           │     ├── Facts vs Assumptions Ratio Bar
  │           │     └── Empirical Evidence & Scholarly Works Count
  │           │
  │           └── [CockpitToolbar & Audit Link]
  │                 ├── Manual "Evaluate State" Refresh Trigger
  │                 └── "View Orchestration Audit Trail" Trigger
  │
  └── [OrchestrationEventsDrawer] (Slide-over drawer)
        ├── Chronological events list from GET /api/orchestrator/session/{session_id}/events
        └── Status badges (SUCCESS, DEGRADED, ERROR), payloads, and execution summaries
```

---

## 2. API Contract & Service Integration

### `web/src/services/orchestratorService.ts`
Uses the standard `fetchApi` client:

```typescript
export interface RecommendedAction {
  action_id: string;
  action_type: string;
  title: string;
  description: string;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  blocking_stage_progression: boolean;
  target_engine: string;
  suggested_payload: Record<string, any>;
}

export interface OrchestrationStageStatus {
  stage_id: string;
  stage_name: string;
  stage_index: number;
  prerequisites_satisfied: boolean;
  missing_prerequisites: string[];
  required_outputs: string[];
  missing_outputs: string[];
  gate_ready: boolean;
}

export interface EpistemicHealthSummary {
  facts_count: number;
  assumptions_count: number;
  evidence_items_count: number;
  scholarly_works_count: number;
  net_epistemic_balance: number;
  overconfidence_risk: boolean;
  overconfidence_details?: string | null;
}

export interface CritiqueSummary {
  active_critiques_count: number;
  identified_blind_spots: string[];
  socratic_questions: string[];
}

export interface OrchestrationEvaluationResult {
  session_id: string;
  problem_id?: string | null;
  framework_id: string;
  stage_id: string;
  evaluated_at: string;
  stage_status: OrchestrationStageStatus;
  epistemic_health: EpistemicHealthSummary;
  critique_summary: CritiqueSummary;
  recommended_actions: RecommendedAction[];
  narrative_guidance?: string | null;
}

export interface OrchestrationActionDispatchRequest {
  session_id: string;
  problem_id?: string | null;
  action_type: string;
  target_engine: string;
  parameters?: Record<string, any>;
}

export interface OrchestrationActionDispatchResult {
  event_id: string;
  session_id: string;
  action_type: string;
  status: "SUCCESS" | "DEGRADED" | "ERROR";
  execution_summary: string;
  resulting_artifacts: Record<string, any>;
}

export interface OrchestrationEventRecord {
  id: string;
  session_id: string;
  problem_id?: string | null;
  framework_id: string;
  stage_id: string;
  event_type: string;
  payload: Record<string, any>;
  created_by: string;
  created_at: string;
}
```

---

## 3. UI/UX Design System Compliance (CCDS v2.0)

- **Colors & Surfaces**:
  - Container: `bg-neutral-900/90 border border-neutral-800`
  - Header: `text-neutral-100 font-semibold tracking-tight`
  - Secondary text: `text-neutral-400 text-xs`
  - Emerald Accents: `emerald-500` for satisfied prerequisites and healthy epistemic balance.
  - Amber Accents: `amber-500` for missing inputs and warnings.
  - Rose Accents: `rose-500` for `URGENT` blocking actions and Article II Overconfidence risks.
- **Button Standards**:
  - `whitespace-nowrap inline-flex items-center justify-center gap-1.5`
  - Icon sizes: `w-3.5 h-3.5` or `w-4 h-4`.
- **Motion & Reactivity**:
  - Framer Motion transitions with duration $\le 0.2\text{s}$ for smooth responsiveness without lag.

---

## 4. Verification & Testing Strategy

1. **TypeScript Compilation**: `npm run typecheck --prefix web` with zero errors.
2. **Offline Fallback Resilience**: When the backend is offline, the component renders gracefully with a fallback status indicator without throwing React uncaught errors.
3. **Dispatch Feedback**: Interactive action dispatch button displays loading spinner, disables repeated clicks, and emits a toast upon completion.
4. **Automated Verification**: Build validation via Next.js compiler.
