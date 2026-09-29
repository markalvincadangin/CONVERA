"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { OrchestrationStageStatus } from "@/services/orchestratorService";
import { Button } from "@/components/common/Button";

interface StageGateMonitorProps {
  stageStatus: OrchestrationStageStatus;
  onOpenGateReview?: () => void;
}

export const StageGateMonitor: React.FC<StageGateMonitorProps> = ({
  stageStatus,
  onOpenGateReview,
}) => {
  const {
    stage_id,
    stage_name,
    stage_index,
    prerequisites_satisfied,
    missing_prerequisites,
    required_outputs,
    missing_outputs,
    gate_ready,
  } = stageStatus;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3.5 backdrop-blur-sm">
      {/* Header with Stage and Gate Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Active Stage {stage_index + 1}
            </div>
            <h4 className="text-sm font-semibold text-neutral-100 tracking-tight">
              {stage_name}
            </h4>
          </div>
        </div>

        <div>
          {gate_ready ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              <Unlock className="w-3 h-3" />
              Gate Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400 border border-amber-500/20">
              <Lock className="w-3 h-3" />
              Gate Locked
            </span>
          )}
        </div>
      </div>

      {/* Grid: Prerequisites vs Required Outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Prerequisites Column */}
        <div className="space-y-1.5 rounded-lg bg-neutral-950/40 p-2.5 border border-neutral-800/40">
          <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400">
            <span>Input Prerequisites</span>
            {prerequisites_satisfied ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Satisfied
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 text-[10px]">
                <AlertCircle className="w-3 h-3" /> Incomplete
              </span>
            )}
          </div>

          {missing_prerequisites.length > 0 ? (
            <ul className="space-y-1 pt-1">
              {missing_prerequisites.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[11px] text-amber-300/80"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-neutral-400 pt-0.5">
              All baseline inputs verified for this stage.
            </p>
          )}
        </div>

        {/* Required Deliverables Column */}
        <div className="space-y-1.5 rounded-lg bg-neutral-950/40 p-2.5 border border-neutral-800/40">
          <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400">
            <span>Stage Deliverables</span>
            {missing_outputs.length === 0 ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                <FileCheck className="w-3 h-3" /> Complete
              </span>
            ) : (
              <span className="text-neutral-400 text-[10px]">
                {required_outputs.length - missing_outputs.length}/{required_outputs.length}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {required_outputs.map((out, i) => {
              const isMissing = missing_outputs.includes(out);
              return (
                <span
                  key={i}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                    isMissing
                      ? "bg-neutral-800/80 text-neutral-400 border border-neutral-700/50"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {isMissing ? "○ " : "● "}
                  {out}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gate Review Trigger if Ready */}
      {gate_ready && onOpenGateReview && (
        <div className="pt-1 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenGateReview}
            className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 text-xs"
            leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />}
          >
            Review Quality Gate
          </Button>
        </div>
      )}
    </div>
  );
};
