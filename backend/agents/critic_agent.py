"""
CONVERA Socratic Critic & Devil's Advocate Agent (Phase 5)
==========================================================
Governed by: CCDS Socratic Review Rules & The Mom Test.
Interrogates problem statements to identify hidden cognitive biases,
status-quo inertia, ungrounded assumptions, and formulates fatal kill questions.
"""

from __future__ import annotations
import json
import re
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

from llm_gateway import generate_response_with_fallback, TaskCategory


class CriticalReviewReport(BaseModel):
    problem_statement: str
    plausibility_score: int = Field(ge=0, le=100)
    verdict: str  # ROBUST, VULNERABLE, CRITICAL_FLAWS
    fatal_kill_question: str
    status_quo_inertia: str
    assumption_attacks: List[str] = Field(default_factory=list)
    cognitive_biases_flagged: List[str] = Field(default_factory=list)
    evidence_gaps: List[str] = Field(default_factory=list)
    hardened_reframing: str
    recommended_field_action: str


async def execute_critic_agent(
    problem_statement: str,
    sector: Optional[str] = None,
    target_user: Optional[str] = None,
    current_workaround: Optional[str] = None,
    quantified_impact: Optional[str] = None
) -> CriticalReviewReport:
    """
    Autonomous Socratic Critic Agent.
    Attacks problem claims using Mom Test discipline and identifies fatal failure modes.
    """
    system_prompt = (
        "You are the CONVERA Socratic Interrogator & Devil's Advocate Agent.\n"
        "Your role is NOT to validate or encourage founders, but to aggressively stress-test\n"
        "their problem definitions using the Mom Test, behavioral economics, and empirical skepticism.\n"
        "Identify why users might tolerate the problem (Status Quo Inertia), uncover hidden assumptions,\n"
        "and formulate a single fatal kill question that could falsify the premise.\n\n"
        "Respond ONLY with a valid JSON object matching this schema:\n"
        "{\n"
        '  "plausibility_score": 65,\n'
        '  "verdict": "VULNERABLE" | "ROBUST" | "CRITICAL_FLAWS",\n'
        '  "fatal_kill_question": "Sharp question targeting the fatal assumption",\n'
        '  "status_quo_inertia": "Why users currently accept or work around the problem without buying a new solution",\n'
        '  "assumption_attacks": ["Assumes farmers have smartphone data coverage", "Assumes LGU will subsidize unit"],\n'
        '  "cognitive_biases_flagged": ["Confirmation Bias", "Feature-First Fallacy"],\n'
        '  "evidence_gaps": ["No primary interview from municipal cold storage operators"],\n'
        '  "hardened_reframing": "Objective, friction-grounded restatement of the real pain point",\n'
        '  "recommended_field_action": "Specific observable test to run in the field next"\n'
        "}"
    )

    user_prompt = (
        f"Problem Statement: {problem_statement}\n"
        f"Sector: {sector or 'Unspecified'}\n"
        f"Target User: {target_user or 'Unspecified'}\n"
        f"Current Workaround: {current_workaround or 'Unspecified'}\n"
        f"Quantified Impact: {quantified_impact or 'Unspecified'}"
    )

    ai_resp_str = await generate_response_with_fallback(
        system_instruction=system_prompt,
        prompt=user_prompt,
        task_category=TaskCategory.SOCRATIC_CLINIC
    )

    # Clean JSON
    match = re.search(r"\{[\s\S]*\}", ai_resp_str)
    raw_json = match.group(0) if match else "{}"

    try:
        data = json.loads(raw_json)
    except Exception:
        data = {
            "plausibility_score": 60,
            "verdict": "VULNERABLE",
            "fatal_kill_question": "What evidence proves sufferers will change their established routine?",
            "status_quo_inertia": "Users currently rely on established manual habits and workarounds.",
            "assumption_attacks": ["Assumes sufferers actively search for commercial alternatives"],
            "cognitive_biases_flagged": ["Solution-Premature Bias"],
            "evidence_gaps": ["Lacks direct user behavioral verification"],
            "hardened_reframing": problem_statement,
            "recommended_field_action": "Conduct 5 Mom Test interviews observing actual past behavior."
        }

    return CriticalReviewReport(
        problem_statement=problem_statement,
        plausibility_score=int(data.get("plausibility_score", 60)),
        verdict=data.get("verdict", "VULNERABLE"),
        fatal_kill_question=data.get("fatal_kill_question", "Why hasn't the market solved this already?"),
        status_quo_inertia=data.get("status_quo_inertia", "Users rely on manual workarounds."),
        assumption_attacks=data.get("assumption_attacks", []),
        cognitive_biases_flagged=data.get("cognitive_biases_flagged", []),
        evidence_gaps=data.get("evidence_gaps", []),
        hardened_reframing=data.get("hardened_reframing", problem_statement),
        recommended_field_action=data.get("recommended_field_action", "Run field interviews.")
    )
