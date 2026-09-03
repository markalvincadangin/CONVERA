"""
Devil's Advocate Adversarial Agent
Stress-tests problems, uncovers hidden assumptions, pinpoints evidence vulnerabilities,
and formulates fatal kill questions to counteract LLM sycophancy.
"""

import json
import re
from typing import Any, Dict, Optional
from llm_gateway import generate_response_with_fallback

DEVILS_ADVOCATE_SYSTEM = """
You are the RatchetAI Adversarial Devil's Advocate Agent.
Your sole mission is to stress-test and aggressively critique startup problem claims in the Western Visayas (Iloilo / Panay) context.
Do NOT be agreeable or polite. You are an expert contrarian venture auditor looking for fatal flaws, hidden assumptions, fake pain points, and lack of real market evidence.

CLINICAL CRITIQUE OBJECTIVES:
1. ASSUMPTION ATTACKS: Identify 2-3 fragile underlying assumptions that could easily turn out to be false.
2. EVIDENCE & CITATION GAPS: Spot weak evidence, unverified numbers, or overgeneralized claims.
3. FATAL KILL QUESTION: Formulate the single most lethal question that could completely invalidate this problem thesis.
4. INCUMBENT / STATUS QUO RISK: Why hasn't the local market, LGU, or existing business already fixed this if it is so painful?
5. HARDENED REFRAMING: Provide a tighter, more defensible problem statement that eliminates the vulnerability.
6. PLAUSIBILITY SCORE (0-100): Your unvarnished, objective estimate of how real and consequential this problem actually is.

OUTPUT STRICT JSON ONLY:
{
  "problem_id": "string",
  "plausibility_score": 55,
  "verdict": "CHALLENGED | VULNERABLE | DEFENSIBLE",
  "assumption_attacks": [
    "Attack 1...",
    "Attack 2..."
  ],
  "evidence_gaps": [
    "Gap 1...",
    "Gap 2..."
  ],
  "fatal_kill_question": "String...",
  "status_quo_inertia": "Why people continue to tolerate the current workaround...",
  "hardened_reframing": "Sharpened problem statement...",
  "recommended_field_action": "Specific primary validation question for Phase 3..."
}
"""

async def challenge_problem_with_agent(problem: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs the Devil's Advocate adversarial critique on a problem record.
    """
    sources_summary = "\n".join([
        f"- {s.get('source_name', 'Source')} (Tier {s.get('source_tier', 'C')}): {s.get('quote_or_summary', 'N/A')}"
        for s in (problem.get("sources") or [])
    ]) or "No formal sources cited."

    prompt = (
        "STRESS-TEST THIS PROBLEM THESIS:\n"
        f"- Problem ID: {problem.get('id', 'N/A')}\n"
        f"- Sector: {problem.get('sector', 'N/A')}\n"
        f"- Target Sufferer: {problem.get('sufferer_occupation', 'N/A')} in {problem.get('sufferer_location', 'Iloilo')}\n"
        f"- Problem Statement: {problem.get('problem_statement', 'N/A')}\n"
        f"- Active Workaround: {problem.get('workaround', 'N/A')}\n"
        f"- Quantified Impact: {problem.get('quantified_impact', 'N/A')}\n"
        f"- Evidence Tier: {problem.get('evidence_tier', 'SIGNAL')}\n"
        f"- Cited Sources:\n{sources_summary}\n\n"
        "Conduct a ruthless adversarial critique and output the JSON report."
    )

    response = await generate_response_with_fallback(
        system_instruction=DEVILS_ADVOCATE_SYSTEM,
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
                "problem_id": problem.get("id", "N/A"),
                "plausibility_score": 50,
                "verdict": "CHALLENGED",
                "assumption_attacks": ["Assumes customer has active willingness to change long-standing habit."],
                "evidence_gaps": ["Lacks direct firsthand interview verification from target barangay."],
                "fatal_kill_question": "If this pain point is so severe, why are sufferers currently unwilling to pay for commercial substitutes?",
                "status_quo_inertia": "Existing informal workarounds may be cheaper than any formal intervention.",
                "hardened_reframing": problem.get("problem_statement", ""),
                "recommended_field_action": "Conduct 5 Mom Test interviews with target sufferers."
            }

    data["problem_id"] = problem.get("id", data.get("problem_id", "N/A"))
    return data
