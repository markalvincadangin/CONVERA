/**
 * CONVERA Research Session Service Client (SDD-021)
 * =================================================
 * Client service managing research session persistence, turnkey resume payloads,
 * milestone checkpoints with SHA-256 provenance, and session cloning.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

import { fetchApi } from "@/lib/api-client";
import type {
  ResearchSessionSummary,
  CreateResearchSessionRequest,
  CreateCheckpointRequest,
  ResearchSessionCheckpointRecord,
  SyncStageRequest,
  ResearchSessionResumePayload,
  CloneResearchSessionRequest,
} from "@/types/researchSession";

export * from "@/types/researchSession";

const ACTIVE_RESEARCH_SESSION_STORAGE_KEY = "convera_active_research_session_id";

export const researchSessionService = {
  /**
   * Retrieves all research sessions with stage stepper badges, completion %,
   * active problem statement, and gate status chips.
   */
  listSessions: async (limit: number = 50): Promise<ResearchSessionSummary[]> => {
    return await fetchApi<ResearchSessionSummary[]>(
      `/api/research-sessions?limit=${limit}`
    );
  },

  /**
   * Creates a new dedicated research session initialized at Stage A: Scouting.
   */
  createSession: async (
    request: CreateResearchSessionRequest
  ): Promise<ResearchSessionSummary> => {
    const summary = await fetchApi<ResearchSessionSummary>("/api/research-sessions", {
      method: "POST",
      body: JSON.stringify(request),
    });
    // Store as active session in local storage for seamless recovery
    researchSessionService.setActiveSessionId(summary.session_id);
    return summary;
  },

  /**
   * Turnkey resumption fetching full session state, summary metadata,
   * checkpoint history, active problem details, and recent events.
   */
  resumeSession: async (sessionId: string): Promise<ResearchSessionResumePayload> => {
    const payload = await fetchApi<ResearchSessionResumePayload>(
      `/api/research-sessions/${encodeURIComponent(sessionId)}/resume`
    );
    researchSessionService.setActiveSessionId(sessionId);
    return payload;
  },

  /**
   * Persists stage transition to SQLite, updating current stage and completion %.
   */
  syncStage: async (
    sessionId: string,
    request: SyncStageRequest
  ): Promise<{ status: string; session_id: string; current_stage_id: string; stage_completion_pct: number }> => {
    return await fetchApi(
      `/api/research-sessions/${encodeURIComponent(sessionId)}/sync-stage`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },

  /**
   * Creates an immutable milestone checkpoint capturing full state snapshot
   * and deterministic SHA-256 provenance hash.
   */
  createCheckpoint: async (
    sessionId: string,
    request: CreateCheckpointRequest
  ): Promise<ResearchSessionCheckpointRecord> => {
    return await fetchApi<ResearchSessionCheckpointRecord>(
      `/api/research-sessions/${encodeURIComponent(sessionId)}/checkpoint`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },

  /**
   * Retrieves all checkpoints for a research session.
   */
  listCheckpoints: async (
    sessionId: string
  ): Promise<ResearchSessionCheckpointRecord[]> => {
    return await fetchApi<ResearchSessionCheckpointRecord[]>(
      `/api/research-sessions/${encodeURIComponent(sessionId)}/checkpoints`
    );
  },

  /**
   * Rolls back research session to a prior milestone checkpoint after
   * verifying cryptographic SHA-256 hash match.
   */
  restoreCheckpoint: async (
    sessionId: string,
    checkpointId: string
  ): Promise<{ status: string; session_id: string; checkpoint_id: string; current_stage_id: string }> => {
    return await fetchApi(
      `/api/research-sessions/${encodeURIComponent(sessionId)}/restore/${encodeURIComponent(checkpointId)}`,
      {
        method: "POST",
      }
    );
  },

  /**
   * Deletes a milestone checkpoint.
   */
  deleteCheckpoint: async (
    sessionId: string,
    checkpointId: string
  ): Promise<{ status: string; checkpoint_id: string; success: boolean }> => {
    return await fetchApi(
      `/api/research-sessions/${encodeURIComponent(sessionId)}/checkpoint/${encodeURIComponent(checkpointId)}`,
      {
        method: "DELETE",
      }
    );
  },

  /**
   * Clones a research session for parallel hypothesis exploration.
   */
  cloneSession: async (
    sessionId: string,
    request: CloneResearchSessionRequest
  ): Promise<ResearchSessionSummary> => {
    const cloned = await fetchApi<ResearchSessionSummary>(
      `/api/research-sessions/${encodeURIComponent(sessionId)}/clone`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    return cloned;
  },

  /**
   * Local storage helpers for client recovery.
   */
  getActiveSessionId: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACTIVE_RESEARCH_SESSION_STORAGE_KEY);
  },

  setActiveSessionId: (sessionId: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACTIVE_RESEARCH_SESSION_STORAGE_KEY, sessionId);
  },

  clearActiveSessionId: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACTIVE_RESEARCH_SESSION_STORAGE_KEY);
  },
};
