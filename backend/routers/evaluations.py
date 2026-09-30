"""
FastAPI Router for Concept Evaluation Framework (SDD-017)
Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query

from engines.concept_evaluation_engine import ConceptEvaluationEngine
from models.concept_evaluation import (
    ConceptComparisonRequest,
    ConceptEvaluationRequest,
    HumanReviewRequest,
)
from storage.factory import get_storage

router = APIRouter(prefix="/api/evaluations", tags=["Concept Evaluation Framework"])


@router.post("/evaluate-concept")
async def evaluate_concept_endpoint(req: ConceptEvaluationRequest) -> Dict[str, Any]:
    """
    Evaluates a candidate research concept / DSR artifact across 7 canonical dimensions
    with deterministic composite scoring and inverted qualitative AI critique.
    """
    storage = get_storage()
    engine = ConceptEvaluationEngine(storage=storage)
    try:
        evaluation = await engine.evaluate_concept(
            concept_id=req.concept_id,
            session_id=req.session_id,
            prompt_guidance=req.prompt_guidance,
            weights=req.weights,
            include_llm_critique=req.include_llm_critique,
        )
        return {"status": "success", "evaluation": evaluation}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Evaluation execution failed: {str(e)}"
        )


@router.post("/compare-concepts")
async def compare_concepts_endpoint(req: ConceptComparisonRequest) -> Dict[str, Any]:
    """
    Compares 2 to 5 candidate concepts side-by-side with total ordering and pairwise trade-off matrix.
    """
    if not req.concept_ids:
        raise HTTPException(
            status_code=400, detail="concept_ids list must not be empty."
        )

    storage = get_storage()
    engine = ConceptEvaluationEngine(storage=storage)
    try:
        comparison = await engine.compare_concepts(
            concept_ids=req.concept_ids,
            session_id=req.session_id,
            weights=req.weights,
            include_llm_critique=req.include_llm_critique,
        )
        return {"status": "success", "comparison": comparison.model_dump()}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Comparison execution failed: {str(e)}"
        )


@router.get("/concept/{concept_id}")
async def list_concept_evaluations_endpoint(concept_id: str) -> Dict[str, Any]:
    """Lists historical evaluation records for a specific concept/artifact."""
    storage = get_storage()
    evaluations = storage.list_concept_evaluations(concept_id=concept_id)
    return {
        "status": "success",
        "concept_id": concept_id,
        "count": len(evaluations),
        "evaluations": evaluations,
    }


@router.get("/session/{session_id}")
async def list_session_evaluations_endpoint(session_id: str) -> Dict[str, Any]:
    """Lists all concept evaluations conducted during a research session."""
    storage = get_storage()
    evaluations = storage.list_concept_evaluations(session_id=session_id)
    return {
        "status": "success",
        "session_id": session_id,
        "count": len(evaluations),
        "evaluations": evaluations,
    }


@router.post("/human-review")
async def submit_human_review_endpoint(req: HumanReviewRequest) -> Dict[str, Any]:
    """
    Records a human researcher's expert review, rubric adjustments, and Stage Gate 3 clearance
    in accordance with Article IV Human Sovereignty.
    """
    storage = get_storage()
    engine = ConceptEvaluationEngine(storage=storage)
    try:
        review_record = engine.save_human_review(
            concept_id=req.concept_id,
            session_id=req.session_id,
            dimension_scores=req.dimension_scores,
            recommendation=req.recommendation.value if req.recommendation else None,
            reviewer_notes=req.reviewer_notes,
            falsification_advisory=req.falsification_advisory,
        )
        return {"status": "success", "evaluation": review_record}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to record human review: {str(e)}"
        )
