"use client";

import React, { useState } from "react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Compass, Sparkles, Plus, ArrowRight, CheckCircle2, RotateCcw, Lightbulb, MapPin, FolderOpen } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { AlertBanner } from "@/components/common/AlertBanner";
import { LoadingStatusCard } from "@/components/common/LoadingStatusCard";
import { ModelAttributionBadge } from "@/components/common/ModelAttributionBadge";
import { ALL_SECTORS } from "@/lib/constants";
import { phaseService } from "@/services/phaseService";
import { SessionState } from "@/lib/types";

interface Phase1ViewProps {
  session: SessionState;
  onUpdateSession: (newState: SessionState) => void;
  onAdvanceToNextPhase: () => void;
}

const SAMPLE_FIELD_OBSERVATIONS = [
  {
    label: "Miagao Bulb Onion Farmers",
    text: "Agriculture | Spoke to Barangay Kirayan Tacas onion growers | Lose 40% crop to humidity rot; forced to sell to biyaheros at ₱35/kg instead of ₱120 market rate due to zero cold storage.",
  },
  {
    label: "Carles Small-Scale Fishers",
    text: "Fisheries | Interviewed handline tuna fishers at Bancal port | Pay ₱350/block of ice daily; lose 15% catch to melt before reaching Estancia trading post.",
  },
  {
    label: "Dumangas Milkfish Logistics",
    text: "Aquaculture | Dumangas bangus growers | Lack real-time oxygenation transport; face 8% transit mortality when hauling to Iloilo Central Market.",
  },
];

export const Phase1View: React.FC<Phase1ViewProps> = ({
  session,
  onUpdateSession,
  onAdvanceToNextPhase,
}) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(
    session.phase1_sectors && session.phase1_sectors.length > 0
      ? session.phase1_sectors
      : ALL_SECTORS
  );
  const [fieldObservations, setFieldObservations] = useState("");
  const [showFieldInput, setShowFieldInput] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [additions, setAdditions] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const handleSelectAll = () => setSelectedSectors(ALL_SECTORS);
  const handleClear = () => setSelectedSectors([]);

  const handleRunDiscovery = async () => {
    if (selectedSectors.length === 0) {
      alert("Please select at least 1 target sector.");
      return;
    }
    setIsResearching(true);
    setErrorMessage(null);
    try {
      const res = await phaseService.discover(
        session.session_id,
        selectedSectors,
        fieldObservations.trim() || undefined
      );
      onUpdateSession(res.state);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          "Google Gemini servers are temporarily experiencing high demand (503). Click 'Retry Now' to re-query."
      );
    } finally {
      setIsResearching(false);
    }
  };

  const handleAddObservations = async () => {
    if (!additions.trim()) return;
    setIsAdding(true);
    setErrorMessage(null);
    try {
      const res = await phaseService.addPhase1Observations(session.session_id, additions.trim());
      onUpdateSession(res.state);
      setAdditions("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to add observations. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunDiscovery();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header card */}
      <Card variant="glow" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Phase 1: Startup Problem Discovery</h2>
              <Badge variant="cyan">Western Visayas Signals</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Autonomous AI agent conducts multi-sector research across Iloilo local publications, PSA, DTI, and LGUs to surface unaddressed friction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={handleRunDiscovery}
              isLoading={isResearching}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              {session.phase1_response ? "Re-Run Discovery" : "Run Problem Discovery"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Alert Banner */}
      {errorMessage && (
        <AlertBanner
          type="error"
          title="Connection Notice (503 / 429)"
          message={errorMessage}
          onRetry={handleRunDiscovery}
          onDismiss={() => setErrorMessage(null)}
          isRetrying={isResearching}
        />
      )}

      {/* Sector Selection Grid */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <span>1. Select Target Sectors</span>
            <Badge variant="cyan" size="sm">{selectedSectors.length} of {ALL_SECTORS.length} Active</Badge>
          </h3>
          <div className="flex gap-2">
            <button onClick={handleSelectAll} className="text-xs text-cyan-400 hover:underline">Select All</button>
            <span className="text-slate-600">|</span>
            <button onClick={handleClear} className="text-xs text-slate-400 hover:underline">Reset</button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ALL_SECTORS.map((sector) => {
            const isSelected = selectedSectors.includes(sector);
            return (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/10 scale-[1.01]"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {sector}
              </button>
            );
          })}
        </div>

        {/* Optional Field Observations Toggle & Presets */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <button
            onClick={() => setShowFieldInput(!showFieldInput)}
            className="text-xs font-semibold text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {showFieldInput ? "Hide primary field observations input" : "+ Include team's firsthand field observations"}
          </button>

          {showFieldInput && (
            <div className="space-y-3 pt-1">
              {/* Sample Observation Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3 text-amber-400" /> Fast Scenario Presets (Click to insert):
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_FIELD_OBSERVATIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFieldObservations(preset.text)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Format: [Sector] | [Who you spoke to / what you observed] | [What they currently do to cope]"
                  value={fieldObservations}
                  onChange={(e) => setFieldObservations(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="absolute right-3 bottom-2.5 text-[10px] text-slate-500">
                  Ctrl + Enter to run
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Field observations are prioritized as primary empirical evidence by the research agent.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Loading Status Card */}
      {isResearching && (
        <LoadingStatusCard
          title={`Conducting Iloilo Problem Discovery (${selectedSectors.length} Sectors)`}
          onCancel={() => setIsResearching(false)}
        />
      )}

      {/* Discovery Output View */}
      {session.phase1_response && !isResearching && (
        <div className="space-y-6">
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Discovered Problem Landscape</h3>
              </div>
              <div className="flex items-center gap-2">
                <ModelAttributionBadge meta={session.phase1_model_meta} />
                <Badge variant="emerald">Discovery Complete</Badge>
              </div>
            </div>

            {/* Prominent Top Ingestion & Deduplication Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-md space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Problem Bank Ingestion & Merge Status
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                        Auto-Synchronized
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Extracted problems have been parsed, cross-referenced against existing records, and saved to your Problem Bank.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onAdvanceToNextPhase}
                  className="self-start sm:self-center font-mono text-xs font-bold text-cyan-300 hover:text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Advance to Screening</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {session.phase1_ingestion_summary ? (
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {session.phase1_ingestion_summary.new_created_count > 0 && (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                      <span>🌿 {session.phase1_ingestion_summary.new_created_count} New Problems Added:</span>
                      <span className="font-bold text-white">{session.phase1_ingestion_summary.created_ids.join(", ")}</span>
                    </div>
                  )}
                  {session.phase1_ingestion_summary.merged_count > 0 && (
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-between">
                      <span>🔄 {session.phase1_ingestion_summary.merged_count} Overlapping Problems Merged:</span>
                      <span className="font-bold text-white" title="Citations and workarounds merged into primary records">{session.phase1_ingestion_summary.merged_ids.join(", ")}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>All extracted landscape problems are automatically pooled, deduplicated, and scored in your Problem Bank.</span>
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none prose-sm prose-cyan overflow-x-auto text-slate-200">
              <MarkdownRenderer content={session.phase1_response} />
            </div>
          </Card>

          {/* Additions Box */}
          <Card variant="bordered" className="p-5 space-y-3">
            <h4 className="text-sm font-semibold text-white">Add Corrections or New Field Evidence</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Add 10 cold storage units needed in Dumangas port based on DA interview"
                value={additions}
                onChange={(e) => setAdditions(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Button variant="secondary" size="sm" onClick={handleAddObservations} isLoading={isAdding}>
                Update Landscape
              </Button>
            </div>
          </Card>

          {/* Auto-Sync Banner & Advance Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Auto-Synced to Problem Bank
                </h4>
                <p className="text-[11px] text-slate-300">
                  All discovered problem statements, evidence tiers, and citations have been parsed and populated into your persistent database.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <Button
                variant="emerald"
                size="md"
                onClick={onAdvanceToNextPhase}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Advance to Phase 2
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
