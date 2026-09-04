import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  X,
  Award,
  BookOpen,
  Sliders,
  Send,
  Lock,
} from "lucide-react";
import { fetchApi } from "@/lib/api-client";

interface GateCriteria {
  id: string;
  label: string;
}

interface GateStatus {
  gate_id: string;
  gate_name: string;
  threshold: number;
  criteria: GateCriteria[];
  verdict: "PASS" | "REVISE" | "FAIL" | "UNREVIEWED";
  overall_score: number;
  passed_criteria: GateCriteria[];
  failed_criteria: GateCriteria[];
  reviewer_feedback?: string;
  reviewer_role?: string;
}

interface GateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateId: "GATE_1" | "GATE_2" | "GATE_3" | "GATE_4";
  projectId?: string;
  onGatePassed?: () => void;
}

export const GateReviewModal: React.FC<GateReviewModalProps> = ({
  isOpen,
  onClose,
  gateId,
  projectId = "default_proj",
  onGatePassed,
}) => {
  const [gateStatus, setGateStatus] = useState<GateStatus | null>(null);
  const [checkedCriteria, setCheckedCriteria] = useState<string[]>([]);
  const [score, setScore] = useState<number>(85);
  const [feedback, setFeedback] = useState<string>("");
  const [role, setRole] = useState<string>("RESEARCH_ADVISOR");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    setLoading(true);
    fetchApi<GateStatus>(`/api/gates/status?gate_id=${gateId}&project_id=${projectId}`)
      .then((data: GateStatus) => {
        setGateStatus(data);
        if (data.passed_criteria && data.passed_criteria.length > 0) {
          setCheckedCriteria(data.passed_criteria.map((c: GateCriteria) => c.id));
        } else if (data.criteria) {
          // Default check all if unreviewed to ease self-audit
          setCheckedCriteria(data.criteria.map((c: GateCriteria) => c.id));
        }
        if (data.overall_score > 0) setScore(data.overall_score);
        if (data.reviewer_feedback) setFeedback(data.reviewer_feedback);
        if (data.reviewer_role) setRole(data.reviewer_role);
      })
      .catch((err: unknown) => console.error("Error fetching gate status:", err))
      .finally(() => setLoading(false));
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, gateId, projectId, onClose]);

  if (!isOpen) return null;

  const toggleCriteria = (id: string) => {
    setCheckedCriteria((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSignOff = async () => {
    setSubmitting(true);
    try {
      const res = await fetchApi<{ status: string; gate_review: any }>("/api/gates/evaluate", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          gate_id: gateId,
          rubric_scores: { domain_score: score },
          checked_criteria_ids: checkedCriteria,
          reviewer_feedback: feedback,
          reviewer_role: role,
        }),
      });

      if (res.gate_review) {
        setGateStatus(res.gate_review);
        if (res.gate_review.verdict === "PASS" && onGatePassed) {
          onGatePassed();
        }
      }
    } catch (err: unknown) {
      console.error("Failed to sign off on gate:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const isPassed = gateStatus?.verdict === "PASS";
  const isRevise = gateStatus?.verdict === "REVISE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div role="dialog" aria-modal="true" aria-labelledby="gate-review-dialog-title" tabIndex={-1} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] focus-visible:outline-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 id="gate-review-dialog-title" className="text-lg font-bold text-white flex items-center gap-2">
                {gateStatus?.gate_name || gateId}
                {isPassed && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> RATIFIED
                  </span>
                )}
                {isRevise && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> REVISION NEEDED
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Formal Academic Quality Gate Audit & Rubric Sign-off (Threshold: {gateStatus?.threshold || 75}%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close gate review dialog"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading Gate Rubrics...</div>
          ) : (
            <>
              {/* Checklist Criteria */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                  <Award className="w-4 h-4 text-indigo-400" /> Mandatory Gate Criteria
                </label>
                <div className="space-y-2.5">
                  {gateStatus?.criteria?.map((c) => {
                    const isChecked = checkedCriteria.includes(c.id);
                    return (
                      <div
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCriteria(c.id); } }}
                        key={c.id}
                        onClick={() => toggleCriteria(c.id)}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          isChecked
                            ? "bg-indigo-500/10 border-indigo-500/30 text-slate-200"
                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "border-slate-700 bg-slate-900"
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs font-medium leading-relaxed">{c.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rubric Score Slider */}
              <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" /> Panel Assessment Score
                  </label>
                  <span className={`text-base font-bold ${score >= (gateStatus?.threshold || 75) ? "text-emerald-400" : "text-amber-400"}`}>
                    {score}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>40% (Fail)</span>
                  <span>75% (Passing Threshold)</span>
                  <span>100% (Exemplary)</span>
                </div>
              </div>

              {/* Reviewer Role & Feedback */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Reviewer Role:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="RESEARCH_ADVISOR">Research Advisor</option>
                    <option value="CAPSTONE_PANEL_CHAIR">Capstone Panel Chair</option>
                    <option value="PEER_REVIEWER">Peer Reviewer</option>
                    <option value="SELF_AUDIT">Self-Audit (Researcher)</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter formal committee or advisor feedback regarding this gate..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSignOff}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              "Signing Off..."
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Ratify Gate Decision
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
