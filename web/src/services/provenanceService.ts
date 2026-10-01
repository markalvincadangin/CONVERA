/**
 * CONVERA Provenance Graph Service (SDD-022)
 * ==========================================
 * Client service for evidence chain DAG queries, node inspection,
 * deterministic layout calculation, and JSON export.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

import { fetchApi } from "@/lib/api-client";
import type {
  ProvenanceFilterQuery,
  ProvenanceGraphPayload,
  NodeLineageResponse,
  ProvenanceNode,
  ProvenanceEdge,
  LayoutNode,
  LayoutEdge,
} from "@/types/provenanceGraph";

export * from "@/types/provenanceGraph";

export const NODE_WIDTH = 260;
export const NODE_HEIGHT = 100;
export const COLUMN_GAP = 90;
export const ROW_GAP = 28;
export const PADDING_X = 50;
export const PADDING_Y = 60;

export const TIER_TITLES: Record<number, string> = {
  0: "Tier 0: Literature & Sources",
  1: "Tier 1: Empirical Claims",
  2: "Tier 2: Research Assumptions",
  3: "Tier 3: DSR Artifacts",
  4: "Tier 4: Rubric Evaluations",
  5: "Tier 5: Feasibility & Canvas",
};

export const TIER_STAGE_MAP: Record<number, string> = {
  0: "Stage A",
  1: "Stage B",
  2: "Stage C",
  3: "Stage D",
  4: "Stage E",
  5: "Stage F",
};

export const provenanceService = {
  /**
   * Fetches the complete provenance graph for a research session with optional filters.
   */
  getGraph: async (query: ProvenanceFilterQuery): Promise<ProvenanceGraphPayload> => {
    const params = new URLSearchParams();
    params.set("session_id", query.session_id);
    if (query.min_confidence !== undefined && query.min_confidence > 0) {
      params.set("min_confidence", query.min_confidence.toString());
    }
    if (query.stages && query.stages.length > 0) {
      query.stages.forEach((stg) => params.append("stages", stg));
    }
    if (query.tiers && query.tiers.length > 0) {
      query.tiers.forEach((t) => params.append("tiers", t.toString()));
    }
    if (query.include_orphans !== undefined) {
      params.set("include_orphans", query.include_orphans.toString());
    }
    if (query.search_term && query.search_term.trim()) {
      params.set("search_term", query.search_term.trim());
    }

    return await fetchApi<ProvenanceGraphPayload>(
      `/api/provenance/graph?${params.toString()}`
    );
  },

  /**
   * Fetches the deep lineage (ancestors & descendants) for an individual node.
   */
  getNodeLineage: async (
    sessionId: string,
    nodeId: string
  ): Promise<NodeLineageResponse> => {
    const params = new URLSearchParams({ session_id: sessionId });
    return await fetchApi<NodeLineageResponse>(
      `/api/provenance/node/${encodeURIComponent(nodeId)}?${params.toString()}`
    );
  },

  /**
   * Triggers browser download of the canonical provenance JSON bundle.
   */
  downloadExportBundle: async (sessionId: string): Promise<void> => {
    const res = await fetch(`/api/provenance/export/${encodeURIComponent(sessionId)}`);
    if (!res.ok) {
      throw new Error(`Export failed with HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `convera_provenance_${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Computes deterministic layered layout positions (Sugiyama-style column ranking)
   * for native SVG rendering without external graphing libraries (Article VII).
   */
  computeGraphLayout: (
    nodes: ProvenanceNode[],
    edges: ProvenanceEdge[]
  ): {
    layoutNodes: LayoutNode[];
    layoutEdges: LayoutEdge[];
    totalWidth: number;
    totalHeight: number;
    tierColumns: { tier: number; title: string; stage: string; x: number; width: number }[];
  } => {
    // 1. Group nodes by epistemic tier (0..5)
    const tierBuckets: Record<number, ProvenanceNode[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };

    nodes.forEach((node) => {
      const tier = Math.min(Math.max(node.tier, 0), 5);
      tierBuckets[tier].push(node);
    });

    let maxRowCount = 1;
    for (let t = 0; t <= 5; t++) {
      if (tierBuckets[t].length > maxRowCount) {
        maxRowCount = tierBuckets[t].length;
      }
    }

    const nodeMap = new Map<string, LayoutNode>();
    const layoutNodes: LayoutNode[] = [];
    const tierColumns = [];

    // Calculate column X coordinates
    for (let t = 0; t <= 5; t++) {
      const colX = PADDING_X + t * (NODE_WIDTH + COLUMN_GAP);
      tierColumns.push({
        tier: t,
        title: TIER_TITLES[t] || `Tier ${t}`,
        stage: TIER_STAGE_MAP[t] || `Stage ${t}`,
        x: colX,
        width: NODE_WIDTH,
      });

      const tierList = tierBuckets[t];
      // Vertical centering: compute total height for this tier and center within maxRowCount
      const tierHeight = tierList.length * NODE_HEIGHT + Math.max(0, tierList.length - 1) * ROW_GAP;
      const maxHeight = maxRowCount * NODE_HEIGHT + Math.max(0, maxRowCount - 1) * ROW_GAP;
      const startOffsetY = PADDING_Y + Math.max(0, (maxHeight - tierHeight) / 2);

      tierList.forEach((node, idx) => {
        const y = startOffsetY + idx * (NODE_HEIGHT + ROW_GAP);
        const layoutNode: LayoutNode = {
          ...node,
          x: colX,
          y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          column: t,
          rowIndex: idx,
        };
        layoutNodes.push(layoutNode);
        nodeMap.set(node.id, layoutNode);
      });
    }

    // 2. Compute smooth cubic Bézier connectors for edges
    const layoutEdges: LayoutEdge[] = [];
    edges.forEach((edge) => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) return;

      const sourceX = src.x + src.width;
      const sourceY = src.y + src.height / 2;
      const targetX = tgt.x;
      const targetY = tgt.y + tgt.height / 2;

      let pathD = "";
      if (targetX >= sourceX) {
        const dx = Math.max(40, (targetX - sourceX) * 0.45);
        pathD = `M ${sourceX} ${sourceY} C ${sourceX + dx} ${sourceY}, ${targetX - dx} ${targetY}, ${targetX} ${targetY}`;
      } else {
        // Lateral or backward edge: loop curve
        const dy = 50;
        pathD = `M ${sourceX} ${sourceY} C ${sourceX + 60} ${sourceY + dy}, ${targetX - 60} ${targetY + dy}, ${targetX} ${targetY}`;
      }

      layoutEdges.push({
        ...edge,
        pathD,
        sourceX,
        sourceY,
        targetX,
        targetY,
      });
    });

    const totalWidth = PADDING_X * 2 + 6 * NODE_WIDTH + 5 * COLUMN_GAP;
    const totalHeight = PADDING_Y * 2 + maxRowCount * NODE_HEIGHT + Math.max(0, maxRowCount - 1) * ROW_GAP + 60;

    return {
      layoutNodes,
      layoutEdges,
      totalWidth,
      totalHeight,
      tierColumns,
    };
  },
};
