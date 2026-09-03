import { UserProfile, UserRole, TeamMember, ProblemComment, MentorSignoff } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USER_STORAGE_KEY = "ratchetai_user_profile";

export const DEFAULT_USER: UserProfile = {
  id: "user_lead",
  name: "Maria Santos (Team Lead)",
  role: "FOUNDER_LEAD",
  avatar: "👩‍💻",
};

export const authService = {
  getCurrentUser(): UserProfile {
    if (typeof window === "undefined") return DEFAULT_USER;
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not load user profile:", e);
    }
    return DEFAULT_USER;
  },

  saveCurrentUser(user: UserProfile): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn("Could not save user profile:", e);
    }
  },

  async verifyPasscode(projectId: string, passcode: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/verify-passcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.valid);
    } catch (e) {
      console.warn("Failed to verify passcode:", e);
      return true; // Fallback in local/offline mode
    }
  },

  async setPasscode(projectId: string, passcode: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/set-passcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      return res.ok;
    } catch (e) {
      console.warn("Failed to set passcode:", e);
      return false;
    }
  },

  async listMembers(projectId: string): Promise<TeamMember[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.members || [];
    } catch (e) {
      console.warn("Failed to list members:", e);
      return [];
    }
  },

  async joinOrUpdateMember(projectId: string, user: UserProfile): Promise<TeamMember | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.member;
    } catch (e) {
      console.warn("Failed to join member:", e);
      return null;
    }
  },

  async listComments(problemId: string): Promise<ProblemComment[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problems/${problemId}/comments`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.comments || [];
    } catch (e) {
      console.warn("Failed to list comments:", e);
      return [];
    }
  },

  async addComment(
    problemId: string,
    commentText: string,
    user: UserProfile
  ): Promise<ProblemComment | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problems/${problemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: user.name,
          user_role: user.role,
          user_avatar: user.avatar,
          comment: commentText,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.comment;
    } catch (e) {
      console.warn("Failed to add comment:", e);
      return null;
    }
  },

  async recordMentorSignoff(
    projectId: string,
    phaseNumber: number,
    mentorName: string,
    notes?: string
  ): Promise<MentorSignoff | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/mentor-signoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase_number: phaseNumber,
          mentor_name: mentorName,
          notes: notes || "Phase validation verified.",
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.signoff;
    } catch (e) {
      console.warn("Failed to record mentor signoff:", e);
      return null;
    }
  },

  async listMentorSignoffs(projectId: string): Promise<MentorSignoff[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/mentor-signoffs`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.signoffs || [];
    } catch (e) {
      console.warn("Failed to list mentor signoffs:", e);
      return [];
    }
  },
};
