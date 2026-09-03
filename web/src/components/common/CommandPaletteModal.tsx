"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Compass,
  FolderOpen,
  Filter,
  ShieldCheck,
  Lightbulb,
  Activity,
  Sparkles,
  BookOpen,
  Layers,
  FlaskConical,
  Scale,
  Gauge,
  Inbox,
  GitMerge,
  History,
  Download,
  RotateCcw,
  User,
  ArrowRight,
  Command,
  FileText,
  CornerDownLeft,
} from "lucide-react";
import { ProblemRecord, SessionState } from "@/lib/types";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Stages & Phases" | "Problems" | "Tools & Intelligence" | "Framework";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionState | null;
  problems: ProblemRecord[];
  onNavigatePhase: (phaseNumber: number) => void;
  onSelectProblem?: (problem: ProblemRecord) => void;
  onOpenScorecard?: () => void;
  onOpenTraceability?: () => void;
  onOpenFrameworkModal?: () => void;
  onOpenSessionManager?: () => void;
  onOpenBlindSpot?: () => void;
  onOpenRawIngest?: () => void;
  onExportDossier?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  session,
  problems,
  onNavigatePhase,
  onSelectProblem,
  onOpenScorecard,
  onOpenTraceability,
  onOpenFrameworkModal,
  onOpenSessionManager,
  onOpenBlindSpot,
  onOpenRawIngest,
  onExportDossier,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isResearch = session?.framework_id?.toUpperCase().includes("RESEARCH");

  // Build commands list
  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // Category 1: Navigation & Stages
    list.push({
      id: "nav-bank",
      title: "Problem Bank",
      subtitle: "Central intake, 4-claim matrix, and action lenses",
      category: "Stages & Phases",
      icon: FolderOpen,
      action: () => {
        onNavigatePhase(0);
        onClose();
      },
    });

    if (isResearch) {
      list.push(
        {
          id: "nav-stage-a",
          title: "Stage A: Scouting Mechanism",
          subtitle: "Empirical observation & variable identification (Bordens & Abbott)",
          category: "Stages & Phases",
          icon: Search,
          action: () => {
            onNavigatePhase(1);
            onClose();
          },
        },
        {
          id: "nav-stage-b",
          title: "Stage B: Validation & Grounding [Gate 1]",
          subtitle: "Dual-literature grounding & Gate 1 problem significance",
          category: "Stages & Phases",
          icon: ShieldCheck,
          badge: "Gate 1",
          action: () => {
            onNavigatePhase(2);
            onClose();
          },
        },
        {
          id: "nav-stage-c",
          title: "Stage C: Research Opportunity & Gap Matrix [Gate 2]",
          subtitle: "Scholarly literature extraction & research questions",
          category: "Stages & Phases",
          icon: BookOpen,
          badge: "Gate 2",
          action: () => {
            onNavigatePhase(3);
            onClose();
          },
        },
        {
          id: "nav-stage-d",
          title: "Stage D: Solution Formulation & 4 DSR Artifacts",
          subtitle: "Constructs, Models, Methods, Instantiations (March & Smith)",
          category: "Stages & Phases",
          icon: Layers,
          action: () => {
            onNavigatePhase(4);
            onClose();
          },
        },
        {
          id: "nav-stage-e",
          title: "Stage E: Evaluation Design & Kothari Trapping [Gate 3]",
          subtitle: "Controlled experimental setups & baseline benchmarking",
          category: "Stages & Phases",
          icon: FlaskConical,
          badge: "Gate 3",
          action: () => {
            onNavigatePhase(5);
            onClose();
          },
        },
        {
          id: "nav-stage-f",
          title: "Stage F: Relevance, Ethics & Proposal Canvas [Gate 4]",
          subtitle: "DOST-PCIEERD, UN SDGs, and Data Privacy Act 2012 compliance",
          category: "Stages & Phases",
          icon: Scale,
          badge: "Gate 4",
          action: () => {
            onNavigatePhase(6);
            onClose();
          },
        },
        {
          id: "nav-stage-studio",
          title: "Deliverables Studio: Research Proposal Suite",
          subtitle: "IMRaD proposal briefs, LaTeX matrix, and DSR specifications",
          category: "Stages & Phases",
          icon: Sparkles,
          action: () => {
            onNavigatePhase(7);
            onClose();
          },
        }
      );
    } else {
      list.push(
        {
          id: "nav-phase-1",
          title: "Phase 1: Regional Problem Discovery",
          subtitle: "Scan Agriculture, Healthcare, MSME, and Governance sectors",
          category: "Stages & Phases",
          icon: Compass,
          action: () => {
            onNavigatePhase(1);
            onClose();
          },
        },
        {
          id: "nav-phase-2",
          title: "Phase 2: Problem Screening & Decision Room [Gate 1]",
          subtitle: "10-column screening matrix, assumption radar & winner selection",
          category: "Stages & Phases",
          icon: Filter,
          badge: "Gate 1",
          action: () => {
            onNavigatePhase(2);
            onClose();
          },
        },
        {
          id: "nav-phase-3",
          title: "Phase 3: Mom Test Validation Clinic [Gate 2]",
          subtitle: "Socratic past-behavior interview interrogation & evidence ledgers",
          category: "Stages & Phases",
          icon: ShieldCheck,
          badge: "Gate 2",
          action: () => {
            onNavigatePhase(3);
            onClose();
          },
        },
        {
          id: "nav-phase-4",
          title: "Phase 4: Mechanism Ideation & SVB Canvas",
          subtitle: "15 mechanism archetypes & Solution Validation Board",
          category: "Stages & Phases",
          icon: Lightbulb,
          action: () => {
            onNavigatePhase(4);
            onClose();
          },
        },
        {
          id: "nav-phase-5",
          title: "Phase 5: MVP Validation & Unit Economics",
          subtitle: "Skin-in-the-game commitment audit & financial contribution model",
          category: "Stages & Phases",
          icon: Activity,
          action: () => {
            onNavigatePhase(5);
            onClose();
          },
        },
        {
          id: "nav-phase-studio",
          title: "Deliverables Studio: Venture Hub",
          subtitle: "9-Box Lean Canvas, SWOT Matrix, 10-Slide Pitch Deck, IEEE SRS",
          category: "Stages & Phases",
          icon: Sparkles,
          action: () => {
            onNavigatePhase(6);
            onClose();
          },
        }
      );
    }

    // Category 2: Tools & Intelligence
    if (onOpenScorecard) {
      list.push({
        id: "tool-scorecard",
        title: "Open Intelligence Scorecard",
        subtitle: "4-Pillar multidimensional confidence simulator & Monte Carlo metrics",
        category: "Tools & Intelligence",
        icon: Gauge,
        action: () => {
          onOpenScorecard();
          onClose();
        },
      });
    }

    if (onOpenTraceability) {
      list.push({
        id: "tool-traceability",
        title: "Open Traceability Lineage Graph",
        subtitle: "Full epistemic audit graph linking problems, claims, and code",
        category: "Tools & Intelligence",
        icon: GitMerge,
        action: () => {
          onOpenTraceability();
          onClose();
        },
      });
    }

    if (onOpenBlindSpot) {
      list.push({
        id: "tool-blindspot",
        title: "Run Regional Blind Spot Scanner",
        subtitle: "AI scan of uncharacterized friction across Western Visayas",
        category: "Tools & Intelligence",
        icon: Search,
        action: () => {
          onOpenBlindSpot();
          onClose();
        },
      });
    }

    if (onOpenRawIngest) {
      list.push({
        id: "tool-rawingest",
        title: "Ingest Raw Field Notes / GC Messages",
        subtitle: "Extract 5-anchor structured problems from unstructured transcripts",
        category: "Tools & Intelligence",
        icon: FileText,
        action: () => {
          onOpenRawIngest();
          onClose();
        },
      });
    }

    if (onOpenFrameworkModal) {
      list.push({
        id: "tool-framework",
        title: "Switch Methodology Framework",
        subtitle: `Currently Active: ${session?.framework_id || "INNOVATION"} (5-Rule Controlled Transition)`,
        category: "Framework",
        icon: RotateCcw,
        action: () => {
          onOpenFrameworkModal();
          onClose();
        },
      });
    }

    if (onOpenSessionManager) {
      list.push({
        id: "tool-snapshots",
        title: "Manage Workspaces & Point-in-Time Snapshots",
        subtitle: "Restore rollback states or create new workspaces",
        category: "Tools & Intelligence",
        icon: History,
        action: () => {
          onOpenSessionManager();
          onClose();
        },
      });
    }

    if (onExportDossier) {
      list.push({
        id: "tool-export",
        title: "Export Master Dossier (Markdown / PDF)",
        subtitle: "Download complete synthesized evidence dossier",
        category: "Tools & Intelligence",
        icon: Download,
        action: () => {
          onExportDossier();
          onClose();
        },
      });
    }

    // Category 3: Problems in Workspace
    problems.forEach((p) => {
      list.push({
        id: `prob-${p.id}`,
        title: `${p.id}: ${p.problem_statement}`,
        subtitle: `${p.sector} • ${p.sufferer_occupation} (${p.sufferer_location || "Iloilo"}) • Score: ${p.score || 0}%`,
        category: "Problems",
        icon: User,
        badge: p.evidence_tier,
        action: () => {
          if (onSelectProblem) onSelectProblem(p);
          onClose();
        },
      });
    });

    return list;
  }, [
    isResearch,
    session,
    problems,
    onNavigatePhase,
    onSelectProblem,
    onOpenScorecard,
    onOpenTraceability,
    onOpenBlindSpot,
    onOpenRawIngest,
    onOpenFrameworkModal,
    onOpenSessionManager,
    onExportDossier,
    onClose,
  ]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Auto focus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", damping: 28, stiffness: 400 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/95 overflow-hidden flex flex-col max-h-[75vh] border-cyan-500/20"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, stage name, or problem ID (e.g. AGR-004)..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
              />
              <span className="hidden sm:inline font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                ESC to close
              </span>
            </div>

            {/* Command Results List */}
            <div className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-slate-800/40">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = cmd.icon;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "bg-gradient-to-r from-cyan-950/70 to-blue-950/50 border border-cyan-500/40 text-white shadow-sm"
                          : "text-slate-300 hover:bg-slate-800/40 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                              : "bg-slate-800 border-slate-700 text-slate-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-xs font-bold truncate flex items-center gap-2">
                            <span className="truncate">{cmd.title}</span>
                            {cmd.badge && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 shrink-0">
                                {cmd.badge}
                              </span>
                            )}
                          </div>
                          {cmd.subtitle && (
                            <p className="text-[11px] text-slate-400 truncate">{cmd.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
                          {cmd.category}
                        </span>
                        {isSelected && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  No commands or problems match "{query}"
                </div>
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Command className="w-3 h-3" /> CONVERA Spotlight
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
