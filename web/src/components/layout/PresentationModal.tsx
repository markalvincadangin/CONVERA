"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Sparkles, Award, Presentation, Target, ShieldCheck, Layers, TrendingUp, CheckCircle2, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { ScreeningScorecardGrid } from "@/components/phases/phase2/ScreeningScorecardGrid";
import { SessionState } from "@/lib/types";

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionState | null;
}

const parseScreeningData = (rawText: string | undefined) => {
  if (!rawText) return null;
  try {
    const direct = JSON.parse(rawText);
    if (direct && Array.isArray(direct.results)) return direct;
  } catch {}

  try {
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed && Array.isArray(parsed.results)) return parsed;
    }
  } catch {}

  try {
    const startIdx = rawText.indexOf("{");
    const endIdx = rawText.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const substr = rawText.slice(startIdx, endIdx + 1);
      const parsed = JSON.parse(substr);
      if (parsed && Array.isArray(parsed.results)) return parsed;
    }
  } catch {}

  return null;
};

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen || !session) return null;

  const projectName = session.project_name || "Iloilo Technopreneurship Venture";
  const problemValidated = session.phase3_problem || "Validated Regional Problem";
  const phase2Structured = parseScreeningData(session.phase2_response);

  const slides = [
    {
      title: "Venture Overview & Opportunity",
      subtitle: "Executive Problem-to-Solution Pitch Dossier",
      icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
      content: (
        <div className="space-y-6 text-center py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 p-1.5 shadow-xl shadow-cyan-500/10 flex items-center justify-center">
              <img src="/brand/brandmark.png" alt="CONVERA Brandmark" className="w-full h-full object-contain" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              Evidence-Ratcheted Technopreneurship Engine
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {projectName}
          </h1>
          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A systematically vetted venture hypothesis addressing core economic friction in the Western Visayas region, governed by empirical validation gates.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Validation Status</span>
              <span className="text-sm font-bold text-emerald-400">
                {session.phase5_complete ? "MVP Audited (Phase 5)" : session.phase3_complete ? "Field Validated (Phase 3)" : "In Discovery"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Session Token</span>
              <span className="text-sm font-bold text-white font-mono">{session.session_id}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Mom Test Gates</span>
              <span className="text-sm font-bold text-cyan-400">
                {session.completed_levels ? `${session.completed_levels.length}/6 Levels` : "0/6 Levels"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">SVB Hypotheses</span>
              <span className="text-sm font-bold text-purple-400">
                {session.phase4_concepts ? `${session.phase4_concepts.length} Concepts` : "Multi-Family"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Phase 1: Problem Landscape Discovery",
      subtitle: "Uncovering Root Friction & Existing Workarounds",
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
            <strong>Key Finding:</strong> Discovered localized pain points across Western Visayas commercial sectors, translating solutions-in-disguise into root unaddressed friction.
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm">
            {session.phase1_response ? (
              <MarkdownRenderer content={session.phase1_response} />
            ) : (
              <p className="text-slate-500 italic py-8 text-center">Phase 1 discovery data not yet generated.</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Phase 2: 10-Column Screening Scorecard",
      subtitle: "5-Criteria Plausibility & Winnability Triage",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
            <strong>Triage Criteria:</strong> Evaluated candidates across Pain Plausibility, Frequency/Urgency, Local Market Size, Existing Sacrifice, and Research Accessibility.
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {phase2Structured ? (
              <ScreeningScorecardGrid
                data={phase2Structured}
                onSelectProblem={() => {}}
                selectedProblem={session.phase3_problem}
              />
            ) : session.phase2_response ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm">
                <MarkdownRenderer content={session.phase2_response} />
              </div>
            ) : (
              <p className="text-slate-500 italic py-8 text-center">Phase 2 screening scorecard not yet generated.</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Phase 3: Socratic Mom Test Defense",
      subtitle: "Empirical Field Evidence vs. Polite Compliments",
      icon: <Award className="w-6 h-6 text-amber-400" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
            <strong>Target Problem Validated:</strong> {problemValidated}
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm">
            {session.phase3_response ? (
              <MarkdownRenderer content={session.phase3_response} />
            ) : (
              <p className="text-slate-500 italic py-8 text-center">Phase 3 customer validation clinic in progress.</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Phase 4: Multi-Mechanism SVB Ideation",
      subtitle: "Divergent Concepts across 15 Mechanism Families",
      icon: <Layers className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200">
            <strong>Divergent Ideation Rule:</strong> Explored software, hardware, physical hubs, logistics, financial pooling, and community mechanisms to prevent app-only bias.
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm">
            {session.phase4_response ? (
              <MarkdownRenderer content={session.phase4_response} />
            ) : (
              <p className="text-slate-500 italic py-8 text-center">Phase 4 SVB ideation canvas not yet generated.</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Phase 5: MVP Empirical Validation Audit",
      subtitle: "Skin-in-the-Game Behavioral Commitments & Verdict",
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
            <strong>Evidence Hierarchy:</strong> Enforced Tier 1 (Cash/Downpayment) and Tier 2 (Time Committed) thresholds while discarding verbal praise.
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm">
            {session.phase5_response ? (
              <MarkdownRenderer content={session.phase5_response} />
            ) : (
              <p className="text-slate-500 italic py-8 text-center">Phase 5 MVP validation audit not yet executed.</p>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
              <img src="/brand/brandmark.png" alt="CONVERA Brandmark" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">CONVERA Presentation Mode</span>
              <p className="text-[11px] text-slate-400">Slide {currentSlide + 1} of {slides.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Content Area */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
              {slides[currentSlide].icon}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-xs text-slate-400">{slides[currentSlide].subtitle}</p>
              </div>
            </div>

            {slides[currentSlide].content}
          </div>
        </div>

        {/* Bottom Navigation Controller */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? "w-8 bg-cyan-400 shadow-sm shadow-cyan-400/50" : "w-2 bg-slate-700 hover:bg-slate-600"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous Slide
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={currentSlide === slides.length - 1}
              onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next Slide
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
