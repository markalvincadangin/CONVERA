"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Plus,
  Play,
  Copy,
  Bookmark,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/common/ToastProvider";
import {
  researchSessionService,
  ResearchSessionSummary,
} from "@/services/researchSessionService";

interface ResearchSessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId?: string;
  onResumeSession: (sessionId: string) => void;
  onOpenCheckpoints: (sessionId: string, sessionName: string) => void;
}

const STAGES = [
  { id: "scouting", label: "A: Scouting", short: "A" },
  { id: "contextualization", label: "B: Context", short: "B" },
  { id: "matrix", label: "C: Matrix", short: "C" },
  { id: "artifact_design", label: "D: Design", short: "D" },
  { id: "evaluation", label: "E: Eval", short: "E" },
  { id: "feasibility", label: "F: Feas", short: "F" },
];

export const ResearchSessionDrawer: React.FC<ResearchSessionDrawerProps> = ({
  isOpen,
  onClose,
  activeSessionId,
  onResumeSession,
  onOpenCheckpoints,
}) => {
  const toast = useToast();
  const [sessions, setSessions] = useState<ResearchSessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [cloningSessionId, setCloningSessionId] = useState<string | null>(null);

  // New session form
  const [newProjectName, setNewProjectName] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newDomain, setNewDomain] = useState("D01");

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await researchSessionService.listSessions(50);
      setSessions(records);
    } catch (err: unknown) {
      console.warn("Failed to load sessions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, loadSessions]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.warning("Please enter a research session name.", "Missing Name");
      return;
    }

    try {
      const created = await researchSessionService.createSession({
        project_name: newProjectName.trim(),
        initial_topic: newTopic.trim() || undefined,
        domain_id: newDomain,
      });
      toast.success(
        `Research session "${created.project_name}" initialized at Stage A.`,
        "Session Created"
      );
      setNewProjectName("");
      setNewTopic("");
      setIsCreating(false);
      await loadSessions();
      onResumeSession(created.session_id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Creation failed";
      toast.error(msg, "Error Creating Session");
    }
  };

  const handleCloneSession = async (session: ResearchSessionSummary) => {
    const defaultCloneName = `${session.project_name} (Fork)`;
    const promptName = window.prompt("Name for the cloned research session:", defaultCloneName);
    if (!promptName || !promptName.trim()) return;

    setCloningSessionId(session.session_id);
    try {
      const cloned = await researchSessionService.cloneSession(session.session_id, {
        new_project_name: promptName.trim(),
        include_literature: true,
      });
      toast.success(
        `Session cloned into "${cloned.project_name}". Active state duplicated.`,
        "Session Cloned"
      );
      await loadSessions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Clone failed";
      toast.error(msg, "Error Cloning Session");
    } finally {
      setCloningSessionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-white">
                  Research Session Portfolio
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {sessions.length} Initiatives
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Persistent DSR research sessions, checkpoints & stage steppers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadSessions}
              disabled={isLoading}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              title="Refresh session list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Active Session:{" "}
            <span className="font-mono text-cyan-400">
              {activeSessionId || "None"}
            </span>
          </span>
          <button
            onClick={() => setIsCreating((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreating ? "Close Form" : "New Research Session"}</span>
          </button>
        </div>

        {/* Create Session Dropdown Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateSession}
            className="p-6 border-b border-slate-800 bg-slate-950/80 space-y-3.5 animate-in fade-in duration-150"
          >
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Initialize New Research Initiative
            </h4>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400">
                Initiative Title <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Autonomous Agent Fault Tolerance Under Partitions"
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400">
                Starting Problem Brief / Observation (Optional)
              </label>
              <textarea
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                rows={2}
                placeholder="Core tension or empirical gap..."
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <label className="text-[11px] text-slate-400">Domain:</label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="D01">D01: Computing Research</option>
                  <option value="D02">D02: AI / Agentic Systems</option>
                  <option value="D03">D03: Health & Bio-informatics</option>
                  <option value="D04">D04: FinTech & Protocols</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Initialize Session</span>
              </button>
            </div>
          </form>
        )}

        {/* Sessions List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading && sessions.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500">
              Loading research sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No research sessions found.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="text-xs text-cyan-400 hover:underline"
              >
                Create your first initiative
              </button>
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.session_id === activeSessionId;
              return (
                <div
                  key={sess.session_id}
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    isActive
                      ? "bg-slate-800/80 border-cyan-500/60 shadow-lg shadow-cyan-950/20"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  {/* Title & Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-white">
                          {sess.project_name}
                        </h4>
                        {isActive && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">{sess.session_id}</span>
                        <span>•</span>
                        <span>{new Date(sess.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onOpenCheckpoints(sess.session_id, sess.project_name)}
                        className="px-2 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1 transition"
                        title="Milestone checkpoints"
                      >
                        <Bookmark className="w-3 h-3 text-cyan-400" />
                        <span>{sess.checkpoint_count}</span>
                      </button>

                      <button
                        onClick={() => handleCloneSession(sess)}
                        disabled={cloningSessionId === sess.session_id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
                        title="Clone research session"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {!isActive && (
                        <button
                          onClick={() => {
                            onResumeSession(sess.session_id);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-1 transition"
                          title="Resume session"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Resume</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Problem Statement */}
                  {sess.active_problem_title && (
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{sess.active_problem_title}</p>
                    </div>
                  )}

                  {/* 6-Stage Stepper Track */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">
                        {sess.current_stage_name}
                      </span>
                      <span className="font-mono text-cyan-400 font-semibold">
                        {sess.stage_completion_pct.toFixed(0)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1">
                      {STAGES.map((stg, i) => {
                        const isCurrent = i === sess.stage_index;
                        const isPast = i < sess.stage_index;
                        return (
                          <div
                            key={stg.id}
                            className={`py-1 text-center rounded text-[10px] font-mono font-bold transition ${
                              isCurrent
                                ? "bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/50"
                                : isPast
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-slate-900 text-slate-600 border border-slate-800"
                            }`}
                            title={stg.label}
                          >
                            {stg.short}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gate Status Chips */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-[10px]">
                    <span className="text-slate-500 font-medium">Gate Status:</span>
                    {[
                      { id: "G1", cleared: sess.gate1_cleared },
                      { id: "G2", cleared: sess.gate2_cleared },
                      { id: "G3", cleared: sess.gate3_cleared },
                      { id: "G4", cleared: sess.gate4_cleared },
                    ].map((gate) => (
                      <span
                        key={gate.id}
                        className={`px-1.5 py-0.5 rounded font-mono ${
                          gate.cleared
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                            : "bg-slate-900 text-slate-500 border border-slate-800"
                        }`}
                      >
                        {gate.id}: {gate.cleared ? "PASS" : "WAIT"}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
