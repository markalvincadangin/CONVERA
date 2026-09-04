import pytest
from gates import (
    LEVEL_ORDER,
    get_current_level,
    mark_level_complete,
    all_levels_complete,
    check_concept_minimum,
    phase3_to_phase4_gate,
    phase4_to_phase5_gate,
)
from schemas import (
    Phase3Output,
    EvidenceConfidence,
    ProblemAttractiveness,
    Phase4Output,
    SolutionConcept,
    Assumption,
    ExperimentCard,
    ExperimentAuditResult,
    PivotAnalysis,
)

pytestmark = pytest.mark.unit




def test_level_sequencing():
    state = {"completed_levels": []}
    assert get_current_level(state) == "specific_sufferer"

    state = mark_level_complete(state, "specific_sufferer")
    assert get_current_level(state) == "demonstrated_pain"

    for lvl in LEVEL_ORDER[1:]:
        state = mark_level_complete(state, lvl)

    assert get_current_level(state) == "complete"
    assert all_levels_complete(state) is True


def test_concept_minimum_gate():
    # Empty concepts
    res = check_concept_minimum([])
    assert res["minimum_met"] is False
    assert res["concepts_needed"] == 5
    assert res["families_needed"] == 3

    # 5 concepts from only 1 family (should fail)
    single_family_concepts = [
        {"label": f"C{i}", "mechanism_family": "Automation", "causal_link_targeted": "L1", "hypothesized_mechanism": "M", "delivery_vehicle": "App"}
        for i in range(5)
    ]
    res2 = check_concept_minimum(single_family_concepts)
    assert res2["minimum_met"] is False
    assert res2["families_needed"] == 2

    # 5 concepts from 3 families (should pass)
    valid_concepts = [
        {"label": "C1", "mechanism_family": "Automation", "causal_link_targeted": "L1", "hypothesized_mechanism": "M", "delivery_vehicle": "App"},
        {"label": "C2", "mechanism_family": "Automation", "causal_link_targeted": "L1", "hypothesized_mechanism": "M", "delivery_vehicle": "App"},
        {"label": "C3", "mechanism_family": "Coordination", "causal_link_targeted": "L1", "hypothesized_mechanism": "M", "delivery_vehicle": "App"},
        {"label": "C4", "mechanism_family": "Coordination", "causal_link_targeted": "L1", "hypothesized_mechanism": "M", "delivery_vehicle": "App"},
        {"label": "C5", "mechanism_family": "Prevention", "causal_link_targeted": "L1", "hypothesized_mechanism": "M", "delivery_vehicle": "App"},
    ]
    res3 = check_concept_minimum(valid_concepts)
    assert res3["minimum_met"] is True


def test_phase_gates():
    # Phase 3 -> 4 Gate
    phase3_val = Phase3Output(
        validated_problem_statement="Small vegetable farmers in Dumangas lose 30% harvest.",
        target_actor="Small vegetable farmers",
        iloilo_location="Dumangas",
        workaround="Soaking vegetables in buckets",
        frequency="Daily during harvest",
        severity="30% spoilage / ~2,500 PHP per batch",
        local_market_size_estimate="250 farmers across Dumangas & Barotac Nuevo",
        population_estimate="120 reachable active farmers",
        economic_consequence="P2,500 cash loss per farmer per harvest cycle",
        economic_consequence_population_anchored=True,
        evidence_confidence=EvidenceConfidence(
            direct_user_evidence=4,
            workaround_evidence=3,
            quantified_consequence=4,
            recurrence_evidence=3,
            population_evidence=3,
            source_triangulation=3,
        ),
        problem_attractiveness=ProblemAttractiveness(
            severity=4,
            frequency_urgency=4,
            existing_sacrifice=3,
            number_affected=3,
            persistence=3,
        ),
        verdict="VALIDATED",
    )
    can_proceed, msg = phase3_to_phase4_gate(phase3_val)
    assert can_proceed is True

    # Phase 4 -> 5 Gate
    phase4_out = Phase4Output(
        opportunity_question="How might we prevent heat spoilage?",
        root_mechanism_decomposition=[
            {"trigger": "ambient heat", "mechanism_type": "physical", "consequence": "spoilage"}
        ],
        concepts=[
            SolutionConcept(
                label="C1",
                mechanism_family="Prevention",
                causal_link_targeted="Link",
                hypothesized_mechanism="Thermal insulation barrier",
                delivery_vehicle="Digital + Physical",
            )
        ],
        assumption_register=[
            Assumption(
                id="A-001",
                concept_label="C1",
                assumption_text="Farmers will pay for cooling",
                type="Behavioral",
                importance="H",
                uncertainty="H",
            )
        ],
        experiment_cards=[
            ExperimentCard(
                id="E-001",
                concept_label="C1",
                assumption_id="A-001",
                assumption_tested="Farmers will place pre-order cash deposits",
                hypothesis="If we offer 500 PHP deposit, >= 30% will commit",
                test_method="Concierge MVP",
                target_participant="Dumangas Farmers",
                observable_metric="Deposit cash collected",
                pass_threshold=">= 30%",
                fail_threshold="< 15%",
                decision_if_pass="PURSUE",
                decision_if_fail="PIVOT",
            )
        ],
        verdict="READY_TO_TEST",
    )
    can_proceed_p5, msg_p5 = phase4_to_phase5_gate(phase4_out)
    assert can_proceed_p5 is True


