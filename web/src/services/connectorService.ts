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
};
