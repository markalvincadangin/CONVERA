"use client";

import React, { useState, useEffect } from "react";
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
  FileText
} from "lucide-react";
import { LiteratureMatrixTable, LiteratureRow, ResearchGapItem } from "@/components/research/LiteratureMatrixTable";
import { UnknownsMap } from "@/components/knowledge/UnknownsMap";
import { TraceabilityDrawer } from "@/components/knowledge/TraceabilityDrawer";
import { GateReviewModal } from "@/components/frameworks/research/GateReviewModal";
import { CircumscriptionLoopView } from "@/components/frameworks/research/CircumscriptionLoopView";
import { IntelligenceScorecardDrawer } from "@/components/knowledge/IntelligenceScorecardDrawer";
import { researchService } from "@/services/researchService";
import { SessionState, ProblemRecord } from "@/lib/types";

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
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Compass className="w-4 h-4" />
                Phase A: Scouting Mechanism & Empirical Observation (Bordens & Abbott)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Transform casual observations into a formal computing research problem brief. Differentiate between environmental symptoms, human behavioral workarounds, and underlying computing inefficiencies.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-200">1. Target Domain & Problem Context</span>
                  <p className="text-xs text-slate-400">Specify municipality, stakeholder role, and operational workflow where failure occurs.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-200">2. Observable Variables & Pain Metric</span>
                  <p className="text-xs text-slate-400">Quantifiable units of loss (e.g. crop spoilage %, latency ms, human error rate).</p>
                </div>
              </div>
            </div>

            {/* Unknowns Map Embedded in Discovery */}
            <UnknownsMap projectId={session?.project_id || "default_proj"} sessionId={session?.session_id} />
          </div>
        )}

        {/* PHASE B */}
        {currentPhaseId === "B" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <FlaskConical className="w-4 h-4" />
                  Phase B: Dual-Literature Grounding & Feasibility Matrix
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
                Phase D: Solution Formulation & 4 DSR Artifact Types (March & Smith)
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
