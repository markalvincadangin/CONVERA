from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field


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
