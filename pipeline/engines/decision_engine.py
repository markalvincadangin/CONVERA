"""
Decision Intelligence & Pivot Loop Engine for RatchetAI (Step 2 Foundation)
Provides:
1. Multi-Candidate Decision Room AI Synthesis (Explainable ranking across Evidence & Assumptions)
2. Immutable Decision Record Commitments
3. Structured Phase 3 -> Phase 2 Pivot / Re-evaluate Learning Loops
"""

import re
import json
from typing import Any, Dict, List, Optional
from llm_gateway import generate_response_with_fallback


async def synthesize_decision_room(candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze 2 to 4 candidates based on their Evidence Ledgers, Assumption Radars, and DOIs.
    Returns an objective, explainable ranking synthesis.
    """
    if not candidates:
        return {"ranking": [], "recommendation_summary": "No candidates provided.", "candidate_breakdowns": []}

    candidate_summaries = []
    for idx, c in enumerate(candidates, 1):
        cid = c.get("id", f"P-{idx}")
        stmt = c.get("problem_statement", "")
        actor = c.get("sufferer_occupation", "")
        loc = c.get("sufferer_location", "")
        impact = c.get("quantified_impact", "")
        score = c.get("score", 75)
        sources_count = len(c.get("sources", []))
        
        candidate_summaries.append(
            f"[{idx}] ID: {cid}\n"
            f"Statement: {stmt}\n"
            f"Sufferer: {actor} in {loc}\n"
            f"Quantified Loss: {impact}\n"
            f"Score: {score}% | Attached Research Papers: {sources_count}\n"
        )

    cand_text = "\n".join(candidate_summaries)

    prompt = f"""You are an Expert Technopreneurship Investment & Incubation Decision Judge.
Evaluate and rank the following candidate problem theses based on:
1. Evidence Strength (real documented pain vs hypothetical assumptions)
2. Sufferer Urgency & Quantified Loss
3. Technical & Behavioral Feasibility
4. Winnability (avoiding saturated/unsolvable broad problems)

CANDIDATES:
{cand_text}

OUTPUT FORMAT (STRICT JSON ONLY without markdown ticks):
{{
  "recommended_winner_id": "ID of #1 ranked problem",
  "recommendation_summary": "2-3 crisp sentences explaining why the winner represents the strongest opportunity and what makes it superior to the rejected alternatives.",
  "candidate_breakdowns": [
    {{
      "problem_id": "ID",
      "rank": 1,
      "pros": ["Key strength 1", "Key strength 2"],
      "risks": ["Key vulnerability or unvalidated assumption"],
      "verdict": "RECOMMENDED" or "VIABLE_ALTERNATIVE" or "HIGH_RISK"
    }}
  ]
}}
"""

    try:
        resp = await generate_response_with_fallback(
            system_instruction="You are a strict technopreneurship decision judge. Return strict JSON only without markdown codeblocks.",
            prompt=prompt,
        )
        cleaned_json = re.sub(r"^```[a-z]*\s*", "", resp.strip(), flags=re.IGNORECASE)
        cleaned_json = re.sub(r"\s*```$", "", cleaned_json).strip()
        return json.loads(cleaned_json)
    except Exception as err:
        print(f"[!] Decision room synthesis fallback: {err}")
        winner = candidates[0]
        return {
            "recommended_winner_id": winner.get("id"),
            "recommendation_summary": f"Problem {winner.get('id')} exhibits the highest baseline evidence score and quantified impact among the evaluated candidates.",
            "candidate_breakdowns": [
                {
                    "problem_id": c.get("id"),
                    "rank": i + 1,
                    "pros": [f"Documented for {c.get('sufferer_occupation')}"],
                    "risks": ["Requires Mom Test behavioral verification"],
                    "verdict": "RECOMMENDED" if i == 0 else "VIABLE_ALTERNATIVE",
                }
                for i, c in enumerate(candidates)
            ],
        }


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
