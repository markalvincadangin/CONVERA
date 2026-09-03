"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  HelpCircle,
  Download,
  Sparkles,
  ChevronDown,
  Lock,
  Key,
  Shield,
  Layers,
  Copy,
  Check,
} from "lucide-react";
import { Tooltip } from "@/components/common/Tooltip";
import { VentureHealthBar } from "@/components/common/VentureHealthBar";
import { getRoleMeta } from "@/components/auth/UserRoleBadge";
import { IconAvatar } from "@/components/common/IconAvatar";
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
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setUserProfile(authService.getCurrentUser());
  }, []);

  const projectName = session?.project_name || "Iloilo Venture Project";
  const projectId = session?.project_id || session?.session_id || "proj_default";
  const shareCode = session?.share_code || "";
  const roleMeta = getRoleMeta(userProfile.role);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shareCode) return;
    navigator.clipboard.writeText(shareCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl transition-all shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* ========================================================= */}
          {/* 1. LEFT: Brand & System Identity                           */}
          {/* ========================================================= */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group flex items-center justify-center">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl blur-md opacity-25 group-hover:opacity-60 transition-opacity" />
              
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-black/50 overflow-hidden">
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
                  v3.1
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block tracking-tight -mt-0.5 font-medium">
                Evidence-Ratcheted Technopreneurship Engine
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. CENTER: Polished Active Workspace Selector Card        */}
          {/* ========================================================= */}
          <div className="flex-1 max-w-md hidden sm:flex justify-center">
            {session ? (
              <Tooltip content="Switch workspace, manage snapshots, or copy room share code" position="bottom">
                <button
                  onClick={onOpenSessionManager}
                  className="group w-full max-w-sm flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-left transition-all duration-200 shadow-sm hover:shadow-cyan-500/10"
                >
                  {/* Left: Icon Badge */}
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shrink-0 group-hover:scale-105 transition-transform">
                    <FolderKanban className="w-4 h-4" />
                  </div>

                  {/* Center: Title & Formatted Metadata */}
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-white truncate max-w-[170px] leading-tight">
                        {projectName}
                      </span>
                      {session.has_passcode && (
                        <span title="PIN Protected Workspace">
                          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-slate-300 font-medium">Live</span>
                      </div>
                      {shareCode && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-cyan-300 font-bold tracking-wider">{shareCode}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Switch Pill Action */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800/90 text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-all shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono hidden md:inline">
                      Switch
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                  </div>
                </button>
              </Tooltip>
            ) : (
              <div className="text-xs text-slate-500 font-mono">Initializing workspace...</div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 3. RIGHT: Identity Card, Health Bar & Utility Toolbar     */}
          {/* ========================================================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Profile Command Card */}
            <Tooltip content={`Active Identity: ${userProfile.name} • ${roleMeta.label} (Click to customize)`} position="bottom">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-xs transition-all duration-200 group shadow-sm hover:shadow-cyan-500/10 active:scale-[0.98]"
              >
                <div className="relative shrink-0 flex items-center justify-center">
                  <IconAvatar iconKey={userProfile.avatar} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm" />
                </div>
                <div className="flex flex-col text-left justify-center min-w-0 pr-0.5">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-white truncate leading-snug tracking-tight max-w-[100px]">
                    {userProfile.name}
                  </span>
                  <span className={`text-[10px] font-mono font-semibold tracking-wide whitespace-nowrap leading-none ${roleMeta.text}`}>
                    {roleMeta.label}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 hidden sm:block" />
              </button>
            </Tooltip>

            {/* Venture Health Meter */}
            <VentureHealthBar session={session} />

            {/* Utility Action Toolbar */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
              
              {/* Security PIN Button */}
              {projectId && (
                <Tooltip content={session?.has_passcode ? "Change 4-Digit Room PIN" : "Set 4-Digit Room PIN"} position="bottom">
                  <button
                    onClick={() => setIsSecurityModalOpen(true)}
                    className={`p-2 rounded-xl text-xs transition-all ${
                      session?.has_passcode
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}

              {/* Help & Guide Modal Trigger */}
              <Tooltip content="User Manual & 5-Phase Playbook" position="bottom">
                <button
                  onClick={onOpenHelp}
                  className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              {/* Cheatsheet Drawer Trigger */}
              <Tooltip content="Quick Reference & Rubric Gates" position="bottom">
                <button
                  onClick={onOpenCheatsheet}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              {/* Export Dossier Button */}
              <Tooltip content="Export Venture Dossier to Markdown" position="bottom">
                <button
                  onClick={onExportDossier}
                  disabled={isExporting}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-all"
                >
                  <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce text-emerald-400" : ""}`} />
                </button>
              </Tooltip>
            </div>
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

      {/* Room Security PIN Modal */}
      {projectId && (
        <RoomSecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          projectId={projectId}
          mode="SET_PASSCODE"
          onVerified={() => {
            setIsSecurityModalOpen(false);
          }}
        />
      )}
    </>
  );
};
