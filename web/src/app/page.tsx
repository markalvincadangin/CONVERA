"use client";

import React, { useState, useEffect } from "react";
import {
  Navbar,
  PipelineStepper,
  SessionManager,
  CheatsheetDrawer,
  HelpCenterModal,
  PresentationModal,
} from "@/components/layout";
import {
  Phase1View,
  Phase2View,
  Phase3View,
  Phase4View,
  Phase5View,
} from "@/components/phases";
import { ProblemBankView } from "@/components/problem-bank/ProblemBankView";
import { DeliverablesStudio } from "@/components/deliverables/DeliverablesStudio";
import { ResearchWorkspaceView } from "@/components/frameworks/research/ResearchWorkspaceView";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { Card } from "@/components/common/Card";
import { ContextualAiHint } from "@/components/common/ContextualAiHint";
import { SessionState, ProblemRecord } from "@/lib/types";
import { sessionService } from "@/services/sessionService";
import { problemService } from "@/services/problemService";
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
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [phase2SelectedIds, setPhase2SelectedIds] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportedMarkdown, setExportedMarkdown] = useState("");
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize or fetch latest session from backend
  const initApp = async () => {
    setIsLoadingSession(true);
    setConnectionError(false);
    try {
      const sessions = await sessionService.listSessions();
      let activeSess: SessionState;
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

      // Fetch problems for health meter and AI hints
      try {
        const probList = await problemService.listProblems({
          project_id: activeSess.project_id || undefined,
        });
        setProblems(probList);
      } catch (pErr) {
        console.warn("Could not load problems list:", pErr);
      }
    } catch (err: any) {
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

  const handleUpdateSession = (newState: SessionState) => {
    setSession(newState);
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
      setActivePhase(0);
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
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!session) return;
    const element = document.createElement("a");
    const file = new Blob([exportedMarkdown], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `RatchetAI_Dossier_${session.session_id}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendToPhase2 = (selectedIds: string[]) => {
    setPhase2SelectedIds(selectedIds);
    setActivePhase(2);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        session={session}
        onOpenSessionManager={() => setIsSessionManagerOpen(true)}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onExportDossier={handleExportDossier}
        isExporting={isExporting}
      />

      {/* Interactive Pipeline Timeline Stepper */}
      <PipelineStepper
        activePhase={activePhase}
        onSelectPhase={(phase) => setActivePhase(phase)}
        session={session}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Contextual AI Hint Banner */}
        {session && (
          <ContextualAiHint
            session={session}
            problems={problems}
            activePhase={activePhase}
            onNavigate={(phase) => setActivePhase(phase)}
          />
        )}

        {isLoadingSession ? (
          <div className="py-24 flex items-center justify-center">
            <Spinner size="lg" label="Connecting to RatchetAI SQLite WAL backend..." />
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
                  The frontend cannot reach the FastAPI server at <code className="text-cyan-300">http://localhost:8000</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Quick Fix:
                </span>
                <p className="text-xs font-mono text-slate-300">
                  cd pipeline &amp;&amp; python -m uvicorn server:app --reload --port 8000
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
          <div>
            {activePhase === 0 && (
              <ProblemBankView
                session={session}
                onSendToPhase2={handleSendToPhase2}
              />
            )}

            {activePhase === 1 && (
              <Phase1View
                session={session}
                onUpdateSession={handleUpdateSession}
                onAdvanceToNextPhase={() => setActivePhase(2)}
              />
            )}

            {activePhase === 2 && (
              <Phase2View
                session={session}
                onUpdateSession={handleUpdateSession}
                selectedProblemIds={phase2SelectedIds}
                onAdvanceToNextPhase={(problem) => {
                  if (problem) {
                    setSession({ ...session, phase3_problem: problem });
                  }
                  setActivePhase(3);
                }}
                onGoBack={() => setActivePhase(1)}
              />
            )}

            {activePhase === 3 && (
              <Phase3View
                session={session}
                onUpdateSession={handleUpdateSession}
                onAdvanceToNextPhase={() => setActivePhase(4)}
                onGoBack={() => setActivePhase(2)}
                initialProblemStatement={session.phase3_problem}
              />
            )}

            {activePhase === 4 && (
              <Phase4View
                session={session}
                onUpdateSession={handleUpdateSession}
                onAdvanceToNextPhase={() => setActivePhase(5)}
                onGoBack={() => setActivePhase(3)}
              />
            )}

            {activePhase === 5 && (
              <Phase5View
                session={session}
                onUpdateSession={handleUpdateSession}
                onGoBack={() => setActivePhase(4)}
                onExportDossier={handleExportDossier}
              />
            )}

            {activePhase === 6 && (
              <DeliverablesStudio
                session={session}
                onExportDossier={handleExportDossier}
                onNavigatePhase={(p) => setActivePhase(p)}
              />
            )}
          </div>
        ) : null}
      </main>

      {/* Session & Snapshots Manager Modal */}
      <SessionManager
        isOpen={isSessionManagerOpen}
        onClose={() => setIsSessionManagerOpen(false)}
        currentSessionId={session?.session_id || ""}
        onSelectSession={handleSelectSession}
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
    </div>
  );
}
