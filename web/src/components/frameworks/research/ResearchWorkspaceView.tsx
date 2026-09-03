"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Sparkles,
  Layers,
  FlaskConical,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  FileText,
  Plus,
  Cpu,
  FolderOpen,
  MapPin,
  Lightbulb,
  Radio,
  Zap,
  Activity,
  ShieldAlert
} from "lucide-react";
import { LiteratureMatrixTable, LiteratureRow, ResearchGapItem } from "@/components/research/LiteratureMatrixTable";
import { UnknownsMap } from "@/components/knowledge/UnknownsMap";
import { TraceabilityDrawer } from "@/components/knowledge/TraceabilityDrawer";
import { GateReviewModal } from "@/components/frameworks/research/GateReviewModal";
import { CircumscriptionLoopView } from "@/components/frameworks/research/CircumscriptionLoopView";
import { IntelligenceScorecardDrawer } from "@/components/knowledge/IntelligenceScorecardDrawer";
import { researchService } from "@/services/researchService";
import { SessionState, ProblemRecord } from "@/lib/types";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import { MASTER_RESEARCH_DOMAINS, MasterDomain } from "@/lib/masterDomains";
import { Filter, Users, Briefcase, FileCheck } from "lucide-react";
import { X, Tag } from "lucide-react";

interface ResearchWorkspaceViewProps {
  session: SessionState | null;
  problems: ProblemRecord[];
  activePhase?: number;
  onUpdateSession?: (updatedSession: SessionState) => void;
}

const PHASES = [
  { id: "A", name: "Phase A: Scouting & Discovery", desc: "Empirical observation, variable identification, and localized problem brief." },
  { id: "B", name: "Phase B: Contextualization & Validation", desc: "Dual-literature grounding, conceptual model, and Gate 1 evaluation.", gate: "Gate 1: Problem Significance" },
  { id: "C", name: "Phase C: Opportunity & Literature Matrix", desc: "Scholarly gap synthesis, limitation extraction, and primary & sub-RQs.", gate: "Gate 2: Research Gap Quality" },
  { id: "D", name: "Phase D: Artifact Design & Kernel Theory", desc: "Abductive leap, 4 DSR artifact classes, and algorithmic architecture." },
  { id: "E", name: "Phase E: Trapping & Evaluation Design", desc: "Independent/dependent variables, circumscription loops, and Kothari experimental designs.", gate: "Gate 3: Artifact Rigor & Design" },
  { id: "F", name: "Phase F: Relevance & Feasibility Synthesis", desc: "SDGs, DOST-PCIEERD, Data Privacy Act 2012, and Gate 4 Proposal Canvas.", gate: "Gate 4: Proposal Readiness" },
];

export const ResearchWorkspaceView: React.FC<ResearchWorkspaceViewProps> = ({
  session,
  problems,
  activePhase,
  onUpdateSession,
}) => {
  const toast = useToast();
  const [activePhaseId, setActivePhaseId] = useState<string>("A");
  const phaseMap: Record<number, string> = {
    0: "A",
    1: "A",
    2: "B",
    3: "C",
    4: "D",
    5: "E",
    6: "F",
  };

  const currentPhaseId = activePhase !== undefined ? phaseMap[activePhase] || "A" : activePhaseId;
  const activePhaseMeta = PHASES.find((p) => p.id === currentPhaseId) || PHASES[0];
  
  // Stage A Master Domain Explorer State
  const [domainSearchQuery, setDomainSearchQuery] = useState<string>("");
  const [domainTypeFilter, setDomainTypeFilter] = useState<"ALL" | "Sector" | "Cross-cutting" | "Specialized">("ALL");
  const [customDomains, setCustomDomains] = useState<string[]>([]);
  const [newCustomDomainInput, setNewCustomDomainInput] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([
    "Agricultural Production and Farm Operations",
    "Fisheries and Aquaculture Production",
  ]);

  // Filtered Master Domains (D01-D25)
  const filteredMasterDomains = useMemo(() => {
    return MASTER_RESEARCH_DOMAINS.filter((d) => {
      const matchesType = domainTypeFilter === "ALL" || d.type === domainTypeFilter;
      const q = domainSearchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        d.id.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.contextSetting.toLowerCase().includes(q) ||
        d.stakeholders.toLowerCase().includes(q) ||
        d.processesToExplore.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [domainTypeFilter, domainSearchQuery]);

  const handleSelectAllFiltered = () => {
    const titles = filteredMasterDomains.map((d: MasterDomain) => d.title);
    setSelectedDomains((prev) => Array.from(new Set([...prev, ...titles])));
  };

  const handleLoadDomainContext = (domain: MasterDomain) => {
    const observationSnippet = `${domain.title} (${domain.id}) | Context: ${domain.contextSetting} | Stakeholders: ${domain.stakeholders} | Processes to Explore: ${domain.processesToExplore} | Preliminary Policy Basis: ${domain.evidenceBasis}`;
    setFieldObservations(observationSnippet);
    if (!selectedDomains.includes(domain.title)) {
      setSelectedDomains((prev) => [...prev, domain.title]);
    }
    toast.info(`Loaded authentic research context for ${domain.id}: ${domain.title}`, "Context Loaded");
  };

  const handleAddCustomDomain = () => {
    const trimmed = newCustomDomainInput.trim();
    if (!trimmed) return;
    if (!customDomains.includes(trimmed)) {
      setCustomDomains((prev) => [...prev, trimmed]);
    }
    if (!selectedDomains.includes(trimmed)) {
      setSelectedDomains((prev) => [...prev, trimmed]);
    }
    setNewCustomDomainInput("");
    setShowCustomInput(false);
    toast.success(`Added custom research domain: "${trimmed}"`, "Domain Added");
  };

  const handleRemoveCustomDomain = (domain: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomDomains((prev) => prev.filter((d) => d !== domain));
    setSelectedDomains((prev) => prev.filter((d) => d !== domain));
  };
  const [fieldObservations, setFieldObservations] = useState<string>("");
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveredProblems, setDiscoveredProblems] = useState<ProblemRecord[]>([]);
  const [unknownsKey, setUnknownsKey] = useState<number>(0);

  // Stage C Literature Matrix State
  const [searchQuery, setSearchQuery] = useState<string>("agricultural pest detection edge AI");
  const [matrixRows, setMatrixRows] = useState<LiteratureRow[]>([]);
  const [matrixGaps, setMatrixGaps] = useState<ResearchGapItem[]>([]);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState<boolean>(false);
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState<boolean>(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);
  const [activeGateModal, setActiveGateModal] = useState<"GATE_1" | "GATE_2" | "GATE_3" | "GATE_4" | null>(null);

  // Default demo papers for initial view
  useEffect(() => {
    fetchMatrix(searchQuery);
  }, []);

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleClearDomains = () => setSelectedDomains([]);

  const handleRunEmpiricalDiscovery = async () => {
    if (selectedDomains.length === 0) {
      toast.warning("Please select at least 1 computing research domain.", "Domain Required");
      return;
    }
    try {
      setIsDiscovering(true);
      toast.info("Scouting empirical computing breakdowns across regional domains...", "AI Discovery");
      
      const res = await researchService.discoverStageA({
        domains: selectedDomains,
        field_observations: fieldObservations,
        session_id: session?.session_id,
        project_id: session?.project_id || "default_proj",
      });

      if (res.discovered_problems && res.discovered_problems.length > 0) {
        setDiscoveredProblems(res.discovered_problems);
        setUnknownsKey((k) => k + 1);
        toast.success(
          `Discovered ${res.discovered_problems.length} computing research problems! Saved directly to Problem Bank.`,
          "Stage A Discovery Complete"
        );
      } else {
        toast.info("Stage A scouting completed.", "Discovery Output");
      }
    } catch (err: any) {
      console.error("Stage A Discovery failed:", err);
      toast.error(err?.message || "Failed to run empirical discovery.", "Discovery Error");
    } finally {
      setIsDiscovering(false);
    }
  };

  const fetchMatrix = async (query: string) => {
    try {
      setIsLoadingMatrix(true);
      const res = await researchService.generateMatrix(query, 6, session?.project_id);
      setMatrixRows(res.matrix_rows || []);
      setMatrixGaps(res.synthesized_gaps || []);
    } catch (err) {
      console.error("Failed to generate literature matrix:", err);
    } finally {
      setIsLoadingMatrix(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Compact Stage Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {activePhaseMeta.name.split(": ")[0]}
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight">
              {activePhaseMeta.name.split(": ")[1]}
            </h2>
            {activePhaseMeta.gate && (
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                {activePhaseMeta.gate}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {activePhaseMeta.desc}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activePhaseMeta.gate && (
            <button
              onClick={() => {
                if (currentPhaseId === "B") setActiveGateModal("GATE_1");
                else if (currentPhaseId === "C") setActiveGateModal("GATE_2");
                else if (currentPhaseId === "E") setActiveGateModal("GATE_3");
                else if (currentPhaseId === "F") setActiveGateModal("GATE_4");
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1.5 shadow-sm font-mono"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Evaluate Gate
            </button>
          )}

          <button
            onClick={() => setIsScorecardOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Scorecard
          </button>
          
          <button
            onClick={() => setIsTraceabilityOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Traceability
          </button>
        </div>
      </div>

      {/* Dynamic Phase Workspace Content */}
      <div className="space-y-8">
        {/* PHASE A */}
        {currentPhaseId === "A" && (
          <div className="space-y-6">
            {/* 1. Master Domain Explorer (D01-D25) & Scouting Discovery */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 space-y-6 shadow-xl relative overflow-hidden">
              {/* Explorer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      Master Research Domain Explorer &amp; Empirical Scanner
                      <Badge variant="emerald" size="sm">25 Master Domains (D01–D25)</Badge>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ground computing research in authentic regional operational contexts, stakeholders, and measurable failure points.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSelectAllFiltered} className="text-[11px]">
                    Select Filtered ({filteredMasterDomains.length})
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClearDomains} className="text-[11px]">
                    Clear ({selectedDomains.length})
                  </Button>
                </div>
              </div>

              {/* Search & Category Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={domainSearchQuery}
                    onChange={(e) => setDomainSearchQuery(e.target.value)}
                    placeholder="Search by domain name, context setting (Iloilo, farms, ports), or stakeholders..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: "ALL", label: `All (25)` },
                    { id: "Sector", label: `Sectors (15)` },
                    { id: "Cross-cutting", label: `Cross-cutting (5)` },
                    { id: "Specialized", label: `Specialized (5)` },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDomainTypeFilter(t.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        domainTypeFilter === t.id
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                          : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {!showCustomInput && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomInput(true)}
                    className="border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Custom Domain
                  </Button>
                )}
              </div>

              {/* Inline Custom Domain Creator */}
              {showCustomInput && (
                <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-2xl flex items-center gap-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={newCustomDomainInput}
                    onChange={(e) => setNewCustomDomainInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomDomain();
                      } else if (e.key === "Escape") {
                        setShowCustomInput(false);
                      }
                    }}
                    placeholder="Type custom research domain (e.g. 'Quantum Key Distribution & Cryptography')..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <Button variant="primary" size="sm" onClick={handleAddCustomDomain} className="text-xs font-bold">
                    Add Domain
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowCustomInput(false)} className="text-xs">
                    Cancel
                  </Button>
                </div>
              )}

              {/* Active Selected Domains Summary Bar */}
              {selectedDomains.length > 0 && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Active for Discovery ({selectedDomains.length}):
                  </span>
                  {selectedDomains.map((title) => {
                    const isCustom = customDomains.includes(title);
                    return (
                      <span
                        key={title}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-200 text-xs font-medium"
                      >
                        <span>{title}</span>
                        <button
                          onClick={() => toggleDomain(title)}
                          className="hover:text-rose-300 text-slate-400 ml-0.5"
                          title="Remove from active discovery"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Master Domains Grid (D01-D25) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 font-mono">
                  <span>Showing {filteredMasterDomains.length} Master Domains</span>
                  <span className="text-slate-500">Click card to load research context • Click toggle to select</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                  {filteredMasterDomains.map((domain) => {
                    const isSelected = selectedDomains.includes(domain.title);
                    return (
                      <div
                        key={domain.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                          isSelected
                            ? "bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/30"
                            : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                              {domain.id}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              domain.type === "Sector"
                                ? "bg-blue-950/50 text-blue-300 border-blue-800"
                                : domain.type === "Cross-cutting"
                                ? "bg-purple-950/50 text-purple-300 border-purple-800"
                                : "bg-amber-950/50 text-amber-300 border-amber-800"
                            }`}>
                              {domain.type}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-100 leading-snug group-hover:text-emerald-300 transition-colors">
                            {domain.title}
                          </h4>

                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {domain.description}
                          </p>

                          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1 text-[10px]">
                            <div className="flex items-center gap-1.5 text-slate-400 truncate">
                              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate"><strong>Context:</strong> {domain.contextSetting}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 truncate">
                              <Users className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="truncate"><strong>Stakeholders:</strong> {domain.stakeholders}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleLoadDomainContext(domain)}
                            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                          >
                            <FileCheck className="w-3 h-3" /> Load Context
                          </button>

                          <button
                            onClick={() => toggleDomain(domain.title)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-emerald-500 text-slate-950 shadow-sm"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                            }`}
                          >
                            {isSelected ? "✓ Selected" : "+ Select"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Raw Field Observation / Context Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Field Observations &amp; Loaded Research Signals</span>
                  <span className="text-slate-500 font-normal font-sans">Loaded from Domain Explorer or typed notes</span>
                </label>
                <textarea
                  value={fieldObservations}
                  onChange={(e) => setFieldObservations(e.target.value)}
                  placeholder="Click 'Load Context' on any master domain above, or paste raw notes from sensor logs, farm visits, or municipal interviews..."
                  rows={3}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              {/* Discovery Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400">
                  Generated problems automatically persist to the <strong>Problem Bank (Slot 0)</strong>.
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRunEmpiricalDiscovery}
                  disabled={isDiscovering}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 px-6"
                >
                  <RefreshCw className={`w-4 h-4 ${isDiscovering ? "animate-spin" : ""}`} />
                  {isDiscovering ? "Scouting Computing Breakdowns..." : "Run Empirical Problem Discovery"}
                </Button>
              </div>
            </div>

            {/* 2. Discovered Problems Grid */}
            {discoveredProblems.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Discovered Computing Research Problems ({discoveredProblems.length})
                    </h4>
                  </div>
                  <Badge variant="emerald" size="sm">Saved to Problem Bank</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoveredProblems.map((prob, i) => (
                    <div
                      key={prob.id || i}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 shadow-lg relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
                          {prob.id || `RES-00${i + 1}`}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {prob.sector || "Computing & Informatics"}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-100 leading-snug">
                        {prob.problem_statement}
                      </h5>

                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span><strong>Setting / Sufferer:</strong> {prob.sufferer_location || prob.sufferer_occupation || "Regional Operational Setting"}</span>
                        </div>
                        {prob.quantified_impact && (
                          <div className="flex items-center gap-1.5 text-rose-400 pt-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span><strong>Consequence:</strong> {prob.quantified_impact}</span>
                          </div>
                        )}
                      </div>

                      {prob.workaround && (
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          <strong>Makeshift Baseline:</strong> {prob.workaround}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Unknowns Map Embedded in Discovery */}
            <div className="pt-2">
              <UnknownsMap key={unknownsKey} projectId={session?.project_id || "default_proj"} sessionId={session?.session_id} />
            </div>
          </div>
        )}

        {/* PHASE B */}
        {currentPhaseId === "B" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <FlaskConical className="w-4 h-4" />
                  Phase B: Dual-Literature Grounding &amp; Feasibility Matrix
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Gate 1: Problem Significance
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ground the problem in both non-computing domain realities (agronomy, logistics, healthcare) and computing literature (algorithms, models, systems).
              </p>
            </div>
          </div>
        )}

        {/* PHASE C (Literature Matrix) */}
        {currentPhaseId === "C" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchMatrix(searchQuery)}
                  placeholder="Enter research topic or problem query to synthesize literature matrix..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => fetchMatrix(searchQuery)}
                disabled={isLoadingMatrix}
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMatrix ? "animate-spin" : ""}`} />
                Synthesize Matrix
              </button>
            </div>

            <LiteratureMatrixTable
              rows={matrixRows}
              gaps={matrixGaps}
              isLoading={isLoadingMatrix}
              onSearchNewQuery={fetchMatrix}
            />
          </div>
        )}

        {/* PHASE D */}
        {currentPhaseId === "D" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                Phase D: Solution Formulation &amp; 4 DSR Artifact Types (March &amp; Smith)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Design Science Research (DSR) creates artifacts in the Sciences of the Artificial. Classify your proposed contribution into one of the four foundational DSR artifact classes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                  <span className="text-xs font-bold text-indigo-400 font-mono">1. CONSTRUCT</span>
                  <div className="text-xs text-slate-300 font-medium">Vocabulary &amp; Concepts</div>
                  <p className="text-[11px] text-slate-500 mt-1">Formal ontology, taxonomy, or domain representations.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                  <span className="text-xs font-bold text-cyan-400 font-mono">2. MODEL</span>
                  <div className="text-xs text-slate-300 font-medium">Propositions &amp; Graphs</div>
                  <p className="text-[11px] text-slate-500 mt-1">Mathematical equations, state machines, or causal loops.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                  <span className="text-xs font-bold text-emerald-400 font-mono">3. METHOD</span>
                  <div className="text-xs text-slate-300 font-medium">Algorithms &amp; Pipelines</div>
                  <p className="text-[11px] text-slate-500 mt-1">Step-by-step mathematical procedures or optimization heuristics.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                  <span className="text-xs font-bold text-amber-400 font-mono">4. INSTANTIATION</span>
                  <div className="text-xs text-slate-300 font-medium">Physical System Artifact</div>
                  <p className="text-[11px] text-slate-500 mt-1">Working prototype, IoT sensor array, or embedded firmware.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE E */}
        {currentPhaseId === "E" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <FlaskConical className="w-4 h-4" />
                  Phase E: Trapping Phase &amp; Kothari Experimental Designs
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Gate 3: Evaluation Rigor
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Design a controlled evaluation setup to trap the phenomenon (Cialdini) and measure treatment effects against baselines.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-xs font-bold text-slate-200">CRD (Completely Randomized)</span>
                  <p className="text-xs text-slate-400 mt-1">Homogeneous synthetic bench testing across varying hyperparameters.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-xs font-bold text-slate-200">RBD (Randomized Block)</span>
                  <p className="text-xs text-slate-400 mt-1">Blocking by hardware specs (Raspberry Pi vs Jetson Nano vs Server).</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-xs font-bold text-slate-200">Latin Square</span>
                  <p className="text-xs text-slate-400 mt-1">Two-factor environmental blocking (e.g. lighting conditions &times; device battery level).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE F */}
        {currentPhaseId === "F" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Phase F: Relevance, Ethics &amp; Gate 4 Proposal Canvas
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Gate 4: Proposal Readiness
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Synthesize final institutional alignment with UN SDGs, DOST-PCIEERD priority roadmaps, WVSU core values, and RA 10173 (Data Privacy Act of 2012).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Traceability Lineage Drawer */}
      <TraceabilityDrawer
        isOpen={isTraceabilityOpen}
        onClose={() => setIsTraceabilityOpen(false)}
      />
      {activeGateModal && (
        <GateReviewModal
          isOpen={!!activeGateModal}
          gateId={activeGateModal}
          onClose={() => setActiveGateModal(null)}
          onGatePassed={() => {
            console.log(`Gate ${activeGateModal} Passed!`);
          }}
        />
      )}
    </div>
  );
};
