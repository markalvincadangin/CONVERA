"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Compass,
  RefreshCw,
  History,
  AlertCircle,
  HelpCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { SessionState } from "@/lib/types";
import {
  orchestratorService,
  OrchestrationEvaluationResult,
  RecommendedAction,
  ActionType,
} from "@/services/orchestratorService";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/common/Button";
import { OverconfidenceBanner } from "./OverconfidenceBanner";
import { StageGateMonitor } from "./StageGateMonitor";
import { EpistemicHealthMeter } from "./EpistemicHealthMeter";
import { RecommendedActionCard } from "./RecommendedActionCard";
import { OrchestrationEventsDrawer } from "./OrchestrationEventsDrawer";

export interface ResearchCockpitProps {
  session: SessionState | null;
  activeProblemId?: string | null;
  onRefreshSession?: () => void;
  onNavigatePhase?: (phase: number) => void;
  onOpenScorecard?: () => void;
  onOpenGateReview?: () => void;
  className?: string;
}

export const ResearchCockpit: React.FC<ResearchCockpitProps> = ({
  session,
  activeProblemId,
  onRefreshSession,
  onNavigatePhase,
  onOpenScorecard,
  onOpenGateReview,
  className = "",
}) => {
  const toast = useToast();
  const [evaluation, setEvaluation] =
    useState<OrchestrationEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = session?.session_id || "";

  const evaluateState = useCallback(async () => {
    if (!sessionId || sessionId.startsWith("offline_")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orchestratorService.evaluate(
        sessionId,
        activeProblemId || undefined
      );
      setEvaluation(res);
    } catch (err: any) {
      console.warn("Could not evaluate research state:", err);
      setError(err?.message || "Failed to contact orchestrator service");
    } finally {
      setLoading(false);
    }
  }, [sessionId, activeProblemId]);

  useEffect(() => {
    evaluateState();
  }, [evaluateState]);

  const handleDispatchAction = async (action: RecommendedAction) => {
    if (!sessionId) return;
    setIsDispatching(true);
    try {
      const res = await orchestratorService.dispatchAction({
        session_id: sessionId,
        problem_id: activeProblemId || undefined,
        action_type: action.action_type,
        target_engine: action.target_engine,
        parameters: action.suggested_payload || {},
      });

      toast.success(
        res.execution_summary || `Action '${action.title}' dispatched.`
      );
      // Re-evaluate cockpit state & sync parent
      await evaluateState();
      onRefreshSession?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to dispatch recommended action");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleChallengeOverconfidence = async () => {
    if (!sessionId) return;
    setIsDispatching(true);
    try {
      const res = await orchestratorService.dispatchAction({
        session_id: sessionId,
        problem_id: activeProblemId || undefined,
        action_type: "CHALLENGE_ASSUMPTION" as ActionType,
        target_engine: "devils_advocate",
        parameters: {
          reason: "Article II Overconfidence Guardrail Triggered",
        },
      });

      toast.success(
        res.execution_summary || "Socratic assumption challenge initiated."
      );
      await evaluateState();
      onRefreshSession?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to challenge overconfident claim");
    } finally {
      setIsDispatching(false);
    }
  };

  // If session is offline or missing
  if (!session || sessionId.startsWith("offline_")) {
    return (
      <div
        className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-md ${className}`}
      >
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-neutral-200">
              Active Research Cockpit
            </span>
            <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
              Local Mode
            </span>
          </div>
          <span className="text-[11px] text-neutral-500">
            Connect backend for live orchestration evaluation
          </span>
        </div>
      </div>
    );
  }

  const topAction =
    evaluation?.recommended_actions && evaluation.recommended_actions.length > 0
      ? evaluation.recommended_actions[0]
      : null;

  return (
    <div
      className={`rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4 shadow-xl backdrop-blur-md transition-all ${className}`}
    >
      {/* Cockpit Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-sm">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                ACTIVE RESEARCH COCKPIT
              </span>
              <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                {evaluation?.framework_id || session.framework_id || "INNOVATION"}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Deterministic Stage Gates, Epistemic Health & Sovereign Next Actions
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={evaluateState}
            disabled={loading}
            className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 text-xs text-neutral-300 hover:text-white"
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 text-cyan-400 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            }
          >
            {loading ? "Evaluating..." : "Re-evaluate"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAuditDrawerOpen(true)}
            className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 text-xs text-neutral-200"
            leftIcon={<History className="w-3.5 h-3.5 text-neutral-400" />}
          >
            Audit Trail
          </Button>
        </div>
      </div>

      {/* Article II Overconfidence Guardrail Alert Banner */}
      {evaluation?.epistemic_health.overconfidence_risk && (
        <OverconfidenceBanner
          details={
            evaluation.epistemic_health.overconfidence_details ||
            "An active claim asserts high AI certainty without adequate empirical literature backing."
          }
          onChallenge={handleChallengeOverconfidence}
          isDispatching={isDispatching}
        />
      )}

      {/* Main 2-Column Responsive Cockpit Grid */}
      {evaluation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Stage Status & Top Action */}
          <div className="space-y-4">
            <StageGateMonitor
              stageStatus={evaluation.stage_status}
              onOpenGateReview={onOpenGateReview}
            />

            {topAction ? (
              <RecommendedActionCard
                action={topAction}
                onDispatch={handleDispatchAction}
                isDispatching={isDispatching}
              />
            ) : (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center text-xs text-neutral-400">
                All immediate stage actions completed. Awaiting review or manual navigation.
              </div>
            )}
          </div>

          {/* Right Column: Epistemic Health & Critique Synthesis */}
          <div className="space-y-4">
            <EpistemicHealthMeter
              health={evaluation.epistemic_health}
              onOpenScorecard={onOpenScorecard}
            />

            {/* Socratic Questions / Guidance Card */}
            {evaluation.critique_summary.socratic_questions.length > 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2.5 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs border-b border-neutral-800/80 pb-2">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Socratic Inquiries & Blind Spots
                  </span>
                  <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400 font-mono">
                    {evaluation.critique_summary.identified_blind_spots.length} Blind Spots
                  </span>
                </div>
                <ul className="space-y-1.5 pt-1">
                  {evaluation.critique_summary.socratic_questions
                    .slice(0, 3)
                    .map((q, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed"
                      >
                        <span className="text-amber-400 font-mono text-[10px] mt-0.5">
                          {idx + 1}.
                        </span>
                        <span>{q}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center text-xs text-neutral-500 italic">
                No active blind spots detected in the current knowledge graph.
              </div>
            )}
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12 text-xs text-neutral-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Evaluating session research posture...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={evaluateState}
            className="text-xs text-rose-300"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {/* Slide-Over Audit Trail Drawer */}
      <OrchestrationEventsDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        sessionId={sessionId}
      />
    </div>
  );
};
