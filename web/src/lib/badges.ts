import { SessionState, ProblemRecord } from "./types";

export interface VentureBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
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
    const avgScore = problems.reduce((acc, p) => acc + (p.score || 0), 0) / problems.length;
    evidence_score = Math.round((avgScore / 100) * 25);
  } else if (session.phase1_response) {
    evidence_score = 12;
  }

  // 3. Experimentation / Validation Score (0-25 pts)
  let experiment_score = 0;
  if (session.phase5_complete && session.phase5_response) {
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
    grade_label = "🏆 Investor & Accelerator Ready";
  } else if (health_score >= 75) {
    grade = "A";
    grade_label = "🟢 High-Evidence Venture";
  } else if (health_score >= 55) {
    grade = "B";
    grade_label = "🟡 Validating Hypotheses";
  } else if (health_score >= 35) {
    grade = "C";
    grade_label = "🟠 Problem Discovery Phase";
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
      icon: "🔍",
      category: "DISCOVERY",
      isEarned: problems.length >= 3 || hasStronglyDoc,
      criteria: "Log ≥ 3 problems in Problem Bank with verified sources.",
    },
    {
      id: "contrarian_tested",
      name: "Contrarian Tested",
      description: "Stress-tested problem hypotheses using the Devil's Advocate adversarial agent.",
      icon: "😈",
      category: "DISCOVERY",
      isEarned: hasDevilsAdvocate,
      criteria: "Run a Devil's Advocate challenge on any problem record.",
    },
    {
      id: "team_consensus",
      name: "Team Consensus",
      description: "Prioritized problems with team upvotes.",
      icon: "🗳️",
      category: "DISCOVERY",
      isEarned: hasHighVotes || problems.some((p) => (p.votes || 0) > 0),
      criteria: "Upvote problems collaboratively in the Problem Bank.",
    },
    {
      id: "truth_seeker",
      name: "Truth Seeker",
      description: "Completed all 6 levels of the Socratic Mom Test without falling for solution pitches.",
      icon: "🛡️",
      category: "VALIDATION",
      isEarned: p3Complete,
      criteria: "Pass Level 6 Economic Consequence in Phase 3.",
    },
    {
      id: "mechanism_divergent",
      name: "Mechanism Divergent",
      description: "Generated solution hypotheses across at least 3 distinct mechanism families.",
      icon: "💡",
      category: "EXPERIMENTATION",
      isEarned: p4Complete,
      criteria: "Complete Phase 4 SVB Canvas with divergent concepts.",
    },
    {
      id: "skin_in_game",
      name: "Skin In The Game",
      description: "Audited empirical MVP test observing real customer commitments (Tiers 1-4).",
      icon: "💰",
      category: "EXPERIMENTATION",
      isEarned: p5Complete,
      criteria: "Complete Phase 5 MVP Validation Audit.",
    },
    {
      id: "canvas_master",
      name: "Canvas Master",
      description: "Synthesized research into a structured 9-box Ash Maurya Lean Canvas.",
      icon: "📄",
      category: "DELIVERABLE",
      isEarned: hasCanvas,
      criteria: "Generate 9-box Lean Canvas in Studio.",
    },
    {
      id: "pitch_ready",
      name: "Pitch Ready",
      description: "Created a 10-slide investor pitch deck narrative with speaker notes.",
      icon: "🎤",
      category: "DELIVERABLE",
      isEarned: hasDeck,
      criteria: "Generate 10-Slide Pitch Deck in Studio.",
    },
    {
      id: "venture_master",
      name: "Technopreneurship Master",
      description: "Achieved an overall Venture Health Index ≥ 80% with all gates cleared.",
      icon: "🏆",
      category: "MASTERY",
      isEarned: health_score >= 80 && p5Complete,
      criteria: "Reach 80% Venture Health Index and complete all 5 phases.",
    },
  ];

  const earned_badges = all_badges.filter((b) => b.isEarned);

  // Urgent recommendation determination
  let urgent_recommendation = "Explore regional problems in Phase 1.";
  if (!session.phase1_complete && problems.length === 0) {
    urgent_recommendation = "Run automated discovery in Phase 1 or log your team's field observations in the Problem Bank.";
  } else if (!hasDevilsAdvocate && problems.length > 0) {
    urgent_recommendation = "Run the Devil's Advocate adversarial stress-test on your top problem to expose hidden assumptions.";
  } else if (!session.phase2_complete && problems.length > 0) {
    urgent_recommendation = "Select candidate problems in the Problem Bank and advance them to Phase 2 Screening.";
  } else if (!session.phase3_complete && session.phase2_complete) {
    urgent_recommendation = "Conduct Socratic Mom Test validation in Phase 3 to verify actual economic sacrifices.";
  } else if (!session.phase4_complete && session.phase3_complete) {
    urgent_recommendation = "Ideate across the 15 Mechanism Families in Phase 4 to build your SVB Canvas.";
  } else if (!session.phase5_complete && session.phase4_complete) {
    urgent_recommendation = "Run a Concierge or Pre-order MVP test and audit the empirical results in Phase 5.";
  } else if (!hasCanvas || !hasDeck) {
    urgent_recommendation = "Generate your 9-Box Lean Canvas and 10-Slide Pitch Deck in the Deliverables Studio.";
  } else {
    urgent_recommendation = "Your venture dossier is complete and highly validated! Export the master report or print your pitch deck.";
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
