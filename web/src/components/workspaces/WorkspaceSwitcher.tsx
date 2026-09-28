"use client";

import React, { useState, useEffect, useRef } from "react";
import { FolderKanban, ChevronDown, Check, Users, UserPlus, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserWorkspace, WorkspaceRole } from "@/lib/types";

interface WorkspaceSwitcherProps {
  currentWorkspaceId?: string;
  onSelectWorkspace?: (workspaceId: string) => void;
  onOpenInviteModal?: () => void;
  onOpenMembersModal?: () => void;
}

const ROLE_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  OWNER: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  ADMIN: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  MEMBER: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  ADVISOR: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  VIEWER: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" },
  ANONYMOUS: { bg: "bg-slate-800/60", text: "text-slate-400", border: "border-slate-700" },
};

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  currentWorkspaceId,
  onSelectWorkspace,
  onOpenInviteModal,
  onOpenMembersModal,
}) => {
  const { user, workspaces, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const activeWorkspace = workspaces.find((w) => w.workspace_id === currentWorkspaceId) || workspaces[0];
  const roleStyle = ROLE_BADGE_STYLES[activeWorkspace?.role || "ANONYMOUS"] || ROLE_BADGE_STYLES.VIEWER;

  if (!user) {
    // Unauthenticated anonymous user
    return null;
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-white transition-all text-xs font-medium shadow-sm group"
        aria-expanded={isOpen}
      >
        <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
        <span className="max-w-[120px] truncate font-semibold">
          {activeWorkspace?.project_name || "Venture Workspace"}
        </span>
        {activeWorkspace && (
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
          >
            {activeWorkspace.role}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden divide-y divide-slate-800/80 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3 bg-slate-900/50">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Workspaces & Teams
            </div>
            <div className="text-xs text-slate-300 truncate mt-0.5">
              Signed in as <span className="font-semibold text-white">{user.email}</span>
            </div>
          </div>

          {/* Workspaces list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {workspaces.length === 0 ? (
              <div className="p-3 text-xs text-slate-400 text-center">
                No joined workspaces yet.
              </div>
            ) : (
              workspaces.map((ws) => {
                const isSelected = ws.workspace_id === currentWorkspaceId;
                const rStyle = ROLE_BADGE_STYLES[ws.role] || ROLE_BADGE_STYLES.VIEWER;
                return (
                  <button
                    key={ws.workspace_id}
                    onClick={() => {
                      if (onSelectWorkspace) onSelectWorkspace(ws.workspace_id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-slate-900/80 transition-colors ${
                      isSelected ? "bg-cyan-500/10 text-cyan-300 font-semibold" : "text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderKanban className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                      <div className="truncate">
                        <div className="truncate font-medium">{ws.project_name || ws.workspace_id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${rStyle.bg} ${rStyle.text} ${rStyle.border}`}
                      >
                        {ws.role}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Actions */}
          <div className="p-1.5 bg-slate-900/40 space-y-0.5">
            {onOpenInviteModal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenInviteModal();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Invite Collaborator / Advisor</span>
              </button>
            )}
            {onOpenMembersModal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenMembersModal();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Manage Workspace Members</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
