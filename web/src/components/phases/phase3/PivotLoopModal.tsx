"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { AlertTriangle, RotateCcw, Loader2 } from "lucide-react";

interface PivotLoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  problemStatement?: string;
}

export const PivotLoopModal: React.FC<PivotLoopModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  problemStatement,
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed || trimmed.length < 5) {
      setError("Please provide a substantive reason for the pivot (minimum 5 characters).");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(trimmed);
      setReason("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to execute pivot loop.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setError(null);
    setReason("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Execute Pivot Loop (Return to Phase 2)" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-200">Epistemic Pivot Trigger</div>
            <div>
              Executing a Pivot Loop invalidates the active validation path in Phase 3 and transitions the
              session back to Phase 2 for candidate re-screening based on empirical refutation.
            </div>
            {problemStatement && (
              <div className="pt-1 text-[11px] text-slate-400 font-mono line-clamp-2">
                Active problem: {problemStatement}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="pivot-reason" className="block text-xs font-mono font-bold text-slate-300 mb-1.5 uppercase">
            Pivot Rationale & Invalidation Evidence <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="pivot-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Mom Test customer discovery refuted Willingness-to-Pay; economic buyer lacks purchasing authority..."
            rows={4}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition resize-none"
            disabled={isSubmitting}
            autoFocus
          />
          {error && <p className="mt-1 text-xs text-rose-400 font-mono">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || reason.trim().length < 5}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-950/40 border border-amber-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Pivot...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Pivot to Phase 2</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
