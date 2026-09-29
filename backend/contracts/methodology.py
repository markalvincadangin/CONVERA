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
    icon_key: str = "Layers"      # Icon resolver key for UI consumers
    lock_reason_template: Optional[str] = None


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
    category: str = "INNOVATION"  # "INNOVATION", "RESEARCH", etc.
    tagline: str = ""
    description: str = ""
    target_audience: str = ""
    governing_standard: str = "CCDS v2.0"
    required_artifacts: List[str] = Field(default_factory=list)
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

    def create_initial_stage_progress(self) -> Dict[str, Any]:
        """
        Generate canonical initial stage_progress for a new session.
        Pure function: zero I/O, zero side effects.
        
        Rules:
        - Stage 0 in stage_sequence begins as IN_PROGRESS.
        - All subsequent stages begin as LOCKED.
        - gate_id is resolved from self.gate_map.
        - gate_status initialized to NOT_REQUIRED.
        - Terminal 'studio' is excluded from the stages dict.
        """
        non_terminal = [s for s in self.stage_sequence if s != "studio"]
        stages = {}
        for i, stage_id in enumerate(non_terminal):
            stages[stage_id] = {
                "status": "IN_PROGRESS" if i == 0 else "LOCKED",
                "gate_id": self.gate_map.get(stage_id),
                "gate_status": "NOT_REQUIRED",
            }
        return {
            "schema_version": 1,
            "framework_id": self.id,
            "current_stage_id": non_terminal[0] if non_terminal else "studio",
            "stages": stages,
        }

    def synthesize_stage_progress(self, completion_flags: List[bool]) -> Dict[str, Any]:
        """
        Synthesize canonical stage_progress from clean boolean completion flags.
        Pure function: zero I/O, zero side effects.
        
        RESPONSIBILITY BOUNDARY (LEGACY COMPATIBILITY ADAPTER BEHAVIOR):
        This method receives clean pre-processed boolean flags.
        The caller (synthesize_canonical_stage_progress in sqlite_adapter.py) is
        responsible for inferring completion from historical field names.
        
        Args:
            completion_flags: Ordered booleans corresponding to stage progression.
        """
        non_terminal = [s for s in self.stage_sequence if s != "studio"]
        stages = {}
        for i, s_id in enumerate(non_terminal):
            flag = completion_flags[i] if i < len(completion_flags) else (completion_flags[-1] if completion_flags else False)
            gate_id = self.gate_map.get(s_id)
            if i == 0:
                status = "COMPLETED" if flag else "IN_PROGRESS"
                gate_status = "NOT_REQUIRED"
            else:
                prev_flag = completion_flags[i - 1] if (i - 1) < len(completion_flags) else completion_flags[-1]
                if self.id == "RESEARCH" and i == 5:
                    # Stage F availability requires stage_d (p4) complete
                    prev_flag = completion_flags[3]
                status = "COMPLETED" if flag else ("AVAILABLE" if prev_flag else "LOCKED")
                gate_status = ("PASSED" if flag else "NOT_REQUIRED") if gate_id is not None else "NOT_REQUIRED"
            stages[s_id] = {
                "status": status,
                "gate_id": gate_id,
                "gate_status": gate_status,
            }

        curr = "studio"
        for s_id in non_terminal:
            if stages[s_id]["status"] != "COMPLETED":
                curr = s_id
                if stages[s_id]["status"] == "AVAILABLE":
                    stages[s_id]["status"] = "IN_PROGRESS"
                break

        return {
            "schema_version": 1,
            "framework_id": self.id,
            "current_stage_id": curr,
            "stages": stages,
        }


# ---------------------------------------------------------------------------
# Compatibility Implementations: Innovation & Research Tracks
# ---------------------------------------------------------------------------

INNOVATION_CONTRACT = MethodologyContract(
    id="INNOVATION",
    name="Venture Innovation & Opportunity Validation Framework",
    version="3.0.0",
    category="INNOVATION",
    tagline="Transform regional friction into validated, high-conviction venture opportunities.",
    description="The flagship 5-phase venture exploration framework enforcing the Mechanical Ratchet, 4-Claim Evidence Ledgers, Socratic Mom Test clinic, SVB mechanism canvas, and lean unit economics.",
    target_audience="Student technopreneurs, startup founders, and venture innovation teams",
    governing_standard="CCDS v2.0",
    required_artifacts=[
        "Problem Statement Dossier",
        "Grounding Card",
        "10-Column Assessment Matrix",
        "Decision Record",
        "4-Claim Evidence Ledger",
        "Socratic Mom Test Transcript",
        "Commitment Evidence Log",
        "Mechanism Architecture Canvas",
        "Solution Concept Spec",
        "Unit Economics Scorecard",
        "Venture Validation Dossier",
    ],
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
            icon_key="Compass",
            lock_reason_template="",
        ),
        StageContract(
            id="p2_screening",
            number=2,
            code="Phase 2",
            label="Screening, Sizing & Decision Room",
            gate_id="GATE_1",
            short_description="Evaluate candidate problems using 10-column screening, DOI academic research citations, and AI Judge comparative triage.",
            output_artifacts=["10-Column Assessment Matrix", "Decision Record", "4-Claim Evidence Ledger"],
            icon_key="Filter",
            lock_reason_template="",
        ),
        StageContract(
            id="p3_mom_test",
            number=3,
            code="Phase 3",
            label="Socratic Mom Test Validation",
            gate_id="GATE_2",
            short_description="Simulate conversational customer interviews and adversarial defense across 6 validation levels.",
            output_artifacts=["Socratic Mom Test Transcript", "Commitment Evidence Log"],
            icon_key="ShieldCheck",
            lock_reason_template="Prerequisites Incomplete. Complete Phase 1 or Phase 2 problem screening first.",
        ),
        StageContract(
            id="p4_mechanism",
            number=4,
            code="Phase 4",
            label="Solution Concept & Mechanism",
            short_description="Map solution architecture, mechanism canvas, and system interaction models.",
            output_artifacts=["Mechanism Architecture Canvas", "Solution Concept Spec"],
            icon_key="Lightbulb",
            lock_reason_template="Prerequisites Incomplete. Complete all 6 Mom Test levels in Phase 3 first.",
        ),
        StageContract(
            id="p5_economics",
            number=5,
            code="Phase 5",
            label="Unit Economics & Viability",
            gate_id="GATE_3",
            short_description="Test unit economics, contribution margins, and financial sustainability metrics.",
            output_artifacts=["Unit Economics Scorecard", "Venture Validation Dossier"],
            icon_key="Activity",
            lock_reason_template="Prerequisites Incomplete. Map mechanism & SVB in Phase 4 first.",
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
    category="RESEARCH",
    tagline="Discover, validate, formulate, evaluate, and select rigorous computing research concepts.",
    description="DSR-informed research framework with 6 stages (A..F) and 4 quality gates governing academic rigor, citation grounding, and defense readiness.",
    target_audience="Academic researchers, MS/PhD students, and faculty",
    governing_standard="CCDS v2.0",
    required_artifacts=[
        "Domain Problem Monograph",
        "Initial Research Query",
        "Literature Matrix",
        "DOI Evidence Base",
        "Research Gap Dossier",
        "Research Proposal",
        "Formal Problem Statement",
        "DSR Canvas",
        "System Architecture",
        "Design Science Artifact Spec",
        "Empirical Evaluation Results",
        "Statistical Benchmark Report",
        "Research Defense Monograph",
        "Peer Review Submission Draft",
    ],
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
            icon_key="Search",
            lock_reason_template="",
        ),
        StageContract(
            id="stage_b_validation",
            number=2,
            code="Stage B",
            label="Academic Grounding & Gap Analysis",
            gate_id="GATE_1",
            short_description="Conduct systematic literature review, DOI citation analysis, and identify gaps in existing research.",
            output_artifacts=["Literature Matrix", "DOI Evidence Base", "Research Gap Dossier"],
            icon_key="FileSearch",
            lock_reason_template="",
        ),
        StageContract(
            id="stage_c_opportunity",
            number=3,
            code="Stage C",
            label="Opportunity Framing & Thesis Formulation",
            gate_id="GATE_2",
            short_description="Define formal research questions, design science hypotheses, and methodological framework.",
            output_artifacts=["Research Proposal", "Formal Problem Statement", "DSR Canvas"],
            icon_key="BookOpen",
            lock_reason_template="Validate research problem in Stage B first.",
        ),
        StageContract(
            id="stage_d_formulation",
            number=4,
            code="Stage D",
            label="Artifact Formulation & Design Synthesis",
            short_description="Synthesize novel computational artifact, algorithm, model, or system architecture.",
            output_artifacts=["System Architecture", "Design Science Artifact Spec"],
            icon_key="Cpu",
            lock_reason_template="Establish research gap & questions in Stage C first.",
        ),
        StageContract(
            id="stage_e_evaluation",
            number=5,
            code="Stage E",
            label="Controlled Evaluation & Rigor Assessment",
            gate_id="GATE_3",
            short_description="Execute empirical benchmarks, controlled experiments, and quantitative comparative evaluation.",
            output_artifacts=["Empirical Evaluation Results", "Statistical Benchmark Report"],
            icon_key="BarChart2",
            lock_reason_template="Formulate computing artifact in Stage D first.",
        ),
        StageContract(
            id="stage_f_feasibility",
            number=6,
            code="Stage F",
            label="Feasibility Analysis & Defense Readiness",
            gate_id="GATE_4",
            short_description="Assess technical feasibility, operational constraints, and defense readiness.",
            output_artifacts=["Research Defense Monograph", "Peer Review Submission Draft"],
            icon_key="ShieldCheck",
            lock_reason_template="Complete experimental evaluation in Stage E first.",
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
    return None


def list_methodologies() -> List[Dict[str, Any]]:
    """
    List metadata summaries for all registered methodology contracts.
    Pure function: deduplicates alias keys in METHODOLOGY_REGISTRY.
    """
    seen = set()
    results = []
    for contract in METHODOLOGY_REGISTRY.values():
        if contract.id in seen:
            continue
        seen.add(contract.id)
        results.append({
            "id": contract.id,
            "name": contract.name,
            "version": contract.version,
            "category": contract.category,
            "tagline": contract.tagline,
            "description": contract.description,
            "stage_count": len([s for s in contract.stage_sequence if s != "studio"]),
            "gate_count": len(contract.gates),
            "target_audience": contract.target_audience,
        })
    return results

