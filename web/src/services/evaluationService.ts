/**
 * CONVERA Concept Evaluation Service (SDD-017)
 * ============================================
 * TypeScript client for multi-criteria concept evaluation and candidate comparison.
 * Implements 7-dimension deterministic rubric scoring and advisory AI critique.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

import { fetchApi } from "@/lib/api-client";
import type {
  ConceptEvaluationRecord,
  ConceptComparisonResult,
  ConceptEvaluationRequest,
  ConceptComparisonRequest,
  HumanReviewRequest,
} from "@/types/evaluation";

export * from "@/types/evaluation";

export const evaluationService = {
  /**
   * Evaluates a single candidate concept against the 7-dimension rubric.
   */
  evaluateConcept: async (
    request: ConceptEvaluationRequest
  ): Promise<ConceptEvaluationRecord> => {
    return fetchApi<ConceptEvaluationRecord>("/api/evaluations/evaluate-concept", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Compares multiple candidate concepts, producing rank ordering and a trade-off matrix.
   */
  compareConcepts: async (
    request: ConceptComparisonRequest
  ): Promise<ConceptComparisonResult> => {
    return fetchApi<ConceptComparisonResult>("/api/evaluations/compare-concepts", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Retrieves evaluation history for a specific concept.
   */
  getConceptEvaluations: async (
    conceptId: string
  ): Promise<ConceptEvaluationRecord[]> => {
    return fetchApi<ConceptEvaluationRecord[]>(
      `/api/evaluations/concept/${encodeURIComponent(conceptId)}`
    );
  },

  /**
   * Retrieves all concept evaluations for a session.
   */
  getSessionEvaluations: async (
    sessionId: string
  ): Promise<ConceptEvaluationRecord[]> => {
    return fetchApi<ConceptEvaluationRecord[]>(
      `/api/evaluations/session/${encodeURIComponent(sessionId)}`
    );
  },

  /**
   * Submits human expert review overrides or sign-offs on a concept evaluation (Article IV).
   */
  submitHumanReview: async (
    payload: HumanReviewRequest
  ): Promise<ConceptEvaluationRecord> => {
    return fetchApi<ConceptEvaluationRecord>("/api/evaluations/human-review", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
