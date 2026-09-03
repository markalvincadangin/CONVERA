"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { ProblemRecord, DevilsAdvocateReport } from "@/lib/types";
import { problemService } from "@/services/problemService";
import {
  Flame,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Crosshair,
  Sparkles,
} from "lucide-react";

interface DevilsAdvocateModalProps {
  problem: ProblemRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyReframing?: (newStatement: string) => void;
}

export const DevilsAdvocateModal: React.FC<DevilsAdvocateModalProps> = ({
  problem,
  isOpen,
  onClose,
  onApplyReframing,
}) => {
  const [report, setReport] = useState<DevilsAdvocateReport | null>(
    problem?.devils_advocate_data || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (problem?.devils_advocate_data) {
      setReport(problem.devils_advocate_data);
    }
  }, [problem]);

  if (!problem) return null;

  const handleRunChallenge = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await problemService.challengeProblem(problem.id);
      setReport(res.critique);
    } catch (err: any) {
      setError(err.message || "Devil's Advocate challenge failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const verdictBadge = (verdict?: string) => {
    if (verdict === "DEFENSIBLE") {
      return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Defensible Claim
        </span>
      );
    }
    if (verdict === "VULNERABLE") {
      return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Vulnerable Assumptions
        </span>
      );
    }
    return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30">
         Heavily Challenged
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Devil's Advocate Stress-Test: ${problem.id}`}
      maxWidth="4xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Target Problem Reference Card */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-slate-300">
              Problem Thesis Under Attack
            </span>
            <span className="font-mono text-cyan-400">{problem.sector}</span>
          </div>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {problem.problem_statement}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
            <span>
              <strong>Target:</strong> {problem.sufferer_occupation} in {problem.sufferer_location}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {!report && !isLoading ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
              <Flame className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Adversarial Sparring Ready</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Counteract AI sycophancy. The Devil's Advocate agent will aggressively attack your assumptions, expose evidence holes, and give you the fatal kill questions before you waste time.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleRunChallenge}
              leftIcon={<Flame className="w-4 h-4" />}
              className="shadow-lg shadow-red-500/20"
            >
              Unleash Devil's Advocate
            </Button>
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Spinner size="lg" label="Devil's Advocate agent is attacking assumptions and looking for fatal flaws..." />
          </div>
        ) : report ? (
          <div className="space-y-5">
            {/* Top Score & Verdict Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center font-mono font-extrabold text-sm">
                  {report.plausibility_score}%
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Plausibility Rating
                  </span>
                  <p className="text-xs font-semibold text-white">
                    {report.plausibility_score >= 70
                      ? "Resilient against basic scrutiny"
                      : "High vulnerability to real-world friction"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {verdictBadge(report.verdict)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRunChallenge}
                  leftIcon={<RotateCcw className="w-3 h-3" />}
                >
                  Re-test
                </Button>
              </div>
            </div>

            {/* Fatal Kill Question */}
            <div className="p-4 bg-red-950/40 rounded-2xl border border-red-500/40 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-2 text-red-400">
                <Crosshair className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  The Fatal Kill Question
                </span>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed pl-6 border-l-2 border-red-500">
                "{report.fatal_kill_question}"
              </p>
              <p className="text-[11px] text-red-200/80 pl-6">
                If your team cannot answer this with concrete evidence, this startup thesis will collapse in Phase 3.
              </p>
            </div>

            {/* 2-Column: Assumption Attacks & Evidence Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assumption Attacks */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Fragile Assumption Attacks ({report.assumption_attacks?.length || 0})
                  </h4>
                </div>
                <ul className="space-y-2 text-xs">
                  {report.assumption_attacks?.map((attack, i) => (
                    <li
                      key={i}
                      className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 text-slate-200 leading-relaxed flex items-start gap-2"
                    >
                      <span className="text-amber-400 font-bold font-mono">0{i + 1}.</span>
                      <span>{attack}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Evidence Gaps */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <HelpCircle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Evidence Deficits ({report.evidence_gaps?.length || 0})
                  </h4>
                </div>
                <ul className="space-y-2 text-xs">
                  {report.evidence_gaps?.map((gap, i) => (
                    <li
                      key={i}
                      className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 text-slate-200 leading-relaxed flex items-start gap-2"
                    >
                      <span className="text-cyan-400 font-bold font-mono">0{i + 1}.</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Status Quo Inertia */}
            {report.status_quo_inertia && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
                  Status Quo Inertia Risk
                </span>
                <p className="text-slate-300 leading-relaxed">{report.status_quo_inertia}</p>
              </div>
            )}

            {/* Hardened Reframing Recommendation */}
            {report.hardened_reframing && (
              <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-teal-950/40 rounded-2xl border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Hardened Problem Reframing
                  </span>
                  {onApplyReframing && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onApplyReframing(report.hardened_reframing)}
                      leftIcon={<CheckCircle className="w-3 h-3" />}
                    >
                      Apply Reframing
                    </Button>
                  )}
                </div>
                <p className="text-xs text-white font-medium italic bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  "{report.hardened_reframing}"
                </p>
              </div>
            )}

            {/* Action for Phase 3 Fieldwork */}
            {report.recommended_field_action && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Recommended Primary Field Action
                </span>
                <p className="text-slate-300">{report.recommended_field_action}</p>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
