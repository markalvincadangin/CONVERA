"use client";

import React, { useState } from "react";
import { FolderOpen, Presentation, HelpCircle, RefreshCw, Download, Sparkles, ChevronDown, Check, CircleDot } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Tooltip } from "@/components/common/Tooltip";
import { SessionState } from "@/lib/types";

interface NavbarProps {
  session: SessionState | null;
  onOpenSessionManager: () => void;
  onOpenCheatsheet: () => void;
  onOpenHelp: () => void;
  onOpenPresentation: () => void;
  onExportDossier: () => void;
  isExporting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onOpenSessionManager,
  onOpenCheatsheet,
  onOpenHelp,
  onOpenPresentation,
  onExportDossier,
  isExporting = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const projectName = session?.project_name || "Iloilo Venture Project";
  const sessionId = session?.session_id || "";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand & Product Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group flex items-center justify-center">
            {/* Ambient Brand Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl blur-md opacity-25 group-hover:opacity-50 transition-opacity" />
            
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-black/40 overflow-hidden">
              {!imageError ? (
                <img
                  src="/brand/brandmark.png"
                  alt="RatchetAI Logo"
                  className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-200"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Sparkles className="w-5 h-5 text-cyan-400" />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-mono">
                RatchetAI
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 tracking-wide font-mono">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block tracking-tight -mt-0.5">
              Evidence-Ratcheted Technopreneurship Engine
            </p>
          </div>
        </div>

        {/* Center: Active Venture Workspace Switcher (Heuristic #2 & #7) */}
        <div className="flex-1 max-w-md hidden sm:flex justify-center">
          {session ? (
            <Tooltip content="Switch session, copy room share code, or restore milestone snapshots" position="bottom">
              <button
                onClick={onOpenSessionManager}
                className="group w-full max-w-sm flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/70 text-left transition-all duration-200 shadow-inner"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shrink-0">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-semibold text-slate-100 group-hover:text-white truncate">
                      {projectName}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{sessionId}</span>
                      {session.share_code && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-300 font-bold">{session.share_code}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider hidden lg:inline">Switch</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </button>
            </Tooltip>
          ) : (
            <div className="text-xs text-slate-500">Initializing workspace...</div>
          )}
        </div>

        {/* Right: Unified Action Toolbar (Heuristic #13: Visual Hierarchy) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Help & Guide Button */}
          <Tooltip content="Open user manual, 5-phase playbook, snapshots guide & FAQs" position="bottom">
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Help & Guide</span>
            </button>
          </Tooltip>

          {/* Pitch Deck Button */}
          <Tooltip content="Full-screen 6-slide presentation deck ready for pitch defense" position="bottom">
            <button
              onClick={onOpenPresentation}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/20 text-xs font-semibold text-purple-300 hover:text-purple-100 transition-all shadow-sm"
            >
              <Presentation className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Pitch Deck</span>
            </button>
          </Tooltip>

          {/* Sessions & Snapshots Manager */}
          <Tooltip content="All sessions, room codes, and rollback checkpoints" position="bottom">
            <button
              onClick={onOpenSessionManager}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline">Sessions</span>
            </button>
          </Tooltip>

          {/* Primary Action: Export Dossier */}
          <Tooltip content="Download comprehensive Markdown dossier report" position="bottom">
            <button
              onClick={onExportDossier}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>{isExporting ? "Exporting..." : "Export Dossier"}</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
