"use client";

import React from "react";
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle,
  Cpu,
} from "lucide-react";
import { RecommendedAction } from "@/services/orchestratorService";
import { Button } from "@/components/common/Button";

interface RecommendedActionCardProps {
  action: RecommendedAction;
  onDispatch: (action: RecommendedAction) => Promise<void>;
  isDispatching?: boolean;
}

export const RecommendedActionCard: React.FC<RecommendedActionCardProps> = ({
  action,
  onDispatch,
  isDispatching = false,
}) => {
  const {
    title,
    description,
    priority,
    blocking_stage_progression,
    target_engine,
    action_type,
  } = action;

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case "URGENT":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "HIGH":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "MEDIUM":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
      default:
        return "bg-neutral-800 border-neutral-700 text-neutral-400";
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-all ${
        blocking_stage_progression
          ? "border-amber-500/30 bg-gradient-to-br from-neutral-900/90 to-amber-950/10"
          : "border-neutral-800 bg-neutral-900/60"
      } backdrop-blur-sm`}
    >
      {/* Priority and Engine Tag Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${getPriorityStyle(
              priority
            )}`}
          >
            {priority === "URGENT" && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
            )}
            {priority}
          </span>

          <span className="inline-flex items-center gap-1 rounded bg-neutral-800/90 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-neutral-700/50">
            <Cpu className="w-3 h-3 text-cyan-400" />
            {target_engine}
          </span>
        </div>

        {blocking_stage_progression && (
          <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Blocking Progression
          </span>
        )}
      </div>

      {/* Action Content */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-neutral-100 tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-neutral-300 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Dispatch Trigger Button */}
      <div className="pt-1 flex items-center justify-between">
        <span className="text-[10px] text-neutral-400 font-mono">
          Action: {action_type}
        </span>
        <Button
          variant={priority === "URGENT" ? "danger" : "primary"}
          size="sm"
          onClick={() => onDispatch(action)}
          disabled={isDispatching}
          className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 text-xs shadow-md"
          leftIcon={
            isDispatching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )
          }
        >
          {isDispatching ? "Executing..." : "Dispatch Action"}
        </Button>
      </div>
    </div>
  );
};
