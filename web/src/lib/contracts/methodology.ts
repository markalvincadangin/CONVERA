/**
 * CONVERA Methodology Contract Specification (Frontend TypeScript Mirror)
 * =====================================================================
 * Governed by: CONVERA Concept Development Standard (CCDS v2.0)
 * Core Axiom: Knowledge != Workflow
 *
 * Provides strongly-typed frontend contracts mirror for methodology topologies,
 * stage metadata, gate requirements, and icon resolvers.
 */

export interface StageContract {
  id: string;
  number: number;
  code: string;
  label: string;
  short_title: string;
  stepper_desc: string;
  short_description: string;
  gate_id?: string | null;
  required_activities: string[];
  output_artifacts: string[];
  icon_key: string;
  lock_reason_template?: string | null;
}

export interface GateContract {
  id: string;
  name: string;
  stage_id: string;
  evaluator_role: string;
  required_evidence_types: string[];
  passing_criteria_descriptions: string[];
}

export interface MethodologyContract {
  id: string;
  name: string;
  version: string;
  category: "INNOVATION" | "RESEARCH" | string;
  tagline: string;
  description: string;
  target_audience: string;
  governing_standard: string;
  required_artifacts: string[];
  stages: StageContract[];
  gates: GateContract[];
  stage_sequence: string[];
  gate_map: Record<string, string>;
}

export const INNOVATION_CONTRACT: MethodologyContract = {
  id: "INNOVATION",
  name: "Venture Innovation & Opportunity Validation Framework",
  version: "3.0.0",
  category: "INNOVATION",
  tagline: "Transform regional friction into validated, high-conviction venture opportunities.",
  description:
    "The flagship 5-phase venture exploration framework enforcing the Mechanical Ratchet, 4-Claim Evidence Ledgers, Socratic Mom Test clinic, SVB mechanism canvas, and lean unit economics.",
  target_audience: "Student technopreneurs, startup founders, and venture innovation teams",
  governing_standard: "CCDS v2.0",
  required_artifacts: [
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
  stage_sequence: [
    "p1_discovery",
    "p2_screening",
    "p3_mom_test",
    "p4_mechanism",
    "p5_economics",
    "studio",
  ],
  gate_map: {
    p2_screening: "GATE_1",
    p3_mom_test: "GATE_2",
    p5_economics: "GATE_3",
  },
  stages: [
    {
      id: "p1_discovery",
      number: 1,
      code: "Phase 1",
      label: "Regional Problem Discovery",
      short_title: "Discovery",
      stepper_desc: "Landscape signals",
      short_description: "Discover socio-economic friction with 5 core anchors: Sufferer, Location, Root Cause, Workaround, and Quantified Loss.",
      required_activities: ["Landscape Analysis", "Friction Ingestion"],
      output_artifacts: ["Problem Statement Dossier", "Grounding Card"],
      icon_key: "Compass",
      lock_reason_template: "",
    },
    {
      id: "p2_screening",
      number: 2,
      code: "Phase 2",
      label: "Screening, Sizing & Decision Room",
      short_title: "Screening",
      stepper_desc: "Triage & matrix",
      gate_id: "GATE_1",
      short_description: "Evaluate candidate problems using 10-column screening, DOI academic research citations, and AI Judge comparative triage.",
      required_activities: ["10-Column Assessment", "Triage & Selection"],
      output_artifacts: ["10-Column Assessment Matrix", "Decision Record", "4-Claim Evidence Ledger"],
      icon_key: "Filter",
      lock_reason_template: "",
    },
    {
      id: "p3_mom_test",
      number: 3,
      code: "Phase 3",
      label: "Socratic Mom Test Validation",
      short_title: "Validation",
      stepper_desc: "6-Level Mom Test",
      gate_id: "GATE_2",
      short_description: "Simulate conversational customer interviews and adversarial defense across 6 validation levels.",
      required_activities: ["Socratic Mom Test Simulation", "Evidence Extraction"],
      output_artifacts: ["Socratic Mom Test Transcript", "Commitment Evidence Log"],
      icon_key: "ShieldCheck",
      lock_reason_template: "Prerequisites Incomplete. Complete Phase 1 or Phase 2 problem screening first.",
    },
    {
      id: "p4_mechanism",
      number: 4,
      code: "Phase 4",
      label: "Solution Concept & Mechanism",
      short_title: "Ideation",
      stepper_desc: "15 Mechanism SVB",
      short_description: "Map solution architecture, mechanism canvas, and system interaction models.",
      required_activities: ["15 Mechanism SVB Mapping", "Interaction Modeling"],
      output_artifacts: ["Mechanism Architecture Canvas", "Solution Concept Spec"],
      icon_key: "Lightbulb",
      lock_reason_template: "Prerequisites Incomplete. Complete all 6 Mom Test levels in Phase 3 first.",
    },
    {
      id: "p5_economics",
      number: 5,
      code: "Phase 5",
      label: "Unit Economics & Viability",
      short_title: "MVP Audit",
      stepper_desc: "Skin-in-game test",
      gate_id: "GATE_3",
      short_description: "Test unit economics, contribution margins, and financial sustainability metrics.",
      required_activities: ["Contribution Margin Audit", "Viability Assessment"],
      output_artifacts: ["Unit Economics Scorecard", "Venture Validation Dossier"],
      icon_key: "Activity",
      lock_reason_template: "Prerequisites Incomplete. Map mechanism & SVB in Phase 4 first.",
    },
  ],
  gates: [
    {
      id: "GATE_1",
      name: "Gate 1: Problem Screening Clearance",
      stage_id: "p2_screening",
      evaluator_role: "FOUNDER_AND_PANEL",
      required_evidence_types: ["CUSTOMER_LOSS", "MARKET_SIZE", "WORKAROUND_DOCUMENTATION"],
      passing_criteria_descriptions: ["Verified problem statement with quantified loss and clear sufferer profile"],
    },
    {
      id: "GATE_2",
      name: "Gate 2: Mom Test Validation Clearance",
      stage_id: "p3_mom_test",
      evaluator_role: "FOUNDER_AND_PANEL",
      required_evidence_types: ["INTERVIEW_EVIDENCE", "PAST_BEHAVIOR_COMMITMENT"],
      passing_criteria_descriptions: ["Passed Mom Test Level 6 without leading questions or feature pitches"],
    },
    {
      id: "GATE_3",
      name: "Gate 3: Economic Viability Clearance",
      stage_id: "p5_economics",
      evaluator_role: "FOUNDER_AND_PANEL",
      required_evidence_types: ["UNIT_ECONOMICS", "MARGIN_VALIDATION"],
      passing_criteria_descriptions: ["Positive contribution margin and defensible pricing model"],
    },
  ],
};

export const RESEARCH_CONTRACT: MethodologyContract = {
  id: "RESEARCH",
  name: "Computing Research & Concept Development Process (CRCDP)",
  version: "1.0.0",
  category: "RESEARCH",
  tagline: "Discover, validate, formulate, evaluate, and select rigorous computing research concepts.",
  description:
    "DSR-informed research framework with 6 stages (A..F) and 4 quality gates governing academic rigor, citation grounding, and defense readiness.",
  target_audience: "Academic researchers, MS/PhD students, and faculty",
  governing_standard: "CCDS v2.0",
  required_artifacts: [
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
  stage_sequence: [
    "stage_a_scouting",
    "stage_b_validation",
    "stage_c_opportunity",
    "stage_d_formulation",
    "stage_e_evaluation",
    "stage_f_feasibility",
    "studio",
  ],
  gate_map: {
    stage_b_validation: "GATE_1",
    stage_c_opportunity: "GATE_2",
    stage_e_evaluation: "GATE_3",
    stage_f_feasibility: "GATE_4",
  },
  stages: [
    {
      id: "stage_a_scouting",
      number: 1,
      code: "Stage A",
      label: "Domain Scouting & Problem Identification",
      short_title: "Scouting",
      stepper_desc: "Empirical signals",
      short_description: "Explore computing domain friction, industry pain points, and emerging technological challenges.",
      required_activities: ["Empirical Observation", "Problem Brief"],
      output_artifacts: ["Domain Problem Monograph", "Initial Research Query"],
      icon_key: "Search",
      lock_reason_template: "",
    },
    {
      id: "stage_b_validation",
      number: 2,
      code: "Stage B",
      label: "Academic Grounding & Gap Analysis",
      short_title: "Validation [G1]",
      stepper_desc: "Lit & DOI evidence",
      gate_id: "GATE_1",
      short_description: "Conduct systematic literature review, DOI citation analysis, and identify gaps in existing research.",
      required_activities: ["Literature Grounding", "Conceptual Modeling"],
      output_artifacts: ["Literature Matrix", "DOI Evidence Base", "Research Gap Dossier"],
      icon_key: "FileSearch",
      lock_reason_template: "",
    },
    {
      id: "stage_c_opportunity",
      number: 3,
      code: "Stage C",
      label: "Opportunity Framing & Thesis Formulation",
      short_title: "Opportunity [G2]",
      stepper_desc: "Gaps & RQ matrix",
      gate_id: "GATE_2",
      short_description: "Define formal research questions, design science hypotheses, and methodological framework.",
      required_activities: ["Scholarly Gap Synthesis", "RQ Matrix Formulation"],
      output_artifacts: ["Research Proposal", "Formal Problem Statement", "DSR Canvas"],
      icon_key: "BookOpen",
      lock_reason_template: "Validate research problem in Stage B first.",
    },
    {
      id: "stage_d_formulation",
      number: 4,
      code: "Stage D",
      label: "Artifact Formulation & Design Synthesis",
      short_title: "Formulation",
      stepper_desc: "4 DSR Artifacts",
      short_description: "Synthesize novel computational artifact, algorithm, model, or system architecture.",
      required_activities: ["DSR Artifact Modeling", "Kernel Theory Formulation"],
      output_artifacts: ["System Architecture", "Design Science Artifact Spec"],
      icon_key: "Cpu",
      lock_reason_template: "Establish research gap & questions in Stage C first.",
    },
    {
      id: "stage_e_evaluation",
      number: 5,
      code: "Stage E",
      label: "Controlled Evaluation & Rigor Assessment",
      short_title: "Evaluation [G3]",
      stepper_desc: "Kothari Trapping",
      gate_id: "GATE_3",
      short_description: "Execute empirical benchmarks, controlled experiments, and quantitative comparative evaluation.",
      required_activities: ["Kothari Experimental Design", "Circumscription Loop Execution"],
      output_artifacts: ["Empirical Evaluation Results", "Statistical Benchmark Report"],
      icon_key: "BarChart2",
      lock_reason_template: "Formulate computing artifact in Stage D first.",
    },
    {
      id: "stage_f_feasibility",
      number: 6,
      code: "Stage F",
      label: "Feasibility Analysis & Defense Readiness",
      short_title: "Feasibility [G4]",
      stepper_desc: "Ethics & DOST/SDG",
      gate_id: "GATE_4",
      short_description: "Assess technical feasibility, operational constraints, and defense readiness.",
      required_activities: ["DOST/SDG Alignment", "Defense Monograph Synthesis"],
      output_artifacts: ["Research Defense Monograph", "Peer Review Submission Draft"],
      icon_key: "ShieldCheck",
      lock_reason_template: "Complete experimental evaluation in Stage E first.",
    },
  ],
  gates: [
    {
      id: "GATE_1",
      name: "Gate 1: Academic Grounding Clearance",
      stage_id: "stage_b_validation",
      evaluator_role: "FOUNDER_AND_PANEL",
      required_evidence_types: ["PEER_REVIEWED_CITATIONS", "DOI_EVIDENCE"],
      passing_criteria_descriptions: ["Minimum peer-reviewed DOI citations establishing grounded literature gap"],
    },
    {
      id: "GATE_2",
      name: "Gate 2: Opportunity Clearance",
      stage_id: "stage_c_opportunity",
      evaluator_role: "FOUNDER_AND_PANEL",
      required_evidence_types: ["RESEARCH_PROPOSAL", "FORMAL_HYPOTHESIS"],
      passing_criteria_descriptions: ["Formal research questions and defensible methodology framing"],
    },
    {
      id: "GATE_3",
      name: "Gate 3: Evaluation Rigor Clearance",
      stage_id: "stage_e_evaluation",
      evaluator_role: "FOUNDER_AND_PANEL",
      required_evidence_types: ["EXPERIMENTAL_RESULTS", "BENCHMARK_DATA"],
      passing_criteria_descriptions: ["Empirical experimental results meeting statistical rigor standards"],
    },
    {
      id: "GATE_4",
      name: "Gate 4: Feasibility Clearance",
      stage_id: "stage_f_feasibility",
      evaluator_role: "FOUNDER_AND_PANEL",
      required_evidence_types: ["TECHNICAL_DEFENSE", "COMPREHENSIVE_MONOGRAPH"],
      passing_criteria_descriptions: ["Complete defense readiness and validated research contribution"],
    },
  ],
};

const CLIENT_REGISTRY: Record<string, MethodologyContract> = {
  INNOVATION: INNOVATION_CONTRACT,
  INNOVATION_RATCHET: INNOVATION_CONTRACT,
  RESEARCH: RESEARCH_CONTRACT,
  CRCDP: RESEARCH_CONTRACT,
};

/**
 * Deterministically resolve a methodology contract by identifier.
 * Safe fallback to INNOVATION_CONTRACT ensures robust offline UI rendering.
 */
export function getMethodologyContract(frameworkId?: string | null): MethodologyContract {
  if (!frameworkId || typeof frameworkId !== "string") {
    return INNOVATION_CONTRACT;
  }
  const normalized = frameworkId.trim().toUpperCase();
  if (normalized in CLIENT_REGISTRY) {
    return CLIENT_REGISTRY[normalized];
  }
  if (normalized.includes("RESEARCH") || normalized.includes("CRCDP")) {
    return RESEARCH_CONTRACT;
  }
  return INNOVATION_CONTRACT;
}

/**
 * Return list of all available methodology contracts.
 */
export function listClientMethodologies(): MethodologyContract[] {
  return [INNOVATION_CONTRACT, RESEARCH_CONTRACT];
}
