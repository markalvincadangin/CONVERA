"use client";

import React, { useState } from "react";
import {
  X,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Save,
  HelpCircle,
} from "lucide-react";
import type {
  ConceptEvaluationRecord,
  EvaluationRecommendation,
  HumanReviewRequest,
} from "@/types/evaluation";
import { evaluationService } from "@/services/evaluationService";

interface HumanReviewModalProps {
  isOpen: boolean;
  evaluation: ConceptEvaluationRecord | null;
  conceptTitle?: string;
  onClose: () => void;
  onSaved: (updated: ConceptEvaluationRecord) => void;
}

const DIMENSION_KEYS = [
  { key: "problem_relevance", label: "Problem Relevance", weight: "20%" },
  { key: "evidence_grounding", label: "Evidence Grounding", weight: "15%" },
  { key: "gap_validity", label: "Gap Validity", weight: "15%" },
  { key: "stakeholder_impact", label: "Stakeholder Impact", weight: "15%" },
  { key: "technical_feasibility", label: "Technical Feasibility", weight: "15%" },
  { key: "novelty_contribution", label: "Novelty & Contribution", weight: "10%" },
  { key: "methodology_fit", label: "Methodology Fit", weight: "10%" },
] as const;

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  isOpen,
  evaluation,
  conceptTitle,
  onClose,
  onSaved,
}) => {
  if (!isOpen || !evaluation) return null;

  const [scores, setScores] = useState({ ...evaluation.dimension_scores });
  const [recommendation, setRecommendation] = useState<EvaluationRecommendation>(
    evaluation.recommendation
  );
  const [reviewerNotes, setReviewerNotes] = useState(
    evaluation.narrative_summary || ""
  );
  const [falsificationAdvisory, setFalsificationAdvisory] = useState(
    evaluation.falsification_advisory || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScoreChange = (dim: keyof typeof scores, val: number) => {
    setScores((prev) => ({ ...prev, [dim]: val }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const payload: HumanReviewRequest = {
        concept_id: evaluation.concept_id,
        session_id: evaluation.session_id,
        dimension_scores: scores,
        recommendation,
        reviewer_notes: reviewerNotes,
        falsification_advisory: falsificationAdvisory,
      };
      const result = await evaluationService.submitHumanReview(payload);
      onSaved(result);
      onClose();
    } catch (err: any) {
      console.error("Failed to save human review:", err);
      setErrorMsg(err?.message || "Failed to persist human expert review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">
                Human Expert Review &amp; Stage Gate 3 Sign-Off
              </h2>
              <p className="text-xs text-slate-400">
                {conceptTitle || evaluation.concept_id} (Constitutional Article IV Human Sovereignty)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dimension Score Sliders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Adjust 7-Dimension Rubric Scores
              </span>
              <span className="text-[11px] text-slate-400">
                Ranges: 0 - 100
              </span>
            </div>

            <div className="space-y-3">
              {DIMENSION_KEYS.map(({ key, label, weight }) => {
                const currentVal = scores[key] ?? 50;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        {label} <span className="text-slate-500 text-[10px]">({weight})</span>
                      </span>
                      <span className="font-mono font-bold text-white text-xs">
                        {currentVal.toFixed(0)} / 100
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={currentVal}
                      onChange={(e) => handleScoreChange(key, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gate 3 Recommendation Override */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              Formal Stage Gate 3 Clearance Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  "RECOMMENDED",
                  "VIABLE_WITH_REFINEMENT",
                  "HIGH_RISK_REVISE",
                  "REJECT",
                ] as EvaluationRecommendation[]
              ).map((rec) => (
                <button
                  key={rec}
                  type="button"
                  onClick={() => setRecommendation(rec)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    recommendation === rec
                      ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-md"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      recommendation === rec ? "text-emerald-400" : "text-transparent"
                    }`}
                  />
                  <span>{rec.replace(/_/g, " ")}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Falsification Condition Advisory */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Popperian Falsification Metric (Article II Guardrail)
            </label>
            <textarea
              rows={2}
              value={falsificationAdvisory}
              onChange={(e) => setFalsificationAdvisory(e.target.value)}
              placeholder="What specific experimental outcome or empirical metric would falsify this concept?"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          {/* Qualitative Review Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              Human Reviewer Qualitative Synthesis
            </label>
            <textarea
              rows={3}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Enter doctoral supervisor, peer review, or principal investigator notes..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-950/50 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Persisting Review..." : "Certify Human Review"}
          </button>
        </div>
      </div>
    </div>
  );
};
