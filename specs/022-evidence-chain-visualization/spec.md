# CONVERA Specification: SDD-022
# Interactive Evidence Chain Visualization & Provenance Graph (Phase D2)

**Specification ID**: `CONVERA-SDD-022`  
**Feature Title**: Interactive Evidence Chain Visualization & Provenance Graph Engine  
**Authority Tier**: Tier 2 (Feature Specification Dossier)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VI, VII, VIII  
**Target Feature Branch**: `feature/022-evidence-chain-visualization`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `0fef8c6` (develop baseline synchronized with main)  
**Canonical Upstream**:  
- `docs/00-foundation/CONSTITUTION.md`  
- `docs/04-ai/AI_EVOLUTION_ROADMAP.md` (§4.3 Phase D2: End-to-End Research Loop Hardening)  
- `docs/01-product/CONVERA_UPGRADE_CHARTER.md`  
- `specs/006-scholarly-evidence-persistence-fts5/spec.md`  
- `specs/007-source-mediated-epistemic-bridge/spec.md`  
- `specs/013-research-orchestration-engine/spec.md`  
- `specs/014-research-cockpit-ui/spec.md`  
- `specs/021-research-session-persistence-resume/spec.md`  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Operational Context
CONVERA is governed by the doctrine of **"Evidence Grounding" (Article I)** and **"Tri-Part Confidence" (Article II)**. Across research stages A through F, the platform records empirical citations, claims, epistemic weights, assumptions, 4 DSR artifacts, concept evaluation matrices, feasibility audits, and proposal deliverables across 37 relational SQLite WAL tables.

### 1.2 The Usability Gap
While data exists across relational tables (`scholarly_works`, `problem_claims`, `claim_evidence_links`, `problem_assumptions`, `dsr_artifacts`, `concept_evaluations`, `research_feasibility_records`), **the topological chain of reasoning is visually opaque**:
1. **Disconnected Mental Model**: Researchers inspect papers in Stage A/C, claims in Stage B, artifacts in Stage D, rubrics in Stage E, and proposals in Stage F as isolated views. There is no single bird's-eye view answering: *"What exact literature grounded this specific DSR artifact or feasibility decision?"*
2. **Invisible Epistemic Risk**: Contradictions, low-confidence evidence, and orphaned claims are buried across sub-tables. Researchers cannot spot structural weaknesses in their epistemic foundation prior to thesis defense or peer review.
3. **Auditability Deficit**: Peer reviewers, research mentors, and grant committees demand verifiable lineage from primary sources to technical solutions. Today, exporting requires manual cross-referencing.

### 1.3 The Solution: SDD-022
SDD-022 delivers a **deterministic, interactive Evidence Chain Directed Acyclic Graph (DAG) Engine**:
- **Backend Graph Engine**: Deterministically traverses relational tables for a given research session and constructs a layered DAG of 6 distinct epistemic tiers:
  - **Tier 0: Scholarly Sources** (`scholarly_works`, `problem_sources`)
  - **Tier 1: Claims & Epistemic Weights** (`problem_claims`, `claim_evidence_links`)
  - **Tier 2: Research Assumptions & Hypotheses** (`problem_assumptions`)
  - **Tier 3: DSR Artifacts & Conceptual Framework** (`dsr_artifacts`)
  - **Tier 4: Evaluated Concepts & Decision Records** (`concept_evaluations`, `decision_records`)
  - **Tier 5: Feasibility Synthesis & Proposal Canvas** (`research_feasibility_records`)
- **CCDS v2.0 Interactive Visualization Canvas**:
  - Native SVG/Canvas hierarchical layout (zero new packages under Article VII).
  - Multi-tier column flow with curved Bézier links representing evidentiary relationships (`SUPPORTS`, `CONTRADICTS`, `EXTENDS`, `DERIVES`, `EVALUATES`, `SYNTHESIZES`).
  - Interactive stage filtering, confidence threshold slider, and search filtering.
  - Slide-out **Node Provenance Inspector** showing metadata, citations, confidence gauges, and raw excerpts.
  - Export capabilities (SVG vector export and canonical JSON provenance bundle).

---

## 2. User Stories

### US-022-01: End-to-End Epistemic Provenance Inspection
**As a** Researcher or faculty mentor,  
**I want to** view an interactive topological graph showing the progression from academic literature to final proposal artifacts,  
**So that** I can verify that every design decision and claim is solidly anchored in peer-reviewed evidence.

### US-022-02: Epistemic Vulnerability & Contradiction Detection
**As a** Doctoral candidate preparing for an adversarial defense,  
**I want to** visually highlight contradicting evidence links, ungrounded assumptions, or low-confidence claims,  
**So that** I can remediate research vulnerabilities before submitting proposals.

### US-022-03: Focused Stage & Subgraph Exploration
**As a** Researcher working within a specific methodology phase (e.g., Stage D DSR Ideation),  
**I want to** filter the evidence chain by stage or click an artifact node to highlight its upstream evidentiary ancestors,  
**So that** I can trace exactly which papers inspired that particular artifact without visual clutter.

### US-022-04: Verifiable Provenance Export
**As a** Principal investigator submitting a research proposal or thesis annex,  
**I want to** export the full provenance graph as SVG and canonical JSON with a cryptographic SHA-256 state hash,  
**So that** I can provide verifiable compliance proof to grant auditors and reviewers.

---

## 3. Constitutional Invariants & Non-Functional Requirements

- **INV-022-01 (Article VII Anti-Creep Law)**: Exactly **0 new third-party dependencies** introduced in `backend/pyproject.toml` or `web/package.json`. The visual DAG canvas must be implemented using native React SVG, CSS transforms, and existing animation primitives (`framer-motion`, `lucide-react`).
- **INV-022-02 (Article I Grounding & Article II Tri-Part Confidence)**: Every node and edge in the graph must map directly to ground-truth records in SQLite WAL storage. Fabricated or hallucinated relationships are strictly forbidden.
- **INV-022-03 (Article IV Human Sovereignty)**: Graph filtering, node inspection, and export are completely transparent and user-directed. Automated heuristics never alter evidence records without explicit human consent.
- **INV-022-04 (Article VIII Degraded Resilience)**: Graph extraction and rendering work 100% offline using local SQLite database queries without requiring external internet access.
- **NFR-022-01 (Deterministic Layout)**: Graph node positioning is computed using a deterministic tiered layout algorithm (Sugiyama-style column ranking), guaranteeing reproducible visual structure across reloads.
- **NFR-022-02 (Performance & Scalability)**: Graphs with up to 250 nodes and 500 edges must render in under 100ms and support 60fps pan/zoom interactions.

---

## 4. Architectural Design & API Surface

### 4.1 Epistemic Tier Hierarchy

```text
Tier 0: Sources         Tier 1: Claims        Tier 2: Assumptions     Tier 3: DSR Artifacts   Tier 4: Concepts       Tier 5: Feasibility
┌──────────────┐       ┌──────────────┐       ┌─────────────────┐     ┌────────────────┐      ┌──────────────┐       ┌─────────────────┐
│ Scholarly    │──────►│ Empirical    │──────►│ Research        │────►│ Kernel Theory  │─────►│ Evaluated    │──────►│ Stage F Canvas  │
│ Papers (DOI) │       │ Claims       │       │ Assumptions     │     │ & Architecture │      │ Candidates   │       │ & Proposal Deck │
└──────────────┘       └──────────────┘       └─────────────────┘     └────────────────┘      └──────────────┘       └─────────────────┘
       │                      ▲                                               │                      ▲
       └──────────────────────┘                                               └──────────────────────┘
            [SUPPORTS / CONTRADICTS]                                                     [EVALUATES]
```

### 4.2 REST API Specification

Mounted under `/api/provenance`:

1. `GET /api/provenance/graph?session_id={id}`
   - **Query Params**:
     - `session_id` (str, required)
     - `min_confidence` (float, optional, default 0.0)
     - `stages` (list[str], optional, e.g., `["stage_a", "stage_b", "stage_c"]`)
     - `include_orphans` (bool, optional, default True)
   - **Returns**: `ProvenanceGraphPayload` (nodes, edges, tier_counts, metrics, state_hash).
2. `GET /api/provenance/node/{node_id}?session_id={id}&node_type={type}`
   - **Returns**: Deep node metadata, upstream ancestor IDs, downstream descendant IDs, and source quotes.
3. `GET /api/provenance/export/{session_id}?format=json`
   - **Returns**: Canonical JSON provenance archive with SHA-256 integrity digest.

---

## 5. Verification Gate Criteria
- Zero new dependencies (`package.json`, `pyproject.toml`).
- 100% offline execution (`-m "not live"`).
- Deterministic topological layout and cycle-free edge rendering.
- `npm run typecheck --prefix web` exits with 0 errors.
- `npm run build --prefix web` succeeds.
- Pytest suite expanded with dedicated provenance graph tests.
