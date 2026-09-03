"use client";

import React from "react";
import { UserRole } from "@/lib/types";
import { Crown, Microscope, GraduationCap, Scale } from "lucide-react";

interface UserRoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  size = "sm",
  showIcon = true,
}) => {
  const configs: Record<
    UserRole,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    FOUNDER_LEAD: {
      label: "Founder / Lead",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      icon: <Crown className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />,
    },
    RESEARCHER: {
      label: "Researcher",
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      icon: <Microscope className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />,
    },
    MENTOR_PROFESSOR: {
      label: "Mentor / Prof",
      bg: "bg-purple-500/10",
      text: "text-purple-300",
      border: "border-purple-500/30",
      icon: <GraduationCap className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />,
    },
    EVALUATOR_JUDGE: {
      label: "Judge",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      icon: <Scale className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />,
    },
  };

  const c = configs[role] || configs.RESEARCHER;
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold rounded-full border ${c.bg} ${c.text} ${c.border} ${padding}`}
    >
      {showIcon && c.icon}
      <span>{c.label}</span>
    </span>
  );
};
