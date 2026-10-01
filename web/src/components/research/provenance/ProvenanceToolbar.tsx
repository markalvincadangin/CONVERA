"use client";

import React from "react";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertTriangle,
  GitBranch,
  Layers,
  Activity,
  SlidersHorizontal,
} from "lucide-react";
import type { ProvenanceMetrics } from "@/types/provenanceGraph";

interface ProvenanceToolbarProps {
  metrics: ProvenanceMetrics | null;
  stateHash: string;
  selectedStage: string | null;
  onSelectStage: (stage: string | null) => void;
  minConfidence: number;
  onConfidenceChange: (val: number) => void;
  includeOrphans: boolean;
  onToggleOrphans: (val: boolean) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onExportJson: () => void;
  onExportSvg?: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const STAGE_FILTERS = [
  { id: null, label: "All Stages" },
  { id: "stage_a", label: "A: Literature" },
  { id: "stage_b", label: "B: Claims" },
  { id: "stage_c", label: "C: Matrix" },
  { id: "stage_d", label: "D: DSR Design" },
  { id: "stage_e", label: "E: Evaluation" },
  { id: "stage_f", label: "F: Feasibility" },
];

export const ProvenanceToolbar: React.FC<ProvenanceToolbarProps> = ({
  metrics,
  stateHash,
  selectedStage,
  onSelectStage,
  minConfidence,
  onConfidenceChange,
  includeOrphans,
  onToggleOrphans,
  searchTerm,
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExportJson,
  onExportSvg,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/90 p-3.5 backdrop-blur-md shadow-lg text-neutral-200">
      {/* Top metrics row & State Hash */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
            <GitBranch className="w-4 h-4" />
            Provenance Graph
          </span>

          {stateHash && (
            <span
              className="inline-flex items-center gap-1 rounded bg-neutral-800/90 px-2 py-0.5 text-[10px] font-mono text-neutral-400 border border-neutral-700/60"
              title={`Full SHA-256 state hash: ${stateHash}`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              SHA-256: {stateHash.slice(0, 8)}…
            </span>
          )}

          {metrics && (
            <>
              <span className="rounded bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-300">
                <span className="text-cyan-400 font-bold">{metrics.total_nodes}</span> nodes
              </span>
              <span className="rounded bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-300">
                <span className="text-cyan-400 font-bold">{metrics.total_edges}</span> edges
              </span>
              {metrics.contradiction_count > 0 ? (
                <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[11px] font-mono text-rose-400">
                  <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                  {metrics.contradiction_count} tension{metrics.contradiction_count > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                  0 contradictions
                </span>
              )}
              <span className="rounded bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-300">
                Grounding: <span className="text-emerald-400 font-bold">{Math.round(metrics.grounded_artifacts_ratio * 100)}%</span>
              </span>
              <span className="rounded bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-300">
                Avg Conf: <span className="text-neutral-100 font-bold">{(metrics.average_confidence * 100).toFixed(0)}%</span>
              </span>
            </>
          )}
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <div className="flex items-center rounded-lg bg-neutral-800/80 border border-neutral-700/60 p-0.5">
            <button
              type="button"
              onClick={onZoomIn}
              className="p-1 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onZoomOut}
              className="p-1 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onResetZoom}
              className="p-1 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-white hover:bg-neutral-700/60 transition-colors"
            title="Reload Graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {onExportSvg && (
            <button
              type="button"
              onClick={onExportSvg}
              className="whitespace-nowrap inline-flex items-center justify-center gap-1 rounded-lg bg-neutral-800 border border-neutral-700/60 px-2 py-1 text-xs text-neutral-300 hover:text-white hover:bg-neutral-700/60 transition-colors"
              title="Export as Vector SVG"
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              SVG
            </button>
          )}

          <button
            type="button"
            onClick={onExportJson}
            className="whitespace-nowrap inline-flex items-center justify-center gap-1 rounded-lg bg-cyan-600/20 border border-cyan-500/40 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-600/30 transition-colors"
            title="Export Canonical Provenance JSON"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Stage Filter Chips */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] text-neutral-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Stages:
          </span>
          {STAGE_FILTERS.map((stg) => {
            const isActive = selectedStage === stg.id;
            return (
              <button
                key={stg.label}
                type="button"
                onClick={() => onSelectStage(stg.id)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 border border-transparent"
                }`}
              >
                {stg.label}
              </button>
            );
          })}
        </div>

        {/* Confidence Threshold & Search & Orphans */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Confidence Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400">Min Conf:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={minConfidence}
              onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
              className="w-20 accent-cyan-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              title={`Confidence threshold: ${(minConfidence * 100).toFixed(0)}%`}
            />
            <span className="w-7 font-mono text-[10px] text-cyan-400">
              {(minConfidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Toggle Orphans */}
          <label className="flex items-center gap-1.5 text-[11px] text-neutral-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeOrphans}
              onChange={(e) => onToggleOrphans(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            Orphans
          </label>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3 h-3 text-neutral-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 rounded-md bg-neutral-800/80 border border-neutral-700/60 pl-6 pr-2 py-0.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
