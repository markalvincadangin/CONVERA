# CONVERA SDD-002: Defect Register

**Specification ID**: `CONVERA-SDD-002`  
**Status**: 🟢 ALL 4 IN-SCOPE DEFECTS RESOLVED & EMPIRICALLY VERIFIED  

---

## Defect Severity Scale
- **P0**: Catastrophic / Blocking (system crash, data corruption, total workflow blocker)
- **P1**: Critical Functional Defect (feature failure, broken API contract, state desync)
- **P2**: Significant Defect (incorrect calculations, broken edge-case flow, accessibility failure)
- **P3**: Moderate Defect (visual hierarchy mismatch, missing loading skeleton, inconsistent spacing)
- **P4**: Minor Polish / Technical Debt (doc comment typo, non-breaking cosmetic refinement)

## Confidence Levels
- **Confirmed**: Verified with reproducible evidence and test case.
- **Probable**: Traced through code analysis with high confidence of failure under specific conditions.
- **Suspected**: Potential discrepancy requiring empirical test execution to confirm.

---

## Active Defect Ledger

| Defect ID | Severity | Confidence | Subsystem | Description & Specification Reference | Root Cause | Status | Resolution / Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-001** | **P1** | **Confirmed** | Frontend ↔ Backend Contract | `problemService.queryResearch` called `/api/research/query` which returned 404. Scholarly federated search is implemented in `POST /api/connectors/search`. Reference: `docs/04-ai/CONNECTOR_ARCHITECTURE.md`. | Frontend service pointed to non-existent route alias `/api/research/query` rather than `/api/connectors/search`. | **RESOLVED & VERIFIED** | Updated `web/src/services/problemService.ts` to call canonical `POST /api/connectors/search` directly with `connector_ids` and `limit_per_source` mapping. Verified via 5/5 passing contract tests in `backend/tests/test_def001_contract.py`. |
| **DEF-002** | **P2** | **Confirmed** | Frontend Accessibility (A11Y) | Modal/Dialog components lacked `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and Escape key handlers. Reference: `docs/06-frontend/ACCESSIBILITY.md` (`A11Y-01` to `A11Y-05`). | Modal overlays were implemented as plain unannotated fixed `<div>` containers. | **RESOLVED & VERIFIED** | Added `role="dialog"`, `aria-modal="true"`, accessible name attributes, and Escape key listeners across `Modal.tsx`, `CommandPaletteModal.tsx`, `GateReviewModal.tsx`, `IntelligenceScorecardDrawer.tsx`, and `TraceabilityDrawer.tsx`. Verified via AST/DOM script. |
| **DEF-003** | **P2** | **Confirmed** | Frontend Keyboard Navigation | Interactive card/list elements used `<div onClick=...>` without `role="button"`, `tabIndex={0}`, or `onKeyDown` handlers. Reference: `docs/06-frontend/ACCESSIBILITY.md` (`A11Y-02`). | Interactive elements lacked keyboard event handlers (`Enter`/`Space`), semantic roles, and focus rings. | **RESOLVED & VERIFIED** | Added `role="button"` / `role="checkbox"`, `tabIndex={0}`, `onKeyDown` handlers, and `focus-visible:ring-2` across `SessionManager.tsx`, `GateReviewModal.tsx`, `DecisionRoomWorkspace.tsx`, `ProblemComparisonMatrix.tsx`, `FrameworkSelectorModal.tsx`, and `ProblemBankView.tsx`. |
| **DEF-004** | **P3** | **Confirmed** | Frontend UX & Feedback | `ResearchEvidenceModal` logged search errors to `console.error` without rendering inline user-facing error feedback. Reference: `docs/06-frontend/UI_UX_PRINCIPLES.md`. | Catch blocks did not declare or set local error state variables for UI rendering. | **RESOLVED & VERIFIED** | Declared `errorMessage` state, inline `role="alert"` error banner with `AlertTriangle` icon and dismiss button, and automatic stale error clearing on search/auto-match retry in `ResearchEvidenceModal.tsx`. |
