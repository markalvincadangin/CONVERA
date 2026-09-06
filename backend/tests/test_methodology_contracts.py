"""
Unit Tests for Methodology Contracts
====================================
Governed by: CONVERA Concept Development Standard (CCDS v2.0)
Verification Protocol: SPEC-METHODOLOGY-CONTRACT-001-SDD-01-REV-01
"""
import pytest
from contracts.methodology import (
    GateVerdict,
    StageContract,
    GateContract,
    MethodologyContract,
    INNOVATION_CONTRACT,
    RESEARCH_CONTRACT,
    METHODOLOGY_REGISTRY,
    get_methodology_contract,
)


def test_gate_verdict_enum():
    """Verify GateVerdict values match expected transition contract strings."""
    assert GateVerdict.PASS == "PASSED"
    assert GateVerdict.REVISE == "REVISE"
    assert GateVerdict.HOLD == "HOLD"
    assert GateVerdict.FAIL == "FAILED"


def test_innovation_contract_structure():
    """Verify INNOVATION_CONTRACT properties and topology."""
    assert INNOVATION_CONTRACT.id == "INNOVATION"
    assert INNOVATION_CONTRACT.version == "3.0.0"
    assert INNOVATION_CONTRACT.governing_standard == "CCDS v2.0"
    assert len(INNOVATION_CONTRACT.stages) == 5
    assert len(INNOVATION_CONTRACT.gates) == 3

    # Verify stage sequence
    expected_sequence = [
        "p1_discovery",
        "p2_screening",
        "p3_mom_test",
        "p4_mechanism",
        "p5_economics",
        "studio",
    ]
    assert INNOVATION_CONTRACT.stage_sequence == expected_sequence

    # Verify gate mapping
    assert INNOVATION_CONTRACT.get_expected_gate("p1_discovery") is None
    assert INNOVATION_CONTRACT.get_expected_gate("p2_screening") == "GATE_1"
    assert INNOVATION_CONTRACT.get_expected_gate("p3_mom_test") == "GATE_2"
    assert INNOVATION_CONTRACT.get_expected_gate("p4_mechanism") is None
    assert INNOVATION_CONTRACT.get_expected_gate("p5_economics") == "GATE_3"
    assert INNOVATION_CONTRACT.get_expected_gate("studio") is None

    # Verify stage progression
    assert INNOVATION_CONTRACT.get_next_stage("p1_discovery") == "p2_screening"
    assert INNOVATION_CONTRACT.get_next_stage("p2_screening") == "p3_mom_test"
    assert INNOVATION_CONTRACT.get_next_stage("p3_mom_test") == "p4_mechanism"
    assert INNOVATION_CONTRACT.get_next_stage("p4_mechanism") == "p5_economics"
    assert INNOVATION_CONTRACT.get_next_stage("p5_economics") == "studio"
    assert INNOVATION_CONTRACT.get_next_stage("studio") == "studio"

    # Verify stage existence validation
    for s in expected_sequence:
        assert INNOVATION_CONTRACT.has_stage(s) is True
    assert INNOVATION_CONTRACT.has_stage("non_existent_stage") is False


def test_research_contract_structure():
    """Verify RESEARCH_CONTRACT properties and topology."""
    assert RESEARCH_CONTRACT.id == "RESEARCH"
    assert RESEARCH_CONTRACT.version == "1.0.0"
    assert RESEARCH_CONTRACT.governing_standard == "CCDS v2.0"
    assert len(RESEARCH_CONTRACT.stages) == 6
    assert len(RESEARCH_CONTRACT.gates) == 4

    # Verify stage sequence
    expected_sequence = [
        "stage_a_scouting",
        "stage_b_validation",
        "stage_c_opportunity",
        "stage_d_formulation",
        "stage_e_evaluation",
        "stage_f_feasibility",
        "studio",
    ]
    assert RESEARCH_CONTRACT.stage_sequence == expected_sequence

    # Verify gate mapping
    assert RESEARCH_CONTRACT.get_expected_gate("stage_a_scouting") is None
    assert RESEARCH_CONTRACT.get_expected_gate("stage_b_validation") == "GATE_1"
    assert RESEARCH_CONTRACT.get_expected_gate("stage_c_opportunity") == "GATE_2"
    assert RESEARCH_CONTRACT.get_expected_gate("stage_d_formulation") is None
    assert RESEARCH_CONTRACT.get_expected_gate("stage_e_evaluation") == "GATE_3"
    assert RESEARCH_CONTRACT.get_expected_gate("stage_f_feasibility") == "GATE_4"
    assert RESEARCH_CONTRACT.get_expected_gate("studio") is None

    # Verify stage progression
    assert RESEARCH_CONTRACT.get_next_stage("stage_a_scouting") == "stage_b_validation"
    assert RESEARCH_CONTRACT.get_next_stage("stage_b_validation") == "stage_c_opportunity"
    assert RESEARCH_CONTRACT.get_next_stage("stage_c_opportunity") == "stage_d_formulation"
    assert RESEARCH_CONTRACT.get_next_stage("stage_d_formulation") == "stage_e_evaluation"
    assert RESEARCH_CONTRACT.get_next_stage("stage_e_evaluation") == "stage_f_feasibility"
    assert RESEARCH_CONTRACT.get_next_stage("stage_f_feasibility") == "studio"
    assert RESEARCH_CONTRACT.get_next_stage("studio") == "studio"

    # Verify stage existence validation
    for s in expected_sequence:
        assert RESEARCH_CONTRACT.has_stage(s) is True
    assert RESEARCH_CONTRACT.has_stage("stage_z_hypothetical") is False


def test_contract_registry_and_resolution():
    """Verify deterministic contract resolution and rejection of invalid identities."""
    # Canonical framework resolution
    assert get_methodology_contract("INNOVATION") is INNOVATION_CONTRACT
    assert get_methodology_contract("innovation") is INNOVATION_CONTRACT
    assert get_methodology_contract("INNOVATION_RATCHET") is INNOVATION_CONTRACT
    assert get_methodology_contract("RESEARCH") is RESEARCH_CONTRACT
    assert get_methodology_contract("research") is RESEARCH_CONTRACT

    # Deterministic rejection of missing, empty, or invalid frameworks (No silent fallback!)
    assert get_methodology_contract(None) is None
    assert get_methodology_contract("") is None
    assert get_methodology_contract("   ") is None
    assert get_methodology_contract("UNKNOWN_FRAMEWORK") is None
    assert get_methodology_contract("PRODUCT_V9") is None
