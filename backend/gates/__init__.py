"""
Gate enforcement functions — rules that are in CODE, not just in the system prompt.
These functions are called by the orchestrator at phase boundaries.
"""

from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from schemas import Phase2Output, Phase3Output, Phase4Output


# ─────────────────────────────────────────────
# Phase 3 — Level sequencing gate
# ─────────────────────────────────────────────

LEVEL_ORDER = [
    "specific_sufferer",      # Level 1
    "demonstrated_pain",      # Level 2
    "intensity_frequency",    # Level 3
    "local_market_size",      # Level 4
    "population_evidence",    # Level 5
    "economic_consequence",   # Level 6
]

LEVEL_LABELS = {
    "specific_sufferer":   "Level 1 — Specific Sufferer",
    "demonstrated_pain":   "Level 2 — Demonstrated Pain",
    "intensity_frequency": "Level 3 — Intensity & Frequency (separate)",
    "local_market_size":   "Level 4 — Local Market Size",
    "population_evidence": "Level 5 — Population / Market Evidence",
    "economic_consequence":"Level 6 — Economic / Behavioral Consequence",
}

LEVEL_INSTRUCTIONS = {
    "specific_sufferer": (
        "Ask the student to name the EXACT person who has this problem: "
        "specific occupation, sector, AND named Iloilo City barangay or province municipality. "
        "'Farmers' or 'students' without a location does NOT satisfy this level."
    ),
    "demonstrated_pain": (
        "Ask the student to state what this person currently DOES to cope — "
        "the existing workaround, tool, person, or habit they already pay time/money/effort for. "
        "'There's no solution' is NOT a workaround — that's a solution absence, not demonstrated pain."
    ),
    "intensity_frequency": (
        "Ask the student to quantify BOTH dimensions SEPARATELY: "
        "(1) Frequency — how often does this happen (per day/week/month/season)? "
        "(2) Severity — how bad is each occurrence (pesos lost, hours wasted, units spoiled)? "
        "Reject 'often' or 'a lot' — demand concrete numbers with units."
    ),
    "local_market_size": (
        "Ask the student to estimate how many such people/businesses exist in Iloilo City/Province. "
        "Require a real reference point: a barangay count, market/association size, DTI/DA/PSA figure, "
        "or direct enumeration ('counted 47 vendors in [market] on [date]'). "
        "Do NOT accept 'Philippine MSMEs = millions' — that is too broad."
    ),
    "population_evidence": (
        "Ask the student to use bottom-up estimation for the specific target segment: "
        "population universe → target segment → reachable segment → validated sufferers. "
        "This level is STRICTLY about scope and population count. "
        "Do NOT accept economic consequence evidence here — that belongs in Level 6."
    ),
    "economic_consequence": (
        "Ask the student to state evidence — not assumption — of what the SAME SEGMENT from Level 5 "
        "is already paying, losing, spending, or sacrificing to cope. "
        "CRITICAL: Evidence must be anchored to the specific population from Level 5. "
        "Evidence from a different segment or geography does NOT satisfy this level. "
        "Evidence hierarchy: Strong (actual financial loss, paid substitutes, labor) > "
        "Medium (time loss, manual workaround, inventory waste) > Weak (complaints, stated annoyance). "
        "Reject 'they would pay for our app' — that is solution evidence, not problem evidence. "
        "If student mixes coping evidence with solution speculation: extract the coping part, "
        "acknowledge it, redirect the speculation, re-ask for the missing portion."
    ),
}


def get_current_level(session_state: dict) -> str:
    """Returns the key of the next level to ask, or 'complete' if all done."""
    completed = session_state.get("completed_levels", [])
    for level in LEVEL_ORDER:
        if level not in completed:
            return level
    return "complete"


def get_level_label(level_key: str) -> str:
    return LEVEL_LABELS.get(level_key, level_key)


def get_level_instruction(level_key: str) -> str:
    return LEVEL_INSTRUCTIONS.get(level_key, "")


def mark_level_complete(session_state: dict, level: str) -> dict:
    completed = session_state.get("completed_levels", [])
    if level not in completed:
        completed.append(level)
    session_state["completed_levels"] = completed
    return session_state


def all_levels_complete(session_state: dict) -> bool:
    return get_current_level(session_state) == "complete"


def levels_progress_string(session_state: dict) -> str:
    completed = session_state.get("completed_levels", [])
    parts = []
    for level in LEVEL_ORDER:
        label = LEVEL_LABELS[level]
        status = "✅" if level in completed else "⬜"
        parts.append(f"{status} {label}")
    return "\n".join(parts)


# ─────────────────────────────────────────────
# Phase 4 — Concept minimum gate
# ─────────────────────────────────────────────

MIN_CONCEPTS = 5
MIN_FAMILIES = 3


def check_concept_minimum(concepts: list[dict]) -> dict:
    """
    Returns a dict with:
      - minimum_met: bool
      - concept_count: int
      - family_count: int
      - concepts_needed: int (0 if met)
      - families_needed: int (0 if met)
      - families_present: list[str]
      - families_missing_examples: list[str]  (suggestions for untried families)
    """
    from schemas.phase4_output import VALID_MECHANISM_FAMILIES

    families_present = {c.get("mechanism_family", "") for c in concepts}
    families_present.discard("")

    suggestions = list(VALID_MECHANISM_FAMILIES - families_present)[:3]

    return {
        "minimum_met": len(concepts) >= MIN_CONCEPTS and len(families_present) >= MIN_FAMILIES,
        "concept_count": len(concepts),
        "family_count": len(families_present),
        "concepts_needed": max(0, MIN_CONCEPTS - len(concepts)),
        "families_needed": max(0, MIN_FAMILIES - len(families_present)),
        "families_present": sorted(families_present),
        "families_not_yet_tried": suggestions,
    }


def format_concept_shortfall(check_result: dict) -> str:
    """Returns a human-readable message for the agent to inject when minimum is not met."""
    lines = ["[GATE — CONCEPT MINIMUM NOT MET]"]
    lines.append(
        f"Concepts generated: {check_result['concept_count']} / {MIN_CONCEPTS} required. "
        f"Mechanism families: {check_result['family_count']} / {MIN_FAMILIES} required."
    )
    if check_result["concepts_needed"] > 0:
        lines.append(f"Generate {check_result['concepts_needed']} more concept(s).")
    if check_result["families_needed"] > 0:
        lines.append(
            f"These must come from {check_result['families_needed']} additional mechanism "
            f"family/families not yet used. Untried families include: "
            f"{', '.join(check_result['families_not_yet_tried'])}."
        )
    lines.append("Concept evaluation (Step 6) is SUSPENDED until this minimum is met.")
    return "\n".join(lines)


# ─────────────────────────────────────────────
# Phase gate: Phase 2 → Phase 3
# ─────────────────────────────────────────────

def phase2_to_phase3_gate(phase2_output) -> tuple[bool, str]:
    """
    Returns (can_proceed, message).
    Only ADVANCE problems enter Phase 3.
    """
    advance = phase2_output.advance_problems
    if not advance:
        return False, (
            "[GATE] No problems reached ADVANCE in Phase 2. "
            "Phase 3 requires at least one ADVANCE problem. "
            "Return to Phase 2 screening with additional or refined problem candidates."
        )
    labels = [p.problem_label for p in advance]
    return True, f"[GATE] {len(advance)} problem(s) advance to Phase 3: {', '.join(labels)}"


# ─────────────────────────────────────────────
# Phase gate: Phase 3 → Phase 4
# ─────────────────────────────────────────────

def phase3_to_phase4_gate(phase3_output) -> tuple[bool, str]:
    """
    Returns (can_proceed, message).
    Only VALIDATED problems enter Phase 4.
    """
    verdict = phase3_output.verdict
    if verdict == "VALIDATED":
        return True, (
            f"[GATE] Problem VALIDATED. "
            f"Evidence Confidence: {phase3_output.evidence_confidence.total}/24 | "
            f"Problem Attractiveness: {phase3_output.problem_attractiveness.total}/20. "
            f"Advancing to Phase 4 — Solution Ideation & Hypothesis Formation."
        )
    elif verdict == "REVALIDATE":
        gaps = "; ".join(phase3_output.revalidate_gaps)
        return False, (
            f"[GATE] Phase 3 verdict: REVALIDATE. Cannot advance to Phase 4.\n"
            f"Evidence gaps to close: {gaps}\n"
            f"Return to the Phase 3 Problem Validation Clinic."
        )
    else:  # REJECT
        return False, (
            f"[GATE] Phase 3 verdict: REJECT. Problem does not advance.\n"
            f"Reason: {phase3_output.reject_reason or 'Evidence insufficient.'}\n"
            f"Return to Phase 2 to select a different problem from the shortlist."
        )


# ─────────────────────────────────────────────
# Phase gate: Phase 4 → Phase 5
# ─────────────────────────────────────────────

def phase4_to_phase5_gate(phase4_output) -> tuple[bool, str]:
    """
    Returns (can_proceed, message).
    Only READY_TO_TEST output enters Phase 5.
    """
    verdict = phase4_output.verdict
    if verdict == "READY_TO_TEST":
        exp_count = len(phase4_output.experiment_cards)
        if exp_count == 0:
            return False, (
                "[GATE] Phase 4 marked READY_TO_TEST but has zero Experiment Cards. "
                "Phase 5 requires at least one Experiment Card for a P1 assumption."
            )
        return True, (
            f"[GATE] Phase 4 output READY TO TEST. "
            f"{exp_count} Experiment Card(s) ready for empirical testing. "
            f"Advancing to Phase 5 — Solution Validation & MVP Testing."
        )
    elif verdict == "RE_IDEATE":
        return False, (
            f"[GATE] Phase 4 verdict: RE-IDEATE. Cannot advance to Phase 5.\n"
            f"Re-ideate reason: {phase4_output.re_ideate_reason or 'Generate concepts from untried mechanism families.'}\n"
            f"Return to Phase 4 Divergent Ideation."
        )
    else:  # RETURN_TO_PROBLEM
        return False, (
            f"[GATE] Phase 4 verdict: RETURN TO PROBLEM.\n"
            f"Reason: {phase4_output.return_to_problem_gap or 'Causal decomposition contradicted Phase 3 facts.'}\n"
            f"Return to Phase 3 Problem Validation Clinic."
        )

