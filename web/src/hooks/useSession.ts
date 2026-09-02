"use client";

import { useState, useEffect, useCallback } from "react";
import { sessionService } from "@/services/sessionService";
import { SessionState, SessionMeta } from "@/lib/types";

export function useSession() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [sessionsList, setSessionsList] = useState<SessionMeta[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionList = useCallback(async () => {
    try {
      const list = await sessionService.listSessions();
      setSessionsList(list);
      return list;
    } catch (err: any) {
      setError(err.message || "Failed to load session list");
      return [];
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sessionService.getSession(sessionId);
      setSession(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to load session");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSession = useCallback(async (projectName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await sessionService.createSession(undefined, projectName);
      setSession(res.state);
      await fetchSessionList();
      return res.state;
    } catch (err: any) {
      setError(err.message || "Failed to create session");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSessionList]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const list = await fetchSessionList();
      if (list && list.length > 0) {
        await loadSession(list[0].session_id);
      } else {
        await createNewSession();
      }
      setIsLoading(false);
    };
    init();
  }, [fetchSessionList, loadSession, createNewSession]);

  return {
    session,
    setSession,
    sessionsList,
    isLoading,
    error,
    loadSession,
    createNewSession,
    fetchSessionList,
  };
}
