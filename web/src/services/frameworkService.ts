import { FrameworkSummary, FrameworkDetail, SessionState } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const frameworkService = {
  /**
   * List all registered CONVERA frameworks.
   */
  async listFrameworks(): Promise<FrameworkSummary[]> {
    try {
      const res = await fetch(`${API_BASE}/api/frameworks`);
      if (!res.ok) throw new Error("Failed to fetch frameworks");
      const data = await res.json();
      return data.frameworks || [];
    } catch (err) {
      console.warn("Using offline fallback frameworks list:", err);
      return [
        {
          id: "INNOVATION",
          name: "Venture Innovation & Opportunity Validation",
          version: "3.0.0",
          category: "INNOVATION",
          tagline: "Transform regional friction into validated, high-conviction venture opportunities.",
          description: "Flagship 5-phase venture exploration framework with Socratic Mom Test and SVB mechanism canvas.",
          stage_count: 5,
          gate_count: 2,
          target_audience: "Student technopreneurs & startup founders",
        },
        {
          id: "RESEARCH",
          name: "Computing Research Concept Development",
          version: "2.0.0",
          category: "RESEARCH",
          tagline: "Discover, validate, formulate, evaluate, and select rigorous computing research concepts.",
          description: "DSR-informed research framework with 6 stages (A..F) and 4 quality gates.",
          stage_count: 6,
          gate_count: 4,
          target_audience: "Academic researchers, MS/PhD students, and faculty",
        },
      ];
    }
  },

  /**
   * Get detailed specification for a specific framework.
   */
  async getFramework(frameworkId: string): Promise<FrameworkDetail> {
    const res = await fetch(`${API_BASE}/api/frameworks/${frameworkId}`);
    if (!res.ok) throw new Error(`Failed to fetch framework ${frameworkId}`);
    return await res.json();
  },

  /**
   * Switch the active framework for an existing session.
   */
  async switchFramework(sessionId: string, frameworkId: string): Promise<{ status: string; state: SessionState }> {
    const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/switch-framework`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ framework_id: frameworkId }),
    });
    if (!res.ok) throw new Error("Failed to switch framework");
    return await res.json();
  },

  /**
   * Create a new session initialized with a specific framework.
   */
  async createFrameworkSession(
    projectName: string = "Venture Project",
    frameworkId: string = "INNOVATION",
    projectId?: string
  ): Promise<{ session_id: string; state: SessionState; framework: FrameworkDetail }> {
    const res = await fetch(`${API_BASE}/api/sessions/create-with-framework`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: projectName,
        framework_id: frameworkId,
        project_id: projectId,
      }),
    });
    if (!res.ok) throw new Error("Failed to create framework session");
    return await res.json();
  },
};
