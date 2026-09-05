# SPEC-UX-ITERATION-001: CONVERA UX Iteration & Continuous Improvement Framework

**Document ID**: `SPEC-UX-ITERATION-001`  
**Classification**: Tier 2 Engineering & UI/UX Methodology Specification  
**Authority Tier**: Tier 2 Engineering Specification (Operationalized under `CONSTITUTION.md` and `DEVELOPMENT_WORKFLOW.md`)  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 UX-BATCH-001 HUMAN ACCEPTED — AWAITING MERGE AUTHORIZATION  
**Canonical Path**: `SPEC-UX-ITERATION-001.md` (Operational Projection: `docs/06-frontend/UX_ITERATION_FRAMEWORK.md`)  
**Supersedes**: `SPEC-PROBLEM-DISCOVERY-UX-001` (Formally Superseded & Subsumed as UX-BATCH-001)  
**Baseline Git Revision**: `main @ ac3584c`  
**Active Feature Branch**: `feature/problem-discovery-ux-001`  
**Authoritative Evidence Base**:
- `CONSTITUTION.md` (`CONVERA-FND-001`, Articles I through VIII)
- `DEVELOPMENT_WORKFLOW.md` (`CONVERA-ENG-002`, Section 2 "Change Classification Matrix")
- `SDD_WORKFLOW.md` (`CONVERA-ENG-003`, 8-Stage SDD Lifecycle)
- `ENGINEERING_PRINCIPLES.md` (`CONVERA-ENG-001`, Invariants 1, 4, 5, 6, 8, 9, 10)
- `CONVERA_RUNTIME_FEATURE_AUDIT.md` (Committed at `ac3584c`)
- `CONVERA_PROBLEM_DISCOVERY_UX_AUDIT.md` (Committed at `ac3584c`)

---

## 1. Document Identity & Sole Authoritative Status

```text
Document Reference: SPEC-UX-ITERATION-001
Title:              CONVERA UX Iteration & Continuous Improvement Framework
Originating Branch: feature/problem-discovery-ux-001
Parent Documents:   docs/00-foundation/CONSTITUTION.md
                    docs/03-engineering/DEVELOPMENT_WORKFLOW.md
                    docs/03-engineering/SDD_WORKFLOW.md
First Application:  UX Iteration Batch 001 ("Problem Discovery & Problem Bank Remediation")
Ratification State: RATIFIED (2026-09-06)
Batch State:        UX-BATCH-001 HUMAN ACCEPTED (2026-09-06)
Authority:          Human Leadership / Project Lead
```

### Sole Authoritative Specification Guarantee:
To eliminate governance ambiguity and prevent competing specifications:
- **`SPEC-UX-ITERATION-001` is the single authoritative specification** governing all front-end presentation refinements across CONVERA.
- **`SPEC-PROBLEM-DISCOVERY-UX-001` is formally superseded and completely subsumed** as `UX-BATCH-001` within this document.
- The legacy document `SPEC-PROBLEM-DISCOVERY-UX-001.md` remains preserved strictly for historical lineage and audit trail under `CONSTITUTION.md` Article VII, but holds **zero independent governance authority**. There are no competing specifications.

---

## 2. Status & Governance Ratification

**Framework Status**: `🟢 RATIFIED`  
**Batch Status**: `🟢 UX-BATCH-001 HUMAN ACCEPTED — AWAITING MERGE AUTHORIZATION`  
**Ratification Date**: 2026-09-06  
**Implementation Auth Date**: 2026-09-06 (UX-BATCH-001 Only)  
**Human Acceptance Date**: 2026-09-06 (UX-BATCH-001 Accepted)  
**Governing Authority**: Human Leadership / Project Lead  

This specification is formally **RATIFIED** as the authoritative CONVERA UX Iteration & Continuous Improvement Framework. `UX-BATCH-001` has achieved formal **HUMAN ACCEPTANCE**.

### Human Acceptance Record (UX-BATCH-001):
- **Acceptance Date**: 2026-09-06
- **Governing Authority**: Human Leadership / Project Lead
- **Empirical Browser Verification Results**:
  - Problem Bank loading: **PASS**
  - Add Problem: **PASS**
  - Manual Entry: **PASS**
  - Notes/Chat Import: **PASS**
  - Human review before save: **PASS**
  - Archive modal: **PASS**
  - Terminology normalization: **PASS**
  - Responsive reflow: **PASS**
  - Keyboard & visible focus: **PASS**
- **Observed UX Defects**: **0 defects observed**.
- **Formal Status**: `🟢 ACCEPTED — STOPPED AT MERGE AUTHORIZATION GATE`

### Implementation Authorization Record (UX-BATCH-001):
- **Authorized Scope**: UX-BATCH-001 ("Problem Discovery UX Iteration") strictly.
- **Boundaries Preserved**: Data integrity (1,509 records), SQLite WAL schema, epistemic governance, LLM Last invariant, existing API contracts.
- **Strict Non-Scope**: Does NOT authorize future batches, architecture changes, AI evolution, opportunistic refactoring, branch merges, promotions, or deployments.

### Authoritative Ratification Conditions:
1. **Three-Tier Requirement Hierarchy Accepted**:
   `FRAMEWORK PRINCIPLE → REUSABLE UX PATTERN → BATCH-SPECIFIC IMPLEMENTATION`.
2. **Exploration is Non-Authoritative**:
   The `EXPLORE` / `IMPLEMENT EXPERIMENT` / `INSPECT` / `ITERATE` stages are explicitly non-authoritative and cannot authorize persistence, merge, promotion, release, or deployment.
3. **Freeze Gate as Governance Boundary**:
   The `FREEZE GATE` is the formal transition from exploratory work to a governed implementation candidate.
4. **Subordination to CONVERA Governance**:
   Lane A remains subordinate to existing CONVERA governance and `DEVELOPMENT_WORKFLOW.md` and must not become a competing approval workflow.
5. **Absolute Hard Boundary Enforcement**:
   Any change crossing the defined hard boundary involving system behavior, persistence, processing/state, authority, permissions, AI permissions, evidence/claim semantics, API contracts, or architecture must leave Lane A and follow the formal SDD workflow (`SDD_WORKFLOW.md`).
6. **Bounded & Thematically Coherent Batches**:
   UX Iteration Batches must remain bounded and thematically coherent, sharing a single intent and validation target.
7. **Single Authoritative Document Hierarchy**:
   `SPEC-PROBLEM-DISCOVERY-UX-001` is formally superseded and retained only as `UX-BATCH-001` under `SPEC-UX-ITERATION-001`. It is not a competing authoritative specification.
8. **No Implied Implementation Authorization**:
   No implementation, merge, promotion, release, or deployment is authorized by this ratification alone.

In strict compliance with CONVERA governance:
- `UX-BATCH-001` has been executed, automated-verified, browser-verified, and **human-accepted**.
- Work is now **STOPPED at the Merge Authorization Gate**.
- No merge, promotion, release, or deployment is authorized without explicit human direction.

---

## 3. Purpose

The purpose of `SPEC-UX-ITERATION-001` is to establish an authoritative, reusable, and evidence-based engineering framework for continuously refining CONVERA's user experience, presentation layers, visual hierarchy, and interaction ergonomics without forcing every low-risk visual improvement through the heavyweight process required for behavioral or architectural transformations.

The framework is designed to **optimize the speed of UX exploration while strictly preserving the authority, safety, traceability, and verification requirements of CONVERA**.

### Foundational Axioms:
1. **"UX iteration optimizes the speed of exploration, not the authority of change."**
2. **"Vibe → Inspect → Iterate is an exploration mechanism, NOT an authorization mechanism."**
3. **"Visual elegance does not infer behavioral license; aesthetics must never bypass epistemic governance."**

---

## 4. Scope

### In-Scope:
- All user-facing presentation layers of CONVERA (`web/src/` components, layouts, views, modals, styles, typography, microcopy, and UI interaction states).
- Definition of the **Two UX Change Lanes** (Lane A: UX Iteration Lane vs. Lane B: Formal SDD Lane).
- The explicit **Hard Boundary Decision Rule** governing lane assignment.
- The **Thematically Coherent UX Iteration Batch Model** for grouping, tracking, freezing, validating, and accepting bounded presentation improvements.
- Operational exploration rules ("Vibing" boundaries, freeze points, and collective batch validation).
- Formalization of **UX Iteration Batch 001** (Problem Discovery & Problem Bank Remediation), preserving all requirements previously defined under `SPEC-PROBLEM-DISCOVERY-UX-001`.
- Complete 3-tier classification hierarchy (`FRAMEWORK PRINCIPLE → REUSABLE UX PATTERN → BATCH-SPECIFIC IMPLEMENTATION`).

### Out-of-Scope (Non-Goals):
- Bypassing or replacing CONVERA's existing development lifecycle (`DEVELOPMENT_WORKFLOW.md`) or SDD methodology (`SDD_WORKFLOW.md`).
- Altering the backend architecture, domain engines (`backend/engines/`), persistence layer (`backend/storage/`), or database schema.
- Modifying epistemic scoring algorithms, Net Epistemic Balance formulas, evidence tier promotion rules, or Mechanical Ratchet criteria.
- Altering external AI provider cascades, LLM gateways, or adding new ML/vector models.
- Granting autonomous merging, promotion, or deployment permissions to AI agents.

---

## 5. Applicability

This framework applies universally to all current and future front-end surfaces of CONVERA:
- **Phase 1**: Problem Discovery, Problem Bank, and Note Intake.
- **Phase 2**: Opportunity Screening, Triage, and Prioritization.
- **Phase 3**: Solution Formulation, Hypothesis Generation, and Assumptions.
- **Phase 4**: Literature Synthesis, Epistemic Knowledge Graph, and Evidence Ledger.
- **Phase 5**: Venture Viability, Decision Governance, and Export Dossier.
- **Global Layouts**: Navigation sidebars, Phase Stepper, Workspace headers, Toast systems, and Modal managers.

---

## 6. Authority & Governance Hierarchy

This framework is an **extension and operationalization** of the existing CONVERA engineering workflow, **NOT a replacement for it**. It occupies a distinct Tier 2 position within CONVERA's constitutional hierarchy:

```text
+-----------------------------------------------------------------------------+
|                      CONVERA AUTHORITY HIERARCHY                            |
+-----------------------------------------------------------------------------+
| Tier 1: Supreme Normative Law                                               |
|   └── docs/00-foundation/CONSTITUTION.md (Article I to VIII)                |
+-----------------------------------------------------------------------------+
| Tier 2: Authoritative Engineering Specifications                            |
|   ├── docs/03-engineering/ENGINEERING_PRINCIPLES.md                         |
|   ├── docs/03-engineering/DEVELOPMENT_WORKFLOW.md (Change Classification)   |
|   ├── docs/03-engineering/SDD_WORKFLOW.md (8-Stage SDD Lifecycle)           |
|   └── SPEC-UX-ITERATION-001 (This Framework: UX Lanes & Batch Model)        |
+-----------------------------------------------------------------------------+
| Tier 3: Operational Projections & Specifications                            |
|   ├── specs/<feature>/ (spec.md, plan.md, tasks.md, checklist.md)           |
|   └── .agents/rules/ & .agents/skills/ (Execution Constraints)              |
+-----------------------------------------------------------------------------+
| Tier 4: Executable Verification & Reality                                   |
|   ├── Automated Test Suite (Pytest, Vitest, Typecheck, Next.js Build)       |
|   └── Database State & Verified Runtime Behavior                            |
+-----------------------------------------------------------------------------+
```

### Escalation & Contradiction Invariant:
If any provision of this framework or any exploratory UX work conflicts with an authoritative CONVERA document (`CONSTITUTION.md`, `DEVELOPMENT_WORKFLOW.md`, `SDD_WORKFLOW.md`, or `ENGINEERING_PRINCIPLES.md`):
1. **STOP execution immediately.**
2. Identify the conflicting requirements and documents.
3. Formulate the exact contradiction.
4. Escalate to the human operator for authoritative resolution.
5. **Do NOT resolve the contradiction autonomously.**

---

## 7. Relationship to Existing CONVERA Workflows

`DEVELOPMENT_WORKFLOW.md` Section 2 ("Change Classification Framework") divides engineering changes into **Trivial (Non-Consequential)** and **Consequential (Requires SDD)**:
- *Trivial Changes*: UI CSS styling & alignment, typo & grammar fixes, local non-contract renames, isolated obvious UI bug fixes.
- *Consequential Changes*: Domain entities & models, epistemic scoring formulas, database schema/migrations, API contracts & routers, security & auth boundaries, CIIA connector interfaces.

### Non-Competing Harmonization:
`SPEC-UX-ITERATION-001` does **NOT** create a competing or parallel workflow. Instead, it **structures and governs front-end presentation work** that falls under the non-consequential category:
1. Under `DEVELOPMENT_WORKFLOW.md`, trivial presentation changes are permitted direct implementation and local verification. However, unstructured, piecemeal edits across UI components create visual drift and regression risks.
2. `SPEC-UX-ITERATION-001` introduces **Lane A (UX Iteration Lane)** to organize these presentation improvements into **thematically coherent, bounded batches**.
3. It makes early design exploration explicitly **non-authoritative**, requires a formal **freeze point**, validates changes collectively, and mandates **explicit human acceptance** before any change can be integrated.
4. If an exploratory change touches system behavior, semantics, data, or contracts, it is immediately redirected into **Lane B (Formal SDD Lane)**.

---

## 8. Core Principles

1. **Exploration Speed ≠ Change Authority**: Rapid UI iteration allows engineers and agents to visualize alternatives quickly. However, authority to commit, merge, persist, or promote remains governed strictly by human ratification.
2. **Exploration is Non-Authoritative**: The "vibe / exploration" phase consists strictly of transient, local experiments. It carries zero approval authority.
3. **Thematic Batch Coherence**: A batch is never a random grab-bag of unrelated UI edits. A batch must be bounded by a single intent and a unified validation target.
4. **LLM Last, Not LLM First**: AI must never autonomously write to the database, generate unverifiable truth, or silently structure domain entities. All AI-generated suggestions are transient drafts requiring mandatory human review.
5. **No Dark Behavioral Drift**: A visual polish task must never secretly alter a validation rule, change a state transition, or expand user permissions.
6. **Evidence-Based Acceptance**: Subjective satisfaction ("looks better") is an exploration tool, not acceptance evidence. Final acceptance requires empirical proof: zero type errors, successful builds, verified contrast/accessibility, intact data, and explicit human sign-off.

---

## 9. Two UX Change Lanes

All front-end modifications must be triaged into one of two explicit lanes:

```text
                               Proposed UI/UX Modification
                                            │
                                            ▼
                      ┌───────────────────────────────────────────┐
                      │    HARD BOUNDARY DECISION RULE EVALUATION │
                      │  Does it alter behavior, data, contracts, │
                      │       permissions, or state transitions?  │
                      └─────────────────────┬─────────────────────┘
                                            │
                       NO ──────────────────┴────────────────── YES
                       │                                         │
                       ▼                                         ▼
         ┌───────────────────────────┐             ┌───────────────────────────┐
         │          LANE A           │             │          LANE B           │
         │     UX ITERATION LANE     │             │      FORMAL SDD LANE      │
         │   (Presentation-Only)     │             │ (Behavioral/Consequential)│
         └─────────────┬─────────────┘             └─────────────┬─────────────┘
                       │                                         │
                       ▼                                         ▼
         - Spacing, layout & padding               - Business logic & formulas
         - Typography & text hierarchy             - Workflow step order & gating
         - Color, borders & shadows                - Data persistence & schemas
         - Component visual density                - API contracts & parameters
         - Icon selection & alignment              - Security & permissions
         - Presentation-only microcopy             - Epistemic evidence status
         - Accessible semantic markup              - Autonomous AI behavior
                       │                                         │
                       ▼                                         ▼
             UX Iteration Lifecycle                     8-Stage SDD Lifecycle
          (Freeze → Validate → Accept)               (Specify → Plan → Converge)
```

### Lane A: UX Iteration Lane (Low-Risk, Presentation-Only)
- **Eligibility**: Strictly limited to modifications that change *how the interface looks and feels*, without altering *what the system does or what data means*.
- **Permitted Elements**:
  - Layout geometry: spacing, padding, margins, flex/grid alignment, container widths.
  - Visual styling: curated color palettes, dark-mode tokens, borders, rounded corners, drop shadows.
  - Typography: font sizes, font weights, line heights, text wrapping, truncation clamping.
  - Information hierarchy: card visual density, grouping related fields, de-cluttering redundant badges.
  - Responsive presentation: responsive column folding, mobile drawer presentation, touch target padding.
  - Microcopy: presentation-only labels, helper text, tooltips, and explanatory placeholder examples (provided canonical enums/contracts are unaltered).
  - Component feedback: loading skeletons, spinner indicators, empty-state illustrations, inline non-blocking alerts.
  - Accessible presentation: migrating non-semantic `div role="button"` to native `<button>`, adding `aria-label`, visible focus rings, WCAG 2.1 AA color contrast.

### Lane B: Formal SDD Lane (Behavioral, Semantic & Architectural)
- **Mandatory Routing**: Any change meeting ANY of the following criteria must **immediately leave Lane A** and enter the 8-Stage SDD Lifecycle (`SDD_WORKFLOW.md`):
  - Modifying business rules, calculations, or validation logic.
  - Changing workflow order, step sequencing, or gating criteria.
  - Modifying SQLite database schemas, migrations, table columns, or relations.
  - Modifying or adding FastAPI routes, request bodies, query parameters, or response contracts.
  - Changing user authentication, authorization, or role-based capabilities.
  - Altering epistemic models, evidence weights, contradiction triggers, or evidence tier promotion authority.
  - Changing LLM provider cascades, prompt engineering logic, or introducing new AI models/runtimes.
  - Introducing new external libraries or npm/pip dependencies.

---

## 10. Hard Boundary Decision Rules

To eliminate agent ambiguity and prevent "creep masquerading as polish," the following decision rule is **absolute**:

> ### 🛑 THE HARD BOUNDARY RULE
> **IF a proposed UX change modifies:**
> 1. **WHAT THE SYSTEM DOES** (business logic, validation logic, calculation),
> 2. **HOW THE SYSTEM STORES OR PROCESSES DATA** (persistence, serialization, schema),
> 3. **WHAT STATE THE SYSTEM ENTERS** (phase completion, lock state, session transitions),
> 4. **WHO HAS AUTHORITY** (human approval gates, admin actions),
> 5. **WHAT THE USER IS ALLOWED TO DO** (enabling previously disallowed actions),
> 6. **WHAT THE AI IS ALLOWED TO DO** (autonomous writes, silent prompts, agentic loops),
> 7. **WHAT AN EVIDENCE ITEM OR CLAIM MEANS** (epistemic balance, confidence scores), OR
> 8. **WHAT AN API OR ARCHITECTURAL CONTRACT MEANS** (endpoint signatures, payload schemas),
> 
> **THEN IT IS NOT PRESENTATION-ONLY UX.**  
> **It MUST enter the Formal SDD Lane.**

### Concrete Application Table:

| Action | Classification | Governing Lane | Rationale |
| :--- | :---: | :---: | :--- |
| Changing button background from blue to cyan | Presentation | **Lane A (UX)** | Zero semantic or behavioral change. |
| Moving a button from card footer to card header | Presentation | **Lane A (UX)** | Visual layout rearrangement only. |
| Renaming visible button label from "Dossier" to "View Details" | Presentation | **Lane A (UX)** | Presentation alias; backend contract unchanged. |
| Making a disabled button executable | **Behavioral** | **Lane B (SDD)** | Alters user capability and system state. |
| Changing what happens when a button is clicked | **Behavioral** | **Lane B (SDD)** | Alters application execution flow. |
| Changing whether clicking a button persists to SQLite | **Architectural** | **Lane B (SDD)** | Changes persistence semantics. |
| Replacing `window.prompt()` with an in-app confirmation modal | **Hybrid** | **Lane A / Lane B** | Modal UI is Lane A; calling existing `archiveProblem` API is Lane A; changing archive API payload requires Lane B. |
| Persisting ingestion summary in session state (`DEF-PB-005`) | **Behavioral** | **Lane B (SDD)** | Modifies backend router state persistence. *(Formally specified under Batch 001 bridge).* |
| Auto-saving draft text to browser `localStorage` | Presentation | **Lane A (UX)** | Transient client-side crash recovery; zero backend persistence impact. |
| Promoting an evidence tier from `SIGNAL` to `DOCUMENTED` | **Epistemic** | **Lane B (SDD)** | Constitutional epistemic governance (Article III). AI cannot self-promote tiers. |

---

## 11. The UX Iteration Lifecycle

Work in Lane A follows a strict 8-step lifecycle that explicitly separates rapid, non-authoritative exploration from governed, accepted changes:

```text
+-----------------------------------------------------------------------------+
|                         LANE A UX ITERATION LIFECYCLE                       |
+-----------------------------------------------------------------------------+
  1. EXPLORE               Audit interface, identify UX friction, define intent.
        │
        ▼
  2. IMPLEMENT EXPERIMENT  Draft presentation-only alternatives (rapid, local).
        │
        ▼
  3. INSPECT               Evaluate visual states against heuristics & design tokens.
        │
        ▼
  4. ITERATE               Refine spacing, typography, hierarchy; revert poor experiments.
        │
        ▼ ─── [ FORMAL FREEZE GATE: Exploration ceases; diff is locked ] ───
  5. FREEZE                Record final changes, target components & invariants.
        │
        ▼
  6. VERIFY                Run collective validation (Typecheck, Build, Tests, A11y).
        │
        ▼ ─── [ HUMAN ACCEPTANCE GATE: Human evaluation & formal sign-off ] ───
  7. HUMAN ACCEPT          Explicit human sign-off; unaccepted work is rejected/reverted.
        │
        ▼
  8. INTEGRATE             Commit changes, update batch record, merge feature branch.
+-----------------------------------------------------------------------------+
```

### Stage Boundaries:
- **Stages 1–4 (Exploratory Loop)**: Changes are rapid, exploratory, and **strictly non-authoritative**. They exist as uncommitted working-tree experiments.
- **Stage 5 (Freeze Gate)**: Exploration stops. The code diff is locked. No validation occurs against a moving target.
- **Stage 6 (Verify)**: Collective validation matrix executes against the frozen code.
- **Stage 7 (Human Accept Gate)**: Human review of visual and interactive results. Human acceptance is mandatory.
- **Stage 8 (Integrate)**: Governed integration into the codebase.

---

## 12. UX Iteration Batch Model: Thematic Coherence

A batch is **NOT** an arbitrary collection of unrelated UI changes across disconnected screens.

> ### 📦 DEFINITION OF A UX ITERATION BATCH
> **A UX Iteration Batch is a bounded, thematically coherent set of related UX improvements sharing a single user intent, surface area, and validation target.**

### Batch Archetype Example:
```text
BATCH ID:             UX-BATCH-002
Area / Surface:       Problem Bank (Card Grid & Table View)
Intent:               Reduce visual cognitive load and clarify primary actions
Thematic Changes:
  - Simplify card layout to elevate Problem Statement
  - Cap header badges to a maximum of 3 (ID, Sector, Evidence)
  - Replace ambiguous button label "Dossier" with "View Details"
  - Replace aggressive label "Devil's Advocate" with "Stress Test"
  - Improve empty-state guidance with clear onboarding cards
Boundary:             Presentation only (Zero schema, API, or logic changes)
Validation Target:    Typecheck, Next.js build, card scannability, responsive grid
Lifecycle:            Freeze → Verify → Human Accept → Integrate
```

### Required Batch Schema:
1. **BATCH ID**: Globally unique identifier (`UX-BATCH-###`).
2. **AREA / SURFACE**: Target UI views, routes, or component trees.
3. **INTENT**: Unified ergonomic, visual, or usability goal.
4. **OBSERVED PROBLEMS**: Empirical findings or audit defect IDs (`DEF-***`).
5. **THEMATIC IMPROVEMENTS**: Coherent list of intended presentation enhancements.
6. **SCOPE**: Explicit list of files and components permitted to change.
7. **INVARIANTS**: System boundaries that must remain completely untouched.
8. **OUT-OF-SCOPE ITEMS**: Explicit boundaries preventing opportunistic drift.
9. **ITERATION NOTES**: Record of explored alternatives and design decisions.
10. **FINAL FROZEN CHANGES**: Component-by-component manifest of frozen changes.
11. **VALIDATION PLAN**: Collective test, build, accessibility, and manual criteria.
12. **VALIDATION RESULTS**: Documented evidence of execution (Pass, Fail, Unverified).
13. **HUMAN ACCEPTANCE**: Formal human evaluation and sign-off record.
14. **STATUS**: Current lifecycle status.

---

## 13. Exploration / "Vibing" Rules

"Vibing" is recognized as rapid, visual design exploration. To maintain rigor, it is governed by strict non-authoritative boundaries:

### What the Agent MAY Do During Exploration:
- Experiment with multiple layout arrangements, flex alignments, and container densities.
- Adjust spacing scales, margins, and padding to improve breathing room and balance.
- Refine typography, line heights, font weights, and text contrast.
- Compare alternative card structures, badge hierarchies, and icon treatments.
- Polish presentation-only microcopy and empty-state guidance.
- Test responsive viewports and breakpoint transitions.
- Discard and revert inferior visual experiments cleanly without leaving dead code.

### What the Agent MUST NEVER Do During Exploration:
- Introduce new backend endpoints, storage calls, or database columns.
- Alter business logic, calculation engines, or validation thresholds.
- Change phase gating rules or user capability permissions.
- Alter external AI providers, prompt templates, or orchestration models.
- Silently persist experimental states into permanent production storage.
- Treat aesthetic satisfaction ("vibes") as proof of correctness or authorization to merge.

---

## 14. Batch Freeze Rules

To prevent validation against a moving target:
1. **Formal Freeze Point**: Before executing final verification, the agent must declare the batch **FROZEN**.
2. **Exploration Ceases**: No further visual tweaks, CSS edits, or copy adjustments are permitted once frozen.
3. **Target Manifest**: The agent documents the exact list of modified files, git status diffs, and components in the batch artifact.
4. **Validation Stability**: The frozen state is the exact and only code state evaluated during batch validation.

---

## 15. Batch Validation Rules

Small visual changes do not require individual, isolated CI runs. Instead, all changes in a frozen batch are validated collectively:

### Required Validation Categories:
1. **Static Type Safety**: Complete TypeScript check (`cd web && npm run typecheck`) with **0 errors**.
2. **Production Compilation**: Clean production build (`cd web && npm run build`) with **0 errors and 0 warnings**.
3. **Automated Regression Suite**: Targeted backend/frontend test execution ensuring zero regression in underlying contracts.
4. **Accessibility Verification**: Outcome-based verification of native semantic elements, keyboard navigation (`Tab`, `Escape`), focus rings, and WCAG 2.1 AA text contrast.
5. **Responsive Verification**: Multi-viewport layout inspection (Mobile: 375px, Tablet: 768px, Desktop: 1440px) ensuring zero horizontal scroll overflow.
6. **Data Invariance Verification**: Verification that existing database records remain 100% byte-intact with zero unintended alterations.

### Strict "UNVERIFIED" Reporting Protocol:
- If an interactive, manual, or browser verification step cannot be executed (e.g., due to local CDP socket failures or headless browser limitations), **the agent MUST report that criterion as `UNVERIFIED`**.
- An agent must **never** report an unverified interactive flow as "PASS" or claim success based solely on passing unit tests.

---

## 16. Human Acceptance Governance

Human acceptance is the **supreme final gate** for any UX Iteration Batch:
1. **Automated Tests ≠ Acceptance**: Passing tests, successful typechecks, and clean builds are prerequisites for review, not human acceptance.
2. **Visual Appeal ≠ Acceptance**: High aesthetic quality does not constitute authorization.
3. **Agent Confidence ≠ Acceptance**: Agent self-evaluation has zero authority to accept changes.
4. **Explicit Human Sign-Off**: The human operator must explicitly review the verification report and authorize acceptance.
5. **No Inferred Authorization**: An agent must never infer authorization from silence, enthusiasm, earlier approvals, or past task completions.

---

## 17. Iteration Batch Status Model

Every UX Iteration Batch transitions through an explicit, auditable state machine:

```text
[ DRAFT ] ────────► [ EXPLORING ] ────────► [ FROZEN ]
                         │                       │
                         ▼                       ▼
                    [ REJECTED ]           [ VALIDATING ]
                                                 │
                               ┌─────────────────┴─────────────────┐
                               ▼                                   ▼
                         [ VERIFIED ]                        [ UNVERIFIED ]
                               │                                   │
                               ▼                                   ▼
                      [ HUMAN ACCEPTED ]                   [ HUMAN REVIEW ]
                               │                                   │
                               ▼                                   ▼
                         [ INTEGRATED ]                      [ SUPERSEDED ]
```

- **`DRAFT`**: Batch proposed; intent, scope, and invariants identified.
- **`EXPLORING`**: Controlled design exploration active; presentation alternatives being evaluated (non-authoritative).
- **`FROZEN`**: Exploration halted; target code manifest locked.
- **`VALIDATING`**: Collective automated and manual test matrix executing.
- **`VERIFIED`**: All automated and observable verification criteria passed with empirical evidence.
- **`UNVERIFIED`**: Automated checks passed, but interactive/browser checks could not be executed due to environment constraints.
- **`HUMAN ACCEPTED`**: Explicit human authorization granted.
- **`INTEGRATED`**: Merged into development baseline.
- **`REJECTED`**: Batch declined by human operator; changes reverted.
- **`SUPERSEDED`**: Replaced by a subsequent batch or formal SDD feature.

---

## 18. Usability & Quality Model

UX iteration must be grounded in objective usability principles rather than subjective whim. The framework adopts the **Nielsen Norman 10 Usability Heuristics** as its core quality evaluation model:

1. **Visibility of System Status**: Real-time spinners, progress labels, skeleton loaders, and toasts must communicate what the system is doing.
2. **Match Between System & Real World**: Interfaces must use natural, domain-appropriate language rather than internal engineering jargon or technical abbreviations.
3. **User Control & Freedom**: Every modal, flow, or destructive action must provide clear cancellation, dismiss, or rollback pathways.
4. **Consistency & Standards**: Visual patterns, button variants, badge hierarchies, and modal layouts must remain consistent across all phases.
5. **Error Prevention**: Forms must disable submission until required inputs exist; destructive actions must require structured confirmation.
6. **Recognition Rather than Recall**: Essential context, field descriptions, and active filters must be visibly presented rather than hidden.
7. **Flexibility & Efficiency of Use**: Provide both card and table views, batch operations, and quick-filter chips for expert efficiency.
8. **Aesthetic & Minimalist Design**: Cards and views must de-clutter extraneous badges and secondary metadata, elevating primary text.
9. **Help Users Recognize & Recover from Errors**: Error messages must be constructive and actionable; raw user input must never be wiped upon extraction failure.
10. **Help & Documentation**: Clear placeholder examples and contextual helper tooltips must explain complex concepts in plain language.

---

## 19. Accessibility Standards (WCAG 2.1 AA)

Accessibility improvements in Lane A must follow outcome-based verification:
- **Semantic HTML**: Replace clickable `div` or `span` elements with native `<button>`, `<a>`, `<input>`, `<select>`, and `<textarea>`.
- **Keyboard Trapping & Escape**: Modals must trap keyboard focus while open and restore focus upon dismissal via `Escape`.
- **Visible Focus Rings**: All interactive controls must display high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-500`).
- **Color Contrast**: Visible text must achieve a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text against dark-mode backgrounds.
- **Screen Reader Labels**: Icon-only buttons must provide explicit `aria-label` attributes; dialogs must reference headers with `aria-labelledby`.

---

## 20. Responsive UX Standards

All CONVERA surfaces must provide responsive, fluid layouts across standard viewport tiers:
- **Mobile (< 640px)**: Single-column stacked cards, full-width primary action buttons, compact utility rows, touch targets >= 44x44px.
- **Tablet (640px – 1024px)**: Two-column grid layouts, wrapped control toolbars, responsive modal sizing.
- **Desktop (> 1024px)**: Three-column spatial grids, data tables with pinned action columns, sticky navigation.
- **No Overflow**: Layouts must never exhibit horizontal scroll bars or clipped modal actions at target breakpoints.

---

## 21. Terminology & User-Facing Language

User-facing language improvements belong to Lane A **when they are presentation-only mappings**:
- **Presentation Aliases**: The UI may translate internal, abrasive, or colloquial terms into clear, human-friendly language.
- **Internal Semantics Preserved**: Renaming UI copy must **never** rename underlying database columns, API parameters, test identifiers, or canonical enums.
- **Standard Translation Mapping Table**:

| Internal / Engineering Term | User-Facing Presentation Label | Context / Surface |
| :--- | :--- | :--- |
| `Ingest AI / GC Notes` | **`Import from Notes`** | Toolbar actions, empty states |
| `AI Field Note Structuring` | **`Extract from Raw Notes`** | Problem Intake modal |
| `Manual 5-Anchor Entry` | **`Enter Details Manually`** | Problem Intake modal, empty states |
| `Dossier` | **`View Details`** | Card and table row actions |
| `Devil's Advocate Challenge` | **`Stress Test Assumptions`** | Detail modals, challenge modals |
| `Unleash Devil's Advocate` | **`Run Stress Test`** | Action button copy |
| `SIGNAL` (Enum) | **`Initial Observation`** | Evidence badges, filter dropdowns |
| `STRONGLY_DOCUMENTED` (Enum)| **`Strongly Verified`** | Evidence badges, filter dropdowns |
| `DOCUMENTED` (Enum) | **`Documented`** | Evidence badges, filter dropdowns |
| `Mechanical Ratchet: Preview`| **`Stage Locked: Review Only`** | Phase header banners |
| `Locked by Mechanical Ratchet`| **`Prerequisites Incomplete`** | Stepper tooltips |

---

## 22. AI & Epistemic Boundaries ("LLM Last, Not LLM First")

This framework strictly enforces CONVERA's constitutional AI boundaries (`CONSTITUTION.md` Articles II, III, VIII):
1. **LLM Last, Not LLM First**: AI models are Socratic drafters, not persistent authorities. AI-extracted fields are strictly **transient client-side drafts** that cannot save directly to the database.
2. **Mandatory Human Review**: Persisting AI-structured data requires explicit human review, editing, and confirmation.
3. **No Autonomous Epistemic Promotion**: AI cannot independently upgrade an evidence tier, validate a claim, or clear a stage gate.
4. **No Unsolicited AI Infrastructure**: UX iteration must **never** introduce new LLM providers, vector stores, embedding pipelines, or autonomous agent loops without a dedicated, formally ratified Lane B specification.

---

## 23. Traceability Model

Every accepted UX Iteration Batch maintains auditable end-to-end traceability:

```text
  [ UX Audit / Observation ]  (e.g., CONVERA_PROBLEM_DISCOVERY_UX_AUDIT.md)
              │
              ▼
  [ Defect / Finding ID ]     (e.g., DEF-PB-001, DEF-PB-004)
              │
              ▼
  [ UX Iteration Batch ]      (e.g., UX-BATCH-001)
              │
              ▼
  [ Frozen Code Changes ]     (e.g., ProblemIntakeModal.tsx, ArchiveProblemModal.tsx)
              │
              ▼
  [ Batch Validation Record ] (e.g., Typecheck PASS, Build PASS, Pytest PASS)
              │
              ▼
  [ Human Acceptance Gate ]   (Formal Sign-Off by Human Operator)
```

---

## 24. Anti-Scope-Drift & Defect Severance

To prevent UX iteration from deteriorating into unstructured development:
- **Severance Rule**: If a behavioral bug, broken backend endpoint, or data corruption defect is discovered while performing a visual UI refinement, the agent **must not fix it opportunistically**.
- **Protocol**:
  1. Halt the behavioral change.
  2. Document the defect with an empirical reproduction report.
  3. Determine whether the defect belongs to an existing formal SDD specification or requires a new Lane B feature branch.
  4. Keep the UX Iteration Batch strictly confined to its frozen presentation scope.

---

## 25. UX Iteration Batch 001: Problem Discovery & Problem Bank Remediation

This section formally incorporates the entirety of the work previously specified under `SPEC-PROBLEM-DISCOVERY-UX-001` as **UX Iteration Batch 001**.

```text
===============================================================================
UX ITERATION BATCH RECORD: UX-BATCH-001
===============================================================================
Batch ID:             UX-BATCH-001
Target Surface:       Phase 1: Problem Discovery / Problem Bank / Problem Intake
Intent:               Eliminate orphaned intake actions, unify manual & notes
                      workflows, replace window.prompt() archival, normalize
                      jargon, and establish clear card visual hierarchy.
Empirical Baseline:   CONVERA_PROBLEM_DISCOVERY_UX_AUDIT.md (main @ ac3584c)
Governing Baseline:   main @ ac3584c
Feature Branch:       feature/problem-discovery-ux-001
Batch Status:         🟢 HUMAN ACCEPTED — AWAITING MERGE AUTHORIZATION
===============================================================================
```

### 25.1 Observed Audit Defects:
- **`DEF-PB-001` (S1)**: Orphaned "Ingest AI / GC Notes" button updating unmounted state in JSX.
- **`DEF-PB-002` (S2)**: Competing intake entry points calling the same backend endpoint.
- **`DEF-PB-003` (S2)**: Internal engineering jargon and slang surfaced in UI copy.
- **`DEF-PB-004` (S2)**: Native `window.prompt()` used for archival in `ProblemDetailModal.tsx`.
- **`DEF-PB-005` (S2)**: Ingestion summary omitted from persisted session state in `pipeline.py`.
- **`DEF-PB-006` (S2)**: Card layout clutter with up to 14 competing visual badge elements.
- **`DEF-PB-008` (S3)**: Non-semantic `div role="button"` controls in empty states.

### 25.2 Frozen Batch Changes:
1. **Canonical Intake (`web/src/components/problem-bank/ProblemIntakeModal.tsx`)**:
   - Tab 1 (Default): Progressive-disclosure Manual Entry form requiring Statement, Persona, and Location.
   - Tab 2: Notes/Chat Import with 8,000-character counter, localStorage crash recovery, and AI extraction via `problemService.enrichNotes`.
   - Mandatory Human Review: Transitions to editable review form before saving.
   - Persistence: Explicit save button invoking `problemService.createProblem` (canonical ID preserved).
2. **Accessible Archival (`web/src/components/problem-bank/ArchiveProblemModal.tsx`)**:
   - In-app modal replacing `window.prompt()`.
   - Structured archival reasons (e.g., *Customer Validation Failed*, *Technical Barrier*, *Duplicate*, *Out of Scope*).
   - Informs user that archival removes the record from the active backlog.
3. **Toolbar & Card Redesign (`web/src/components/problem-bank/ProblemBankView.tsx`)**:
   - Removed orphaned "Ingest AI / GC Notes" button.
   - Header "+ Add Problem" and empty-state action cards routed to canonical `ProblemIntakeModal`.
   - Card layout refactored: Problem Statement elevated to primary text; header badges restricted to <= 3; "Dossier" replaced with "View Details"; "Devil's Advocate" replaced with "Stress Test".
4. **Detail & Challenge Modals (`ProblemDetailModal.tsx`, `DevilsAdvocateModal.tsx`)**:
   - Integrated `ArchiveProblemModal`.
   - Terminology normalized to "Stress Test Assumptions" and "Run Stress Test".
5. **Session Telemetry Bridge (`backend/routers/pipeline.py`)**:
   - Added `state["phase1_ingestion_summary"] = summary` and persisted via `storage.save_session`.
6. **Component Cleanup**:
   - Safely deleted orphaned legacy components `ManualProblemModal.tsx` and `RawBrainstormIngestModal.tsx` after consumer scan verified 0 remaining references.

---

## 26. Three-Tier Requirement Mapping & Classification

Rather than conflating surface-specific requirements with universal framework rules, all requirements originating from `SPEC-PROBLEM-DISCOVERY-UX-001` are classified across a strict **3-Tier Hierarchy**:

```text
+-----------------------------------------------------------------------------+
|                     3-TIER REQUIREMENT CLASSIFICATION                       |
+-----------------------------------------------------------------------------+
| Tier 1: Framework Principle (Universal Invariant across all surfaces)       |
| Tier 2: Reusable UX Pattern (Structural Interaction Model available to all)  |
| Tier 3: Batch-Specific Implementation (Concrete rules for this surface)     |
+-----------------------------------------------------------------------------+
```

### Requirement Mapping Table:

| Legacy ID | Requirement Scope | 3-Tier Classification | Reusable Pattern vs. Batch Rule | Batch 001 Concrete Application |
| :--- | :--- | :---: | :--- | :--- |
| **FR-001** | Manual Intake Form | **Tier 3 (Batch Rule)** | Applies Pattern: *Progressive Disclosure Input* | Specific fields: Sector dropdown, Statement, Persona, Location. |
| **FR-002** | Notes Import Interface | **Tier 3 (Batch Rule)** | Applies Pattern: *Unstructured Input with Recovery* | Specific endpoint: `POST /api/problems/enrich` with 8k char limit. |
| **FR-003** | AI Flow & Human Review | **Tier 1 (Principle)** | Universal Rule: *LLM Last, Not LLM First* | AI returns transient draft; user must click "Save Problem". |
| **FR-004** | Schema & ID Preservation | **Tier 1 (Principle)** & **Tier 3 (Batch)** | Universal Rule: *Non-Destructive Persistence* | 1,509 SQLite records verified intact; canonical sector IDs preserved. |
| **FR-005** | Toolbar & Canonical Entry | **Tier 3 (Batch Rule)** | Applies Pattern: *Single Primary Action & Canonical Entry* | Dedicated "+ Add Problem" CTA; dead button removed in `ProblemBankView`. |
| **FR-006** | Card Visual Hierarchy | **Tier 3 (Batch Rule)** | Applies Pattern: *Typography-First De-Cluttering* | Statement elevated; badge budget <= 3; muted persona/location line. |
| **FR-007** | Language Normalization | **Tier 3 (Batch Rule)** | Applies Pattern: *Presentation Translation Table* | Translation dictionary applied to visible Problem Bank copy. |
| **FR-008** | In-App Archival Modal | **Tier 3 (Batch Rule)** | Applies Pattern: *Structured Confirmation Dialog* | Replaces `window.prompt` in `ProblemDetailModal.tsx`. |
| **FR-009** | State Feedback | **Tier 2 (Pattern)** | Applies Pattern: *Skeletons, Empty States, Alerts* | Skeleton loaders for backlog; 2-action empty state cards. |
| **FR-010** | Ingestion Session Sync | **Tier 3 (Batch Rule)** | SDD Bridge: *State Persistence Lifecycle* | Backend `pipeline.py` session state persistence for summary. |
| **NFR-001**| Component WCAG 2.1 AA | **Tier 1 (Principle)** | Universal Standard: *Accessible Markup & Contrast* | Semantic `<button>`, focus rings, 4.5:1 text contrast. |
| **NFR-002**| Responsive Breakpoints | **Tier 1 (Principle)** | Universal Standard: *Multi-Tier Fluid Viewports* | Mobile (375px), Tablet (768px), Desktop (1440px) layouts. |
| **NFR-003**| Input Responsiveness | **Tier 1 (Principle)** | Universal Standard: *Non-Blocking Interaction* | Zero input latency during text editing and modal manipulation. |
| **NFR-004**| Zero New Dependencies | **Tier 1 (Principle)** | Universal Standard: *Dependency Discipline* | Zero new npm packages or python dependencies. |
| **NFR-005**| Zero Schema Migrations | **Tier 1 (Principle)** | Universal Standard: *Storage Port Invariance* | 24-table SQLite WAL schema remains 100% unaltered. |
| **NFR-006**| Safe Component Cleanup | **Tier 1 (Principle)** | Universal Standard: *Code Hygiene & Zero Dead Files* | Consumer scan verified 0 imports before `git rm`. |

---

## 27. Acceptance Criteria for the Framework

- [ ] **AC-001**: Framework is reusable across all CONVERA UI/UX surfaces (Phases 1–5 and global navigation).
- [ ] **AC-002**: Framework clearly separates presentation-only UX (Lane A) from behavioral/system changes (Lane B).
- [ ] **AC-003**: Framework strictly preserves CONVERA's constitutional authority hierarchy without weakening governance.
- [ ] **AC-004**: Framework explicitly enforces the documented CONVERA development and SDD lifecycles.
- [ ] **AC-005**: Framework enables rapid iterative presentation exploration without requiring full SDD cycles for visual polish.
- [ ] **AC-006**: Framework defines batches as bounded, thematically coherent improvements sharing a single intent and validation target.
- [ ] **AC-007**: Framework requires an explicit freeze point halting exploration before validation begins.
- [ ] **AC-008**: Framework preserves explicit human acceptance as the supreme final authority for any accepted batch.
- [ ] **AC-009**: Framework prevents agents from using UX exploration to bypass SDD, persistence, or architectural rules.
- [ ] **AC-010**: Framework strictly enforces "LLM Last, Not LLM First" across all AI-assisted entry workflows.
- [ ] **AC-011**: Framework preserves all epistemic evidence tiers, scoring invariants, and promotion governance.
- [ ] **AC-012**: Framework enforces anti-agent-creep and truthful reporting of verification states.
- [ ] **AC-013**: The current Problem Discovery remediation is fully preserved and traceable as UX Iteration Batch 001.
- [ ] **AC-014**: All existing requirements from `SPEC-PROBLEM-DISCOVERY-UX-001` are classified across the 3-Tier Hierarchy without silent loss.
- [ ] **AC-015**: The framework supports future batches across CONVERA without requiring redundant framework specifications.
- [ ] **AC-016**: Any proposed behavioral or contract modification is strictly redirected into the Formal SDD Lane.
- [ ] **AC-017**: All verification claims are grounded in verifiable execution evidence.
- [ ] **AC-018**: Unexecuted browser/CDP checks are explicitly recorded as `UNVERIFIED` rather than falsely reported as passed.

---

## 28. Verification Strategy

### 1. Automated Verification (Batch-Level):
- **TypeScript Compilation**: `npm run typecheck` across `web/` must exit with code 0.
- **Production Web Build**: `npm run build` across `web/` must compile successfully with zero errors.
- **Backend Test Suites**: Pytest offline test suites (`test_remediation_usability.py`, `test_problem_bank.py`, `test_phase1_integrity.py`) must pass 100%.
- **Data Integrity Verification**: Pre/post snapshot hashing verifying zero deleted or altered records in `backend/convera.db`.

### 2. Manual & Interactive Verification:
- Manual browser walk-through evaluating modal transitions, form validation, crash recovery, keyboard navigation (`Tab`, `Escape`), focus rings, and responsive viewport behavior.
- In environments where automated browser agents (CDP) encounter loopback or socket errors, the interactive status is explicitly flagged as **`UNVERIFIED`** pending human browser validation.

---

## 29. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :---: | :--- |
| **Agent treats behavioral bug as visual tweak** | High | Hard Boundary Decision Rule (Section 10) explicitly forces any behavioral change into Lane B. |
| **Exploration continues indefinitely during validation** | Medium | Batch Freeze Rule (Section 14) mandates complete freeze before validation begins. |
| **Aesthetic satisfaction mistaken for verification** | High | Quality Model (Section 18) and Human Acceptance Gate (Section 16) require objective empirical proof and human sign-off. |
| **AI extraction corrupts canonical problem IDs** | High | Canonical ID generation remains exclusively in SQLite backend adapter; frontend passes zero arbitrary IDs. |
| **Unverified browser flows falsely reported as passed** | Medium | Strict `UNVERIFIED` protocol (Section 15) prohibits claiming success when browser tools fail. |

---

## 30. Operational Alignment & Governance Resolutions

All governance and operational procedures for this framework are resolved as follows:
1. **Branching & Integration Protocol**: All future Lane A UX batches follow standard CONVERA Git Flow (`DEVELOPMENT_WORKFLOW.md` Section 4). Each batch is developed on a short-lived feature branch (`feat/ux-batch-###` or `fix/ux-batch-###`), frozen, verified, accepted by a human, and merged via standard Pull Request. No redundant release bundling is required.
2. **Visual Verification Protocol**: Visual sign-off is governed by the empirical inspection protocol (Section 18 & 28). Automated Playwright screenshot-diffing remains an optional future CI capability, but is not a blocker for framework operation.
3. **Zero Unresolved Questions**: There are no remaining open architectural or governance questions preventing ratification.

---

## 31. Governance Conclusion

**STATUS**: `🟢 UX-BATCH-001 HUMAN ACCEPTED — STOPPED AT MERGE AUTHORIZATION GATE`

UX-BATCH-001 ("Problem Discovery UX Iteration") has achieved formal **HUMAN ACCEPTANCE** following empirical browser verification across all core workflows, accessibility, terminology, and responsive layouts with zero defects observed.

**Execution Boundary & Strict Stop**:
- In accordance with governance instructions, Antigravity has **STOPPED at the Merge Authorization Gate**.
- **Do NOT merge into `develop` or `main`.**
- **Do NOT promote.**
- **Do NOT deploy.**
- The next gate is **HUMAN MERGE AUTHORIZATION**.
