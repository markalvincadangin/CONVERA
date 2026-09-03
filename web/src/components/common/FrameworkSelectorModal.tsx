"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Compass,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { FrameworkSummary, SessionState } from "@/lib/types";
import { frameworkService } from "@/services/frameworkService";

interface FrameworkSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionState | null;
  onFrameworkChanged: (updatedSession: SessionState) => void;
}

export const FrameworkSelectorModal: React.FC<FrameworkSelectorModalProps> = ({
  isOpen,
  onClose,
  session,
  onFrameworkChanged,
}) => {
  const [frameworks, setFrameworks] = useState<FrameworkSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetTransitionFw, setTargetTransitionFw] = useState<FrameworkSummary | null>(null);

  const activeFrameworkId = session?.framework_id?.toUpperCase() || "INNOVATION";

  useEffect(() => {
    if (isOpen) {
      loadFrameworks();
    }
  }, [isOpen]);

  const loadFrameworks = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await frameworkService.listFrameworks();
      setFrameworks(list);
    } catch (err: any) {
      setError("Failed to load framework specifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateTransition = (fw: FrameworkSummary) => {
    if (fw.id === activeFrameworkId) {
      onClose();
      return;
    }
    setTargetTransitionFw(fw);
  };

  const handleConfirmTransition = async () => {
    if (!targetTransitionFw || !session?.session_id) return;
    const targetId = targetTransitionFw.id;

    setSwitchingId(targetId);
    setError(null);
    try {
      const res = await frameworkService.switchFramework(session.session_id, targetId);
      if (res?.state) {
        onFrameworkChanged(res.state);
      }
      setTargetTransitionFw(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to switch framework.");
    } finally {
      setSwitchingId(null);
    }
  };

  const getFrameworkIcon = (cat: string) => {
    switch (cat) {
      case "INNOVATION":
        return <Zap className="w-5 h-5 text-blue-400" />;
      case "RESEARCH":
        return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case "CAPSTONE":
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case "PRODUCT":
        return <Compass className="w-5 h-5 text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Methodology Framework Engine"
      maxWidth="2xl"
    >
      <div className="space-y-4">
                {targetTransitionFw && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-2xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Controlled Methodology Transition
                </h4>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                {activeFrameworkId} → {targetTransitionFw.id}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are switching your workspace methodology to <strong className="text-white">{targetTransitionFw.name}</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-emerald-400 font-bold font-mono text-[10px] uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Knowledge Intact
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Problem Bank records, claims, citations, and assumptions remain 100% persistent.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-indigo-400 font-bold font-mono text-[10px] uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Progress Isolated
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Current milestone progress is saved. New framework gates evaluate under its own criteria.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-amber-400 font-bold font-mono text-[10px] uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Snapshot Saved
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  An automatic rollback checkpoint will be created before activation.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <Button size="sm" variant="ghost" onClick={() => setTargetTransitionFw(null)} disabled={Boolean(switchingId)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleConfirmTransition} isLoading={Boolean(switchingId)} leftIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Confirm & Switch Methodology
              </Button>
            </div>
          </div>
        )}

        {/* Header Description */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              CONVERA Concept Development Standard (CCDS)
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Knowledge persists independently of workflow.</strong> Switch your project methodology framework at any time without losing underlying problems, claims, evidence, or decision records.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Spinner size="md" />
            <span className="text-xs font-medium">Loading framework specifications...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {frameworks.map((fw) => {
              const isSelected = fw.id === activeFrameworkId;
              const isSwitching = switchingId === fw.id;

              return (
                <div
                  key={fw.id}
                  onClick={() => !isSwitching && handleInitiateTransition(fw)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? "bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div>
                    {/* Top Row: Category + Active Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                          {getFrameworkIcon(fw.category)}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                          {fw.category}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          <CheckCircle2 className="w-3 h-3 text-blue-400" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">v{fw.version}</span>
                      )}
                    </div>

                    {/* Framework Name */}
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mb-1">
                      {fw.name}
                    </h3>

                    {/* Tagline */}
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {fw.tagline}
                    </p>
                  </div>

                  {/* Bottom Stats & Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-3 text-slate-400 font-mono">
                      <span>
                        <strong className="text-slate-200">{fw.stage_count}</strong> Stages
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-slate-200">{fw.gate_count}</strong> Gates
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant={isSelected ? "secondary" : "ghost"}
                      disabled={isSwitching}
                      className={`text-xs px-2.5 py-1 h-auto ${
                        isSelected ? "bg-blue-600/20 text-blue-300 hover:bg-blue-600/30" : "text-slate-400 group-hover:text-white"
                      }`}
                    >
                      {isSwitching ? (
                        <Spinner size="sm" />
                      ) : isSelected ? (
                        "Selected"
                      ) : (
                        <span className="flex items-center gap-1">
                          Switch <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Data Loss on Framework Switch</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
