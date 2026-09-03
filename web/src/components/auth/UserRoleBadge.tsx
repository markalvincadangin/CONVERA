"use client";

import React from "react";
import { UserRole } from "@/lib/types";
import { Crown, Microscope, GraduationCap, Scale } from "lucide-react";

export function getRoleMeta(role: UserRole) {
  switch (role) {
    case "FOUNDER_LEAD":
      return {
        label: "Founder / Lead",
        shortLabel: "Founder",
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        icon: Crown,
      };
    case "RESEARCHER":
      return {
        label: "Researcher",
        shortLabel: "Researcher",
        text: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/30",
        icon: Microscope,
      };
    case "MENTOR_PROFESSOR":
      return {
        label: "Mentor / Prof",
        shortLabel: "Mentor",
        text: "text-purple-300",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        icon: GraduationCap,
      };
    case "EVALUATOR_JUDGE":
      return {
        label: "Pitch Judge",
        shortLabel: "Judge",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        icon: Scale,
      };
    default:
      return {
        label: "Team Member",
        shortLabel: "Member",
        text: "text-slate-300",
        bg: "bg-slate-500/10",
        border: "border-slate-500/30",
        icon: Crown,
      };
  }
}

interface UserRoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  size = "sm",
  showIcon = true,
  className = "",
}) => {
  const meta = getRoleMeta(role);
  const IconComp = meta.icon;
  const padding =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold whitespace-nowrap rounded-md border ${meta.bg} ${meta.text} ${meta.border} ${padding} ${className}`}
    >
      {showIcon && <IconComp className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />}
      <span className="whitespace-nowrap">{meta.label}</span>
    </span>
  );
};
