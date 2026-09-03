"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { MECHANISM_FAMILIES, COMMITMENT_TIERS } from "@/lib/constants";
import {
  Shield, Target, Lightbulb, TrendingUp, BarChart3,
  Layers, FlaskConical, Scale, BookOpen, GraduationCap,
  Sparkles, CheckCircle2
} from "lucide-react";

interface CheatsheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatsheetDrawer: React.FC<CheatsheetDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"innovation" | "research">("innovation");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CONVERA Methodology Framework Guide & Cheatsheet" maxWidth="4xl">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 text-slate-200 text-sm font-sans">
        
        {/* Track Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("innovation")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "innovation"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Venture Innovation Track (Phases 1-5)</span>
          </button>
          <button
            onClick={() => setActiveTab("research")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "research"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Computing Research DSR Track (Stages A-F)</span>
          </button>
        </div>

        {activeTab === "innovation" ? (
          <>
            {/* Golden Rule */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <Target className="w-5 h-5" /> The Golden Rule of Discovery
              </div>
              <p className="text-slate-300 italic text-sm leading-relaxed">
                &ldquo;Effective ideation searches for problems, each with a concrete, field-ready sufferer definition so you can go out and find people who are already bleeding cash and already spending to cope—no hypotheticals, no solution talk.&rdquo;
              </p>
            </div>

            {/* 5-Dimension Evidence Rubric */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-400 font-bold">
                  <BarChart3 className="w-5 h-5" /> 5-Dimension Evidence Scoring Rubric (0-100%)
                </div>
                <Badge variant="emerald" size="sm">Gate Threshold: &ge; 75%</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">1. Diversity</span>
                  <strong className="text-cyan-300 font-mono text-sm">20 pts</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">&ge; 3 distinct primary or institutional citations</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">2. Tier Quality</span>
                  <strong className="text-emerald-300 font-mono text-sm">25 pts</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tier A (PSA/DA) or Tier B (Direct interview)</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">3. Consequence</span>
                  <strong className="text-purple-300 font-mono text-sm">20 pts</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">Specific economic, time, or life loss (e.g. ₱45k)</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">4. Workaround</span>
                  <strong className="text-amber-300 font-mono text-sm">20 pts</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">Active makeshift workaround already used</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">5. Geography</span>
                  <strong className="text-teal-300 font-mono text-sm">15 pts</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">Barangay/LGU level precision (e.g. Miagao, Iloilo)</p>
                </div>
              </div>
            </div>

            {/* Mom Test Anti-Pitch Rules */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Shield className="w-5 h-5" /> The Mom Test Defense Protocol (Phase 3)
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <li className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-white block mb-1">1. Life, Not Idea</span>
                  <span className="text-xs text-slate-400">Ask about their past daily routine and actual coping actions. Never pitch or explain your solution.</span>
                </li>
                <li className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-white block mb-1">2. Past Specifics</span>
                  <span className="text-xs text-slate-400">Measure what they actually paid, lost, or did last week. Reject opinions about hypothetical future use.</span>
                </li>
                <li className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-white block mb-1">3. Beware Polite Nods</span>
                  <span className="text-xs text-slate-400">&ldquo;That&apos;s a cool app&rdquo; or &ldquo;I&apos;d definitely buy that&rdquo; is polite noise. Look for revealed sacrifice.</span>
                </li>
              </ul>
            </div>

            {/* 15 Mechanism Families */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Lightbulb className="w-5 h-5" /> 15 Divergent Mechanism Families (Phase 4)
              </div>
              <p className="text-xs text-slate-400">
                Never default directly to a mobile app or dashboard. Consider all 15 operational mechanism families:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {MECHANISM_FAMILIES.map((fam) => (
                  <div key={fam.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="font-mono text-cyan-400 font-bold text-xs block">{fam.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{fam.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavioral Commitment Hierarchy */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <TrendingUp className="w-5 h-5" /> Behavioral Commitment Hierarchy (Phase 5)
              </div>
              <div className="space-y-2">
                {COMMITMENT_TIERS.map((tier) => (
                  <div key={tier.tier} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <Badge variant={tier.tier === "TIER_1_FINANCIAL" ? "emerald" : tier.tier === "TIER_5_POLITE_INTEREST" ? "rose" : "cyan"} size="sm">
                      {tier.label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">{tier.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* DSR Cardinal Rule */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <GraduationCap className="w-5 h-5" /> Design Science Research Invariant (March & Smith / Hevner)
              </div>
              <p className="text-slate-300 italic text-sm leading-relaxed">
                &ldquo;Computing research creates things that serve human purposes. A research gap is an unsolved computational challenge where existing methods provably degrade under localized empirical constraints.&rdquo;
              </p>
            </div>

            {/* 4 DSR Artifact Classes */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Layers className="w-5 h-5" /> 4 DSR Artifact Contribution Classes (March & Smith)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-indigo-400">1. Constructs</span>
                  <p className="text-slate-400 text-[11px]">Formal vocabulary, domain taxonomy, and entity schemas defining the problem concepts.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-cyan-400">2. Models</span>
                  <p className="text-slate-400 text-[11px]">Causal loops, state machines, and mathematical equations expressing relational dynamics.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-emerald-400">3. Methods</span>
                  <p className="text-slate-400 text-[11px]">Algorithms, heuristic search routines, and algorithmic transformation pipelines.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-purple-400">4. Instantiations</span>
                  <p className="text-slate-400 text-[11px]">Working software microservices, embedded edge firmware, or physical testbeds.</p>
                </div>
              </div>
            </div>

            {/* Kothari Trapping Protocol */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <FlaskConical className="w-5 h-5" /> Kothari Experimental Trapping Protocol (Stage E)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">Independent Variables</span>
                  <span className="text-slate-400">Quantization bit-width (INT8 vs FP32), model architecture, network jitter.</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-emerald-300 block mb-1">Dependent Metrics</span>
                  <span className="text-slate-400">Inference latency (ms), F1 diagnostic score, memory footprint (MB), battery drain.</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-purple-300 block mb-1">Controlled Baselines</span>
                  <span className="text-slate-400">SOTA standard weights (YOLOv8), unoptimized thresholding, classical heuristics.</span>
                </div>
              </div>
            </div>

            {/* National Roadmap & Ethics */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Scale className="w-5 h-5" /> Institutional & Ethics Governance (Stage F)
              </div>
              <p className="text-xs text-slate-400">
                Ensures alignment with <strong>DOST-PCIEERD Regional Roadmaps</strong>, <strong>UN Sustainable Development Goals (SDG 2, 9, 11)</strong>, and <strong>Republic Act 10173 (Data Privacy Act of 2012)</strong>.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
