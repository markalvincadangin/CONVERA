"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserProfile, UserRole } from "@/lib/types";
import { authService, DEFAULT_USER } from "@/services/authService";
import {
  User,
  Crown,
  Microscope,
  GraduationCap,
  Scale,
  Sparkles,
  Check,
  Shield,
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
  projectId?: string;
}

const AVATARS = ["👩‍💻", "👨‍🔬", "🎓", "⚖️", "🚀", "💡", "📊", "🛠️", "🌱", "⚡"];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  projectId,
}) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
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
    }, 600);
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
      description: "Log problem observations, cast priority votes, run Devil's Advocate challenges, and add notes.",
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Member Profile & Role Selection"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Active Avatar & Name Input */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
              {profile.avatar}
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Your Display Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="e.g. Maria Santos (Team Lead)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Avatar Selector */}
          <div className="space-y-1.5 pt-2 border-t border-slate-900">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setProfile({ ...profile, avatar: emoji })}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    profile.avatar === emoji
                      ? "bg-cyan-500/20 border-2 border-cyan-400 scale-110 shadow-md shadow-cyan-500/10"
                      : "bg-slate-900 hover:bg-slate-800 border border-slate-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Role Selector Grid */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Select Your Role in this Workspace
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {roleOptions.map((opt) => {
              const isSelected = profile.role === opt.role;
              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setProfile({ ...profile, role: opt.role })}
                  className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all ${
                    isSelected
                      ? "bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/30"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {opt.icon}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {opt.title}
                        </span>
                        <UserRoleBadge role={opt.role} size="sm" showIcon={false} />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
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
