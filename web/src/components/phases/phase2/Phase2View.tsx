"use client";

import React, { useState, useEffect } from "react";
import { Filter, Sparkles, ArrowRight, CheckCircle2, ArrowLeft, Database, RotateCcw, ShieldCheck } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { AlertBanner } from "@/components/common/AlertBanner";
import { LoadingStatusCard } from "@/components/common/LoadingStatusCard";
import { ModelAttributionBadge } from "@/components/common/ModelAttributionBadge";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { ScreeningScorecardGrid } from "./ScreeningScorecardGrid";
import { ProblemComparisonMatrix } from "./ProblemComparisonMatrix";
import { DecisionRoomWorkspace } from "./DecisionRoomWorkspace";
import { DecisionTimelineModal } from "@/components/common/DecisionTimelineModal";
import { phaseService } from "@/services/phaseService";
import { problemService } from "@/services/problemService";
import { SessionState, ProblemRecord } from "@/lib/types";

interface Phase2ViewProps {
  session: SessionState;
  onUpdateSession: (newState: SessionState) => void;
  onAdvanceToNextPhase: (problemToValidate?: string) => void;
  onGoBack: () => void;
  selectedProblemIds?: string[];
}

export const Phase2View: React.FC<Phase2ViewProps> = ({
  session,
  onUpdateSession,
  onAdvanceToNextPhase,
  onGoBack,
  selectedProblemIds = [],
}) => {
  const [inputText, setInputText] = useState(session.phase1_response || "");
  const [isScreening, setIsScreening] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(session.phase3_problem || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bankCount, setBankCount] = useState<number>(0);
  const [candidateRecords, setCandidateRecords] = useState<ProblemRecord[]>([]);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [screenSource, setScreenSource] = useState<"BANK" | "TEXT">(
    selectedProblemIds.length > 0 ? "BANK" : "BANK"
  );

  useEffect(() => {
    problemService
      .listProblems({ project_id: session?.project_id || undefined })
      .then((probs) => {
        setBankCount(probs.length);
        if (selectedProblemIds && selectedProblemIds.length > 0) {
          const matched = probs.filter((p) => selectedProblemIds.includes(p.id));
          setCandidateRecords(matched);
        } else {
          setCandidateRecords(probs.slice(0, 3));
        }
      })
      .catch(() => {});
  }, [session?.project_id, selectedProblemIds]);

  const handleRunScreening = async () => {
    setIsScreening(true);
    setErrorMessage(null);
    try {
      const idsToScreen =
        screenSource === "BANK" && selectedProblemIds.length > 0
          ? selectedProblemIds
          : undefined;

      const textToScreen =
        screenSource === "TEXT" ? inputText.trim() : session.phase1_response || undefined;

      const res = await phaseService.screen(
        session.session_id,
        textToScreen,
        idsToScreen
      );
      onUpdateSession(res.state);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          "Google Gemini servers are temporarily experiencing high demand (503). Click 'Retry' to re-evaluate."
      );
    } finally {
      setIsScreening(false);
    }
  };

  // Helper to parse JSON output if agent returned structured JSON
  const parseScreeningData = (rawText: string | undefined) => {
    if (!rawText) return null;
    try {
      const direct = JSON.parse(rawText);
      if (direct && Array.isArray(direct.results)) return direct;
    } catch {}

    try {
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed && Array.isArray(parsed.results)) return parsed;
      }
    } catch {}

    try {
      const startIdx = rawText.indexOf("{");
      const endIdx = rawText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const parsed = JSON.parse(rawText.slice(startIdx, endIdx + 1));
        if (parsed && Array.isArray(parsed.results)) return parsed;
      }
    } catch {}

    return null;
  };

  const screeningData = parseScreeningData(session.phase2_response);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Phase 2: Problem Screening & Shortlisting
                </h2>
                <Badge variant="cyan" size="sm">
                  10-Column Scorecard
                </Badge>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
                Evaluates candidate problems against the 5 screening criteria + Winnability check to filter out solutions-in-disguise.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              onClick={handleRunScreening}
              isLoading={isScreening}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              {session.phase2_response ? "Re-Run Screening" : "Run Screening Matrix"}
            </Button>
          </div>
        </div>

        {/* Source Configuration Pill */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">Problem Source:</span>
            {selectedProblemIds.length > 0 ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                {selectedProblemIds.length} Selected from Problem Bank
              </span>
            ) : bankCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                All {bankCount} Problems in Problem Bank
              </span>
            ) : (
              <span className="text-slate-400 font-mono">Phase 1 Report Output</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreenSource("BANK")}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                screenSource === "BANK"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Database Bank ({bankCount})
            </button>
            <button
              onClick={() => setScreenSource("TEXT")}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                screenSource === "TEXT"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Custom Text Input
            </button>
          </div>
        </div>

        {/* Custom Text Area if in TEXT mode */}
        {screenSource === "TEXT" && (
          <div className="pt-2 space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
              Raw Discovery Landscape / Markdown Table
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste Phase 1 problem table or custom markdown..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        )}
      </Card>

      {/* Step 2 Decision Room Workspace */}
      {candidateRecords.length > 0 && !session.phase2_response && !isScreening && (
        <DecisionRoomWorkspace
          candidates={candidateRecords}
          sessionId={session.session_id}
          onSelectWinningProblem={(winningProb) => {
            setSelectedProblem(winningProb.problem_statement);
            onAdvanceToNextPhase(winningProb.problem_statement);
          }}
          onOpenTimeline={() => setIsTimelineOpen(true)}
        />
      )}

      {/* Decision Timeline Modal */}
      <DecisionTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        sessionId={session.session_id}
      />

      {/* Error Banner */}
      {errorMessage && (
        <AlertBanner
          type="error"
          title="Screening Engine Error"
          message={errorMessage}
          onRetry={handleRunScreening}
        />
      )}

      {/* Loading Status Card */}
      {isScreening && (
        <LoadingStatusCard
          title="Evaluating Problem Candidates Against 5 Plausibility Criteria"
          onCancel={() => setIsScreening(false)}
        />
      )}

      {/* Results View */}
      {session.phase2_response && !isScreening && (
        <div className="space-y-6">
          {screeningData ? (
            /* Structured Candidate Grid Component */
            <ScreeningScorecardGrid
              data={screeningData}
              onSelectProblem={(stmt) => {
                setSelectedProblem(stmt);
                onAdvanceToNextPhase(stmt);
              }}
              selectedProblem={selectedProblem}
            />
          ) : (
            /* Fallback Markdown View */
            <Card variant="glass" className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Screening Scorecard Matrix</h3>
                </div>
                <div className="flex items-center gap-2">
                  <ModelAttributionBadge meta={session.phase2_model_meta} />
                  <Badge variant="emerald">Screening Complete</Badge>
                </div>
              </div>

              <div className="prose prose-invert max-w-none prose-sm prose-cyan overflow-x-auto text-slate-200">
                <MarkdownRenderer content={session.phase2_response} />
              </div>
            </Card>
          )}

          {/* Bottom Advance Action */}
          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" onClick={onGoBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Phase 1 Discovery
            </Button>

            <Button
              variant="emerald"
              size="lg"
              onClick={() => onAdvanceToNextPhase(selectedProblem || undefined)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Advance to Phase 3: Socratic Mom Test
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
