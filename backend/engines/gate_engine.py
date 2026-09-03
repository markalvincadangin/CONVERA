"""
CONVERA Quality Gate Evaluation Engine
======================================
Implements formal rubric scoring and criteria evaluation for:
- Gate 1: Problem Significance (Phase B -> C)
- Gate 2: Research Gap Quality (Phase C -> D)
- Gate 3: Artifact Rigor & Evaluation Design (Phase E -> F)
- Gate 4: Final Proposal Readiness (Phase F Sign-off)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from storage.factory import get_storage

GATE_DEFINITIONS = {
    "GATE_1": {
        "id": "GATE_1",
        "name": "Gate 1: Problem Significance",
        "threshold": 75.0,
        "criteria": [
            {"id": "G1_C1", "label": "Specific localized stakeholder & operational friction identified."},
            {"id": "G1_C2", "label": "Grounded in non-computing domain realities + computing literature."},
            {"id": "G1_C3", "label": "No premature solutioning or app feature assumptions."},
            {"id": "G1_C4", "label": "Observable independent & dependent variables operationalized."}
        ]
    },
    "GATE_2": {
        "id": "GATE_2",
        "name": "Gate 2: Research Gap Quality",
        "threshold": 75.0,
        "criteria": [
            {"id": "G2_C1", "label": "Synthesized 3+ peer-reviewed studies in Literature Matrix."},
            {"id": "G2_C2", "label": "Distinguishes study limitations from authentic scientific gaps."},
            {"id": "G2_C3", "label": "Formulates answerable Primary RQ and 2-3 Sub-RQs."},
            {"id": "G2_C4", "label": "Identifies applicable Kernel Theory."}
        ]
    },
    "GATE_3": {
        "id": "GATE_3",
        "name": "Gate 3: Evaluation Rigor & Trapping",
        "threshold": 80.0,
        "criteria": [
            {"id": "G3_C1", "label": "Classified into 1 of 4 DSR Artifact classes (Construct, Model, Method, Instantiation)."},
            {"id": "G3_C2", "label": "Controlled experimental design selected (CRD, RBD, or Latin Square)."},
            {"id": "G3_C3", "label": "Circumscription iteration loop defined for evaluation failures."},
            {"id": "G3_C4", "label": "Quantitative benchmark metrics (accuracy, latency, error rate) defined."}
        ]
    },
    "GATE_4": {
        "id": "GATE_4",
        "name": "Gate 4: Proposal Readiness & Ethics",
        "threshold": 80.0,
        "criteria": [
            {"id": "G4_C1", "label": "Aligned with UN Sustainable Development Goals (SDGs)."},
            {"id": "G4_C2", "label": "Aligned with DOST-PCIEERD / NICER national priority roadmaps."},
            {"id": "G4_C3", "label": "Compliance with Republic Act 10173 (Data Privacy Act of 2012)."},
            {"id": "G4_C4", "label": "Feasibility canvas verifies local sensor/hardware budget and timeline."}
        ]
    }
}

class GateEngine:
    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    def evaluate_gate(
        self,
        gate_id: str,
        rubric_scores: Dict[str, float],
        checked_criteria_ids: List[str],
        reviewer_feedback: str = "",
        reviewer_role: str = "RESEARCH_ADVISOR",
        project_id: str = "default_proj",
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        gate_def = GATE_DEFINITIONS.get(gate_id.upper())
        if not gate_def:
            raise ValueError(f"Unknown gate identifier: {gate_id}")

        all_criteria = gate_def["criteria"]
        passed_criteria = [c for c in all_criteria if c["id"] in checked_criteria_ids]
        failed_criteria = [c for c in all_criteria if c["id"] not in checked_criteria_ids]

        # Calculate overall score: average of rubric scores
        if rubric_scores:
            overall_score = round(sum(rubric_scores.values()) / len(rubric_scores), 1)
        else:
            overall_score = round((len(passed_criteria) / len(all_criteria)) * 100.0, 1)

        threshold = gate_def["threshold"]
        all_mandatory_passed = (len(failed_criteria) == 0)

        if overall_score >= threshold and all_mandatory_passed:
            verdict = "PASS"
            action_advisory = f"GATE {gate_id} PASSED ({overall_score}% >= {threshold}%). Researcher is cleared to advance to the next phase."
        elif overall_score >= 60.0:
            verdict = "REVISE"
            action_advisory = f"GATE {gate_id} REVISION REQUIRED ({overall_score}%). Missing criteria: {[c['label'] for c in failed_criteria]}."
        else:
            verdict = "FAIL"
            action_advisory = f"GATE {gate_id} FAILED ({overall_score}%). Fundamental rework required."

        record = {
            "project_id": project_id,
            "session_id": session_id,
            "gate_id": gate_id.upper(),
            "gate_name": gate_def["name"],
            "verdict": verdict,
            "overall_score": overall_score,
            "rubric_scores": rubric_scores,
            "reviewer_role": reviewer_role,
            "reviewer_feedback": reviewer_feedback,
            "passed_criteria": passed_criteria,
            "failed_criteria": failed_criteria,
        }

        saved_record = self.storage.record_gate_review(record)
        saved_record["action_advisory"] = action_advisory
        saved_record["threshold"] = threshold
        return saved_record

    def get_gate_status(self, project_id: str, gate_id: str) -> Dict[str, Any]:
        gate_def = GATE_DEFINITIONS.get(gate_id.upper())
        if not gate_def:
            raise ValueError(f"Unknown gate identifier: {gate_id}")

        existing = self.storage.get_gate_review(project_id, gate_id.upper())
        if existing:
            return existing

        return {
            "gate_id": gate_id.upper(),
            "gate_name": gate_def["name"],
            "threshold": gate_def["threshold"],
            "criteria": gate_def["criteria"],
            "verdict": "UNREVIEWED",
            "overall_score": 0.0,
            "passed_criteria": [],
            "failed_criteria": gate_def["criteria"]
        }
