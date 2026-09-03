"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { ProblemRecord } from "@/lib/types";
import { executeVerifierAgent, ClaimVerificationReport } from "@/services/agentService";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  BookOpen,
  RefreshCw,
  Search,
  Scale,
} from "lucide-react";

interface CitationVerifierModalProps {
  problem: ProblemRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CitationVerifierModal: React.FC<CitationVerifierModalProps> = ({
  problem,
  isOpen,
  onClose,
}) => {
  const [report, setReport] = useState<ClaimVerificationReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected claim or custom text
  const [claimText, setClaimText] = useState("");
  const [doi, setDoi] = useState("");
  const [sourceName, setSourceName] = useState("");

  useEffect(() => {
    if (isOpen && problem) {
      setClaimText(problem.problem_statement);
      // Auto-populate first available DOI or source
      const firstSourceWithDoi = problem.sources?.find((s: any) => s.source_url?.includes("doi.org"));
      if (firstSourceWithDoi) {
        setDoi(firstSourceWithDoi.source_url || "");
        setSourceName(firstSourceWithDoi.source_name || "");
      } else if (problem.sources && problem.sources.length > 0) {
        setSourceName(problem.sources[0].source_name || "");
        setDoi(problem.sources[0].source_url || "");
      } else {
        setDoi("");
        setSourceName("");
      }
      setReport(null);
      setError(null);
    }
  }, [isOpen, problem?.id]);

  const runVerification = async () => {
    if (!claimText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await executeVerifierAgent({
        claim_text: claimText.trim(),
        doi: doi.trim() || undefined,
        source_name: sourceName.trim() || undefined,
        supporting_quote: problem?.quantified_impact,
      });
      setReport(data);
    } catch (err: any) {
      setError(err?.message || "Failed to execute Citation Verifier Agent.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!problem) return null;

  const getStrengthBadge = (strength: string) => {
    switch (strength?.toUpperCase()) {
      case "STRONG":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Strong Evidence
          </span>
        );
      case "CONTRADICTED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Contradicted
          </span>
        );
      case "WEAK":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
            Weak / Speculative
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" /> Moderate Rigor
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Citation Verifier & Contradiction Audit Agent"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Verification Inputs */}
        <div className="space-y-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Claim Text to Verify
            </label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none h-20"
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="Enter specific claim or finding..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                DOI / Registry URL
              </label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="10.1016/j.foodsys.2024.01"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Source / Publication Name
              </label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. BFAR Report 2024"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              variant="primary"
              onClick={runVerification}
              disabled={isLoading || !claimText.trim()}
              leftIcon={
                <ShieldCheck className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              }
            >
              {isLoading ? "Auditing Citation..." : "Verify Claim with Academic DOI"}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="secondary" onClick={runVerification}>
              Retry
            </Button>
          </div>
        )}

        {/* Verification Report Result */}
        {report && !isLoading && (
          <div className="space-y-4 animate-fadeIn">
            {/* Top Verdict Row */}
            <div className="flex items-center justify-between p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Verification Status
                </span>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  {report.verification_verdict.replace(/_/g, " ")}
                </div>
              </div>
              <div>{getStrengthBadge(report.evidence_strength)}</div>
            </div>

            {/* DOI Match Card */}
            {report.verified_source_title && (
              <div className="p-4 bg-slate-900/70 rounded-2xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-cyan-400" /> Verified Academic Registry Match
                  </span>
                  {report.citation_valid && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> DOI Validated
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  {report.verified_source_title}
                </p>
                {report.verified_venue && (
                  <p className="text-xs text-slate-400 italic">{report.verified_venue}</p>
                )}
              </div>
            )}

            {/* Methodology Audit */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Methodology & Sample Size Audit
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-3 rounded-xl">
                {report.methodology_audit}
              </p>
            </div>

            {/* Contradictions */}
            {report.contradictions.length > 0 && (
              <div className="p-4 bg-rose-950/40 rounded-2xl border border-rose-500/30 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Contradictory Constraints Noted
                </span>
                <ul className="list-disc list-inside text-xs text-rose-200 space-y-1">
                  {report.contradictions.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
