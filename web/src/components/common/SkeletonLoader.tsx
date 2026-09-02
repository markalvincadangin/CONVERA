"use client";

import React from "react";

interface SkeletonLoaderProps {
  variant?: "card" | "table" | "text" | "stats";
  lines?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = "card",
  lines = 4,
  className = "",
}) => {
  if (variant === "text") {
    return (
      <div className={`space-y-2.5 animate-pulse ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 bg-slate-800/80 rounded-md"
            style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
          />
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={`rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-4 animate-pulse ${className}`}>
        {/* Table Header Skeleton */}
        <div className="flex gap-4 pb-3 border-b border-slate-800">
          <div className="h-4 bg-slate-800 rounded w-20" />
          <div className="h-4 bg-slate-800 rounded w-48" />
          <div className="h-4 bg-slate-800 rounded flex-1" />
          <div className="h-4 bg-slate-800 rounded w-28" />
        </div>
        {/* Table Rows Skeleton */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2 border-b border-slate-800/40 last:border-0">
            <div className="h-3 bg-slate-800/60 rounded w-16" />
            <div className="h-3 bg-slate-800/60 rounded w-40" />
            <div className="h-3 bg-slate-800/60 rounded flex-1" />
            <div className="h-3 bg-slate-800/60 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md space-y-4 animate-pulse ${className}`}>
      <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
        <div className="h-5 bg-slate-800 rounded w-1/3" />
        <div className="h-5 bg-slate-800 rounded-full w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-800/70 rounded w-full" />
        <div className="h-3.5 bg-slate-800/70 rounded w-5/6" />
        <div className="h-3.5 bg-slate-800/70 rounded w-2/3" />
      </div>
    </div>
  );
};
