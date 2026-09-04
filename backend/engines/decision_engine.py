"""
Decision Intelligence & Pivot Loop Engine for CONVERA
======================================================
Governed by: CONSTITUTION.md (Articles II, III, V, VI, VIII),
             AI_ARCHITECTURE.md (§2 Deterministic Core & Bounded AI, §8 Degraded Resilience),
             CIIA.md (§4 Advisory Decision Support),
             SDD-004 Ratified Specification.

Provides:
1. Pure deterministic candidate composite scoring & 4-tier tie-breaking.
2. Inverted AI Decision Room synthesis (LLM provides narrative explanation of pre-computed rankings).
3. Resilient deterministic fallback with invariant enforcement.
4. Structured Phase 3 -> Phase 2 Pivot / Re-evaluate Learning Loops.
"""

from __future__ import annotations
import json
import re
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional

from llm_gateway import generate_response_with_fallback, TaskCategory
from engines.evidence_scorer import calculate_score_breakdown
from engines.knowledge_lifecycle import compute_claim_epistemic_balance


# ===========================================================================
# 1. Data Models & Constants
# ===========================================================================

@dataclass(frozen=True)
class CandidateMetricBreakdown:
    problem_id: str
    composite_score: float
    rubric_score: float
    epistemic_score: float
    impact_score: float
    risk_penalty: float
    rank: int
    verdict: str  # "RECOMMENDED" | "VIABLE_ALTERNATIVE" | "HIGH_RISK"
    pros: List[str]
    risks: List[str]


# [PROPOSED DEFAULT — SUBJECT TO RATIFICATION & TUNING]
# These initial deterministic ranking defaults are engineering heuristics and are NOT
# empirically validated. They are isolated here for transparent versioning and calibration.
RANKING_WEIGHTS_V1 = {
    "rubric": 0.40,
    "epistemic": 0.35,
    "impact": 0.25,
}

# [PROPOSED DEFAULT] Engineering heuristic risk deduction penalties, not normative epistemic laws.
RISK_PENALTY_DEFAULTS_V1 = {
    "falsified_test": 15.0,
    "critical_untested": 10.0,
    "high_untested": 5.0,
    "max_penalty": 50.0,
}

# [PROPOSED DEFAULT] [TUNABLE HEURISTIC] Presentation threshold, not an epistemic truth boundary.
VERDICT_THRESHOLD_V1 = {
    "viable_alternative_min": 60.0,
}


# ===========================================================================
# 2. Deterministic Metric Calculation & Ranking Functions
# ===========================================================================

class _CandidateEvidenceAdapter:
    """
    Lightweight adapter implementing list_claim_evidence_links() so that
    compute_claim_epistemic_balance() seamlessly operates on both in-memory candidate
    dictionaries and persistent storage adapters.
    """
    def __init__(self, in_memory_links: Dict[str, List[Dict[str, Any]]], fallback_storage: Optional[Any] = None):
        self._links = in_memory_links
        self._fallback = fallback_storage

    def list_claim_evidence_links(self, claim_id: str) -> List[Dict[str, Any]]:
        if claim_id in self._links and self._links[claim_id]:
            raw_links = self._links[claim_id]
            normalized = []
            for l in raw_links:
                norm_link = dict(l)
                if "relationship" in norm_link and "relation_type" not in norm_link:
                    norm_link["relation_type"] = norm_link["relationship"]
                if "confidence" in norm_link and "evidence_strength" not in norm_link:
                    norm_link["evidence_strength"] = norm_link["confidence"]
                normalized.append(norm_link)
            return normalized
        if self._fallback and hasattr(self._fallback, "list_claim_evidence_links"):
            try:
                return self._fallback.list_claim_evidence_links(claim_id=claim_id)
            except Exception:
                return []
        return []


def calculate_candidate_composite_score(
    candidate: Dict[str, Any],
    storage: Optional[Any] = None
) -> Dict[str, float]:
    """
    Pure deterministic multi-criteria score calculation for a problem candidate.
    Combines:
    1. Rubric Score (0-100) via evidence_scorer.py
    2. Epistemic Balance Score (0-100) reusing authoritative knowledge_lifecycle.py normalized_score
    3. Quantified Impact Score (0-100) normalized from Dimension 3 of evidence_scorer.py
    4. Assumption Risk Penalty (0-50 subtractive deduction)
    """
    candidate_id = str(candidate.get("id") or "")
    sources = candidate.get("sources")
    if sources is None and storage and candidate_id:
        try:
            sources = storage.list_problem_sources(candidate_id)
        except Exception:
            sources = []
    sources = sources or []

    # 1. Rubric Score ($S_{rubric}$) & Impact Dimension ($S_{impact}$)
    rubric_breakdown = calculate_score_breakdown(candidate, sources)
    rubric_score = float(rubric_breakdown.get("total_score", 0.0))

    impact_dim = float(
        rubric_breakdown.get("dimensions", {})
        .get("quantified_impact", {})
        .get("score", 0.0)
    )
    # Dimension 3 is 0-20; scaled by 5.0 to map to [0.0, 100.0]
    impact_score = round(min(max(impact_dim * 5.0, 0.0), 100.0), 1)

    # 2. Epistemic Balance Score ($S_{epistemic}$)
    # Strictly reuses existing authoritative normalized_score from knowledge_lifecycle.py
    claims = candidate.get("claims")
    if claims is None and storage and candidate_id:
        try:
            claims = storage.list_claims(problem_id=candidate_id)
        except Exception:
            claims = []
    claims = claims or []

    if claims:
        # Build in-memory links map
        in_mem_links: Dict[str, List[Dict[str, Any]]] = {}
        for claim in claims:
            cid = str(claim.get("id") or "")
            links = claim.get("evidence_links") or claim.get("links") or []
            in_mem_links[cid] = links

        adapter = _CandidateEvidenceAdapter(in_mem_links, fallback_storage=storage)
        claim_scores: List[float] = []
        for claim in claims:
            cid = str(claim.get("id") or "")
            bal = compute_claim_epistemic_balance(cid, adapter)
            claim_scores.append(float(bal.get("normalized_score", 50.0)))
        epistemic_score = round(sum(claim_scores) / len(claim_scores), 1) if claim_scores else 50.0
    else:
        # Neutral baseline for candidates with zero extracted claims (HYPOTHESIS baseline)
        epistemic_score = 50.0

    # 3. Assumption Risk Penalty ($R_{assumptions}$)
    assumptions = candidate.get("assumptions")
    if assumptions is None and storage and candidate_id:
        try:
            assumptions = storage.list_assumptions(problem_id=candidate_id)
        except Exception:
            assumptions = []
    assumptions = assumptions or []

    penalty = 0.0
    for asm in assumptions:
        status = str(asm.get("status", "")).upper()
        risk_level = str(asm.get("risk_level", "")).upper()
        if status in ["FALSIFIED", "INVALIDATED"]:
            penalty += RISK_PENALTY_DEFAULTS_V1["falsified_test"]
        elif status == "UNTESTED" and risk_level == "CRITICAL":
            penalty += RISK_PENALTY_DEFAULTS_V1["critical_untested"]
        elif status == "UNTESTED" and risk_level == "HIGH":
            penalty += RISK_PENALTY_DEFAULTS_V1["high_untested"]

    # Deductions for failed validation tests
    validation_tests = candidate.get("validation_tests")
    if validation_tests:
        for vt in validation_tests:
            tstatus = str(vt.get("test_status", "")).upper()
            if tstatus in ["FAILED", "FALSIFIED"]:
                penalty += RISK_PENALTY_DEFAULTS_V1["falsified_test"]

    risk_penalty = min(penalty, RISK_PENALTY_DEFAULTS_V1["max_penalty"])

    # 4. Composite Formula
    w_rub = RANKING_WEIGHTS_V1["rubric"]
    w_epi = RANKING_WEIGHTS_V1["epistemic"]
    w_imp = RANKING_WEIGHTS_V1["impact"]

    raw_composite = (w_rub * rubric_score + w_epi * epistemic_score + w_imp * impact_score) - risk_penalty
    composite_score = round(min(max(raw_composite, 0.0), 100.0), 1)

    return {
        "composite_score": composite_score,
        "rubric_score": rubric_score,
        "epistemic_score": epistemic_score,
        "impact_score": impact_score,
        "risk_penalty": risk_penalty,
    }


def rank_candidates_deterministically(
    candidates: List[Dict[str, Any]],
    storage: Optional[Any] = None
) -> List[CandidateMetricBreakdown]:
    """
    Ranks candidates using a strict 4-tier deterministic tie-breaking hierarchy:
    1. Composite Score (descending)
    2. Epistemic Score (descending)
    3. Rubric Score (descending)
    4. Lexicographical Candidate ID (ascending total order)

    Edge cases handled:
    - Empty candidate set: returns [] without arbitrary indexing.
    - Single candidate: assigned rank = 1, verdict = "RECOMMENDED".
    """
    if not candidates:
        return []

    computed: List[Dict[str, Any]] = []
    for idx, c in enumerate(candidates, 1):
        cid = str(c.get("id") or f"P-{idx}")
        scores = calculate_candidate_composite_score(c, storage=storage)

        # Default qualitative pros and risks based on calculated dimensions
        pros = []
        risks = []
        if scores["rubric_score"] >= 75.0:
            pros.append(f"High multi-source documentation rigor ({scores['rubric_score']}%)")
        if scores["epistemic_score"] >= 60.0:
            pros.append(f"Empirical claim grounding verified ({scores['epistemic_score']}%)")
        if scores["impact_score"] >= 75.0:
            pros.append("High quantified economic or temporal friction loss")
        if not pros:
            pros.append(f"Documented problem statement for {c.get('sufferer_occupation') or 'target sufferers'}")

        if scores["risk_penalty"] > 0.0:
            risks.append(f"Carries {scores['risk_penalty']} pts assumption risk penalty")
        if scores["epistemic_score"] < 50.0:
            risks.append("Contains refuting or contested empirical evidence links")
        if not risks:
            risks.append("Requires Mom Test behavioral verification with active sufferers")

        computed.append({
            "problem_id": cid,
            "candidate": c,
            "scores": scores,
            "pros": pros,
            "risks": risks,
        })

    # Strict 4-tier deterministic sort:
    # 1. -composite_score
    # 2. -epistemic_score
    # 3. -rubric_score
    # 4. problem_id (lexicographical total order)
    computed.sort(
        key=lambda item: (
            -item["scores"]["composite_score"],
            -item["scores"]["epistemic_score"],
            -item["scores"]["rubric_score"],
            item["problem_id"],
        )
    )

    threshold = VERDICT_THRESHOLD_V1["viable_alternative_min"]
    ranked_breakdowns: List[CandidateMetricBreakdown] = []

    for rank_idx, item in enumerate(computed, 1):
        sc = item["scores"]
        if rank_idx == 1:
            verdict = "RECOMMENDED"
        elif sc["composite_score"] >= threshold:
            verdict = "VIABLE_ALTERNATIVE"
        else:
            verdict = "HIGH_RISK"

        ranked_breakdowns.append(
            CandidateMetricBreakdown(
                problem_id=item["problem_id"],
                composite_score=sc["composite_score"],
                rubric_score=sc["rubric_score"],
                epistemic_score=sc["epistemic_score"],
                impact_score=sc["impact_score"],
                risk_penalty=sc["risk_penalty"],
                rank=rank_idx,
                verdict=verdict,
                pros=item["pros"],
                risks=item["risks"],
            )
        )

    return ranked_breakdowns


# ===========================================================================
# 3. Deterministic Fallback Assembly
# ===========================================================================

def generate_deterministic_fallback_summary(
    ranked_breakdowns: List[CandidateMetricBreakdown],
    candidates_map: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generates a structured, purely deterministic synthesis fallback when
    external AI gateways time out, fail, or return unparseable responses.
    Sets is_degraded = True to signal non-evidentiary fallback mode.
    """
    if not ranked_breakdowns:
        return {
            "recommended_winner_id": None,
            "recommendation_summary": "No candidates provided for decision synthesis.",
            "candidate_breakdowns": [],
            "is_degraded": False,
        }

    winner = ranked_breakdowns[0]
    winner_cand = candidates_map.get(winner.problem_id, {})
    winner_sources_count = len(winner_cand.get("sources", []))

    summary = (
        f"Candidate {winner.problem_id} achieves the highest deterministic composite score "
        f"({winner.composite_score}/100) based on documentation rigor ({winner.rubric_score}%), "
        f"epistemic claim balance ({winner.epistemic_score}%), and quantified impact ({winner.impact_score}%). "
        f"It is supported by {winner_sources_count} research reference(s) with an assumption risk deduction of "
        f"{winner.risk_penalty} points."
    )

    breakdowns_payload = []
    for b in ranked_breakdowns:
        breakdowns_payload.append({
            "problem_id": b.problem_id,
            "rank": b.rank,
            "composite_score": b.composite_score,
            "rubric_score": b.rubric_score,
            "epistemic_score": b.epistemic_score,
            "impact_score": b.impact_score,
            "risk_penalty": b.risk_penalty,
            "verdict": b.verdict,
            "pros": b.pros,
            "risks": b.risks,
        })

    return {
        "recommended_winner_id": winner.problem_id,
        "recommendation_summary": summary,
        "candidate_breakdowns": breakdowns_payload,
        "is_degraded": True,
    }


# ===========================================================================
# 4. Inverted AI Decision Room Synthesis
# ===========================================================================

async def synthesize_decision_room(
    candidates: List[Dict[str, Any]],
    storage: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Analyzes 2 to 4 candidates based on their Evidence Ledgers, Assumption Radars, and DOIs.
    Inverted Architecture:
    1. Pure deterministic math computes composite scores and 4-tier tie-breaking.
    2. Deterministic winner and ordinal ranks are immutable invariants.
    3. LLM Gateway is invoked strictly for narrative explanation and qualitative pros/risks.
    4. Post-processing invariant assertion overrides any conflicting ranking or winner.
    5. On LLM failure or timeout, assembled deterministic fallback is returned with is_degraded = True.
    """
    if not candidates:
        return {
            "recommended_winner_id": None,
            "recommendation_summary": "No candidates provided for decision synthesis.",
            "candidate_breakdowns": [],
            "is_degraded": False,
        }

    # Step 1: Pre-calculate deterministic rankings and total ordering
    ranked_breakdowns = rank_candidates_deterministically(candidates, storage=storage)
    deterministic_winner_id = ranked_breakdowns[0].problem_id

    candidates_map = {
        str(c.get("id") or f"P-{idx}"): c
        for idx, c in enumerate(candidates, 1)
    }

    # Step 2: Assemble prompt for LLM containing pre-computed rankings and metrics
    candidate_summaries: List[str] = []
    for b in ranked_breakdowns:
        c = candidates_map.get(b.problem_id, {})
        stmt = c.get("problem_statement", "")
        actor = c.get("sufferer_occupation", "Unspecified")
        loc = c.get("sufferer_location", "Unspecified")
        impact = c.get("quantified_impact", "Unspecified")
        sources_count = len(c.get("sources", []))

        candidate_summaries.append(
            f"[Rank {b.rank}: {b.verdict}] Problem ID: {b.problem_id}\n"
            f"  - Composite Score: {b.composite_score}/100\n"
            f"  - Rubric Rigor Score: {b.rubric_score}%\n"
            f"  - Epistemic Balance Score: {b.epistemic_score}%\n"
            f"  - Quantified Impact Score: {b.impact_score}%\n"
            f"  - Assumption Risk Penalty: -{b.risk_penalty} pts\n"
            f"  - Sufferer: {actor} in {loc}\n"
            f"  - Quantified Loss: {impact}\n"
            f"  - Problem Statement: {stmt}\n"
            f"  - Attached Research References: {sources_count}\n"
        )

    cand_text = "\n".join(candidate_summaries)

    prompt = f"""You are an advisory technopreneurship decision analyst explaining pre-computed candidate rankings.
The rankings, composite scores, and winning candidate have already been deterministically computed by the platform's multi-criteria evaluation engine.

PRE-COMPUTED RANKINGS & METRICS:
{cand_text}

DETERMINISTIC WINNER: {deterministic_winner_id}

TASK:
1. Provide a crisp 2-3 sentence executive recommendation summary explaining why #{deterministic_winner_id} won based on its empirical evidence, documentation rigor, and quantified friction.
2. For each candidate, provide 1-2 specific qualitative pros and 1-2 critical unvalidated risks/assumptions.
3. DO NOT alter the ranking order, scores, or winner.

OUTPUT FORMAT (STRICT JSON ONLY without markdown ticks):
{{
  "recommended_winner_id": "{deterministic_winner_id}",
  "recommendation_summary": "2-3 crisp sentences explaining the pre-computed winner's superiority.",
  "candidate_breakdowns": [
    {{
      "problem_id": "{deterministic_winner_id}",
      "rank": 1,
      "pros": ["Specific evidence-backed strength 1", "Strength 2"],
      "risks": ["Specific assumption or risk to validate"],
      "verdict": "{ranked_breakdowns[0].verdict}"
    }}
  ]
}}
"""

    try:
        resp = await generate_response_with_fallback(
            system_instruction=(
                "You are an advisory technopreneurship decision analyst explaining pre-computed rankings. "
                "Return strict JSON only without markdown codeblocks."
            ),
            prompt=prompt,
            task_category=TaskCategory.DECISION_JUDGE,
        )

        cleaned_json = re.sub(r"^```[a-z]*\s*", "", resp.strip(), flags=re.IGNORECASE)
        cleaned_json = re.sub(r"\s*```$", "", cleaned_json).strip()
        data = json.loads(cleaned_json)

        summary = str(data.get("recommendation_summary") or "").strip()
        if not summary:
            fallback = generate_deterministic_fallback_summary(ranked_breakdowns, candidates_map)
            summary = fallback["recommendation_summary"]

        # Parse LLM pros/risks by problem_id
        llm_breakdowns_map: Dict[str, Dict[str, Any]] = {}
        for bd in data.get("candidate_breakdowns", []):
            pid = str(bd.get("problem_id") or "")
            if pid:
                llm_breakdowns_map[pid] = bd

        final_breakdowns = []
        for b in ranked_breakdowns:
            llm_item = llm_breakdowns_map.get(b.problem_id, {})
            pros = llm_item.get("pros") if isinstance(llm_item.get("pros"), list) and llm_item.get("pros") else b.pros
            risks = llm_item.get("risks") if isinstance(llm_item.get("risks"), list) and llm_item.get("risks") else b.risks

            # Programmatically assert deterministic invariants:
            # - problem_id matches
            # - rank is strictly 1-based deterministic rank
            # - composite and component scores are exact mathematical values
            # - verdict matches deterministic classification
            final_breakdowns.append({
                "problem_id": b.problem_id,
                "rank": b.rank,
                "composite_score": b.composite_score,
                "rubric_score": b.rubric_score,
                "epistemic_score": b.epistemic_score,
                "impact_score": b.impact_score,
                "risk_penalty": b.risk_penalty,
                "verdict": b.verdict,
                "pros": pros,
                "risks": risks,
            })

        # Programmatically assert winner invariant
        return {
            "recommended_winner_id": deterministic_winner_id,
            "recommendation_summary": summary,
            "candidate_breakdowns": final_breakdowns,
            "is_degraded": False,
        }

    except Exception as err:
        print(f"[!] Decision room synthesis falling back to deterministic assembly: {err}")
        return generate_deterministic_fallback_summary(ranked_breakdowns, candidates_map)


# ===========================================================================
# 5. Phase 3 -> Phase 2 Pivot Loop Execution
# ===========================================================================

def execute_pivot_loop(
    session_id: str,
    current_problem_id: str,
    pivot_reason: str,
    invalidated_assumption_id: Optional[str] = None,
    author: str = "Founder"
) -> Dict[str, Any]:
    """
    Execute a structured Phase 3 -> Phase 2 Pivot Loop.
    1. Logs pivot in decision_records.
    2. Marks invalidated assumption as INVALIDATED if specified.
    3. Resets session state safely to Phase 2 while preserving notes.
    """
    from storage import get_storage
    storage = get_storage()

    # 1. Update assumption if provided
    if invalidated_assumption_id:
        storage.update_assumption_status(invalidated_assumption_id, "INVALIDATED")

    # 2. Create Decision Record
    decision_record = storage.create_decision_record({
        "session_id": session_id,
        "stage": "PHASE_3_PIVOT_LOOP",
        "selected_problem_id": current_problem_id,
        "decision_rationale": f"[PIVOT EXECUTED by {author}]: {pivot_reason.strip()}",
        "supporting_evidence_ids": [invalidated_assumption_id] if invalidated_assumption_id else [],
    })

    # 3. Safe Session Reset to Phase 2
    state = storage.get_session(session_id) or {}

    # Append pivot log to session history
    history = state.get("pivot_history", [])
    history.append({
        "pivoted_from": current_problem_id,
        "reason": pivot_reason,
        "timestamp": decision_record.get("created_at"),
    })
    state["pivot_history"] = history

    # Reopen Phase 2 and reset downstream completion
    state["phase2_complete"] = False
    state["phase3_complete"] = False
    state["phase4_complete"] = False
    state["phase5_complete"] = False
    state["phase3_problem"] = None

    storage.save_session(session_id, state)

    return {
        "status": "success",
        "message": f"Pivot loop successfully executed. Routed back to Phase 2 with decision #{decision_record.get('id')} logged.",
        "decision_record": decision_record,
    }
