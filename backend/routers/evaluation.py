"""
CONVERA Intelligence Evaluation Router
======================================
Provides endpoints for confidence calibration, limitation vs gap discrimination,
decision integrity auditing, and intelligence scorecards.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from engines.evaluation_engine import ConveraEvaluationEngine

router = APIRouter(prefix="/api/evaluation", tags=["CONVERA Intelligence Evaluation"])

class CalibrateConfidenceRequest(BaseModel):
    ai_model_confidence: float = Field(0.95, description="Model linguistic certainty 0.0 - 1.0 or 0 - 100")
    evidence_items: List[Dict[str, Any]] = Field(default_factory=list)
    risk_level: str = Field("MEDIUM", description="LOW, MEDIUM, HIGH, CRITICAL")
    passed_validation_tests: int = 0

class DiscriminateGapRequest(BaseModel):
    statement: str

@router.post("/calibrate")
async def calibrate_confidence(req: CalibrateConfidenceRequest):
    engine = ConveraEvaluationEngine()
    result = engine.calibrate_confidence(
        ai_model_confidence=req.ai_model_confidence,
        evidence_items=req.evidence_items,
        risk_level=req.risk_level,
        passed_validation_tests=req.passed_validation_tests
    )
    return result

@router.post("/discriminate-gap")
async def discriminate_gap(req: DiscriminateGapRequest):
    engine = ConveraEvaluationEngine()
    result = engine.discriminate_gap_vs_limitation(req.statement)
    return result

@router.get("/decisions")
async def audit_decision_integrity(project_id: str = "default_proj"):
    engine = ConveraEvaluationEngine()
    return engine.audit_project_decision_integrity(project_id=project_id)

@router.get("/scorecard")
async def get_intelligence_scorecard(project_id: str = "default_proj"):
    engine = ConveraEvaluationEngine()
    return engine.generate_intelligence_scorecard(project_id=project_id)
