"use client";

import React, { useState } from "react";
import {
  Inbox,
  Sparkles,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  Quote,
  ShieldAlert,
  FileUp,
  Cpu,
  X,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { IngestedDocumentResult, EvidenceCandidate } from "@/lib/types";
import { connectorService } from "@/services/connectorService";

interface ResearchInboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCommitProblem: (newProblem: {
    id?: string;
    title: string;
    problem_statement: string;
    sector?: string;
    evidence_candidates: EvidenceCandidate[];
  }) => void;
}

const SAMPLE_PRESETS = [
  {
    label: "Student Commute Interview",
    source: "Student Commute Interview Transcript (CPU Iloilo)",
    tier: "FIELD_INTERVIEW",
    content: `Interview with Sarah (3rd Year CS Student, CPU Iloilo):
"I commute 18km every day from Passi to Jaro. The biggest issue is that after my 6:30 PM lab class, there are zero jeepneys available on the highway.
I have to wait up to 90 minutes or pay 150 PHP for a special tricycle ride. I already spent 1,200 PHP extra last month just getting home safely. Most students in my dormitory have the same issue with evening schedules."`,
  },
  {
    label: "Cold Storage Field Note",
    source: "Iloilo Vegetable Farmers Field Observation",
    tier: "FIELD_INTERVIEW",
    content: `Field Observation - Leon Agri-Hub:
High spoilage rate of leafy vegetables during monsoon transit to Iloilo Terminal Market.
Farmers lose up to 35% of harvested volume due to lack of localized pre-cooling facilities.
Current workaround is packing with wet burlap sacks, which accelerates fungal rot during humid delays.
Middlemen exploit this perishability to force 40% price discounts at the gate.`,
  },
];

export const ResearchInboxDrawer: React.FC<ResearchInboxDrawerProps> = ({
  isOpen,
  onClose,
  onCommitProblem,
}) => {
  const [rawText, setRawText] = useState("");
  const [sourceName, setSourceName] = useState("Field Research Note");
  const [authorityTier, setAuthorityTier] = useState("FIELD_INTERVIEW");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<IngestedDocumentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setRawText(preset.content);
    setSourceName(preset.source);
    setAuthorityTier(preset.tier);
    setExtractionResult(null);
    setError(null);
  };

  const handleExtract = async () => {
    if (!rawText.trim()) {
      setError("Please enter or paste raw notes or interview transcripts.");
      return;
    }

    setIsExtracting(true);
    setError(null);
    try {
      const res = await connectorService.ingestDocument(rawText, sourceName, authorityTier);
      setExtractionResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to extract claims from document.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCommit = () => {
    if (!extractionResult) return;

    onCommitProblem({
      title: extractionResult.inferred_title,
      problem_statement: extractionResult.problem_statement,
      sector: extractionResult.inferred_sector,
      evidence_candidates: extractionResult.evidence_candidates,
    });

    // Reset and close
    setExtractionResult(null);
    setRawText("");
    onClose();
  };

  const getClaimTypeBadge = (type: string) => {
    switch (type) {
      case "FRICTION_REALITY":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "FREQUENCY_CONSEQUENCE":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "WORKAROUND_DISSATISFACTION":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "ADOPTION_COMMITMENT":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-slate-700/40 text-slate-300 border-slate-600/40";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Research & Document Inbox"
      maxWidth="4xl"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Header Philosophy Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 shrink-0">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              CCDS Ingestion Pipeline (CIIA v1.0)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Paste interview transcripts, survey logs, observation notes, or research summaries. CONVERA parses the raw text into structured <strong className="text-slate-200">Evidence Candidates</strong> and <strong className="text-slate-200">Empirical Claims</strong> with complete provenance.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Top presets row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium">Try sample material:</span>
          <div className="flex items-center gap-2">
            {SAMPLE_PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-medium transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea & Source Meta */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Source Description / Name
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. User Interview with 5 commuters"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Authority Tier
              </label>
              <select
                value={authorityTier}
                onChange={(e) => setAuthorityTier(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="FIELD_INTERVIEW">Field Interview (Mom Test)</option>
                <option value="PEER_REVIEWED">Peer-Reviewed Academic Paper</option>
                <option value="OFFICIAL_DATA">Government / Institutional Dataset</option>
                <option value="WEB_SIGNAL">Web Signal / Media Report</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Raw Text / Transcript / Research Notes
            </label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw unstructured text, quotes, or notes here..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none font-mono leading-relaxed resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleExtract}
              disabled={isExtracting || !rawText.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2"
            >
              {isExtracting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Extracting Claims & Evidence...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Extract Claims & Evidence
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Extraction Result Showcase */}
        {extractionResult && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Extracted Problem & Claims Candidates
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                {extractionResult.evidence_candidates.length} Claims Identified
              </span>
            </div>

            {/* Inferred Problem Card */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white">{extractionResult.inferred_title}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {extractionResult.inferred_sector}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {extractionResult.problem_statement}
              </p>
            </div>

            {/* Evidence Candidates List */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Extracted Evidence Candidates (Provenance Grounded)
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {extractionResult.evidence_candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getClaimTypeBadge(cand.claim_type)}`}>
                          {cand.claim_type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {cand.evidence_tier}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        AI Conf: <strong className="text-cyan-400">{Math.round(cand.ai_confidence * 100)}%</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {cand.claim_text}
                    </p>

                    {cand.supporting_quote && (
                      <div className="flex items-start gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 italic">
                        <Quote className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                        <span>"{cand.supporting_quote}"</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Assumptions */}
            {extractionResult.identified_assumptions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Unverified Assumptions Detected
                </h4>
                <div className="space-y-1.5">
                  {extractionResult.identified_assumptions.map((asm, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{asm.assumption}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commit Action */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setExtractionResult(null)}>
                Discard Extraction
              </Button>
              <Button
                onClick={handleCommit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add to Problem Bank
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
