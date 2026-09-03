"use client";

import React, { useState } from "react";
import { ExternalLink, BookOpen, Search, Download, Sparkles, Filter } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGap, setSelectedGap] = useState<ResearchGapItem | null>(null);
  const [filterYear, setFilterYear] = useState<number | "ALL">("ALL");

  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.study_citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.key_findings.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.documented_limitations.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === "ALL" || r.year >= filterYear;
    return matchesSearch && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Scholarly Literature & Research Gap Matrix
            </h3>
            <span className="rounded-full bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              {rows.length} Studies Synthesized
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparative extraction across OpenAlex, Crossref, and EuropePMC to establish prior art and isolate novel gaps.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter studies or methods..."
              className="rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none w-64"
            />
          </div>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Years</option>
            <option value="2023">&ge; 2023 (Recent)</option>
            <option value="2020">&ge; 2020 (Last 5y)</option>
          </select>
        </div>
      </div>

      {/* Synthesized Research Gaps Highlights */}
      {gaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gaps.map((gap) => (
            <div
              key={gap.gap_id}
              className="rounded-xl border border-indigo-900/50 bg-gradient-to-br from-indigo-950/30 to-slate-900/60 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  {gap.gap_id}: {gap.title}
                </span>
                <span className="text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                  Isolated Gap
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{gap.description}</p>
              <div className="rounded-lg border border-indigo-900/40 bg-slate-950/60 p-2.5">
                <div className="text-[10px] uppercase font-bold text-indigo-400">Suggested Research Question (RQ)</div>
                <div className="text-xs font-semibold text-slate-100 italic mt-0.5">&ldquo;{gap.suggested_rq}&rdquo;</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-48">Study / Author</th>
                <th className="py-3 px-4 w-52">Problem Investigated</th>
                <th className="py-3 px-4 w-48">Method / Artifact</th>
                <th className="py-3 px-4">Key Findings</th>
                <th className="py-3 px-4">Limitations</th>
                <th className="py-3 px-4 w-52">Identified Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium align-top">
                    <div className="font-semibold text-white">{row.study_citation}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{row.title}</div>
                    {row.url && (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 mt-1.5 font-mono"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        DOI Link
                      </a>
                    )}
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-300 leading-relaxed">
                    {row.problem_investigated}
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <span className="inline-block rounded-md bg-slate-800/80 px-2 py-1 text-[11px] text-indigo-300 font-medium border border-slate-700/50">
                      {row.method_artifact}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-300 leading-relaxed">
                    {row.key_findings}
                  </td>
                  <td className="py-3.5 px-4 align-top text-rose-300/90 leading-relaxed font-normal">
                    {row.documented_limitations}
                  </td>
                  <td className="py-3.5 px-4 align-top text-amber-300/90 leading-relaxed font-medium">
                    {row.identified_gap}
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 italic">
                    {isLoading ? "Fetching literature and synthesizing matrix..." : "No research papers found for current filters."}
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
