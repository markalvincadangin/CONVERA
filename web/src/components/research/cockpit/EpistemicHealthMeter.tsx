"use client";

import React from "react";
import { Activity, Scale, BookOpen, BrainCircuit, ExternalLink } from "lucide-react";
import { EpistemicHealthSummary } from "@/services/orchestratorService";

interface EpistemicHealthMeterProps {
  health: EpistemicHealthSummary;
  onOpenScorecard?: () => void;
}

export const EpistemicHealthMeter: React.FC<EpistemicHealthMeterProps> = ({
  health,
  onOpenScorecard,
}) => {
  const {
    facts_count,
    assumptions_count,
    evidence_items_count,
    scholarly_works_count,
    net_epistemic_balance,
    overconfidence_risk,
  } = health;

  // Normalized percentage for meter bar: -1.0 -> 0%, 0.0 -> 50%, +1.0 -> 100%
  const balancePercent = Math.min(
    100,
    Math.max(0, Math.round(((net_epistemic_balance + 1.0) / 2.0) * 100))
  );

  const getBalanceColor = (b: number) => {
    if (b >= 0.2) return "text-emerald-400";
    if (b >= -0.2) return "text-amber-400";
    return "text-rose-400";
  };

  const getBalanceBadgeBg = (b: number) => {
    if (b >= 0.2) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
    if (b >= -0.2) return "bg-amber-500/10 border-amber-500/20 text-amber-300";
    return "bg-rose-500/10 border-rose-500/20 text-rose-300";
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3.5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Confidence & Epistemic Health
            </div>
            <h4 className="text-sm font-semibold text-neutral-100 tracking-tight">
              Epistemic Balance
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-bold border ${getBalanceBadgeBg(
              net_epistemic_balance
            )}`}
          >
            {net_epistemic_balance > 0 ? "+" : ""}
            {net_epistemic_balance.toFixed(2)}
          </span>
          {onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
              title="Open Full Intelligence Scorecard"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (0 center line) */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono text-neutral-400">
          <span>-1.0 (Speculative)</span>
          <span className="text-neutral-400 font-semibold">0.0 (Neutral)</span>
          <span>+1.0 (Empirical)</span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-neutral-950 border border-neutral-800/80 overflow-hidden">
          {/* Center line marker */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-neutral-700 z-10" />
          {/* Fill Bar */}
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              net_epistemic_balance >= 0.2
                ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                : net_epistemic_balance >= -0.2
                ? "bg-gradient-to-r from-amber-600 to-amber-400"
                : "bg-gradient-to-r from-rose-600 to-rose-400"
            }`}
            style={{ width: `${balancePercent}%` }}
          />
        </div>
      </div>

      {/* 4 Epistemic Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
        <div className="rounded-lg bg-neutral-950/40 p-2 border border-neutral-800/40 text-center">
          <div className="text-[10px] text-neutral-400 font-medium">Facts</div>
          <div className="text-sm font-mono font-bold text-emerald-400">
            {facts_count}
          </div>
        </div>

        <div className="rounded-lg bg-neutral-950/40 p-2 border border-neutral-800/40 text-center">
          <div className="text-[10px] text-neutral-400 font-medium">Assumptions</div>
          <div className="text-sm font-mono font-bold text-amber-400">
            {assumptions_count}
          </div>
        </div>

        <div className="rounded-lg bg-neutral-950/40 p-2 border border-neutral-800/40 text-center">
          <div className="text-[10px] text-neutral-400 font-medium">Evidence Links</div>
          <div className="text-sm font-mono font-bold text-cyan-400">
            {evidence_items_count}
          </div>
        </div>

        <div className="rounded-lg bg-neutral-950/40 p-2 border border-neutral-800/40 text-center">
          <div className="text-[10px] text-neutral-400 font-medium">Scholarly Works</div>
          <div className="text-sm font-mono font-bold text-purple-400">
            {scholarly_works_count}
          </div>
        </div>
      </div>
    </div>
  );
};
