# CONVERA SDD-016: Structured Ideation & 4 DSR Artifact Formulation Engine
# System Design Document & Functional Specification

**Specification ID**: CONVERA-SDD-016  
**Classification**: Research Track Core Intelligence (Stage D Artifact Formulation)  
**Authority Tier**: Tier 2 (Technical Specification & Design Contract)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/016-dsr-artifact-ideation`  
**Target Integration Branch**: `develop`  
**Governing Standard**: CONVERA Core Design System (CCDS v2.0) & Computing Research Concept Development Framework (§3.11–3.12)  
**Constitutional Articles**: Article I (Grounded Epistemology), Article II (Tri-Part Confidence), Article IV (Human Sovereignty), Article VII (Anti-Creep Law)  

---

## 1. Context, Motivation & Problem Statement

### 1.1 Context
In the computing research lifecycle governed by the Design Science Research (DSR) paradigm (Hevner et al., 2004; Vaishnavi & Kuechler, 2015), research proceeds from:
1. **Stage A**: Domain Scouting & Friction Identification.
2. **Stage B**: Academic Grounding & Dual-Literature Validation (Gate 1).
3. **Stage C**: Opportunity Framing, Thesis Formulation & Literature Gap Synthesis (Gate 2).
4. **Stage D**: **Artifact Formulation & Design Synthesis**.
5. **Stage E**: Controlled Evaluation & Rigor Assessment (Gate 3).
6. **Stage F**: Feasibility, Ethics & Defense Readiness (Gate 4).

Through **CONVERA-SDD-015**, CONVERA successfully automated the federated retrieval and synthesis of literature gaps (`GAP-01`, `GAP-02`, etc.) in the **Literature Matrix**.

### 1.2 The Problem
Currently, **Stage D** in CONVERA's `ResearchWorkspaceView.tsx` consists of static placeholder cards describing the four March & Smith (1995) artifact types. Researchers face three critical blockers:
1. **No Abductive Suggestion Engine**: Moving from an observed research gap to a tentative solution artifact is an **abductive leap** (Peirce, 1931; Cross, 2006). Researchers have no tool to assist in systematically generating candidate computational concepts.
2. **Missing Kernel Theory Grounding**: Candidate solutions in student and faculty proposals are frequently ad-hoc heuristics ungrounded in established computational, natural, or behavioral laws (Walls et al., 1992; Gregor & Jones, 2007).
3. **Lack of Solution Persistence**: CONVERA lacks relational storage (`dsr_artifacts`) to track candidate artifacts, their mathematical/algorithmic specifications, targeted gap linkages, and simpler baseline alternatives (violating Epistemic Rules 5 & 6).

---

## 2. Core Epistemic Foundations

### 2.1 The Four DSR Artifact Classes (March & Smith, 1995; Vaishnavi & Kuechler, 2015)
Every proposed computing research contribution must be explicitly categorized into one of four classes:
1. **`CONSTRUCT`**: Specialized domain vocabularies, concepts, formal ontologies, metric definitions, and symbolic notations that frame the problem space.
2. **`MODEL`**: Sets of propositions expressing relationships among constructs, causal diagrams, state machines, or formal mathematical systems.
3. **`METHOD`**: Goal-directed algorithmic procedures, optimization routines, pipeline heuristics, or formal step-by-step guidance.
4. **`INSTANTIATION`**: Physical operational implementations, edge hardware testbeds, sensor arrays, or software systems demonstrating viability.

### 2.2 Kernel Theory Grounding (Walls et al., 1992; Gregor & Jones, 2007)
An artifact formulation must explicitly cite its governing **Kernel Theory**—the scientific or mathematical principle providing the theoretical justification for why the artifact will function.
- *Examples*: Information Foraging Theory, Queueing Theory, CAP Theorem, Fungal Respiration Kinetics, Amdahl's Law, Nyquist-Shannon Sampling Theorem.

### 2.3 Epistemic Safeguards (Rules 5 & 6)
- **Rule 5 (Existing Software / Baselines Must Be Audited)**: The ideation engine must formulate and record at least one **simpler, established baseline alternative** (e.g., standard thresholding or linear regression) to prevent premature over-engineering.
- **Rule 6 (Technology Does Not Create Novelty)**: Buzzwords ("uses AI", "uses blockchain") are strictly disallowed as primary novelty statements; novelty must reside in the problem formulation or computational mechanism.

---

## 3. User Scenarios & Acceptance Criteria

### User Scenario 1: Automated Abductive Suggestion Generation
- **Given** an active problem anchor (e.g., post-harvest fungal contamination in grain silos) with synthesized literature gaps from Phase C (`GAP-01: Edge latency bottlenecks`),
- **When** the researcher navigates to Phase D and clicks "Abductive Suggestion",
- **Then** the engine generates a balanced set of candidate DSR artifacts across the 4 classes (Construct, Model, Method, Instantiation), each linked to the targeted gaps, grounded in a kernel theory, and accompanied by a simpler baseline alternative.

### User Scenario 2: Manual Artifact Authoring & Customization
- **Given** a researcher who has an existing novel algorithm or hardware design,
- **When** the researcher clicks "Add Custom Artifact",
- **Then** a modal opens allowing them to input title, select the DSR class, define the kernel theory, link targeted gaps from the problem bank, specify the formal equations/pseudocode, and save the artifact to SQLite.

### User Scenario 3: Primary Thesis Artifact Selection for Gate 3
- **Given** multiple candidate artifacts in the Phase D canvas,
- **When** the research team selects one candidate as the primary thesis artifact,
- **Then** its status transitions to `SELECTED`, locking in the artifact specification for Stage E experimental design and Gate 3 evaluation clearance.

---

## 4. Functional Requirements

### 4.1 Storage & Relational Persistence
- **FR-016-01**: Maintain table `dsr_artifacts` in SQLite WAL with foreign key constraints to `problems(id)`.
- **FR-016-02**: Support fields: `id`, `problem_id`, `session_id`, `title`, `dsr_class`, `description`, `kernel_theory`, `targeted_gap_ids`, `linked_claim_ids`, `formal_specification`, `simpler_baseline_alternative`, `contextual_constraints`, `feasibility_score`, `novelty_score`, `status`, `provenance`, timestamps.
- **FR-016-03**: Enforce DSR class enum: `'CONSTRUCT'`, `'MODEL'`, `'METHOD'`, `'INSTANTIATION'`.
- **FR-016-04**: Enforce status enum: `'PROPOSED'`, `'SELECTED'`, `'REFUTED'`, `'ARCHIVED'`.

### 4.2 Domain Engine (`IdeationEngine`)
- **FR-016-05**: Implement `IdeationEngine.generate_dsr_candidates(problem_id, context, prompt_guidance)` in `backend/engines/ideation_engine.py`.
- **FR-016-06**: Ingest problem brief, claims, and literature gaps to construct an abductive reasoning prompt.
- **FR-016-07**: Return structured candidates strictly conforming to March & Smith (1995) 4 classes with kernel theory and simpler baseline alternative.
- **FR-016-08**: Provide resilient fallback mock generation if LLM gateway is offline or unconfigured.

### 4.3 API Router Endpoints
- **FR-016-09**: `POST /api/ideation/generate`: Triggers candidate generation for a problem.
- **FR-016-10**: `GET /api/ideation/problem/{problem_id}/artifacts`: Lists all DSR artifacts for a problem with optional class filtering.
- **FR-016-11**: `POST /api/ideation/artifacts`: Creates or imports a custom DSR artifact.
- **FR-016-12**: `PATCH /api/ideation/artifacts/{artifact_id}`: Updates status, specification, or ratings.
- **FR-016-13**: `DELETE /api/ideation/artifacts/{artifact_id}`: Deletes an artifact.

### 4.4 Research Orchestrator Action Dispatch
- **FR-016-14**: Add `ActionType.FORMULATE_DSR_ARTIFACT` to `backend/models/orchestrator.py`.
- **FR-016-15**: When research session is at `stage_d_formulation` with 0 selected artifacts, recommend `FORMULATE_DSR_ARTIFACT` as HIGH priority.
- **FR-016-16**: Handle `ActionType.FORMULATE_DSR_ARTIFACT` in `ResearchOrchestrator.dispatch_action()` and log audit event.

### 4.5 Frontend Client & Interactive Canvas
- **FR-016-17**: Author `web/src/services/ideationService.ts` with complete TypeScript interfaces.
- **FR-016-18**: Author `web/src/components/research/DSRArtifactCanvas.tsx` featuring a 4-Quadrant DSR Matrix, abductive generation trigger, expandable formal specifications, and selection actions.
- **FR-016-19**: Integrate `DSRArtifactCanvas` into Phase D of `ResearchWorkspaceView.tsx`.

---

## 5. Non-Functional Requirements & Invariants

- **NFR-016-01 (Article VII Anti-Creep Law)**: Strictly 0 new dependencies in `pyproject.toml` or `package.json`.
- **NFR-016-02 (Article IV Human Sovereignty)**: Automated suggestions are strictly advisory (`PROPOSED`); human confirmation is required to select or lock an artifact as the primary thesis contribution.
- **NFR-016-03 (Performance)**: Candidate generation and persistence must execute in $\le 5.0$ seconds. Local retrieval must execute in $\le 50\text{ms}$.
- **NFR-016-04 (Design System CCDS v2.0)**: Obsidian dark mode palette, calibrated badge colors, and non-wrapping button action standards.
