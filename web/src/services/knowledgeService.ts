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


export interface ProvenanceRecord {
  id: string;
  source_id: string;
  connector: string;
  original_identifier?: string;
  retrieval_timestamp: string;
  extraction_model?: string;
  extraction_prompt_hash?: string;
  human_verification_state: "UNVERIFIED" | "VERIFIED_BY_RESEARCHER" | "DISPUTED";
  superseded_by_id?: string;
  created_at: string;
}

export interface FreshnessReport {
  overall_freshness_score: number;
  stale_count: number;
  aging_count: number;
  fresh_count: number;
  sources_analyzed: number;
  stale_alerts: Array<{
    source_id: string;
    source_title: string;
    age_years: number;
    warning: string;
  }>;
}

export interface ContradictionRecord {
  id: string;
  claim_id: string;
  supporting_evidence_id: string;
  contradicting_evidence_id: string;
  status: "CONTESTED" | "RESOLVED_SUPPORTED" | "RESOLVED_CONTRADICTED" | "DISMISSED";
  investigation_notes: string;
  created_at: string;
  updated_at: string;
}

export interface UnknownItem {
  id: string;
  project_id: string;
  session_id?: string;
  category: "WHAT_WE_KNOW" | "WHAT_WE_THINK" | "WHAT_WE_DONT_KNOW";
  statement: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  linked_claim_id?: string;
  linked_assumption_id?: string;
  resolution_test_id?: string;
  is_resolved?: boolean;
}

export interface UnknownsMapReport {
  project_id: string;
  summary: {
    what_we_know_count: number;
    what_we_think_count: number;
    what_we_dont_know_count: number;
    critical_unknowns_count: number;
  };
  what_we_know: UnknownItem[];
  what_we_think: UnknownItem[];
  what_we_dont_know: UnknownItem[];
}

export interface TraceabilityNode {
  requirement_id: string;
  requirement_text: string;
  category: string;
  lineage: {
    problem?: { id?: string; statement?: string };
    claim?: { id?: string };
    evidence?: { id?: string };
    assumption?: { id?: string };
    decision?: { id?: string };
  };
  created_at: string;
}

// Extended API methods
export const provenanceApi = {
  get: (sourceId: string) => fetchApi<{ provenance: ProvenanceRecord }>(`/api/knowledge/provenance/${sourceId}`),
  record: (data: Partial<ProvenanceRecord>) => fetchApi<{ status: string; provenance: ProvenanceRecord }>("/api/knowledge/provenance", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

export const freshnessApi = {
  get: (projectId?: string) => fetchApi<FreshnessReport>(`/api/knowledge/freshness${projectId ? `?project_id=${projectId}` : ""}`),
};

export const contradictionApi = {
  list: (claimId?: string) => fetchApi<{ contradictions: ContradictionRecord[] }>(`/api/knowledge/contradictions${claimId ? `?claim_id=${claimId}` : ""}`),
  record: (data: { claim_id: string; supporting_evidence_id: string; contradicting_evidence_id: string; investigation_notes?: string }) =>
    fetchApi<{ status: string; contradiction: ContradictionRecord }>("/api/knowledge/contradictions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const unknownsApi = {
  getMap: (projectId?: string) => fetchApi<UnknownsMapReport>(`/api/knowledge/unknowns${projectId ? `?project_id=${projectId}` : ""}`),
  add: (data: Partial<UnknownItem>) => fetchApi<{ status: string; item: UnknownItem }>("/api/knowledge/unknowns", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

export const traceabilityApi = {
  getGraph: (params?: { requirement_id?: string; problem_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.requirement_id) qs.append("requirement_id", params.requirement_id);
    if (params?.problem_id) qs.append("problem_id", params.problem_id);
    return fetchApi<{ count: number; traceability_records: TraceabilityNode[] }>(`/api/traceability/graph?${qs.toString()}`);
  },
  addLink: (data: {
    requirement_id: string;
    requirement_text: string;
    category?: string;
    linked_decision_id?: string;
    linked_assumption_id?: string;
    linked_claim_id?: string;
    linked_evidence_id?: string;
    linked_problem_id?: string;
  }) => fetchApi<{ status: string; traceability_record: any }>("/api/traceability/link", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};
