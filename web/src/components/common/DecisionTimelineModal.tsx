"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { DecisionRecord } from "@/lib/types";
import { problemService } from "@/services/problemService";
import {
  History,
  Award,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface DecisionTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

export const DecisionTimelineModal: React.FC<DecisionTimelineModalProps> = ({
  isOpen,
  onClose,
  sessionId,
}) => {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      problemService
        .listDecisions(sessionId)
        .then((res) => setDecisions(res.decisions))
        .catch((err) => console.error("Error loading decisions:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, sessionId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Decision Audit Log & Opportunity Lineage" maxWidth="2xl">
      <div className="space-y-4 font-sans text-xs">
        {/* Banner */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Explainable Decision Audit Trail
            </h4>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Every major project selection and pivot loop is permanently preserved with the exact evidence, rationale, and rejected alternatives.
          </p>
        </div>

        {/* Timeline List */}
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-mono">Loading decision records...</div>
        ) : decisions.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-dashed border-slate-800 space-y-2">
            <Scale className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No formal decision records logged yet.</p>
            <p className="text-[11px] text-slate-500">
              When you lock a problem in the Decision Room or execute a Pivot Loop, records appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {decisions.map((dec, idx) => {
              const isPivot = dec.stage.includes("PIVOT");

              return (
                <div
                  key={dec.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isPivot
                      ? "bg-rose-950/20 border-rose-500/30"
                      : "bg-slate-950 border-cyan-500/30 shadow-md shadow-cyan-500/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-xl border ${
                          isPivot
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                        }`}
                      >
                        {isPivot ? <RotateCcw className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        {isPivot ? "Pivot / Re-evaluate Loop" : `Decision #${dec.id}`}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                        {dec.stage}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {dec.created_at?.slice(0, 16) || "Recent"}
                    </span>
                  </div>

                  {/* Winner / Selected vs Rejected */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">Selected / Active:</span>
                    <span className="font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                      {dec.selected_problem_id}
                    </span>

                    {dec.rejected_problem_ids && dec.rejected_problem_ids.length > 0 && (
                      <>
                        <span className="text-slate-500">• Rejected:</span>
                        {dec.rejected_problem_ids.map((rId) => (
                          <span
                            key={rId}
                            className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800"
                          >
                            {rId}
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Rationale */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Decision Rationale & Context:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">{dec.decision_rationale}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
