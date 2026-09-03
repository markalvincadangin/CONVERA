"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { LeanCanvasData } from "@/lib/types";
import { deliverableService } from "@/services/deliverableService";
import {
  FileSpreadsheet,
  Sparkles,
  Copy,
  Check,
  Printer,
  RotateCcw,
  Layers,
  CheckCircle2,
  Users,
  Lightbulb,
  Cpu,
  Share2,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Target,
  Route,
  Coins,
  Receipt,
  Quote,
} from "lucide-react";

interface LeanCanvasViewProps {
  sessionId: string;
  initialCanvas?: LeanCanvasData | null;
  projectName?: string;
}

export const LeanCanvasView: React.FC<LeanCanvasViewProps> = ({
  sessionId,
  initialCanvas,
  projectName = "Iloilo Venture Project",
}) => {
  const [canvas, setCanvas] = useState<LeanCanvasData | null>(initialCanvas || null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await deliverableService.generateLeanCanvas(sessionId);
      setCanvas(res.lean_canvas);
    } catch (err: any) {
      setError(err.message || "Failed to generate Lean Canvas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!canvas) return;
    const md = [
      `# Lean Canvas: ${canvas.project_name || projectName}`,
      "",
      "## 1. Problem",
      canvas.problem.top_frictions.map((f) => `- ${f}`).join("\n"),
      "\n*Existing Alternatives:*",
      canvas.problem.existing_alternatives.map((a) => `- ${a}`).join("\n"),
      "",
      "## 2. Customer Segments",
      canvas.customer_segments.target_customers.map((c) => `- ${c}`).join("\n"),
      "\n*Early Adopters:*",
      canvas.customer_segments.early_adopters.map((e) => `- ${e}`).join("\n"),
      "",
      "## 3. Unique Value Proposition",
      `**${canvas.unique_value_proposition.headline}**`,
      `*High-Level Concept:* ${canvas.unique_value_proposition.high_level_concept}`,
      "",
      "## 4. Solution",
      canvas.solution.core_mechanisms.map((m) => `- ${m}`).join("\n"),
      "",
      "## 5. Channels",
      canvas.channels.distribution_paths.map((c) => `- ${c}`).join("\n"),
      "",
      "## 6. Revenue Streams",
      `*Model:* ${canvas.revenue_streams.monetization_model}`,
      `*Pricing:* ${canvas.revenue_streams.pricing_structure}`,
      "",
      "## 7. Cost Structure",
      "*Fixed Costs:* " + canvas.cost_structure.fixed_costs.join(", "),
      "*Variable Costs:* " + canvas.cost_structure.variable_costs.join(", "),
      "",
      "## 8. Key Metrics",
      `*North Star:* ${canvas.key_metrics.primary_metric}`,
      `*Empirical Proof:* ${canvas.key_metrics.empirical_phase5_proof}`,
      "",
      "## 9. Unfair Advantage",
      canvas.unfair_advantage.moat_description,
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
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Ash Maurya 9-Box Lean Canvas
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Synthesized directly from your Phase 1-5 research, validated evidence, and empirical MVP metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canvas && (
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
            leftIcon={canvas ? <RotateCcw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          >
            {canvas ? "Re-Generate Canvas" : "Generate Lean Canvas"}
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
          <Spinner size="lg" label="Synthesizing Phase 1-5 evidence into structured 9-box Lean Canvas..." />
        </div>
      ) : !canvas ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20 shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No Lean Canvas Generated Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click the button above to auto-generate your 9-box business model canvas from your verified field observations and solution mechanisms.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate Lean Canvas Now
          </Button>
        </div>
      ) : (
        /* Canonical 5-Column Ash Maurya Grid Layout */
        <div className="space-y-3">
          {/* Top Section: 5 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Col 1: Box 1 (Problem & Existing Alternatives) */}
            <div className="p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-rose-500/30 flex flex-col justify-between gap-3 shadow-md hover:border-rose-500/50 transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-mono">
                    <ShieldAlert className="w-3.5 h-3.5" /> 1. Problem
                  </span>
                  <span className="text-[9px] font-mono bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold">
                    P1/P3
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {canvas.problem?.top_frictions?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2.5 border-t border-slate-900 text-xs text-slate-400 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-300 block font-mono">
                  Existing Alternatives:
                </span>
                <p className="text-[11px] italic text-slate-300">
                  {canvas.problem?.existing_alternatives?.join("; ") || "Manual workarounds"}
                </p>
              </div>
            </div>

            {/* Col 2: Box 4 (Solution) & Box 8 (Key Metrics) stacked */}
            <div className="flex flex-col gap-3">
              {/* Box 4: Solution */}
              <div className="flex-1 p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 flex flex-col justify-between gap-2 shadow-md hover:border-cyan-500/50 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                      <Cpu className="w-3.5 h-3.5" /> 4. Solution
                    </span>
                    <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/20 font-bold">
                      P4
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {canvas.solution?.core_mechanisms?.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <span className="leading-snug">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Box 8: Key Metrics */}
              <div className="flex-1 p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-sky-500/30 flex flex-col justify-between gap-2 shadow-md hover:border-sky-500/50 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 8. Key Metrics
                    </span>
                    <span className="text-[9px] font-mono bg-sky-500/10 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/20 font-bold">
                      P5
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-white leading-tight">
                      {canvas.key_metrics?.primary_metric}
                    </p>
                    <p className="text-[11px] text-sky-300 font-mono">
                      Proof: {canvas.key_metrics?.empirical_phase5_proof}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 3: Box 3 (Unique Value Proposition - Hero Card) */}
            <div className="p-4 bg-gradient-to-b from-violet-950/40 via-slate-950/90 to-slate-950 rounded-2xl border border-violet-500/40 flex flex-col justify-between gap-3 shadow-lg shadow-violet-500/5 hover:border-violet-500/60 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5 font-mono">
                    <Lightbulb className="w-3.5 h-3.5 text-violet-400" /> 3. Unique Value Prop
                  </span>
                  <span className="text-[9px] font-mono bg-violet-500/20 text-violet-200 px-1.5 py-0.5 rounded border border-violet-500/30 font-bold">
                    UVP
                  </span>
                </div>
                <div className="space-y-1 relative pl-3 border-l-2 border-violet-500/60">
                  <p className="text-xs font-bold text-white leading-relaxed">
                    &ldquo;{canvas.unique_value_proposition?.headline}&rdquo;
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-violet-900/40 text-xs text-violet-200/90 space-y-1">
                <span className="text-[10px] uppercase font-bold text-violet-300 block font-mono">
                  High-Level Concept:
                </span>
                <p className="text-[11px] leading-snug">
                  {canvas.unique_value_proposition?.high_level_concept}
                </p>
              </div>
            </div>

            {/* Col 4: Box 9 (Unfair Advantage) & Box 5 (Channels) stacked */}
            <div className="flex flex-col gap-3">
              {/* Box 9: Unfair Advantage */}
              <div className="flex-1 p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 flex flex-col justify-between gap-2 shadow-md hover:border-purple-500/50 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 font-mono">
                      <TrendingUp className="w-3.5 h-3.5" /> 9. Unfair Advantage
                    </span>
                    <span className="text-[9px] font-mono bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20 font-bold">
                      MOAT
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {canvas.unfair_advantage?.moat_description}
                  </p>
                </div>
              </div>

              {/* Box 5: Channels */}
              <div className="flex-1 p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-amber-500/30 flex flex-col justify-between gap-2 shadow-md hover:border-amber-500/50 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
                      <Route className="w-3.5 h-3.5" /> 5. Channels
                    </span>
                    <span className="text-[9px] font-mono bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                      GTM
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {canvas.channels?.distribution_paths?.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span className="leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Col 5: Box 2 (Customer Segments & Early Adopters) */}
            <div className="p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-emerald-500/30 flex flex-col justify-between gap-3 shadow-md hover:border-emerald-500/50 transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                    <Users className="w-3.5 h-3.5" /> 2. Customer Segments
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                    ICP
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {canvas.customer_segments?.target_customers?.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span className="leading-snug">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2.5 border-t border-slate-900 text-xs text-slate-400 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-300 block font-mono">
                  Early Adopter Cohort:
                </span>
                <p className="text-[11px] italic text-emerald-300/90 leading-snug">
                  {canvas.customer_segments?.early_adopters?.join("; ") || "Local pioneers"}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: 2 Columns (Cost Structure & Revenue Streams) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Box 7: Cost Structure */}
            <div className="p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-orange-500/30 space-y-2 shadow-md hover:border-orange-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5 font-mono">
                  <Receipt className="w-3.5 h-3.5" /> 7. Cost Structure
                </span>
                <span className="text-[9px] font-mono bg-orange-500/10 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/20 font-bold">
                  COSTS
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <strong className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Fixed Overhead:
                  </strong>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    {canvas.cost_structure?.fixed_costs?.join("; ") || "Facilities & equipment"}
                  </p>
                </div>
                <div>
                  <strong className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Variable Operations:
                  </strong>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    {canvas.cost_structure?.variable_costs?.join("; ") || "Logistics & support"}
                  </p>
                </div>
              </div>
            </div>

            {/* Box 6: Revenue Streams */}
            <div className="p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-emerald-500/30 space-y-2 shadow-md hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                  <DollarSign className="w-3.5 h-3.5" /> 6. Revenue Streams
                </span>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                  MONETIZATION
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <strong className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Revenue Model:
                  </strong>
                  <p className="text-slate-200 text-[11px] font-medium leading-snug">
                    {canvas.revenue_streams?.monetization_model}
                  </p>
                </div>
                <div>
                  <strong className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Pricing &amp; Margins:
                  </strong>
                  <p className="text-emerald-300 text-[11px] font-mono font-medium leading-snug">
                    {canvas.revenue_streams?.pricing_structure}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
