"use client";

import React, { useState } from "react";
import { ProblemRecord, DecisionSynthesis } from "@/lib/types";
import { problemService } from "@/services/problemService";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import {
  Layers,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  BookOpen,
  User,
  MapPin,
  History,
  Check,
  Scale,
} from "lucide-react";

interface DecisionRoomWorkspaceProps {
  candidates: ProblemRecord[];
  sessionId?: string;
  onSelectWinningProblem: (problem: ProblemRecord) => void;
  onOpenTimeline?: () => void;
}

export const DecisionRoomWorkspace: React.FC<DecisionRoomWorkspaceProps> = ({
  candidates,
  sessionId,
  onSelectWinningProblem,
  onOpenTimeline,
}) => {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string>(candidates[0]?.id || "");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesis, setSynthesis] = useState<DecisionSynthesis | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  const handleSynthesize = async () => {
    if (candidates.length === 0) return;
    setIsSynthesizing(true);
    try {
      const res = await problemService.synthesizeDecisionRoom(candidates.map((c) => c.id));
      setSynthesis(res.synthesis);
      if (res.synthesis.recommended_winner_id) {
        setSelectedId(res.synthesis.recommended_winner_id);
      }
    } catch (err: any) {
      toast.error(err?.message || "Decision synthesis error", "Synthesis Error");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCommitDecision = async () => {
    const winner = candidates.find((c) => c.id === selectedId) || candidates[0];
    if (!winner) return;

    setIsCommitting(true);
    try {
      const rejected = candidates.filter((c) => c.id !== winner.id).map((c) => c.id);
      const rationale =
        synthesis?.recommendation_summary ||
        `Selected ${winner.id} over alternatives due to superior baseline evidence and quantified friction.`;

      await problemService.commitDecision({
        session_id: sessionId,
        stage: "PHASE_2_DECISION_ROOM",
        selected_problem_id: winner.id,
        rejected_problem_ids: rejected,
        decision_rationale: rationale,
        supporting_evidence_ids: winner.sources?.map((s) => s.source_url || s.source_name) || [],
      });

      onSelectWinningProblem(winner);
    } catch (err: any) {
      toast.error(err?.message || "Failed to commit decision", "Commit Error");
    } finally {
      setIsCommitting(false);
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3 font-sans">
        <Scale className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="font-bold text-white text-sm">No Candidate Problems in Decision Room</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Select 2 to 4 candidate problems from the Problem Bank to begin evidence-backed triage.
        </p>
      </div>
    );
  }

  const activeProblem = candidates.find((c) => c.id === selectedId) || candidates[0];

  return (
    <div className="space-y-5 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
              <Scale className="w-3 h-3 text-cyan-400" /> Decision Room
            </span>
            <span className="text-xs text-slate-400">Comparing {candidates.length} Candidate Theses</span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide">
            Evidence-Backed Candidate Triage Workspace
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTimeline && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenTimeline}
              leftIcon={<History className="w-3.5 h-3.5 text-slate-400" />}
              className="text-xs font-mono"
            >
              Decision Log
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSynthesize}
            isLoading={isSynthesizing}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            className="text-xs font-mono"
          >
            {synthesis ? "Re-Synthesize AI Judge" : "Run AI Decision Synthesis"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCommitDecision}
            isLoading={isCommitting}
            leftIcon={<Award className="w-4 h-4 text-amber-300" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Lock [{activeProblem.id}] for Phase 3 Mom Test
          </Button>
        </div>
      </div>

      {/* AI Synthesis Executive Summary */}
      {synthesis && (
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 rounded-3xl border border-cyan-500/30 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> AI Incubation Judge Verdict:
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Recommended Winner: {synthesis.recommended_winner_id}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            "{synthesis.recommendation_summary}"
          </p>
        </div>
      )}

      {/* Grid Comparison Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(candidates.length, 3)} gap-4`}>
        {candidates.map((cand) => {
          const isSelected = cand.id === selectedId;
          const score = cand.score || 85;
          const sourcesCount = cand.sources?.length || 0;
          const breakdown = synthesis?.candidate_breakdowns?.find((b) => b.problem_id === cand.id);

          return (
            <div
              key={cand.id}
              onClick={() => setSelectedId(cand.id)}
              className={`cursor-pointer transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between border space-y-4 relative ${
                isSelected
                  ? "bg-slate-900 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40"
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-3 right-5 px-3 py-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full text-[10px] font-mono font-bold text-slate-950 shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Selected Thesis
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
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-[11px]">
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
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                      Active Workaround:
                    </span>
                    <p className="text-slate-300 line-clamp-2 leading-relaxed">{cand.workaround || "None documented"}</p>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                      Quantified Loss:
                    </span>
                    <p className="text-slate-300 line-clamp-2 leading-relaxed">{cand.quantified_impact || "Not quantified"}</p>
                  </div>
                </div>

                {/* Empirical Evidence Badges */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Verified DOIs:
                  </span>
                  <span className="text-cyan-400 font-bold">{sourcesCount} Papers Attached</span>
                </div>

                {/* AI Judge Breakdown if present */}
                {breakdown && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold">
                      <span className="text-cyan-400">Rank #{breakdown.rank}</span>
                      <span
                        className={
                          breakdown.verdict === "RECOMMENDED"
                            ? "text-emerald-400"
                            : breakdown.verdict === "VIABLE_ALTERNATIVE"
                            ? "text-cyan-400"
                            : "text-rose-400"
                        }
                      >
                        {breakdown.verdict}
                      </span>
                    </div>
                    {breakdown.pros && breakdown.pros.length > 0 && (
                      <p className="text-[10px] text-emerald-300">✓ {breakdown.pros[0]}</p>
                    )}
                    {breakdown.risks && breakdown.risks.length > 0 && (
                      <p className="text-[10px] text-amber-300/90">⚠ {breakdown.risks[0]}</p>
                    )}
                  </div>
                )}
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
                  {isSelected ? "✓ Active Selection" : "Choose Candidate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
