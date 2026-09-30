"use client";

import React from "react";
import {
  Trophy,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Scale,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { ConceptComparisonResult } from "@/types/evaluation";

interface ConceptComparisonGridProps {
  comparison: ConceptComparisonResult;
  conceptTitles?: Record<string, string>;
  onSelectPrimaryThesis?: (conceptId: string) => void;
  selectedConceptId?: string;
}

interface DimensionDefinition {
  key: string;
  label: string;
  isComposite?: boolean;
}

const DIMENSIONS: DimensionDefinition[] = [
  { key: "composite_score", label: "Composite Score", isComposite: true },
  { key: "problem_relevance", label: "Problem Relevance (20%)" },
  { key: "evidence_grounding", label: "Evidence Grounding (15%)" },
  { key: "gap_validity", label: "Gap Validity (15%)" },
  { key: "stakeholder_impact", label: "Stakeholder Impact (15%)" },
  { key: "technical_feasibility", label: "Technical Feasibility (15%)" },
  { key: "novelty_contribution", label: "Novelty & Contribution (10%)" },
  { key: "methodology_fit", label: "Methodology Fit (10%)" },
];

export const ConceptComparisonGrid: React.FC<ConceptComparisonGridProps> = ({
  comparison,
  conceptTitles = {},
  onSelectPrimaryThesis,
  selectedConceptId,
}) => {
  const { rankings, tradeoff_matrix, recommended_winner_id, winner_rationale } = comparison;

  if (!rankings || rankings.length === 0) {
    return null;
  }

  const getConceptName = (id: string) => conceptTitles[id] || `Concept ${id}`;

  return (
    <div className="space-y-6">
      {/* Winner Recommendation Banner */}
      {recommended_winner_id && (
        <div className="rounded-2xl border border-emerald-800/80 bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-emerald-950/40 p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Trophy className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                    Highest Evaluated Candidate (Deterministic Ranking)
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {getConceptName(recommended_winner_id)}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {winner_rationale}
              </p>
            </div>

            {onSelectPrimaryThesis && (
              <button
                onClick={() => onSelectPrimaryThesis(recommended_winner_id)}
                disabled={selectedConceptId === recommended_winner_id}
                className={`self-start md:self-center px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                  selectedConceptId === recommended_winner_id
                    ? "bg-slate-800 text-emerald-400 border border-emerald-700/60 cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                }`}
              >
                {selectedConceptId === recommended_winner_id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Selected as Primary Thesis
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Adopt as Primary Thesis
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Side-by-Side Dimension Comparison Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Scale className="w-4 h-4 text-emerald-400" />
            Candidate Metric Comparison Matrix
          </div>
          <span className="text-[11px] text-slate-400">
            {rankings.length} Candidate Concepts Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
                <th className="py-3 px-4 w-52">Evaluation Dimension</th>
                {rankings.map((cand, idx) => (
                  <th key={cand.concept_id} className="py-3 px-4 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-white font-bold truncate max-w-[150px]">
                        {getConceptName(cand.concept_id)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {DIMENSIONS.map(({ key, label, isComposite }) => {
                const isComp = !!isComposite;
                return (
                  <tr
                    key={key}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isComp ? "bg-slate-950/80 font-bold" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-sans text-slate-300 text-xs">
                      {label}
                    </td>
                    {rankings.map((cand) => {
                      const val = isComp
                        ? cand.composite_score
                        : cand.dimension_scores[key as keyof typeof cand.dimension_scores] ?? 50;

                      let colorClass = "text-slate-300";
                      if (val >= 75) colorClass = "text-emerald-400";
                      else if (val >= 60) colorClass = "text-cyan-400";
                      else if (val >= 45) colorClass = "text-amber-400";
                      else colorClass = "text-rose-400";

                      return (
                        <td key={cand.concept_id} className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${colorClass}`}>
                              {val.toFixed(1)}
                            </span>
                            {!isComp && (
                              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    val >= 75
                                      ? "bg-emerald-500"
                                      : val >= 60
                                      ? "bg-cyan-500"
                                      : val >= 45
                                      ? "bg-amber-500"
                                      : "bg-rose-500"
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Recommendation Row */}
              <tr className="bg-slate-950/40">
                <td className="py-3 px-4 font-sans text-slate-300 text-xs font-semibold">
                  Recommendation
                </td>
                {rankings.map((cand) => (
                  <td key={cand.concept_id} className="py-3 px-4 font-sans">
                    <span className="text-[11px] font-bold text-slate-300">
                      {cand.recommendation.replace(/_/g, " ")}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pairwise Trade-Off Matrix */}
      {Object.keys(tradeoff_matrix).length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <ArrowRight className="w-4 h-4 text-emerald-400" />
            Pairwise Trade-Off Analysis Matrix
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(tradeoff_matrix).flatMap(([c1, comparisons]) =>
              Object.entries(comparisons).map(([c2, rationale]) => (
                <div
                  key={`${c1}-vs-${c2}`}
                  className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="text-emerald-400 truncate">{getConceptName(c1)}</span>
                    <span className="text-slate-500 px-2 font-mono text-[10px]">vs</span>
                    <span className="text-slate-400 truncate">{getConceptName(c2)}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {rationale}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
