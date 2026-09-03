"use client";

import React, { useState } from "react";
import { SessionState } from "@/lib/types";
import { LeanCanvasView } from "./LeanCanvasView";
import { SwotMatrixView } from "./SwotMatrixView";
import { PitchDeckView } from "./PitchDeckView";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import {
  FileSpreadsheet,
  Swords,
  Presentation,
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  Layers,
} from "lucide-react";

interface DeliverablesStudioProps {
  session: SessionState | null;
  onExportDossier?: () => void;
}

export const DeliverablesStudio: React.FC<DeliverablesStudioProps> = ({
  session,
  onExportDossier,
}) => {
  const [activeTab, setActiveTab] = useState<"canvas" | "swot" | "deck" | "dossier">("canvas");
  const [copiedDossier, setCopiedDossier] = useState(false);

  if (!session) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
        <p className="text-sm text-slate-400">Please start or select a session to view deliverables.</p>
      </div>
    );
  }

  const handleCopyFullDossier = () => {
    const md = [
      `# ${session.project_name || "Iloilo Venture"} — Master Venture Dossier`,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-950 rounded-3xl border border-purple-500/20 shadow-xl">
        <div className="space-y-1">
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
            Automatically transform your validated research across Phases 1–5 into pitch-ready deliverables, business model canvases, competitive matrices, and executive summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab("canvas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "canvas"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>9-Box Lean Canvas</span>
        </button>

        <button
          onClick={() => setActiveTab("swot")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "swot"
              ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>SWOT & Competitor Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab("deck")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "deck"
              ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>10-Slide Pitch Deck</span>
        </button>

        <button
          onClick={() => setActiveTab("dossier")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "dossier"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Master Dossier & Raw Briefs</span>
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

      {activeTab === "dossier" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Raw Session Artifacts across All 5 Phases
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyFullDossier}
              leftIcon={copiedDossier ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            >
              {copiedDossier ? "Copied" : "Copy Markdown"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">Phase 1: Discovery</span>
              <p className="text-xs text-slate-300 line-clamp-6 whitespace-pre-wrap">
                {session.phase1_response || "Phase 1 not completed yet."}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">Phase 2: Screening</span>
              <p className="text-xs text-slate-300 line-clamp-6 whitespace-pre-wrap">
                {session.phase2_response || "Phase 2 not completed yet."}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase">Phase 3: Validation</span>
              <p className="text-xs text-slate-300 line-clamp-6 whitespace-pre-wrap">
                {session.phase3_response || "Phase 3 not completed yet."}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase">Phase 4 & 5: Solution & MVP</span>
              <p className="text-xs text-slate-300 line-clamp-6 whitespace-pre-wrap">
                {session.phase4_response || session.phase5_response || "Phases 4/5 not completed yet."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
