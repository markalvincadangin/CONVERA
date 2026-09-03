"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { SwotData } from "@/lib/types";
import { deliverableService } from "@/services/deliverableService";
import {
  Swords,
  Sparkles,
  Copy,
  Check,
  Printer,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Flame,
  CheckCircle2,
  TrendingUp,
  Building2,
  Target,
  Zap,
} from "lucide-react";

interface SwotMatrixViewProps {
  sessionId: string;
  initialSwot?: SwotData | null;
  projectName?: string;
}

export const SwotMatrixView: React.FC<SwotMatrixViewProps> = ({
  sessionId,
  initialSwot,
  projectName = "Iloilo Venture Project",
}) => {
  const [swot, setSwot] = useState<SwotData | null>(initialSwot || null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await deliverableService.generateSwot(sessionId);
      setSwot(res.swot);
    } catch (err: any) {
      setError(err.message || "Failed to generate SWOT analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!swot) return;
    const md = [
      `# SWOT & Competitive Analysis: ${projectName}`,
      "",
      "## Strengths (Internal)",
      swot.strengths.map((s) => `- ${s}`).join("\n"),
      "",
      "## Weaknesses (Internal)",
      swot.weaknesses.map((w) => `- ${w}`).join("\n"),
      "",
      "## Opportunities (External)",
      swot.opportunities.map((o) => `- ${o}`).join("\n"),
      "",
      "## Threats (External)",
      swot.threats.map((t) => `- ${t}`).join("\n"),
      "",
      "## Competitor & Incumbent Differentiation Grid",
      "| Competitor / Substitute | Type | Why Sufferers Stick (Their Moat) | Our Mechanism Advantage |",
      "|---|---|---|---|",
      swot.competitor_grid
        .map((c) => `| ${c.competitor_name} | ${c.competitor_type} | ${c.their_advantage} | ${c.our_differentiation} |`)
        .join("\n"),
      "",
      "## Strategic Recommendations",
      swot.strategic_recommendations.map((r) => `- ${r}`).join("\n"),
    ].join("\n");

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              SWOT &amp; Competitive Differentiation Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Regional market dynamics, incumbent barriers, and mechanism advantages in Western Visayas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {swot && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyMarkdown}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? "Copied MD" : "Copy Markdown"}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print PDF
              </Button>
            </>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            isLoading={isLoading}
            leftIcon={swot ? <RotateCcw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          >
            {swot ? "Re-Generate SWOT" : "Generate SWOT Matrix"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Spinner size="lg" label="Analyzing competitive landscape and internal venture strengths..." />
        </div>
      ) : !swot ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/20 shadow-inner">
            <Swords className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No SWOT Matrix Generated Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Auto-generate your 2x2 SWOT grid and 3-way competitor matrix against local Iloilo incumbents.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate SWOT Matrix Now
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 2x2 SWOT Quad-Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths (Internal • Positive) */}
            <div className="p-5 bg-gradient-to-br from-emerald-950/30 via-slate-950 to-slate-950 rounded-2xl border border-emerald-500/40 space-y-3 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/60 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                    Strengths (Internal Advantages)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  INTERNAL • POSITIVE
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200">
                {swot.strengths.map((s, i) => (
                  <li key={i} className="p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 flex items-start gap-2.5 shadow-sm">
                    <span className="text-emerald-400 font-bold font-mono text-xs">0{i + 1}.</span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses (Internal • Negative) */}
            <div className="p-5 bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-950 rounded-2xl border border-amber-500/40 space-y-3 shadow-lg shadow-amber-500/5 hover:border-amber-500/60 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                    Weaknesses (Internal Gaps)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  INTERNAL • NEGATIVE
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200">
                {swot.weaknesses.map((w, i) => (
                  <li key={i} className="p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 flex items-start gap-2.5 shadow-sm">
                    <span className="text-amber-400 font-bold font-mono text-xs">0{i + 1}.</span>
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities (External • Positive) */}
            <div className="p-5 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-950 rounded-2xl border border-cyan-500/40 space-y-3 shadow-lg shadow-cyan-500/5 hover:border-cyan-500/60 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Compass className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                    Opportunities (Regional Potential)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  EXTERNAL • POSITIVE
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200">
                {swot.opportunities.map((o, i) => (
                  <li key={i} className="p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 flex items-start gap-2.5 shadow-sm">
                    <span className="text-cyan-400 font-bold font-mono text-xs">0{i + 1}.</span>
                    <span className="leading-relaxed">{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats (External • Negative) */}
            <div className="p-5 bg-gradient-to-br from-rose-950/30 via-slate-950 to-slate-950 rounded-2xl border border-rose-500/40 space-y-3 shadow-lg shadow-rose-500/5 hover:border-rose-500/60 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400">
                  <Flame className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                    Threats (External Friction)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                  EXTERNAL • NEGATIVE
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200">
                {swot.threats.map((t, i) => (
                  <li key={i} className="p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 flex items-start gap-2.5 shadow-sm">
                    <span className="text-rose-400 font-bold font-mono text-xs">0{i + 1}.</span>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Competitor & Incumbent Differentiation Table */}
          <div className="p-5 bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400">
              <Building2 className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                Competitor &amp; Incumbent Differentiation Grid
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-900/80">
                    <th className="py-3 px-4 rounded-l-xl">Incumbent / Workaround</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Why Sufferers Stick (Their Advantage)</th>
                    <th className="py-3 px-4 rounded-r-xl text-emerald-400">Our Mechanism Differentiation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {swot.competitor_grid?.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {c.competitor_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                          {c.competitor_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs leading-relaxed">
                        {c.their_advantage}
                      </td>
                      <td className="py-3 px-4 font-medium text-emerald-300 max-w-xs leading-relaxed">
                        {c.our_differentiation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-teal-500/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-teal-400">
              <Zap className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                Strategic Recommendations &amp; Action Plan
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {swot.strategic_recommendations?.map((rec, i) => (
                <div key={i} className="p-3.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/25 flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
