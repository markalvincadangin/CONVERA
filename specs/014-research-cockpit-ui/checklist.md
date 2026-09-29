# CONVERA SDD-014: Verification & Governance Checklist
# Active Research Cockpit & Orchestration Frontend Integration

**Specification ID**: CONVERA-SDD-014  
**Classification**: Quality Assurance, Design System & Invariant Enforcement  
**Authority Tier**: Tier 2 (Engineering Checklist)  
**Document Status**: 🟡 FORMULATED / PENDING HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Canonical Path**: `specs/014-research-cockpit-ui/checklist.md`  

---

## 1. Specification Compliance Checklist

- [ ] **CHK-014-01**: `web/src/services/orchestratorService.ts` authored exposing `evaluate()`, `dispatchAction()`, and `listEvents()`.
- [ ] **CHK-014-02**: `StageGateMonitor` renders active stage name, badge, and missing input checklist.
- [ ] **CHK-014-03**: `EpistemicHealthMeter` displays facts, assumptions, evidence items, and net epistemic balance bar.
- [ ] **CHK-014-04**: `OverconfidenceBanner` conditionally displays whenever `overconfidence_risk === true` with Article II explanation.
- [ ] **CHK-014-05**: `RecommendedActionCard` renders priority badge (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), target engine, blocking status, and dispatch button.
- [ ] **CHK-014-06**: Clicking "Dispatch Action" triggers `dispatchAction()` and refreshes evaluation telemetry.
- [ ] **CHK-014-07**: `OrchestrationEventsDrawer` displays chronological event history from `/api/orchestrator/session/{session_id}/events`.
- [ ] **CHK-014-08**: Cockpit integrated seamlessly into main workspace view (`web/src/app/page.tsx` or `WorkspaceRegistry.tsx`).

---

## 2. CCDS v2.0 Design Tokens & UX Standards Checklist

- [ ] **DES-014-01**: Obsidian dark mode styling applied (`bg-neutral-900`, `bg-neutral-950`, `border-neutral-800`, `text-neutral-100`).
- [ ] **DES-014-02**: All action buttons specify `whitespace-nowrap inline-flex items-center justify-center gap-1.5` to avoid awkward wrapping.
- [ ] **DES-014-03**: Icon dimensions calibrated to `w-3.5 h-3.5` or `w-4 h-4`.
- [ ] **DES-014-04**: Color semantics adhered to: Emerald (`emerald-500`) for verified/ready, Amber (`amber-500`) for assumptions/pending, Rose (`rose-500`) for urgent/overconfidence.
- [ ] **DES-014-05**: Responsive layout tested on desktop ($\ge 1024\text{px}$) and mobile viewports.

---

## 3. Invariant & Governance Safety Checklist

- [ ] **INV-014-01 (Article II Tri-Part Confidence)**: Overconfidence risk visually blocks stage advancement and prioritizes assumption challenges.
- [ ] **INV-014-02 (Article IV Human Sovereignty)**: Zero automated stage promotions occur without explicit human confirmation.
- [ ] **INV-014-03 (Article VII Anti-Creep Law)**: Zero new npm packages added to `web/package.json`.
- [ ] **INV-014-04 (Offline Resilience)**: When backend is unreachable, Cockpit renders graceful fallback card without crashing.

---

## 4. Conformance & Build Acceptance Checklist

- [ ] **CONF-014-01**: `npm run typecheck --prefix web` passes with 0 errors.
- [ ] **CONF-014-02**: Unit/component rendering verified with mock data.
- [ ] **CONF-014-03**: Action dispatch roundtrip verified against live backend server.
- [ ] **CONF-014-04**: Knowledge graph synchronized via `graphify update .`.
