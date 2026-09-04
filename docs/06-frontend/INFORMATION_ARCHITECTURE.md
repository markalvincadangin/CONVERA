# CONVERA Information Architecture Specification (IA)

**Document ID**: `CONVERA-FE-004`  
**Classification**: View Hierarchy & Entity-to-UI Mapping  
**Authority Tier**: Tier 2 Frontend Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/06-frontend/INFORMATION_ARCHITECTURE.md`  
**Upstream Dependencies**: `02-system/DOMAIN_MODEL.md, 07-tracks/INNOVATION_TRACK.md, 07-tracks/RESEARCH_TRACK.md`  
**Downstream Dependents**: `web/src/app/page.tsx, web/src/components/`  

---

`[AUTHORITATIVE INFORMATION HIERARCHY & NAVIGATION SPECIFICATION]`
*Document Version: 1.1.0*  
*Last Verified: 2026-09-04*  
*Authority Boundary: Subordinate to CONSTITUTION.md (Art. I), DOMAIN_MODEL.md, SDD_WORKFLOW.md, and FRONTEND_ARCHITECTURE.md; Governs workspace organization, navigation hierarchy, and entity presentation mapping*

---

## 1. Executive Summary & Epistemic Hierarchy

The CONVERA Information Architecture (IA) establishes the structural relationship between user mental models, canonical domain entities, specialized research tracks, and physical UI workspaces.

### 1.1 The Knowledge ≠ Workflow Invariant (Constitution Article I)

> **`[NORMATIVE]` Core Epistemic Invariant**: **Canonical Knowledge $\ne$ Workflow Stage $\ne$ UI Component $\ne$ Database Table.** The information architecture organizes user-facing work around canonical domain concepts, reasoning tasks, evidence corroboration, and decision rationale. Workflow stages and UI views provide cognitive scaffolding, but they do NOT own, redefine, or constrain the persistence of canonical knowledge.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CANONICAL KNOWLEDGE GRAPH (Independent of Presentation & Workflow)       │
│ • ProblemRecord (E03)           • ProblemClaim (E06)                        │
│ • EvidenceItem (E07)            • ProvenanceRecord (E15)                    │
│ • ProblemAssumption (E08)       • ClaimContradiction (E16)                  │
│ • DecisionRecord (E10)          • RequirementsTraceability (Support)        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Traversed & Augmented by
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. DUAL RESEARCH TRACKS (Product & Inquiry Specialization)                  │
│ • Innovation Track: Venture Ratchet phases 1–5                              │
│ • Research Track: Computing research stages A–F                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Scaffolds Presentation in
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. WORKSPACES & OVERLAYS (Primary Canvas, Lateral Drawers, Focused Modals)  │
│ • Epistemic Workbench, Decision Room, Deliverables Studio, Traceability     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Governed via Separate
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. ENGINEERING BOUNDARY (SDD Software Engineering Methodology)              │
│ • SPECIFY → CLARIFY → PLAN → CHECKLIST → TASKS → ANALYZE → IMPLEMENT → CONV.│
└─────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Engineering SDD $\ne$ Product Workflow**: The System Definition Dossier (SDD) workflow (`docs/03-engineering/SDD_WORKFLOW.md`) is a software engineering development methodology governing repository changes. It is strictly separated from CONVERA's user-facing product workflows (Innovation Track and Research Track).

---

## 2. Dual Research Tracks & Cross-Cutting Intelligence

CONVERA structures user inquiry across two specialized domain tracks that share the foundational epistemic knowledge graph:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SHARED EPISTEMIC CORE                               │
│  • ProblemRecord (E03)          • ProblemClaim (E06)                        │
│  • EvidenceItem (E07)           • ProvenanceRecord (E15)                    │
│  • DecisionRecord (E10)         • ClaimContradiction (E16)                  │
└──────────────────────────────┬──────────────────────────────┬───────────────┘
                               │                              │
                               ▼                              ▼
┌──────────────────────────────────────────────┐ ┌────────────────────────────┐
│ INNOVATION TRACK                             │ │ RESEARCH TRACK             │
│ • Regional problem discovery & market pain   │ │ • Benchmark performance gap│
│ • Mom Test customer interview audits         │ │ • Formal research hypoth.  │
│ • 15 Mechanism design families               │ │ • Circumscription loops    │
│ • MVP skin-in-the-game commitment tests      │ │ • Empirical test iterations│
│ • Deliverables: Lean Canvas, Pitch Deck, SWOT│ │ • Deliverables: SRS, Papers│
└──────────────────────────────────────────────┘ └────────────────────────────┘
```

*(Note: The tracks may be informally referenced as Track 1/Track 2 in legacy implementation code, but those labels are implementation artifacts, not canonical domain terminology).*

### Cross-Cutting Epistemic Drawers

Regardless of the active track, researchers access cross-cutting intelligence panels:
* **Evidence Ledger**: Ingested sources, extraction fingerprints, and verification states.
* **Dialectic Contradictions**: Epistemic tensions, opposing citations, and synthesis notes.
* **Known Unknowns Map**: Active inquiries, unverified hypotheses, and exploration strategies.
* **Intelligence Scorecard**: Net Epistemic Balance and metric progression.
* **Traceability Graph**: Upstream-downstream relationship visualization and blast-radius traces.

---

## 3. Product Workflow Progression & Presentation Mapping

The frontend presentation layer organizes work across distinct track stages:

### 3.1 Innovation Track (Venture Ratchet Phases 1–5)
* **Phase 1 (Conception & Landscape)**: `Phase1View.tsx`, `ProblemBankView.tsx` $	o$ Market pain identification, source ingestion.
* **Phase 2 (Triage & Validation)**: `Phase2View.tsx`, `DecisionRoomWorkspace.tsx` $	o$ Multi-criteria scoring, assumption risk ranking.
* **Phase 3 (Socratic Dialogue & Mom Test)**: `Phase3View.tsx`, `SocraticCriticModal.tsx` $	o$ Behavioral evidence audit, anti-fluff checks.
* **Phase 4 (Mechanism Exploration)**: `Phase4View.tsx`, `ProblemComparisonMatrix.tsx` $	o$ 15 Mechanism families, solution synthesis.
* **Phase 5 (Commitment & MVP Testing)**: `Phase5View.tsx`, `DeliverablesStudio.tsx` $	o$ Pre-orders, LOIs, Lean Canvas, Pitch Deck.

### 3.2 Research Track (Computing Stages A–F)
* **Stage A (Problem Discovery & Signal Classification)**: `ResearchWorkspaceView.tsx` → Domain selection, computing friction intake, problem signal taxonomy.
* **Stage B (Problem Validation & Empirical Grounding - Gate 1)**: `ProblemBankView.tsx` → Claim extraction, empirical grounding, Gate 1 rubric review.
* **Stage C (Research Opportunity, Prior Art & Literature Matrix - Gate 2)**: `LiteratureMatrixTable.tsx` → Systematic literature benchmarking, gap synthesis, Gate 2 review.
* **Stage D (Solution & DSR Artifact Formulation)**: `Phase4View.tsx` / `Phase2View.tsx` → Solution alternatives, architectural mechanism mapping.
* **Stage E (Evaluation Design, Benchmarking & Circumscription Loop - Gate 3)**: `CircumscriptionLoopView.tsx` → March & Smith test loops, evaluation metric benchmarking, constraint extraction.
* **Stage F (Feasibility, Ethics, Defense & Mentor Clearance - Gate 4)**: `GateReviewModal.tsx`, `DeliverablesStudio.tsx` → Formal thesis dossier export, rubric evaluation, mentor sign-off.

---

## 4. Navigation Architecture & Viewport Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ZONE A: GLOBAL HEADER & NAVIGATION BAR (`Navbar.tsx`)                       │
│ • Project Share Code • Track Selector • Health Meter • User Role • Command K│
├─────────────────────────────────────────────────────────────────────────────┤
│ ZONE B: WORKFLOW STEPPER & TELEMETRY (`PipelineStepper.tsx`)                │
│ • Stage Progression • Completed Gates • Transition Status Indicators        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ZONE C: PRIMARY EPISTEMIC WORKSPACE CANVAS (Active Stage View)              │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ Active Stage Component (e.g. `Phase2View` / `ProblemBankView`)       │  │
│   │ • Multi-column comparative problem grid                              │  │
│   │ • Assumption radar cards & Evidence ledger cards                     │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
  ▲                                                                         ▲
  │ (SlideOver Drawer)                                     (Modal Overlay)  │
┌───────────────────────────────┐                 ┌─────────────────────────┐
│ LATERAL DRAWERS (Secondary)   │                 │ FOCUSED WORKSPACES      │
│ • `TraceabilityDrawer.tsx`    │                 │ • `DecisionRoomWorkspace`│
│ • `IntelligenceScorecardDrawer`│                │ • `GateReviewModal.tsx` │
│ • `CheatsheetDrawer.tsx`      │                 │ • `DeliverablesStudio`  │
└───────────────────────────────┘                 └─────────────────────────┘
```

### 4.1 Zone Descriptions & Authority Rules

* **Zone A (Global Header)**: Persistent context containing session switcher, track toggle, health metrics, and Global Command Palette (`Cmd+K`).
* **Zone B (Workflow Stepper)**: Visual progress representation.
  * *`[NORMATIVE]` Navigation Authority Rule*: Stepper state and transition locks are client-side visual reflections of canonical domain state returned by the backend; the UI navigation mechanism does **NOT** independently establish or enforce gate validity.
* **Zone C (Primary Workspace Canvas)**: Central high-density workbench mounting the active stage.
* **Lateral Drawers (Secondary Context)**: Slide-over panels allowing non-blocking inspection of the traceability graph, known unknowns, and epistemic scorecards.
* **Focused Modals (Tertiary Workspaces)**: High-consequence decision environments (Decision Room, Gate Review, Deliverables Studio) requiring explicit, attributable human action.

---

## 5. Canonical Domain Entity ↔ UI Presentation Mapping Matrix

The 20 Conceptual Entities (16 Canonical Domain Entities + 4 Support Entities) defined in `DOMAIN_MODEL.md` map to concrete presentation components:

| Canonical Entity | Entity ID | User-Facing Label | Primary Workspace Component | Secondary / Overlay Component | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ResearchProject`** | E01 | Research Project | `Navbar.tsx` (Project scope) | `SessionManager.tsx` | 🟢 `[IMPLEMENTED]` |
| **`SessionState`** | E02 | Session Context | `PipelineStepper.tsx`, `useSession.ts` | `UserProfileModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`ProblemRecord`** | E03 | Problem Card | `ProblemBankView.tsx`, `Phase1View.tsx` | `ProblemDetailModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`LiteratureSource`** | E04 | Literature Source | `EvidenceLedgerCard.tsx` | `CitationVerifierModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`PhaseTransition`** | E05 | Stage Transition | `PipelineStepper.tsx` | `DecisionTimelineModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`ProblemClaim`** | E06 | Epistemic Claim | `ProblemBankView.tsx` (Claim rows) | `SocraticCriticModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`EvidenceItem`** | E07 | Evidence Record | `EvidenceLedgerCard.tsx` | `CitationVerifierModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`ProblemAssumption`**| E08 | Assumption | `AssumptionRadarCard.tsx` | `BlindSpotModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`ProblemAlternative`**| E09 | Solution Alternative| `Phase4View.tsx`, `SwotMatrixView.tsx` | `DevilsAdvocateModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`DecisionRecord`** | E10 | Decision Record | `Phase2View.tsx` | `DecisionRoomWorkspace.tsx` | 🟢 `[IMPLEMENTED]` |
| **`CollaborationComment`**| E11 | Comment Thread | `ProblemCommentsSection.tsx` | Inline card comments | 🟢 `[IMPLEMENTED]` |
| **`MentorSignoff`** | E12 | Mentor Sign-off | `Navbar.tsx` (Governance status) | `GateReviewModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`AssumptionValidationTest`**| E13| Empirical Test | `AssumptionRadarCard.tsx` | `Phase2DossierCard.tsx` | 🟢 `[IMPLEMENTED]` |
| **`ImpactInvalidationEvent`**| E14| Invalidation Event | `ImpactAlertBanner.tsx` | `TraceabilityDrawer.tsx` | 🟢 `[IMPLEMENTED]` |
| **`ProvenanceRecord`** | E15 | Provenance Dossier | `EvidenceLedgerCard.tsx` (Hash/tier) | `CitationVerifierModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`ClaimContradiction`**| E16 | Contradiction Alert | `ImpactAlertBanner.tsx` (Contested) | `TraceabilityDrawer.tsx` | 🟢 `[IMPLEMENTED]` |
| **`ProjectMember`** | Support | Team Member | `Navbar.tsx` (Role badge) | `UserProfileModal.tsx` | 🟢 `[IMPLEMENTED]` |
| **`SessionSnapshot`** | Support | State Snapshot | `SessionManager.tsx` | Local storage cache | 🟢 `[IMPLEMENTED]` |
| **`RequirementsTraceability`**| Support | Requirements Trace | `TraceabilityDrawer.tsx` | Graph edge inspector | 🟢 `[IMPLEMENTED]` |
| **`GateReview`** | Support | Gate Review | `GateReviewModal.tsx` | Formal rubric audit | 🟢 `[IMPLEMENTED]` |
| **`ResearchDomain`** | Support | Computing Domain | `ResearchWorkspaceView.tsx` | Benchmark selector | 🟢 `[IMPLEMENTED]` |
| **`CircumscriptionIteration`**| Support| Iteration Loop | `CircumscriptionLoopView.tsx` | Loopback visualizer | 🟢 `[IMPLEMENTED]` |

---

## 6. Information Architecture Invariants

* **IA-01: Knowledge / Presentation Decoupling** `[NORMATIVE]`: Canonical domain entities exist independently of the active UI view or workflow stage.
* **IA-02: Dual-Track Parity** `[NORMATIVE / IMPLEMENTED]`: Both Innovation Track and Research Track operate with first-class architectural status.
* **IA-03: Progressive Epistemic Disclosure** `[NORMATIVE / IMPLEMENTED]`: High-level propositions surface on the primary canvas; deep dossiers, full provenance, and graph traces open via secondary drawers or tertiary modals.
* **IA-04: Canonical Entity Direct Mapping** `[NORMATIVE / IMPLEMENTED]`: Every canonical domain entity in `DOMAIN_MODEL.md` has a direct, identifiable presentation mapping.
* **IA-05: Non-Blocking Invalidation Visibility** `[NORMATIVE / IMPLEMENTED]`: Invalidation events surface immediately in high-salience banners without blocking canvas navigation.
* **IA-06: Single Active Primary Stage View** `[IMPLEMENTED]`: The main canvas renders one active stage view at a time, governed by session context.
* **IA-07: Persistent Telemetry Baseline** `[IMPLEMENTED]`: Session share code, active track, and venture health metrics remain visible across all phase transitions.
* **IA-08: Universal Command Access** `[IMPLEMENTED]`: Major entities, phase workspaces, and epistemic drawers are discoverable via the Global Command Palette (`Cmd+K`).
* **IA-09: Desktop Comparative Priority** `[IMPLEMENTED]`: Multi-column comparative problem screening and literature matrix layouts prioritize desktop viewports ($\ge 1024\text{px}$).
* **IA-10: Traceable Deliverable Synthesis** `[NORMATIVE / IMPLEMENTED]`: Deliverables (Lean Canvas, Pitch Deck, SRS) are generated exclusively from verified canonical entity state.

---

## 7. Architectural Drift & Reconciliation Findings

| Item / Finding | Discovered State | Resolution & Canonical Baseline |
| :--- | :--- | :--- |
| **Entity Naming Drift** | Legacy code references `ProblemStatement` and `EpistemicDecision`. | Realigned strictly to canonical `ProblemRecord` (E03) and `DecisionRecord` (E10). |
| **Track Terminology Drift** | Code uses `framework_id` (`INNOVATION` vs `RESEARCH`). | Reconciled as canonical Innovation Track and Research Track. |
| **Engineering vs Product Pipeline** | Prior documentation conflated SDD software engineering stages with product phase stepper. | Formally decoupled: SDD governs software changes; Innovation/Research tracks govern user inquiry. |
