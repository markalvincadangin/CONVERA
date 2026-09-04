# CONVERA SDD-002: Verification Plan & Evidence Record

**Specification ID**: `CONVERA-SDD-002`  
**Status**: 🟢 PHASES 9, 10, 11 EMPIRICALLY RATIFIED  

---

## 1. Targeted Defect Verification Matrix

| Defect ID | Target Fix | Regression Test Strategy | Verification Evidence | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-001** | `problemService.ts` -> `/api/connectors/search` | Execute federated search contract test suite; verify `engine="ALL"` and specific engine ID filtering. | `backend/tests/test_def001_contract.py` (5/5 tests PASSED); zero `/api/research/query` calls remaining. | ✅ PASSED |
| **DEF-002** | `Modal.tsx` & Drawers ARIA roles | Inspect rendered DOM elements for `role="dialog"`, `aria-modal="true"`, and Escape key handlers. | `backend/scripts/verify_phase9_local.py` confirmed dialog roles, modal states, and Escape listeners across all 7 targets. | ✅ PASSED |
| **DEF-003** | Interactive cards keyboard navigability | Verify `role="button"`/`role="checkbox"`, `tabIndex={0}`, and `onKeyDown` (`Enter`/`Space`) across interactive cards. | Verified across `SessionManager`, `GateReviewModal`, `DecisionRoomWorkspace`, `ProblemComparisonMatrix`, `ProblemBankView`. | ✅ PASSED |
| **DEF-004** | Research modal error state banners | Verify `role="alert"` error banner renders with `AlertTriangle` icon and dismiss action upon failure. | `ResearchEvidenceModal.tsx` contains complete error banner JSX, `errorMessage` state, and auto-clearing logic. | ✅ PASSED |

---

## 2. Automated Regression Gates

| Gate ID | Target Subsystem | Command | Baseline | Post-Fix Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GATE-A** | Backend Unit & Engine Suite | `python -m pytest` (`backend/`) | 86 passed, 0 failed | **91 passed, 0 failed** (23 pre-existing model warnings) | ✅ PASSED |
| **GATE-B** | Frontend Production Build | `npm run build` (`web/`) | 0 errors, 4 static routes | **0 errors, 4 static routes** (Next.js 15.2.0) | ✅ PASSED |
| **GATE-C** | Database Schema Integrity | SQLite physical schema inspector | 23 physical tables | **23 physical tables confirmed intact** | ✅ PASSED |
| **GATE-D** | Documentation Link Integrity | Markdown relative link audit | 0 broken links | **88/88 relative links verified (0 broken)** | ✅ PASSED |
| **GATE-E** | Whitespace & Formatting | `git diff --check` | Clean | **0 whitespace errors** | ✅ PASSED |

---

## 3. Change Surface Metrics

```
 web/src/components/common/CommandPaletteModal.tsx  | 10 +++++++-
 web/src/components/common/FrameworkSelectorModal.tsx   |  6 ++++-
 web/src/components/common/Modal.tsx                |  8 +++++--
 web/src/components/frameworks/research/GateReviewModal.tsx        | 18 +++++++++++----
 web/src/components/knowledge/IntelligenceScorecardDrawer.tsx      |  9 ++++++--
 web/src/components/knowledge/TraceabilityDrawer.tsx    |  9 ++++++--
 web/src/components/layout/SessionManager.tsx       | 12 +++++++++-
 web/src/components/phases/phase2/DecisionRoomWorkspace.tsx        | 11 ++++++++-
 web/src/components/phases/phase2/ProblemComparisonMatrix.tsx      | 11 ++++++++-
 web/src/components/problem-bank/ProblemBankView.tsx    | 18 ++++++++++++---
 web/src/components/problem-bank/ResearchEvidenceModal.tsx         | 27 ++++++++++++++++++++++
 web/src/services/problemService.ts                 |  9 ++++++--
 12 files changed, 128 insertions(+), 20 deletions(-)
```
