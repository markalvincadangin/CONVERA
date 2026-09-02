"use client";

import React, { useState } from "react";
import { Filter, Sparkles, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { AlertBanner } from "@/components/common/AlertBanner";
import { LoadingStatusCard } from "@/components/common/LoadingStatusCard";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { ScreeningScorecardGrid } from "./ScreeningScorecardGrid";
import { phaseService } from "@/services/phaseService";
import { SessionState } from "@/lib/types";

interface Phase2ViewProps {
  session: SessionState;
  onUpdateSession: (newState: SessionState) => void;
  onAdvanceToNextPhase: (problemToValidate?: string) => void;
  onGoBack: () => void;
}

export const Phase2View: React.FC<Phase2ViewProps> = ({
  session,
  onUpdateSession,
  onAdvanceToNextPhase,
  onGoBack,
}) => {
  const [inputText, setInputText] = useState(session.phase1_response || "");
  const [isScreening, setIsScreening] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(session.phase3_problem || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunScreening = async () => {
    if (!inputText.trim()) {
      setErrorMessage("Please provide Phase 1 discovery text to screen.");
      return;
    }
    setIsScreening(true);
    setErrorMessage(null);
    try {
      const res = await phaseService.screen(session.session_id, inputText.trim());
      onUpdateSession(res.state);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          "Google Gemini servers are temporarily experiencing high demand (503). Click 'Retry Now' to re-evaluate."
      );
    } finally {
      setIsScreening(false);
    }
  };

  // Helper to parse JSON output if agent returned structured JSON
  const parseScreeningData = (rawText: string | undefined) => {
    if (!rawText) return null;
    try {
      // Direct parse
      const direct = JSON.parse(rawText);
      if (direct && Array.isArray(direct.results)) return direct;
    } catch {}

    try {
      // Extract from markdown ```json ``` codeblock
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed && Array.isArray(parsed.results)) return parsed;
      }
    } catch {}

    try {
      // Find { "results": ... } block
      const startIdx = rawText.indexOf("{");
      const endIdx = rawText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const substr = rawText.slice(startIdx, endIdx + 1);
        const parsed = JSON.parse(substr);
        if (parsed && Array.isArray(parsed.results)) return parsed;
      }
    } catch {}

    return null;
  };

  const structuredData = parseScreeningData(session.phase2_response);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card variant="glow" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Filter className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Phase 2: Problem Screening & Shortlisting</h2>
              <Badge variant="cyan">10-Column Scorecard</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Batch-evaluates problem candidates against the 5 screening criteria + Winnability check to filter out solutions-in-disguise.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={handleRunScreening}
              isLoading={isScreening}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              {session.phase2_response ? "Re-Run Screening" : "Run Screening & Triage"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Alert Banner */}
      {errorMessage && (
        <AlertBanner
          type="error"
          title="Screening Error"
          message={errorMessage}
          onRetry={handleRunScreening}
          onDismiss={() => setErrorMessage(null)}
          isRetrying={isScreening}
        />
      )}

      {/* Loading Status Card */}
      {isScreening && (
        <LoadingStatusCard
          title="Screening Problem Candidates & Generating Scorecard"
          stages={[
            "Eliminating solutions in disguise...",
            "Scoring Pain, Frequency, Market Size, Existing Sacrifice, and Access (1-5)...",
            "Checking for Fatal Red Flags...",
            "Enforcing mandatory exit conditions for SECOND LOOK candidates...",
          ]}
          onCancel={() => setIsScreening(false)}
        />
      )}

      {/* Input container if Phase 1 response is empty or editable */}
      {!session.phase2_response && !isScreening && (
        <Card variant="glass" className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Problem Candidates Input
          </h3>
          <p className="text-xs text-slate-400">
            {session.phase1_response
              ? "Loaded automatically from Phase 1 Discovery. You can edit or append candidates below before screening."
              : "Paste your Phase 1 problem candidates or observations below:"}
          </p>

          <textarea
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste problem candidates or sector tables here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" size="sm" onClick={onGoBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Phase 1
            </Button>

            <Button
              variant="primary"
              onClick={handleRunScreening}
              isLoading={isScreening}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Evaluate Candidates
            </Button>
          </div>
        </Card>
      )}

      {/* Screening Output View */}
      {session.phase2_response && !isScreening && (
        <div className="space-y-6">
          {structuredData ? (
            <ScreeningScorecardGrid
              data={structuredData}
              onSelectProblem={(prob) => setSelectedProblem(prob)}
              selectedProblem={selectedProblem}
            />
          ) : (
            <Card variant="glass" className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Screening Scorecard & Verdicts</h3>
                </div>
                <Badge variant="emerald">Screening Complete</Badge>
              </div>

              <div className="prose prose-invert max-w-none prose-sm prose-cyan overflow-x-auto text-slate-200">
                <MarkdownRenderer content={session.phase2_response} />
              </div>
            </Card>
          )}

          {/* Advance selection card */}
          <Card variant="bordered" className="p-6 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/40 shadow-xl">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Selected Problem for Phase 3 Deep Validation
              </h4>
              <p className="text-xs text-slate-400">
                The top candidate selected above will enter the Socratic Mom Test Defense Clinic.
              </p>
            </div>

            <textarea
              rows={3}
              placeholder="Select an ADVANCE candidate above or type the problem statement here..."
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" size="sm" onClick={onGoBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Phase 1
              </Button>

              <Button
                variant="emerald"
                size="lg"
                disabled={!selectedProblem.trim()}
                onClick={() => onAdvanceToNextPhase(selectedProblem.trim())}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Problem Validation Clinic
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
