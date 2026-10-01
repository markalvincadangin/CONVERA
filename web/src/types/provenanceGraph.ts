/**
 * CONVERA Provenance Graph Types (SDD-022)
 * ========================================
 * Epistemic data model for multi-tier evidence chain DAG visualization.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

export enum EpistemicTier {
  TIER_0_SOURCE = 0,
  TIER_1_CLAIM = 1,
  TIER_2_ASSUMPTION = 2,
  TIER_3_DSR_ARTIFACT = 3,
  TIER_4_CONCEPT_EVAL = 4,
  TIER_5_FEASIBILITY = 5,
}

export type ProvenanceNodeType =
  | "scholarly_work"
  | "empirical_claim"
  | "research_assumption"
  | "dsr_artifact"
  | "concept_evaluation"
  | "feasibility_proposal";

export type ProvenanceEdgeType =
  | "supports"
  | "contradicts"
  | "extends"
  | "derives"
  | "grounds"
  | "evaluates"
  | "synthesizes";

export interface ProvenanceNode {
  id: string;
  type: ProvenanceNodeType;
  tier: number; // 0 to 5
  label: string;
  description?: string | null;
  stage_id: string; // "stage_a" .. "stage_f"
  confidence_score: number; // 0.0 to 1.0
  status: string; // "active" | "validated" | "contradicted" | "hypothetical"
  doi?: string | null;
  year?: number | null;
  authors?: string[];
  citation_count?: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProvenanceEdge {
  id: string;
  source: string;
  target: string;
  edge_type: ProvenanceEdgeType;
  weight: number;
  is_contradiction: boolean;
  evidence_excerpt?: string | null;
  metadata: Record<string, unknown>;
}

export interface ProvenanceMetrics {
  total_nodes: number;
  total_edges: number;
  tier_distribution: Record<number, number>;
  contradiction_count: number;
  average_confidence: number;
  grounded_artifacts_ratio: number;
  orphaned_nodes_count: number;
}

export interface ProvenanceGraphPayload {
  session_id: string;
  nodes: ProvenanceNode[];
  edges: ProvenanceEdge[];
  metrics: ProvenanceMetrics;
  state_hash: string;
  generated_at: string;
}

export interface ProvenanceFilterQuery {
  session_id: string;
  min_confidence?: number;
  stages?: string[];
  tiers?: number[];
  include_orphans?: boolean;
  search_term?: string;
}

export interface NodeLineageResponse {
  node: ProvenanceNode;
  ancestor_ids: string[];
  descendant_ids: string[];
  ancestors: ProvenanceNode[];
  descendants: ProvenanceNode[];
}

/**
 * Geometric layout models calculated for SVG canvas rendering
 */
export interface LayoutNode extends ProvenanceNode {
  x: number;
  y: number;
  width: number;
  height: number;
  column: number;
  rowIndex: number;
}

export interface LayoutEdge extends ProvenanceEdge {
  pathD: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}
