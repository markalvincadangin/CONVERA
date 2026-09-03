"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { SessionState, ProblemRecord } from "@/lib/types";
import { calculateVentureHealth, VentureBadge } from "@/lib/badges";
import {
  Trophy,
  Award,
  ShieldCheck,
  TrendingUp,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface VentureHealthBarProps {
  session: SessionState | null;
  problems?: ProblemRecord[];
  onNavigateToPhase?: (phase: number) => void;
}

export const VentureHealthBar: React.FC<VentureHealthBarProps> = ({
  session,
  problems = [],
  onNavigateToPhase,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const health = calculateVentureHealth(session, problems);

  const gradeColors = {
    "A+": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    A: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    B: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    C: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    NEEDS_WORK: "bg-slate-800 text-slate-400 border-slate-700",
  };

  return (
    <>
      {/* Clickable Header Health Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-all duration-200 group"
        title="View Venture Health & Achievements"
      >
        <div className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30 group-hover:scale-110 transition-transform">
          <Trophy className="w-3 h-3" />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-white">
            {health.health_score}%
          </span>
          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border ${gradeColors[health.grade]}`}>
            {health.grade}
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          {health.earned_badges.length}/{health.all_badges.length} 🏅
        </span>
      </button>

      {/* Health & Badges Dossier Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Venture Health Index & Milestone Badges"
        maxWidth="4xl"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Top Score & Grade Banner */}
          <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black font-mono text-xl shadow-lg shadow-amber-500/10">
                  {health.health_score}%
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Venture Health Rating
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {health.grade_label}
                  </h4>
                </div>
              </div>

              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border self-start sm:self-center ${gradeColors[health.grade]}`}>
                Grade: {health.grade}
              </span>
            </div>

            {/* 4-Dimension Progress Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block">Gate Completion</span>
                <div className="flex items-baseline justify-between font-mono font-bold text-xs text-white">
                  <span>{health.gates_score}</span>
                  <span className="text-slate-500 font-normal">/35 pts</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${(health.gates_score / 35) * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block">Evidence Rigor</span>
                <div className="flex items-baseline justify-between font-mono font-bold text-xs text-white">
                  <span>{health.evidence_score}</span>
                  <span className="text-slate-500 font-normal">/25 pts</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${(health.evidence_score / 25) * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block">Experimentation</span>
                <div className="flex items-baseline justify-between font-mono font-bold text-xs text-white">
                  <span>{health.experiment_score}</span>
                  <span className="text-slate-500 font-normal">/25 pts</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: `${(health.experiment_score / 25) * 100}%` }} />
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block">Deliverables</span>
                <div className="flex items-baseline justify-between font-mono font-bold text-xs text-white">
                  <span>{health.deliverables_score}</span>
                  <span className="text-slate-500 font-normal">/15 pts</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400" style={{ width: `${(health.deliverables_score / 15) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Next Action Callout */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-teal-950/40 rounded-2xl border border-cyan-500/30 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Urgent Recommended Action
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {health.urgent_recommendation}
            </p>
          </div>

          {/* Milestone Badges Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Venture Milestones & Badges ({health.earned_badges.length} of {health.all_badges.length} Earned)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {health.all_badges.map((badge) => {
                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                      badge.isEarned
                        ? "bg-slate-900/90 border-amber-500/30 shadow-md shadow-amber-500/5"
                        : "bg-slate-950/40 border-slate-900 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <h5 className={`text-xs font-bold ${badge.isEarned ? "text-white" : "text-slate-400"}`}>
                            {badge.name}
                          </h5>
                          <span className="text-[9px] font-mono font-semibold uppercase text-slate-500">
                            {badge.category}
                          </span>
                        </div>
                      </div>

                      {badge.isEarned ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          ✓ Earned
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      {badge.description}
                    </p>

                    <div className="pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-500 italic">
                      Criteria: {badge.criteria}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
