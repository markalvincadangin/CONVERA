/**
 * CONVERA Cross-Stage Research Critique & Blind-Spot Service (SDD-019)
 * ====================================================================
 * Client service for cross-stage tension evaluation, consistency scoring,
 * and Article IV human sovereignty critique resolution.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

import { fetchApi } from "@/lib/api-client";
import type {
  CrossStageCritiqueRecord,
  CritiqueEvaluationRequest,
  CritiqueEvaluationResponse,
  ResolveCritiqueRequest,
} from "@/types/critique";

export * from "@/types/critique";

export const critiqueService = {
  /**
   * Evaluates cross-stage contradictions and blind spots across Stages A, C, D, E, F.
   */
  evaluateCritique: async (
    request: CritiqueEvaluationRequest
  ): Promise<CritiqueEvaluationResponse> => {
    const res = await fetchApi<{ status: string; evaluation: CritiqueEvaluationResponse }>(
      "/api/critique/evaluate",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    return res.evaluation;
  },

  /**
   * Retrieves all persisted critique records and live consistency score for a session.
   */
  getSessionCritiques: async (
    sessionId: string,
    projectId?: string,
    status?: string
  ): Promise<CritiqueEvaluationResponse> => {
    const params = new URLSearchParams();
    if (projectId) params.append("project_id", projectId);
    if (status) params.append("status", status);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetchApi<{
      status: string;
      session_id: string;
      consistency_score: number;
      total_critiques: number;
      open_critiques: number;
      fatal_count: number;
      critical_count: number;
      warning_count: number;
      advisory_count: number;
      critiques: CrossStageCritiqueRecord[];
    }>(`/api/critique/session/${encodeURIComponent(sessionId)}${query}`);

    return {
      session_id: res.session_id,
      consistency_score: res.consistency_score,
      total_critiques: res.total_critiques,
      open_critiques: res.open_critiques,
      fatal_count: res.fatal_count,
      critical_count: res.critical_count,
      warning_count: res.warning_count,
      advisory_count: res.advisory_count,
      critiques: res.critiques,
      evaluated_at: new Date().toISOString(),
      is_degraded: false,
    };
  },

  /**
   * Resolves or dismisses a critique with mandatory human rationale (INV-019-03).
   */
  resolveCritique: async (
    request: ResolveCritiqueRequest
  ): Promise<CrossStageCritiqueRecord> => {
    const res = await fetchApi<{ status: string; critique: CrossStageCritiqueRecord }>(
      "/api/critique/resolve",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    return res.critique;
  },
};
