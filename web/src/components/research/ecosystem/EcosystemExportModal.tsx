"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Share2,
  FileText,
  BookOpen,
  GitPullRequest,
  History,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Send,
  Database,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import {
  ecosystemService,
  EcosystemProvider,
  EcosystemSyncResult,
  EcosystemAuditRecord,
} from "@/services/ecosystemService";

interface EcosystemExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionName?: string;
}

type TabType = "notion" | "zotero" | "github" | "audit";

export const EcosystemExportModal: React.FC<EcosystemExportModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  sessionName,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("notion");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Notion state
  const [notionPageId, setNotionPageId] = useState("");
  const [notionIncludeLit, setNotionIncludeLit] = useState(true);
  const [notionDryRun, setNotionDryRun] = useState(true);
  const [notionResult, setNotionResult] = useState<EcosystemSyncResult | null>(null);

  // Notion Ingest state
  const [importSector, setImportSector] = useState("Field Logistics");
  const [importLimit, setImportLimit] = useState(5);
  const [importLoading, setImportLoading] = useState(false);

  // Zotero state
  const [zoteroFormat, setZoteroFormat] = useState<"bibtex" | "csl_json">("bibtex");
  const [zoteroCollection, setZoteroCollection] = useState("CONVERA Literature");
  const [zoteroResult, setZoteroResult] = useState<EcosystemSyncResult | null>(null);

  // GitHub state
  const [ghRepo, setGhRepo] = useState("markalvincadangin/CONVERA");
  const [ghMilestone, setGhMilestone] = useState("DSR Implementation Deliverables");
  const [ghDryRun, setGhDryRun] = useState(true);
  const [ghResult, setGhResult] = useState<EcosystemSyncResult | null>(null);

  // Audit state
  const [auditRecords, setAuditRecords] = useState<EcosystemAuditRecord[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load audit trail
  const loadAuditTrail = useCallback(async () => {
    if (!sessionId) return;
    setAuditLoading(true);
    try {
      const records = await ecosystemService.getAuditTrail(sessionId);
      setAuditRecords(records);
    } catch (err: any) {
      console.warn("Could not load audit trail:", err);
    } finally {
      setAuditLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isOpen && activeTab === "audit") {
      loadAuditTrail();
    }
  }, [isOpen, activeTab, loadAuditTrail]);

  // 1. Notion Export Handler
  const handleNotionExport = async (dryRunOverride?: boolean) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const isDry = dryRunOverride !== undefined ? dryRunOverride : notionDryRun;
      const res = await ecosystemService.exportNotion({
        session_id: sessionId,
        target_page_id: notionPageId.trim() || undefined,
        include_literature_matrix: notionIncludeLit,
        dry_run: isDry,
      });
      setNotionResult(res);
      if (res.status === "success") {
        toast.success("DSR proposal successfully published to Notion!");
      } else if (res.status === "dry_run") {
        toast.info("Offline preview compiled with SHA-256 verification hash.");
      } else {
        toast.error(res.error_message || "Notion export encountered an error.");
      }
      loadAuditTrail();
    } catch (err: any) {
      toast.error(err?.message || "Failed to communicate with Notion bridge.");
    } finally {
      setLoading(false);
    }
  };

  // 1b. Notion Import Handler
  const handleNotionImport = async () => {
    if (!sessionId) return;
    setImportLoading(true);
    try {
      const res = await ecosystemService.importNotion({
        session_id: sessionId,
        sector: importSector,
        limit: importLimit,
      });
      toast.success(
        `Ingested ${res.imported_count} notes from Notion into Problem Bank!`
      );
      loadAuditTrail();
    } catch (err: any) {
      toast.error(err?.message || "Failed to import notes from Notion.");
    } finally {
      setImportLoading(false);
    }
  };

  // 2. Zotero Export Handler
  const handleZoteroExport = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await ecosystemService.exportZotero({
        session_id: sessionId,
        collection_name: zoteroCollection,
        format: zoteroFormat,
        dry_run: true,
      });
      setZoteroResult(res);
      toast.success(
        `Compiled ${res.items_count} reference citations in ${zoteroFormat.toUpperCase()} format!`
      );
      loadAuditTrail();
    } catch (err: any) {
      toast.error(err?.message || "Failed to compile Zotero reference bundle.");
    } finally {
      setLoading(false);
    }
  };

  // 3. GitHub Export Handler
  const handleGitHubExport = async (dryRunOverride?: boolean) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const isDry = dryRunOverride !== undefined ? dryRunOverride : ghDryRun;
      const res = await ecosystemService.exportGitHub({
        session_id: sessionId,
        repository: ghRepo.trim() || undefined,
        milestone_title: ghMilestone.trim() || undefined,
        dry_run: isDry,
      });
      setGhResult(res);
      if (res.status === "success") {
        toast.success(`Published issue manifest to GitHub repository ${ghRepo}!`);
      } else {
        toast.info("GitHub issue manifest generated for sovereign review.");
      }
      loadAuditTrail();
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate GitHub issue manifest.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied content to clipboard");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">
                  Ecosystem Dissemination & Sync Bridge
                </h2>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-500/30">
                  SDD-023
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {sessionName ? `Session: ${sessionName} • ` : ""}
                Export proposals, scholarly citations, and issue manifests to external toolchains
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Close Modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-neutral-800 bg-neutral-900/30">
          <button
            onClick={() => setActiveTab("notion")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "notion"
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Notion Dissemination
          </button>
          <button
            onClick={() => setActiveTab("zotero")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "zotero"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Zotero Citations
          </button>
          <button
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "github"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            GitHub Issue Manifest
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "audit"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <History className="w-4 h-4" />
            Sync Audit Trail
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: NOTION */}
          {activeTab === "notion" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form & Actions */}
              <div className="lg:col-span-5 space-y-5">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Export Proposal Canvas
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Format Stage F DSR proposal canvas and synthesis into structured Notion child blocks.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                        Notion Target Page ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={notionPageId}
                        onChange={(e) => setNotionPageId(e.target.value)}
                        placeholder="e.g. 1a2b3c4d5e6f7a8b9c0d"
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notionIncludeLit}
                        onChange={(e) => setNotionIncludeLit(e.target.checked)}
                        className="rounded border-neutral-700 bg-neutral-800 text-indigo-500 focus:ring-0"
                      />
                      Include Literature & Evidence Foundations Matrix
                    </label>

                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notionDryRun}
                        onChange={(e) => setNotionDryRun(e.target.checked)}
                        className="rounded border-neutral-700 bg-neutral-800 text-indigo-500 focus:ring-0"
                      />
                      Dry-Run Simulation (Article VIII Offline Mode)
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleNotionExport()}
                      disabled={loading}
                      leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      {loading ? "Compiling..." : "Generate Preview"}
                    </Button>
                    {!notionDryRun && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleNotionExport(false)}
                        disabled={loading}
                        leftIcon={<Send className="w-3.5 h-3.5 text-indigo-400" />}
                      >
                        Push to Notion
                      </Button>
                    )}
                  </div>
                </div>

                {/* Notion Ingest Box */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Bi-Directional Note Ingest
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Harvest field observations from Notion workspace directly into CONVERA's relational Problem Bank.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                        Domain / Sector
                      </label>
                      <input
                        type="text"
                        value={importSector}
                        onChange={(e) => setImportSector(e.target.value)}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleNotionImport}
                    disabled={importLoading}
                    leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${importLoading ? "animate-spin" : ""}`} />}
                    className="border-emerald-500/30 hover:border-emerald-500/60"
                  >
                    {importLoading ? "Importing..." : "Ingest Notes into Problem Bank"}
                  </Button>
                </div>
              </div>

              {/* Right Column: Content Preview */}
              <div className="lg:col-span-7 flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden h-[540px]">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-300">
                      Notion Markdown Payload Preview
                    </span>
                    {notionResult && (
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-neutral-700">
                        SHA-256: {notionResult.state_hash.slice(0, 10)}...
                      </span>
                    )}
                  </div>
                  {notionResult && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(notionResult.preview_content)}
                        leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        className="h-7 text-xs"
                      >
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          ecosystemService.downloadPayload(
                            `convera-notion-dossier-${sessionId.slice(0, 8)}.md`,
                            notionResult.preview_content,
                            "text/markdown"
                          )
                        }
                        leftIcon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
                        className="h-7 text-xs"
                      >
                        Download
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-auto p-4 bg-neutral-950 font-mono text-xs text-neutral-300 whitespace-pre-wrap select-text">
                  {notionResult ? (
                    notionResult.preview_content
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-2">
                      <FileText className="w-8 h-8 opacity-40" />
                      <span>Click &quot;Generate Preview&quot; to compile the DSR dossier.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ZOTERO */}
          {activeTab === "zotero" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-5">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Reference Bundle Generation
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Export session literature foundations into BibTeX or CSL-JSON reference bundles ready for Zotero libraries.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                        Citation Format
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setZoteroFormat("bibtex")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            zoteroFormat === "bibtex"
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                              : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          BibTeX (.bib)
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoteroFormat("csl_json")}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            zoteroFormat === "csl_json"
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                              : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          CSL-JSON (.json)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                        Zotero Collection Name
                      </label>
                      <input
                        type="text"
                        value={zoteroCollection}
                        onChange={(e) => setZoteroCollection(e.target.value)}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleZoteroExport}
                    disabled={loading}
                    leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
                    className="bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    {loading ? "Compiling..." : "Compile Citation Bundle"}
                  </Button>
                </div>
              </div>

              {/* Right Column: Preview */}
              <div className="lg:col-span-7 flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden h-[540px]">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-300">
                      {zoteroFormat.toUpperCase()} Reference Bundle
                    </span>
                    {zoteroResult && (
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-neutral-700">
                        {zoteroResult.items_count} References
                      </span>
                    )}
                  </div>
                  {zoteroResult && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(zoteroResult.preview_content)}
                        leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        className="h-7 text-xs"
                      >
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          ecosystemService.downloadPayload(
                            `convera-citations-${sessionId.slice(0, 8)}.${zoteroFormat === "bibtex" ? "bib" : "json"}`,
                            zoteroResult.preview_content,
                            zoteroFormat === "bibtex" ? "application/x-bibtex" : "application/json"
                          )
                        }
                        leftIcon={<Download className="w-3.5 h-3.5 text-amber-400" />}
                        className="h-7 text-xs"
                      >
                        Download
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-auto p-4 bg-neutral-950 font-mono text-xs text-neutral-300 whitespace-pre-wrap select-text">
                  {zoteroResult ? (
                    zoteroResult.preview_content
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-2">
                      <BookOpen className="w-8 h-8 opacity-40" />
                      <span>Click &quot;Compile Citation Bundle&quot; to format scholarly sources.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB */}
          {activeTab === "github" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-5">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4" />
                    GitHub Issue Manifest
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Translates DSR architectural artifacts, evaluation criteria, and Gate 4 synthesis into an actionable GitHub Issue batch manifest.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                        GitHub Repository Target
                      </label>
                      <input
                        type="text"
                        value={ghRepo}
                        onChange={(e) => setGhRepo(e.target.value)}
                        placeholder="owner/repo"
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                        Milestone Title
                      </label>
                      <input
                        type="text"
                        value={ghMilestone}
                        onChange={(e) => setGhMilestone(e.target.value)}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ghDryRun}
                        onChange={(e) => setGhDryRun(e.target.checked)}
                        className="rounded border-neutral-700 bg-neutral-800 text-cyan-500 focus:ring-0"
                      />
                      Dry-Run Simulation (Preview before posting issues)
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleGitHubExport()}
                      disabled={loading}
                      leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                      {loading ? "Compiling..." : "Generate Manifest"}
                    </Button>
                    {!ghDryRun && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGitHubExport(false)}
                        disabled={loading}
                        leftIcon={<Send className="w-3.5 h-3.5 text-cyan-400" />}
                      >
                        Publish to GitHub
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Preview */}
              <div className="lg:col-span-7 flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden h-[540px]">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-300">
                      GitHub Issue Manifest Preview
                    </span>
                    {ghResult && (
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-neutral-700">
                        {ghResult.items_count} Issues
                      </span>
                    )}
                  </div>
                  {ghResult && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(ghResult.preview_content)}
                        leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        className="h-7 text-xs"
                      >
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          ecosystemService.downloadPayload(
                            `convera-github-issues-${sessionId.slice(0, 8)}.md`,
                            ghResult.preview_content,
                            "text/markdown"
                          )
                        }
                        leftIcon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
                        className="h-7 text-xs"
                      >
                        Download
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-auto p-4 bg-neutral-950 font-mono text-xs text-neutral-300 whitespace-pre-wrap select-text">
                  {ghResult ? (
                    ghResult.preview_content
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-2">
                      <GitPullRequest className="w-8 h-8 opacity-40" />
                      <span>Click &quot;Generate Manifest&quot; to format DSR issues.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Cryptographic Dissemination Audit Log (Table 38)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Chronological immutable sync events stamped with SHA-256 state hashes.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadAuditTrail}
                  disabled={auditLoading}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? "animate-spin" : ""}`} />}
                >
                  Refresh
                </Button>
              </div>

              {auditRecords.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-8 text-center text-neutral-500 text-xs">
                  No sync records logged for this research session yet.
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-neutral-800 bg-neutral-900/80 text-[11px] font-mono text-neutral-400 uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Provider</th>
                        <th className="px-4 py-2.5">Action</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Items</th>
                        <th className="px-4 py-2.5">SHA-256 State Hash</th>
                        <th className="px-4 py-2.5">Target</th>
                        <th className="px-4 py-2.5">Synced At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-neutral-300">
                      {auditRecords.map((r: EcosystemAuditRecord) => (
                        <tr key={r.id} className="hover:bg-neutral-800/30">
                          <td className="px-4 py-2.5 font-medium capitalize">
                            {r.provider}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-400">
                            {r.action_type}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase ${
                                r.status === "success"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : r.status === "dry_run"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">{r.items_count}</td>
                          <td className="px-4 py-2.5 font-mono text-[10px] text-neutral-400">
                            {r.state_hash.slice(0, 16)}...
                          </td>
                          <td className="px-4 py-2.5 text-neutral-400 truncate max-w-[150px]">
                            {r.target_identifier || "local"}
                          </td>
                          <td className="px-4 py-2.5 text-neutral-500 text-[11px]">
                            {new Date(r.synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-900/40 text-[11px] text-neutral-500">
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Article IV Human Sovereignty: preview payloads before live transmission</span>
          </div>
          <div className="text-[10px] font-mono text-neutral-500">
            CONVERA Dissemination Engine v3.0
          </div>
        </div>
      </div>
    </div>
  );
};
