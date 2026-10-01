/**
 * CONVERA DSR Deliverable & Comprehensive Proposal Export Service (SDD-020)
 * =========================================================================
 * Client service for multi-format proposal compilation, BibTeX export,
 * and standalone printable HTML generation.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

import { fetchApi } from "@/lib/api-client";
import type {
  ExportFormat,
  DSRProposalCompilationRequest,
  DSRProposalCompilationResponse,
} from "@/types/export";

export * from "@/types/export";

export const exportService = {
  /**
   * Compiles the proposal into the requested format (Markdown, LaTeX, BibTeX, HTML, JSON, or Bundle).
   */
  compileProposal: async (
    request: DSRProposalCompilationRequest
  ): Promise<DSRProposalCompilationResponse> => {
    return await fetchApi<DSRProposalCompilationResponse>("/api/export/compile", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Fetches proposal export using query parameters.
   */
  fetchProposalExport: async (
    projectId: string = "default_proj",
    sessionId?: string | null,
    problemId?: string | null,
    format: ExportFormat = "MARKDOWN"
  ): Promise<DSRProposalCompilationResponse> => {
    const params = new URLSearchParams();
    params.append("project_id", projectId);
    if (sessionId) params.append("session_id", sessionId);
    if (problemId) params.append("problem_id", problemId);
    params.append("format", format);

    return await fetchApi<DSRProposalCompilationResponse>(
      `/api/export/dsr-proposal?${params.toString()}`
    );
  },

  /**
   * Retrieves raw BibTeX string directly.
   */
  fetchBibtex: async (
    projectId: string = "default_proj",
    sessionId?: string | null,
    problemId?: string | null
  ): Promise<string> => {
    const params = new URLSearchParams();
    params.append("project_id", projectId);
    if (sessionId) params.append("session_id", sessionId);
    if (problemId) params.append("problem_id", problemId);

    const res = await fetch(`/api/export/bibtex?${params.toString()}`);
    return await res.text();
  },
};
