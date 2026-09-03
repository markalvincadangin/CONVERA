"""
Evidence Freshness & Staleness Risk Engine for CONVERA.
Calculates domain-adjusted decay curves and alerts when decisions/claims rely on aging evidence.
"""
import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

DOMAIN_HALF_LIVES = {
    "AI_TECH": 2.5,
    "MARKET_PRICING": 2.0,
    "POLICY_REGULATION": 3.0,
    "HEALTHCARE_CLINICAL": 4.0,
    "AGRICULTURE_AGRONOMY": 5.0,
    "GENERAL_COMPUTING": 4.0,
    "ACADEMIC_THEORY": 8.0,
}

class FreshnessEngine:
    def __init__(self, current_year: Optional[int] = None):
        self.current_year = current_year or datetime.now(timezone.utc).year

    def calculate_evidence_freshness(
        self,
        publication_year: Optional[int],
        domain_category: str = "GENERAL_COMPUTING"
    ) -> Dict[str, Any]:
        if not publication_year or publication_year < 1900 or publication_year > self.current_year:
            # Assume current year if unknown or invalid
            pub_year = self.current_year
        else:
            pub_year = publication_year

        age_years = max(0, self.current_year - pub_year)
        half_life = DOMAIN_HALF_LIVES.get(domain_category.upper(), 4.0)

        # Exponential decay: score = e^(-ln(2) * age / half_life)
        decay_factor = math.exp(-0.69315 * (age_years / half_life))
        freshness_score = round(max(0.05, min(1.0, decay_factor)), 3)

        if freshness_score >= 0.60:
            status = "FRESH"
            risk_level = "LOW"
            action = "No action needed. Evidence is contemporary."
        elif freshness_score >= 0.30:
            status = "AGING"
            risk_level = "MEDIUM"
            action = "Monitor for recent updates or replication studies."
        else:
            status = "STALE"
            risk_level = "HIGH"
            action = "Revalidation required! This decision/claim relies on evidence that may be outdated."

        return {
            "publication_year": pub_year,
            "age_years": age_years,
            "domain_category": domain_category,
            "half_life_years": half_life,
            "freshness_score": freshness_score,
            "status": status,
            "staleness_risk": risk_level,
            "advisory": action
        }

    def evaluate_project_freshness(self, sources: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not sources:
            return {
                "overall_freshness_score": 1.0,
                "stale_count": 0,
                "fresh_count": 0,
                "sources_analyzed": 0,
                "stale_alerts": []
            }

        freshness_results = []
        stale_alerts = []
        for s in sources:
            pub_year = s.get("year") or s.get("publication_year")
            # Try parsing date string if year missing
            if not pub_year and s.get("date"):
                try:
                    pub_year = int(str(s.get("date"))[:4])
                except (ValueError, TypeError):
                    pub_year = None

            res = self.calculate_evidence_freshness(pub_year, s.get("domain", "GENERAL_COMPUTING"))
            res["source_title"] = s.get("title", "Untitled Source")
            res["source_id"] = s.get("id") or s.get("url") or "source_unknown"
            freshness_results.append(res)

            if res["status"] == "STALE":
                stale_alerts.append({
                    "source_id": res["source_id"],
                    "source_title": res["source_title"],
                    "age_years": res["age_years"],
                    "warning": f"Source '{res['source_title']}' ({res['publication_year']}) is {res['age_years']} years old and may no longer reflect current realities."
                })

        avg_score = round(sum(r["freshness_score"] for r in freshness_results) / len(freshness_results), 3)
        return {
            "overall_freshness_score": avg_score,
            "stale_count": sum(1 for r in freshness_results if r["status"] == "STALE"),
            "aging_count": sum(1 for r in freshness_results if r["status"] == "AGING"),
            "fresh_count": sum(1 for r in freshness_results if r["status"] == "FRESH"),
            "sources_analyzed": len(freshness_results),
            "stale_alerts": stale_alerts,
            "detailed_breakdown": freshness_results
        }
