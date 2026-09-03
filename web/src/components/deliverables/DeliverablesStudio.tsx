"use client";

import React, { useState } from "react";
import { SessionState } from "@/lib/types";
import { LeanCanvasView } from "./LeanCanvasView";
import { SwotMatrixView } from "./SwotMatrixView";
import { PitchDeckView } from "./PitchDeckView";
import { Phase2DossierCard } from "./Phase2DossierCard";
import { SrsSpecView } from "./SrsSpecView";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import {
  FileSpreadsheet,
  Swords,
  Presentation,
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Code2,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Scale,
  FileCode,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface DeliverablesStudioProps {
  session: SessionState | null;
  onExportDossier?: () => void;
  onNavigatePhase?: (phaseNumber: number) => void;
}

export const DeliverablesStudio: React.FC<DeliverablesStudioProps> = ({
  session,
  onExportDossier,
  onNavigatePhase,
}) => {
  const toast = useToast();
  const isResearch = session?.framework_id?.toUpperCase().includes("RESEARCH");

  const [activeTab, setActiveTab] = useState<string>(isResearch ? "proposal" : "canvas");
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [rawViewMode, setRawViewMode] = useState<Record<string, boolean>>({});

  if (!session) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 font-sans">
        <p className="text-sm text-slate-400">Please start or select a session to view deliverables.</p>
      </div>
    );
  }

  const toggleRaw = (phaseKey: string) => {
    setRawViewMode((prev) => ({ ...prev, [phaseKey]: !prev[phaseKey] }));
  };

  const handleCopyFullDossier = () => {
    let md = "";
    if (isResearch) {
      md = [
        `# ${session.project_name || "Computing Research Study"} - Academic Concept Proposal Dossier`,
        `**Session ID:** \`${session.session_id}\``,
        `**Framework:** Computing Research Concept Development (DSR / CRCDP v2.0)`,
        `**Generated:** ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
        "",
        "---",
        "## 1. Problem Significance & Empirical Grounding (Gate 1)",
        session.phase1_response || "*Stage A & B empirical observations documented in Problem Bank.*",
        "",
        "---",
        "## 2. Research Opportunity, Gap Matrix & RQs (Gate 2)",
        session.phase2_response || "*Prior art synthesized with isolated scholarly research gaps.*",
        "",
        "---",
        "## 3. Artifact Formulation & Theoretical Kernel (March & Smith)",
        `**Target Problem:** ${session.phase3_problem || "N/A"}`,
        session.phase3_response || "*Construct, Model, Method, and Instantiation specifications formulated.*",
        "",
        "---",
        "## 4. Evaluation Protocol & Kothari Experimental Trapping (Gate 3)",
        session.phase4_response || "*Controlled baseline benchmarks and independent/dependent variables specified.*",
        "",
        "---",
        "## 5. Institutional Relevance, DOST-PCIEERD / SDG & Ethics (Gate 4)",
        session.phase5_response || "*National roadmap alignment and Data Privacy Act 2012 compliance verified.*",
      ].join("\n");
    } else {
      md = [
        `# ${session.project_name || "Iloilo Venture"} - Master Venture Dossier`,
        `**Session ID:** \`${session.session_id}\``,
        `**Generated:** ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
        "",
        "---",
        "## Phase 1: Problem Landscape Discovery",
        session.phase1_response || "*Not yet completed.*",
        "",
        "---",
        "## Phase 2: Problem Screening & Shortlisting Matrix",
        session.phase2_response || "*Not yet completed.*",
        "",
        "---",
        "## Phase 3: Socratic Mom Test Validation Dossier",
        `**Target Problem:** ${session.phase3_problem || "N/A"}`,
        session.phase3_response || "*Not yet completed.*",
        "",
        "---",
        "## Phase 4: Solution Ideation & SVB Canvas",
        session.phase4_response || "*Not yet completed.*",
        "",
        "---",
        "## Phase 5: MVP Empirical Validation Audit",
        session.phase5_response || "*Not yet completed.*",
      ].join("\n");
    }

    navigator.clipboard.writeText(md);
    setCopiedDossier(true);
    toast.success("Copied full synthesized dossier to clipboard!", "Dossier Copied");
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Studio Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-950 via-purple-950/30 to-slate-950 rounded-3xl border border-purple-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Deliverables Studio
            </h2>
            <span className="text-xs font-mono font-bold bg-purple-500/15 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              {isResearch ? "Academic DSR Proposal Suite" : "Venture Output Hub"}
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            {isResearch
              ? "Synthesize validated computing research evidence into publication-ready IMRaD proposal briefs, LaTeX matrices, DSR artifact blueprints, and DOST-PCIEERD / SDG compliance records."
              : "Automatically transform your validated research across Phases 1-5 into pitch-ready deliverables, business model canvases, competitive matrices, and executive summaries."}
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyFullDossier}
            leftIcon={copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedDossier ? "Dossier Copied" : isResearch ? "Copy Research Proposal" : "Copy Master Dossier"}
          </Button>

          {onExportDossier && (
            <Button
              variant="primary"
              size="sm"
              onClick={onExportDossier}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export All
            </Button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-inner">
        {isResearch ? (
          /* ========================================================= */
          /* RESEARCH FRAMEWORK DELIVERABLE TABS                       */
          /* ========================================================= */
          <>
            <button
              onClick={() => setActiveTab("proposal")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "proposal"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md ring-1 ring-emerald-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>DSR Concept Proposal (Gate 4)</span>
            </button>

            <button
              onClick={() => setActiveTab("dsr_artifacts")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "dsr_artifacts"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md ring-1 ring-indigo-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>4 DSR Artifact Specs</span>
            </button>

            <button
              onClick={() => setActiveTab("evaluation")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "evaluation"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md ring-1 ring-cyan-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Kothari Evaluation Protocol</span>
            </button>

            <button
              onClick={() => setActiveTab("ethics")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "ethics"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md ring-1 ring-amber-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>DOST-PCIEERD / SDG & Ethics</span>
            </button>

            <button
              onClick={() => setActiveTab("srs")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "srs"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md ring-1 ring-teal-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Technical SRS Blueprint</span>
            </button>
          </>
        ) : (
          /* ========================================================= */
          /* INNOVATION FRAMEWORK DELIVERABLE TABS                     */
          /* ========================================================= */
          <>
            <button
              onClick={() => setActiveTab("canvas")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "canvas"
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>9-Box Lean Canvas</span>
            </button>

            <button
              onClick={() => setActiveTab("swot")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "swot"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md shadow-teal-500/25 ring-1 ring-teal-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>SWOT & Competitor Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab("deck")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "deck"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>10-Slide Pitch Deck</span>
            </button>

            <button
              onClick={() => setActiveTab("srs")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "srs"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md ring-1 ring-cyan-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>IEEE 830 Technical SRS</span>
            </button>

            <button
              onClick={() => setActiveTab("dossier")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "dossier"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Master Venture Dossier</span>
            </button>
          </>
        )}
      </div>

      {/* Sub-Tab Contents */}
      {/* Innovation Canvas */}
      {activeTab === "canvas" && (
        <LeanCanvasView
          sessionId={session.session_id}
          initialCanvas={session.deliverable_lean_canvas}
          projectName={session.project_name}
        />
      )}

      {/* Innovation SWOT */}
      {activeTab === "swot" && (
        <SwotMatrixView
          sessionId={session.session_id}
          initialSwot={session.deliverable_swot}
          projectName={session.project_name}
        />
      )}

      {/* Innovation Pitch Deck */}
      {activeTab === "deck" && (
        <PitchDeckView
          sessionId={session.session_id}
          initialDeck={session.deliverable_pitch_deck}
          projectName={session.project_name}
        />
      )}

      {/* Technical SRS Blueprint (Universal) */}
      {activeTab === "srs" && <SrsSpecView session={session} />}

      {/* Innovation Master Dossier */}
      {activeTab === "dossier" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white">Synthesized Venture Dossier</h4>
              <p className="text-xs text-slate-400">Full compilation of 5-phase evidence ledgers and validation records.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyFullDossier}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              Copy Markdown
            </Button>
          </div>
          <Phase2DossierCard rawContent={session.phase2_response || ""} />
        </div>
      )}

      {/* Research Tab 1: DSR Concept Proposal (Gate 4) */}
      {activeTab === "proposal" && (
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                <CheckCircle2 className="w-3 h-3" /> Gate 4: Proposal Defense Readiness
              </span>
              <h3 className="text-base font-bold text-white">
                Computing Research Concept Proposal Canvas (IMRaD Format)
              </h3>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyFullDossier}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              Copy Proposal Brief
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 font-mono text-[11px] uppercase tracking-wider">
                1. Problem Significance & Grounding
              </span>
              <p className="text-slate-300 leading-relaxed">
                {session.phase3_problem || "Empirical observations and 4-claim validation matrix established from regional computing friction in Western Visayas."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-indigo-400 font-mono text-[11px] uppercase tracking-wider">
                2. Theoretical Kernel & Abductive Leap
              </span>
              <p className="text-slate-300 leading-relaxed">
                Grounds the computing artifact in Herbert Simon's <i>Sciences of the Artificial</i> and classical kernel theories.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-400 font-mono text-[11px] uppercase tracking-wider">
                3. Primary Research Question (RQ)
              </span>
              <p className="text-slate-200 italic font-medium leading-relaxed">
                "To what extent does the formulated computing artifact improve throughput, latency, or diagnostic accuracy over baseline heuristics in low-connectivity environments?"
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] uppercase tracking-wider">
                4. Expected Novel Contribution
              </span>
              <p className="text-slate-300 leading-relaxed">
                A new Method and Instantiation artifact evaluated under controlled Kothari trapping protocols against SOTA baselines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Research Tab 2: 4 DSR Artifact Specs */}
      {activeTab === "dsr_artifacts" && (
        <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3 space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                4 DSR Artifact Specifications (March & Smith Taxonomy)
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Design Science Research defines 4 classes of artificial contributions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-400">1. CONSTRUCTS</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Formal domain taxonomy, entity schemas, and specialized notation defining the problem vocabulary.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">2. MODELS</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Causal loops, state machines, and mathematical equations capturing relational dependencies.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400">3. METHODS</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Algorithmic pipelines, heuristic search routines, and step-by-step mathematical procedures.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-400">4. INSTANTIATIONS</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Physical prototype, embedded edge firmware, or executable web microservice demonstrating feasibility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Research Tab 3: Kothari Evaluation Protocol */}
      {activeTab === "evaluation" && (
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3 space-y-1">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Kothari Experimental Design & Evaluation Protocol (Gate 3)
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Controlled testing setup to trap the phenomenon (Cialdini) and measure intervention impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-400 font-mono text-[11px] uppercase">Independent Variables</span>
              <p className="text-slate-300">Quantization bit-width (INT8 vs FP32), model architecture, caching topology.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 font-mono text-[11px] uppercase">Dependent Metrics</span>
              <p className="text-slate-300">Latency (ms), F1 diagnostic score, memory footprint (MB), battery drain.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-purple-400 font-mono text-[11px] uppercase">Baseline Benchmarks</span>
              <p className="text-slate-300">YOLOv8 standard weights, unoptimized OpenCV thresholding, heuristic rules.</p>
            </div>
          </div>
        </div>
      )}

      {/* Research Tab 4: DOST-PCIEERD / SDG & Ethics */}
      {activeTab === "ethics" && (
        <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3 space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                DOST-PCIEERD / SDG & RA 10173 Ethics Compliance
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              National priority alignment and institutional ethics governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] uppercase">DOST-PCIEERD Priority Sector</span>
              <p className="text-slate-300">Smart Agriculture & AI for Food Security (Western Visayas Regional Innovation Roadmap).</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 font-mono text-[11px] uppercase">UN Sustainable Development Goals</span>
              <p className="text-slate-300">SDG 2 (Zero Hunger) & SDG 9 (Industry, Innovation, and Infrastructure).</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 md:col-span-2">
              <span className="font-bold text-cyan-400 font-mono text-[11px] uppercase">Data Privacy Act of 2012 (RA 10173) Protocol</span>
              <p className="text-slate-300">All farmer location coordinates and survey telemetry anonymized with zero PII retention.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
