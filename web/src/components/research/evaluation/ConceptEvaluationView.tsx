"use client";

import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Scale,
  Sparkles,
  RefreshCw,
  Plus,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/common/ToastProvider";
import { evaluationService } from "@/services/evaluationService";
import { ideationService, type DSRArtifact } from "@/services/ideationService";
import type {
  ConceptEvaluationRecord,
  ConceptComparisonResult,
} from "@/types/evaluation";
import { ConceptEvaluationCard } from "./ConceptEvaluationCard";
import { ConceptComparisonGrid } from "./ConceptComparisonGrid";
import { HumanReviewModal } from "./HumanReviewModal";

interface ConceptEvaluationViewProps {
  sessionId?: string;
  problemId?: string;
  problemStatement?: string;
  onAdvanceGate3?: () => void;
}

export const ConceptEvaluationView: React.FC<ConceptEvaluationViewProps> = ({
  sessionId,
  problemId,
  problemStatement,
  onAdvanceGate3,
}) => {
  const toast = useToast();
  const [evaluations, setEvaluations] = useState<ConceptEvaluationRecord[]>([]);
  const [candidates, setCandidates] = useState<DSRArtifact[]>([]);
  const [comparison, setComparison] = useState<ConceptComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [selectedForReview, setSelectedForReview] = useState<ConceptEvaluationRecord | null>(null);
  const [selectedPrimaryThesisId, setSelectedPrimaryThesisId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"EVALUATIONS" | "COMPARISON" | "EXPERIMENTAL_DESIGNS">("EVALUATIONS");

  // Load candidate DSR artifacts from Stage D and previous evaluations
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (problemId) {
        const artifacts = await ideationService.listArtifacts(problemId);
        setCandidates(artifacts);
      }
      if (sessionId) {
        const evals = await evaluationService.getSessionEvaluations(sessionId);
        setEvaluations(evals);

        // If >= 2 evaluations exist, auto-generate initial comparison
        if (evals.length >= 2) {
          try {
            const comp = await evaluationService.compareConcepts({
              concept_ids: evals.map((e) => e.concept_id),
              session_id: sessionId,
            });
            setComparison(comp);
            if (comp.recommended_winner_id) {
              setSelectedPrimaryThesisId(comp.recommended_winner_id);
            }
          } catch (e) {
            console.warn("Initial comparison skipped:", e);
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to load evaluation data:", err);
      toast.error(err?.message || "Failed to load concept evaluations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionId, problemId]);

  // Evaluate a specific DSR candidate concept
  const handleEvaluate = async (cand: DSRArtifact) => {
    try {
      setIsEvaluating(cand.id);
      const record = await evaluationService.evaluateConcept({
        concept_id: cand.id,
        session_id: sessionId,
        prompt_guidance: `Evaluate DSR Artifact '${cand.title}' (Class: ${cand.dsr_class}) for problem: ${problemStatement || "Research Problem"}.`,
      });

      setEvaluations((prev) => {
        const filtered = prev.filter((e) => e.concept_id !== record.concept_id);
        return [record, ...filtered];
      });

      toast.success(
        `Evaluated "${cand.title}" (Composite Score: ${record.composite_score.toFixed(1)})`,
        "Evaluation Complete"
      );

      // If we now have >= 2 evaluations, compare them
      const updatedIds = Array.from(new Set([cand.id, ...evaluations.map((e) => e.concept_id)]));
      if (updatedIds.length >= 2 && sessionId) {
        handleRunComparison(updatedIds);
      }
    } catch (err: any) {
      console.error("Evaluation failed:", err);
      toast.error(err?.message || "Failed to evaluate candidate concept.");
    } finally {
      setIsEvaluating(null);
    }
  };

  // Compare multiple candidate concepts
  const handleRunComparison = async (conceptIds?: string[]) => {
    const idsToCompare = conceptIds || evaluations.map((e) => e.concept_id);
    if (idsToCompare.length < 2) {
      toast.info("At least 2 candidate concepts must be evaluated to produce a comparison matrix.");
      return;
    }

    try {
      setIsComparing(true);
      const res = await evaluationService.compareConcepts({
        concept_ids: idsToCompare,
        session_id: sessionId,
      });
      setComparison(res);
      if (res.recommended_winner_id) {
        setSelectedPrimaryThesisId(res.recommended_winner_id);
      }
      toast.success(
        `Comparison generated across ${idsToCompare.length} candidates. Top candidate: ${res.recommended_winner_id}`,
        "Comparison Matrix Ready"
      );
      setActiveTab("COMPARISON");
    } catch (err: any) {
      console.error("Comparison failed:", err);
      toast.error(err?.message || "Failed to compare concepts.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleSelectPrimaryThesis = (conceptId: string) => {
    setSelectedPrimaryThesisId(conceptId);
    toast.success(`Candidate '${conceptId}' certified as primary research contribution!`, "Primary Thesis Selected");
  };

  const handleHumanReviewSaved = (updatedRecord: ConceptEvaluationRecord) => {
    setEvaluations((prev) =>
      prev.map((e) => (e.concept_id === updatedRecord.concept_id ? updatedRecord : e))
    );
    toast.success(`Human review recorded for concept '${updatedRecord.concept_id}'`, "Review Saved");
  };

  const conceptTitleMap = candidates.reduce<Record<string, string>>((acc, c) => {
    acc[c.id] = c.title;
    return acc;
  }, {});

  const candidateLookup = candidates.reduce<Record<string, DSRArtifact>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Stage E Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <FlaskConical className="w-4 h-4" />
              Stage E: Multi-Criteria Concept Evaluation &amp; Trade-Off Framework
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Evaluate DSR candidate artifacts across the 7 canonical dimensions (Problem Relevance, Evidence Grounding, Gap Validity, Stakeholder Impact, Feasibility, Novelty, Methodology Fit). Composite scores are strictly deterministic; AI provides adversarial critique (Article II &amp; IV).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Stage Gate 3: Evaluation Rigor
            </span>
            {evaluations.some((e) => e.recommendation === "RECOMMENDED" || e.recommendation === "VIABLE_WITH_REFINEMENT") && onAdvanceGate3 && (
              <button
                onClick={onAdvanceGate3}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/50 flex items-center gap-1"
              >
                Clear Gate 3 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setActiveTab("EVALUATIONS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "EVALUATIONS"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Evaluated Concepts ({evaluations.length})
          </button>
          <button
            onClick={() => setActiveTab("COMPARISON")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "COMPARISON"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Trade-Off Comparison {comparison ? "✓" : ""}
          </button>
          <button
            onClick={() => setActiveTab("EXPERIMENTAL_DESIGNS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "EXPERIMENTAL_DESIGNS"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Kothari Experimental Setups
          </button>

          <div className="ml-auto flex items-center gap-2">
            {evaluations.length >= 2 && (
              <button
                onClick={() => handleRunComparison()}
                disabled={isComparing}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isComparing ? "animate-spin" : ""}`} />
                Re-Compare All
              </button>
            )}
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: EVALUATIONS */}
      {activeTab === "EVALUATIONS" && (
        <div className="space-y-6">
          {/* Candidate DSR Artifacts from Phase D Ready for Evaluation */}
          {candidates.length > 0 && (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Available DSR Artifact Candidates (Phase D Formulation)
                </span>
                <span className="text-[11px] text-slate-400">
                  {candidates.length} candidates persisted
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {candidates.map((cand) => {
                  const alreadyEval = evaluations.some((e) => e.concept_id === cand.id);
                  const isEvalThis = isEvaluating === cand.id;
                  return (
                    <div
                      key={cand.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                            {cand.dsr_class}
                          </span>
                          {alreadyEval && (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Evaluated
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {cand.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {cand.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleEvaluate(cand)}
                        disabled={isEvalThis}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          alreadyEval
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
                        }`}
                      >
                        {isEvalThis ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Evaluating...
                          </>
                        ) : alreadyEval ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" /> Re-Evaluate Concept
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" /> Evaluate Concept
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Render Completed Evaluations */}
          {evaluations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center space-y-3">
              <Scale className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-300">
                  No Candidate Concepts Evaluated Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Select a candidate DSR artifact from Phase D above to execute 7-dimension rubric scoring and advisory AI critique.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.map((ev) => {
                const cand = candidateLookup[ev.concept_id];
                return (
                  <ConceptEvaluationCard
                    key={ev.id}
                    evaluation={ev}
                    conceptTitle={cand?.title}
                    conceptDescription={cand?.description}
                    onOpenReviewModal={(record) => setSelectedForReview(record)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRADE-OFF COMPARISON */}
      {activeTab === "COMPARISON" && (
        <div className="space-y-6">
          {comparison ? (
            <ConceptComparisonGrid
              comparison={comparison}
              conceptTitles={conceptTitleMap}
              onSelectPrimaryThesis={handleSelectPrimaryThesis}
              selectedConceptId={selectedPrimaryThesisId || undefined}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center space-y-3">
              <Scale className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-300">
                  Comparison Matrix Not Generated
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Evaluate at least two candidate concepts in the "Evaluated Concepts" tab, then click "Compare All" to generate a pairwise trade-off matrix.
                </p>
              </div>
              {evaluations.length >= 2 && (
                <button
                  onClick={() => handleRunComparison()}
                  disabled={isComparing}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/50 inline-flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isComparing ? "animate-spin" : ""}`} />
                  Generate Comparison Now
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KOTHARI EXPERIMENTAL DESIGNS */}
      {activeTab === "EXPERIMENTAL_DESIGNS" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-200">
              Kothari (2004) Experimental Setups &amp; Cialdini Phenomenon Trapping
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Design a controlled empirical evaluation setup to isolate confounding variables, benchmark against simpler alternatives, and satisfy Stage Gate 3 clearance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-200">CRD (Completely Randomized Design)</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Homogeneous synthetic bench testing across varying hyperparameters and inputs with zero blocking factors.
              </p>
              <div className="text-[11px] text-emerald-400 font-mono pt-1">
                Best for: Pure algorithmic runtime &amp; mathematical complexity.
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-200">RBD (Randomized Block Design)</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Blocking by target hardware specifications (e.g. Raspberry Pi 4 vs Jetson Nano vs Server-grade GPU).
              </p>
              <div className="text-[11px] text-emerald-400 font-mono pt-1">
                Best for: System throughput under heterogeneous hardware.
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-200">Latin Square Design</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Two-factor environmental blocking (e.g. lighting conditions &times; device battery degradation level).
              </p>
              <div className="text-[11px] text-emerald-400 font-mono pt-1">
                Best for: Field validation with two known source-of-variance factors.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Human Review Modal (Article IV Human Sovereignty) */}
      <HumanReviewModal
        isOpen={!!selectedForReview}
        evaluation={selectedForReview}
        conceptTitle={selectedForReview ? conceptTitleMap[selectedForReview.concept_id] : undefined}
        onClose={() => setSelectedForReview(null)}
        onSaved={handleHumanReviewSaved}
      />
    </div>
  );
};
