"""
CONVERA Research Orchestrator Models
====================================
Domain and API schemas for the unified research intelligence loop (SDD-013).
"""

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
    FORMULATE_DSR_ARTIFACT = "FORMULATE_DSR_ARTIFACT"
    EVALUATE_CONCEPT = "EVALUATE_CONCEPT"
    AUDIT_COMPLIANCE_FEASIBILITY = "AUDIT_COMPLIANCE_FEASIBILITY"
    COMPILE_PROPOSAL_CANVAS = "COMPILE_PROPOSAL_CANVAS"


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
    problem_id: Optional[str] = None
    framework_id: str
    stage_id: str
    evaluated_at: str
    stage_status: OrchestrationStageStatus
    epistemic_health: EpistemicHealthSummary
    critique_summary: CritiqueSummary
    recommended_actions: List[RecommendedAction] = Field(default_factory=list)
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
