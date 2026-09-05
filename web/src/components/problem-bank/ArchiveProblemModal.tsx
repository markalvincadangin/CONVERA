"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import { ProblemRecord } from "@/lib/types";
import { problemService } from "@/services/problemService";
import { authService } from "@/services/authService";
import { AlertTriangle, Archive } from "lucide-react";

interface ArchiveProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: ProblemRecord | null;
  onProblemArchived: (archivedProblem: ProblemRecord) => void;
}

const ARCHIVE_REASONS = [
  "Failed Customer / Persona Validation",
  "Market Size / Economics Unfavorable",
  "Technical Feasibility Barrier",
  "Duplicate / Merged with Another Record",
  "Out of Strategic Scope",
  "Other (enter custom note below)",
];

export const ArchiveProblemModal: React.FC<ArchiveProblemModalProps> = ({
  isOpen,
  onClose,
  problem,
  onProblemArchived,
}) => {
  const toast = useToast();
  const [selectedReason, setSelectedReason] = useState(ARCHIVE_REASONS[0]);
  const [customNote, setCustomNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!problem) return null;

  const handleArchive = async () => {
    setIsSubmitting(true);
    const finalReason =
      selectedReason === "Other (enter custom note below)" && customNote.trim()
        ? customNote.trim()
        : customNote.trim()
        ? `${selectedReason}: ${customNote.trim()}`
        : selectedReason;

    try {
      const author = authService.getCurrentUser()?.name || "Team Member";
      const res = await problemService.archiveProblem(problem.id, finalReason, author);
      toast.success(`Problem ${problem.id} has been moved to the archive.`, "Problem Archived");
      onProblemArchived(res.problem);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to archive problem record.", "Archive Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archive Problem Record"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Advisory Notice */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px]">Archiving removes this problem from the active backlog.</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The record is preserved in your database with an archived status and documented rationale.
            </p>
          </div>
        </div>

        {/* Problem Target Snippet */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">
              {problem.id}
            </span>
            <span className="text-slate-400 text-[10px] font-semibold">{problem.sector}</span>
          </div>
          <p className="text-white font-medium line-clamp-2 leading-snug">
            "{problem.problem_statement}"
          </p>
        </div>

        {/* Reason Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Select Archival Reason <span className="text-rose-400">*</span>
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/60"
          >
            {ARCHIVE_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Notes Textarea */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Additional Context / Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Document specific rationale or evidence that led to archiving..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleArchive}
            isLoading={isSubmitting}
            leftIcon={<Archive className="w-3.5 h-3.5" />}
          >
            Archive Problem
          </Button>
        </div>
      </div>
    </Modal>
  );
};
