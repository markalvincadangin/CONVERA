"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { ProblemCommentsSection } from "./ProblemCommentsSection";
import { authService } from "@/services/authService";
import { ProblemRecord } from "@/lib/types";
import { problemService } from "@/services/problemService";
import { DevilsAdvocateModal } from "./DevilsAdvocateModal";
import {
  ExternalLink,
  ShieldCheck,
  Tag,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  Save,
  X,
  TrendingUp,
  MapPin,
  User,
  Activity,
  Flame,
  ThumbsUp,
  Sparkles,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ProblemDetailModalProps {
  problem: ProblemRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onProblemUpdated: (problem: ProblemRecord) => void;
  onProblemDeleted: (problemId: string) => void;
  onAdvanceToPhase2?: (problemId: string) => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  problem,
  isOpen,
  onClose,
  onProblemUpdated,
  onProblemDeleted,
  onAdvanceToPhase2,
}) => {
  if (!problem) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [statement, setStatement] = useState(problem.problem_statement);
  const [workaround, setWorkaround] = useState(problem.workaround || "");
  const [impact, setImpact] = useState(problem.quantified_impact || "");
  const [notes, setNotes] = useState(problem.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isDevilsAdvocateOpen, setIsDevilsAdvocateOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await problemService.updateProblem(problem.id, {
        problem_statement: statement,
        workaround,
        quantified_impact: impact,
        notes,
      });
      onProblemUpdated(res.problem);
      setIsEditing(false);
    } catch (err: any) {
      alert("Failed to update problem: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVote = async () => {
    setIsVoting(true);
    try {
      const res = await problemService.voteProblem(problem.id, "up");
      onProblemUpdated(res.problem);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove problem ${problem.id} from the bank?`)) return;
    setIsDeleting(true);
    try {
      await problemService.deleteProblem(problem.id);
      onProblemDeleted(problem.id);
      onClose();
    } catch (err: any) {
      alert("Failed to delete problem: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const tierColors = {
    STRONGLY_DOCUMENTED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    DOCUMENTED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    SIGNAL: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  };

  const tierLabels = {
    STRONGLY_DOCUMENTED: "🟢 Strongly Documented",
    DOCUMENTED: "🔵 Documented",
    SIGNAL: "🟡 Signal",
  };

  const breakdown = problem.score_breakdown;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Problem Dossier: ${problem.id}`} maxWidth="4xl">
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Top Badges Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                {problem.id}
              </span>
              <span className="text-xs font-semibold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {problem.sector}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                  tierColors[problem.evidence_tier] || tierColors.SIGNAL
                }`}
              >
                {tierLabels[problem.evidence_tier] || problem.evidence_tier}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVote}
                disabled={isVoting}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs text-white transition-colors"
                title="Team Upvote"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono font-bold">{problem.votes || 0}</span>
              </button>

              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 text-xs transition-colors"
                title="Toggle Rubric Breakdown"
              >
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono font-bold text-cyan-300">
                  Score: {problem.score || 0}%
                </span>
                {showBreakdown ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
              </button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDevilsAdvocateOpen(true)}
                leftIcon={<Flame className="w-3.5 h-3.5" />}
              >
                Devil's Advocate
              </Button>
            </div>
          </div>

          {/* 5-Dimension Rubric Scorecard (Expandable) */}
          {showBreakdown && breakdown && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  Evidence Confidence Rubric Breakdown
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {breakdown.total_score} / 100 ({breakdown.confidence_label})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                {Object.entries(breakdown.dimensions).map(([key, dim]) => (
                  <div key={key} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block truncate">{dim.label}</span>
                    <div className="flex items-center justify-between text-xs font-bold text-white font-mono">
                      <span>{dim.score}</span>
                      <span className="text-slate-500 font-normal">/{dim.max}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${(dim.score / dim.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {breakdown.recommendations && breakdown.recommendations.length > 0 && (
                <div className="p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-500/20 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-cyan-300">Upgrade Path Recommendations:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                    {breakdown.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Target Sufferer & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
              <User className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Target Sufferer
                </span>
                <p className="text-xs font-medium text-white mt-0.5">
                  {problem.sufferer_occupation || "Not specified"}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Location & Scope
                </span>
                <p className="text-xs font-medium text-white mt-0.5">
                  {problem.sufferer_location || "Iloilo, Philippines"}
                </p>
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pure Friction Statement
              </span>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>

            {!isEditing ? (
              <p className="text-sm font-medium text-white leading-relaxed">{problem.problem_statement}</p>
            ) : (
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            )}
          </div>

          {/* Workaround & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Active Coping Workaround
              </span>
              {!isEditing ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {problem.workaround || "No specific workaround recorded yet."}
                </p>
              ) : (
                <textarea
                  value={workaround}
                  onChange={(e) => setWorkaround(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              )}
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Quantified Impact / Economic Consequence
              </span>
              {!isEditing ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {problem.quantified_impact || "Friction not yet quantified."}
                </p>
              ) : (
                <textarea
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              )}
            </div>
          </div>

          {/* Evidence Sources */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Verified Evidence Sources ({problem.sources?.length || 0})
              </h4>
            </div>

            {problem.sources && problem.sources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {problem.sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{src.source_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        Tier {src.source_tier || "B"}
                      </span>
                    </div>
                    {src.source_url ? (
                      <a
                        href={src.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        {src.source_url.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Internal / Primary Note</span>
                    )}
                    {src.quote_or_summary && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                        "{src.quote_or_summary}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No formal source citations attached.</p>
            )}
          </div>

          {/* Tags & Phase Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {problem.tags && problem.tags.length > 0 ? (
                  problem.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No tags</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                Pipeline Verdicts
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Phase 2 (Screening):</span>
                  <span className="font-bold font-mono text-cyan-400">
                    {problem.phase2_verdict || "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Phase 3 (Mom Test):</span>
                  <span className="font-bold font-mono text-emerald-400">
                    {problem.phase3_verdict || "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Notes & Analysis */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Team Research Notes & Deep Dive Summary
            </span>
            {!isEditing ? (
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {problem.notes || "No deep-dive notes recorded."}
              </p>
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Changes
                </Button>
              ) : (
                <>
                  {onAdvanceToPhase2 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onAdvanceToPhase2(problem.id);
                        onClose();
                      }}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    >
                      Send to Phase 2
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Nested Devil's Advocate Modal */}
      <DevilsAdvocateModal
        problem={problem}
        isOpen={isDevilsAdvocateOpen}
        onClose={() => setIsDevilsAdvocateOpen(false)}
        onApplyReframing={(newStatement) => {
          setStatement(newStatement);
          handleSave();
          setIsDevilsAdvocateOpen(false);
        }}
      />
    </>
  );
};
