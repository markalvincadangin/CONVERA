"""
CONVERA Framework Engine
========================
Governed by: CONVERA Concept Development Standard (CCDS)
Core Axiom: Knowledge != Workflow

Provides structured, domain-specific methodological frameworks operating on the
persistent CONVERA Knowledge Graph.
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class FrameworkCategory(str, Enum):
    INNOVATION = "INNOVATION"
    RESEARCH = "RESEARCH"
    CAPSTONE = "CAPSTONE"
    PRODUCT = "PRODUCT"
    CUSTOM = "CUSTOM"


class GateAction(str, Enum):
    PASS = "PASS"
    REVISE = "REVISE"
    HOLD = "HOLD"
    FAIL = "FAIL"


class Activity(BaseModel):
    id: str
    label: str
    action_type: str = "ANALYSIS"  # ANALYSIS, INTERVIEW, SYNTHESIS, BENCHMARK, SPECIFICATION
    description: str
    required: bool = True
    ai_role_hint: Optional[str] = None


class Criteria(BaseModel):
    id: str
    name: str
    description: str
    weight: float = 1.0
    threshold_description: str


class Gate(BaseModel):
    id: str
    name: str
    stage_id: str
    evaluator_role: str = "FOUNDER_AND_PANEL"
    required_evidence_types: List[str] = Field(default_factory=list)
    passing_criteria: List[Criteria] = Field(default_factory=list)
    description: str


class Stage(BaseModel):
    id: str
    number: int
    code: str  # e.g. "Phase 1", "Stage A"
    label: str
    short_description: str
    activities: List[Activity] = Field(default_factory=list)
    gate_id: Optional[str] = None
    output_artifacts: List[str] = Field(default_factory=list)


class Framework(BaseModel):
    id: str
    name: str
    version: str = "1.0.0"
    category: FrameworkCategory
    tagline: str
    description: str
    governing_standard: str = "CCDS v1.0"
    target_audience: str
    stages: List[Stage] = Field(default_factory=list)
    gates: List[Gate] = Field(default_factory=list)
    required_artifacts: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# 1. INNOVATION FRAMEWORK (Startup & Opportunity Validation)
# ---------------------------------------------------------------------------
INNOVATION_FRAMEWORK = Framework(
    id="INNOVATION",
    name="Venture Innovation & Opportunity Validation Framework",
    version="3.0.0",
    category=FrameworkCategory.INNOVATION,
    tagline="Transform regional friction into validated, high-conviction venture opportunities.",
    description="The flagship 5-phase venture exploration framework enforcing the Mechanical Ratchet, 4-Claim Evidence Ledgers, Socratic Mom Test clinic, SVB mechanism canvas, and lean unit economics.",
    target_audience="Student technopreneurs, startup founders, and venture innovation teams",
    stages=[
        Stage(
            id="phase_1_discovery",
            number=1,
            code="Phase 1",
            label="Regional Problem Discovery",
            short_description="Discover socio-economic friction with 5 core anchors: Sufferer, Location, Root Cause, Workaround, and Quantified Loss.",
            activities=[
                Activity(id="p1_act_1", label="Sector Exploration", action_type="ANALYSIS", description="Scan Agriculture, Healthcare, MSME, Governance sectors."),
                Activity(id="p1_act_2", label="Problem Statement Formulation", action_type="SYNTHESIS", description="Extract 5 core grounding parameters.")
            ],
            output_artifacts=["Problem Statement Dossier", "Grounding Card"]
        ),
        Stage(
            id="phase_2_screening",
            number=2,
            code="Phase 2",
            label="Screening, Sizing & Decision Room",
            short_description="Evaluate candidate problems using 10-column screening, DOI academic research citations, and AI Judge comparative triage.",
            activities=[
                Activity(id="p2_act_1", label="10-Column Screening Matrix", action_type="BENCHMARK", description="Score economic friction, TAM, and workarounds."),
                Activity(id="p2_act_2", label="Evidence Ledger & Assumption Radar", action_type="ANALYSIS", description="Extract 4 core claims and prioritized risk tiers."),
                Activity(id="p2_act_3", label="Decision Room Winner Selection", action_type="SYNTHESIS", description="Commit winner thesis with explainable rationale.")
            ],
            gate_id="gate_screening",
            output_artifacts=["10-Column Assessment Matrix", "Decision Record", "4-Claim Evidence Ledger"]
        ),
        Stage(
            id="phase_3_mom_test",
            number=3,
            code="Phase 3",
            label="Field Validation & Mom Test Clinic",
            short_description="Conduct Socratic past-behavior interviews to validate or refute critical assumptions without pitch bias.",
            activities=[
                Activity(id="p3_act_1", label="6-Level Socratic Interrogation", action_type="INTERVIEW", description="Verify frequency, financial loss, and workaround dissatisfaction."),
                Activity(id="p3_act_2", label="Pivot / Re-evaluate Loop", action_type="ANALYSIS", description="Execute safe backward route if foundational assumptions are refuted.")
            ],
            gate_id="gate_validation",
            output_artifacts=["Mom Test Transcript Ledger", "Assumption Validation Status"]
        ),
        Stage(
            id="phase_4_mechanism",
            number=4,
            code="Phase 4",
            label="Mechanism Design & SVB Canvas",
            short_description="Map validated friction to high-leverage technical mechanisms avoiding premature feature bloat.",
            activities=[
                Activity(id="p4_act_1", label="Mechanism Family Generation", action_type="SYNTHESIS", description="Select from 15 technical mechanism archetypes."),
                Activity(id="p4_act_2", label="Solution Validation Board", action_type="SPECIFICATION", description="Construct cause-and-effect SVB canvas.")
            ],
            output_artifacts=["Solution Validation Board (SVB)", "Core Mechanism Blueprint"]
        ),
        Stage(
            id="phase_5_economics",
            number=5,
            code="Phase 5",
            label="Unit Economics & Behavioral Audit",
            short_description="Model CAC, LTV, Payback, and verify empirical commitment tiers (LOIs, pre-orders, pilot letters).",
            activities=[
                Activity(id="p5_act_1", label="Unit Economics Modeling", action_type="ANALYSIS", description="Calculate contribution margin and payback period in PHP."),
                Activity(id="p5_act_2", label="Commitment Audit & Ratchet Unlock", action_type="BENCHMARK", description="Verify tier-1/2/3 behavioral evidence.")
            ],
            output_artifacts=["Unit Economics Summary", "Empirical Audit Dossier", "Technical SRS Blueprint", "10-Slide Pitch Deck"]
        )
    ],
    gates=[
        Gate(
            id="gate_screening",
            name="Gate 1: Opportunity Worthiness",
            stage_id="phase_2_screening",
            required_evidence_types=["DOI_CITATION", "WORKAROUND_COST", "FRICTION_METRIC"],
            passing_criteria=[
                Criteria(id="c_scr_1", name="Screening Score Threshold", description="Composite score >= 75/100", threshold_description="Score >= 75"),
                Criteria(id="c_scr_2", name="Decision Record Committed", description="Winner thesis locked with documented trade-offs", threshold_description="Immutable decision logged")
            ],
            description="Ensures only validated, high-magnitude regional problems proceed to field testing."
        ),
        Gate(
            id="gate_validation",
            name="Gate 2: Empirical Problem Validation",
            stage_id="phase_3_mom_test",
            required_evidence_types=["INTERVIEW_TRANSCRIPT", "PAST_EXPENSE_RECORD", "WORKAROUND_VERIFICATION"],
            passing_criteria=[
                Criteria(id="c_val_1", name="Zero Refuted Critical Assumptions", description="No critical friction assumptions remain refuted", threshold_description="Status == VALIDATED"),
                Criteria(id="c_val_2", name="Documented Dissatisfaction", description="Sufferer has actively spent time or money on workarounds", threshold_description="Past spending confirmed")
            ],
            description="Prevents premature solution engineering until customer pain is empirically confirmed."
        )
    ],
    required_artifacts=[
        "Problem Statement Dossier",
        "4-Claim Evidence Ledger",
        "Decision Records",
        "Solution Validation Board",
        "Technical Capstone / MVP SRS",
        "Lean Canvas",
        "10-Slide Pitch Deck"
    ]
)


# ---------------------------------------------------------------------------
# 2. COMPUTING RESEARCH FRAMEWORK (Scientific & Academic Discovery)
# ---------------------------------------------------------------------------
RESEARCH_FRAMEWORK = Framework(
    id="RESEARCH",
    name="Computing Research Concept Development Framework",
    version="2.0.0",
    category=FrameworkCategory.RESEARCH,
    tagline="Discover, validate, formulate, evaluate, and select rigorous computing research concepts.",
    description="A DSR-informed academic research framework with 6 progressive phases and 4 quality gates, ensuring problem significance, research gap clarity, artifact formulation, and evaluation rigor before formal proposal writing.",
    target_audience="Academic researchers, faculty advisers, MS/PhD students, and computing research groups",
    stages=[
        Stage(
            id="stage_a_discovery",
            number=1,
            code="Stage A",
            label="Problem Discovery & Problem Bank",
            short_description="Collect candidate research opportunities without proposing solutions prematurely. Separate discovery signals from validation evidence.",
            activities=[
                Activity(id="ra_act_1", label="Problem Bank Intake", action_type="ANALYSIS", description="Log real-world operational breakdowns, domain inefficiencies, or algorithmic bottlenecks."),
                Activity(id="ra_act_2", label="Signal Classification", action_type="BENCHMARK", description="Distinguish empirical signals from opinion or trend hype.")
            ],
            output_artifacts=["Research Problem Intake Card"]
        ),
        Stage(
            id="stage_b_validation",
            number=2,
            code="Stage B",
            label="Problem Validation & Grounding",
            short_description="Verify that the problem is real, recurring, and consequential using peer-reviewed literature, official data, and field observations.",
            activities=[
                Activity(id="rb_act_1", label="Literature Grounding", action_type="ANALYSIS", description="Ground problem in indexed academic databases (OpenAlex, Europe PMC, IEEE, ACM)."),
                Activity(id="rb_act_2", label="Magnitude & Consequence Sizing", action_type="BENCHMARK", description="Quantify operational, computational, or socio-economic cost of the problem.")
            ],
            gate_id="research_gate_1",
            output_artifacts=["Validated Problem Dossier", "Literature Evidence Card"]
        ),
        Stage(
            id="stage_c_opportunity",
            number=3,
            code="Stage C",
            label="Research Opportunity & Prior Art",
            short_description="Analyze existing solutions and literature to establish a distinct research gap and formulate an answerable research question.",
            activities=[
                Activity(id="rc_act_1", label="Prior Art & Baseline Benchmarking", action_type="ANALYSIS", description="Review state-of-the-art methods and why existing approaches fall short."),
                Activity(id="rc_act_2", label="Research Question Formulation", action_type="SYNTHESIS", description="Define precise primary and secondary research questions.")
            ],
            gate_id="research_gate_2",
            output_artifacts=["Research Gap Matrix", "Answerable Research Questions"]
        ),
        Stage(
            id="stage_d_solution",
            number=4,
            code="Stage D",
            label="Solution & Artifact Formulation",
            short_description="Formulate the computing artifact (algorithm, model, architecture, system) constrained strictly by problem requirements.",
            activities=[
                Activity(id="rd_act_1", label="Artifact Specification", action_type="SPECIFICATION", description="Define conceptual architecture, data pipeline, and algorithmic core."),
                Activity(id="rd_act_2", label="Technology Justification", action_type="SYNTHESIS", description="Explicitly justify why chosen tech is necessary vs simpler baselines.")
            ],
            output_artifacts=["Artifact Architecture Blueprint", "Technology Justification Matrix"]
        ),
        Stage(
            id="stage_e_evaluation",
            number=5,
            code="Stage E",
            label="Evaluation Design & Protocol",
            short_description="Design the empirical evaluation methodology: datasets, benchmarks, baseline comparison, metrics, and statistical analysis.",
            activities=[
                Activity(id="re_act_1", label="Metric & Dataset Definition", action_type="SPECIFICATION", description="Define objective metrics (Accuracy, F1, Latency, Throughput, Usability SUS)."),
                Activity(id="re_act_2", label="Baseline Comparison Plan", action_type="ANALYSIS", description="Select state-of-the-art benchmarks for empirical validation.")
            ],
            gate_id="research_gate_3",
            output_artifacts=["Evaluation Design Protocol", "Dataset & Benchmark Specification"]
        ),
        Stage(
            id="stage_f_feasibility",
            number=6,
            code="Stage F",
            label="Relevance, Feasibility & Ethics",
            short_description="Assess participant ethics, data privacy, resource constraints, timeline, and final concept defense readiness.",
            activities=[
                Activity(id="rf_act_1", label="Ethics & Privacy Assessment", action_type="ANALYSIS", description="Review participant consent, data protection, and potential societal risks."),
                Activity(id="rf_act_2", label="Resource & Timeline Verification", action_type="BENCHMARK", description="Ensure compute, lab access, and expertise are available.")
            ],
            gate_id="research_gate_4",
            output_artifacts=["Research Concept Proposal Brief", "Ethics & Feasibility Dossier"]
        )
    ],
    gates=[
        Gate(
            id="research_gate_1",
            name="Gate 1: Problem Significance & Evidence",
            stage_id="stage_b_validation",
            required_evidence_types=["PEER_REVIEWED_PAPER", "EMPIRICAL_METRIC", "DOMAIN_OBSERVATION"],
            passing_criteria=[
                Criteria(id="crg1_1", name="Problem Grounding", description="Problem verified by at least 2 independent reputable sources", threshold_description=">= 2 primary sources"),
                Criteria(id="crg1_2", name="Consequence Defined", description="Measurable negative impact if left unaddressed", threshold_description="Quantified consequence")
            ],
            description="Verifies that the research problem is real, non-trivial, and grounded before gap analysis."
        ),
        Gate(
            id="research_gate_2",
            name="Gate 2: Research Worthiness & Gap Clarity",
            stage_id="stage_c_opportunity",
            required_evidence_types=["STATE_OF_ART_SURVEY", "LIMITATION_ANALYSIS"],
            passing_criteria=[
                Criteria(id="crg2_1", name="Research Gap Identified", description="Distinguished from routine engineering or missing product features", threshold_description="True research gap verified"),
                Criteria(id="crg2_2", name="Answerable Research Question", description="Clear, scoped, and empirically testable research question", threshold_description="Valid RQ formulated")
            ],
            description="Ensures the concept is not merely routine software engineering, but meaningful research."
        ),
        Gate(
            id="research_gate_3",
            name="Gate 3: Methodological Rigor & Evaluability",
            stage_id="stage_e_evaluation",
            required_evidence_types=["DATASET_ACCESS_CONFIRMATION", "BASELINE_SELECTION"],
            passing_criteria=[
                Criteria(id="crg3_1", name="Objective Evaluation Protocol", description="Clearly defined metrics and baseline comparison", threshold_description="Evaluation plan complete"),
                Criteria(id="crg3_2", name="Data Availability", description="Target dataset/participants confirmed accessible", threshold_description="Dataset verified")
            ],
            description="Guarantees the proposed computing artifact can be objectively tested and evaluated."
        ),
        Gate(
            id="research_gate_4",
            name="Gate 4: Final Concept Eligibility & Approval",
            stage_id="stage_f_feasibility",
            required_evidence_types=["ETHICS_CHECKLIST", "RESOURCE_BUDGET"],
            passing_criteria=[
                Criteria(id="crg4_1", name="Ethics & Privacy Compliance", description="Complies with institutional ethics and privacy standards", threshold_description="Ethics approved"),
                Criteria(id="crg4_2", name="Execution Feasibility", description="Team has compute resources and timeline feasibility", threshold_description="Feasible within scope")
            ],
            description="Final sign-off by research panel/adviser before writing formal thesis proposal."
        )
    ],
    required_artifacts=[
        "Validated Research Problem Dossier",
        "Research Gap & RQ Specification",
        "Artifact Architecture Blueprint",
        "Evaluation Design Protocol",
        "Ethics & Feasibility Brief",
        "Full Concept Proposal Dossier"
    ]
)


# ---------------------------------------------------------------------------
# 3. CAPSTONE FRAMEWORK (Academic Computing Thesis / Capstone)
# ---------------------------------------------------------------------------
CAPSTONE_FRAMEWORK = Framework(
    id="CAPSTONE",
    name="Academic Capstone & Technical Specification Framework",
    version="1.0.0",
    category=FrameworkCategory.CAPSTONE,
    tagline="Guide 3rd/4th year computing students from problem validation to IEEE 830 SRS specifications.",
    description="Designed for undergraduate IT/CS capstone project teams conforming to CHED CICT curriculum guidelines and IEEE 830 / ISO 29148 standards.",
    target_audience="Undergraduate computing capstone teams, advisers, and defense panels",
    stages=[
        Stage(
            id="cap_stage_1",
            number=1,
            code="Stage 1",
            label="Academic Problem Definition",
            short_description="Define local beneficiary problem with objective metrics and existing system review.",
            output_artifacts=["Capstone Problem Proposal"]
        ),
        Stage(
            id="cap_stage_2",
            number=2,
            code="Stage 2",
            label="Scope & Requirements Engineering",
            short_description="Derive formal Functional (FR-001..FR-008) and Non-Functional (NFRs) requirements.",
            output_artifacts=["IEEE 830 SRS Specification"]
        ),
        Stage(
            id="cap_stage_3",
            number=3,
            code="Stage 3",
            label="System Architecture & Prototyping",
            short_description="Design 3-tier system architecture, database schema, and core functional modules.",
            output_artifacts=["Architecture Design Document"]
        ),
        Stage(
            id="cap_stage_4",
            number=4,
            code="Stage 4",
            label="Testing, Usability & Capstone Defense",
            short_description="Execute ISO 9126 / SUS usability testing and prepare defense presentation materials.",
            output_artifacts=["Testing & Evaluation Report", "Capstone Defense Deck"]
        )
    ],
    gates=[
        Gate(
            id="capstone_title_defense",
            name="Gate: Title Defense Approval",
            stage_id="cap_stage_1",
            passing_criteria=[
                Criteria(id="cap_c1", name="Local Beneficiary Verified", description="Beneficiary letter or field interview confirmed", threshold_description="Verified beneficiary")
            ],
            description="Academic panel approval to proceed to formal requirements specification."
        )
    ],
    required_artifacts=[
        "Capstone Proposal Dossier",
        "IEEE 830 Software Requirements Specification (SRS)",
        "System Architecture Blueprint",
        "Capstone Defense Presentation"
    ]
)


# ---------------------------------------------------------------------------
# 4. PRODUCT FRAMEWORK (Product Discovery & User Experience)
# ---------------------------------------------------------------------------
PRODUCT_FRAMEWORK = Framework(
    id="PRODUCT",
    name="Product Discovery & UX Specification Framework",
    version="1.0.0",
    category=FrameworkCategory.PRODUCT,
    tagline="Bridge user research, product discovery, and engineering-ready sprint backlog specifications.",
    description="A modern agile product discovery framework focusing on user needs, feature prioritization (MoSCoW), user story mapping, and prototype usability testing.",
    target_audience="Product managers, UX designers, and agile engineering squads",
    stages=[
        Stage(
            id="prod_stage_1",
            number=1,
            code="Stage 1",
            label="Market Context & Opportunity Framing",
            short_description="Analyze market dynamics, target user personas, and core job-to-be-done.",
            output_artifacts=["Product Opportunity Canvas"]
        ),
        Stage(
            id="prod_stage_2",
            number=2,
            code="Stage 2",
            label="User Research & Problem Discovery",
            short_description="Conduct continuous customer discovery and synthesize pain-point journey maps.",
            output_artifacts=["User Journey Map", "Pain Point Matrix"]
        ),
        Stage(
            id="prod_stage_3",
            number=3,
            code="Stage 3",
            label="Solution Exploration & UX Storyboards",
            short_description="Explore interactive wireframes, interaction flows, and user story maps.",
            output_artifacts=["User Story Map", "Interactive Wireframes"]
        ),
        Stage(
            id="prod_stage_4",
            number=4,
            code="Stage 4",
            label="MVP Scope & Sprint Backlog",
            short_description="Define release slicing (MVP vs Post-MVP) with detailed acceptance criteria.",
            output_artifacts=["Sprint-Ready Backlog", "MVP Release Scope"]
        )
    ],
    gates=[
        Gate(
            id="prod_gate_mvp",
            name="Gate: Product Discovery Sign-off",
            stage_id="prod_stage_3",
            passing_criteria=[
                Criteria(id="pr_c1", name="Usability Testing Passed", description="Prototype tested with >= 5 representative users", threshold_description="SUS score >= 75")
            ],
            description="Sign-off from product and engineering before initiating sprint delivery."
        )
    ],
    required_artifacts=[
        "Product Opportunity Canvas",
        "User Journey Map",
        "Sprint-Ready Backlog",
        "MVP Release Specification"
    ]
)


# ---------------------------------------------------------------------------
# CENTRAL FRAMEWORK REGISTRY & ACCESSORS
# ---------------------------------------------------------------------------
FRAMEWORK_REGISTRY: Dict[str, Framework] = {
    "INNOVATION": INNOVATION_FRAMEWORK,
    "RESEARCH": RESEARCH_FRAMEWORK,
    "CAPSTONE": CAPSTONE_FRAMEWORK,
    "PRODUCT": PRODUCT_FRAMEWORK
}


def list_frameworks() -> List[Dict[str, Any]]:
    """List metadata for all available CONVERA frameworks."""
    results = []
    for fw in FRAMEWORK_REGISTRY.values():
        results.append({
            "id": fw.id,
            "name": fw.name,
            "version": fw.version,
            "category": fw.category.value,
            "tagline": fw.tagline,
            "description": fw.description,
            "stage_count": len(fw.stages),
            "gate_count": len(fw.gates),
            "target_audience": fw.target_audience
        })
    return results


def get_framework(framework_id: str) -> Optional[Framework]:
    """Retrieve the complete specification for a framework by ID."""
    return FRAMEWORK_REGISTRY.get(framework_id.upper())
