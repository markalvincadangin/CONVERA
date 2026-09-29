"use client";

import React from "react";
import { SessionState, ProblemRecord } from "@/lib/types";
import { getMethodologyContract } from "@/lib/contracts/methodology";
import { ProblemBankView } from "@/components/problem-bank/ProblemBankView";
import { DeliverablesStudio } from "@/components/deliverables/DeliverablesStudio";
import { ProblemDiscoveryView } from "@/components/frameworks/innovation/ProblemDiscoveryView";
import { ProblemScreeningView } from "@/components/frameworks/innovation/ProblemScreeningView";
import { ProblemValidationView } from "@/components/frameworks/innovation/ProblemValidationView";
import { SolutionConceptView } from "@/components/frameworks/innovation/SolutionConceptView";
import { EconomicsTestingView } from "@/components/frameworks/innovation/EconomicsTestingView";
import { ResearchWorkspaceView } from "@/components/frameworks/research/ResearchWorkspaceView";

export interface WorkspaceResolverProps {
  session: SessionState;
  problems: ProblemRecord[];
  activePhase: number;
  onUpdateSession: (updatedSession: SessionState) => void;
  onSelectPhase: (phase: number) => void;
  onSendToPhase2: (selectedIds: string[]) => void;
  onExportDossier: () => void;
  phase2SelectedIds: string[];
}

/**
 * WorkspaceResolver
 * =================
 * Governed by: CONVERA Concept Development Standard (CCDS v2.0)
 * Invariant: INV-METHODOLOGY-004 (Craftsmanship Preservation)
 *
 * Parameterizes workspace view dispatching via contract metadata while
 * preserving 100% handcrafted, bespoke user experiences.
 */
export const WorkspaceResolver: React.FC<WorkspaceResolverProps> = ({
  session,
  problems,
  activePhase,
  onUpdateSession,
  onSelectPhase,
  onSendToPhase2,
  onExportDossier,
  phase2SelectedIds,
}) => {
  const contract = getMethodologyContract(session.framework_id);
  const studioPhaseIndex = contract.stages.length + 1;

  // Slot 0: Problem Bank (Universal Platform Primitive)
  if (activePhase === 0) {
    return <ProblemBankView session={session} onSendToPhase2={onSendToPhase2} />;
  }

  // Terminal Slot: Deliverables Studio (Universal Output Hub)
  if (activePhase === studioPhaseIndex) {
    return (
      <DeliverablesStudio
        session={session}
        onExportDossier={onExportDossier}
        onNavigatePhase={onSelectPhase}
      />
    );
  }

  // Research Track (DSR Concept Development Process)
  if (contract.id === "RESEARCH") {
    if (activePhase >= 1 && activePhase <= contract.stages.length) {
      return (
        <ResearchWorkspaceView
          session={session}
          problems={problems}
          activePhase={activePhase}
          onUpdateSession={onUpdateSession}
        />
      );
    }
    return (
      <DeliverablesStudio
        session={session}
        onExportDossier={onExportDossier}
        onNavigatePhase={onSelectPhase}
      />
    );
  }

  // Innovation Track Handcrafted Workspaces
  switch (activePhase) {
    case 1:
      return (
        <ProblemDiscoveryView
          session={session}
          onUpdateSession={onUpdateSession}
          onAdvanceToNextPhase={() => onSelectPhase(2)}
        />
      );
    case 2:
      return (
        <ProblemScreeningView
          session={session}
          onUpdateSession={onUpdateSession}
          selectedProblemIds={phase2SelectedIds}
          onAdvanceToNextPhase={(problem) => {
            if (problem) {
              onUpdateSession({ ...session, phase3_problem: problem });
            }
            onSelectPhase(3);
          }}
          onGoBack={() => onSelectPhase(1)}
        />
      );
    case 3:
      return (
        <ProblemValidationView
          session={session}
          onUpdateSession={onUpdateSession}
          onAdvanceToNextPhase={() => onSelectPhase(4)}
          onGoBack={() => onSelectPhase(2)}
          initialProblemStatement={session.phase3_problem}
        />
      );
    case 4:
      return (
        <SolutionConceptView
          session={session}
          onUpdateSession={onUpdateSession}
          onAdvanceToNextPhase={() => onSelectPhase(5)}
          onGoBack={() => onSelectPhase(3)}
        />
      );
    case 5:
      return (
        <EconomicsTestingView
          session={session}
          onUpdateSession={onUpdateSession}
          onGoBack={() => onSelectPhase(4)}
          onExportDossier={onExportDossier}
        />
      );
    default:
      return (
        <DeliverablesStudio
          session={session}
          onExportDossier={onExportDossier}
          onNavigatePhase={onSelectPhase}
        />
      );
  }
};
