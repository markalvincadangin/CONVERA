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
  Layers,
} from "lucide-react";
import { Tooltip } from "@/components/common/Tooltip";
import { SessionState, ProblemRecord } from "@/lib/types";
import { getMethodologyContract } from "@/lib/contracts/methodology";

const ICON_RESOLVER: Record<string, React.FC<{ className?: string }>> = {
  Compass,
  Filter,
  ShieldCheck,
  Lightbulb,
  Activity,
  Sparkles,
  FolderOpen,
  Search,
  FileSearch,
  BookOpen,
  Cpu,
  BarChart2,
  FileCheck,
  Zap,
  Layers,
};

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

  const contract = getMethodologyContract(session?.framework_id);
  const isResearch = contract.id === "RESEARCH";

  const legacyCompleteFlags = [
    session?.phase1_complete,
    session?.phase2_complete,
    session?.phase3_complete,
    session?.phase4_complete,
    session?.phase5_complete,
  ];

  const totalStages = contract.stages.length;
  const completedStagesCount = contract.stages.filter((stage, idx) => {
    const sp = session?.stage_progress?.stages?.[stage.id];
    if (sp) return sp.status === "COMPLETED";
    return Boolean(legacyCompleteFlags[idx]);
  }).length;

  const progressPercent = Math.round((completedStagesCount / totalStages) * 100);

  const totalGates = contract.gates.length;
  const clearedGatesCount = session?.stage_progress
    ? Object.values(session.stage_progress.stages).filter((s) => s.gate_status === "PASSED").length
    : legacyCompleteFlags.filter(Boolean).length;

  // Build contract-driven stepper items dynamically
  const phases = [
    // Slot 0: Problem Bank (Universal Platform Primitive)
    {
      id: 0,
      name: "Bank",
      title: "Problem Bank",
      desc: isResearch ? "Intake & discovery" : "Intake & scoring",
      icon: FolderOpen,
      isComplete: false,
      isAvailable: true,
      lockReason: "",
      isBank: true,
      isStudio: false,
    },
    // Slots 1..N: Methodology Stages derived from active contract
    ...contract.stages.map((stage, idx) => {
      const stageProgress = session?.stage_progress?.stages?.[stage.id];
      let isComplete = false;
      let isAvailable = false;

      if (stageProgress) {
        isComplete = stageProgress.status === "COMPLETED";
        isAvailable = stageProgress.status !== "LOCKED";
      } else {
        // Fallback for legacy unhydrated sessions
        isComplete = Boolean(legacyCompleteFlags[idx]);
        isAvailable = idx === 0 ? true : Boolean(legacyCompleteFlags[idx - 1]);
      }

      const IconComponent = ICON_RESOLVER[stage.icon_key] || Layers;

      return {
        id: idx + 1,
        name: stage.code,
        title: stage.short_title || stage.label.split(" ")[0] || stage.code,
        desc: stage.stepper_desc || stage.short_description.slice(0, 20),
        icon: IconComponent,
        isComplete,
        isAvailable,
        lockReason: stage.lock_reason_template || "Prerequisites Incomplete.",
        isBank: false,
        isStudio: false,
      };
    }),
    // Slot N+1: Deliverables Studio (Universal Output Hub)
    {
      id: contract.stages.length + 1,
      name: "Studio",
      title: "Deliverables",
      desc: isResearch ? "Proposal Suite" : "Pitch deck & SRS",
      icon: Sparkles,
      isComplete: completedStagesCount === totalStages,
      isAvailable: true,
      lockReason: "",
      isBank: false,
      isStudio: true,
    },
  ];

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
              {contract.name}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {clearedGatesCount} of {totalGates} Gates Cleared
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

        <div className={`grid grid-cols-2 sm:grid-cols-4 ${phases.length === 8 ? "md:grid-cols-8 lg:grid-cols-8" : "md:grid-cols-7 lg:grid-cols-7"} gap-1.5`}>
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
