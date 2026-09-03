
def tokenize_statement(text: str) -> set:
    if not text:
        return set()
    words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
    stops = {"and", "the", "for", "with", "due", "causes", "lack", "from", "into", "their", "that", "this", "during", "requiring", "leads", "across", "severe", "high", "many"}
    return {w for w in words if w not in stops}

import json
import sqlite3
import os
import random
import string
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from .base import BaseStorageAdapter
from engines.evidence_scorer import calculate_score_breakdown
import re

def clean_text(val: Optional[str]) -> str:
    if not val:
        return ""
    s = re.sub(r"<br\s*/?>", " ", str(val), flags=re.IGNORECASE)
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"\*\*([^\*]+)\*\*", r"\1", s)
    s = re.sub(r"\*([^\*]+)\*", r"\1", s)
    s = re.sub(r"__([^_]+)__", r"\1", s)
    s = re.sub(r"_([^_]+)_", r"\1", s)
    s = s.replace("**", "").replace("*", "").replace("`", "").replace("##", "").replace("#", "")
    s = re.sub(r"\s+", " ", s).strip()
    return s

def clean_problem_id(val: str) -> str:
    s = clean_text(val)
    s = re.sub(r"[^A-Za-z0-9\-]", "", s).upper()
    return s


def generate_share_code(prefix: str = "RATCH") -> str:
    """Generate a clean 6-character room share code like RATCH-7K9."""
    chars = "".join(random.choices(string.ascii_uppercase + "23456789", k=4))
    return f"{prefix}-{chars}"


class SQLiteStorageAdapter(BaseStorageAdapter):
    """High-concurrency SQLite WAL storage adapter with full Problem Bank support for RatchetAI."""

    def __init__(self, db_path: str = "pipeline/ratchetai.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    share_code TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    passcode TEXT,
                    created_by TEXT DEFAULT 'Founder',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS project_members (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'RESEARCHER',
                    avatar TEXT DEFAULT '👩‍💻',
                    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    project_id TEXT,
                    project_name TEXT,
                    state_data TEXT NOT NULL,
                    phase1_complete INTEGER DEFAULT 0,
                    phase2_complete INTEGER DEFAULT 0,
                    phase3_complete INTEGER DEFAULT 0,
                    phase4_complete INTEGER DEFAULT 0,
                    phase5_complete INTEGER DEFAULT 0,
                    last_edited_by TEXT DEFAULT 'Founder',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
                );

                CREATE TABLE IF NOT EXISTS session_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    label TEXT NOT NULL,
                    phase_number INTEGER NOT NULL,
                    state_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
                );

                -- -----------------------------------------------------------
                -- Problem Bank Tables
                -- -----------------------------------------------------------
                CREATE TABLE IF NOT EXISTS problems (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    session_id TEXT,
                    sector TEXT NOT NULL,
                    sufferer_occupation TEXT,
                    sufferer_location TEXT,
                    problem_statement TEXT NOT NULL,
                    evidence_tier TEXT DEFAULT 'SIGNAL',
                    workaround TEXT,
                    quantified_impact TEXT,
                    evidence_types TEXT DEFAULT '[]',
                    source TEXT DEFAULT 'llm_phase1',
                    source_detail TEXT,
                    tags TEXT DEFAULT '[]',
                    status TEXT DEFAULT 'discovered',
                    phase2_verdict TEXT,
                    phase3_verdict TEXT,
                    notes TEXT,
                    score REAL DEFAULT 0.0,
                    votes INTEGER DEFAULT 0,
                    devils_advocate_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
                    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL
                );

                CREATE TABLE IF NOT EXISTS problem_sources (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    problem_id TEXT NOT NULL,
                    source_name TEXT NOT NULL,
                    source_url TEXT,
                    source_tier TEXT DEFAULT 'B',
                    evidence_type TEXT,
                    quote_or_summary TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS problem_phase_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    problem_id TEXT NOT NULL,
                    phase_number INTEGER NOT NULL,
                    action TEXT NOT NULL,
                    verdict TEXT,
                    llm_response TEXT,
                    model_used TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                                -- -----------------------------------------------------------
                -- Relational Knowledge Graph Tables (Step 1 Foundation)
                -- -----------------------------------------------------------
                CREATE TABLE IF NOT EXISTS problem_claims (
                    id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    claim_type TEXT NOT NULL,
                    claim_text TEXT NOT NULL,
                    status TEXT DEFAULT 'HYPOTHESIS',
                    confidence_score REAL DEFAULT 50.0,
                    mode TEXT DEFAULT 'COMMERCIAL',
                    evidence_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS problem_assumptions (
                    id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    assumption_text TEXT NOT NULL,
                    risk_level TEXT DEFAULT 'HIGH',
                    status TEXT DEFAULT 'UNTESTED',
                    origin TEXT DEFAULT 'DEVILS_ADVOCATE',
                    testable_question TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS problem_alternatives (
                    id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    alternative_name TEXT NOT NULL,
                    category TEXT DEFAULT 'MANUAL_WORKAROUND',
                    why_it_fails TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS decision_records (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    stage TEXT NOT NULL,
                    selected_problem_id TEXT NOT NULL,
                    rejected_problem_ids TEXT DEFAULT '[]',
                    decision_rationale TEXT NOT NULL,
                    supporting_evidence_ids TEXT DEFAULT '[]',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS problem_comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    problem_id TEXT NOT NULL,
                    user_name TEXT NOT NULL,
                    user_role TEXT NOT NULL DEFAULT 'RESEARCHER',
                    user_avatar TEXT DEFAULT '👩‍💻',
                    comment TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS mentor_signoffs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id TEXT NOT NULL,
                    phase_number INTEGER NOT NULL,
                    mentor_name TEXT NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                );

                -- Indices
                CREATE INDEX IF NOT EXISTS idx_projects_share_code ON projects(share_code);
                CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC);
                CREATE INDEX IF NOT EXISTS idx_snapshots_session ON session_snapshots(session_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_problems_sector ON problems(sector);
                CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
                CREATE INDEX IF NOT EXISTS idx_problems_project ON problems(project_id);
                CREATE INDEX IF NOT EXISTS idx_problems_tier ON problems(evidence_tier);
                CREATE INDEX IF NOT EXISTS idx_problems_updated ON problems(updated_at DESC);
                CREATE INDEX IF NOT EXISTS idx_problem_sources_pid ON problem_sources(problem_id);
                CREATE INDEX IF NOT EXISTS idx_problem_phase_history_pid ON problem_phase_history(problem_id);

                -- Phase 6: Epistemic Links, Assumption Tests & Impact Invalidation
                CREATE TABLE IF NOT EXISTS claim_evidence_links (
                    id TEXT PRIMARY KEY,
                    claim_id TEXT NOT NULL,
                    source_id INTEGER NOT NULL,
                    relation_type TEXT NOT NULL DEFAULT 'SUPPORTS',
                    evidence_strength TEXT NOT NULL DEFAULT 'STRONG',
                    rationale TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (claim_id) REFERENCES problem_claims(id) ON DELETE CASCADE,
                    FOREIGN KEY (source_id) REFERENCES problem_sources(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS assumption_validation_tests (
                    id TEXT PRIMARY KEY,
                    assumption_id TEXT NOT NULL,
                    test_type TEXT NOT NULL DEFAULT 'FIELD_INTERVIEW',
                    target_metric TEXT NOT NULL,
                    actual_result TEXT,
                    test_status TEXT NOT NULL DEFAULT 'PLANNED',
                    conducted_by TEXT,
                    completed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (assumption_id) REFERENCES problem_assumptions(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS impact_invalidation_events (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    session_id TEXT,
                    trigger_entity_type TEXT NOT NULL,
                    trigger_entity_id TEXT NOT NULL,
                    trigger_action TEXT NOT NULL,
                    severity TEXT NOT NULL DEFAULT 'WARNING',
                    affected_entities TEXT NOT NULL DEFAULT '[]',
                    resolution_status TEXT NOT NULL DEFAULT 'ACTIVE_ALERT',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS evidence_provenance (
                    id TEXT PRIMARY KEY,
                    source_id TEXT NOT NULL,
                    connector TEXT NOT NULL,
                    original_identifier TEXT,
                    retrieval_timestamp TEXT NOT NULL,
                    extraction_model TEXT,
                    extraction_prompt_hash TEXT,
                    human_verification_state TEXT DEFAULT 'UNVERIFIED',
                    superseded_by_id TEXT,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS claim_contradictions (
                    id TEXT PRIMARY KEY,
                    claim_id TEXT NOT NULL,
                    supporting_evidence_id TEXT NOT NULL,
                    contradicting_evidence_id TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'CONTESTED',
                    investigation_notes TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS project_unknowns (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    session_id TEXT,
                    category TEXT NOT NULL,
                    statement TEXT NOT NULL,
                    risk_level TEXT DEFAULT 'MEDIUM',
                    linked_claim_id TEXT,
                    linked_assumption_id TEXT,
                    resolution_test_id TEXT,
                    is_resolved INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS requirements_traceability (
                    id TEXT PRIMARY KEY,
                    requirement_id TEXT NOT NULL,
                    requirement_text TEXT NOT NULL,
                    category TEXT DEFAULT 'FUNCTIONAL',
                    linked_decision_id TEXT,
                    linked_assumption_id TEXT,
                    linked_claim_id TEXT,
                    linked_evidence_id TEXT,
                    linked_problem_id TEXT,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS gate_reviews (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    session_id TEXT,
                    gate_id TEXT NOT NULL,
                    gate_name TEXT NOT NULL,
                    verdict TEXT NOT NULL, -- PASS, REVISE, HOLD, FAIL
                    overall_score REAL NOT NULL,
                    rubric_scores TEXT, -- JSON
                    reviewer_role TEXT DEFAULT 'RESEARCH_ADVISOR',
                    reviewer_feedback TEXT,
                    passed_criteria TEXT, -- JSON
                    failed_criteria TEXT, -- JSON
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS research_domains (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    title TEXT NOT NULL,
                    domain_type TEXT NOT NULL DEFAULT 'Sector',
                    description TEXT,
                    scope_boundary TEXT,
                    related_domain_ids TEXT,
                    why_explore TEXT,
                    context_setting TEXT,
                    stakeholders TEXT,
                    processes_to_explore TEXT,
                    evidence_basis TEXT,
                    sdg_relevance TEXT,
                    initial_concerns TEXT,
                    next_action TEXT,
                    is_custom INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_research_domains_proj ON research_domains(project_id);
                CREATE INDEX IF NOT EXISTS idx_research_domains_type ON research_domains(domain_type);

                CREATE TABLE IF NOT EXISTS circumscription_iterations (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    session_id TEXT,
                    artifact_name TEXT NOT NULL,
                    iteration_number INTEGER NOT NULL,
                    test_run_name TEXT NOT NULL,
                    metric_name TEXT NOT NULL,
                    observed_value REAL NOT NULL,
                    target_value REAL NOT NULL,
                    status TEXT NOT NULL, -- PASSED, FAILED_LOOPBACK
                    failure_mode TEXT,
                    constraint_extracted TEXT,
                    target_phase_loopback TEXT DEFAULT 'PHASE_D',
                    created_at TEXT NOT NULL
                );




                CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON claim_evidence_links(claim_id);
                CREATE INDEX IF NOT EXISTS idx_claim_evidence_source ON claim_evidence_links(source_id);
                CREATE INDEX IF NOT EXISTS idx_assumption_tests ON assumption_validation_tests(assumption_id);
                CREATE INDEX IF NOT EXISTS idx_impact_events_status ON impact_invalidation_events(resolution_status, created_at DESC);
            """)

            # Seed default 25 research domains from Master Sheet if table is empty
            try:
                cur = conn.execute("SELECT COUNT(*) FROM research_domains")
                if cur.fetchone()[0] == 0:
                    CANONICAL_DOMAINS = [
                        {
                                                "id": "D01",
                                                "title": "Agricultural Production and Farm Operations",
                                                "domain_type": "Sector",
                                                "description": "Crop and livestock production, including day-to-day farm planning and operations before post-production distribution.",
                                                "scope_boundary": "On-farm crop and livestock production; excludes food logistics (D09), fisheries production (D10), and environmental measurement as the primary purpose (D18).",
                                                "related_domain_ids": "Related: D06, D09, D10",
                                                "why_explore": "A major local livelihood with observable production, coordination, and record-keeping processes.",
                                                "context_setting": "Crop and livestock farms, cooperatives, agriculture offices, agribusinesses",
                                                "stakeholders": "Farmers, farm workers, cooperatives, agriculture officers, agribusiness operators",
                                                "processes_to_explore": "Production planning, crop and livestock monitoring, irrigation, input use, disease reporting, harvest records, farm records",
                                                "evidence_basis": "PSA and Department of Agriculture background data support sector relevance; exact Iloilo source citations and local process evidence are still required.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Farmer or cooperative access; incomplete farm records; seasonal crop cycles; field travel; connectivity and device constraints.",
                                                "next_action": "Secure one farm, cooperative, or agriculture-office partner and investigate one production process."
                        },
                        {
                                                "id": "D02",
                                                "title": "Teaching, Learning, and Academic Administration",
                                                "domain_type": "Sector",
                                                "description": "Educational processes directly related to instruction, assessment, academic records, and school administration.",
                                                "scope_boundary": "Teaching, learning, assessment, academic records, and administration; excludes accessibility (D14), student support (D15), work transition (D16), and local-language resources (D22) as primary concerns.",
                                                "related_domain_ids": "Related: D14, D15, D16, D22",
                                                "why_explore": "Students and educators are accessible, and many academic processes can be observed without assuming a technology.",
                                                "context_setting": "Public and private schools, universities, classrooms, academic offices, learning environments",
                                                "stakeholders": "Students, teachers, academic coordinators, registrars, school administrators",
                                                "processes_to_explore": "Instruction and learning-resource access, assessment, scheduling, enrollment, academic records, administrative workflows",
                                                "evidence_basis": "DepEd policy and education statistics provide background; local school-process evidence and authorized records are not yet collected.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "School approval; student privacy; timetable constraints; uneven facilities and connectivity; access to authorized process records.",
                                                "next_action": "Choose one school or campus process and obtain the required approval before collecting baseline evidence."
                        },
                        {
                                                "id": "D03",
                                                "title": "Healthcare Service Delivery and Public Health Operations",
                                                "domain_type": "Sector",
                                                "description": "Delivery and coordination of clinical, community, and administrative health services, without assuming access to clinical data.",
                                                "scope_boundary": "Formal healthcare and public-health service workflows; excludes routine public safety (D13) and non-clinical student support (D15) as primary concerns.",
                                                "related_domain_ids": "Related: D15",
                                                "why_explore": "The domain contains consequential service problems, but meaningful study requires a formal health-sector access pathway.",
                                                "context_setting": "Rural health units, clinics, hospitals, public-health offices, community health programs",
                                                "stakeholders": "Patients, healthcare workers, health administrators, public-health personnel",
                                                "processes_to_explore": "Appointments, queues, referrals, non-clinical records, service coordination, supply workflows, public-health reporting",
                                                "evidence_basis": "DOH and WVMC public information provide background; no accessible local workflow records are confirmed.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Formal health-facility partner; ethics and privacy approval; restricted clinical records; professional oversight; limited testing access.",
                                                "next_action": "Seek a non-clinical health-workflow partner and an ethics/privacy route; otherwise keep the domain deferred."
                        },
                        {
                                                "id": "D04",
                                                "title": "Passenger Mobility and Local Transport Operations",
                                                "domain_type": "Sector",
                                                "description": "Movement of passengers through local transport services and the operations that support commuting and mobility.",
                                                "scope_boundary": "Passenger mobility and transport operations; excludes food freight and logistics (D09) and destination-service management (D11).",
                                                "related_domain_ids": "Related: D11, D14",
                                                "why_explore": "Commuter experiences and route conditions can be observed directly, while operational records may require permission.",
                                                "context_setting": "Public-transport routes, terminals, urban corridors, campuses, parking areas",
                                                "stakeholders": "Students, commuters, drivers, operators, transport and traffic personnel",
                                                "processes_to_explore": "Route use, waiting time, scheduling, passenger information, terminal operations, parking, mobility accessibility",
                                                "evidence_basis": "Direct route observations and commuter interviews are feasible; TTMO or operator records are unverified.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "TTMO or route-operator permission; route and traffic records may be unavailable; time and seasonal variation; field-observation safety.",
                                                "next_action": "Conduct timed observations and commuter interviews on one route, then determine whether agency records are necessary."
                        },
                        {
                                                "id": "D05",
                                                "title": "Disaster Risk Reduction and Preparedness",
                                                "domain_type": "Cross-cutting",
                                                "description": "Hazard-specific planning and coordinated action that reduce risk and prepare communities before and during emergencies.",
                                                "scope_boundary": "Hazard-risk reduction and preparedness; excludes routine safety response (D13), environmental measurement (D18), and long-term adaptation planning (D19).",
                                                "related_domain_ids": "Related: D13, D19",
                                                "why_explore": "Communities face recurring hazards, and preparedness processes can be examined before selecting a technology.",
                                                "context_setting": "Hazard-prone barangays, evacuation centers, schools, municipal DRRM operations",
                                                "stakeholders": "Residents, barangay officials, DRRMO personnel, responders, school safety staff",
                                                "processes_to_explore": "Risk communication, preparedness planning, warning dissemination, evacuation planning, drills, relief readiness",
                                                "evidence_basis": "PDRRMO/CDRRMO plans and public hazard information provide background; local process evidence is not yet collected.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "PDRRMO or LGU permission; sensitive incident records; responder availability; emergency testing limits; hazard-specific scope.",
                                                "next_action": "Select one hazard, locality, and preparedness process, then contact the relevant barangay or DRRMO."
                        },
                        {
                                                "id": "D06",
                                                "title": "Water Service and Resource Management",
                                                "domain_type": "Sector",
                                                "description": "Management of water supply, distribution, use, routine quality oversight, and related service infrastructure.",
                                                "scope_boundary": "Water supply, distribution, use, and service operations; excludes environmental measurement as the primary purpose (D18) and ecosystem-restoration management (D25).",
                                                "related_domain_ids": "Related: D01, D08, D18, D25",
                                                "why_explore": "Water-service conditions affect households and institutions and contain observable reporting and operational processes.",
                                                "context_setting": "Communities, campuses, farms, water districts, shared water systems",
                                                "stakeholders": "Households, water providers, barangay officials, farmers, facility managers",
                                                "processes_to_explore": "Supply scheduling, usage records, leak reporting, routine quality checks, pump and storage operations, service complaints",
                                                "evidence_basis": "Water-agency and EMB sources provide background; provider records and water-quality evidence are unverified.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Utility or provider permission; restricted operational data; sampling and laboratory costs; seasonal variation; data ownership.",
                                                "next_action": "Choose supply, quality, conservation, or irrigation, then secure the matching provider and evidence route."
                        },
                        {
                                                "id": "D07",
                                                "title": "Solid Waste Management Operations",
                                                "domain_type": "Sector",
                                                "description": "Operational processes for segregating, collecting, recovering, recycling, treating, and disposing of solid waste.",
                                                "scope_boundary": "Solid-waste operations; excludes environmental-condition measurement (D18) and ecosystem-restoration management (D25).",
                                                "related_domain_ids": "Related: D12, D18, D25",
                                                "why_explore": "Waste operations are visible in schools and communities and can produce measurable evidence at a bounded site.",
                                                "context_setting": "Campuses, barangays, markets, collection points, materials recovery facilities",
                                                "stakeholders": "Households, students, facility staff, waste collectors, barangay and municipal personnel",
                                                "processes_to_explore": "Segregation, collection scheduling, route operations, recovery and recycling, reporting, waste-volume recording",
                                                "evidence_basis": "Official solid-waste policy and direct site audits can provide evidence; no local baseline or approved site is confirmed.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Barangay or campus permission; sanitation and PPE; consistent waste measurement; collector cooperation; behavior variability.",
                                                "next_action": "Select one campus or barangay site, obtain permission, and conduct a baseline audit of one waste process."
                        },
                        {
                                                "id": "D08",
                                                "title": "Energy Use and Facility Energy Management",
                                                "domain_type": "Sector",
                                                "description": "Operational monitoring and management of energy use, reliability, and efficiency in households and facilities.",
                                                "scope_boundary": "Energy-use and facility-energy operations; excludes water-service operations (D06) and general residential maintenance (D17).",
                                                "related_domain_ids": "Related: D06, D17",
                                                "why_explore": "Energy use creates measurable costs and service concerns in homes, schools, businesses, and public facilities.",
                                                "context_setting": "Homes, campuses, offices, small businesses, public buildings",
                                                "stakeholders": "Households, students, facility managers, business owners, power-service personnel",
                                                "processes_to_explore": "Consumption records, peak-use assessment, equipment scheduling, outage reporting, facility energy assessment",
                                                "evidence_basis": "DOE and distributor sources provide background; facility-level consumption and equipment records are unverified.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Meter or utility data access; electrical safety; hardware cost; facility permission; changing usage patterns.",
                                                "next_action": "Choose one facility and one issue\u2014consumption, reliability, scheduling, or reporting\u2014and verify data and safety access."
                        },
                        {
                                                "id": "D09",
                                                "title": "Food Logistics and Supply-Chain Operations",
                                                "domain_type": "Sector",
                                                "description": "Movement, handling, storage, and coordination of food after production through markets and consumers.",
                                                "scope_boundary": "Post-production food movement, handling, storage, and coordination; excludes farm or fisheries production (D01, D10) and passenger transport (D04).",
                                                "related_domain_ids": "Related: D01, D10, D23",
                                                "why_explore": "Delays, spoilage, stock uncertainty, and coordination problems may be observable when one commodity chain is selected.",
                                                "context_setting": "Farms and landing points, markets, cooperatives, storage areas, retailers, delivery routes",
                                                "stakeholders": "Producers, traders, vendors, transporters, retailers, consumers",
                                                "processes_to_explore": "Inventory recording, storage conditions, shipment and delivery coordination, demand records, traceability, spoilage reporting",
                                                "evidence_basis": "Sector reports and participant interviews may provide evidence; commodity-specific commercial records are unverified.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Commercially sensitive records; fragmented supply-chain data; seasonal supply; cold-storage access; participant availability.",
                                                "next_action": "Reconsider only after one commodity-chain partner and one transition point are confirmed."
                        },
                        {
                                                "id": "D10",
                                                "title": "Fisheries and Aquaculture Production",
                                                "domain_type": "Sector",
                                                "description": "Capture fisheries and farmed aquatic production, including operational and biological processes before distribution.",
                                                "scope_boundary": "Fisheries and aquaculture production; excludes post-production food logistics (D09) and general environmental monitoring (D18).",
                                                "related_domain_ids": "Related: D01, D09, D18, D25",
                                                "why_explore": "The sector is locally important, but research requires sustained access to production sites, operators, or technical experts.",
                                                "context_setting": "Fishing communities, fishponds, landing sites, hatcheries, aquaculture facilities",
                                                "stakeholders": "Fishers, fish farmers, fisheries officers, technical experts, coastal communities",
                                                "processes_to_explore": "Production planning, feeding, stock and catch records, disease observation, harvest, landing records",
                                                "evidence_basis": "BFAR, UPV, and SEAFDEC sources provide background; site datasets, expert labels, and laboratory access are unverified.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Sustained field-site and fisher access; BFAR, UPV, or SEAFDEC expert support; equipment and laboratory fees; weather and seasonality.",
                                                "next_action": "Reconsider only after a fisheries partner, field site, expert, schedule, and total cost are confirmed."
                        },
                        {
                                                "id": "D11",
                                                "title": "Tourism Services and Destination Operations",
                                                "domain_type": "Sector",
                                                "description": "Visitor-facing services and the operation and management of tourism destinations, accommodations, and activities.",
                                                "scope_boundary": "Visitor and destination services; excludes passenger transport as the primary process (D04) and cultural safeguarding (D20).",
                                                "related_domain_ids": "Related: D04, D14, D20",
                                                "why_explore": "Local destinations allow observation of visitor and operator processes, subject to site cooperation and seasonality.",
                                                "context_setting": "Heritage and natural sites, festivals, tourism offices, accommodations, transport terminals",
                                                "stakeholders": "Visitors, residents, tourism officers, guides, transport providers, local businesses",
                                                "processes_to_explore": "Visitor information, bookings and inquiries, visitor flow, accessibility, feedback, site and destination operations",
                                                "evidence_basis": "DOT and local-tourism reports provide background; site-specific visitor and process evidence is unverified.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Tourism-site and business permission; seasonality; visitor recruitment; commercially sensitive records; heritage and community sensitivity.",
                                                "next_action": "Select one destination and one visitor or operator process, then confirm site cooperation."
                        },
                        {
                                                "id": "D12",
                                                "title": "Government Service Delivery and Administrative Workflows",
                                                "domain_type": "Sector",
                                                "description": "Citizen-facing transactions and internal administrative workflows of government offices, independent of sector-specific program content.",
                                                "scope_boundary": "Citizen-facing government transactions and administrative workflows; excludes sector-specific problems merely because an LGU operates the service.",
                                                "related_domain_ids": "Related: D07, D13, D24",
                                                "why_explore": "Citizens regularly use public offices, allowing investigation of service access, delays, routing, and transparency.",
                                                "context_setting": "Barangay halls, municipal offices, service counters, public consultations",
                                                "stakeholders": "Citizens, barangay officials, municipal staff, applicants, civil-society groups",
                                                "processes_to_explore": "Applications, permits, document requests, complaints, case routing, public information, feedback, processing-time recording",
                                                "evidence_basis": "DILG, ARTA, and Citizen's Charter documents provide process baselines; actual local transaction data are unverified.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "LGU permission; protected records; policy variation; staff workload; process ownership; Citizen's Charter may not reflect actual practice.",
                                                "next_action": "Select one government transaction and office, then map the current process with authorized participants."
                        },
                        {
                                                "id": "D13",
                                                "title": "Community Safety and Emergency Response",
                                                "domain_type": "Sector",
                                                "description": "Prevention, reporting, coordination, and response for routine community-safety incidents and emergencies not primarily focused on natural-hazard planning.",
                                                "scope_boundary": "Routine safety-incident reporting and emergency response; excludes natural-hazard preparedness (D05) and long-term climate adaptation (D19).",
                                                "related_domain_ids": "Related: D05, D12, D24",
                                                "why_explore": "Safety reporting and response coordination are consequential but require careful handling of operational information.",
                                                "context_setting": "Barangays, schools, public spaces, transport areas, emergency operations centers",
                                                "stakeholders": "Residents, barangay officials, responders, school safety staff, enforcement personnel",
                                                "processes_to_explore": "Incident reporting, dispatch, public advisories, response coordination, resource status, after-action records",
                                                "evidence_basis": "Public-safety policies and advisories provide background; incident and response records are restricted.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Sensitive incident and security data; agency permission; respondent safety; false or incomplete reports; no testing in real emergencies.",
                                                "next_action": "Retain one safe public-information or coordination process and obtain an agency partner."
                        },
                        {
                                                "id": "D14",
                                                "title": "Accessibility and Inclusive Participation",
                                                "domain_type": "Cross-cutting",
                                                "description": "Conditions and barriers affecting equitable access to digital services, communication, mobility, learning, and public participation.",
                                                "scope_boundary": "Accessibility barriers and inclusive participation; excludes assuming assistive technology as the solution and excludes general education operations.",
                                                "related_domain_ids": "Related: D02, D04, D11, D15, D22",
                                                "why_explore": "Accessibility becomes researchable when representative users help define needs and evaluation criteria.",
                                                "context_setting": "Schools, campuses, homes, public facilities, websites, mobile services",
                                                "stakeholders": "People with disabilities, caregivers, educators, accessibility advocates, service providers",
                                                "processes_to_explore": "Accessibility assessment, digital navigation, communication access, wayfinding, service accommodation, usability evaluation",
                                                "evidence_basis": "Accessibility standards and participatory evidence are appropriate; representative local evidence has not been collected.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Representative participant recruitment; informed consent; diverse accessibility needs; assistive-device availability; expert validation.",
                                                "next_action": "Secure representative participants and a qualified accessibility validator before defining requirements."
                        },
                        {
                                                "id": "D15",
                                                "title": "Student Support Services and Academic Well-being",
                                                "domain_type": "Specialized",
                                                "description": "Non-clinical academic, social, and support-service conditions affecting students' participation and ability to learn.",
                                                "scope_boundary": "Non-clinical student-support and academic-well-being processes; excludes health diagnosis or treatment (D03) and general teaching processes (D02).",
                                                "related_domain_ids": "Parent: D02; Related: D03, D14",
                                                "why_explore": "The group can access students and observe service-discovery, workload, and support-process concerns.",
                                                "context_setting": "Universities, schools, classrooms, student-service offices, online learning environments",
                                                "stakeholders": "Students, teachers, guidance personnel, student-affairs staff, parents or guardians when appropriate",
                                                "processes_to_explore": "Workload coordination, support-service discovery, appointments, campus participation, referrals, follow-up",
                                                "evidence_basis": "Student interviews, observation, and public service information may provide evidence; sensitive institutional records are restricted.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Sensitive personal data; school ethics or approval; measurement validity; professional oversight; avoid collecting clinical disclosures.",
                                                "next_action": "Narrow to one non-clinical support-service process and obtain campus approval."
                        },
                        {
                                                "id": "D16",
                                                "title": "Employment, Skills, and School-to-Work Transition",
                                                "domain_type": "Sector",
                                                "description": "Preparation for work, skills development, recruitment, career guidance, and transition from education to employment.",
                                                "scope_boundary": "Career preparation, skills, recruitment, and school-to-work transition; excludes general teaching (D02) and internal MSME operations (D23).",
                                                "related_domain_ids": "Related: D02, D23",
                                                "why_explore": "Students, graduates, training providers, and employers may reveal measurable skills and transition mismatches.",
                                                "context_setting": "Universities, training centers, job fairs, local firms, recruitment channels",
                                                "stakeholders": "Students, graduates, career offices, trainers, employers, local businesses",
                                                "processes_to_explore": "Skills-requirement analysis, career guidance, job and internship matching, credential records, employer coordination",
                                                "evidence_basis": "DOLE, PESO, TESDA, and labor-market sources support relevance; an occupation-specific local mismatch is not validated.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Employer and career-office participation; self-reported skills; changing job requirements; personal-data privacy; outcome follow-up.",
                                                "next_action": "Select one occupation or school-to-work transition and confirm employer or career-office participation."
                        },
                        {
                                                "id": "D17",
                                                "title": "Housing, Rental, and Shared Residential Services",
                                                "domain_type": "Sector",
                                                "description": "Residential, rental, maintenance, and shared-facility processes affecting tenants, landlords, and communities.",
                                                "scope_boundary": "Housing, rental, maintenance, and shared-residential processes; excludes utilities, waste, public safety, and governance when those are the primary problem.",
                                                "related_domain_ids": "Related: D06, D08",
                                                "why_explore": "Boarding and community-living experiences may reveal observable service and coordination problems.",
                                                "context_setting": "Rental housing, dormitories, subdivisions, barangays, shared residential facilities",
                                                "stakeholders": "Residents, tenants, landlords, homeowners, barangay officials, maintenance personnel",
                                                "processes_to_explore": "Maintenance requests, rental communication, community notices, shared-facility scheduling, residential reporting",
                                                "evidence_basis": "Direct observation and interviews in boarding or rental settings are feasible; standardized operational records may be limited.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Private-property and household access; tenant and landlord privacy; differing responsibilities; limited standardized records.",
                                                "next_action": "Choose one boarding or rental workflow and confirm both resident and responsible-party access."
                        },
                        {
                                                "id": "D18",
                                                "title": "Environmental Condition Monitoring",
                                                "domain_type": "Cross-cutting",
                                                "description": "Systematic observation and measurement of environmental conditions using defined variables, sites, and reference methods.",
                                                "scope_boundary": "Validated observation and measurement of environmental conditions; excludes restoration-project management (D25) and utility-service operations (D06).",
                                                "related_domain_ids": "Related: D06, D07, D10, D19, D25",
                                                "why_explore": "Local conditions can be measured, but a viable study requires a validated variable, reference method, and sampling plan.",
                                                "context_setting": "Rivers, watersheds, farms, roadsides, campuses, vulnerable or protected areas",
                                                "stakeholders": "Residents, environmental officers, schools, farmers, community groups, technical experts",
                                                "processes_to_explore": "Sampling, sensor and field observations, data-quality checks, reporting, trend analysis, threshold assessment",
                                                "evidence_basis": "EMB, DOST VI, and UPV technical references provide pathways; the variable-specific dataset and reference method are unconfirmed.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Site permission; sensor calibration; reference laboratory or technical validation; sampling duration; weather exposure; maintenance cost.",
                                                "next_action": "Select one environmental variable, site, reference method, sampling period, and total validation cost."
                        },
                        {
                                                "id": "D19",
                                                "title": "Long-Term Climate Adaptation Planning",
                                                "domain_type": "Cross-cutting",
                                                "description": "Planning and prioritization of actions that help communities and systems adjust to projected climate impacts over longer time horizons.",
                                                "scope_boundary": "Long-term climate planning and adaptation-option prioritization; excludes immediate disaster preparedness (D05) and environmental measurement (D18).",
                                                "related_domain_ids": "Related: D05, D18, D25",
                                                "why_explore": "The domain is relevant only when narrowed to a planning or resource-allocation decision distinct from preparedness and monitoring.",
                                                "context_setting": "Coastal areas, flood-prone communities, agricultural zones, local planning offices",
                                                "stakeholders": "Local governments, vulnerable communities, environmental planners, researchers",
                                                "processes_to_explore": "Vulnerability assessment, adaptation-option prioritization, local planning, project monitoring, resource allocation",
                                                "evidence_basis": "PAGASA and GeoRisk public data provide background; local adaptation-decision evidence is unverified.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Long-term data and evaluation horizon; model complexity; overlap with DRR and environmental monitoring; LGU planning access; policy dependence.",
                                                "next_action": "Choose one planning decision with a feasible historical, simulation, or expert-evaluation basis; otherwise drop."
                        },
                        {
                                                "id": "D21",
                                                "title": "Financial Access and Consumer Service Workflows",
                                                "domain_type": "Specialized",
                                                "description": "Access to, understanding of, and support for formal financial services, payments, microfinance, and financial-literacy services.",
                                                "scope_boundary": "Consumer access to, understanding of, and support for financial services; excludes credit scoring and internal business management (D23).",
                                                "related_domain_ids": "Related: D23, D24",
                                                "why_explore": "Local consumers and merchants may reveal barriers in service discovery, onboarding, understanding, and assistance.",
                                                "context_setting": "Stores, cooperatives, rural banks, payment agents, schools, community financial-literacy programs",
                                                "stakeholders": "Consumers, small merchants, cooperative members, financial-literacy educators, financial-service personnel",
                                                "processes_to_explore": "Financial-literacy support, service discovery, onboarding, payment assistance, complaint handling, consumer-side record reconciliation",
                                                "evidence_basis": "BSP financial-inclusion and consumer-protection sources provide background; local workflow evidence is unverified.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Financial-data sensitivity; regulated services; trust and informed consent; transaction records unavailable; avoid collecting credentials or balances.",
                                                "next_action": "Choose one non-sensitive consumer workflow and define an ethical participant/evidence plan."
                        },
                        {
                                                "id": "D23",
                                                "title": "MSME Operations and Digital Commerce",
                                                "domain_type": "Sector",
                                                "description": "Day-to-day processes used by micro and small enterprises to manage sales, products, suppliers, customers, and digital channels.",
                                                "scope_boundary": "Internal MSME sales, inventory, supplier, customer, and digital-commerce operations; excludes consumer financial access (D21) and whole food-supply chains (D09).",
                                                "related_domain_ids": "Related: D09, D16, D21, D24",
                                                "why_explore": "Local enterprises provide observable manual and digital workflows without requiring a predetermined solution.",
                                                "context_setting": "Stores, market stalls, home-based enterprises, cooperatives, small online shops",
                                                "stakeholders": "Small-business owners, market vendors, home-based sellers, customers, suppliers, business-support personnel",
                                                "processes_to_explore": "Inventory and stock records, supplier ordering, sales recording, payment reconciliation, customer inquiries, business reporting",
                                                "evidence_basis": "DTI and PSA MSME sources support relevance; partner business records and a local bottleneck remain unconfirmed.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Owner availability; inconsistent records; commercial privacy; device and connectivity constraints; avoid sensitive financial or customer data.",
                                                "next_action": "Choose one business type and committed partner, then quantify one recurring non-sensitive operational bottleneck."
                        },
                        {
                                                "id": "D24",
                                                "title": "Digital Safety and Data Privacy Practices",
                                                "domain_type": "Cross-cutting",
                                                "description": "Safe, lawful, and responsible handling of personal data, accounts, devices, and online interactions when security or privacy is the primary research concern.",
                                                "scope_boundary": "Security or privacy must be the primary research problem; excludes treating it only as a requirement of another domain. All studies must be controlled and authorized.",
                                                "related_domain_ids": "Related: D12, D13, D21, D23",
                                                "why_explore": "Local practices and support workflows can be examined safely through controlled and authorized studies.",
                                                "context_setting": "Schools, campuses, public offices, local businesses, community organizations, online groups",
                                                "stakeholders": "Students, educators, parents or guardians, office staff, business owners, data-protection personnel",
                                                "processes_to_explore": "Privacy-notice comprehension, consent, account-security practices, scam recognition and reporting, incident reporting, permissions, data retention",
                                                "evidence_basis": "NPC, DICT, and CICC materials provide background; a specific local user or workflow problem is not yet validated.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Participant privacy and informed consent; access to incident logs is restricted; institutional authorization; controlled testing only; no unauthorized access.",
                                                "next_action": "Choose one controlled awareness, usability, reporting, or privacy workflow and obtain institutional authorization."
                        },
                        {
                                                "id": "D20",
                                                "title": "Cultural Heritage Documentation and Knowledge Transmission",
                                                "domain_type": "Specialized",
                                                "description": "Documentation, safeguarding, and community-controlled transmission of local traditions, oral histories, languages, and cultural knowledge.",
                                                "scope_boundary": "Safeguarding and transmitting cultural knowledge with community permission; excludes tourism services (D11) and language-literacy resources (D22) as the primary purpose.",
                                                "related_domain_ids": "Related: D11, D22",
                                                "why_explore": "Local documentation and knowledge-transmission practices may contain access, continuity, ownership, and validation concerns that can be investigated with community permission.",
                                                "context_setting": "One consenting barangay, cultural organization, local heritage office, or school-based local-history setting in Iloilo or Antique",
                                                "stakeholders": "Cultural knowledge holders, community elders, local historians, cultural organizations, barangay or cultural offices, educators, and learners",
                                                "processes_to_explore": "Existing documentation, consent and ownership practices, transcription, cataloging, access control, community validation, and knowledge transmission",
                                                "evidence_basis": "NCCA cultural-inventory and heritage-documentation programs provide background; local community evidence is not yet obtained.",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Requires trust-building and consent from elders/communities; cultural sensitivity in handling and presenting oral knowledge; access to community gatekeepers (e.g., barangay or cultural office) is essential before any data collection; risk of misrepresentation if not community-validated.",
                                                "next_action": "Select one consenting community and cultural practice, obtain permission, and confirm the revised scope with the submitter."
                        },
                        {
                                                "id": "D22",
                                                "title": "Local Language and Literacy Resources",
                                                "domain_type": "Specialized",
                                                "description": "Reading, writing, translation, comprehension, and preservation of Hiligaynon, Kinaray-a, and other regional-language resources.",
                                                "scope_boundary": "Local-language literacy and resource processes; excludes general academic administration (D02) and cultural documentation not centered on language or literacy (D20).",
                                                "related_domain_ids": "Related: D02, D14, D20",
                                                "why_explore": "Changes under RA 12027 make local-language resource availability, classroom use, and literacy support worth exploring, but a specific local difficulty must be verified with educators and learners.",
                                                "context_setting": "Schools, community literacy programs, libraries, cultural organizations, and local-language resource projects",
                                                "stakeholders": "Students, teachers, local-language advocates or linguists, librarians, DepEd personnel",
                                                "processes_to_explore": "Language mapping, local-language resource cataloging, reading support, transcription, translation assistance, and material evaluation",
                                                "evidence_basis": "RA 12027 and education/language-resource sources provide policy background; a local literacy or resource problem is not yet validated. https://lawphil.net/statutes/repacts/ra2024/ra_12027_2024.html",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Policy alignment under RA 12027, limited validated datasets, orthography and linguistic expertise, and permissions for copyrighted or community materials",
                                                "next_action": "Choose one language/literacy process and local setting, then confirm an educator or linguist and submitter approval."
                        },
                        {
                                                "id": "D25",
                                                "title": "Mangrove Restoration/Environment and Conservation Operations",
                                                "domain_type": "Specialized",
                                                "description": "Planning, coordination, documentation, and management of mangrove restoration activities and their project-level outcomes.",
                                                "scope_boundary": "Mangrove-restoration planning, coordination, field records, and project reporting; excludes scientific environmental-condition measurement as the primary purpose (D18) and generic waste or water-service operations.",
                                                "related_domain_ids": "Related: D06, D07, D10, D18, D19",
                                                "why_explore": "Mangrove-restoration projects involve field records, activity coordination, survival tracking, and reporting processes that may warrant investigation when one site and responsible organization are accessible.",
                                                "context_setting": "One verified mangrove-restoration site in Iloilo; Leganes Integrated Katunggan Ecopark is a documented candidate, but research access is unconfirmed",
                                                "stakeholders": "Site managers, LGU environment offices, DENR or BFAR personnel, fisherfolk, conservation organizations, community partners, volunteers, and researchers",
                                                "processes_to_explore": "Restoration planning, planting-site records, project-level survival and growth tracking, field-data collection, activity and volunteer coordination, reporting, and decision-making",
                                                "evidence_basis": "Official documentation confirms mangrove-restoration activity at Leganes Integrated Katunggan Ecopark. The submitter also reports a possible personal route to relevant records or evidence, but the exact datasets, ownership, coverage, quality, format, and research-use permission remain to be verified. https://www.bmb.gov.ph/the-katunggan-ecopark/",
                                                "sdg_relevance": "",
                                                "initial_concerns": "Formal stakeholder participation, site permission, and data access are not yet confirmed; details of the known contact and available evidence remain undocumented; field conditions; ecological validation needs; imagery or equipment costs and licensing; overlap with D18.",
                                                "next_action": "Decide whether the focus is restoration management or scientific condition measurement; if measurement is primary, merge with D18. Document the known contact\u2019s organization or role, confirm participation and site access, and identify the exact obtainable datasets."
                        }
]
                    now = datetime.now(timezone.utc).isoformat()
                    for d in CANONICAL_DOMAINS:
                        conn.execute("""
                            INSERT OR IGNORE INTO research_domains (
                                id, project_id, title, domain_type, description,
                                scope_boundary, related_domain_ids, why_explore,
                                context_setting, stakeholders, processes_to_explore,
                                evidence_basis, sdg_relevance, initial_concerns,
                                next_action, is_custom, created_at, updated_at
                            ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
                        """, (
                            d["id"], d["title"], d["domain_type"], d["description"],
                            d["scope_boundary"], d["related_domain_ids"], d["why_explore"],
                            d["context_setting"], d["stakeholders"], d["processes_to_explore"],
                            d["evidence_basis"], d["sdg_relevance"], d["initial_concerns"],
                            d["next_action"], now, now
                        ))
                    conn.commit()
            except Exception as e:
                print(f"[!] Warning: Failed to seed research domains: {e}")

            # Migration safe check for newly added columns if table already existed
            try:
                conn.execute("ALTER TABLE problems ADD COLUMN votes INTEGER DEFAULT 0")
            except Exception:
                pass
            try:
                conn.execute("ALTER TABLE problems ADD COLUMN devils_advocate_data TEXT")
            except Exception:
                pass

    # ------------------------------------------------------------------
    # Session Management Methods
    # ------------------------------------------------------------------


            try:
                conn.execute("ALTER TABLE projects ADD COLUMN passcode TEXT;")
            except sqlite3.OperationalError:
                pass

            try:
                conn.execute("ALTER TABLE problems ADD COLUMN created_by TEXT DEFAULT 'Founder';")
            except sqlite3.OperationalError:
                pass

            try:
                conn.execute("ALTER TABLE problems ADD COLUMN updated_by TEXT DEFAULT 'Founder';")
            except sqlite3.OperationalError:
                pass

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT session_id, project_id, state_data, project_name, updated_at, created_at FROM sessions WHERE session_id = ?",
                (session_id,)
            ).fetchone()
            if not row:
                return None
            try:
                state = json.loads(row["state_data"])
                state["session_id"] = row["session_id"]
                state["project_id"] = row["project_id"]
                if "project_name" not in state or not state["project_name"]:
                    state["project_name"] = row["project_name"]
                if row["project_id"]:
                    p_row = conn.execute("SELECT share_code, passcode FROM projects WHERE id = ?", (row["project_id"],)).fetchone()
                    if p_row:
                        state["share_code"] = p_row["share_code"]
                        state["has_passcode"] = bool(p_row["passcode"])
                return state
            except Exception:
                return None

    def save_session(self, session_id: str, state: Dict[str, Any]) -> Dict[str, Any]:
        project_name = state.get("project_name") or "Venture Project"
        project_id = state.get("project_id")

        p1 = 1 if state.get("phase1_complete") or state.get("phase1_response") else 0
        p2 = 1 if state.get("phase2_complete") or state.get("phase2_response") else 0
        p3 = 1 if state.get("phase3_complete") or (state.get("completed_levels") and len(state.get("completed_levels", [])) >= 6) else 0
        p4 = 1 if state.get("phase4_complete") or state.get("phase4_response") else 0
        p5 = 1 if state.get("phase5_complete") or state.get("phase5_response") else 0

        now = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            if not project_id:
                existing_sess = conn.execute("SELECT project_id FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
                if existing_sess and existing_sess["project_id"]:
                    project_id = existing_sess["project_id"]
                else:
                    project_id = f"proj_{uuid.uuid4().hex[:8]}"
                    code = generate_share_code()
                    conn.execute(
                        "INSERT INTO projects (id, share_code, name) VALUES (?, ?, ?)",
                        (project_id, code, project_name)
                    )
            else:
                proj = conn.execute("SELECT id FROM projects WHERE id = ?", (project_id,)).fetchone()
                if not proj:
                    code = generate_share_code()
                    conn.execute(
                        "INSERT INTO projects (id, share_code, name) VALUES (?, ?, ?)",
                        (project_id, code, project_name)
                    )

            state["project_id"] = project_id
            state["session_id"] = session_id
            state_json = json.dumps(state)

            conn.execute("""
                INSERT INTO sessions (
                    session_id, project_id, project_name, state_data,
                    phase1_complete, phase2_complete, phase3_complete, phase4_complete, phase5_complete,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(session_id) DO UPDATE SET
                    project_name = excluded.project_name,
                    state_data = excluded.state_data,
                    phase1_complete = excluded.phase1_complete,
                    phase2_complete = excluded.phase2_complete,
                    phase3_complete = excluded.phase3_complete,
                    phase4_complete = excluded.phase4_complete,
                    phase5_complete = excluded.phase5_complete,
                    updated_at = excluded.updated_at
            """, (session_id, project_id, project_name, state_json, p1, p2, p3, p4, p5, now))

        return state

    def list_sessions(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT 
                    s.session_id, s.project_id, s.project_name,
                    s.phase1_complete, s.phase2_complete, s.phase3_complete, s.phase4_complete, s.phase5_complete,
                    s.created_at, s.updated_at,
                    p.share_code
                FROM sessions s
                LEFT JOIN projects p ON s.project_id = p.id
                ORDER BY s.updated_at DESC
                LIMIT ?
            """, (limit,)).fetchall()

            results = []
            for r in rows:
                results.append({
                    "session_id": r["session_id"],
                    "project_id": r["project_id"],
                    "project_name": r["project_name"] or "Venture Project",
                    "share_code": r["share_code"],
                    "phase1_complete": bool(r["phase1_complete"]),
                    "phase2_complete": bool(r["phase2_complete"]),
                    "phase3_complete": bool(r["phase3_complete"]),
                    "phase4_complete": bool(r["phase4_complete"]),
                    "phase5_complete": bool(r["phase5_complete"]),
                    "created_at": r["created_at"],
                    "updated_at": r["updated_at"],
                })
            return results

    def rename_session(self, session_id: str, new_name: str) -> Optional[Dict[str, Any]]:
        state = self.get_session(session_id)
        if not state:
            return None
        clean_name = new_name.strip()
        state["project_name"] = clean_name
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                "UPDATE sessions SET project_name = ?, updated_at = ? WHERE session_id = ?",
                (clean_name, now, session_id)
            )
            proj_id = state.get("project_id")
            if proj_id:
                conn.execute(
                    "UPDATE projects SET name = ?, updated_at = ? WHERE id = ?",
                    (clean_name, now, proj_id)
                )
        return self.save_session(session_id, state)

    def delete_session(self, session_id: str) -> bool:
        with self._get_connection() as conn:
            cur = conn.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
            return cur.rowcount > 0

    def create_snapshot(self, session_id: str, label: str, phase_number: int) -> Dict[str, Any]:
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")

        state_json = json.dumps(session)
        with self._get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO session_snapshots (session_id, label, phase_number, state_data)
                VALUES (?, ?, ?, ?)
            """, (session_id, label, phase_number, state_json))
            snapshot_id = cur.lastrowid

            return {
                "id": snapshot_id,
                "session_id": session_id,
                "label": label,
                "phase_number": phase_number,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

    def list_snapshots(self, session_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT id, session_id, label, phase_number, created_at
                FROM session_snapshots
                WHERE session_id = ?
                ORDER BY created_at DESC
            """, (session_id,)).fetchall()
            return [dict(r) for r in rows]

    def restore_snapshot(self, session_id: str, snapshot_id: int) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute("""
                SELECT state_data FROM session_snapshots
                WHERE id = ? AND session_id = ?
            """, (snapshot_id, session_id)).fetchone()
            if not row:
                return None
            state = json.loads(row["state_data"])
            self.save_session(session_id, state)
            return state

    def get_project_by_code(self, share_code: str) -> Optional[Dict[str, Any]]:
        clean_code = share_code.strip().upper()
        with self._get_connection() as conn:
            row = conn.execute("""
                SELECT p.id, p.share_code, p.name, p.created_at, s.session_id
                FROM projects p
                LEFT JOIN sessions s ON s.project_id = p.id
                WHERE p.share_code = ?
                LIMIT 1
            """, (clean_code,)).fetchone()
            if not row:
                return None
            return dict(row)

    # ------------------------------------------------------------------

    # ------------------------------------------------------------------
    # Team Members, Passcodes, and Comments Operations
    # ------------------------------------------------------------------

    def verify_project_passcode(self, project_id: str, passcode: str) -> bool:
        with self._get_connection() as conn:
            # Check direct project record
            row = conn.execute(
                "SELECT passcode FROM projects WHERE id = ?",
                (project_id,)
            ).fetchone()
            
            # If not found directly, check if project_id is a session_id
            if not row:
                s_row = conn.execute(
                    "SELECT p.passcode FROM sessions s LEFT JOIN projects p ON s.project_id = p.id WHERE s.session_id = ? OR s.project_id = ?",
                    (project_id, project_id)
                ).fetchone()
                if s_row and s_row["passcode"] is not None:
                    row = s_row

            if not row or not row["passcode"]:
                return True # No passcode set yet
            return str(row["passcode"]).strip() == str(passcode).strip()

    def set_project_passcode(self, project_id: str, passcode: Optional[str]) -> bool:
        with self._get_connection() as conn:
            clean_pin = passcode.strip() if passcode else None
            share_code = generate_share_code()
            # Always ensure a project row exists
            conn.execute("""
                INSERT INTO projects (id, name, passcode, share_code)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET passcode = excluded.passcode
            """, (project_id, "Venture Project", clean_pin, share_code))

            # Also check if project_id links to a session
            raw_sess_id = project_id.replace("proj_", "")
            conn.execute("""
                UPDATE sessions SET project_id = ? 
                WHERE session_id = ? OR session_id = ? OR project_id = ?
            """, (project_id, project_id, raw_sess_id, project_id))
            return True

    def list_project_members(self, project_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT * FROM project_members
                WHERE project_id = ?
                ORDER BY created_at ASC
            """, (project_id,)).fetchall()
            return [dict(r) for r in rows]

    def upsert_project_member(self, project_id: str, member_data: Dict[str, Any]) -> Dict[str, Any]:
        member_id = member_data.get("id") or f"mem_{uuid.uuid4().hex[:8]}"
        name = member_data.get("name", "Team Member")
        role = member_data.get("role", "RESEARCHER")
        avatar = member_data.get("avatar", "👩‍💻")
        now = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO project_members (id, project_id, name, role, avatar, last_active_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name=excluded.name,
                    role=excluded.role,
                    avatar=excluded.avatar,
                    last_active_at=excluded.last_active_at
            """, (member_id, project_id, name, role, avatar, now, now))

            row = conn.execute("SELECT * FROM project_members WHERE id = ?", (member_id,)).fetchone()
            return dict(row)

    def add_problem_comment(self, problem_id: str, comment_data: Dict[str, Any]) -> Dict[str, Any]:
        user_name = comment_data.get("user_name", "Team Member")
        user_role = comment_data.get("user_role", "RESEARCHER")
        user_avatar = comment_data.get("user_avatar", "👩‍💻")
        comment = comment_data.get("comment", "").strip()
        now = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO problem_comments (problem_id, user_name, user_role, user_avatar, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (problem_id, user_name, user_role, user_avatar, comment, now))
            cid = cur.lastrowid
            return {
                "id": cid,
                "problem_id": problem_id,
                "user_name": user_name,
                "user_role": user_role,
                "user_avatar": user_avatar,
                "comment": comment,
                "created_at": now
            }

    def list_problem_comments(self, problem_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT * FROM problem_comments
                WHERE problem_id = ?
                ORDER BY created_at ASC
            """, (problem_id,)).fetchall()
            return [dict(r) for r in rows]

    def record_mentor_signoff(self, project_id: str, phase_number: int, mentor_name: str, notes: str) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO mentor_signoffs (project_id, phase_number, mentor_name, notes, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (project_id, phase_number, mentor_name, notes, now))
            sid = cur.lastrowid
            return {
                "id": sid,
                "project_id": project_id,
                "phase_number": phase_number,
                "mentor_name": mentor_name,
                "notes": notes,
                "created_at": now
            }

    def list_mentor_signoffs(self, project_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT * FROM mentor_signoffs
                WHERE project_id = ?
                ORDER BY created_at DESC
            """, (project_id,)).fetchall()
            return [dict(r) for r in rows]

    # Problem Bank Methods
    # ------------------------------------------------------------------

    def find_matching_problem(self, p: Dict[str, Any], threshold: float = 0.65) -> Optional[Dict[str, Any]]:
        """Find an existing problem in the database that describes the same core issue."""
        sector = p.get("sector")
        stmt = clean_text(p.get("problem_statement") or "").lower()
        if not stmt:
            return None
            
        with self._get_connection() as conn:
            query = "SELECT * FROM problems"
            params = []
            if sector:
                query += " WHERE sector = ?"
                params.append(sector)
            rows = [dict(r) for r in conn.execute(query, params).fetchall()]
            
        for existing in rows:
            ex_stmt = clean_text(existing.get("problem_statement") or "").lower()
            if ex_stmt and (ex_stmt == stmt or ex_stmt in stmt or stmt in ex_stmt):
                return existing
                
            t1 = tokenize_statement(stmt + " " + (p.get("sufferer_occupation") or ""))
            t2 = tokenize_statement(ex_stmt + " " + (existing.get("sufferer_occupation") or ""))
            if t1 and t2:
                inter = len(t1.intersection(t2))
                union = len(t1.union(t2))
                min_len = min(len(t1), len(t2))
                jaccard = inter / union if union > 0 else 0
                overlap = inter / min_len if min_len > 0 else 0
                if jaccard >= 0.50 or overlap >= 0.70:
                    return existing
                    
        return None

    def add_problem(self, problem_data: Dict[str, Any]) -> Dict[str, Any]:
        p = dict(problem_data)
        sector = p.get("sector") or "Agriculture & Fisheries"
        stmt = clean_text(p.get("problem_statement") or "")
        p["problem_statement"] = stmt
        p["sufferer_occupation"] = clean_text(p.get("sufferer_occupation") or "")
        p["sufferer_location"] = clean_text(p.get("sufferer_location") or "")
        p["workaround"] = clean_text(p.get("workaround") or "")
        p["quantified_impact"] = clean_text(p.get("quantified_impact") or "")
        p["source_detail"] = clean_text(p.get("source_detail") or "")
        raw_id = p.get("id") or p.get("problem_id")

        sources = p.get("sources") or []
        breakdown = calculate_score_breakdown(p, sources)
        score = p.get("score") if p.get("score") is not None else breakdown["total_score"]
        p["score"] = score
        now = datetime.now(timezone.utc).isoformat()

        # 1. If explicit ID provided, check if that ID exists in DB
        existing_by_id = self.get_problem(clean_problem_id(raw_id)) if raw_id else None
        
        # 2. Check semantic overlap if not an explicit custom ID update
        matching_problem = existing_by_id
        if not matching_problem and not raw_id:
            matching_problem = self.find_matching_problem(p)

        if matching_problem:
            target_id = matching_problem["id"]
            if sources:
                self.add_problem_sources(target_id, sources)
            with self._get_connection() as conn:
                conn.execute("""
                    UPDATE problems SET
                        score = max(score, ?),
                        workaround = CASE WHEN length(?) > length(coalesce(workaround, '')) THEN ? ELSE workaround END,
                        quantified_impact = CASE WHEN length(?) > length(coalesce(quantified_impact, '')) THEN ? ELSE quantified_impact END,
                        source_detail = CASE WHEN length(?) > length(coalesce(source_detail, '')) THEN ? ELSE source_detail END,
                        updated_at = ?
                    WHERE id = ?
                """, (
                    score,
                    p["workaround"], p["workaround"],
                    p["quantified_impact"], p["quantified_impact"],
                    p["source_detail"], p["source_detail"],
                    now, target_id
                ))
                claims = p.get("claims") or []
                for c in claims:
                    cid = c.get("id") or f"clm_{uuid.uuid4().hex[:8]}"
                    conn.execute("""
                        INSERT INTO problem_claims (id, problem_id, claim_type, claim_text, status, confidence_score, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            claim_type = excluded.claim_type,
                            claim_text = excluded.claim_text,
                            status = excluded.status
                    """, (cid, target_id, c.get("claim_type") or "FRICTION_REALITY", c.get("claim_text") or "", c.get("status") or "HYPOTHESIS", c.get("confidence_score") or 50.0, now))

                assumptions = p.get("assumptions") or []
                for a in assumptions:
                    aid = a.get("id") or f"asm_{uuid.uuid4().hex[:8]}"
                    conn.execute("""
                        INSERT INTO problem_assumptions (id, problem_id, assumption_text, risk_level, status, origin, testable_question, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            assumption_text = excluded.assumption_text,
                            risk_level = excluded.risk_level,
                            status = excluded.status
                    """, (aid, target_id, a.get("assumption_text") or "", a.get("risk_level") or "HIGH", a.get("status") or "UNTESTED", a.get("origin") or "FOUNDER_INPUT", a.get("testable_question"), now))

            return self.get_problem(target_id) or matching_problem

        # 3. Determine ID: use sanitized explicit ID if given, else assign sequential canonical ID
        if raw_id:
            problem_id = clean_problem_id(raw_id)
        else:
            sector_prefixes = {
                "Agriculture & Fisheries": "AGR",
                "Health & Wellness": "HLT",
                "MSMEs & Retail": "RET",
                "Education & Youth": "EDU",
                "Transport & Logistics": "LOG",
                "Housing & Utilities": "UTL",
                "Government Services & Compliance": "GOV",
                "Finance & Credit": "FIN",
            }
            prefix = sector_prefixes.get(sector, "PRB")
            with self._get_connection() as conn:
                row = conn.execute("SELECT COUNT(*) FROM problems WHERE sector = ?", (sector,)).fetchone()
                count = (row[0] if row else 0) + 1
                problem_id = f"{prefix}-{count:03d}"
                while conn.execute("SELECT id FROM problems WHERE id = ?", (problem_id,)).fetchone():
                    count += 1
                    problem_id = f"{prefix}-{count:03d}"

        evidence_types_json = json.dumps(p.get("evidence_types") or p.get("evidence_type_list") or [])
        tags_json = json.dumps(p.get("tags") or [])
        da_json = json.dumps(p.get("devils_advocate_data")) if p.get("devils_advocate_data") else None

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO problems (
                    id, project_id, session_id, sector, sufferer_occupation,
                    sufferer_location, problem_statement, evidence_tier, workaround,
                    quantified_impact, evidence_types, source, source_detail,
                    tags, status, phase2_verdict, phase3_verdict, notes, score,
                    votes, devils_advocate_data, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    project_id = coalesce(excluded.project_id, problems.project_id),
                    session_id = coalesce(excluded.session_id, problems.session_id),
                    sector = excluded.sector,
                    sufferer_occupation = excluded.sufferer_occupation,
                    sufferer_location = excluded.sufferer_location,
                    problem_statement = excluded.problem_statement,
                    evidence_tier = excluded.evidence_tier,
                    workaround = excluded.workaround,
                    quantified_impact = excluded.quantified_impact,
                    evidence_types = excluded.evidence_types,
                    source = excluded.source,
                    source_detail = excluded.source_detail,
                    tags = excluded.tags,
                    status = excluded.status,
                    phase2_verdict = coalesce(excluded.phase2_verdict, problems.phase2_verdict),
                    phase3_verdict = coalesce(excluded.phase3_verdict, problems.phase3_verdict),
                    notes = coalesce(excluded.notes, problems.notes),
                    score = excluded.score,
                    votes = coalesce(excluded.votes, problems.votes),
                    devils_advocate_data = coalesce(excluded.devils_advocate_data, problems.devils_advocate_data),
                    updated_at = excluded.updated_at
            """, (
                problem_id,
                p.get("project_id"),
                p.get("session_id"),
                sector,
                p["sufferer_occupation"],
                p["sufferer_location"],
                p["problem_statement"],
                p.get("evidence_tier") or "SIGNAL",
                p["workaround"],
                p["quantified_impact"],
                evidence_types_json,
                p.get("source") or "Phase 1 Discovery",
                p["source_detail"],
                tags_json,
                p.get("status") or "discovered",
                p.get("phase2_verdict"),
                p.get("phase3_verdict"),
                p.get("notes") or "",
                score,
                p.get("votes") or 0,
                da_json,
                now,
                now
            ))

        if sources:
            self.add_problem_sources(problem_id, sources)

        # Persist explicit claims if provided
        claims = p.get("claims") or []
        if claims:
            with self._get_connection() as conn:
                for c in claims:
                    cid = c.get("id") or f"clm_{uuid.uuid4().hex[:8]}"
                    conn.execute("""
                        INSERT INTO problem_claims (id, problem_id, claim_type, claim_text, status, confidence_score, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            claim_type = excluded.claim_type,
                            claim_text = excluded.claim_text,
                            status = excluded.status
                    """, (
                        cid,
                        problem_id,
                        c.get("claim_type") or "FRICTION_REALITY",
                        c.get("claim_text") or "",
                        c.get("status") or "HYPOTHESIS",
                        c.get("confidence_score") or 50.0,
                        now
                    ))

        # Persist explicit assumptions if provided
        assumptions = p.get("assumptions") or []
        if assumptions:
            with self._get_connection() as conn:
                for a in assumptions:
                    aid = a.get("id") or f"asm_{uuid.uuid4().hex[:8]}"
                    conn.execute("""
                        INSERT INTO problem_assumptions (id, problem_id, assumption_text, risk_level, status, origin, testable_question, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            assumption_text = excluded.assumption_text,
                            risk_level = excluded.risk_level,
                            status = excluded.status
                    """, (
                        aid,
                        problem_id,
                        a.get("assumption_text") or "",
                        a.get("risk_level") or "HIGH",
                        a.get("status") or "UNTESTED",
                        a.get("origin") or "FOUNDER_INPUT",
                        a.get("testable_question"),
                        now
                    ))

        return self.get_problem(problem_id) or p

    def add_problem_sources(self, problem_id: str, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            for s in sources:
                conn.execute("""
                    INSERT INTO problem_sources (
                        problem_id, source_name, source_url, source_tier, evidence_type, quote_or_summary
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    problem_id,
                    s.get("source_name") or s.get("description") or "Source",
                    s.get("source_url") or s.get("url"),
                    s.get("source_tier") or "B",
                    s.get("evidence_type") or "Reference",
                    s.get("quote_or_summary") or ""
                ))
        p = self.get_problem(problem_id)
        return p.get("sources", []) if p else []


    def seed_starter_problems(self, project_id: str) -> List[Dict[str, Any]]:
        """Clones the 15 canonical seed problems into a specific project workspace."""
        with self._connect() as conn:
            cursor = conn.execute("SELECT * FROM problems WHERE project_id IS NULL OR project_id = 'default_proj'")
            rows = [dict(r) for r in cursor.fetchall()]
            
            inserted = []
            for r in rows:
                new_id = f"{r['id']}-{project_id[-4:]}" if r.get('id') else None
                try:
                    conn.execute("""
                        INSERT INTO problems (
                            id, project_id, session_id, sector, sufferer_occupation, sufferer_location,
                            problem_statement, evidence_tier, workaround, quantified_impact,
                            frequency, annual_economic_loss, source, created_by
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        new_id, project_id, None, r.get('sector'), r.get('sufferer_occupation'), r.get('sufferer_location'),
                        r.get('problem_statement'), r.get('evidence_tier'), r.get('workaround'), r.get('quantified_impact'),
                        r.get('frequency'), r.get('annual_economic_loss'), 'seed_clone', 'System'
                    ))
                    inserted.append(self.get_problem(new_id))
                except Exception:
                    pass
            conn.commit()
            return inserted

    def get_problem(self, problem_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,)).fetchone()
            if not row:
                return None
            p = dict(row)
            try:
                p["evidence_types"] = json.loads(p.get("evidence_types") or "[]")
            except Exception:
                p["evidence_types"] = []
            try:
                p["tags"] = json.loads(p.get("tags") or "[]")
            except Exception:
                p["tags"] = []
            try:
                p["devils_advocate_data"] = json.loads(p.get("devils_advocate_data") or "null")
            except Exception:
                p["devils_advocate_data"] = None

            sources = conn.execute(
                "SELECT * FROM problem_sources WHERE problem_id = ? ORDER BY id ASC",
                (problem_id,)
            ).fetchall()
            p["sources"] = [dict(s) for s in sources]
            p["score_breakdown"] = calculate_score_breakdown(p, p["sources"])

            history_rows = conn.execute(
                "SELECT * FROM problem_phase_history WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,)
            ).fetchall()
            p["phase_history"] = [dict(h) for h in history_rows]

            comment_rows = conn.execute(
                "SELECT * FROM problem_comments WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,)
            ).fetchall()
            p["comments"] = [dict(c) for c in comment_rows]

            claim_rows = conn.execute(
                "SELECT * FROM problem_claims WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,)
            ).fetchall()
            p["claims"] = [dict(c) for c in claim_rows]

            assumption_rows = conn.execute(
                "SELECT * FROM problem_assumptions WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,)
            ).fetchall()
            p["assumptions"] = [dict(a) for a in assumption_rows]

            return p

    def list_problems(
        self,
        project_id: Optional[str] = None,
        session_id: Optional[str] = None,
        sector: Optional[str] = None,
        evidence_tier: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        query = "SELECT * FROM problems WHERE 1=1"
        params: List[Any] = []

        if project_id:
            if project_id == "default_proj":
                query += " AND (project_id = ? OR project_id IS NULL)"
            else:
                query += " AND project_id = ?"
            params.append(project_id)
        if session_id:
            query += " AND (session_id = ? OR session_id IS NULL)"
            params.append(session_id)
        if sector and sector != "All":
            query += " AND sector = ?"
            params.append(sector)
        if evidence_tier and evidence_tier != "All":
            query += " AND evidence_tier = ?"
            params.append(evidence_tier)
        if status and status != "All":
            query += " AND status = ?"
            params.append(status)
        if search and search.strip():
            like_term = f"%{search.strip()}%"
            query += " AND (problem_statement LIKE ? OR sufferer_occupation LIKE ? OR sufferer_location LIKE ? OR notes LIKE ? OR id LIKE ?)"
            params.extend([like_term, like_term, like_term, like_term, like_term])

        query += " ORDER BY votes DESC, score DESC, updated_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        with self._get_connection() as conn:
            rows = conn.execute(query, params).fetchall()
            results = []
            for row in rows:
                p = dict(row)
                try:
                    p["evidence_types"] = json.loads(p.get("evidence_types") or "[]")
                except Exception:
                    p["evidence_types"] = []
                try:
                    p["tags"] = json.loads(p.get("tags") or "[]")
                except Exception:
                    p["tags"] = []
                try:
                    p["devils_advocate_data"] = json.loads(p.get("devils_advocate_data") or "null")
                except Exception:
                    p["devils_advocate_data"] = None

                sources = conn.execute(
                    "SELECT id, source_name, source_url, source_tier, evidence_type, quote_or_summary FROM problem_sources WHERE problem_id = ?",
                    (p["id"],)
                ).fetchall()
                p["sources"] = [dict(s) for s in sources]
                results.append(p)
            return results

    def update_problem(self, problem_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        existing = self.get_problem(problem_id)
        if not existing:
            return None

        allowed_fields = [
            "sector", "sufferer_occupation", "sufferer_location", "problem_statement",
            "evidence_tier", "workaround", "quantified_impact", "evidence_types",
            "source", "source_detail", "tags", "status", "phase2_verdict", "phase3_verdict",
            "notes", "score", "votes", "devils_advocate_data", "project_id"
        ]

        set_clauses = []
        params = []

        for field in allowed_fields:
            if field in updates:
                val = updates[field]
                if field in ("evidence_types", "tags", "devils_advocate_data") and not isinstance(val, str) and val is not None:
                    val = json.dumps(val)
                set_clauses.append(f"{field} = ?")
                params.append(val)

        if "sources" in updates:
            sources = updates["sources"]
            with self._get_connection() as conn:
                conn.execute("DELETE FROM problem_sources WHERE problem_id = ?", (problem_id,))
                for s in sources:
                    conn.execute("""
                        INSERT INTO problem_sources (
                            problem_id, source_name, source_url, source_tier, evidence_type, quote_or_summary
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        problem_id,
                        s.get("source_name") or s.get("description") or "Source",
                        s.get("source_url") or s.get("url"),
                        s.get("source_tier") or "B",
                        s.get("evidence_type") or "Reference",
                        s.get("quote_or_summary") or ""
                    ))
            merged = {**existing, **updates}
            breakdown = calculate_score_breakdown(merged, sources)
            set_clauses.append("score = ?")
            params.append(breakdown["total_score"])

        if set_clauses:
            now = datetime.now(timezone.utc).isoformat()
            set_clauses.append("updated_at = ?")
            params.append(now)
            params.append(problem_id)

            with self._get_connection() as conn:
                conn.execute(
                    f"UPDATE problems SET {', '.join(set_clauses)} WHERE id = ?",
                    params
                )

        return self.get_problem(problem_id)

    def delete_problem(self, problem_id: str) -> bool:
        with self._get_connection() as conn:
            cur = conn.execute("DELETE FROM problems WHERE id = ?", (problem_id,))
            return cur.rowcount > 0

    def record_problem_history(
        self,
        problem_id: str,
        phase_number: int,
        action: str,
        verdict: Optional[str] = None,
        llm_response: Optional[str] = None,
        model_used: Optional[str] = None
    ) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO problem_phase_history (
                    problem_id, phase_number, action, verdict, llm_response, model_used
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (problem_id, phase_number, action, verdict, llm_response, model_used))
            history_id = cur.lastrowid
            return {
                "id": history_id,
                "problem_id": problem_id,
                "phase_number": phase_number,
                "action": action,
                "verdict": verdict,
                "model_used": model_used,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

    def bulk_upsert_problems(self, problems: List[Dict[str, Any]]) -> Dict[str, Any]:
        results = []
        created_ids = []
        merged_ids = []
        for p in problems:
            raw_id = p.get("id") or p.get("problem_id")
            existing_by_id = self.get_problem(clean_problem_id(raw_id)) if raw_id else None
            matching = existing_by_id or self.find_matching_problem(p)
            
            res = self.add_problem(p)
            results.append(res)
            
            if matching:
                merged_ids.append(res["id"])
            else:
                created_ids.append(res["id"])
                
        return {
            "problems": results,
            "created_ids": created_ids,
            "merged_ids": merged_ids,
            "total_count": len(results),
            "new_created_count": len(created_ids),
            "merged_count": len(merged_ids),
        }

    def vote_problem(self, problem_id: str, vote_type: str = "up") -> Dict[str, Any]:
        delta = 1 if vote_type == "up" else -1
        with self._get_connection() as conn:
            conn.execute("UPDATE problems SET votes = max(0, coalesce(votes, 0) + ?) WHERE id = ?", (delta, problem_id))
        p = self.get_problem(problem_id)
        return p or {"id": problem_id, "votes": 0}


    def normalize_problem_ids(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Re-indexes all problem IDs into clean sequential codes: AGR-001, HLT-001, RET-001, etc."""
        sector_prefixes = {
            "Agriculture & Fisheries": "AGR",
            "Health & Wellness": "HLT",
            "MSMEs & Retail": "RET",
            "Education & Youth": "EDU",
            "Transport & Logistics": "LOG",
            "Housing & Utilities": "UTL",
            "Government Services & Compliance": "GOV",
            "Finance & Credit": "FIN",
        }
        
        with self._get_connection() as conn:
            conn.execute("PRAGMA foreign_keys = OFF;")
            query = "SELECT * FROM problems"
            params = []
            if project_id:
                query += " WHERE project_id = ?"
                params.append(project_id)
            query += " ORDER BY sector ASC, score DESC, votes DESC, id ASC"
            
            rows = [dict(r) for r in conn.execute(query, params).fetchall()]
            
            sector_counters: Dict[str, int] = {}
            id_mapping: Dict[str, str] = {}
            
            # Temporary prefix to avoid unique constraint collisions during rename
            temp_prefix = f"TEMP_{uuid.uuid4().hex[:4]}_"
            for r in rows:
                conn.execute("UPDATE problems SET id = ? WHERE id = ?", (temp_prefix + r["id"], r["id"]))
                conn.execute("UPDATE problem_sources SET problem_id = ? WHERE problem_id = ?", (temp_prefix + r["id"], r["id"]))
                conn.execute("UPDATE problem_comments SET problem_id = ? WHERE problem_id = ?", (temp_prefix + r["id"], r["id"]))
                conn.execute("UPDATE problem_phase_history SET problem_id = ? WHERE problem_id = ?", (temp_prefix + r["id"], r["id"]))
            
            # Now assign clean permanent sequential IDs
            for r in rows:
                old_id = r["id"]
                temp_id = temp_prefix + old_id
                sec = r["sector"]
                prefix = sector_prefixes.get(sec, "PRB")
                count = sector_counters.get(sec, 0) + 1
                sector_counters[sec] = count
                new_id = f"{prefix}-{count:03d}"
                id_mapping[old_id] = new_id
                
                conn.execute("UPDATE problems SET id = ? WHERE id = ?", (new_id, temp_id))
                conn.execute("UPDATE problem_sources SET problem_id = ? WHERE problem_id = ?", (new_id, temp_id))
                conn.execute("UPDATE problem_comments SET problem_id = ? WHERE problem_id = ?", (new_id, temp_id))
                conn.execute("UPDATE problem_phase_history SET problem_id = ? WHERE problem_id = ?", (new_id, temp_id))
            
            conn.commit()
            
        return self.list_problems(project_id=project_id)

    def merge_problems(self, primary_id: str, duplicate_ids: List[str]) -> Optional[Dict[str, Any]]:
        """Merges multiple duplicate problems into a primary problem record."""
        clean_primary = clean_problem_id(primary_id)
        clean_dups = [clean_problem_id(d) for d in duplicate_ids if clean_problem_id(d) != clean_primary]
        
        if not clean_dups:
            return self.get_problem(clean_primary)
            
        primary = self.get_problem(clean_primary)
        if not primary:
            return None
            
        total_votes = primary.get("votes", 0)
        combined_sources = list(primary.get("sources", []))
        existing_urls = {s.get("source_url") for s in combined_sources if s.get("source_url")}
        
        with self._get_connection() as conn:
            for dup_id in clean_dups:
                dup = self.get_problem(dup_id)
                if not dup:
                    continue
                total_votes += dup.get("votes", 0)
                
                # Merge sources
                for s in dup.get("sources", []):
                    url = s.get("source_url")
                    if not url or url not in existing_urls:
                        combined_sources.append(s)
                        if url:
                            existing_urls.add(url)
                        conn.execute("""
                            INSERT INTO problem_sources (problem_id, source_name, source_type, source_url, notes, tier)
                            VALUES (?, ?, ?, ?, ?, ?)
                        """, (clean_primary, s.get("source_name", "Cited Source"), s.get("source_type", "FIELD_NOTE"), s.get("source_url", ""), s.get("notes", ""), s.get("tier", "SIGNAL")))
                
                # Move comments
                conn.execute("UPDATE problem_comments SET problem_id = ? WHERE problem_id = ?", (clean_primary, dup_id))
                
                # Delete duplicate record
                conn.execute("DELETE FROM problems WHERE id = ?", (dup_id,))
                conn.execute("DELETE FROM problem_sources WHERE problem_id = ?", (dup_id,))
            
            # Update primary votes and updated_at
            now = datetime.now(timezone.utc).isoformat()
            conn.execute("UPDATE problems SET votes = ?, updated_at = ? WHERE id = ?", (total_votes, now, clean_primary))
            conn.commit()
            
        return self.get_problem(clean_primary)

    def bulk_delete_problems(self, problem_ids: List[str]) -> int:
        """Bulk deletes problems and their associated sources."""
        clean_ids = [clean_problem_id(pid) for pid in problem_ids]
        if not clean_ids:
            return 0
            
        with self._get_connection() as conn:
            placeholders = ",".join("?" for _ in clean_ids)
            cur = conn.execute(f"DELETE FROM problems WHERE id IN ({placeholders})", clean_ids)
            conn.execute(f"DELETE FROM problem_sources WHERE problem_id IN ({placeholders})", clean_ids)
            conn.commit()
            return cur.rowcount


    def find_duplicates(self, project_id: Optional[str] = None, threshold: float = 0.5) -> List[Dict[str, Any]]:
        """Detects pairs of duplicate or highly overlapping problem records."""
        problems = self.list_problems(project_id=project_id)
        
        def tokenize(text: str) -> set:
            if not text:
                return set()
            words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
            stops = {"and", "the", "for", "with", "due", "causes", "lack", "from", "into", "their", "that", "this", "during", "requiring", "leads", "across", "severe"}
            return {w for w in words if w not in stops}

        pairs = []
        for i in range(len(problems)):
            for j in range(i + 1, len(problems)):
                p1 = problems[i]
                p2 = problems[j]
                
                # Check exact statement match
                exact = p1.get("problem_statement", "").strip().lower() == p2.get("problem_statement", "").strip().lower()
                
                t1 = tokenize(p1.get("problem_statement", "") + " " + (p1.get("sufferer_occupation") or ""))
                t2 = tokenize(p2.get("problem_statement", "") + " " + (p2.get("sufferer_occupation") or ""))
                
                if exact:
                    sim = 1.0
                elif not t1 or not t2:
                    sim = 0.0
                else:
                    inter = len(t1.intersection(t2))
                    union = len(t1.union(t2))
                    sim = inter / union if union > 0 else 0.0
                    if p1.get("sector") == p2.get("sector"):
                        sim += 0.15
                        
                sim = min(round(sim, 2), 1.0)
                
                if sim >= threshold or exact:
                    # Choose primary (higher score or more votes)
                    p1_score = (p1.get("score") or 0) + (p1.get("votes") or 0) * 10
                    p2_score = (p2.get("score") or 0) + (p2.get("votes") or 0) * 10
                    primary = p1 if p1_score >= p2_score else p2
                    duplicate = p2 if primary == p1 else p1
                    
                    pairs.append({
                        "primary_id": primary["id"],
                        "duplicate_id": duplicate["id"],
                        "primary_statement": primary["problem_statement"],
                        "duplicate_statement": duplicate["problem_statement"],
                        "sector": primary["sector"],
                        "similarity_score": int(sim * 100),
                        "is_exact_match": exact or sim >= 0.90
                    })
                    
        return pairs

    def auto_merge_exact_duplicates(self, project_id: Optional[str] = None) -> int:
        """Automatically merges all 90%+ and 100% exact duplicate problem records."""
        dups = self.find_duplicates(project_id=project_id, threshold=0.85)
        merged_count = 0
        seen_deleted = set()
        
        for d in dups:
            dup_id = d["duplicate_id"]
            primary_id = d["primary_id"]
            if dup_id in seen_deleted or primary_id in seen_deleted:
                continue
            self.merge_problems(primary_id, [dup_id])
            seen_deleted.add(dup_id)
            merged_count += 1
            
        return merged_count

    # ------------------------------------------------------------------------
    # Relational Knowledge Graph Methods (Step 1 Foundation)
    # ------------------------------------------------------------------------

    def get_problem_knowledge_graph(self, problem_id: str) -> Dict[str, Any]:
        """Retrieve complete relational knowledge graph for a problem."""
        problem = self.get_problem(problem_id)
        if not problem:
            return {}

        with self._get_connection() as conn:
            claims = [
                dict(r) for r in conn.execute(
                    "SELECT * FROM problem_claims WHERE problem_id = ? ORDER BY created_at ASC", (problem_id,)
                ).fetchall()
            ]
            assumptions = [
                dict(r) for r in conn.execute(
                    "SELECT * FROM problem_assumptions WHERE problem_id = ? ORDER BY CASE risk_level WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, created_at ASC", (problem_id,)
                ).fetchall()
            ]
            alternatives = [
                dict(r) for r in conn.execute(
                    "SELECT * FROM problem_alternatives WHERE problem_id = ? ORDER BY created_at ASC", (problem_id,)
                ).fetchall()
            ]

        return {
            "problem": problem,
            "claims": claims,
            "assumptions": assumptions,
            "alternatives": alternatives,
            "sources": problem.get("sources", []),
        }

    def set_problem_claims(self, problem_id: str, claims: List[Dict[str, Any]]):
        """Save or replace claims for a problem."""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM problem_claims WHERE problem_id = ?", (problem_id,))
            for idx, c in enumerate(claims, 1):
                cid = c.get("id") or f"CLM-{problem_id}-{idx}"
                conn.execute(
                    """INSERT INTO problem_claims (id, problem_id, claim_type, claim_text, status, confidence_score, mode, evidence_notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        cid,
                        problem_id,
                        c.get("claim_type", "FRICTION_REALITY"),
                        c.get("claim_text", ""),
                        c.get("status", "HYPOTHESIS"),
                        c.get("confidence_score", 50.0),
                        c.get("mode", "COMMERCIAL"),
                        c.get("evidence_notes", ""),
                    )
                )

    def set_problem_assumptions(self, problem_id: str, assumptions: List[Dict[str, Any]]):
        """Save or replace assumptions for a problem."""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM problem_assumptions WHERE problem_id = ?", (problem_id,))
            for idx, a in enumerate(assumptions, 1):
                aid = a.get("id") or f"ASM-{problem_id}-{idx}"
                conn.execute(
                    """INSERT INTO problem_assumptions (id, problem_id, assumption_text, risk_level, status, origin, testable_question)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (
                        aid,
                        problem_id,
                        a.get("assumption_text", ""),
                        a.get("risk_level", "HIGH"),
                        a.get("status", "UNTESTED"),
                        a.get("origin", "DEVILS_ADVOCATE"),
                        a.get("testable_question", ""),
                    )
                )

    def set_problem_alternatives(self, problem_id: str, alternatives: List[Dict[str, Any]]):
        """Save or replace alternatives for a problem."""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM problem_alternatives WHERE problem_id = ?", (problem_id,))
            for idx, alt in enumerate(alternatives, 1):
                alt_id = alt.get("id") or f"ALT-{problem_id}-{idx}"
                conn.execute(
                    """INSERT INTO problem_alternatives (id, problem_id, alternative_name, category, why_it_fails)
                       VALUES (?, ?, ?, ?, ?)""",
                    (
                        alt_id,
                        problem_id,
                        alt.get("alternative_name", ""),
                        alt.get("category", "MANUAL_WORKAROUND"),
                        alt.get("why_it_fails", ""),
                    )
                )

    def update_claim_status(self, claim_id: str, status: str, confidence_score: Optional[float] = None, evidence_notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Update claim validation status and confidence."""
        with self._get_connection() as conn:
            set_clauses = ["status = ?"]
            params = [status]
            if confidence_score is not None:
                set_clauses.append("confidence_score = ?")
                params.append(confidence_score)
            if evidence_notes is not None:
                set_clauses.append("evidence_notes = ?")
                params.append(evidence_notes)
            params.append(claim_id)

            conn.execute(f"UPDATE problem_claims SET {', '.join(set_clauses)} WHERE id = ?", params)
            row = conn.execute("SELECT * FROM problem_claims WHERE id = ?", (claim_id,)).fetchone()
            return dict(row) if row else None

    def update_assumption_status(self, assumption_id: str, status: str) -> Optional[Dict[str, Any]]:
        """Update assumption test status."""
        with self._get_connection() as conn:
            conn.execute("UPDATE problem_assumptions SET status = ? WHERE id = ?", (status, assumption_id))
            row = conn.execute("SELECT * FROM problem_assumptions WHERE id = ?", (assumption_id,)).fetchone()
            return dict(row) if row else None

    # ------------------------------------------------------------------------
    # Decision Intelligence & Audit Trail (Step 2 Foundation)
    # ------------------------------------------------------------------------

    def create_decision_record(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an immutable decision audit record."""
        import uuid
        did = data.get("id") or f"DEC-{str(uuid.uuid4())[:8].upper()}"
        rejected = data.get("rejected_problem_ids", [])
        if not isinstance(rejected, str):
            rejected = json.dumps(rejected)

        evidence = data.get("supporting_evidence_ids", [])
        if not isinstance(evidence, str):
            evidence = json.dumps(evidence)

        with self._get_connection() as conn:
            conn.execute(
                """INSERT INTO decision_records 
                   (id, session_id, stage, selected_problem_id, rejected_problem_ids, decision_rationale, supporting_evidence_ids)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    did,
                    data.get("session_id"),
                    data.get("stage", "PHASE_2_SELECTION"),
                    data.get("selected_problem_id", ""),
                    rejected,
                    data.get("decision_rationale", ""),
                    evidence,
                )
            )
            row = conn.execute("SELECT * FROM decision_records WHERE id = ?", (did,)).fetchone()
            return dict(row) if row else {}

    def list_decision_records(self, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List chronological decision records for a session or global workspace."""
        with self._get_connection() as conn:
            query = "SELECT * FROM decision_records"
            params = []
            if session_id:
                query += " WHERE session_id = ? OR session_id IS NULL"
                params.append(session_id)
            query += " ORDER BY created_at DESC"
            rows = conn.execute(query, params).fetchall()
            results = []
            for r in rows:
                item = dict(r)
                if isinstance(item.get("rejected_problem_ids"), str):
                    try:
                        item["rejected_problem_ids"] = json.loads(item["rejected_problem_ids"])
                    except Exception:
                        pass
                if isinstance(item.get("supporting_evidence_ids"), str):
                    try:
                        item["supporting_evidence_ids"] = json.loads(item["supporting_evidence_ids"])
                    except Exception:
                        pass
                results.append(item)
            return results


    def switch_session_framework(self, session_id: str, framework_id: str) -> Optional[Dict[str, Any]]:
        """Switch the active framework methodology for a session under controlled transition conditions (CCDS Rule 1-5)."""
        session_data = self.get_session(session_id)
        if not session_data:
            return None
        
        old_framework = session_data.get("framework_id", "INNOVATION").upper()
        new_framework = framework_id.upper()
        
        if old_framework == new_framework:
            return session_data

        # 1. Create automatic point-in-time transition snapshot for rollback safety (Rule 2)
        try:
            self.create_snapshot(
                session_id=session_id,
                label=f"Pre-transition snapshot ({old_framework} -> {new_framework})",
                phase_number=session_data.get("active_phase", 1)
            )
        except Exception as e:
            logger.warning(f"Could not create transition snapshot for {session_id}: {e}")

        # 2. Preserve and isolate framework-specific progress (Rule 4: Never manufacture progress)
        framework_progress = session_data.get("framework_progress", {})
        if not isinstance(framework_progress, dict):
            framework_progress = {}
        
        # Save current framework's progress
        framework_progress[old_framework] = {
            "phase1_complete": bool(session_data.get("phase1_complete")),
            "phase2_complete": bool(session_data.get("phase2_complete")),
            "phase3_complete": bool(session_data.get("phase3_complete")),
            "phase4_complete": bool(session_data.get("phase4_complete")),
            "phase5_complete": bool(session_data.get("phase5_complete")),
        }
        
        # Load new framework's progress if previously tracked, otherwise initialize fresh for new methodology
        new_prog = framework_progress.get(new_framework, {
            "phase1_complete": False,
            "phase2_complete": False,
            "phase3_complete": False,
            "phase4_complete": False,
            "phase5_complete": False,
        })
        
        session_data["framework_id"] = new_framework
        session_data["framework_progress"] = framework_progress
        session_data["phase1_complete"] = new_prog.get("phase1_complete", False)
        session_data["phase2_complete"] = new_prog.get("phase2_complete", False)
        session_data["phase3_complete"] = new_prog.get("phase3_complete", False)
        session_data["phase4_complete"] = new_prog.get("phase4_complete", False)
        session_data["phase5_complete"] = new_prog.get("phase5_complete", False)

        return self.save_session(session_id, session_data)

    # Phase 6: Knowledge Intelligence & Epistemic Link Storage Methods
    # ------------------------------------------------------------------

    def link_claim_evidence(
        self,
        claim_id: str,
        source_id: int,
        relation_type: str = "SUPPORTS",
        evidence_strength: str = "STRONG",
        rationale: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Link a source to a claim as supporting, contradicting, or contextualizing."""
        link_id = f"link_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO claim_evidence_links (id, claim_id, source_id, relation_type, evidence_strength, rationale, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (link_id, claim_id, source_id, relation_type.upper(), evidence_strength.upper(), rationale, now),
            )
        return {
            "id": link_id,
            "claim_id": claim_id,
            "source_id": source_id,
            "relation_type": relation_type.upper(),
            "evidence_strength": evidence_strength.upper(),
            "rationale": rationale,
            "created_at": now,
        }

    def list_claim_evidence_links(
        self, claim_id: Optional[str] = None, problem_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List all epistemic links for a claim or across all claims of a problem."""
        with self._get_connection() as conn:
            if claim_id:
                rows = conn.execute(
                    """
                    SELECT l.*, s.source_name, s.source_url, s.source_tier, s.quote_or_summary
                    FROM claim_evidence_links l
                    LEFT JOIN problem_sources s ON l.source_id = s.id
                    WHERE l.claim_id = ?
                    ORDER BY l.created_at DESC
                    """,
                    (claim_id,),
                ).fetchall()
            elif problem_id:
                rows = conn.execute(
                    """
                    SELECT l.*, s.source_name, s.source_url, s.source_tier, s.quote_or_summary, c.claim_text, c.claim_type
                    FROM claim_evidence_links l
                    JOIN problem_claims c ON l.claim_id = c.id
                    LEFT JOIN problem_sources s ON l.source_id = s.id
                    WHERE c.problem_id = ?
                    ORDER BY l.created_at DESC
                    """,
                    (problem_id,),
                ).fetchall()
            else:
                rows = conn.execute("""
                    SELECT l.*, s.source_name, s.source_url, s.source_tier
                    FROM claim_evidence_links l
                    LEFT JOIN problem_sources s ON l.source_id = s.id
                    ORDER BY l.created_at DESC
                """).fetchall()
            return [dict(r) for r in rows]

    def delete_claim_evidence_link(self, link_id: str) -> bool:
        """Delete an epistemic link."""
        with self._get_connection() as conn:
            cur = conn.execute("DELETE FROM claim_evidence_links WHERE id = ?", (link_id,))
            return cur.rowcount > 0

    def record_assumption_test(
        self,
        assumption_id: str,
        test_type: str,
        target_metric: str,
        actual_result: Optional[str] = None,
        test_status: str = "PLANNED",
        conducted_by: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Record an empirical test experiment on an assumption."""
        test_id = f"test_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO assumption_validation_tests (
                    id, assumption_id, test_type, target_metric, actual_result, test_status, conducted_by, completed_at, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    test_id,
                    assumption_id,
                    test_type.upper(),
                    target_metric,
                    actual_result,
                    test_status.upper(),
                    conducted_by,
                    now if test_status.upper() in ["PASSED", "FAILED"] else None,
                    now,
                ),
            )
            # If test is PASSED or FAILED, update the assumption status directly
            if test_status.upper() == "PASSED":
                conn.execute(
                    "UPDATE problem_assumptions SET status = 'VALIDATED' WHERE id = ?",
                    (assumption_id,),
                )
            elif test_status.upper() == "FAILED":
                conn.execute(
                    "UPDATE problem_assumptions SET status = 'FALSIFIED', risk_level = 'CRITICAL' WHERE id = ?",
                    (assumption_id,),
                )
            elif test_status.upper() == "IN_PROGRESS":
                conn.execute(
                    "UPDATE problem_assumptions SET status = 'IN_TESTING' WHERE id = ?",
                    (assumption_id,),
                )

        return {
            "id": test_id,
            "assumption_id": assumption_id,
            "test_type": test_type.upper(),
            "target_metric": target_metric,
            "actual_result": actual_result,
            "test_status": test_status.upper(),
            "conducted_by": conducted_by,
            "created_at": now,
        }

    def list_assumption_tests(self, assumption_id: str) -> List[Dict[str, Any]]:
        """List validation experiments for an assumption."""
        with self._get_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM assumption_validation_tests WHERE assumption_id = ? ORDER BY created_at DESC",
                (assumption_id,),
            ).fetchall()
            return [dict(r) for r in rows]

    def record_impact_event(
        self,
        trigger_entity_type: str,
        trigger_entity_id: str,
        trigger_action: str,
        affected_entities: List[Dict[str, Any]],
        project_id: Optional[str] = None,
        session_id: Optional[str] = None,
        severity: str = "WARNING",
    ) -> Dict[str, Any]:
        """Log an impact propagation invalidation event."""
        event_id = f"evt_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        affected_json = json.dumps(affected_entities, ensure_ascii=False)
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO impact_invalidation_events (
                    id, project_id, session_id, trigger_entity_type, trigger_entity_id, trigger_action, severity, affected_entities, resolution_status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE_ALERT', ?)
                """,
                (
                    event_id,
                    project_id,
                    session_id,
                    trigger_entity_type.upper(),
                    trigger_entity_id,
                    trigger_action.upper(),
                    severity.upper(),
                    affected_json,
                    now,
                ),
            )
        return {
            "id": event_id,
            "project_id": project_id,
            "session_id": session_id,
            "trigger_entity_type": trigger_entity_type.upper(),
            "trigger_entity_id": trigger_entity_id,
            "trigger_action": trigger_action.upper(),
            "severity": severity.upper(),
            "affected_entities": affected_entities,
            "resolution_status": "ACTIVE_ALERT",
            "created_at": now,
        }

    def list_active_impact_alerts(
        self, project_id: Optional[str] = None, session_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List active invalidation alerts for a session or project."""
        with self._get_connection() as conn:
            query = "SELECT * FROM impact_invalidation_events WHERE resolution_status = 'ACTIVE_ALERT'"
            params = []
            if project_id:
                query += " AND (project_id = ? OR project_id IS NULL)"
                params.append(project_id)
            if session_id:
                query += " AND (session_id = ? OR session_id IS NULL)"
                params.append(session_id)
            query += " ORDER BY created_at DESC"
            rows = conn.execute(query, params).fetchall()
            results = []
            for r in rows:
                item = dict(r)
                if isinstance(item.get("affected_entities"), str):
                    try:
                        item["affected_entities"] = json.loads(item["affected_entities"])
                    except Exception:
                        pass
                results.append(item)
            return results

    def resolve_impact_event(
        self, event_id: str, resolution_status: str = "RESOLVED_BY_PIVOT"
    ) -> bool:
        """Acknowledge or resolve an impact invalidation alert."""
        with self._get_connection() as conn:
            cur = conn.execute(
                "UPDATE impact_invalidation_events SET resolution_status = ? WHERE id = ?",
                (resolution_status.upper(), event_id),
            )
            return cur.rowcount > 0

    # -----------------------------------------------------------------------
    # First-Class Provenance, Contradictions, Unknowns, and Traceability
    # -----------------------------------------------------------------------
    def record_provenance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        prov_id = data.get("id") or f"prov_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO evidence_provenance 
                (id, source_id, connector, original_identifier, retrieval_timestamp, 
                 extraction_model, extraction_prompt_hash, human_verification_state, superseded_by_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    prov_id,
                    data.get("source_id", ""),
                    data.get("connector", "manual"),
                    data.get("original_identifier"),
                    data.get("retrieval_timestamp") or now,
                    data.get("extraction_model"),
                    data.get("extraction_prompt_hash"),
                    data.get("human_verification_state", "UNVERIFIED"),
                    data.get("superseded_by_id"),
                    now
                )
            )
        data["id"] = prov_id
        data["created_at"] = now
        return data

    def get_provenance(self, source_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM evidence_provenance WHERE source_id = ? OR id = ?",
                (source_id, source_id)
            ).fetchone()
            return dict(row) if row else None

    def list_assumptions(self, problem_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            if problem_id:
                rows = conn.execute("SELECT * FROM problem_assumptions WHERE problem_id = ?", (problem_id,)).fetchall()
            else:
                rows = conn.execute("SELECT * FROM problem_assumptions").fetchall()
            return [dict(r) for r in rows]

    def record_contradiction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        contra_id = data.get("id") or f"contra_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO claim_contradictions 
                (id, claim_id, supporting_evidence_id, contradicting_evidence_id, status, investigation_notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    contra_id,
                    data.get("claim_id", ""),
                    data.get("supporting_evidence_id", ""),
                    data.get("contradicting_evidence_id", ""),
                    data.get("status", "CONTESTED"),
                    data.get("investigation_notes", ""),
                    now,
                    now
                )
            )
            # Update claim status to CONTESTED if not resolved
            conn.execute(
                "UPDATE problem_claims SET status = 'CONTESTED' WHERE id = ?",
                (data.get("claim_id", ""),)
            )
        data["id"] = contra_id
        data["created_at"] = now
        data["updated_at"] = now
        return data

    def list_contradictions(self, claim_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            if claim_id:
                rows = conn.execute(
                    "SELECT * FROM claim_contradictions WHERE claim_id = ? ORDER BY created_at DESC",
                    (claim_id,)
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM claim_contradictions ORDER BY created_at DESC"
                ).fetchall()
            return [dict(r) for r in rows]

    def add_unknown(self, data: Dict[str, Any]) -> Dict[str, Any]:
        unk_id = data.get("id") or f"unk_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO project_unknowns
                (id, project_id, session_id, category, statement, risk_level, linked_claim_id, linked_assumption_id, resolution_test_id, is_resolved, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    unk_id,
                    data.get("project_id", "default_proj"),
                    data.get("session_id"),
                    data.get("category", "WHAT_WE_THINK"),
                    data.get("statement", ""),
                    data.get("risk_level", "MEDIUM"),
                    data.get("linked_claim_id"),
                    data.get("linked_assumption_id"),
                    data.get("resolution_test_id"),
                    1 if data.get("is_resolved") else 0,
                    now,
                    now
                )
            )
        data["id"] = unk_id
        data["created_at"] = now
        data["updated_at"] = now
        return data

    def list_unknowns(self, project_id: Optional[str] = None, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = "SELECT * FROM project_unknowns WHERE 1=1"
        params: List[Any] = []
        if project_id:
            query += " AND (project_id = ? OR project_id = 'default_proj')"
            params.append(project_id)
        if session_id:
            query += " AND (session_id = ? OR session_id IS NULL)"
            params.append(session_id)
        query += " ORDER BY is_resolved ASC, created_at DESC"

        with self._get_connection() as conn:
            rows = conn.execute(query, tuple(params)).fetchall()
            return [dict(r) for r in rows]

    def add_traceability_link(self, data: Dict[str, Any]) -> Dict[str, Any]:
        trace_id = data.get("id") or f"trc_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO requirements_traceability
                (id, requirement_id, requirement_text, category, linked_decision_id, linked_assumption_id, linked_claim_id, linked_evidence_id, linked_problem_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    trace_id,
                    data.get("requirement_id", "REQ-01"),
                    data.get("requirement_text", ""),
                    data.get("category", "FUNCTIONAL"),
                    data.get("linked_decision_id"),
                    data.get("linked_assumption_id"),
                    data.get("linked_claim_id"),
                    data.get("linked_evidence_id"),
                    data.get("linked_problem_id"),
                    now
                )
            )
        data["id"] = trace_id
        data["created_at"] = now
        return data

    def get_traceability_lineage(self, requirement_id: Optional[str] = None, problem_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = "SELECT * FROM requirements_traceability WHERE 1=1"
        params: List[Any] = []
        if requirement_id:
            query += " AND requirement_id = ?"
            params.append(requirement_id)
        if problem_id:
            query += " AND linked_problem_id = ?"
            params.append(problem_id)
        query += " ORDER BY created_at DESC"

        with self._get_connection() as conn:
            rows = conn.execute(query, tuple(params)).fetchall()
            return [dict(r) for r in rows]

    def record_gate_review(self, data: Dict[str, Any]) -> Dict[str, Any]:
        rev_id = data.get("id") or f"gate_rev_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        rubric_json = json.dumps(data.get("rubric_scores") or {})
        passed_json = json.dumps(data.get("passed_criteria") or [])
        failed_json = json.dumps(data.get("failed_criteria") or [])

        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO gate_reviews
                (id, project_id, session_id, gate_id, gate_name, verdict, overall_score, rubric_scores, reviewer_role, reviewer_feedback, passed_criteria, failed_criteria, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    verdict = excluded.verdict,
                    overall_score = excluded.overall_score,
                    rubric_scores = excluded.rubric_scores,
                    reviewer_feedback = excluded.reviewer_feedback,
                    passed_criteria = excluded.passed_criteria,
                    failed_criteria = excluded.failed_criteria,
                    updated_at = excluded.updated_at
                """,
                (
                    rev_id,
                    data.get("project_id", "default_proj"),
                    data.get("session_id"),
                    data.get("gate_id", "GATE_1"),
                    data.get("gate_name", "Gate Evaluation"),
                    data.get("verdict", "PASS"),
                    data.get("overall_score", 85.0),
                    rubric_json,
                    data.get("reviewer_role", "RESEARCH_ADVISOR"),
                    data.get("reviewer_feedback", ""),
                    passed_json,
                    failed_json,
                    now,
                    now
                )
            )
        data["id"] = rev_id
        data["created_at"] = now
        data["updated_at"] = now
        return data

    def get_gate_review(self, project_id: str, gate_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM gate_reviews WHERE (project_id = ? OR project_id = 'default_proj') AND gate_id = ? ORDER BY created_at DESC LIMIT 1",
                (project_id, gate_id)
            ).fetchone()
            if not row:
                return None
            d = dict(row)
            d["rubric_scores"] = json.loads(d["rubric_scores"]) if d.get("rubric_scores") else {}
            d["passed_criteria"] = json.loads(d["passed_criteria"]) if d.get("passed_criteria") else []
            d["failed_criteria"] = json.loads(d["failed_criteria"]) if d.get("failed_criteria") else []
            return d

    def list_gate_reviews(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = "SELECT * FROM gate_reviews WHERE 1=1"
        params: List[Any] = []
        if project_id:
            query += " AND (project_id = ? OR project_id = 'default_proj')"
            params.append(project_id)
        query += " ORDER BY created_at DESC"

        with self._get_connection() as conn:
            rows = conn.execute(query, tuple(params)).fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["rubric_scores"] = json.loads(d["rubric_scores"]) if d.get("rubric_scores") else {}
                d["passed_criteria"] = json.loads(d["passed_criteria"]) if d.get("passed_criteria") else []
                d["failed_criteria"] = json.loads(d["failed_criteria"]) if d.get("failed_criteria") else []
                results.append(d)
            return results

    def record_circumscription_iteration(self, data: Dict[str, Any]) -> Dict[str, Any]:
        iter_id = data.get("id") or f"circ_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        proj_id = data.get("project_id", "default_proj")

        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT COUNT(*) FROM circumscription_iterations WHERE project_id = ? OR project_id = 'default_proj'",
                (proj_id,)
            ).fetchone()
            iteration_num = (row[0] if row else 0) + 1

            conn.execute(
                """
                INSERT INTO circumscription_iterations
                (id, project_id, session_id, artifact_name, iteration_number, test_run_name, metric_name, observed_value, target_value, status, failure_mode, constraint_extracted, target_phase_loopback, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    observed_value = excluded.observed_value,
                    status = excluded.status,
                    failure_mode = excluded.failure_mode,
                    constraint_extracted = excluded.constraint_extracted
                """,
                (
                    iter_id,
                    proj_id,
                    data.get("session_id"),
                    data.get("artifact_name", "Artifact Model"),
                    data.get("iteration_number", iteration_num),
                    data.get("test_run_name", f"Benchmark Run #{iteration_num}"),
                    data.get("metric_name", "Accuracy (%)"),
                    float(data.get("observed_value", 0.0)),
                    float(data.get("target_value", 85.0)),
                    data.get("status", "FAILED_LOOPBACK"),
                    data.get("failure_mode", ""),
                    data.get("constraint_extracted", ""),
                    data.get("target_phase_loopback", "PHASE_D"),
                    now
                )
            )
        data["id"] = iter_id
        data["iteration_number"] = iteration_num
        data["created_at"] = now
        return data

    def list_circumscription_iterations(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = "SELECT * FROM circumscription_iterations WHERE 1=1"
        params: List[Any] = []
        if project_id:
            query += " AND (project_id = ? OR project_id = 'default_proj')"
            params.append(project_id)
        query += " ORDER BY iteration_number ASC"

        with self._get_connection() as conn:
            rows = conn.execute(query, tuple(params)).fetchall()
            return [dict(r) for r in rows]


    # ------------------------------------------------------------------
    # Research Domains CRUD Methods
    # ------------------------------------------------------------------

    def list_research_domains(
        self,
        project_id: Optional[str] = None,
        domain_type: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List research domains (global + project custom)."""
        with self._get_connection() as conn:
            query = "SELECT * FROM research_domains WHERE 1=1"
            params: List[Any] = []
            
            if project_id:
                query += " AND (project_id = ? OR project_id IS NULL)"
                params.append(project_id)
            else:
                query += " AND project_id IS NULL"

            if domain_type and domain_type != "ALL":
                query += " AND domain_type = ?"
                params.append(domain_type)

            if search:
                query += " AND (title LIKE ? OR context_setting LIKE ? OR stakeholders LIKE ? OR processes_to_explore LIKE ? OR id LIKE ?)"
                term = f"%{search}%"
                params.extend([term, term, term, term, term])

            query += " ORDER BY id ASC"
            cursor = conn.execute(query, params)
            return [dict(r) for r in cursor.fetchall()]

    def get_research_domain(self, domain_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a single research domain by ID."""
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM research_domains WHERE id = ?", (domain_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def create_research_domain(self, domain_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new research domain (custom or project-specific)."""
        now = datetime.utcnow().isoformat()
        domain_id = domain_data.get("id")
        if not domain_id:
            import uuid
            domain_id = f"CUST-{uuid.uuid4().hex[:6].upper()}"

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO research_domains (
                    id, project_id, title, domain_type, description,
                    scope_boundary, related_domain_ids, why_explore,
                    context_setting, stakeholders, processes_to_explore,
                    evidence_basis, sdg_relevance, initial_concerns,
                    next_action, is_custom, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                domain_id,
                domain_data.get("project_id"),
                domain_data.get("title", "Untitled Custom Domain"),
                domain_data.get("domain_type", "Custom"),
                domain_data.get("description", ""),
                domain_data.get("scope_boundary", ""),
                domain_data.get("related_domain_ids", ""),
                domain_data.get("why_explore", ""),
                domain_data.get("context_setting", ""),
                domain_data.get("stakeholders", ""),
                domain_data.get("processes_to_explore", ""),
                domain_data.get("evidence_basis", ""),
                domain_data.get("sdg_relevance", ""),
                domain_data.get("initial_concerns", ""),
                domain_data.get("next_action", ""),
                1 if domain_data.get("is_custom", True) else 0,
                now, now
            ))
            conn.commit()
            return self.get_research_domain(domain_id)

    def update_research_domain(self, domain_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing research domain."""
        now = datetime.utcnow().isoformat()
        allowed = [
            "title", "domain_type", "description", "scope_boundary",
            "related_domain_ids", "why_explore", "context_setting",
            "stakeholders", "processes_to_explore", "evidence_basis",
            "sdg_relevance", "initial_concerns", "next_action"
        ]
        set_clauses = []
        params = []
        for k in allowed:
            if k in updates:
                set_clauses.append(f"{k} = ?")
                params.append(updates[k])

        if not set_clauses:
            return self.get_research_domain(domain_id)

        set_clauses.append("updated_at = ?")
        params.append(now)
        params.append(domain_id)

        with self._get_connection() as conn:
            conn.execute(f"UPDATE research_domains SET {', '.join(set_clauses)} WHERE id = ?", params)
            conn.commit()
            return self.get_research_domain(domain_id)

    def delete_research_domain(self, domain_id: str) -> bool:
        """Delete a custom research domain."""
        with self._get_connection() as conn:
            cursor = conn.execute("DELETE FROM research_domains WHERE id = ?", (domain_id,))
            conn.commit()
            return cursor.rowcount > 0

    def seed_research_problem_bank(self, project_id: str = "default_proj") -> List[Dict[str, Any]]:
        """Seed the 34 Master Research Concept Problems (C01–C34) into the project's Problem Bank."""
        MASTER_RESEARCH_PROBLEMS = [
        {
                "id": "C01",
                "sector": "Teaching, Learning, and Academic Administration",
                "sufferer_occupation": "Students and university staff",
                "sufferer_location": "One selected university academic-service transaction",
                "problem_statement": "Students completing one selected academic transaction currently rely on separate official and informal sources, but requirements and process steps may be difficult to locate consistently, potentially causing repeated inquiries, incomplete submissions, and delays.",
                "evidence_tier": "Tier 3",
                "workaround": "Students consult separate pages, ask peers, or visit offices to learn requirements and process steps",
                "quantified_impact": "Repeated inquiries, unnecessary visits, incomplete submissions, and delayed completion",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D02: Teaching, Learning, and Academic Administration (Domain Explorer + group brainstorming)",
                "tags": [
                        "D02",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Passes scope, access, and measurability gates; impact must be established from one transaction's repeated inquiries, incomplete submissions, and completion time. | Next Action: Local evidence required before shortlisting: map the official workflow and quantify recurrence over one defined period. | Concerns: Select exactly one transaction; compare only approved official requirements with actual inquiry and completion records. | Notes: Local evidence required before shortlisting: map the official workflow and quantify recurrence over one defined period.",
                "score": 75.0
        },
        {
                "id": "C02",
                "sector": "Solid Waste Management Operations",
                "sufferer_occupation": "Facility managers, maintenance staff, and building users",
                "sufferer_location": "Selected university buildings or common areas",
                "problem_statement": "Facility staff in selected university buildings currently inspect waste conditions through routine checks or informal reports, but location- and time-based records may be incomplete, potentially limiting prioritization of recurring problem areas.",
                "evidence_tier": "Tier 3",
                "workaround": "Waste conditions are handled through routine inspection or informal reports",
                "quantified_impact": "Recurring problem areas may be missed or prioritized inefficiently",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D07: Solid Waste Management Operations (Domain Explorer + group brainstorming)",
                "tags": [
                        "D07",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Passes observability and computing-relevance gates; remains conditional until the operational consequence and recurrence are demonstrated. | Next Action: Use non-identifying observations in selected areas and avoid interpreting individual behavior from waste conditions. | Concerns: Define limited waste categories, safe observation rules, and an operational consequence such as collection frequency, overflow duration, or contamination rate. | Notes: Use non-identifying observations in selected areas and avoid interpreting individual behavior from waste conditions.",
                "score": 75.0
        },
        {
                "id": "C03",
                "sector": "Employment, Skills, and School-to-Work Transition",
                "sufferer_occupation": "Students and recent graduates",
                "sufferer_location": "University-to-employment transition for one entry-level role family",
                "problem_statement": "Students preparing for one entry-level role family currently review vacancies individually, but required skills across comparable postings may be difficult to compare systematically, potentially causing unfocused preparation and unclear skill gaps.",
                "evidence_tier": "Tier 2",
                "workaround": "Students review vacancies individually and estimate whether their current skills match employer requirements",
                "quantified_impact": "Preparation and applications may be unfocused while relevant skill gaps remain unclear",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D16: Employment, Skills, and School-to-Work Transition (Domain Explorer + PSA workforce evidence)",
                "tags": [
                        "D16",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Strong public-data route, bounded comparison, and meaningful school-to-work consequence; local interpretation still needs stakeholder validation. | Next Action: Official context: https://psa.gov.ph/content/psa-clears-jobs-and-skills-survey-encourages-participation-data-driven-evaluation-workforce | Concerns: Use one role family, a defined posting period, transparent sampling, and employer or career-office triangulation; postings may not equal actual hiring priorities. | Notes: Official context: https://psa.gov.ph/content/psa-clears-jobs-and-skills-survey-encourages-participation-data-driven-evaluation-workforce",
                "score": 75.0
        },
        {
                "id": "C04",
                "sector": "Employment, Skills, and School-to-Work Transition",
                "sufferer_occupation": "Students, coordinators, and partner employers",
                "sufferer_location": "One university internship or placement cycle",
                "problem_statement": "Students and coordinators in one internship cycle currently manage requirements and status updates through several channels, but records and handoffs may be fragmented, potentially causing repeated follow-ups and processing delays.",
                "evidence_tier": "Tier 3",
                "workaround": "Applications, requirements, endorsements, and updates are coordinated through email, messages, forms, and spreadsheets",
                "quantified_impact": "Repeated follow-ups, incomplete handoffs, and avoidable processing delays may occur",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D16: Employment, Skills, and School-to-Work Transition (Domain Explorer + group brainstorming)",
                "tags": [
                        "D16",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Strong multi-actor workflow with measurable status gaps and delays; shortlisting requires an approved cycle and complete enough records. | Next Action: Map one cycle and count incomplete, duplicated, or delayed handoffs without evaluating individual performance. | Concerns: Confirm access to one complete cycle, define status and delay measures, and protect personal and employer information. | Notes: Map one cycle and count incomplete, duplicated, or delayed handoffs without evaluating individual performance.",
                "score": 75.0
        },
        {
                "id": "C05",
                "sector": "Passenger Mobility and Local Transport Operations",
                "sufferer_occupation": "Student commuters",
                "sufferer_location": "One approved pickup point on one route during defined peak periods",
                "problem_statement": "Student commuters using one selected route currently estimate departure and waiting time from experience or informal updates, but arrival intervals may vary substantially, potentially causing late arrival or excessive waiting.",
                "evidence_tier": "Tier 3",
                "workaround": "Students estimate departure and waiting time using routine experience or informal updates",
                "quantified_impact": "Students may arrive late or allocate excessive buffer time",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D04: Passenger Mobility and Local Transport Operations (Domain Explorer + group brainstorming)",
                "tags": [
                        "D04",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Passes local observability and outcome-measurement gates; must prove recurrence and variability before any prediction concept is considered. | Next Action: Record arrival intervals and waiting time across comparable periods and establish a simple schedule or historical-average baseline. | Concerns: Use one safe approved observation point; control for weather, traffic, day type, and observation period; do not identify drivers or passengers. | Notes: Record arrival intervals and waiting time across comparable periods and establish a simple schedule or historical-average baseline.",
                "score": 75.0
        },
        {
                "id": "C06",
                "sector": "Passenger Mobility and Local Transport Operations",
                "sufferer_occupation": "Campus users and security personnel",
                "sufferer_location": "One university entrance or loading/drop-off point during peak arrival",
                "problem_statement": "Drivers and campus users at one selected loading or drop-off point currently coordinate through available space and informal practices, but peak-period flows may become uncoordinated, potentially causing recurring queueing, obstruction, and delay.",
                "evidence_tier": "Tier 3",
                "workaround": "Drivers stop, load, unload, and queue according to available space and informal coordination",
                "quantified_impact": "Localized queueing, obstruction, delay, and pedestrian conflict may recur",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D04: Passenger Mobility and Local Transport Operations (Domain Explorer + group brainstorming)",
                "tags": [
                        "D04",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Bounded operational problem with measurable recurrence and safety-related consequences; requires site permission and a defensible observation protocol. | Next Action: Measure recurrence, duration, and peak conditions without identifying individuals or making enforcement judgments. | Concerns: Use an approved safe observation position and operational definitions for queue length, obstruction, delay, and pedestrian conflict. | Notes: Measure recurrence, duration, and peak conditions without identifying individuals or making enforcement judgments.",
                "score": 75.0
        },
        {
                "id": "C07",
                "sector": "Student Support Services and Academic Well-being",
                "sufferer_occupation": "Students",
                "sufferer_location": "One program or year level during a defined assessment period",
                "problem_statement": "Students taking a defined set of courses currently combine independently scheduled assessments, but major requirements may cluster within short periods, potentially compressing preparation time and complicating prioritization.",
                "evidence_tier": "Tier 3",
                "workaround": "Teachers schedule assessments within individual courses while students combine requirements across subjects",
                "quantified_impact": "Preparation time may be compressed and prioritization made more difficult",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D15: Student Support Services and Academic Well-being (Domain Explorer + group brainstorming)",
                "tags": [
                        "D15",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Feasible, non-sensitive scheduling analysis with a clear baseline; impact remains moderate and must be shown without overclaiming wellbeing or learning effects. | Next Action: Calculate clustering frequency and workload proxies during one period before considering coordination or decision-support concepts. | Concerns: Measure schedule clustering separately from study habits; use published schedules first and collect only limited voluntary feedback. | Notes: Calculate clustering frequency and workload proxies during one period before considering coordination or decision-support concepts.",
                "score": 75.0
        },
        {
                "id": "C08",
                "sector": "Agricultural Production and Farm Operations",
                "sufferer_occupation": "Small-scale irrigating farmers",
                "sufferer_location": "One crop and one accessible irrigated field setting during a dry period",
                "problem_statement": "Farmers in one selected crop setting currently determine irrigation timing and amount mainly through visual judgment, but decisions may not consistently match reference moisture needs, potentially causing water waste or crop stress.",
                "evidence_tier": "Tier 3",
                "workaround": "Irrigation timing and amount are determined mainly through visual judgment and routine practice",
                "quantified_impact": "Over- or under-irrigation may waste water and reduce crop quality or yield",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D01: Agricultural Production and Farm Operations (Group-provided screened problem list)",
                "tags": [
                        "D01",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Narrow decision bottleneck with quantifiable resource and crop indicators; shortlisting depends on field access and a credible reference measurement. | Next Action: Document the current decision rule and compare it with reference measurements before proposing sensing, prediction, or automation. | Concerns: Requires a farm partner, reference soil-moisture measurements, one crop, and separation of decision error from water-supply and weather constraints. | Notes: Document the current decision rule and compare it with reference measurements before proposing sensing, prediction, or automation.",
                "score": 75.0
        },
        {
                "id": "C09",
                "sector": "Agricultural Production and Farm Operations",
                "sufferer_occupation": "Small-scale farmers",
                "sufferer_location": "One locally relevant perishable crop during one harvest period",
                "problem_statement": "Farmers producing one selected perishable crop currently judge harvest timing from experience and visible cues, but maturity decisions may not consistently match an accepted reference window, potentially reducing quality and market value.",
                "evidence_tier": "Tier 3",
                "workaround": "Harvest timing is judged from experience and visible maturity cues",
                "quantified_impact": "Harvesting outside the target maturity window may reduce quality and market value",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D01: Agricultural Production and Farm Operations (Group-provided screened problem list)",
                "tags": [
                        "D01",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Bounded timing decision with measurable quality and economic consequences; requires local crop access and qualified ground truth. | Next Action: Compare current judgments with accepted maturity and quality measures rather than treating image classification accuracy as the outcome. | Concerns: Define one crop, an accepted maturity reference, the harvest window, postharvest quality measures, and reliable ground truth. | Notes: Compare current judgments with accepted maturity and quality measures rather than treating image classification accuracy as the outcome.",
                "score": 75.0
        },
        {
                "id": "C10",
                "sector": "Agricultural Production and Farm Operations",
                "sufferer_occupation": "Farmers and grain handlers",
                "sufferer_location": "One grain, drying method, and storage setting in tropical conditions",
                "problem_statement": "Farmers or dryer operators using one selected drying and storage process may lack consistent moisture-based decision records, potentially allowing incomplete or uneven drying and avoidable grain-quality loss.",
                "evidence_tier": "Tier 2",
                "workaround": "Drying and storage decisions may rely on elapsed time, weather, touch, or occasional measurements",
                "quantified_impact": "Incomplete, delayed, or uneven drying can reduce grain quality and increase spoilage risk",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D01: Agricultural Production and Farm Operations (Group-provided screened problem list + PHilMech evidence)",
                "tags": [
                        "D01",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Strong measurable postharvest-control problem with authoritative evidence and a defensible baseline; local partner and process data are still required. | Next Action: Official evidence: https://rcef.philmech.gov.ph/?action=grainDrying&page=knowledgeBank | Concerns: Use one grain, a calibrated reference moisture instrument, safe sampling, and a measurable quality outcome; do not make food-safety claims without qualified testing. | Notes: Official evidence: https://rcef.philmech.gov.ph/?action=grainDrying&page=knowledgeBank",
                "score": 75.0
        },
        {
                "id": "C11",
                "sector": "Digital Safety and Data Privacy Practices",
                "sufferer_occupation": "Students and institutional support personnel",
                "sufferer_location": "Authorized phishing-awareness and reporting exercises in one university unit",
                "problem_statement": "Students in one university unit may recognize some suspicious-message cues but remain inconsistent in classifying selected scenarios and following the approved reporting process, potentially delaying safe escalation.",
                "evidence_tier": "Tier 2",
                "workaround": "Users judge suspicious messages individually and may be unsure how to report or escalate them",
                "quantified_impact": "Risky responses, delayed reporting, and incomplete incident information may reduce the effectiveness of early response",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D24: Digital Safety and Data Privacy Practices (Official privacy advisories + benchmark gap scan)",
                "tags": [
                        "D24",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: High relevance and feasible controlled evaluation with clear behavioral and process measures; requires formal authorization and a non-deceptive debrief protocol. | Next Action: Official context: https://privacy.gov.ph/npc-phe-bulletin-no-21-preventive-data-privacy-practices-against-smishing/ | Concerns: Use only authorized simulated messages; never collect passwords or real credentials; coordinate with IT or the data-protection office and measure reporting behavior safely. | Notes: Official context: https://privacy.gov.ph/npc-phe-bulletin-no-21-preventive-data-privacy-practices-against-smishing/",
                "score": 75.0
        },
        {
                "id": "C12",
                "sector": "MSME Operations and Digital Commerce",
                "sufferer_occupation": "Micro-business owners, staff, and customers",
                "sufferer_location": "One small business handling orders and stock across two or more sales channels",
                "problem_statement": "A local micro-retailer using multiple sales channels may maintain order and inventory status in separate records, potentially causing inconsistent stock counts, repeated reconciliation, and fulfillment errors.",
                "evidence_tier": "Tier 2",
                "workaround": "Orders, stock changes, and fulfillment status may be tracked separately in messages, platform dashboards, notebooks, or spreadsheets",
                "quantified_impact": "Overselling, missed updates, duplicate work, stockouts, or delayed fulfillment may occur",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D23: MSME Operations and Digital Commerce (DTI digitalization priorities + benchmark gap scan)",
                "tags": [
                        "D23",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Meaningful MSME operational problem with measurable error, reconciliation-time, and fulfillment outcomes; shortlisting depends on partner access and proof of recurrence. | Next Action: Official context: https://supplychainlogistics.dti.gov.ph/strategic-play/digitalization | Concerns: Requires one willing business partner, a defined product set and period, and protection of customer, sales, and financial data. | Notes: Official context: https://supplychainlogistics.dti.gov.ph/strategic-play/digitalization",
                "score": 75.0
        },
        {
                "id": "C13",
                "sector": "Energy Use and Facility Energy Management",
                "sufferer_occupation": "Facility managers and the institution",
                "sufferer_location": "Selected classrooms or offices in one building",
                "problem_statement": "Selected rooms in one building may rely on manual switching and routine checks, but equipment use during unoccupied periods may not be recorded consistently, potentially causing avoidable electricity consumption.",
                "evidence_tier": "Tier 2",
                "workaround": "Lights, cooling, and plug loads are switched manually according to room use and routine checks",
                "quantified_impact": "Avoidable electricity use and operating cost may accumulate",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D08: Energy Use and Facility Energy Management (DOE energy-efficiency policy + benchmark gap scan)",
                "tags": [
                        "D08",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: High feasibility, objective outcome measures, and direct institutional impact; must confirm that unoccupied consumption is recurrent and material. | Next Action: Official context: https://doe.gov.ph/site/eppb/articles/895904--energy-efficiency-and-conservation-roadmap-2017-2040 | Concerns: Obtain facility permission, measure only approved circuits or equipment, control for room schedule and weather, and use a simple manual or schedule-based baseline. | Notes: Official context: https://doe.gov.ph/site/eppb/articles/895904--energy-efficiency-and-conservation-roadmap-2017-2040",
                "score": 75.0
        },
        {
                "id": "C14",
                "sector": "Accessibility and Inclusive Participation",
                "sufferer_occupation": "Students with disabilities and other users with access needs",
                "sufferer_location": "One high-use university digital service or online form",
                "problem_statement": "Users of one selected university digital service may encounter WCAG-related and task-level accessibility barriers, potentially preventing independent completion or increasing time and assistance required.",
                "evidence_tier": "Tier 2",
                "workaround": "Users complete the service through an existing webpage or digital form with varying assistive-technology support",
                "quantified_impact": "Users may encounter failed steps, longer completion time, or reliance on assistance",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D14: Accessibility and Inclusive Participation (DICT accessibility standard + benchmark gap scan)",
                "tags": [
                        "D14",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Strong standards-based evaluation path, bounded service task, and inclusion impact; requires careful co-validation with representative users or accessibility experts. | Next Action: Official context: https://ictstatistics.dict.gov.ph/resources/ | Concerns: Start with standards-based audit; involve representative users only with accessible consent, reasonable accommodations, and no unnecessary disability disclosure. | Notes: Official context: https://ictstatistics.dict.gov.ph/resources/",
                "score": 75.0
        },
        {
                "id": "C15",
                "sector": "Water Service and Resource Management",
                "sufferer_occupation": "Households and water-provider personnel",
                "sufferer_location": "One small water system or selected distribution zone with intermittent or variable service",
                "problem_statement": "A selected local water system currently relies on complaints and periodic checks, but pressure, flow, and interruption events may not be recorded consistently by zone and time, potentially delaying detection and diagnosis of recurring service failures.",
                "evidence_tier": "Tier 2",
                "workaround": "Operators rely on service complaints, pump or valve checks, and periodic or manual operating logs",
                "quantified_impact": "Service failures may be detected or diagnosed late, causing unstable service hours, repeated complaints, avoidable water loss, or inefficient maintenance",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D06: Water Service and Resource Management (PIDS water-sector evidence + peer-reviewed intermittent-network and IoT monitoring studies)",
                "tags": [
                        "D06",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Passes significance, computing-necessity, and evaluation gates using event-detection delay, service-hour reliability, record completeness, and comparison with manual logs; local recurrence and provider access remain unverified. | Next Action: Evidence: https://www.pids.gov.ph/details/news/press-releases/water-districts-fall-behind-as-demand-exceeds-supply-pids-study | https://doi.org/10.3390/W12082143 | https://doi.org/10.3390/S20154247 | Concerns: Requires provider permission, calibrated pressure or flow references, safe installation, a defined service zone, and controls for demand, power outages, and seasonal conditions; pressure change alone must not be labeled a leak. | Notes: Evidence: https://www.pids.gov.ph/details/news/press-releases/water-districts-fall-behind-as-demand-exceeds-supply-pids-study | https://doi.org/10.3390/W12082143 | https://doi.org/10.3390/S20154247",
                "score": 75.0
        },
        {
                "id": "C16",
                "sector": "Environmental Condition Monitoring",
                "sufferer_occupation": "Students, teachers, and school administrators",
                "sufferer_location": "Selected naturally ventilated classrooms in one campus during defined warm-weather weeks",
                "problem_statement": "Selected naturally ventilated classrooms currently use routine ventilation and schedule adjustments, but continuous thermal-condition records linked with occupancy and mitigation may be unavailable, potentially preventing staff from identifying when and where unacceptable conditions recur.",
                "evidence_tier": "Tier 2",
                "workaround": "Heat is managed through fans, windows, schedules, or class adjustments, while room conditions are checked only intermittently",
                "quantified_impact": "Periods outside agreed thermal criteria may remain unidentified, limiting timely mitigation and contributing to discomfort, reduced task performance, or learning disruption",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D18: Environmental Condition Monitoring (Philippine classroom thermal-comfort studies + DepEd extreme-heat guidance)",
                "tags": [
                        "D18",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Strong local access, objective measurement, and comparison route using calibrated readings, accepted criteria, surveys or bounded task measures, and mitigation-period baselines; the local magnitude still needs to be established. | Next Action: Evidence: https://bukidnon.deped.gov.ph/2024/04/05/official-statement-on-class-suspensions-and-shifting-to-adm-due-to-high-heat-index-other-calamities/ | https://doi.org/10.1051/e3sconf/202339601116 | https://doi.org/10.5281/zenodo.15531795 | Concerns: Use calibrated instruments and a predeclared thermal reference; control for weather, time, occupancy, and room differences; avoid medical claims; obtain accessible consent for any voluntary comfort or task measures. | Notes: Evidence: https://bukidnon.deped.gov.ph/2024/04/05/official-statement-on-class-suspensions-and-shifting-to-adm-due-to-high-heat-index-other-calamities/ | https://doi.org/10.1051/e3sconf/202339601116 | https://doi.org/10.5281/zenodo.15531795",
                "score": 75.0
        },
        {
                "id": "C17",
                "sector": "Mangrove Restoration/Environment and Conservation Operations",
                "sufferer_occupation": "Restoration managers, community partners, and communities benefiting from the restored ecosystem",
                "sufferer_location": "One verified Iloilo mangrove-restoration site with a defined set of monitoring plots",
                "problem_statement": "A selected mangrove-restoration project currently uses periodic field monitoring, but survival and growth records may be incomplete or inconsistent across plots and dates, potentially delaying identification of mortality hotspots and weakening maintenance and replanting decisions.",
                "evidence_tier": "Tier 2",
                "workaround": "Survival and growth are checked periodically through field counts, fixed plots, photographs, and separate paper or spreadsheet records",
                "quantified_impact": "Mortality hotspots, site or species mismatch, and maintenance needs may be detected late, weakening replanting priorities, accountability, and outcome reporting",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D25: Mangrove Restoration/Environment and Conservation Operations (DENR restoration-monitoring guidance + Southeast Asia systematic review + verified Iloilo restoration site)",
                "tags": [
                        "D25",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: High ecological and management impact with an evaluable route against fixed-quadrat manual reference for completeness, counting error, time, survival estimates, and spatial consistency; partner authority and obtainable records are not yet confirmed. | Next Action: Evidence: https://faspselib.denr.gov.ph/Materials/Detail/fec8cc55-253a-4788-b26b-3104b6be9a6d | https://www.bmb.gov.ph/the-katunggan-ecopark/ | https://doi.org/10.3389/fmars.2022.987737 | Concerns: Requires formal site permission, an ecological validator, fixed and repeatable plots, safe field schedules, tide and weather controls, reliable ground truth, and a clear boundary between project monitoring and scientific habitat-condition measurement. | Notes: Evidence: https://faspselib.denr.gov.ph/Materials/Detail/fec8cc55-253a-4788-b26b-3104b6be9a6d | https://www.bmb.gov.ph/the-katunggan-ecopark/ | https://doi.org/10.3389/fmars.2022.987737",
                "score": 75.0
        },
        {
                "id": "C18",
                "sector": "Disaster Risk Reduction and Preparedness",
                "sufferer_occupation": "Residents, local planners, responders, and critical-facility users",
                "sufferer_location": "One hazard-prone municipality or barangay road network under defined flood or rain-induced-landslide scenarios",
                "problem_statement": "A selected hazard-prone locality may have hazard and facility maps but lack a validated analysis of which road-segment disruptions most reduce access to critical facilities, potentially weakening alternate-route, evacuation, and clearing priorities.",
                "evidence_tier": "Tier 2",
                "workaround": "Preparedness maps identify hazards and facilities, but the effect of individual road disruptions on access may be assessed manually or not quantified",
                "quantified_impact": "Alternate-route, evacuation, clearing, and preparedness priorities may overlook road segments whose disruption produces the greatest loss of access",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D05: Disaster Risk Reduction and Preparedness (MGB geohazard data + DSWD local incident evidence + peer-reviewed flood-accessibility studies)",
                "tags": [
                        "D05",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: High societal consequence and genuine GIS or network-analysis need with measurable access-loss, travel-time, coverage, and expert-ranking outcomes; local closure history and DRRMO validation are still required. | Next Action: Evidence: https://experience.arcgis.com/experience/c48f83f81f1548bdb0a76c61638d52d6 | https://reliefweb.int/report/philippines/dswd-dromic-report-1-flashflood-and-landslide-incidents-leon-iloilo-04-december-2022-6pm | https://doi.org/10.1186/s12942-022-00315-2 | https://doi.org/10.1596/1813-9450-9262 | Related current Iloilo City magnitude evidence: 72 flood-risk barangays, 25 storm-surge-risk barangays, and more than 263,000 residents exposed; this strengthens significance but does not by itself validate the road-access gap. https://www.pna.gov.ph/articles/1254925 | https://www.panaynews.net/72-iloilo-city-barangays-tagged-high-risk-flood-threat-looms-over-263k-residents/ | Concerns: Limit the study to one hazard and facility set; use historical or simulated closures and safe non-emergency validation; verify road and facility data with DRR personnel; do not present the output as real-time warning or guaranteed safe routing. | Notes: Evidence: https://experience.arcgis.com/experience/c48f83f81f1548bdb0a76c61638d52d6 | https://reliefweb.int/report/philippines/dswd-dromic-report-1-flashflood-and-landslide-incidents-leon-iloilo-04-december-2022-6pm | https://doi.org/10.1186/s12942-022-00315-2 | https://doi.org/10.1596/1813-9450-9262 | Related current Iloilo City magnitude evidence: 72 flood-risk barangays, 25 storm-surge-risk barangays, and more than 263,000 residents exposed; this strengthens significance but does not by itself validate the road-access gap. https://www.pna.gov.ph/articles/1254925 | https://www.panaynews.net/72-iloilo-city-barangays-tagged-high-risk-flood-threat-looms-over-263k-residents/",
                "score": 75.0
        },
        {
                "id": "C19",
                "sector": "Food Logistics and Supply-Chain Operations",
                "sufferer_occupation": "Growers, traders, transporters, retailers, and consumers",
                "sufferer_location": "One defined Iloilo-to-Manila mango supply-chain segment across actual commercial shipments",
                "problem_statement": "Actors in a selected Iloilo mango supply-chain segment may lack a field-validated method that connects observable shipment conditions with independently measured arrival quality, limiting early and evidence-based handling decisions.",
                "evidence_tier": "Tier 2",
                "workaround": "Ripeness and quality are commonly judged through manual inspection, while handling and environmental conditions may not be linked to verified arrival quality across the shipment",
                "quantified_impact": "Reduced marketable volume and income, inconsistent fruit quality, food waste, and decisions made only after deterioration becomes visible",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D09: Food Logistics and Supply-Chain Operations (SEARCA/ADB value-chain evidence + peer-reviewed field-monitoring and quality-prediction studies)",
                "tags": [
                        "D09",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: High economic and food-loss significance with measurable prediction and process outcomes; originality and feasibility depend on current field data, partner access, and comparison against the present inspection process. | Next Action: Evidence: https://www.searca.org/press/postharvest-losses-ph-onion-tomato-mango-value-chains-bared | https://doi.org/10.1109/ICACSIS56558.2022.9923476 | Concerns: The 33.89% route estimate requires a current local baseline; secure one chain partner, repeated real shipments, calibrated reference measurements, and seasonal coverage; avoid a generic ripeness classifier or dashboard. | Notes: Evidence: https://www.searca.org/press/postharvest-losses-ph-onion-tomato-mango-value-chains-bared | https://doi.org/10.1109/ICACSIS56558.2022.9923476",
                "score": 75.0
        },
        {
                "id": "C20",
                "sector": "Healthcare Service Delivery and Public Health Operations",
                "sufferer_occupation": "Eligible women, families, frontline health workers, and local health programs",
                "sufferer_location": "One authorized Iloilo RHU, city or municipal health office, or bounded cervical-cancer screening program",
                "problem_statement": "A selected Iloilo cervical-cancer screening pathway may have unmeasured losses between screening, result communication, confirmatory assessment, referral, and indicated care, but local program records must first establish where and how often non-completion occurs.",
                "evidence_tier": "Tier 2",
                "workaround": "Screening, result notification, confirmatory assessment, referral, and care-linkage records may be split across paper lists, calls, and facilities; follow-up may be coordinated manually.",
                "quantified_impact": "Unresolved pathway losses can delay clinical assessment and indicated care, reduce the benefit of early detection, and leave program managers unable to identify where continuity breaks down.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D03: Healthcare Service Delivery and Public Health Operations (Official Iloilo SUCCESS-FAP program + GLOBOCAN 2022 + Philippine screening evidence + digital-intervention reviews)",
                "tags": [
                        "D03",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Very high and preventable burden with an active Northern Iloilo screening program and measurable pathway outcomes; remains Hold because public sources do not establish local screening-to-care dropout or a defensible gap beyond existing digital interventions. | Next Action: Corrected evidence: GLOBOCAN 2022 estimates 8,549 new cases and 4,380 deaths; cervical cancer ranked third by incidence among Philippine women, not second. Iloilo SUCCESS-FAP operated in Carles, Estancia, and Lemery. Local pathway non-completion is not yet verified. Evidence: https://gco.iarc.who.int/today/ | https://www.pna.gov.ph/articles/1242741 | https://www.pids.gov.ph/details/news/in-the-news/only-1-of-ph-women-screened-for-breast-cervical-cancer | https://iloilo.gov.ph/en/health-news/iloilos-success-fap-blueprint-cervical-cancer-prevention | https://doi.org/10.2196/23350 | https://doi.org/10.1371/journal.pone.0291931 | Concerns: Do not infer local loss to follow-up from national burden or program existence; secure authorized aggregate pathway data and professional supervision; avoid AI diagnosis and a generic reminder or referral app already covered by existing studies; protect sensitive reproductive-health information. | Notes: Corrected evidence: GLOBOCAN 2022 estimates 8,549 new cases and 4,380 deaths; cervical cancer ranked third by incidence among Philippine women, not second. Iloilo SUCCESS-FAP operated in Carles, Estancia, and Lemery. Local pathway non-completion is not yet verified. Evidence: https://gco.iarc.who.int/today/ | https://www.pna.gov.ph/articles/1242741 | https://www.pids.gov.ph/details/news/in-the-news/only-1-of-ph-women-screened-for-breast-cervical-cancer | https://iloilo.gov.ph/en/health-news/iloilos-success-fap-blueprint-cervical-cancer-prevention | https://doi.org/10.2196/23350 | https://doi.org/10.1371/journal.pone.0291931",
                "score": 75.0
        },
        {
                "id": "C21",
                "sector": "Healthcare Service Delivery and Public Health Operations",
                "sufferer_occupation": "Infants, parents or caregivers, clinicians, screening centers, and program administrators",
                "sufferer_location": "One authorized hospital or accredited newborn-hearing screening center and its referral-to-confirmatory-testing pathway",
                "problem_statement": "A selected newborn-hearing pathway may lose infants between initial screening, rescreening, comprehensive audiologic evaluation, referral, and intervention, but local records must first establish the affected stage, recurrence, and causes.",
                "evidence_tier": "Tier 2",
                "workaround": "After initial screening, rescreening, comprehensive audiologic evaluation, referral, and intervention may involve multiple visits and facilities; follow-up and outcome records may be incomplete or manually reconciled.",
                "quantified_impact": "Infants may be lost to follow-up, confirmatory assessment may be delayed, and program managers may lack complete information for continuity and quality improvement.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D03: Healthcare Service Delivery and Public Health Operations (Philippine single-center pathway evaluation + existing HeLe eHealth referral model + framework review)",
                "tags": [
                        "D03",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: The care-pathway consequence and Philippine dropout evidence are strong, but the exact digital referral and tracking solution already exists in the HeLe model and no Iloilo-specific failure is verified; proceed only if a remaining barrier such as offline access, interoperability, sustainability, or intervention availability is demonstrated. | Next Action: Verified evidence: in a 2019 UST Hospital cohort of 778 newborns, 81 (10.4%) did not pass initial screening, 11 also did not pass rescreening, none of those 11 completed comprehensive audiologic evaluation, and 67 total dropouts occurred. This is single-center Manila evidence. HeLe already implemented Philippine web-based referral and tracking. Evidence: https://pjohns.pso-hns.org/index.php/pjohns/article/view/2137/2177 | https://doi.org/10.47895/amp.v57i9.5332 | Concerns: The 2019 evidence is from one UST Hospital cohort in Manila and is not nationally or locally representative; secure a birthing or audiology partner and de-identified records; protect child health data; do not duplicate HeLe's existing web referral and tracking model. | Notes: Verified evidence: in a 2019 UST Hospital cohort of 778 newborns, 81 (10.4%) did not pass initial screening, 11 also did not pass rescreening, none of those 11 completed comprehensive audiologic evaluation, and 67 total dropouts occurred. This is single-center Manila evidence. HeLe already implemented Philippine web-based referral and tracking. Evidence: https://pjohns.pso-hns.org/index.php/pjohns/article/view/2137/2177 | https://doi.org/10.47895/amp.v57i9.5332",
                "score": 75.0
        },
        {
                "id": "C22",
                "sector": "Community Safety and Emergency Response",
                "sufferer_occupation": "Drivers, passengers, pedestrians, cyclists, responders, and local government",
                "sufferer_location": "One city or municipality with bounded road-crash records, traffic exposure data, and a defined intervention-planning process",
                "problem_statement": "A selected locality may lack a validated method for reconciling available crash records and prioritizing road-safety interventions after accounting for traffic exposure, data quality, and local resource constraints.",
                "evidence_tier": "Tier 2",
                "workaround": "Agencies may maintain separate or incomplete crash records, while conventional hotspot maps often rank locations using raw crash counts without exposure, data-quality, or intervention constraints",
                "quantified_impact": "High-risk locations or contributing conditions may be misranked, and limited engineering, enforcement, or education resources may be allocated without transparent evidence",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D13: Community Safety and Emergency Response (Philippine Statistics Authority mortality data + Philippine crash-data quality research + local hotspot-analysis literature)",
                "tags": [
                        "D13",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Very high safety significance with measurable ranking, coverage, agreement, and decision-quality outcomes; defensibility depends on moving beyond raw-count hotspot maps and securing usable local records. | Next Action: Evidence: https://psa.gov.ph/statistics/vital-statistics/node/1684076211 | https://doi.org/10.1136/injuryprev-2018-safety.485 | https://doi.org/10.18421/10.18421/SAR82-08 | Concerns: Generic hotspot mapping is already saturated; obtain de-identified multi-source records and traffic exposure measures; address underreporting; avoid invasive driver surveillance; evaluate prioritization against expert or historical decisions. | Notes: Evidence: https://psa.gov.ph/statistics/vital-statistics/node/1684076211 | https://doi.org/10.1136/injuryprev-2018-safety.485 | https://doi.org/10.18421/10.18421/SAR82-08",
                "score": 75.0
        },
        {
                "id": "C23",
                "sector": "Solid Waste Management Operations",
                "sufferer_occupation": "MRF workers, waste generators, barangay or city environment offices, local government, and communities served",
                "sufferer_location": "One selected barangay or cluster materials recovery facility with existing records and permission for a bounded physical-flow audit",
                "problem_statement": "A selected materials recovery facility may lack a consistent, audit-ready method for reconciling waste-flow records with independent measurements, preventing reliable verification of diversion performance and identification of operational loss points.",
                "evidence_tier": "Tier 2",
                "workaround": "Received, sorted, recovered, residual, and transferred waste may be recorded in paper, spreadsheet, or separate logs; aggregate reports may not be routinely reconciled with independent physical measurements",
                "quantified_impact": "Inaccurate diversion reporting, undetected contamination or leakage, weak allocation of collection and processing resources, and limited evidence for corrective action",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D07: Solid Waste Management Operations (Domain Explorer + official performance-audit evidence + academic saturation scan)",
                "tags": [
                        "D07",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: High public-service relevance and a measurable record-to-physical-flow gap; desk evidence supports the problem shape, but recurrence, usable baseline records, and a committed local partner must be confirmed before shortlisting. | Next Action: Evidence: https://www.coa.gov.ph/reports/performance-audit-reports/2023-2/solid-waste-management-program/ | https://doi.org/10.1109/HNICEM60674.2023.10589249 | https://doi.org/10.5281/zenodo.17018819 | Concerns: Secure one MRF/MENRO partner; define a short audit period and limited waste categories; use calibrated reference measurements and safe handling/PPE; avoid a generic smart-bin or reporting-app concept; evaluate record accuracy and operational decisions, not only usability. | Notes: Evidence: https://www.coa.gov.ph/reports/performance-audit-reports/2023-2/solid-waste-management-program/ | https://doi.org/10.1109/HNICEM60674.2023.10589249 | https://doi.org/10.5281/zenodo.17018819",
                "score": 75.0
        },
        {
                "id": "C24",
                "sector": "Digital Safety and Data Privacy Practices",
                "sufferer_occupation": "University students or other online-scam reporters, and official agencies responsible for receiving and processing reports",
                "sufferer_location": "Controlled university usable-security study using synthetic online-scam scenarios. Participants may inspect official public reporting guidance and channels but will not submit synthetic reports to live government systems.",
                "problem_statement": "University students navigating official Philippine online-scam reporting pathways may have difficulty identifying an appropriate reporting channel efficiently and safely when incidents are ambiguous, multiple official channels appear plausible, and available evidence contains sensitive information. The extent and recurrence of this difficulty have not yet been established locally.",
                "evidence_tier": "Tier 2",
                "workaround": "Users must determine the incident type, identify an appropriate official reporting pathway, interpret evidence requirements, and decide what sensitive information is necessary by consulting available official reporting guidance and channels.",
                "quantified_impact": "Incorrect or less appropriate pathway selection, longer navigation time, unnecessary navigation, incomplete evidence preparation, task non-completion, and unnecessary disclosure of sensitive information may occur.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D24: Digital Safety and Data Privacy Practices (Domain Explorer + official complaint/reporting sources + academic underreporting/usability evidence + DSR usable-security framing)",
                "tags": [
                        "D24",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Strong usable-security/HCI research direction with measurable behavioral outcomes and a feasible controlled evaluation path. Keep on Hold until local task-performance difficulty is demonstrated and acceptable reporting pathways can be authoritatively defined. | Next Action: Evidence: https://www.pna.gov.ph/articles/1243101 | https://www.pna.gov.ph/articles/1228318 | https://www.doj.gov.ph/reporting_cybercrime.html | https://doi.org/10.1109/ICCCF.2016.7740424 | https://doi.org/10.1109/ECRIME47957.2019.9037577 | https://doi.org/10.54501/jots.v2i4.204 | Problem-bank note: local task-performance evidence is still required before shortlisting. | Concerns: Official reporting jurisdictions may overlap, making ground-truth routing difficult to define; official guidance may change; synthetic scenarios may not fully represent real victim conditions; repeated scenarios may create learning effects. Use only synthetic evidence and never submit fabricated reports. | Notes: Evidence: https://www.pna.gov.ph/articles/1243101 | https://www.pna.gov.ph/articles/1228318 | https://www.doj.gov.ph/reporting_cybercrime.html | https://doi.org/10.1109/ICCCF.2016.7740424 | https://doi.org/10.1109/ECRIME47957.2019.9037577 | https://doi.org/10.54501/jots.v2i4.204 | Problem-bank note: local task-performance evidence is still required before shortlisting.",
                "score": 75.0
        },
        {
                "id": "C25",
                "sector": "Healthcare Service Delivery and Public Health Operations",
                "sufferer_occupation": "Pregnant women and newborns, referring and receiving health workers, facilities, and local health managers",
                "sufferer_location": "One selected local maternal referral network linking an RHU or birthing facility with a receiving hospital",
                "problem_statement": "In a selected maternal referral network, records sent by RHUs or birthing facilities to receiving hospitals may be incomplete, inconsistently formatted, or lack acknowledgement and outcome feedback, limiting receiving-facility preparation and making referral completion difficult to verify.",
                "evidence_tier": "Tier 2",
                "workaround": "Maternal referrals may use paper or differently formatted records, phone calls, or informal coordination; acknowledgement, receiving-facility feedback, and final referral outcome may not be consistently documented.",
                "quantified_impact": "Missing or delayed information may require repeated clarification, weaken transfer preparation and continuity of care, and prevent reliable monitoring of unresolved referrals.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D03: Healthcare Service Delivery and Public Health Operations (Domain Explorer + Philippine maternal-referral evidence + framework review)",
                "tags": [
                        "D03",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Philippine studies document referral coordination and information-quality problems with measurable process outcomes, but the same bottleneck, data access, and partner support must be confirmed in one Iloilo network before shortlisting. | Next Action: Evidence: an Albay study identified coordination, data-management, and referral-protocol barriers (peer reviewed): https://doi.org/10.47895/AMP.V54I5.664 | A Cagayan de Oro preprint reviewed 3,330 referral forms, sampled 384, found 126 (31.8%) used the standard form, and none met all 14 completeness criteria: https://www.medrxiv.org/content/10.1101/2022.03.31.22273250v1.full-text | Concerns: Requires an authorized MHO, RHU, birthing-facility, or hospital partner; use de-identified records or controlled simulation; require maternal-health professional supervision and ethics or privacy approval; do not automate clinical risk diagnosis or triage. | Notes: Evidence: an Albay study identified coordination, data-management, and referral-protocol barriers (peer reviewed): https://doi.org/10.47895/AMP.V54I5.664 | A Cagayan de Oro preprint reviewed 3,330 referral forms, sampled 384, found 126 (31.8%) used the standard form, and none met all 14 completeness criteria: https://www.medrxiv.org/content/10.1101/2022.03.31.22273250v1.full-text",
                "score": 75.0
        },
        {
                "id": "C26",
                "sector": "Healthcare Service Delivery and Public Health Operations",
                "sufferer_occupation": "People seeking confidential HIV services, their support networks, authorized providers, and the provincial health system",
                "sufferer_location": "One authorized Iloilo HIV clinic, treatment hub, or bounded provincial testing-and-linkage pathway",
                "problem_statement": "Within a selected authorized Iloilo HIV-service pathway, low testing uptake or incomplete linkage between diagnosis, treatment, and continuing care may limit timely access to confidential services, but the local workflow causes must be established without exposing or stigmatizing individuals.",
                "evidence_tier": "Tier 3",
                "workaround": "Iloilo operates several HIV clinics and free-testing sites, but provincial reporting identifies low testing and diagnosis coverage, limited treatment and viral-suppression coverage, poor health-seeking behavior, and minimal testing uptake among young people.",
                "quantified_impact": "Delayed diagnosis or incomplete linkage can reduce timely access to prevention and treatment services and weaken progress toward provincial testing, treatment, and viral-suppression targets.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D03: Healthcare Service Delivery and Public Health Operations (D03 Health Landscape + official Iloilo Provincial Local AIDS Council evidence)",
                "tags": [
                        "D03",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: The local magnitude and service pathway are publicly documented, giving this direction strong impact potential; it remains Hold because stakeholder authorization, ethical access, and a precise clinic-level failure point are not confirmed. | Next Action: Official Iloilo evidence reported 1,988 diagnosed among an estimated 4,800 PLHIV as of June 2025 (41%); 1,583 of those diagnosed were treated (80%), and 1,065 of those treated had suppressed viral load (67%). The same source identified low youth testing uptake. Evidence: https://www.iloilo.gov.ph/en/health-news/get-tested-now-iloilo-aids-council-toughens-preventive-control-measures-vs-hiv | Concerns: Exceptionally sensitive and stigmatized context; proceed only through an authorized clinic or public-health partner; use de-identified aggregate data; do not create public risk scores, collect unnecessary identity or behavior data, or expose clinic attendance. | Notes: Official Iloilo evidence reported 1,988 diagnosed among an estimated 4,800 PLHIV as of June 2025 (41%); 1,583 of those diagnosed were treated (80%), and 1,065 of those treated had suppressed viral load (67%). The same source identified low youth testing uptake. Evidence: https://www.iloilo.gov.ph/en/health-news/get-tested-now-iloilo-aids-council-toughens-preventive-control-measures-vs-hiv",
                "score": 75.0
        },
        {
                "id": "C27",
                "sector": "Healthcare Service Delivery and Public Health Operations",
                "sufferer_occupation": "Adults with elevated blood pressure, families, barangay health workers, primary-care teams, and program managers",
                "sufferer_location": "One selected Iloilo Healthy Hearts or primary-care site and one bounded hypertension care pathway",
                "problem_statement": "A selected Iloilo hypertension-care pathway may have unmeasured losses between community identification, confirmation, enrollment, medicine continuity, follow-up, and control monitoring, but the exact failure point and recurrence must be established from site records.",
                "evidence_tier": "Tier 2",
                "workaround": "Iloilo's Healthy Hearts Program has expanded across the province and tracks enrollment and blood-pressure control, but public reporting does not show whether patients consistently complete confirmation, enrollment, follow-up visits, medicine continuity, and repeated control monitoring at each site.",
                "quantified_impact": "Unrecognized pathway losses may contribute to persistent uncontrolled blood pressure, delayed care, preventable complications, and incomplete evidence for local program improvement.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D03: Healthcare Service Delivery and Public Health Operations (D03 Health Landscape + official Iloilo Healthy Hearts implementation and outcome reports)",
                "tags": [
                        "D03",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: The program has substantial local reach, a defined care cascade, and measurable continuity outcomes; it remains Hold because public sources mainly report program success and do not establish a recurring site-level continuity failure. | Next Action: Official sources document province-wide expansion and report 22,395 enrolled patients. The outcome page states that 86.6% (17,182 patients) had controlled blood pressure, but 17,182 divided by 22,395 is about 76.7%, so the reported percentage and count require clarification. Evidence: https://www.iloilo.gov.ph/en/health-news/healthy-hearts-program-expands-16-sites-iloilo-province | https://www.iloilo.gov.ph/index.php/en/health-news/resolve-save-lives-lauds-iloilos-healthy-hearts-program-outcome | Concerns: Limit the study to one condition, site, and pathway stage; require an authorized primary-care partner and de-identified records; do not automate diagnosis or treatment; clarify the arithmetic inconsistency in the public outcome report before using its percentage as a baseline. | Notes: Official sources document province-wide expansion and report 22,395 enrolled patients. The outcome page states that 86.6% (17,182 patients) had controlled blood pressure, but 17,182 divided by 22,395 is about 76.7%, so the reported percentage and count require clarification. Evidence: https://www.iloilo.gov.ph/en/health-news/healthy-hearts-program-expands-16-sites-iloilo-province | https://www.iloilo.gov.ph/index.php/en/health-news/resolve-save-lives-lauds-iloilos-healthy-hearts-program-outcome",
                "score": 75.0
        },
        {
                "id": "C28",
                "sector": "Healthcare Service Delivery and Public Health Operations",
                "sufferer_occupation": "Residents, barangay and municipal health personnel, hospitals, response teams, and local government",
                "sufferer_location": "One selected Iloilo municipality or barangay cluster and its surveillance-to-local-action workflow",
                "problem_statement": "A selected Iloilo locality may have an unmeasured delay or documentation gap between dengue surveillance signals and completed barangay-level prevention actions, but the existence, frequency, and consequence of that operational gap must first be verified.",
                "evidence_tier": "Tier 2",
                "workaround": "Provincial surveillance data inform task-force, municipal, and barangay prevention activities, including localized vector-control and education measures; public reports document case burden and response outcomes but not the timeliness or verification of each local action.",
                "quantified_impact": "Delayed or poorly documented action may prolong preventable exposure, make resource prioritization less transparent, and limit evaluation of which local interventions were completed and effective.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D03: Healthcare Service Delivery and Public Health Operations (D03 Health Landscape + official Iloilo dengue surveillance and response reports)",
                "tags": [
                        "D03",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Dengue has high local consequence and a defined surveillance-to-action pathway with measurable timing and completion outcomes; it remains Hold because available evidence documents burden and a successful coordinated response rather than a specific operational failure. | Next Action: Official retrospective reporting states that early 2025 projections reached 21,000 cases, while coordinated provincial and local action limited the reported total to about 5,700 and identified 483 dengue-free barangays. This establishes relevance, not a failure. Evidence: https://iloilo.gov.ph/en/health-news/iloilo-provincial-government-grants-5000-incentives-2025-dengue-free-barangays | https://www.pna.gov.ph/articles/1245627 | Concerns: Do not create another generic case dashboard or hotspot map; identify one operational decision and response stage; distinguish reporting delay from action delay; use aggregate geographic data and avoid exposing households or individuals. | Notes: Official retrospective reporting states that early 2025 projections reached 21,000 cases, while coordinated provincial and local action limited the reported total to about 5,700 and identified 483 dengue-free barangays. This establishes relevance, not a failure. Evidence: https://iloilo.gov.ph/en/health-news/iloilo-provincial-government-grants-5000-incentives-2025-dengue-free-barangays | https://www.pna.gov.ph/articles/1245627",
                "score": 75.0
        },
        {
                "id": "C29",
                "sector": "Healthcare Service Delivery and Public Health Operations",
                "sufferer_occupation": "Outreach participants and caregivers, barangay health workers, primary-care and referral teams, and program managers",
                "sufferer_location": "One selected PHO on Wheels or health-caravan activity and its bounded post-outreach referral pathway",
                "problem_statement": "A selected Iloilo outreach-service pathway may lack complete evidence that patients referred for additional assessment, testing, or treatment completed the next step, but the occurrence and magnitude of this follow-up problem must first be established.",
                "evidence_tier": "Tier 2",
                "workaround": "Iloilo outreach activities provide consultations, dental care, chest X-rays, and other services in communities; public reports describe service delivery but do not show whether patients needing further assessment, referral, or treatment complete the next step.",
                "quantified_impact": "Temporary service contact without continuity may delay needed follow-up and leave outreach teams unable to determine whether referrals were completed or which barriers require action.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D03: Healthcare Service Delivery and Public Health Operations (D03 Health Landscape + official Iloilo PHO on Wheels and health-caravan reports)",
                "tags": [
                        "D03",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: The outreach pathway is concrete, locally active, and potentially measurable without proposing a generic health app; it remains Hold because public sources verify service delivery but do not document post-outreach loss to follow-up. | Next Action: Official Iloilo reports verify PHO on Wheels and community health caravans providing consultations, dental care, chest X-rays, and related services, but they provide no referral-completion figures. Evidence: https://iloilo.gov.ph/en/health-news/bringing-essential-health-services-closer-community | https://iloilo.gov.ph/en/health-news/health-caravan-brings-vital-services-talo-ato-residents | Concerns: Select only one outreach program, service type, locality, and follow-up stage; require an authorized outreach or primary-care partner and de-identified aggregate records; do not assume non-completion from the absence of public reporting. | Notes: Official Iloilo reports verify PHO on Wheels and community health caravans providing consultations, dental care, chest X-rays, and related services, but they provide no referral-completion figures. Evidence: https://iloilo.gov.ph/en/health-news/bringing-essential-health-services-closer-community | https://iloilo.gov.ph/en/health-news/health-caravan-brings-vital-services-talo-ato-residents",
                "score": 75.0
        },
        {
                "id": "C30",
                "sector": "Disaster Risk Reduction and Preparedness",
                "sufferer_occupation": "Residents, road users, businesses, maintenance crews, and local government",
                "sufferer_location": "One recurrently flooded Iloilo City drainage corridor or catchment during a defined wet-season period",
                "problem_statement": "A selected Iloilo City drainage corridor may have recurring obstruction points whose contribution to flooding and priority for maintenance are not established from combined maintenance, field, rainfall, and flood observations.",
                "evidence_tier": "Tier 3",
                "workaround": "Iloilo City conducts de-clogging and waterway-cleaning operations. Reports cite 421 maintenance operations from July 2025 to June 2026 and more than 700 kg of waste removed from drainage waterways daily, while local reporting also identifies drainage capacity, intense rainfall, and saturated soil as possible flood causes.",
                "quantified_impact": "Maintenance resources may be repeatedly deployed without clear evidence of which sites and actions reduce flood depth, duration, or recurrence, while avoidable obstructions may persist.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D05: Disaster Risk Reduction and Preparedness (D05 Disaster Risk Reduction landscape + official and local Iloilo flood-maintenance reporting)",
                "tags": [
                        "D05",
                        "Research Master Concept",
                        "Ready for Problem Brief"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Current local reporting shows a large and recurrent maintenance burden with measurable operational and flood outcomes; the causal contribution of specific obstruction points and the actual prioritization workflow still require local verification. | Next Action: Local reports cite 421 de-clogging or maintenance operations from July 2025 to June 2026 and more than 700 kg of waste removed from waterways daily. Evidence: https://www.panaynews.net/iloilo-eyes-lasting-flood-fix-drainage-master-plan-to-go-beyond-421-declogging-ops/ | https://www.panaynews.net/dirty-burden-iloilo-citys-waterway-trash-surges-past-700-kilos-daily-barangays-along-creeks-to-be-held-accountable/ | https://pia.gov.ph/news/oplan-kontra-baha-seeks-cleaner-waterways-mitigates-flood-in-iloilo-city/ | Multi-cause caution: https://www.imtnews.ph/torrential-rain-clogged-drains-saturated-soil-blamed-for-flooding-in-iloilo-city/ | Concerns: Isolate obstruction effects from rainfall intensity, drainage capacity, tides, and saturated soil; require safe field procedures and agency permission; do not attribute responsibility to households or barangays without evidence. | Notes: Local reports cite 421 de-clogging or maintenance operations from July 2025 to June 2026 and more than 700 kg of waste removed from waterways daily. Evidence: https://www.panaynews.net/iloilo-eyes-lasting-flood-fix-drainage-master-plan-to-go-beyond-421-declogging-ops/ | https://www.panaynews.net/dirty-burden-iloilo-citys-waterway-trash-surges-past-700-kilos-daily-barangays-along-creeks-to-be-held-accountable/ | https://pia.gov.ph/news/oplan-kontra-baha-seeks-cleaner-waterways-mitigates-flood-in-iloilo-city/ | Multi-cause caution: https://www.imtnews.ph/torrential-rain-clogged-drains-saturated-soil-blamed-for-flooding-in-iloilo-city/",
                "score": 75.0
        },
        {
                "id": "C31",
                "sector": "Disaster Risk Reduction and Preparedness",
                "sufferer_occupation": "Residents, especially households in flood-prone areas, evacuees, and local responders",
                "sufferer_location": "One Iloilo barangay cluster exposed to a tropical cyclone and continuing southwest-monsoon rainfall",
                "problem_statement": "Residents in a selected Iloilo community may misinterpret a cyclone-exit or all-clear cue as the end of risk while monsoon-enhanced rainfall and flooding persist, potentially leading to premature return or delayed protective action.",
                "evidence_tier": "Tier 2",
                "workaround": "Storm and rainfall advisories are issued through official and media channels, but a cyclone can exit the Philippine Area of Responsibility while enhanced southwest-monsoon rainfall and flooding continue. A July 2025 Iloilo report described residents returning home before renewed flooding affected 896 families or 3,116 people.",
                "quantified_impact": "Premature return, delayed evacuation, or reduced protective action may increase exposure to renewed flooding and complicate response operations.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D05: Disaster Risk Reduction and Preparedness (D05 Disaster Risk Reduction landscape + Iloilo post-event and continuing-hazard reports)",
                "tags": [
                        "D05",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: The documented event suggests a consequential compound-hazard interpretation problem with observable timing and behavior, but recurrence, causality, and the responsible communication stage are not yet established. | Next Action: A July 2025 local report described renewed flooding after some residents returned home and recorded 896 affected families or 3,116 people; later reports also show the recurring cyclone-plus-habagat pattern. Evidence: https://www.imtnews.ph/torrential-rain-clogged-drains-saturated-soil-blamed-for-flooding-in-iloilo-city/ | https://pia.gov.ph/news/iloilo-city-sends-disaster-responses-amid-kiyapo-habagat/ | Concerns: Verify recurrence and the exact information pathway; distinguish official message content from media framing, rumor, and individual interpretation; do not label residents as misinformed from a single event report. | Notes: A July 2025 local report described renewed flooding after some residents returned home and recorded 896 affected families or 3,116 people; later reports also show the recurring cyclone-plus-habagat pattern. Evidence: https://www.imtnews.ph/torrential-rain-clogged-drains-saturated-soil-blamed-for-flooding-in-iloilo-city/ | https://pia.gov.ph/news/iloilo-city-sends-disaster-responses-amid-kiyapo-habagat/",
                "score": 75.0
        },
        {
                "id": "C32",
                "sector": "Disaster Risk Reduction and Preparedness",
                "sufferer_occupation": "Heat-exposed residents and workers, students, vulnerable groups, service providers, and local government",
                "sufferer_location": "One Iloilo City locality or institution during defined high-heat periods and the city's developing heat-action planning process",
                "problem_statement": "A selected Iloilo City locality or institution may lack sufficiently localized and validated evidence to identify when and where vulnerable groups face actionable extreme-heat risk and whether existing protective measures reach them.",
                "evidence_tier": "Tier 3",
                "workaround": "The City Health Office tracks heat-related and heat-associated consultations, and Iloilo City is validating local heat risks and vulnerable groups for an Urban Heat Action Plan. Public reporting counted 924 broadly classified heat-related or heat-associated cases over five weeks and a heat-index peak of 47 degrees Celsius.",
                "quantified_impact": "Protective measures may be too broad, late, or poorly targeted, while preventable heat exposure, service demand, lost work or school time, and health complications continue.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D05: Disaster Risk Reduction and Preparedness (D05 Disaster Risk Reduction landscape + Iloilo health reporting + Urban Heat Action Plan evidence)",
                "tags": [
                        "D05",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: The burden is current, locally documented, climate-relevant, and linked to an active planning pathway; the case definition, spatial or institutional unit, and exact operational decision still need validation. | Next Action: Public reporting counted 924 broadly classified heat-related or heat-associated cases over five weeks and a peak heat index of 47 degrees Celsius; Iloilo City is also validating local risks for an Urban Heat Action Plan. Evidence: https://www.pna.gov.ph/index.php/articles/1275063 | https://www.sunstar.com.ph/iloilo/iloilo-city-health-office-to-public-brace-for-el-ni%C3%B1o | https://www.unescap.org/events/2026/iloilo-city-urban-heat-action-planning-workshop-validating-local-heat-risks | Concerns: Treat the 924 figure as a broad heat-related or heat-associated classification, not 924 confirmed heat illnesses; use de-identified aggregate data, validated exposure definitions, and one bounded decision context; cross-domain relevance to D03. | Notes: Public reporting counted 924 broadly classified heat-related or heat-associated cases over five weeks and a peak heat index of 47 degrees Celsius; Iloilo City is also validating local risks for an Urban Heat Action Plan. Evidence: https://www.pna.gov.ph/index.php/articles/1275063 | https://www.sunstar.com.ph/iloilo/iloilo-city-health-office-to-public-brace-for-el-ni%C3%B1o | https://www.unescap.org/events/2026/iloilo-city-urban-heat-action-planning-workshop-validating-local-heat-risks",
                "score": 75.0
        },
        {
                "id": "C33",
                "sector": "Disaster Risk Reduction and Preparedness",
                "sufferer_occupation": "Residents of flood-prone communities, barangay and municipal responders, and local decision-makers",
                "sufferer_location": "One Iloilo municipality or barangay cluster using manual rain gauges or other local flood-observation points",
                "problem_statement": "A selected Iloilo locality may experience incomplete or delayed rainfall and flood observations because of equipment, coverage, reporting, communications, or power-continuity limitations, potentially weakening localized warning and response decisions.",
                "evidence_tier": "Tier 2",
                "workaround": "Local personnel inspect, read, communicate, and report rainfall or flood observations. Official provincial inventories documented nonfunctional manual rain gauges in Calinog, insufficient strategic coverage in other areas, and needs involving standardized reporting, communications, and power continuity.",
                "quantified_impact": "Warning and response decisions may rely on missing, delayed, or unrepresentative observations, reducing lead time and confidence in localized action.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D05: Disaster Risk Reduction and Preparedness (D05 Disaster Risk Reduction landscape + official Iloilo early-warning-system inventories)",
                "tags": [
                        "D05",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: Official sources document concrete operational weaknesses with measurable completeness, uptime, timeliness, and coverage outcomes; currency, recurrence, and the affected local decision must be confirmed before prioritization. | Next Action: Official Iloilo sources reported nonfunctional manual rain gauges, insufficient strategic coverage, and needs involving standardized reporting and communication or power continuity. Evidence: https://iloilo.gov.ph/en/environment-news/pdrrmo-conducts-mrg-inventory-enhance-iloilos-flood-monitoring | https://iloilo.gov.ph/en/environment-news/iloilo-drrm-officers-push-enhanced-early-warning-systems | Concerns: The strongest inventory evidence is from 2024 and must be checked for current status; separate device failure, siting or coverage, reporting, communications, and power causes; avoid proposing additional sensors before confirming an operational need. | Notes: Official Iloilo sources reported nonfunctional manual rain gauges, insufficient strategic coverage, and needs involving standardized reporting and communication or power continuity. Evidence: https://iloilo.gov.ph/en/environment-news/pdrrmo-conducts-mrg-inventory-enhance-iloilos-flood-monitoring | https://iloilo.gov.ph/en/environment-news/iloilo-drrm-officers-push-enhanced-early-warning-systems",
                "score": 75.0
        },
        {
                "id": "C34",
                "sector": "Disaster Risk Reduction and Preparedness",
                "sufferer_occupation": "Evacuees, especially children, older adults, persons with disabilities, pregnant people, and the personnel responsible for center operations",
                "sufferer_location": "One Iloilo municipality or barangay with designated evacuation centers under a defined hazard scenario",
                "problem_statement": "A selected Iloilo locality may lack current, verifiable evidence that designated evacuation centers are ready and suitable for the expected population and vulnerable groups under a defined hazard scenario.",
                "evidence_tier": "Tier 2",
                "workaround": "Local governments designate and assess evacuation centers, while local disaster officials identify sanitation, potable water, ventilation, comfort rooms, and privacy for vulnerable evacuees as readiness requirements. Readiness information may be inspected manually and may change with occupancy, supplies, and facility condition.",
                "quantified_impact": "Evacuees may be directed to unsuitable or underprepared facilities, while supplies, staffing, or alternate sites are arranged late, increasing health, safety, accessibility, and dignity risks.",
                "evidence_types": [
                        "Field Observation",
                        "Local Workflow Record",
                        "Preliminary Policy"
                ],
                "source": "master_research_concept_sheet",
                "source_detail": "D05: Disaster Risk Reduction and Preparedness (D05 Disaster Risk Reduction landscape + Iloilo evacuation-center readiness reporting)",
                "tags": [
                        "D05",
                        "Research Master Concept",
                        "Investigate"
                ],
                "status": "PROPOSED",
                "notes": "Rationale: The preparedness requirements and consequences are locally documented and important, but the operational failure, update need, and computing contribution remain conditional and must be established in one locality. | Next Action: Local disaster officials identified sanitation, potable water, ventilation, comfort rooms, and privacy for vulnerable evacuees as readiness needs; a mobile-shower turnover illustrates ongoing sanitation support. Evidence: https://www.pna.gov.ph/articles/1263022 | https://www.dailyguardian.com.ph/blog/metro-pacific-iloilo-water-turns-over-mobile-shower-to-iloilo-city-government1 | Concerns: Avoid a generic center registry or simple facility count; verify a real readiness decision, update frequency, and consequence; protect sensitive facility vulnerabilities and individual evacuee information; include accessibility and privacy requirements. | Notes: Local disaster officials identified sanitation, potable water, ventilation, comfort rooms, and privacy for vulnerable evacuees as readiness needs; a mobile-shower turnover illustrates ongoing sanitation support. Evidence: https://www.pna.gov.ph/articles/1263022 | https://www.dailyguardian.com.ph/blog/metro-pacific-iloilo-water-turns-over-mobile-shower-to-iloilo-city-government1",
                "score": 75.0
        }
]
        seeded = []
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            # Ensure project exists
            conn.execute("""
                INSERT OR IGNORE INTO projects (id, name, share_code, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            """, (project_id, f"Project {project_id}", project_id[:8].upper(), now, now))
            for p in MASTER_RESEARCH_PROBLEMS:
                prob_id = p['id'] if project_id in ('default_proj', None) else f"{p['id']}-{project_id[-6:]}"
                # Insert or ignore if problem already exists
                cur = conn.execute("SELECT id FROM problems WHERE id = ? AND project_id = ?", (prob_id, project_id))
                if not cur.fetchone():
                    conn.execute("""
                        INSERT INTO problems (
                            id, project_id, session_id, sector, sufferer_occupation,
                            sufferer_location, problem_statement, evidence_tier, workaround,
                            quantified_impact, evidence_types, source, source_detail,
                            tags, status, notes, score, votes, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
                    """, (
                        prob_id, project_id, None, p["sector"],
                        p["sufferer_occupation"], p["sufferer_location"], p["problem_statement"],
                        p["evidence_tier"], p["workaround"], p["quantified_impact"],
                        json.dumps(p["evidence_types"]), p["source"], p["source_detail"],
                        json.dumps(p["tags"]), p["status"], p["notes"], p["score"],
                        now, now
                    ))
                    seeded.append({**p, "id": prob_id, "project_id": project_id})
            conn.commit()
        return seeded
