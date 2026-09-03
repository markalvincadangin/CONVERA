"use client";

import React, { useState } from "react";
import {
  Search, BookOpen, HelpCircle, Sparkles, ShieldCheck, Layers, Compass, Award,
  Crown, Microscope, GraduationCap, Scale, FolderOpen, FileText, Lock, BarChart3, Presentation, X
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "QUICKSTART" | "PROBLEM_BANK" | "PHASES" | "STUDIO" | "ROLES" | "HEALTH" | "FAQS" | "GLOSSARY"
  >("QUICKSTART");

  if (!isOpen) return null;

  const faqs = [
    {
      q: "What is the Problem Bank and how does it help our team?",
      a: "The Problem Bank is your team's centralized SQLite repository of real-world frictions. You can discover problems via Phase 1 automated scans, or type raw messy field observations that AI structures into clinical problem statements while preserving your full editing authority.",
    },
    {
      q: "How does the Devil's Advocate agent work?",
      a: "The Devil's Advocate is an adversarial AI agent designed to combat LLM sycophancy. It attacks your hidden assumptions, identifies missing statistical evidence, asks lethal kill questions, and generates a hardened, defensible reframing.",
    },
    {
      q: "How is the 5-Dimension Evidence Score calculated?",
      a: "The Evidence Scorer evaluates: (1) Source Diversity (0-20), (2) Source Tier Quality (0-25), (3) Quantified Consequence (0-20), (4) Active Workaround (0-20), and (5) Geographic Precision (0-15). A score >= 75% indicates a priority candidate ready for validation.",
    },
    {
      q: "What is the Portfolio Blind Spot Radar?",
      a: "The Blind Spot Radar analyzes all problems across your entire portfolio, mapping coverage across the 8 canonical Philippine sectors, warning about cognitive/sampling biases, and suggesting high-leverage regional opportunities in Western Visayas.",
    },
    {
      q: "How do we generate our Lean Canvas and 10-Slide Pitch Deck?",
      a: "Navigate to the Studio tab in the top stepper. RatchetAI synthesizes your validated Phase 1-5 findings into an Ash Maurya 9-Box Lean Canvas, a 2x2 SWOT with competitor comparison, and a 10-Slide Investor Pitch Deck with 30-second speaker scripts.",
    },
    {
      q: "How do Team Roles and Passcodes work?",
      a: "Click your avatar in the navbar to switch between Founder/Lead, Researcher, Mentor/Professor, and Judge. You can also protect your venture room with a 4-digit PIN so other teams in your cohort cannot view or modify your research.",
    },
    {
      q: "Why does the Mom Test in Phase 3 reject compliments?",
      a: "In Rob Fitzpatrick's Mom Test, compliments have zero empirical value. The Socratic agent demands verified past behavior: when did they last experience the problem, what exact workaround did they use, and what economic loss did they suffer?",
    },
    {
      q: "How do Milestone Snapshots & Rollbacks work?",
      a: "Milestone Snapshots are immutable git commit-style checkpoints of your entire 5-phase venture. If customer interviews in Phase 3 or Phase 5 invalidate your hypothesis, open the Sessions modal -> Snapshots tab, and click Restore State to instantly rewind without losing prior work.",
    },
  ];

  const glossaryItems = [
    { term: "Problem Bank", def: "A persistent, multi-user database of localized problems categorized by sector, evidence tier, and 5-dimension confidence score." },
    { term: "Devil's Advocate", def: "An adversarial agent that stress-tests problem hypotheses, attacks unstated assumptions, and formulates kill questions." },
    { term: "Blind Spot Radar", def: "A portfolio audit engine that checks sector coverage, demographic voids, and cognitive biases across your venture collection." },
    { term: "The Mom Test", def: "Customer discovery methodology prohibiting idea pitches; focuses strictly on concrete past actions, actual workarounds, and economic sacrifices." },
    { term: "Behavioral Commitment Hierarchy", def: "A 5-tier evidence grading scale: Tier 1 (Cash deposit) > Tier 2 (Time committed) > Tier 3 (Reputation risk) > Tier 4 (Contact info) > Tier 5 (Verbal praise, discarded)." },
    { term: "Ash Maurya 9-Box Lean Canvas", def: "A streamlined startup canvas mapping Problem, Segments, UVP, Mechanisms, Channels, Revenue, Costs, Metrics, and Unfair Moat." },
    { term: "Venture Health Index", def: "A composite 0-100% metric combining Gate Completion (35%), Evidence Rigor (25%), Experimentation (25%), and Deliverables (15%)." },
    { term: "15 Mechanism Families", def: "A divergent taxonomy of solution types (Software, Hardware, Physical Hubs, Financial Pooling, Logistics, Social Intermediaries) ensuring founders do not default solely to mobile apps." },
    { term: "Mechanical Ratchet", def: "A one-way governance invariant where downstream prototyping phases remain locked until upstream problem validation gates are empirically passed." },
  ];

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredGlossary = glossaryItems.filter(g => g.term.toLowerCase().includes(searchQuery.toLowerCase()) || g.def.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Help &amp; Documentation Center</h2>
                <Badge variant="cyan" size="sm">v3.1 Guide</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Complete guide to Problem Bank, AI Boosters, 5-Phase Validation, Deliverables Studio, and Team Roles.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center gap-2 overflow-x-auto">
          {[
            { id: "QUICKSTART", label: "Quickstart", icon: Compass },
            { id: "PROBLEM_BANK", label: "Problem Bank & AI", icon: FolderOpen },
            { id: "PHASES", label: "5-Phase Playbook", icon: Layers },
            { id: "STUDIO", label: "Deliverables Studio", icon: Presentation },
            { id: "ROLES", label: "Roles & Security", icon: Crown },
            { id: "HEALTH", label: "Health & Badges", icon: Award },
            { id: "FAQS", label: "FAQs", icon: HelpCircle },
            { id: "GLOSSARY", label: "Glossary", icon: BookOpen },
          ].map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  active ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeCategory === "QUICKSTART" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-6 bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-3xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-base font-bold">The 5-Minute Validation Workflow</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  RatchetAI enforces an empirical validation pipeline: discover real regional problems, screen for economic pain, stress-test with Socratic interviews, formulate divergent mechanisms, and audit real customer commitments before writing code.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center font-mono">1</span>
                    Discover or Log Observations
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Start in the <strong>Problem Bank</strong> or <strong>Phase 1</strong>. Log your team's field observations or run regional discovery. AI structures your notes while keeping you in full editing control.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center font-mono">2</span>
                    Challenge Fragile Assumptions
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click <strong>Stress Test</strong> on candidate problems to unleash the <strong>Devil's Advocate</strong> agent. Expose unstated assumptions and fatal kill questions before committing time.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center font-mono">3</span>
                    Pass Socratic Mom Test &amp; MVP Audit
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    In <strong>Phase 3</strong>, advance through all 6 Socratic levels. In <strong>Phase 5</strong>, test an empirical Concierge or Pre-order MVP and observe actual customer deposits (Tier 1).
                  </p>
                </div>
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center font-mono">4</span>
                    Generate Studio Deliverables
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Open the <strong>Deliverables Studio</strong> to instantly generate your <strong>Ash Maurya 9-Box Lean Canvas</strong>, <strong>SWOT Matrix</strong>, and <strong>10-Slide Pitch Deck</strong> with speaker scripts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeCategory === "PROBLEM_BANK" && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Problem Bank &amp; AI Quality Boosters</h3>
                <p className="text-xs text-slate-400">
                  How to manage problem records, use AI note structuring, run Devil's Advocate attacks, and detect portfolio blind spots.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4" /> AI Field Note Structurer
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click <strong>+ Log Problem</strong> in the Problem Bank. Paste raw messy notes from founder interviews. The AI extracts the pure friction, identifies the sufferer, strips premature solution pitches, and recommends source verification. You retain 100% authority to review and edit before saving.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-red-500/30 bg-red-950/10 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" /> Devil's Advocate Adversarial Agent
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click <strong>Stress Test</strong> on any problem card. The Devil's Advocate agent performs 4 rigorous checks: (1) <em>Assumption Attacks</em>, (2) <em>Evidence Gap Analysis</em>, (3) <em>Fatal Kill Questions</em>, and (4) <em>Hardened Reframing</em>. It assigns a Plausibility Score to combat confirmation bias.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-teal-500/30 bg-teal-950/10 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                    <BarChart3 className="w-4 h-4" /> 5-Dimension Evidence Scorer (0-100%)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every problem receives an objective rubric score across 5 dimensions: Source Diversity (0-20), Tier Quality (0-25), Quantified Consequence (0-20), Active Workaround (0-20), and Geographic Precision (0-15). Cards show clear color-coded confidence meters.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <Compass className="w-4 h-4" /> Portfolio Blind Spot Radar
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click <strong>Blind Spot Radar</strong> in the Problem Bank header. The agent evaluates your entire portfolio across the 8 canonical Philippine sectors, flags cognitive biases, and suggests high-leverage opportunities in Western Visayas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeCategory === "STUDIO" && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Deliverables Studio &amp; Pitch Generator</h3>
                <p className="text-xs text-slate-400">
                  Automatically formulate academic and investor-ready deliverables grounded in your empirical field data.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                    <FileText className="w-4 h-4" /> 9-Box Lean Canvas
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Canonical Ash Maurya framework mapping Problem, Segments, UVP, Mechanisms, Channels, Revenue, Cost Structure, Key Metrics, and Unfair Moat.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs">
                    <Layers className="w-4 h-4" /> 2x2 SWOT &amp; Competitor Grid
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates Strengths, Weaknesses, Opportunities, and Threats paired with a 3-way competitor comparison against regional alternatives.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Presentation className="w-4 h-4" /> 10-Slide Pitch Deck
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Slide-by-slide narrative for startup defense presentations with bulleted slide points and 30-second word-for-word speaker talking scripts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeCategory === "ROLES" && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Team Profiles &amp; Room Security PINs</h3>
                <p className="text-xs text-slate-400">
                  Frictionless team collaboration with role-based permissions and room protection.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Founder / Team Lead</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Full editing permissions, unlock phase gates, run AI synthesis, configure project settings, and export deliverables.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Team Researcher</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Log field observations, upvote/downvote problems, leave comments, and run Devil's Advocate challenges.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">Mentor / Professor</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inspect student validation dossiers, leave Socratic guidance notes, verify evidence rubrics, and officially sign off on phase gates.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Pitch Judge / Evaluator</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clean read-only presentation mode for the Deliverables Studio with rubric scoring sheets.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Lock className="w-4 h-4" /> 4-Digit Room PIN Passcode
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Protect your venture room by clicking the Key icon in the top navbar. Set a 4-digit PIN to ensure other teams cannot view or modify your research.
                </p>
              </div>
            </div>
          )}

          {activeCategory === "HEALTH" && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Venture Health Index &amp; Milestone Badges</h3>
                <p className="text-xs text-slate-400">
                  Track your venture's empirical readiness and earn research badges.
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  How Venture Health (0-100%) Is Scored
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Gate Completion</span>
                    <strong className="text-cyan-300 font-mono text-sm">35 pts max</strong>
                    <span className="text-[10px] text-slate-500 block">7 pts per phase passed</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Evidence Rigor</span>
                    <strong className="text-emerald-300 font-mono text-sm">25 pts max</strong>
                    <span className="text-[10px] text-slate-500 block">Problem Bank rubric avg</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Experimentation</span>
                    <strong className="text-purple-300 font-mono text-sm">25 pts max</strong>
                    <span className="text-[10px] text-slate-500 block">Phase 5 skin-in-game</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Deliverables</span>
                    <strong className="text-teal-300 font-mono text-sm">15 pts max</strong>
                    <span className="text-[10px] text-slate-500 block">Canvas, SWOT &amp; Deck</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === "PHASES" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">5-Phase Technopreneurship Playbook</h3>
                <p className="text-xs text-slate-400">
                  How each phase operates and the criteria required to unlock downstream stages.
                </p>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-cyan-400">Phase 1: Problem Landscape Discovery</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Scans 8 localized sectors across Western Visayas. Rejects premature solution pitches and populates the Problem Bank with cited evidence.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-teal-400">Phase 2: Problem Screening &amp; Shortlisting</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Scores candidate problems on Frequency, Severity, Market Size, and Workaround Cost to output ADVANCE, SECOND_LOOK, or PARK verdicts.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-purple-400">Phase 3: Socratic Mom Test Validation</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Simulates 6 Socratic levels of customer discovery interviews. Rejects compliments and demands verified past behavior and economic proof.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-amber-400">Phase 4: Solution Ideation &amp; SVB Canvas</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Forces divergence across 15 Mechanism Families to ensure you avoid default mobile apps.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-1">
                  <span className="text-xs font-bold text-emerald-400">Phase 5: MVP Empirical Validation Audit</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Audits real customer commitments (Tier 1 cash deposits to Tier 4 time) to output PURSUE, PIVOT, or RETIRE verdicts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeCategory === "FAQS" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {filteredFaqs.map((faq, i) => (
                  <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed pl-5.5">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === "GLOSSARY" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-base font-bold text-white">Technopreneurship Glossary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredGlossary.map((item, i) => (
                  <div key={i} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-xs font-bold font-mono text-cyan-400">{item.term}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.def}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>RatchetAI v3.1 Documentation</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Guide
          </Button>
        </div>
      </div>
    </div>
  );
};
