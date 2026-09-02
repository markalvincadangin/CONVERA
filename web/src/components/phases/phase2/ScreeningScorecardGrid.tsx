"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, User, Sparkles, Filter, Info } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Tooltip } from "@/components/common/Tooltip";

export interface ScreeningResultItem {
  problem_id: string;
  sufferer: string;
  problem_statement: string;
  scores?: {
    pain_plausibility?: string | number;
    frequency_urgency_plausibility?: string | number;
    local_market_size_plausibility?: string | number;
    existing_sacrifice?: string | number;
    access_ability_to_research?: string | number;
  };
  origin_tags?: string[];
  red_flags?: string[];
  verdict: "ADVANCE" | "SECOND_LOOK" | "PARK" | string;
  second_look_exit_condition?: string | null;
  kill_reason?: string | null;
}

interface ScreeningScorecardGridProps {
  data: {
    evaluator_role?: string;
    results: ScreeningResultItem[];
  };
  onSelectProblem: (problemStatement: string) => void;
  selectedProblem?: string;
}

export const ScreeningScorecardGrid: React.FC<ScreeningScorecardGridProps> = ({
  data,
  onSelectProblem,
  selectedProblem = "",
}) => {
  const [filter, setFilter] = useState<"ALL" | "ADVANCE" | "SECOND_LOOK" | "PARK">("ALL");

  const results = data.results || [];

  const counts = {
    ALL: results.length,
    ADVANCE: results.filter((r) => r.verdict?.toUpperCase().includes("ADVANCE")).length,
    SECOND_LOOK: results.filter((r) => r.verdict?.toUpperCase().includes("SECOND")).length,
    PARK: results.filter((r) => r.verdict?.toUpperCase().includes("PARK")).length,
  };

  const filteredResults = results.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "ADVANCE") return r.verdict?.toUpperCase().includes("ADVANCE");
    if (filter === "SECOND_LOOK") return r.verdict?.toUpperCase().includes("SECOND");
    if (filter === "PARK") return r.verdict?.toUpperCase().includes("PARK");
    return true;
  });

  const getVerdictBadge = (verdict: string) => {
    const v = verdict?.toUpperCase() || "";
    if (v.includes("ADVANCE")) {
      return (
        <Tooltip content="Cleared all 5 screening criteria + winnability check. Ready for Phase 3 Customer Discovery (Mom Test protocol).">
          <Badge variant="emerald" dot size="md">
            ADVANCE TO VALIDATION
          </Badge>
        </Tooltip>
      );
    }
    if (v.includes("SECOND")) {
      return (
        <Tooltip content="Promising candidate, but requires verifying the mandatory exit condition before entering solution design.">
          <Badge variant="amber" dot size="md">
            SECOND LOOK (CONDITIONAL)
          </Badge>
        </Tooltip>
      );
    }
    return (
      <Tooltip content="Encountered fatal red flags (e.g. low pain, impossible access, or unviable unit economics). Shelved.">
        <Badge variant="rose" dot size="md">
          PARK / SHELVED
        </Badge>
      </Tooltip>
    );
  };

  const formatScore = (val: string | number | undefined): { score: string; tag: string | null } => {
    if (!val) return { score: "0/5", tag: null };
    const str = String(val);
    const num = str.match(/\d+/);
    const isDemonstrated = str.toLowerCase().includes("demonstrated");
    const isAssumed = str.toLowerCase().includes("assumed");
    return {
      score: num ? `${num[0]}/5` : str,
      tag: isDemonstrated ? "Demonstrated" : isAssumed ? "Assumed" : null,
    };
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "ALL"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Candidates ({counts.ALL})
          </button>
          <button
            onClick={() => setFilter("ADVANCE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "ADVANCE"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Advance to Validation ({counts.ADVANCE})
          </button>
          <button
            onClick={() => setFilter("SECOND_LOOK")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "SECOND_LOOK"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Second Look ({counts.SECOND_LOOK})
          </button>
          <button
            onClick={() => setFilter("PARK")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "PARK"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Parked ({counts.PARK})
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 px-3">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scores scale: 1 (Weak) to 5 (Extremely High)</span>
        </div>
      </div>

      {/* Grid of Problem Candidate Cards */}
      <div className="grid grid-cols-1 gap-5">
        {filteredResults.map((item, idx) => {
          const isSelected = selectedProblem === item.problem_statement;
          const isAdvance = item.verdict?.toUpperCase().includes("ADVANCE");

          return (
            <Card
              key={item.problem_id || idx}
              variant={isAdvance ? "glow" : "glass"}
              className={`p-6 space-y-5 transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-emerald-400 border-emerald-500/60 bg-emerald-950/15"
                  : isAdvance
                  ? "border-emerald-500/30 hover:border-emerald-500/60"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                    {item.problem_id || `CAND-${idx + 1}`}
                  </span>
                  {getVerdictBadge(item.verdict)}
                </div>

                {isAdvance && (
                  <Button
                    variant={isSelected ? "emerald" : "outline"}
                    size="sm"
                    onClick={() => onSelectProblem(item.problem_statement)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    {isSelected ? "Selected for Validation" : "Select for Validation"}
                  </Button>
                )}
              </div>

              {/* Problem Details */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-slate-300">
                  <User className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Target Sufferer & Location: </strong>
                    <span>{item.sufferer}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-100 font-medium leading-relaxed">
                  {item.problem_statement}
                </div>
              </div>

              {/* 5-Criteria Scores Meter */}
              {item.scores && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Screening Criteria Evaluation (1–5)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                    {/* Pain */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">1. Pain Plausibility</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-sm">
                          {formatScore(item.scores.pain_plausibility).score}
                        </span>
                        {formatScore(item.scores.pain_plausibility).tag && (
                          <Tooltip content={formatScore(item.scores.pain_plausibility).tag === "Demonstrated" ? "Verified via real Iloilo statistics/field data" : "Hypothesized estimate"}>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                              {formatScore(item.scores.pain_plausibility).tag}
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    {/* Frequency */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">2. Frequency / Urgency</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-sm">
                          {formatScore(item.scores.frequency_urgency_plausibility).score}
                        </span>
                        {formatScore(item.scores.frequency_urgency_plausibility).tag && (
                          <Tooltip content={formatScore(item.scores.frequency_urgency_plausibility).tag === "Demonstrated" ? "Verified recurring pattern" : "Hypothesized estimate"}>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                              {formatScore(item.scores.frequency_urgency_plausibility).tag}
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    {/* Market Size */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">3. Local Market Size</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-sm">
                          {formatScore(item.scores.local_market_size_plausibility).score}
                        </span>
                        {formatScore(item.scores.local_market_size_plausibility).tag && (
                          <Tooltip content="Estimated total addressable sufferer population in Panay">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                              {formatScore(item.scores.local_market_size_plausibility).tag}
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    {/* Sacrifice */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">4. Existing Sacrifice</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-sm">
                          {formatScore(item.scores.existing_sacrifice).score}
                        </span>
                        {formatScore(item.scores.existing_sacrifice).tag && (
                          <Tooltip content="Quantified money, hours, or crops lost coping right now">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                              {formatScore(item.scores.existing_sacrifice).tag}
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    {/* Access */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">5. Access to Research</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-sm">
                          {formatScore(item.scores.access_ability_to_research).score}
                        </span>
                        {formatScore(item.scores.access_ability_to_research).tag && (
                          <Tooltip content="Feasibility for student founders to interview these sufferers in person">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                              {formatScore(item.scores.access_ability_to_research).tag}
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Second Look Exit Condition Callout */}
              {item.second_look_exit_condition && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-100">Mandatory Second-Look Exit Condition: </strong>
                    <span className="leading-relaxed">{item.second_look_exit_condition}</span>
                  </div>
                </div>
              )}

              {/* Red flags */}
              {item.red_flags && item.red_flags.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-100">Fatal Red Flags Detected: </strong>
                    <span>{item.red_flags.join(", ")}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
