"use client";

import React from "react";
import { AlertTriangle, Trash2, Check, X } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-400" />,
          iconBg: "bg-rose-500/15 border-rose-500/30",
          confirmBtnVariant: "danger" as const,
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          iconBg: "bg-amber-500/15 border-amber-500/30",
          confirmBtnVariant: "secondary" as const,
        };
      default:
        return {
          icon: <Check className="w-5 h-5 text-cyan-400" />,
          iconBg: "bg-cyan-500/15 border-cyan-500/30",
          confirmBtnVariant: "primary" as const,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="sm">
      <div className="pt-1 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-2xl border shrink-0 ${vStyles.iconBg}`}>
            {vStyles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-100 tracking-tight leading-snug">
              {title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-white"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={vStyles.confirmBtnVariant}
            size="sm"
            onClick={() => {
              onConfirm();
            }}
            isLoading={isLoading}
            className="text-xs font-semibold px-4"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
