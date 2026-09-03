"""
Automated Deliverables & Venture Synthesis Generator
Generates clinical Lean Canvas (9-box), SWOT & Competitive Differentiation Matrix,
and 10-Slide Pitch Deck Narrative from the session’s evidence pipeline.
"""

import json
import re
from typing import Any, Dict, Optional
from llm_gateway import generate_response_with_fallback

LEAN_CANVAS_SYSTEM = """
You are the RatchetAI Venture Architect.
Your task is to synthesize the complete evidence collected across Phases 1-5 into a professional, evidence-grounded 9-Box Lean Canvas (Ash Maurya framework) for Western Visayas (Iloilo / Panay).
Do NOT hallucinate generic startup cliches. Every box MUST reflect the specific sufferers, locations, quantified consequences, workarounds, mechanism families, and Phase 5 empirical metrics recorded in the session dossier.

THE 9 CANONICAL BOXES:
1. PROBLEM: Top 3 specific frictions, target sufferer, existing makeshift workarounds.
2. CUSTOMER SEGMENTS: Target early adopter cohort, demographic/geographic bounds (e.g. municipality, role).
3. UNIQUE VALUE PROPOSITION: Single, clear, compelling message that states why you are different and worth buying.
4. SOLUTION: Top 3 features/mechanisms mapped directly to the root causes.
5. CHANNELS: Path to early adopters (LGU partnerships, co-ops, Facebook groups, physical trade centers).
6. REVENUE STREAMS: Monetization model, pricing unit (e.g. subscription, transaction fee, margin), revenue potential.
7. COST STRUCTURE: Customer acquisition cost, infrastructure/hosting, operational cold chain/logistics, personnel.
8. KEY METRICS: Primary conversion metric, retention rate, daily/monthly active usage, empirical Phase 5 evidence.
9. UNFAIR ADVANTAGE: Defensible moat that cannot be easily copied (local proprietary partnerships, switching costs, regional data network effects).

OUTPUT STRICT JSON ONLY:
{
  "project_name": "string",
  "problem": {
    "top_frictions": ["Friction 1...", "Friction 2..."],
    "existing_alternatives": ["Alternative 1...", "Alternative 2..."]
  },
  "customer_segments": {
    "target_customers": ["Segment 1..."],
    "early_adopters": ["Specific cohort in Iloilo..."]
  },
  "unique_value_proposition": {
    "headline": "Compelling value proposition...",
    "high_level_concept": "Analogy or crisp 1-liner..."
  },
  "solution": {
    "core_mechanisms": ["Mechanism 1...", "Mechanism 2...", "Mechanism 3..."]
  },
  "channels": {
    "distribution_paths": ["Channel 1...", "Channel 2..."]
  },
  "revenue_streams": {
    "monetization_model": "Model description...",
    "pricing_structure": "Pricing details..."
  },
  "cost_structure": {
    "fixed_costs": ["Cost 1..."],
    "variable_costs": ["Cost 2..."]
  },
  "key_metrics": {
    "primary_metric": "North star metric...",
    "empirical_phase5_proof": "Conversion rate and validation evidence..."
  },
  "unfair_advantage": {
    "moat_description": "Defensible regional advantage..."
  }
}
"""

SWOT_SYSTEM = """
You are the RatchetAI Strategic Analyst.
Analyze the venture concept and market position in Western Visayas (Iloilo, Panay, Guimaras) across internal factors (Strengths, Weaknesses) and external market realities (Opportunities, Threats), plus a 3-way Competitor / Incumbent Comparison Grid.

OUTPUT STRICT JSON ONLY:
{
  "strengths": [
    "Evidence-backed advantage 1...",
    "Strength 2..."
  ],
  "weaknesses": [
    "Internal limitation or unproven assumption 1...",
    "Weakness 2..."
  ],
  "opportunities": [
    "Regional market expansion or LGU alignment 1...",
    "Opportunity 2..."
  ],
  "threats": [
    "Regulatory, supply chain, or incumbent reaction 1...",
    "Threat 2..."
  ],
  "competitor_grid": [
    {
      "competitor_name": "Name of incumbent / workaround",
      "competitor_type": "Informal Workaround | Direct Competitor | Institutional Substitute",
      "their_advantage": "Why users currently stick with them...",
      "our_differentiation": "Why our mechanism beats them..."
    }
  ],
  "strategic_recommendations": [
    "Recommendation 1...",
    "Recommendation 2..."
  ]
}
"""

PITCH_DECK_SYSTEM = """
You are a Premier Startup Pitch Deck Architect and Technopreneurship Mentor.
Generate a structured, compelling 10-Slide Pitch Deck narrative grounded strictly in the session evidence.

THE 10 STANDARD SLIDES:
Slide 1: Title & Hook (Venture Name, Tagline, Category)
Slide 2: The Sufferer & The Pain (The acute quantified friction in Western Visayas)
Slide 3: The Failed Status Quo (Why current workarounds are bleeding time and money)
Slide 4: The Solution & Mechanism (How our core mechanism fixes the root cause)
Slide 5: Empirical Validation Proof (Phase 5 MVP testing metrics, behavioral commitment tier, conversion rate)
Slide 6: Market Opportunity & TAM/SAM/SOM (Target demographic scale in Region VI and Philippines)
Slide 7: Business & Monetization Model (Unit economics, pricing, revenue streams)
Slide 8: Go-to-Market & Channels (How we reach the early adopter cohort)
Slide 9: Competitive Moat & Unfair Advantage (Why incumbents cannot easily replicate us)
Slide 10: The Ask & 90-Day Roadmap (What we need next: pilot funding, LGU access, or engineering)

OUTPUT STRICT JSON ONLY:
{
  "presentation_title": "string",
  "tagline": "string",
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide Title",
      "headline": "Punchy 1-line headline",
      "bullet_points": ["Bullet 1", "Bullet 2", "Bullet 3"],
      "speaker_notes": "What the presenter should say aloud in 30 seconds..."
    }
  ]
}
"""

def extract_session_dossier_text(state: Dict[str, Any]) -> str:
    """Combines all session phase artifacts into a clean synthesis brief."""
    lines = [
        f"VENTURE PROJECT: {state.get('project_name', 'Iloilo Technopreneurship Project')}",
        f"SESSION ID: {state.get('session_id', 'N/A')}",
        "",
        "=== PHASE 1: DISCOVERED PROBLEMS ===",
        str(state.get("phase1_response", "No Phase 1 data."))[:1500],
        "",
        "=== PHASE 2: SHORTLISTED PROBLEM MATRIX ===",
        str(state.get("phase2_response", "No Phase 2 data."))[:1500],
        "",
        "=== PHASE 3: VALIDATED PROBLEM & SOCRATIC DOSSIER ===",
        f"Problem Statement: {state.get('phase3_problem', 'N/A')}",
        str(state.get("phase3_response", "No Phase 3 data."))[:1500],
        "",
        "=== PHASE 4: SOLUTION CONCEPTS & SVB ===",
        str(state.get("phase4_response", "No Phase 4 data."))[:1500],
        "",
        "=== PHASE 5: MVP EMPIRICAL VALIDATION AUDIT ===",
        str(state.get("phase5_response", "No Phase 5 data."))[:1500],
    ]
    return "\n".join(lines)


async def generate_lean_canvas(state: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a 9-box Lean Canvas from session evidence."""
    dossier = extract_session_dossier_text(state)
    prompt = f"SESSION EVIDENCE DOSSIER:\n\n{dossier}\n\nGenerate the complete 9-box Lean Canvas JSON."

    response = await generate_response_with_fallback(
        system_instruction=LEAN_CANVAS_SYSTEM,
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
            raise ValueError("Failed to parse Lean Canvas JSON response from model.")

    return data


async def generate_swot_analysis(state: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a SWOT and Competitor Differentiation Matrix from session evidence."""
    dossier = extract_session_dossier_text(state)
    prompt = f"SESSION EVIDENCE DOSSIER:\n\n{dossier}\n\nGenerate the SWOT and Competitive Differentiation Matrix JSON."

    response = await generate_response_with_fallback(
        system_instruction=SWOT_SYSTEM,
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
            raise ValueError("Failed to parse SWOT JSON response from model.")

    return data


async def generate_pitch_deck(state: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a 10-slide Pitch Deck narrative with speaker notes."""
    dossier = extract_session_dossier_text(state)
    prompt = f"SESSION EVIDENCE DOSSIER:\n\n{dossier}\n\nGenerate the 10-Slide Pitch Deck JSON structure."

    response = await generate_response_with_fallback(
        system_instruction=PITCH_DECK_SYSTEM,
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
            raise ValueError("Failed to parse Pitch Deck JSON response from model.")

    return data
