"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { UserRoleBadge } from "./UserRoleBadge";
import {
  IconAvatar,
  AVATAR_LIBRARY,
  AvatarCategory,
  normalizeAvatarKey,
} from "@/components/common/IconAvatar";
import { UserProfile, UserRole } from "@/lib/types";
import { authService, DEFAULT_USER } from "@/services/authService";
import {
  Crown,
  Microscope,
  GraduationCap,
  Scale,
  Sparkles,
  Check,
  Shield,
  Palette,
  Layers,
  Sparkle,
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
  projectId?: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  projectId,
}) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | AvatarCategory>("ALL");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const u = authService.getCurrentUser();
      setProfile(u);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    authService.saveCurrentUser(profile);
    if (projectId) {
      await authService.joinOrUpdateMember(projectId, profile);
    }
    if (onProfileUpdated) {
      onProfileUpdated(profile);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const roleOptions: {
    role: UserRole;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      role: "FOUNDER_LEAD",
      title: "Founder / Team Lead",
      description: "Full edit permissions, advance phase gates, run AI synthesis, and export deliverables.",
      icon: <Crown className="w-4 h-4 text-amber-400" />,
    },
    {
      role: "RESEARCHER",
      title: "Team Researcher",
      description: "Log problem observations, cast priority votes, run Devil's Advocate challenges, and add field notes.",
      icon: <Microscope className="w-4 h-4 text-cyan-400" />,
    },
    {
      role: "MENTOR_PROFESSOR",
      title: "Mentor / Professor",
      description: "Review dossiers, leave Socratic feedback notes, verify rubric scores, and approve phase gates.",
      icon: <GraduationCap className="w-4 h-4 text-purple-400" />,
    },
    {
      role: "EVALUATOR_JUDGE",
      title: "Pitch Judge / Evaluator",
      description: "Read-only access to Deliverables Studio (Lean Canvas, SWOT, 10-Slide Pitch Deck) with rubric evaluation.",
      icon: <Scale className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const currentKey = normalizeAvatarKey(profile.avatar);

  const filteredAvatars =
    selectedCategory === "ALL"
      ? AVATAR_LIBRARY
      : AVATAR_LIBRARY.filter((a) => a.category === selectedCategory);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Member Profile & Avatar Studio"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Header: Active Preview & Name Configuration */}
        <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/90 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Big Active Avatar Preview with Glow */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="relative">
                <IconAvatar iconKey={profile.avatar} size="xl" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-md animate-pulse" />
              </div>
            </div>

            {/* Name Input & Live Live Navbar Pill Preview */}
            <div className="flex-1 min-w-0 space-y-1.5 w-full">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                Your Display Name & Identity
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="e.g. Maria Santos (Team Lead)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
              />
              
              {/* Mini Navbar Preview Pill */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="font-mono text-[10px] uppercase text-slate-500">Live Preview:</span>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs shadow-sm">
                  <IconAvatar iconKey={profile.avatar} size="xs" />
                  <span className="font-bold text-slate-200 truncate max-w-[120px]">
                    {profile.name || "Anonymous User"}
                  </span>
                  <div className="scale-90 origin-left">
                    <UserRoleBadge role={profile.role} size="sm" showIcon={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Icon Library Browser */}
        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              Select Avatar Icon ({AVATAR_LIBRARY.length} Vector SVGs)
            </label>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
              {[
                { id: "ALL", label: "All (24)" },
                { id: "ROLES", label: "👑 Roles" },
                { id: "BUILDERS", label: "⚡ Builders" },
                { id: "DOMAINS", label: "🌾 Domains" },
                { id: "STRATEGY", label: "🎯 Strategy" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-2 py-0.5 rounded-lg border transition-all ${
                    selectedCategory === cat.id
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-sm"
                      : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Avatar Icons */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredAvatars.map((opt) => {
              const isSelected = currentKey === opt.id;
              const IconComp = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProfile({ ...profile, avatar: opt.id })}
                  className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                    isSelected
                      ? `${opt.bg} ${opt.text} border-2 border-cyan-400 scale-105 shadow-md shadow-cyan-500/20 ring-2 ring-cyan-400/40`
                      : "bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 hover:scale-105"
                  }`}
                  title={opt.label}
                >
                  <IconComp className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-[9px] font-medium tracking-tight truncate w-full text-center mt-1 text-slate-400 group-hover:text-slate-200">
                    {opt.id}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Role Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Select Your Role in this Venture
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {roleOptions.map((opt) => {
              const isSelected = profile.role === opt.role;
              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setProfile({ ...profile, role: opt.role })}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between gap-2.5 transition-all ${
                    isSelected
                      ? "bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/30"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {opt.icon}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          {opt.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
            leftIcon={savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
          >
            {savedSuccess ? "Saved Profile!" : "Save Profile & Role"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
