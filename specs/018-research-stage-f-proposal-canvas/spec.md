# CONVERA SDD-018: Research Stage F Proposal Canvas & Feasibility Engine
# System Design Document & Functional Specification

**Specification ID**: CONVERA-SDD-018  
**Classification**: Research Track Core Intelligence (Stage F Relevance, Ethics, Feasibility & Gate 4 Synthesis)  
**Authority Tier**: Tier 2 (Technical Specification & Design Contract)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/018-research-stage-f-proposal-canvas`  
**Target Integration Branch**: `develop`  
**Governing Standard**: CONVERA Core Design System (CCDS v2.0), Computing Research Concept Development Framework (§3.17, §6.4, §19, §22), Republic Act 10173 (Data Privacy Act of 2012), DOST-PCIEERD National AI Roadmap (NAIR), UN Sustainable Development Goals (SDGs)  
**Constitutional Articles**: Article I (Grounded Epistemology), Article II (Tri-Part Confidence), Article IV (Human Sovereignty), Article VII (Anti-Creep Law), Article VIII (Degraded Resilience)  

---

## 1. Context, Motivation & Problem Statement

### 1.1 Context
In the computing research lifecycle governed by the Design Science Research (DSR) paradigm (Hevner et al., 2004; Vaishnavi & Kuechler, 2015; Prat et al., 2015; Venable et al., 2016), scientific inquiry ratchets through six canonical stages:
1. **Stage A**: Domain Scouting, Variable Operationalization & Problem Formulation (Bordens & Abbott, 2018).
2. **Stage B**: Problem Validation, Empirical Grounding & Dual-Literature Retrieval (Gate 1).
3. **Stage C**: Research Opportunity, Scholarly Matrix & Research Questions (Gate 2).
4. **Stage D**: DSR Artifact Formulation across 4 Classes with Kernel Theory (SDD-016).
5. **Stage E**: Controlled Multi-Criteria Rigor Evaluation & Circumscription Trapping (SDD-017, Gate 3).
6. **Stage F: Relevance, Ethics, Feasibility & Gate 4 Capstone Proposal Clearance**.

Across specifications SDD-001 through SDD-017, Stages A through E have been fully designed, implemented, and verified in both backend domain engines and interactive frontend UI components.

### 1.2 The Problem
Currently, **Stage F** is the sole remaining unbuilt stage in CONVERA's Research Track:
1. **Placeholder Interface**: In `ResearchWorkspaceView.tsx` (lines 884–901), Stage F is rendered as a static descriptive placeholder box with no interactive capabilities, data models, or compilation workflows.
2. **Disconnected Compliance & Feasibility Audit**: Researchers have no auditable mechanism to evaluate compliance with regulatory statutes (e.g., Republic Act 10173 / Data Privacy Act of 2012), institutional ethics review protocols (IRB / REC exemptions), or national priority roadmaps (UN SDGs, DOST-PCIEERD NAIR).
3. **Static, Disconnected Proposal Exporter**: While `ProposalExporter` exists in `backend/engines/proposal_exporter.py`, it contains hardcoded fallbacks and is not reactively wired to live Stage D artifacts (`dsr_artifacts`), Stage E evaluations (`concept_evaluations`), or dynamic user-configured feasibility parameters.
4. **Missing Gate 4 Clearance & Attributable Sign-off UI**: Although `GateEngine` defines `GATE_4` and `sqlite_adapter` contains `mentor_signoffs`, there is no unified interface for a thesis advisor or panelist to review the integrated concept canvas, audit the feasibility/ethics checklist, record formal Gate 4 clearance, and digitally sign off on proposal defense readiness.

---

## 2. Core Epistemic Foundations & Invariants

### 2.1 The Four Stage F Assessment Pillars

Every candidate thesis concept undergoing Stage F synthesis is evaluated across four core pillars:

1. **Regulatory & Ethical Compliance**:
   - Verification against **Republic Act 10173** (Data Privacy Act of 2012): anonymization of telemetry, explicit informed consent, and minimal collection.
   - Institutional Review Board (IRB) / Research Ethics Committee (REC) compliance tier (Exempt, Expedited, Full Review).
   - Algorithmic fairness, safety, and potential dual-use hazards.
2. **Institutional & National Priority Alignment**:
   - Mapping to 1–3 **UN Sustainable Development Goals (SDGs)** (e.g., SDG 2 Zero Hunger, SDG 9 Industry & Innovation, SDG 12 Responsible Consumption).
   - Alignment with national research agendas (**DOST-PCIEERD / NICER Priority Roadmaps**, National AI Roadmap / NAIR).
   - Alignment with university/institutional research thrusts (e.g., WVSU Core Values & Research Agenda).
3. **Execution Feasibility & Resource Budgeting**:
   - **Compute & Hardware Budget**: Device availability (edge microcontrollers, GPU hours, cloud compute limits).
   - **Dataset Availability & Rights**: Data licensing, collection permissions, sample size adequacy.
   - **Timeline & Milestones**: Capstone schedule viability (pilot study, implementation, defense window).
4. **Integrated DSR Proposal Canvas & Living Monograph**:
   - Real-time reactive aggregation of Stage A (Problem & Variables), Stage B (Empirical Grounding), Stage C (Literature Matrix & RQs), Stage D (Artifact Specs & Kernel Theory), Stage E (Evaluation Rubric & Circumscription History), and Stage F (Feasibility, Ethics & Roadmap Alignment).
   - 1-Click academic export to structured Markdown and printable formatted document.

### 2.2 Constitutional Invariants

- **`INV-018-01` (Article VII Anti-Creep Law)**: Zero new third-party dependencies. All models use Pydantic v2; all database operations use existing SQLite WAL; frontend uses CCDS v2.0 Tailwind CSS tokens.
- **`INV-018-02` (Article II Tri-Part Confidence)**: Compliance status and feasibility score are calculated deterministically. AI provides advisory narrative synthesis only and cannot override compliance violations.
- **`INV-018-03` (Article IV Human Sovereignty)**: Automated Gate 4 checks are strictly advisory. Final Proposal Clearance and Stage Advancement require an explicit, attributable human mentor sign-off (`mentor_signoffs`). The AI system cannot self-authorize defense readiness.
- **`INV-018-04` (Article VIII Degraded Resilience)**: Deterministic offline mode ensures complete functionality (checklist verification, budget calculation, and proposal compilation) even if LLM providers are unreachable.

---

## 3. User Scenarios & Acceptance Criteria

### User Scenario 1: Comprehensive Ethics & Feasibility Audit
- **Given** an active research session with a selected primary concept from Stage E,
- **When** the researcher accesses Stage F in `ResearchWorkspaceView`,
- **Then** the system presents an interactive Feasibility & Ethics Audit covering Data Privacy (RA 10173), Institutional Ethics, UN SDGs, DOST-PCIEERD alignment, and a resource budget calculator.

### User Scenario 2: Live DSR Proposal Canvas & 1-Click Export
- **Given** validated data across Stages A through E and completed Stage F feasibility parameters,
- **When** the researcher clicks "Compile DSR Proposal Canvas",
- **Then** the engine aggregates live relational records from all 6 stages into a comprehensive academic monograph with markdown preview and download capability.

### User Scenario 3: Attributable Gate 4 Clearance & Mentor Sign-off
- **Given** a compiled proposal canvas with all mandatory Gate 4 criteria passing ($\ge 80.0\%$),
- **When** the research advisor enters their name, role, and defense recommendation notes,
- **Then** a persistent `mentor_signoffs` record is committed, `gate_reviews` is updated with `GATE_4: PASS`, and the session is certified as Proposal Defense Ready.

---

## 4. Functional Requirements

### 4.1 Storage & Relational Persistence
- **FR-018-01**: Maintain Table 35 (`research_feasibility_records`) in SQLite WAL capturing:
  - `id` (UUID PK), `session_id`, `project_id`, `ethics_checklist_json`, `sdg_alignments_json`, `dost_alignments_json`, `budget_breakdown_json`, `timeline_weeks`, `feasibility_score`, `is_cleared`, `created_at`, `updated_at`.
- **FR-018-02**: Provide methods in `SQLiteStorageAdapter`:
  - `save_feasibility_record(data: Dict[str, Any]) -> Dict[str, Any]`
  - `get_feasibility_record(session_id: str) -> Optional[Dict[str, Any]]`

### 4.2 Domain Engine & Intelligence Service
- **FR-018-03**: Create `backend/engines/feasibility_engine.py` (`FeasibilityEngine`) to evaluate compliance matrices, calculate deterministic feasibility scores, and generate AI-guided ethics advisories.
- **FR-018-04**: Upgrade `backend/engines/proposal_exporter.py` (`ProposalExporter`) to dynamically query and bind live database entities:
  - `ProblemRecord` (Stage A)
  - `claim_evidence_links` & `scholarly_works` (Stages B & C)
  - `dsr_artifacts` (Stage D)
  - `concept_evaluations` & `circumscription_iterations` (Stage E)
  - `research_feasibility_records` & `mentor_signoffs` (Stage F)

### 4.3 API Router Endpoints
- **FR-018-05**: Mount `/api/feasibility` endpoints in `backend/routers/feasibility.py`:
  - `POST /api/feasibility/evaluate`: Evaluate and persist feasibility record.
  - `GET /api/feasibility/session/{session_id}`: Retrieve feasibility record for a session.
  - `POST /api/feasibility/compile-proposal`: Compile complete live 6-stage DSR Proposal Monograph.
  - `POST /api/feasibility/mentor-signoff`: Record attributable advisor authorization.
  - `GET /api/feasibility/mentor-signoff/{project_id}`: List advisor sign-offs for project.

### 4.4 Research Orchestrator Integration
- **FR-018-06**: Extend `ActionType` in `backend/models/orchestrator.py` with:
  - `AUDIT_COMPLIANCE_FEASIBILITY = "AUDIT_COMPLIANCE_FEASIBILITY"`
  - `COMPILE_PROPOSAL_CANVAS = "COMPILE_PROPOSAL_CANVAS"`
- **FR-018-07**: Update `ResearchOrchestrator.dispatch_action` to route these action types to `FeasibilityEngine` and `ProposalExporter`.

### 4.5 Frontend Presentation (CCDS v2.0)
- **FR-018-08**: Implement `web/src/services/feasibilityService.ts` for all API interactions.
- **FR-018-09**: Create `web/src/components/research/feasibility/StageFFeasibilityView.tsx` with tabs:
  1. *Ethics & Regulatory Compliance (RA 10173 & IRB)*
  2. *Strategic Roadmap Alignment (SDGs & DOST-PCIEERD)*
  3. *Execution Feasibility & Resource Budget*
  4. *Living DSR Proposal Canvas & Export*
  5. *Gate 4 Defense Clearance & Attributable Sign-off*
- **FR-018-10**: Mount `StageFFeasibilityView` inside `ResearchWorkspaceView.tsx` replacing the static placeholder.
