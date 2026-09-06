# CONVERA Epistemic Workflow Workspace Architecture

**Document ID**: `CONVERA-FE-005`  
**Classification**: High-Level UI/UX Structural & Cognitive Architecture  
**Authority Tier**: Tier 2 Frontend Architecture Specification  
**Document Status**: 🟢 RATIFIED ARCHITECTURE BASELINE  
**Canonical Path**: `docs/06-frontend/EPISTEMIC_WORKSPACE_ARCHITECTURE.md`  
**Upstream Dependencies**: `docs/06-frontend/UI_UX_PRINCIPLES.md`, `docs/06-frontend/INFORMATION_ARCHITECTURE.md`, `docs/frameworks/UX_ITERATION_FRAMEWORK.md`  
**Downstream Dependents**: All phase components, layout components, and UX iteration batches  

---

## 1. Executive Summary & Epistemic Foundations

CONVERA is an **evidence-driven project intelligence and opportunity validation platform**. It is designed to guide venture founders, researchers, and innovation teams through rigorous, empirical falsification of market problems, assumptions, and hypotheses.

### 1.1 The Workspace Paradigm vs. Generic SaaS Dashboards
Conventional SaaS dashboards present an unfocused collection of disparate widgets, metric counters, unlinked cards, and competing calls-to-action. Such designs fail in complex, high-stakes analytical workflows because they do not structure the user's cognitive reasoning.

CONVERA rejects the generic consumer dashboard. Instead, it adopts the **Epistemic Workflow Workspace**:
- **Single Dominant Task**: Each phase presents one primary objective at a time. Extraneous controls and secondary metadata are progressively disclosed only when needed.
- **Relational Epistemic Grounding**: Claims, evidence, assumptions, tests, and decisions are visually linked in a directed causal chain rather than scattered across tables.
- **Continuous Orientation**: The interface answers the user's core orienting questions without requiring them to recall previous steps.

### 1.2 The Five Continuous Epistemic Questions
To eliminate disorientation and maintain psychological safety, the CONVERA workspace must continuously answer five fundamental questions on every screen:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                   THE FIVE CONTINUOUS EPISTEMIC QUESTIONS               │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. Where am I?              → Project, session, framework & active phase│
│ 2. What am I examining?     → Specific problem, claim, or assumption    │
│ 3. What do we believe?      → Current epistemic status & confidence     │
│ 4. What evidence supports?  → Empirical citations & contradiction counts│
│ 5. What can I do next?      → Clear, unambiguous primary conversion CTA│
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Grounding in Nielsen Norman Group (NN/g) Usability Principles
This architecture operationalizes established human-computer interaction science:
1. **Visibility of System Status (Heuristic #1)**: Users must always know their current project context, active workflow phase, gate clearance status, and backend connectivity.
2. **Recognition Rather Than Recall (Heuristic #6)**: All critical contextual information, active filters, candidate hypotheses, and inquiry questions remain persistently visible on the canvas rather than hidden behind nested dialogs or memory-intensive transitions.
3. **Aesthetic and Minimalist Design (Heuristic #8)**: Minimalist design in an epistemic workbench does *not* mean consumer emptiness. It means stripping away non-essential visual noise so the core analytical data and primary actions command visual attention.
4. **Progressive Disclosure**: Primary options, search/filter bars, and candidate cards are immediately visible; secondary diagnostics, audit trails, and raw evidence snippets are disclosed on demand via drawers and inline disclosures.
5. **Match Between System and Real World (Heuristic #2)**: Interfaces use natural, human-first domain language (e.g. *“Farmers frequently return with unused capacity”*, *“3 supporting sources”*) rather than internal system tokens or database enums.

---

## 2. The Seven-Level UI Information Hierarchy

Every surface across CONVERA organizes its visual elements strictly according to a 7-level hierarchy of cognitive importance:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: ORIENTATION (Persistent Header)                                    │
│ "Where am I?" — Project Name, Framework Switcher, Session PIN, Gate Status  │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: WORKFLOW NAVIGATION (Persistent Rail / Pipeline)                   │
│ "What stage am I in?" — Discovery, Screening, Validation, Ideation, Audit   │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: OBJECTIVE BANNER (Workspace Context)                              │
│ "What am I trying to establish?" — Core hypothesis & inquiry question      │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 4: PRIMARY EVIDENCE WORKSPACE (Dominant Task Canvas)                  │
│ "What information do I examine?" — Unified control bar & candidate cards   │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 5: EPISTEMIC STATUS (Truth Value & Confidence)                        │
│ "What do we know / not know?" — Validated, Plausible, Contradicted, Parked  │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 6: PRIMARY ACTION (Next Step Conversion)                             │
│ "What should I do next?" — High-prominence CTA to advance or falsify       │
├─────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 7: SECONDARY INFORMATION (Progressive Disclosure)                     │
│ Provenance timestamps, raw citation URLs, secondary filters, JSON dossiers │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Global Structural Layout Architecture

The physical interface is structured into three coordinated spatial regions and two persistent docking bars:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: PERSISTENT ORIENTATION HEADER                                                                 │
│ [CONVERA Logo] [Project: Technopreneurship ▾] [Framework: Innovation ▾] [Gate Health: 2/5] [User / HUD]│
├───────────────────┬────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2:          │ LEVEL 3–6: CURRENT PHASE WORKSPACE                                                 │
│ WORKFLOW RAIL     │                                                                                    │
│                   │ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ ● Phase 1:        │ │ LEVEL 3: OBJECTIVE & HYPOTHESIS CONTEXT                                        │ │
│   Discovery       │ │ Question: "Does this problem represent verified regional friction?"            │ │
│                   │ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ● Phase 2:        │ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│   Screening       │ │ LEVEL 4: PRIMARY EVIDENCE WORKSPACE (Single Dominant Task)                     │ │
│                   │ │ [ Search problems... ] [All Sectors ▾] [Evidence ▾] [Latest ▾] [Select All]    │ │
│ ○ Phase 3:        │ │ ────────────────────────────────────────────────────────────────────────────── │ │
│   Validation      │ │ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐   │ │
│   (Active Target) │ │ │ Candidate Card A     │ │ Candidate Card B     │ │ Candidate Card C     │   │ │
│                   │ │ │ Target: Fishers      │ │ │ Target: Farmers      │ │ │ Target: Retailers    │   │ │
│ ⚑ Phase 4:        │ │ │ LEVEL 5: Epistemic   │ │ │ LEVEL 5: Epistemic   │ │ │ LEVEL 5: Epistemic   │   │ │
│   Ideation        │ │ │ Status: Verified     │ │ │ Status: Unverified   │ │ │ Status: Falsified    │   │ │
│   (Preview/Locked)│ │ │                      │ │ │                      │ │ │                      │   │ │
│                   │ │ │ LEVEL 6: Action CTA  │ │ │ LEVEL 6: Action CTA  │ │ │ LEVEL 6: Action CTA  │   │ │
│ ⚑ Phase 5:        │ │ │ [Select for Phase 3] │ │ │ [Select for Phase 3] │ │ │ [Park Candidate]    │   │ │
│   MVP Audit       │ │ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘   │ │
│   (Preview/Locked)│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ───────────────── │ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ KNOWLEDGE ENTITIES│ │ LEVEL 7: PROGRESSIVE DISCLOSURE DRAWER (Optional Inspection)                   │ │
│ • Evidence (167)  │ │ Expandable Citation Provenance, Claim Linkages, and Audit Logs                 │ │
│ • Claims (34)     │ └────────────────────────────────────────────────────────────────────────────────┘ │
│ • Decisions (9)   │                                                                                    │
├───────────────────┴────────────────────────────────────────────────────────────────────────────────────┤
│ PERSISTENT STATUS DOCK: Phase Progress • Invalidation Alerts (0) • Backend SQLite WAL Connected        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Region 1: Persistent Orientation Header (Level 1)
- **Position**: Fixed top bar across all views (64px).
- **Contents**:
  - Brand Mark & Product Identifier.
  - Active Project / Session selector with live PIN/share badge.
  - Active Methodology Framework switcher (`Innovation Track` vs. `Research Track`).
  - High-level Gate Health indicator (`2 of 5 Gates Cleared`).
  - Global Search / Command Palette shortcut (`Ctrl + K`).
  - User identity badge and session controls.
- **Rule**: Never allow modal popups or secondary drawers to obscure the user's basic orientation.

### 3.2 Region 2: Persistent Workflow & Knowledge Rail (Level 2)
- **Position**: Left navigation rail (collapsible on smaller screens).
- **Phased State Invariants**:
  - **Completed Phases** (`●`): Distinct visual badge (emerald check), fully accessible for historical review and audit.
  - **Active Phase** (`◉`): Dominant accent illumination, prominent label, clear indicator that this is the active workspace.
  - **Available Next Phase** (`○`): Subtle interactive affordance, clickable once gate prerequisites are satisfied.
  - **Future Locked Phases** (`⚑`): Rendered in **Preview Mode**. The user can inspect the requirements, rubric, and deliverables of future phases, but cannot execute them prematurely. This preserves workflow integrity without inducing feeling of a broken UI.
- **Knowledge Entity Filters**:
  - Secondary grouping at the base of the rail providing direct access to the underlying persistent knowledge graph (`Evidence Items`, `Claims`, `Assumptions`, `Decisions`).

### 3.3 Region 3: Single Dominant Task Workspace (Levels 3–6)
- **Rule**: Each phase presents **one dominant task**. Competing secondary tasks are moved into secondary drawers or sub-tabs.
- **Structure**:
  1. **Objective Card (Level 3)**: High-contrast statement declaring the goal of the current screen (e.g. *“Phase 2: Screen candidates against 5 core criteria to filter out solutions in disguise.”*).
  2. **Unified Control Bar**: Search, Sector, Tier, Sort, and Batch Selection consolidated into a single coherent horizontal control deck.
  3. **Primary Work Canvas (Level 4)**: The high-density card grid or data table displaying the artifacts under examination.
  4. **Epistemic State & Primary CTA (Levels 5 & 6)**: Every card visually differentiates its current truth status from its primary interactive action.

### 3.4 Region 4: Persistent Status & Alert Dock
- **Position**: Bottom dock (40px) or footer bar.
- **Contents**: Real-time invalidation telemetry, active background synchronization status, unsaved changes warning, and quick transition buttons.

---

## 4. Phase-by-Phase Workspace Mapping

### 4.1 Phase 1: Problem Discovery & Problem Bank
- **Primary Objective**: Ingest regional friction signals, explore evidence, and identify problems worth investigating.
- **Dominant Task Layout**:
  - **Control System**: Consolidated Search + Sector Pills + Evidence Tier + Sort (`Latest → Oldest`) + Universal Selection Bar (`Select All Visible`, `Clear`).
  - **Card Structure**:
    - Header: Problem ID (`AGR-001`), Sector Tag, Evidence Tier Badge.
    - Core Statement: Problem statement in readable body typography (`text-slate-100 font-medium leading-relaxed`).
    - Context: Target Sufferer, Location, Quantified Impact.
    - Epistemic Badge: `Verified Field Observation` vs `Unverified Claim`.
    - Primary CTA: `Inspect Dossier →` or `Select for Screening`.

### 4.2 Phase 2: Problem Screening & Shortlisting
- **Primary Objective**: Evaluate candidate problems against the 5-point screening rubric and winnability check.
- **Dominant Task Layout**:
  - **Rubric Matrix**: 5 criteria (Urgency, Frequency, Economic Consequence, Underserved Sufferer, Winnability).
  - **Card Visual Hierarchy**:
    - Level 5 Status: Verdict badge (`ADVANCE TO VALIDATION`, `SECOND LOOK`, `PARK`).
    - Level 6 Primary Action: High-prominence CTA button `[Select for Validation →]`. The interactive action must unmistakably outshine the passive status badge.

### 4.3 Phase 3: Socratic Mom Test Validation Clinic
- **Primary Objective**: Interrogate shortlisted problems against empirical facts, past behaviors, and concrete sacrifices.
- **Dominant Task Layout**:
  - **Objective Banner**:
    ```text
    ┌────────────────────────────────────────────────────────────────────────┐
    │ VALIDATE PROBLEM HYPOTHESIS                                            │
    │ "Does this problem represent real, consequential, and unavoidable pain?│
    └────────────────────────────────────────────────────────────────────────┘
    ```
  - **The 6 Mom Test Defense Gates (Epistemic Inquiry Milestones)**:
    Rather than rendering raw code keys or truncated pills, the 6 gates are rendered as explicit inquiry milestones answering *“What are we trying to prove?”*:

    ```text
    ┌────────────────────────────────────────────────────────────────────────┐
    │ 1. Specific Sufferer          [Passed ✓]                               │
    │    Can we clearly identify who experiences this friction?              │
    ├────────────────────────────────────────────────────────────────────────┤
    │ 2. Demonstrated Pain          [Passed ✓]                               │
    │    Is there empirical proof that the problem actively hurts?           │
    ├────────────────────────────────────────────────────────────────────────┤
    │ 3. Intensity & Frequency      [Inquiry Active ◉]                       │
    │    How often and how severely does this friction occur?                │
    ├────────────────────────────────────────────────────────────────────────┤
    │ 4. Local Market Size          [Pending ○]                              │
    │    What is the immediate addressable market in Western Visayas?        │
    ├────────────────────────────────────────────────────────────────────────┤
    │ 5. Population Scope           [Pending ○]                              │
    │    Does this problem affect a viable segment of the population?        │
    ├────────────────────────────────────────────────────────────────────────┤
    │ 6. Economic Consequence       [Pending ○]                              │
    │    What measurable financial or operational loss results?              │
    └────────────────────────────────────────────────────────────────────────┘
    ```
  - **Socratic Chat Stream**: Direct conversational interrogation between human founder and clinical advisor agent.
  - **Quick Evidence Injection**: Fast chips for inserting observed financial spend, hours lost, or location details.

### 4.4 Phase 4: Solution Ideation & SVB Canvas
- **Primary Objective**: Formulate non-obvious solution mechanisms grounded in verified friction.
- **State**: Previewable during Phases 1–3, fully interactive once Phase 3 clears.

### 4.5 Phase 5: MVP Empirical Validation Audit
- **Primary Objective**: Audit MVP commitments (Tier 1 Financial, Tier 2 Behavioral, Tier 3 Reputational) before capital deployment.
- **State**: Previewable during Phases 1–4, unlocked upon Phase 4 completion.

---

## 5. Epistemic & Evidence Presentation Standard

CONVERA’s core differentiation is its explicit epistemic accounting. The interface must communicate truth states in clear, natural human language.

### 5.1 Domain Language Mapping (Zero System Enum Leaks)
Under NO circumstances may raw database tokens or code identifiers be presented to the user. All states must follow human-first epistemic grammar:

| Raw Backend Token | Anti-Pattern DOM Rendering | Authoritative Canonical Presentation |
| :--- | :--- | :--- |
| `TEST_FAILED_FALSIFIED` | `Status: TEST_FAILED_FALSIFIED` | `Hypothesis Falsified by Empirical Evidence` |
| `PHASE2_SCREENING` | `Stage: PHASE2_SCREENING` | `Phase 2: Candidate Screening Matrix` |
| `PLAUSIBLE_UNVERIFIED` | `Confidence: PLAUSIBLE_UNVERIFIED` | `Plausible — Awaiting Field Corroboration` |
| `CONTRADICTION_LINKED` | `Trigger: CONTRADICTION_LINKED` | `Contradicting Evidence Discovered` |
| `Lspecific_sufferer` | `Lspecific_sufferer Level ..` | `Gate 1: Specific Sufferer Identified` |

### 5.2 Directed Causal Representation
Epistemic dependencies must visually display their relational direction:
```text
[ Assumption ] ────► [ Field Test / Evidence ] ────► [ Verified or Falsified ] ────► [ Decision Impact ]
```
Every assumption card must clearly show:
1. **Core Proposition**: What statement is being assumed true?
2. **Evidentiary Support**: Number of supporting sources vs. contradicting sources.
3. **Calibrated Confidence**: Plausible, Verified, Fragile, or Falsified.
4. **Actionable Next Step**: Direct CTA to test, corroborate, or discard.

---

## 6. Responsive Behavior & Progressive Disclosure Rules

### 6.1 Viewport Breakpoint Tiers
1. **Desktop Tier ($\ge$ 1024px)**:
   - Persistent Left Navigation Rail (240px).
   - Fluid Central Workspace Canvas.
   - Optional Lateral Drawers for Scorecard, Traceability, and Dossier inspection (420px overlay).
2. **Tablet Tier (640px – 1023px)**:
   - Left Navigation Rail collapses to an icon dock (64px) with tooltip hover and drawer expansion.
   - Central Workspace adapts to 2-column card grids.
   - Selection bar wraps controls into clean multi-row clusters.
3. **Mobile Tier (< 640px)**:
   - Left Navigation collapses into an accessible mobile hamburger drawer.
   - Central Workspace renders single-column stacked cards.
   - Touch targets strictly $\ge 44 \times 44\text{px}$.

### 6.2 Progressive Disclosure Matrix
To prevent visual overload, interface elements are segregated into three disclosure tiers:

| Disclosure Tier | Visibility Mode | Target Components |
| :--- | :--- | :--- |
| **Tier 1: Immediate** | Always visible on canvas | Orientation header, active phase objective, search/filter controls, candidate problem cards, primary action CTA. |
| **Tier 2: Interactive** | Revealed on hover or single click | Filter badge dismiss pills, sort selection menus, selection checkboxes, preview tooltips. |
| **Tier 3: Deep Disclosure** | Slide-out drawer or modal overlay | Full Problem Dossier, citation provenance URLs, Monte Carlo confidence simulator, traceability dependency graphs. |

---

## 7. Architectural Evaluation of UX-BATCH-004

With the formal **Epistemic Workflow Workspace Architecture** established, the candidate items for `UX-BATCH-004` are re-evaluated and elevated from isolated visual tweaks into coherent architectural alignment:

### 7.1 P1 — Mom Test Defense Gates Re-Architected
- **Architectural Grounding**: Level 3 (Objective Context) & Level 5 (Epistemic Inquiry Milestone).
- **Evaluation**: The current implementation leaks raw identifier strings (`Lspecific_sufferer Level ..`) and severely clips text in desktop grid cells.
- **Architectural Solution**: Transform the 6 gates into explicit, human-readable inquiry milestones answering *“What am I trying to prove?”*:
  1. `1. Specific Sufferer` — Can we clearly identify who experiences this?
  2. `2. Demonstrated Pain` — Is there evidence that the problem actually hurts?
  3. `3. Intensity & Frequency` — How often and how severely does it occur?
  4. `4. Local Market Size` — What is the scale of the immediate addressable market?
  5. `5. Population Scope` — Does this problem affect a viable population?
  6. `6. Economic Consequence` — What measurable financial or resource loss results?
- **Status**: **Approved for BATCH-004 implementation proposal**.

### 7.2 P2 — Candidate Selection Primary CTA Hierarchy
- **Architectural Grounding**: Level 6 (Action) dominance over Level 5 (Status Badge).
- **Evaluation**: The unselected `Select for Validation` button currently renders in muted `outline` style, which visually recedes behind the bright emerald `ADVANCE TO VALIDATION` status badge.
- **Architectural Solution**: Elevate the interactive conversion CTA to `variant="primary"` (cyan/blue gradient), establishing clear visual dominance as the primary action for advancing a screened candidate into Phase 3.
- **Status**: **Approved for BATCH-004 implementation proposal**.

### 7.3 P3 — Sector Tile Multi-Select Affordance
- **Architectural Grounding**: Level 4 (Primary Evidence Workspace: Coherent Control System).
- **Evaluation**: Unselected sector tiles appear as flat dark boxes lacking interactive affordance.
- **Architectural Solution**: Add distinct interactive cues (subtle indicator check/dot, hover border transitions, cursor pointer) so the multi-sector research target system is immediately legible as an interactive filter deck.
- **Status**: **Approved for BATCH-004 implementation proposal**.

### 7.4 Global Top Navigation Density — Architectural Roadmap
- **Architectural Grounding**: Level 1 (Orientation Header) vs. Level 7 (Progressive Disclosure).
- **Evaluation**: 7 unlabelled utility icons on the right edge of the top navigation bar create recall strain and violate the principle of a single dominant task.
- **Architectural Solution**: In a dedicated future navigation iteration, consolidate secondary utilities (Scorecard, Traceability, Cheatsheet, Help) into an integrated **Command & Intelligence Deck** triggered via a single prominent button or `Ctrl + K` palette, freeing the top navigation bar to focus purely on persistent orientation (Project, Framework, Phase, System Status).
- **Status**: **Formally deferred to dedicated Navigation Iteration Batch**.
