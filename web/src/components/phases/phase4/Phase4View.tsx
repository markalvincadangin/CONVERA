"use client";

import React, { useState } from "react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Lightbulb, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Plus, LayoutGrid, AlertCircle, Layers } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { MECHANISM_FAMILIES } from "@/lib/constants";
import { phaseService } from "@/services/phaseService";
import { SessionState, SolutionConcept } from "@/lib/types";

interface Phase4ViewProps {
  session: SessionState;
  onUpdateSession: (newState: SessionState) => void;
  onAdvanceToNextPhase: () => void;
  onGoBack: () => void;
}

export const Phase4View: React.FC<Phase4ViewProps> = ({
  session,
  onUpdateSession,
  onAdvanceToNextPhase,
  onGoBack,
}) => {
  const [currentStep, setCurrentStep] = useState<string>("solution_brief");
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [concepts, setConcepts] = useState<SolutionConcept[]>(session.phase4_concepts || []);

  // New concept form
  const [newLabel, setNewLabel] = useState("");
  const [newFamily, setNewFamily] = useState(MECHANISM_FAMILIES[0].name);
  const [newCausalLink, setNewCausalLink] = useState("");
  const [newMechanism, setNewMechanism] = useState("");
  const [newDelivery, setNewDelivery] = useState("Digital / Mobile Web");

  const runStep = async (stepName: string, input?: string, customConcepts?: SolutionConcept[]) => {
    setIsLoading(true);
    try {
      const res = await phaseService.executePhase4Step(
        session.session_id,
        stepName,
        input || undefined,
        customConcepts || concepts
      );
      onUpdateSession(res.state);
      setConcepts(res.concepts || []);
      setCurrentStep(stepName);
    } catch (err: any) {
      alert(err.message || `Failed to run Phase 4 step: ${stepName}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConcept = () => {
    if (!newLabel.trim() || !newMechanism.trim()) {
      alert("Please fill in the concept label and mechanism description.");
      return;
    }

    const newConcept: SolutionConcept = {
      label: newLabel.trim(),
      mechanism_family: newFamily,
      causal_link_targeted: newCausalLink.trim() || "Root bottleneck",
      hypothesized_mechanism: newMechanism.trim(),
      delivery_vehicle: newDelivery.trim(),
    };

    const updated = [...concepts, newConcept];
    setConcepts(updated);
    setNewLabel("");
    setNewCausalLink("");
    setNewMechanism("");
    onUpdateSession({ ...session, phase4_concepts: updated });
  };

  const uniqueFamilies = new Set(concepts.map((c) => c.mechanism_family)).size;
  const isMinimumMet = concepts.length >= 5 && uniqueFamilies >= 3;
  const isReadyToTest = Boolean(session.phase4_response && session.phase4_response.includes("READY_TO_TEST"));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card variant="glow" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Phase 4: Solution Ideation & SVB Canvas</h2>
              <Badge variant="cyan">15 Mechanism Families</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Transform validated problem evidence into divergent mechanism hypotheses, testable P1 assumptions, and the Simplified Validation Board.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!session.phase4_response && (
              <Button
                variant="primary"
                onClick={() => runStep("solution_brief")}
                isLoading={isLoading}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Start Ideation Steps
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Concept Minimum Status Banner */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isMinimumMet ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Divergent Concept Minimum Requirement</h4>
              <p className="text-xs text-slate-400">
                At least 5 concepts from 3+ distinct mechanism families required before screening.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={concepts.length >= 5 ? "emerald" : "amber"}>
              {concepts.length}/5 Concepts
            </Badge>
            <Badge variant={uniqueFamilies >= 3 ? "emerald" : "amber"}>
              {uniqueFamilies}/3 Families
            </Badge>
          </div>
        </div>
      </Card>

      {/* Step Actions Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        <Button
          variant={currentStep === "solution_brief" ? "primary" : "secondary"}
          size="sm"
          onClick={() => runStep("solution_brief")}
          isLoading={isLoading && currentStep === "solution_brief"}
        >
          1. Solution Brief
        </Button>
        <Button
          variant={currentStep === "opportunity_question" ? "primary" : "secondary"}
          size="sm"
          onClick={() => runStep("opportunity_question", userInput)}
          isLoading={isLoading && currentStep === "opportunity_question"}
        >
          2. Opportunity Question (HMW)
        </Button>
        <Button
          variant={currentStep === "decomposition" ? "primary" : "secondary"}
          size="sm"
          onClick={() => runStep("decomposition", userInput)}
          isLoading={isLoading && currentStep === "decomposition"}
        >
          3. Causal Chain
        </Button>
        <Button
          variant={currentStep === "divergent_ideation" ? "primary" : "secondary"}
          size="sm"
          onClick={() => runStep("divergent_ideation")}
          isLoading={isLoading && currentStep === "divergent_ideation"}
        >
          4. Brainstorm Solutions (15 Families)
        </Button>
        <Button
          variant={currentStep === "screening" ? "primary" : "secondary"}
          size="sm"
          disabled={!isMinimumMet}
          onClick={() => runStep("screening")}
          isLoading={isLoading && currentStep === "screening"}
        >
          5. Screen Concepts
        </Button>
        <Button
          variant={currentStep === "assumptions_svb" ? "emerald" : "secondary"}
          size="sm"
          disabled={!isMinimumMet}
          onClick={() => runStep("assumptions_svb")}
          isLoading={isLoading && currentStep === "assumptions_svb"}
        >
          6. SVB & Experiments
        </Button>
      </div>

      {/* Concept Creator Form */}
      <Card variant="glass" className="p-5 space-y-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" /> Add New Concept to Roster ({concepts.length} Total)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Concept Label</label>
            <input
              type="text"
              placeholder="e.g. Shared Solar Cold-Hub"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Mechanism Family (15 Available)</label>
            <select
              value={newFamily}
              onChange={(e) => setNewFamily(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {MECHANISM_FAMILIES.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Delivery Vehicle</label>
            <input
              type="text"
              placeholder="e.g. Mobile Web / Physical Kiosk / Community Agent"
              value={newDelivery}
              onChange={(e) => setNewDelivery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Hypothesized Mechanism (1-2 sentences on how it produces relief)</label>
          <input
            type="text"
            placeholder="e.g. Pools cold storage demand among 15 vendors in Jaro Market to lower individual upfront capital by 80%."
            value={newMechanism}
            onChange={(e) => setNewMechanism(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={handleAddConcept} leftIcon={<Plus className="w-4 h-4" />}>
            Add Concept to List
          </Button>
        </div>
      </Card>

      {/* Concept Roster Display */}
      {concepts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {concepts.map((c, idx) => (
            <Card key={idx} variant="bordered" className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white truncate">{c.label}</span>
                <Badge variant="cyan" size="sm">{c.mechanism_family}</Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{c.hypothesized_mechanism}</p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                <span>Vehicle: {c.delivery_vehicle}</span>
                <span className="text-amber-400 font-semibold">[Hypothesis]</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Phase 4 Agent Output */}
      {session.phase4_response && (
        <Card variant="glass" className="p-6 space-y-4 border-emerald-500/30">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Simplified Validation Board (SVB) & Experiment Cards</h3>
            </div>
            <Badge variant={isReadyToTest ? "emerald" : "amber"}>
              {isReadyToTest ? "🟢 READY TO TEST" : "🟡 RE-IDEATE"}
            </Badge>
          </div>

          <div className="prose prose-invert max-w-none prose-sm prose-cyan overflow-x-auto text-slate-200">
            <MarkdownRenderer content={session.phase4_response} />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={onGoBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Phase 3
            </Button>

            <Button
              variant="emerald"
              size="lg"
              onClick={onAdvanceToNextPhase}
              disabled={!isReadyToTest}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Advance to Phase 5: MVP Testing & Audit
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
