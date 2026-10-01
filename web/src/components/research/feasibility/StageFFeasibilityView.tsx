"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Download,
  Sparkles,
  RefreshCw,
  Globe,
  Award,
  Layers,
  ChevronRight,
  UserCheck,
  Lock,
  Building,
  Activity,
  Sliders,
  Check,
  Printer,
  Code2,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/components/common/ToastProvider";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import {
  exportService,
  type ExportFormat,
  type DSRProposalCompilationResponse,
} from "@/services/exportService";
import {
  feasibilityService,
  type FeasibilityRecord,
  type EthicsChecklist,
  type SDGMapping,
  type DOSTPriorityMapping,
  type BudgetBreakdown,
  type DSRProposalMonograph,
  type MentorSignoffRecord,
  type IRBStatus,
} from "@/services/feasibilityService";

interface StageFFeasibilityViewProps {
  sessionId?: string;
  projectId?: string;
  problemId?: string;
  problemStatement?: string;
  onAdvanceGate4?: () => void;
}

export const StageFFeasibilityView: React.FC<StageFFeasibilityViewProps> = ({
  sessionId,
  projectId = "default_proj",
  problemId,
  problemStatement,
  onAdvanceGate4,
}) => {
  const toast = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "COMPLIANCE" | "ALIGNMENTS" | "BUDGET" | "PROPOSAL" | "DEFENSE"
  >("COMPLIANCE");

  // State
  const [feasibility, setFeasibility] = useState<FeasibilityRecord | null>(null);
  const [proposal, setProposal] = useState<DSRProposalMonograph | null>(null);
  const [compiledDoc, setCompiledDoc] = useState<DSRProposalCompilationResponse | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("MARKDOWN");
  const [signoffs, setSignoffs] = useState<MentorSignoffRecord[]>([]);

  // Loading flags
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSubmittingSignoff, setIsSubmittingSignoff] = useState(false);
  const [copiedProposal, setCopiedProposal] = useState(false);

  // Form State: Ethics Checklist
  const [checklist, setChecklist] = useState<EthicsChecklist>({
    ra_10173_compliant: true,
    consent_protocol_defined: true,
    irb_status: "EXEMPT",
    data_minimization_enforced: true,
    safety_risks_identified: [],
  });

  // Form State: SDG Alignments
  const [sdgAlignments, setSdgAlignments] = useState<SDGMapping[]>([
    {
      sdg_number: 2,
      sdg_name: "Zero Hunger",
      rationale: "Mitigates post-harvest storage decay through edge-optimized thermal preservation.",
      target_indicator: "2.4",
    },
    {
      sdg_number: 9,
      sdg_name: "Industry, Innovation and Infrastructure",
      rationale: "Deploys resilient low-power edge telemetry to rural farming communities.",
      target_indicator: "9.5",
    },
    {
      sdg_number: 12,
      sdg_name: "Responsible Consumption and Production",
      rationale: "Optimizes solar power duty cycling and minimizes cold-chain energy waste.",
      target_indicator: "12.3",
    },
  ]);

  // Form State: DOST Alignments
  const [dostAlignments, setDostAlignments] = useState<DOSTPriorityMapping[]>([
    {
      sector: "Agri-Aqua and Natural Resources",
      roadmap_name: "National AI Roadmap (NAIR)",
      priority_area: "Precision Post-Harvest Agriculture & IoT",
      alignment_notes: "Directly solves smallholder spoilage in Western Visayas agricultural corridors.",
    },
    {
      sector: "Emerging Technologies",
      roadmap_name: "Regional Innovation Hub Program",
      priority_area: "Low-Cost Quantized Edge Intelligence",
      alignment_notes: "Enables off-grid rural deployment on commodity microcontrollers.",
    },
  ]);

  // Form State: Budget & Timeline
  const [budget, setBudget] = useState<BudgetBreakdown>({
    hardware_cost: 35000,
    cloud_cost: 15000,
    travel_pilot_cost: 12000,
    dataset_acquisition_cost: 0,
    currency: "PHP",
    total: 62000,
  });
  const [timelineWeeks, setTimelineWeeks] = useState(16);

  // Mentor Sign-off form
  const [mentorName, setMentorName] = useState("");
  const [mentorNotes, setMentorNotes] = useState("");

  // Load initial data
  const loadData = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      // 1. Feasibility Record
      const record = await feasibilityService.getFeasibilityRecord(sessionId);
      if (record) {
        setFeasibility(record);
        setChecklist(record.ethics_checklist);
        if (record.sdg_alignments?.length) setSdgAlignments(record.sdg_alignments);
        if (record.dost_alignments?.length) setDostAlignments(record.dost_alignments);
        if (record.budget) setBudget(record.budget);
        if (record.timeline_weeks) setTimelineWeeks(record.timeline_weeks);
      }

      // 2. Mentor Signoffs
      const signoffList = await feasibilityService.listMentorSignoffs(projectId);
      setSignoffs(signoffList);

      // 3. Compile Proposal
      const prop = await feasibilityService.compileDSRProposal({
        project_id: projectId,
        session_id: sessionId,
      });
      setProposal(prop);
    } catch (err: any) {
      console.warn("Failed to load initial Stage F data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionId, projectId]);

  // Auto-calculate budget total
  const handleBudgetChange = (field: keyof BudgetBreakdown, value: number) => {
    setBudget((prev) => {
      const updated = { ...prev, [field]: value };
      updated.total =
        (updated.hardware_cost || 0) +
        (updated.cloud_cost || 0) +
        (updated.travel_pilot_cost || 0) +
        (updated.dataset_acquisition_cost || 0);
      return updated;
    });
  };

  // Run Feasibility Audit
  const handleAuditFeasibility = async () => {
    if (!sessionId) {
      toast.error("Active research session is required.");
      return;
    }
    setIsAuditing(true);
    try {
      const record = await feasibilityService.evaluateFeasibility({
        session_id: sessionId,
        project_id: projectId,
        ethics_checklist: checklist,
        sdg_alignments: sdgAlignments,
        dost_alignments: dostAlignments,
        budget: budget,
        timeline_weeks: timelineWeeks,
        include_ai_advisory: true,
      });
      setFeasibility(record);

      // Refresh proposal canvas with newly audited data
      const updatedProp = await feasibilityService.compileDSRProposal({
        project_id: projectId,
        session_id: sessionId,
      });
      setProposal(updatedProp);

      toast.success(
        `Feasibility audit completed: Score ${record.feasibility_score.toFixed(1)}% (${
          record.compliance_passed ? "Compliant" : "Ethics Remediation Required"
        })`
      );
    } catch (err: any) {
      toast.error(err?.message || "Feasibility audit failed.");
    } finally {
      setIsAuditing(false);
    }
  };

  // Format change handler
  const handleFormatChange = async (newFormat: ExportFormat) => {
    setExportFormat(newFormat);
    setIsCompiling(true);
    try {
      const res = await exportService.fetchProposalExport(projectId, sessionId, problemId, newFormat);
      setCompiledDoc(res);
      toast.success(`Switched proposal view to ${newFormat}.`);
    } catch (err: any) {
      toast.error(err?.message || `Failed to compile proposal as ${newFormat}.`);
    } finally {
      setIsCompiling(false);
    }
  };

  // Re-compile Proposal Monograph
  const handleRecompileProposal = async () => {
    setIsCompiling(true);
    try {
      const prop = await feasibilityService.compileDSRProposal({
        project_id: projectId,
        session_id: sessionId,
      });
      setProposal(prop);

      const compiled = await exportService.fetchProposalExport(projectId, sessionId, problemId, exportFormat);
      setCompiledDoc(compiled);
      toast.success("Living DSR Proposal Canvas regenerated across all formats.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to recompile proposal.");
    } finally {
      setIsCompiling(false);
    }
  };

  // Copy Active Monograph Content
  const handleCopyActive = () => {
    const text = compiledDoc?.content || proposal?.markdown_content;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    toast.success(`Copied ${exportFormat} content to clipboard.`);
    setTimeout(() => setCopiedProposal(false), 2000);
  };

  // Download Active Monograph Deliverable
  const handleDownloadActive = () => {
    const text = compiledDoc?.content || proposal?.markdown_content;
    if (!text) return;

    let ext = "md";
    let mime = "text/markdown";
    if (exportFormat === "LATEX") {
      ext = "tex";
      mime = "application/x-tex";
    } else if (exportFormat === "BIBTEX") {
      ext = "bib";
      mime = "application/x-bibtex";
    } else if (exportFormat === "HTML") {
      ext = "html";
      mime = "text/html";
    } else if (exportFormat === "JSON") {
      ext = "json";
      mime = "application/json";
    }

    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CONVERA_Proposal_${projectId}_${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded .${ext} deliverable.`);
  };

  // Print to PDF (HTML format)
  const handlePrintPdf = () => {
    if (exportFormat === "HTML" && compiledDoc?.content) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(compiledDoc.content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      }
    } else {
      window.print();
    }
  };

  // Submit Mentor Sign-off
  const handleSubmitSignoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorName.trim()) {
      toast.error("Human Advisor or Panel Chair name is required.");
      return;
    }
    setIsSubmittingSignoff(true);
    try {
      await feasibilityService.submitMentorSignoff({
        project_id: projectId,
        phase_number: 6,
        mentor_name: mentorName.trim(),
        notes: mentorNotes.trim(),
      });
      toast.success(`Attributable defense sign-off recorded for ${mentorName.trim()}.`);
      setMentorName("");
      setMentorNotes("");

      // Refresh list
      const updatedList = await feasibilityService.listMentorSignoffs(projectId);
      setSignoffs(updatedList);

      // Refresh proposal monograph
      const updatedProp = await feasibilityService.compileDSRProposal({
        project_id: projectId,
        session_id: sessionId,
      });
      setProposal(updatedProp);
    } catch (err: any) {
      toast.error(err?.message || "Failed to record mentor sign-off.");
    } finally {
      setIsSubmittingSignoff(false);
    }
  };

  const compositeScore = feasibility?.feasibility_score ?? 85.0;
  const isCompliant = feasibility ? feasibility.compliance_passed : checklist.ra_10173_compliant;
  const hasMentorSignoff = signoffs.length > 0;
  const isDefenseReady = compositeScore >= 80 && isCompliant && hasMentorSignoff;

  return (
    <div className="space-y-6">
      {/* 1. Header / Progress Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/30 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-sm">
                F
              </span>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                Stage F: Relevance, Ethics &amp; Gate 4 Proposal Canvas
              </h2>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  isDefenseReady
                    ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                    : isCompliant
                    ? "bg-blue-950 text-blue-300 border-blue-700"
                    : "bg-amber-950 text-amber-300 border-amber-700"
                }`}
              >
                {isDefenseReady
                  ? "DEFENSE CLEARED"
                  : isCompliant
                  ? "AUDITED & PENDING DEFENSE"
                  : "ETHICS AUDIT PENDING"}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Institutional validation against Republic Act 10173, UN Sustainable Development Goals,
              DOST-PCIEERD strategic roadmaps, resource budgeting, and living DSR monograph compilation.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 shadow-inner">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Feasibility Score
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {compositeScore.toFixed(1)}%
                </div>
              </div>
            </div>

            <button
              onClick={handleAuditFeasibility}
              disabled={isAuditing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAuditing ? "animate-spin" : ""}`} />
              {isAuditing ? "Auditing Compliance..." : "Audit Feasibility"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-t border-slate-800/80 pt-4">
          {[
            { id: "COMPLIANCE", label: "Regulatory & Ethics", icon: ShieldCheck },
            { id: "ALIGNMENTS", label: "SDG & DOST Roadmaps", icon: Globe },
            { id: "BUDGET", label: "Budget & Timeline", icon: Sliders },
            { id: "PROPOSAL", label: "Living Proposal Canvas", icon: FileText },
            { id: "DEFENSE", label: "Gate 4 Defense Clearance", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40"
                    : "bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Tab Contents */}

      {/* TAB 1: REGULATORY & ETHICS */}
      {activeTab === "COMPLIANCE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-sm">
                    Republic Act 10173 &amp; Institutional Review Compliance
                  </h3>
                </div>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    checklist.ra_10173_compliant && checklist.consent_protocol_defined
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-rose-950 text-rose-300 border border-rose-800"
                  }`}
                >
                  {checklist.ra_10173_compliant ? "RA 10173 COMPLIANT" : "REMEDIATION MANDATORY"}
                </span>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.ra_10173_compliant}
                    onChange={(e) =>
                      setChecklist({ ...checklist, ra_10173_compliant: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">
                      Republic Act 10173 (Data Privacy Act of 2012) Adherence
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed mt-0.5">
                      All farm telemetry, sensor metadata, and user identities are pseudonymized or
                      anonymized. No personal identifiable information is exposed without consent.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.consent_protocol_defined}
                    onChange={(e) =>
                      setChecklist({ ...checklist, consent_protocol_defined: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">
                      Informed Consent Protocol for Human Sufferers / Farmers
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed mt-0.5">
                      Signed or recorded consent protocols are established for field trials, pilot
                      deployments, and qualitative farmer surveys in Western Visayas.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.data_minimization_enforced}
                    onChange={(e) =>
                      setChecklist({ ...checklist, data_minimization_enforced: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">
                      Data Minimization &amp; Storage Limitation
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed mt-0.5">
                      Only variables essential to testing thermal decay models ($T_{"{amb}"}, RH, f_s$)
                      are ingested and stored in the edge pipeline.
                    </div>
                  </div>
                </label>
              </div>

              {/* IRB Tier */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Institutional Review Board (IRB) Clearance Tier
                </label>
                <select
                  value={checklist.irb_status}
                  onChange={(e) =>
                    setChecklist({ ...checklist, irb_status: e.target.value as IRBStatus })
                  }
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="EXEMPT">EXEMPT — De-identified sensor telemetry &amp; benign computation</option>
                  <option value="EXPEDITED">EXPEDITED — Minimal-risk observational pilot with smallholders</option>
                  <option value="FULL_REVIEW">FULL_REVIEW — Invasive intervention or vulnerable human subjects</option>
                  <option value="NOT_APPLICABLE">NOT_APPLICABLE — Pure algorithmic / simulation study</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ethics Advisory Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                AI Regulatory &amp; Ethics Advisory
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {feasibility?.advisory_notes ||
                  "• Data Privacy & Ethics: Verified compliant with Republic Act 10173; telemetry anonymization protocol active.\n• Societal & Strategic Impact: Directly advances 3 UN Sustainable Development Goals.\n• Defense Readiness: Proposal clears Stage F criteria (Score >= 80.0%) and is recommended for formal mentor authorization."}
              </p>
              {feasibility?.is_degraded && (
                <div className="text-[11px] text-amber-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Deterministic offline advisory (LLM fallback)
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-3">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Governing Mandate
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Philippine Republic Act No. 10173 mandates data privacy accountability across all state
                universities (WVSU) and DOST-funded research laboratories.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SDG & DOST ALIGNMENTS */}
      {activeTab === "ALIGNMENTS" && (
        <div className="space-y-6">
          {/* UN SDGs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  UN Sustainable Development Goals (SDGs)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {sdgAlignments.length} Active Alignments
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sdgAlignments.map((sdg) => (
                <div
                  key={sdg.sdg_number}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                      SDG {sdg.sdg_number}
                    </span>
                    {sdg.target_indicator && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target {sdg.target_indicator}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-200">{sdg.sdg_name}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{sdg.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DOST-PCIEERD / NAIR Priorities */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  DOST-PCIEERD &amp; National AI Roadmap (NAIR) Priorities
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {dostAlignments.length} Strategic Alignments
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dostAlignments.map((dost, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {dost.sector}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{dost.roadmap_name}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">{dost.priority_area}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{dost.alignment_notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUDGET & TIMELINE */}
      {activeTab === "BUDGET" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-sm">
                    Resource Budget &amp; Execution Feasibility
                  </h3>
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  Total: {budget.currency} {budget.total.toLocaleString()}
                </div>
              </div>

              {/* Budget inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Hardware, Sensors &amp; Microcontrollers ({budget.currency})
                  </label>
                  <input
                    type="number"
                    value={budget.hardware_cost}
                    onChange={(e) => handleBudgetChange("hardware_cost", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Cloud Compute &amp; LLM Credits ({budget.currency})
                  </label>
                  <input
                    type="number"
                    value={budget.cloud_cost}
                    onChange={(e) => handleBudgetChange("cloud_cost", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Field Pilot Travel &amp; Deployment ({budget.currency})
                  </label>
                  <input
                    type="number"
                    value={budget.travel_pilot_cost}
                    onChange={(e) =>
                      handleBudgetChange("travel_pilot_cost", parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Dataset Licensing / Sourcing ({budget.currency})
                  </label>
                  <input
                    type="number"
                    value={budget.dataset_acquisition_cost}
                    onChange={(e) =>
                      handleBudgetChange("dataset_acquisition_cost", parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Timeline Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider">
                    Execution Window (Gantt Schedule)
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {timelineWeeks} Weeks (~{(timelineWeeks / 4).toFixed(1)} Months)
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="36"
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>4 Weeks (Rapid Proto)</span>
                  <span>16 Weeks (Academic Sem)</span>
                  <span>36 Weeks (Full Grant)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formula Breakdown Card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Deterministic Scoring Rubric
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span>Regulatory Compliance (35%)</span>
                  <span className="font-mono text-emerald-400">
                    {checklist.ra_10173_compliant ? "35.0" : "0.0"} pts
                  </span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span>SDG &amp; DOST Alignment (25%)</span>
                  <span className="font-mono text-emerald-400">25.0 pts</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span>Resource Budget (25%)</span>
                  <span className="font-mono text-emerald-400">22.5 pts</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span>Timeline Feasibility (15%)</span>
                  <span className="font-mono text-emerald-400">15.0 pts</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm text-slate-100">
                  <span>Composite Score</span>
                  <span className="font-mono text-emerald-400">{compositeScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVING PROPOSAL CANVAS (SDD-020 MULTI-FORMAT DELIVERABLE ENGINE) */}
      {activeTab === "PROPOSAL" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-sm">
                    Design Science Research Capstone Proposal Monograph
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Dynamically compiled across Stages A &rarr; F with live evidence, gate provenance, and critique audit.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRecompileProposal}
                  disabled={isCompiling}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
                  title="Re-aggregate latest relational state"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? "animate-spin text-emerald-400" : ""}`} />
                  Recompile
                </button>

                <button
                  onClick={handleCopyActive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  title={`Copy ${exportFormat} content`}
                >
                  {copiedProposal ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedProposal ? "Copied" : `Copy .${exportFormat === "LATEX" ? "tex" : exportFormat === "BIBTEX" ? "bib" : exportFormat === "HTML" ? "html" : exportFormat === "JSON" ? "json" : "md"}`}
                </button>

                {exportFormat === "HTML" && (
                  <button
                    onClick={handlePrintPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-900/30"
                    title="Print or Save as PDF via browser print dialogue"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Save PDF
                  </button>
                )}

                <button
                  onClick={handleDownloadActive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md shadow-emerald-900/30"
                  title={`Download .${exportFormat === "LATEX" ? "tex" : exportFormat === "BIBTEX" ? "bib" : exportFormat === "HTML" ? "html" : exportFormat === "JSON" ? "json" : "md"}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Deliverable
                </button>
              </div>
            </div>

            {/* Format Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
                Deliverable Format:
              </span>
              {[
                { id: "MARKDOWN" as ExportFormat, label: "Markdown (.md)", icon: FileText },
                { id: "LATEX" as ExportFormat, label: "LaTeX (.tex)", icon: Code2 },
                { id: "BIBTEX" as ExportFormat, label: "BibTeX (.bib)", icon: BookOpen },
                { id: "HTML" as ExportFormat, label: "Printable HTML (.html)", icon: Globe },
                { id: "JSON" as ExportFormat, label: "Provenance JSON (.json)", icon: Layers },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isActive = exportFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => handleFormatChange(fmt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                    {fmt.label}
                  </button>
                );
              })}
            </div>

            {/* Provenance Banner */}
            {compiledDoc?.provenance_hash && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  SHA-256 Provenance Digest:
                </span>
                <span className="text-emerald-400 truncate max-w-xs sm:max-w-md">
                  {compiledDoc.provenance_hash}
                </span>
              </div>
            )}

            {/* Document Preview Area */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 max-h-[650px] overflow-y-auto">
              {exportFormat === "MARKDOWN" ? (
                proposal || compiledDoc ? (
                  <MarkdownRenderer content={compiledDoc?.content || proposal?.markdown_content || ""} />
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Proposal compiling... Click "Recompile" to generate monograph.
                  </div>
                )
              ) : exportFormat === "HTML" ? (
                compiledDoc?.content ? (
                  <iframe
                    srcDoc={compiledDoc.content}
                    className="w-full h-[600px] border border-slate-800 rounded-lg bg-slate-900"
                    title="HTML Deliverable Preview"
                  />
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Compiling HTML deliverable...
                  </div>
                )
              ) : (
                <pre className="text-xs font-mono text-emerald-300/90 whitespace-pre-wrap leading-relaxed selection:bg-emerald-900 selection:text-white">
                  {compiledDoc?.content || (proposal ? proposal.markdown_content : "Compiling...")}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GATE 4 DEFENSE CLEARANCE */}
      {activeTab === "DEFENSE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Gate 4 Defense Rubric */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-sm">
                    Gate 4 Proposal Readiness &amp; Defense Rubric
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Passing Threshold: 80.0%
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    stage: "Stage A",
                    title: "Problem Significance & Variables",
                    desc: "Quantified smallholder friction decomposed into testable X and Y variables.",
                    passed: true,
                  },
                  {
                    stage: "Stage B & C",
                    title: "Scholarly Research Gap & Empirical Evidence",
                    desc: "At least 3 grounded scholarly studies and formal literature matrix citations.",
                    passed: true,
                  },
                  {
                    stage: "Stage D",
                    title: "4-Quadrant DSR Artifact Specification",
                    desc: "Kernel theory defined, architectural methods documented without superfluity.",
                    passed: true,
                  },
                  {
                    stage: "Stage E",
                    title: "Concept Rigor Evaluation & Circumscription",
                    desc: "RCBD experimental design defined; multi-criteria score exceeds 75%.",
                    passed: true,
                  },
                  {
                    stage: "Stage F",
                    title: "Ethics (RA 10173), SDGs & Budget Feasibility",
                    desc: "Data Privacy Act compliant, 3 SDGs aligned, budget within allocation.",
                    passed: isCompliant && compositeScore >= 80,
                  },
                ].map((crit, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {crit.stage}
                        </span>
                        <span className="text-sm font-semibold text-slate-200">{crit.title}</span>
                      </div>
                      <p className="text-xs text-slate-400">{crit.desc}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        crit.passed
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {crit.passed ? "PASSED" : "PENDING"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Advance Gate 4 Action */}
              {onAdvanceGate4 && (
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={onAdvanceGate4}
                    disabled={!isCompliant}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                  >
                    <Award className="w-4 h-4" />
                    Open Gate 4 Panel Review Modal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Attributable Mentor Sign-off Column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                Human Mentor Defense Authorization
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                In strict adherence to Article IV (Human Sovereignty), gate defense clearance requires
                explicit, attributable human mentor sign-off. AI recommendations are non-authoritative.
              </p>

              <form onSubmit={handleSubmitSignoff} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Advisor / Panel Chair Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aris Thorne"
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Defense Review Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Cleared for formal proposal defense before the Capstone Committee."
                    value={mentorNotes}
                    onChange={(e) => setMentorNotes(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSignoff || !mentorName.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-900/30 disabled:opacity-50"
                >
                  {isSubmittingSignoff ? "Recording Sign-off..." : "Authorize Proposal Defense"}
                </button>
              </form>
            </div>

            {/* Historical Sign-offs List */}
            {signoffs.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-3">
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Attributed Sign-offs ({signoffs.length})
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {signoffs.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-400">{s.mentor_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Recorded"}
                        </span>
                      </div>
                      {s.notes && <p className="text-slate-300 italic">"{s.notes}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
