"use client";

import React, { useState } from "react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Activity, Sparkles, CheckCircle2, AlertTriangle, ArrowLeft, Download, Award, ShieldAlert, TrendingUp } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { COMMITMENT_TIERS } from "@/lib/constants";
import { phaseService } from "@/services/phaseService";
import { SessionState, TestArchetype } from "@/lib/types";

interface Phase5ViewProps {
  session: SessionState;
  onUpdateSession: (newState: SessionState) => void;
  onGoBack: () => void;
  onExportDossier: () => void;
}

export const Phase5View: React.FC<Phase5ViewProps> = ({
  session,
  onUpdateSession,
  onGoBack,
  onExportDossier,
}) => {
  const [conceptLabel, setConceptLabel] = useState(
    session.phase4_concepts?.[0]?.label || "Top Advance Concept from Phase 4"
  );
  const [assumptionTested, setAssumptionTested] = useState(
    "Target MSME vendors will pre-order cold storage slots with 500 PHP deposit."
  );
  const [testArchetype, setTestArchetype] = useState<TestArchetype>("CONCIERGE_MVP");
  const [cohort, setCohort] = useState("20 produce vendors in Jaro Market, Iloilo City");
  const [sampleSize, setSampleSize] = useState<number>(20);
  const [actionsCount, setActionsCount] = useState<number>(7);
  const [passThreshold, setPassThreshold] = useState(">= 30% conversion (>= 6 deposits)");
  const [failThreshold, setFailThreshold] = useState("< 15% conversion (< 3 deposits)");
  const [evidenceDesc, setEvidenceDesc] = useState(
    "7 vendors paid 500 PHP cash deposit for next week. 5 vendors expressed verbal interest but refused to place deposit citing cashflow lock. 8 vendors declined."
  );
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await phaseService.auditPhase5(session.session_id, {
        concept_label: conceptLabel,
        assumption_tested: assumptionTested,
        test_archetype: testArchetype,
        cohort,
        sample_size: Number(sampleSize),
        actions_count: Number(actionsCount),
        pass_threshold: passThreshold,
        fail_threshold: failThreshold,
        evidence_desc: evidenceDesc,
      });
      onUpdateSession(res.state);
    } catch (err: any) {
      alert(err.message || "Failed to audit Phase 5 experiment data.");
    } finally {
      setIsAuditing(false);
    }
  };

  const conversionRate = sampleSize > 0 ? ((actionsCount / sampleSize) * 100).toFixed(1) : "0.0";
  const isPursue = Boolean(session.phase5_response && session.phase5_response.includes("PURSUE"));
  const isPivot = Boolean(session.phase5_response && session.phase5_response.includes("PIVOT"));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card variant="glow" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Phase 5: Solution Validation & MVP Testing</h2>
              <Badge variant="emerald">Build-Measure-Learn Audit</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Audit real-world experiment metrics against pre-set Pass/Fail thresholds. Score revealed behavioral commitment (Tiers 1–5) and evaluate pivot directions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="emerald"
              onClick={handleRunAudit}
              isLoading={isAuditing}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              {session.phase5_response ? "Re-Audit Experiment" : "Run MVP Audit & Pivot Analysis"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Behavioral Commitment Reference Card */}
      <Card variant="glass" className="p-5 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-purple-400" /> Behavioral Commitment Hierarchy Rule
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {COMMITMENT_TIERS.map((t) => (
            <div key={t.tier} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-white block">{t.label.split("(")[0]}</span>
              <p className="text-[10px] text-slate-400 leading-tight">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Experiment Data Intake Form */}
      <Card variant="glass" className="p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Enter Real-World Experiment Results
          </h3>
          <div className="text-xs text-slate-400">
            Observed Conversion Rate: <span className="font-bold text-cyan-400 font-mono">{conversionRate}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Concept Label Tested</label>
            <input
              type="text"
              value={conceptLabel}
              onChange={(e) => setConceptLabel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">MVP Test Archetype</label>
            <select
              value={testArchetype}
              onChange={(e) => setTestArchetype(e.target.value as TestArchetype)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="CONCIERGE_MVP">Concierge MVP (Manual High-Touch Service)</option>
              <option value="WIZARD_OF_OZ">Wizard of Oz (Front-End Automated; Back-End Manual)</option>
              <option value="SMOKE_OR_LANDING_PAGE_TEST">Smoke / Landing Page Test (Conversion CTA)</option>
              <option value="INTERACTIVE_PROTOTYPE_OR_PAPER">Interactive Prototype / Paper Test</option>
              <option value="LOI_OR_PREORDER_DEPOSIT">LOI / Pre-order Cash Deposit Test</option>
              <option value="STRUCTURED_SOLUTION_INTERVIEW">Structured Solution Interview (Mockup)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Tested P1 Assumption</label>
          <input
            type="text"
            value={assumptionTested}
            onChange={(e) => setAssumptionTested(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Target Participant Cohort</label>
            <input
              type="text"
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Sample Size Exposed (N)</label>
            <input
              type="number"
              min={1}
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Concrete Actions Observed</label>
            <input
              type="number"
              min={0}
              value={actionsCount}
              onChange={(e) => setActionsCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Pre-Set PASS Threshold (Phase 4)</label>
            <input
              type="text"
              value={passThreshold}
              onChange={(e) => setPassThreshold(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Pre-Set FAIL Threshold (Phase 4)</label>
            <input
              type="text"
              value={failThreshold}
              onChange={(e) => setFailThreshold(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Detailed Observed Behaviors & Notes</label>
          <textarea
            rows={3}
            value={evidenceDesc}
            onChange={(e) => setEvidenceDesc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" size="sm" onClick={onGoBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Phase 4
          </Button>

          <Button
            variant="emerald"
            size="md"
            onClick={handleRunAudit}
            isLoading={isAuditing}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Run Empirical Validation Audit
          </Button>
        </div>
      </Card>

      {/* Audit Output View */}
      {session.phase5_response && (
        <Card variant="glass" className="p-6 space-y-4 border-emerald-500/30">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">MVP Empirical Validation Audit & Verdict</h3>
            </div>
            <Badge variant={isPursue ? "emerald" : isPivot ? "amber" : "rose"}>
              {isPursue ? "🟢 PURSUE CONCEPT" : isPivot ? "🟡 PIVOT MECHANISM" : "🔴 RETIRE CONCEPT"}
            </Badge>
          </div>

          <div className="prose prose-invert max-w-none prose-sm prose-cyan overflow-x-auto text-slate-200">
            <MarkdownRenderer content={session.phase5_response} />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={onGoBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Phase 4
            </Button>

            <Button
              variant="emerald"
              size="lg"
              onClick={onExportDossier}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Complete Venture Dossier
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
