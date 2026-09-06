"""
CONVERA Workflow Transition Service
===================================
Application-layer transition evaluator implementing the 9-step gate transition contract:
1. Load Current Workflow (session & framework_id)
2. Identify Current Stage
3. Identify Expected Gate for Current Stage
4. Verify Submitted Gate Matches Expected Gate (Reject mismatches e.g. GATE_4 on Stage B)
5. Validate Methodology Criteria & Evaluation Rules
6. Validate Gate Verdict (PASSED vs. REVISE / FAILED)
7. Transition Workflow State (Advance to Next Stage / Retain Current Stage)
8. Persist Canonical Workflow State (Atomically save updated stage_progress in state_data)
9. Project Legacy Compatibility Flags (Executed via storage single-writer projection)
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from storage.factory import get_storage
from storage.sqlite_adapter import WorkflowStateCorruptedError
from contracts.methodology import (
    MethodologyContract,
    INNOVATION_CONTRACT,
    RESEARCH_CONTRACT,
    get_methodology_contract,
)

# Backward-compatibility aliases for external modules/tests
RESEARCH_GATE_MAP = RESEARCH_CONTRACT.gate_map
INNOVATION_GATE_MAP = INNOVATION_CONTRACT.gate_map
RESEARCH_SEQUENCE = RESEARCH_CONTRACT.stage_sequence
INNOVATION_SEQUENCE = INNOVATION_CONTRACT.stage_sequence


class WorkflowTransitionService:
    def __init__(self, storage=None, contract_resolver=None):
        self.storage = storage or get_storage()
        self.contract_resolver = contract_resolver or get_methodology_contract

    def process_gate_transition(
        self,
        session_id: str,
        stage_id: str,
        gate_id: str,
        gate_review_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes the 9-step Application Transition Evaluator contract.
        """
        # Step 1: Load Current Workflow
        session = self.storage.get_session(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found")

        stage_progress = session.get("stage_progress")
        if not stage_progress or not isinstance(stage_progress, dict):
            raise WorkflowStateCorruptedError(f"Session '{session_id}' has no valid canonical stage_progress")

        raw_framework_id = session.get("framework_id") or stage_progress.get("framework_id")
        if not raw_framework_id or not str(raw_framework_id).strip():
            raise ValueError("Methodology framework identity is missing or empty for this session")

        framework_id = str(raw_framework_id).strip().upper()
        contract = self.contract_resolver(framework_id)
        if not contract:
            raise ValueError(f"Unknown or unsupported methodology framework: '{framework_id}'")

        # Step 2: Identify Current Stage & Validate
        current_stage_id = stage_progress.get("current_stage_id")
        stages = stage_progress.get("stages", {})

        # Verify stage exists in methodology contract or session stages
        if not contract.has_stage(stage_id) and (stage_id not in stages and stage_id != "studio"):
            raise ValueError(f"Stage '{stage_id}' is not recognized for framework '{framework_id}'")

        # Step 3: Identify Expected Gate for Current Stage
        expected_gate = contract.get_expected_gate(stage_id)
        if not expected_gate:
            raise ValueError(f"Stage '{stage_id}' does not require a quality gate transition in framework '{framework_id}'")

        # Step 4: Verify Submitted Gate Matches Expected Gate
        if gate_id.upper() != expected_gate.upper():
            raise ValueError(
                f"Gate mismatch: submitted gate '{gate_id}' does not match expected gate '{expected_gate}' for stage '{stage_id}'"
            )

        # Step 5: Validate Methodology Criteria & Evaluation Rules
        project_id = session.get("project_id") or "default_proj"
        reviews = self.storage.list_gate_reviews(project_id)
        
        target_review = None
        if gate_review_id:
            for r in reviews:
                if r.get("id") == gate_review_id:
                    target_review = r
                    break

        if not target_review:
            # Fall back to matching by gate_id for the project/session
            matching = [r for r in reviews if r.get("gate_id") == gate_id]
            if matching:
                # Latest review (list_gate_reviews returns created_at DESC)
                target_review = matching[0]

        if not target_review:
            raise ValueError(
                f"No gate review record found for gate '{gate_id}'. A formal gate evaluation must be recorded before transition."
            )

        # Step 6: Validate Gate Verdict
        verdict = target_review.get("verdict", "REVISE")
        if verdict != "PASSED":
            # Retain current stage; record status as REVISE/FAILED
            if stage_id in stages:
                stages[stage_id]["gate_status"] = "REVISE" if verdict == "REVISE" else "FAILED"
            self.storage.save_session(session_id, session)
            return {
                "transition_applied": False,
                "reason": f"Gate review verdict is '{verdict}'",
                "previous_stage_id": current_stage_id,
                "current_stage_id": current_stage_id,
                "stage_progress": stage_progress,
            }

        # Step 7: Transition Workflow State
        stages[stage_id]["status"] = "COMPLETED"
        stages[stage_id]["gate_status"] = "PASSED"
        stages[stage_id]["completed_at"] = datetime.now(timezone.utc).isoformat()

        # Resolve next stage via methodology contract
        next_stage_id = contract.get_next_stage(stage_id)

        if next_stage_id != "studio" and next_stage_id in stages:
            stages[next_stage_id]["status"] = "IN_PROGRESS"
            stages[next_stage_id]["started_at"] = datetime.now(timezone.utc).isoformat()

        stage_progress["current_stage_id"] = next_stage_id
        session["current_stage_id"] = next_stage_id
        session["stage_progress"] = stage_progress

        # Step 8 & 9: Persist Canonical Workflow State & Project Legacy Flags
        saved_state = self.storage.save_session(session_id, session)

        return {
            "transition_applied": True,
            "previous_stage_id": stage_id,
            "current_stage_id": next_stage_id,
            "stage_progress": saved_state.get("stage_progress", stage_progress),
        }

