"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { PitchDeckData, PitchDeckSlide } from "@/lib/types";
import { deliverableService } from "@/services/deliverableService";
import {
  Presentation,
  Sparkles,
  Copy,
  Check,
  Printer,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Mic,
  Maximize2,
  FileText,
} from "lucide-react";

interface PitchDeckViewProps {
  sessionId: string;
  initialDeck?: PitchDeckData | null;
  projectName?: string;
}

export const PitchDeckView: React.FC<PitchDeckViewProps> = ({
  sessionId,
  initialDeck,
  projectName = "Iloilo Venture Project",
}) => {
  const [deck, setDeck] = useState<PitchDeckData | null>(initialDeck || null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await deliverableService.generatePitchDeck(sessionId);
      setDeck(res.pitch_deck);
      setActiveSlideIndex(0);
    } catch (err: any) {
      setError(err.message || "Failed to generate Pitch Deck.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!deck) return;
    const md = [
      `# ${deck.presentation_title || projectName}`,
      `*${deck.tagline}*`,
      "",
      ...deck.slides.map(
        (s) =>
          `---\n\n## Slide ${s.slide_number}: ${s.title}\n### ${s.headline}\n\n${s.bullet_points
            .map((b) => `- ${b}`)
            .join("\n")}\n\n> 🎙️ **Speaker Notes (30s):**\n> ${s.speaker_notes}\n`
      ),
    ].join("\n");

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSlide: PitchDeckSlide | undefined = deck?.slides?.[activeSlideIndex];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              10-Slide Investor & Demo Day Pitch Deck
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Clinical narrative structure grounded in Phase 1–5 problem validation and Phase 5 empirical metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {deck && (
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
            leftIcon={deck ? <RotateCcw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          >
            {deck ? "Re-Generate Deck" : "Generate 10-Slide Deck"}
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
          <Spinner size="lg" label="Formulating 10-slide narrative and speaker script..." />
        </div>
      ) : !deck ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
            <Presentation className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No Pitch Deck Generated Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Auto-generate a 10-slide venture narrative complete with slide copy, key takeaways, and word-for-word speaker notes.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate 10-Slide Deck Now
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Presentation Canvas */}
          {currentSlide && (
            <div className="p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl relative min-h-[380px] flex flex-col justify-between gap-6">
              {/* Slide Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                    Slide {currentSlide.slide_number} of {deck.slides.length} • {currentSlide.title}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentSlide.headline}
                  </h3>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {deck.presentation_title || projectName}
                </span>
              </div>

              {/* Slide Bullets Body */}
              <div className="py-2">
                <ul className="space-y-3 text-sm sm:text-base text-slate-200">
                  {currentSlide.bullet_points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-sm shadow-cyan-400" />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Speaker Notes Callout */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <Mic className="w-3.5 h-3.5" />
                  <span>30-Second Speaker Script</span>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{currentSlide.speaker_notes}"
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls & Thumbnail Stepper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeSlideIndex === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <span className="text-xs font-mono font-bold text-white px-2">
                {activeSlideIndex + 1} / {deck.slides.length}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1))}
                disabled={activeSlideIndex === deck.slides.length - 1}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>

            {/* Slide Pill Selectors */}
            <div className="flex flex-wrap items-center gap-1">
              {deck.slides.map((s, idx) => (
                <button
                  key={s.slide_number}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeSlideIndex === idx
                      ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                  title={s.title}
                >
                  S{s.slide_number}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
