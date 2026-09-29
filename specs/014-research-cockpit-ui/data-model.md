# CONVERA SDD-014: Research Cockpit Data Model & Contracts
# Active Research Cockpit & Orchestration Frontend Integration

**Specification ID**: CONVERA-SDD-014  
**Classification**: Data Model, Interface Contracts & State Machine  
**Authority Tier**: Tier 2 (Technical Specification)  
**Document Status**: 🟡 FORMULATED / PENDING HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Canonical Path**: `specs/014-research-cockpit-ui/data-model.md`  

---

## 1. Domain Entities & Type Definitions

The frontend data models mirror the backend Pydantic models in `backend/models/orchestrator.py` with TypeScript strictness.

```typescript
export type ActionPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export type ActionType =
  | "ACQUIRE_EVIDENCE"
  | "CHALLENGE_ASSUMPTION"
  | "RESOLVE_CONTRADICTION"
  | "SYNTHESIZE_LITERATURE"
  | "EXECUTE_CRITIQUE"
  | "FORMULATE_DECISION"
  | "GENERATE_STAGE_DELIVERABLE"
  | "REQUEST_GATE_REVIEW";

export interface RecommendedAction {
  action_id: string;
  action_type: ActionType;
  title: string;
  description: string;
  priority: ActionPriority;
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

## 2. Component Prop Interfaces

### `ResearchCockpitProps`
```typescript
export interface ResearchCockpitProps {
  session: SessionState | null;
  activeProblemId?: string | null;
  onRefreshSession?: () => void;
  onNavigatePhase?: (phase: number) => void;
  className?: string;
}
```

### `StageGateMonitorProps`
```typescript
export interface StageGateMonitorProps {
  stageStatus: OrchestrationStageStatus;
  onOpenGateReview?: () => void;
}
```

### `EpistemicHealthMeterProps`
```typescript
export interface EpistemicHealthMeterProps {
  health: EpistemicHealthSummary;
  onOpenScorecard?: () => void;
}
```

### `OverconfidenceBannerProps`
```typescript
export interface OverconfidenceBannerProps {
  details: string;
  onChallenge: () => void;
  isDispatching?: boolean;
}
```

### `RecommendedActionCardProps`
```typescript
export interface RecommendedActionCardProps {
  action: RecommendedAction;
  onDispatch: (action: RecommendedAction) => Promise<void>;
  isDispatching?: boolean;
}
```

### `OrchestrationEventsDrawerProps`
```typescript
export interface OrchestrationEventsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}
```

---

## 3. Cockpit State Machine

```text
    ┌──────────────┐
    │   UNMOUNTED  │
    └──────┬───────┘
           │ session loaded
           ▼
    ┌──────────────┐
    │  EVALUATING  │◄─────────────────────────────┐
    └──────┬───────┘                              │
           │ success                              │
           ▼                                      │
    ┌──────────────┐                              │
    │  EVALUATED   ├──────[Dispatch Action]───────┤
    └──────┬───────┘                              │
           │ error / offline                      │
           ▼                                      │
    ┌──────────────┐                              │
    │   DEGRADED   ├──────[Retry Connection]──────┘
    └──────────────┘
```
