import pytest
from pydantic import ValidationError
from schemas import (
    ScreeningResult,
    SolutionConcept,
    ExperimentAuditResult,
    Phase5Output,
    PivotAnalysis,
)

pytestmark = pytest.mark.unit



def test_phase2_second_look_requires_exit_condition():
    # SECOND_LOOK without exit condition should raise ValueError
    with pytest.raises(ValidationError):
        ScreeningResult(
            problem_label="Manual inventory ledger",
            pain_score=3,
            pain_label="Demonstrated",
            frequency_score=3,
            frequency_label="Demonstrated",
            market_size_score=3,
            market_size_label="Demonstrated",
            existing_sacrifice_score=3,
            existing_sacrifice_label="Demonstrated",
            access_score=3,
            access_label="Demonstrated",
            origin_tags=["Local observation"],
            red_flags=[],
            verdict="SECOND_LOOK",
            second_look_exit_condition=None,
        )

    # With exit condition should succeed
    res = ScreeningResult(
        problem_label="Manual inventory ledger",
        pain_score=3,
        pain_label="Demonstrated",
        frequency_score=3,
        frequency_label="Demonstrated",
        market_size_score=3,
        market_size_label="Demonstrated",
        existing_sacrifice_score=3,
        existing_sacrifice_label="Demonstrated",
        access_score=3,
        access_label="Demonstrated",
        origin_tags=["Local observation"],
        red_flags=[],
        verdict="SECOND_LOOK",
        second_look_exit_condition="Must observe at least 5 vendors using third-party ledger app",
    )
    assert res.verdict == "SECOND_LOOK"


def test_phase4_valid_mechanism_family():
    # Invalid mechanism family should raise ValueError
    with pytest.raises(ValidationError):
        SolutionConcept(
            label="Invalid Concept",
            mechanism_family="Magic AI Solver",  # Not in 15 families
            causal_link_targeted="Bottleneck",
            hypothesized_mechanism="Does magic",
            delivery_vehicle="Web",
        )

    # Valid family should succeed
    concept = SolutionConcept(
        label="Valid Concept",
        mechanism_family="Automation",
        causal_link_targeted="Bottleneck",
        hypothesized_mechanism="Automates bookkeeping",
        delivery_vehicle="Mobile Web",
    )
    assert concept.mechanism_family == "Automation"


def test_phase5_audit_conversion():
    audit = ExperimentAuditResult(
        concept_label="Shared Cold Box",
        tested_assumption="Vendors will pay 500 PHP deposit",
        test_archetype="CONCIERGE_MVP",
        target_participant_cohort="20 produce vendors in Jaro",
        sample_size_exposed=20,
        actions_observed_count=6,
        conversion_rate_percent=30.0,
        highest_commitment_tier="TIER_1_FINANCIAL",
        pass_threshold=">= 25% (>= 5 deposits)",
        fail_threshold="< 15% (< 3 deposits)",
        threshold_status="PASS",
        status_justification="6 out of 20 (30%) paid upfront cash deposits",
    )
    assert audit.conversion_rate_percent == 30.0
    assert audit.threshold_status == "PASS"

