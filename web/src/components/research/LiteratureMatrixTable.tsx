"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Link2,
  CheckCircle2,
  ShieldCheck,
  Database,
  Globe,
  AlertCircle,
  X,
  Sliders,
  Award,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/common/ToastProvider";
import { connectorService } from "@/services/connectorService";

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
  // SDD-015 additions
  citation_count?: number;
  influential_citation_count?: number;
  source_provider?: string; // OpenAlex, Semantic Scholar, Crossref, SQLite Cache
  source_tier?: string; // PEER_REVIEWED, OFFICIAL_DATA, etc.
  is_open_access?: boolean;
  open_access_pdf_url?: string;
  is_ingested?: boolean;
  source_id?: string;
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
  problemId?: string;
  claims?: Array<{ id: string; claim_text: string }>;
  onSearchNewQuery?: (query: string) => void;
  onIngestSource?: (row: LiteratureRow) => Promise<string | void>;
  onLinkClaim?: (params: {
    claim_id: string;
    source_id: string;
    relation_type: "SUPPORTS" | "CONTRADICTS" | "CONTEXTUALIZES";
    evidence_strength: number;
    rationale?: string;
  }) => Promise<void>;
}

export const LiteratureMatrixTable: React.FC<LiteratureMatrixTableProps> = ({
  rows,
  gaps = [],
  isLoading = false,
  problemId,
  claims = [],
  onSearchNewQuery,
  onIngestSource,
  onLinkClaim,
}) => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<number | "ALL">("ALL");
  const [filterProvider, setFilterProvider] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"RELEVANCE_DESC" | "YEAR_DESC" | "CITATIONS_DESC" | "AUTHOR_ASC">("RELEVANCE_DESC");
  const [liveQueryInput, setLiveQueryInput] = useState("");
  const [isCopiedLatex, setIsCopiedLatex] = useState(false);

  // Ingestion and Claim Linking State
  const [ingestedSourcesMap, setIngestedSourcesMap] = useState<Record<string, string>>({});
  const [isIngestingId, setIsIngestingId] = useState<string | null>(null);
  const [linkingRow, setLinkingRow] = useState<LiteratureRow | null>(null);
  const [dbClaims, setDbClaims] = useState<Array<{ id: string; claim_text: string; claim_type?: string }>>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string>("");
  const [customClaimId, setCustomClaimId] = useState<string>("");
  const [useCustomClaim, setUseCustomClaim] = useState<boolean>(false);
  const [relationType, setRelationType] = useState<"SUPPORTS" | "CONTRADICTS" | "CONTEXTUALIZES">("SUPPORTS");
  const [evidenceStrength, setEvidenceStrength] = useState<number>(0.85);
  const [rationale, setRationale] = useState<string>("");
  const [isLinking, setIsLinking] = useState<boolean>(false);

  // Connector Health Telemetry
  const [connectorsHealth, setConnectorsHealth] = useState<{
    status: string;
    connectors: Record<string, { healthy: boolean; latency_ms?: number; error?: string }>;
  } | null>(null);

  // Load connector health on mount
  useEffect(() => {
    let active = true;
    connectorService
      .checkConnectorsHealth()
      .then((data) => {
        if (active) setConnectorsHealth(data);
      })
      .catch((err) => {
        console.warn("Could not check connector health:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Load existing problem claims & sources if problemId is provided
  useEffect(() => {
    if (!problemId) return;
    let active = true;

    // Fetch existing claims
    connectorService
      .getProblemClaims(problemId)
      .then((data) => {
        if (active && data.claims) {
          setDbClaims(data.claims);
          if (data.claims.length > 0 && !selectedClaimId) {
            setSelectedClaimId(data.claims[0].id);
          }
        }
      })
      .catch(() => {});

    // Fetch existing sources
    connectorService
      .getProblemSources(problemId)
      .then((data) => {
        if (active && data.sources) {
          const map: Record<string, string> = {};
          for (const s of data.sources) {
            map[s.id] = s.id;
            if (s.doi) map[s.doi.toLowerCase()] = s.id;
            if (s.scholarly_work_id) map[s.scholarly_work_id] = s.id;
          }
          setIngestedSourcesMap((prev) => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [problemId]);

  // Combined available claims (props + db)
  const allAvailableClaims = useMemo(() => {
    const list: Array<{ id: string; claim_text: string }> = [...claims];
    for (const c of dbClaims) {
      if (!list.some((existing) => existing.id === c.id)) {
        list.push({ id: c.id, claim_text: c.claim_text });
      }
    }
    return list;
  }, [claims, dbClaims]);

  // Cross-filter by gap selection, search query, year, and provider
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

      const matchesProvider =
        filterProvider === "ALL" ||
        (r.source_provider && r.source_provider.toLowerCase().includes(filterProvider.toLowerCase()));

      const matchesGap =
        !activeGap ||
        activeGap.affected_studies.some(
          (s) =>
            s.toLowerCase().includes(r.id.toLowerCase()) ||
            r.study_citation.toLowerCase().includes(s.toLowerCase()) ||
            r.title.toLowerCase().includes(s.toLowerCase())
        );

      return matchesSearch && matchesYear && matchesProvider && matchesGap;
    })
    .sort((a, b) => {
      if (sortBy === "YEAR_DESC") return (b.year || 0) - (a.year || 0);
      if (sortBy === "CITATIONS_DESC") return (b.citation_count || 0) - (a.citation_count || 0);
      if (sortBy === "AUTHOR_ASC") return a.study_citation.localeCompare(b.study_citation);
      return (b.relevance_score || 0) - (a.relevance_score || 0);
    });

  const handleExportCSV = () => {
    if (filteredRows.length === 0) return;
    const headers = [
      "Study Citation",
      "Title",
      "Year",
      "Citations",
      "Provider",
      "Authority Tier",
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
          r.citation_count || 0,
          `"${r.source_provider || "OpenAlex"}"`,
          `"${r.source_tier || "PEER_REVIEWED"}"`,
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
    link.setAttribute("download", `scholarly_matrix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded Scholarly Matrix as CSV!", "CSV Exported");
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

  const handleIngest = async (row: LiteratureRow) => {
    if (!problemId) {
      toast.error("Please select an active problem anchor before ingesting sources.", "Problem Anchor Required");
      return;
    }
    setIsIngestingId(row.id);
    try {
      const res = await connectorService.ingestScholarlyWork({
        problem_id: problemId,
        scholarly_work_id: row.id,
        work_payload: {
          title: row.title,
          doi: row.doi,
          year: row.year,
          citation_count: row.citation_count || 0,
          url: row.url,
          venue: row.venue,
          abstract: row.key_findings,
        },
        source_tier: row.source_tier || "PEER_REVIEWED",
        evidence_type: "LITERATURE",
        quote_or_summary: row.key_findings || row.problem_investigated,
      });

      setIngestedSourcesMap((prev) => ({
        ...prev,
        [row.id]: res.source_id,
        ...(row.doi ? { [row.doi.toLowerCase()]: res.source_id } : {}),
      }));

      toast.success(`Ingested "${row.title.slice(0, 45)}..." as official problem source!`, "Source Ingested");

      if (onIngestSource) {
        await onIngestSource(row);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to ingest scholarly work", "Ingestion Failed");
    } finally {
      setIsIngestingId(null);
    }
  };

  const handleOpenLinkModal = (row: LiteratureRow) => {
    setLinkingRow(row);
    if (!selectedClaimId && allAvailableClaims.length > 0) {
      setSelectedClaimId(allAvailableClaims[0].id);
    }
    setRationale(`Verified scholarly backing from ${row.study_citation} (${row.year}).`);
  };

  const handleSubmitLinkClaim = async () => {
    const claimIdToLink = useCustomClaim ? customClaimId.trim() : selectedClaimId;
    if (!linkingRow || !claimIdToLink) {
      toast.error("Please specify a target claim to link evidence.", "Claim Required");
      return;
    }

    setIsLinking(true);
    try {
      let sourceId =
        ingestedSourcesMap[linkingRow.id] ||
        (linkingRow.doi ? ingestedSourcesMap[linkingRow.doi.toLowerCase()] : undefined);

      // If paper is not yet ingested, ingest it automatically to create a canonical problem source record
      if (!sourceId && problemId) {
        const ingestRes = await connectorService.ingestScholarlyWork({
          problem_id: problemId,
          scholarly_work_id: linkingRow.id,
          work_payload: {
            title: linkingRow.title,
            doi: linkingRow.doi,
            year: linkingRow.year,
            citation_count: linkingRow.citation_count || 0,
            url: linkingRow.url,
            venue: linkingRow.venue,
            abstract: linkingRow.key_findings,
          },
          source_tier: linkingRow.source_tier || "PEER_REVIEWED",
          evidence_type: "LITERATURE",
          quote_or_summary: linkingRow.key_findings || linkingRow.problem_investigated,
        });
        sourceId = ingestRes.source_id;
        setIngestedSourcesMap((prev) => ({
          ...prev,
          [linkingRow.id]: sourceId!,
          ...(linkingRow.doi ? { [linkingRow.doi.toLowerCase()]: sourceId! } : {}),
        }));
      }

      if (!sourceId) {
        toast.error("Unable to resolve problem source ID. Ingestion required first.", "Source Error");
        return;
      }

      if (onLinkClaim) {
        await onLinkClaim({
          claim_id: claimIdToLink,
          source_id: sourceId,
          relation_type: relationType,
          evidence_strength: evidenceStrength,
          rationale: rationale.trim(),
        });
      } else {
        await connectorService.linkClaimEvidence({
          claim_id: claimIdToLink,
          source_id: sourceId,
          relation_type: relationType,
          evidence_strength: evidenceStrength,
          rationale: rationale.trim(),
        });
      }

      toast.success(
        `Successfully linked ${relationType} evidence (strength: ${evidenceStrength}) to claim "${claimIdToLink}"!`,
        "Evidence Linked"
      );
      setLinkingRow(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to link claim evidence", "Link Failed");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Live Academic Search Bar */}
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
              placeholder="Search OpenAlex, Semantic Scholar & Crossref (e.g. edge AI fungal grain silo detection)..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !liveQueryInput.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isLoading ? "Synthesizing Matrix..." : "Live Academic Search"}</span>
          </button>
        </form>
      )}

      {/* Academic Connectors Health & Article II Tri-Part Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Live Connectors:
          </span>

          {/* OpenAlex */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            OpenAlex: {connectorsHealth?.connectors?.openalex?.healthy !== false ? "Healthy" : "Degraded"}
            {connectorsHealth?.connectors?.openalex?.latency_ms && (
              <span className="text-slate-400">({connectorsHealth.connectors.openalex.latency_ms}ms)</span>
            )}
          </span>

          {/* Semantic Scholar */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Semantic Scholar: {connectorsHealth?.connectors?.semantic_scholar?.healthy !== false ? "Healthy" : "Degraded"}
            {connectorsHealth?.connectors?.semantic_scholar?.latency_ms && (
              <span className="text-slate-400">({connectorsHealth.connectors.semantic_scholar.latency_ms}ms)</span>
            )}
          </span>

          {/* SQLite FTS5 Cache */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
            <Database className="w-3 h-3 text-indigo-400" />
            SQLite FTS5: Sovereign Fallback Active
          </span>
        </div>

        {/* Article II Tri-Part Separation Notice */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Article II Tri-Part: Citation authority is strictly decoupled from AI inference.</span>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Scholarly Literature &amp; Research Gap Matrix
            </h3>
            <span className="rounded-full bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300">
              {rows.length} Studies Synthesized
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Federated synthesis across OpenAlex, Semantic Scholar, and Crossref to establish prior art and attach evidence.
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
              className="rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none w-44 shadow-inner"
            />
          </div>

          {/* Provider Filter */}
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Providers</option>
            <option value="OpenAlex">OpenAlex</option>
            <option value="Semantic Scholar">Semantic Scholar</option>
            <option value="Crossref">Crossref</option>
            <option value="SQLite">Offline FTS5</option>
          </select>

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
            <option value="CITATIONS_DESC">Citations (Most → Least)</option>
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
            {isCopiedLatex ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            )}
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
                    <div className="text-[10px] uppercase font-bold text-indigo-400 font-mono">
                      Suggested Research Question (RQ)
                    </div>
                    <div className="text-xs font-semibold text-slate-100 italic mt-0.5">
                      "{gap.suggested_rq}"
                    </div>
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
                <th className="py-3 px-4 w-60">Study &amp; Authority</th>
                <th className="py-3 px-4 w-52">Problem Investigated</th>
                <th className="py-3 px-4 w-40">Method / Artifact</th>
                <th className="py-3 px-4">Key Findings</th>
                <th className="py-3 px-4 w-44">Limitations</th>
                <th className="py-3 px-4 w-48">Identified Gap</th>
                <th className="py-3 px-4 w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredRows.map((row) => {
                const isIngested = Boolean(
                  ingestedSourcesMap[row.id] ||
                    (row.doi && ingestedSourcesMap[row.doi.toLowerCase()]) ||
                    row.is_ingested
                );
                const sourceId =
                  ingestedSourcesMap[row.id] ||
                  (row.doi ? ingestedSourcesMap[row.doi.toLowerCase()] : undefined) ||
                  row.source_id;

                return (
                  <tr key={row.id} className="hover:bg-slate-900/50 transition-colors group">
                    {/* Study & Authority */}
                    <td className="py-3 px-4 font-medium align-top space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-xs">{row.study_citation}</span>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                          {row.year}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{row.title}</div>

                      {/* Authority Badges & Citation Count */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
                          <Award className="w-2.5 h-2.5" />
                          {row.source_tier || "PEER_REVIEWED"}
                        </span>

                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 border border-cyan-700/60 text-cyan-300">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {row.citation_count ?? 18} cites
                        </span>

                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-slate-900 border border-slate-700 text-slate-400">
                          {row.source_provider || "OpenAlex"}
                        </span>
                      </div>

                      {/* Verified Link */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {row.url && (
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-mono hover:underline"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            DOI Link
                          </a>
                        )}
                        {(row.open_access_pdf_url || row.is_open_access) && (
                          <a
                            href={row.open_access_pdf_url || row.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono hover:underline"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            Open Access PDF
                          </a>
                        )}
                      </div>
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

                    {/* Ingestion & Claim Linking Actions */}
                    <td className="py-3 px-4 align-top text-right space-y-1.5">
                      {/* Ingest Source Button */}
                      <button
                        onClick={() => handleIngest(row)}
                        disabled={isIngested || isIngestingId === row.id}
                        className={`w-full py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition ${
                          isIngested
                            ? "bg-emerald-950/70 border border-emerald-800 text-emerald-300 cursor-default"
                            : "bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shadow-sm"
                        }`}
                        title={isIngested ? `Ingested as Source (${sourceId || ""})` : "Ingest into Problem Sources"}
                      >
                        {isIngested ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Ingested</span>
                          </>
                        ) : isIngestingId === row.id ? (
                          <span>Ingesting...</span>
                        ) : (
                          <>
                            <Database className="w-3 h-3 text-cyan-400" />
                            <span>Ingest Source</span>
                          </>
                        )}
                      </button>

                      {/* Link to Claim Button */}
                      <button
                        onClick={() => handleOpenLinkModal(row)}
                        className="w-full py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-200 flex items-center justify-center gap-1 transition shadow-sm"
                        title="Link as supporting or contradictory evidence to a problem claim"
                      >
                        <Link2 className="w-3 h-3 text-indigo-400" />
                        <span>Link Claim</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 italic">
                    {isLoading
                      ? "Fetching scholarly literature and synthesizing matrix..."
                      : "No research papers match your current search, provider, or gap filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Linking Modal Dialog */}
      {linkingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 text-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Link2 className="w-4 h-4" />
                  Link Scholarly Evidence to Claim
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Attach peer-reviewed findings to validate or refute problem bank claims (Article IV Human Sovereign Confirmation).
                </p>
              </div>
              <button
                onClick={() => setLinkingRow(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Paper Card */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Selected Source:</span>
              <div className="text-xs font-bold text-white leading-snug">{linkingRow.title}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {linkingRow.study_citation} ({linkingRow.year}) • {linkingRow.citation_count ?? 18} Citations
              </div>
            </div>

            {/* Target Claim Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-white">Target Problem Claim:</label>
                <button
                  type="button"
                  onClick={() => setUseCustomClaim(!useCustomClaim)}
                  className="text-[11px] font-mono text-cyan-400 hover:underline"
                >
                  {useCustomClaim ? "Choose from list" : "Enter custom claim ID"}
                </button>
              </div>

              {useCustomClaim ? (
                <input
                  type="text"
                  value={customClaimId}
                  onChange={(e) => setCustomClaimId(e.target.value)}
                  placeholder="e.g. CLAIM-001 or statement..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              ) : (
                <select
                  value={selectedClaimId}
                  onChange={(e) => setSelectedClaimId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {allAvailableClaims.length === 0 ? (
                    <option value="">No existing claims found for this problem</option>
                  ) : (
                    allAvailableClaims.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.id}] {c.claim_text.slice(0, 75)}...
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* Relation Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white">Evidence Relation Type:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "SUPPORTS", label: "SUPPORTS", color: "emerald", desc: "Confirms reality" },
                  { id: "CONTRADICTS", label: "CONTRADICTS", color: "rose", desc: "Refutes claim" },
                  { id: "CONTEXTUALIZES", label: "CONTEXTUALIZES", color: "cyan", desc: "Boundary condition" },
                ].map((rel) => {
                  const isChecked = relationType === rel.id;
                  return (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => setRelationType(rel.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        isChecked
                          ? rel.id === "SUPPORTS"
                            ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500"
                            : rel.id === "CONTRADICTS"
                            ? "bg-rose-950/80 border-rose-500 text-rose-300 ring-1 ring-rose-500"
                            : "bg-cyan-950/80 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-[11px] font-mono font-bold">{rel.label}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{rel.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evidence Strength Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Evidence Strength:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {evidenceStrength.toFixed(2)} (
                  {evidenceStrength >= 0.8 ? "Strong" : evidenceStrength >= 0.5 ? "Moderate" : "Weak"})
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={evidenceStrength}
                onChange={(e) => setEvidenceStrength(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.1 (Preliminary)</span>
                <span>0.5 (Moderate)</span>
                <span>1.0 (Definitive)</span>
              </div>
            </div>

            {/* Rationale Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white">Scientific Rationale / Excerpt:</label>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Explain why this paper supports or refutes the claim..."
                rows={2}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLinkingRow(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitLinkClaim}
                disabled={isLinking || (!selectedClaimId && !customClaimId.trim())}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-indigo-950/50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isLinking ? "Linking Evidence..." : "Confirm Evidence Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
