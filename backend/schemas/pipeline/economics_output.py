from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field, model_validator

try:
    from schemas.domain.experiment import (
        ExperimentAuditResult,
        PivotAnalysis,
    )
except ImportError:
    from backend.schemas.domain.experiment import (
        ExperimentAuditResult,
        PivotAnalysis,
    )

Phase5Verdict = Literal["PURSUE", "PIVOT", "RETIRE_CONCEPT"]


class Phase5Output(BaseModel):
    """Complete structured output for Phase 5 — Solution Validation & MVP Testing."""
    experiment_audit: ExperimentAuditResult
    pivot_analysis: PivotAnalysis
    verdict: Phase5Verdict
    next_milestone_directive: str = Field(
        description="Exact concrete next milestone for the team (e.g. build MVP, re-ideate mechanism in Phase 4, or retire)"
    )

    @model_validator(mode="after")
    def validate_verdict_consistency(self) -> "Phase5Output":
        # PURSUE requires PASS on threshold and cannot be Tier 5
        if self.verdict == "PURSUE":
            if self.experiment_audit.threshold_status != "PASS":
                raise ValueError("Verdict cannot be PURSUE unless threshold_status is PASS.")
            if self.experiment_audit.highest_commitment_tier == "TIER_5_POLITE_INTEREST":
                raise ValueError("Verdict cannot be PURSUE with TIER_5_POLITE_INTEREST (verbal praise).")
            if self.pivot_analysis.needs_pivot:
                raise ValueError("PURSUE verdict is incompatible with needs_pivot=True.")

        # PIVOT requires a valid pivot direction
        if self.verdict == "PIVOT":
            if not self.pivot_analysis.needs_pivot:
                raise ValueError("PIVOT verdict requires pivot_analysis.needs_pivot=True.")
            if not self.pivot_analysis.pivot_direction:
                raise ValueError("PIVOT verdict requires an explicit pivot_direction.")

        return self


__all__ = [
    "Phase5Verdict",
    "Phase5Output",
]
