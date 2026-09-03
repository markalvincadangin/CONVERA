import { fetchApi } from "@/lib/api-client";
import { LiteratureRow, ResearchGapItem } from "@/components/research/LiteratureMatrixTable";
import { ProblemRecord } from "@/lib/types";

export interface LiteratureMatrixResponse {
  matrix_rows: LiteratureRow[];
  total_studies: number;
  synthesized_gaps: ResearchGapItem[];
  timestamp: string;
}

export interface StageADiscoverResponse {
  status: string;
  raw_output: string;
  discovered_problems: ProblemRecord[];
  domains: string[];
  count: number;
}

export const researchService = {
  generateMatrix: async (query: string, limit: number = 8, projectId?: string): Promise<LiteratureMatrixResponse> => {
    return fetchApi<LiteratureMatrixResponse>("/api/research/matrix/generate", {
      method: "POST",
      body: JSON.stringify({ query, limit, project_id: projectId || "default_proj" }),
    });
  },

  synthesizeGaps: async (query: string, matrixRows?: LiteratureRow[]): Promise<{ query: string; gaps: ResearchGapItem[]; count: number }> => {
    return fetchApi<{ query: string; gaps: ResearchGapItem[]; count: number }>("/api/research/gaps/synthesize", {
      method: "POST",
      body: JSON.stringify({ query, matrix_rows: matrixRows }),
    });
  },

  discoverStageA: async (payload: {
    domains: string[];
    field_observations?: string;
    session_id?: string;
    project_id?: string;
  }): Promise<StageADiscoverResponse> => {
    return fetchApi<StageADiscoverResponse>("/api/research/stage-a/discover", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};