/**
 * CONVERA Orchestrator Service (SDD-014)
 * =====================================
 * TypeScript client for the Research Orchestrator Engine:
 * - POST /api/orchestrator/evaluate
 * - POST /api/orchestrator/dispatch-action
 * - GET /api/orchestrator/session/{session_id}/events
 */

import { fetchApi } from "@/lib/api-client";

export type ActionPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export type ActionType =
  | "ACQUIRE_EVIDENCE"
  | "CHALLENGE_ASSUMPTION"
  | "RESOLVE_CONTRADICTION"
  | "SYNTHESIZE_LITERATURE"
  | "EXECUTE_CRITIQUE"
  | "FORMULATE_DECISION"
  | "GENERATE_STAGE_DELIVERABLE"
  | "REQUEST_GATE_REVIEW";

export interface RecommendedAction {
  action_id: string;
  action_type: ActionType;
  title: string;
  description: string;
  priority: ActionPriority;
  blocking_stage_progression: boolean;
  target_engine: string;
  suggested_payload: Record<string, any>;
}

export interface OrchestrationStageStatus {
  stage_id: string;
  stage_name: string;
  stage_index: number;
  prerequisites_satisfied: boolean;
  missing_prerequisites: string[];
  required_outputs: string[];
  missing_outputs: string[];
  gate_ready: boolean;
}

export interface EpistemicHealthSummary {
  facts_count: number;
  assumptions_count: number;
  evidence_items_count: number;
  scholarly_works_count: number;
  net_epistemic_balance: number;
  overconfidence_risk: boolean;
  overconfidence_details?: string | null;
}

export interface CritiqueSummary {
  active_critiques_count: number;
  identified_blind_spots: string[];
  socratic_questions: string[];
}

export interface OrchestrationEvaluationResult {
  session_id: string;
  problem_id?: string | null;
  framework_id: string;
  stage_id: string;
  evaluated_at: string;
  stage_status: OrchestrationStageStatus;
  epistemic_health: EpistemicHealthSummary;
  critique_summary: CritiqueSummary;
  recommended_actions: RecommendedAction[];
  narrative_guidance?: string | null;
}

export interface OrchestrationActionDispatchRequest {
  session_id: string;
  problem_id?: string | null;
  action_type: ActionType;
  target_engine: string;
  parameters?: Record<string, any>;
}

export interface OrchestrationActionDispatchResult {
  event_id: string;
  session_id: string;
  action_type: ActionType;
  status: "SUCCESS" | "DEGRADED" | "ERROR";
  execution_summary: string;
  resulting_artifacts: Record<string, any>;
}

export interface OrchestrationEventRecord {
  id: string;
  session_id: string;
  problem_id?: string | null;
  framework_id: string;
  stage_id: string;
  event_type: string;
  payload: Record<string, any>;
  created_by: string;
  created_at: string;
}

export interface OrchestrationEventsResponse {
  status: string;
  session_id: string;
  count: number;
  events: OrchestrationEventRecord[];
}

export const orchestratorService = {
  /**
   * Evaluate session stage status, epistemic health, and compute ranked recommendations.
   */
  evaluate: async (
    sessionId: string,
    problemId?: string | null
  ): Promise<OrchestrationEvaluationResult> => {
    return fetchApi<OrchestrationEvaluationResult>("/api/orchestrator/evaluate", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        problem_id: problemId || null,
      }),
    });
  },

  /**
   * Dispatch a recommended orchestration action with human confirmation.
   */
  dispatchAction: async (
    request: OrchestrationActionDispatchRequest
  ): Promise<OrchestrationActionDispatchResult> => {
    return fetchApi<OrchestrationActionDispatchResult>(
      "/api/orchestrator/dispatch-action",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },

  /**
   * Retrieve chronological audit events for a session.
   */
  listEvents: async (
    sessionId: string,
    limit: number = 50
  ): Promise<OrchestrationEventsResponse> => {
    return fetchApi<OrchestrationEventsResponse>(
      `/api/orchestrator/session/${encodeURIComponent(sessionId)}/events?limit=${limit}`
    );
  },
};
