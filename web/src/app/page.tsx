"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navbar,
  PipelineStepper,
  SessionManager,
  CheatsheetDrawer,
  HelpCenterModal,
  PresentationModal,
} from "@/components/layout";
import { WorkspaceResolver } from "@/components/frameworks/WorkspaceRegistry";
import { IntelligenceScorecardDrawer } from "@/components/knowledge/IntelligenceScorecardDrawer";
import { TraceabilityDrawer } from "@/components/knowledge/TraceabilityDrawer";
import { useToast } from "@/components/common/ToastProvider";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { Card } from "@/components/common/Card";
import { MethodologyHudCard } from "@/components/common/MethodologyHudCard";
import { ResearchCockpit } from "@/components/research/cockpit";
import { CommandPaletteModal } from "@/components/common/CommandPaletteModal";
import { SessionState, ProblemRecord } from "@/lib/types";
import { sessionService } from "@/services/sessionService";
import { problemService } from "@/services/problemService";
import {
  SessionResumeBanner,
  ResearchSessionDrawer,
  SessionCheckpointModal,
} from "@/components/research/sessions";
import {
  researchSessionService,
  ResearchSessionSummary,
} from "@/services/researchSessionService";
import {
  Download,
  Copy,
  Check,
  ServerCrash,
  RefreshCw,
  PlusCircle,
} from "lucide-react";

export default function Home() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [activePhase, setActivePhase] = useState<number>(0); // 0 = Problem Bank, 1-5 = Phases, 6 = Studio
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Modals
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState(false);
  const toast = useToast();
  const [phase2SelectedIds, setPhase2SelectedIds] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportedMarkdown, setExportedMarkdown] = useState("");
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // SDD-021 Research Session Persistence States
  const [isResearchDrawerOpen, setIsResearchDrawerOpen] = useState(false);
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [checkpointSessionId, setCheckpointSessionId] = useState("");
  const [checkpointSessionName, setCheckpointSessionName] = useState("");
  const [resumeSummary, setResumeSummary] = useState<ResearchSessionSummary | null>(null);

  // Initialize or fetch latest session from backend
  const initApp = async () => {
    setIsLoadingSession(true);
    setConnectionError(false);
    try {
      const activeResId = researchSessionService.getActiveSessionId();
      let activeSess: SessionState | null = null;

      // 1. Try restoring from active research session if present
      if (activeResId) {
        try {
          const resPayload = await researchSessionService.resumeSession(activeResId);
          activeSess = resPayload.session as unknown as SessionState;
          setSession(activeSess);
          setResumeSummary(resPayload.summary);
          setActivePhase(resPayload.summary.stage_index);
        } catch (e) {
          console.warn("Could not resume saved research session:", e);
        }
      }

      // 2. If not restored, fetch latest from session service
      if (!activeSess) {
        const sessions = await sessionService.listSessions();
        if (sessions && sessions.length > 0) {
          const latestSessionId = sessions[0].session_id;
          activeSess = await sessionService.getSession(latestSessionId);
        } else {
          const newSession = await sessionService.createSession(
            undefined,
            "Iloilo Technopreneurship Project"
          );
          activeSess = newSession.state;
        }
        setSession(activeSess);

        // Turnkey hydration via research session resume endpoint
        if (activeSess.session_id && !activeSess.session_id.startsWith("offline_")) {
          try {
            const resPayload = await researchSessionService.resumeSession(activeSess.session_id);
            setResumeSummary(resPayload.summary);
            setActivePhase(resPayload.summary.stage_index);
          } catch {
            // Fallback stage resolution if research resume unavailable
            if (activeSess.phase4_complete) {
              setActivePhase(5);
            } else if (activeSess.phase3_complete) {
              setActivePhase(4);
            } else if (activeSess.phase2_complete || activeSess.phase3_problem) {
              setActivePhase(3);
            } else if (activeSess.phase1_complete) {
              setActivePhase(2);
            }
          }
        }
      }

      // Fetch problems for health meter and AI hints
      if (activeSess) {
        try {
          const probList = await problemService.listProblems({
            project_id: activeSess.project_id || undefined,
          });
          setProblems(probList);
        } catch (pErr) {
          console.warn("Could not load problems list:", pErr);
        }
      }
    } catch (err: unknown) {
      console.warn("Backend unavailable, loading local fallback session:", err);
      setConnectionError(true);
      const offlineId = "offline_" + Date.now();
      setSession({
        session_id: offlineId,
        project_name: "Iloilo Venture Project (Local Mode)",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phase1_complete: false,
        phase2_complete: false,
        phase3_complete: false,
        phase4_complete: false,
        phase5_complete: false,
      });
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const handleSelectPhase = (phase: number) => {
    setActivePhase(phase);
    if (session?.session_id && !session.session_id.startsWith("offline_")) {
      const stageMap = [
        "scouting",
        "contextualization",
        "matrix",
        "artifact_design",
        "evaluation",
        "feasibility",
      ];
      const targetStage = stageMap[phase] || "scouting";
      const pct = Math.round(((phase + 1) / 6.0) * 100);
      researchSessionService
        .syncStage(session.session_id, {
          stage_id: targetStage,
          stage_completion_pct: pct,
        })
        .then((res) => {
          setResumeSummary((prev) =>
            prev
              ? {
                  ...prev,
                  current_stage_id: res.current_stage_id,
                  stage_completion_pct: res.stage_completion_pct,
                  stage_index: phase,
                }
              : null
          );
        })
        .catch((err) => {
          console.warn("Failed to sync stage to backend:", err);
        });
    }
  };

  const handleResumeResearchSession = async (sessionId: string) => {
    setIsLoadingSession(true);
    try {
      const payload = await researchSessionService.resumeSession(sessionId);
      setSession(payload.session as unknown as SessionState);
      setResumeSummary(payload.summary);
      setActivePhase(payload.summary.stage_index);
      const probList = await problemService.listProblems({
        project_id: payload.summary.project_id || undefined,
      });
      setProblems(probList);
      toast.success(
        `Resumed research initiative "${payload.summary.project_name}" at ${payload.summary.current_stage_name}.`,
        "Session Resumed"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resume session";
      toast.error(msg, "Error Resuming Session");
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleUpdateSession = (newState: SessionState) => {
    setSession(newState);
    if (newState?.session_id && !newState.session_id.startsWith("offline_")) {
      sessionService.updateSession(newState.session_id, newState).catch((err) => {
        console.warn("Failed to persist session update to backend:", err);
      });
    }
  };

  const handleSelectSession = async (selectedSessionId: string) => {
    setIsLoadingSession(true);
    try {
      const fullState = await sessionService.getSession(selectedSessionId);
      setSession(fullState);
      const probList = await problemService.listProblems({
        project_id: fullState.project_id || undefined,
      });
      setProblems(probList);

      if (typeof window !== "undefined") {
        try {
          const savedPhase = localStorage.getItem(`convera_active_phase_${selectedSessionId}`);
          if (savedPhase !== null && !isNaN(Number(savedPhase))) {
            setActivePhase(Number(savedPhase));
          } else {
            setActivePhase(0);
          }
        } catch {
          setActivePhase(0);
        }
      } else {
        setActivePhase(0);
      }
      setIsSessionManagerOpen(false);
    } catch (err) {
      console.error("Failed to load selected session:", err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleCreateOfflineSession = () => {
    const id = "session_" + Date.now();
    setSession({
      session_id: id,
      project_name: "New Technopreneurship Venture",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setActivePhase(0);
    setConnectionError(false);
  };

  const handleExportDossier = async () => {
    if (!session) return;
    setIsExporting(true);
    try {
      const res = await sessionService.exportDossier(session.session_id);
      setExportedMarkdown(res.markdown);
      setIsExportModalOpen(true);
    } catch (err) {
      const md = [
        `# ${session.project_name || "Iloilo Venture Project"} - Venture Dossier`,
        `**Session ID:** \`${session.session_id}\``,
        `**Exported:** ${new Date().toLocaleString()}`,
        "\n---",
        "## Phase 1: Problem Landscape Discovery",
        session.phase1_response || "*Not completed yet.*",
        "\n---",
        "## Phase 2: Problem Screening & Shortlisting Matrix",
        session.phase2_response || "*Not completed yet.*",
        "\n---",
        "## Phase 3: Socratic Mom Test Validation Dossier",
        `**Target Problem:** ${session.phase3_problem || "N/A"}\n`,
        session.phase3_response || "*Not completed yet.*",
        "\n---",
        "## Phase 4: Solution Ideation & SVB Canvas",
        session.phase4_response || "*Not completed yet.*",
        "\n---",
        "## Phase 5: MVP Empirical Validation Audit",
        session.phase5_response || "*Not completed yet.*",
      ].join("\n\n");

      setExportedMarkdown(md);
      setIsExportModalOpen(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(exportedMarkdown);
    setCopiedDossier(true);
    toast.success("Validation Dossier markdown copied to clipboard!", "Copied");
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!session) return;
    const element = document.createElement("a");
    const file = new Blob([exportedMarkdown], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `CONVERA_Master_Dossier_${session.session_id}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendToStage = (stageNumber: number, selectedIds: string[]) => {
    setPhase2SelectedIds(selectedIds);
    if (selectedIds.length > 0 && session) {
      const selectedProb = problems.find((p) => p.id === selectedIds[0]);
      if (selectedProb) {
        handleUpdateSession({
          ...session,
          problem_statement: selectedProb.problem_statement,
          phase3_problem: selectedProb.problem_statement,
        });
      }
    }
    setActivePhase(stageNumber);
  };

  const handleSendToPhase2 = (selectedIds: string[]) => {
    handleSendToStage(2, selectedIds);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        session={session}
        onOpenSessionManager={() => setIsResearchDrawerOpen(true)}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onExportDossier={handleExportDossier}
        isExporting={isExporting}
        onOpenScorecard={() => setIsScorecardOpen(true)}
        onOpenTraceability={() => setIsTraceabilityOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onFrameworkChanged={handleUpdateSession}
      />

      {/* Interactive Pipeline Timeline Stepper & Integrated Command Deck */}
      <PipelineStepper
        activePhase={activePhase}
        onSelectPhase={handleSelectPhase}
        session={session}
        problems={problems}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">

        {isLoadingSession ? (
          <div className="py-24 flex items-center justify-center">
            <Spinner size="lg" label="Connecting to CONVERA SQLite WAL backend..." />
          </div>
        ) : connectionError && !session ? (
          <div className="py-12 max-w-xl mx-auto space-y-6">
            <Card variant="glass" className="p-8 text-center space-y-5 border-amber-500/40">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <ServerCrash className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Backend Connecting or Offline
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cannot reach the CONVERA backend. Check your connection or server status and try again.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  variant="primary"
                  onClick={initApp}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Retry Connection
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCreateOfflineSession}
                  leftIcon={<PlusCircle className="w-4 h-4 text-cyan-400" />}
                >
                  Start New Session
                </Button>
              </div>
            </Card>
          </div>
        ) : session ? (
          <>
            {/* SDD-021: Research Session Resume & Stepper Banner */}
            <SessionResumeBanner
              sessionName={resumeSummary?.project_name || session.project_name || "Active Initiative"}
              sessionId={session.session_id || ""}
              currentStageId={resumeSummary?.current_stage_id || session.current_stage_id || "scouting"}
              stageCompletionPct={resumeSummary?.stage_completion_pct ?? 0}
              checkpointCount={resumeSummary?.checkpoint_count ?? 0}
              onOpenDrawer={() => setIsResearchDrawerOpen(true)}
              onOpenCheckpoints={() => {
                setCheckpointSessionId(session.session_id || "");
                setCheckpointSessionName(session.project_name || "Active Initiative");
                setIsCheckpointModalOpen(true);
              }}
            />

            <ResearchCockpit
              session={session}
              activeProblemId={session.phase3_problem}
              onRefreshSession={() => {
                if (session.session_id && !session.session_id.startsWith("offline_")) {
                  sessionService
                    .getSession(session.session_id)
                    .then(setSession)
                    .catch(console.warn);
                }
              }}
              onNavigatePhase={handleSelectPhase}
              onOpenScorecard={() => setIsScorecardOpen(true)}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${session.session_id}_${session.framework_id}_${activePhase}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <WorkspaceResolver
                  session={session}
                  problems={problems}
                  activePhase={activePhase}
                  onUpdateSession={handleUpdateSession}
                  onSelectPhase={handleSelectPhase}
                  onSendToPhase2={handleSendToPhase2}
                  onExportDossier={handleExportDossier}
                  phase2SelectedIds={phase2SelectedIds}
                />
              </motion.div>
            </AnimatePresence>
          </>
        ) : null}
      </main>

            {/* Global Spotlight / Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        session={session}
        problems={problems}
        onNavigatePhase={(p) => setActivePhase(p)}
        onOpenScorecard={() => setIsScorecardOpen(true)}
        onOpenTraceability={() => setIsTraceabilityOpen(true)}
        onOpenSessionManager={() => setIsSessionManagerOpen(true)}
        onExportDossier={handleExportDossier}
      />

      {/* Session & Snapshots Manager Modal */}
      <SessionManager
        isOpen={isSessionManagerOpen}
        onClose={() => setIsSessionManagerOpen(false)}
        currentSessionId={session?.session_id || ""}
        onSelectSession={handleSelectSession}
      />

      {/* SDD-021: Research Session Portfolio Drawer */}
      <ResearchSessionDrawer
        isOpen={isResearchDrawerOpen}
        onClose={() => setIsResearchDrawerOpen(false)}
        activeSessionId={session?.session_id}
        onResumeSession={handleResumeResearchSession}
        onOpenCheckpoints={(id, name) => {
          setCheckpointSessionId(id);
          setCheckpointSessionName(name);
          setIsCheckpointModalOpen(true);
        }}
      />

      {/* SDD-021: Session Checkpoint Modal */}
      <SessionCheckpointModal
        isOpen={isCheckpointModalOpen}
        onClose={() => setIsCheckpointModalOpen(false)}
        sessionId={checkpointSessionId || session?.session_id || ""}
        sessionName={checkpointSessionName || session?.project_name || ""}
        currentStageId={resumeSummary?.current_stage_id || session?.current_stage_id}
        onRestored={() => {
          if (session?.session_id) {
            handleResumeResearchSession(session.session_id);
          }
        }}
      />

      {/* Cheatsheet Drawer */}
      <CheatsheetDrawer
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      {/* Help Center Modal */}
      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* 6-Slide Pitch Deck Modal */}
      {session && (
        <PresentationModal
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
          session={session}
        />
      )}

      {/* Export Markdown Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Venture Validation Dossier (Markdown)"
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Exported Markdown containing all completed pipeline phases, evidence audit notes, and decisions.
          </p>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap selection:bg-cyan-500/40">
            {exportedMarkdown}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadMarkdown}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download .md File
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExportModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyMarkdown}
                leftIcon={copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedDossier ? "Copied to Clipboard!" : "Copy Markdown"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    
      {/* Intelligence Scorecard & Confidence Simulator Drawer */}
      <IntelligenceScorecardDrawer
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        projectId={session?.project_id || session?.session_id}
      />

      {/* Requirements Lineage Traceability Drawer */}
      <TraceabilityDrawer
        isOpen={isTraceabilityOpen}
        onClose={() => setIsTraceabilityOpen(false)}
        problemId={session?.phase3_problem}
      />
    </div>
  );
}
