"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  BookOpen,
  Search,
  Download,
  Sparkles,
  Filter,
  ArrowUpDown,
  FileCode,
  Check,
  RotateCcw,
  Layers,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/common/ToastProvider";

export interface LiteratureRow {
  id: string;
  study_citation: string;
  title: string;
  year: number;
  doi?: string;
  url?: string;
  venue?: string;
  problem_investigated: string;
  method_artifact: string;
  key_findings: string;
  documented_limitations: string;
  identified_gap: string;
  relevance_score: number;
}

export interface ResearchGapItem {
  gap_id: string;
  title: string;
  description: string;
  affected_studies: string[];
  suggested_rq: string;
}

interface LiteratureMatrixTableProps {
  rows: LiteratureRow[];
  gaps?: ResearchGapItem[];
  isLoading?: boolean;
  onSearchNewQuery?: (query: string) => void;
}

export const LiteratureMatrixTable: React.FC<LiteratureMatrixTableProps> = ({
  rows,
  gaps = [],
  isLoading = false,
  onSearchNewQuery,
}) => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<number | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"YEAR_DESC" | "RELEVANCE_DESC" | "AUTHOR_ASC">("RELEVANCE_DESC");
  const [liveQueryInput, setLiveQueryInput] = useState("");
  const [isCopiedLatex, setIsCopiedLatex] = useState(false);

  // Cross-filter by gap selection, search query, and year
  const activeGap = gaps.find((g) => g.gap_id === selectedGapId);

  const filteredRows = rows
    .filter((r) => {
      const matchesSearch =
        searchTerm === "" ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.study_citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.key_findings.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.documented_limitations.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.method_artifact.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesYear = filterYear === "ALL" || r.year >= filterYear;

      const matchesGap =
        !activeGap ||
        activeGap.affected_studies.some(
          (s) =>
            s.toLowerCase().includes(r.id.toLowerCase()) ||
            r.study_citation.toLowerCase().includes(s.toLowerCase()) ||
            r.title.toLowerCase().includes(s.toLowerCase())
        );

      return matchesSearch && matchesYear && matchesGap;
    })
    .sort((a, b) => {
      if (sortBy === "YEAR_DESC") return (b.year || 0) - (a.year || 0);
      if (sortBy === "AUTHOR_ASC") return a.study_citation.localeCompare(b.study_citation);
      return (b.relevance_score || 0) - (a.relevance_score || 0);
    });

  const handleExportCSV = () => {
    if (filteredRows.length === 0) return;
    const headers = [
      "Study Citation",
      "Title",
      "Year",
      "DOI URL",
      "Problem Investigated",
      "Method / Artifact",
      "Key Findings",
      "Documented Limitations",
      "Identified Gap",
      "Relevance Score",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredRows.map((r) =>
        [
          `"${r.study_citation.replace(/"/g, '""')}"`,
          `"${r.title.replace(/"/g, '""')}"`,
          r.year || "",
          `"${r.url || r.doi || ""}"`,
          `"${r.problem_investigated.replace(/"/g, '""')}"`,
          `"${r.method_artifact.replace(/"/g, '""')}"`,
          `"${r.key_findings.replace(/"/g, '""')}"`,
          `"${r.documented_limitations.replace(/"/g, '""')}"`,
          `"${r.identified_gap.replace(/"/g, '""')}"`,
          r.relevance_score || 0,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `literature_matrix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded Literature Matrix as CSV!", "CSV Exported");
  };

  const handleCopyLatex = () => {
    if (filteredRows.length === 0) return;
    const latexTable = `\\begin{table*}[t]
\\centering
\\caption{Scholarly Literature Matrix and Research Gap Synthesis}
\\label{tab:lit_matrix}
\\small
\\begin{tabular}{p{3.5cm} p{3cm} p{4.5cm} p{4.5cm}}
\\hline
\\textbf{Study / Citation} & \\textbf{Method / Artifact} & \\textbf{Key Findings} & \\textbf{Identified Gap} \\\\
\\hline
${filteredRows
  .map(
    (r) =>
      `${r.study_citation.replace(/&/g, "\\&")} & ${r.method_artifact.replace(/&/g, "\\&")} & ${r.key_findings.slice(0, 120).replace(/&/g, "\\&")}... & ${r.identified_gap.slice(0, 120).replace(/&/g, "\\&")}... \\\\`
  )
  .join("\n")}
\\hline
\\end{tabular}
\\end{table*}`;

    navigator.clipboard.writeText(latexTable);
    setIsCopiedLatex(true);
    toast.success("Copied LaTeX Table format to clipboard! Ready for Overleaf.", "LaTeX Copied");
    setTimeout(() => setIsCopiedLatex(false), 3000);
  };

  const handleRunNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveQueryInput.trim() || !onSearchNewQuery) return;
    onSearchNewQuery(liveQueryInput.trim());
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Live Search & Generation Bar */}
      {onSearchNewQuery && (
        <form
          onSubmit={handleRunNewSearch}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <div className="flex items-center gap-2 flex-1 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={liveQueryInput}
              onChange={(e) => setLiveQueryInput(e.target.value)}
              placeholder="Search OpenAlex & EuropePMC (e.g. edge AI computer vision pest detection)..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !liveQueryInput.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isLoading ? "Synthesizing Matrix..." : "Generate Matrix"}</span>
          </button>
        </form>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Scholarly Literature & Research Gap Matrix
            </h3>
            <span className="rounded-full bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300">
              {rows.length} Studies Synthesized
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative extraction across OpenAlex, Crossref, and EuropePMC to establish prior art and isolate novel gaps.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Filter */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter papers, findings..."
              className="rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none w-48 shadow-inner"
            />
          </div>

          {/* Year Filter */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Years</option>
            <option value="2024">≥ 2024 (Latest)</option>
            <option value="2022">≥ 2022 (Last 3y)</option>
            <option value="2020">≥ 2020 (Last 5y)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-cyan-300 font-mono font-semibold focus:border-emerald-500 focus:outline-none"
          >
            <option value="RELEVANCE_DESC">Relevance (High → Low)</option>
            <option value="YEAR_DESC">Year (Newest First)</option>
            <option value="AUTHOR_ASC">Author (A → Z)</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition"
            title="Export Literature Matrix as CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono text-[11px]">CSV</span>
          </button>

          {/* Copy LaTeX */}
          <button
            onClick={handleCopyLatex}
            className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition"
            title="Copy LaTeX Table for Overleaf"
          >
            {isCopiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden sm:inline font-mono text-[11px]">LaTeX</span>
          </button>
        </div>
      </div>

      {/* Synthesized Research Gaps Highlights (Interactive Filter Cards) */}
      {gaps.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Synthesized Research Gaps (Click card to filter matrix):
            </span>
            {selectedGapId && (
              <button
                onClick={() => setSelectedGapId(null)}
                className="text-[10px] font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Clear Gap Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gaps.map((gap) => {
              const isSelected = selectedGapId === gap.gap_id;
              return (
                <div
                  key={gap.gap_id}
                  onClick={() => setSelectedGapId(isSelected ? null : gap.gap_id)}
                  className={`cursor-pointer transition-all duration-200 rounded-xl p-3.5 space-y-2.5 border ${
                    isSelected
                      ? "bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-950/50"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {gap.gap_id}: {gap.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? "bg-indigo-500 text-white border-indigo-400"
                          : "bg-indigo-950 text-indigo-300 border-indigo-800"
                      }`}
                    >
                      {isSelected ? "● Active Filter" : "Filter Matrix"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{gap.description}</p>
                  <div className="rounded-lg border border-indigo-900/40 bg-slate-950/80 p-2">
                    <div className="text-[10px] uppercase font-bold text-indigo-400 font-mono">Suggested Research Question (RQ)</div>
                    <div className="text-xs font-semibold text-slate-100 italic mt-0.5">"{gap.suggested_rq}"</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Literature Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-52">Study / Author</th>
                <th className="py-3 px-4 w-52">Problem Investigated</th>
                <th className="py-3 px-4 w-44">Method / Artifact</th>
                <th className="py-3 px-4">Key Findings</th>
                <th className="py-3 px-4">Limitations</th>
                <th className="py-3 px-4 w-52">Identified Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/50 transition-colors group">
                  {/* Study / Author */}
                  <td className="py-3 px-4 font-medium align-top space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white text-xs">{row.study_citation}</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                        {row.year}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{row.title}</div>
                    {row.url && (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-mono mt-1 hover:underline"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        DOI Verified
                      </a>
                    )}
                  </td>

                  {/* Problem Investigated */}
                  <td className="py-3 px-4 align-top text-slate-300 leading-relaxed">
                    {row.problem_investigated}
                  </td>

                  {/* Method / Artifact */}
                  <td className="py-3 px-4 align-top">
                    <span className="inline-block rounded-md bg-slate-900 px-2 py-1 text-[11px] text-indigo-300 font-mono font-medium border border-slate-800">
                      {row.method_artifact}
                    </span>
                  </td>

                  {/* Key Findings */}
                  <td className="py-3 px-4 align-top text-slate-300 leading-relaxed">
                    {row.key_findings}
                  </td>

                  {/* Documented Limitations */}
                  <td className="py-3 px-4 align-top text-rose-300/90 leading-relaxed font-normal">
                    {row.documented_limitations}
                  </td>

                  {/* Identified Gap */}
                  <td className="py-3 px-4 align-top text-amber-300/90 leading-relaxed font-medium">
                    {row.identified_gap}
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 italic">
                    {isLoading ? "Fetching literature and synthesizing matrix..." : "No research papers match your current search or gap filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
