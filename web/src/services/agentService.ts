import { fetchApi } from "@/lib/api-client";
import { EvidenceCandidate } from "@/lib/types";

export interface ResearchIntelligenceReport {
  query: string;
  sector?: string;
  sources_discovered: number;
  top_papers: Array<{
    title: string;
    doi?: string;
    year?: number;
    venue?: string;
    authors?: string[];
    citations?: number;
    source: string;
  }>;
  synthesized_summary: string;
  macro_statistics: string[];
  evidence_candidates: EvidenceCandidate[];
  contradictions_found: string[];
  recommended_next_queries: string[];
}

export interface CriticalReviewReport {
  problem_statement: string;
  plausibility_score: number;
  verdict: "ROBUST" | "VULNERABLE" | "CRITICAL_FLAWS" | string;
  fatal_kill_question: string;
  status_quo_inertia: string;
  assumption_attacks: string[];
  cognitive_biases_flagged: string[];
  evidence_gaps: string[];
  hardened_reframing: string;
  recommended_field_action: string;
}

export interface ClaimVerificationReport {
  claim_text: string;
  doi?: string;
  citation_valid: boolean;
  verified_source_title?: string;
  verified_venue?: string;
  verification_verdict: "VERIFIED_EMPIRICAL" | "PLAUSIBLE_UNVERIFIED" | "HALLUCINATION_OR_INVALID" | "DIRECTLY_CONTRADICTED" | string;
  evidence_strength: "STRONG" | "MODERATE" | "WEAK" | "CONTRADICTED" | string;
  confidence_score: number;
  methodology_audit: string;
  contradictions: string[];
}

export async function executeResearchAgent(params: {
  query: string;
  sector?: string;
  location?: string;
  limit_per_source?: number;
  connector_ids?: string[];
}): Promise<ResearchIntelligenceReport> {
  return fetchApi<ResearchIntelligenceReport>("/api/agents/research", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function executeCriticAgent(params: {
  problem_statement: string;
  sector?: string;
  target_user?: string;
  current_workaround?: string;
  quantified_impact?: string;
}): Promise<CriticalReviewReport> {
  return fetchApi<CriticalReviewReport>("/api/agents/critic", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function executeVerifierAgent(params: {
  claim_text: string;
  doi?: string;
  source_name?: string;
  supporting_quote?: string;
  context_text?: string;
}): Promise<ClaimVerificationReport> {
  return fetchApi<ClaimVerificationReport>("/api/agents/verifier", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
