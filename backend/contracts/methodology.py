"""
CONVERA Methodology Contract Specification
===========================================
Governed by: CONVERA Concept Development Standard (CCDS v2.0)
Core Axiom: Knowledge != Workflow

Provides structured, strongly-typed semantic contracts defining methodology
processes, stage topologies, and quality gate transitions operating on the
persistent CONVERA Knowledge Graph.
"""
from typing import Dict, List, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field


class GateVerdict(str, Enum):
    PASS = "PASSED"
    REVISE = "REVISE"
    HOLD = "HOLD"
    FAIL = "FAILED"


class StageContract(BaseModel):
    """Semantic definition of a single methodology stage."""
    id: str
    number: int
    code: str                     # e.g. "Phase 1", "Stage A"
    label: str                    # e.g. "Problem Discovery"
    short_description: str
    gate_id: Optional[str] = None # Expected gate for clearance, if any
    required_activities: List[str] = Field(default_factory=list)
    output_artifacts: List[str] = Field(default_factory=list)


class GateContract(BaseModel):
    """Semantic definition of a stage clearance gate."""
    id: str                       # e.g. "GATE_1"
    name: str
    stage_id: str                 # Stage to which this gate belongs
    evaluator_role: str = "FOUNDER_AND_PANEL"
    required_evidence_types: List[str] = Field(default_factory=list)
    passing_criteria_descriptions: List[str] = Field(default_factory=list)


class MethodologyContract(BaseModel):
    """Top-level semantic contract for a methodology track."""
    id: str                       # Unique identifier: "INNOVATION", "RESEARCH"
    name: str
    version: str                  # Semver: "3.0.0"
    governing_standard: str = "CCDS v2.0"
    stages: List[StageContract]
    gates: List[GateContract]
    stage_sequence: List[str]     # Ordered list of stage_ids + terminal ["studio"]
    gate_map: Dict[str, str]      # Mapping: stage_id -> gate_id

    def get_expected_gate(self, stage_id: str) -> Optional[str]:
        """Returns the expected gate ID for the given stage, if required."""
        return self.gate_map.get(stage_id)

    def get_next_stage(self, current_stage_id: str) -> str:
        """Resolves the next stage ID in sequence upon gate passage."""
        try:
            curr_idx = self.stage_sequence.index(current_stage_id)
            if curr_idx + 1 < len(self.stage_sequence):
                return self.stage_sequence[curr_idx + 1]
            return "studio"
        except ValueError:
            return "studio"

    def has_stage(self, stage_id: str) -> bool:
        """Validates if a stage belongs to this methodology."""
        return stage_id in self.stage_sequence or stage_id == "studio"


# ---------------------------------------------------------------------------
# Compatibility Implementations: Innovation & Research Tracks
# ---------------------------------------------------------------------------

INNOVATION_CONTRACT = MethodologyContract(
    id="INNOVATION",
    name="Venture Innovation & Opportunity Validation Framework",
    version="3.0.0",
    governing_standard="CCDS v2.0",
    stage_sequence=[
        "p1_discovery",
        "p2_screening",
        "p3_mom_test",
        "p4_mechanism",
        "p5_economics",
        "studio",
    ],
    gate_map={
        "p2_screening": "GATE_1",
        "p3_mom_test": "GATE_2",
        "p5_economics": "GATE_3",
    },
    stages=[
        StageContract(
            id="p1_discovery",
            number=1,
            code="Phase 1",
            label="Regional Problem Discovery",
            short_description="Discover socio-economic friction with 5 core anchors: Sufferer, Location, Root Cause, Workaround, and Quantified Loss.",
            output_artifacts=["Problem Statement Dossier", "Grounding Card"],
        ),
        StageContract(
            id="p2_screening",
            number=2,
            code="Phase 2",
            label="Screening, Sizing & Decision Room",
            gate_id="GATE_1",
            short_description="Evaluate candidate problems using 10-column screening, DOI academic research citations, and AI Judge comparative triage.",
            output_artifacts=["10-Column Assessment Matrix", "Decision Record", "4-Claim Evidence Ledger"],
        ),
        StageContract(
            id="p3_mom_test",
            number=3,
            code="Phase 3",
            label="Socratic Mom Test Validation",
            gate_id="GATE_2",
            short_description="Simulate conversational customer interviews and adversarial defense across 6 validation levels.",
            output_artifacts=["Socratic Mom Test Transcript", "Commitment Evidence Log"],
        ),
        StageContract(
            id="p4_mechanism",
            number=4,
            code="Phase 4",
            label="Solution Concept & Mechanism",
            short_description="Map solution architecture, mechanism canvas, and system interaction models.",
            output_artifacts=["Mechanism Architecture Canvas", "Solution Concept Spec"],
        ),
        StageContract(
            id="p5_economics",
            number=5,
            code="Phase 5",
            label="Unit Economics & Viability",
            gate_id="GATE_3",
            short_description="Test unit economics, contribution margins, and financial sustainability metrics.",
            output_artifacts=["Unit Economics Scorecard", "Venture Validation Dossier"],
        ),
    ],
    gates=[
        GateContract(
            id="GATE_1",
            name="Gate 1: Problem Screening Clearance",
            stage_id="p2_screening",
            required_evidence_types=["CUSTOMER_LOSS", "MARKET_SIZE", "WORKAROUND_DOCUMENTATION"],
            passing_criteria_descriptions=["Verified problem statement with quantified loss and clear sufferer profile"],
        ),
        GateContract(
            id="GATE_2",
            name="Gate 2: Mom Test Validation Clearance",
            stage_id="p3_mom_test",
            required_evidence_types=["INTERVIEW_EVIDENCE", "PAST_BEHAVIOR_COMMITMENT"],
            passing_criteria_descriptions=["Passed Mom Test Level 6 without leading questions or feature pitches"],
        ),
        GateContract(
            id="GATE_3",
            name="Gate 3: Economic Viability Clearance",
            stage_id="p5_economics",
            required_evidence_types=["UNIT_ECONOMICS", "MARGIN_VALIDATION"],
            passing_criteria_descriptions=["Positive contribution margin and defensible pricing model"],
        ),
    ],
)

RESEARCH_CONTRACT = MethodologyContract(
    id="RESEARCH",
    name="Computing Research & Concept Development Process (CRCDP)",
    version="1.0.0",
    governing_standard="CCDS v2.0",
    stage_sequence=[
        "stage_a_scouting",
        "stage_b_validation",
        "stage_c_opportunity",
        "stage_d_formulation",
        "stage_e_evaluation",
        "stage_f_feasibility",
        "studio",
    ],
    gate_map={
        "stage_b_validation": "GATE_1",
        "stage_c_opportunity": "GATE_2",
        "stage_e_evaluation": "GATE_3",
        "stage_f_feasibility": "GATE_4",
    },
    stages=[
        StageContract(
            id="stage_a_scouting",
            number=1,
            code="Stage A",
            label="Domain Scouting & Problem Identification",
            short_description="Explore computing domain friction, industry pain points, and emerging technological challenges.",
            output_artifacts=["Domain Problem Monograph", "Initial Research Query"],
        ),
        StageContract(
            id="stage_b_validation",
            number=2,
            code="Stage B",
            label="Academic Grounding & Gap Analysis",
            gate_id="GATE_1",
            short_description="Conduct systematic literature review, DOI citation analysis, and identify gaps in existing research.",
            output_artifacts=["Literature Matrix", "DOI Evidence Base", "Research Gap Dossier"],
        ),
        StageContract(
            id="stage_c_opportunity",
            number=3,
            code="Stage C",
            label="Opportunity Framing & Thesis Formulation",
            gate_id="GATE_2",
            short_description="Define formal research questions, design science hypotheses, and methodological framework.",
            output_artifacts=["Research Proposal", "Formal Problem Statement", "DSR Canvas"],
        ),
        StageContract(
            id="stage_d_formulation",
            number=4,
            code="Stage D",
            label="Artifact Formulation & Design Synthesis",
            short_description="Synthesize novel computational artifact, algorithm, model, or system architecture.",
            output_artifacts=["System Architecture", "Design Science Artifact Spec"],
        ),
        StageContract(
            id="stage_e_evaluation",
            number=5,
            code="Stage E",
            label="Controlled Evaluation & Rigor Assessment",
            gate_id="GATE_3",
            short_description="Execute empirical benchmarks, controlled experiments, and quantitative comparative evaluation.",
            output_artifacts=["Empirical Evaluation Results", "Statistical Benchmark Report"],
        ),
        StageContract(
            id="stage_f_feasibility",
            number=6,
            code="Stage F",
            label="Feasibility Analysis & Defense Readiness",
            gate_id="GATE_4",
            short_description="Assess technical feasibility, operational constraints, and defense readiness.",
            output_artifacts=["Research Defense Monograph", "Peer Review Submission Draft"],
        ),
    ],
    gates=[
        GateContract(
            id="GATE_1",
            name="Gate 1: Academic Grounding Clearance",
            stage_id="stage_b_validation",
            required_evidence_types=["PEER_REVIEWED_CITATIONS", "DOI_EVIDENCE"],
            passing_criteria_descriptions=["Minimum peer-reviewed DOI citations establishing grounded literature gap"],
        ),
        GateContract(
            id="GATE_2",
            name="Gate 2: Opportunity Clearance",
            stage_id="stage_c_opportunity",
            required_evidence_types=["RESEARCH_PROPOSAL", "FORMAL_HYPOTHESIS"],
            passing_criteria_descriptions=["Formal research questions and defensible methodology framing"],
        ),
        GateContract(
            id="GATE_3",
            name="Gate 3: Evaluation Rigor Clearance",
            stage_id="stage_e_evaluation",
            required_evidence_types=["EXPERIMENTAL_RESULTS", "BENCHMARK_DATA"],
            passing_criteria_descriptions=["Empirical experimental results meeting statistical rigor standards"],
        ),
        GateContract(
            id="GATE_4",
            name="Gate 4: Feasibility Clearance",
            stage_id="stage_f_feasibility",
            required_evidence_types=["TECHNICAL_DEFENSE", "COMPREHENSIVE_MONOGRAPH"],
            passing_criteria_descriptions=["Complete defense readiness and validated research contribution"],
        ),
    ],
)


# ---------------------------------------------------------------------------
# Static Registry & Accessor (Slice 1 Implementation Choice)
# ---------------------------------------------------------------------------

METHODOLOGY_REGISTRY: Dict[str, MethodologyContract] = {
    "INNOVATION": INNOVATION_CONTRACT,
    "INNOVATION_RATCHET": INNOVATION_CONTRACT,
    "RESEARCH": RESEARCH_CONTRACT,
}


def get_methodology_contract(framework_id: Optional[str]) -> Optional[MethodologyContract]:
    """
    Retrieve the methodology contract for a given framework identity.
    Strictly deterministic:
    - Missing/None/empty returns None (caller enforces controlled failure).
    - Unrecognized string returns None (caller enforces controlled failure).
    - No silent fallback to Innovation.
    """
    if not framework_id or not isinstance(framework_id, str):
        return None
    normalized = framework_id.strip().upper()
    if not normalized:
        return None
    if normalized in METHODOLOGY_REGISTRY:
        return METHODOLOGY_REGISTRY[normalized]
    if normalized.startswith("INNOVATION"):
        return INNOVATION_CONTRACT
    if normalized.startswith("RESEARCH"):
        return RESEARCH_CONTRACT
    return None
