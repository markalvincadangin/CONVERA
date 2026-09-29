import { EvidenceCandidate, NormalizedScholarlyWork, IngestedDocumentResult } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface SimilarityMatch {
  problem_id: string;
  problem_statement: string;
  sector?: string;
  similarity_score: number;
  verdict: "DUPLICATE" | "POTENTIALLY_SIMILAR" | "UNIQUE";
  shared_keywords: string[];
  explanation: string;
  suggested_action: "MERGE" | "LINK_AS_RELATED" | "KEEP_SEPARATE";
}

export interface SimilarityCheckResult {
  candidate_id: string;
  candidate_statement: string;
  overall_verdict: "DUPLICATE" | "POTENTIALLY_SIMILAR" | "UNIQUE";
  is_unique: boolean;
  top_similarity_score: number;
  matches: SimilarityMatch[];
  recommendation: string;
}

export const connectorService = {
  /**
   * List all registered research and tool connectors.
   */
  async listConnectors(): Promise<{ connector_id: string; display_name: string; capabilities: string[] }[]> {
    try {
      const res = await fetch(`${API_BASE}/api/connectors`);
      if (!res.ok) throw new Error("Failed to fetch connectors");
      const data = await res.json();
      return data.connectors || [];
    } catch (err) {
      console.warn("Using fallback connector list:", err);
      return [
        { connector_id: "openalex", display_name: "OpenAlex Scholarly Graph", capabilities: ["SEARCH", "FETCH_BY_ID", "CITATIONS", "TOPICS"] },
        { connector_id: "semantic_scholar", display_name: "Semantic Scholar Academic Graph", capabilities: ["SEARCH", "FETCH_BY_ID", "INFLUENTIAL_CITATIONS"] },
        { connector_id: "crossref", display_name: "Crossref DOI Resolver", capabilities: ["SEARCH", "FETCH_BY_ID", "DOI_RESOLUTION"] },
        { connector_id: "pubmed", display_name: "PubMed (National Library of Medicine)", capabilities: ["SEARCH", "FETCH_BY_ID", "PROVENANCE"] },
      ];
    }
  },

  /**
   * Perform federated scholarly search across academic connectors.
   */
  async searchScholarly(
    query: string,
    limitPerSource: number = 5,
    connectorIds?: string[]
  ): Promise<NormalizedScholarlyWork[]> {
    const res = await fetch(`${API_BASE}/api/connectors/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        limit_per_source: limitPerSource,
        connector_ids: connectorIds,
      }),
    });
    if (!res.ok) throw new Error("Scholarly search failed");
    const data = await res.json();
    return data.results || [];
  },

  /**
   * Ingest raw unstructured text, interview transcripts, or notes into structured claims and evidence.
   */
  async ingestDocument(
    rawContent: string,
    sourceName: string = "Research Inbox Note",
    authorityTier: string = "FIELD_INTERVIEW",
    sourceUrl?: string,
    doi?: string
  ): Promise<IngestedDocumentResult> {
    const res = await fetch(`${API_BASE}/api/inbox/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_content: rawContent,
        source_name: sourceName,
        authority_tier: authorityTier,
        source_url: sourceUrl,
        doi: doi,
      }),
    });
    if (!res.ok) throw new Error("Document ingestion failed");
    return await res.json();
  },

  /**
   * Check a candidate statement against existing Problem Bank items to detect duplicates/similarities.
   */
  async checkSimilarity(
    problemStatement: string,
    sector?: string,
    candidateId: string = "CANDIDATE"
  ): Promise<SimilarityCheckResult> {
    const res = await fetch(`${API_BASE}/api/similarity/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problem_statement: problemStatement,
        sector: sector,
        candidate_id: candidateId,
      }),
    });
    if (!res.ok) throw new Error("Similarity check failed");
    return await res.json();
  },

  /**
   * Check connectivity and latency status of registered academic connectors.
   */
  async checkConnectorsHealth(): Promise<{ status: string; connectors: Record<string, { healthy: boolean; latency_ms?: number; error?: string }> }> {
    try {
      const res = await fetch(`${API_BASE}/api/connectors/health`);
      if (!res.ok) throw new Error("Health check failed");
      return await res.json();
    } catch (err: any) {
      return {
        status: "DEGRADED",
        connectors: {
          openalex: { healthy: false, error: err.message },
          semantic_scholar: { healthy: false, error: err.message },
        },
      };
    }
  },

  /**
   * Ingest a scholarly paper into CONVERA as an official Problem Source.
   */
  async ingestScholarlyWork(params: {
    problem_id: string;
    scholarly_work_id?: string;
    work_payload?: Partial<NormalizedScholarlyWork>;
    source_tier?: string;
    evidence_type?: string;
    quote_or_summary?: string;
  }): Promise<{ status: string; source_id: string; scholarly_work_id: string; message: string }> {
    const res = await fetch(`${API_BASE}/api/connectors/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to ingest scholarly work");
    }
    return await res.json();
  },

  /**
   * Link an ingested problem source to a problem claim as supporting or contradictory evidence.
   */
  async linkClaimEvidence(params: {
    claim_id: string;
    source_id: string;
    relation_type?: "SUPPORTS" | "CONTRADICTS" | "CONTEXTUALIZES";
    evidence_strength?: number;
    rationale?: string;
  }): Promise<{ status: string; link_id: string; claim_id: string; source_id: string; relation_type: string; evidence_strength: number }> {
    const res = await fetch(`${API_BASE}/api/connectors/link-claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to link claim evidence");
    }
    return await res.json();
  },

  /**
   * Get all ingested sources and their linked claims for a problem.
   */
  async getProblemSources(problemId: string): Promise<{
    problem_id: string;
    sources_count: number;
    sources: Array<{
      id: string;
      problem_id: string;
      source_tier: string;
      evidence_type: string;
      quote_or_summary?: string;
      scholarly_work_id?: string;
      doi?: string;
      title?: string;
      authors?: string[];
      year?: number;
      citation_count?: number;
      is_open_access?: boolean;
      open_access_url?: string;
      venue?: string;
      claim_links?: Array<{
        claim_id: string;
        relation_type: string;
        evidence_strength: number;
        rationale?: string;
      }>;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/api/connectors/problem/${encodeURIComponent(problemId)}/sources`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch problem sources");
    }
    return await res.json();
  },

  /**
   * Get all claims for a given problem.
   */
  async getProblemClaims(problemId: string): Promise<{
    problem_id: string;
    count: number;
    claims: Array<{
      id: string;
      problem_id: string;
      claim_type: string;
      claim_text: string;
      status: string;
      confidence_score?: number;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/api/connectors/problem/${encodeURIComponent(problemId)}/claims`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch problem claims");
    }
    return await res.json();
  },
};

