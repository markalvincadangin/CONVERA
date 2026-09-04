"use client";

import React, { useState } from "react";
import { ProblemRecord } from "@/lib/types";
import { Button } from "@/components/common/Button";
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  BookOpen,
  DollarSign,
  User,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface ProblemComparisonMatrixProps {
  candidates: ProblemRecord[];
  onSelectWinningProblem: (problem: ProblemRecord) => void;
  onRemoveCandidate?: (problemId: string) => void;
}

export const ProblemComparisonMatrix: React.FC<ProblemComparisonMatrixProps> = ({
  candidates,
  onSelectWinningProblem,
  onRemoveCandidate,
}) => {
  const [selectedId, setSelectedId] = useState<string>(candidates[0]?.id || "");

  if (candidates.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
        <Layers className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="font-bold text-white text-sm">No Candidate Problems Selected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Select 2 to 4 problems from the Problem Bank to compare them side-by-side across evidence, workaround intensity, and feasibility.
        </p>
      </div>
    );
  }

  const activeProblem = candidates.find((c) => c.id === selectedId) || candidates[0];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Phase 2 Decision Space
            </span>
            <span className="text-xs text-slate-400">Comparing {candidates.length} Candidate Theses</span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide">
            Multi-Candidate Objective Decision Matrix
          </h2>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => activeProblem && onSelectWinningProblem(activeProblem)}
          leftIcon={<Award className="w-4 h-4 text-amber-300" />}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Lock [{activeProblem.id}] for Phase 3 Mom Test
        </Button>
      </div>

      {/* Grid Comparison Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(candidates.length, 3)} gap-4`}>
        {candidates.map((cand) => {
          const isSelected = cand.id === selectedId;
          const score = cand.score || 85;
          const tier = cand.evidence_tier || "SIGNAL";
          const sourcesCount = cand.sources?.length || 0;

          return (
            <div
              key={cand.id}
              role="button"
              tabIndex={0}
              aria-label={`Select comparison candidate ${cand.id}`}
              onClick={() => setSelectedId(cand.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(cand.id);
                }
              }}
              className={`cursor-pointer transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between border space-y-4 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                isSelected
                  ? "bg-slate-900 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40"
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-3 right-5 px-3 py-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full text-[10px] font-mono font-bold text-slate-950 shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Recommended Pick
                </div>
              )}

              <div className="space-y-3">
                {/* Header Tag & ID */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700">
                      {cand.id}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-400">{cand.sector}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    <TrendingUp className="w-3 h-3" /> {score.toFixed(0)}%
                  </div>
                </div>

                {/* Problem Statement */}
                <p className="text-xs font-medium text-slate-100 leading-relaxed line-clamp-3">
                  "{cand.problem_statement}"
                </p>

                {/* Sufferer & Location */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <User className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-white truncate">{cand.sufferer_occupation}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{cand.sufferer_location || "Iloilo, Philippines"}</span>
                  </div>
                </div>

                {/* Workaround & Impact */}
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                      Active Workaround:
                    </span>
                    <p className="text-slate-300 line-clamp-2 leading-relaxed">{cand.workaround || "None documented"}</p>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                      Quantified Loss / Impact:
                    </span>
                    <p className="text-slate-300 line-clamp-2 leading-relaxed">{cand.quantified_impact || "Not quantified"}</p>
                  </div>
                </div>

                {/* Empirical Evidence Badges */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Empirical DOIs:
                  </span>
                  <span className="text-cyan-400 font-bold">{sourcesCount} Papers Attached</span>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(cand.id);
                  }}
                  className={`w-full py-2.5 rounded-2xl text-xs font-mono font-bold transition-all ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {isSelected ? "✓ Active Candidate Selected" : "Select Candidate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
