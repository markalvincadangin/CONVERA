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
import { researchService } from "@/services/researchService";
import { SessionState, ProblemRecord } from "@/lib/types";

interface ResearchWorkspaceViewProps {
  session: SessionState | null;
  problems: ProblemRecord[];
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
  onUpdateSession,
}) => {
  const [activePhaseId, setActivePhaseId] = useState<string>("A");
  const [searchQuery, setSearchQuery] = useState<string>("agricultural pest detection edge AI");
  const [matrixRows, setMatrixRows] = useState<LiteratureRow[]>([]);
  const [matrixGaps, setMatrixGaps] = useState<ResearchGapItem[]>([]);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState<boolean>(false);
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState<boolean>(false);

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
      {/* Workspace Top Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-indigo-950/40 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                Academic DSR Track (CRCDP)
              </span>
              <span className="text-xs text-slate-400 font-mono">6 Phases &bull; 4 Quality Gates</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Computing Research Concept Development Workspace
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Ground your thesis or capstone in Herbert Simon&apos;s <em>Sciences of the Artificial</em>, Bordens &amp; Abbott scouting, Kothari experimental designs, and rigorous scholarly gap matrices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTraceabilityOpen(true)}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-4 py-3 text-xs font-bold text-cyan-300 shadow-xl transition-all"
            >
              ⟲ Traceability Lineage
            </button>
          </div>
        </div>

        {/* Phase Stepper Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-8 pt-6 border-t border-slate-800/80">
          {PHASES.map((p) => {
            const isActive = activePhaseId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePhaseId(p.id)}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50"
                    : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black font-mono ${isActive ? "text-emerald-300" : "text-slate-400"}`}>
                    PHASE {p.id}
                  </span>
                  {p.gate && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
                      Gate
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1 line-clamp-1">{p.name.split(": ")[1]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Phase Workspace Content */}
      <div className="space-y-8">
        {/* PHASE A */}
        {activePhaseId === "A" && (
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
        {activePhaseId === "B" && (
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
        {activePhaseId === "C" && (
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
        {activePhaseId === "D" && (
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
        {activePhaseId === "E" && (
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
        {activePhaseId === "F" && (
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
    </div>
  );
};
