"""
CONVERA Research Session Domain Schemas (SDD-021)
==================================================
Pydantic data models for research session persistence, checkpointing,
resume payloads, and clone operations under Phase D2.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ResearchSessionSummary(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    project_name: str
    framework_id: str = "RESEARCH"
    current_stage_id: str = "scouting"
    current_stage_name: str = "Phase A: Scouting & Discovery"
    stage_index: int = 0
    stage_completion_pct: float = 0.0
    active_problem_id: Optional[str] = None
    active_problem_title: Optional[str] = None
    active_domain_id: Optional[str] = None
    checkpoint_count: int = 0
    gate1_cleared: bool = False
    gate2_cleared: bool = False
    gate3_cleared: bool = False
    gate4_cleared: bool = False
    created_at: str
    updated_at: str


class CreateResearchSessionRequest(BaseModel):
    project_name: str = Field(..., min_length=3, max_length=150, description="Title of the research initiative")
    project_id: Optional[str] = None
    domain_id: Optional[str] = Field(None, description="Initial research domain code (e.g. D01)")
    initial_topic: Optional[str] = Field(None, description="Starting problem observation or topic brief")


class CreateCheckpointRequest(BaseModel):
    checkpoint_name: str = Field(..., min_length=2, max_length=100, description="Human-readable milestone label")
    description: Optional[str] = Field(None, max_length=500, description="Optional notes on why checkpoint was taken")
    created_by: str = Field("Researcher", description="User or role creating checkpoint")


class ResearchSessionCheckpointRecord(BaseModel):
    checkpoint_id: str
    session_id: str
    checkpoint_name: str
    description: Optional[str] = None
    stage_id: str
    stage_index: int
    state_hash: str
    created_by: str
    created_at: str


class SyncStageRequest(BaseModel):
    stage_id: str = Field(..., description="Target stage identifier, e.g. scouting, matrix, evaluation")
    stage_index: Optional[int] = Field(None, ge=0, le=5)
    stage_completion_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    active_problem_id: Optional[str] = None
    active_domain_id: Optional[str] = None


class ResearchSessionResumePayload(BaseModel):
    session: Dict[str, Any]
    summary: ResearchSessionSummary
    checkpoints: List[ResearchSessionCheckpointRecord] = Field(default_factory=list)
    active_problem: Optional[Dict[str, Any]] = None
    recent_events: List[Dict[str, Any]] = Field(default_factory=list)
    orchestration_status: Optional[Dict[str, Any]] = None


class CloneResearchSessionRequest(BaseModel):
    new_project_name: str = Field(..., min_length=3, max_length=150, description="Name for the cloned research session")
    include_literature: bool = Field(True, description="Whether to link existing scholarly works to cloned session")
    include_checkpoints: bool = Field(False, description="Whether to copy historical checkpoints")
