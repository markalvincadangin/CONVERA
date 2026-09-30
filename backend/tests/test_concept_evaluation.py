"""
Integration & Unit Tests for Concept Evaluation Framework (SDD-017)
==================================================================
Governed by: CONVERA Constitution Article I (Grounded Cognition),
             Article II (Tri-Part Confidence),
             Article IV (Human Sovereignty),
             Article VII (Anti-Creep Law),
             Article VIII (Degraded-State Resilience)
"""

import os
import tempfile
import pytest
from typing import Generator
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.concept_evaluation_engine import ConceptEvaluationEngine
from models.concept_evaluation import (
    ConceptEvaluationRequest,
    ConceptComparisonRequest,
    HumanReviewRequest,
    DimensionScores,
    EvaluationRecommendation,
    EvaluatorType,
)
from models.orchestrator import ActionType, OrchestrationActionDispatchRequest
from services.research_orchestrator import ResearchOrchestrator
from server import app

pytestmark = pytest.mark.integration


@pytest.fixture
def storage() -> Generator[SQLiteStorageAdapter, None, None]:
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    adapter = SQLiteStorageAdapter(db_path=path)
    yield adapter
    if os.path.exists(path):
        try:
            os.remove(path)
        except Exception:
            pass


@pytest.fixture
def engine(storage: SQLiteStorageAdapter) -> ConceptEvaluationEngine:
    return ConceptEvaluationEngine(storage=storage)


@pytest.fixture
def client(storage: SQLiteStorageAdapter) -> Generator[TestClient, None, None]:
    import storage.factory as storage_factory
    original_global = storage_factory._GLOBAL_STORAGE
    storage_factory._GLOBAL_STORAGE = storage
    original_storage = getattr(app.state, "storage", None)
    app.state.storage = storage
    with TestClient(app) as test_client:
        yield test_client
    storage_factory._GLOBAL_STORAGE = original_global
    if original_storage:
        app.state.storage = original_storage


def test_deterministic_scoring_formula(engine: ConceptEvaluationEngine):
    """Verify exact weighted sum formula across the 7 dimensions."""
    scores = DimensionScores(
        problem_relevance=90.0,
        evidence_grounding=80.0,
        gap_validity=70.0,
        stakeholder_impact=85.0,
        technical_feasibility=60.0,
        novelty_contribution=75.0,
        methodology_fit=65.0,
    )
    composite, rec = engine.calculate_deterministic_score(scores)
    assert composite == 76.25
    assert rec == EvaluationRecommendation.RECOMMENDED


def test_recommendation_thresholds(engine: ConceptEvaluationEngine):
    """Verify recommendation bands (>=75, >=60, >=45, <45)."""
    assert engine.calculate_deterministic_score(DimensionScores(**{d: 80.0 for d in DimensionScores.model_fields}))[1] == EvaluationRecommendation.RECOMMENDED
    assert engine.calculate_deterministic_score(DimensionScores(**{d: 65.0 for d in DimensionScores.model_fields}))[1] == EvaluationRecommendation.VIABLE_WITH_REFINEMENT
    assert engine.calculate_deterministic_score(DimensionScores(**{d: 50.0 for d in DimensionScores.model_fields}))[1] == EvaluationRecommendation.HIGH_RISK_REVISE
    assert engine.calculate_deterministic_score(DimensionScores(**{d: 40.0 for d in DimensionScores.model_fields}))[1] == EvaluationRecommendation.REJECT


@pytest.mark.asyncio
async def test_evaluate_and_persist_concept(engine: ConceptEvaluationEngine, storage: SQLiteStorageAdapter):
    """Verify single concept evaluation creates record in Table 34 and retrieves correctly."""
    req = ConceptEvaluationRequest(
        concept_id="DSR-ART-001",
        session_id="sess-test-017",
        prompt_guidance="Decentralized latency optimization model",
        include_llm_critique=False,
    )
    record = await engine.evaluate_concept(req)

    assert record["id"].startswith("EVAL-")
    assert record["concept_id"] == "DSR-ART-001"
    assert record["session_id"] == "sess-test-017"
    assert 0.0 <= record["composite_score"] <= 100.0
    assert record.get("falsification_advisory") is not None
    assert len(record.get("strengths") or []) > 0
    assert len(record.get("vulnerabilities") or []) > 0

    # Verify storage persistence
    saved = storage.get_concept_evaluation(record["id"])
    assert saved is not None
    assert saved["concept_id"] == "DSR-ART-001"

    # Verify listing by session
    session_evals = storage.list_concept_evaluations(session_id="sess-test-017")
    assert len(session_evals) >= 1
    assert any(e["id"] == record["id"] for e in session_evals)


@pytest.mark.asyncio
async def test_compare_concepts_ranking_and_tradeoff(engine: ConceptEvaluationEngine):
    """Verify multi-concept comparison produces descending rank and pairwise tradeoff matrix."""
    r1 = await engine.evaluate_concept(ConceptEvaluationRequest(
        concept_id="CAND-A",
        session_id="sess-comp-test",
        include_llm_critique=False,
    ))
    r2 = await engine.evaluate_concept(ConceptEvaluationRequest(
        concept_id="CAND-B",
        session_id="sess-comp-test",
        include_llm_critique=False,
    ))

    comp_req = ConceptComparisonRequest(
        concept_ids=["CAND-A", "CAND-B"],
        session_id="sess-comp-test",
        include_llm_critique=False,
    )
    comp_res = await engine.compare_concepts(comp_req)

    assert len(comp_res.rankings) == 2
    assert comp_res.rankings[0].composite_score >= comp_res.rankings[1].composite_score
    assert comp_res.recommended_winner_id == comp_res.rankings[0].concept_id
    assert comp_res.winner_rationale != ""

    matrix = comp_res.tradeoff_matrix
    assert "CAND-A" in matrix or "CAND-B" in matrix


@pytest.mark.asyncio
async def test_human_review_expert_override(engine: ConceptEvaluationEngine, storage: SQLiteStorageAdapter):
    """Verify Article IV Human Sovereignty review override modifies score and sets HUMAN_EXPERT."""
    record = await engine.evaluate_concept(ConceptEvaluationRequest(
        concept_id="CAND-HUMAN",
        session_id="sess-human-test",
        include_llm_critique=False,
    ))

    review_req = HumanReviewRequest(
        concept_id="CAND-HUMAN",
        session_id="sess-human-test",
        dimension_scores={
            "problem_relevance": 95.0,
            "evidence_grounding": 90.0,
            "gap_validity": 90.0,
            "stakeholder_impact": 85.0,
            "technical_feasibility": 80.0,
            "novelty_contribution": 85.0,
            "methodology_fit": 80.0,
        },
        recommendation=EvaluationRecommendation.RECOMMENDED,
        reviewer_notes="Doctoral committee certified thesis viability after empirical review.",
        falsification_advisory="Falsified if throughput drops below 100 req/s in field trials.",
    )
    updated = await engine.record_human_review(review_req)

    assert updated.evaluator_type == EvaluatorType.HUMAN_EXPERT
    assert updated.recommendation == EvaluationRecommendation.RECOMMENDED
    assert updated.composite_score >= 85.0
    assert updated.narrative_summary == "Doctoral committee certified thesis viability after empirical review."
    assert "100 req/s" in (updated.falsification_advisory or "")

    persisted = storage.get_concept_evaluation(updated.id)
    assert persisted["evaluator_type"] == "HUMAN_EXPERT"


@pytest.mark.asyncio
async def test_orchestrator_evaluate_concept_dispatch(storage: SQLiteStorageAdapter):
    """Verify ActionType.EVALUATE_CONCEPT dispatches through ResearchOrchestrator."""
    orchestrator = ResearchOrchestrator(storage=storage)
    session_id = "sess-orch-eval"
    storage.save_session(session_id, {"project_name": "Test Eval Orch"})

    dispatch_req = OrchestrationActionDispatchRequest(
        session_id=session_id,
        action_type=ActionType.EVALUATE_CONCEPT,
        target_engine="concept_evaluation_engine",
        parameters={
            "concept_id": "DSR-ORCH-01",
            "concept_title": "Edge Kernel Accelerator",
            "include_llm_critique": False,
        },
    )
    result = await orchestrator.dispatch_action(dispatch_req)

    assert result.status == "SUCCESS"
    assert "DSR-ORCH-01" in result.execution_summary or "Edge Kernel Accelerator" in result.execution_summary
    assert "evaluation" in result.resulting_artifacts


def test_api_router_endpoints(client: TestClient):
    """Verify all 5 endpoints in /api/evaluations/* return valid responses."""
    # 1. POST /api/evaluations/evaluate-concept
    resp = client.post(
        "/api/evaluations/evaluate-concept",
        json={"concept_id": "API-TEST-01", "session_id": "sess-api-test", "include_llm_critique": False},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["evaluation"]["concept_id"] == "API-TEST-01"

    # 2. GET /api/evaluations/concept/{concept_id}
    resp = client.get("/api/evaluations/concept/API-TEST-01")
    assert resp.status_code == 200
    assert len(resp.json()["evaluations"]) >= 1

    # 3. GET /api/evaluations/session/{session_id}
    resp = client.get("/api/evaluations/session/sess-api-test")
    assert resp.status_code == 200
    assert len(resp.json()["evaluations"]) >= 1

    # 4. POST /api/evaluations/compare-concepts
    client.post(
        "/api/evaluations/evaluate-concept",
        json={"concept_id": "API-TEST-02", "session_id": "sess-api-test", "include_llm_critique": False},
    )
    comp_resp = client.post(
        "/api/evaluations/compare-concepts",
        json={"concept_ids": ["API-TEST-01", "API-TEST-02"], "session_id": "sess-api-test", "include_llm_critique": False},
    )
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert len(comp_data["comparison"]["rankings"]) == 2

    # 5. POST /api/evaluations/human-review
    rev_resp = client.post(
        "/api/evaluations/human-review",
        json={
            "concept_id": "API-TEST-01",
            "session_id": "sess-api-test",
            "reviewer_notes": "Supervisor verified.",
            "recommendation": "RECOMMENDED",
        },
    )
    assert rev_resp.status_code == 200
    assert rev_resp.json()["evaluation"]["evaluator_type"] == "HUMAN_EXPERT"
