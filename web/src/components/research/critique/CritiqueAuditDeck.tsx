"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/common/ToastProvider";
import {
  critiqueService,
  CrossStageCritiqueRecord,
  CritiqueEvaluationResponse,
  CritiqueSeverity,
  CritiqueStatus,
  CritiqueType,
} from "@/services/critiqueService";

interface CritiqueAuditDeckProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  projectId?: string;
  problemId?: string;
  onScoreUpdated?: (score: number) => void;
}

export const CritiqueAuditDeck: React.FC<CritiqueAuditDeckProps> = ({
  isOpen,
  onClose,
  sessionId,
  projectId = "default_proj",
  problemId,
  onScoreUpdated,
}) => {
  const toast = useToast();
  const [data, setData] = useState<CritiqueEvaluationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionAction, setResolutionAction] = useState<"RESOLVED" | "DISMISSED">("RESOLVED");
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [isSubmittingResolution, setIsSubmittingResolution] = useState<boolean>(false);
  const [expandedClaims, setExpandedClaims] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchCritiques();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, sessionId]);

  const fetchCritiques = async () => {
    try {
      setIsLoading(true);
      const res = await critiqueService.getSessionCritiques(sessionId, projectId);
      setData(res);
      if (onScoreUpdated) {
        onScoreUpdated(res.consistency_score);
      }
    } catch (err) {
      console.error("Failed to fetch critique records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    try {
      setIsEvaluating(true);
      const res = await critiqueService.evaluateCritique({
        session_id: sessionId,
        project_id: projectId,
        problem_id: problemId,
        include_ai_advisory: true,
      });
      setData(res);
      if (onScoreUpdated) {
        onScoreUpdated(res.consistency_score);
      }
      toast.success(
        `Cross-examination complete. Consistency score: ${res.consistency_score}% (${res.open_critiques} open tensions).`,
        "Critique Evaluation Complete"
      );
    } catch (err: any) {
      console.error("Adversarial evaluation failed:", err);
      toast.error(err.message || "Failed to execute adversarial cross-examination", "Critique Error");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleResolveSubmit = async (critiqueId: string) => {
    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      toast.warning("Article IV requires a substantive rationale note (at least 5 characters).", "Human Rationale Required");
      return;
    }
    try {
      setIsSubmittingResolution(true);
      const updated = await critiqueService.resolveCritique({
        critique_id: critiqueId,
        status: resolutionAction,
        resolution_notes: resolutionNotes.trim(),
      });

      // Update local state
      if (data) {
        const updatedList = data.critiques.map((c) =>
          c.id === critiqueId ? updated : c
        );
        // Recalculate score locally
        const openCritiques = updatedList.filter((c) => c.status === "OPEN");
        const fatal = openCritiques.filter((c) => c.severity === "FATAL").length;
        const critical = openCritiques.filter((c) => c.severity === "CRITICAL").length;
        const warning = openCritiques.filter((c) => c.severity === "WARNING").length;
        const advisory = openCritiques.filter((c) => c.severity === "ADVISORY").length;
        const penalty = (fatal * 25) + (critical * 15) + (warning * 8) + (advisory * 3);
        const newScore = Math.max(0, Math.min(100, 100 - penalty));

        const updatedData: CritiqueEvaluationResponse = {
          ...data,
          consistency_score: Math.round(newScore * 10) / 10,
          open_critiques: openCritiques.length,
          fatal_count: fatal,
          critical_count: critical,
          warning_count: warning,
          advisory_count: advisory,
          critiques: updatedList,
        };
        setData(updatedData);
        if (onScoreUpdated) {
          onScoreUpdated(updatedData.consistency_score);
        }
      }

      toast.success(
        `Critique marked as ${resolutionAction}. Consistency score recalculated.`,
        "Tension Resolved"
      );
      setResolvingId(null);
      setResolutionNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update critique status", "Resolution Error");
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const toggleClaimExpansion = (id: string) => {
    setExpandedClaims((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  const score = data?.consistency_score ?? 100;
  const scoreColor =
    score >= 85
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-950/40"
      : score >= 70
      ? "text-amber-400 border-amber-500/30 bg-amber-950/40"
      : "text-rose-400 border-rose-500/30 bg-rose-950/40";

  const critiquesList = (data?.critiques || []).filter((c) => {
    if (filterSeverity !== "ALL" && c.severity !== filterSeverity) return false;
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cross-Stage Research Critique & Blind-Spot Engine"
        className="w-full max-w-4xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Cross-Stage Research Critique & Blind-Spot Engine
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Phase C3 (SDD-019)
                  </span>
                  {data?.is_degraded && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Offline Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adversarial cross-examination of literature claims, circumscription loops, and feasibility constraints.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunEvaluation}
                disabled={isEvaluating}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? "animate-spin" : ""}`} />
                {isEvaluating ? "Cross-Examining..." : "Run Adversarial Audit"}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
                aria-label="Close critique deck"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Epistemic Health & Severity Breakdown Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {/* Consistency Score Badge */}
            <div className={`col-span-2 p-3 rounded-2xl border ${scoreColor} flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Consistency Score
                </span>
                <span className="text-2xl font-black tracking-tight">{score}%</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-medium text-slate-400 block">
                  {score >= 85 ? "High Rigor" : score >= 70 ? "Moderate Tension" : "Severe Risk"}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {data?.open_critiques ?? 0} Open / {data?.total_critiques ?? 0} Total
                </span>
              </div>
            </div>

            {/* Fatal Pill */}
            <div className="p-3 rounded-2xl border border-rose-900/40 bg-rose-950/20 text-center">
              <span className="text-[10px] font-mono font-bold text-rose-400 block">FATAL</span>
              <span className="text-xl font-bold text-rose-200">{data?.fatal_count ?? 0}</span>
              <span className="text-[9px] font-mono text-rose-500 block">-25 ea</span>
            </div>

            {/* Critical Pill */}
            <div className="p-3 rounded-2xl border border-amber-900/40 bg-amber-950/20 text-center">
              <span className="text-[10px] font-mono font-bold text-amber-400 block">CRITICAL</span>
              <span className="text-xl font-bold text-amber-200">{data?.critical_count ?? 0}</span>
              <span className="text-[9px] font-mono text-amber-500 block">-15 ea</span>
            </div>

            {/* Warning Pill */}
            <div className="p-3 rounded-2xl border border-yellow-900/40 bg-yellow-950/20 text-center">
              <span className="text-[10px] font-mono font-bold text-yellow-400 block">WARNING</span>
              <span className="text-xl font-bold text-yellow-200">{data?.warning_count ?? 0}</span>
              <span className="text-[9px] font-mono text-yellow-500 block">-8 ea</span>
            </div>

            {/* Advisory Pill */}
            <div className="p-3 rounded-2xl border border-cyan-900/40 bg-cyan-950/20 text-center">
              <span className="text-[10px] font-mono font-bold text-cyan-400 block">ADVISORY</span>
              <span className="text-xl font-bold text-cyan-200">{data?.advisory_count ?? 0}</span>
              <span className="text-[9px] font-mono text-cyan-500 block">-3 ea</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono text-slate-500 mr-1">Status:</span>
              {(["ALL", "OPEN", "RESOLVED", "DISMISSED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    filterStatus === st
                      ? "bg-slate-800 text-white border border-slate-700 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono text-slate-500 mr-1">Severity:</span>
              {(["ALL", "FATAL", "CRITICAL", "WARNING", "ADVISORY"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    filterSeverity === sev
                      ? "bg-slate-800 text-white border border-slate-700 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 flex-1">
          {isLoading ? (
            <div className="text-center py-20 text-slate-400 text-sm space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-400" />
              <p>Gathering relational state across all 6 DSR stages...</p>
            </div>
          ) : critiquesList.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No Matching Contradictions</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active critiques found under the selected filters. Click{" "}
                <span className="text-rose-400 font-semibold">Run Adversarial Audit</span> to cross-examine current stage artifacts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {critiquesList.map((critique) => {
                const isResolving = resolvingId === critique.id;
                const isExpanded = expandedClaims[critique.id] ?? false;

                const sevBadge =
                  critique.severity === "FATAL"
                    ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                    : critique.severity === "CRITICAL"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : critique.severity === "WARNING"
                    ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
                    : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";

                return (
                  <div
                    key={critique.id}
                    className={`rounded-2xl border transition-all duration-200 p-5 space-y-4 ${
                      critique.status === "OPEN"
                        ? "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-lg"
                        : "bg-slate-950 border-slate-900 opacity-75"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${sevBadge}`}>
                          {critique.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {critique.critique_type.replace(/_/g, " ")}
                        </span>
                        {critique.target_stages.map((st) => (
                          <span
                            key={st}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60"
                          >
                            {st}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">
                          Plausibility: {critique.plausibility_score}%
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            critique.status === "OPEN"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : critique.status === "RESOLVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {critique.status}
                        </span>
                      </div>
                    </div>

                    {/* Fatal Flaw Statement */}
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{critique.fatal_flaw_summary}</span>
                      </h4>
                    </div>

                    {/* Socratic Kill Question (Defense Simulation) */}
                    <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Committee Defense Kill Question</span>
                      </div>
                      <p className="text-xs text-rose-100 font-medium leading-relaxed italic">
                        &ldquo;{critique.kill_question}&rdquo;
                      </p>
                    </div>

                    {/* Collapsible Cross-Stage Evidentiary Claims */}
                    {critique.cross_stage_claims && critique.cross_stage_claims.length > 0 && (
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleClaimExpansion(critique.id)}
                          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>
                            {isExpanded ? "Hide" : "Show"} Cross-Stage Evidence Excerpts ({critique.cross_stage_claims.length})
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {critique.cross_stage_claims.map((claim, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1"
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-400">
                                  <span className="text-indigo-400">{claim.stage}</span>
                                  <span className="truncate max-w-[150px]">{claim.claim_title}</span>
                                </div>
                                <p className="text-[11px] text-slate-300 italic line-clamp-3">
                                  &ldquo;{claim.excerpt}&rdquo;
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Operational Mitigation Recommendation */}
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Actionable Mitigation Protocol</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {critique.mitigation_recommendation}
                      </p>
                    </div>

                    {/* Resolution Section (Article IV Human Sovereignty) */}
                    {critique.status === "OPEN" ? (
                      <div className="pt-2 border-t border-slate-800/80">
                        {!isResolving ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setResolvingId(critique.id);
                                setResolutionAction("DISMISSED");
                                setResolutionNotes("");
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
                            >
                              Dismiss Critique
                            </button>
                            <button
                              onClick={() => {
                                setResolvingId(critique.id);
                                setResolutionAction("RESOLVED");
                                setResolutionNotes("");
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Record Mitigation
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950 animate-in fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">
                                {resolutionAction === "RESOLVED"
                                  ? "Record Attributable Mitigation"
                                  : "Dismiss Critique with Rationale"}
                              </span>
                              <button
                                onClick={() => setResolvingId(null)}
                                className="text-slate-500 hover:text-white text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              placeholder="Document how this tension was resolved or why it is dismissed (Article IV mandate, min 5 chars)..."
                              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-500">
                                {resolutionNotes.length} characters (min 5)
                              </span>
                              <button
                                onClick={() => handleResolveSubmit(critique.id)}
                                disabled={isSubmittingResolution || resolutionNotes.trim().length < 5}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                              >
                                {isSubmittingResolution ? "Submitting..." : "Commit Resolution"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                            Human Resolution Rationale
                          </span>
                          <p className="text-slate-300 italic">&ldquo;{critique.resolution_notes}&rdquo;</p>
                        </div>
                        <button
                          onClick={() => {
                            setResolvingId(critique.id);
                            setResolutionAction("RESOLVED");
                            setResolutionNotes(critique.resolution_notes || "");
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 bg-slate-950/95 backdrop-blur border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">
              Epistemic Formula: max(0, 100 - (25*N_fatal + 15*N_crit + 8*N_warn + 3*N_adv))
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close Deck
          </button>
        </div>
      </div>
    </div>
  );
};
