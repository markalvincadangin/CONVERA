import { fetchApi } from "@/lib/api-client";
import { SessionMeta, SessionState } from "@/lib/types";

export interface SessionSnapshot {
  id: number;
  session_id: string;
  label: string;
  phase_number: number;
  created_at: string;
}

export const sessionService = {
  async listSessions(): Promise<SessionMeta[]> {
    try {
      const res = await fetchApi<any>("/api/sessions");
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.sessions)) return res.sessions;
      return [];
    } catch (err) {
      console.error("Failed to list sessions:", err);
      return [];
    }
  },

  async getSession(sessionId: string): Promise<SessionState> {
    const res = await fetchApi<any>(`/api/sessions/${sessionId}`);
    if (res && res.state) return res.state;
    return res;
  },

  async createSession(
    sessionId?: string,
    projectName?: string,
    frameworkId: string = "INNOVATION"
  ): Promise<{ session_id: string; state: SessionState }> {
    const res = await fetchApi<any>("/api/sessions", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        project_name: projectName,
        framework_id: frameworkId,
      }),
    });
    if (res && res.state) return res;
    return { session_id: res.session_id || "", state: res };
  },

  async updateSession(sessionId: string, payload: Partial<SessionState>): Promise<SessionState> {
    const res = await fetchApi<any>(`/api/sessions/${sessionId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res && res.state) return res.state;
    return res;
  },

  async listSnapshots(sessionId: string): Promise<SessionSnapshot[]> {
    try {
      const res = await fetchApi<SessionSnapshot[]>(`/api/sessions/${sessionId}/snapshots`);
      return Array.isArray(res) ? res : [];
    } catch (err) {
      console.error("Failed to list snapshots:", err);
      return [];
    }
  },

  async createSnapshot(sessionId: string, label: string, phaseNumber: number): Promise<SessionSnapshot> {
    return await fetchApi<SessionSnapshot>(`/api/sessions/${sessionId}/snapshots`, {
      method: "POST",
      body: JSON.stringify({ label, phase_number: phaseNumber }),
    });
  },

  async restoreSnapshot(sessionId: string, snapshotId: number): Promise<SessionState> {
    const res = await fetchApi<any>(`/api/sessions/${sessionId}/snapshots/${snapshotId}/restore`, {
      method: "POST",
    });
    if (res && res.state) return res.state;
    return res;
  },

  async getProjectByCode(shareCode: string): Promise<any> {
    return await fetchApi<any>(`/api/projects/by-code/${encodeURIComponent(shareCode)}`);
  },

  async renameSession(sessionId: string, projectName: string): Promise<{ session_id: string; project_name: string }> {
    return await fetchApi<{ session_id: string; project_name: string }>(`/api/sessions/${sessionId}/rename`, {
      method: "PUT",
      body: JSON.stringify({ project_name: projectName }),
    });
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    const res = await fetchApi<{ status: string }>(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
    return res.status === "deleted";
  },

  async exportDossier(sessionId: string): Promise<{ session_id: string; markdown: string }> {
    return await fetchApi<{ session_id: string; markdown: string }>(`/api/sessions/${sessionId}/export`);
  },

  async getHealth(): Promise<any> {
    return await fetchApi<any>("/api/health");
  },
};
