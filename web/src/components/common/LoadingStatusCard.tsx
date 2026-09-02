"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, StopCircle, Radio } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";

interface LoadingStatusCardProps {
  title?: string;
  stages?: string[];
  onCancel?: () => void;
  className?: string;
}

export const LoadingStatusCard: React.FC<LoadingStatusCardProps> = ({
  title = "AI Agent Research in Progress",
  stages = [
    "Querying regional agricultural databases & local news archives...",
    "Extracting specific sufferer roles & Panay geographic anchors...",
    "Categorizing observed coping workarounds & economic consequences...",
    "Grading evidence tiers (Signal vs. Documented) & screening red flags...",
  ],
  onCancel,
  className = "",
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const stageInterval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev + 1) % stages.length);
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(stageInterval);
    };
  }, [stages.length]);

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card variant="glass" className={`p-8 text-center space-y-6 border-cyan-500/30 ${className}`}>
      {/* Animated Radar Pulse Icon */}
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 animate-ping opacity-60" />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
        </div>
      </div>

      {/* Title & Stage Details */}
      <div className="space-y-2 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            {formatElapsed(elapsedSeconds)}
          </span>
        </div>

        <p className="text-xs text-slate-300 transition-all duration-300 min-h-[2.5rem] flex items-center justify-center">
          {stages[currentStageIdx]}
        </p>
      </div>

      {/* Progress Bar Animation */}
      <div className="w-full max-w-xs mx-auto bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 h-full w-2/3 rounded-full animate-[shimmer_2s_infinite]" />
      </div>

      {/* User Control: Cancel Button */}
      {onCancel && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            leftIcon={<StopCircle className="w-3.5 h-3.5 text-rose-400" />}
          >
            Cancel Request
          </Button>
        </div>
      )}
    </Card>
  );
};
