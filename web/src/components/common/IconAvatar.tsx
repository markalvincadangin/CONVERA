"use client";

import React from "react";
import {
  Crown,
  Microscope,
  GraduationCap,
  Scale,
  Rocket,
  Cpu,
  Code2,
  Wrench,
  Database,
  BarChart3,
  Sprout,
  HeartPulse,
  Building2,
  ShoppingBag,
  CreditCard,
  Truck,
  Lightbulb,
  Zap,
  Flame,
  Target,
  Compass,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

export type AvatarCategory = "ROLES" | "BUILDERS" | "DOMAINS" | "STRATEGY";

export interface AvatarOption {
  id: string;
  label: string;
  category: AvatarCategory;
  bg: string;
  text: string;
  border: string;
  glow: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AVATAR_LIBRARY: AvatarOption[] = [
  // 1. Core Venture Roles
  {
    id: "founder",
    label: "Founder / Team Lead",
    category: "ROLES",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    icon: Crown,
  },
  {
    id: "researcher",
    label: "Field Researcher",
    category: "ROLES",
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
    icon: Microscope,
  },
  {
    id: "mentor",
    label: "Mentor / Professor",
    category: "ROLES",
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/20",
    icon: GraduationCap,
  },
  {
    id: "judge",
    label: "Judge / Evaluator",
    category: "ROLES",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    icon: Scale,
  },

  // 2. Technical & Builders
  {
    id: "rocket",
    label: "Venture Builder",
    category: "BUILDERS",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    icon: Rocket,
  },
  {
    id: "cpu",
    label: "AI & DeepTech Architect",
    category: "BUILDERS",
    bg: "bg-violet-500/15",
    text: "text-violet-400",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20",
    icon: Cpu,
  },
  {
    id: "code",
    label: "Full-Stack Engineer",
    category: "BUILDERS",
    bg: "bg-indigo-500/15",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    glow: "shadow-indigo-500/20",
    icon: Code2,
  },
  {
    id: "wrench",
    label: "Hardware & Systems",
    category: "BUILDERS",
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    border: "border-slate-500/30",
    glow: "shadow-slate-500/20",
    icon: Wrench,
  },
  {
    id: "database",
    label: "Data & Storage Specialist",
    category: "BUILDERS",
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    border: "border-teal-500/30",
    glow: "shadow-teal-500/20",
    icon: Database,
  },
  {
    id: "chart",
    label: "Quantitative Analyst",
    category: "BUILDERS",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    icon: BarChart3,
  },

  // 3. Domains & Industry Specialties
  {
    id: "sprout",
    label: "Agritech & Marine Pioneer",
    category: "DOMAINS",
    bg: "bg-green-500/15",
    text: "text-green-400",
    border: "border-green-500/30",
    glow: "shadow-green-500/20",
    icon: Sprout,
  },
  {
    id: "health",
    label: "HealthTech & MedTech",
    category: "DOMAINS",
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/30",
    glow: "shadow-rose-500/20",
    icon: HeartPulse,
  },
  {
    id: "civic",
    label: "Civic & Public Sector",
    category: "DOMAINS",
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    border: "border-sky-500/30",
    glow: "shadow-sky-500/20",
    icon: Building2,
  },
  {
    id: "commerce",
    label: "MSME & Retail Commerce",
    category: "DOMAINS",
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
    icon: ShoppingBag,
  },
  {
    id: "fintech",
    label: "Fintech & DeFi Architect",
    category: "DOMAINS",
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
    icon: CreditCard,
  },
  {
    id: "logistics",
    label: "Logistics & Supply Chain",
    category: "DOMAINS",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    icon: Truck,
  },

  // 4. Strategy & Catalysts
  {
    id: "lightbulb",
    label: "Ideator & Concept Pioneer",
    category: "STRATEGY",
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/20",
    icon: Lightbulb,
  },
  {
    id: "zap",
    label: "Growth Catalyst",
    category: "STRATEGY",
    bg: "bg-fuchsia-500/15",
    text: "text-fuchsia-400",
    border: "border-fuchsia-500/30",
    glow: "shadow-fuchsia-500/20",
    icon: Zap,
  },
  {
    id: "flame",
    label: "Devils Advocate Tester",
    category: "STRATEGY",
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    icon: Flame,
  },
  {
    id: "target",
    label: "Customer Discovery",
    category: "STRATEGY",
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
    icon: Target,
  },
  {
    id: "compass",
    label: "Strategic Navigator",
    category: "STRATEGY",
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    border: "border-sky-500/30",
    glow: "shadow-sky-500/20",
    icon: Compass,
  },
  {
    id: "shield",
    label: "Compliance & Security",
    category: "STRATEGY",
    bg: "bg-indigo-500/15",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    glow: "shadow-indigo-500/20",
    icon: ShieldCheck,
  },
  {
    id: "sparkles",
    label: "Product Designer / UX",
    category: "STRATEGY",
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    border: "border-pink-500/30",
    glow: "shadow-pink-500/20",
    icon: Sparkles,
  },
  {
    id: "trophy",
    label: "Closer & Champion",
    category: "STRATEGY",
    bg: "bg-amber-500/20",
    text: "text-amber-300",
    border: "border-amber-500/40",
    glow: "shadow-amber-500/30",
    icon: Trophy,
  },
];

// Helper to normalize input string to a valid avatar key
export function normalizeAvatarKey(input?: string): string {
  if (!input) return "founder";
  const s = input.toLowerCase().trim();

  const found = AVATAR_LIBRARY.find((a) => a.id === s);
  if (found) return found.id;

  if (s.includes("crown") || s.includes("founder") || s.includes("lead")) return "founder";
  if (s.includes("microscope") || s.includes("research") || s.includes("science")) return "researcher";
  if (s.includes("grad") || s.includes("mentor") || s.includes("prof")) return "mentor";
  if (s.includes("scale") || s.includes("judge") || s.includes("eval")) return "judge";
  if (s.includes("rocket") || s.includes("build")) return "rocket";
  if (s.includes("cpu") || s.includes("ai")) return "cpu";
  if (s.includes("code") || s.includes("dev")) return "code";
  if (s.includes("wrench") || s.includes("tool") || s.includes("system")) return "wrench";
  if (s.includes("database") || s.includes("db")) return "database";
  if (s.includes("chart") || s.includes("analyst") || s.includes("data")) return "chart";
  if (s.includes("sprout") || s.includes("agri") || s.includes("farm") || s.includes("fish")) return "sprout";
  if (s.includes("health") || s.includes("med") || s.includes("doctor") || s.includes("nurse")) return "health";
  if (s.includes("civic") || s.includes("gov") || s.includes("city")) return "civic";
  if (s.includes("commerce") || s.includes("retail") || s.includes("shop")) return "commerce";
  if (s.includes("fintech") || s.includes("bank") || s.includes("pay")) return "fintech";
  if (s.includes("logistics") || s.includes("truck") || s.includes("supply")) return "logistics";
  if (s.includes("bulb") || s.includes("idea")) return "lightbulb";
  if (s.includes("zap") || s.includes("energy")) return "zap";
  if (s.includes("flame") || s.includes("fire")) return "flame";
  if (s.includes("target") || s.includes("focus")) return "target";
  if (s.includes("compass") || s.includes("nav")) return "compass";
  if (s.includes("shield") || s.includes("sec")) return "shield";
  if (s.includes("sparkles") || s.includes("design") || s.includes("ux")) return "sparkles";
  if (s.includes("trophy") || s.includes("champ")) return "trophy";

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
  const cfg = AVATAR_LIBRARY.find((o) => o.id === normKey) || AVATAR_LIBRARY[0];
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
