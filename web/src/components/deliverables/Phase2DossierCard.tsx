"use client";

import React, { useState } from "react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Code2,
  FileText,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  ShieldAlert,
  BarChart3,
} from "lucide-react";

interface Phase2ResultItem {
  problem_id: string;
  sufferer: string;
  problem_statement: string;
  scores?: {
    pain_plausibility?: string;
    frequency_urgency_plausibility?: string;
    market_anchor_plausibility?: string;
    active_workaround_cost?: string;
  };
  origin_tags?: string[];
  red_flags?: string[];
  verdict: "ADVANCE" | "SECOND_LOOK" | "PARK" | string;
  second_look_exit_condition?: string | null;
  kill_reason?: string | null;
}

interface Phase2JsonPayload {
  evaluator_role?: string;
  results?: Phase2ResultItem[];
}

interface Phase2DossierCardProps {
  rawContent: string;
}

export const Phase2DossierCard: React.FC<Phase2DossierCardProps> = ({ rawContent }) => {
  const [showRaw, setShowRaw] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Attempt to parse JSON
  let parsedPayload: Phase2JsonPayload | null = null;
  try {
    const match = rawContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const jsonStr = match ? match[1] : rawContent.trim();
    if (jsonStr.startsWith("{") && jsonStr.endsWith("}")) {
      parsedPayload = JSON.parse(jsonStr);
    }
  } catch (e) {
    parsedPayload = null;
  }

  const results = parsedPayload?.results || [];

  if (showRaw || !parsedPayload || results.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Raw JSON Output
          </span>
          {parsedPayload && (
            <button
              onClick={() => setShowRaw(false)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
            >
              <FileText className="w-3.5 h-3.5" /> Switch to Formatted View
            </button>
          )}
        </div>
        <div className="max-h-[500px] overflow-y-auto p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap">
          <MarkdownRenderer content={rawContent} />
        </div>
      </div>
    );
  }

  const advanceCount = results.filter((r) => r.verdict === "ADVANCE").length;
  const secondLookCount = results.filter((r) => r.verdict === "SECOND_LOOK").length;
  const parkCount = results.filter((r) => r.verdict === "PARK").length;

  const displayResults = isExpanded ? results : results.slice(0, 3);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "ADVANCE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> ADVANCE
          </span>
        );
      case "SECOND_LOOK":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> SECOND LOOK
          </span>
        );
      case "PARK":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> PARK
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {verdict}
          </span>
        );
    }
  };

  const parseScoreNumber = (scoreStr?: string) => {
    if (!scoreStr) return "-";
    const match = scoreStr.match(/^(\d+)/);
    return match ? `${match[1]}/5` : scoreStr;
  };

  return (
    <div className="space-y-4">
      {/* Triage Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white font-mono">
            Triage Summary:
          </span>
          <div className="flex items-center gap-1.5">
            {advanceCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                {advanceCount} Advance
              </span>
            )}
            {secondLookCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                {secondLookCount} Second Look
              </span>
            )}
            {parkCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                {parkCount} Park
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowRaw(true)}
          className="text-[10px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
        >
          <Code2 className="w-3 h-3" /> Raw JSON
        </button>
      </div>

      {/* Candidate Cards List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {displayResults.map((item, idx) => (
          <div
            key={item.problem_id || idx}
            className={`p-4 rounded-xl border space-y-3 transition-all ${
              item.verdict === "ADVANCE"
                ? "bg-slate-950/90 border-emerald-500/30 hover:border-emerald-500/50 shadow-sm"
                : item.verdict === "SECOND_LOOK"
                ? "bg-slate-950/90 border-amber-500/30 hover:border-amber-500/50"
                : "bg-slate-950/80 border-slate-800 opacity-80"
            }`}
          >
            {/* Header: Problem ID & Verdict */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-extrabold text-xs bg-slate-900 text-cyan-300 border border-slate-700">
                  {item.problem_id}
                </span>
                <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {item.sufferer}
                </span>
              </div>
              {getVerdictBadge(item.verdict)}
            </div>

            {/* Problem Statement */}
            <p className="text-xs text-slate-300 leading-relaxed pl-1 border-l-2 border-slate-800">
              {item.problem_statement}
            </p>

            {/* 4-Criteria Plausibility Scores */}
            {item.scores && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono">
                <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[9px]">Pain:</span>
                  <span className="font-bold text-cyan-300">{parseScoreNumber(item.scores.pain_plausibility)}</span>
                </div>
                <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[9px]">Urgency:</span>
                  <span className="font-bold text-teal-300">{parseScoreNumber(item.scores.frequency_urgency_plausibility)}</span>
                </div>
                <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[9px]">Market:</span>
                  <span className="font-bold text-purple-300">{parseScoreNumber(item.scores.market_anchor_plausibility)}</span>
                </div>
                <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[9px]">Workaround:</span>
                  <span className="font-bold text-amber-300">{parseScoreNumber(item.scores.active_workaround_cost)}</span>
                </div>
              </div>
            )}

            {/* Exit Condition or Kill Reason Callouts */}
            {item.second_look_exit_condition && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[10px] uppercase tracking-wider text-amber-400 font-mono">
                    Second Look Exit Condition:
                  </strong>
                  <span>{item.second_look_exit_condition}</span>
                </div>
              </div>
            )}

            {item.kill_reason && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-200 flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[10px] uppercase tracking-wider text-rose-400 font-mono">
                    Park / Kill Reason:
                  </strong>
                  <span>{item.kill_reason}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expand / Collapse Button */}
      {results.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-all"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Collapse to Top 3
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> View All {results.length} Evaluated Problems
            </>
          )}
        </button>
      )}
    </div>
  );
};
