# CONVERA SDD-018: Quality Assurance & Verification Checklist
# Research Stage F Proposal Canvas & Feasibility Engine

**Specification ID**: CONVERA-SDD-018  
**Classification**: Quality Assurance, Verification & Invariant Enforcement  
**Authority Tier**: Tier 2 (Engineering Checklist)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/018-research-stage-f-proposal-canvas`  
**Target Integration Branch**: `develop`  

---

## 1. Specification Compliance Checklist

- [ ] **CHK-018-01**: SQLite WAL table `research_feasibility_records` (Table 35) created with foreign keys to `sessions(session_id)` and `projects(id)`.
- [ ] **CHK-018-02**: `backend/storage/sqlite_adapter.py` implements complete parameterized CRUD for `research_feasibility_records` with JSON serialization.
- [ ] **CHK-018-03**: `FeasibilityEngine` evaluates regulatory compliance against Republic Act 10173 (Data Privacy Act of 2012) and institutional review protocols (IRB / REC).
- [ ] **CHK-018-04**: `FeasibilityEngine` validates strategic alignment with UN SDGs and DOST-PCIEERD / NAIR priority roadmaps.
- [ ] **CHK-018-05**: `FeasibilityEngine` calculates deterministic resource budgets, timeline bounds, and a composite feasibility score.
- [ ] **CHK-018-06**: `ProposalExporter` is dynamically upgraded to query and bind live database entities across all 6 stages (A through F).
- [ ] **CHK-018-07**: `backend/routers/feasibility.py` exposes evaluation, session query, proposal compilation, and mentor sign-off endpoints with Pydantic v2 validation.
- [ ] **CHK-018-08**: `ResearchOrchestrator` handles `ActionType.AUDIT_COMPLIANCE_FEASIBILITY` and `ActionType.COMPILE_PROPOSAL_CANVAS` in `dispatch_action()`.
- [ ] **CHK-018-09**: `web/src/services/feasibilityService.ts` implements typed client methods for feasibility evaluation, proposal compilation, and mentor authorization.
- [ ] **CHK-018-10**: `web/src/components/research/feasibility/StageFFeasibilityView.tsx` provides interactive sub-tabs for Compliance, Strategic Roadmaps, Budget, Proposal Canvas, and Gate 4 Clearance.
- [ ] **CHK-018-11**: Stage F of `ResearchWorkspaceView.tsx` mounts `StageFFeasibilityView` when `currentPhaseId === "F"`.

---

## 2. CCDS v2.0 Design Tokens & UX Standards Checklist

- [ ] **DES-018-01**: Dark obsidian color palette (`bg-slate-950`, `bg-slate-900`, `border-slate-800/80`).
- [ ] **DES-018-02**: Compliance status indicators: Compliant (Emerald), Warning / Incomplete (Amber), Non-Compliant (Rose).
- [ ] **DES-018-03**: Interactive SDG cards displaying SDG number, official emblem name, and custom rationale input.
- [ ] **DES-018-04**: DOST-PCIEERD / NAIR sector pills with clickable roadmap tags.
- [ ] **DES-018-05**: Clean budget breakdown table with live summing and currency formatting.
- [ ] **DES-018-06**: Full-screen or tabbed Markdown Proposal Preview with 1-click "Copy Markdown" and "Download .md" buttons.
- [ ] **DES-018-07**: Advisor sign-off card with clear human sovereignty badge and defense certification notes.

---

## 3. Invariant & Governance Safety Checklist

- [ ] **INV-018-01 (Article VII Anti-Creep Law)**: Strictly zero new third-party dependencies added to `backend/pyproject.toml` or `web/package.json`.
- [ ] **INV-018-02 (Article II Tri-Part Confidence)**: Compliance status and feasibility score are calculated deterministically; AI commentary is strictly advisory.
- [ ] **INV-018-03 (Article IV Human Sovereignty)**: Stage Gate 4 defense clearance and final proposal certification require explicit human mentor/advisor authorization (`mentor_signoffs`). The AI system cannot self-authorize capstone defense readiness.
- [ ] **INV-018-04 (Article VIII Degraded Resilience)**: Complete proposal compilation and feasibility evaluation succeed offline without external LLM availability (`is_degraded = True`).
- [ ] **INV-018-05 (Audit Logging)**: All feasibility audits and mentor sign-offs are immutably logged to SQLite with timestamps and session attribution.

---

## 4. Conformance & Build Acceptance Checklist

- [ ] **CONF-018-01**: Dedicated test suite (`backend/tests/test_feasibility_engine.py`) passes with 100% assertions.
- [ ] **CONF-018-02**: Full backend regression suite (`pytest backend/tests -m "not live"`) passes (300+ tests passing, 0 failing).
- [ ] **CONF-018-03**: Frontend TypeScript check (`npm run typecheck --prefix web`) passes with 0 errors.
- [ ] **CONF-018-04**: Next.js production build (`npm run build --prefix web`) succeeds with 0 compile errors.
- [ ] **CONF-018-05**: Knowledge graph synchronized via `graphify update .`.
