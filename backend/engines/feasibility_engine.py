"""
CONVERA Feasibility & Ethics Engine (SDD-018 / Stage F)
======================================================
Evaluates regulatory compliance (RA 10173 / Data Privacy Act), institutional review (IRB/REC),
national & global priority roadmap alignment (UN SDGs, DOST-PCIEERD / NAIR), resource budgeting,
and computes deterministic feasibility metrics with inverted qualitative AI advisory synthesis.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from storage.factory import get_storage
from models.feasibility import (
    EthicsChecklist,
    SDGMapping,
    DOSTPriorityMapping,
    BudgetBreakdown,
    FeasibilityEvaluationRequest,
    FeasibilityRecord,
    IRBStatus,
)
from llm_gateway import generate_with_meta, TaskCategory

logger = logging.getLogger(__name__)


class FeasibilityEngine:
    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    def calculate_deterministic_scores(
        self,
        checklist: EthicsChecklist,
        sdgs: List[SDGMapping],
        dost_priorities: List[DOSTPriorityMapping],
        budget: BudgetBreakdown,
        timeline_weeks: int,
    ) -> Dict[str, Any]:
        """
        Pure mathematical and rule-based evaluation of feasibility dimensions.
        Scale: [0.0, 100.0].
        """
        # 1. Compliance Score (35%)
        # Mandatory: RA 10173 and consent protocol
        compliance_items = [
            checklist.ra_10173_compliant,
            checklist.consent_protocol_defined,
            checklist.data_minimization_enforced,
            checklist.irb_status != IRBStatus.NOT_APPLICABLE,
        ]
        passed_compliance = sum(1 for item in compliance_items if item)
        compliance_score = (passed_compliance / len(compliance_items)) * 100.0

        # Mandatory hard flag: If RA 10173 or consent is false, compliance fails
        compliance_passed = checklist.ra_10173_compliant and checklist.consent_protocol_defined

        # 2. Roadmap Alignment Score (25%)
        # Must have at least 1 validated SDG and 1 DOST-PCIEERD priority
        sdg_score = 0.0
        if len(sdgs) >= 1:
            valid_sdgs = [s for s in sdgs if s.rationale and len(s.rationale.strip()) > 10]
            sdg_score = min(100.0, 60.0 + len(valid_sdgs) * 20.0)

        dost_score = 0.0
        if len(dost_priorities) >= 1:
            valid_dost = [d for d in dost_priorities if d.alignment_notes and len(d.alignment_notes.strip()) > 10]
            dost_score = min(100.0, 60.0 + len(valid_dost) * 20.0)

        alignment_score = (sdg_score * 0.5) + (dost_score * 0.5)

        # 3. Resource Budget Score (25%)
        # Sum items
        total_budget = (
            budget.hardware_cost
            + budget.cloud_cost
            + budget.travel_pilot_cost
            + budget.dataset_acquisition_cost
        )
        budget.total = total_budget

        # In student/capstone computing research, budget bounded between 0 and 150,000 PHP is ideal
        if total_budget <= 0.0:
            # Zero budget is feasible only if pure algorithmic simulation
            budget_score = 75.0
        elif total_budget <= 25000.0:
            budget_score = 95.0
        elif total_budget <= 60000.0:
            budget_score = 90.0
        elif total_budget <= 150000.0:
            budget_score = 80.0
        else:
            budget_score = 65.0  # High capital requirement increases feasibility risk

        # 4. Timeline Feasibility Score (15%)
        # Standard university thesis timeline: 12-24 weeks
        if 12 <= timeline_weeks <= 20:
            timeline_score = 95.0
        elif 20 < timeline_weeks <= 28:
            timeline_score = 85.0
        elif timeline_weeks < 12:
            timeline_score = 70.0  # Rushed
        else:
            timeline_score = 65.0  # Overextended

        # Weighted Composite Score
        composite_score = round(
            (0.35 * compliance_score)
            + (0.25 * alignment_score)
            + (0.25 * budget_score)
            + (0.15 * timeline_score),
            1,
        )

        return {
            "compliance_score": round(compliance_score, 1),
            "compliance_passed": compliance_passed,
            "alignment_score": round(alignment_score, 1),
            "budget_score": round(budget_score, 1),
            "timeline_score": round(timeline_score, 1),
            "composite_score": composite_score,
            "total_budget": total_budget,
        }

    async def evaluate_feasibility(
        self,
        request: FeasibilityEvaluationRequest,
    ) -> Dict[str, Any]:
        """
        Evaluates Stage F feasibility & compliance, synthesizes advisory narrative,
        and commits the record to Table 35 in SQLite WAL.
        """
        scores = self.calculate_deterministic_scores(
            checklist=request.ethics_checklist,
            sdgs=request.sdg_alignments,
            dost_priorities=request.dost_alignments,
            budget=request.budget,
            timeline_weeks=request.timeline_weeks,
        )

        advisory_notes: Optional[str] = None
        is_degraded = False

        if request.include_ai_advisory:
            try:
                system_instruction = (
                    "You are the CONVERA Research Ethics & Feasibility Advisor. "
                    "Analyze the thesis concept's regulatory compliance with Republic Act 10173 (Data Privacy Act of 2012), "
                    "institutional review board (IRB) ethics considerations, and national priority alignments (UN SDGs and DOST-PCIEERD). "
                    "Provide a concise, publication-grade 3-bullet advisory: "
                    "1) Data Privacy & Telemetry Safeguards, 2) Societal & Technological Impact, 3) Defense Readiness Recommendation."
                )
                prompt = (
                    f"Session ID: {request.session_id}\n"
                    f"Project ID: {request.project_id}\n"
                    f"Timeline: {request.timeline_weeks} weeks\n"
                    f"Budget: {scores['total_budget']} {request.budget.currency}\n"
                    f"Compliance Passed: {scores['compliance_passed']}\n"
                    f"SDGs: {[s.sdg_name for s in request.sdg_alignments]}\n"
                    f"DOST Sectors: {[d.sector for d in request.dost_alignments]}\n"
                    f"Ethics Notes: RA 10173={request.ethics_checklist.ra_10173_compliant}, "
                    f"Consent={request.ethics_checklist.consent_protocol_defined}, IRB={request.ethics_checklist.irb_status.value}"
                )

                raw_resp = await generate_with_meta(
                    system_instruction=system_instruction,
                    prompt=prompt,
                    task_category=TaskCategory.CRITICAL_REASONING,
                )
                if raw_resp and raw_resp.content:
                    advisory_notes = raw_resp.content.strip()
                    is_degraded = raw_resp.is_degraded
                else:
                    is_degraded = True
                    advisory_notes = self._generate_rule_based_advisory(scores, request)
            except Exception as e:
                logger.warning(f"AI advisory generation failed, utilizing rule-based fallback: {e}")
                is_degraded = True
                advisory_notes = self._generate_rule_based_advisory(scores, request)
        else:
            is_degraded = True
            advisory_notes = self._generate_rule_based_advisory(scores, request)

        # Gate 4 clearing heuristic: Score >= 80.0 and compliance passed
        is_cleared = bool(scores["composite_score"] >= 80.0 and scores["compliance_passed"])

        record_data = {
            "session_id": request.session_id,
            "project_id": request.project_id,
            "ethics_checklist": request.ethics_checklist.model_dump(),
            "sdg_alignments": [s.model_dump() for s in request.sdg_alignments],
            "dost_alignments": [d.model_dump() for d in request.dost_alignments],
            "budget": request.budget.model_dump(),
            "timeline_weeks": request.timeline_weeks,
            "feasibility_score": scores["composite_score"],
            "compliance_passed": scores["compliance_passed"],
            "is_cleared": is_cleared,
            "advisory_notes": advisory_notes,
            "is_degraded": is_degraded,
        }

        saved_record = self.storage.save_feasibility_record(record_data)
        return FeasibilityRecord(**saved_record)

    def _generate_rule_based_advisory(
        self, scores: Dict[str, Any], request: FeasibilityEvaluationRequest
    ) -> str:
        """Deterministic rule-based advisory for offline fallback."""
        privacy_status = (
            "Verified compliant with Republic Act 10173; telemetry anonymization protocol active."
            if scores["compliance_passed"]
            else "WARNING: Non-compliant with RA 10173 data privacy or participant consent mandates."
        )
        sdg_summary = (
            f"Directly advances {len(request.sdg_alignments)} UN Sustainable Development Goals."
            if request.sdg_alignments
            else "Notice: No explicit UN SDG alignment recorded."
        )
        defense_recom = (
            "Proposal clears Stage F criteria (Score >= 80.0%) and is recommended for formal mentor authorization."
            if scores["composite_score"] >= 80.0 and scores["compliance_passed"]
            else "Revision required: Rectify compliance checkboxes and expand alignment justifications prior to defense."
        )

        return (
            f"• Data Privacy & Ethics: {privacy_status}\n"
            f"• Societal & Strategic Impact: {sdg_summary}\n"
            f"• Defense Readiness: {defense_recom}"
        )
