# CONVERA UI/UX Principles Specification

**Document ID**: `CONVERA-FE-003`  
**Classification**: Socratic Interaction & Tri-Part Rendering  
**Authority Tier**: Tier 2 Frontend Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/06-frontend/UI_UX_PRINCIPLES.md`  
**Upstream Dependencies**: `06-frontend/DESIGN_SYSTEM.md, 02-system/EVIDENCE_MODEL.md`  
**Downstream Dependents**: `06-frontend/INFORMATION_ARCHITECTURE.md`  

---

`[AUTHORITATIVE INTERFACE & INTERACTION PRINCIPLES]`
*Document Version: 1.1.0*  
*Last Verified: 2026-09-04*  
*Authority Boundary: Subordinate to CONSTITUTION.md (Arts. I–VIII), PRODUCT_DEFINITION.md, SYSTEM_ARCHITECTURE.md, and EVIDENCE_MODEL.md; Governs interaction patterns, cognitive friction, and presentation behavior*

---

## 1. Document Authority & Architectural Hierarchy

This specification establishes the **canonical UI/UX interaction principles** governing the CONVERA platform. CONVERA is an **epistemic research and venture-validation workbench** designed to enforce critical inquiry, surface blind spots, maintain provenance visibility, and prevent premature consensus.

### 1.1 Conceptual Authority & Layering Flow

The interaction layer operates strictly as the communication and presentation medium for upstream system doctrine:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CONSTITUTION (Articles I–VIII: Supreme Epistemic Law)                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. PRODUCT & SYSTEM SEMANTICS (Domain, Knowledge, Evidence, Decisions)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. UI/UX PRINCIPLES (`UI_UX_PRINCIPLES.md`: Interaction & Cognitive Model)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. INFORMATION ARCHITECTURE (`INFORMATION_ARCHITECTURE.md`: Workspaces)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. DESIGN SYSTEM (`DESIGN_SYSTEM.md`: Visual Tokens, Elevation, CSS)        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. COMPONENT IMPLEMENTATION (`web/src/components/`: Atoms, Cards, Modals)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Non-Redefinition Invariant**: The UI/UX layer communicates and renders canonical CONVERA semantics; it **MUST NEVER redefine, alter, or dilute** the canonical meaning of *EvidenceItem*, *ProblemClaim*, *EpistemicDecision*, *VALIDATED*, $C_{\text{AI}}$, $S_{\text{EVID}}$, $C_{\text{DEC}}$, *InvalidationEvent*, or *ProvenanceRecord*.

### 1.2 Constitutional Grounding

The interaction principles directly operationalize the ratified CONVERA Constitution:
* **Article I (Knowledge ≠ Workflow)**: UI presents knowledge as an evolving, reactive graph independent of ephemeral wizard steps.
* **Article II (Tri-Part Confidence)**: UI visually isolates AI confidence ($C_{\text{AI}}$), evidence strength ($S_{\text{EVID}}$), and decision confidence ($C_{\text{DEC}}$).
* **Article III (Evidence & Provenance)**: UI enforces provenance visibility before claims achieve verified epistemic standing.
* **Article IV (Invalidation)**: UI immediately surfaces downstream blast-radius alerts when upstream assertions fail.
* **Article V (External Boundary)**: UI displays scholarly connector sources with clear origin attribution.
* **Article VI (Free-First)**: UI provides transparent feedback on local/offline vs external cognitive capabilities.
* **Article VII (Documentation Consistency)**: UI terminology strictly reflects canonical definitions without drift.
* **Article VIII (Human Ratification)**: UI reserves all consequential state transitions, gate advancements, and decision ratifications for human authority.

---

## 2. Core UI/UX Interaction Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. SOCRATIC FRICTION OVER PREMATURE SPEED                                   │
│ The interface introduces deliberate cognitive friction (Mom Test checks,     │
│ Devil's Advocate challenges, Assumption Radars) before stage transitions.   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. TRI-PART CONFIDENCE TRANSPARENCY                                         │
│ The UI visually separates AI Confidence ($C_{\text{AI}}$), Evidence Strength│
│ ($S_{\text{EVID}}$), and Decision Ratification ($C_{\text{DEC}}$).        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. REACTIVE INVALIDATION & BLAST-RADIUS SALIENCE                            │
│ When upstream claims fail, the UI visually surfaces downstream dependencies  │
│ without blocking navigation, enabling structured epistemic recalibration.   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. HUMAN GATEKEEPING & RATIFICATION SOVEREIGNTY                             │
│ All phase gates, decision records, and mentor sign-offs require explicit,    │
│ attributable human confirmation. AI cannot auto-advance workflows.          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. TRUTHFUL DEGRADATION & SYNTHETIC TRANSPARENCY                            │
│ AI suggestions and synthetic fallback material must never be visually       │
│ represented as independently verified evidence (Synthetic Weight = 0.0).     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Principle Specifications

### Principle 1: Socratic Friction Over Premature Speed

* **`[NORMATIVE]` Interaction Principle**: Software that accelerates uncritical consensus creates venture and scientific failure. The CONVERA UI MUST introduce structured Socratic friction at critical decision boundaries to challenge cognitive biases.
* **`[IMPLEMENTED]` Interactive Realization**:
  * **Assumption Radar (`AssumptionRadarCard.tsx`)**: Surfaces unvalidated core assumptions with criticality ratings, requiring researchers to confront foundational vulnerabilities.
  * **Devil's Advocate Trigger (`DevilsAdvocateModal.tsx`)**: Injects counter-arguments, competing market hypotheses, and empirical failure modes into problem thesis cards.
  * **Socratic Dialogue (`SocraticCritiqueModal.tsx`)**: Audits propositions against Rob Fitzpatrick’s *Mom Test* rules, flagging hypothetical fluff, future promises, and unverified compliments.

---

### Principle 2: Tri-Part Confidence Transparency

* **`[NORMATIVE]` Visualization Invariant**: In accordance with Constitution Article II, the UI MUST maintain strict visual decoupling across the three distinct confidence dimensions:
  $$C_{\text{AI}} \ne S_{\text{EVID}} \ne C_{\text{DEC}}$$
  Under no circumstances may the interface blend or average these scores into a single composite percentage.
* **`[IMPLEMENTED]` Interactive Realization**:
  * **Discrete Score Meters**: Problem and claim cards render separate meters for Evidence Rigor (grounded in literature source tiers), AI Extraction Confidence (reflecting model certainty), and Human Decision Status (reflecting mentor sign-off).
  * **Multi-Part Evidence Badges**: Badges distinctly display the source tier (`Tier A`, `Tier B`, `Tier C`, `Synthetic`) alongside verification status (`VERIFIED_BY_RESEARCHER`, `UNVERIFIED`, `DISPUTED`).

---

### Principle 3: Reactive Invalidation & Blast-Radius Salience

* **`[NORMATIVE]` Interaction Invariant**: In accordance with Constitution Article IV, when an empirical test or literature source falsifies an upstream claim, the interface MUST immediately alert the researcher to all downstream impacted assumptions, alternatives, and decision records. Invalidation MUST NOT silently corrupt the workspace.
* **`[IMPLEMENTED]` Interactive Realization**:
  * **Impact Alert Banner (`ImpactAlertBanner.tsx`)**: Renders a high-salience, pulsing rose alert indicating the origin of falsification and the exact count of affected downstream entities.
  * **Traceability Drawer (`TraceabilityDrawer.tsx`)**: Provides an interactive graph view highlighting the propagation path from the falsified claim through invalidated decision records.
  * **Non-Blocking Guided Recalibration**: Rather than freezing the application in a modal lock, the UI flags affected cards with a contested state, allowing the researcher to pivot or recalibrate systematically.

---

### Principle 4: Human Gatekeeping & Ratification Sovereignty

* **`[NORMATIVE]` Governance Invariant**: In accordance with Constitution Article VIII, AI models and automated background tasks are strictly prohibited from mutating canonical project phases, ratifying decision records, or certifying stage gates. All consequential state changes require **explicit, attributable human confirmation**.
* **`[IMPLEMENTED]` Interactive Realization**:
  * **Decision Room (`DecisionRoomWorkspace.tsx`)**: Requires explicit human multi-criteria evaluation, rationale entry, and intentional selection before a problem thesis is advanced.
  * **Gate Review Modal (`GateReviewModal.tsx`)**: Requires authenticated mentor/reviewer credentials, structured qualitative feedback, and explicit pass/fail verdict submission.

---

### Principle 5: Truthful Degradation & Synthetic Transparency

* **`[NORMATIVE]` Transparency Invariant**: In accordance with Constitution Article III and `EVIDENCE_MODEL.md`, **AI-generated suggestions and synthetic fallback material must never be visually represented as independently verified evidence**.
* **`[IMPLEMENTED]` Interactive Realization**:
  * **Synthetic Non-Evidentiary Tagging**: All AI-synthesized suggestions carry an Amber/Sparkles badge with a permanent indicator stating `Synthetic Output (0.0 Evidentiary Weight)`.
  * **Degraded Mode Alerts (`ContextualAiHint.tsx`)**: When external AI providers or connector APIs are unavailable, the UI displays an amber-toned degraded banner indicating that cached heuristics or local fallback rules are active.

---

### Principle 6: Progressive Disclosure & Focus Hierarchy

* **`[NORMATIVE]` Layout Principle**: Epistemic density must not overwhelm baseline comprehension. The UI follows a structured 3-tier progressive disclosure model:
  1. *Primary Canvas*: Scannable problem cards, active phase stepper, and core hypothesis summaries.
  2. *Secondary Drawers*: Detailed literature tables, epistemic scorecards, and known unknowns map.
  3. *Tertiary Modal Workspaces*: Deep-dive screening matrices, full citation verifier dossiers, and gate review forms.
* **`[IMPLEMENTED]` Interactive Realization**:
  * Slide-over panels (`SlideOver.tsx`) preserve background context while surfacing deep relational data.
  * Modals (`Modal.tsx`) isolate high-consequence operations (decision sign-offs, gate reviews) with focused backdrops.

---

### Principle 7: Multi-Modal Accessibility & Non-Color Dependence

* **`[NORMATIVE]` Accessibility Invariant**: Color alone must NEVER be the sole carrier of epistemic status or meaning. Every visual indicator must pair color with distinct iconography and clear textual labels.
* **`[IMPLEMENTED]` Interactive Realization**:
  * Every status badge pairs semantic color with an SVG icon (e.g., CheckCircle for Verified, AlertTriangle for Contested, XCircle for Falsified) and an uppercase text label.
  * High-contrast foreground/background pairs ensure text remains legible across dark glassmorphic surfaces ($18.4:1$ primary contrast ratio).

---

### Principle 8: Zero Destructive Amnesia & Provenance Continuity

* **`[NORMATIVE]` Lineage Invariant**: Historical provenance lineage MUST be preserved and auditable; verification status and explicitly revisable metadata may change without destroying historical lineage.
* **`[IMPLEMENTED]` Interactive Realization**:
  * **Decision Timeline Modal (`DecisionTimelineModal.tsx`)**: Displays an immutable chronological record of all phase transitions, discarded alternatives, and decision rationales.
  * **Citation Verifier Modal (`CitationVerifierModal.tsx`)**: Surfaces complete provenance chains including connector origin, retrieval timestamp, extraction model, and SHA-256 prompt hash.

---

## 4. UI/UX Interaction Invariants Summary

| Invariant ID | Principle Name | Classification | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| **UX-01** | Socratic Friction | `[NORMATIVE / IMPLEMENTED]` | Mom Test modals, Devil's Advocate triggers, Assumption Radars |
| **UX-02** | Tri-Part Confidence Decoupling | `[NORMATIVE / IMPLEMENTED]` | Segmented score meters separating $C_{\text{AI}}$, $S_{\text{EVID}}$, $C_{\text{DEC}}$ |
| **UX-03** | Reactive Invalidation Salience | `[NORMATIVE / IMPLEMENTED]` | Pulsing `ImpactAlertBanner`, blast count indicators, graph traces |
| **UX-04** | Human Attributable Ratification | `[NORMATIVE / IMPLEMENTED]` | Mandatory manual submit for Decision Room and Gate Reviews |
| **UX-05** | Truthful Synthetic Badging | `[NORMATIVE / IMPLEMENTED]` | Amber synthetic badges ($0.0$ weight), offline degraded alerts |
| **UX-06** | Progressive Disclosure | `[NORMATIVE / IMPLEMENTED]` | 3-tier presentation (Canvas $\to$ Drawers $\to$ Modals) |
| **UX-07** | Multi-Modal Epistemic Semantics| `[NORMATIVE / IMPLEMENTED]` | Mandatory Icon + Color + Text label pairing |
| **UX-08** | Provenance Continuity | `[NORMATIVE / IMPLEMENTED]` | `DecisionTimelineModal`, citation provenance dossiers |
| **UX-09** | Desktop Workbench Ergonomics| `[IMPLEMENTED]` | Multi-pane comparative grid layouts optimized for $\ge 1024\text{px}$ |
| **UX-10** | Non-Destructive State Transitions| `[NORMATIVE / IMPLEMENTED]` | Stepper preserves session drafts and state across phase switching |
