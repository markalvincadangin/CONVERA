"use client";

import React, { useState } from "react";
import { ClaimRecord, ClaimStatus, ProblemRecord } from "@/lib/types";
import { problemService } from "@/services/problemService";
import { Button } from "@/components/common/Button";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Flame,
  Sparkles,
  TrendingUp,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";

interface EvidenceLedgerCardProps {
  problemId: string;
  claims: ClaimRecord[];
  onClaimsUpdated: (updatedClaims: ClaimRecord[]) => void;
  onGenerateRequested: (mode: "COMMERCIAL" | "CIVIC_INSTITUTIONAL") => void;
  isGenerating?: boolean;
}

const STATUS_CONFIG: Record<
  ClaimStatus,
  { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  UNKNOWN: {
    label: "Unknown",
    bg: "bg-slate-800/60",
    text: "text-slate-400",
    border: "border-slate-700",
    icon: HelpCircle,
  },
  HYPOTHESIS: {
    label: "Hypothesis",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: AlertCircle,
  },
  SUPPORTED: {
    label: "Supported",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    icon: CheckCircle2,
  },
  STRONGLY_SUPPORTED: {
    label: "Strongly Supported",
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/30",
    icon: ShieldCheck,
  },
  VALIDATED: {
    label: "Validated",
    bg: "bg-emerald-500/15",
    text: "text-emerald-300 font-bold",
    border: "border-emerald-500/40",
    icon: CheckCircle2,
  },
  REFUTED: {
    label: "Refuted / Contradicted",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    icon: XCircle,
  },
};

const CLAIM_NAMES: Record<string, { title: string; desc: string }> = {
  FRICTION_REALITY: {
    title: "1. Friction Reality",
    desc: "Does the target sufferer actually experience this pain in the real world?",
  },
  FREQUENCY_CONSEQUENCE: {
    title: "2. Frequency & Consequence",
    desc: "Does it occur with recurring frequency and measurable time/economic loss?",
  },
  WORKAROUND_DISSATISFACTION: {
    title: "3. Workaround Dissatisfaction",
    desc: "Are existing manual coping mechanisms or spreadsheets inadequate and failing?",
  },
  ADOPTION_COMMITMENT: {
    title: "4. Adoption & Commitment",
    desc: "Will the sufferer change habits, pay, or cooperate with institutional adoption?",
  },
};

export const EvidenceLedgerCard: React.FC<EvidenceLedgerCardProps> = ({
  problemId,
  claims,
  onClaimsUpdated,
  onGenerateRequested,
  isGenerating = false,
}) => {
  const [trackMode, setTrackMode] = useState<"COMMERCIAL" | "CIVIC_INSTITUTIONAL">("COMMERCIAL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (claimId: string, newStatus: ClaimStatus) => {
    setUpdatingId(claimId);
    try {
      const res = await problemService.updateClaim(problemId, claimId, newStatus);
      onClaimsUpdated(claims.map((c) => (c.id === claimId ? res.claim : c)));
    } catch (err: any) {
      alert("Failed to update claim: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-5 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4 font-sans shadow-lg">
      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Evidence Ledger
            </span>
            <span className="text-xs text-slate-300 font-bold">4-Claim Validation Matrix</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Prevents premature solutioning by distinguishing beliefs from verified field evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Track Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setTrackMode("COMMERCIAL")}
              className={`px-2 py-1 rounded-lg transition-all ${
                trackMode === "COMMERCIAL"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Commercial (WTP)
            </button>
            <button
              type="button"
              onClick={() => setTrackMode("CIVIC_INSTITUTIONAL")}
              className={`px-2 py-1 rounded-lg transition-all ${
                trackMode === "CIVIC_INSTITUTIONAL"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Civic / Academic
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onGenerateRequested(trackMode)}
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            className="text-[11px] font-mono"
          >
            {claims.length === 0 ? "Generate Ledger" : "Re-Calculate"}
          </Button>
        </div>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="p-6 text-center bg-slate-950 rounded-2xl border border-dashed border-slate-800 space-y-2">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">No claims extracted yet for this problem.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onGenerateRequested(trackMode)}
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate 4-Claim Evidence Ledger
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {claims.map((claim) => {
            const meta = CLAIM_NAMES[claim.claim_type] || {
              title: claim.claim_type,
              desc: "Validation hypothesis",
            };
            const cfg = STATUS_CONFIG[claim.status] || STATUS_CONFIG.UNKNOWN;
            const Icon = cfg.icon;

            return (
              <div
                key={claim.id}
                className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[11px] font-bold text-white flex items-center gap-1.5">
                      {meta.title}
                    </span>
                    <p className="text-[10px] text-slate-400 leading-snug">{meta.desc}</p>
                  </div>

                  {/* Status Dropdown / Pill */}
                  <div className="flex items-center gap-2">
                    <select
                      value={claim.status}
                      disabled={updatingId === claim.id}
                      onChange={(e) => handleStatusChange(claim.id, e.target.value as ClaimStatus)}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border} focus:outline-none cursor-pointer`}
                    >
                      <option value="UNKNOWN">UNKNOWN</option>
                      <option value="HYPOTHESIS">HYPOTHESIS</option>
                      <option value="SUPPORTED">SUPPORTED (Field/Lit)</option>
                      <option value="STRONGLY_SUPPORTED">STRONGLY SUPPORTED</option>
                      <option value="VALIDATED">VALIDATED</option>
                      <option value="REFUTED">REFUTED</option>
                    </select>
                  </div>
                </div>

                {/* Claim Statement */}
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                  "{claim.claim_text}"
                </p>

                {/* Evidence Note & Confidence */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span className="truncate max-w-[70%]">
                    <strong className="text-slate-300">Notes:</strong> {claim.evidence_notes || "Field interviews pending"}
                  </span>
                  <span className="text-cyan-400 font-bold">
                    Confidence: {(claim.confidence_score || 50).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
