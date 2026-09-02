export const ALL_SECTORS = [
  "Agriculture & Fisheries",
  "Health & Wellness",
  "MSMEs & Retail",
  "Education & Youth",
  "Transport & Logistics",
  "Housing & Utilities",
  "Government Services & Compliance",
  "Finance & Credit",
];

export const MECHANISM_FAMILIES = [
  { id: "prevention", name: "Prevention", description: "Stops the problem condition before it occurs" },
  { id: "prediction", name: "Prediction & Early Warning", description: "Forecasts impending failures with lead time" },
  { id: "coordination", name: "Coordination", description: "Synchronizes fragmented actions between parties" },
  { id: "information", name: "Information Access", description: "Eliminates asymmetric data bottlenecks" },
  { id: "automation", name: "Automation", description: "Replaces manual repetitive labor and calculation" },
  { id: "risk_reduction", name: "Risk Reduction", description: "Hedging, buffers, guarantees, and safety nets" },
  { id: "resource_pooling", name: "Resource Pooling", description: "Shared infrastructure and collective purchasing" },
  { id: "economic_restructure", name: "Economic Restructuring", description: "Novel pricing, financing, or payment terms" },
  { id: "matching", name: "Matching", description: "Connects buyers and sellers with bilateral scoring" },
  { id: "scheduling", name: "Scheduling & Timing", description: "Optimizes temporal sequencing and queuing" },
  { id: "verification", name: "Verification & Trust", description: "Authenticates claims and reduces fraud" },
  { id: "behavioral_nudge", name: "Behavioral Nudge", description: "Choice architecture and cognitive friction reduction" },
  { id: "workflow_redesign", name: "Workflow Redesign", description: "Eliminates redundant steps and handoffs" },
  { id: "physical_material", name: "Physical & Material", description: "Durable hardware, containers, or tooling" },
  { id: "institutional", name: "Institutional & Policy", description: "Standard operating rules, contracts, or compliance" },
];

export const LEVEL_ORDER = [
  "specific_sufferer",
  "demonstrated_pain",
  "intensity_frequency",
  "local_market_size",
  "population_evidence",
  "economic_consequence",
];

export const LEVEL_LABELS: Record<string, string> = {
  specific_sufferer: "Level 1: Specific Sufferer",
  demonstrated_pain: "Level 2: Demonstrated Pain",
  intensity_frequency: "Level 3: Intensity & Frequency",
  local_market_size: "Level 4: Local Market Size",
  population_evidence: "Level 5: Population Scope",
  economic_consequence: "Level 6: Economic Consequence",
};

export const COMMITMENT_TIERS = [
  {
    tier: "TIER_1_FINANCIAL",
    label: "Tier 1: Financial Commitment (Gold Standard)",
    color: "emerald",
    desc: "Upfront cash, pre-orders, signed purchase contracts, paid pilots",
  },
  {
    tier: "TIER_2_BEHAVIORAL",
    label: "Tier 2: Behavioral Commitment (High)",
    color: "cyan",
    desc: "Replacing daily tools, 2+ hours data input, rearranged workflow",
  },
  {
    tier: "TIER_3_REPUTATIONAL",
    label: "Tier 3: Reputational Commitment (Medium-High)",
    color: "blue",
    desc: "Intro to senior decision-makers, public endorsements, co-design",
  },
  {
    tier: "TIER_4_TIME_CONTACT",
    label: "Tier 4: Time & Contact Commitment (Medium)",
    color: "amber",
    desc: "Private contact details, attending 3+ sessions, sharing files",
  },
  {
    tier: "TIER_5_POLITE_INTEREST",
    label: "Tier 5: Polite Interest (ZERO Validation Value)",
    color: "red",
    desc: "Verbal praise ('I would buy that') — polite nods count as zero proof",
  },
];
