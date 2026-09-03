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

export const STANDARD_RESEARCH_DOMAINS = [
  "Precision Agriculture & Edge AI",
  "Marine & Aquaculture IoT",
  "Biomedical Informatics & Clinical Triage",
  "Disaster Mesh Networks & LoRaWAN",
  "Smart Energy & Grid Telemetry",
  "Cybersecurity & Threat Telemetry",
  "Urban Transit & Fleet Routing",
  "Environmental Sensing & Hydrology",
];

export interface EmpiricalBreakdownTemplate {
  id: string;
  label: string;
  domain: string;
  locality: string;
  sufferer: string;
  symptom: string;
  consequence: string;
  workaround: string;
  text: string;
}

export const STANDARD_EMPIRICAL_BREAKDOWNS: EmpiricalBreakdownTemplate[] = [
  {
    id: "BRK-AGR-001",
    label: "Miagao Bulb Onion (Edge AI)",
    domain: "Precision Agriculture & Edge AI",
    locality: "Barangay Kirayan Tacas, Miagao, Iloilo",
    sufferer: "Smallholder Onion Growers & Agronomists",
    symptom: "Offline optical camera sensors fog up during monsoon humidity, causing 42% model false-negative rate on mold detection.",
    consequence: "40% harvest loss to fungal decay; forced sell-off at ₱35/kg instead of ₱120 market rate.",
    workaround: "Daily manual finger-press checks across hectares with no digital logging.",
    text: "Precision Agriculture & Edge AI | Miagao, Iloilo onion growers | Offline optical camera sensors fog up in tropical monsoons, causing 42% model false-negative rate on mold detection; 40% harvest lost to humidity rot.",
  },
  {
    id: "BRK-MAR-002",
    label: "Carles Tuna Catch (Marine IoT)",
    domain: "Marine & Aquaculture IoT",
    locality: "Bancal Port, Carles, Northern Iloilo",
    sufferer: "Handline Tuna Fishers & Cold Chain Operators",
    symptom: "LoRaWAN telemetry transceivers drop 38% of packets beyond 12km offshore, preventing continuous deep-freeze temperature logging.",
    consequence: "15% catch spoilage before reaching Estancia trading post; ₱350 daily ice waste per boat.",
    workaround: "Relying on crushed ice blocks and guessing internal fish core temperatures.",
    text: "Marine & Aquaculture IoT | Carles, Iloilo tuna fishers | LoRaWAN telemetry transceivers drop 38% packets beyond 12km offshore; 15% fish catch lost to transit melt before reaching trading post.",
  },
  {
    id: "BRK-AQU-003",
    label: "Dumangas Milkfish (Aquaculture)",
    domain: "Marine & Aquaculture IoT",
    locality: "Dumangas Brackish Water Ponds, Iloilo",
    sufferer: "Bangus Pond Operators & Caretakers",
    symptom: "Optical dissolved oxygen probes suffer bio-fouling calibration drift after 72 hours in brackish waters.",
    consequence: "8% transit and pond mortality due to unpredicted nighttime oxygen dips; ₱28,000 monthly loss.",
    workaround: "Manual titration water test kits used only once per week.",
    text: "Marine & Aquaculture IoT | Dumangas bangus growers | Optical dissolved oxygen probes suffer bio-fouling calibration drift after 72 hours in brackish water, causing 8% fish mortality.",
  },
  {
    id: "BRK-MED-004",
    label: "Western Visayas Triage (Health AI)",
    domain: "Biomedical Informatics & Clinical Triage",
    locality: "Rural Health Units (RHUs) in Antique & Guimaras",
    sufferer: "Rural Triage Nurses & General Practitioners",
    symptom: "Edge tablet classification models fail without continuous cloud connectivity, causing 45-minute clinical triage latency.",
    consequence: "Delayed emergency patient transfers; 32% diagnostic documentation errors during shift handovers.",
    workaround: "Physical paper triage cards and SMS text notifications to on-call doctors.",
    text: "Biomedical Informatics & Clinical Triage | Rural district health units in Western Visayas | Edge tablet classification models fail without continuous cloud internet, creating 45-minute patient triage bottlenecks.",
  },
  {
    id: "BRK-DIS-005",
    label: "Island Barangay Mesh (Disaster Comms)",
    domain: "Disaster Mesh Networks & LoRaWAN",
    locality: "Islas de Gigantes, Carles, Iloilo",
    sufferer: "MDRRMO Responders & Barangay Disaster Teams",
    symptom: "Commercial cellular towers collapse during Category 3+ typhoons, leaving 4 island barangays with zero emergency telemetry for 96 hours.",
    consequence: "Critical relief supply delays and uncoordinated evacuation logistics.",
    workaround: "Motorized pumpboat dispatch across rough seas to deliver physical situation reports.",
    text: "Disaster Mesh Networks & LoRaWAN | Islas de Gigantes MDRRMO | Cellular towers collapse during typhoons, causing 96-hour emergency telemetry blackouts across 4 island barangays.",
  },
  {
    id: "BRK-NRG-006",
    label: "Solar Microgrid Telemetry (Smart Energy)",
    domain: "Smart Energy & Grid Telemetry",
    locality: "Off-grid Solar Communities, Guimaras",
    sufferer: "Microgrid Cooperative Managers & Technicians",
    symptom: "Battery state-of-charge (SoC) estimation algorithms drift by 24% under tropical ambient heat (34°C+), triggering premature inverter brownouts.",
    consequence: "Unscheduled power outages affecting vaccine cold storage and evening commerce; ₱18,000 monthly generator diesel fallback.",
    workaround: "Analog voltmeter readings logged manually twice daily.",
    text: "Smart Energy & Grid Telemetry | Off-grid Guimaras solar cooperatives | Battery SoC estimation algorithms drift 24% in high ambient heat (34°C+), causing unscheduled power brownouts.",
  },
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
    desc: "Verbal praise ('I would buy that') - polite nods count as zero proof",
  },
];