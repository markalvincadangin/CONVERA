"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Folder,
  Sparkles,
  Key,
  History,
  Share2,
  Edit2,
  Trash2,
  X,
  Lock,
  Zap,
  BookOpen,
  GraduationCap,
  Compass,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Badge } from "@/components/common/Badge";
import { sessionService, SessionSnapshot } from "@/services/sessionService";
import { SessionMeta } from "@/lib/types";

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  isOpen,
  onClose,
  currentSessionId,
  onSelectSession,
}) => {
  const [activeTab, setActiveTab] = useState<"SESSIONS" | "JOIN" | "SNAPSHOTS">("SESSIONS");
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [snapshots, setSnapshots] = useState<SessionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedFramework, setSelectedFramework] = useState<string>("INNOVATION");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [newSnapshotLabel, setNewSnapshotLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Inline Rename State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const toast = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchSessionsAndSnapshots = async () => {
    setIsLoading(true);
    try {
      const list = await sessionService.listSessions();
      setSessions(Array.isArray(list) ? list : []);
      if (currentSessionId) {
        const snaps = await sessionService.listSnapshots(currentSessionId);
        setSnapshots(Array.isArray(snaps) ? snaps : []);
      }
    } catch (err) {
      console.error(err);
      setSessions([]);
      setSnapshots([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessionsAndSnapshots();
      setEditingSessionId(null);
    }
  }, [isOpen, currentSessionId]);

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await sessionService.createSession(undefined, newProjectName.trim() || undefined, selectedFramework);
      if (res && res.session_id) {
        onSelectSession(res.session_id);
      }
      setNewProjectName("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartRename = (s: SessionMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(s.session_id);
    setEditingName(s.project_name || "Venture Project");
  };

  const handleSaveRename = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingName.trim() || isRenaming) return;
    setIsRenaming(true);
    try {
      await sessionService.renameSession(sessionId, editingName.trim());
      setEditingSessionId(null);
      await fetchSessionsAndSnapshots();
    } catch (err: any) {
      toast.error(err?.message || "Failed to rename session", "Rename Error");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const executeDeleteSession = async (sessionId: string, name: string) => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    try {
      await sessionService.deleteSession(sessionId);
      toast.success(`Workspace '${name}' permanently deleted.`, "Workspace Deleted");
      await fetchSessionsAndSnapshots();
      if (sessionId === currentSessionId && sessions.length > 1) {
        const remaining = sessions.filter((s) => s.session_id !== sessionId);
        if (remaining.length > 0) {
          onSelectSession(remaining[0].session_id);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete session", "Delete Error");
    }
  };

  const handleDeleteSession = (sessionId: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: "Delete Workspace",
      message: `Are you sure you want to permanently delete workspace '${name}'? All un-snapshotted data will be lost.`,
      confirmText: "Delete Workspace",
      variant: "danger",
      onConfirm: () => executeDeleteSession(sessionId, name),
    });
  };

  const handleCreateSnapshot = async () => {
    if (!newSnapshotLabel.trim() || isCreatingSnapshot || !currentSessionId) return;
    setIsCreatingSnapshot(true);
    try {
      await sessionService.createSnapshot(currentSessionId, newSnapshotLabel.trim(), 1);
      setNewSnapshotLabel("");
      const updatedSnaps = await sessionService.listSnapshots(currentSessionId);
      setSnapshots(updatedSnaps);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save snapshot", "Snapshot Error");
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!roomCodeInput.trim() || isJoining) return;
    setIsJoining(true);
    try {
      const proj = await sessionService.getProjectByCode(roomCodeInput.trim());
      if (proj && proj.session_id) {
        onSelectSession(proj.session_id);
        setRoomCodeInput("");
        onClose();
      } else {
        toast.error("Project room code not found. Please verify with your team.", "Join Room Failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Invalid room code", "Join Room Error");
    } finally {
      setIsJoining(false);
    }
  };

  const executeRestoreSnapshot = async (snapId: number) => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    try {
      await sessionService.restoreSnapshot(currentSessionId, snapId);
      toast.success("Milestone checkpoint successfully restored.", "Snapshot Restored");
      onSelectSession(currentSessionId);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore snapshot", "Restore Error");
    }
  };

  const handleRestoreSnapshot = (snapId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Restore Milestone Checkpoint",
      message: "Are you sure you want to restore this milestone checkpoint? Your active session state will be safely replaced with this snapshot.",
      confirmText: "Restore Checkpoint",
      variant: "warning",
      onConfirm: () => executeRestoreSnapshot(snapId),
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const safeSessions = Array.isArray(sessions) ? sessions : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Venture Workspace & Team Hub" maxWidth="2xl">
      <div className="space-y-6">
        {/* Sub-navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] sm:text-xs">
          <button
            onClick={() => setActiveTab("SESSIONS")}
            className={`py-2 px-1.5 sm:px-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
              activeTab === "SESSIONS"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Folder className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Workspaces ({safeSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("JOIN")}
            className={`py-2 px-1.5 sm:px-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
              activeTab === "JOIN"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Join Code</span>
          </button>

          <button
            onClick={() => setActiveTab("SNAPSHOTS")}
            className={`py-2 px-1.5 sm:px-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
              activeTab === "SNAPSHOTS"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Snapshots ({snapshots.length})</span>
          </button>
        </div>

        {/* Tab 1: Sessions List & Create */}
        {activeTab === "SESSIONS" && (
          <div className="space-y-5">
            {/* Create new session */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Start New Venture Workspace
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. Iloilo Bulb Onion Cold-Chain Validator"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                  className="w-full sm:flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
                />
                <Button variant="primary" size="sm" className="w-full sm:w-auto justify-center shrink-0" onClick={handleCreate} isLoading={isCreating} leftIcon={<Plus className="w-4 h-4" />}>
                  Create Workspace
                </Button>
              </div>
            </div>

            {/* Existing list */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Persistent Database Workspaces
              </h4>

              {isLoading ? (
                <div className="py-8 text-center text-sm text-slate-500">Loading workspaces...</div>
              ) : safeSessions.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">No workspaces found. Create one above to begin!</div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                  {safeSessions.map((s) => {
                    const isCurrent = s.session_id === currentSessionId;
                    const isEditing = editingSessionId === s.session_id;
                    const completedCount = [
                      s.phase1_complete,
                      s.phase2_complete,
                      s.phase3_complete,
                      s.phase4_complete,
                      s.phase5_complete,
                    ].filter(Boolean).length;

                    return (
                      <div
                        key={s.session_id}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 ${
                          isCurrent
                            ? "bg-slate-900/90 border-cyan-500/40 ring-1 ring-cyan-500/30 shadow-md shadow-cyan-500/5"
                            : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40"
                        }`}
                      >
                        {/* Left: Folder Icon & Name / Input */}
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={`Select session ${s.project_name || s.session_id}`}
                          onClick={() => {
                            if (!isEditing) {
                              onSelectSession(s.session_id);
                              onClose();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (!isEditing && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault();
                              onSelectSession(s.session_id);
                              onClose();
                            }
                          }}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg"
                        >
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              isCurrent ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}
                          >
                            <Folder className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveRename(s.session_id, e as any);
                                    if (e.key === "Escape") handleCancelRename(e as any);
                                  }}
                                  autoFocus
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500 text-xs text-white focus:outline-none w-full max-w-xs font-semibold"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => handleSaveRename(s.session_id, e)}
                                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                  title="Save Rename"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelRename}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-white truncate max-w-xs">
                                  {s.project_name || "Venture Project"}
                                </span>
                                {isCurrent && <Badge variant="cyan" size="sm">Active</Badge>}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                              <span>ID: {s.session_id}</span>
                              <span>•</span>
                              <span>{s.updated_at ? new Date(s.updated_at).toLocaleDateString() : "Recent"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions & Metadata */}
                        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-0 shrink-0">
                          {s.share_code && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(s.share_code!);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 hover:border-cyan-400/50 flex items-center gap-1.5 shadow-sm"
                              title="Copy room code to share with groupmates"
                            >
                              <Share2 className="w-3 h-3 text-cyan-400" />
                              <span>{copiedCode === s.share_code ? "Copied!" : s.share_code}</span>
                            </button>
                          )}

                          <Badge variant={completedCount > 0 ? "emerald" : "slate"} size="sm">
                            {completedCount}/5 Gates
                          </Badge>

                          {/* Rename Button */}
                          {!isEditing && (
                            <button
                              onClick={(e) => handleStartRename(s, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
                              title="Rename Workspace"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Button (disabled for currently active if single session) */}
                          {safeSessions.length > 1 && (
                            <button
                              onClick={(e) => handleDeleteSession(s.session_id, s.project_name || s.session_id, e)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                              title="Delete Workspace"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Join by Room Code */}
        {activeTab === "JOIN" && (
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Key className="w-4 h-4 text-emerald-400" /> Join Groupmate Workspace
              </h4>
              <p className="text-xs text-slate-300">
                Enter the 6-character room code (e.g. <code className="text-cyan-300 font-mono">RATCH-GPPZ</code>) provided by your project team lead.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="RATCH-XXXX"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJoinByCode();
                }}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-mono uppercase tracking-widest placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <Button variant="emerald" size="sm" onClick={handleJoinByCode} isLoading={isJoining}>
                Join Room
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Milestones & Snapshots */}
        {activeTab === "SNAPSHOTS" && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <History className="w-3.5 h-3.5 text-purple-400" /> Save Milestone Checkpoint
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Post-Phase 2 Screening Approved"
                  value={newSnapshotLabel}
                  onChange={(e) => setNewSnapshotLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateSnapshot();
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-inner"
                />
                <Button variant="primary" size="sm" onClick={handleCreateSnapshot} isLoading={isCreatingSnapshot}>
                  Save Checkpoint
                </Button>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Historical Checkpoints for Active Session
              </h4>

              {snapshots.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No snapshots saved yet for this workspace. Save a checkpoint before major pivots or trial interviews!
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{snap.label}</span>
                          <Badge variant="purple" size="sm">Phase {snap.phase_number}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Saved: {new Date(snap.created_at).toLocaleString()}
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRestoreSnapshot(snap.id)}
                      >
                        Rollback
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    
      {/* Session Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </Modal>
  );
};
