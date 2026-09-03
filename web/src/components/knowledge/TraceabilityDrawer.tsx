"use client";

import React, { useState, useEffect } from "react";
import { traceabilityApi, TraceabilityNode } from "@/services/knowledgeService";

interface TraceabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  requirementId?: string;
  problemId?: string;
}

export const TraceabilityDrawer: React.FC<TraceabilityDrawerProps> = ({
  isOpen,
  onClose,
  requirementId,
  problemId,
}) => {
  const [nodes, setNodes] = useState<TraceabilityNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchLineage();
    }
  }, [isOpen, requirementId, problemId]);

  const fetchLineage = async () => {
    try {
      setLoading(true);
      const res = await traceabilityApi.getGraph({
        requirement_id: requirementId,
        problem_id: problemId,
      });
      setNodes(res.traceability_records || []);
    } catch (err) {
      console.error("Failed to fetch traceability graph:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-sm font-bold">⟲ REQUIREMENTS TRACEABILITY</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Closed-Loop
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Full epistemic lineage linking verified problems to downstream system specifications.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Lineage Chains */}
          <div className="mt-6 space-y-6">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs animate-pulse">Loading traceability chain...</div>
            ) : nodes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                No traceability links recorded yet for this requirement or problem.
              </div>
            ) : (
              nodes.map((node, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{node.requirement_id}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {node.category}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-100">{node.requirement_text}</div>

                  {/* Vertical Stepper Lineage */}
                  <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-emerald-500">
                    {node.lineage.problem?.id && (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-950" />
                        <div className="text-[11px] font-bold text-cyan-300 uppercase">1. Root Problem</div>
                        <div className="text-xs text-slate-300 mt-0.5 font-medium">
                          {node.lineage.problem.statement || node.lineage.problem.id}
                        </div>
                      </div>
                    )}

                    {node.lineage.claim?.id && (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-indigo-400 ring-4 ring-slate-950" />
                        <div className="text-[11px] font-bold text-indigo-300 uppercase">2. Epistemic Claim</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{node.lineage.claim.id}</div>
                      </div>
                    )}

                    {node.lineage.evidence?.id && (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-purple-400 ring-4 ring-slate-950" />
                        <div className="text-[11px] font-bold text-purple-300 uppercase">3. Supporting Evidence</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{node.lineage.evidence.id}</div>
                      </div>
                    )}

                    {node.lineage.decision?.id && (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
                        <div className="text-[11px] font-bold text-emerald-300 uppercase">4. Decision Rationale</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{node.lineage.decision.id}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
