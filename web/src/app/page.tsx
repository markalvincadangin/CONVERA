"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PipelineStepper } from "@/components/layout/PipelineStepper";
import { SessionManager } from "@/components/layout/SessionManager";
import { CheatsheetDrawer } from "@/components/layout/CheatsheetDrawer";
import { PresentationModal } from "@/components/layout/PresentationModal";
import { HelpCenterModal } from "@/components/layout/HelpCenterModal";
import { Phase1View } from "@/components/phases/phase1/Phase1View";
import { Phase2View } from "@/components/phases/phase2/Phase2View";
import { Phase3View } from "@/components/phases/phase3/Phase3View";
import { Phase4View } from "@/components/phases/phase4/Phase4View";
import { Phase5View } from "@/components/phases/phase5/Phase5View";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Spinner } from "@/components/common/Spinner";
import { sessionService } from "@/services/sessionService";
import { SessionState } from "@/lib/types";
import { Download, Copy, Check, ServerCrash, RefreshCw, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [activePhase, setActivePhase] = useState<number>(1);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Modals & Drawers
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportedMarkdown, setExportedMarkdown] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setIsLoadingSession(true);
    setConnectionError(null);
    try {
      const sessions = await sessionService.listSessions();
      if (Array.isArray(sessions) && sessions.length > 0) {
        const latestSession = await sessionService.getSession(sessions[0].session_id);
        setSession(latestSession);
        determineInitialPhase(latestSession);
      } else {
        const newSession = await sessionService.createSession(
          undefined,
          "Iloilo Technopreneurship Project"
        );
        setSession(newSession.state);
        setActivePhase(1);
      }
    } catch (err: any) {
      console.error("Initialization error:", err);
      setConnectionError(
        "Unable to connect to the RatchetAI backend. Make sure the FastAPI server is running."
      );
    } finally {
      setIsLoadingSession(false);
    }
  };

  const determineInitialPhase = (s: SessionState) => {
    if (s.phase4_complete || s.phase5_response) {
      setActivePhase(5);
    } else if (s.phase3_complete || s.phase4_response) {
      setActivePhase(4);
    } else if (s.phase2_complete || s.phase3_response || s.phase3_problem) {
      setActivePhase(3);
    } else if (s.phase1_complete || s.phase2_response) {
      setActivePhase(2);
    } else {
      setActivePhase(1);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setIsLoadingSession(true);
    try {
      const selected = await sessionService.getSession(sessionId);
      setSession(selected);
      determineInitialPhase(selected);
      setIsSessionManagerOpen(false);
    } catch (err: any) {
      console.error(err);
      alert("Failed to load selected session.");
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleUpdateSession = (newState: SessionState) => {
    setSession(newState);
  };

  const handleCreateOfflineSession = () => {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const offlineState: SessionState = {
      session_id: timestamp,
      project_name: "Iloilo Local Venture Project",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_levels: [],
      phase1_complete: false,
      phase2_complete: false,
      phase3_complete: false,
      phase4_complete: false,
      phase5_complete: false,
      phase3_history: [],
      phase4_concepts: [],
    };
    setSession(offlineState);
    setConnectionError(null);
    setIsLoadingSession(false);
  };

  const handleExportDossier = async () => {
    if (!session) return;
    setIsExporting(true);
    try {
      const res = await sessionService.exportDossier(session.session_id);
      setExportedMarkdown(res.markdown);
      setIsExportModalOpen(true);
    } catch (err: any) {
      alert(err.message || "Failed to export dossier");
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

      {/* Interactive 5-Phase Timeline Stepper */}
      <PipelineStepper
        activePhase={activePhase}
        onSelectPhase={(phase) => setActivePhase(phase)}
        session={session}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
        ) : null}
      </main>

      {/* Modals & Interactive Drawers */}
      {session && (
        <SessionManager
          isOpen={isSessionManagerOpen}
          onClose={() => setIsSessionManagerOpen(false)}
          currentSessionId={session.session_id}
          onSelectSession={handleSelectSession}
        />
      )}

      <CheatsheetDrawer
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        session={session}
      />

      {/* Dossier Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="RatchetAI Venture Dossier Export"
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Comprehensive presentation-ready report compiling all completed phases, scorecards, SVB canvas, and MVP test audits.
          </p>

          <textarea
            readOnly
            rows={15}
            value={exportedMarkdown}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleCopyMarkdown}
              leftIcon={copiedDossier ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copiedDossier ? "Copied!" : "Copy Markdown"}
            </Button>
            <Button
              variant="emerald"
              onClick={handleDownloadMarkdown}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download .md File
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
