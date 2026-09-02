"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Folder, Clock, Sparkles, Key, History, RotateCcw, Copy, Share2, Camera, ShieldAlert } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
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
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [newSnapshotLabel, setNewSnapshotLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
    }
  }, [isOpen, currentSessionId]);

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await sessionService.createSession(undefined, newProjectName.trim() || undefined);
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

  const handleCreateSnapshot = async () => {
    if (!newSnapshotLabel.trim() || isCreatingSnapshot || !currentSessionId) return;
    setIsCreatingSnapshot(true);
    try {
      await sessionService.createSnapshot(currentSessionId, newSnapshotLabel.trim(), 1);
      setNewSnapshotLabel("");
      const updatedSnaps = await sessionService.listSnapshots(currentSessionId);
      setSnapshots(updatedSnaps);
    } catch (err: any) {
      alert("Failed to save snapshot: " + err.message);
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
        alert("Project room code not found. Check with your groupmate.");
      }
    } catch (err: any) {
      alert(err.message || "Invalid room code.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleRestoreSnapshot = async (snapId: number) => {
    if (!confirm("Restore this prior milestone checkpoint? Your active session state will be updated.")) return;
    try {
      await sessionService.restoreSnapshot(currentSessionId, snapId);
      onSelectSession(currentSessionId);
      onClose();
    } catch (err: any) {
      alert("Failed to restore snapshot: " + err.message);
    }
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
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab("SESSIONS")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "SESSIONS"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Folder className="w-3.5 h-3.5" /> All Sessions ({safeSessions.length})
          </button>

          <button
            onClick={() => setActiveTab("JOIN")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "JOIN"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Join Room Code
          </button>

          <button
            onClick={() => setActiveTab("SNAPSHOTS")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "SNAPSHOTS"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Snapshots ({snapshots.length})
          </button>
        </div>

        {/* Tab 1: Sessions List & Create */}
        {activeTab === "SESSIONS" && (
          <div className="space-y-5">
            {/* Create new session */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Start New Venture Project
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Iloilo Cold-Chain MSME Validator"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <Button variant="primary" size="sm" onClick={handleCreate} isLoading={isCreating} leftIcon={<Plus className="w-4 h-4" />}>
                  Create
                </Button>
              </div>
            </div>

            {/* Existing list */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Persistent Database Sessions
              </h4>

              {isLoading ? (
                <div className="py-8 text-center text-sm text-slate-500">Loading database sessions...</div>
              ) : safeSessions.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">No sessions found. Create one above to begin!</div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {safeSessions.map((s) => {
                    const isCurrent = s.session_id === currentSessionId;
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
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? "bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                        }`}
                      >
                        <div
                          onClick={() => {
                            onSelectSession(s.session_id);
                            onClose();
                          }}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div className={`p-2.5 rounded-xl ${isCurrent ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"}`}>
                            <Folder className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {s.project_name || "Venture Project"}
                              </span>
                              {isCurrent && <Badge variant="cyan" size="sm">Active</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                              <span>ID: {s.session_id}</span>
                              <span>•</span>
                              <span>{s.updated_at ? new Date(s.updated_at).toLocaleDateString() : "Recent"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {s.share_code && (
                            <button
                              onClick={() => handleCopyCode(s.share_code!)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono text-cyan-300 hover:border-cyan-400 flex items-center gap-1.5"
                              title="Copy room share code for groupmates"
                            >
                              <Share2 className="w-3 h-3 text-cyan-400" />
                              <span>{copiedCode === s.share_code ? "Copied!" : s.share_code}</span>
                            </button>
                          )}
                          <Badge variant={completedCount > 0 ? "emerald" : "slate"} size="sm">
                            {completedCount}/5 Phases
                          </Badge>
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
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" /> Join Groupmate Workspace
              </h4>
              <p className="text-xs text-slate-300">
                Enter the 6-character room code (e.g. <code className="text-cyan-300 font-mono">RATCH-AGRI</code>) provided by your project teammate.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="e.g. RATCH-XXXX"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 uppercase tracking-widest focus:outline-none focus:border-emerald-500"
              />
              <Button
                variant="emerald"
                size="md"
                onClick={handleJoinByCode}
                isLoading={isJoining}
                disabled={!roomCodeInput.trim()}
              >
                Join Project
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Milestone Snapshots */}
        {activeTab === "SNAPSHOTS" && (
          <div className="space-y-5">
            {/* Save new checkpoint */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-purple-400" /> Capture New Milestone Checkpoint
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Before Market Field Validation / Post-Interviews"
                  value={newSnapshotLabel}
                  onChange={(e) => setNewSnapshotLabel(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCreateSnapshot}
                  isLoading={isCreatingSnapshot}
                  disabled={!newSnapshotLabel.trim()}
                  leftIcon={<Camera className="w-4 h-4 text-purple-400" />}
                >
                  Save Checkpoint
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
              <strong>Milestone Snapshots:</strong> Frozen checkpoint copies of this venture before major phase advances or pivots. You can restore any milestone with 1 click if customer evidence disproves an assumption.
            </div>

            {snapshots.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No snapshots saved for this session yet. Save one above to create a milestone backup!
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{snap.label}</span>
                        <Badge variant="purple" size="sm">Phase {snap.phase_number}</Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(snap.created_at).toLocaleString()}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreSnapshot(snap.id)}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
                    >
                      Restore State
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
