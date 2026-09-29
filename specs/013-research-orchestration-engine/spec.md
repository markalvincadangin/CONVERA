# CONVERA SDD-013: Feature Specification
# Research Orchestration Engine (Unified Intelligence & Research Loop)

**Specification ID**: CONVERA-SDD-013  
**Classification**: Research Workflow Orchestration & Intelligence Coordination  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Baseline Git Commit**: `9e7f2a6` (Ratified IDENTITY.md Baseline)  
**Proposed Feature Branch**: `feature/013-research-orchestration-engine`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, IV, V, VI, VII, VIII)  
- `docs/00-foundation/IDENTITY.md` (`CONVERA-FND-005` — Core System Identity & Boundaries, §1, §2, §4, §5, §13, §14, §15, §16, §17, §19, §21)  
- `convera_revised_roadmap.md` (Phase B: The Orchestration Core, Work Item B1)  
- `docs/01-product/PRODUCT_DEFINITION.md` (The Universal Transformation Model)  
- `specs/011-methodology-contract/` (Methodology Contract Architecture)  
- `specs/004-deterministic-decision-intelligence/` (Decision Engine)  
- `specs/006-scholarly-evidence-persistence-fts5/` (Scholarly Works FTS5)  
- `specs/007-source-mediated-epistemic-bridge/` (Epistemic Bridge)  
- `specs/012-tool-integrations-and-progressive-identity/` (Tool Integrations)  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Operational Problem
CONVERA currently possesses 29 specialized internal engines (`decision_engine`, `literature_matrix`, `devils_advocate`, `blind_spot_detector`, `contradiction_engine`, `evidence_scorer`, `gate_engine`, `srs_generator`, `problem_parser`, etc.) and a framework-agnostic Methodology Contract service (`specs/011-methodology-contract`).

However, these engines exist in **operational silos**:
1. **Manual User Coordination**: A researcher must manually navigate to isolated screens, click disconnected buttons, and manually invoke individual engines without continuous context flow.
2. **Missing Intelligence Routing (GAP-3)**: There is no central orchestration loop that asks:
   > *"Given research session S, active problem P, and current methodology stage M: what is our verified state, what evidence is missing, what assumptions must be challenged, and what exact action should the team execute next?"*
3. **Disconnected Critique & Decision Cycles**: The Devil's Advocate and Blind Spot engines run on-demand rather than proactively informing stage gate transitions and candidate scoring trade-offs.

### 1.2 The Solution: SDD-013 Research Orchestrator
SDD-013 introduces the **Research Orchestration Engine** (`backend/services/research_orchestrator.py` and `backend/routers/orchestrator.py`), operationalizing the 11-step core system loop ratified in `docs/00-foundation/IDENTITY.md` §17:

$$\text{UNDERSTAND} \longrightarrow \text{CONTEXTUALIZE} \longrightarrow \text{INVESTIGATE} \longrightarrow \text{IDENTIFY GAPS} \longrightarrow \text{REASON} \longrightarrow \text{CRITIQUE} \longrightarrow \text{DECIDE} \longrightarrow \text{ACT} \longrightarrow \text{RECORD} \longrightarrow \text{VALIDATE} \longrightarrow \text{CONTINUE}$$

The Orchestrator unifies research state aggregation, methodology contract enforcement, automated critique injection, next-action recommendation, and auditable event tracking into a single cohesive coordination service.

---

## 2. Governing Invariants & Constitutional Constraints

All implementations of SDD-013 must strictly conform to these invariants:

1. **`INV-013-01` (LLM-Last Order of Precedence)**:
   The Orchestrator must compute stage prerequisite compliance, evidence item counts, epistemic scores, and missing required outputs using **pure deterministic rules** before invoking any LLM for qualitative synthesis or narrative guidance.
2. **`INV-013-02` (Human Sovereignty Over Stage Promotion)**:
   The Orchestrator provides recommendations, identifies blocking gaps, and prepares candidate action payloads, but **must never automatically promote a research session past a methodology quality gate** without explicit human ratification (Article IV of the Constitution).
3. **`INV-013-03` (Canonical Independence & Relational State)**:
   The Orchestrator reads and updates canonical SQLite WAL tables (`sessions`, `problems`, `problem_sources`, `claim_evidence_links`, `decisions`). It must never introduce an ephemeral out-of-band memory store that bypasses the relational database.
4. **`INV-013-04` (Replaceable Provider Boundary)**:
   When external tool actions are recommended (e.g. exporting to Notion or Zotero), the Orchestrator emits structured, tool-agnostic dispatch events via the Tool Integration layer (SDD-012) rather than coupling directly to vendor APIs.
5. **`INV-013-05` (Zero New Dependencies)**:
   Zero new third-party Python packages shall be added to `backend/pyproject.toml`. The engine must utilize existing standard library, Pydantic, FastAPI, and SQLite WAL infrastructure.

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 — Continuous Research State Evaluation (Priority: P1)
As a researcher actively investigating an agricultural technology problem,  
I want CONVERA to evaluate my current research session against the active methodology contract,  
So that I immediately see which stage requirements are met, what empirical evidence is missing, and what Socratic critique applies to my claims.

**Acceptance Criteria**:
1. **Given** an active research session linked to a problem and a methodology contract (e.g. `RESEARCH_CRCDP` Stage A),  
   **When** `POST /api/orchestrator/evaluate` is called,  
   **Then** the response contains:
   - `stage_status`: Current stage ID, name, whether prerequisites are satisfied, and list of unsatisfied outputs.
   - `epistemic_health`: Count of verified empirical facts, unvalidated assumptions, and net epistemic score.
   - `critique_summary`: Socratic blind spots, potential contradictions, and falsification questions from the critique engines.
   - `recommended_actions`: Deterministically ranked list of concrete next actions to make progress.

### User Story 2 — Deterministic Next-Action Recommendation (Priority: P1)
As a researcher who is unsure what to do next in the research lifecycle,  
I want CONVERA to recommend the highest-priority next action,  
So that our team does not waste time on downstream tasks (such as writing technical specs) before validating core problem assumptions.

**Acceptance Criteria**:
1. **Given** a problem with 0 empirical literature citations linked to its claims,  
   **When** the Orchestrator evaluates the state,  
   **Then** the top recommended action is `ACQUIRE_EVIDENCE` (pointing to scholarly search via FTS5/connectors), with priority `URGENT`.
2. **Given** a problem with high AI linguistic certainty but low empirical evidence,  
   **When** evaluated,  
   **Then** the Orchestrator emits an `OVERCONFIDENCE_WARNING` action recommending assumption falsification.
3. **Given** all stage required outputs are present and evidence criteria are met,  
   **When** evaluated,  
   **Then** the Orchestrator recommends `REQUEST_GATE_REVIEW` for human sign-off.

### User Story 3 — Governed Action Dispatcher (Priority: P2)
As a researcher working through an orchestration recommendation,  
I want to execute an action directly through the orchestrator (e.g., trigger literature search, run devil's advocate, or generate stage brief),  
So that the system coordinates the appropriate engine, records the provenance event, and updates the research state automatically.

**Acceptance Criteria**:
1. **Given** an orchestration recommendation to run a Devil's Advocate critique,  
   **When** `POST /api/orchestrator/dispatch-action` is called with action `EXECUTE_CRITIQUE`,  
   **Then** the Orchestrator invokes `devils_advocate.py`, persists the generated challenge questions to the session record, and emits an `orchestration_event` in SQLite.
2. **Given** an orchestration recommendation to search literature for an identified gap,  
   **When** `POST /api/orchestrator/dispatch-action` is called with action `SEARCH_EVIDENCE_FOR_GAP`,  
   **Then** the Orchestrator queries local FTS5 `scholarly_works` or federated connectors, ranks results, and returns evidence candidates ready for claim linking.

---

## 4. Architectural Component Overview

```text
                                 RESEARCH ORCHESTRATOR
                        (backend/services/research_orchestrator.py)
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
1. STATE AGGREGATOR              2. METHODOLOGY EVALUATOR          3. CRITIQUE SYNTHESIZER
 • SQLite Relational Graph        • Active Methodology Contract     • Devil's Advocate
 • Problems & Statements          • Stage Prerequisite Check        • Blind Spot Detector
 • Claims & Assumptions           • Missing Output Detection        • Contradiction Matrix
 • Scholarly Works (FTS5)         • Epistemic Balance Thresholds    • Overconfidence Guardrail
 • Decisions & Lineage                     │                                 │
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           │
                                           ▼
                                 4. ACTION RECOMMENDER
                                  (Deterministic Rules)
                                           │
                       ┌───────────────────┴───────────────────┐
                       ▼                                       ▼
             NEXT RESEARCH ACTIONS                    STAGE GATE READINESS
             • Acquire Evidence (FTS5)                • Blocking Gaps
             • Challenge Assumptions                  • Gate Review Prompt
             • Synthesize Matrix                      • Human Ratification
             • Draft Stage Deliverable                • Advance Session
```

---

## 5. Non-Functional & Quality Requirements

1. **Evaluation Latency**:
   The deterministic evaluation phase (state aggregation + methodology gate check + rule ranking) must execute in $\le 50\text{ ms}$ `[ENGINEERING TARGET]`.
2. **Offline Resilience**:
   The Orchestrator must be 100% operational in offline environments using local SQLite FTS5 search and deterministic rules without requiring cloud LLM connectivity.
3. **Test Coverage**:
   Dedicated automated test suite (`backend/tests/test_research_orchestrator.py`) verifying all 11 loop states, overconfidence detection, and recommendation rankings with zero regressions across the existing 266 offline tests.
