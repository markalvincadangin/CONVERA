"""
CONVERA Research Cross-Stage Critique & Blind-Spot Models (SDD-019)
===================================================================
Pydantic v2 domain schemas for cross-stage research critiques, epistemic
consistency scoring, and Article IV human sovereignty resolution.
"""

from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class CritiqueType(str, Enum):
    CROSS_STAGE_BLIND_SPOT = "CROSS_STAGE_BLIND_SPOT"
    EVIDENCE_VULNERABILITY = "EVIDENCE_VULNERABILITY"
    CIRCUMSCRIPTION_TENSION = "CIRCUMSCRIPTION_TENSION"
    ETHICS_FEASIBILITY_DISCORD = "ETHICS_FEASIBILITY_DISCORD"


class CritiqueSeverity(str, Enum):
    FATAL = "FATAL"
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    ADVISORY = "ADVISORY"


class CritiqueStatus(str, Enum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class CrossStageClaimExcerpt(BaseModel):
    stage: str = Field(..., description="Stage identifier (e.g. STAGE_A, STAGE_C, STAGE_D, STAGE_E, STAGE_F)")
    claim_title: str = Field(..., description="Title or summary of the claim or design choice")
    excerpt: str = Field(..., description="Verbatim statement or observed empirical metric")


class CrossStageCritiqueRecord(BaseModel):
    id: str
    session_id: str
    project_id: Optional[str] = None
    critique_type: CritiqueType
    severity: CritiqueSeverity
    target_stages: List[str] = Field(default_factory=list, description="Stages implicated in the tension")
    cross_stage_claims: List[CrossStageClaimExcerpt] = Field(default_factory=list, description="Contradictory claims")
    fatal_flaw_summary: str = Field(..., description="Concise statement of why this constitutes a research vulnerability")
    kill_question: str = Field(..., description="Socratic question exposing the vulnerability during defense")
    mitigation_recommendation: str = Field(..., description="Actionable recommendation to resolve the contradiction")
    plausibility_score: float = Field(default=50.0, ge=0.0, le=100.0, description="Confidence in the critique validity")
    status: CritiqueStatus = CritiqueStatus.OPEN
    resolution_notes: Optional[str] = None
    is_degraded: bool = False
    created_at: str
    resolved_at: Optional[str] = None


class CritiqueEvaluationRequest(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    problem_id: Optional[str] = None
    include_ai_advisory: bool = True


class CritiqueEvaluationResponse(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    consistency_score: float = Field(..., ge=0.0, le=100.0, description="Deterministic cross-stage consistency score")
    total_critiques: int
    open_critiques: int
    fatal_count: int
    critical_count: int
    warning_count: int
    advisory_count: int
    critiques: List[CrossStageCritiqueRecord]
    evaluated_at: str
    is_degraded: bool = False


class ResolveCritiqueRequest(BaseModel):
    critique_id: str
    status: CritiqueStatus = Field(..., description="New status (RESOLVED or DISMISSED)")
    resolution_notes: str = Field(
        ...,
        min_length=5,
        description="Explicit human rationale required per Article IV Human Sovereignty (INV-019-03)"
    )
