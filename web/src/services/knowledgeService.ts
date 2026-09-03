import { fetchApi } from "@/lib/api-client";

export interface EpistemicBalance {
  claim_id: string;
  epistemic_status: "SUPPORTED" | "CONTRADICTED" | "PARTIALLY_SUPPORTED" | "HYPOTHESIS";
  verdict: string;
  net_score: number;
  normalized_score: number;
  supporting_points: number;
  contradicting_points: number;
  supporting_count: number;
  contradicting_count: number;
  context_count: number;
  links_count: number;
}

export interface ClaimEvidenceLink {
  id: string;
  claim_id: string;
  source_id: number;
  relation_type: "SUPPORTS" | "CONTRADICTS" | "CONTEXTUALIZES" | "FALSIFIES";
  evidence_strength: "STRONG" | "MODERATE" | "WEAK";
  rationale?: string;
  source_name?: string;
  source_url?: string;
  source_tier?: string;
  quote_or_summary?: string;
  created_at: string;
}

export interface AssumptionTest {
  id: string;
  assumption_id: string;
  test_type: "FIELD_INTERVIEW" | "PROTOTYPE_EXPERIMENT" | "SMOKE_TEST" | "DATA_AUDIT";
  target_metric: string;
  actual_result?: string;
  test_status: "PLANNED" | "IN_PROGRESS" | "PASSED" | "FAILED";
  conducted_by?: string;
  completed_at?: string;
  created_at: string;
}

export interface AffectedEntity {
  type: "CLAIM" | "ASSUMPTION" | "DECISION" | "GATE";
  id: string;
  name: string;
  reason: string;
}

export interface ImpactAlert {
  id: string;
  project_id?: string;
  session_id?: string;
  trigger_entity_type: string;
  trigger_entity_id: string;
  trigger_action: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  affected_entities: AffectedEntity[];
  resolution_status: "ACTIVE_ALERT" | "ACKNOWLEDGED" | "RESOLVED_BY_PIVOT";
  created_at: string;
}

export interface EpistemicGraphResponse {
  problem_id: string;
  problem_statement: string;
  sector: string;
  score: number;
  sources: any[];
  claims: any[];
  assumptions: any[];
  total_claims: number;
  total_assumptions: number;
  total_sources: number;
}

export const knowledgeService = {
  async linkClaimEvidence(
    claimId: string,
    payload: {
      source_id: number;
      problem_id: string;
      relation_type?: string;
      evidence_strength?: string;
      rationale?: string;
      session_id?: string;
      project_id?: string;
    }
  ): Promise<{ status: string; link: ClaimEvidenceLink; epistemic_balance: EpistemicBalance; impact_report: any }> {
    return fetchApi(`/api/knowledge/claims/${claimId}/link-evidence`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async deleteClaimLink(linkId: string): Promise<{ status: string; deleted: boolean }> {
    return fetchApi(`/api/knowledge/links/${linkId}`, {
      method: "DELETE",
    });
  },

  async getProblemEpistemicGraph(problemId: string): Promise<EpistemicGraphResponse> {
    return fetchApi(`/api/knowledge/problems/${problemId}/epistemic-graph`);
  },

  async recordAssumptionTest(
    assumptionId: string,
    payload: {
      problem_id: string;
      test_type: string;
      target_metric: string;
      actual_result?: string;
      test_status: string;
      conducted_by?: string;
      session_id?: string;
      project_id?: string;
    }
  ): Promise<{ status: string; test: AssumptionTest; impact_report: any }> {
    return fetchApi(`/api/knowledge/assumptions/${assumptionId}/tests`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async listAssumptionTests(assumptionId: string): Promise<{ assumption_id: string; tests: AssumptionTest[] }> {
    return fetchApi(`/api/knowledge/assumptions/${assumptionId}/tests`);
  },

  async getActiveImpactAlerts(params?: {
    session_id?: string;
    project_id?: string;
  }): Promise<{ count: number; alerts: ImpactAlert[] }> {
    const query = new URLSearchParams();
    if (params?.session_id) query.append("session_id", params.session_id);
    if (params?.project_id) query.append("project_id", params.project_id);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return fetchApi(`/api/knowledge/impact-alerts${qs}`);
  },

  async acknowledgeImpactAlert(
    alertId: string,
    resolutionStatus: "RESOLVED_BY_PIVOT" | "ACKNOWLEDGED" = "ACKNOWLEDGED"
  ): Promise<{ status: string; resolved: boolean }> {
    return fetchApi(`/api/knowledge/impact-alerts/${alertId}/acknowledge`, {
      method: "POST",
      body: JSON.stringify({ resolution_status: resolutionStatus }),
    });
  },
};
