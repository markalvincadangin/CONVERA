from typing import Dict, Any, List, Optional
from storage.base import BaseStorageAdapter
from engines.knowledge_lifecycle import compute_claim_epistemic_balance

def propagate_evidence_change(
    problem_id: str,
    source_id: int,
    relation_type: str,
    storage: BaseStorageAdapter,
    session_id: Optional[str] = None,
    project_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Calculate downstream impact when an evidence source is added, modified, or linked as CONTRADICTING.
    Cascades: Source -> Claim -> Assumption -> Decision -> Gate Alert.
    """
    problem = storage.get_problem(problem_id)
    if not problem:
        return {"status": "error", "message": f"Problem '{problem_id}' not found"}

    claims = problem.get("claims", [])
    assumptions = problem.get("assumptions", [])
    
    # 1. Evaluate epistemic balance across all problem claims
    invalidated_claims = []
    for claim in claims:
        cid = claim.get("id")
        balance = compute_claim_epistemic_balance(cid, storage)
        if balance.get("epistemic_status") == "CONTRADICTED":
            invalidated_claims.append({
                "claim_id": cid,
                "claim_text": claim.get("claim_text"),
                "claim_type": claim.get("claim_type"),
                "net_score": balance.get("net_score"),
                "contradicting_points": balance.get("contradicting_points"),
            })

    # 2. Check affected decisions
    all_decisions = storage.list_decision_records(session_id=session_id)
    affected_decisions = []
    for dec in all_decisions:
        if dec.get("selected_problem_id") == problem_id:
            affected_decisions.append({
                "decision_id": dec.get("id"),
                "stage": dec.get("stage"),
                "selected_problem_id": problem_id,
                "decision_rationale": dec.get("decision_rationale"),
                "created_at": dec.get("created_at"),
            })

    # 3. Identify vulnerable assumptions
    compromised_assumptions = []
    if relation_type.upper() in ["CONTRADICTS", "FALSIFIES"]:
        for asm in assumptions:
            compromised_assumptions.append({
                "assumption_id": asm.get("id"),
                "assumption_text": asm.get("assumption_text"),
                "risk_level": "CRITICAL",
                "origin": asm.get("origin"),
            })

    # 4. If invalidation detected, log immutable impact event
    impact_event = None
    if invalidated_claims or (relation_type.upper() in ["CONTRADICTS", "FALSIFIES"] and affected_decisions):
        affected_entities = []
        for c in invalidated_claims:
            affected_entities.append({"type": "CLAIM", "id": c["claim_id"], "name": c["claim_text"], "reason": "Contradicted by empirical evidence balance"})
        for a in compromised_assumptions:
            affected_entities.append({"type": "ASSUMPTION", "id": a["assumption_id"], "name": a["assumption_text"], "reason": "Underlying premise contradicted"})
        for d in affected_decisions:
            affected_entities.append({"type": "DECISION", "id": d["decision_id"], "name": f"Stage {d['stage']} Candidate Selection", "reason": "Selected candidate has contradicted evidence"})

        impact_event = storage.record_impact_event(
            trigger_entity_type="EVIDENCE",
            trigger_entity_id=str(source_id),
            trigger_action=f"CONTRADICTION_LINKED ({relation_type.upper()})",
            affected_entities=affected_entities,
            project_id=project_id,
            session_id=session_id,
            severity="CRITICAL" if affected_decisions else "WARNING",
        )

    return {
        "problem_id": problem_id,
        "source_id": source_id,
        "relation_type": relation_type.upper(),
        "has_impact": bool(invalidated_claims or affected_decisions),
        "severity": "CRITICAL" if affected_decisions and invalidated_claims else ("WARNING" if invalidated_claims else "INFO"),
        "invalidated_claims": invalidated_claims,
        "compromised_assumptions": compromised_assumptions,
        "affected_decisions": affected_decisions,
        "impact_event": impact_event,
        "recommended_action": (
            "CRITICAL: Downstream candidate selection invalidated. Conduct Socratic Interrogation or pivot in Decision Room."
            if affected_decisions
            else "Notice: Review conflicting evidence sources in Problem Bank."
        ),
    }

def propagate_test_result(
    problem_id: str,
    assumption_id: str,
    test_status: str,
    storage: BaseStorageAdapter,
    session_id: Optional[str] = None,
    project_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Calculate downstream impact when an assumption test FAILS or PASSES.
    Cascades: Test Result -> Assumption -> Decision Alert.
    """
    problem = storage.get_problem(problem_id)
    all_decisions = storage.list_decision_records(session_id=session_id)
    affected_decisions = [d for d in all_decisions if d.get("selected_problem_id") == problem_id]

    impact_event = None
    if test_status.upper() == "FAILED" and affected_decisions:
        affected_entities = [
            {"type": "ASSUMPTION", "id": assumption_id, "name": "Validation Test Failed", "reason": "Empirical field experiment failed target metric"}
        ]
        for d in affected_decisions:
            affected_entities.append({
                "type": "DECISION",
                "id": d["id"],
                "name": f"Stage {d['stage']} Candidate Selection",
                "reason": "Core assumption falsified by empirical test experiment",
            })

        impact_event = storage.record_impact_event(
            trigger_entity_type="ASSUMPTION",
            trigger_entity_id=assumption_id,
            trigger_action="TEST_FAILED_FALSIFIED",
            affected_entities=affected_entities,
            project_id=project_id,
            session_id=session_id,
            severity="CRITICAL",
        )

    return {
        "problem_id": problem_id,
        "assumption_id": assumption_id,
        "test_status": test_status.upper(),
        "has_impact": bool(test_status.upper() == "FAILED" and affected_decisions),
        "affected_decisions": affected_decisions,
        "impact_event": impact_event,
        "recommended_action": (
            "CRITICAL: Core premise assumption falsified in field testing. Re-evaluate candidate in Decision Room."
            if test_status.upper() == "FAILED" and affected_decisions
            else "Assumption test recorded."
        ),
    }
