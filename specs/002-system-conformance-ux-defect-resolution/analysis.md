# CONVERA SDD-002: System Conformance, Architectural Decisions & Risk Analysis

**Specification ID**: `CONVERA-SDD-002`  
**Status**: 🟢 PHASE 7.5 IMPLEMENTATION READINESS REVIEW COMPLETE  

---

## 1. Architectural Readiness Decisions

### Decision 1: Rejection of Unnecessary Backend Route Aliases (DEF-001)
- **Problem**: `problemService.queryResearch` in frontend called `/api/research/query` (which returned 404), while backend implemented federated scholarly search via `POST /api/connectors/search`.
- **Evaluated Remediation Options**:
  - *Option A*: Add a route alias `@router.post("/query")` in `backend/routers/research.py` that mirrors `/api/connectors/search`.
  - *Option B (Approved)*: Retain `POST /api/connectors/search` as the single canonical contract authoritatively defined in `docs/04-ai/CONNECTOR_ARCHITECTURE.md`. Update `web/src/services/problemService.ts` to call `connectorService.searchScholarly` / `POST /api/connectors/search` directly.
- **Rationale**: Option B enforces single-source-of-truth contract purity and prevents stale route proliferation. Option A was rejected as unnecessary API duplication.

### Decision 2: Primitive-First Modal Accessibility (DEF-002)
- **Problem**: 22 Modal/Dialog views lacked explicit ARIA modal dialog annotations.
- **Evaluated Remediation Options**:
  - *Option A*: Manually duplicate ARIA attributes across all 22 component files.
  - *Option B (Approved)*: Centralize standard `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` semantics in the shared dialog primitive `web/src/components/common/Modal.tsx`, and add dedicated dialog semantics to independent custom drawers/modals (`ConfirmModal`, `CommandPaletteModal`, `IntelligenceScorecardDrawer`, `TraceabilityDrawer`).
- **Rationale**: Maximizes code reuse, maintainability, and guarantees WCAG 2.2 AA conformance across all consumer modals.

### Decision 3: Semantic Tag Selection for Interactive Controls (DEF-003)
- **Problem**: 15 clickable container elements used `<div onClick=...>`.
- **Evaluated Remediation Options**:
  - *Option A*: Blindly convert all `<div>` to `<button>`.
  - *Option B (Approved)*: Differentiate semantic action buttons from selectable composite cards. Use native `<button type="button">` where the element is an action button; for composite layout cards, provide `role="button"`, `tabIndex={0}`, keyboard `onKeyDown` handlers (supporting `Enter` and `Space`), and `focus-visible:ring-2`.
- **Rationale**: Preserves CSS layout structure and typography while establishing full keyboard navigability and focus visibility.

### Decision 4: Resilient User Feedback in Asynchronous Modals (DEF-004)
- **Problem**: Catch blocks in `ResearchEvidenceModal` and `CitationVerifierModal` logged errors only to `console.error`.
- **Remediation**: Retain `console.error` for diagnostic tracing, while adding local `errorMessage` state, inline accessible alert banners (`role="alert"`), and retry paths.

---

## 2. Risk Boundaries & Invariant Controls

1. **Target Boundary Invariant**: Planned capabilities (`[TARGET]`: synthetic terminal fallback `weight = 0.0`, automatic cloud-to-Ollama timeout cascade, production JWT/RBAC) remain strictly preserved and out-of-scope for defect resolution.
2. **Minimal Bounded Change Invariant**: No refactoring outside the exact scope of DEF-001 through DEF-004.
3. **Continuous Regression Gate**: Automated tests must run after every atomic defect resolution.
