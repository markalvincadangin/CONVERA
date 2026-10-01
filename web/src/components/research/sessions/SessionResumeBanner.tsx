"use client";

import React from "react";
import {
  Layers,
  Bookmark,
  ChevronRight,
  Database,
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface SessionResumeBannerProps {
  sessionName: string;
  sessionId: string;
  currentStageId?: string;
  stageCompletionPct?: number;
  checkpointCount?: number;
  onOpenDrawer: () => void;
  onOpenCheckpoints: () => void;
}

const STAGES = [
  { id: "scouting", label: "A: Scouting", short: "A" },
  { id: "contextualization", label: "B: Context", short: "B" },
  { id: "matrix", label: "C: Matrix", short: "C" },
  { id: "artifact_design", label: "D: Design", short: "D" },
  { id: "evaluation", label: "E: Eval", short: "E" },
  { id: "feasibility", label: "F: Feas", short: "F" },
];

export const SessionResumeBanner: React.FC<SessionResumeBannerProps> = ({
  sessionName,
  sessionId,
  currentStageId = "scouting",
  stageCompletionPct = 0,
  checkpointCount = 0,
  onOpenDrawer,
  onOpenCheckpoints,
}) => {
  const currentStageIndex = STAGES.findIndex(
    (s) => s.id === currentStageId || currentStageId.includes(s.id)
  );
  const activeIdx = currentStageIndex >= 0 ? currentStageIndex : 0;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-700/60 backdrop-blur-xl rounded-2xl p-4 shadow-xl shadow-cyan-950/10 mb-4 transition-all hover:border-slate-600/80">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Session Identity */}
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold tracking-wider">
                Research Session
              </span>
              <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3 h-3" />
                <span>WAL Synced</span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
              {sessionName || "Active Research Initiative"}
            </h3>
            <p className="text-xs text-slate-400 font-mono truncate">
              ID: {sessionId}
            </p>
          </div>
        </div>

        {/* Center: Stage Progress Tracker */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          {STAGES.map((stg, i) => {
            const isCurrent = i === activeIdx;
            const isPast = i < activeIdx;
            return (
              <div
                key={stg.id}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1 transition ${
                  isCurrent
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300"
                    : isPast
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-950/60 text-slate-500 border border-slate-800"
                }`}
              >
                <span>{stg.short}</span>
                {isCurrent && (
                  <span className="text-[10px] opacity-80">
                    ({stageCompletionPct.toFixed(0)}%)
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 self-end lg:self-center shrink-0">
          <button
            onClick={onOpenCheckpoints}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
            title="Manage milestone checkpoints and restore state"
          >
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>Checkpoints ({checkpointCount})</span>
          </button>

          <button
            onClick={onOpenDrawer}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1.5 transition"
            title="Browse all research sessions portfolio"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Switch Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
