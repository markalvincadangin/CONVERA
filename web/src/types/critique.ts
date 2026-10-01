/**
 * CONVERA Research Cross-Stage Critique & Blind-Spot Engine Types (SDD-019)
 * =========================================================================
 * TypeScript definitions for cross-stage tensions, epistemic consistency,
 * and Article IV human sovereignty resolution records.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

export type CritiqueType =
  | "CROSS_STAGE_BLIND_SPOT"
  | "EVIDENCE_VULNERABILITY"
  | "CIRCUMSCRIPTION_TENSION"
  | "ETHICS_FEASIBILITY_DISCORD";

export type CritiqueSeverity = "FATAL" | "CRITICAL" | "WARNING" | "ADVISORY";

export type CritiqueStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export interface CrossStageClaimExcerpt {
  stage: string;
  claim_title: string;
  excerpt: string;
}

export interface CrossStageCritiqueRecord {
  id: string;
  session_id: string;
  project_id?: string | null;
  critique_type: CritiqueType;
  severity: CritiqueSeverity;
  target_stages: string[];
  cross_stage_claims: CrossStageClaimExcerpt[];
  fatal_flaw_summary: string;
  kill_question: string;
  mitigation_recommendation: string;
  plausibility_score: number;
  status: CritiqueStatus;
  resolution_notes?: string | null;
  is_degraded: boolean;
  created_at: string;
  resolved_at?: string | null;
}

export interface CritiqueEvaluationRequest {
  session_id: string;
  project_id?: string | null;
  problem_id?: string | null;
  include_ai_advisory?: boolean;
}

export interface CritiqueEvaluationResponse {
  session_id: string;
  project_id?: string | null;
  consistency_score: number;
  total_critiques: number;
  open_critiques: number;
  fatal_count: number;
  critical_count: number;
  warning_count: number;
  advisory_count: number;
  critiques: CrossStageCritiqueRecord[];
  evaluated_at: string;
  is_degraded: boolean;
}

export interface ResolveCritiqueRequest {
  critique_id: string;
  status: CritiqueStatus;
  resolution_notes: string;
}
