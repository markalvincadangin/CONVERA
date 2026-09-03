"use client";

import React, { useState } from "react";
import {
  Search, BookOpen, HelpCircle, Sparkles, ShieldCheck, Layers, Compass, Award,
  Crown, Microscope, GraduationCap, Scale, FolderOpen, FileText, Lock, BarChart3,
  Presentation, X, Command, Keyboard, CheckCircle2, ArrowRight, Shield, Zap,
  FlaskConical, Binary, Lightbulb
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
    "QUICKSTART" | "FRAMEWORKS" | "RESEARCH_DSR" | "PHASES" | "PROBLEM_BANK" | "STUDIO" | "COMMAND_PALETTE" | "ROLES" | "HEALTH" | "FAQS" | "GLOSSARY"
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
      a: "Navigate to the Studio tab in the top stepper. CONVERA synthesizes your validated findings into an Ash Maurya 9-Box Lean Canvas, a 2x2 SWOT with competitor comparison, and a 10-Slide Investor Pitch Deck with 30-second speaker scripts.",
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
            { id: "FRAMEWORKS", label: "Dual Frameworks (CCDS)", icon: Layers },
            { id: "RESEARCH_DSR", label: "Research & DSR Playbook", icon: GraduationCap },
            { id: "PHASES", label: "Innovation 5-Phase Playbook", icon: Lightbulb },
            { id: "PROBLEM_BANK", label: "Problem Bank & AI", icon: FolderOpen },
            { id: "STUDIO", label: "Deliverables Studio", icon: Presentation },
            { id: "COMMAND_PALETTE", label: "Command Palette (Ctrl+K)", icon: Command },
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
                  CONVERA enforces an evidence-driven validation pipeline across both Venture Innovation and Computing Research frameworks: discover real regional problems, screen for economic pain, stress-test with Socratic interviews, formulate divergent mechanisms, and audit real customer commitments before writing code.
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

          {/* 2. DUAL FRAMEWORKS */}
          {activeCategory === "FRAMEWORKS" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 bg-slate-950 rounded-2xl border border-blue-500/30 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Layers className="w-4 h-4" /> CONVERA Concept Development Standard (CCDS)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Knowledge != Workflow.</strong> Your Problem Bank records, empirical claims, citations, and decision room evaluations are stored in a persistent relational Knowledge Graph. Switching frameworks reconfigures the workflow stepper without resetting your underlying research.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Innovation Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-950 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <Zap className="w-4 h-4" /> Venture Innovation Track
                    </div>
                    <Badge variant="cyan" size="sm">5 Stages • 2 Gates</Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Optimized for technopreneurs, startup incubators, and product discovery teams.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Phase 1: Problem Discovery &amp; Bank</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Phase 2: Economic Pain Screening [Gate 1]</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Phase 3: Socratic Mom Test Validation [Gate 2]</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Phase 4: 15 Divergent Solution Mechanisms</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Phase 5: MVP Behavioral Commitment Audit</li>
                  </ul>
                </div>

                {/* Research Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <GraduationCap className="w-4 h-4" /> Computing Research Track (DSR)
                    </div>
                    <Badge variant="emerald" size="sm">6 Stages • 4 Gates</Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Governed by Design Science Research (March &amp; Smith / Hevner) for academic thesis and R&amp;D projects.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Stage A: Empirical Problem Scouting</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Stage B: Dual-Literature Grounding [Gate 1]</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Stage C: Literature Matrix &amp; Gap [Gate 2]</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Stage D: 4 DSR Artifact Specifications</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Stage E: Kothari Experimental Trapping [Gate 3]</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Stage F: DOST/SDG Ethics Governance [Gate 4]</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 3. RESEARCH & DSR PLAYBOOK */}
          {activeCategory === "RESEARCH_DSR" && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Computing Research &amp; DSR Methodological Protocol</h3>
                <p className="text-xs text-slate-400">
                  The 6-stage scientific concept development standard for computing thesis and R&amp;D proposals.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <Search className="w-4 h-4" /> Stage A &amp; B: Scouting &amp; Grounding (Gate 1)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Collect domain breakdowns (Bordens &amp; Abbott) and ground observations in peer-reviewed literature across OpenAlex, Europe PMC, and Crossref. Gate 1 requires statistical magnitude and verified citations.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                    <Layers className="w-4 h-4" /> Stage C &amp; D: Literature Matrix &amp; 4 DSR Artifacts (Gate 2)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Synthesize state-of-the-art baselines into an interactive Literature Matrix Table. Formulate the computing artifact across the 4 canonical classes (March &amp; Smith, 1995): <em>Constructs</em> (vocabularies), <em>Models</em> (equations/graphs), <em>Methods</em> (algorithms), and <em>Instantiations</em> (software prototypes).
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <FlaskConical className="w-4 h-4" /> Stage E: Kothari Experimental Trapping Protocol (Gate 3)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Design a 3x3 experimental matrix defining Independent Variables (quantization, bit-width, architecture), Dependent Metrics (latency ms, F1 score, memory MB), and Controlled Baselines (SOTA models) to mathematically trap algorithmic contributions.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Scale className="w-4 h-4" /> Stage F: Institutional &amp; Ethics Governance (Gate 4)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Verify strategic alignment with <strong>DOST-PCIEERD Regional Roadmaps</strong>, <strong>UN Sustainable Development Goals (SDG 2, 9, 11)</strong>, and <strong>RA 10173 (Data Privacy Act of 2012)</strong> before proposal submission.
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

          {/* 7. COMMAND PALETTE */}
          {activeCategory === "COMMAND_PALETTE" && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Global Command Palette &amp; Keyboard Shortcuts</h3>
                <p className="text-xs text-slate-400">
                  Navigate anywhere in your workspace at the speed of thought.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Command className="w-4 h-4" /> Quick Launcher Shortcut
                </div>
                <p className="text-xs text-slate-300">
                  Press <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300 text-xs">Ctrl + K</kbd> (or <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300 text-xs">Cmd + K</kbd>) anywhere to open the spotlight modal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-white block">Search Problem Records</span>
                  <span className="text-slate-400">Type problem codes (e.g. AGR-004) or keywords to view and edit details instantly.</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-white block">Stage Navigation</span>
                  <span className="text-slate-400">Jump directly to Problem Bank, Scouting, Decision Room, Matrix, or Deliverables Studio.</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-white block">Intelligence Drawers</span>
                  <span className="text-slate-400">Trigger AI Ingest, Blind Spot Scanner, Scorecard Drawer, Traceability Graph, or Framework Switcher.</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-white block">Keyboard Navigation</span>
                  <span className="text-slate-400">Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">↓</kbd> to cycle items, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">Enter</kbd> to execute, and <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">Esc</kbd> to close.</span>
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
          <span>CONVERA v3.0 Documentation</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Guide
          </Button>
        </div>
      </div>
    </div>
  );
};
