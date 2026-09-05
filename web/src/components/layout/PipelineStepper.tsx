"use client";

import React, { useState } from "react";
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
  Zap,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tooltip } from "@/components/common/Tooltip";
import { SessionState, ProblemRecord } from "@/lib/types";

interface PipelineStepperProps {
  activePhase: number;
  onSelectPhase: (phase: number) => void;
  session: SessionState | null;
  problems?: ProblemRecord[];
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  activePhase,
  onSelectPhase,
  session,
  problems = [],
}) => {
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState<boolean>(true);

  const frameworkId = session?.framework_id?.toUpperCase() || "INNOVATION";
  const isResearch = frameworkId.includes("RESEARCH") || frameworkId.includes("CRCDP");

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
      lockReason: "Prerequisites Incomplete. Complete Phase 1 or Phase 2 problem screening first.",
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
      lockReason: "Prerequisites Incomplete. Complete all 6 Mom Test levels in Phase 3 first.",
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
      lockReason: "Prerequisites Incomplete. Map mechanism & SVB in Phase 4 first.",
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

  // Research framework stages (8 slots total: Bank, Stages A through F, Deliverables Studio)
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
      title: "Scouting",
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
      desc: "4 DSR Artifacts",
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
      desc: "Kothari Trapping",
      icon: BarChart2,
      isComplete: Boolean(session?.phase5_complete),
      isAvailable: Boolean(session?.phase4_complete),
      lockReason: "Formulate computing artifact in Stage D first.",
      isBank: false,
    },
    {
      id: 6,
      name: "Stage F",
      title: "Feasibility [G4]",
      desc: "Ethics & DOST/SDG",
      icon: ShieldCheck,
      isComplete: Boolean(session?.phase5_complete),
      isAvailable: Boolean(session?.phase5_complete || session?.phase4_complete),
      lockReason: "Complete Kothari experimental evaluation in Stage E first.",
      isBank: false,
    },
    {
      id: 7,
      name: "Studio",
      title: "Deliverables",
      desc: "Proposal Suite",
      icon: Sparkles,
      isComplete: Boolean(session?.phase5_complete),
      isAvailable: true,
      lockReason: "",
      isBank: false,
      isStudio: true,
    },
  ];

  const phases = isResearch ? researchPhases : innovationPhases;

  // -------------------------------------------------------------------------
  // Telemetry Metrics Calculation
  // -------------------------------------------------------------------------
  const totalProblems = problems.length;
  const stronglyDocumented = problems.filter((p) => p.evidence_tier === "STRONGLY_DOCUMENTED").length;
  const totalCitations = problems.reduce((acc, p) => acc + (p.sources?.length || 0), 0);
  const unverifiedProblems = problems.filter((p) => p.evidence_tier === "SIGNAL" || !p.evidence_tier).length;
  const unchallengedTests = problems.filter((p) => !p.devils_advocate_data).length;

  const whatYouKnow = totalProblems === 0
    ? "0 empirical problems logged."
    : `${totalProblems} Problems • ${stronglyDocumented} Tier A Grounded • ${totalCitations} Citations`;

  const whatIsUncertain = unverifiedProblems > 0
    ? `${unverifiedProblems} statements rely on unverified field signals.`
    : !session?.phase3_complete
    ? "User behavioral frequency & workaround expense unverified."
    : "Core assumptions empirically validated.";

  const needsAttention = unchallengedTests > 0
    ? `${unchallengedTests} problem records un-tested by Devil's Advocate.`
    : totalProblems === 0
    ? "Run discovery or ingest notes into the Problem Bank."
    : "Knowledge graph synchronized. 0 contradiction flags.";

  // Gate readiness
  let activeGateName = "Gate 1: Opportunity";
  let isGateReady = false;
  let recommendedActionText = "Screen Candidate Problems";
  let recommendedTargetPhase = 2;

  if (isResearch) {
    if (!session?.phase2_complete) {
      activeGateName = "Gate 1: Problem Significance";
      isGateReady = stronglyDocumented > 0;
      recommendedActionText = "Ground Problem in DOI Literature";
      recommendedTargetPhase = 2;
    } else if (!session?.phase3_complete) {
      activeGateName = "Gate 2: Research Gap Quality";
      isGateReady = false;
      recommendedActionText = "Synthesize Literature Matrix";
      recommendedTargetPhase = 3;
    } else {
      activeGateName = "Gate 3: Evaluation Rigor";
      isGateReady = true;
      recommendedActionText = "Review Experimental Design";
      recommendedTargetPhase = 5;
    }
  } else {
    if (totalProblems === 0) {
      activeGateName = "Phase 1 Discovery";
      isGateReady = false;
      recommendedActionText = "Run Socratic Discovery";
      recommendedTargetPhase = 1;
    } else if (!session?.phase2_complete) {
      activeGateName = "Gate 1: Opportunity Worthiness";
      isGateReady = problems.some((p) => (p.score || 0) >= 70);
      recommendedActionText = "Screen & Select Winner in Decision Room";
      recommendedTargetPhase = 2;
    } else if (!session?.phase3_complete) {
      activeGateName = "Gate 2: Empirical Validation";
      isGateReady = false;
      recommendedActionText = "Execute Mom Test Validation";
      recommendedTargetPhase = 3;
    } else if (!session?.phase4_complete) {
      activeGateName = "Phase 4 Ideation";
      isGateReady = true;
      recommendedActionText = "Map 15 Mechanism SVB";
      recommendedTargetPhase = 4;
    } else {
      activeGateName = "Gate 3: Commitment Audit";
      isGateReady = true;
      recommendedActionText = "Export Validation Dossier in Studio";
      recommendedTargetPhase = 6;
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 shadow-xl shadow-black/20 flex flex-col gap-2 transition-all">
        
        {/* Row 1: Header + Progress + Telemetry Toggle */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-300 font-mono">
              {isResearch ? "Computing Research Track (CRCDP)" : "Venture Innovation Track (Ratchet)"}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {completedCount} of 5 Gates Cleared
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-cyan-400 font-bold text-[10px]">{progressPercent}%</span>
            </div>

            <button
              onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
              className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              title="Toggle Telemetry Bar"
            >
              <span>{isTelemetryExpanded ? "Compact" : "Telemetry"}</span>
              {isTelemetryExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Row 2: Stepper Pills (7 Tabs) */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 ${isResearch ? "md:grid-cols-8 lg:grid-cols-8" : "md:grid-cols-7 lg:grid-cols-7"} gap-1.5`}>
          {phases.map((phase) => {
            const Icon = phase.icon;
            const isActive = activePhase === phase.id;
            const isComplete = phase.isComplete;
            const isLocked = !phase.isAvailable;

            return (
              <Tooltip
                key={phase.id}
                content={isLocked ? `${phase.lockReason} (Preview Mode: execution locked)` : phase.desc}
                position="bottom"
              >
                <button
                  type="button"
                  onClick={() => onSelectPhase(phase.id)}
                  className={`w-full text-left p-2 rounded-xl border transition-all duration-200 flex flex-col justify-between min-h-[56px] relative overflow-hidden group cursor-pointer ${
                    isActive && isLocked
                      ? "bg-gradient-to-b from-amber-500/15 to-slate-900 border-amber-500/60 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/30"
                      : isActive
                      ? "bg-gradient-to-b from-cyan-500/15 to-blue-600/10 border-cyan-500/60 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30"
                      : isLocked
                      ? "bg-slate-950/50 border-slate-800 border-dashed hover:border-amber-500/40 hover:bg-slate-900/60"
                      : isComplete
                      ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[9px] font-bold font-mono tracking-wider ${
                        isActive && isLocked
                          ? "text-amber-300"
                          : isActive
                          ? "text-cyan-300"
                          : isComplete
                          ? "text-emerald-400"
                          : isLocked
                          ? "text-amber-400/80"
                          : "text-slate-400"
                      }`}
                    >
                      {phase.name}
                    </span>

                    {isLocked ? (
                      <span className="flex items-center gap-1">
                        <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded bg-amber-950/60 text-amber-300/80 border border-amber-500/30 leading-none">Preview</span>
                        <Lock className="w-3 h-3 text-amber-400/70" />
                      </span>
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

                  <div className="mt-0.5">
                    <div
                      className={`text-xs font-bold truncate leading-tight ${
                        isActive && isLocked
                          ? "text-amber-100"
                          : isActive
                          ? "text-white"
                          : isLocked
                          ? "text-slate-400 group-hover:text-slate-200"
                          : "text-slate-200 group-hover:text-white"
                      }`}
                    >
                      {phase.title}
                    </div>
                  </div>
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* Row 3: Integrated Live Telemetry Strip */}
        {isTelemetryExpanded && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-2 text-[11px] items-center">
            {/* 1. What You Know */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-400 font-mono text-[10px] uppercase font-bold shrink-0">Know:</span>
              <span className="text-slate-200 truncate">{whatYouKnow}</span>
            </div>

            {/* 2. What Is Uncertain */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 truncate">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 font-mono text-[10px] uppercase font-bold shrink-0">Uncertain:</span>
              <span className="text-slate-300 truncate">{whatIsUncertain}</span>
            </div>

            {/* 3. Needs Attention */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 truncate">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-slate-400 font-mono text-[10px] uppercase font-bold shrink-0">Attention:</span>
              <span className="text-slate-300 truncate">{needsAttention}</span>
            </div>

            {/* 4. Gate Readiness & Action Button */}
            <div className="flex items-center justify-between gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-cyan-500/30">
              <div className="flex items-center gap-1.5 truncate">
                <span className={`w-1.5 h-1.5 rounded-full ${isGateReady ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span className="text-[10px] font-mono font-bold text-cyan-300 truncate">{activeGateName}</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectPhase(recommendedTargetPhase)}
                className="text-[10px] font-bold text-white hover:text-cyan-300 flex items-center gap-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 px-2 py-0.5 rounded border border-cyan-500/40 transition shrink-0 font-mono"
                title={`Go to active prerequisite: ${recommendedActionText}`}
                aria-label={`Go to active phase: ${recommendedActionText}`}
              >
                <span>Action</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
