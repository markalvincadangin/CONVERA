"use client";

import React, { useState, useEffect } from "react";
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
  Clock,
  Radio,
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!deck || deck.slides.length === 0) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.min(prev + 1, deck.slides.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deck]);

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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              10-Slide Investor &amp; Demo Day Pitch Deck
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Clinical narrative structure grounded in Phase 1-5 problem validation and Phase 5 empirical metrics.
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
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20 shadow-inner">
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
          {/* Main 16:9 Presentation Stage */}
          {currentSlide && (
            <div className="p-8 sm:p-10 bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 rounded-3xl border border-purple-500/30 shadow-2xl relative min-h-[420px] flex flex-col justify-between gap-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
                      Slide {currentSlide.slide_number} of {deck.slides.length}
                    </span>
                    <span className="text-slate-600 font-mono">•</span>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {currentSlide.title}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentSlide.headline}
                  </h3>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0 hidden sm:inline-block">
                  {deck.presentation_title || projectName}
                </span>
              </div>

              {/* Slide Takeaways Body */}
              <div className="py-3 relative z-10">
                <ul className="space-y-3.5 text-sm sm:text-base text-slate-200">
                  {currentSlide.bullet_points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-md shadow-cyan-400/50 ring-2 ring-cyan-400/20" />
                      <span className="leading-relaxed font-medium">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Speaker Notes Prompter Box */}
              <div className="p-4 sm:p-5 bg-slate-950/95 rounded-2xl border border-purple-500/25 space-y-2 relative z-10 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                    <Mic className="w-4 h-4 text-purple-400" />
                    <span>30-Second Speaker Teleprompter</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> ~30s delivery
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed pl-6 border-l-2 border-purple-500/40">
                  &ldquo;{currentSlide.speaker_notes}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Slide Navigator & Thumbnail Carousel */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800">
            {/* Previous Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={activeSlideIndex === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            {/* Slide Pill Dots */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
              {deck.slides.map((s, idx) => (
                <button
                  key={s.slide_number}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeSlideIndex === idx
                      ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 scale-105 ring-1 ring-purple-400/50"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                  title={`${s.slide_number}. ${s.title}`}
                >
                  {s.slide_number}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveSlideIndex((prev) => Math.min(prev + 1, deck.slides.length - 1))}
              disabled={activeSlideIndex === deck.slides.length - 1}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next Slide
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
