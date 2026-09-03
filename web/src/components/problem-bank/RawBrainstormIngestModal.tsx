"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { ProblemRecord } from "@/lib/types";
import { problemService } from "@/services/problemService";
import {
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  FileText,
  User,
  MapPin,
  Tag,
  ShieldCheck,
} from "lucide-react";

interface RawBrainstormIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemsCreated: (newProblems: ProblemRecord[]) => void;
  projectId?: string;
  sessionId?: string;
}

export const RawBrainstormIngestModal: React.FC<RawBrainstormIngestModalProps> = ({
  isOpen,
  onClose,
  onProblemsCreated,
  projectId,
  sessionId,
}) => {
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedCandidates, setParsedCandidates] = useState<Partial<ProblemRecord>[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      // Use enrichManualNote or structured batch parser
      const res = await problemService.enrichManualNote(rawText.trim(), projectId, sessionId);
      if (res.problem && res.problem.problem_statement) {
        setParsedCandidates([res.problem]);
      } else {
        setErrorMsg("Could not extract a clear problem statement. Please provide more descriptive context.");
      }
    } catch (err: any) {
      setErrorMsg("Parsing failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToBank = async () => {
    if (parsedCandidates.length === 0) return;
    setIsSaving(true);
    try {
      const created: ProblemRecord[] = [];
      for (const candidate of parsedCandidates) {
        const res = await problemService.createProblem({
          ...candidate,
          project_id: projectId,
          session_id: sessionId,
        });
        created.push(res.problem);
      }
      onProblemsCreated(created);
      onClose();
      setRawText("");
      setParsedCandidates([]);
    } catch (err: any) {
      alert("Failed to save to Problem Bank: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Multi-AI & Raw Notes Ingestion Hub" maxWidth="2xl">
      <div className="space-y-4 font-sans text-xs">
        {/* Helper Banner */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Drop Raw AI Brainstorming, GC Chats, or Field Notes
            </h4>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Paste unstructured idea dumps from ChatGPT, Claude, Gemini, or team discussions. RatchetAI will strip solution bias, structure the friction, identify the sufferer, and calculate economic loss.
          </p>
        </div>

        {/* Input Area */}
        {parsedCandidates.length === 0 ? (
          <div className="space-y-3">
            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Example: 'We asked 4 bulb onion growers in Miagao why they sell so cheap. They said wet season humidity rots 30% of their harvest within 3 weeks because there's no municipal cold storage in Southern Iloilo, so they resort to solar drying on roadside tarmac...'"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleParse}
                disabled={!rawText.trim() || isProcessing}
                isLoading={isProcessing}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Structure & Normalize Problem
              </Button>
            </div>
          </div>
        ) : (
          /* Preview Structured Output */
          <div className="space-y-3">
            <div className="p-4 bg-slate-900 rounded-2xl border border-cyan-500/40 space-y-3 shadow-lg shadow-cyan-500/5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px]">
                  {parsedCandidates[0].sector || "General"}
                </span>
                <span className="text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Normalized Schema Ready
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pure Friction Statement:
                </span>
                <p className="text-white font-medium leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  "{parsedCandidates[0].problem_statement}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-cyan-400" /> Target Sufferer:
                  </span>
                  <p className="text-slate-200">{parsedCandidates[0].sufferer_occupation || "Not specified"}</p>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> Location / Scope:
                  </span>
                  <p className="text-slate-200">{parsedCandidates[0].sufferer_location || "Iloilo, Philippines"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-400">Active Workaround:</span>
                  <p className="text-slate-300">{parsedCandidates[0].workaround || "None recorded"}</p>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Quantified Impact:</span>
                  <p className="text-slate-300">{parsedCandidates[0].quantified_impact || "Not quantified"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setParsedCandidates([])}
                className="text-xs text-slate-400 hover:text-white underline font-mono"
              >
                ← Back to Edit Raw Text
              </button>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveToBank}
                  isLoading={isSaving}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Save to Problem Bank
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
