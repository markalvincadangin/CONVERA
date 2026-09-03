"""
Blind Spot & Portfolio Bias Detector
Analyzes the entire Problem Bank collection across sectors and demographics
to surface blind spots, cognitive biases, and unaddressed market opportunities in Western Visayas.
"""

import json
import re
from typing import Any, Dict, List
from llm_gateway import generate_response_with_fallback

BLIND_SPOT_SYSTEM = """
You are the RatchetAI Strategic Portfolio Auditor.
Your task is to analyze an entire collection of discovered startup problems in the Western Visayas (Iloilo, Panay, Guimaras) region and identify systemic blind spots, demographic biases, and unaddressed economic friction points.

8 CANONICAL SECTORS:
1. Agriculture & Fisheries
2. Health & Wellness
3. MSMEs & Retail
4. Education & Youth
5. Transport & Logistics
6. Housing & Utilities
7. Government Services & Compliance
8. Finance & Credit

AUDIT CRITERIA:
1. SECTOR COVERAGE GAPS: Which sectors have zero or superficial coverage?
2. GEOGRAPHIC & DEMOGRAPHIC BIASES: Are problems too urban-centric (e.g., only Iloilo City) ignoring agricultural/coastal municipalities (e.g., Pototan, Concepcion, Estancia, Miagao, Calinog)? Are certain vulnerable actors excluded?
3. COGNITIVE BIAS DETECTION: Identify patterns of Availability Bias (focusing only on widely publicized news stories), Anchoring, or Technology-first biases.
4. HIGH-LEVERAGE OPPORTUNITIES: 3 actionable exploratory problem angles specific to Iloilo economic realities (e.g., cold chain, ports, agri-coops, MSME micro-credit, BPO transit).

OUTPUT STRICT JSON ONLY:
{
  "total_problems_analyzed": 10,
  "sector_distribution": {
    "Agriculture & Fisheries": 2,
    "Health & Wellness": 3,
    "MSMEs & Retail": 1,
    "Education & Youth": 0,
    "Transport & Logistics": 0,
    "Housing & Utilities": 0,
    "Government Services & Compliance": 0,
    "Finance & Credit": 0
  },
  "coverage_rating": "CRITICAL_GAPS | BALANCED | DIVERSE",
  "identified_blind_spots": [
    {
      "area": "Sector / Demographic / Geo",
      "severity": "HIGH | MEDIUM",
      "observation": "Description of the gap...",
      "why_it_matters": "Why this represents an untapped opportunity or research flaw..."
    }
  ],
  "cognitive_biases_flagged": [
    {
      "bias_type": "Availability Bias | Sampling Bias | Solution Bias",
      "manifestation": "How this bias appears in the current problem portfolio..."
    }
  ],
  "suggested_explorations": [
    {
      "sector": "Sector Name",
      "target_location": "Specific Municipality/District",
      "starter_friction_question": "Have you investigated..."
    }
  ]
}
"""

async def detect_portfolio_blind_spots(problems: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates the complete Problem Bank list for blind spots and systemic biases.
    """
    if not problems:
        return {
            "total_problems_analyzed": 0,
            "coverage_rating": "EMPTY",
            "identified_blind_spots": [{
                "area": "Empty Problem Bank",
                "severity": "HIGH",
                "observation": "No problems currently recorded in the workspace.",
                "why_it_matters": "Run Phase 1 Discovery or add field notes to begin analysis."
            }],
            "cognitive_biases_flagged": [],
            "suggested_explorations": []
        }

    summary_lines = []
    for i, p in enumerate(problems, 1):
        summary_lines.append(
            f"{i}. [{p.get('id', 'N/A')}] Sector: {p.get('sector', 'General')} | Location: {p.get('sufferer_location', 'N/A')} | Sufferer: {p.get('sufferer_occupation', 'N/A')} | Friction: {p.get('problem_statement', '')[:120]}"
        )

    portfolio_text = "\n".join(summary_lines)

    prompt = (
        f"ANALYZE THIS PROBLEM PORTFOLIO ({len(problems)} total records):\n\n"
        f"{portfolio_text}\n\n"
        "Audit the portfolio against the 8 canonical sectors and Iloilo economic ecosystem. Output the JSON report."
    )

    response = await generate_response_with_fallback(
        system_instruction=BLIND_SPOT_SYSTEM,
        prompt=prompt,
    )

    cleaned = response.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", cleaned)
        cleaned = re.sub(r"\n```$", "", cleaned)

    try:
        data = json.loads(cleaned)
    except Exception:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            data = json.loads(match.group(0))
        else:
            data = {
                "total_problems_analyzed": len(problems),
                "coverage_rating": "CRITICAL_GAPS",
                "identified_blind_spots": [{
                    "area": "Multi-sector balance",
                    "severity": "MEDIUM",
                    "observation": "Problems are concentrated in a few sectors.",
                    "why_it_matters": "Explore missing sectors to discover underserved niches."
                }],
                "cognitive_biases_flagged": [],
                "suggested_explorations": []
            }

    data["total_problems_analyzed"] = len(problems)
    return data
