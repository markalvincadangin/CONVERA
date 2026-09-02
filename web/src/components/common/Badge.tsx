"use client";

import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "cyan" | "emerald" | "amber" | "rose" | "purple" | "slate" | "blue";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "slate",
  size = "md",
  dot = false,
  className = "",
}) => {
  const variantStyles = {
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    slate: "bg-slate-800/80 text-slate-300 border-slate-700/60",
  };

  const dotColors = {
    cyan: "bg-cyan-400 animate-pulse",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400 animate-pulse",
    rose: "bg-rose-400",
    purple: "bg-purple-400",
    blue: "bg-blue-400",
    slate: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 font-mono",
    md: "text-[11px] px-2.5 py-1 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border backdrop-blur-sm tracking-wide shadow-sm select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      <span>{children}</span>
    </span>
  );
};
