"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  GitBranch,
  Search,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  FileQuestion,
  Loader2,
} from "lucide-react";
import type {
  ProvenanceNode,
  ProvenanceEdge,
  ProvenanceGraphPayload,
  ProvenanceFilterQuery,
  LayoutNode,
  LayoutEdge,
} from "@/types/provenanceGraph";
import {
  provenanceService,
  NODE_WIDTH,
  NODE_HEIGHT,
  COLUMN_GAP,
  ROW_GAP,
} from "@/services/provenanceService";
import { ProvenanceToolbar } from "./ProvenanceToolbar";
import { ProvenanceNodeInspector } from "./ProvenanceNodeInspector";

export interface EvidenceChainGraphProps {
  sessionId: string;
  className?: string;
  onInspectNode?: (node: ProvenanceNode) => void;
}

export const EvidenceChainGraph: React.FC<EvidenceChainGraphProps> = ({
  sessionId,
  className = "",
  onInspectNode,
}) => {
  // Graph Data State
  const [graphData, setGraphData] = useState<ProvenanceGraphPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState<number>(0.0);
  const [includeOrphans, setIncludeOrphans] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Canvas Pan & Zoom State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inspection State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 1. Fetch Provenance Graph Data
  const fetchGraph = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const query: ProvenanceFilterQuery = {
        session_id: sessionId,
        min_confidence: minConfidence > 0 ? minConfidence : undefined,
        stages: selectedStage ? [selectedStage] : undefined,
        include_orphans: includeOrphans,
        search_term: searchTerm.trim() || undefined,
      };
      const res = await provenanceService.getGraph(query);
      setGraphData(res);
    } catch (err: any) {
      console.error("Failed to load provenance graph:", err);
      setError(err?.message || "Failed to load evidence chain graph");
    } finally {
      setLoading(false);
    }
  }, [sessionId, selectedStage, minConfidence, includeOrphans, searchTerm]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // 2. Compute Layout via Service Layout Engine
  const layout = useMemo(() => {
    if (!graphData || graphData.nodes.length === 0) {
      return null;
    }
    return provenanceService.computeGraphLayout(graphData.nodes, graphData.edges);
  }, [graphData]);

  // 3. Pan & Zoom Handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.3));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 20, y: 20 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking background or canvas
    if ((e.target as HTMLElement).closest(".node-card")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((z) => Math.min(Math.max(z * zoomFactor, 0.3), 2.5));
  };

  // 4. Export Actions
  const handleExportJson = () => {
    if (!sessionId) return;
    provenanceService.downloadExportBundle(sessionId);
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgContent = svgRef.current.outerHTML;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `convera_evidence_chain_${sessionId}.svg`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Selected Node Details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !graphData) return null;
    return graphData.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, graphData]);

  // Edges highlighting when node is hovered
  const activeEdgeIds = useMemo(() => {
    if (!hoveredNodeId || !graphData) return new Set<string>();
    const ids = new Set<string>();
    graphData.edges.forEach((e) => {
      if (e.source === hoveredNodeId || e.target === hoveredNodeId) {
        ids.add(e.id);
      }
    });
    return ids;
  }, [hoveredNodeId, graphData]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col h-full w-full bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden select-none ${className}`}
    >
      {/* Provenance Toolbar */}
      <div className="p-3 z-10">
        <ProvenanceToolbar
          metrics={graphData?.metrics || null}
          stateHash={graphData?.state_hash || ""}
          selectedStage={selectedStage}
          onSelectStage={setSelectedStage}
          minConfidence={minConfidence}
          onConfidenceChange={setMinConfidence}
          includeOrphans={includeOrphans}
          onToggleOrphans={setIncludeOrphans}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onExportJson={handleExportJson}
          onExportSvg={handleExportSvg}
          onRefresh={fetchGraph}
          isLoading={loading}
        />
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        className="relative flex-1 w-full h-[600px] overflow-hidden cursor-grab active:cursor-grabbing bg-radial from-neutral-900/60 to-neutral-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Loading Spinner */}
        {loading && !graphData && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-950/70 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
            <p className="text-xs text-neutral-400">Synthesizing evidence chain DAG...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Graph Error</h3>
            <p className="text-xs text-neutral-400 max-w-md mt-1">{error}</p>
            <button
              type="button"
              onClick={fetchGraph}
              className="mt-4 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs text-white hover:bg-cyan-500"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && graphData && graphData.nodes.length === 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
            <FileQuestion className="w-10 h-10 text-neutral-600 mb-3" />
            <h3 className="text-sm font-semibold text-neutral-300">No Provenance Nodes Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Start by scouting literature in Stage A or ingesting empirical claims to build the epistemic reasoning chain.
            </p>
          </div>
        )}

        {/* SVG Drawing Surface */}
        {layout && (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className="w-full h-full"
            style={{ minHeight: "600px" }}
          >
            {/* Defs for Gradients and Arrow Markers */}
            <defs>
              <marker
                id="arrow-cyan"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0ea5e9" />
              </marker>
              <marker
                id="arrow-contra"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
              </marker>
              <marker
                id="arrow-hover"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
              </marker>

              {/* Grid Background Pattern */}
              <pattern
                id="dag-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width="100%" height="100%" fill="url(#dag-grid)" />

            {/* Transform Group for Pan & Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Column Guides and Header Banners */}
              {layout.tierColumns.map((col) => (
                <g key={`col-${col.tier}`}>
                  {/* Column Background Tint */}
                  <rect
                    x={col.x - 15}
                    y={10}
                    width={col.width + 30}
                    height={layout.totalHeight}
                    rx={12}
                    fill="rgba(255, 255, 255, 0.015)"
                    stroke="rgba(255, 255, 255, 0.04)"
                    strokeDasharray="4 4"
                  />
                  {/* Column Header Label */}
                  <text
                    x={col.x}
                    y={35}
                    fill="#38bdf8"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="600"
                    letterSpacing="0.05em"
                  >
                    {col.stage.toUpperCase()}: {col.title}
                  </text>
                </g>
              ))}

              {/* Edge Connectors (Cubic Bézier curves) */}
              <g className="edges-layer">
                {layout.layoutEdges.map((edge) => {
                  const isHovered = activeEdgeIds.has(edge.id);
                  const isContra = edge.is_contradiction;
                  const strokeColor = isContra
                    ? "#f43f5e"
                    : isHovered
                    ? "#38bdf8"
                    : "#0284c7";
                  const strokeWidth = isHovered ? 2.5 : isContra ? 2 : 1.5;
                  const markerId = isContra
                    ? "url(#arrow-contra)"
                    : isHovered
                    ? "url(#arrow-hover)"
                    : "url(#arrow-cyan)";

                  return (
                    <g key={edge.id} className="edge-group">
                      <path
                        d={edge.pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isContra ? "5 4" : undefined}
                        strokeOpacity={isHovered ? 1.0 : isContra ? 0.85 : 0.45}
                        markerEnd={markerId}
                        className="transition-all duration-150"
                      />
                      {/* Edge Label for Contradictions or High Weight */}
                      {isContra && (
                        <text
                          x={(edge.sourceX + edge.targetX) / 2}
                          y={(edge.sourceY + edge.targetY) / 2 - 8}
                          fill="#f43f5e"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="animate-pulse select-none"
                        >
                          CONTRADICTS
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Node Cards (Rendered using foreignObject for rich CCDS v2.0 styling) */}
              <g className="nodes-layer">
                {layout.layoutNodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const confPct = Math.round(node.confidence_score * 100);

                  const borderColor = isSelected
                    ? "border-cyan-400 ring-2 ring-cyan-500/40"
                    : isHovered
                    ? "border-cyan-500/80"
                    : node.status === "contradicted"
                    ? "border-rose-500/60"
                    : "border-neutral-800";

                  const confBadgeColor =
                    confPct >= 80
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : confPct >= 50
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                  return (
                    <foreignObject
                      key={node.id}
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      className="overflow-visible"
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeId(node.id);
                          onInspectNode?.(node);
                        }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className={`node-card cursor-pointer rounded-xl border bg-neutral-900/90 p-2.5 backdrop-blur-md transition-all duration-150 shadow-md hover:shadow-cyan-500/10 hover:-translate-y-0.5 flex flex-col justify-between ${borderColor}`}
                        style={{ width: `${node.width}px`, height: `${node.height}px` }}
                      >
                        {/* Card Header: Type Tag & Confidence */}
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="rounded bg-neutral-800/90 px-1.5 py-0.5 font-mono text-cyan-300 truncate max-w-[150px]">
                            {node.type.replace("_", " ")}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono font-bold border ${confBadgeColor}`}
                          >
                            {confPct}%
                          </span>
                        </div>

                        {/* Card Title */}
                        <div
                          className="font-medium text-xs text-neutral-100 line-clamp-2 leading-tight mt-1"
                          title={node.label}
                        >
                          {node.label}
                        </div>

                        {/* Card Footer: Metadata / Contradiction Status */}
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-800/60">
                          <span className="font-mono text-neutral-500">
                            {node.stage_id}
                          </span>
                          {node.status === "contradicted" ? (
                            <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Contested
                            </span>
                          ) : (
                            <span className="text-neutral-500 capitalize">
                              {node.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </foreignObject>
                  );
                })}
              </g>
            </g>
          </svg>
        )}
      </div>

      {/* Slide-out Node Inspector Drawer */}
      {selectedNode && (
        <ProvenanceNodeInspector
          node={selectedNode}
          sessionId={sessionId}
          onClose={() => setSelectedNodeId(null)}
          onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
        />
      )}
    </div>
  );
};
