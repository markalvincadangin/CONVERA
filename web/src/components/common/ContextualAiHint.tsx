"use client";

import React from "react";
import { SessionState, ProblemRecord } from "@/lib/types";
import { calculateVentureHealth } from "@/lib/badges";
import { Sparkles, ArrowRight, Lightbulb, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ContextualAiHintProps {
  session: SessionState | null;
  problems?: ProblemRecord[];
  activePhase: number;
  onNavigate: (phase: number) => void;
}

export const ContextualAiHint: React.FC<ContextualAiHintProps> = ({
  session,
  problems = [],
  activePhase,
  onNavigate,
}) => {
  if (!session) return null;

  const health = calculateVentureHealth(session, problems);

  let hintText = "";
  let actionText = "";
  let targetPhase: number | null = null;
  let icon = <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />;

  if (activePhase === 0) {
    if (problems.length === 0) {
      hintText = "Your Problem Bank is empty. Run automated discovery in Phase 1 or use AI note structuring to log primary field observations.";
      actionText = "Go to Phase 1 Discovery";
      targetPhase = 1;
    } else if (problems.every((p) => !p.devils_advocate_data)) {
      hintText = "You haven't stress-tested your problems yet. Click 'Stress Test' on any problem card to attack fragile assumptions.";
      actionText = "Stay in Bank";
      targetPhase = null;
      icon = <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />;
    } else if (!session.phase2_complete) {
      hintText = "You have verified problem records ready. Select your candidate problems and screen them in Phase 2.";
      actionText = "Go to Phase 2 Screening";
      targetPhase = 2;
    }
  } else if (activePhase === 1) {
    if (session.phase1_complete && problems.length > 0) {
      hintText = `Phase 1 landscape generated! ${problems.length} problems were automatically ingested into your Problem Bank.`;
      actionText = "Review Problem Bank";
      targetPhase = 0;
      icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
  } else if (activePhase === 2) {
    if (session.phase2_complete && !session.phase3_complete) {
      hintText = "Phase 2 screening complete. Advance your top candidate problem to Phase 3 for 6-level Mom Test validation.";
      actionText = "Go to Phase 3 Validation";
      targetPhase = 3;
    }
  } else if (activePhase === 3) {
    if (session.phase3_complete && !session.phase4_complete) {
      hintText = "Problem fully validated with past economic sacrifice! Advance to Phase 4 to ideate across the 15 Mechanism Families.";
      actionText = "Go to Phase 4 Ideation";
      targetPhase = 4;
      icon = <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />;
    }
  } else if (activePhase === 4) {
    if (session.phase4_complete && !session.phase5_complete) {
      hintText = "SVB Canvas formulated. Run your Concierge/Pre-order test and audit the real customer commitments in Phase 5.";
      actionText = "Go to Phase 5 MVP Audit";
      targetPhase = 5;
    }
  } else if (activePhase === 5) {
    if (session.phase5_complete) {
      hintText = "Empirical MVP validation audit complete! Generate your 9-Box Lean Canvas and 10-Slide Pitch Deck in the Studio.";
      actionText = "Open Deliverables Studio";
      targetPhase = 6;
      icon = <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />;
    }
  }

  if (!hintText) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 rounded-2xl border border-cyan-500/20 text-xs shadow-lg">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-slate-300 leading-snug">
          <strong className="text-white font-semibold">AI Copilot Hint: </strong>
          {hintText}
        </span>
      </div>

      {targetPhase !== null && (
        <button
          onClick={() => onNavigate(targetPhase!)}
          className="self-end sm:self-center font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-xl border border-cyan-500/30 transition-colors"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
