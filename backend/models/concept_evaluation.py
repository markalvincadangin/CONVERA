"""
Data Models for Concept Evaluation Framework (SDD-017)
Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class EvaluatorType(str, Enum):
    DETERMINISTIC_RUBRIC = "DETERMINISTIC_RUBRIC"
    AI_CRITIC = "AI_CRITIC"
    HUMAN_EXPERT = "HUMAN_EXPERT"


class EvaluationRecommendation(str, Enum):
    RECOMMENDED = "RECOMMENDED"
    VIABLE_WITH_REFINEMENT = "VIABLE_WITH_REFINEMENT"
    HIGH_RISK_REVISE = "HIGH_RISK_REVISE"
    REJECT = "REJECT"


class DimensionScores(BaseModel):
    problem_relevance: float = Field(default=50.0, ge=0.0, le=100.0)
    evidence_grounding: float = Field(default=50.0, ge=0.0, le=100.0)
    gap_validity: float = Field(default=50.0, ge=0.0, le=100.0)
    stakeholder_impact: float = Field(default=50.0, ge=0.0, le=100.0)
    technical_feasibility: float = Field(default=50.0, ge=0.0, le=100.0)
    novelty_contribution: float = Field(default=50.0, ge=0.0, le=100.0)
    methodology_fit: float = Field(default=50.0, ge=0.0, le=100.0)


class ConceptEvaluationRecord(BaseModel):
    id: str
    concept_id: str
    session_id: Optional[str] = None
    evaluator_type: EvaluatorType = EvaluatorType.DETERMINISTIC_RUBRIC
    composite_score: float = Field(..., ge=0.0, le=100.0)
    dimension_scores: DimensionScores
    strengths: List[str] = Field(default_factory=list)
    vulnerabilities: List[str] = Field(default_factory=list)
    falsification_advisory: Optional[str] = None
    recommendation: EvaluationRecommendation = EvaluationRecommendation.VIABLE_WITH_REFINEMENT
    narrative_summary: Optional[str] = None
    is_degraded: bool = False
    created_at: str


class ConceptComparisonResult(BaseModel):
    session_id: Optional[str] = None
    rankings: List[ConceptEvaluationRecord]
    tradeoff_matrix: Dict[str, Dict[str, str]] = Field(default_factory=dict)
    recommended_winner_id: Optional[str] = None
    winner_rationale: str = ""


class ConceptEvaluationRequest(BaseModel):
    concept_id: str
    session_id: Optional[str] = None
    prompt_guidance: Optional[str] = None
    weights: Optional[Dict[str, float]] = None
    include_llm_critique: bool = True


class ConceptComparisonRequest(BaseModel):
    concept_ids: List[str]
    session_id: Optional[str] = None
    weights: Optional[Dict[str, float]] = None
    include_llm_critique: bool = True


class HumanReviewRequest(BaseModel):
    concept_id: str
    session_id: Optional[str] = None
    dimension_scores: Optional[Dict[str, float]] = None
    recommendation: Optional[EvaluationRecommendation] = None
    reviewer_notes: Optional[str] = None
    falsification_advisory: Optional[str] = None
