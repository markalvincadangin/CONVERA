"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bookmark,
  History,
  Hash,
  RotateCcw,
  Trash2,
  Plus,
  Check,
  Copy,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/common/ToastProvider";
import {
  researchSessionService,
  ResearchSessionCheckpointRecord,
} from "@/services/researchSessionService";

interface SessionCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionName: string;
  currentStageId?: string;
  onRestored?: (restoredStageId: string) => void;
}

export const SessionCheckpointModal: React.FC<SessionCheckpointModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  sessionName,
  currentStageId = "scouting",
  onRestored,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"history" | "create">("history");
  const [checkpoints, setCheckpoints] = useState<ResearchSessionCheckpointRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Form State
  const [checkpointName, setCheckpointName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchCheckpoints = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const records = await researchSessionService.listCheckpoints(sessionId);
      setCheckpoints(records);
    } catch (err: unknown) {
      console.warn("Could not load checkpoints:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isOpen) {
      fetchCheckpoints();
      setCheckpointName(`Milestone - ${new Date().toLocaleDateString()}`);
      setDescription("");
    }
  }, [isOpen, fetchCheckpoints]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkpointName.trim()) {
      toast.warning("Please provide a milestone name.", "Missing Name");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await researchSessionService.createCheckpoint(sessionId, {
        checkpoint_name: checkpointName.trim(),
        description: description.trim() || undefined,
        created_by: "Lead Researcher",
      });
      toast.success(
        `Checkpoint "${created.checkpoint_name}" created with SHA-256 integrity seal.`,
        "Checkpoint Created"
      );
      setCheckpoints((prev) => [created, ...prev]);
      setActiveTab("history");
      setDescription("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Creation failed";
      toast.error(message, "Error Creating Checkpoint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async (checkpoint: ResearchSessionCheckpointRecord) => {
    const confirmRestore = window.confirm(
      `Are you sure you want to rollback to checkpoint "${checkpoint.checkpoint_name}"? Active state will revert to this milestone.`
    );
    if (!confirmRestore) return;

    setRestoringId(checkpoint.checkpoint_id);
    try {
      const result = await researchSessionService.restoreCheckpoint(
        sessionId,
        checkpoint.checkpoint_id
      );
      toast.success(
        `Session rolled back to milestone "${checkpoint.checkpoint_name}". State hash verified.`,
        "State Restored"
      );
      if (onRestored) {
        onRestored(result.current_stage_id);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Restore failed";
      toast.error(message, "Restore Failed");
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async (checkpointId: string, name: string) => {
    const confirmDelete = window.confirm(
      `Delete milestone checkpoint "${name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await researchSessionService.deleteCheckpoint(sessionId, checkpointId);
      setCheckpoints((prev) => prev.filter((c) => c.checkpoint_id !== checkpointId));
      toast.success(`Checkpoint "${name}" removed.`, "Deleted");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message, "Error");
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success("Cryptographic SHA-256 state hash copied.", "Copied");
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-white">
                  Milestone Checkpoints & Rollback
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  SDD-021
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {sessionName} <span className="text-slate-600">({sessionId})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 flex border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-3 text-xs font-medium border-b-2 flex items-center space-x-2 transition ${
              activeTab === "history"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Checkpoint History ({checkpoints.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-3 px-3 text-xs font-medium border-b-2 flex items-center space-x-2 transition ${
              activeTab === "create"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Capture Checkpoint</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "history" ? (
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading milestone checkpoints...
                </div>
              ) : checkpoints.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-300">
                      No Checkpoints Captured Yet
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Capture an immutable state snapshot before advancing through
                      evaluation gates or testing competing hypotheses.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium pt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Capture First Checkpoint</span>
                  </button>
                </div>
              ) : (
                checkpoints.map((chk) => (
                  <div
                    key={chk.checkpoint_id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-white">
                            {chk.checkpoint_name}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {chk.stage_id}
                          </span>
                        </div>
                        {chk.description && (
                          <p className="text-xs text-slate-400 mt-1">
                            {chk.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRestore(chk)}
                          disabled={restoringId === chk.checkpoint_id}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1 transition disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>
                            {restoringId === chk.checkpoint_id ? "Restoring..." : "Restore"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(chk.checkpoint_id, chk.checkpoint_name)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete checkpoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(chk.created_at).toLocaleString()}</span>
                        </span>
                        <span>by {chk.created_by}</span>
                      </div>

                      <button
                        onClick={() => handleCopyHash(chk.state_hash)}
                        className="flex items-center space-x-1 font-mono text-[10px] text-slate-400 hover:text-cyan-400 transition"
                        title="Click to copy state SHA-256 digest"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[120px]">
                          {chk.state_hash.slice(0, 12)}...
                        </span>
                        {copiedHash === chk.state_hash ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Checkpoint Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={checkpointName}
                  onChange={(e) => setCheckpointName(e.target.value)}
                  placeholder="e.g. Pre-Gate 2 Literature Synthesis Complete"
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Notes & Rationale (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Explain why this milestone snapshot was taken (e.g., cleared Gate 1 with 14 empirical papers shortlisted)..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deterministic SHA-256 Provenance</span>
                </div>
                <p>
                  Captures active stage ({currentStageId}), all literature matrix entries,
                  evaluated concepts, feasibility criteria, and critique reports into an
                  immutable verification record.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Sealing Snapshot..." : "Save Checkpoint"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
