# SPEC-REMEDIATION-USABILITY-001: PROPOSED REMEDIATION SPECIFICATION
**System Usability, Session Persistence & Hybrid Ratchet Remediation**

---

## 1. Problem Statement

A comprehensive, read-only system audit of CONVERA against `CONVERA_SYSTEM_USABILITY_AUDIT_PLAN.md` resulted in a **Conditional Pass** (85.05 / 100), prevented from achieving a Full Pass by Hard Gate 2 (Mechanical Ratchet navigation desynchronization) and Hard Gate 11 (audit score < 90.00).

Subsequent architectural and usability reconciliation confirmed that CONVERA's core engine, deterministic scoring, scholarly evidence persistence (FTS5), and source-mediated epistemic bridges (SDD-001 through SDD-007) are mathematically sound and operational. However, critical usability, interaction, and reliability defects in the presentation layer and session state lifecycle impede workflow completion:

1. **State Persistence Failure (`DEF-PERSIST-001`)**: Progress in Phase 1 through Phase 5 and active session selections do not reliably survive a browser page reload.
2. **Navigation Desynchronization (`DEF-UX-001`)**: The Stepper navigation pill hard-locks downstream phases (`disabled={isLocked}`), while the Telemetry strip action button directly invokes `onSelectPhase(target)` without gating checks, producing contradictory navigation cues.
3. **Crude Blocking Modals (`DEF-UX-002`)**: Phase 3 Pivot Loop invokes synchronous browser `window.prompt(...)`, violating CCDS v2.0 modal standards and causing headless test failures.
4. **Hardcoded Provider Errors (`DEF-UX-005`)**: AI generation errors in Phase 1 and Phase 2 hardcode "Google Gemini servers (503)" regardless of the actual active provider or network error mode.
5. **Tablet Layout Breakage (`DEF-UX-006`)**: Stepper pill grid wraps awkwardly on 768px tablet viewports (`grid-cols-2 sm:grid-cols-4 lg:grid-cols-7`).
6. **Brand Leakage (`DEF-UX-003`)**: Residual `"RatchetAI"` strings and `"RATCH-"` share code defaults leak into user-facing interfaces.
7. **Dormant Framework UI Bleed**: Dormant references to unbuilt frameworks (`CAPSTONE`, `PRODUCT`) remain in the Navbar and Stepper, contradicting CONVERA's confirmed Dual-Track operational scope.

---

## 2. Evidence and Validated Findings

| Finding ID | Classification | Severity | Impacted Files | Evidence / Reproduction |
| :--- | :--- | :--- | :--- | :--- |
| **`DEF-PERSIST-001`** | Direct Defect | HIGH | `web/src/app/page.tsx`<br>`web/src/services/sessionService.ts` | Completing Phase 1/2 $\to$ browser refresh $\to$ resets to initial state. `sessionService.updateSession` is implemented but has 0 callers in `web/src`. |
| **`DEF-UX-001`** | Direct Defect | HIGH (Hard Gate 2) | `web/src/components/layout/PipelineStepper.tsx`<br>`web/src/components/phases/phase*/Phase*View.tsx` | Stepper pill has `disabled={isLocked}`; Telemetry strip has "Action" button that calls `onSelectPhase(target)` unconditionally. |
| **`DEF-UX-002`** | Direct Defect | MEDIUM | `web/src/components/phases/phase3/Phase3View.tsx` | Line 89 invokes `window.prompt("Enter reason for pivot...")`. Blocks browser thread, violates CCDS v2.0. |
| **`DEF-UX-005`** | Direct Defect | MEDIUM | `web/src/components/phases/phase1/Phase1View.tsx`<br>`web/src/components/phases/phase2/Phase2View.tsx` | Both files catch errors with hardcoded text: `"Google Gemini servers (503)"` even when running offline or on alternate providers. |
| **`DEF-UX-006`** | Direct Defect | LOW | `web/src/components/layout/PipelineStepper.tsx` | Line 354: `grid-cols-2 sm:grid-cols-4 lg:grid-cols-7` breaks visual continuity on 768px viewports. |
| **`DEF-UX-003`** | Direct Defect | LOW | `web/src/lib/api-client.ts`<br>`backend/storage/sqlite_adapter.py` | `api-client.ts:40` throws `"RatchetAI backend at..."`; `sqlite_adapter.py:40` defaults to `prefix: str = "RATCH"`. |
| **`DORMANT-UI`** | Scope Misalignment | LOW | `web/src/components/layout/Navbar.tsx`<br>`web/src/components/layout/PipelineStepper.tsx` | `Navbar.tsx:87-90` renders badges for `CAPSTONE` and `PRODUCT`; `PipelineStepper.tsx:48-49` maintains unused framework booleans. |

---

## 3. Objective

The objective of this remediation cycle is to resolve the seven validated presentation, interaction, and state-lifecycle defects listed above, establishing verified session persistence across browser reloads, a consistent Hybrid Mechanical Ratchet navigation model, responsive layout integrity, and clean brand representation.

> [!IMPORTANT]
> **Audit Success Condition**
> Completion of this specification does not guarantee an immediate usability score $>90.00$. Rather, this specification addresses the validated usability and reliability defects and provides the evidence required for a subsequent independent usability re-audit.

---

## 4. Scope

The remediation scope is strictly bounded to the following 7 items across 7 files:

1. **Session Persistence**: Ensure supported session state survives page reload.
2. **Hybrid Mechanical Ratchet Navigation**: Enable downstream phase inspection in advisory/preview mode while strictly locking phase execution/commitment gates; unify Stepper and Telemetry navigation rules.
3. **CCDS Modal Implementation**: Replace `window.prompt` in Phase 3 with a proper CCDS `PivotLoopModal`.
4. **Provider-Aware Error Messaging**: Replace hardcoded "Google Gemini" and local URLs with dynamic, transport-aware error messaging.
5. **Responsive Stepper Layout**: Resolve tablet breakpoint wrapping in `PipelineStepper.tsx`.
6. **Brand Consistency & Backward-Compatible Share Codes**: Update `RatchetAI` brand strings to `CONVERA`, and update new share code generation default to `CONV-` while strictly maintaining validity and retrievability for all historical `RATCH-*` share codes.
7. **Dormant Framework UI Cleanup**: Remove unbuilt `CAPSTONE` and `PRODUCT` badges and booleans from the Navbar and Stepper.

---

## 5. Explicit Out-of-Scope Items

The following items are **STRICTLY PROHIBITED** from inclusion in this remediation cycle:

- **`DEF-UX-004` (API Cleanup)**: Deduplication or internal delegation of `/api/decision-room/synthesize` is **DEFERRED** to a separate API cleanup cycle. Zero backend API endpoints are modified.
- **`DEF-ARCH-002` (Generalized Session Progress)**: Generalizing `phase1_complete`...`phase5_complete` columns to framework-agnostic JSON structures is deferred.
- **`DEF-ARCH-004` (Database Schema Restructuring)**: Zero database migrations, table alterations, or index creations.
- **Research Stages B, D, E, and F**: Do NOT implement or activate UI workflows for unbuilt Research stages.
- **Capstone, Product, and Custom Frameworks**: Do NOT activate or build backend engines or execution routes for dormant frameworks.
- **AI Capability Expansion**: Zero prompt changes, zero gateway cascade modifications, zero external model integrations.
- **Opportunistic Refactoring**: No rewriting of functional components outside the exact defect boundaries.

---

## 6. Requirements

### Functional Requirements

| Req ID | Finding Addressed | Description |
| :--- | :--- | :--- |
| **`FR-001`** | `DEF-PERSIST-001` | Supported session state MUST survive a browser refresh. |
| **`FR-002`** | `DEF-UX-001` | Downstream locked phases MUST be selectable in `VIEW / INSPECT` (Preview) mode without allowing execution. |
| **`FR-003`** | `DEF-UX-001` | In Preview Mode, execution and commitment actions MUST remain disabled with clear tooltips indicating prerequisite gates. |
| **`FR-004`** | `DEF-UX-001` | Telemetry strip navigation and Stepper navigation MUST enforce identical gating and preview invariants. |
| **`FR-005`** | `DEF-UX-002` | Phase 3 Pivot Loop MUST use a CCDS modal dialog, accepting user rationale without invoking browser prompt APIs. |
| **`FR-006`** | `DEF-UX-005` | AI generation failures MUST display dynamic error messages indicating server or transport status without hardcoded provider names. |
| **`FR-007`** | `DEF-UX-003` | User-facing brand strings MUST reference `CONVERA`. Newly generated share codes MUST use `CONV-` prefix; historical `RATCH-*` codes MUST remain fully resolvable. |
| **`FR-008`** | `DORMANT-UI` | Navbar and Stepper UI elements MUST ONLY present the two operational frameworks: Innovation Track and Research Track. |

### Non-Functional Requirements

| Req ID | Target Metric | Description |
| :--- | :--- | :--- |
| **`NFR-001`** | 0 TypeScript Errors | `npm run typecheck` passes with zero diagnostics. |
| **`NFR-002`** | 100% Backend Green | All 156 existing offline pytest unit and integration tests pass without regression. |
| **`NFR-003`** | Zero Schema Change | No database migrations, alterations, or schema drift. |
| **`NFR-004`** | Backward Compatibility | All existing share codes (`RATCH-*`) and historical sessions load without error. |
| **`NFR-005`** | Responsive Integrity | Stepper renders cleanly without overlapping or broken wraps from 375px to 1920px. |

---

## 7. UX & Navigation Requirements: The Mechanical Ratchet Hybrid Model

### Epistemic & Methodological Invariants

The Mechanical Ratchet is the constitutional mechanism preventing users from committing decisions or advancing phases without satisfying requisite epistemic conditions (Constitution Art. II, Art. III, Art. VIII).

The **Hybrid Navigation Model** reconciles discoverability with methodological rigor:

```
+-------------------------------------------------------------------------+
|                        MECHANICAL RATCHET MODES                         |
+------------------------------------+------------------------------------+
|          ACTIVE / UNLOCKED         |       PREVIEW / ADVISORY           |
|         (Prerequisites Met)        |     (Prerequisites Incomplete)     |
+------------------------------------+------------------------------------+
| • Phase is unlocked                | • Phase is locked downstream       |
| • User can inspect all data        | • User can inspect layout/structure|
| • EXECUTE / COMMIT / ADVANCE enabled| • EXECUTE / COMMIT / ADVANCE LOCKED|
| • Interactive inputs editable      | • In-view Warning / Advisory banner|
| • State mutations permitted        | • Read-only view of prior outputs  |
+------------------------------------+------------------------------------+
```

### Precise Behavioral Specification

1. **Stepper Pills**:
   - Downstream pills are NOT disabled. Clicking a locked phase sets `activePhase = targetPhase`.
   - Visual styling distinguishes:
     - *Completed*: Emerald checkmark badge (`bg-emerald-500/10 text-emerald-400 border-emerald-500/30`).
     - *Active / In Progress*: Cyan highlight (`bg-cyan-500/20 text-cyan-300 border-cyan-500/50`).
     - *Preview Mode*: Amber/Slate dashed border with a subtle "Preview" tag (`border-dashed border-amber-500/30 text-slate-400`).
2. **In-View Advisory Banner**:
   - When viewing a phase in Preview Mode, an advisory banner MUST be rendered at the top of the phase viewport:
     > **Preview Mode — Read Only**  
     > *Prerequisites for this phase are not yet satisfied. You may inspect the phase structure and requirements, but execution actions are locked until [Prerequisite Phase Name] is completed.*
3. **Execution Button Gating**:
   - In Preview Mode, primary execution buttons (e.g., "Run Analysis", "Synthesize Decision", "Commit Decision", "Advance Phase") MUST be `disabled={true}`.
   - Hovering or focusing on a disabled action button MUST display a tooltip:
     > *Complete [Prerequisite Phase] to unlock this action.*
4. **Telemetry Alignment**:
   - The Telemetry bar's "Action" button must not bypass the ratchet. If the current phase has incomplete prerequisites, the action button must reflect the next valid prerequisite action or trigger navigation to the active unlocked phase.

---

## 8. Session Persistence Requirements

### Supported State Preservation Contract

The specified supported session state MUST survive a browser reload.

Supported state elements that must persist across refresh:
- `session_id` and `project_id`
- Active framework selection (`INNOVATION` vs `RESEARCH`)
- Phase completion flags (`phase1_complete` through `phase5_complete`)
- Current active phase index / identifier
- Phase 1 generated outputs: `phase1_response`, problem statements, candidate lists
- Phase 2 generated outputs: `phase2_response`, decision room synthesis, candidate rankings
- Phase 3 generated outputs: `phase3_problem`, extracted assumptions, test levels, validation metrics
- Phase 4 generated outputs: `phase4_response`, delivery milestones
- Phase 5 generated outputs: `phase5_response`, retrospective summaries

### Architecture & Verification Constraint

- **Zero Database Changes**: State persistence must utilize the existing `sessions.state_data` JSON column and existing storage contracts.
- **Implementation Isolation**: The specific update mechanism remains an implementation detail. The implementing engineer must verify that `save_session` actually preserves all state fields without unexpected normalization, clipping, or overwriting before committing the frontend integration.
- **Mandatory Lifecycle Test**:
  $$\text{Create/Update State} \longrightarrow \text{Browser Reload} \longrightarrow \text{Fetch/Restore Session} \longrightarrow \text{Assert State Retained}$$

---

## 9. UI Requirements

### 9.1 Pivot Loop Modal (`DEF-UX-002`)
- Create `web/src/components/phases/phase3/PivotLoopModal.tsx` utilizing CCDS `Modal` and `Textarea` primitives.
- Replace synchronous `window.prompt` in `Phase3View.tsx`.
- The modal must contain:
  - Header: "Initiate Pivot Loop"
  - Body: Form with reason input (minimum 5 characters), affected assumption indicator, and clear impact explanation.
  - Footer: "Cancel" (secondary) and "Confirm Pivot" (primary destructive/warning styling).
- Accessible via keyboard (`Esc` to close, `Enter` with modifier to submit, focus trap).

### 9.2 Responsive Stepper Layout (`DEF-UX-006`)
- In `PipelineStepper.tsx`:
  - Replace rigid `grid-cols-2 sm:grid-cols-4 lg:grid-cols-7` with a flexible, scrollable or wrap-optimized responsive container.
  - On tablet viewports (640px–1024px), ensure pills maintain consistent padding, legible typography, and no clipped badges.

### 9.3 Provider Error Messaging (`DEF-UX-005`)
- In `Phase1View.tsx` and `Phase2View.tsx`:
  - Remove hardcoded `"Google Gemini servers (503)"` and local URLs.
  - Implement dynamic error presentation:
    - If backend unreachable: `"Cannot reach the CONVERA backend. Check your connection or server status and try again."`
    - If provider returns error: Display the sanitized provider message or `"Upstream provider temporarily unavailable. Please retry."`

### 9.4 Brand Cleanup & Share Code Compatibility (`DEF-UX-003`)
- Replace user-facing `"RatchetAI"` with `"CONVERA"` in `web/src/lib/api-client.ts:40`.
- Update `generate_share_code(prefix: str = "CONV")` default in `backend/storage/sqlite_adapter.py:40`.
- **Backward-Compatibility Guarantee**: The storage adapter's share code lookup (`WHERE p.share_code = ?`) performs exact matches. All historical `RATCH-*` codes remain valid and retrievable. No database data is migrated or mutated.

### 9.5 Scope Alignment (`DORMANT-UI`)
- In `Navbar.tsx:getFrameworkBadge()`: Remove `case "CAPSTONE"` and `case "PRODUCT"`.
- In `PipelineStepper.tsx`: Remove unused dormant framework variables (`isCapstone`, `isProduct`).

---

## 10. API Requirements

> [!NOTE]
> **Zero API Changes**
> Following human leadership review, `DEF-UX-004` (redundant decision synthesis endpoint) is classified as **DEFERRED** to a separate API cleanup cycle. Zero API endpoints are added, modified, or deprecated in this cycle.

---

## 11. Data & Storage Impact

| Entity | Migration Required? | Impact Analysis |
| :--- | :--- | :--- |
| `sessions` table | **NO** | Reuses existing `state_data` JSON column. |
| `projects` table | **NO** | Stores both `CONV-*` and `RATCH-*` codes seamlessly. |
| Relational tables (T1–T23) | **NO** | Unchanged. |
| SQLite Indexes | **NO** | Unchanged. |

---

## 12. Verification Requirements

The eventual implementation must be independently verifiable across 8 distinct verification protocols:

1. **Defect Verification Suite**:
   - `DEF-PERSIST-001`: Reload state retention test (automated via Playwright/interaction test or verified lifecycle mock).
   - `DEF-UX-001`: Hybrid navigation test asserting Preview Mode selection works, banners render, and action buttons are disabled.
   - `DEF-UX-002`: Modal test asserting `window.prompt` is absent and `PivotLoopModal` renders, accepts text, and submits.
   - `DEF-UX-005`: Error test verifying transport failure displays generic backend unreachable text without "Google Gemini".
   - `DEF-UX-006`: Viewport test verifying Stepper rendering across 375px, 768px, 1024px, and 1440px widths.
   - `DEF-UX-003`: Share code test asserting both `CONV-*` and `RATCH-*` codes resolve correctly.
   - `DORMANT-UI`: DOM test asserting no "Capstone" or "Product" text in Navbar or Stepper.
2. **Backend Regression Gate**:
   - Run `pytest backend/tests/` $\to$ 100% pass (all 156 existing tests).
3. **Frontend Typecheck Gate**:
   - Run `npm run typecheck` in `web/` $\to$ 0 diagnostics.

---

## 13. Regression Requirements

To ensure no degradation of existing constitutional or architectural foundations:

1. **Epistemic Invariants**: No bypass of Phase gates for state-mutating actions (Constitution Art. II, Art. VIII).
2. **Gateway Cascade**: SDD-003 fallback cascade and provider cooldown mechanics remain untouched.
3. **Deterministic Ranking**: SDD-004 ranking math and invariant checks remain untouched.
4. **FTS5 Scholarly Persistence**: SDD-006 search tables and indexes remain untouched.
5. **Source-Mediated Bridge**: SDD-007 reconciliation levels and safeguards remain untouched.

---

## 14. Risks & Mitigations

| Risk | Classification | Potential Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **Persistence state drift** | Low architectural risk / bounded implementation risk | Saving state might clobber fields if not merged cleanly. | Verify `save_session` merge semantics; test state round-trip before enabling frontend auto-save. |
| **Navigation gate leak** | Low architectural risk / bounded implementation risk | Users might bypass gates via keyboard navigation or URL change. | Enforce action button disablement at the component level; maintain backend validation on mutation routes. |
| **Modal accessibility** | Bounded implementation risk | Modal trap or key listener issues in CCDS v2.0. | Use established CCDS `Modal` pattern with standard escape and backdrop click handlers. |
| **Share code collision** | Bounded implementation risk | Prefix change could impact existing bookmarks. | Maintain exact lookup query `WHERE p.share_code = ?` so both prefixes are natively valid. |
| **UI framework removal regression** | Bounded implementation risk | Removing badges might break framework type unions. | Only remove UI badge renders; preserve `FrameworkType` schema unions if referenced elsewhere. |

---

## 15. Open Questions & Governance Ratification

1. **Dual-Track Operational Scope**: Established by existing canonical specifications. Innovation Track and Computing Research Track are the sole active targets.
2. **Hybrid Navigation Model**: The Hybrid Navigation Model (Preview Mode for downstream phases with disabled execution actions and in-view advisory banner) is a proposed remediation interpretation and **requires explicit human ratification before implementation**.
3. **Research Stages B, D, E, and F**: Confirmed outside this remediation scope; remain informational or future capability.
4. **API Cleanup (`DEF-UX-004`)**: Confirmed deferred to a separate cleanup cycle.

---

## 16. Conformance Matrix

| Specification Item | Conformance Status | Governance Note |
| :--- | :--- | :--- |
| Dual-Track Architecture | 🟢 Preserved | Capstone/Product UI removed; Innovation/Research active. |
| Mechanical Ratchet Protection | 🟢 Preserved | Gating strictly preserved; Hybrid model adds read-only preview. |
| Epistemic Integrity | 🟢 Preserved | Zero changes to evidence, knowledge, or decision engines. |
| Product Decision Required | ⚠️ **YES** | **Human ratification required for the Hybrid Navigation Model.** |
| Architectural Risk Level | 🟢 Low | Characterized as "Low architectural risk / bounded implementation risk". |
| Database Migration Impact | 🟢 Zero | Zero migrations, alterations, or schema changes. |
| API Modification Impact | 🟢 Zero | Zero API changes; DEF-UX-004 deferred. |
| Verification Feasibility | 🟢 Complete | Covered by unit tests, typechecks, and reload verification. |

---

## 17. Implementation Tasks (Dependency-Ordered)

*Note: Execution of these tasks is NOT authorized until this specification is ratified.*

### Task Group 1: Branding & Framework UI Cleanup
- [ ] `TASK-REM-01`: Update error throw in `web/src/lib/api-client.ts:40` to reference `"CONVERA"`.
- [ ] `TASK-REM-02`: Update `generate_share_code` in `backend/storage/sqlite_adapter.py:40` default prefix to `"CONV"`; verify backward compatibility for `RATCH-*`.
- [ ] `TASK-REM-03`: Remove `CAPSTONE` and `PRODUCT` badge cases in `web/src/components/layout/Navbar.tsx`.
- [ ] `TASK-REM-04`: Remove unused dormant framework booleans in `web/src/components/layout/PipelineStepper.tsx`.

### Task Group 2: Responsive & Error Presentation Polish
- [ ] `TASK-REM-05`: Calibrate responsive layout classes in `PipelineStepper.tsx:354` to eliminate awkward wrapping on tablet viewports.
- [ ] `TASK-REM-06`: Implement dynamic provider and transport error messaging in `Phase1View.tsx` and `Phase2View.tsx`, removing hardcoded "Google Gemini" and local URLs.

### Task Group 3: Modal & Hybrid Navigation Implementation
- [ ] `TASK-REM-07`: Build `web/src/components/phases/phase3/PivotLoopModal.tsx` using CCDS modal primitives.
- [ ] `TASK-REM-08`: Replace `window.prompt` in `Phase3View.tsx` with `PivotLoopModal`.
- [ ] `TASK-REM-09`: Update `PipelineStepper.tsx` to allow selecting downstream phases in Preview Mode (remove `disabled={isLocked}`).
- [ ] `TASK-REM-10`: Implement the In-View Advisory Banner in downstream phases (`Phase3View`, `Phase4View`, `Phase5View`) when accessed in Preview Mode.
- [ ] `TASK-REM-11`: Ensure execution and advancement action buttons in downstream phases remain disabled in Preview Mode with informative tooltips.
- [ ] `TASK-REM-12`: Align Telemetry strip action button gating with Stepper preview rules.

### Task Group 4: Session Persistence Integration
- [ ] `TASK-REM-13`: Verify backend `storage.save_session` parameter contracts and state preservation behavior.
- [ ] `TASK-REM-14`: Wire session persistence in `web/src/app/page.tsx` (`handleUpdateSession` and phase completion hooks) to ensure state survives reload.

### Task Group 5: Verification & Regression Gates
- [ ] `TASK-REM-15`: Run `npm run typecheck` and assert zero errors.
- [ ] `TASK-REM-16`: Run `pytest backend/tests/` and assert all 156 tests pass.
- [ ] `TASK-REM-17`: Perform browser session reload verification protocol ($\text{create state} \to \text{refresh} \to \text{verify retained}$).
- [ ] `TASK-REM-18`: Execute usability verification checklist to confirm all 7 defect criteria are resolved prior to requesting independent re-audit.

---

## 18. Human Ratification Gate

```
================================================================================
                    HUMAN RATIFICATION GATE: RATIFIED
================================================================================

[X] RATIFY SPECIFICATION — RATIFIED BY HUMAN LEADERSHIP (2026-09-05T20:07:11+08:00)
    Formally approved:
    • Dual-Track operational scope as stated.
    • Hybrid Mechanical Ratchet Navigation Model.
    • The bounded remediation scope.
    • All stated exclusions, constraints, and verification requirements.

    STATUS: SPECIFICATION RATIFIED.
    This ratification does NOT authorize implementation.

================================================================================
```

---

## 19. Implementation Authorization Gate

```
================================================================================
                IMPLEMENTATION AUTHORIZATION GATE: AUTHORIZED
================================================================================

[X] AUTHORIZE IMPLEMENTATION — AUTHORIZED BY HUMAN LEADERSHIP (2026-09-05T20:08:27+08:00)
    Explicit authorization granted to begin execution of Tasks TASK-REM-01 through
    TASK-REM-18 strictly within the ratified SPEC-REMEDIATION-USABILITY-001 scope.

    STATUS: IMPLEMENTATION IN PROGRESS.
    Branch: feature/remediation-usability-001
    Baseline Commit: 301448c26f0927622ce9a4ecb3f07a78aa3c7eb1

================================================================================
```

---
