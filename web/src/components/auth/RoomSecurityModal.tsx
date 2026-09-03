"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { authService } from "@/services/authService";
import { Lock, Key, Check, ShieldAlert, AlertCircle } from "lucide-react";

interface RoomSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  mode: "SET_PASSCODE" | "VERIFY_PASSCODE";
  onVerified?: () => void;
}

export const RoomSecurityModal: React.FC<RoomSecurityModalProps> = ({
  isOpen,
  onClose,
  projectId,
  mode,
  onVerified,
}) => {
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!passcode.trim()) {
      setErrorMsg("Please enter a 4-digit PIN.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "SET_PASSCODE") {
        const ok = await authService.setPasscode(projectId, passcode.trim());
        if (ok) {
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 800);
        } else {
          setErrorMsg("Failed to set workspace passcode.");
        }
      } else {
        const isValid = await authService.verifyPasscode(projectId, passcode.trim());
        if (isValid) {
          setIsSuccess(true);
          if (onVerified) onVerified();
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 600);
        } else {
          setErrorMsg("Incorrect 4-digit PIN. Please try again.");
        }
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "SET_PASSCODE" ? "Workspace Security PIN" : "Enter Workspace PIN"}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300">
            {mode === "SET_PASSCODE"
              ? "Protect this venture project with a 4-digit PIN so only your team can view or modify it."
              : "This venture project is PIN-protected. Enter the 4-digit passcode to join."}
          </p>
        </div>

        <div className="space-y-1.5">
          <input
            type="password"
            maxLength={8}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter 4-digit PIN (e.g. 1234)"
            className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            autoFocus
          />
          {errorMsg && (
            <p className="text-xs text-red-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={isSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Key className="w-3.5 h-3.5" />}
          >
            {isSuccess
              ? "Verified!"
              : mode === "SET_PASSCODE"
              ? "Save PIN"
              : "Unlock Room"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
