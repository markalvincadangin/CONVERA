"use client";

import React from "react";
import { SessionState, ProblemRecord } from "@/lib/types";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  Layers,
  Zap,
  Activity,
  Compass,
  GraduationCap,
  Scale,
  BrainCircuit,
  FileSearch,
} from "lucide-react";

interface MethodologyHudCardProps {
  session: SessionState | null;
  problems?: ProblemRecord[];
  activePhase: number;
  onNavigate: (phase: number) => void;
  onOpenGateReview?: () => void;
  onOpenScorecard?: () => void;
}

export const MethodologyHudCard: React.FC<MethodologyHudCardProps> = ({
  session,
  problems = [],
  activePhase,
  onNavigate,
  onOpenGateReview,
  onOpenScorecard,
}) => {
  if (!session) return null;

  const frameworkId = session.framework_id?.toUpperCase() || "INNOVATION";
  const isResearch = frameworkId.includes("RESEARCH") || frameworkId.includes("CRCDP");
  const isCapstone = frameworkId.includes("CAPSTONE");
  const isProduct = frameworkId.includes("PRODUCT");

  // -------------------------------------------------------------------------
  // 1. WHAT YOU KNOW (Epistemic Grounding Telemetry)
  // -------------------------------------------------------------------------
  const totalProblems = problems.length;
  const stronglyDocumented = problems.filter((p) => p.evidence_tier === "STRONGLY_DOCUMENTED").length;
  const totalCitations = problems.reduce((acc, p) => acc + (p.sources?.length || 0), 0);
  const upvotedCount = problems.filter((p) => (p.votes || 0) > 0).length;

  let whatYouKnowText = "";
  if (totalProblems === 0) {
    whatYouKnowText = "0 empirical problems logged. Initial landscape undiscovered.";
  } else {
    whatYouKnowText = `${totalProblems} Candidate Problems • ${stronglyDocumented} Strongly Grounded (Tier A) • ${totalCitations} Citations Linked`;
  }

  // -------------------------------------------------------------------------
  // 2. WHAT REMAINS UNCERTAIN (Unresolved Epistemic Risks)
  // -------------------------------------------------------------------------
  const unverifiedProblems = problems.filter((p) => p.evidence_tier === "SIGNAL" || !p.evidence_tier).length;
  let whatIsUncertainText = "";
  if (unverifiedProblems > 0) {
    whatIsUncertainText = `${unverifiedProblems} Problem Statements rely on unverified field signals or assumptions.`;
  } else if (!session.phase3_complete) {
    whatIsUncertainText = "Target user behavioral frequency and past workaround expense remain unverified.";
  } else {
    whatIsUncertainText = "Core assumptions validated. Long-term scalability and edge-case friction remain to be tested.";
  }

  // -------------------------------------------------------------------------
  // 3. WHAT NEEDS ATTENTION (Anomalies & Gaps)
  // -------------------------------------------------------------------------
  const unchallengedTests = problems.filter((p) => !p.devils_advocate_data).length;
  let needsAttentionText = "";
  let attentionSeverity: "low" | "med" | "high" = "low";

  if (totalProblems === 0) {
    needsAttentionText = "Run automated sector discovery or ingest field notes into the Problem Bank.";
    attentionSeverity = "high";
  } else if (unchallengedTests > 0) {
    needsAttentionText = `${unchallengedTests} problem records have not been stress-tested by the Devil's Advocate agent.`;
    attentionSeverity = "med";
  } else if (isResearch && !session.phase2_complete) {
    needsAttentionText = "Literature matrix prior art benchmarks need completion before Gate 1.";
    attentionSeverity = "med";
  } else {
    needsAttentionText = "Knowledge graph synchronized. No active contradiction flags detected.";
    attentionSeverity = "low";
  }

  // -------------------------------------------------------------------------
  // 4. CURRENT GATE READINESS & RECOMMENDED ACTION
  // -------------------------------------------------------------------------
  interface GateMeta {
    name: string;
    stageLabel: string;
    status: "READY" | "NOT_READY" | "PASSED";
    progress: number;
    recommendedAction: string;
    targetPhase: number;
  }

  const getGateMeta = (): GateMeta => {
    if (isResearch) {
      if (!session.phase1_complete && totalProblems === 0) {
        return {
          name: "Stage A Discovery",
          stageLabel: "Stage A · Problem Discovery",
          status: "NOT_READY",
          progress: 15,
          recommendedAction: "Ingest Initial Field Signals",
          targetPhase: 0,
        };
      }
      if (!session.phase2_complete) {
        return {
          name: "Gate 1: Problem Significance",
          stageLabel: "Stage B · Problem Validation",
          status: stronglyDocumented > 0 ? "READY" : "NOT_READY",
          progress: stronglyDocumented > 0 ? 80 : 40,
          recommendedAction: "Ground Problem in Literature (DOI Evidence)",
          targetPhase: 1,
        };
      }
      if (!session.phase3_complete) {
        return {
          name: "Gate 2: Research Gap Quality",
          stageLabel: "Stage C · Opportunity Matrix",
          status: "NOT_READY",
          progress: 50,
          recommendedAction: "Formulate Research Questions & Gaps",
          targetPhase: 2,
        };
      }
      return {
        name: "Gate 3: Evaluation Rigor",
        stageLabel: "Stage E · Evaluation & Baselines",
        status: "READY",
        progress: 90,
        recommendedAction: "Review Evaluation Metrics & Circumscription",
        targetPhase: 3,
      };
    }

    // Default: INNOVATION TRACK (Venture Ratchet)
    if (totalProblems === 0) {
      return {
        name: "Phase 1 Discovery",
        stageLabel: "Phase 1 · Problem Landscape",
        status: "NOT_READY",
        progress: 10,
        recommendedAction: "Run Socratic Discovery",
        targetPhase: 1,
      };
    }
    if (!session.phase2_complete) {
      return {
        name: "Gate 1: Opportunity Worthiness",
        stageLabel: "Phase 2 · Decision Room",
        status: problems.some((p) => (p.score || 0) >= 70) ? "READY" : "NOT_READY",
        progress: problems.some((p) => (p.score || 0) >= 70) ? 85 : 45,
        recommendedAction: "Screen & Select Winner in Decision Room",
        targetPhase: 2,
      };
    }
    if (!session.phase3_complete) {
      return {
        name: "Gate 2: Empirical Validation",
        stageLabel: "Phase 3 · Mom Test Clinic",
        status: "NOT_READY",
        progress: 55,
        recommendedAction: "Execute Socratic Mom Test Validation",
        targetPhase: 3,
      };
    }
    if (!session.phase4_complete) {
      return {
        name: "Phase 4 Ideation",
        stageLabel: "Phase 4 · Mechanism SVB",
        status: "READY",
        progress: 75,
        recommendedAction: "Map 15 Mechanism SVB Blueprint",
        targetPhase: 4,
      };
    }
    return {
      name: "Gate 3: Commitment Audit",
      stageLabel: "Phase 5 · MVP Audit",
      status: "PASSED",
      progress: 100,
      recommendedAction: "Export Validation Dossier in Studio",
      targetPhase: 6,
    };
  };

  const gate = getGateMeta();

  const getFrameworkBadge = () => {
    if (isResearch) {
      return { label: "Computing Research (CRCDP)", icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" />, border: "border-emerald-500/30 text-emerald-300 bg-emerald-950/40" };
    }
    if (isCapstone) {
      return { label: "Academic Capstone (IEEE 830)", icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />, border: "border-indigo-500/30 text-indigo-300 bg-indigo-950/40" };
    }
    if (isProduct) {
      return { label: "Product Discovery (Agile)", icon: <Compass className="w-3.5 h-3.5 text-amber-400" />, border: "border-amber-500/30 text-amber-300 bg-amber-950/40" };
    }
    return { label: "Venture Innovation (Ratchet)", icon: <Zap className="w-3.5 h-3.5 text-blue-400" />, border: "border-blue-500/30 text-blue-300 bg-blue-950/40" };
  };

  const fw = getFrameworkBadge();

  return (
    <div className="relative overflow-hidden p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl transition-all duration-300 font-sans space-y-3.5">
      {/* Top Banner Header: Methodology & Active Stage */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold font-mono ${fw.border}`}>
            {fw.icon}
            <span>{fw.label}</span>
          </span>
          <span className="text-xs font-bold text-slate-200 tracking-tight">
            {gate.stageLabel}
          </span>
        </div>

        {/* Quality Gate Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
            {gate.name}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide border ${
              gate.status === "PASSED"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                : gate.status === "READY"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                : "bg-amber-500/15 text-amber-400 border-amber-500/40"
            }`}
          >
            {gate.status === "PASSED" ? "● CLEARED" : gate.status === "READY" ? "● READY" : "○ IN PROGRESS"}
          </span>
        </div>
      </div>

      {/* 4-Part Methodology HUD Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* 1. What You Know */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[10px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1. What You Know</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {whatYouKnowText}
          </p>
        </div>

        {/* 2. What Remains Uncertain */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px] font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>2. What Is Uncertain</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {whatIsUncertainText}
          </p>
        </div>

        {/* 3. What Needs Attention */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[10px] font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3. Needs Attention</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {needsAttentionText}
          </p>
        </div>
      </div>

      {/* 4. Action Recommendation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white font-semibold">Recommended Next Action: </strong>
            {gate.recommendedAction}
          </span>
        </div>

        <button
          onClick={() => onNavigate(gate.targetPhase)}
          className="self-end sm:self-center font-bold text-xs text-cyan-300 hover:text-white flex items-center gap-1.5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-500/30 px-3.5 py-1.5 rounded-xl border border-cyan-500/40 transition-all active:scale-[0.98] shadow-sm"
        >
          <span>Execute Action</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
