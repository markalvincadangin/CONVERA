"use client";

import React from "react";
import {
  Crown,
  Microscope,
  GraduationCap,
  Scale,
  Rocket,
  Lightbulb,
  BarChart3,
  Wrench,
  Sprout,
  Zap,
  ShieldCheck,
  Target,
  User,
  Sparkles,
} from "lucide-react";

export type AvatarIconKey =
  | "founder"
  | "researcher"
  | "mentor"
  | "judge"
  | "rocket"
  | "lightbulb"
  | "chart"
  | "wrench"
  | "sprout"
  | "zap"
  | "shield"
  | "target"
  | "user";

export const AVATAR_OPTIONS: {
  id: AvatarIconKey;
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "founder",
    label: "Founder / Lead",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: Crown,
  },
  {
    id: "researcher",
    label: "Researcher",
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    icon: Microscope,
  },
  {
    id: "mentor",
    label: "Mentor / Prof",
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-500/30",
    icon: GraduationCap,
  },
  {
    id: "judge",
    label: "Judge / Evaluator",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: Scale,
  },
  {
    id: "rocket",
    label: "Venture Builder",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: Rocket,
  },
  {
    id: "lightbulb",
    label: "Ideator",
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    icon: Lightbulb,
  },
  {
    id: "chart",
    label: "Data Analyst",
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    border: "border-teal-500/30",
    icon: BarChart3,
  },
  {
    id: "wrench",
    label: "Systems Engineer",
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    border: "border-slate-500/30",
    icon: Wrench,
  },
  {
    id: "sprout",
    label: "Agritech / Growth",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: Sprout,
  },
  {
    id: "zap",
    label: "Catalyst",
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/30",
    icon: Zap,
  },
];

// Helper to normalize legacy emojis or string IDs
export function normalizeAvatarKey(input?: string): AvatarIconKey {
  if (!input) return "founder";
  const s = input.toLowerCase();
  if (s.includes("crown") || s.includes("founder") || s.includes("👩‍💻") || s.includes("lead")) return "founder";
  if (s.includes("microscope") || s.includes("research") || s.includes("👨‍🔬") || s.includes("science")) return "researcher";
  if (s.includes("grad") || s.includes("mentor") || s.includes("prof") || s.includes("🎓")) return "mentor";
  if (s.includes("scale") || s.includes("judge") || s.includes("⚖️")) return "judge";
  if (s.includes("rocket") || s.includes("🚀")) return "rocket";
  if (s.includes("bulb") || s.includes("light") || s.includes("💡")) return "lightbulb";
  if (s.includes("chart") || s.includes("bar") || s.includes("📊")) return "chart";
  if (s.includes("wrench") || s.includes("tool") || s.includes("🛠️")) return "wrench";
  if (s.includes("sprout") || s.includes("plant") || s.includes("🌱")) return "sprout";
  if (s.includes("zap") || s.includes("energy") || s.includes("⚡")) return "zap";
  return "founder";
}

interface IconAvatarProps {
  iconKey?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const IconAvatar: React.FC<IconAvatarProps> = ({
  iconKey = "founder",
  size = "md",
  className = "",
}) => {
  const normKey = normalizeAvatarKey(iconKey);
  const cfg = AVATAR_OPTIONS.find((o) => o.id === normKey) || AVATAR_OPTIONS[0];
  const IconComp = cfg.icon;

  const sizeClasses: Record<string, { box: string; icon: string }> = {
    xs: { box: "w-5 h-5 rounded-md", icon: "w-3 h-3" },
    sm: { box: "w-7 h-7 rounded-lg", icon: "w-3.5 h-3.5" },
    md: { box: "w-9 h-9 rounded-xl", icon: "w-4 h-4" },
    lg: { box: "w-11 h-11 rounded-2xl", icon: "w-5 h-5" },
    xl: { box: "w-14 h-14 rounded-2xl", icon: "w-6 h-6" },
  };

  const s = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`inline-flex items-center justify-center border shadow-inner shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border} ${s.box} ${className}`}
      title={cfg.label}
    >
      <IconComp className={s.icon} />
    </div>
  );
};
