"use client";

import React, { useState } from "react";
import { SessionState } from "@/lib/types";
import { LeanCanvasView } from "./LeanCanvasView";
import { SwotMatrixView } from "./SwotMatrixView";
import { PitchDeckView } from "./PitchDeckView";
import { Phase2DossierCard } from "./Phase2DossierCard";
import { SrsSpecView } from "./SrsSpecView";
import { FileCode } from "lucide-react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Button } from "@/components/common/Button";
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
  const [activeTab, setActiveTab] = useState<"canvas" | "swot" | "deck" | "dossier" | "srs">("canvas");
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [rawViewMode, setRawViewMode] = useState<Record<string, boolean>>({});

  if (!session) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
        <p className="text-sm text-slate-400">Please start or select a session to view deliverables.</p>
      </div>
    );
  }

  const toggleRaw = (phaseKey: string) => {
    setRawViewMode((prev) => ({ ...prev, [phaseKey]: !prev[phaseKey] }));
  };

  const handleCopyFullDossier = () => {
    const md = [
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

    navigator.clipboard.writeText(md);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <div className="space-y-6">
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
              Venture Output Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Automatically transform your validated research across Phases 1-5 into pitch-ready deliverables, business model canvases, competitive matrices, and executive summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyFullDossier}
            leftIcon={copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedDossier ? "Dossier Copied" : "Copy Master Dossier"}
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
          <span>SWOT &amp; Competitor Matrix</span>
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
          onClick={() => setActiveTab("dossier")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "dossier"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/50"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Master Dossier &amp; Raw Briefs</span>
        </button>
      </div>

      {/* Sub-Tab Contents */}
      {activeTab === "canvas" && (
        <LeanCanvasView
          sessionId={session.session_id}
          initialCanvas={session.deliverable_lean_canvas}
          projectName={session.project_name}
        />
      )}

      {activeTab === "swot" && (
        <SwotMatrixView
          sessionId={session.session_id}
          initialSwot={session.deliverable_swot}
          projectName={session.project_name}
        />
      )}

      {activeTab === "deck" && (
        <PitchDeckView
          sessionId={session.session_id}
          initialDeck={session.deliverable_pitch_deck}
          projectName={session.project_name}
        />
      )}

      {activeTab === "srs" && <SrsSpecView session={session} />}

      {activeTab === "dossier" && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Phase-by-Phase Venture Dossier &amp; Evidence Audit
              </span>
              <p className="text-[11px] text-slate-400">
                Formatted briefings, interactive screening matrices, and raw execution logs.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyFullDossier}
              leftIcon={copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedDossier ? "Copied" : "Copy Markdown"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Phase 1 Card */}
            <div className="p-5 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Phase 1: Discovery Landscape
                    </span>
                  </div>
                  {session.phase1_response && (
                    <button
                      onClick={() => toggleRaw("p1")}
                      className="text-[10px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                    >
                      <Code2 className="w-3 h-3" />
                      {rawViewMode["p1"] ? "Formatted" : "Raw"}
                    </button>
                  )}
                </div>

                {session.phase1_response ? (
                  rawViewMode["p1"] ? (
                    <pre className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded-xl max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                      {session.phase1_response}
                    </pre>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto pr-2 text-xs text-slate-300">
                      <MarkdownRenderer content={session.phase1_response} />
                    </div>
                  )
                ) : (
                  <div className="p-8 bg-slate-900/40 rounded-xl border border-slate-800/80 text-center space-y-2">
                    <p className="text-xs text-slate-400">Phase 1 discovery has not been completed yet.</p>
                    {onNavigatePhase && (
                      <Button variant="primary" size="sm" onClick={() => onNavigatePhase(1)} leftIcon={<ArrowRight className="w-3 h-3" />}>
                        Go to Phase 1 Discovery
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phase 2 Card (Interactive Shortlist & Triage Card) */}
            <div className="p-5 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-teal-500/30 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 shadow-sm shadow-teal-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Phase 2: Screening &amp; Shortlist Matrix
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded border border-teal-500/20 font-bold">
                    Triage Matrix
                  </span>
                </div>

                {session.phase2_response ? (
                  <Phase2DossierCard rawContent={session.phase2_response} />
                ) : (
                  <div className="p-8 bg-slate-900/40 rounded-xl border border-slate-800/80 text-center space-y-2">
                    <p className="text-xs text-slate-400">Phase 2 screening has not been completed yet.</p>
                    {onNavigatePhase && (
                      <Button variant="primary" size="sm" onClick={() => onNavigatePhase(2)} leftIcon={<ArrowRight className="w-3 h-3" />}>
                        Go to Phase 2 Screening
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phase 3 Card */}
            <div className="p-5 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Phase 3: Socratic Mom Test
                    </span>
                  </div>
                  {session.phase3_response && (
                    <button
                      onClick={() => toggleRaw("p3")}
                      className="text-[10px] font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                    >
                      <Code2 className="w-3 h-3" />
                      {rawViewMode["p3"] ? "Formatted" : "Raw"}
                    </button>
                  )}
                </div>

                {session.phase3_response ? (
                  rawViewMode["p3"] ? (
                    <pre className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded-xl max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                      {session.phase3_response}
                    </pre>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto pr-2 text-xs text-slate-300">
                      <MarkdownRenderer content={session.phase3_response} />
                    </div>
                  )
                ) : (
                  <div className="p-8 bg-slate-900/40 rounded-xl border border-slate-800/80 text-center space-y-2">
                    <p className="text-xs text-slate-400">Phase 3 Socratic validation has not been completed yet.</p>
                    {onNavigatePhase && (
                      <Button variant="primary" size="sm" onClick={() => onNavigatePhase(3)} leftIcon={<ArrowRight className="w-3 h-3" />}>
                        Go to Phase 3 Validation
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phase 4 & 5 Card */}
            <div className="p-5 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Phase 4 &amp; 5: Solution &amp; MVP Audit
                    </span>
                  </div>
                  {(session.phase4_response || session.phase5_response) && (
                    <button
                      onClick={() => toggleRaw("p45")}
                      className="text-[10px] font-mono text-slate-400 hover:text-purple-400 flex items-center gap-1"
                    >
                      <Code2 className="w-3 h-3" />
                      {rawViewMode["p45"] ? "Formatted" : "Raw"}
                    </button>
                  )}
                </div>

                {session.phase4_response || session.phase5_response ? (
                  rawViewMode["p45"] ? (
                    <pre className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded-xl max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                      {session.phase4_response || session.phase5_response}
                    </pre>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto pr-2 text-xs text-slate-300">
                      <MarkdownRenderer content={session.phase4_response || session.phase5_response || ""} />
                    </div>
                  )
                ) : (
                  <div className="p-8 bg-slate-900/40 rounded-xl border border-slate-800/80 text-center space-y-2">
                    <p className="text-xs text-slate-400">Phase 4 &amp; 5 solutioning and MVP audit are pending.</p>
                    {onNavigatePhase && (
                      <Button variant="primary" size="sm" onClick={() => onNavigatePhase(4)} leftIcon={<ArrowRight className="w-3 h-3" />}>
                        Go to Phase 4 Solutioning
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
