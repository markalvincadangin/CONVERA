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
  Layers,
  Menu,
  X,
  Presentation,
  CheckCircle2,
  Gauge,
  Inbox,
  GitMerge,
  Compass,
  Zap,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Tooltip } from "@/components/common/Tooltip";
import { VentureHealthBar } from "@/components/common/VentureHealthBar";
import { getRoleMeta } from "@/components/auth/UserRoleBadge";
import { IconAvatar } from "@/components/common/IconAvatar";
import { UserProfileModal } from "@/components/auth/UserProfileModal";
import { RoomSecurityModal } from "@/components/auth/RoomSecurityModal";
import { FrameworkSelectorModal } from "@/components/common/FrameworkSelectorModal";
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
  onFrameworkChanged?: (updatedSession: SessionState) => void;
  onOpenScorecard?: () => void;
  onOpenInbox?: () => void;
  onOpenTraceability?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onOpenSessionManager,
  onOpenCheatsheet,
  onOpenHelp,
  onOpenPresentation,
  onExportDossier,
  isExporting = false,
  onFrameworkChanged,
  onOpenScorecard,
  onOpenInbox,
  onOpenTraceability,
}) => {
  const [imageError, setImageError] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isFrameworkModalOpen, setIsFrameworkModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUserProfile(authService.getCurrentUser());
  }, []);

  const projectName = session?.project_name || "Iloilo Venture Project";
  const projectId = session?.project_id || session?.session_id || "proj_default";
  const shareCode = session?.share_code || "";
  const roleMeta = getRoleMeta(userProfile.role);

  const frameworkId = session?.framework_id?.toUpperCase() || "INNOVATION";
  const getFrameworkBadge = () => {
    switch (frameworkId) {
      case "RESEARCH":
      case "RESEARCH_CRCDP":
        return { label: "Research", icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" />, border: "border-emerald-500/40 text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40" };
      case "CAPSTONE":
        return { label: "Capstone", icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />, border: "border-indigo-500/40 text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/40" };
      case "PRODUCT":
        return { label: "Product", icon: <Compass className="w-3.5 h-3.5 text-amber-400" />, border: "border-amber-500/40 text-amber-300 bg-amber-950/40 hover:bg-amber-900/40" };
      default:
        return { label: "Innovation", icon: <Zap className="w-3.5 h-3.5 text-blue-400" />, border: "border-blue-500/40 text-blue-300 bg-blue-950/40 hover:bg-blue-900/40" };
    }
  };
  const fwBadge = getFrameworkBadge();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl transition-all shadow-lg shadow-black/20 overflow-visible">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 overflow-visible">
          
          {/* ========================================================= */}
          {/* 1. LEFT: Brand & System Identity                           */}
          {/* ========================================================= */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative group flex items-center justify-center">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl blur-md opacity-25 group-hover:opacity-60 transition-opacity" />
              
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-black/50 overflow-hidden">
                {!imageError ? (
                  <img
                    src="/brand/brandmark.png"
                    alt="RatchetAI Logo"
                    className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-200"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent font-mono">
                  CONVERA
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[9px] sm:text-[10px] font-bold text-cyan-400 tracking-wide font-mono">
                  v3.0
                </span>
              </div>
              <p className="text-[9px] text-slate-400 hidden lg:block tracking-tight -mt-0.5 font-medium truncate">
                by EMAERX • Project Intelligence
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. CENTER: Active Workspace & Framework Selector Cards    */}
          {/* ========================================================= */}
          <div className="flex-1 max-w-md hidden md:flex items-center justify-center gap-2 overflow-visible">
            {/* Framework Selector Pill */}
            <Tooltip content="Switch methodology framework (Innovation, Research, Capstone, Product)" position="bottom">
              <button
                onClick={() => setIsFrameworkModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${fwBadge.border}`}
              >
                {fwBadge.icon}
                <span className="font-mono tracking-wide">{fwBadge.label}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </Tooltip>

            {session ? (
              <Tooltip content="Switch workspace, manage snapshots, or copy room share code" position="bottom">
                <button
                  onClick={onOpenSessionManager}
                  className="group w-full flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-left transition-all duration-200 shadow-sm hover:shadow-cyan-500/10"
                >
                  <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shrink-0 group-hover:scale-105 transition-transform">
                    <FolderKanban className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-white truncate leading-tight">
                        {projectName}
                      </span>
                      {session.has_passcode && (
                        <span title="PIN Protected Workspace">
                          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
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

                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-transform shrink-0" />
                </button>
              </Tooltip>
            ) : null}
          </div>

          {/* ========================================================= */}
          {/* 3. RIGHT: Identity Card, Health Bar & Utility Toolbar     */}
          {/* ========================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 overflow-visible">
            
            {/* User Profile Command Card */}
            <Tooltip content={`Active Identity: ${userProfile.name} • ${roleMeta.label} (Click to customize)`} position="bottom">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-xs transition-all duration-200 group shadow-sm hover:shadow-cyan-500/10 active:scale-[0.98]"
              >
                <div className="relative shrink-0 flex items-center justify-center">
                  <IconAvatar iconKey={userProfile.avatar} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm" />
                </div>
                <div className="flex flex-col text-left justify-center min-w-0 pr-0.5 hidden sm:flex">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-white truncate leading-snug tracking-tight max-w-[90px]">
                    {userProfile.name}
                  </span>
                  <span className={`text-[10px] font-mono font-semibold tracking-wide whitespace-nowrap leading-none ${roleMeta.text}`}>
                    {roleMeta.shortLabel}
                  </span>
                </div>
              </button>
            </Tooltip>

            {/* Venture Health Meter */}
            <VentureHealthBar session={session} />

            {/* Desktop Intelligence & Utility Toolbar */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-visible">
              {/* Intelligence Scorecard HUD Trigger */}
              {onOpenScorecard && (
                <Tooltip content="Intelligence Scorecard & Tri-Part Confidence HUD" position="bottom">
                  <button
                    onClick={onOpenScorecard}
                    className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all"
                  >
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </Tooltip>
              )}

              {/* Research Inbox Drawer Trigger */}
              {onOpenInbox && (
                <Tooltip content="Research Inbox & Document Drops" position="bottom">
                  <button
                    onClick={onOpenInbox}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/30 transition-all"
                  >
                    <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                </Tooltip>
              )}

              {/* Requirements Traceability Drawer Trigger */}
              {onOpenTraceability && (
                <Tooltip content="Requirements & Lineage Traceability Graph" position="bottom">
                  <button
                    onClick={onOpenTraceability}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all"
                  >
                    <GitMerge className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </Tooltip>
              )}

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

              <Tooltip content="User Manual & 5-Phase Playbook" position="bottom">
                <button
                  onClick={onOpenHelp}
                  className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              <Tooltip content="Quick Reference & Rubric Gates" position="bottom">
                <button
                  onClick={onOpenCheatsheet}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              <Tooltip content="Export Venture Dossier" position="bottom">
                <button
                  onClick={onExportDossier}
                  disabled={isExporting}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-all"
                >
                  <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce text-emerald-400" : ""}`} />
                </button>
              </Tooltip>
            </div>

            {/* Mobile Hamburger / Quick Actions Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-all shrink-0"
              aria-label="Open mobile command menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Command Panel */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-800/80 bg-slate-950/95 px-4 py-3 space-y-2.5 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
            {/* Workspace Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSessionManager();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-medium"
            >
              <span className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-cyan-400" />
                <span className="truncate max-w-[180px]">{projectName}</span>
              </span>
              <span className="font-mono text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Switch
              </span>
            </button>

            {/* Framework Switch Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsFrameworkModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-medium"
            >
              <span className="flex items-center gap-2">
                {fwBadge.icon}
                <span>Methodology: <strong>{fwBadge.label}</strong></span>
              </span>
              <span className="font-mono text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Change
              </span>
            </button>

            {/* Grid of Quick Actions */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {onOpenScorecard && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenScorecard();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300"
                >
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scorecard HUD</span>
                </button>
              )}

              {onOpenInbox && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenInbox();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-indigo-300"
                >
                  <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Research Inbox</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSecurityModalOpen(true);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Room PIN</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenHelp();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Playbook</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCheatsheet();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cheatsheet</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onExportDossier();
                }}
                disabled={isExporting}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Dossier</span>
              </button>
            </div>
          </div>
        )}
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
        />
      )}

      {/* Framework Selector Modal */}
      <FrameworkSelectorModal
        isOpen={isFrameworkModalOpen}
        onClose={() => setIsFrameworkModalOpen(false)}
        session={session}
        onFrameworkChanged={(updated) => {
          if (onFrameworkChanged) {
            onFrameworkChanged(updated);
          }
        }}
      />
    </>
  );
};
