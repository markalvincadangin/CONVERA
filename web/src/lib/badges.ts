import { SessionState, ProblemRecord } from "./types";

export interface VentureBadge {
  id: string;
  name: string;
  description: string;
  icon_name:
    | "search"
    | "flame"
    | "target"
    | "cpu"
    | "award"
    | "trophy"
    | "layers"
    | "presentation"
    | "crown"
    | "shield-check"
    | "zap"
    | "bar-chart-3";
  category: "DISCOVERY" | "VALIDATION" | "EXPERIMENTATION" | "DELIVERABLE" | "MASTERY";
  isEarned: boolean;
  earnedDate?: string;
  criteria: string;
}

export interface VentureHealthMetrics {
  health_score: number; // 0-100
  grade: "A+" | "A" | "B" | "C" | "NEEDS_WORK";
  grade_label: string;
  gates_score: number; // 0-35
  evidence_score: number; // 0-25
  experiment_score: number; // 0-25
  deliverables_score: number; // 0-15
  earned_badges: VentureBadge[];
  all_badges: VentureBadge[];
  urgent_recommendation: string;
}

export function calculateVentureHealth(
  session: SessionState | null,
  problems: ProblemRecord[] = []
): VentureHealthMetrics {
  if (!session) {
    return {
      health_score: 0,
      grade: "NEEDS_WORK",
      grade_label: "Session Not Initialized",
      gates_score: 0,
      evidence_score: 0,
      experiment_score: 0,
      deliverables_score: 0,
      earned_badges: [],
      all_badges: [],
      urgent_recommendation: "Start by exploring regional problems in Phase 1 or the Problem Bank.",
    };
  }

  // 1. Gates Score (0-35 pts)
  const p1 = session.phase1_complete ? 7 : 0;
  const p2 = session.phase2_complete ? 7 : 0;
  const p3 = session.phase3_complete ? 7 : 0;
  const p4 = session.phase4_complete ? 7 : 0;
  const p5 = session.phase5_complete ? 7 : 0;
  const gates_score = p1 + p2 + p3 + p4 + p5;

  // 2. Evidence Score (0-25 pts)
  let evidence_score = 0;
  if (problems.length > 0) {
    const avgConfidence =
      problems.reduce((sum, p) => sum + (p.score || 50), 0) /
      problems.length;
    evidence_score = Math.round((avgConfidence / 100) * 25);
  } else if (session.phase1_complete) {
    evidence_score = 15;
  }

  // 3. Experimentation & Skin-in-the-game Score (0-25 pts)
  let experiment_score = 0;
  if (session.phase5_response) {
    if (session.phase5_response.includes("PURSUE")) {
      experiment_score = 25;
    } else if (session.phase5_response.includes("PIVOT")) {
      experiment_score = 18;
    } else {
      experiment_score = 15;
    }
  } else if (session.phase3_complete) {
    experiment_score = 12;
  }

  // 4. Deliverables Score (0-15 pts)
  let deliverables_score = 0;
  if (session.deliverable_lean_canvas) deliverables_score += 5;
  if (session.deliverable_swot) deliverables_score += 5;
  if (session.deliverable_pitch_deck) deliverables_score += 5;

  const health_score = Math.min(
    100,
    gates_score + evidence_score + experiment_score + deliverables_score
  );

  let grade: "A+" | "A" | "B" | "C" | "NEEDS_WORK" = "NEEDS_WORK";
  let grade_label = "Early Discovery Stage";

  if (health_score >= 90) {
    grade = "A+";
    grade_label = "Investor & Accelerator Ready";
  } else if (health_score >= 75) {
    grade = "A";
    grade_label = "High-Evidence Venture";
  } else if (health_score >= 55) {
    grade = "B";
    grade_label = "Validating Hypotheses";
  } else if (health_score >= 35) {
    grade = "C";
    grade_label = "Problem Discovery Phase";
  }

  // Badges
  const hasStronglyDoc = problems.some((p) => p.evidence_tier === "STRONGLY_DOCUMENTED");
  const hasDevilsAdvocate = problems.some((p) => Boolean(p.devils_advocate_data));
  const hasHighVotes = problems.some((p) => (p.votes || 0) >= 3);
  const p3Complete = Boolean(session.phase3_complete);
  const p4Complete = Boolean(session.phase4_complete);
  const p5Complete = Boolean(session.phase5_complete);
  const hasCanvas = Boolean(session.deliverable_lean_canvas);
  const hasDeck = Boolean(session.deliverable_pitch_deck);

  const all_badges: VentureBadge[] = [
    {
      id: "evidence_hunter",
      name: "Evidence Hunter",
      description: "Logged at least 3 problems or cited official Tier A institutional sources.",
      icon_name: "search",
      category: "DISCOVERY",
      isEarned: problems.length >= 3 || hasStronglyDoc,
      criteria: "Log >= 3 problems in Problem Bank with verified sources.",
    },
    {
      id: "devils_advocate",
      name: "Tested by Fire",
      description: "Stress-tested candidate problems against an adversarial Devil's Advocate agent.",
      icon_name: "flame",
      category: "VALIDATION",
      isEarned: hasDevilsAdvocate,
      criteria: "Run an adversarial critique on any problem card.",
    },
    {
      id: "socratic_survivor",
      name: "Socratic Survivor",
      description: "Cleared all 6 Socratic Mom Test levels with documented past behavioral evidence.",
      icon_name: "shield-check",
      category: "VALIDATION",
      isEarned: p3Complete,
      criteria: "Complete Phase 3 Socratic validation with passing score.",
    },
    {
      id: "mechanism_master",
      name: "Mechanism Master",
      description: "Formulated 5+ distinct solution mechanisms across 3+ families.",
      icon_name: "cpu",
      category: "EXPERIMENTATION",
      isEarned: p4Complete,
      criteria: "Synthesize Phase 4 solutions using the 15 mechanism families.",
    },
    {
      id: "skin_in_the_game",
      name: "Skin-in-the-Game",
      description: "Gathered empirical behavioral commitment (deposits, pre-orders, LOIs, active usage).",
      icon_name: "target",
      category: "EXPERIMENTATION",
      isEarned: p5Complete,
      criteria: "Audit Phase 5 MVP test results with Tier 4 or 5 commitment.",
    },
    {
      id: "lean_architect",
      name: "Lean Architect",
      description: "Auto-generated structured 9-box Ash Maurya Lean Canvas.",
      icon_name: "layers",
      category: "DELIVERABLE",
      isEarned: hasCanvas,
      criteria: "Generate 9-box Lean Canvas in Deliverables Studio.",
    },
    {
      id: "pitch_ready",
      name: "Pitch Ready",
      description: "Formulated 10-slide investor presentation with speaker scripts.",
      icon_name: "presentation",
      category: "DELIVERABLE",
      isEarned: hasDeck,
      criteria: "Generate 10-Slide Pitch Deck in Deliverables Studio.",
    },
    {
      id: "consensus_driver",
      name: "Team Consensus",
      description: "Earned 3+ team priority votes on a single problem thesis.",
      icon_name: "bar-chart-3",
      category: "DISCOVERY",
      isEarned: hasHighVotes,
      criteria: "Gather 3+ team priority votes on a problem card.",
    },
    {
      id: "ratchet_champion",
      name: "Ratchet Champion",
      description: "Unlocked 5/5 Phase Gates with an overall venture health score >= 80%.",
      icon_name: "crown",
      category: "MASTERY",
      isEarned: health_score >= 80 && Boolean(p1 > 0 && p2 > 0 && p3 > 0 && p4 > 0 && p5 > 0),
      criteria: "Pass all 5 gates and attain A or A+ overall grade.",
    },
  ];

  const earned_badges = all_badges.filter((b) => b.isEarned);

  let urgent_recommendation = "Continue logging field observations in Phase 1.";
  if (!session.phase1_complete) {
    urgent_recommendation = "Complete Phase 1 discovery landscape research to identify Iloilo problem candidates.";
  } else if (!session.phase2_complete) {
    urgent_recommendation = "Triage candidate problems in Phase 2 to shortlist the top candidate.";
  } else if (!session.phase3_complete) {
    urgent_recommendation = "Conduct Socratic Mom Test validation in Phase 3 to verify actual economic sacrifices.";
  } else if (!session.phase4_complete) {
    urgent_recommendation = "Explore divergent mechanisms across 3+ families in Phase 4.";
  } else if (!session.phase5_complete) {
    urgent_recommendation = "Run MVP skin-in-the-game experiments in Phase 5 to audit conversion.";
  } else if (!hasCanvas || !hasDeck) {
    urgent_recommendation = "Generate Lean Canvas and Pitch Deck in the Deliverables Studio.";
  } else {
    urgent_recommendation = "Your venture dossier is complete and ready for investor and accelerator review!";
  }

  return {
    health_score,
    grade,
    grade_label,
    gates_score,
    evidence_score,
    experiment_score,
    deliverables_score,
    earned_badges,
    all_badges,
    urgent_recommendation,
  };
}
