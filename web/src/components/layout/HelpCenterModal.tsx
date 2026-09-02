"use client";

import React, { useState } from "react";
import { Search, BookOpen, HelpCircle, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Layers, TrendingUp, Key, Share2, Terminal, X, ChevronRight, Lightbulb, Compass, Award, Camera, RotateCcw, History } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"QUICKSTART" | "PHASES" | "SNAPSHOTS" | "FAQS" | "GLOSSARY" | "SHARING">("QUICKSTART");

  if (!isOpen) return null;

  const faqs = [
    {
      q: "How do Milestone Snapshots & Rollbacks work?",
      a: "Milestone Snapshots are immutable 'git commit-style' checkpoints of your entire 5-phase venture. If customer interviews in Phase 3 or Phase 5 invalidate your hypothesis, open the Sessions modal -> Snapshots tab, and click 'Restore State' to instantly rewind without losing prior work.",
    },
    {
      q: "When should our team create a Milestone Snapshot?",
      a: "We recommend saving a checkpoint: (1) After completing Phase 2 screening, (2) Right before heading into the field for Mom Test interviews, (3) Before changing your core mechanism in Phase 4, and (4) Before presenting to your professor.",
    },
    {
      q: "Why is Phase 4 (Solution Ideation) locked?",
      a: "RatchetAI enforces the mechanical ratchet invariant: you cannot design solutions until your problem statement passes all 6 Socratic Mom Test levels in Phase 3. This guarantees you only solve verified, painful problems.",
    },
    {
      q: "Why does the Mom Test agent reject compliments like 'They loved our idea'?",
      a: "In Rob Fitzpatrick's Mom Test, compliments and opinions have zero empirical validity because people are naturally polite. The agent demands concrete past behavior: when did they last experience the problem, what exact workaround did they use, and how much money or hours did they spend?",
    },
    {
      q: "How do my groupmates join my session?",
      a: "Click the 'Sessions' button in the top navbar. You will see a 6-character room code (e.g. RATCH-AGRI). Give this code to your groupmates. On their device, they click 'Sessions' -> 'Join Room Code' and enter the code to load your project.",
    },
    {
      q: "What is a 'Solution in Disguise' in Phase 1?",
      a: "A solution in disguise is a product idea disguised as a problem (e.g., 'Farmers lack an AI mobile app'). RatchetAI translates this back to the root real-world friction (e.g., 'Farmers lose 40% of their crop to ambient humidity rot during storage').",
    },
    {
      q: "How can I pitch my venture to our professor or panel?",
      a: "Click 'Pitch Deck' in the top navbar. It automatically compiles your 5 completed phases into a full-screen interactive 6-slide presentation deck with keyboard navigation.",
    },
  ];

  const glossaryItems = [
    {
      term: "Milestone Snapshot",
      def: "A frozen, immutable state capture of a venture at a specific point in time. Allows 1-click rollbacks during hypothesis invalidations or pivots.",
    },
    {
      term: "The Mom Test",
      def: "A customer discovery methodology developed by Rob Fitzpatrick. It prohibits pitching your idea and instead focuses exclusively on past actions, specific figures, and actual sacrifices.",
    },
    {
      term: "Simplified Validation Board (SVB)",
      def: "A lean canvas that maps customer segments, target mechanisms, and assumptions (P1-P4) with explicit pass/fail experimental metrics.",
    },
    {
      term: "Behavioral Commitment Hierarchy",
      def: "A 5-tier evidence grading scale: Tier 1 (Cash deposit) > Tier 2 (Time committed) > Tier 3 (Reputation risk) > Tier 4 (Contact info) > Tier 5 (Verbal praise, discarded).",
    },
    {
      term: "15 Mechanism Families",
      def: "A divergent taxonomy of solution types (Software, Hardware, Physical Hubs, Financial Pooling, Logistics, Social Intermediaries) ensuring founders do not default solely to mobile apps.",
    },
    {
      term: "Mechanical Ratchet",
      def: "A one-way governance invariant where downstream prototyping phases remain locked until upstream problem validation gates are empirically passed.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGlossary = glossaryItems.filter(
    (g) =>
      g.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.def.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Help & Documentation Center</h2>
                <Badge variant="cyan" size="sm">User Guide</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step guidance, Technopreneurship methodologies, Snapshots & Rollbacks, FAQs, and collaboration tips.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
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

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory("QUICKSTART")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeCategory === "QUICKSTART"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Quickstart (0 to 1)
          </button>

          <button
            onClick={() => setActiveCategory("PHASES")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeCategory === "PHASES"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 5-Phase Playbook
          </button>

          <button
            onClick={() => setActiveCategory("SNAPSHOTS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeCategory === "SNAPSHOTS"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Snapshots & Pivots
          </button>

          <button
            onClick={() => setActiveCategory("FAQS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeCategory === "FAQS"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> FAQs ({faqs.length})
          </button>

          <button
            onClick={() => setActiveCategory("GLOSSARY")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeCategory === "GLOSSARY"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Glossary
          </button>

          <button
            onClick={() => setActiveCategory("SHARING")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeCategory === "SHARING"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Team Sharing
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Quickstart Tab */}
          {activeCategory === "QUICKSTART" && (
            <div className="space-y-6 max-w-4xl">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" /> Welcome to RatchetAI!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  RatchetAI is your automated venture coach designed specifically for student founders and technopreneurs in Western Visayas. It stops you from building products nobody wants by enforcing empirical evidence gates at every step.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm font-mono">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-white">Discover & Observe</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select target sectors in Phase 1 and input your team's field observations from local markets, farms, or MSMEs.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm font-mono">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-white">Score & Triage</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    In Phase 2, review the 10-column scorecard and select a top candidate with the <span className="text-emerald-400 font-semibold">ADVANCE TO VALIDATION</span> badge.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm font-mono">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-white">Defend & Ideate</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pass all 6 Socratic Mom Test levels in Phase 3 to unlock 15-mechanism solution ideation (Phase 4) and MVP audits (Phase 5).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5-Phase Playbook */}
          {activeCategory === "PHASES" && (
            <div className="space-y-4 max-w-4xl">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan">Phase 1</Badge>
                  <h4 className="text-sm font-bold text-white">Startup Problem Discovery</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Focuses on identifying root unaddressed friction in Western Visayas. Eliminates "solutions in disguise" and establishes who the real sufferers are.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald">Phase 2</Badge>
                  <h4 className="text-sm font-bold text-white">10-Column Screening Scorecard</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evaluates candidates on 5 criteria: <strong>Pain Plausibility</strong>, <strong>Frequency/Urgency</strong>, <strong>Market Size</strong>, <strong>Existing Sacrifice</strong>, and <strong>Research Access</strong> (1-5 scale).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="amber">Phase 3</Badge>
                  <h4 className="text-sm font-bold text-white">Socratic Mom Test Defense Clinic</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A conversational clinic demanding past facts and actual money/time spent. Complete Levels 1-6 (Sufferer ➔ Trigger ➔ Workaround ➔ Spend ➔ Sacrifice ➔ Consequence) to validate.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="purple">Phase 4</Badge>
                  <h4 className="text-sm font-bold text-white">Solution Ideation & SVB Canvas</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Brainstorms across 15 Mechanism Families to avoid app-only bias. Prioritizes the single Riskiest Assumption ($P_1$) on the Simplified Validation Board.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald">Phase 5</Badge>
                  <h4 className="text-sm font-bold text-white">MVP Empirical Validation Audit</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Audits conversion rates against pre-set pass/fail thresholds using the 5-Tier Behavioral Commitment Hierarchy. Recommends SCALE, PIVOT, or RETIRE.
                </p>
              </div>
            </div>
          )}

          {/* Snapshots & Pivots Tab */}
          {activeCategory === "SNAPSHOTS" && (
            <div className="space-y-6 max-w-4xl">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" /> Milestone Snapshots & Pivot Safety
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Venture ideation is non-linear. When interviews disprove a key hypothesis, you shouldn't have to start from scratch. Snapshots give your team 1-click time travel back to any prior milestone.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">1. Creating a Checkpoint</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Open <strong>Sessions ➔ Snapshots</strong> tab. Enter a descriptive label like <code className="text-purple-300">Before Farmer Field Interviews</code> and click <strong>"Save Checkpoint"</strong>.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">2. Restoring Prior State (Pivot)</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    If customer discovery disproves your assumption, open the <strong>Snapshots</strong> tab and click <strong>"Restore State"</strong> on any previous checkpoint to instantly rewind your workspace.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Best Practice Checkpoint Cadence:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pt-1">
                  <li><strong>After Phase 2:</strong> Save a checkpoint once your 10-column scorecard selects a problem candidate.</li>
                  <li><strong>Before Mom Test:</strong> Save before conducting interviews in the field.</li>
                  <li><strong>Before Phase 4 Ideation:</strong> Save before branching into divergent mechanism families.</li>
                  <li><strong>Before Class Presentations:</strong> Save your polished final state for defense.</li>
                </ul>
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeCategory === "FAQS" && (
            <div className="space-y-3 max-w-4xl">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    {faq.q}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Glossary Tab */}
          {activeCategory === "GLOSSARY" && (
            <div className="space-y-3 max-w-4xl">
              {filteredGlossary.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-cyan-300">{item.term}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.def}</p>
                </div>
              ))}
            </div>
          )}

          {/* Team Sharing Tab */}
          {activeCategory === "SHARING" && (
            <div className="space-y-4 max-w-4xl">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" /> Method 1: In the Classroom / Same Wi-Fi
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Run <code className="text-cyan-300 font-mono">.\start-dev.ps1</code>. The terminal will print your local Wi-Fi IP address (e.g. <code className="text-amber-300">http://192.168.1.15:3000</code>). Anyone connected to the same Wi-Fi can open that link on their laptop or phone.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" /> Method 2: Remote Collaboration via Cloudflare Tunnel
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Run <code className="text-emerald-300 font-mono">.\share-tunnel.ps1</code>. It will generate a public, secure HTTPS link (e.g. <code className="text-cyan-300">https://xxxx.trycloudflare.com</code>) that works anywhere in the world with zero port forwarding.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" /> Method 3: 6-Character Room Codes
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Share your project room code (e.g. <code className="text-purple-300 font-mono font-bold">RATCH-AGRI</code>) with your groupmates. They can open the Sessions modal, select "Join Room Code", and instantly jump into your shared venture workspace.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
