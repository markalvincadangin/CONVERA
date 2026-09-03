"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { ProblemRecord, EvidenceTier, SessionState } from "@/lib/types";
import { problemService } from "@/services/problemService";
import { ALL_SECTORS } from "@/lib/constants";
import { ManualProblemModal } from "./ManualProblemModal";
import { ProblemDetailModal } from "./ProblemDetailModal";
import { DevilsAdvocateModal } from "./DevilsAdvocateModal";
import { BlindSpotModal } from "./BlindSpotModal";
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Download,
  Trash2,
  RefreshCw,
  FolderPlus,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  ThumbsUp,
  Radar,
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<ProblemRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBlindSpotModalOpen, setIsBlindSpotModalOpen] = useState(false);
  const [challengeTargetProblem, setChallengeTargetProblem] = useState<ProblemRecord | null>(null);
  const [isDevilsAdvocateOpen, setIsDevilsAdvocateOpen] = useState(false);

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

  // Client-side filtering
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (selectedSector !== "All" && p.sector !== selectedSector) return false;
      if (selectedTier !== "All" && p.evidence_tier !== selectedTier) return false;
      if (selectedStatus !== "All" && p.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inStmt = p.problem_statement.toLowerCase().includes(q);
        const inSuff = (p.sufferer_occupation || "").toLowerCase().includes(q);
        const inLoc = (p.sufferer_location || "").toLowerCase().includes(q);
        const inId = p.id.toLowerCase().includes(q);
        const inNotes = (p.notes || "").toLowerCase().includes(q);
        if (!inStmt && !inSuff && !inLoc && !inId && !inNotes) return false;
      }
      return true;
    });
  }, [problems, selectedSector, selectedTier, selectedStatus, searchQuery]);

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

  const handleProblemSaved = (newProblem: ProblemRecord) => {
    setProblems((prev) => [newProblem, ...prev.filter((p) => p.id !== newProblem.id)]);
  };

  const handleProblemUpdated = (updated: ProblemRecord) => {
    setProblems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProblem?.id === updated.id) {
      setSelectedProblem(updated);
    }
  };

  const handleProblemDeleted = (deletedId: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== deletedId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(deletedId);
      return next;
    });
  };

  const handleVote = async (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    try {
      const res = await problemService.voteProblem(problemId, "up");
      handleProblemUpdated(res.problem);
    } catch (err) {
      console.error("Voting error:", err);
    }
  };

  const handleOpenChallenge = (e: React.MouseEvent, problem: ProblemRecord) => {
    e.stopPropagation();
    setChallengeTargetProblem(problem);
    setIsDevilsAdvocateOpen(true);
  };

  const handleExportCSV = () => {
    if (filteredProblems.length === 0) return;
    const headers = [
      "ID",
      "Sector",
      "Sufferer",
      "Location",
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
      `"${p.id}"`,
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

  const tierBadge = (tier: EvidenceTier) => {
    if (tier === "STRONGLY_DOCUMENTED") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          🟢 Strongly Documented
        </span>
      );
    }
    if (tier === "DOCUMENTED") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          🔵 Documented
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
        🟡 Signal
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏦</span>
            <h2 className="text-lg font-bold text-white tracking-tight">Structured Problem Bank</h2>
            <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              {problems.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Single source of truth for your venture team. Ingest discoveries from Phase 1, enrich raw field observations with AI, and stress-test assumptions with the Devil's Advocate agent.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsBlindSpotModalOpen(true)}
            leftIcon={<Radar className="w-3.5 h-3.5 text-purple-400" />}
          >
            Blind Spot Radar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchProblems}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Problem
          </Button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem statements, locations, sufferers..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Sector Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
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
          <div className="sm:col-span-3">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="All">All Evidence Tiers</option>
              <option value="STRONGLY_DOCUMENTED">🟢 Strongly Documented</option>
              <option value="DOCUMENTED">🔵 Documented</option>
              <option value="SIGNAL">🟡 Signal</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-lg border transition-all ${
                viewMode === "cards"
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg border transition-all ${
                viewMode === "table"
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Bar when items are selected */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {selectedIds.size} of {filteredProblems.length} Selected
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline ml-2"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSendToPhase2(Array.from(selectedIds))}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="shadow-lg shadow-cyan-500/20"
              >
                Screen {selectedIds.size} Selected in Phase 2
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <Spinner size="lg" label="Loading Problem Bank records..." />
        </div>
      ) : error ? (
        <Card variant="glass" className="p-8 text-center space-y-3 border-red-500/30">
          <p className="text-sm font-bold text-red-400">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchProblems}>
            Retry
          </Button>
        </Card>
      ) : filteredProblems.length === 0 ? (
        <Card variant="glass" className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No Problems Found in Bank</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Run automated discovery in Phase 1 or use the "Add Problem" button above to log your team's field observations.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add First Problem
          </Button>
        </Card>
      ) : viewMode === "cards" ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProblems.map((p) => {
            const isSelected = selectedIds.has(p.id);
            const hasCritique = Boolean(p.devils_advocate_data);

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 relative cursor-pointer ${
                  isSelected
                    ? "bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
                onClick={() => {
                  setSelectedProblem(p);
                  setIsDetailModalOpen(true);
                }}
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(p.id)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {p.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Upvote Button */}
                      <button
                        onClick={(e) => handleVote(e, p.id)}
                        className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-700 text-[10px] font-mono font-bold text-slate-300 hover:text-white transition-colors"
                        title="Upvote problem"
                      >
                        <ThumbsUp className="w-2.5 h-2.5 text-cyan-400" />
                        <span>{p.votes || 0}</span>
                      </button>

                      {/* Evidence Score */}
                      <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {p.score || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-medium text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {p.sector}
                    </span>
                    {tierBadge(p.evidence_tier)}
                    {hasCritique && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> Challenged
                      </span>
                    )}
                  </div>

                  {/* Problem Statement */}
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                    {p.problem_statement}
                  </h4>

                  {/* Sufferer & Location */}
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    <strong className="text-slate-300">{p.sufferer_occupation}</strong> in {p.sufferer_location}
                  </p>
                </div>

                {/* Card Bottom: Sources, Workaround, and Devil's Advocate trigger */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px]">
                  {p.quantified_impact && (
                    <div className="text-emerald-400 font-medium truncate text-[11px]">
                      💰 {p.quantified_impact}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono">
                    <span>
                      {p.sources?.length || 0} {p.sources?.length === 1 ? "source" : "sources"}
                    </span>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenChallenge(e, p)}
                        className="text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20"
                        title="Devil's Advocate Challenge"
                      >
                        <Flame className="w-2.5 h-2.5" /> Stress Test
                      </button>

                      <span className="text-cyan-400 font-semibold hover:underline flex items-center gap-0.5">
                        Dossier <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProblems.length && filteredProblems.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4"
                    />
                  </th>
                  <th className="p-3">ID</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Target Sufferer & Location</th>
                  <th className="p-3">Problem Statement</th>
                  <th className="p-3">Evidence Tier</th>
                  <th className="p-3">Votes</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Sources</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProblems.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        isSelected ? "bg-cyan-500/5" : ""
                      }`}
                      onClick={() => {
                        setSelectedProblem(p);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-white whitespace-nowrap">{p.id}</td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">{p.sector}</td>
                      <td className="p-3 max-w-[180px]">
                        <div className="font-semibold text-white truncate">{p.sufferer_occupation}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.sufferer_location}</div>
                      </td>
                      <td className="p-3 max-w-[280px]">
                        <p className="line-clamp-2 text-white font-medium leading-snug">{p.problem_statement}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap">{tierBadge(p.evidence_tier)}</td>
                      <td className="p-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleVote(e, p.id)}
                          className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono text-[11px]"
                        >
                          <ThumbsUp className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{p.votes || 0}</span>
                        </button>
                      </td>
                      <td className="p-3 font-mono font-bold text-cyan-400">{p.score || 0}%</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {p.sources?.length || 0} cited
                      </td>
                      <td className="p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleOpenChallenge(e, p)}
                            className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-0.5"
                          >
                            <Flame className="w-3 h-3" /> Stress Test
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProblem(p);
                              setIsDetailModalOpen(true);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 font-bold text-xs"
                          >
                            View
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
      )}

      {/* Modals */}
      <ManualProblemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProblemSaved={handleProblemSaved}
        projectId={session?.project_id || undefined}
        sessionId={session?.session_id || undefined}
      />

      <ProblemDetailModal
        problem={selectedProblem}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onProblemUpdated={handleProblemUpdated}
        onProblemDeleted={handleProblemDeleted}
        onAdvanceToPhase2={(pid) => onSendToPhase2([pid])}
      />

      <BlindSpotModal
        isOpen={isBlindSpotModalOpen}
        onClose={() => setIsBlindSpotModalOpen(false)}
        projectId={session?.project_id || undefined}
        problemsCount={problems.length}
      />

      <DevilsAdvocateModal
        problem={challengeTargetProblem}
        isOpen={isDevilsAdvocateOpen}
        onClose={() => setIsDevilsAdvocateOpen(false)}
        onApplyReframing={(newStmt) => {
          if (challengeTargetProblem) {
            problemService.updateProblem(challengeTargetProblem.id, {
              problem_statement: newStmt,
            }).then((res) => {
              handleProblemUpdated(res.problem);
            });
          }
        }}
      />
    </div>
  );
};
