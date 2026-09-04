"use client";

import React from "react";
import { Sparkles, Zap, Cpu, Layers, AlertTriangle } from "lucide-react";

export interface ModelMetadata {
  provider?: string;
  model?: string;
  display_name?: string;
  latency_seconds?: number;
  is_degraded?: boolean;
  fallback_reason?: string;
}

interface ModelAttributionBadgeProps {
  meta?: ModelMetadata | null;
  className?: string;
}

export const ModelAttributionBadge: React.FC<ModelAttributionBadgeProps> = ({
  meta,
  className = "",
}) => {
  if (!meta) return null;

  // Degraded / Synthetic Fallback indicator
  if (meta.is_degraded) {
    return (
      <div
        title={
          meta.fallback_reason
            ? `Degraded Offline Scaffolding: ${meta.fallback_reason}`
            : "Operating in degraded offline mode (deterministic scaffolding)"
        }
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-tight bg-gradient-to-r from-amber-950/70 to-orange-950/70 border border-amber-500/50 text-amber-300 backdrop-blur-md shadow-sm transition-all hover:scale-105 select-none ${className}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span className="font-semibold text-amber-200">Degraded Scaffolding</span>
        {meta.latency_seconds !== undefined && (
          <span className="text-[10px] text-amber-400/80 font-mono border-l border-amber-700/60 pl-1.5 ml-0.5">
            {meta.latency_seconds}s
          </span>
        )}
      </div>
    );
  }

  if (!meta.display_name) return null;

  const provider = meta.provider?.toLowerCase() || "gemini";

  let badgeColor = "from-cyan-950/60 to-blue-950/60 border-cyan-500/30 text-cyan-300";
  let IconComponent = Sparkles;

  if (provider === "groq") {
    badgeColor = "from-amber-950/60 to-orange-950/60 border-amber-500/30 text-amber-300";
    IconComponent = Zap;
  } else if (provider === "openrouter") {
    badgeColor = "from-indigo-950/60 to-purple-950/60 border-indigo-500/30 text-indigo-300";
    IconComponent = Cpu;
  } else if (provider === "ollama") {
    badgeColor = "from-emerald-950/60 to-teal-950/60 border-emerald-500/30 text-emerald-300";
    IconComponent = Layers;
  }

  return (
    <div
      title={`Synthesized via ${meta.display_name} (${meta.latency_seconds || 0}s)`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-tight bg-gradient-to-r border backdrop-blur-md shadow-sm transition-all hover:scale-105 select-none ${badgeColor} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span className="font-semibold text-slate-100">{meta.display_name}</span>
      {meta.latency_seconds !== undefined && (
        <span className="text-[10px] text-slate-400 font-mono border-l border-slate-700/60 pl-1.5 ml-0.5">
          {meta.latency_seconds}s
        </span>
      )}
    </div>
  );
};
