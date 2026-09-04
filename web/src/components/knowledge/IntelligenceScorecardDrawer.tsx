import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  X,
  Sliders,
  CheckCircle2,
  FileText,
  Copy,
  Download,
  Flame,
  BrainCircuit,
  Scale,
  Sparkles
} from "lucide-react";
import { evaluationApi, IntelligenceScorecard, CalibratedConfidenceResult } from "@/services/knowledgeService";
import { fetchApi } from "@/lib/api-client";

interface IntelligenceScorecardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export const IntelligenceScorecardDrawer: React.FC<IntelligenceScorecardDrawerProps> = ({
  isOpen,
  onClose,
  projectId = "default_proj",
}) => {
  const [scorecard, setScorecard] = useState<IntelligenceScorecard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [staleDecisions, setStaleDecisions] = useState<any[]>([]);

  // Calibration test states
  const [aiConfidence, setAiConfidence] = useState<number>(95);
  const [evidenceCount, setEvidenceCount] = useState<number>(1);
  const [calibrated, setCalibrated] = useState<CalibratedConfidenceResult | null>(null);

  // Proposal export state
  const [proposalMd, setProposalMd] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    loadScorecard();
    runCalibration(aiConfidence, evidenceCount);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, projectId, onClose]);

  const loadScorecard = async () => {
    try {
      setLoading(true);
      const data = await evaluationApi.getScorecard(projectId);
      setScorecard(data);

      const decData = await evaluationApi.auditDecisions(projectId);
      const stale = decData.audited_records?.filter((r: any) => r.is_stale) || [];
      setStaleDecisions(stale);
    } catch (err) {
      console.error("Failed to load intelligence scorecard:", err);
    } finally {
      setLoading(false);
    }
  };

  const runCalibration = async (aiConf: number, count: number) => {
    try {
      const items = Array.from({ length: count }, () => ({
        tier: "TIER_2",
        freshness_score: 0.85,
      }));
      const res = await evaluationApi.calibrate({
        ai_model_confidence: aiConf / 100.0,
        evidence_items: items,
        risk_level: "MEDIUM",
        passed_validation_tests: count > 2 ? 1 : 0,
      });
      setCalibrated(res);
    } catch (err) {
      console.error("Calibration error:", err);
    }
  };

  const handleFetchProposal = async () => {
    setIsExporting(true);
    try {
      const data = await fetchApi<{ markdown_content: string }>(
        `/api/export/dsr-proposal?project_id=${projectId}`
      );
      setProposalMd(data.markdown_content);
    } catch (err) {
      console.error("Proposal export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    if (proposalMd) {
      navigator.clipboard.writeText(proposalMd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (proposalMd) {
      const blob = new Blob([proposalMd], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CONVERA_DSR_Proposal_${projectId}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div role="dialog" aria-modal="true" aria-label="Intelligence Scorecard" tabIndex={-1} className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden focus-visible:outline-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                CONVERA Intelligence Scorecard
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {scorecard?.overall_integrity_score || 88.0}%
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Live 4-Pillar Epistemic Integrity & Confidence Calibration HUD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                1. Evidence Integrity
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-emerald-400">
                  {scorecard?.pillars?.evidence_integrity?.score || 88}%
                </span>
                <span className="text-[10px] text-slate-400">PROVENANCE VERIFIED</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                2. Reasoning Integrity
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-indigo-400">
                  {scorecard?.pillars?.reasoning_integrity?.score || 90}%
                </span>
                <span className="text-[10px] text-slate-400">GAPS VS LIMITS</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                3. Decision Integrity
              </span>
              <div className="flex items-baseline justify-between">
                <span className={`text-lg font-bold ${staleDecisions.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {scorecard?.pillars?.decision_integrity?.score || 100}%
                </span>
                <span className="text-[10px] text-slate-400">
                  {staleDecisions.length > 0 ? `${staleDecisions.length} STALE` : "ALL SOLID"}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                4. Compliance
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-cyan-400">
                  {scorecard?.pillars?.system_compliance?.score || 95}%
                </span>
                <span className="text-[10px] text-slate-400">DSR RATCHET</span>
              </div>
            </div>
          </div>

          {/* Stale Decisions Alert */}
          {staleDecisions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Stale Decision Alerts ({staleDecisions.length})
              </div>
              <p className="text-[11px] text-amber-300/80">
                One or more decisions rely on claims that are currently CONTESTED by opposing research. Review rationale before committing further resources.
              </p>
            </div>
          )}

          {/* Tri-Part Confidence Calibration HUD */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-400" />
                Tri-Part Confidence Calibration Model
              </label>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                AI ≠ Evidence ≠ Decision
              </span>
            </div>

            {/* Metric Comparison Bars */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">AI Confidence</span>
                <span className="text-base font-bold text-indigo-400">{aiConfidence}%</span>
                <span className="text-[9px] text-slate-500 block">Model Fluency</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Evidence Str</span>
                <span className="text-base font-bold text-emerald-400">
                  {Math.round((calibrated?.evidence_strength || 0) * 100)}%
                </span>
                <span className="text-[9px] text-slate-500 block">Citations & Tests</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Decision Conf</span>
                <span className="text-base font-bold text-cyan-400">
                  {Math.round((calibrated?.decision_confidence || 0) * 100)}%
                </span>
                <span className="text-[9px] text-slate-500 block">Calibrated Reality</span>
              </div>
            </div>

            {/* Overconfidence Warning */}
            {calibrated?.overconfidence_risk && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] leading-relaxed">
                <strong>⚠️ OVERCONFIDENCE RISK:</strong> AI confidence is high ({aiConfidence}%) while empirical evidence is weak ({Math.round((calibrated?.evidence_strength || 0) * 100)}%). Do not lock requirements.
              </div>
            )}

            {/* Sliders to test calibration */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Simulate AI Confidence:</span>
                  <span className="text-slate-200 font-bold">{aiConfidence}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={aiConfidence}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAiConfidence(val);
                    runCalibration(val, evidenceCount);
                  }}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Empirical Evidence Items:</span>
                  <span className="text-slate-200 font-bold">{evidenceCount} Sources</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={evidenceCount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEvidenceCount(val);
                    runCalibration(aiConfidence, val);
                  }}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Proposal Export Section */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                DSR Thesis / Capstone Proposal Export
              </label>
              <button
                onClick={handleFetchProposal}
                disabled={isExporting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                {isExporting ? "Compiling..." : "Compile Proposal"}
              </button>
            </div>

            {proposalMd ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg max-h-48 overflow-y-auto text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                  {proposalMd}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Markdown"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download .md
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Compile your project’s problem statement, literature matrix, artifact classification, circumscription history, and gate sign-offs into a standardized academic DSR proposal.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
};
