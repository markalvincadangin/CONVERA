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
  Search,
  Cpu,
  Target,
  Layers,
  Presentation,
  BarChart3,
  Crown,
  Zap,
} from "lucide-react";

interface VentureHealthBarProps {
  session: SessionState | null;
  problems?: ProblemRecord[];
  onNavigateToPhase?: (phase: number) => void;
}

const renderBadgeIcon = (iconName: string, isEarned: boolean) => {
  const iconProps = { className: "w-5 h-5" };
  switch (iconName) {
    case "search":
      return <Search {...iconProps} />;
    case "flame":
      return <Flame {...iconProps} />;
    case "shield-check":
      return <ShieldCheck {...iconProps} />;
    case "cpu":
      return <Cpu {...iconProps} />;
    case "target":
      return <Target {...iconProps} />;
    case "layers":
      return <Layers {...iconProps} />;
    case "presentation":
      return <Presentation {...iconProps} />;
    case "bar-chart-3":
      return <BarChart3 {...iconProps} />;
    case "crown":
      return <Crown {...iconProps} />;
    case "zap":
      return <Zap {...iconProps} />;
    default:
      return <Award {...iconProps} />;
  }
};

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

        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hidden sm:flex">
          <Award className="w-3 h-3 text-amber-400" />
          <span>{health.earned_badges.length}/{health.all_badges.length}</span>
        </div>
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
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
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
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Phase Gates (35%)</span>
                <span className="text-sm font-bold font-mono text-cyan-400">{health.gates_score}/35</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Evidence Quality (25%)</span>
                <span className="text-sm font-bold font-mono text-teal-400">{health.evidence_score}/25</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Experiments (25%)</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{health.experiment_score}/25</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Deliverables (15%)</span>
                <span className="text-sm font-bold font-mono text-purple-400">{health.deliverables_score}/15</span>
              </div>
            </div>
          </div>

          {/* Urgent Action Banner */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 flex items-start gap-3 shadow-md">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 font-mono">
                Urgent Recommended Action
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {health.urgent_recommendation}
              </p>
            </div>
          </div>

          {/* Milestone Badges Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-mono">
                <Award className="w-4 h-4 text-amber-400" />
                Venture Milestone Badges ({health.earned_badges.length}/{health.all_badges.length})
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Unlocked through rigorous validation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {health.all_badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                    badge.isEarned
                      ? "bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5 hover:border-amber-500/60"
                      : "bg-slate-950/60 border-slate-800/80 opacity-60 grayscale hover:opacity-80 transition-opacity"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      badge.isEarned
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-inner"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    {renderBadgeIcon(badge.icon_name, badge.isEarned)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs font-bold ${badge.isEarned ? "text-white" : "text-slate-400"}`}>
                        {badge.name}
                      </h5>
                      {badge.isEarned ? (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          EARNED
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> LOCKED
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      {badge.description}
                    </p>

                    <p className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                      Criteria: {badge.criteria}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
