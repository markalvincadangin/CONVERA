"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { MECHANISM_FAMILIES, COMMITMENT_TIERS } from "@/lib/constants";
import { Shield, Target, Lightbulb, TrendingUp } from "lucide-react";

interface CheatsheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatsheetDrawer: React.FC<CheatsheetDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="RatchetAI Framework Guide & Cheatsheet" maxWidth="4xl">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 text-slate-200 text-sm">
        {/* Golden Rule */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
            <Target className="w-5 h-5" /> The Golden Rule of Discovery
          </div>
          <p className="text-slate-300 italic text-sm leading-relaxed">
            &ldquo;Effective ideation searches for problems, each with a concrete, field-ready sufferer definition so you can go out and find people who are already bleeding cash and already spending to cope—no hypotheticals, no solution talk.&rdquo;
          </p>
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
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Lightbulb className="w-5 h-5" /> 15 Mechanism Families (Phase 4 Ideation)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {MECHANISM_FAMILIES.map((m, idx) => (
              <div key={m.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
                  <Badge variant="cyan" size="sm">{idx + 1}</Badge> {m.name}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">{m.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral Commitment Hierarchy */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold">
            <TrendingUp className="w-5 h-5" /> Behavioral Commitment Hierarchy (Phase 5 MVP Audit)
          </div>
          <div className="space-y-2">
            {COMMITMENT_TIERS.map((t) => (
              <div key={t.tier} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-semibold text-white text-xs">{t.label}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
