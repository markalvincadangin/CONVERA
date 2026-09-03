export type EvidenceTier = "SIGNAL" | "DOCUMENTED" | "STRONGLY_DOCUMENTED";

export type ProblemStatus = "discovered" | "shortlisted" | "validating" | "validated" | "archived";

export type ScreeningVerdict = "ADVANCE" | "SECOND_LOOK" | "PARK";

export type ProblemValidationVerdict = "VALIDATED" | "REVALIDATE" | "REJECT";

export type SolutionVerdict = "READY_TO_TEST" | "RE_IDEATE" | "RETURN_TO_PROBLEM";

export type CommitmentTier =
  | "TIER_1_FINANCIAL"
  | "TIER_2_BEHAVIORAL"
  | "TIER_3_REPUTATIONAL"
  | "TIER_4_TIME_CONTACT"
  | "TIER_5_POLITE_INTEREST";

export type Phase5Verdict = "PURSUE" | "PIVOT" | "RETIRE_CONCEPT";

export type TestArchetype =
  | "CONCIERGE_MVP"
  | "WIZARD_OF_OZ"
  | "SMOKE_OR_LANDING_PAGE_TEST"
  | "INTERACTIVE_PROTOTYPE_OR_PAPER"
  | "LOI_OR_PREORDER_DEPOSIT"
  | "STRUCTURED_SOLUTION_INTERVIEW";

export interface ModelMetadata {
  provider?: string;
  model?: string;
  display_name?: string;
  latency_seconds?: number;
}

export interface ProblemSource {
  id?: number;
  problem_id?: string;
  source_name: string;
  source_url?: string | null;
  source_tier?: "A" | "B" | "C" | "D";
  evidence_type?: string;
  quote_or_summary?: string;
}

export interface ProblemPhaseHistory {
  id?: number;
  problem_id?: string;
  phase_number: number;
  action: string;
  verdict?: string | null;
  llm_response?: string | null;
  model_used?: string | null;
  created_at?: string;
}

export interface ScoreDimension {
  score: number;
  max: number;
  label: string;
}

export interface ScoreBreakdown {
  total_score: number;
  confidence: "HIGH" | "MODERATE" | "WEAK";
  confidence_label: string;
  dimensions: {
    source_diversity: ScoreDimension;
    source_tier_quality: ScoreDimension;
    quantified_impact: ScoreDimension;
    workaround_specificity: ScoreDimension;
    geographic_precision: ScoreDimension;
  };
  recommendations: string[];
}

export interface DevilsAdvocateReport {
  problem_id: string;
  plausibility_score: number;
  verdict: "CHALLENGED" | "VULNERABLE" | "DEFENSIBLE";
  assumption_attacks: string[];
  evidence_gaps: string[];
  fatal_kill_question: string;
  status_quo_inertia: string;
  hardened_reframing: string;
  recommended_field_action: string;
}

export interface BlindSpotItem {
  area: string;
  severity: "HIGH" | "MEDIUM";
  observation: string;
  why_it_matters: string;
}

export interface CognitiveBiasItem {
  bias_type: string;
  manifestation: string;
}

export interface SuggestedExploration {
  sector: string;
  target_location: string;
  starter_friction_question: string;
}

export interface BlindSpotAnalysis {
  total_problems_analyzed: number;
  sector_distribution: Record<string, number>;
  coverage_rating: "CRITICAL_GAPS" | "BALANCED" | "DIVERSE" | "EMPTY";
  identified_blind_spots: BlindSpotItem[];
  cognitive_biases_flagged: CognitiveBiasItem[];
  suggested_explorations: SuggestedExploration[];
}

export interface ProblemRecord {
  id: string;
  project_id?: string | null;
  session_id?: string | null;
  sector: string;
  sufferer_occupation: string;
  sufferer_location: string;
  problem_statement: string;
  evidence_tier: EvidenceTier;
  workaround?: string;
  quantified_impact?: string;
  evidence_types?: string[];
  source?: "llm_phase1" | "manual" | "import";
  source_detail?: string;
  tags?: string[];
  status?: ProblemStatus;
  phase2_verdict?: ScreeningVerdict | null;
  phase3_verdict?: ProblemValidationVerdict | null;
  notes?: string;
  score?: number;
  votes?: number;
  devils_advocate_data?: DevilsAdvocateReport | null;
  comments?: ProblemComment[];
  created_by?: string;
  updated_by?: string;
  score_breakdown?: ScoreBreakdown;
  sources?: ProblemSource[];
  phase_history?: ProblemPhaseHistory[];
  created_at?: string;
  updated_at?: string;
}

// ----------------------------------------------------------------------
// Deliverables Models (Milestone 3)
// ----------------------------------------------------------------------

export interface LeanCanvasData {
  project_name?: string;
  problem: {
    top_frictions: string[];
    existing_alternatives: string[];
  };
  customer_segments: {
    target_customers: string[];
    early_adopters: string[];
  };
  unique_value_proposition: {
    headline: string;
    high_level_concept: string;
  };
  solution: {
    core_mechanisms: string[];
  };
  channels: {
    distribution_paths: string[];
  };
  revenue_streams: {
    monetization_model: string;
    pricing_structure: string;
  };
  cost_structure: {
    fixed_costs: string[];
    variable_costs: string[];
  };
  key_metrics: {
    primary_metric: string;
    empirical_phase5_proof: string;
  };
  unfair_advantage: {
    moat_description: string;
  };
}

export interface CompetitorGridItem {
  competitor_name: string;
  competitor_type: string;
  their_advantage: string;
  our_differentiation: string;
}

export interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitor_grid: CompetitorGridItem[];
  strategic_recommendations: string[];
}

export interface PitchDeckSlide {
  slide_number: number;
  title: string;
  headline: string;
  bullet_points: string[];
  speaker_notes: string;
}

export interface PitchDeckData {
  presentation_title: string;
  tagline: string;
  slides: PitchDeckSlide[];
}

export interface SessionMeta {
  session_id: string;
  project_id?: string;
  project_name?: string;
  share_code?: string;
  has_passcode?: boolean;
  created_at?: string;
  updated_at?: string;
  phase1_complete?: boolean;
  phase2_complete?: boolean;
  phase3_complete?: boolean;
  phase4_complete?: boolean;
  phase5_complete?: boolean;
  completed_levels?: string[];
  problem_statement?: string;
}

export interface SessionState extends SessionMeta {
  phase1_response?: string;
  phase1_sectors?: string[];
  phase1_model_meta?: ModelMetadata;
  phase1_ingestion_summary?: {
    total_count: number;
    new_created_count: number;
    merged_count: number;
    created_ids: string[];
    merged_ids: string[];
  };
  phase2_response?: string;
  phase2_scorecard?: string;
  phase2_model_meta?: ModelMetadata;
  phase3_response?: string;
  phase3_problem?: string;
  phase3_history?: { role: "user" | "assistant"; content: string }[];
  phase3_model_meta?: ModelMetadata;
  phase4_response?: string;
  phase4_concepts?: SolutionConcept[];
  phase4_history?: { role: "user" | "assistant"; content: string }[];
  phase4_model_meta?: ModelMetadata;
  phase5_response?: string;
  phase5_model_meta?: ModelMetadata;
  phase5_metrics?: {
    concept_label: string;
    sample_size: number;
    actions_count: number;
    conversion_rate: number;
    test_archetype: string;
  };
  deliverable_lean_canvas?: LeanCanvasData;
  deliverable_swot?: SwotData;
  deliverable_pitch_deck?: PitchDeckData;
}

export interface SolutionConcept {
  label: string;
  mechanism_family: string;
  causal_link_targeted: string;
  hypothesized_mechanism: string;
  delivery_vehicle: string;
  score?: number;
  verdict?: "ADVANCE_TO_HYPOTHESIS" | "REVISE" | "DROP";
}

export interface Phase3TurnResponse {
  status: string;
  critique: string;
  level_complete: boolean;
  completed_levels: string[];
  next_level: string;
  next_level_label: string;
  next_question: string;
  is_all_complete: boolean;
  scorecard?: string;
  model_meta?: ModelMetadata;
  state: SessionState;
}

export interface Phase4StepResponse {
  status: string;
  step: string;
  response: string;
  concepts: SolutionConcept[];
  concept_check: {
    concept_count: number;
    family_count: number;
    minimum_met: boolean;
    concepts_needed: number;
    families_needed: number;
    families_present: string[];
    families_not_yet_tried: string[];
  };
  model_meta?: ModelMetadata;
  state: SessionState;
}

export interface Phase5AuditResponse {
  status: string;
  response: string;
  conversion_rate: number;
  model_meta?: ModelMetadata;
  state: SessionState;
}


// ----------------------------------------------------------------------
// User Profiles, Roles, and Workspace Security (Option A)
// ----------------------------------------------------------------------

export type UserRole =
  | "FOUNDER_LEAD"
  | "RESEARCHER"
  | "MENTOR_PROFESSOR"
  | "EVALUATOR_JUDGE";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface TeamMember {
  id: string;
  project_id: string;
  name: string;
  role: UserRole;
  avatar: string;
  last_active_at?: string;
  created_at?: string;
}

export interface ProblemComment {
  id?: number;
  problem_id: string;
  user_name: string;
  user_role: UserRole;
  user_avatar?: string;
  comment: string;
  created_at?: string;
}

export interface MentorSignoff {
  id?: number;
  project_id: string;
  phase_number: number;
  mentor_name: string;
  notes?: string;
  created_at?: string;
}


export type ClaimType =
  | "FRICTION_REALITY"
  | "FREQUENCY_CONSEQUENCE"
  | "WORKAROUND_DISSATISFACTION"
  | "ADOPTION_COMMITMENT";

export type ClaimStatus =
  | "UNKNOWN"
  | "HYPOTHESIS"
  | "SUPPORTED"
  | "STRONGLY_SUPPORTED"
  | "VALIDATED"
  | "REFUTED";

export interface ClaimRecord {
  id: string;
  problem_id: string;
  claim_type: ClaimType;
  claim_text: string;
  status: ClaimStatus;
  confidence_score: number;
  mode: "COMMERCIAL" | "CIVIC_INSTITUTIONAL";
  evidence_notes?: string;
  created_at?: string;
}

export interface AssumptionRecord {
  id: string;
  problem_id: string;
  assumption_text: string;
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "UNTESTED" | "IN_TESTING" | "SUPPORTED" | "INVALIDATED";
  origin: "DEVILS_ADVOCATE" | "MANUAL" | "PHASE1_AI";
  testable_question?: string;
  created_at?: string;
}

export interface AlternativeRecord {
  id: string;
  problem_id: string;
  alternative_name: string;
  category: "DIRECT_COMPETITOR" | "ADJACENT_APP" | "MANUAL_WORKAROUND";
  why_it_fails?: string;
  created_at?: string;
}

export interface KnowledgeGraphData {
  problem: ProblemRecord;
  claims: ClaimRecord[];
  assumptions: AssumptionRecord[];
  alternatives: AlternativeRecord[];
  sources: ProblemSource[];
}


export interface DecisionRecord {
  id: string;
  session_id?: string;
  stage: string;
  selected_problem_id: string;
  rejected_problem_ids: string[];
  decision_rationale: string;
  supporting_evidence_ids: string[];
  created_at: string;
}

export interface DecisionSynthesis {
  recommended_winner_id: string;
  recommendation_summary: string;
  candidate_breakdowns: {
    problem_id: string;
    rank: number;
    pros: string[];
    risks: string[];
    verdict: "RECOMMENDED" | "VIABLE_ALTERNATIVE" | "HIGH_RISK";
  }[];
}


export interface SrsSpecification {
  project_title: string;
  executive_summary: string;
  scope: {
    in_scope: string[];
    out_of_scope: string[];
  };
  primary_persona: {
    name: string;
    context: string;
    primary_goal: string;
    core_frustration: string;
  };
  functional_requirements: {
    id: string;
    title: string;
    user_story: string;
    acceptance_criteria: string[];
  }[];
  non_functional_requirements: {
    id: string;
    category: string;
    requirement: string;
    metric: string;
  }[];
  architecture_blueprint: {
    frontend: string;
    backend: string;
    database: string;
    offline_sync_strategy: string;
  };
  mvp_validation_metrics: {
    metric_name: string;
    target_threshold: string;
    verification_method: string;
  }[];
  markdown_document: string;
}
