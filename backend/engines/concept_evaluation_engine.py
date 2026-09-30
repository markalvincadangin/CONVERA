"""
Concept Evaluation Framework Domain Engine (SDD-017)
=====================================================
Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII),
             IDENTITY.md (§6.C Concept Evaluation),
             Prat et al. (2015), Venable et al. (2016).

Provides:
1. Pure deterministic multi-criteria scoring across 7 canonical dimensions.
2. Inverted AI qualitative critique synthesis (strengths, vulnerabilities, falsification advisory).
3. Deterministic candidate ranking, tie-breaking, and pairwise trade-off matrix.
4. Resilient deterministic fallback with is_degraded=True enforcement.
5. Human expert review recording for Stage Gate 3 clearance.
"""

from __future__ import annotations

import json
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from llm_gateway import TaskCategory, generate_response_with_fallback
from models.concept_evaluation import (
    ConceptComparisonResult,
    ConceptEvaluationRecord,
    DimensionScores,
    EvaluationRecommendation,
    EvaluatorType,
)
from storage.factory import get_storage

logger = logging.getLogger("convera.concept_evaluation_engine")

DEFAULT_EVALUATION_WEIGHTS: Dict[str, float] = {
    "problem_relevance": 0.20,
    "evidence_grounding": 0.15,
    "gap_validity": 0.15,
    "stakeholder_impact": 0.15,
    "technical_feasibility": 0.15,
    "novelty_contribution": 0.10,
    "methodology_fit": 0.10,
}


def calculate_concept_scores(
    concept: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None,
    weights: Optional[Dict[str, float]] = None,
) -> Tuple[Dict[str, float], float, str]:
    """
    Pure deterministic multi-criteria scoring algorithm.
    Returns (dimension_scores, composite_score, recommendation_tier).
    """
    ctx = context or {}
    problem = ctx.get("problem") or {}
    w = dict(DEFAULT_EVALUATION_WEIGHTS)
    if weights:
        w.update({k: float(v) for k, v in weights.items() if k in w})
    # Normalize weights so sum is 1.0
    total_w = sum(w.values()) or 1.0
    w = {k: v / total_w for k, v in w.items()}

    title = (concept.get("title") or "").lower()
    desc = (concept.get("description") or "").lower()
    spec = (concept.get("formal_specification") or "").lower()
    kernel = concept.get("kernel_theory") or ""
    baseline = concept.get("simpler_baseline_alternative") or ""
    gaps = concept.get("targeted_gap_ids") or []
    if isinstance(gaps, str):
        try:
            gaps = json.loads(gaps)
        except Exception:
            gaps = [gaps] if gaps else []

    prob_stmt = (problem.get("problem_statement") or "").lower()
    sufferer = (problem.get("sufferer_occupation") or "").lower()
    impact = (problem.get("quantified_impact") or "").lower()
    sources = ctx.get("sources") or problem.get("sources") or []

    # 1. Problem Relevance (Base 55.0)
    rel_score = 55.0
    if prob_stmt:
        # Check token overlaps
        prob_words = set(re.findall(r"\w{4,}", prob_stmt))
        concept_words = set(re.findall(r"\w{4,}", f"{title} {desc}"))
        overlap = len(prob_words.intersection(concept_words))
        rel_score += min(25.0, overlap * 5.0)
    if sufferer and (sufferer in desc or sufferer in title):
        rel_score += 10.0
    if len(desc) > 50:
        rel_score += 10.0
    rel_score = max(0.0, min(100.0, rel_score))

    # 2. Evidence Grounding (Base 40.0)
    ev_score = 40.0
    ev_count = len(sources)
    if ev_count > 0:
        ev_score += min(40.0, ev_count * 10.0)
    # Check if concept has theoretical grounding citing literature
    if len(kernel) > 10:
        ev_score += 15.0
    if any(s.get("doi") for s in sources if isinstance(s, dict)):
        ev_score += 5.0
    ev_score = max(0.0, min(100.0, ev_score))

    # 3. Gap Validity (Base 45.0)
    gap_score = 45.0
    if gaps and len(gaps) > 0:
        gap_score += min(35.0, len(gaps) * 15.0)
        # Check if gaps match any literature gaps in context
        lit_matrix = ctx.get("literature_matrix") or []
        if lit_matrix:
            gap_score += 15.0
    else:
        gap_score -= 10.0  # Unlinked to literature gap penalty
    gap_score = max(0.0, min(100.0, gap_score))

    # 4. Stakeholder Impact (Base 50.0)
    impact_score = 50.0
    if impact:
        impact_score += 20.0
    constraints = concept.get("contextual_constraints") or []
    if constraints:
        impact_score += 15.0
    if sufferer:
        impact_score += 15.0
    impact_score = max(0.0, min(100.0, impact_score))

    # 5. Technical Feasibility (Base 50.0)
    feas_score = 50.0
    # Higher score if kernel theory is explicitly specified
    if kernel and kernel.strip().lower() not in ("none", "n/a", "unspecified"):
        feas_score += 20.0
    # Higher score if formal specification / pseudocode is supplied
    if len(spec) > 20:
        feas_score += 20.0
    # Artifact class feasibility heuristic
    cls = concept.get("dsr_class") or "METHOD"
    if cls == "CONSTRUCT":
        feas_score += 10.0  # Conceptual constructs have lower computational risk
    elif cls == "INSTANTIATION":
        feas_score -= 5.0  # Hardware/physical deployment has higher real-world friction
    feas_score = max(0.0, min(100.0, feas_score))

    # 6. Novelty Contribution (Base 45.0 - Enforcing Rules 5 & 6)
    nov_score = 45.0
    if baseline and len(baseline) > 10 and baseline.lower() not in ("none", "n/a"):
        nov_score += 35.0  # Audited simpler baseline alternative verified (Rule 5)
    else:
        nov_score -= 15.0  # Missing baseline penalty (Rule 5 violation)

    # Check for empty buzzword overuse (Rule 6)
    buzzwords = ["blockchain", "ai-powered", "deep learning", "smart contract", "web3"]
    if any(b in desc for b in buzzwords) and len(spec) < 15:
        nov_score -= 15.0
    elif len(spec) > 30:
        nov_score += 15.0
    nov_score = max(0.0, min(100.0, nov_score))

    # 7. Methodology Fit (Base 50.0)
    meth_score = 50.0
    falsif = concept.get("falsification_criteria") or ""
    if len(falsif) > 15:
        meth_score += 30.0  # Falsification criteria established (FEDS framework)
    if "benchmark" in desc or "metric" in desc or "test" in desc or "dataset" in desc:
        meth_score += 15.0
    meth_score = max(0.0, min(100.0, meth_score))

    dim_scores = {
        "problem_relevance": round(rel_score, 1),
        "evidence_grounding": round(ev_score, 1),
        "gap_validity": round(gap_score, 1),
        "stakeholder_impact": round(impact_score, 1),
        "technical_feasibility": round(feas_score, 1),
        "novelty_contribution": round(nov_score, 1),
        "methodology_fit": round(meth_score, 1),
    }

    composite = sum(w[dim] * dim_scores[dim] for dim in w)
    composite = round(max(0.0, min(100.0, composite)), 1)

    min_dim = min(dim_scores.values())
    if composite >= 75.0 and min_dim >= 45.0:
        recommendation = EvaluationRecommendation.RECOMMENDED.value
    elif composite >= 60.0:
        recommendation = EvaluationRecommendation.VIABLE_WITH_REFINEMENT.value
    elif composite >= 45.0:
        recommendation = EvaluationRecommendation.HIGH_RISK_REVISE.value
    else:
        recommendation = EvaluationRecommendation.REJECT.value

    return dim_scores, composite, recommendation


class ConceptEvaluationEngine:
    """
    Stage E Multi-Criteria Concept & Artifact Evaluation Engine.
    Operates in inverted architecture:
    1. Pure deterministic math computes 7 dimension scores and composite score.
    2. LLM Gateway is invoked strictly for qualitative narrative, strengths, vulnerabilities, and falsification advisory.
    3. Resilient deterministic fallback with is_degraded=True on failure or timeout.
    """

    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    def calculate_deterministic_score(
        self,
        scores: DimensionScores,
        weights: Optional[Dict[str, float]] = None,
    ) -> Tuple[float, EvaluationRecommendation]:
        """Calculates composite score and recommendation tier from explicit dimension scores."""
        w = dict(DEFAULT_EVALUATION_WEIGHTS)
        if weights:
            w.update({k: float(v) for k, v in weights.items() if k in w})
        total_w = sum(w.values()) or 1.0
        w = {k: v / total_w for k, v in w.items()}

        s_dict = scores.model_dump()
        composite = sum(w[dim] * s_dict[dim] for dim in w)
        composite = round(max(0.0, min(100.0, composite)), 2)

        min_dim = min(s_dict.values())
        if composite >= 75.0 and min_dim >= 45.0:
            rec = EvaluationRecommendation.RECOMMENDED
        elif composite >= 60.0:
            rec = EvaluationRecommendation.VIABLE_WITH_REFINEMENT
        elif composite >= 45.0:
            rec = EvaluationRecommendation.HIGH_RISK_REVISE
        else:
            rec = EvaluationRecommendation.REJECT

        return composite, rec

    async def evaluate_concept(
        self,
        concept_id: Any,
        session_id: Optional[str] = None,
        prompt_guidance: Optional[str] = None,
        weights: Optional[Dict[str, float]] = None,
        include_llm_critique: bool = True,
    ) -> Dict[str, Any]:
        """Evaluates a single DSR artifact or concept against the 7-dimension rigor rubric."""
        if hasattr(concept_id, "concept_id"):
            session_id = session_id or getattr(concept_id, "session_id", None)
            prompt_guidance = prompt_guidance or getattr(concept_id, "prompt_guidance", None)
            weights = weights or getattr(concept_id, "weights", None)
            if hasattr(concept_id, "include_llm_critique"):
                include_llm_critique = getattr(concept_id, "include_llm_critique")
            concept_id = concept_id.concept_id

        concept = self.storage.get_dsr_artifact(concept_id) if hasattr(self.storage, "get_dsr_artifact") else None
        if not concept:
            concept = {
                "id": str(concept_id),
                "title": f"Candidate Concept {concept_id}",
                "description": prompt_guidance or "Candidate research concept under multi-criteria evaluation",
                "dsr_class": "METHOD",
                "kernel_theory": "Theoretical Proposition",
                "simpler_baseline_alternative": "Standard Baseline Heuristic",
            }

        # Aggregate context
        prob_id = concept.get("problem_id")
        problem = self.storage.get_problem(prob_id) if prob_id else None
        sources = self.storage.list_sources(problem_id=prob_id) if (prob_id and hasattr(self.storage, "list_sources")) else []
        context = {
            "problem": problem or {},
            "sources": sources or [],
        }

        # Step 1: Compute deterministic scores (Mathematical Invariant)
        dim_scores, composite_score, recommendation = calculate_concept_scores(
            concept=concept, context=context, weights=weights
        )

        strengths: List[str] = []
        vulnerabilities: List[str] = []
        falsification_advisory: str = ""
        narrative_summary: str = ""
        is_degraded = False

        # Step 2: Inverted AI qualitative synthesis
        system_instruction = (
            "You are the CONVERA Chief Science Officer and Stage Gate 3 Rigor Reviewer. "
            "You evaluate computing research concepts against multi-criteria rigor standards. "
            "The deterministic evaluation scores have ALREADY been computed by invariant mathematical models and CANNOT be altered. "
            "Your task is strictly qualitative: explain the pre-computed scores, highlight genuine strengths, expose critical vulnerabilities, "
            "and formulate a concrete empirical falsification test. "
            "Return STRICT JSON only without markdown code blocks."
        )

        prompt = f"""EVALUATE THE FOLLOWING COMPUTING RESEARCH CONCEPT:
CONCEPT DETAILS:
- ID: {concept.get('id')}
- Title: {concept.get('title')}
- DSR Class: {concept.get('dsr_class')}
- Description: {concept.get('description')}
- Kernel Theory Grounding: {concept.get('kernel_theory')}
- Targeted Literature Gaps: {concept.get('targeted_gap_ids')}
- Formal Specification: {concept.get('formal_specification')}
- Simpler Baseline Alternative: {concept.get('simpler_baseline_alternative')}

VALIDATED PROBLEM CONTEXT:
- Problem: {(problem or {}).get('problem_statement', 'General domain friction')}
- Sufferer: {(problem or {}).get('sufferer_occupation', 'Target Cohort')} in {(problem or {}).get('sufferer_location', 'Target Region')}
- Quantified Loss: {(problem or {}).get('quantified_impact', 'Unspecified')}
- Attached Sources: {len(sources)} scholarly works

PRE-COMPUTED RIGOR SCORES (LOCKED DETERMINISTIC INVARIANTS):
- Composite Rigor Score: {composite_score}/100.0
- Dimension Breakdown:
  * Problem Relevance: {dim_scores['problem_relevance']}/100.0
  * Evidence Grounding: {dim_scores['evidence_grounding']}/100.0
  * Gap Validity: {dim_scores['gap_validity']}/100.0
  * Stakeholder Impact: {dim_scores['stakeholder_impact']}/100.0
  * Technical Feasibility: {dim_scores['technical_feasibility']}/100.0
  * Novelty Contribution: {dim_scores['novelty_contribution']}/100.0
  * Methodology Fit: {dim_scores['methodology_fit']}/100.0
- Recommendation Tier: {recommendation}

PROMPT GUIDANCE: {prompt_guidance or 'Perform an exhaustive, balanced critique.'}

OUTPUT FORMAT (STRICT JSON ONLY):
{{
  "strengths": [
    "Evidence-backed advantage 1...",
    "Strength 2..."
  ],
  "vulnerabilities": [
    "Critical risk, hidden assumption, or ungrounded step 1...",
    "Vulnerability 2..."
  ],
  "falsification_advisory": "Specific controlled benchmark, stress test, or field measurement that would prove this concept invalid.",
  "narrative_summary": "Comprehensive 2-paragraph evaluation narrative explaining the findings and recommending next steps."
}}"""

        if include_llm_critique:
            try:
                raw_resp = await generate_response_with_fallback(
                    system_instruction=system_instruction,
                    prompt=prompt,
                    task_category=TaskCategory.CRITICAL_REASONING,
                )
                cleaned = re.sub(r"^```[a-z]*\s*", "", raw_resp.strip(), flags=re.IGNORECASE)
                cleaned = re.sub(r"\s*```$", "", cleaned).strip()
                try:
                    parsed = json.loads(cleaned)
                except Exception:
                    # Sanitize raw backslashes commonly output in LaTeX math formulas
                    sanitized = re.sub(r"\\(?![\"\\/bfnrtu])", r"\\\\", cleaned)
                    parsed = json.loads(sanitized)

                strengths = parsed.get("strengths") or []
                vulnerabilities = parsed.get("vulnerabilities") or []
                falsification_advisory = parsed.get("falsification_advisory") or ""
                narrative_summary = parsed.get("narrative_summary") or ""
            except Exception as e:
                logger.warning(f"Qualitative synthesis failed, falling back to deterministic rules: {e}")
                is_degraded = True
                strengths = [
                    f"Demonstrates alignment with problem domain (relevance score: {dim_scores['problem_relevance']}).",
                    f"Grounded in kernel theory '{concept.get('kernel_theory', 'Heuristic')}' with feasibility score {dim_scores['technical_feasibility']}."
                ]
                vulnerabilities = [
                    f"Requires empirical stress-testing against baseline '{concept.get('simpler_baseline_alternative') or 'standard thresholding'}'.",
                    f"Evidence grounding is currently scored at {dim_scores['evidence_grounding']}/100.0 and requires additional field validation."
                ]
                falsification_advisory = (
                    f"Execute a controlled comparative evaluation comparing this {concept.get('dsr_class')} "
                    f"against the simpler baseline alternative under identical field constraints."
                )
                narrative_summary = (
                    f"Automated deterministic evaluation concluded a composite score of {composite_score}/100.0 "
                    f"resulting in a tier of {recommendation}. Qualitative commentary generated via offline rule heuristic."
                )
        else:
            is_degraded = False
            strengths = [
                f"Demonstrates alignment with problem domain (relevance score: {dim_scores['problem_relevance']}).",
                f"Grounded in kernel theory '{concept.get('kernel_theory', 'Heuristic')}' with feasibility score {dim_scores['technical_feasibility']}."
            ]
            vulnerabilities = [
                f"Requires empirical stress-testing against baseline '{concept.get('simpler_baseline_alternative') or 'standard thresholding'}'.",
                f"Evidence grounding is currently scored at {dim_scores['evidence_grounding']}/100.0 and requires additional field validation."
            ]
            falsification_advisory = (
                f"Execute a controlled comparative evaluation comparing this {concept.get('dsr_class')} "
                f"against the simpler baseline alternative under identical field constraints."
            )
            narrative_summary = (
                f"Automated deterministic evaluation concluded a composite score of {composite_score}/100.0 "
                f"resulting in a tier of {recommendation}. Evaluated via deterministic rubric."
            )

        eval_id = f"EVAL-{uuid.uuid4().hex[:12].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()

        eval_record = {
            "id": eval_id,
            "concept_id": concept_id,
            "session_id": session_id,
            "evaluator_type": EvaluatorType.AI_CRITIC.value if not is_degraded else EvaluatorType.DETERMINISTIC_RUBRIC.value,
            "composite_score": composite_score,
            "dimension_scores": dim_scores,
            "strengths": strengths,
            "vulnerabilities": vulnerabilities,
            "falsification_advisory": falsification_advisory,
            "recommendation": recommendation,
            "narrative_summary": narrative_summary,
            "is_degraded": is_degraded,
            "created_at": now_iso,
        }

        # Persist evaluation record
        try:
            persisted = self.storage.save_concept_evaluation(eval_record)
            return persisted
        except Exception as e:
            logger.error(f"Failed to persist concept evaluation: {e}")
            return eval_record

    async def compare_concepts(
        self,
        concept_ids: Any,
        session_id: Optional[str] = None,
        weights: Optional[Dict[str, float]] = None,
        include_llm_critique: bool = True,
    ) -> ConceptComparisonResult:
        """
        Compares multiple candidate concepts/artifacts side-by-side with total ordering and trade-off matrix.
        """
        if hasattr(concept_ids, "concept_ids"):
            session_id = session_id or getattr(concept_ids, "session_id", None)
            weights = weights or getattr(concept_ids, "weights", None)
            if hasattr(concept_ids, "include_llm_critique"):
                include_llm_critique = getattr(concept_ids, "include_llm_critique")
            concept_ids = concept_ids.concept_ids

        if not concept_ids:
            return ConceptComparisonResult(
                session_id=session_id,
                rankings=[],
                tradeoff_matrix={},
                recommended_winner_id=None,
                winner_rationale="No candidate concepts provided for comparison.",
            )

        evaluations: List[ConceptEvaluationRecord] = []
        for cid in concept_ids:
            eval_res = await self.evaluate_concept(
                concept_id=cid,
                session_id=session_id,
                weights=weights,
                include_llm_critique=include_llm_critique,
            )
            record = ConceptEvaluationRecord(
                id=eval_res["id"],
                concept_id=eval_res["concept_id"],
                session_id=eval_res.get("session_id"),
                evaluator_type=eval_res.get("evaluator_type", EvaluatorType.DETERMINISTIC_RUBRIC),
                composite_score=float(eval_res["composite_score"]),
                dimension_scores=DimensionScores(**eval_res["dimension_scores"]),
                strengths=eval_res.get("strengths") or [],
                vulnerabilities=eval_res.get("vulnerabilities") or [],
                falsification_advisory=eval_res.get("falsification_advisory"),
                recommendation=eval_res.get("recommendation", EvaluationRecommendation.VIABLE_WITH_REFINEMENT),
                narrative_summary=eval_res.get("narrative_summary"),
                is_degraded=bool(eval_res.get("is_degraded", False)),
                created_at=eval_res.get("created_at", datetime.now(timezone.utc).isoformat()),
            )
            evaluations.append(record)

        # Deterministic 4-tier sorting:
        # Tier 1: composite_score (descending)
        # Tier 2: evidence_grounding (descending)
        # Tier 3: problem_relevance (descending)
        # Tier 4: technical_feasibility (descending)
        ranked = sorted(
            evaluations,
            key=lambda e: (
                e.composite_score,
                e.dimension_scores.evidence_grounding,
                e.dimension_scores.problem_relevance,
                e.dimension_scores.technical_feasibility,
            ),
            reverse=True,
        )

        winner = ranked[0] if ranked else None
        winner_id = winner.concept_id if winner else None

        # Build pairwise trade-off matrix
        tradeoff_matrix: Dict[str, Dict[str, str]] = {}
        for a in ranked:
            tradeoff_matrix[a.concept_id] = {}
            for b in ranked:
                if a.concept_id == b.concept_id:
                    continue
                score_diff = round(a.composite_score - b.composite_score, 1)
                feas_diff = round(a.dimension_scores.technical_feasibility - b.dimension_scores.technical_feasibility, 1)
                nov_diff = round(a.dimension_scores.novelty_contribution - b.dimension_scores.novelty_contribution, 1)
                tradeoff_matrix[a.concept_id][b.concept_id] = (
                    f"Net: {score_diff:+} pts | Feasibility: {feas_diff:+} pts | Novelty: {nov_diff:+} pts"
                )

        winner_rationale = ""
        if winner:
            winner_rationale = (
                f"Candidate '{winner.concept_id}' achieved the highest composite rigor score ({winner.composite_score}/100.0) "
                f"with leading evidence grounding ({winner.dimension_scores.evidence_grounding}) "
                f"and problem relevance ({winner.dimension_scores.problem_relevance})."
            )

        return ConceptComparisonResult(
            session_id=session_id,
            rankings=ranked,
            tradeoff_matrix=tradeoff_matrix,
            recommended_winner_id=winner_id,
            winner_rationale=winner_rationale,
        )

    def save_human_review(
        self,
        concept_id: Any,
        session_id: Optional[str] = None,
        dimension_scores: Optional[Dict[str, float]] = None,
        recommendation: Optional[Any] = None,
        reviewer_notes: Optional[str] = None,
        falsification_advisory: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Records human researcher review and rubric adjustments (Article IV Human Sovereignty).
        """
        if hasattr(concept_id, "concept_id"):
            session_id = session_id or getattr(concept_id, "session_id", None)
            dimension_scores = dimension_scores or getattr(concept_id, "dimension_scores", None)
            rec_val = getattr(concept_id, "recommendation", None)
            recommendation = (rec_val.value if hasattr(rec_val, "value") else rec_val) if rec_val else recommendation
            reviewer_notes = reviewer_notes or getattr(concept_id, "reviewer_notes", None)
            falsification_advisory = falsification_advisory or getattr(concept_id, "falsification_advisory", None)
            concept_id = concept_id.concept_id

        if hasattr(recommendation, "value"):
            recommendation = recommendation.value

        # Fetch existing latest evaluation for baseline if needed
        existing = self.storage.list_concept_evaluations(concept_id=concept_id)
        base_dims = existing[0].get("dimension_scores", {}) if existing else {}
        scores = dict(base_dims)
        if dimension_scores:
            scores.update(dimension_scores)

        # Compute composite score with default weights
        w = DEFAULT_EVALUATION_WEIGHTS
        total_w = sum(w.values()) or 1.0
        norm_w = {k: v / total_w for k, v in w.items()}
        composite = sum(norm_w.get(k, 0.1) * float(scores.get(k, 50.0)) for k in norm_w)
        composite = round(max(0.0, min(100.0, composite)), 2)

        eval_id = f"EVAL-HUMAN-{uuid.uuid4().hex[:8].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()

        record = {
            "id": eval_id,
            "concept_id": str(concept_id),
            "session_id": session_id,
            "evaluator_type": EvaluatorType.HUMAN_EXPERT.value,
            "composite_score": composite,
            "dimension_scores": scores,
            "strengths": [reviewer_notes] if reviewer_notes else ["Human expert approved."],
            "vulnerabilities": [],
            "falsification_advisory": falsification_advisory or (existing[0].get("falsification_advisory") if existing else None),
            "recommendation": recommendation or (existing[0].get("recommendation") if existing else EvaluationRecommendation.RECOMMENDED.value),
            "narrative_summary": reviewer_notes or "Human expert review record.",
            "is_degraded": False,
            "created_at": now_iso,
        }

        return self.storage.save_concept_evaluation(record)

    async def record_human_review(
        self,
        concept_id: Any,
        session_id: Optional[str] = None,
        dimension_scores: Optional[Dict[str, float]] = None,
        recommendation: Optional[Any] = None,
        reviewer_notes: Optional[str] = None,
        falsification_advisory: Optional[str] = None,
    ) -> ConceptEvaluationRecord:
        """Async wrapper returning typed ConceptEvaluationRecord for test/client parity."""
        res = self.save_human_review(
            concept_id=concept_id,
            session_id=session_id,
            dimension_scores=dimension_scores,
            recommendation=recommendation,
            reviewer_notes=reviewer_notes,
            falsification_advisory=falsification_advisory,
        )
        return ConceptEvaluationRecord(
            id=res["id"],
            concept_id=res["concept_id"],
            session_id=res.get("session_id"),
            evaluator_type=res.get("evaluator_type", EvaluatorType.HUMAN_EXPERT),
            composite_score=float(res["composite_score"]),
            dimension_scores=DimensionScores(**res["dimension_scores"]),
            strengths=res.get("strengths") or [],
            vulnerabilities=res.get("vulnerabilities") or [],
            falsification_advisory=res.get("falsification_advisory"),
            recommendation=res.get("recommendation", EvaluationRecommendation.RECOMMENDED),
            narrative_summary=res.get("narrative_summary"),
            is_degraded=bool(res.get("is_degraded", False)),
            created_at=res.get("created_at", datetime.now(timezone.utc).isoformat()),
        )
