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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ash Maurya 9-Box Lean Canvas
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Synthesized directly from your Phase 1–5 research, validated evidence, and empirical MVP metrics.
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
          <Spinner size="lg" label="Synthesizing Phase 1–5 evidence into structured 9-box Lean Canvas..." />
        </div>
      ) : !canvas ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
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
        /* 9-Box Grid Layout */
        <div className="space-y-3">
          {/* Top 5 Columns (Ash Maurya Top Row) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Box 1: Problem */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> 1. Problem
                </span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {canvas.problem?.top_frictions?.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                <strong className="text-slate-300 block text-[10px] uppercase">Existing Alternatives:</strong>
                <p className="italic">{canvas.problem?.existing_alternatives?.join("; ")}</p>
              </div>
            </div>

            {/* Box 4: Solution */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> 4. Solution
                </span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {canvas.solution?.core_mechanisms?.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Box 3: UVP */}
            <div className="p-3.5 bg-gradient-to-b from-cyan-950/40 to-slate-950 rounded-2xl border border-cyan-500/30 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-cyan-400" /> 3. Unique Value Proposition
                </span>
                <p className="text-xs font-bold text-white leading-relaxed">
                  "{canvas.unique_value_proposition?.headline}"
                </p>
              </div>
              <div className="pt-2 border-t border-cyan-900/40 text-[11px] text-cyan-200/80">
                <strong className="text-[10px] uppercase text-cyan-400 block">High-Level Concept:</strong>
                <span>{canvas.unique_value_proposition?.high_level_concept}</span>
              </div>
            </div>

            {/* Box 9: Unfair Advantage */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> 9. Unfair Advantage
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {canvas.unfair_advantage?.moat_description}
                </p>
              </div>
            </div>

            {/* Box 2: Customer Segments */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> 2. Customer Segments
                </span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {canvas.customer_segments?.target_customers?.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                <strong className="text-slate-300 block text-[10px] uppercase">Early Adopter Cohort:</strong>
                <p className="italic text-emerald-300/90">{canvas.customer_segments?.early_adopters?.join("; ")}</p>
              </div>
            </div>
          </div>

          {/* Middle Row (Key Metrics & Channels) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Box 8: Key Metrics */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 8. Key Metrics (Empirical Proof)
              </span>
              <div className="text-xs text-slate-200 space-y-1">
                <p><strong>Primary Metric:</strong> {canvas.key_metrics?.primary_metric}</p>
                <p className="text-emerald-400"><strong>Phase 5 Proof:</strong> {canvas.key_metrics?.empirical_phase5_proof}</p>
              </div>
            </div>

            {/* Box 5: Channels */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" /> 5. Channels (Path to Customers)
              </span>
              <ul className="space-y-1 text-xs text-slate-200">
                {canvas.channels?.distribution_paths?.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Row (Cost Structure & Revenue Streams) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Box 7: Cost Structure */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> 7. Cost Structure
              </span>
              <div className="text-xs text-slate-200 space-y-1">
                <p><strong>Fixed Costs:</strong> {canvas.cost_structure?.fixed_costs?.join(", ")}</p>
                <p><strong>Variable Costs:</strong> {canvas.cost_structure?.variable_costs?.join(", ")}</p>
              </div>
            </div>

            {/* Box 6: Revenue Streams */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> 6. Revenue Streams
              </span>
              <div className="text-xs text-slate-200 space-y-1">
                <p><strong>Monetization:</strong> {canvas.revenue_streams?.monetization_model}</p>
                <p className="text-emerald-300"><strong>Pricing:</strong> {canvas.revenue_streams?.pricing_structure}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
