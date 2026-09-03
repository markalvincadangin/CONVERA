import { fetchApi } from "@/lib/api-client";
import { ProblemRecord } from "@/lib/types";

export interface ListProblemsParams {
  project_id?: string;
  sector?: string;
  evidence_tier?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const problemService = {
  async listProblems(params: ListProblemsParams = {}): Promise<ProblemRecord[]> {
    const query = new URLSearchParams();
    if (params.project_id) query.set("project_id", params.project_id);
    if (params.sector && params.sector !== "All") query.set("sector", params.sector);
    if (params.evidence_tier && params.evidence_tier !== "All") query.set("evidence_tier", params.evidence_tier);
    if (params.status && params.status !== "All") query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));

    const qs = query.toString();
    const endpoint = `/api/problems${qs ? `?${qs}` : ""}`;
    return fetchApi<ProblemRecord[]>(endpoint);
  },

  async getProblem(id: string): Promise<ProblemRecord> {
    return fetchApi<ProblemRecord>(`/api/problems/${id}`);
  },

  async createProblem(data: Partial<ProblemRecord>): Promise<{ status: string; problem: ProblemRecord }> {
    return fetchApi<{ status: string; problem: ProblemRecord }>("/api/problems", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateProblem(id: string, updates: Partial<ProblemRecord>): Promise<{ status: string; problem: ProblemRecord }> {
    return fetchApi<{ status: string; problem: ProblemRecord }>(`/api/problems/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteProblem(id: string): Promise<{ status: string; deleted: boolean }> {
    return fetchApi<{ status: string; deleted: boolean }>(`/api/problems/${id}`, {
      method: "DELETE",
    });
  },

  async enrichManualNote(rawNote: string, projectId?: string, sessionId?: string): Promise<{ status: string; problem: Partial<ProblemRecord> }> {
    return fetchApi<{ status: string; problem: Partial<ProblemRecord> }>("/api/problems/enrich", {
      method: "POST",
      body: JSON.stringify({
        raw_note: rawNote,
        project_id: projectId,
        session_id: sessionId,
      }),
    });
  },

  async parsePhase1Markdown(markdown: string, sessionId?: string, projectId?: string): Promise<{ status: string; count: number; problems: ProblemRecord[] }> {
    return fetchApi<{ status: string; count: number; problems: ProblemRecord[] }>("/api/problems/parse-phase1", {
      method: "POST",
      body: JSON.stringify({
        markdown,
        session_id: sessionId,
        project_id: projectId,
      }),
    });
  },
};
