"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { useToast } from "@/components/common/ToastProvider";
import { problemService } from "@/services/problemService";
import { ProblemRecord, EvidenceTier } from "@/lib/types";
import { ALL_SECTORS } from "@/lib/constants";
import {
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  User,
  MapPin,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ProblemIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemSaved: (problem: ProblemRecord) => void;
  initialMode?: "manual" | "notes";
  projectId?: string;
  sessionId?: string;
}

export const ProblemIntakeModal: React.FC<ProblemIntakeModalProps> = ({
  isOpen,
  onClose,
  onProblemSaved,
  initialMode = "manual",
  projectId,
  sessionId,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"manual" | "notes">(initialMode);
  const [isReviewingDraft, setIsReviewingDraft] = useState(false);

  // Notes Import State
  const [rawNotes, setRawNotes] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Form State
  const [sector, setSector] = useState(ALL_SECTORS[0] || "Agriculture & Fisheries");
  const [problemStatement, setProblemStatement] = useState("");
  const [suffererOccupation, setSuffererOccupation] = useState("");
  const [suffererLocation, setSuffererLocation] = useState("");
  const [showOptionalContext, setShowOptionalContext] = useState(false);
  const [workaround, setWorkaround] = useState("");
  const [quantifiedImpact, setQuantifiedImpact] = useState("");
  const [evidenceTier, setEvidenceTier] = useState<EvidenceTier>("SIGNAL");
  const [tagInput, setTagInput] = useState("");
  const [sources, setSources] = useState<
    Array<{ source_name: string; source_url?: string; source_tier: "A" | "B" | "C" | "D"; quote_or_summary: string }>
  >([]);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync initial mode on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setIsReviewingDraft(false);
      setExtractionError(null);
      setFormError(null);
    }
  }, [isOpen, initialMode]);

  // Reset form
  const resetForm = () => {
    setRawNotes("");
    setProblemStatement("");
    setSuffererOccupation("");
    setSuffererLocation("");
    setWorkaround("");
    setQuantifiedImpact("");
    setEvidenceTier("SIGNAL");
    setTagInput("");
    setSources([]);
    setIsReviewingDraft(false);
    setExtractionError(null);
    setFormError(null);
    setShowOptionalContext(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // AI Extraction from Notes
  const handleExtractFromNotes = async () => {
    if (!rawNotes.trim()) {
      setExtractionError("Please paste notes or observations first.");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);

    try {
      const res = await problemService.enrichManualNote(rawNotes.trim(), projectId, sessionId);
      const draft = res.problem;

      if (draft && draft.problem_statement) {
        if (draft.sector && ALL_SECTORS.includes(draft.sector)) {
          setSector(draft.sector);
        }
        setProblemStatement(draft.problem_statement || "");
        setSuffererOccupation(draft.sufferer_occupation || "");
        setSuffererLocation(draft.sufferer_location || "");
        setWorkaround(draft.workaround || "");
        setQuantifiedImpact(draft.quantified_impact || "");
        if (draft.evidence_tier) {
          setEvidenceTier(draft.evidence_tier);
        }
        if (draft.tags && Array.isArray(draft.tags)) {
          setTagInput(draft.tags.join(", "));
        }
        if (draft.sources && Array.isArray(draft.sources) && draft.sources.length > 0) {
          setSources(
            draft.sources.map((s) => ({
              source_name: s.source_name || "Field Observation",
              source_url: s.source_url || "",
              source_tier: s.source_tier || "C",
              quote_or_summary: s.quote_or_summary || "",
            }))
          );
        }

        // Open optional context if extracted fields contain workaround or impact
        if (draft.workaround || draft.quantified_impact) {
          setShowOptionalContext(true);
        }

        // Transition to mandatory human review mode
        setIsReviewingDraft(true);
      } else {
        setExtractionError("Could not clearly extract a structured problem. Please provide more context or enter details manually.");
      }
    } catch (err: any) {
      setExtractionError(err?.message || "Extraction failed. Please check your network or enter details manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddSource = () => {
    setSources([
      ...sources,
      { source_name: "Field Citation", source_url: "", source_tier: "C", quote_or_summary: "" },
    ]);
  };

  const handleRemoveSource = (idx: number) => {
    setSources(sources.filter((_, i) => i !== idx));
  };

  const isFormValid =
    problemStatement.trim().length >= 10 &&
    suffererOccupation.trim().length > 0 &&
    suffererLocation.trim().length > 0;

  // Save to Problem Bank
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setFormError("Please fill in the Problem Statement, Who experiences this, and Location.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const tags = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const payload: Partial<ProblemRecord> = {
      project_id: projectId,
      session_id: sessionId,
      sector,
      problem_statement: problemStatement.trim(),
      sufferer_occupation: suffererOccupation.trim(),
      sufferer_location: suffererLocation.trim(),
      workaround: workaround.trim() || undefined,
      quantified_impact: quantifiedImpact.trim() || undefined,
      evidence_tier: evidenceTier,
      tags: tags.length > 0 ? tags : ["manual-entry"],
      sources: sources.length > 0 ? sources : undefined,
      source: isReviewingDraft ? "manual" : "manual",
      source_detail: isReviewingDraft ? "Extracted from Notes (Human Verified)" : "Manual Founder Observation",
    };

    try {
      const res = await problemService.createProblem(payload);
      toast.success(`Problem ${res.problem.id} added to Problem Bank!`, "Problem Recorded");
      onProblemSaved(res.problem);
      handleClose();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save problem to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Problem Record"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Navigation Tabs (Single Canonical Intake) */}
        {!isReviewingDraft && (
          <div className="flex border-b border-slate-800 gap-1 pb-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("manual");
                setExtractionError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "manual"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Enter Details Manually</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("notes");
                setFormError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "notes"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Import from Notes</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: Notes Import View (when active and not in review)  */}
        {/* ========================================================= */}
        {activeTab === "notes" && !isReviewingDraft ? (
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Import from Notes or Chat
                </h4>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Paste interview notes, field observations, team chat messages, or unstructured drafts. CONVERA will help identify and organize potential problem details for your review.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Raw Source Material</span>
                <span>{rawNotes.length} / 8000 chars recommended</span>
              </div>
              <textarea
                rows={8}
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="Example: We spoke with 4 onion growers in Miagao. They lose 30% of their harvest to rot during the wet season because there is no local cold storage facility, forcing them to dry crops on roadside asphalt..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
              />
            </div>

            {extractionError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{extractionError}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className="text-xs text-slate-400 hover:text-white underline font-mono"
              >
                Switch to Manual Entry
              </button>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExtractFromNotes}
                  disabled={!rawNotes.trim() || isExtracting}
                  isLoading={isExtracting}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Extract Problem Details
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* MANUAL ENTRY & MANDATORY HUMAN REVIEW FORM                */
          /* ========================================================= */
          <form onSubmit={handleSave} className="space-y-4">
            {/* Review Draft Banner (shown only if populated via AI note extraction) */}
            {isReviewingDraft && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-between gap-2 text-cyan-300">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong>AI-Extracted Draft:</strong> Please review and adjust the extracted details before saving.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewingDraft(false)}
                  className="text-[11px] font-mono font-bold text-cyan-400 hover:text-white underline flex items-center gap-1 shrink-0"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Notes</span>
                </button>
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Core Required Section */}
            <div className="space-y-3">
              {/* Sector Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Domain Sector <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                >
                  {ALL_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Problem Statement */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  What is the problem? <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Describe the specific friction, breakdown, or unmet need..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
              </div>

              {/* Who & Where (2-Column Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Who experiences this?</span> <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={suffererOccupation}
                    onChange={(e) => setSuffererOccupation(e.target.value)}
                    placeholder="e.g. Smallholder rice farmers, municipal health workers"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Where does it happen?</span> <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={suffererLocation}
                    onChange={(e) => setSuffererLocation(e.target.value)}
                    placeholder="e.g. Iloilo City, Dumangas, Western Visayas"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
              </div>
            </div>

            {/* Optional Progressive Disclosure Section */}
            <div className="pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowOptionalContext(!showOptionalContext)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono py-1 transition-colors"
              >
                {showOptionalContext ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>Add Context & Evidence (Optional)</span>
              </button>

              {showOptionalContext && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Current Alternative / Workaround
                      </label>
                      <textarea
                        rows={2}
                        value={workaround}
                        onChange={(e) => setWorkaround(e.target.value)}
                        placeholder="How do they cope with this problem today?"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Estimated Impact or Loss
                      </label>
                      <textarea
                        rows={2}
                        value={quantifiedImpact}
                        onChange={(e) => setQuantifiedImpact(e.target.value)}
                        placeholder="Estimated hours lost, financial damage, or failure rate..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Evidence Confidence Level
                      </label>
                      <select
                        value={evidenceTier}
                        onChange={(e) => setEvidenceTier(e.target.value as EvidenceTier)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono"
                      >
                        <option value="SIGNAL">Initial Field Observation (Signal)</option>
                        <option value="DOCUMENTED">Documented with Evidence</option>
                        <option value="STRONGLY_DOCUMENTED">Strongly Verified</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="e.g. cold-chain, logistics, da-interview"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                      />
                    </div>
                  </div>

                  {/* Sources List */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Supporting Sources ({sources.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddSource}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Source
                      </button>
                    </div>

                    {sources.map((src, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex gap-2 items-center">
                        <input
                          type="text"
                          value={src.source_name}
                          onChange={(e) => {
                            const next = [...sources];
                            next[idx].source_name = e.target.value;
                            setSources(next);
                          }}
                          placeholder="Source Name / Title"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={src.source_url || ""}
                          onChange={(e) => {
                            const next = [...sources];
                            next[idx].source_url = e.target.value;
                            setSources(next);
                          }}
                          placeholder="URL (optional)"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                * Required fields
              </span>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!isFormValid || isSaving}
                  isLoading={isSaving}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Save to Problem Bank
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
