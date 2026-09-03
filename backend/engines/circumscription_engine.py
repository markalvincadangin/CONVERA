"""
CONVERA Circumscription Iteration Engine
========================================
Implements Design Science Research (DSR) failure-driven evaluation loops:
Tracks benchmark evaluation failures, extracts new constraints, and loops back
to Phase D (Artifact Design) for abductive refinement before final Gate 3 sign-off.
"""
from typing import Dict, Any, List, Optional
from storage.factory import get_storage

class CircumscriptionEngine:
    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    def record_iteration(
        self,
        project_id: str,
        artifact_name: str,
        test_run_name: str,
        metric_name: str,
        observed_value: float,
        target_value: float,
        failure_mode: str = "",
        constraint_extracted: str = "",
        target_phase_loopback: str = "PHASE_D",
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        is_passed = (observed_value >= target_value)
        status = "PASSED" if is_passed else "FAILED_LOOPBACK"

        if is_passed:
            action_advisory = f"BENCHMARK PASSED: {metric_name} reached {observed_value} (target: {target_value}). Cleared for Gate 3 evaluation."
        else:
            action_advisory = f"CIRCUMSCRIPTION LOOPBACK REQUIRED: {metric_name} was {observed_value} (target: {target_value}). Constraint extracted: '{constraint_extracted}'. Loop back to {target_phase_loopback} to refine artifact architecture."

        payload = {
            "project_id": project_id,
            "session_id": session_id,
            "artifact_name": artifact_name,
            "test_run_name": test_run_name,
            "metric_name": metric_name,
            "observed_value": float(observed_value),
            "target_value": float(target_value),
            "status": status,
            "failure_mode": failure_mode,
            "constraint_extracted": constraint_extracted,
            "target_phase_loopback": target_phase_loopback,
        }

        record = self.storage.record_circumscription_iteration(payload)
        record["action_advisory"] = action_advisory
        return record

    def get_iteration_summary(self, project_id: str = "default_proj") -> Dict[str, Any]:
        iterations = self.storage.list_circumscription_iterations(project_id=project_id)
        total_runs = len(iterations)
        failed_runs = sum(1 for i in iterations if i.get("status") == "FAILED_LOOPBACK")
        passed_runs = sum(1 for i in iterations if i.get("status") == "PASSED")
        
        is_converged = (total_runs > 0 and iterations[-1].get("status") == "PASSED")

        return {
            "project_id": project_id,
            "total_iterations": total_runs,
            "failed_loopbacks": failed_runs,
            "passed_benchmarks": passed_runs,
            "is_converged": is_converged,
            "latest_iteration": iterations[-1] if iterations else None,
            "history": iterations
        }
