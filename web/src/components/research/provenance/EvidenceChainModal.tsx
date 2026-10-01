"use client";

import React, { useEffect } from "react";
import { X, GitBranch, Maximize2 } from "lucide-react";
import { EvidenceChainGraph } from "./EvidenceChainGraph";

interface EvidenceChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionName?: string;
}

export const EvidenceChainModal: React.FC<EvidenceChainModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  sessionName,
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-7xl h-[92vh] rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">
                  Interactive Evidence Chain & Provenance Graph
                </h2>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                  SDD-022
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {sessionName ? `Session: ${sessionName} • ` : ""}
                6-tier epistemic DAG connecting scholarly literature to proposal canvas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Close Modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Graph Canvas */}
        <div className="flex-1 min-h-0 p-3 bg-neutral-950">
          <EvidenceChainGraph sessionId={sessionId} className="h-full" />
        </div>

        {/* Modal Footer: Epistemic Guidance */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-neutral-800 bg-neutral-900/40 text-[11px] text-neutral-500">
          <div className="flex items-center gap-4">
            <span>🖱️ <strong>Drag</strong> background to pan</span>
            <span>🔍 <strong>Scroll</strong> to zoom in/out</span>
            <span>👆 <strong>Click card</strong> to inspect evidence lineage</span>
          </div>
          <div className="text-[10px] font-mono text-neutral-400">
            Articles I & II Epistemic Grounding Standard
          </div>
        </div>
      </div>
    </div>
  );
};
