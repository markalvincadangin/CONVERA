"use client";

import React, { useState, useEffect, useRef } from "react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { ShieldCheck, Send, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Sparkles, User, Bot, Award, Lightbulb, MapPin, DollarSign, Clock } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { LEVEL_ORDER, LEVEL_LABELS } from "@/lib/constants";
import { phaseService } from "@/services/phaseService";
import { SessionState } from "@/lib/types";

interface Phase3ViewProps {
  session: SessionState;
  onUpdateSession: (newState: SessionState) => void;
  onAdvanceToNextPhase: () => void;
  onGoBack: () => void;
  initialProblemStatement?: string;
}

const QUICK_EVIDENCE_TEMPLATES = [
  {
    icon: MapPin,
    label: "Location & Role",
    snippet: "Our sufferer is [Specific Occupation] in Barangay [Name], Municipality of [Name], Iloilo.",
  },
  {
    icon: DollarSign,
    label: "Financial Spend",
    snippet: "They currently spend approximately ₱[Amount] per [week/month] on [current workaround] to cope with this.",
  },
  {
    icon: Clock,
    label: "Observed Behavior",
    snippet: "Last [day/week], we directly observed them spending [X] hours doing [workaround].",
  },
];

export const Phase3View: React.FC<Phase3ViewProps> = ({
  session,
  onUpdateSession,
  onAdvanceToNextPhase,
  onGoBack,
  initialProblemStatement,
}) => {
  const [problemStatement, setProblemStatement] = useState(
    session.phase3_problem || initialProblemStatement || ""
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [critiqueMessage, setCritiqueMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const completedLevels = session.completed_levels || [];
  const history = session.phase3_history || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, critiqueMessage]);

  const handleStartClinic = async () => {
    if (!problemStatement.trim()) {
      alert("Please enter a shortlisted problem statement to validate.");
      return;
    }
    setIsInitializing(true);
    try {
      const res = await phaseService.initPhase3(session.session_id, problemStatement.trim());
      onUpdateSession(res.state);
    } catch (err: any) {
      console.error(err);
      alert("Failed to initialize Phase 3 Socratic validation.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!studentAnswer.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setCritiqueMessage(null);
    try {
      const res = await phaseService.submitPhase3Answer(session.session_id, studentAnswer.trim());
      onUpdateSession(res.state);
      setStudentAnswer("");
    } catch (err: any) {
      console.error(err);
      setCritiqueMessage(err.message || "Failed to submit evidence. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAnswerSubmit();
    }
  };

  const isAllLevelsPassed = completedLevels.length >= 6 || Boolean(session.phase3_complete);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Card */}
      <Card variant="glow" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Phase 3: Socratic Mom Test Validation Clinic</h2>
              <Badge variant="amber">Rob Fitzpatrick Protocol</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Autonomous clinical advisor probes for empirical facts, past behaviors, and concrete sacrifices while eliminating polite compliments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onGoBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Phase 2
            </Button>
          </div>
        </div>
      </Card>

      {/* Target Problem Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <Award className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            Active Shortlisted Problem Hypothesis Under Examination:
          </span>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {problemStatement || "No problem statement selected yet. Return to Phase 2 to select an ADVANCE candidate."}
          </p>
        </div>
      </div>

      {/* 6-Level Progress Bar */}
      <Card variant="glass" className="p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider">
            Mom Test Defense Gates ({completedLevels.length}/6 Levels Cleared)
          </span>
          {isAllLevelsPassed && (
            <Badge variant="emerald" size="sm">All Gates Passed</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {LEVEL_ORDER.map((lvl) => {
            const isPassed = completedLevels.includes(lvl);
            const label = LEVEL_LABELS[lvl] || `Level ${lvl}`;
            return (
              <div
                key={lvl}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isPassed
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold font-mono">
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span>L{lvl}</span>}
                  <span className="truncate">{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Socratic Conversation Area */}
      {history.length > 0 ? (
        <Card variant="glass" className="p-6 space-y-6">
          {/* Message Stream */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {history.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? "bg-slate-900/90 border border-slate-800 text-slate-200"
                        : "bg-cyan-600/20 border border-cyan-500/30 text-cyan-100 ml-auto"
                    }`}
                  >
                    <MarkdownRenderer content={msg.content} />
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Student Response Input Form */}
          {!isAllLevelsPassed ? (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              {/* Quick helper templates */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-400" /> Fast Templates:
                </span>
                {QUICK_EVIDENCE_TEMPLATES.map((tpl, i) => {
                  const Icon = tpl.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setStudentAnswer((prev) => (prev ? `${prev}\n${tpl.snippet}` : tpl.snippet))}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1"
                    >
                      <Icon className="w-3 h-3 text-amber-400" />
                      {tpl.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Provide concrete field evidence (past actions, specific names, numbers, actual money/time spent)..."
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
                <span className="absolute right-3 bottom-2.5 text-[10px] text-slate-500">
                  Ctrl + Enter to send
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  <strong className="text-amber-300">Mom Test Rule:</strong> State what they <em>did in the past</em>, not what they <em>promise they would do</em>.
                </p>

                <Button
                  variant="primary"
                  onClick={handleAnswerSubmit}
                  isLoading={isSubmitting}
                  disabled={!studentAnswer.trim()}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Submit Evidence
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Problem Validated! Mechanical Ratchet Unlocked
                </h3>
                <p className="text-xs text-emerald-300 max-w-xl mx-auto mt-1">
                  Your problem statement has survived all 6 Socratic Mom Test levels with concrete empirical evidence. You are now authorized to enter Phase 4 Solution Ideation.
                </p>
              </div>

              <Button
                variant="emerald"
                size="lg"
                onClick={onAdvanceToNextPhase}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Advance to Phase 4: Solution Ideation & SVB Canvas
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card variant="glass" className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Begin Socratic Mom Test Defense</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              The AI validation advisor will examine Level 1 (Specific Sufferer) to begin testing your problem foundation.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleStartClinic}
            isLoading={isInitializing}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Start Socratic Defense Clinic
          </Button>
        </Card>
      )}
    </div>
  );
};
