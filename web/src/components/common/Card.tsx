import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered" | "glow" | "dark";
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = "glass",
  hoverEffect = false,
  ...props
}) => {
  const base = "rounded-2xl transition-all duration-300 relative overflow-hidden";

  const variants = {
    glass:
      "bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl shadow-black/40 text-slate-100",
    bordered: "bg-slate-900 border border-slate-700/80 text-slate-100",
    default: "bg-slate-900 text-slate-100",
    dark: "bg-slate-950/80 border border-slate-900 text-slate-100",
    glow: "bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5 text-slate-100",
  };

  const hover = hoverEffect
    ? "hover:border-slate-700 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-0.5"
    : "";

  return (
    <div className={twMerge(clsx(base, variants[variant], hover, className))} {...props}>
      {children}
    </div>
  );
};
