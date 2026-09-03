"use client";

import React, { useState } from "react";
import { AssumptionRecord } from "@/lib/types";
import { problemService } from "@/services/problemService";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import {
  Radar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";

interface AssumptionRadarCardProps {
  problemId: string;
  assumptions: AssumptionRecord[];
  onAssumptionsUpdated: (updatedAssumptions: AssumptionRecord[]) => void;
  onGenerateRequested: () => void;
  isGenerating?: boolean;
}

const RISK_CONFIG: Record<
  string,
  { label: string; badge: string; border: string; indicator: string }
> = {
  CRITICAL: {
    label: "Critical (Kill Risk)",
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    border: "border-rose-500/30 hover:border-rose-500/50",
    indicator: "bg-rose-500",
  },
  HIGH: {
    label: "High Risk",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    border: "border-orange-500/30 hover:border-orange-500/50",
    indicator: "bg-orange-500",
  },
  MEDIUM: {
    label: "Medium Risk",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    border: "border-amber-500/30 hover:border-amber-500/50",
    indicator: "bg-amber-500",
  },
  LOW: {
    label: "Low Risk",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    indicator: "bg-emerald-500",
  },
};

export const AssumptionRadarCard: React.FC<AssumptionRadarCardProps> = ({
  problemId,
  assumptions,
  onAssumptionsUpdated,
  onGenerateRequested,
  isGenerating = false,
}) => {
  const toast = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleStatusChange = async (assumptionId: string, newStatus: string) => {
    setUpdatingId(assumptionId);
    try {
      const res = await problemService.updateAssumption(problemId, assumptionId, newStatus);
      onAssumptionsUpdated(assumptions.map((a) => (a.id === assumptionId ? res.assumption : a)));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update assumption", "Assumption Update Error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-5 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4 font-sans shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
              <Radar className="w-3 h-3 text-amber-400" /> Assumption Radar
            </span>
            <span className="text-xs text-slate-300 font-bold">Devil's Advocate Hypotheses</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Translates theoretical flaws into testable behavioral interview questions.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onGenerateRequested}
          isLoading={isGenerating}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
          className="text-[11px] font-mono"
        >
          {assumptions.length === 0 ? "Extract Assumptions" : "Re-Extract"}
        </Button>
      </div>

      {/* Assumptions List */}
      {assumptions.length === 0 ? (
        <div className="p-6 text-center bg-slate-950 rounded-2xl border border-dashed border-slate-800 space-y-2">
          <Radar className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">No assumptions prioritized yet.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={onGenerateRequested}
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Extract Prioritized Assumptions
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {assumptions.map((item) => {
            const risk = RISK_CONFIG[item.risk_level] || RISK_CONFIG.HIGH;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 bg-slate-950 rounded-2xl border transition-all space-y-3 ${risk.border}`}
              >
                {/* Top Row: Risk Level & Test Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${risk.indicator}`} />
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${risk.badge}`}>
                      {risk.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Origin: {item.origin}</span>
                  </div>

                  <select
                    value={item.status}
                    disabled={updatingId === item.id}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="UNTESTED">UNTESTED</option>
                    <option value="IN_TESTING">IN TESTING</option>
                    <option value="SUPPORTED">SUPPORTED</option>
                    <option value="INVALIDATED">INVALIDATED</option>
                  </select>
                </div>

                {/* Core Assumption */}
                <p className="text-xs font-semibold text-white leading-relaxed">
                  "{item.assumption_text}"
                </p>

                {/* Mom Test Behavioral Question */}
                {item.testable_question && (
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1 font-mono">
                        <MessageSquare className="w-3 h-3 text-cyan-400" /> Mom Test Behavioral Question:
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyQuestion(item.id, item.testable_question || "")}
                        className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Question
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium italic leading-relaxed">
                      "{item.testable_question}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
