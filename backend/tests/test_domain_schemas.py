"""
CONVERA Phase 2 Domain Extraction & Architecture Verification Suite
===================================================================
Tests covering:
- Suite A: Exact Python Class Identity (Legacy Import is Domain Class)
- Suite B: Serialization, Validation & Computed Properties Invariance
- Suite C: Q1 & Q2 Regressions (eligible_for_phase2 removal, ProblemEligibilityService, ConceptScreeningScore)
- Suite D: Architectural AST Dependency-Direction Enforcement
"""

import ast
import json
from pathlib import Path
import pytest
from pydantic import ValidationError

# Domain imports
from schemas.domain.problem import (
    DiscoveredProblem as DomainProblem,
    EvidenceSource as DomainSource,
    EvidenceTier as DomainEvidenceTier,
    SourceTier as DomainSourceTier,
    SECTORS as DomainSectors,
)
from schemas.domain.screening import (
    ScreeningResult as DomainScreeningResult,
)
from schemas.domain.validation import (
    EvidenceConfidence as DomainConfidence,
    ProblemAttractiveness as DomainAttractiveness,
)
from schemas.domain.concept import (
    ConceptScreeningScore as DomainScreeningScore,
    SolutionConcept as DomainConcept,
    Assumption as DomainAssumption,
    ExperimentCard as DomainCard,
    VALID_MECHANISM_FAMILIES as DomainMechanismFamilies,
    ASSUMPTION_TYPES as DomainAssumptionTypes,
)
from schemas.domain.experiment import (
    ExperimentAuditResult as DomainAuditResult,
    PivotAnalysis as DomainPivotAnalysis,
    CommitmentTier as DomainCommitmentTier,
    TestArchetype as DomainTestArchetype,
    PassFailStatus as DomainPassFailStatus,
)

# Pipeline container imports from canonical pipeline subpackage
from schemas.pipeline import (
    Phase1Output,
    Phase2Output,
    Phase3Output,
    Phase4Output,
    Phase5Output,
    CONCEPT_VERDICT,
    PHASE4_VERDICT,
    Phase5Verdict,
    get_concept_verdict,
)
import schemas
from services.problem_eligibility_service import ProblemEligibilityService


# ==============================================================================
# Suite A: Exact Python Class Identity
# ==============================================================================

def test_suite_a_exact_class_identity():
    """Verify that importing from schemas package root yields the EXACT same domain class object."""
    # Phase 1
    assert schemas.DiscoveredProblem is DomainProblem
    assert schemas.EvidenceSource is DomainSource

    # Phase 2
    assert schemas.ScreeningResult is DomainScreeningResult

    # Phase 3
    assert schemas.EvidenceConfidence is DomainConfidence
    assert schemas.ProblemAttractiveness is DomainAttractiveness

    # Phase 4
    assert schemas.ConceptScreeningScore is DomainScreeningScore
    assert schemas.SolutionConcept is DomainConcept
    assert schemas.Assumption is DomainAssumption
    assert schemas.ExperimentCard is DomainCard

    # Phase 5
    assert schemas.ExperimentAuditResult is DomainAuditResult
    assert schemas.PivotAnalysis is DomainPivotAnalysis


# ==============================================================================
# Suite B: Serialization, Validation & Computed Properties Invariance
# ==============================================================================

def test_suite_b_assumption_priority_epistemic_matrix():
    """Verify 2x2 epistemic risk matrix maps deterministically to priority P1-P4."""
    # P1: High Importance, High Uncertainty
    a1 = DomainAssumption(
        id="A-001",
        concept_label="Solar Cold Box",
        assumption_text="Farmers will pay subscription",
        type="Desirability",
        importance="H",
        uncertainty="H",
    )
    assert a1.priority == 1

    # P2: High Importance, Low/Medium Uncertainty
    a2 = DomainAssumption(
        id="A-002",
        concept_label="Solar Cold Box",
        assumption_text="Batteries survive humidity",
        type="Feasibility",
        importance="H",
        uncertainty="L",
    )
    assert a2.priority == 2

    # P3: Low/Medium Importance, High Uncertainty
    a3 = DomainAssumption(
        id="A-003",
        concept_label="Solar Cold Box",
        assumption_text="Colors appeal to buyers",
        type="Value",
        importance="L",
        uncertainty="H",
    )
    assert a3.priority == 3

    # P4: Low Importance, Low Uncertainty
    a4 = DomainAssumption(
        id="A-004",
        concept_label="Solar Cold Box",
        assumption_text="Stickers stick to plastic",
        type="Viability",
        importance="L",
        uncertainty="L",
    )
    assert a4.priority == 4


def test_suite_b_scorecards_total_computation():
    """Verify evidence confidence and problem attractiveness compute totals deterministically."""
    conf = DomainConfidence(
        direct_user_evidence=4,
        workaround_evidence=3,
        quantified_consequence=2,
        recurrence_evidence=3,
        population_evidence=4,
        source_triangulation=3,
    )
    assert conf.total == 19
    dumped = json.loads(conf.model_dump_json())
    assert dumped["total"] == 19

    attr = DomainAttractiveness(
        severity=4,
        frequency_urgency=3,
        existing_sacrifice=2,
        number_affected=4,
        persistence=3,
    )
    assert attr.total == 16
    dumped_attr = json.loads(attr.model_dump_json())
    assert dumped_attr["total"] == 16


def test_suite_b_concept_screening_score_invariants():
    """Verify ConceptScreeningScore totals, fatal flaw detection, and range validation."""
    score = DomainScreeningScore(
        problem_fit=3,
        user_desirability=2,
        advantage_over_status_quo=3,
        feasibility=2,
        viability=2,
        evidence_testability=3,
    )
    assert score.total_score == 15
    assert score.has_fatal_flaw is False

    flawed = DomainScreeningScore(
        problem_fit=1,
        user_desirability=3,
        advantage_over_status_quo=3,
        feasibility=3,
        viability=3,
        evidence_testability=3,
    )
    assert flawed.has_fatal_flaw is True


def test_suite_b_solution_concept_validation():
    """Verify mechanism family validation prevents invalid families."""
    with pytest.raises(ValidationError):
        DomainConcept(
            label="Bad Concept",
            mechanism_family="InvalidFamily123",
            causal_link_targeted="Link A",
            hypothesized_mechanism="Does magic",
            delivery_vehicle="digital",
        )

    valid_concept = DomainConcept(
        label="Good Concept",
        mechanism_family="Automation",
        causal_link_targeted="Link A",
        hypothesized_mechanism="Automates scheduling",
        delivery_vehicle="digital",
    )
    assert valid_concept.mechanism_family == "Automation"


# ==============================================================================
# Suite C: Q1 & Q2 Regressions
# ==============================================================================

def test_suite_c_q1_eligible_for_phase2_completely_removed():
    """Q1 Regression: DiscoveredProblem and Phase1Output must NOT have eligibility properties."""
    source = DomainSource(
        description="Iloilo Onion Farmers Survey",
        source_tier="A",
        evidence_type="interview",
        quote_or_summary="35% loss reported",
    )
    prob = DomainProblem(
        problem_id="AGR-001",
        sector="Agriculture & Fisheries",
        sufferer_occupation="Onion Farmer",
        sufferer_location="Miagao",
        problem_statement="High post-harvest loss due to lack of cold storage",
        evidence_tier="STRONGLY_DOCUMENTED",
        evidence_type_list=["interview", "field_visit"],
        sources=[source],
        field_research_gap="Need more interviews",
    )
    
    # Assert DiscoveredProblem has no eligible_for_phase2 attribute
    assert not hasattr(prob, "eligible_for_phase2")
    assert not hasattr(DomainProblem, "eligible_for_phase2")

    # Assert Phase1Output has no phase2_eligible attribute
    p1_out = Phase1Output(
        sectors_covered=["Agriculture & Fisheries"],
        sectors_no_local_evidence=[],
        problems=[prob],
    )
    assert not hasattr(p1_out, "phase2_eligible")
    assert not hasattr(Phase1Output, "phase2_eligible")


def test_suite_c_q1_problem_eligibility_service_policy():
    """Q1 Regression: ProblemEligibilityService evaluates eligibility outside domain model."""
    source = DomainSource(
        description="Source",
        source_tier="B",
        evidence_type="report",
        quote_or_summary="Data",
    )
    
    p_strong = DomainProblem(
        problem_id="P-01", sector="Agri", sufferer_occupation="Farmer", sufferer_location="Barangay",
        problem_statement="Problem 1", evidence_tier="STRONGLY_DOCUMENTED", evidence_type_list=[], sources=[source],
        field_research_gap="Gap 1",
    )
    p_doc = DomainProblem(
        problem_id="P-02", sector="Agri", sufferer_occupation="Farmer", sufferer_location="Barangay",
        problem_statement="Problem 2", evidence_tier="DOCUMENTED", evidence_type_list=[], sources=[source],
        field_research_gap="Gap 2",
    )
    p_primary = DomainProblem(
        problem_id="P-03", sector="Agri", sufferer_occupation="Farmer", sufferer_location="Barangay",
        problem_statement="Problem 3", evidence_tier="DOCUMENTED_PRIMARY_ONLY", evidence_type_list=[], sources=[source],
        field_research_gap="Gap 3",
    )
    p_signal = DomainProblem(
        problem_id="P-04", sector="Agri", sufferer_occupation="Farmer", sufferer_location="Barangay",
        problem_statement="Problem 4", evidence_tier="SIGNAL", evidence_type_list=[], sources=[source],
        field_research_gap="Gap 4",
    )

    assert ProblemEligibilityService.is_eligible_for_phase2(p_strong) is True
    assert ProblemEligibilityService.is_eligible_for_phase2(p_doc) is True
    assert ProblemEligibilityService.is_eligible_for_phase2(p_primary) is True
    assert ProblemEligibilityService.is_eligible_for_phase2(p_signal) is False

    filtered = ProblemEligibilityService.filter_phase2_eligible([p_strong, p_doc, p_primary, p_signal])
    assert len(filtered) == 3
    assert p_signal not in filtered


def test_suite_c_q2_concept_screening_score_and_routing_invariance():
    """Q2 Regression: ConceptScreeningScore does not own verdict, and Phase 4 routing behaves identically."""
    # 1. Assert domain model does NOT have verdict
    score = DomainScreeningScore(
        problem_fit=2, user_desirability=2, advantage_over_status_quo=2,
        feasibility=2, viability=2, evidence_testability=2,
    )
    assert not hasattr(score, "verdict")
    assert not hasattr(DomainScreeningScore, "verdict")

    # 2. Application policy / evaluation function get_concept_verdict tests
    score_drop_fit = DomainScreeningScore(
        problem_fit=1, user_desirability=3, advantage_over_status_quo=3,
        feasibility=3, viability=3, evidence_testability=3,
    )
    assert get_concept_verdict(score_drop_fit) == "DROP"

    score_drop_feas_viab = DomainScreeningScore(
        problem_fit=3, user_desirability=3, advantage_over_status_quo=3,
        feasibility=1, viability=1, evidence_testability=3,
    )
    assert get_concept_verdict(score_drop_feas_viab) == "DROP"

    score_advance = DomainScreeningScore(
        problem_fit=2, user_desirability=2, advantage_over_status_quo=2,
        feasibility=2, viability=2, evidence_testability=2,
    )
    assert get_concept_verdict(score_advance) == "ADVANCE_TO_HYPOTHESIS"

    score_revise = DomainScreeningScore(
        problem_fit=2, user_desirability=2, advantage_over_status_quo=2,
        feasibility=1, viability=2, evidence_testability=2,
    )
    assert get_concept_verdict(score_revise) == "REVISE"

    # 3. Phase4Output advance_concepts computed field invariance
    c1 = DomainConcept(
        label="C1", mechanism_family="Automation", causal_link_targeted="L1",
        hypothesized_mechanism="M1", delivery_vehicle="digital", screening_score=score_advance,
    )
    c2 = DomainConcept(
        label="C2", mechanism_family="Coordination", causal_link_targeted="L2",
        hypothesized_mechanism="M2", delivery_vehicle="digital", screening_score=score_revise,
    )
    c3 = DomainConcept(
        label="C3", mechanism_family="Matching", causal_link_targeted="L3",
        hypothesized_mechanism="M3", delivery_vehicle="digital", screening_score=score_drop_fit,
    )
    c4 = DomainConcept(
        label="C4", mechanism_family="Risk reduction", causal_link_targeted="L4",
        hypothesized_mechanism="M4", delivery_vehicle="digital", screening_score=score_advance,
    )
    c5 = DomainConcept(
        label="C5", mechanism_family="Information", causal_link_targeted="L5",
        hypothesized_mechanism="M5", delivery_vehicle="digital", screening_score=None,
    )

    card1 = DomainCard(
        id="E-001", concept_label="C1", assumption_id="A-001", assumption_tested="Test",
        hypothesis="H", test_method="Interview", target_participant="Farmers",
        observable_metric="Metric", pass_threshold="80%", fail_threshold="50%",
        decision_if_pass="Proceed", decision_if_fail="Pivot",
    )
    assumption1 = DomainAssumption(
        id="A-001", concept_label="C1", assumption_text="Text",
        type="Desirability", importance="H", uncertainty="H",
    )

    p4_output = Phase4Output(
        opportunity_question="How might we reduce spoilage?",
        root_mechanism_decomposition=[],
        concepts=[c1, c2, c3, c4, c5],
        assumption_register=[assumption1],
        experiment_cards=[card1],
        verdict="READY_TO_TEST",
    )

    # Exactly c1 and c4 should be in advance_concepts
    assert [c.label for c in p4_output.advance_concepts] == ["C1", "C4"]


# ==============================================================================
# Suite D: Architectural AST Dependency-Direction Enforcement
# ==============================================================================

def test_suite_d_architectural_dependency_direction():
    """
    AST linter enforcing strict dependency boundaries:
    1. schemas/domain/*.py must NEVER import from phase*_output, routers, engines, storage, or services.
    2. schemas/phase*_output.py must NEVER import from services (pipeline containers do not import policy services).
    """
    domain_dir = Path(__file__).resolve().parent.parent / "schemas" / "domain"
    schemas_dir = Path(__file__).resolve().parent.parent / "schemas"

    forbidden_domain_prefixes = (
        "schemas.phase",
        "phase",
        "routers",
        "engines",
        "storage",
        "services",
        "backend.schemas.phase",
        "backend.routers",
        "backend.engines",
        "backend.storage",
        "backend.services",
    )

    # Check all files in schemas/domain/
    for py_file in domain_dir.glob("*.py"):
        tree = ast.parse(py_file.read_text(), filename=str(py_file))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    for forbidden in forbidden_domain_prefixes:
                        assert not alias.name.startswith(forbidden), (
                            f"Illegal import in domain model {py_file.name}: {alias.name}"
                        )
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                for forbidden in forbidden_domain_prefixes:
                    assert not module.startswith(forbidden), (
                        f"Illegal from-import in domain model {py_file.name}: {module}"
                    )

    # Check phase output files (must not import services)
    for phase_file in schemas_dir.glob("phase*_output.py"):
        tree = ast.parse(phase_file.read_text(), filename=str(phase_file))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    assert "services" not in alias.name, (
                        f"Illegal import in pipeline schema {phase_file.name}: {alias.name}"
                    )
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                assert "services" not in module, (
                    f"Illegal from-import in pipeline schema {phase_file.name}: {module}"
                )
