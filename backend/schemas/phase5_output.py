from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator


CommitmentTier = Literal[
    "TIER_1_FINANCIAL",       # Upfront cash, pre-orders, signed purchase contracts, paid pilots
    "TIER_2_BEHAVIORAL",      # Replacing daily tool, 2+ hours data input, workflow change
    "TIER_3_REPUTATIONAL",    # Intro to senior decision-makers, public endorsements
    "TIER_4_TIME_CONTACT",    # Private contact details, attending 3+ sessions, sharing files
    "TIER_5_POLITE_INTEREST", # Verbal praise ("I would buy that") — ZERO validation value
]

TestArchetype = Literal[
    "CONCIERGE_MVP",
    "WIZARD_OF_OZ",
    "SMOKE_OR_LANDING_PAGE_TEST",
    "INTERACTIVE_PROTOTYPE_OR_PAPER",
    "LOI_OR_PREORDER_DEPOSIT",
    "STRUCTURED_SOLUTION_INTERVIEW",
]

PassFailStatus = Literal["PASS", "FAIL", "INCONCLUSIVE"]
Phase5Verdict = Literal["PURSUE", "PIVOT", "RETIRE_CONCEPT"]


class ExperimentAuditResult(BaseModel):
    """Audited empirical metrics from a single P1 assumption experiment."""
    concept_label: str = Field(description="Name of the solution concept tested from Phase 4")
    tested_assumption: str = Field(description="Specific P1 assumption text tested")
    test_archetype: TestArchetype = Field(description="Experiment archetype used")
    target_participant_cohort: str = Field(description="Target population tested (must match Phase 3)")
    sample_size_exposed: int = Field(ge=1, description="Total qualified sufferers exposed to the test")
    actions_observed_count: int = Field(ge=0, description="Count of concrete, countable actions performed")
    conversion_rate_percent: float = Field(ge=0.0, le=100.0, description="Observed conversion rate")
    highest_commitment_tier: CommitmentTier = Field(description="Highest evidence tier reached")
    pass_threshold: str = Field(description="Pre-set pass criteria from Phase 4")
    fail_threshold: str = Field(description="Pre-set fail criteria from Phase 4")
    threshold_status: PassFailStatus = Field(description="Outcome against pre-set thresholds")
    status_justification: str = Field(description="Why this status was assigned based on empirical data")


class PivotAnalysis(BaseModel):
    """Structured failure diagnosis and recommended pivot direction."""
    needs_pivot: bool = Field(description="True if test failed or was inconclusive")
    failure_locus: Optional[Literal[
        "DESIRABILITY_GAP",
        "BEHAVIORAL_FRICTION",
        "USABILITY_MISMATCH",
        "ECONOMIC_VIABILITY_GAP",
    ]] = Field(default=None, description="Primary root cause of assumption failure")
    pivot_direction: Optional[Literal[
        "MECHANISM_PIVOT",
        "CUSTOMER_SEGMENT_PIVOT",
        "RETURN_TO_PROBLEM",
    ]] = Field(default=None, description="Recommended next direction")
    rationale: str = Field(default="", description="Detailed explanation of learnings and next steps")


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
