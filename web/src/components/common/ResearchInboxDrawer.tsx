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
  CopyCheck,
  Split,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { IngestedDocumentResult, EvidenceCandidate } from "@/lib/types";
import { connectorService, SimilarityCheckResult } from "@/services/connectorService";

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
  {
    label: "PubMed Clinical Abstract",
    source: "PubMed Indexed Study (PMID: 38123456)",
    tier: "ACADEMIC_PEER_REVIEWED",
    content: `Title: Cold Chain Logistics and Post-Harvest Losses in Rural Agriculture.
Authors: Santos M, Reyes D.
Venue: Journal of Agricultural Food Systems (2024).
Findings: In Western Visayas, post-harvest losses among smallholder municipal fishers exceed 32% due to insufficient ice supply and lack of portable solar-powered chilling units during transport to provincial aggregation centers.`,
  }
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
  const [similarityResult, setSimilarityResult] = useState<SimilarityCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setRawText(preset.content);
    setSourceName(preset.source);
    setAuthorityTier(preset.tier);
    setExtractionResult(null);
    setSimilarityResult(null);
    setError(null);
  };

  const handleExtract = async () => {
    if (!rawText.trim()) {
      setError("Please enter or paste raw notes or interview transcripts.");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setSimilarityResult(null);
    try {
      const res = await connectorService.ingestDocument(rawText, sourceName, authorityTier);
      setExtractionResult(res);
      
      // Run portfolio similarity check
      try {
        const sim = await connectorService.checkSimilarity(res.problem_statement, res.inferred_sector);
        setSimilarityResult(sim);
      } catch (simErr) {
        console.warn("Similarity check skipped:", simErr);
      }
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
    setSimilarityResult(null);
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
              Paste interview transcripts, survey logs, observation notes, or research summaries. CONVERA parses the raw text into structured <strong className="text-slate-200">Evidence Candidates</strong>, extracts <strong className="text-slate-200">Empirical Claims</strong>, and automatically checks for portfolio duplicates.
            </p>
          </div>
        </div>

        {/* Preset Quick Fill */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">
            Load Sample Ingestion Artifacts:
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-700/70 bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Source Name / Document Reference:
            </label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Field Interview with Jaro Tricycle Operators"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Authority Tier:
            </label>
            <select
              value={authorityTier}
              onChange={(e) => setAuthorityTier(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="FIELD_INTERVIEW">Field Interview (Primary Grounding)</option>
              <option value="OFFICIAL_GOVERNMENT">Official Government / LGU Data</option>
              <option value="ACADEMIC_PEER_REVIEWED">Academic Peer-Reviewed Paper</option>
              <option value="INDUSTRY_REPORT">Industry / Market Benchmark</option>
              <option value="UNVERIFIED_OBSERVATION">Unverified Discovery Signal</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">
            Raw Content (Unstructured Text, Transcripts, Observations):
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            placeholder="Paste your qualitative notes, quotes, or paper findings here..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-sans focus:outline-none focus:border-blue-500 placeholder:text-slate-600 leading-relaxed resize-none"
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setRawText("");
              setExtractionResult(null);
              setSimilarityResult(null);
              setError(null);
            }}
          >
            Clear
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExtract}
            disabled={isExtracting || !rawText.trim()}
            className="flex items-center gap-1.5"
          >
            {isExtracting ? (
              <>
                <Spinner size="sm" />
                <span>Deconstructing Claims...</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                <span>Parse & Extract Claims</span>
              </>
            )}
          </Button>
        </div>

        {/* Duplicate / Similarity Warning Banner */}
        {similarityResult && similarityResult.matches.length > 0 && (
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            similarityResult.overall_verdict === "DUPLICATE"
              ? "bg-amber-950/40 border-amber-500/50 text-amber-200"
              : "bg-blue-950/40 border-blue-500/40 text-blue-200"
          }`}>
            <CopyCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs uppercase tracking-wider font-mono">
                  {similarityResult.overall_verdict === "DUPLICATE" ? "Potential Portfolio Duplicate" : "Related Problem Cluster"}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-black/40 border border-current">
                  {Math.round(similarityResult.top_similarity_score * 100)}% Match
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {similarityResult.matches[0].explanation} (Matches: <strong className="text-white font-mono">{similarityResult.matches[0].problem_id}</strong>)
              </p>
              <p className="text-[11px] text-slate-400 italic">
                Human Governance: You can still commit this as a distinct item or link it as supporting evidence.
              </p>
            </div>
          </div>
        )}

        {/* Extracted Structured Entity Preview */}
        {extractionResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-3 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                  Extracted Problem Candidate
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                {extractionResult.inferred_sector}
              </span>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-300">{extractionResult.inferred_title}</div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                "{extractionResult.problem_statement}"
              </p>
            </div>

            {/* Extracted Claims List */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span>Extracted Claims & Evidence ({extractionResult.evidence_candidates.length}):</span>
                <span className="text-[10px] text-slate-500 font-mono">Epistemic Tier: {authorityTier}</span>
              </div>

              <div className="space-y-2">
                {extractionResult.evidence_candidates.map((cand, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${getClaimTypeBadge(cand.claim_type)}`}>
                        {cand.claim_type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Confidence: {(cand.ai_confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-slate-200 font-medium">{cand.claim_text}</div>
                    {cand.supporting_quote && (
                      <div className="text-[11px] text-slate-400 italic flex items-start gap-1 bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                        <Quote className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                        <span>"{cand.supporting_quote}"</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCommit}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ground to Problem Bank</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
