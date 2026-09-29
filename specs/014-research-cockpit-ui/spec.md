# CONVERA SDD-014: Research Cockpit UI Specification
# Active Research Cockpit & Orchestration Frontend Integration

**Specification ID**: CONVERA-SDD-014  
**Feature Title**: Active Research Cockpit & Orchestration Frontend Integration  
**Classification**: Tier 2 Technical & UI/UX Specification  
**Authority Tier**: Tier 2 Engineering Specification  
**Governing Standard**: CONVERA Concept Development Standard (CCDS v2.0), CONVERA Constitution Article II & IV  
**Parent Architectural Authority**: `docs/00-foundation/IDENTITY.md` §17 & `convera_revised_roadmap.md` (Phase B2)  
**Document Status**: 🟡 FORMULATED / PENDING HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Branches**: `feature/014-research-cockpit-ui` $\rightarrow$ `develop` $\rightarrow$ `main`  
**Dependencies**: `specs/013-research-orchestration-engine/` (`/api/orchestrator/*`)  

---

## 1. Executive Summary & Purpose

CONVERA-SDD-013 established the backend **Research Orchestration Engine**, unifying Methodology Contracts (SDD-011), Decision Intelligence (SDD-004), FTS5 Scholarly Evidence (SDD-006/007), and Devil's Advocate Critiques into deterministic stage checks, epistemic health scores, and prioritized next actions.

**CONVERA-SDD-014** delivers the human-facing operational surface: the **Active Research Cockpit**. The Cockpit replaces static or fragmented HUD elements with a unified, reactive control surface where researchers:
1. **Monitor Stage Prerequisites & Gates**: Immediately visualize whether current stage requirements are satisfied and if the quality gate is ready for inspection.
2. **Track Epistemic Health & Tri-Part Confidence**: Observe real-time net epistemic balance ($B_e = \frac{F + E + S - A}{F + E + S + A}$), facts vs assumptions ratios, and grounded citation counts.
3. **Enforce Article II Overconfidence Guardrail Visually**: Display prominent warning banners and progression blocks when AI certainty $\ge 0.80$ while evidence strength $\le 0.40$, requiring explicit assumption challenges.
4. **Execute Recommended Actions with Human Sovereignty (Article IV)**: Provide one-click dispatch for deterministically ranked actions (`ACQUIRE_EVIDENCE`, `EXECUTE_CRITIQUE`, `CHALLENGE_ASSUMPTION`, `REQUEST_GATE_REVIEW`) with transparent audit trail persistence.
5. **Inspect Orchestration Audit Trail**: Access the chronological history of dispatched research events directly within the session workspace.

---

## 2. User Stories & Acceptance Criteria

### User Story 1: Stage Prerequisite & Gate Visibility (US-014-01)
*As a researcher navigating a methodology framework (INNOVATION or RESEARCH),*  
*I want to see exactly which inputs are satisfied, which outputs are missing, and whether the current gate is locked or ready,*  
*So that I never guess what is required to advance and never attempt premature stage progression.*

- **AC-014-01.1**: The Cockpit displays the active stage name, stage index, and a color-coded gate readiness badge (Locked vs Ready for Review).
- **AC-014-01.2**: If prerequisites are missing, the Cockpit renders an itemized checklist of unsatisfied inputs.
- **AC-014-01.3**: When all outputs are satisfied, the Cockpit enables the "Request Gate Review" trigger.

### User Story 2: Tri-Part Confidence & Overconfidence Alert (US-014-02)
*As an academic or venture researcher bound by CONVERA Constitution Article II,*  
*I want the system to alert me when an AI-generated claim lacks empirical literature backing,*  
*So that speculative hallucination cannot pollute my research foundation.*

- **AC-014-02.1**: The Epistemic Health Meter displays facts count, assumptions count, evidence links, and net balance score ($-1.0$ to $+1.0$).
- **AC-014-02.2**: If `overconfidence_risk === true`, an amber/rose Article II Alert Banner appears at the top of the Cockpit detailing the offending claim.
- **AC-014-02.3**: The Overconfidence Banner presents a direct "Challenge Assumption" action button to trigger the Devil's Advocate engine.

### User Story 3: Human-Sovereign Action Dispatch (US-014-03)
*As a sovereign researcher directing an AI pair-programmer,*  
*I want the top recommended action presented with clear priority, rationale, and a dispatch trigger,*  
*So that I retain complete agency over what research operations execute next.*

- **AC-014-03.1**: The Next Recommended Action card displays the action title, priority badge (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), target engine, and blocking status.
- **AC-014-03.2**: Clicking "Dispatch Action" triggers `POST /api/orchestrator/dispatch-action` with human confirmation, showing a loading indicator and toast notification upon success.
- **AC-014-03.3**: Dispatched actions immediately refresh the orchestration state without requiring a full page reload.

### User Story 4: Orchestration Event History Drawer (US-014-04)
*As a research director or auditor,*  
*I want to inspect recent orchestration dispatch events and execution summaries,*  
*So that the provenance of every research milestone is transparent and reproducible.*

- **AC-014-04.1**: A collapsible "Audit Trail" / "Event History" panel or drawer lists recent events returned by `GET /api/orchestrator/session/{session_id}/events`.
- **AC-014-04.2**: Each entry displays timestamp, action type, status (`SUCCESS`, `DEGRADED`, `ERROR`), and execution summary.

---

## 3. Scope Boundaries & Anti-Goals

### In-Scope
1. TypeScript API client service (`web/src/services/orchestratorService.ts`) wrapping `/api/orchestrator/*`.
2. Dedicated UI component suite in `web/src/components/research/cockpit/`:
   - `ResearchCockpit.tsx`: Root cockpit container.
   - `StageGateMonitor.tsx`: Prerequisite checklist and gate status.
   - `EpistemicHealthMeter.tsx`: Tri-part confidence, facts/assumptions ratio, net balance.
   - `OverconfidenceBanner.tsx`: Article II visual guardrail and challenge trigger.
   - `RecommendedActionCard.tsx`: Prioritized action cards with dispatch action triggers.
   - `OrchestrationEventsDrawer.tsx`: Audit trail viewer.
3. Mounting the Cockpit across both `INNOVATION` and `RESEARCH` session workspace layouts.
4. Offline fallback gracefully displaying local session status when backend is temporarily disconnected.

### Strict Out-of-Scope (Anti-Goals)
1. **No External Frontend Dependencies**: Zero new npm packages in `web/package.json`. Use existing Lucide icons, Tailwind classes, and Framer Motion primitives.
2. **No Auto-Advancement**: The UI must never automatically transition stages or trigger gates without user interaction.
3. **No Direct SQLite Mutations from Client**: All state transitions must route through the existing REST API.
4. **No Ad-Hoc Styling**: Strict compliance with CCDS v2.0 Obsidian Dark tokens (`bg-neutral-950`, `bg-neutral-900`, `border-neutral-800`, `text-neutral-100`).
