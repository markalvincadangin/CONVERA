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
      "## 🟢 Strengths (Internal)",
      swot.strengths.map((s) => `- ${s}`).join("\n"),
      "",
      "## 🟡 Weaknesses (Internal)",
      swot.weaknesses.map((w) => `- ${w}`).join("\n"),
      "",
      "## 🔵 Opportunities (External)",
      swot.opportunities.map((o) => `- ${o}`).join("\n"),
      "",
      "## 🔴 Threats (External)",
      swot.threats.map((t) => `- ${t}`).join("\n"),
      "",
      "## ⚔️ Competitor & Incumbent Differentiation Grid",
      "| Competitor / Substitute | Type | Why Sufferers Stick (Their Moat) | Our Mechanism Advantage |",
      "|---|---|---|---|",
      swot.competitor_grid
        .map((c) => `| ${c.competitor_name} | ${c.competitor_type} | ${c.their_advantage} | ${c.our_differentiation} |`)
        .join("\n"),
      "",
      "## 💡 Strategic Recommendations",
      swot.strategic_recommendations.map((r) => `- ${r}`).join("\n"),
    ].join("\n");

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              SWOT & Competitive Differentiation Matrix
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
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/20">
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
          {/* 2x2 SWOT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Strengths (Internal Advantages)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {swot.strengths.map((s, i) => (
                  <li key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold font-mono">0{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Weaknesses (Internal Gaps)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {swot.weaknesses.map((w, i) => (
                  <li key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="text-amber-400 font-bold font-mono">0{i + 1}.</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Compass className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Opportunities (Regional Potential)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {swot.opportunities.map((o, i) => (
                  <li key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold font-mono">0{i + 1}.</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-red-500/30 space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <Flame className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Threats (External Friction)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {swot.threats.map((t, i) => (
                  <li key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="text-red-400 font-bold font-mono">0{i + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Competitor / Incumbent Differentiation Grid */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Competitor & Incumbent Differentiation Grid
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Incumbent / Workaround</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Why Sufferers Stick (Their Advantage)</th>
                    <th className="p-3">Our Mechanism Differentiation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {swot.competitor_grid.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-white whitespace-nowrap">{c.competitor_name}</td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {c.competitor_type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{c.their_advantage}</td>
                      <td className="p-3 text-emerald-300 font-medium">{c.our_differentiation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/30 to-teal-950/30 rounded-2xl border border-cyan-500/30 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Strategic Next Steps for Region VI
            </span>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {swot.strategic_recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">→</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
