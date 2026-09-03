export interface ResearchDomainRecord {
  id: string;
  project_id?: string | null;
  title: string;
  domain_type: "Sector" | "Cross-cutting" | "Specialized" | "Custom";
  description?: string;
  scope_boundary?: string;
  related_domain_ids?: string;
  why_explore?: string;
  context_setting?: string;
  stakeholders?: string;
  processes_to_explore?: string;
  evidence_basis?: string;
  sdg_relevance?: string;
  initial_concerns?: string;
  next_action?: string;
  is_custom?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ListDomainsResponse {
  status: string;
  count: number;
  domains: ResearchDomainRecord[];
}

﻿import { fetchApi } from "@/lib/api-client";
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

  listDomains: async (params?: { project_id?: string; domain_type?: string; search?: string }): Promise<ListDomainsResponse> => {
    const qs = new URLSearchParams();
    if (params?.project_id) qs.set("project_id", params.project_id);
    if (params?.domain_type && params.domain_type !== "ALL") qs.set("domain_type", params.domain_type);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString();
    return fetchApi<ListDomainsResponse>(`/api/research/domains${query ? `?${query}` : ""}`);
  },

  getDomain: async (domainId: string): Promise<{ status: string; domain: ResearchDomainRecord }> => {
    return fetchApi<{ status: string; domain: ResearchDomainRecord }>(`/api/research/domains/${domainId}`);
  },

  createDomain: async (domain: Partial<ResearchDomainRecord>): Promise<{ status: string; domain: ResearchDomainRecord }> => {
    return fetchApi<{ status: string; domain: ResearchDomainRecord }>("/api/research/domains", {
      method: "POST",
      body: JSON.stringify(domain),
    });
  },

  updateDomain: async (domainId: string, updates: Partial<ResearchDomainRecord>): Promise<{ status: string; domain: ResearchDomainRecord }> => {
    return fetchApi<{ status: string; domain: ResearchDomainRecord }>(`/api/research/domains/${domainId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  deleteDomain: async (domainId: string): Promise<{ status: string; deleted: boolean; domain_id: string }> => {
    return fetchApi<{ status: string; deleted: boolean; domain_id: string }>(`/api/research/domains/${domainId}`, {
      method: "DELETE",
    });
  },
};