# CONVERA SDD-013: Data Model Specification
# Research Orchestration Engine (Unified Intelligence & Research Loop)

**Specification ID**: CONVERA-SDD-013  
**Classification**: Data Architecture, Pydantic Schemas & Relational Event Logging  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Canonical Path**: `specs/013-research-orchestration-engine/data-model.md`  
**Upstream Dependencies**: `specs/013-research-orchestration-engine/spec.md`, `specs/011-methodology-contract/`  

---

## 1. Relational Database Schema (`orchestration_events`)

To satisfy Constitution Article III (Provenance Integrity) and Article VII (Documentation Authority), the Orchestrator records all evaluation and action dispatch events in an auditable relational table in SQLite:

```sql
CREATE TABLE IF NOT EXISTS orchestration_events (
    id TEXT PRIMARY KEY,                       -- Deterministic or UUID ID: 'ORCH-EVT-' + SHA256(...)[:16]
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    problem_id TEXT REFERENCES problems(id) ON DELETE SET NULL,
    framework_id TEXT NOT NULL,                -- e.g. 'RESEARCH_CRCDP', 'INNOVATION_RATCHET'
    stage_id TEXT NOT NULL,                    -- Active stage ID at evaluation time
    event_type TEXT NOT NULL,                  -- 'EVALUATION', 'ACTION_DISPATCHED', 'GATE_RECOMMENDED'
    payload TEXT NOT NULL,                     -- JSON serialized evaluation result or action payload
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orch_events_session ON orchestration_events(session_id);
CREATE INDEX IF NOT EXISTS idx_orch_events_problem ON orchestration_events(problem_id);
CREATE INDEX IF NOT EXISTS idx_orch_events_stage ON orchestration_events(framework_id, stage_id);
```

---

## 2. Core Pydantic Domain Models

The Orchestrator exposes typed, validated domain models implemented in `backend/models/orchestrator.py`:

```python
from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ActionPriority(str, Enum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ActionType(str, Enum):
    ACQUIRE_EVIDENCE = "ACQUIRE_EVIDENCE"
    CHALLENGE_ASSUMPTION = "CHALLENGE_ASSUMPTION"
    RESOLVE_CONTRADICTION = "RESOLVE_CONTRADICTION"
    SYNTHESIZE_LITERATURE = "SYNTHESIZE_LITERATURE"
    EXECUTE_CRITIQUE = "EXECUTE_CRITIQUE"
    FORMULATE_DECISION = "FORMULATE_DECISION"
    GENERATE_STAGE_DELIVERABLE = "GENERATE_STAGE_DELIVERABLE"
    REQUEST_GATE_REVIEW = "REQUEST_GATE_REVIEW"


class RecommendedAction(BaseModel):
    action_id: str
    action_type: ActionType
    title: str
    description: str
    priority: ActionPriority
    blocking_stage_progression: bool
    target_engine: str
    suggested_payload: Dict[str, Any] = Field(default_factory=dict)


class OrchestrationStageStatus(BaseModel):
    stage_id: str
    stage_name: str
    stage_index: int
    prerequisites_satisfied: bool
    missing_prerequisites: List[str] = Field(default_factory=list)
    required_outputs: List[str] = Field(default_factory=list)
    missing_outputs: List[str] = Field(default_factory=list)
    gate_ready: bool


class EpistemicHealthSummary(BaseModel):
    facts_count: int
    assumptions_count: int
    evidence_items_count: int
    scholarly_works_count: int
    net_epistemic_balance: float
    overconfidence_risk: bool
    overconfidence_details: Optional[str] = None


class CritiqueSummary(BaseModel):
    blind_spots: List[Dict[str, Any]] = Field(default_factory=list)
    contradictions: List[Dict[str, Any]] = Field(default_factory=list)
    devils_advocate_questions: List[str] = Field(default_factory=list)


class OrchestrationEvaluationResult(BaseModel):
    session_id: str
    problem_id: Optional[str]
    framework_id: str
    stage_id: str
    evaluated_at: str
    stage_status: OrchestrationStageStatus
    epistemic_health: EpistemicHealthSummary
    critique_summary: CritiqueSummary
    recommended_actions: List[RecommendedAction]
    narrative_guidance: Optional[str] = None


class OrchestrationActionDispatchRequest(BaseModel):
    session_id: str
    problem_id: Optional[str] = None
    action_type: ActionType
    target_engine: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class OrchestrationActionDispatchResult(BaseModel):
    event_id: str
    session_id: str
    action_type: ActionType
    status: str  # 'SUCCESS', 'DEGRADED', 'ERROR'
    execution_summary: str
    resulting_artifacts: Dict[str, Any] = Field(default_factory=dict)
```

---

## 3. Epistemic Rule Definition: Action Priority Hierarchy

Actions are deterministically prioritized by the Orchestrator according to the following order of precedence:

1. **`URGENT (Priority 1)`**:
   - `OVERCONFIDENCE_WARNING` triggered (High linguistic certainty $\ge 0.80$ with empirical evidence $\le 0.40$). Action: `CHALLENGE_ASSUMPTION`.
   - Mandatory stage input prerequisite completely missing. Action: `ACQUIRE_EVIDENCE` or intake form completion.
2. **`HIGH (Priority 2)`**:
   - Active contradictory evidence detected between two peer-reviewed sources. Action: `RESOLVE_CONTRADICTION`.
   - Zero scholarly citations linked to a core claim. Action: `SYNTHESIZE_LITERATURE`.
3. **`MEDIUM (Priority 3)`**:
   - Blind spots detected in stakeholder coverage or technical feasibility. Action: `EXECUTE_CRITIQUE`.
   - Stage outputs partially completed. Action: `GENERATE_STAGE_DELIVERABLE`.
4. **`LOW / NEXT (Priority 4)`**:
   - All gate conditions satisfied; waiting for human review. Action: `REQUEST_GATE_REVIEW`.
