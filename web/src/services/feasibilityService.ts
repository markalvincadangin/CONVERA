/**
 * CONVERA Feasibility & Proposal Canvas Service (SDD-018)
 * =======================================================
 * TypeScript client for Stage F Ethics Compliance, SDG/DOST Alignment,
 * Resource Budgeting, Living Proposal Canvas, and Attributable Mentor Sign-off.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

import { fetchApi } from "@/lib/api-client";
import type {
  FeasibilityRecord,
  FeasibilityEvaluationRequest,
  ProposalCompilationRequest,
  DSRProposalMonograph,
  MentorSignoffRequest,
  MentorSignoffRecord,
} from "@/types/feasibility";

export * from "@/types/feasibility";

export const feasibilityService = {
  /**
   * Evaluates RA 10173 data privacy compliance, IRB status, SDG/DOST alignments,
   * budget feasibility, and non-authoritative AI advisory critique.
   */
  evaluateFeasibility: async (
    request: FeasibilityEvaluationRequest
  ): Promise<FeasibilityRecord> => {
    const res = await fetchApi<{ status: string; feasibility: FeasibilityRecord }>(
      "/api/feasibility/evaluate",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    return res.feasibility;
  },

  /**
   * Retrieves the stored Stage F feasibility record for a given research session.
   */
  getFeasibilityRecord: async (
    sessionId: string
  ): Promise<FeasibilityRecord | null> => {
    const res = await fetchApi<{ status: string; feasibility: FeasibilityRecord | null }>(
      `/api/feasibility/session/${encodeURIComponent(sessionId)}`
    );
    return res.feasibility;
  },

  /**
   * Compiles live relational project knowledge across all 6 stages of the Computing
   * Research Track into a publication-ready DSR Thesis/Capstone Proposal Monograph.
   */
  compileDSRProposal: async (
    request: ProposalCompilationRequest
  ): Promise<DSRProposalMonograph> => {
    const res = await fetchApi<{ status: string; proposal: DSRProposalMonograph }>(
      "/api/feasibility/compile-proposal",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    return res.proposal;
  },

  /**
   * Records an attributable human advisor or committee defense sign-off (Article IV).
   */
  submitMentorSignoff: async (
    request: MentorSignoffRequest
  ): Promise<MentorSignoffRecord> => {
    const res = await fetchApi<{ status: string; signoff: MentorSignoffRecord }>(
      "/api/feasibility/mentor-signoff",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    return res.signoff;
  },

  /**
   * Lists all historical human mentor/advisor sign-offs for a given project.
   */
  listMentorSignoffs: async (
    projectId: string
  ): Promise<MentorSignoffRecord[]> => {
    const res = await fetchApi<{ status: string; signoffs: MentorSignoffRecord[] }>(
      `/api/feasibility/mentor-signoff/${encodeURIComponent(projectId)}`
    );
    return res.signoffs || [];
  },
};
