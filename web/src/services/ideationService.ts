/**
 * CONVERA DSR Artifact Ideation Service (SDD-016)
 * ===============================================
 * TypeScript client for Design Science Research (DSR) artifact formulation.
 * Implements March & Smith (1995) 4-artifact taxonomy (Construct, Model, Method, Instantiation).
 */

import { fetchApi } from "@/lib/api-client";

export type DSRArtifactClass = "CONSTRUCT" | "MODEL" | "METHOD" | "INSTANTIATION";

export type DSRArtifactStatus = "PROPOSED" | "SELECTED" | "REFUTED" | "ARCHIVED";

export interface DSRArtifact {
  id: string;
  problem_id: string;
  session_id?: string | null;
  title: string;
  dsr_class: DSRArtifactClass;
  description: string;
  kernel_theory: string;
  targeted_gap_ids: string[];
  linked_claim_ids: string[];
  formal_specification?: string | null;
  simpler_baseline_alternative?: string | null;
  contextual_constraints: string[];
  feasibility_score: number;
  novelty_score: number;
  status: DSRArtifactStatus;
  provenance: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IdeationGenerationRequest {
  problem_id: string;
  session_id?: string | null;
  classes?: DSRArtifactClass[];
  prompt_guidance?: string;
  max_candidates_per_class?: number;
}

export interface IdeationGenerationResponse {
  problem_id: string;
  generated_artifacts: DSRArtifact[];
  total_generated: number;
  kernel_theories_explored: string[];
  baseline_alternatives_considered: string[];
}

export interface DSRArtifactCreatePayload {
  problem_id: string;
  session_id?: string | null;
  title: string;
  dsr_class: DSRArtifactClass;
  description: string;
  kernel_theory: string;
  targeted_gap_ids?: string[];
  linked_claim_ids?: string[];
  formal_specification?: string | null;
  simpler_baseline_alternative?: string | null;
  contextual_constraints?: string[];
  feasibility_score?: number;
  novelty_score?: number;
  status?: DSRArtifactStatus;
  provenance?: Record<string, any>;
}

export interface DSRArtifactUpdatePayload {
  title?: string;
  description?: string;
  kernel_theory?: string;
  targeted_gap_ids?: string[];
  linked_claim_ids?: string[];
  formal_specification?: string | null;
  simpler_baseline_alternative?: string | null;
  contextual_constraints?: string[];
  feasibility_score?: number;
  novelty_score?: number;
  status?: DSRArtifactStatus;
  provenance?: Record<string, any>;
}

export const ideationService = {
  /**
   * Generates candidate DSR artifacts across the 4 canonical classes.
   */
  generateCandidates: async (
    request: IdeationGenerationRequest
  ): Promise<IdeationGenerationResponse> => {
    return fetchApi<IdeationGenerationResponse>("/api/ideation/generate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Lists all candidate and selected DSR artifacts for a problem.
   */
  listArtifacts: async (
    problemId: string,
    dsrClass?: DSRArtifactClass
  ): Promise<DSRArtifact[]> => {
    const query = dsrClass ? `?dsr_class=${encodeURIComponent(dsrClass)}` : "";
    return fetchApi<DSRArtifact[]>(
      `/api/ideation/problem/${encodeURIComponent(problemId)}/artifacts${query}`
    );
  },

  /**
   * Manually creates a researcher-authored DSR candidate artifact.
   */
  createArtifact: async (
    payload: DSRArtifactCreatePayload
  ): Promise<DSRArtifact> => {
    return fetchApi<DSRArtifact>("/api/ideation/artifacts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Retrieves a specific DSR artifact by ID.
   */
  getArtifact: async (artifactId: string): Promise<DSRArtifact> => {
    return fetchApi<DSRArtifact>(
      `/api/ideation/artifacts/${encodeURIComponent(artifactId)}`
    );
  },

  /**
   * Updates an artifact's attributes or lifecycle status (e.g., SELECTing as thesis contribution).
   */
  updateArtifact: async (
    artifactId: string,
    updates: DSRArtifactUpdatePayload
  ): Promise<DSRArtifact> => {
    return fetchApi<DSRArtifact>(
      `/api/ideation/artifacts/${encodeURIComponent(artifactId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      }
    );
  },

  /**
   * Deletes a candidate artifact.
   */
  deleteArtifact: async (
    artifactId: string
  ): Promise<{ success: boolean; id: string }> => {
    return fetchApi<{ success: boolean; id: string }>(
      `/api/ideation/artifacts/${encodeURIComponent(artifactId)}`,
      {
        method: "DELETE",
      }
    );
  },
};
