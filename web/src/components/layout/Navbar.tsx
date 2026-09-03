"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  HelpCircle,
  Download,
  Sparkles,
  ChevronDown,
  Lock,
  Key,
  User,
} from "lucide-react";
import { Tooltip } from "@/components/common/Tooltip";
import { VentureHealthBar } from "@/components/common/VentureHealthBar";
import { UserRoleBadge } from "@/components/auth/UserRoleBadge";
import { UserProfileModal } from "@/components/auth/UserProfileModal";
import { RoomSecurityModal } from "@/components/auth/RoomSecurityModal";
import { SessionState, UserProfile } from "@/lib/types";
import { authService, DEFAULT_USER } from "@/services/authService";

interface NavbarProps {
  session: SessionState | null;
  onOpenSessionManager: () => void;
  onOpenCheatsheet: () => void;
  onOpenHelp: () => void;
  onOpenPresentation: () => void;
  onExportDossier: () => void;
  isExporting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onOpenSessionManager,
  onOpenCheatsheet,
  onOpenHelp,
  onOpenPresentation,
  onExportDossier,
  isExporting = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  useEffect(() => {
    setUserProfile(authService.getCurrentUser());
  }, []);

  const projectName = session?.project_name || "Iloilo Venture Project";
  const sessionId = session?.session_id || "";
  const projectId = session?.project_id || "";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Brand & Product Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group flex items-center justify-center">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl blur-md opacity-25 group-hover:opacity-50 transition-opacity" />
              
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-black/40 overflow-hidden">
                {!imageError ? (
                  <img
                    src="/brand/brandmark.png"
                    alt="RatchetAI Logo"
                    className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-200"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-mono">
                  RatchetAI
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 tracking-wide font-mono">
                  v3.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block tracking-tight -mt-0.5">
                Evidence-Ratcheted Technopreneurship Engine
              </p>
            </div>
          </div>

          {/* Center: Active Venture Workspace Switcher */}
          <div className="flex-1 max-w-md hidden sm:flex justify-center">
            {session ? (
              <Tooltip content="Switch session, copy room share code, or restore milestone snapshots" position="bottom">
                <button
                  onClick={onOpenSessionManager}
                  className="group w-full max-w-sm flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/70 text-left transition-all duration-200 shadow-inner"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shrink-0">
                      <FolderOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-100 group-hover:text-white truncate">
                          {projectName}
                        </span>
                        {session.has_passcode && (
                          <span title="PIN Protected Room"><Lock className="w-3 h-3 text-amber-400 shrink-0" /></span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{sessionId}</span>
                        {session.share_code && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-300 font-bold">{session.share_code}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider hidden lg:inline">Switch</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>
              </Tooltip>
            ) : (
              <div className="text-xs text-slate-500">Initializing workspace...</div>
            )}
          </div>

          {/* Right: User Profile, Health Meter & Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* User Profile Pill */}
            <Tooltip content={`Active Role: ${userProfile.role} — Click to switch profile or role`} position="bottom">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-all group"
              >
                <span className="text-base">{userProfile.avatar}</span>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white max-w-[110px] truncate leading-tight">
                    {userProfile.name}
                  </span>
                  <div className="scale-90 origin-left -mt-0.5">
                    <UserRoleBadge role={userProfile.role} size="sm" showIcon={false} />
                  </div>
                </div>
              </button>
            </Tooltip>

            {/* Venture Health Meter */}
            <VentureHealthBar session={session} />

            {/* Room Security PIN Button */}
            {projectId && (
              <Tooltip content={session?.has_passcode ? "Change room PIN passcode" : "Set room PIN passcode"} position="bottom">
                <button
                  onClick={() => setIsSecurityModalOpen(true)}
                  className={`p-2 rounded-xl border text-xs transition-all shadow-sm ${
                    session?.has_passcode
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                      : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}

            {/* Help & Guide Button */}
            <Tooltip content="Open user manual, 5-phase playbook, snapshots guide & FAQs" position="bottom">
              <button
                onClick={onOpenHelp}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Help</span>
              </button>
            </Tooltip>

            {/* Cheatsheet Button */}
            <Tooltip content="Quick reference rules, banned words & scoring gates" position="bottom">
              <button
                onClick={onOpenCheatsheet}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Cheatsheet</span>
              </button>
            </Tooltip>

            {/* Export Dossier Button */}
            <Tooltip content="Export complete venture evidence dossier to Markdown" position="bottom">
              <button
                onClick={onExportDossier}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-all shadow-sm"
              >
                <Download className={`w-3.5 h-3.5 text-emerald-400 ${isExporting ? "animate-bounce" : ""}`} />
                <span className="hidden md:inline">Export</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(newP) => setUserProfile(newP)}
        projectId={projectId}
      />

      {/* Room PIN Security Modal */}
      {projectId && (
        <RoomSecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          projectId={projectId}
          mode="SET_PASSCODE"
        />
      )}
    </>
  );
};
