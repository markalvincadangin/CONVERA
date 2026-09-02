"use client";

import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle, Info, RefreshCw, X } from "lucide-react";
import { Button } from "./Button";

interface AlertBannerProps {
  type?: "error" | "warning" | "info" | "success";
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = "error",
  title,
  message,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = "",
}) => {
  const configs = {
    error: {
      bg: "bg-rose-950/50 border-rose-500/40 text-rose-200",
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
      defaultTitle: "Operation Failed",
    },
    warning: {
      bg: "bg-amber-950/50 border-amber-500/40 text-amber-200",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
      defaultTitle: "Warning",
    },
    info: {
      bg: "bg-cyan-950/50 border-cyan-500/40 text-cyan-200",
      icon: <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />,
      defaultTitle: "System Notice",
    },
    success: {
      bg: "bg-emerald-950/50 border-emerald-500/40 text-emerald-200",
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
      defaultTitle: "Success",
    },
  };

  const config = configs[type];

  return (
    <div
      role="alert"
      className={`p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${config.bg} ${className}`}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="space-y-0.5">
          <h5 className="text-sm font-bold tracking-tight text-white">
            {title || config.defaultTitle}
          </h5>
          <p className="text-xs opacity-90 leading-relaxed font-normal">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onRetry && (
          <Button
            variant={type === "error" ? "primary" : "secondary"}
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Now
          </Button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
