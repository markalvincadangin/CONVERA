export type EvidenceTier = "SIGNAL" | "DOCUMENTED" | "STRONGLY_DOCUMENTED";

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

export interface SessionMeta {
  session_id: string;
  project_id?: string;
  project_name?: string;
  share_code?: string;
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
  phase2_response?: string;
  phase3_response?: string;
  phase3_problem?: string;
  phase3_history?: { role: "user" | "assistant"; content: string }[];
  phase4_response?: string;
  phase4_concepts?: SolutionConcept[];
  phase4_history?: { role: "user" | "assistant"; content: string }[];
  phase5_response?: string;
  phase5_metrics?: {
    concept_label: string;
    sample_size: number;
    actions_count: number;
    conversion_rate: number;
    test_archetype: string;
  };
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
  state: SessionState;
}

export interface Phase5AuditResponse {
  status: string;
  response: string;
  conversion_rate: number;
  state: SessionState;
}
