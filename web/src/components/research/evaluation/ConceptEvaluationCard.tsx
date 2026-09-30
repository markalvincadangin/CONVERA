"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  UserCheck,
} from "lucide-react";
import type { ConceptEvaluationRecord, EvaluationRecommendation } from "@/types/evaluation";

interface ConceptEvaluationCardProps {
  evaluation: ConceptEvaluationRecord;
  conceptTitle?: string;
  conceptDescription?: string;
  onOpenReviewModal?: (evaluation: ConceptEvaluationRecord) => void;
}

const DIMENSION_METADATA = [
  { key: "problem_relevance", label: "Problem Relevance", weight: "20%" },
  { key: "evidence_grounding", label: "Evidence Grounding", weight: "15%" },
  { key: "gap_validity", label: "Gap Validity", weight: "15%" },
  { key: "stakeholder_impact", label: "Stakeholder Impact", weight: "15%" },
  { key: "technical_feasibility", label: "Technical Feasibility", weight: "15%" },
  { key: "novelty_contribution", label: "Novelty & Contribution", weight: "10%" },
  { key: "methodology_fit", label: "Methodology Fit", weight: "10%" },
] as const;

export const ConceptEvaluationCard: React.FC<ConceptEvaluationCardProps> = ({
  evaluation,
  conceptTitle,
  conceptDescription,
  onOpenReviewModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRecommendationBadge = (rec: EvaluationRecommendation) => {
    switch (rec) {
      case "RECOMMENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Recommended
          </span>
        );
      case "VIABLE_WITH_REFINEMENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Viable with Refinement
          </span>
        );
      case "HIGH_RISK_REVISE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            High Risk Revise
          </span>
        );
      case "REJECT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-sm">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Reject / Re-anchor
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 45) return "text-amber-400";
    return "text-rose-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 60) return "bg-cyan-500";
    if (score >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl transition-all hover:border-slate-700 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {evaluation.concept_id}
            </span>
            {evaluation.evaluator_type === "HUMAN_EXPERT" ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded">
                <UserCheck className="w-3 h-3" /> Human Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                <Cpu className="w-3 h-3" /> Rubric + AI
              </span>
            )}
            {evaluation.is_degraded && (
              <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                Offline Mode
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            {conceptTitle || `Concept ${evaluation.concept_id}`}
          </h3>
          {conceptDescription && (
            <p className="text-xs text-slate-400 line-clamp-2">{conceptDescription}</p>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Composite Score
            </div>
            <div className={`text-2xl font-black font-mono ${getScoreColor(evaluation.composite_score)}`}>
              {evaluation.composite_score.toFixed(1)}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>
          {getRecommendationBadge(evaluation.recommendation)}
        </div>
      </div>

      {/* 7-Dimension Score Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {DIMENSION_METADATA.map(({ key, label, weight }) => {
          const val = evaluation.dimension_scores[key] ?? 50;
          return (
            <div
              key={key}
              className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium truncate">{label}</span>
                <span className="font-mono font-bold text-white text-xs">
                  {val.toFixed(0)}%{" "}
                  <span className="text-[10px] text-slate-500">({weight})</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(val)}`}
                  style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Strengths & Vulnerabilities Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {evaluation.strengths.length > 0 && (
          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Empirical Strengths
            </div>
            <ul className="space-y-1">
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.vulnerabilities.length > 0 && (
          <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Methodological Vulnerabilities
            </div>
            <ul className="space-y-1">
              {evaluation.vulnerabilities.map((vuln, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>{vuln}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Falsification Advisory Callout (Article II Socratic Interrogation) */}
      {evaluation.falsification_advisory && (
        <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/30 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            Popperian Falsification Metric (Article II Guardrail)
          </div>
          <p className="text-xs text-indigo-200/90 leading-relaxed font-mono">
            {evaluation.falsification_advisory}
          </p>
        </div>
      )}

      {/* Expandable Qualitative Narrative & Human Review */}
      <div className="pt-1 flex items-center justify-between">
        {evaluation.narrative_summary ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Hide Narrative Critique
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> View Qualitative Critique
              </>
            )}
          </button>
        ) : (
          <span />
        )}

        {onOpenReviewModal && (
          <button
            onClick={() => onOpenReviewModal(evaluation)}
            className="rounded-xl border border-purple-700/60 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Human Expert Review / Gate 3 Sign-Off
          </button>
        )}
      </div>

      {isExpanded && evaluation.narrative_summary && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
          {evaluation.narrative_summary}
        </div>
      )}
    </div>
  );
};
