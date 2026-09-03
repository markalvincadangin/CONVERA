"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { problemService } from "@/services/problemService";
import { ProblemRecord, EvidenceTier } from "@/lib/types";
import { ALL_SECTORS } from "@/lib/constants";
import { Sparkles, Edit3, Plus, Trash2, Check, AlertCircle } from "lucide-react";

interface ManualProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemSaved: (problem: ProblemRecord) => void;
  projectId?: string;
  sessionId?: string;
}

export const ManualProblemModal: React.FC<ManualProblemModalProps> = ({
  isOpen,
  onClose,
  onProblemSaved,
  projectId,
  sessionId,
}) => {
  const [mode, setMode] = useState<"ai" | "form">("ai");
  const [rawNote, setRawNote] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [sector, setSector] = useState("Agriculture & Fisheries");
  const [suffererOccupation, setSuffererOccupation] = useState("");
  const [suffererLocation, setSuffererLocation] = useState("Iloilo City");
  const [problemStatement, setProblemStatement] = useState("");
  const [evidenceTier, setEvidenceTier] = useState<EvidenceTier>("SIGNAL");
  const [workaround, setWorkaround] = useState("");
  const [quantifiedImpact, setQuantifiedImpact] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [sources, setSources] = useState<
    Array<{ source_name: string; source_url?: string; source_tier: "A" | "B" | "C" | "D"; quote_or_summary: string }>
  >([
    { source_name: "Field Observation", source_url: "", source_tier: "C", quote_or_summary: "Firsthand researcher note" },
  ]);

  const handleEnrichWithAI = async () => {
    if (!rawNote.trim()) {
      setError("Please write your raw field observations or notes first.");
      return;
    }
    setIsEnriching(true);
    setError(null);
    try {
      const res = await problemService.enrichManualNote(rawNote, projectId, sessionId);
      const p = res.problem;
      if (p) {
        if (p.sector) setSector(p.sector);
        if (p.sufferer_occupation) setSuffererOccupation(p.sufferer_occupation);
        if (p.sufferer_location) setSuffererLocation(p.sufferer_location);
        if (p.problem_statement) setProblemStatement(p.problem_statement);
        if (p.evidence_tier) setEvidenceTier(p.evidence_tier);
        if (p.workaround) setWorkaround(p.workaround);
        if (p.quantified_impact) setQuantifiedImpact(p.quantified_impact);
        if (p.tags && Array.isArray(p.tags)) setTagInput(p.tags.join(", "));
        if (p.sources && Array.isArray(p.sources) && p.sources.length > 0) {
          setSources(
            p.sources.map((s) => ({
              source_name: s.source_name || "Observation",
              source_url: s.source_url || "",
              source_tier: s.source_tier || "C",
              quote_or_summary: s.quote_or_summary || "",
            }))
          );
        }
        setNotes(`AI-Enriched from note: "${rawNote.trim().slice(0, 100)}..."`);
        setMode("form"); // Switch to review form
      }
    } catch (err: any) {
      setError(err.message || "Failed to structure note with AI. Please fill in the form manually.");
    } finally {
      setIsEnriching(false);
    }
  };

  const handleAddSource = () => {
    setSources([...sources, { source_name: "", source_url: "", source_tier: "C", quote_or_summary: "" }]);
  };

  const handleRemoveSource = (idx: number) => {
    setSources(sources.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemStatement.trim()) {
      setError("Problem statement is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const tags = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const payload: Partial<ProblemRecord> = {
      project_id: projectId,
      session_id: sessionId,
      sector,
      sufferer_occupation: suffererOccupation.trim(),
      sufferer_location: suffererLocation.trim(),
      problem_statement: problemStatement.trim(),
      evidence_tier: evidenceTier,
      workaround: workaround.trim(),
      quantified_impact: quantifiedImpact.trim(),
      evidence_types: ["Field Observation", "Manual Input"],
      source: "manual",
      source_detail: "Manual Researcher Input",
      tags,
      notes: notes.trim(),
      sources: sources
        .filter((s) => s.source_name.trim())
        .map((s) => ({
          source_name: s.source_name.trim(),
          source_url: s.source_url?.trim() || null,
          source_tier: s.source_tier,
          evidence_type: "Field Observation",
          quote_or_summary: s.quote_or_summary.trim(),
        })),
    };

    try {
      const res = await problemService.createProblem(payload);
      onProblemSaved(res.problem);
      onClose();
      // Reset form
      setRawNote("");
      setProblemStatement("");
      setWorkaround("");
      setQuantifiedImpact("");
      setTagInput("");
      setNotes("");
      setMode("ai");
    } catch (err: any) {
      setError(err.message || "Failed to save problem to Problem Bank.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Problem to Bank" maxWidth="2xl">
      <div className="space-y-5">
        {/* Mode Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              mode === "ai"
                ? "bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI Note Structurer
          </button>
          <button
            type="button"
            onClick={() => setMode("form")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              mode === "form"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            Direct Entry Form
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {mode === "ai" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Paste Your Raw Field Observation or Note:
              </label>
              <textarea
                value={rawNote}
                onChange={(e) => setRawNote(e.target.value)}
                placeholder="e.g. During our interview at Estancia port, municipal fishermen said they lose 30-40% of their squid catch on hot days because there is zero cold storage near the docks. They end up selling at ₱80/kg instead of ₱180/kg..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none font-sans"
              />
              <p className="text-[11px] text-slate-400">
                AI will extract the Sufferer, Location, Problem friction, Workaround, and Quantified Impact into a structured record.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEnrichWithAI}
                isLoading={isEnriching}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Structure with AI
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Target Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {ALL_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Evidence Tier</label>
                <select
                  value={evidenceTier}
                  onChange={(e) => setEvidenceTier(e.target.value as EvidenceTier)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="SIGNAL"> Signal (Single Note/Anecdote)</option>
                  <option value="DOCUMENTED"> Documented (Corroborated)</option>
                  <option value="STRONGLY_DOCUMENTED"> Strongly Documented (Multi-Source)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Specific Sufferer (Occupation)"
                value={suffererOccupation}
                onChange={(e) => setSuffererOccupation(e.target.value)}
                placeholder="e.g. Smallholder rice farmers"
                required
              />
              <Input
                label="Location (Brgy / Municipality)"
                value={suffererLocation}
                onChange={(e) => setSuffererLocation(e.target.value)}
                placeholder="e.g. Pototan, Iloilo"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">
                Problem Statement (Pure Root Friction) *
              </label>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe pure operational or economic pain without mentioning solutions, apps, or devices..."
                rows={2}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Current Workaround</label>
                <input
                  type="text"
                  value={workaround}
                  onChange={(e) => setWorkaround(e.target.value)}
                  placeholder="e.g. Selling to middlemen at 40% discount"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Quantified Impact / Loss</label>
                <input
                  type="text"
                  value={quantifiedImpact}
                  onChange={(e) => setQuantifiedImpact(e.target.value)}
                  placeholder="e.g. ₱12,000 lost per harvest cycle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <Input
              label="Tags (Comma-separated)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. agriculture, logistics, harvest"
            />

            {/* Evidence Sources */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">Evidence Sources ({sources.length})</span>
                <button
                  type="button"
                  onClick={handleAddSource}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add Source
                </button>
              </div>

              {sources.map((src, i) => (
                <div key={i} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 relative">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={src.source_name}
                      onChange={(e) => {
                        const next = [...sources];
                        next[i].source_name = e.target.value;
                        setSources(next);
                      }}
                      placeholder="Source Name (e.g. PSA / Interview)"
                      className="bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={src.source_url || ""}
                      onChange={(e) => {
                        const next = [...sources];
                        next[i].source_url = e.target.value;
                        setSources(next);
                      }}
                      placeholder="URL (optional)"
                      className="bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-xs text-white"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={src.source_tier}
                        onChange={(e) => {
                          const next = [...sources];
                          next[i].source_tier = e.target.value as any;
                          setSources(next);
                        }}
                        className="bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-xs text-white flex-1"
                      >
                        <option value="A">Tier A (Gov / PSA)</option>
                        <option value="B">Tier B (News Media)</option>
                        <option value="C">Tier C (Field / Post)</option>
                        <option value="D">Tier D (Anecdote)</option>
                      </select>
                      {sources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(i)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isSaving} leftIcon={<Check className="w-4 h-4" />}>
                Save to Problem Bank
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
