"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { ProblemRecord } from "@/lib/types";
import { executeCriticAgent, CriticalReviewReport } from "@/services/agentService";
import {
  Flame,
  AlertTriangle,
  Target,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";

interface SocraticCriticModalProps {
  problem: ProblemRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyReframing: (newStatement: string) => void;
}

export const SocraticCriticModal: React.FC<SocraticCriticModalProps> = ({
  problem,
  isOpen,
  onClose,
  onApplyReframing,
}) => {
  const [report, setReport] = useState<CriticalReviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCritique = async () => {
    if (!problem) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await executeCriticAgent({
        problem_statement: problem.problem_statement,
        sector: problem.sector,
        target_user: problem.sufferer_occupation,
        current_workaround: problem.workaround || "",
        quantified_impact: problem.quantified_impact,
      });
      setReport(data);
    } catch (err: any) {
      setError(err?.message || "Failed to execute Socratic Critic Agent.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && problem) {
      runCritique();
    } else {
      setReport(null);
      setError(null);
    }
  }, [isOpen, problem?.id]);

  if (!problem) return null;

  const getVerdictBadge = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case "ROBUST":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Robust Evidence
          </span>
        );
      case "CRITICAL_FLAWS":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Critical Flaws Detected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Vulnerable Premise
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Socratic Interrogator & Mom Test Critic"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header Pitch Box */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" /> Target Problem Statement
            </span>
            <span className="text-slate-500">{problem.sector}</span>
          </div>
          <p className="text-sm font-medium text-slate-200">{problem.problem_statement}</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">
              Interrogating problem claims using The Mom Test rules...
            </p>
            <p className="text-xs text-slate-500 max-w-md">
              Attacking unvalidated assumptions, detecting status-quo inertia, and isolating fatal kill questions.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="secondary" onClick={runCritique}>
              Retry
            </Button>
          </div>
        )}

        {/* Report Output */}
        {report && !isLoading && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Score Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Plausibility Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{report.plausibility_score}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
              </div>
              <div>{getVerdictBadge(report.verdict)}</div>
            </div>

            {/* Fatal Kill Question Card */}
            <div className="p-4 bg-gradient-to-r from-amber-950/40 to-slate-900/60 rounded-2xl border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Target className="w-4 h-4 text-amber-400" />
                Fatal Kill Question (Primary Falsification Test)
              </div>
              <p className="text-sm font-semibold text-amber-200 italic leading-relaxed">
                "{report.fatal_kill_question}"
              </p>
            </div>

            {/* Status-Quo Inertia */}
            <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                Status-Quo Inertia (Why Users Tolerate the Friction)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{report.status_quo_inertia}</p>
            </div>

            {/* Assumption Attacks Grid */}
            {report.assumption_attacks.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Vulnerable Assumptions Under Attack
                </span>
                <div className="space-y-2">
                  {report.assumption_attacks.map((attack, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900/50 rounded-xl border border-rose-500/20 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{attack}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hardened Reframing Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Hardened Empirical Reframing
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onApplyReframing(report.hardened_reframing)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Apply Reframing
                </Button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {report.hardened_reframing}
              </p>
            </div>

            {/* Next Field Action */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-slate-200">Recommended Field Action:</strong>{" "}
                {report.recommended_field_action}
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <Button
            size="sm"
            variant="ghost"
            onClick={runCritique}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Re-run Critique
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
