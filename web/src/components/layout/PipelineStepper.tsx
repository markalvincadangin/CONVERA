"use client";

import React from "react";
import { SessionState } from "@/lib/types";
import { Tooltip } from "@/components/common/Tooltip";
import {
  Compass,
  Filter,
  ShieldCheck,
  Lightbulb,
  Activity,
  FolderOpen,
  Lock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface PipelineStepperProps {
  activePhase: number;
  onSelectPhase: (phase: number) => void;
  session: SessionState | null;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  activePhase,
  onSelectPhase,
  session,
}) => {
  const completedCount = [
    session?.phase1_complete,
    session?.phase2_complete,
    session?.phase3_complete,
    session?.phase4_complete,
    session?.phase5_complete,
  ].filter(Boolean).length;

  const progressPercent = Math.round((completedCount / 5) * 100);

  const phases = [
    {
      id: 0,
      name: "Bank",
      title: "Problem Bank",
      desc: "Intake & scoring",
      icon: FolderOpen,
      isComplete: false,
      isAvailable: true,
      lockReason: "",
      isBank: true,
    },
    {
      id: 1,
      name: "Phase 1",
      title: "Discovery",
      desc: "Landscape signals",
      icon: Compass,
      isComplete: Boolean(session?.phase1_complete),
      isAvailable: true,
      lockReason: "",
      isBank: false,
    },
    {
      id: 2,
      name: "Phase 2",
      title: "Screening",
      desc: "Triage & matrix",
      icon: Filter,
      isComplete: Boolean(session?.phase2_complete),
      isAvailable: true,
      lockReason: "",
      isBank: false,
    },
    {
      id: 3,
      name: "Phase 3",
      title: "Validation",
      desc: "6-Level Mom Test",
      icon: ShieldCheck,
      isComplete: Boolean(session?.phase3_complete),
      isAvailable: Boolean(session?.phase1_complete || session?.phase2_complete || session?.phase3_problem),
      lockReason: "Select and advance a problem candidate from Phase 2 first.",
      isBank: false,
    },
    {
      id: 4,
      name: "Phase 4",
      title: "Ideation",
      desc: "15 Mechanism SVB",
      icon: Lightbulb,
      isComplete: Boolean(session?.phase4_complete),
      isAvailable: Boolean(session?.phase3_complete),
      lockReason: "Locked by Mechanical Ratchet. Complete all 6 Mom Test levels in Phase 3 first.",
      isBank: false,
    },
    {
      id: 5,
      name: "Phase 5",
      title: "MVP Audit",
      desc: "Skin-in-game test",
      icon: Activity,
      isComplete: Boolean(session?.phase5_complete),
      isAvailable: Boolean(session?.phase4_complete),
      lockReason: "Locked by Mechanical Ratchet. Formulate your SVB hypotheses in Phase 4 first.",
      isBank: false,
    },
    {
      id: 6,
      name: "Studio",
      title: "Deliverables",
      desc: "Canvas & Pitch",
      icon: Sparkles,
      isComplete: Boolean(session?.deliverable_lean_canvas || session?.deliverable_pitch_deck),
      isAvailable: true,
      lockReason: "",
      isBank: false,
    },
  ];

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Progress bar header */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Venture Validation Engine:</span>
            <span className="font-mono text-cyan-400 font-bold">{completedCount} of 5 Gates Passed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-28 sm:w-40 h-2 bg-slate-800 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-slate-400">{progressPercent}%</span>
          </div>
        </div>

        {/* Stepper Cards */}
        <nav aria-label="Pipeline Progress">
          <ol className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const isActive = activePhase === phase.id;

              const cardButton = (
                <button
                  onClick={() => phase.isAvailable && onSelectPhase(phase.id)}
                  disabled={!phase.isAvailable}
                  aria-current={isActive ? "step" : undefined}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1 relative ${
                    isActive
                      ? "bg-slate-800/95 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/40"
                      : phase.isBank
                      ? "bg-slate-900/90 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-slate-800/70"
                      : phase.id === 6
                      ? "bg-slate-900/90 border-purple-500/25 hover:border-purple-500/50 hover:bg-slate-800/70"
                      : phase.isComplete
                      ? "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-slate-800/60"
                      : phase.isAvailable
                      ? "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                      : "bg-slate-950/30 border-slate-900 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold transition-transform ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 scale-105"
                          : phase.isBank
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : phase.id === 6
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                          : phase.isComplete
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : phase.isAvailable
                          ? "bg-slate-800 text-slate-300 border border-slate-700"
                          : "bg-slate-900 text-slate-600 border border-slate-800"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>

                    {phase.isComplete ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-2 h-2" /> Done
                      </span>
                    ) : isActive ? (
                      <span className="text-[9px] font-semibold text-cyan-300 bg-cyan-500/10 px-1 py-0.5 rounded-full border border-cyan-500/30 animate-pulse">
                        Active
                      </span>
                    ) : phase.isBank ? (
                      <span className="text-[9px] font-semibold text-cyan-400/80 bg-cyan-500/5 px-1 py-0.5 rounded-full border border-cyan-500/15">
                        Bank
                      </span>
                    ) : phase.id === 6 ? (
                      <span className="text-[9px] font-semibold text-purple-400/80 bg-purple-500/5 px-1 py-0.5 rounded-full border border-purple-500/15">
                        Studio
                      </span>
                    ) : !phase.isAvailable ? (
                      <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                        <Lock className="w-2 h-2 text-slate-600" /> Lock
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400">Ready</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      {phase.name}
                    </span>
                    <h4 className="text-[11px] font-bold text-white tracking-tight truncate">
                      {phase.title}
                    </h4>
                    <p className="text-[9px] text-slate-400 truncate mt-0.5">{phase.desc}</p>
                  </div>
                </button>
              );

              return (
                <li key={phase.id} className="relative">
                  {!phase.isAvailable ? (
                    <Tooltip content={phase.lockReason} position="bottom">
                      {cardButton}
                    </Tooltip>
                  ) : (
                    cardButton
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
