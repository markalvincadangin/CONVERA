"use client";

import React from "react";
import {
  Compass,
  Filter,
  ShieldCheck,
  Lightbulb,
  Activity,
  Sparkles,
  Lock,
  CheckCircle2,
  FolderOpen,
  ChevronRight,
  BookOpen,
  FileSearch,
  Search,
  Cpu,
  BarChart2,
  FileCheck,
} from "lucide-react";
import { Tooltip } from "@/components/common/Tooltip";
import { SessionState } from "@/lib/types";

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
  const frameworkId = session?.framework_id?.toUpperCase() || "INNOVATION";

  const completedCount = [
    session?.phase1_complete,
    session?.phase2_complete,
    session?.phase3_complete,
    session?.phase4_complete,
    session?.phase5_complete,
  ].filter(Boolean).length;

  const progressPercent = Math.round((completedCount / 5) * 100);

  // Innovation framework phases
  const innovationPhases = [
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
      lockReason: "Locked by Mechanical Ratchet. Map mechanism & SVB in Phase 4 first.",
      isBank: false,
    },
    {
      id: 6,
      name: "Studio",
      title: "Deliverables",
      desc: "Pitch deck & SRS",
      icon: Sparkles,
      isComplete: Boolean(session?.phase5_complete),
      isAvailable: true,
      lockReason: "",
      isBank: false,
      isStudio: true,
    },
  ];

  // Research framework stages
  const researchPhases = [
    {
      id: 0,
      name: "Bank",
      title: "Problem Bank",
      desc: "Intake & discovery",
      icon: FolderOpen,
      isComplete: false,
      isAvailable: true,
      lockReason: "",
      isBank: true,
    },
    {
      id: 1,
      name: "Stage A",
      title: "Problem Discovery",
      desc: "Empirical signals",
      icon: Search,
      isComplete: Boolean(session?.phase1_complete),
      isAvailable: true,
      lockReason: "",
      isBank: false,
    },
    {
      id: 2,
      name: "Stage B",
      title: "Validation [G1]",
      desc: "Lit & DOI evidence",
      icon: FileSearch,
      isComplete: Boolean(session?.phase2_complete),
      isAvailable: true,
      lockReason: "",
      isBank: false,
    },
    {
      id: 3,
      name: "Stage C",
      title: "Opportunity [G2]",
      desc: "Gaps & RQ matrix",
      icon: BookOpen,
      isComplete: Boolean(session?.phase3_complete),
      isAvailable: Boolean(session?.phase1_complete || session?.phase2_complete || session?.phase3_problem),
      lockReason: "Validate research problem in Stage B first.",
      isBank: false,
    },
    {
      id: 4,
      name: "Stage D",
      title: "Formulation",
      desc: "Artifact architecture",
      icon: Cpu,
      isComplete: Boolean(session?.phase4_complete),
      isAvailable: Boolean(session?.phase3_complete),
      lockReason: "Establish research gap & questions in Stage C first.",
      isBank: false,
    },
    {
      id: 5,
      name: "Stage E",
      title: "Evaluation [G3]",
      desc: "Metrics & baselines",
      icon: BarChart2,
      isComplete: Boolean(session?.phase5_complete),
      isAvailable: Boolean(session?.phase4_complete),
      lockReason: "Formulate computing artifact in Stage D first.",
      isBank: false,
    },
    {
      id: 6,
      name: "Studio",
      title: "Deliverables [G4]",
      desc: "Proposals & SRS",
      icon: FileCheck,
      isComplete: Boolean(session?.phase5_complete),
      isAvailable: true,
      lockReason: "",
      isBank: false,
      isStudio: true,
    },
  ];

  const phases = frameworkId === "RESEARCH" ? researchPhases : innovationPhases;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 shadow-xl shadow-black/20 flex flex-col gap-2">
        
        {/* Progress header */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-300 font-mono">
              {frameworkId === "RESEARCH" ? "Research Framework (CCDS v1.0)" : "Venture Ratchet Pipeline (CCDS v1.0)"}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {completedCount} of 5 Gates Cleared
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-cyan-400 font-bold">{progressPercent}%</span>
          </div>
        </div>

        {/* Stepper pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {phases.map((phase) => {
            const Icon = phase.icon;
            const isActive = activePhase === phase.id;
            const isComplete = phase.isComplete;
            const isLocked = !phase.isAvailable;

            return (
              <Tooltip key={phase.id} content={isLocked ? phase.lockReason : phase.desc} position="bottom">
                <button
                  onClick={() => !isLocked && onSelectPhase(phase.id)}
                  disabled={isLocked}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between min-h-[64px] relative overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-b from-cyan-500/15 to-blue-600/10 border-cyan-500/50 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30"
                      : isLocked
                      ? "bg-slate-950/40 border-slate-850 opacity-50 cursor-not-allowed"
                      : isComplete
                      ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[10px] font-bold font-mono tracking-wider ${
                        isActive
                          ? "text-cyan-300"
                          : isComplete
                          ? "text-emerald-400"
                          : isLocked
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      {phase.name}
                    </span>

                    {isLocked ? (
                      <Lock className="w-3 h-3 text-slate-600" />
                    ) : isComplete ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isActive
                            ? "text-cyan-400"
                            : "text-slate-500 group-hover:text-slate-300"
                        } transition-colors`}
                      />
                    )}
                  </div>

                  <div className="mt-1">
                    <div
                      className={`text-xs font-bold truncate leading-tight ${
                        isActive
                          ? "text-white"
                          : isLocked
                          ? "text-slate-600"
                          : "text-slate-200 group-hover:text-white"
                      }`}
                    >
                      {phase.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                      {phase.desc}
                    </div>
                  </div>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};
