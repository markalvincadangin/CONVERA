"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "emerald" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 border border-cyan-400/30 focus-visible:ring-cyan-400",
    secondary:
      "bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600 shadow-sm focus-visible:ring-slate-400",
    emerald:
      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 border border-emerald-400/30 focus-visible:ring-emerald-400",
    danger:
      "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/20 hover:shadow-rose-600/35 border border-rose-400/30 focus-visible:ring-rose-400",
    outline:
      "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 focus-visible:ring-cyan-400",
    ghost:
      "bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-white focus-visible:ring-cyan-400",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-xs font-semibold sm:text-sm px-4 py-2 gap-2",
    lg: "text-sm sm:text-base px-6 py-2.5 gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} whitespace-nowrap ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span className="inline-flex items-center whitespace-nowrap">{children}</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
          {leftIcon && <span className="shrink-0 inline-flex items-center">{leftIcon}</span>}
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">{children}</span>
          {rightIcon && <span className="shrink-0 inline-flex items-center">{rightIcon}</span>}
        </span>
      )}
    </button>
  );
};
