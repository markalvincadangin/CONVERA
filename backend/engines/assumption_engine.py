"""
Assumption & Claim Extraction Engine for RatchetAI (Step 1 Foundation)
Transforms problem statements, workarounds, and Devil's Advocate attacks into:
1. 4 Structured Claims (Friction, Consequence, Workaround Dissatisfaction, Adoption/Commitment)
2. Prioritized Assumption Radar (Critical, High, Medium, Low) with Mom Test behavioral questions
3. Existing Alternatives Map (Direct, Adjacent, Workaround)
"""

import re
import json
from typing import Any, Dict, List, Optional
from llm_gateway import generate_response_with_fallback


async def extract_claims_and_assumptions(
    problem: Dict[str, Any],
    mode: str = "COMMERCIAL"
) -> Dict[str, Any]:
    """
    Generate structured claims, ranked assumptions, and alternatives map for a problem.
    """
    statement = problem.get("problem_statement") or ""
    sufferer = problem.get("sufferer_occupation") or "Target Users"
    location = problem.get("sufferer_location") or "Iloilo, Philippines"
    workaround = problem.get("workaround") or "Manual coping mechanism"
    impact = problem.get("quantified_impact") or "Time/economic loss"
    da_data = problem.get("devils_advocate_data") or ""

    if isinstance(da_data, dict):
        da_data = json.dumps(da_data)

    adoption_criterion = (
        "Willingness-to-Pay & Commercial Switching"
        if mode == "COMMERCIAL"
        else "Institutional & Behavioral Adoption Feasibility (Civic/Academic)"
    )

    prompt = f"""You are an Expert Technopreneurship Assumption & Evidence Architecture Agent.
Analyze the following problem dossier and formulate:
1. 4 Core Claims (Friction Reality, Frequency/Consequence, Workaround Dissatisfaction, Adoption/Commitment).
2. 4 Prioritized Assumptions (from Critical to Low Risk) based on Devil's Advocate vulnerabilities.
3. 2-3 Existing Alternatives/Competitors currently used by the sufferer.

PROBLEM DOSSIER:
- Problem: {statement}
- Sufferer: {sufferer} in {location}
- Active Workaround: {workaround}
- Quantified Loss: {impact}
- Devil's Advocate Vulnerabilities: {da_data}
- Track Mode: {mode} ({adoption_criterion})

CRITICAL RULES:
- Convert Devil's Advocate flaws into testable assumptions.
- For each assumption, provide a MOM TEST BEHAVIORAL QUESTION (past behavior & actual spending, NEVER pitch hypothetical future solutions).
- Return strict JSON format only without markdown ticks.

OUTPUT FORMAT (STRICT JSON):
{{
  "claims": [
    {{
      "claim_type": "FRICTION_REALITY",
      "claim_text": "{sufferer} in {location} experiences genuine friction from {statement[:60]}.",
      "status": "HYPOTHESIS",
      "confidence_score": 75.0,
      "mode": "{mode}",
      "evidence_notes": "Corroborated by academic literature and field signals."
    }},
    {{
      "claim_type": "FREQUENCY_CONSEQUENCE",
      "claim_text": "This problem occurs recurringly, resulting in {impact}.",
      "status": "HYPOTHESIS",
      "confidence_score": 65.0,
      "mode": "{mode}",
      "evidence_notes": "Documented in preliminary impact metrics."
    }},
    {{
      "claim_type": "WORKAROUND_DISSATISFACTION",
      "claim_text": "Current workaround ({workaround}) is inefficient, expensive, or failing.",
      "status": "HYPOTHESIS",
      "confidence_score": 60.0,
      "mode": "{mode}",
      "evidence_notes": "Active workaround reported by sufferers."
    }},
    {{
      "claim_type": "ADOPTION_COMMITMENT",
      "claim_text": "{sufferer} is ready to adopt an alternative based on {adoption_criterion}.",
      "status": "UNKNOWN",
      "confidence_score": 30.0,
      "mode": "{mode}",
      "evidence_notes": "Requires Phase 3 Mom Test interview validation."
    }}
  ],
  "assumptions": [
    {{
      "assumption_text": "Short statement of critical assumption...",
      "risk_level": "CRITICAL",
      "status": "UNTESTED",
      "origin": "DEVILS_ADVOCATE",
      "testable_question": "Past behavioral interview question to test this assumption..."
    }},
    {{
      "assumption_text": "Short statement of high risk assumption...",
      "risk_level": "HIGH",
      "status": "UNTESTED",
      "origin": "DEVILS_ADVOCATE",
      "testable_question": "Past behavioral interview question..."
    }},
    {{
      "assumption_text": "Short statement of medium risk assumption...",
      "risk_level": "MEDIUM",
      "status": "UNTESTED",
      "origin": "DEVILS_ADVOCATE",
      "testable_question": "Past behavioral interview question..."
    }},
    {{
      "assumption_text": "Short statement of low risk feasibility assumption...",
      "risk_level": "LOW",
      "status": "UNTESTED",
      "origin": "DEVILS_ADVOCATE",
      "testable_question": "Past behavioral interview question..."
    }}
  ],
  "alternatives": [
    {{
      "alternative_name": "Spreadsheet / Manual Logbook",
      "category": "MANUAL_WORKAROUND",
      "why_it_fails": "Prone to lost context and duplicate entries."
    }},
    {{
      "alternative_name": "Group Chats / Direct Messaging",
      "category": "ADJACENT_APP",
      "why_it_fails": "Information gets buried in rapid message stream."
    }}
  ]
}}
"""

    try:
        resp = await generate_response_with_fallback(
            system_instruction="You are an expert evidence ledger architect. Return strict JSON only without markdown code blocks.",
            prompt=prompt,
        )
        cleaned_json = re.sub(r"^```[a-z]*\s*", "", resp.strip(), flags=re.IGNORECASE)
        cleaned_json = re.sub(r"\s*```$", "", cleaned_json).strip()
        data = json.loads(cleaned_json)
        return data
    except Exception as err:
        print(f"[!] Assumption engine fallback: {err}")
        # Deterministic fallback
        return {
            "claims": [
                {
                    "claim_type": "FRICTION_REALITY",
                    "claim_text": f"{sufferer} in {location} experiences genuine friction.",
                    "status": "HYPOTHESIS",
                    "confidence_score": 70.0,
                    "mode": mode,
                    "evidence_notes": "Derived from discovery statement.",
                },
                {
                    "claim_type": "FREQUENCY_CONSEQUENCE",
                    "claim_text": f"Results in measurable loss: {impact}.",
                    "status": "HYPOTHESIS",
                    "confidence_score": 60.0,
                    "mode": mode,
                    "evidence_notes": "Estimated impact.",
                },
                {
                    "claim_type": "WORKAROUND_DISSATISFACTION",
                    "claim_text": f"Current workaround ({workaround}) is inadequate.",
                    "status": "HYPOTHESIS",
                    "confidence_score": 50.0,
                    "mode": mode,
                    "evidence_notes": "Reported coping mechanism.",
                },
                {
                    "claim_type": "ADOPTION_COMMITMENT",
                    "claim_text": f"{sufferer} will adopt a better solution ({adoption_criterion}).",
                    "status": "UNKNOWN",
                    "confidence_score": 25.0,
                    "mode": mode,
                    "evidence_notes": "Unverified - requires Mom Test interviews.",
                },
            ],
            "assumptions": [
                {
                    "assumption_text": f"{sufferer} has the decision autonomy to adopt a new tool.",
                    "risk_level": "CRITICAL",
                    "status": "UNTESTED",
                    "origin": "DEVILS_ADVOCATE",
                    "testable_question": "When was the last time you tried a new workflow, and who had to approve it?",
                },
                {
                    "assumption_text": f"The financial/time loss ({impact}) is high enough to trigger active switching.",
                    "risk_level": "HIGH",
                    "status": "UNTESTED",
                    "origin": "DEVILS_ADVOCATE",
                    "testable_question": "How much time or money did you spend trying to fix this last week?",
                },
            ],
            "alternatives": [
                {
                    "alternative_name": workaround or "Manual Spreadsheet / Pen & Paper",
                    "category": "MANUAL_WORKAROUND",
                    "why_it_fails": "High manual overhead and prone to human error.",
                }
            ],
        }
