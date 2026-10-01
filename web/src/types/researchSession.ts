/**
 * CONVERA Research Session Domain Interfaces (SDD-021)
 * ====================================================
 * TypeScript interfaces matching backend models for research session persistence,
 * milestone checkpoints, turnkey resume payloads, and clone actions.
 */

export interface ResearchSessionSummary {
  session_id: string;
  project_id?: string | null;
  project_name: string;
  framework_id: string;
  current_stage_id: string;
  current_stage_name: string;
  stage_index: number;
  stage_completion_pct: number;
  active_problem_id?: string | null;
  active_problem_title?: string | null;
  active_domain_id?: string | null;
  checkpoint_count: number;
  gate1_cleared: boolean;
  gate2_cleared: boolean;
  gate3_cleared: boolean;
  gate4_cleared: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateResearchSessionRequest {
  project_name: string;
  project_id?: string | null;
  domain_id?: string | null;
  initial_topic?: string | null;
}

export interface CreateCheckpointRequest {
  checkpoint_name: string;
  description?: string | null;
  created_by?: string;
}

export interface ResearchSessionCheckpointRecord {
  checkpoint_id: string;
  session_id: string;
  checkpoint_name: string;
  description?: string | null;
  stage_id: string;
  stage_index: number;
  state_hash: string;
  created_by: string;
  created_at: string;
}

export interface SyncStageRequest {
  stage_id: string;
  stage_index?: number | null;
  stage_completion_pct?: number | null;
  active_problem_id?: string | null;
  active_domain_id?: string | null;
}

export interface ResearchSessionResumePayload {
  session: Record<string, unknown>;
  summary: ResearchSessionSummary;
  checkpoints: ResearchSessionCheckpointRecord[];
  active_problem?: {
    id: string;
    problem_statement: string;
    sector?: string;
    evidence_tier?: string;
    tags?: string[];
    [key: string]: unknown;
  } | null;
  recent_events: Array<{
    id?: string;
    event_type?: string;
    action_type?: string;
    created_at?: string;
    [key: string]: unknown;
  }>;
  orchestration_status?: Record<string, unknown> | null;
}

export interface CloneResearchSessionRequest {
  new_project_name: string;
  include_literature?: boolean;
  include_checkpoints?: boolean;
}
