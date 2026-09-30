/**
 * CONVERA Concept Evaluation Types (SDD-017)
 * ==========================================
 * TypeScript type definitions for the 7-dimension Concept Evaluation Framework.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

export type EvaluatorType =
  | "DETERMINISTIC_RUBRIC"
  | "AI_CRITIC"
  | "HUMAN_EXPERT";

export type EvaluationRecommendation =
  | "RECOMMENDED"
  | "VIABLE_WITH_REFINEMENT"
  | "HIGH_RISK_REVISE"
  | "REJECT";

export interface DimensionScores {
  problem_relevance: number;
  evidence_grounding: number;
  gap_validity: number;
  stakeholder_impact: number;
  technical_feasibility: number;
  novelty_contribution: number;
  methodology_fit: number;
}

export interface ConceptEvaluationRecord {
  id: string;
  concept_id: string;
  session_id?: string | null;
  evaluator_type: EvaluatorType;
  composite_score: number;
  dimension_scores: DimensionScores;
  strengths: string[];
  vulnerabilities: string[];
  falsification_advisory?: string | null;
  recommendation: EvaluationRecommendation;
  narrative_summary?: string | null;
  is_degraded: boolean;
  created_at: string;
}

export interface ConceptComparisonResult {
  session_id?: string | null;
  rankings: ConceptEvaluationRecord[];
  tradeoff_matrix: Record<string, Record<string, string>>;
  recommended_winner_id?: string | null;
  winner_rationale: string;
}

export interface ConceptEvaluationRequest {
  concept_id: string;
  session_id?: string | null;
  prompt_guidance?: string | null;
  weights?: Record<string, number> | null;
}

export interface ConceptComparisonRequest {
  concept_ids: string[];
  session_id?: string | null;
  weights?: Record<string, number> | null;
}

export interface HumanReviewRequest {
  concept_id: string;
  session_id?: string | null;
  dimension_scores?: Partial<DimensionScores> | null;
  recommendation?: EvaluationRecommendation | null;
  reviewer_notes?: string | null;
  falsification_advisory?: string | null;
}
