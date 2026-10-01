"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";
import type {
  ProvenanceNode,
  NodeLineageResponse,
} from "@/types/provenanceGraph";
import { provenanceService } from "@/services/provenanceService";

interface ProvenanceNodeInspectorProps {
  node: ProvenanceNode | null;
  sessionId: string;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

const TIER_NAMES: Record<number, string> = {
  0: "Literature & Sources",
  1: "Empirical Claims",
  2: "Research Assumptions",
  3: "DSR Artifacts",
  4: "Rubric Evaluations",
  5: "Feasibility Proposal",
};

export const ProvenanceNodeInspector: React.FC<ProvenanceNodeInspectorProps> = ({
  node,
  sessionId,
  onClose,
  onSelectNode,
}) => {
  const [lineage, setLineage] = useState<NodeLineageResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!node || !sessionId) {
      setLineage(null);
      return;
    }

    let isMounted = true;
    const fetchLineage = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await provenanceService.getNodeLineage(sessionId, node.id);
        if (isMounted) {
          setLineage(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load node lineage");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLineage();
    return () => {
      isMounted = false;
    };
  }, [node, sessionId]);

  if (!node) return null;

  const confPct = Math.round(node.confidence_score * 100);
  const confColor =
    confPct >= 80
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : confPct >= 50
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-rose-400 bg-rose-500/10 border-rose-500/20";

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 border-l border-neutral-800 bg-neutral-950/95 p-5 shadow-2xl backdrop-blur-xl flex flex-col text-neutral-200 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-400 uppercase tracking-wide">
              Tier {node.tier}: {TIER_NAMES[node.tier] || "Entity"}
            </span>
            <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400 uppercase">
              {node.stage_id}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-white leading-snug">
            {node.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Epistemic Health & Confidence Bar */}
      <div className="mt-4 rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Confidence Score</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono border ${confColor}`}>
            {confPct}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              confPct >= 80 ? "bg-emerald-500" : confPct >= 50 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${confPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
          <span>Status: <strong className="text-neutral-300 capitalize">{node.status}</strong></span>
          <span>Entity: <code className="text-neutral-400">{node.type}</code></span>
        </div>
      </div>

      {/* Description / Summary Excerpt */}
      {node.description && (
        <div className="mt-4 space-y-1.5">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Summary / Excerpt
          </h4>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 text-xs text-neutral-300 leading-relaxed font-mono">
            {node.description}
          </div>
        </div>
      )}

      {/* Scholarly Publication Metadata (if Tier 0) */}
      {(node.doi || node.year || (node.authors && node.authors.length > 0)) && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            Scholarly Literature Details
          </h4>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 text-xs space-y-2">
            {node.authors && node.authors.length > 0 && (
              <div>
                <span className="text-neutral-500">Authors: </span>
                <span className="text-neutral-200">{node.authors.join(", ")}</span>
              </div>
            )}
            {node.year && (
              <div>
                <span className="text-neutral-500">Publication Year: </span>
                <span className="text-neutral-200">{node.year}</span>
              </div>
            )}
            {node.citation_count !== null && node.citation_count !== undefined && (
              <div>
                <span className="text-neutral-500">Citations: </span>
                <span className="text-neutral-200 font-mono">{node.citation_count}</span>
              </div>
            )}
            {node.doi && (
              <div>
                <span className="text-neutral-500">DOI: </span>
                <a
                  href={`https://doi.org/${node.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-mono text-[11px]"
                >
                  {node.doi}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upstream Ancestor Chain */}
      <div className="mt-5 space-y-2">
        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            Upstream Foundations ({lineage?.ancestors.length ?? 0})
          </span>
          {loading && <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />}
        </h4>

        {lineage?.ancestors && lineage.ancestors.length > 0 ? (
          <div className="space-y-1.5">
            {lineage.ancestors.map((anc) => (
              <button
                key={anc.id}
                type="button"
                onClick={() => onSelectNode(anc.id)}
                className="w-full text-left rounded-lg border border-neutral-800 bg-neutral-900/60 p-2 text-xs hover:border-cyan-500/50 hover:bg-neutral-800/60 transition-colors group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                    <span className="rounded bg-neutral-800 px-1 font-mono text-cyan-300">
                      Tier {anc.tier}
                    </span>
                    <span>{anc.type}</span>
                  </div>
                  <div className="font-medium text-neutral-200 truncate max-w-[240px] mt-0.5">
                    {anc.label}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-2.5 text-center text-xs text-neutral-500">
            No upstream dependencies (Root Node)
          </div>
        )}
      </div>

      {/* Downstream Descendants Chain */}
      <div className="mt-5 space-y-2">
        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            Downstream Impact ({lineage?.descendants.length ?? 0})
          </span>
        </h4>

        {lineage?.descendants && lineage.descendants.length > 0 ? (
          <div className="space-y-1.5">
            {lineage.descendants.map((desc) => (
              <button
                key={desc.id}
                type="button"
                onClick={() => onSelectNode(desc.id)}
                className="w-full text-left rounded-lg border border-neutral-800 bg-neutral-900/60 p-2 text-xs hover:border-emerald-500/50 hover:bg-neutral-800/60 transition-colors group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                    <span className="rounded bg-neutral-800 px-1 font-mono text-emerald-300">
                      Tier {desc.tier}
                    </span>
                    <span>{desc.type}</span>
                  </div>
                  <div className="font-medium text-neutral-200 truncate max-w-[240px] mt-0.5">
                    {desc.label}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-2.5 text-center text-xs text-neutral-500">
            No downstream dependents (Terminal Node)
          </div>
        )}
      </div>

      {/* Node ID & Timestamp Footer */}
      <div className="mt-auto pt-6 border-t border-neutral-800/80 text-[10px] text-neutral-500 space-y-1">
        <div>ID: <code className="text-neutral-400 font-mono">{node.id}</code></div>
        <div>Created: {new Date(node.created_at).toLocaleString()}</div>
      </div>
    </div>
  );
};
