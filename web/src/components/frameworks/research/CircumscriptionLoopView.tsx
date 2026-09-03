import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Activity,
  ArrowRight,
  Target,
  Sparkles,
  Layers
} from "lucide-react";
import { fetchApi } from "@/lib/api-client";

interface CircumscriptionIteration {
  id: string;
  iteration_number: number;
  artifact_name: string;
  test_run_name: string;
  metric_name: string;
  observed_value: number;
  target_value: number;
  status: "PASSED" | "FAILED_LOOPBACK";
  failure_mode?: string;
  constraint_extracted?: string;
  target_phase_loopback: string;
  created_at: string;
}

interface CircumscriptionSummary {
  project_id: string;
  total_iterations: number;
  failed_loopbacks: number;
  passed_benchmarks: number;
  is_converged: boolean;
  latest_iteration?: CircumscriptionIteration;
  history: CircumscriptionIteration[];
}

export const CircumscriptionLoopView: React.FC<{ projectId?: string }> = ({
  projectId = "default_proj",
}) => {
  const [summary, setSummary] = useState<CircumscriptionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states for adding iteration
  const [artifactName, setArtifactName] = useState("Edge CNN Quantized Node");
  const [testRunName, setTestRunName] = useState("Thermal Drift Trial #1");
  const [metricName, setMetricName] = useState("Inference Accuracy (%)");
  const [observedValue, setObservedValue] = useState(74.5);
  const [targetValue, setTargetValue] = useState(85.0);
  const [failureMode, setFailureMode] = useState("Thermal noise degraded activation gradients at 38°C.");
  const [constraintExtracted, setConstraintExtracted] = useState("Add temperature-compensated scaling layer in Phase D.");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [projectId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<CircumscriptionSummary>(
        `/api/circumscription/iterations?project_id=${projectId}`
      );
      setSummary(data);
    } catch (err) {
      console.error("Error loading circumscription summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordIteration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchApi("/api/circumscription/iterations", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          artifact_name: artifactName,
          test_run_name: testRunName,
          metric_name: metricName,
          observed_value: Number(observedValue),
          target_value: Number(targetValue),
          failure_mode: failureMode,
          constraint_extracted: constraintExtracted,
          target_phase_loopback: "PHASE_D",
        }),
      });
      setIsModalOpen(false);
      loadSummary();
    } catch (err) {
      console.error("Failed to record iteration:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-400" />
            DSR Circumscription Iteration Tracker
            {summary?.is_converged ? (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> CONVERGED (Target Met)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> ACTIVE LOOPBACKS ({summary?.failed_loopbacks || 0})
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Design Science Research failure-driven iteration loop: failure in evaluation leads to constraint extraction and artifact redesign.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Log Evaluation Run
        </button>
      </div>

      {/* Iteration Cards */}
      {loading ? (
        <div className="text-center py-8 text-xs text-slate-500">Loading iteration history...</div>
      ) : summary?.history && summary.history.length > 0 ? (
        <div className="space-y-3">
          {summary.history.map((iter) => {
            const isPassed = iter.status === "PASSED";
            return (
              <div
                key={iter.id}
                className={`p-4 rounded-xl border transition ${
                  isPassed
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Run #{iter.iteration_number}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{iter.test_run_name}</span>
                    <span className="text-[10px] text-slate-400">({iter.artifact_name})</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      isPassed
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {isPassed ? "BENCHMARK PASSED" : "LOOPBACK TO PHASE D"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Metric Performance</span>
                    <span className="font-semibold text-slate-300">
                      {iter.metric_name}: <span className={isPassed ? "text-emerald-400" : "text-amber-400"}>{iter.observed_value}</span> / Target: {iter.target_value}
                    </span>
                  </div>

                  {iter.failure_mode && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Failure Analysis</span>
                      <span className="text-rose-300/90">{iter.failure_mode}</span>
                    </div>
                  )}

                  {iter.constraint_extracted && (
                    <div className="sm:col-span-2 pt-1 border-t border-slate-800/60 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-indigo-300">
                        <strong className="font-semibold text-indigo-200">Extracted Design Constraint:</strong> {iter.constraint_extracted}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
          <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No evaluation benchmark trials logged yet.</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Log test runs to track how evaluation failures refine your artifact design.
          </p>
        </div>
      )}

      {/* Log Evaluation Run Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-indigo-400" />
              Record DSR Evaluation Benchmark Run
            </h4>

            <form onSubmit={handleRecordIteration} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Artifact / Component Name
                </label>
                <input
                  type="text"
                  value={artifactName}
                  onChange={(e) => setArtifactName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Test Run Description
                </label>
                <input
                  type="text"
                  value={testRunName}
                  onChange={(e) => setTestRunName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Metric Name
                  </label>
                  <input
                    type="text"
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Observed Value
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={observedValue}
                    onChange={(e) => setObservedValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Target Threshold
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {observedValue < targetValue && (
                <>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                      Observed Failure Mode
                    </label>
                    <textarea
                      rows={2}
                      value={failureMode}
                      onChange={(e) => setFailureMode(e.target.value)}
                      placeholder="What caused the artifact to fail this benchmark threshold?"
                      className="w-full bg-slate-950 border border-rose-900/50 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                      Extracted Design Constraint (Loopback Refinement)
                    </label>
                    <textarea
                      rows={2}
                      value={constraintExtracted}
                      onChange={(e) => setConstraintExtracted(e.target.value)}
                      placeholder="What constraint must now be incorporated into Phase D Model redesign?"
                      className="w-full bg-slate-950 border border-indigo-900/50 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  {submitting ? "Logging..." : "Record Run"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
