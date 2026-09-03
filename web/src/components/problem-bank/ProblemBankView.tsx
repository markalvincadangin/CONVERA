"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { ProblemRecord, EvidenceTier, SessionState } from "@/lib/types";
import { problemService } from "@/services/problemService";
import { ALL_SECTORS } from "@/lib/constants";
import { sanitizeText, sanitizeProblemId } from "@/lib/sanitize";
import { ManualProblemModal } from "./ManualProblemModal";
import { ProblemDetailModal } from "./ProblemDetailModal";
import { DevilsAdvocateModal } from "./DevilsAdvocateModal";
import { BlindSpotModal } from "./BlindSpotModal";
import { RawBrainstormIngestModal } from "./RawBrainstormIngestModal";
import { ResearchEvidenceModal } from "./ResearchEvidenceModal";
import { ResearchInboxDrawer } from "@/components/common/ResearchInboxDrawer";
import { ImpactAlertBanner } from "./ImpactAlertBanner";
import { Inbox } from "lucide-react";
import { Archive, RotateCcw } from "lucide-react";
import {
  Search,
  Plus,
  Flame,
  Radar,
  Download,
  ShieldCheck,
  Radio,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  LayoutGrid,
  List,
  ThumbsUp,
  ArrowRight,
  MapPin,
  User,
  Activity,
  FileText,
  Trash2,
  Merge,
  Wand2,
  Check,
  BookOpen,
  Compass,
} from "lucide-react";

interface ProblemBankViewProps {
  session: SessionState | null;
  onSendToPhase2: (selectedIds: string[]) => void;
}

export const ProblemBankView: React.FC<ProblemBankViewProps> = ({
  session,
  onSendToPhase2,
}) => {
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters, Search & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [sortBy, setSortBy] = useState<"SCORE_DESC" | "VOTES_DESC" | "TIER_DESC" | "ID_ASC" | "SECTOR_ASC">("SCORE_DESC");
  const [quickFilter, setQuickFilter] = useState<"ALL" | "CHALLENGED" | "STRONG" | "VOTED" | "ARCHIVED">("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const frameworkId = session?.framework_id?.toUpperCase() || "INNOVATION";
  const isResearch = frameworkId.includes("RESEARCH") || frameworkId.includes("CRCDP");
  const isCapstone = frameworkId.includes("CAPSTONE");
  const isProduct = frameworkId.includes("PRODUCT");

  const terminology = {
    bankTitle: isResearch
      ? "Research Problem & Intake Bank"
      : isCapstone
      ? "Capstone Problem & Intake Bank"
      : isProduct
      ? "Product Discovery & Pain Point Bank"
      : "Venture Problem & Friction Bank",
    bankDesc: isResearch
      ? "Central repository of empirical breakdowns, domain bottlenecks, and candidate computing research opportunities grounded in indexed academic literature."
      : isCapstone
      ? "Repository of verified domain operational breakdowns mapped to software and system engineering specifications."
      : isProduct
      ? "Central backlog of user friction, workflow breakdowns, and customer pain points prioritized for sprint discovery."
      : "Single source of truth for your venture team. Ingest discoveries from Phase 1, enrich raw field observations with AI, and stress-test assumptions with the Devil's Advocate agent.",
    suffererLabel: isResearch ? "Affected Domain / System" : isProduct ? "Target User / Role" : "Target Sufferer",
    workaroundLabel: isResearch ? "Prior Art Baseline" : isProduct ? "Current Workflow" : "Workaround Inefficiency",
  };

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const toast = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<ProblemRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBlindSpotModalOpen, setIsBlindSpotModalOpen] = useState(false);
  const [challengeTargetProblem, setChallengeTargetProblem] = useState<ProblemRecord | null>(null);
  const [isDevilsAdvocateOpen, setIsDevilsAdvocateOpen] = useState(false);
  const [isResearchEvidenceOpen, setIsResearchEvidenceOpen] = useState(false);
  const [isRawIngestOpen, setIsRawIngestOpen] = useState(false);
  const [isInboxDrawerOpen, setIsInboxDrawerOpen] = useState(false);

  const fetchProblems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await problemService.listProblems({
        project_id: session?.project_id || undefined,
      });
      setProblems(data);
    } catch (err: any) {
      console.error("Error loading problems:", err);
      setError(err.message || "Failed to load Problem Bank.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [session?.project_id]);

  // Client-side filtering & sorting
  const filteredProblems = useMemo(() => {
    return problems
      .filter((p) => {
        if (selectedSector !== "All" && p.sector !== selectedSector) return false;
        if (selectedTier !== "All" && p.evidence_tier !== selectedTier) return false;
        
        // Quick Filters & Archive Status
        if (quickFilter === "ARCHIVED") {
          if (p.status !== "archived") return false;
        } else {
          if (p.status === "archived") return false;
          if (quickFilter === "CHALLENGED" && !p.devils_advocate_data) return false;
          if (quickFilter === "STRONG" && p.evidence_tier !== "STRONGLY_DOCUMENTED") return false;
          if (quickFilter === "VOTED" && (!p.votes || p.votes <= 0)) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inStmt = (p.problem_statement || "").toLowerCase().includes(q);
          const inSuff = (p.sufferer_occupation || "").toLowerCase().includes(q);
          const inLoc = (p.sufferer_location || "").toLowerCase().includes(q);
          const inId = p.id.toLowerCase().includes(q);
          const inNotes = (p.notes || "").toLowerCase().includes(q);
          if (!inStmt && !inSuff && !inLoc && !inId && !inNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "SCORE_DESC") return (b.score || 0) - (a.score || 0);
        if (sortBy === "VOTES_DESC") return (b.votes || 0) - (a.votes || 0);
        if (sortBy === "ID_ASC") return a.id.localeCompare(b.id);
        if (sortBy === "SECTOR_ASC") return a.sector.localeCompare(b.sector);
        if (sortBy === "TIER_DESC") {
          const tierRank = (t: string) => (t === "STRONGLY_DOCUMENTED" ? 3 : t === "DOCUMENTED" ? 2 : 1);
          return tierRank(b.evidence_tier) - tierRank(a.evidence_tier);
        }
        return 0;
      });
  }, [problems, selectedSector, selectedTier, quickFilter, sortBy, searchQuery]);

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProblems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProblems.map((p) => p.id)));
    }
  };

  // 1-Click Standardize & Canonicalize IDs
  const executeReindex = async () => {
    setIsProcessingBatch(true);
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    try {
      const res = await problemService.reindexIds(session?.project_id || undefined);
      setProblems(res.problems);
      setSelectedIds(new Set());
      toast.success(`Standardized ${res.count} problem IDs into sequential format!`, "Reindex Complete");
    } catch (err: any) {
      toast.error(err?.message || "Reindexing failed", "Reindex Error");
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleReindexIds = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Standardize Problem IDs",
      message: "Reindex and clean all problem IDs into standard sequential sector format (e.g. AGR-001, HLT-001)?",
      confirmText: "Standardize IDs",
      variant: "info",
      onConfirm: executeReindex,
    });
  };

  // Bulk Delete
  const executeBulkDelete = async () => {
    const count = selectedIds.size;
    setIsProcessingBatch(true);
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    try {
      await problemService.bulkDelete(Array.from(selectedIds));
      setProblems((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      toast.success(`Permanently deleted ${count} problem records.`, "Bulk Delete Complete");
    } catch (err: any) {
      toast.error(err?.message || "Bulk delete failed", "Delete Error");
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    setConfirmDialog({
      isOpen: true,
      title: "Bulk Delete Problems",
      message: `Are you sure you want to permanently delete ${count} selected problem records? This cannot be undone.`,
      confirmText: `Delete ${count} Problems`,
      variant: "danger",
      onConfirm: executeBulkDelete,
    });
  };

  // Merge Selected Duplicates
  const executeMerge = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length < 2) return;
    const primaryId = ids[0];
    const duplicates = ids.slice(1);

    setIsProcessingBatch(true);
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    try {
      await problemService.mergeProblems(primaryId, duplicates);
      await fetchProblems();
      setSelectedIds(new Set([primaryId]));
      toast.success(`Merged ${duplicates.length} duplicate problems into ${primaryId}.`, "Merge Complete");
    } catch (err: any) {
      toast.error(err?.message || "Merge failed", "Merge Error");
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleMergeSelected = () => {
    const ids = Array.from(selectedIds);
    if (ids.length < 2) return;
    const primaryId = ids[0];
    const duplicates = ids.slice(1);

    setConfirmDialog({
      isOpen: true,
      title: "Merge Duplicates",
      message: `Merge ${duplicates.join(", ")} into primary problem ${primaryId}? This combines citations and upvotes.`,
      confirmText: "Merge Problems",
      variant: "info",
      onConfirm: executeMerge,
    });
  };

  const handleRestore = async (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    try {
      const res = await problemService.restoreProblem(problemId);
      setProblems((prev) => prev.map((p) => (p.id === problemId ? res.problem : p)));
      toast.success(`Restored ${problemId} back to active Problem Bank!`, "Problem Restored");
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore problem", "Restore Error");
    }
  };

  const handleVote = async (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    try {
      const res = await problemService.voteProblem(problemId, "up");
      setProblems((prev) =>
        prev.map((p) => (p.id === problemId ? res.problem : p))
      );
    } catch (err: any) {
      console.error("Vote failed:", err);
    }
  };

  const handleExportCSV = () => {
    if (filteredProblems.length === 0) return;
    const headers = [
      "Problem ID",
      "Sector",
      "Sufferer Occupation",
      "Sufferer Location",
      "Problem Statement",
      "Evidence Tier",
      "Score",
      "Votes",
      "Workaround",
      "Quantified Impact",
      "Status",
      "Sources Count",
    ];
    const rows = filteredProblems.map((p) => [
      `"${sanitizeProblemId(p.id)}"`,
      `"${p.sector}"`,
      `"${p.sufferer_occupation}"`,
      `"${p.sufferer_location}"`,
      `"${p.problem_statement.replace(/"/g, '""')}"`,
      `"${p.evidence_tier}"`,
      p.score || 0,
      p.votes || 0,
      `"${(p.workaround || "").replace(/"/g, '""')}"`,
      `"${(p.quantified_impact || "").replace(/"/g, '""')}"`,
      `"${p.status || "discovered"}"`,
      p.sources?.length || 0,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ProblemBank_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTierBadge = (tier: EvidenceTier) => {
    if (tier === "STRONGLY_DOCUMENTED") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span>Strongly Documented</span>
        </span>
      );
    }
    if (tier === "DOCUMENTED") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 whitespace-nowrap shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
          <span>Documented</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap shadow-sm">
        <Radio className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span>Signal</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Reactive Epistemic Invalidation & Impact Alerts */}
      <ImpactAlertBanner
        sessionId={session?.session_id}
        onRefreshNeeded={fetchProblems}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-tight">{terminology.bankTitle}</h2>
            <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              {problems.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {terminology.bankDesc}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto justify-center text-xs"
            onClick={() => setIsBlindSpotModalOpen(true)}
            leftIcon={<Radar className="w-3.5 h-3.5 text-purple-400" />}
          >
            Blind Spot
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto justify-center text-xs"
            onClick={fetchProblems}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto justify-center text-xs"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto justify-center text-xs bg-slate-900 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            onClick={() => setIsRawIngestOpen(true)}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Ingest AI / GC Notes
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto justify-center text-xs"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Problem
          </Button>
        </div>
      </div>

      {/* Feedback Alert if Action Performed */}
      {feedbackMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search statements, locations, sufferers..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 shadow-inner"
            />
          </div>

          {/* Sector Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 shadow-inner"
            >
              <option value="All">All Sectors ({problems.length})</option>
              {ALL_SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Evidence Tier Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 shadow-inner"
            >
              <option value="All">All Evidence Tiers</option>
              <option value="STRONGLY_DOCUMENTED">Strongly Documented</option>
              <option value="DOCUMENTED">Documented</option>
              <option value="SIGNAL">Signal</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-semibold focus:outline-none focus:border-cyan-500/50 shadow-inner"
            >
              <option value="SCORE_DESC">Score (High → Low)</option>
              <option value="VOTES_DESC">Votes (Most Upvoted)</option>
              <option value="TIER_DESC">Evidence Tier</option>
              <option value="ID_ASC">ID (AGR → UTL)</option>
              <option value="SECTOR_ASC">Sector (A → Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-1 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-xl border transition-all ${
                viewMode === "cards"
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-sm"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-xl border transition-all ${
                viewMode === "table"
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-sm"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 mr-1">Quick Filter:</span>
          <button
            onClick={() => setQuickFilter("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              quickFilter === "ALL"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All ({problems.length})
          </button>
          <button
            onClick={() => setQuickFilter("STRONG")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
              quickFilter === "STRONG"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Strongly Documented</span>
          </button>
          <button
            onClick={() => setQuickFilter("VOTED")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
              quickFilter === "VOTED"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <ThumbsUp className="w-3 h-3 text-cyan-400" />
            <span>Team Upvoted</span>
          </button>
          <button
            onClick={() => setQuickFilter("CHALLENGED")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
              quickFilter === "CHALLENGED"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>Challenged (Devil's Advocate)</span>
          </button>
        </div>

        {/* Action Bar when items are selected */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300 font-mono">
                {selectedIds.size} of {filteredProblems.length} Selected
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline ml-2"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.size >= 2 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMergeSelected}
                  isLoading={isProcessingBatch}
                  leftIcon={<Merge className="w-3.5 h-3.5 text-purple-400" />}
                >
                  Merge {selectedIds.size} Selected
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={handleBulkDelete}
                isLoading={isProcessingBatch}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
              >
                Delete Selected
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onSendToPhase2(Array.from(selectedIds))}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Screen {selectedIds.size} in Phase 2
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Table or Cards */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-mono">Loading problem bank records...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-2">
          <p className="text-sm font-bold text-red-400">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchProblems}>
            Try Again
          </Button>
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-8">
          <p className="text-sm text-slate-400">No problems found matching your filters.</p>
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            + Add New Problem
          </Button>
        </div>
      ) : viewMode === "table" ? (
        /* ========================================================= */
        /* Table View (Polished 100% Heuristic Grid)                 */
        /* ========================================================= */
        <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProblems.length && filteredProblems.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 whitespace-nowrap">ID</th>
                  <th className="p-3.5 whitespace-nowrap">Sector</th>
                  <th className="p-3.5 min-w-[200px]">Target Sufferer & Location</th>
                  <th className="p-3.5 min-w-[280px]">Problem Statement</th>
                  <th className="p-3.5 whitespace-nowrap">Evidence Tier</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Votes</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Score</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Sources</th>
                  <th className="p-3.5 text-right whitespace-nowrap pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProblems.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  const cleanId = sanitizeProblemId(p.id);
                  return (
                    <tr
                      key={cleanId}
                      className={`hover:bg-slate-850/60 cursor-pointer transition-colors group ${
                        isSelected ? "bg-cyan-500/10" : ""
                      }`}
                      onClick={() => {
                        setSelectedProblem(p);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 group-hover:border-cyan-500/40 text-cyan-300">
                          {cleanId}
                        </span>
                      </td>

                      {/* Sector */}
                      <td className="p-3.5 text-slate-300 font-medium whitespace-nowrap">
                        {p.sector}
                      </td>

                      {/* Sufferer */}
                      <td className="p-3.5 min-w-[200px] max-w-[240px]">
                        <div className="font-semibold text-slate-100 truncate">
                          {sanitizeText(p.sufferer_occupation)}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {sanitizeText(p.sufferer_location)}
                        </div>
                      </td>

                      {/* Statement */}
                      <td className="p-3.5 min-w-[280px] max-w-sm">
                        <p className="line-clamp-2 text-slate-200 font-normal leading-snug">
                          {sanitizeText(p.problem_statement)}
                        </p>
                      </td>

                      {/* Evidence Tier */}
                      <td className="p-3.5 whitespace-nowrap">
                        {renderTierBadge(p.evidence_tier)}
                      </td>

                      {/* Votes */}
                      <td className="p-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleVote(e, p.id)}
                          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-cyan-500/40 font-mono text-[11px] transition-all"
                        >
                          <ThumbsUp className="w-3 h-3 text-cyan-400" />
                          <span className="font-bold">{p.votes || 0}</span>
                        </button>
                      </td>

                      {/* Score */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {p.score || 0}%
                        </span>
                      </td>

                      {/* Sources */}
                      <td className="p-3.5 text-center text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {p.sources?.length || 0} cited
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setChallengeTargetProblem(p);
                              setIsDevilsAdvocateOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1"
                            title="Run Devil's Advocate Adversarial Challenge"
                          >
                            <Flame className="w-3 h-3 text-rose-400" />
                            <span>Stress Test</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProblem(p);
                              setIsDetailModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all flex items-center gap-1"
                          >
                            <span>Dossier</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* Card View (Polished Ash Maurya Spatial Grid)              */
        /* ========================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProblems.map((p) => {
            const isSelected = selectedIds.has(p.id);
            const cleanId = sanitizeProblemId(p.id);
            return (
              <div
                key={cleanId}
                onClick={() => {
                  setSelectedProblem(p);
                  setIsDetailModalOpen(true);
                }}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group ${
                  isSelected
                    ? "bg-slate-900/90 border-cyan-500/50 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 shadow-md"
                }`}
              >
                {/* Card Top: Checkbox, ID & Score */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(p.id)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 group-hover:border-cyan-500/40 text-cyan-300">
                      {cleanId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleVote(e, p.id)}
                      className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 px-2 py-0.5 rounded-md border border-slate-800 font-mono text-[11px] transition-all"
                      title="Upvote problem priority"
                    >
                      <ThumbsUp className="w-3 h-3 text-cyan-400" />
                      <span>{p.votes || 0}</span>
                    </button>

                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {p.score || 0}%
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="space-y-3 flex-1">
                  {/* Badges: Sector & Evidence Tier */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                      {p.sector}
                    </span>
                    {renderTierBadge(p.evidence_tier)}
                    {p.devils_advocate_data && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30 flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" /> Challenged
                      </span>
                    )}
                  </div>

                  {/* Problem Statement */}
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-3 leading-snug">
                    {sanitizeText(p.problem_statement)}
                  </h3>

                  {/* Target Sufferer */}
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-200 font-medium truncate">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{sanitizeText(p.sufferer_occupation)}</span>
                    </div>
                    {p.sufferer_location && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{sanitizeText(p.sufferer_location)}</span>
                      </div>
                    )}
                  </div>

                  {/* Quantified Impact / Consequence */}
                  {p.quantified_impact && (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 text-xs text-emerald-400 font-mono">
                      <p className="line-clamp-2">{sanitizeText(p.quantified_impact)}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer: Sources & Actions */}
                <div className="pt-3 border-t border-slate-850 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span className="font-mono">
                    {p.sources?.length ? `${p.sources.length} sources` : "1 source"}
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {isResearch ? (
                      <button
                        onClick={() => {
                          setChallengeTargetProblem(p);
                          setIsResearchEvidenceOpen(true);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold hover:underline"
                        title="Ground problem with Peer-Reviewed Literature & DOI evidence"
                      >
                        <BookOpen className="w-3 h-3 text-emerald-400" /> Lit Evidence
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setChallengeTargetProblem(p);
                          setIsDevilsAdvocateOpen(true);
                        }}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold hover:underline"
                        title="Run Devil's Advocate Stress Test"
                      >
                        <Flame className="w-3 h-3 text-rose-400" /> Stress Test
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedProblem(p);
                        setIsDetailModalOpen(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold hover:underline"
                    >
                      <span>Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ManualProblemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProblemSaved={(newProb) => {
          setProblems((prev) => [newProb, ...prev]);
        }}
        projectId={session?.project_id || undefined}
        sessionId={session?.session_id || undefined}
      />

      <ProblemDetailModal
        problem={selectedProblem}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onProblemUpdated={(updated) => {
          setProblems((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }}
        onProblemDeleted={(deletedId) => {
          setProblems((prev) => prev.filter((p) => p.id !== deletedId));
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(deletedId);
            return next;
          });
        }}
        onAdvanceToPhase2={(id) => onSendToPhase2([id])}
      />

      <BlindSpotModal
        isOpen={isBlindSpotModalOpen}
        onClose={() => setIsBlindSpotModalOpen(false)}
        projectId={session?.project_id || undefined}
        problemsCount={problems.length}
      />

      <DevilsAdvocateModal
        isOpen={isDevilsAdvocateOpen}
        onClose={() => setIsDevilsAdvocateOpen(false)}
        problem={challengeTargetProblem}
        onApplyReframing={() => {
          fetchProblems();
        }}
      />
    
      {/* Global Action Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        isLoading={isProcessingBatch}
      />
    </div>
  );
};
