from typing import Dict, Any, List, Optional
from storage.base import BaseStorageAdapter

TIER_WEIGHTS = {
    "A": 3.0,
    "B": 2.0,
    "C": 1.0,
}

STRENGTH_MULTIPLIERS = {
    "STRONG": 1.0,
    "MODERATE": 0.7,
    "WEAK": 0.4,
}

def compute_claim_epistemic_balance(claim_id: str, storage: BaseStorageAdapter) -> Dict[str, Any]:
    """
    Compute the mathematical Net Epistemic Balance for a claim based on its attached empirical evidence links.
    Formula: Balance = Sum(Support_Weights) - Sum(Contradict_Weights)
    """
    links = storage.list_claim_evidence_links(claim_id=claim_id)
    
    supporting_points = 0.0
    contradicting_points = 0.0
    supporting_count = 0
    contradicting_count = 0
    context_count = 0

    for link in links:
        rel = (link.get("relation_type") or "SUPPORTS").upper()
        tier = (link.get("source_tier") or "B").upper()
        strength = (link.get("evidence_strength") or "STRONG").upper()
        
        tier_wt = TIER_WEIGHTS.get(tier, 2.0)
        str_mul = STRENGTH_MULTIPLIERS.get(strength, 1.0)
        points = tier_wt * str_mul

        if rel in ["SUPPORTS", "VALIDATES"]:
            supporting_points += points
            supporting_count += 1
        elif rel in ["CONTRADICTS", "FALSIFIES"]:
            contradicting_points += points
            contradicting_count += 1
        else:
            context_count += 1

    net_score = round(supporting_points - contradicting_points, 2)
    
    # Determine Epistemic Status
    if contradicting_count > 0 and contradicting_points >= supporting_points:
        epistemic_status = "CONTRADICTED"
        verdict = "EVIDENCE_CONTRADICTION"
    elif supporting_points >= 2.0 and supporting_points > contradicting_points:
        epistemic_status = "SUPPORTED"
        verdict = "EMPIRICALLY_SUPPORTED"
    elif supporting_count > 0 or contradicting_count > 0:
        epistemic_status = "PARTIALLY_SUPPORTED"
        verdict = "MODERATE_EVIDENCE"
    else:
        epistemic_status = "HYPOTHESIS"
        verdict = "UNVALIDATED_HYPOTHESIS"

    # Normalized score (0 - 100)
    total_magnitude = supporting_points + contradicting_points
    if total_magnitude > 0:
        ratio = max(0.0, min(1.0, (net_score + total_magnitude) / (2 * total_magnitude)))
        normalized_score = round(ratio * 100, 1)
    else:
        normalized_score = 50.0

    return {
        "claim_id": claim_id,
        "epistemic_status": epistemic_status,
        "verdict": verdict,
        "net_score": net_score,
        "normalized_score": normalized_score,
        "supporting_points": round(supporting_points, 2),
        "contradicting_points": round(contradicting_points, 2),
        "supporting_count": supporting_count,
        "contradicting_count": contradicting_count,
        "context_count": context_count,
        "links_count": len(links),
    }

def get_problem_epistemic_tree(problem_id: str, storage: BaseStorageAdapter) -> Dict[str, Any]:
    """
    Traverse the complete epistemic graph for a problem:
    Problem -> Claims -> Epistemic Links -> Sources
            -> Assumptions -> Validation Tests
            -> Downstream Decisions
    """
    problem = storage.get_problem(problem_id)
    if not problem:
        return {}

    sources = problem.get("sources", [])
    claims = problem.get("claims", [])
    assumptions = problem.get("assumptions", [])
    all_links = storage.list_claim_evidence_links(problem_id=problem_id)

    # Attach balance and links to each claim
    enriched_claims = []
    for claim in claims:
        cid = claim.get("id")
        claim_links = [l for l in all_links if l.get("claim_id") == cid]
        balance = compute_claim_epistemic_balance(cid, storage)
        enriched_claims.append({
            **claim,
            "links": claim_links,
            "epistemic_balance": balance,
        })

    # Attach tests to assumptions
    enriched_assumptions = []
    for asm in assumptions:
        aid = asm.get("id")
        tests = storage.list_assumption_tests(aid)
        enriched_assumptions.append({
            **asm,
            "tests": tests,
        })

    return {
        "problem_id": problem_id,
        "problem_statement": problem.get("problem_statement"),
        "sector": problem.get("sector"),
        "score": problem.get("score"),
        "sources": sources,
        "claims": enriched_claims,
        "assumptions": enriched_assumptions,
        "total_claims": len(enriched_claims),
        "total_assumptions": len(enriched_assumptions),
        "total_sources": len(sources),
    }
