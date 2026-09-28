import { fetchApi } from "@/lib/api-client";
import { UserWorkspace, WorkspaceMembership, WorkspaceInvite, WorkspaceRole } from "@/lib/types";

export interface CreateInvitePayload {
  role?: WorkspaceRole;
  expires_in_hours?: number;
  max_uses?: number;
}

export interface InviteInspection {
  valid: boolean;
  workspace_id?: string;
  workspace_name?: string;
  role?: WorkspaceRole;
  expires_at?: string;
  max_uses?: number;
  use_count?: number;
  inviter_name?: string;
  error?: string;
}

export interface WorkspaceDetailsResponse {
  workspace: any;
  role: WorkspaceRole | "ANONYMOUS" | "SUPERADMIN";
  membership?: WorkspaceMembership | null;
}

export const workspaceService = {
  /**
   * List all workspaces the current user has active memberships in.
   */
  async listUserWorkspaces(): Promise<{ workspaces: UserWorkspace[] }> {
    return fetchApi("/api/workspaces");
  },

  /**
   * Retrieve workspace metadata and current caller's role.
   */
  async getWorkspaceDetails(workspaceId: string): Promise<WorkspaceDetailsResponse> {
    return fetchApi(`/api/workspaces/${encodeURIComponent(workspaceId)}`);
  },

  /**
   * List the roster of members in a workspace.
   */
  async listMembers(workspaceId: string): Promise<{ workspace_id: string; members: WorkspaceMembership[] }> {
    return fetchApi(`/api/workspaces/${encodeURIComponent(workspaceId)}/members`);
  },

  /**
   * Generate a cryptographic invite token with role, TTL, and usage limit.
   */
  async createInvite(
    workspaceId: string,
    payload: CreateInvitePayload
  ): Promise<{ status: string; invite: WorkspaceInvite }> {
    return fetchApi(`/api/workspaces/${encodeURIComponent(workspaceId)}/invites`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * List active unrevoked invites for this workspace.
   */
  async listInvites(workspaceId: string): Promise<{ workspace_id: string; invites: WorkspaceInvite[] }> {
    return fetchApi(`/api/workspaces/${encodeURIComponent(workspaceId)}/invites`);
  },

  /**
   * Revoke an active invite token.
   */
  async revokeInvite(workspaceId: string, inviteId: string): Promise<{ status: string }> {
    return fetchApi(`/api/workspaces/${encodeURIComponent(workspaceId)}/invites/${encodeURIComponent(inviteId)}`, {
      method: "DELETE",
    });
  },

  /**
   * Inspect invite token validity and target workspace metadata (anonymous or authenticated).
   */
  async inspectInvite(token: string): Promise<InviteInspection> {
    return fetchApi(`/api/workspaces/invites/${encodeURIComponent(token)}`);
  },

  /**
   * Redeem invite token as the currently authenticated user.
   */
  async redeemInvite(token: string): Promise<{ status: string; workspace_id: string; role: WorkspaceRole }> {
    return fetchApi(`/api/workspaces/invites/${encodeURIComponent(token)}/redeem`, {
      method: "POST",
    });
  },

  /**
   * Update the RBAC role of a member (e.g. promote MEMBER to ADMIN or ADVISOR).
   */
  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
  ): Promise<{ status: string; membership: WorkspaceMembership }> {
    return fetchApi(`/api/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: JSON.stringify({ user_id: userId, role }),
    });
  },

  /**
   * Remove a member from the workspace roster.
   */
  async removeMember(workspaceId: string, userId: string): Promise<{ status: string }> {
    return fetchApi(`/api/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
  },

  /**
   * Transfer workspace primary ownership to another active member.
   */
  async transferOwnership(
    workspaceId: string,
    newOwnerId: string
  ): Promise<{ status: string; new_owner_id: string }> {
    return fetchApi(`/api/workspaces/${encodeURIComponent(workspaceId)}/transfer-ownership`, {
      method: "POST",
      body: JSON.stringify({ new_owner_id: newOwnerId }),
    });
  },
};
