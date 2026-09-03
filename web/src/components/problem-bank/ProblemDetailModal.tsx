"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { useToast } from "@/components/common/ToastProvider";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Button } from "@/components/common/Button";
import { ProblemCommentsSection } from "./ProblemCommentsSection";
import { authService } from "@/services/authService";
import { ProblemRecord } from "@/lib/types";
import { sanitizeText, sanitizeProblemId } from "@/lib/sanitize";
import { problemService } from "@/services/problemService";
import { DevilsAdvocateModal } from "./DevilsAdvocateModal";
import { SocraticCriticModal } from "./SocraticCriticModal";
import { CitationVerifierModal } from "./CitationVerifierModal";
import { ResearchEvidenceModal } from "./ResearchEvidenceModal";
import { EvidenceLedgerCard } from "./EvidenceLedgerCard";
import { AssumptionRadarCard } from "./AssumptionRadarCard";
import { KnowledgeGraphData, ClaimRecord, AssumptionRecord } from "@/lib/types";
import {
  ExternalLink, Search, Plus, Globe, BookOpen,
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
  // Toast hook
  problem,
  isOpen,
  onClose,
  onProblemUpdated,
  onProblemDeleted,
  onAdvanceToPhase2,
}) => {
  const toast = useToast();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!problem) return null;

  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraphData | null>(null);
  const [isGeneratingKG, setIsGeneratingKG] = useState(false);

  useEffect(() => {
    if (isOpen && problem?.id) {
      problemService
        .getKnowledgeGraph(problem.id)
        .then((res) => {
          setKnowledgeGraph(res.knowledge_graph);
        })
        .catch(() => {});
    }
  }, [isOpen, problem?.id]);

  const handleGenerateKG = async (mode: "COMMERCIAL" | "CIVIC_INSTITUTIONAL" = "COMMERCIAL") => {
    if (!problem?.id) return;
    setIsGeneratingKG(true);
    try {
      const res = await problemService.generateAssumptions(problem.id, mode);
      setKnowledgeGraph(res.knowledge_graph);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate assumptions", "Generation Error");
    } finally {
      setIsGeneratingKG(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [statement, setStatement] = useState(problem.problem_statement);
  const [workaround, setWorkaround] = useState(problem.workaround || "");
  const [impact, setImpact] = useState(problem.quantified_impact || "");
  const [notes, setNotes] = useState(problem.notes || "");
  const [sources, setSources] = useState<any[]>(problem.sources || []);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceTier, setNewSourceTier] = useState<string>("B");
  const [newSourceSummary, setNewSourceSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isDevilsAdvocateOpen, setIsDevilsAdvocateOpen] = useState(false);
  const [isCriticOpen, setIsCriticOpen] = useState(false);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleAddSource = () => {
    if (!newSourceName.trim()) return;
    const newEntry = {
      source_name: newSourceName.trim(),
      source_url: newSourceUrl.trim() || null,
      source_tier: newSourceTier,
      quote_or_summary: newSourceSummary.trim() || null,
      citation: newSourceName.trim(),
    };
    setSources([...sources, newEntry]);
    setNewSourceName("");
    setNewSourceUrl("");
    setNewSourceSummary("");
  };

  const handleRemoveSource = (indexToRemove: number) => {
    setSources(sources.filter((_, i) => i !== indexToRemove));
  };

  const getDeepSearchUrl = (srcName: string, domainUrl?: string | null) => {
    const cleanKeywords = (problem.problem_statement || "")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["with", "from", "that", "this", "they", "have", "been", "their", "into", "over"].includes(w.toLowerCase()))
      .slice(0, 3)
      .join(" ");

    const cleanLoc = (problem.sufferer_location || "Iloilo").split(",")[0].trim();
    const cleanSrc = srcName.replace(/\(.*?\)/g, "").trim();
    const query = `${cleanSrc} ${cleanLoc} ${cleanKeywords}`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await problemService.updateProblem(problem.id, {
        problem_statement: statement,
        workaround,
        quantified_impact: impact,
        notes,
        sources,
      });
      onProblemUpdated(res.problem);
      setIsEditing(false);
      toast.success("Problem statement and evidence successfully updated.", "Problem Updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update problem", "Update Error");
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

  const handleArchive = async () => {
    const reason = window.prompt("Enter the reason for archiving / rejecting this idea (e.g. 'Failed Mom Test validation / High Capex'):");
    if (!reason || !reason.trim()) return;

    try {
      const author = authService.getCurrentUser()?.name || "Team Member";
      const res = await problemService.archiveProblem(problem.id, reason.trim(), author);
      onProblemUpdated(res.problem);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to archive problem", "Archive Error");
    }
  };

  const handleRestore = async () => {
    try {
      const res = await problemService.restoreProblem(problem.id);
      onProblemUpdated(res.problem);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore problem", "Restore Error");
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await problemService.deleteProblem(problem.id);
      toast.success(`Problem ${problem.id} removed from Problem Bank.`, "Problem Deleted");
      onProblemDeleted(problem.id);
      setIsConfirmDeleteOpen(false);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete problem", "Delete Error");
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
    STRONGLY_DOCUMENTED: " Strongly Documented",
    DOCUMENTED: " Documented",
    SIGNAL: " Signal",
  };

  const breakdown = problem.score_breakdown;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Problem Dossier: ${sanitizeProblemId(problem.id)}`} maxWidth="4xl">
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

          {/* Evidence Sources & Live Verification */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Verified Evidence Sources ({isEditing ? sources.length : (problem.sources?.length || 0)})
                </h4>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsResearchModalOpen(true)}
                  className="font-mono text-xs font-bold text-cyan-300 hover:text-white bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-500/50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                  title="Search OpenAlex, Europe PMC, and Regional News for verified citations"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Research Academic & Web Sources</span>
                </button>
              )}
            </div>

            {/* View Mode Sources */}
            {!isEditing ? (
              (problem.sources && problem.sources.length > 0) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {problem.sources.map((src, i) => {
                    const searchUrl = getDeepSearchUrl(src.source_name, src.source_url);
                    const isDeepUrl = src.source_url && src.source_url.length > 25 && src.source_url.includes("/");

                    return (
                      <div
                        key={i}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-bold text-white truncate" title={src.source_name}>
                              {src.source_name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 shrink-0">
                              {src.source_tier?.toLowerCase().startsWith("tier") ? src.source_tier : `Tier ${src.source_tier || "B"}`}
                            </span>
                          </div>

                          {src.quote_or_summary && (
                            <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                              "{src.quote_or_summary}"
                            </p>
                          )}
                        </div>

                        {/* Citation Links Toolbar */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                          {src.source_url && (
                            <a
                              href={src.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-mono truncate hover:underline"
                              title={src.source_url}
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[120px]">{src.source_url.replace(/^https?:\/\//, "")}</span>
                            </a>
                          )}

                          <a
                            href={searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-[10px] font-mono font-bold text-slate-300 hover:text-cyan-300 bg-slate-950 hover:bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                            title="Open targeted Google search to find the exact published report or news article"
                          >
                            <Search className="w-3 h-3 text-cyan-400" />
                            <span>Verify Coverage</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No formal source citations attached.</p>
              )
            ) : (
              /* Edit Mode: Source Manager */
              <div className="space-y-3">
                {/* List of currently editable sources */}
                <div className="space-y-2">
                  {sources.map((src, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">{src.source_name}</span>
                          <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-cyan-400">
                            {src.source_tier?.toLowerCase().startsWith("tier") ? src.source_tier : `Tier ${src.source_tier || "B"}`}
                          </span>
                        </div>
                        {src.source_url && (
                          <p className="text-[11px] font-mono text-cyan-300 truncate">{src.source_url}</p>
                        )}
                        {src.quote_or_summary && (
                          <p className="text-[11px] text-slate-400 truncate italic">"{src.quote_or_summary}"</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSource(idx)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                        title="Remove Source"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Source Input Row */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 space-y-2.5">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                    <Plus className="w-3.5 h-3.5 text-cyan-400" /> Add Citation or Real Article Link:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Source Title (e.g. Panay News: Onion Spoilage Investigation)"
                      value={newSourceName}
                      onChange={(e) => setNewSourceName(e.target.value)}
                      className="sm:col-span-6 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="url"
                      placeholder="Exact Article URL (e.g. https://panaynews.net/article-123)"
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      className="sm:col-span-4 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                    />
                    <select
                      value={newSourceTier}
                      onChange={(e) => setNewSourceTier(e.target.value)}
                      className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-cyan-300 font-mono font-bold focus:outline-none"
                    >
                      <option value="A">Tier A (Gov/PSA)</option>
                      <option value="B">Tier B (News/Report)</option>
                      <option value="C">Tier C (Field/Forum)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Quote or Summary of findings from the source..."
                      value={newSourceSummary}
                      onChange={(e) => setNewSourceSummary(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSource}
                      disabled={!newSourceName.trim()}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold rounded-lg border border-cyan-500/40 text-xs transition-colors shrink-0 disabled:opacity-50"
                    >
                      + Add Citation
                    </button>
                  </div>
                </div>
              </div>
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
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsConfirmDeleteOpen(true)}
                isLoading={isDeleting}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>

              {problem.status === "archived" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRestore}
                  className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                >
                  Restore to Bank
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleArchive}
                  className="bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                >
                  Archive / Kill Idea
                </Button>
              )}
            </div>

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
      
      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={executeDelete}
        title={`Delete Problem ${problem.id}`}
        message="Are you sure you want to delete this problem and all its linked claims and evidence? This action cannot be undone."
        confirmText="Delete Problem"
        variant="danger"
        isLoading={isDeleting}
      />
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

      {/* Free Academic & Regional News Evidence Modal */}
      <ResearchEvidenceModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        problem={problem}
        onSourcesAttached={(updatedProb) => {
          onProblemUpdated(updatedProb);
          setSources(updatedProb.sources || []);
        }}
      />
    </>
  );
};
