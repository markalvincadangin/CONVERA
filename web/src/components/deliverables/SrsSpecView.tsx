"use client";

import React, { useState } from "react";
import { SrsSpecification, SessionState } from "@/lib/types";
import { phaseService } from "@/services/phaseService";
import { Button } from "@/components/common/Button";
import {
  FileCode,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  ShieldCheck,
  User,
  Activity,
  ArrowRight,
  Database,
  Smartphone,
  Server,
  Zap,
} from "lucide-react";

interface SrsSpecViewProps {
  session: SessionState;
}

export const SrsSpecView: React.FC<SrsSpecViewProps> = ({ session }) => {
  const [srs, setSrs] = useState<SrsSpecification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [mode, setMode] = useState<"CAPSTONE" | "STARTUP">("CAPSTONE");

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await phaseService.generateSrs(session.session_id, mode);
      setSrs(res.srs);
    } catch (err: any) {
      alert("Failed to generate SRS specification: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!srs?.markdown_document) return;
    navigator.clipboard.writeText(srs.markdown_document);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
              <FileCode className="w-3 h-3" /> Step 3 Project Translation
            </span>
            <span className="text-xs text-slate-400">Engineering Requirements & Architecture</span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide">
            Software Requirements Specification (SRS) & MVP Blueprint
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setMode("CAPSTONE")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mode === "CAPSTONE"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Academic Capstone (IEEE 830)
            </button>
            <button
              type="button"
              onClick={() => setMode("STARTUP")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mode === "STARTUP"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Startup MVP Spec
            </button>
          </div>

          {srs && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyMarkdown}
              leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              className="text-xs font-mono"
            >
              {isCopied ? "Copied Markdown!" : "Copy Markdown SRS"}
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
          >
            {srs ? "Regenerate SRS" : "Generate Technical SRS"}
          </Button>
        </div>
      </div>

      {!srs ? (
        <div className="p-12 text-center bg-slate-950 rounded-3xl border border-dashed border-slate-800 space-y-3">
          <Cpu className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-sm">No SRS Specification Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Translate your validated problem statement, Mom Test field proof, and solution mechanisms into an engineering-grade Software Requirements Specification.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate Technical SRS & Architecture
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="p-5 bg-slate-900 rounded-3xl border border-cyan-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                1. System Purpose & Title
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                {mode === "CAPSTONE" ? "IEEE 830 Compliant" : "Lean MVP Architecture"}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{srs.project_title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-2xl border border-slate-800">
              {srs.executive_summary}
            </p>
          </div>

          {/* Scope: In-Scope vs Out-of-Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> In-Scope (MVP Phase 1 Deliverables):
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {srs.scope?.in_scope?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                    <span className="font-mono font-bold text-emerald-400 shrink-0 text-[10px]">[IN]</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Out-of-Scope (Explicitly Deferred):
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {srs.scope?.out_of_scope?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                    <span className="font-mono font-bold text-amber-400 shrink-0 text-[10px]">[OUT]</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Primary User Persona */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
              <User className="w-3.5 h-3.5 text-cyan-400" /> Primary User Persona & Context
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Target Role:</span>
                <p className="text-white font-semibold">{srs.primary_persona?.name}</p>
                <p className="text-[11px] text-slate-400">{srs.primary_persona?.context}</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-400">Primary Goal:</span>
                <p className="text-slate-200">{srs.primary_persona?.primary_goal}</p>
                <span className="text-[10px] font-bold uppercase text-rose-400 block pt-1">Core Frustration:</span>
                <p className="text-slate-300 text-[11px]">{srs.primary_persona?.core_frustration}</p>
              </div>
            </div>
          </div>

          {/* Functional Requirements Table */}
          <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 font-mono">
              <Layers className="w-4 h-4 text-cyan-400" /> Functional Requirements Matrix
            </span>

            <div className="grid grid-cols-1 gap-3">
              {srs.functional_requirements?.map((fr) => (
                <div key={fr.id} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                      {fr.id}: {fr.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 italic">"{fr.user_story}"</p>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Acceptance Criteria:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {fr.acceptance_criteria?.map((ac, idx) => (
                        <li key={idx}>{ac}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Blueprint & Non-Functional Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Architecture */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Lean Tech Stack Blueprint
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-teal-400" /> Frontend:</span>
                  <span className="font-mono text-white font-semibold text-[11px]">{srs.architecture_blueprint?.frontend}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-cyan-400" /> Backend:</span>
                  <span className="font-mono text-white font-semibold text-[11px]">{srs.architecture_blueprint?.backend}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-emerald-400" /> Database:</span>
                  <span className="font-mono text-white font-semibold text-[11px]">{srs.architecture_blueprint?.database}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Offline / Sync:</span>
                  <span className="font-mono text-white font-semibold text-[11px] truncate max-w-[50%]">{srs.architecture_blueprint?.offline_sync_strategy}</span>
                </div>
              </div>
            </div>

            {/* Non-Functional Constraints */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Non-Functional Constraints
              </span>
              <div className="space-y-2 text-xs">
                {srs.non_functional_requirements?.map((nfr) => (
                  <div key={nfr.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-teal-300">{nfr.id}: {nfr.category}</span>
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.2 rounded border border-amber-500/20">{nfr.metric}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{nfr.requirement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
