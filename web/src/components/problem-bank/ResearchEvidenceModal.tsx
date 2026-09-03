"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { ProblemRecord } from "@/lib/types";
import { problemService } from "@/services/problemService";
import {
  BookOpen,
  Globe,
  ShieldCheck,
  FileText,
  ExternalLink,
  Sparkles,
  Search,
  Check,
  CheckCircle2,
  Plus,
  RefreshCw,
  Award,
  Layers,
} from "lucide-react";

interface ResearchEvidenceModalProps {
  problem: ProblemRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSourcesAttached: (updatedProblem: ProblemRecord) => void;
}

export const ResearchEvidenceModal: React.FC<ResearchEvidenceModalProps> = ({
  problem,
  isOpen,
  onClose,
  onSourcesAttached,
}) => {
  const toast = useToast();
  const [activeEngine, setActiveEngine] = useState<"ALL" | "OPENALEX" | "EUROPE_PMC" | "REGIONAL_NEWS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedSources, setSelectedSources] = useState<Record<number, boolean>>({});
  const [isAttaching, setIsAttaching] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-fetch on open
  useEffect(() => {
    if (isOpen && problem) {
      const defaultQ = `${problem.sector} ${problem.sufferer_occupation} ${problem.problem_statement.slice(0, 40)}`;
      setSearchQuery(defaultQ);
      handleAutoResearch();
      setSelectedSources({});
      setSuccessMessage(null);
    }
  }, [isOpen, problem?.id]);

  if (!problem) return null;

  const handleAutoResearch = async () => {
    setIsLoading(true);
    setSuccessMessage(null);
    try {
      const res = await problemService.autoResearchProblem(problem.id);
      const combined = res.results?.all_combined || [];
      setResults(combined);
      // Auto-select first 2 strongest results
      const initialSelected: Record<number, boolean> = {};
      combined.slice(0, 2).forEach((_: any, idx: number) => {
        initialSelected[idx] = true;
      });
      setSelectedSources(initialSelected);
    } catch (err: any) {
      console.error("Auto research error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setSuccessMessage(null);
    try {
      const res = await problemService.queryResearch(searchQuery.trim(), activeEngine, 8);
      const items = res.results || res.all_combined || [];
      setResults(items);
      setSelectedSources({});
    } catch (err: any) {
      console.error("Search query error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSourceSelect = (idx: number) => {
    setSelectedSources((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleAttach = async () => {
    const toAttach = results.filter((_, idx) => selectedSources[idx]);
    if (toAttach.length === 0) return;

    setIsAttaching(true);
    try {
      const res = await problemService.attachSources(problem.id, toAttach);
      setSuccessMessage(`Successfully attached ${res.added_count} verified citation(s) to ${problem.id}!`);
      onSourcesAttached(res.problem);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      toast.error(err?.message || "Failed to attach citations", "Attachment Error");
    } finally {
      setIsAttaching(false);
    }
  };

  const filteredResults = results.filter((r) => {
    if (activeEngine === "ALL") return true;
    return r.engine === activeEngine;
  });

  const selectedCount = Object.values(selectedSources).filter(Boolean).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Empirical Academic & Web Evidence Explorer" maxWidth="2xl">
      <div className="space-y-4 font-sans">
        {/* Problem Header Context */}
        <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
              {problem.id}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-sm">
              {problem.sufferer_occupation} in {problem.sufferer_location || "Iloilo"}
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 italic">
            "{problem.problem_statement}"
          </p>
        </div>

        {/* Engine Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono font-semibold">
          {[
            { id: "ALL", label: "All Sources", icon: Layers },
            { id: "OPENALEX", label: "OpenAlex (DOI)", icon: BookOpen },
            { id: "EUROPE_PMC", label: "Europe PMC", icon: ShieldCheck },
            { id: "REGIONAL_NEWS", label: "Regional News", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeEngine === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveEngine(tab.id as any)}
                className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 truncate ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Auto-Fetch Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleManualSearch();
              }}
              placeholder="Search OpenAlex, PubMed, or Panay News..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualSearch}
            isLoading={isLoading}
            leftIcon={<Search className="w-3.5 h-3.5" />}
          >
            Search
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAutoResearch}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            title="Auto-fetch literature & regional news matching problem keywords"
          >
            Auto-Match
          </Button>
        </div>

        {/* Success Feedback Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Search Results List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-14 text-center space-y-3">
              <Spinner size="md" label="Searching OpenAlex (250M+ works), Europe PMC, and Regional News archives..." />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <p>No empirical citations found for this query.</p>
              <button
                onClick={handleAutoResearch}
                className="text-cyan-400 hover:underline font-mono text-[11px]"
              >
                Click here to auto-match keywords
              </button>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = Boolean(selectedSources[idx]);
              const isOpenAlex = item.engine === "OPENALEX";
              const isEPMC = item.engine === "EUROPE_PMC";

              return (
                <div
                  key={idx}
                  onClick={() => toggleSourceSelect(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 select-none ${
                    isSelected
                      ? "bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                      : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Selection Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "bg-cyan-500 border-cyan-400 text-slate-950"
                            : "border-slate-700 bg-slate-900"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                              isOpenAlex
                                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                : isEPMC
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            }`}
                          >
                            {isOpenAlex ? "OpenAlex (Tier A)" : isEPMC ? "Europe PMC (Tier A)" : "Regional News (Tier B)"}
                          </span>

                          {item.year && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {item.year}
                            </span>
                          )}

                          {item.oa_pdf_url && (
                            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              Open-Access PDF
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white leading-snug">
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono truncate">
                          <span>{item.authors || "Researchers"}</span>
                          <span>•</span>
                          <span className="text-slate-300 truncate">{item.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Outlink */}
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors shrink-0"
                        title="Open publication / DOI link in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {item.quote_or_summary && (
                    <p className="text-[11px] text-slate-300 line-clamp-2 pl-7 italic border-l border-slate-800/80">
                      "{item.quote_or_summary}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400">
            Selected: <strong className="text-white">{selectedCount}</strong> citations
          </span>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleAttach}
              disabled={selectedCount === 0 || isAttaching}
              isLoading={isAttaching}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Attach to Problem ({selectedCount})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
