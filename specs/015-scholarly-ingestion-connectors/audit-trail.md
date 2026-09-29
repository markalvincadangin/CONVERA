# CONVERA SDD-015: Governance Audit Trail
# Scholarly Ingestion & Live Connectors (CIIA v1.0 Life Cycle Record)

**Specification ID**: CONVERA-SDD-015  
**Classification**: Audit Trail & Governance Life Cycle Record  
**Authority Tier**: Tier 2 (Governance & Audit Record)  
**Document Status**: 🟢 VERIFIED & RATIFIED  
**Revision**: 1.1.0  
**Target Feature Branch**: `feature/015-scholarly-ingestion-connectors`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `70a5ada`  

---

## 1. Document Identification & Traceability Matrix

| Attribute | Specification Value |
|:---|:---|
| **Specification ID** | CONVERA-SDD-015 |
| **Feature Title** | Scholarly Ingestion & Live Connectors |
| **Roadmap Phase** | Phase C: Research Intelligence Expansion (Work Item: Live Scholarly Ingestion) |
| **Constitutional Articles** | Article I (Grounding), Article II (Tri-Part Confidence), Article IV (Human Sovereignty), Article VII (Anti-Creep Law) |
| **Primary Authors** | Antigravity AI Pair Programmer & System Architect |
| **Governing Framework** | CONVERA Intelligence & Integration Architecture (CIIA v1.0) |
| **Preceding Specifications** | `CONVERA-SDD-006` (Scholarly Works FTS5), `CONVERA-SDD-007` (Epistemic Bridge), `CONVERA-SDD-013` (Orchestration Engine), `CONVERA-SDD-014` (Research Cockpit UI) |

---

## 2. Phase Life Cycle & Gate Transitions

| Life Cycle Phase | Gate Name | Target Status | Approval Authority |
|:---|:---|:---|:---|
| **Phase 1: Formulation** | Specification Gate | 🟢 RATIFIED | Human Lead Researcher / Architect |
| **Phase 2: Execution** | Implementation Gate | 🟢 PASSED | Automated Test Suite (pytest, tsc, Next.js build) |
| **Phase 3: Integration** | Merge Gate | 🟢 READY FOR MERGE TO `develop` | Engineering Review & Verification Protocol |
| **Phase 4: Release** | Promotion Gate | ⚪ PENDING PROMOTION TO `main` | Full Regression & Architecture Review |

---

## 3. Commit SHA Mapping & Git History

| Date / Timestamp | Git Commit SHA | Branch | Event Description |
|:---|:---|:---|:---|
| 2026-09-29T20:24:39+08:00 | `70a5ada` | `feature/015-scholarly-ingestion-connectors` | Branch created from `develop` (`70a5ada`). |
| 2026-09-29T20:30:12+08:00 | `9ca4c91` | `feature/015-scholarly-ingestion-connectors` | Formulation of canonical 6-document SDD-015 specification dossier. |
| 2026-09-29T20:41:00+08:00 | *Pending* | `feature/015-scholarly-ingestion-connectors` | Implementation of connectors, storage adapters, router, orchestrator action, and UI. |

---

## 4. Ratification Log & Sign-Offs

### 4.1 Specification Formulation Sign-Off
- **Status**: 🟢 RATIFIED
- **Scope**: Formulation of `spec.md`, `plan.md`, `data-model.md`, `checklist.md`, `tasks.md`, `audit-trail.md` under `specs/015-scholarly-ingestion-connectors/`.
- **Invariants Assessed**:
  - `INV-015-01` (Article VII Anti-Creep Law): 0 new third-party packages added to pyproject.toml or package.json.
  - `INV-015-02` (Article II Tri-Part Confidence): Literature authority decoupled from AI confidence.
  - `INV-015-03` (Article IV Human Sovereignty): User confirmation required for claim mutation.
  - `INV-015-04` (Offline Sovereignty): Seamless fallback to SQLite FTS5 index.

### 4.2 Engineering Verification Sign-Off
- **Backend Tests**: `backend/tests/test_scholarly_ingestion_connectors.py` (10/10 passed).
- **Regression Suite**: `backend/.venv/bin/pytest backend/tests -m "not live"` (283 passed, 12 deselected, 0 failed).
- **TypeScript Typecheck**: `npm run typecheck --prefix web` (0 errors).
- **Next.js Production Build**: `npm run build --prefix web` (0 compile errors, 8/8 routes generated).
