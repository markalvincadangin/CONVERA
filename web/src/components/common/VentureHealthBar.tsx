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
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Search,
  Cpu,
  Target,
  Layers,
  Presentation,
  BarChart3,
  Crown,
  Zap,
  Activity,
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

  const getHealthTone = (score: number) => {
    if (score >= 80) return { dot: "bg-emerald-400 shadow-emerald-500/50", text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" };
    if (score >= 50) return { dot: "bg-cyan-400 shadow-cyan-500/50", text: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" };
    if (score >= 20) return { dot: "bg-amber-400 shadow-amber-500/50", text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" };
    return { dot: "bg-slate-400 shadow-slate-500/50", text: "text-slate-300", border: "border-slate-800", bg: "bg-slate-900" };
  };

  const tone = getHealthTone(health.health_score);

  return (
    <>
      {/* Clickable Header Health Trigger (Polished Command Pill) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-xs transition-all duration-200 group shadow-sm hover:shadow-cyan-500/10 active:scale-[0.98]"
        title={`Venture Health Score: ${health.health_score}% (${health.earned_badges.length} of ${health.all_badges.length} Milestones Cleared) - Click for Audit Dossier`}
      >
        {/* Pulse Dot & Icon */}
        <div className={`relative flex items-center justify-center p-1.5 rounded-xl ${tone.bg} ${tone.border} border shrink-0 group-hover:scale-105 transition-transform`}>
          <Activity className={`w-3.5 h-3.5 ${tone.text}`} />
          <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${tone.dot} shadow-sm animate-pulse`} />
        </div>

        {/* Metrics Display */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
          <span className="text-white tracking-tight">
            {health.health_score}%
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
            {health.earned_badges.length}/{health.all_badges.length} Gates
          </span>
        </div>
      </button>

      {/* Venture Health Audit Dossier Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Venture Health & Milestone Audit"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Top Score Summary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase font-bold tracking-wider text-cyan-400">
                  Evidence-Ratcheted Readiness Score
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {health.health_score >= 80
                  ? "Investment-Grade Venture"
                  : health.health_score >= 50
                  ? "Advancing Candidate Portfolio"
                  : "Early-Stage Discovery"}
              </h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Evaluates empirical grounding, Mom Test conversation depth, Devil's Advocate stress-testing, and MVP skin-in-the-game conversion.
              </p>
            </div>

            {/* Score Ring / Badge */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                <span className="text-3xl font-extrabold font-mono text-cyan-400">
                  {health.health_score}%
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                  Health Index
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">
                  {health.earned_badges.length}
                  <span className="text-sm text-slate-500 font-normal">/{health.all_badges.length}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                  Milestones
                </span>
              </div>
            </div>
          </div>

          {/* Badges & Milestones Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                9 Evidence Ratchet Milestones
              </h4>
              <span className="text-xs font-mono text-slate-400">
                {health.earned_badges.length} Cleared • {health.all_badges.length - health.earned_badges.length} Remaining
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {health.all_badges.map((b) => {
                const isEarned = b.isEarned;
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isEarned
                        ? "bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                        : "bg-slate-950/60 border-slate-850 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className={`p-2 rounded-xl ${isEarned ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-slate-900 text-slate-600 border border-slate-800"}`}>
                        {renderBadgeIcon(b.icon_name, isEarned)}
                      </div>
                      {isEarned ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Cleared
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>

                    <div>
                      <h5 className={`text-xs font-bold ${isEarned ? "text-white" : "text-slate-400"}`}>
                        {b.name}
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-snug mt-1">
                        {b.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Close Audit Dossier
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
