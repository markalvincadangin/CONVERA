"use client";

import React from "react";
import { LucideIcon, Sparkles } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  isLoading = false,
  className = "",
}) => {
  return (
    <Card variant="glass" className={`p-10 text-center space-y-5 border-slate-800/80 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-normal">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={onAction}
            isLoading={isLoading}
            leftIcon={actionIcon}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </Card>
  );
};
