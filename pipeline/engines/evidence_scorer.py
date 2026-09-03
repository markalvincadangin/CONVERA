"""
Evidence Auto-Scorer Module
Calculates granular 5-dimension rubric scores (0-100%) and generates
actionable evidence improvement advice without requiring LLM calls.
"""

from typing import Any, Dict, List

def calculate_score_breakdown(problem: Dict[str, Any], sources: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Compute a multi-dimensional rubric breakdown for a problem record.
    Max points: 100.
    Dimensions:
    1. Source Diversity (0-20)
    2. Source Tier Quality (0-25)
    3. Quantified Impact (0-20)
    4. Workaround Specificity (0-20)
    5. Actor & Geographic Precision (0-15)
    """
    sources = sources or problem.get("sources") or []

    # 1. Source Diversity (0-20 pts)
    # Count distinct evidence types & source count
    ev_types = set()
    for s in sources:
        if s.get("evidence_type"):
            ev_types.add(s["evidence_type"].lower())
    for t in problem.get("evidence_types") or []:
        ev_types.add(t.lower())

    diversity_score = 0.0
    if len(sources) >= 3 or len(ev_types) >= 3:
        diversity_score = 20.0
    elif len(sources) == 2 or len(ev_types) == 2:
        diversity_score = 14.0
    elif len(sources) == 1:
        diversity_score = 8.0
    else:
        diversity_score = 3.0

    # 2. Source Tier Quality (0-25 pts)
    tier_score = 0.0
    has_tier_a = any(s.get("source_tier") == "A" or any(k in str(s.get("source_url", "")).lower() for k in ["psa", "doh", "dti", "da.", "bfar", "denr", "dost", "dswd", "deped", "iloilo.gov"]) for s in sources)
    has_tier_b = any(s.get("source_tier") == "B" or any(k in str(s.get("source_url", "")).lower() for k in ["news", "star", "guardian", "inquirer", "rappler"]) for s in sources)
    has_tier_c = any(s.get("source_tier") == "C" or not s.get("source_url") for s in sources)

    if has_tier_a and (has_tier_b or has_tier_c):
        tier_score = 25.0
    elif has_tier_a:
        tier_score = 20.0
    elif has_tier_b:
        tier_score = 15.0
    elif has_tier_c:
        tier_score = 8.0
    else:
        tier_score = 4.0

    # 3. Quantified Impact (0-20 pts)
    impact_str = str(problem.get("quantified_impact", "")).strip()
    impact_score = 0.0
    has_numbers = any(char.isdigit() for char in impact_str)
    has_currency = "₱" in impact_str or "php" in impact_str.lower() or "peso" in impact_str.lower()
    has_pct = "%" in impact_str or "percent" in impact_str.lower()
    has_time = any(k in impact_str.lower() for k in ["hour", "hr", "day", "week", "month", "yr", "year"])

    if has_numbers and (has_currency or has_pct or has_time) and len(impact_str) > 15:
        impact_score = 20.0
    elif has_numbers and (has_currency or has_pct or has_time):
        impact_score = 15.0
    elif has_numbers or len(impact_str) > 10:
        impact_score = 8.0
    elif impact_str:
        impact_score = 4.0

    # 4. Workaround Specificity (0-20 pts)
    workaround_str = str(problem.get("workaround", "")).strip()
    workaround_score = 0.0
    if len(workaround_str) > 30 and any(w in workaround_str.lower() for w in ["pay", "hire", "spend", "travel", "manual", "middlemen", "alternative", "cost", "₱", "loss"]):
        workaround_score = 20.0
    elif len(workaround_str) > 15:
        workaround_score = 14.0
    elif workaround_str:
        workaround_score = 7.0

    # 5. Actor & Geographic Precision (0-15 pts)
    loc_str = str(problem.get("sufferer_location", "")).strip().lower()
    occ_str = str(problem.get("sufferer_occupation", "")).strip().lower()
    precision_score = 0.0

    is_specific_loc = any(m in loc_str for m in ["miagao", "pototan", "estancia", "concepcion", "passi", "jaro", "mandurriao", "lapaz", "molo", "arevalo", "city proper", "oton", "tigbauan", "guimbal", "santa barbara", "cabatuan", "calinog", "dumangas", "barotac", "ajuy", "carles", "san joaquin", "alimodian", "leon"])
    is_specific_occ = len(occ_str) > 10 and not any(g == occ_str for g in ["people", "users", "everyone", "citizens", "consumers"])

    if is_specific_loc and is_specific_occ:
        precision_score = 15.0
    elif is_specific_loc or is_specific_occ:
        precision_score = 10.0
    elif loc_str or occ_str:
        precision_score = 5.0

    total_score = round(min(max(diversity_score + tier_score + impact_score + workaround_score + precision_score, 0.0), 100.0), 1)

    # Determine confidence classification
    if total_score >= 75.0:
        confidence = "HIGH"
        confidence_label = "🟢 High Evidence Confidence"
    elif total_score >= 45.0:
        confidence = "MODERATE"
        confidence_label = "🟡 Moderate Evidence Confidence"
    else:
        confidence = "WEAK"
        confidence_label = "🔴 Weak / Signal Only"

    # Improvement recommendations
    recommendations = []
    if diversity_score < 14:
        recommendations.append("Add at least 2 independent evidence types (e.g. combine news reports with local government statistics).")
    if tier_score < 15:
        recommendations.append("Cite an official Tier A institutional source (such as PSA, DA Region VI, DTI, or DOH).")
    if impact_score < 15:
        recommendations.append("Quantify the economic sacrifice in specific Pesos (₱), percentage loss, or wasted hours.")
    if workaround_score < 14:
        recommendations.append("Document what sufferers currently pay or endure as a makeshift coping behavior.")
    if precision_score < 10:
        recommendations.append("Narrow down the sufferer to a named municipality or barangay in Iloilo.")

    return {
        "total_score": total_score,
        "confidence": confidence,
        "confidence_label": confidence_label,
        "dimensions": {
            "source_diversity": {"score": diversity_score, "max": 20, "label": "Source Diversity"},
            "source_tier_quality": {"score": tier_score, "max": 25, "label": "Source Tier Quality"},
            "quantified_impact": {"score": impact_score, "max": 20, "label": "Quantified Consequence"},
            "workaround_specificity": {"score": workaround_score, "max": 20, "label": "Active Workaround"},
            "geographic_precision": {"score": precision_score, "max": 15, "label": "Actor & Location Precision"},
        },
        "recommendations": recommendations,
    }
