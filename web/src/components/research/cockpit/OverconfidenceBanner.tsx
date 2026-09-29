"use client";

import React from "react";
import { ShieldAlert, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/common/Button";

interface OverconfidenceBannerProps {
  details: string;
  onChallenge: () => void;
  isDispatching?: boolean;
}

export const OverconfidenceBanner: React.FC<OverconfidenceBannerProps> = ({
  details,
  onChallenge,
  isDispatching = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 shadow-lg backdrop-blur-md">
      {/* Subtle background glow */}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Article II Tri-Part Guardrail: Overconfidence Risk
              </span>
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
                Stage Advancement Blocked
              </span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed max-w-3xl">
              {details}
            </p>
          </div>
        </div>

        <div className="sm:self-center shrink-0 w-full sm:w-auto">
          <Button
            variant="danger"
            size="sm"
            onClick={onChallenge}
            disabled={isDispatching}
            className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-rose-950/50 shadow-md"
            leftIcon={
              isDispatching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )
            }
          >
            {isDispatching ? "Challenging..." : "Challenge Claim"}
          </Button>
        </div>
      </div>
    </div>
  );
};
