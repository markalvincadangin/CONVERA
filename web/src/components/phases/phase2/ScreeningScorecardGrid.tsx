"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, User, Sparkles, Filter, Info, ShieldCheck, MapPin, Tag, Flame, HelpCircle } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Tooltip } from "@/components/common/Tooltip";
import { problemService } from "@/services/problemService";
import { ProblemRecord } from "@/lib/types";
import { sanitizeText, sanitizeProblemId } from "@/lib/sanitize";

export interface ScreeningResultItem {
  problem_id: string;
  sufferer?: string;
  problem_statement?: string;
  statement?: string;
  description?: string;
  criteria?: {
    pain_plausibility?: any;
    frequency_urgency?: any;
    frequency_urgency_plausibility?: any;
    local_market_size?: any;
    local_market_size_plausibility?: any;
    existing_sacrifice?: any;
    access_ability?: any;
    access_ability_to_research?: any;
  };
  scores?: any;
  origin_tags?: string[];
  red_flags?: string[];
  verdict: "ADVANCE" | "SECOND_LOOK" | "PARK" | string;
  second_look_exit_condition?: string | null;
  kill_reason?: string | null;
  winnability?: any;
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
  const [dbProblems, setDbProblems] = useState<Record<string, ProblemRecord>>({});

  useEffect(() => {
    problemService.listProblems().then((probs) => {
      const map: Record<string, ProblemRecord> = {};
      probs.forEach((p) => {
        map[p.id] = p;
        map[sanitizeProblemId(p.id)] = p;
      });
      setDbProblems(map);
    }).catch(() => {});
  }, []);

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>ADVANCE TO VALIDATION</span>
        </span>
      );
    }
    if (v.includes("SECOND")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>SECOND LOOK (CONDITIONAL)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 whitespace-nowrap shadow-sm">
        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span>PARK / SHELVED</span>
      </span>
    );
  };

  const formatScore = (val: any): { score: string; tag: string | null; numeric: number } => {
    if (!val) return { score: "—", tag: null, numeric: 0 };
    if (typeof val === "object") {
      const s = val.score !== undefined ? String(val.score) : "—";
      const num = parseInt(s, 10) || 0;
      return {
        score: s !== "—" ? `${s}/5` : "—",
        tag: val.label || null,
        numeric: num,
      };
    }
    const str = String(val);
    const numMatch = str.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0], 10) : 0;
    const isDemonstrated = str.toLowerCase().includes("demonstrated");
    const isAssumed = str.toLowerCase().includes("assumed");
    return {
      score: num ? `${num}/5` : str,
      tag: isDemonstrated ? "Demonstrated" : isAssumed ? "Assumed" : null,
      numeric: num,
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

        <div className="flex items-center gap-2 text-[11px] text-slate-400 px-3 font-mono">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scores scale: 1 (Weak) to 5 (Extremely High)</span>
        </div>
      </div>

      {/* Grid of Problem Candidate Cards */}
      <div className="grid grid-cols-1 gap-5">
        {filteredResults.map((item, idx) => {
          const cleanId = sanitizeProblemId(item.problem_id || `CAND-${idx + 1}`);
          const dbProb = dbProblems[item.problem_id] || dbProblems[cleanId];

          // Statement fallback: item.problem_statement -> dbProb.problem_statement -> item.statement -> fallback
          const statement =
            item.problem_statement ||
            item.statement ||
            item.description ||
            dbProb?.problem_statement ||
            "Problem statement under active screening analysis.";

          // Sufferer fallback
          const sufferer =
            item.sufferer ||
            (dbProb ? `${dbProb.sufferer_occupation} in ${dbProb.sufferer_location}` : "Target user in Western Visayas");

          const isSelected = selectedProblem === statement;
          const isAdvance = item.verdict?.toUpperCase().includes("ADVANCE");
          const isSecondLook = item.verdict?.toUpperCase().includes("SECOND");

          // Extract criteria scores safely
          const crit = item.criteria || item.scores || {};
          const pain = formatScore(crit.pain_plausibility);
          const freq = formatScore(crit.frequency_urgency || crit.frequency_urgency_plausibility);
          const size = formatScore(crit.local_market_size || crit.local_market_size_plausibility);
          const sacrifice = formatScore(crit.existing_sacrifice);
          const access = formatScore(crit.access_ability || crit.access_ability_to_research);

          return (
            <Card
              key={cleanId}
              variant={isAdvance ? "glow" : "glass"}
              className={`p-6 space-y-5 transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-emerald-400 border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-500/10"
                  : isAdvance
                  ? "border-emerald-500/30 hover:border-emerald-500/60"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                    {cleanId}
                  </span>
                  {getVerdictBadge(item.verdict)}
                </div>

                {isAdvance && (
                  <Button
                    variant={isSelected ? "emerald" : "outline"}
                    size="sm"
                    onClick={() => onSelectProblem(statement)}
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
                    <span className="text-slate-200">{sanitizeText(sufferer)}</span>
                  </div>
                </div>

                {/* Problem Statement Box */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-100 font-medium leading-relaxed">
                  {sanitizeText(statement)}
                </div>

                {/* Quantified Impact / Workaround if available in DB */}
                {dbProb && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                    {dbProb.workaround && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 text-slate-300">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Workaround:</span>
                        <p className="mt-0.5 text-slate-300 font-sans">{sanitizeText(dbProb.workaround)}</p>
                      </div>
                    )}
                    {dbProb.quantified_impact && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 text-emerald-400">
                        <span className="text-[10px] text-emerald-500 uppercase font-bold block">Quantified Impact:</span>
                        <p className="mt-0.5 text-emerald-300 font-sans">{sanitizeText(dbProb.quantified_impact)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 5-Criteria Scores Meter */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  5 Core Screening Criteria (1-5 Rubric)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  {/* Pain */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">1. Pain Plausibility</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-sm">{pain.score}</span>
                      {pain.tag && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          pain.tag.toLowerCase().includes("demonstrated")
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {pain.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Frequency / Urgency */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">2. Frequency / Urgency</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-sm">{freq.score}</span>
                      {freq.tag && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          freq.tag.toLowerCase().includes("demonstrated")
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {freq.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Local Market Size */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">3. Local Market Size</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-sm">{size.score}</span>
                      {size.tag && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          size.tag.toLowerCase().includes("demonstrated")
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {size.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Existing Sacrifice */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">4. Existing Sacrifice</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-sm">{sacrifice.score}</span>
                      {sacrifice.tag && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          sacrifice.tag.toLowerCase().includes("demonstrated")
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {sacrifice.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Access & Research */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">5. Access & Research</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-sm">{access.score}</span>
                      {access.tag && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          access.tag.toLowerCase().includes("demonstrated")
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {access.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Look Mandatory Exit Condition */}
              {isSecondLook && item.second_look_exit_condition && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-mono">Mandatory Exit Condition: </strong>
                    <span>{sanitizeText(item.second_look_exit_condition)}</span>
                  </div>
                </div>
              )}

              {/* Kill Reason if Parked */}
              {item.kill_reason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-300 font-mono">Shelved Reason: </strong>
                    <span>{sanitizeText(item.kill_reason)}</span>
                  </div>
                </div>
              )}

              {/* Origin Pattern Tags */}
              {item.origin_tags && item.origin_tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 font-mono">Origin Pattern:</span>
                  {item.origin_tags.map((t, tidx) => (
                    <span
                      key={tidx}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium"
                    >
                      {sanitizeText(t)}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
