"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { useToast } from "@/components/common/ToastProvider";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Button } from "@/components/common/Button";
import { ProblemCommentsSection } from "./ProblemCommentsSection";
import { authService } from "@/services/authService";
import { ProblemRecord, SessionState } from "@/lib/types";
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
  session?: SessionState | null;
  onClose: () => void;
  onProblemUpdated: (problem: ProblemRecord) => void;
  onProblemDeleted: (problemId: string) => void;
  onAdvanceToPhase2?: (problemId: string) => void;
  onAdvanceToStage?: (stageNumber: number, problemId: string) => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  problem,
  isOpen,
  onClose,
  onProblemUpdated,
  onProblemDeleted,
  onAdvanceToPhase2,
}) => {
  const toast = useToast();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraphData | null>(null);
  const [isGeneratingKG, setIsGeneratingKG] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statement, setStatement] = useState(problem?.problem_statement || "");
  const [workaround, setWorkaround] = useState(problem?.workaround || "");
  const [impact, setImpact] = useState(problem?.quantified_impact || "");
  const [notes, setNotes] = useState(problem?.notes || "");
  const [sources, setSources] = useState<any[]>(problem?.sources || []);
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

  useEffect(() => {
    if (problem) {
      setStatement(problem.problem_statement || "");
      setWorkaround(problem.workaround || "");
      setImpact(problem.quantified_impact || "");
      setNotes(problem.notes || "");
      setSources(problem.sources || []);
    }
  }, [problem]);

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

  if (!problem) return null;

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

  const tierColors: Record<string, string> = {
    STRONGLY_DOCUMENTED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    DOCUMENTED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    SIGNAL: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  };

  const tierLabels: Record<string, string> = {
    STRONGLY_DOCUMENTED: "Strongly Documented",
    DOCUMENTED: "Documented",
    SIGNAL: "Field Signal",
  };

  const formatTierBadge = (tier?: string) => {
    if (!tier) return "Tier B";
    const clean = tier.trim();
    return clean.toLowerCase().startsWith("tier") ? clean : `Tier ${clean}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-3 pb-5 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-cyan-400 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                {problem.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                {problem.sector}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${
                  tierColors[problem.evidence_tier] || tierColors.SIGNAL
                }`}
              >
                {tierLabels[problem.evidence_tier] || problem.evidence_tier}
              </span>
            </div>

            {/* Score & Vote Badge */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleVote}
                disabled={isVoting}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="Upvote problem relevance"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>{problem.votes || 0} Upvotes</span>
              </button>

              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer group"
                title="Click to see how this score is calculated"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                <span>Score: {problem.score || 0}/100</span>
                {showBreakdown ? (
                  <ChevronUp className="w-3 h-3 ml-0.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-0.5 text-slate-400" />
                )}
              </button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDevilsAdvocateOpen(true)}
                leftIcon={<Flame className="w-3.5 h-3.5 text-rose-400" />}
                className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
              >
                Devil&apos;s Advocate
              </Button>
            </div>
          </div>

          {/* Interactive Score Breakdown Panel */}
          {showBreakdown && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4" /> Multi-Factor Score Breakdown
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Calculated dynamically from 4 core dimensions
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Evidence Tier</span>
                    <span className="font-bold text-emerald-400">
                      {problem.evidence_tier === "STRONGLY_DOCUMENTED" ? "35/35" : problem.evidence_tier === "DOCUMENTED" ? "25/35" : "15/35"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${problem.evidence_tier === "STRONGLY_DOCUMENTED" ? 100 : problem.evidence_tier === "DOCUMENTED" ? 71 : 43}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Weight: 35%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Friction Severity</span>
                    <span className="font-bold text-cyan-400">
                      {problem.quantified_impact ? "25/25" : "15/25"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${problem.quantified_impact ? 100 : 60}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Weight: 25%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Workaround Inefficiency</span>
                    <span className="font-bold text-amber-400">
                      {problem.workaround ? "20/20" : "10/20"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${problem.workaround ? 100 : 50}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Weight: 20%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Citations Count</span>
                    <span className="font-bold text-indigo-400">
                      {Math.min(20, (problem.sources?.length || 0) * 10)}/20
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (problem.sources?.length || 0) * 50)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Weight: 20%</span>
                </div>
              </div>
            </div>
          )}

          {/* Sufferer Profile Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400">Target Sufferer: </span>
                <span className="font-bold text-slate-200">{problem.sufferer_occupation || "Unspecified"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400">Location: </span>
                <span className="font-bold text-slate-200">{problem.sufferer_location || "Regional Focus"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Problem Narrative */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Core Problem Statement
              </label>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            ) : (
              <p className="text-sm text-slate-200 leading-relaxed p-3.5 bg-slate-900/40 rounded-xl border border-slate-800/60">
                {problem.problem_statement}
              </p>
            )}
          </div>

          {/* Workaround & Quantified Impact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Existing Coping Mechanism / Workaround
              </label>
              {isEditing ? (
                <textarea
                  value={workaround}
                  onChange={(e) => setWorkaround(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300 min-h-[60px]">
                  {problem.workaround || <span className="text-slate-500 italic">No workaround documented</span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Quantified Economic & Time Impact
              </label>
              {isEditing ? (
                <textarea
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300 min-h-[60px]">
                  {problem.quantified_impact || <span className="text-slate-500 italic">No quantified impact documented</span>}
                </div>
              )}
            </div>
          </div>

          {/* Evidence Sources & Citations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Grounding Citations &amp; Evidence ({sources.length})
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsResearchModalOpen(true)}
                  leftIcon={<Search className="w-3 h-3 text-cyan-400" />}
                  className="text-xs"
                >
                  Research Academic &amp; Web Sources
                </Button>
              </div>
            </div>

            {sources.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sources.map((src: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-200 truncate">{src.source_name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 shrink-0">
                          {formatTierBadge(src.source_tier)}
                        </span>
                      </div>
                      {src.quote_or_summary && (
                        <p className="text-slate-400 text-[11px] line-clamp-2 italic">
                          &ldquo;{src.quote_or_summary}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={src.source_url || getDeepSearchUrl(src.source_name, src.source_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Open Source Evidence"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSource(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No citations attached yet. Click &ldquo;Research Academic &amp; Web Sources&rdquo; to fetch real-world papers.
              </div>
            )}

            {/* Quick Add Source Form in Edit Mode */}
            {isEditing && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 block">+ Add Custom Citation</span>
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                  <input
                    type="text"
                    placeholder="Source Name / Title"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className="sm:col-span-4 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <select
                    value={newSourceTier}
                    onChange={(e) => setNewSourceTier(e.target.value)}
                    className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono font-bold"
                  >
                    <option value="A">Tier A (Gov/PSA)</option>
                    <option value="B">Tier B (News/Report)</option>
                    <option value="C">Tier C (Field/Forum)</option>
                  </select>
                </div>
                <input
                  type="url"
                  placeholder="URL (optional)"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                />
                <div className="flex justify-end pt-1">
                  <Button size="sm" variant="secondary" onClick={handleAddSource} disabled={!newSourceName.trim()}>
                    Add Citation
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 4-Claim Validation Evidence Ledger */}
          <div className="pt-2">
            <EvidenceLedgerCard
              problemId={problem.id}
              claims={knowledgeGraph?.claims || []}
              onClaimsUpdated={(newClaims) => {
                if (knowledgeGraph) {
                  setKnowledgeGraph({ ...knowledgeGraph, claims: newClaims });
                }
              }}
              onGenerateRequested={handleGenerateKG}
              isGenerating={isGeneratingKG}
            />
          </div>

          {/* Assumption Radar & Risk Calibration */}
          <div className="pt-2">
            <AssumptionRadarCard
              problemId={problem.id}
              assumptions={knowledgeGraph?.assumptions || []}
              onAssumptionsUpdated={(newAssumptions) => {
                if (knowledgeGraph) {
                  setKnowledgeGraph({ ...knowledgeGraph, assumptions: newAssumptions });
                }
              }}
              onGenerateRequested={handleGenerateKG}
              isGenerating={isGeneratingKG}
            />
          </div>

          {/* Internal Notes & Comments */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Field Investigation Notes &amp; Observations
            </label>
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300 min-h-[50px]">
                {problem.notes || <span className="text-slate-500 italic">No notes added</span>}
              </div>
            )}
          </div>

          {/* Realtime Comments Section */}
          <div className="pt-2">
            <ProblemCommentsSection problemId={problem.id} currentUser={authService.getCurrentUser()} />
          </div>
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
              className="text-xs"
            >
              Delete
            </Button>

            {problem.status === "archived" ? (
              <Button variant="secondary" size="sm" onClick={handleRestore} className="text-xs">
                Restore Problem
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleArchive} className="text-xs text-slate-400 hover:text-amber-400">
                Reject / Archive
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onAdvanceToPhase2 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onAdvanceToPhase2(problem.id);
                  onClose();
                }}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/40"
              >
                Send to Phase 2 Screening
              </Button>
            )}

            {isEditing && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Save Changes
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Devil's Advocate Modal */}
      <DevilsAdvocateModal
        isOpen={isDevilsAdvocateOpen}
        onClose={() => setIsDevilsAdvocateOpen(false)}
        problem={problem}
        onApplyReframing={(reframed) => {
          setStatement(reframed);
          handleSave();
          setIsDevilsAdvocateOpen(false);
        }}
      />

      {/* Research Evidence Modal */}
      <ResearchEvidenceModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        problem={problem}
        onSourcesAttached={(updated) => {
          setSources(updated.sources || []);
          onProblemUpdated(updated);
        }}
      />

      {/* Confirmation Dialog */}
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
  );
};
