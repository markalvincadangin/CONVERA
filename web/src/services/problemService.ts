import { fetchApi } from "@/lib/api-client";
import {
  ProblemRecord,
  DevilsAdvocateReport,
  ScoreBreakdown,
  BlindSpotAnalysis,
  KnowledgeGraphData,
  ClaimRecord,
  AssumptionRecord,
  ClaimStatus,
  DecisionRecord,
  DecisionSynthesis,
} from "@/lib/types";

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

  async synthesizeDecisionRoom(candidateIds: string[]): Promise<{ status: string; synthesis: DecisionSynthesis }> {
    return fetchApi<{ status: string; synthesis: DecisionSynthesis }>(`/api/decisions/synthesize`, {
      method: "POST",
      body: JSON.stringify({ candidate_ids: candidateIds }),
    });
  },

  async commitDecision(params: {
    session_id?: string;
    stage?: string;
    selected_problem_id: string;
    rejected_problem_ids: string[];
    decision_rationale: string;
    supporting_evidence_ids?: string[];
  }): Promise<{ status: string; decision_record: DecisionRecord }> {
    return fetchApi<{ status: string; decision_record: DecisionRecord }>(`/api/decisions/commit`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  async executePivot(params: {
    session_id: string;
    current_problem_id: string;
    pivot_reason: string;
    invalidated_assumption_id?: string;
    author?: string;
  }): Promise<{ status: string; message: string; decision_record: DecisionRecord }> {
    return fetchApi<{ status: string; message: string; decision_record: DecisionRecord }>(`/api/decisions/pivot`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  async listDecisions(sessionId?: string): Promise<{ status: string; decisions: DecisionRecord[] }> {
    const q = sessionId ? `?session_id=${sessionId}` : "";
    return fetchApi<{ status: string; decisions: DecisionRecord[] }>(`/api/decisions${q}`);
  },

  async getKnowledgeGraph(id: string): Promise<{ status: string; knowledge_graph: KnowledgeGraphData }> {
    return fetchApi<{ status: string; knowledge_graph: KnowledgeGraphData }>(`/api/problems/${id}/knowledge-graph`);
  },

  async generateAssumptions(id: string, mode: "COMMERCIAL" | "CIVIC_INSTITUTIONAL" = "COMMERCIAL"): Promise<{ status: string; knowledge_graph: KnowledgeGraphData }> {
    return fetchApi<{ status: string; knowledge_graph: KnowledgeGraphData }>(`/api/problems/${id}/generate-assumptions`, {
      method: "POST",
      body: JSON.stringify({ mode }),
    });
  },

  async updateClaim(
    problemId: string,
    claimId: string,
    status: ClaimStatus,
    confidenceScore?: number,
    evidenceNotes?: string
  ): Promise<{ status: string; claim: ClaimRecord }> {
    return fetchApi<{ status: string; claim: ClaimRecord }>(`/api/problems/${problemId}/claims/${claimId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, confidence_score: confidenceScore, evidence_notes: evidenceNotes }),
    });
  },

  async updateAssumption(
    problemId: string,
    assumptionId: string,
    status: string
  ): Promise<{ status: string; assumption: AssumptionRecord }> {
    return fetchApi<{ status: string; assumption: AssumptionRecord }>(`/api/problems/${problemId}/assumptions/${assumptionId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async archiveProblem(id: string, reason: string, author?: string): Promise<{ status: string; problem: ProblemRecord }> {
    return fetchApi<{ status: string; problem: ProblemRecord }>(`/api/problems/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ reason, author }),
    });
  },

  async restoreProblem(id: string): Promise<{ status: string; problem: ProblemRecord }> {
    return fetchApi<{ status: string; problem: ProblemRecord }>(`/api/problems/${id}/restore`, {
      method: "POST",
    });
  },

  async deleteProblem(id: string): Promise<{ status: string; deleted: boolean }> {
    return fetchApi<{ status: string; deleted: boolean }>(`/api/problems/${id}`, {
      method: "DELETE",
    });
  },

  async voteProblem(id: string, voteType: "up" | "down" = "up"): Promise<{ status: string; problem: ProblemRecord }> {
    return fetchApi<{ status: string; problem: ProblemRecord }>(`/api/problems/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote_type: voteType }),
    });
  },

  async getScoreBreakdown(id: string): Promise<ScoreBreakdown> {
    return fetchApi<ScoreBreakdown>(`/api/problems/${id}/score-breakdown`);
  },

  
  
  async detectDuplicates(projectId?: string): Promise<{ status: string; duplicates: any[] }> {
    const qs = projectId ? `?project_id=${projectId}` : "";
    return fetchApi<{ status: string; duplicates: any[] }>(`/api/problems/detect-duplicates${qs}`);
  },

    async seedStarterProblems(projectId: string): Promise<{ status: string; seeded_count: number; problems: ProblemRecord[] }> {
    return fetchApi<{ status: string; seeded_count: number; problems: ProblemRecord[] }>("/api/problems/seed-starter", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId }),
    });
  },

  async autoMergeExact(projectId?: string): Promise<{ status: string; merged_count: number; problems: ProblemRecord[] }> {
    return fetchApi<{ status: string; merged_count: number; problems: ProblemRecord[] }>("/api/problems/auto-merge-exact", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId }),
    });
  },

  async reindexIds(projectId?: string): Promise<{ status: string; count: number; problems: ProblemRecord[] }> {
    return fetchApi<{ status: string; count: number; problems: ProblemRecord[] }>("/api/problems/reindex-ids", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId }),
    });
  },

  async mergeProblems(primaryId: string, duplicateIds: string[]): Promise<{ status: string; problem: ProblemRecord }> {
    return fetchApi<{ status: string; problem: ProblemRecord }>("/api/problems/merge", {
      method: "POST",
      body: JSON.stringify({ primary_id: primaryId, duplicate_ids: duplicateIds }),
    });
  },

  async bulkDelete(problemIds: string[]): Promise<{ status: string; deleted_count: number }> {
    return fetchApi<{ status: string; deleted_count: number }>("/api/problems/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ problem_ids: problemIds }),
    });
  },

  async challengeProblem(id: string): Promise<{ status: string; critique: DevilsAdvocateReport }> {
    return fetchApi<{ status: string; critique: DevilsAdvocateReport }>(`/api/problems/${id}/challenge`, {
      method: "POST",
    });
  },

  async challengeCustomProblem(payload: Partial<ProblemRecord>): Promise<{ status: string; critique: DevilsAdvocateReport }> {
    return fetchApi<{ status: string; critique: DevilsAdvocateReport }>("/api/problems/challenge-custom", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async detectBlindSpots(projectId?: string): Promise<{ status: string; analysis: BlindSpotAnalysis }> {
    const qs = projectId ? `?project_id=${projectId}` : "";
    return fetchApi<{ status: string; analysis: BlindSpotAnalysis }>(`/api/problems/blind-spots${qs}`, {
      method: "POST",
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

  async queryResearch(query: string, engine: string = "ALL", limit: number = 5): Promise<any> {
    const connectorIds = engine && engine !== "ALL" ? [engine.toLowerCase()] : undefined;
    return fetchApi<any>("/api/connectors/search", {
      method: "POST",
      body: JSON.stringify({
        query,
        limit_per_source: limit,
        connector_ids: connectorIds,
      }),
    });
  },

  async autoResearchProblem(problemId: string): Promise<{ status: string; problem_id: string; results: any }> {
    return fetchApi<{ status: string; problem_id: string; results: any }>(`/api/problems/${problemId}/auto-research`, {
      method: "POST",
    });
  },

  async attachSources(problemId: string, sources: any[]): Promise<{ status: string; problem_id: string; added_count: number; total_sources_count: number; problem: ProblemRecord; breakdown: ScoreBreakdown }> {
    return fetchApi<{ status: string; problem_id: string; added_count: number; total_sources_count: number; problem: ProblemRecord; breakdown: ScoreBreakdown }>(`/api/problems/${problemId}/attach-sources`, {
      method: "POST",
      body: JSON.stringify({ sources }),
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
