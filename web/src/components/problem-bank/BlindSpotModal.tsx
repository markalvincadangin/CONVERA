"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { BlindSpotAnalysis, ProblemRecord } from "@/lib/types";
import { problemService } from "@/services/problemService";
import { ALL_SECTORS } from "@/lib/constants";
import {
  Compass,
  AlertTriangle,
  Lightbulb,
  Radar,
  TrendingUp,
  BrainCircuit,
  RotateCcw,
  CheckCircle2,
  MapPin,
  HelpCircle,
} from "lucide-react";

interface BlindSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  problemsCount: number;
}

export const BlindSpotModal: React.FC<BlindSpotModalProps> = ({
  isOpen,
  onClose,
  projectId,
  problemsCount,
}) => {
  const [analysis, setAnalysis] = useState<BlindSpotAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await problemService.detectBlindSpots(projectId);
      setAnalysis(res.analysis);
    } catch (err: any) {
      setError(err.message || "Failed to run Blind Spot audit.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Portfolio Blind Spot & Bias Auditor"
      maxWidth="4xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Intro */}
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Radar className="w-4 h-4 text-cyan-400" />
              Strategic Portfolio Radar
            </h4>
            <p className="text-xs text-slate-400">
              Evaluates {problemsCount} recorded problems across all 8 sectors to find blind spots, sampling biases, and untapped regional opportunities.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleScan}
            isLoading={isLoading}
            leftIcon={<Radar className="w-3.5 h-3.5" />}
          >
            {analysis ? "Re-Audit Portfolio" : "Scan Blind Spots"}
          </Button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Spinner size="lg" label="Auditing your problem bank across Western Visayas economic sectors and demographic categories..." />
          </div>
        ) : analysis ? (
          <div className="space-y-5">
            {/* Sector Distribution Grid */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                8-Sector Coverage Distribution
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_SECTORS.map((sector) => {
                  const count = analysis.sector_distribution?.[sector] || 0;
                  const hasProblems = count > 0;
                  return (
                    <div
                      key={sector}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between gap-1 ${
                        hasProblems
                          ? "bg-cyan-500/10 border-cyan-500/30 text-white"
                          : "bg-slate-900/40 border-slate-800 text-slate-500"
                      }`}
                    >
                      <span className="text-[11px] font-medium line-clamp-1">{sector}</span>
                      <span className="font-mono font-bold text-xs">
                        {count} {count === 1 ? "problem" : "problems"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Identified Blind Spots */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Identified Blind Spots & Coverage Voids ({analysis.identified_blind_spots?.length || 0})
                </h4>
              </div>

              <div className="space-y-2.5">
                {analysis.identified_blind_spots?.map((spot, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{spot.area}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          spot.severity === "HIGH"
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {spot.severity} GAP
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{spot.observation}</p>
                    <p className="text-[11px] text-slate-400 italic">💡 {spot.why_it_matters}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cognitive Biases Flagged */}
            {analysis.cognitive_biases_flagged && analysis.cognitive_biases_flagged.length > 0 && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <BrainCircuit className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Cognitive Bias Alerts ({analysis.cognitive_biases_flagged.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {analysis.cognitive_biases_flagged.map((b, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs"
                    >
                      <span className="font-bold text-purple-300">{b.bias_type}</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{b.manifestation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested High-Leverage Explorations */}
            {analysis.suggested_explorations && analysis.suggested_explorations.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-teal-950/40 to-cyan-950/40 rounded-2xl border border-teal-500/30 space-y-3">
                <div className="flex items-center gap-2 text-teal-300">
                  <Lightbulb className="w-4 h-4 text-teal-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Suggested Exploration Questions (Western Visayas)
                  </h4>
                </div>

                <div className="space-y-2">
                  {analysis.suggested_explorations.map((exp, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1 text-xs"
                    >
                      <div className="flex items-center gap-2 text-teal-400 font-mono text-[10px]">
                        <span>{exp.sector}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {exp.target_location}
                        </span>
                      </div>
                      <p className="text-white font-medium italic">
                        "{exp.starter_friction_question}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
