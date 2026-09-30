"""
CONVERA DSR Artifact Ideation Models
====================================
Domain and API schemas for Design Science Research (DSR) artifact formulation (SDD-016).
Follows March & Smith (1995) 4-artifact taxonomy (Construct, Model, Method, Instantiation).
"""

from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class DSRArtifactClass(str, Enum):
    CONSTRUCT = "CONSTRUCT"
    MODEL = "MODEL"
    METHOD = "METHOD"
    INSTANTIATION = "INSTANTIATION"


class DSRArtifactStatus(str, Enum):
    PROPOSED = "PROPOSED"
    SELECTED = "SELECTED"
    REFUTED = "REFUTED"
    ARCHIVED = "ARCHIVED"


class DSRArtifactBase(BaseModel):
    problem_id: str
    session_id: Optional[str] = None
    title: str
    dsr_class: DSRArtifactClass
    description: str
    kernel_theory: str
    targeted_gap_ids: List[str] = Field(default_factory=list)
    linked_claim_ids: List[str] = Field(default_factory=list)
    formal_specification: Optional[str] = None
    simpler_baseline_alternative: Optional[str] = None
    contextual_constraints: List[str] = Field(default_factory=list)
    feasibility_score: float = Field(default=0.50, ge=0.0, le=1.0)
    novelty_score: float = Field(default=0.50, ge=0.0, le=1.0)
    status: DSRArtifactStatus = DSRArtifactStatus.PROPOSED
    provenance: Dict[str, Any] = Field(default_factory=dict)


class DSRArtifactCreate(BaseModel):
    problem_id: str
    session_id: Optional[str] = None
    title: str
    dsr_class: DSRArtifactClass
    description: str
    kernel_theory: str
    targeted_gap_ids: List[str] = Field(default_factory=list)
    linked_claim_ids: List[str] = Field(default_factory=list)
    formal_specification: Optional[str] = None
    simpler_baseline_alternative: Optional[str] = None
    contextual_constraints: List[str] = Field(default_factory=list)
    feasibility_score: float = Field(default=0.50, ge=0.0, le=1.0)
    novelty_score: float = Field(default=0.50, ge=0.0, le=1.0)
    status: DSRArtifactStatus = DSRArtifactStatus.PROPOSED
    provenance: Dict[str, Any] = Field(default_factory=dict)


class DSRArtifactUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    kernel_theory: Optional[str] = None
    formal_specification: Optional[str] = None
    simpler_baseline_alternative: Optional[str] = None
    targeted_gap_ids: Optional[List[str]] = None
    linked_claim_ids: Optional[List[str]] = None
    contextual_constraints: Optional[List[str]] = None
    feasibility_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    novelty_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    status: Optional[DSRArtifactStatus] = None
    provenance: Optional[Dict[str, Any]] = None


class DSRArtifactResponse(BaseModel):
    id: str
    problem_id: str
    session_id: Optional[str] = None
    title: str
    dsr_class: DSRArtifactClass
    description: str
    kernel_theory: str
    targeted_gap_ids: List[str] = Field(default_factory=list)
    linked_claim_ids: List[str] = Field(default_factory=list)
    formal_specification: Optional[str] = None
    simpler_baseline_alternative: Optional[str] = None
    contextual_constraints: List[str] = Field(default_factory=list)
    feasibility_score: float = 0.50
    novelty_score: float = 0.50
    status: DSRArtifactStatus = DSRArtifactStatus.PROPOSED
    provenance: Dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str


class IdeationGenerationRequest(BaseModel):
    problem_id: str
    session_id: Optional[str] = None
    classes: Optional[List[DSRArtifactClass]] = None
    prompt_guidance: Optional[str] = None
    max_candidates_per_class: int = Field(default=1, ge=1, le=5)


class IdeationGenerationResponse(BaseModel):
    problem_id: str
    generated_artifacts: List[DSRArtifactResponse] = Field(default_factory=list)
    total_generated: int = 0
    kernel_theories_explored: List[str] = Field(default_factory=list)
    baseline_alternatives_considered: List[str] = Field(default_factory=list)
