"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  Plus,
  Check,
  Star,
  Trash2,
  X,
  Layers,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Binary,
  Cpu,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Scale,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import {
  ideationService,
  DSRArtifact,
  DSRArtifactClass,
  DSRArtifactStatus,
  DSRArtifactCreatePayload,
} from "@/services/ideationService";
import { useToast } from "@/components/common/ToastProvider";

interface DSRArtifactCanvasProps {
  problemId: string;
  sessionId?: string;
  problemStatement?: string;
  onArtifactSelected?: (artifact: DSRArtifact) => void;
}

const CLASS_CONFIG: Record<
  DSRArtifactClass,
  {
    label: string;
    icon: React.ElementType;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    glowColor: string;
    description: string;
  }
> = {
  CONSTRUCT: {
    label: "Construct",
    icon: BookOpen,
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-400 border-indigo-500/20",
    borderColor: "border-indigo-500/30",
    glowColor: "shadow-indigo-500/10",
    description: "Vocabulary, ontology, domain concepts, state features",
  },
  MODEL: {
    label: "Model",
    icon: Binary,
    badgeBg: "bg-cyan-500/10",
    badgeText: "text-cyan-400 border-cyan-500/20",
    borderColor: "border-cyan-500/30",
    glowColor: "shadow-cyan-500/10",
    description: "Mathematical propositions, graphs, equations, state machines",
  },
  METHOD: {
    label: "Method",
    icon: Scale,
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-400 border-emerald-500/20",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/10",
    description: "Algorithmic workflows, optimization heuristics, protocols",
  },
  INSTANTIATION: {
    label: "Instantiation",
    icon: Cpu,
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400 border-amber-500/20",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
    description: "Physical hardware, embedded firmware, testbeds, systems",
  },
};

export const DSRArtifactCanvas: React.FC<DSRArtifactCanvasProps> = ({
  problemId,
  sessionId,
  problemStatement,
  onArtifactSelected,
}) => {
  const toast = useToast();
  const [artifacts, setArtifacts] = useState<DSRArtifact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<DSRArtifactClass | "ALL">("ALL");
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

  // Modal State for Custom Creation
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customForm, setCustomForm] = useState<DSRArtifactCreatePayload>({
    problem_id: problemId,
    session_id: sessionId,
    title: "",
    dsr_class: "METHOD",
    description: "",
    kernel_theory: "",
    simpler_baseline_alternative: "",
    formal_specification: "",
    contextual_constraints: [],
    feasibility_score: 0.8,
    novelty_score: 0.75,
  });
  const [constraintInput, setConstraintInput] = useState<string>("");

  // Load artifacts
  const loadArtifacts = useCallback(async () => {
    if (!problemId) return;
    setLoading(true);
    try {
      const data = await ideationService.listArtifacts(problemId);
      setArtifacts(data);
      const selected = data.find((a) => a.status === "SELECTED");
      if (selected) {
        setSelectedArtifactId(selected.id);
      }
    } catch (err: any) {
      console.error("Failed to load DSR artifacts:", err);
      toast.error(err?.message || "Failed to load DSR artifacts");
    } finally {
      setLoading(false);
    }
  }, [problemId, toast]);

  useEffect(() => {
    loadArtifacts();
  }, [loadArtifacts]);

  // Generate candidates across all 4 classes
  const handleGenerateCandidates = async () => {
    setGenerating(true);
    try {
      const res = await ideationService.generateCandidates({
        problem_id: problemId,
        session_id: sessionId,
        classes: ["CONSTRUCT", "MODEL", "METHOD", "INSTANTIATION"],
        max_candidates_per_class: 1,
      });
      toast.success(
        `Generated ${res.total_generated} DSR candidates grounded in Kernel Theories.`
      );
      await loadArtifacts();
    } catch (err: any) {
      console.error("DSR generation error:", err);
      toast.error(err?.message || "Failed to formulate DSR artifacts");
    } finally {
      setGenerating(false);
    }
  };

  // Toggle Selection as Primary Thesis Contribution
  const handleSelectArtifact = async (artifact: DSRArtifact) => {
    try {
      const newStatus: DSRArtifactStatus =
        artifact.status === "SELECTED" ? "PROPOSED" : "SELECTED";
      const updated = await ideationService.updateArtifact(artifact.id, {
        status: newStatus,
      });

      setArtifacts((prev) =>
        prev.map((a) => {
          if (a.id === artifact.id) return updated;
          // If we just selected one, revert other selected ones to PROPOSED (Single primary thesis)
          if (newStatus === "SELECTED" && a.status === "SELECTED") {
            return { ...a, status: "PROPOSED" };
          }
          return a;
        })
      );

      if (newStatus === "SELECTED") {
        setSelectedArtifactId(artifact.id);
        if (onArtifactSelected) onArtifactSelected(updated);
        toast.success(
          `Designated "${artifact.title}" as primary Phase D thesis contribution!`
        );
      } else {
        setSelectedArtifactId(null);
        toast.info("Artifact returned to proposed pool.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update artifact status");
    }
  };

  // Delete Artifact
  const handleDeleteArtifact = async (artifactId: string) => {
    try {
      await ideationService.deleteArtifact(artifactId);
      setArtifacts((prev) => prev.filter((a) => a.id !== artifactId));
      if (selectedArtifactId === artifactId) {
        setSelectedArtifactId(null);
      }
      toast.info("DSR candidate removed.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete artifact");
    }
  };

  // Submit custom artifact
  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.title || !customForm.description || !customForm.kernel_theory) {
      toast.warning("Please fill in Title, Description, and Kernel Theory.");
      return;
    }
    try {
      const created = await ideationService.createArtifact({
        ...customForm,
        problem_id: problemId,
        session_id: sessionId,
      });
      setArtifacts((prev) => [...prev, created]);
      setIsModalOpen(false);
      setCustomForm({
        problem_id: problemId,
        session_id: sessionId,
        title: "",
        dsr_class: "METHOD",
        description: "",
        kernel_theory: "",
        simpler_baseline_alternative: "",
        formal_specification: "",
        contextual_constraints: [],
        feasibility_score: 0.8,
        novelty_score: 0.75,
      });
      toast.success("Custom DSR artifact created!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create artifact");
    }
  };

  const filteredArtifacts = useMemo(() => {
    if (activeFilter === "ALL") return artifacts;
    return artifacts.filter((a) => a.dsr_class === activeFilter);
  }, [artifacts, activeFilter]);

  const selectedArtifact = useMemo(() => {
    return artifacts.find((a) => a.status === "SELECTED");
  }, [artifacts]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Thesis Selection Status */}
      {selectedArtifact ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-5 shadow-lg shadow-emerald-950/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Star className="w-5 h-5 fill-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Primary Thesis Contribution
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {selectedArtifact.dsr_class}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 mt-1">
                  {selectedArtifact.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  Kernel Theory: {selectedArtifact.kernel_theory}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectArtifact(selectedArtifact)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Change Selection
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Phase D Gate Requirement:</strong> At least one formulated DSR artifact candidate must be selected as the primary thesis contribution before Gate 3 evaluation.
            </p>
          </div>
        </div>
      )}

      {/* Header & Action Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>Phase D: 4 DSR Artifact Formulation Matrix</span>
              <span className="text-[11px] font-mono font-normal text-slate-400">
                (March &amp; Smith 1995 &bull; Gregor &amp; Jones 2007)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Synthesize and compare candidate artifacts across the 4 canonical classes, anchored to scientific Kernel Theories and evaluated against simpler baseline alternatives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateCandidates}
              disabled={generating}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 disabled:opacity-50 transition-all cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Formulate 4 Classes</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Filter:</span>
          {(["ALL", "CONSTRUCT", "MODEL", "METHOD", "INSTANTIATION"] as const).map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-xs px-3 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-800 border-emerald-500/50 text-emerald-300 shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {cat === "ALL" ? "All Artifacts" : CLASS_CONFIG[cat].label}
                <span className="ml-1.5 text-[10px] text-slate-500 font-mono">
                  {cat === "ALL"
                    ? artifacts.length
                    : artifacts.filter((a) => a.dsr_class === cat).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Artifact Cards Grid */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading DSR artifacts...</p>
        </div>
      ) : filteredArtifacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center space-y-3">
          <Lightbulb className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">
            No DSR Artifacts Formulated Yet
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click &quot;Formulate 4 Classes&quot; to automatically synthesize candidate Constructs, Models, Methods, and Instantiations grounded in your problem claims.
          </p>
          <button
            onClick={handleGenerateCandidates}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer mt-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulate Initial 4 Candidates</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredArtifacts.map((art) => {
            const config = CLASS_CONFIG[art.dsr_class];
            const Icon = config.icon;
            const isSelected = art.status === "SELECTED";

            return (
              <div
                key={art.id}
                className={`rounded-2xl border bg-slate-900/80 p-5 space-y-4 transition-all relative ${
                  isSelected
                    ? "border-emerald-500/70 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40"
                    : `${config.borderColor} hover:border-slate-600`
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${config.badgeBg} border ${config.badgeText}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded border ${config.badgeBg} ${config.badgeText}`}
                        >
                          {art.dsr_class}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-emerald-300" />
                            SELECTED
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mt-1">
                        {art.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteArtifact(art.id)}
                    title="Delete Candidate"
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {art.description}
                </p>

                {/* Gregor & Jones Kernel Theory */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Kernel Theory Grounding (Gregor &amp; Jones 2007)</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {art.kernel_theory}
                  </p>
                </div>

                {/* Epistemic Rule 5: Simpler Baseline Alternative */}
                {art.simpler_baseline_alternative && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                      <Scale className="w-3.5 h-3.5" />
                      <span>Epistemic Rule 5: Simpler Baseline Alternative</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {art.simpler_baseline_alternative}
                    </p>
                  </div>
                )}

                {/* Formal Specification Preview */}
                {art.formal_specification && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 break-words">
                    <span className="text-[10px] text-slate-500 block mb-1">
                      FORMAL SPECIFICATION / FORMULATION:
                    </span>
                    {art.formal_specification}
                  </div>
                )}

                {/* Scores Decoupling (Article II) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Feasibility</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {Math.round(art.feasibility_score * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.round(art.feasibility_score * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Novelty Score</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {Math.round(art.novelty_score * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.round(art.novelty_score * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contextual Constraints Tags */}
                {art.contextual_constraints && art.contextual_constraints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {art.contextual_constraints.map((c, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Actions (Article IV Human Sovereignty) */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {art.id}
                  </span>
                  <button
                    onClick={() => handleSelectArtifact(art)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border border-emerald-500/50 text-emerald-300 hover:bg-slate-700"
                        : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {isSelected ? "Deselect Thesis" : "Select as Primary Contribution"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Author Custom Artifact */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Author Custom DSR Artifact Candidate</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Artifact Class
                </label>
                <select
                  value={customForm.dsr_class}
                  onChange={(e) =>
                    setCustomForm({
                      ...customForm,
                      dsr_class: e.target.value as DSRArtifactClass,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="CONSTRUCT">1. CONSTRUCT (Vocabulary &amp; Ontology)</option>
                  <option value="MODEL">2. MODEL (Equations &amp; State Graphs)</option>
                  <option value="METHOD">3. METHOD (Algorithms &amp; Optimization)</option>
                  <option value="INSTANTIATION">4. INSTANTIATION (Prototype &amp; Testbed)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Artifact Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adaptive Quantized Inference Pipeline"
                  value={customForm.title}
                  onChange={(e) =>
                    setCustomForm({ ...customForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description &amp; Functional Mechanics
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the artifact's operational mechanics and problem resolution mechanism..."
                  value={customForm.description}
                  onChange={(e) =>
                    setCustomForm({ ...customForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Kernel Theory Grounding (Gregor &amp; Jones 2007)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Markov Decision Processes (Puterman, 1994)"
                  value={customForm.kernel_theory}
                  onChange={(e) =>
                    setCustomForm({ ...customForm, kernel_theory: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Epistemic Rule 5: Simpler Baseline Alternative
                </label>
                <input
                  type="text"
                  placeholder="e.g. Static heuristic thresholding without dynamic adaptation"
                  value={customForm.simpler_baseline_alternative || ""}
                  onChange={(e) =>
                    setCustomForm({
                      ...customForm,
                      simpler_baseline_alternative: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Formal Specification / Mathematical Definition (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. G = (V, E) where V denotes edge compute units..."
                  value={customForm.formal_specification || ""}
                  onChange={(e) =>
                    setCustomForm({
                      ...customForm,
                      formal_specification: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Feasibility Score ({Math.round((customForm.feasibility_score || 0.8) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={customForm.feasibility_score || 0.8}
                    onChange={(e) =>
                      setCustomForm({
                        ...customForm,
                        feasibility_score: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Novelty Score ({Math.round((customForm.novelty_score || 0.75) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={customForm.novelty_score || 0.75}
                    onChange={(e) =>
                      setCustomForm({
                        ...customForm,
                        novelty_score: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
