"use client";

import React, { useState, useEffect } from "react";
import { Users, X, Shield, Crown, UserMinus, ArrowRightLeft, Check, AlertCircle } from "lucide-react";
import { workspaceService } from "@/services/workspaceService";
import { WorkspaceMembership, WorkspaceRole } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

interface MembersListProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName?: string;
  userRole?: WorkspaceRole | string;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  OWNER: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  ADMIN: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  MEMBER: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  ADVISOR: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  VIEWER: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" },
};

export const MembersList: React.FC<MembersListProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  userRole = "MEMBER",
}) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canManageRoles = userRole === "OWNER" || userRole === "ADMIN" || userRole === "SUPERADMIN";
  const isOwner = userRole === "OWNER" || userRole === "SUPERADMIN";

  useEffect(() => {
    if (isOpen && workspaceId) {
      loadMembers();
    }
  }, [isOpen, workspaceId]);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workspaceService.listMembers(workspaceId);
      setMembers(res.members || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load workspace members");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: WorkspaceRole) => {
    setError(null);
    setSuccessMsg(null);
    try {
      await workspaceService.updateMemberRole(workspaceId, targetUserId, newRole);
      setSuccessMsg("Role updated successfully");
      loadMembers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (targetUserId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from this workspace?`)) {
      return;
    }
    setError(null);
    try {
      await workspaceService.removeMember(workspaceId, targetUserId);
      loadMembers();
    } catch (err: any) {
      setError(err?.message || "Failed to remove member");
    }
  };

  const handleTransferOwnership = async (newOwnerId: string, name: string) => {
    if (
      !window.confirm(
        `DANGER: Are you sure you want to transfer PRIMARY OWNERSHIP to ${name}? You will become an ADMIN.`
      )
    ) {
      return;
    }
    setError(null);
    try {
      await workspaceService.transferOwnership(workspaceId, newOwnerId);
      setSuccessMsg("Ownership successfully transferred");
      loadMembers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to transfer ownership");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Workspace Members & RBAC Roster</h2>
            <p className="text-xs text-slate-400 truncate max-w-md">
              {workspaceName || workspaceId} • {members.length} Active Member{members.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading roster...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No members found in this workspace.</div>
          ) : (
            members.map((m) => {
              const roleStyle = ROLE_COLORS[m.role] || ROLE_COLORS.VIEWER;
              const isCurrentUser = user?.id === m.user_id;
              const isTargetOwner = m.role === "OWNER";

              return (
                <div
                  key={m.id || m.user_id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4 transition-all hover:border-slate-700"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base flex-shrink-0">
                      {m.avatar || (isTargetOwner ? "👑" : "👤")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {m.display_name || m.email || "Collaborator"}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-cyan-400 font-mono font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {m.email ? m.email : `User: ${m.user_id?.slice(0, 14)}...`}
                      </div>
                    </div>
                  </div>

                  {/* Role & Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canManageRoles && !isTargetOwner && !isCurrentUser ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.user_id, e.target.value as WorkspaceRole)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border} focus:outline-none`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADVISOR">ADVISOR</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border} flex items-center gap-1`}
                      >
                        {isTargetOwner && <Crown className="w-3 h-3 text-amber-400" />}
                        {m.role}
                      </span>
                    )}

                    {/* Ownership transfer option */}
                    {isOwner && !isTargetOwner && (
                      <button
                        onClick={() => handleTransferOwnership(m.user_id, m.display_name || m.email)}
                        className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                        title="Transfer Ownership"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    )}

                    {/* Remove Member */}
                    {canManageRoles && !isTargetOwner && !isCurrentUser && (
                      <button
                        onClick={() => handleRemoveMember(m.user_id, m.display_name || m.email)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Remove Member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Role updates take effect immediately for active sessions.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
