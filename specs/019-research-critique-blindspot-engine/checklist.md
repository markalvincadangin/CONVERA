# CONVERA SDD-019: Verification & Constitutional Checklist
# Cross-Stage Research Critique & Blind-Spot Engine (Phase C3)

**Specification ID**: CONVERA-SDD-019  
**Feature Title**: Cross-Stage Research Critique & Blind-Spot Engine  
**Authority Tier**: Tier 2 (Quality Assurance Checklist)  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VII, VIII  
**Target Feature Branch**: `feature/019-research-critique-blindspot-engine`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `8ada2a7`  

---

## 1. Constitutional Invariants Checklist

- [x] **`INV-019-01` (Article VII Anti-Creep Law)**:
  - [x] Zero new packages added to `backend/pyproject.toml`.
  - [x] Zero new packages added to `web/package.json`.
- [x] **`INV-019-02` (Article II Tri-Part Confidence & Deterministic Supremacy)**:
  - [x] Consistency score calculated exclusively via mathematical formula:
    $$\text{Score} = \max(0.0, 100.0 - (25.0 \times N_{\text{fatal}} + 15.0 \times N_{\text{critical}} + 8.0 \times N_{\text{warning}} + 3.0 \times N_{\text{advisory}}))$$
  - [x] AI critique text is strictly advisory and cannot manipulate the numeric score.
- [x] **`INV-019-03` (Article IV Human Sovereignty)**:
  - [x] Critique status transitions from `OPEN` to `RESOLVED` or `DISMISSED` mandate human rationale (`resolution_notes >= 5 chars`).
  - [x] No autonomous AI dismissal of critique records.
- [x] **`INV-019-04` (Article VIII Degraded Resilience & Offline Autonomy)**:
  - [x] Engine produces complete heuristic critique records and consistency scores when offline or when LLM API keys are unset.
  - [x] `is_degraded = True` flagged transparently in degraded operation.

---

## 2. Engineering Verification Protocol

- [x] **Database & Storage**:
  - [x] Table 36 (`research_critiques`) created with foreign keys and indices in `backend/storage/sqlite_adapter.py`.
  - [x] CRUD methods `save_critique_record`, `get_critique_record`, `list_critique_records`, `update_critique_status` implemented in `SQLiteStorageAdapter` and declared in `BaseStorageAdapter`.
- [x] **Backend Engine & API**:
  - [x] `CrossStageCritiqueEngine` parses relational state from Stages A, C, D, E, F.
  - [x] Heuristic rules flag unmitigated circumscription failures, budget discordances, and empirical tensions.
  - [x] FastAPI router `/api/critique/*` mounted in `server.py`.
  - [x] Orchestrator actions `EXECUTE_CRITIQUE` and `AUDIT_CROSS_STAGE_CRITIQUE` upgraded.
- [x] **Frontend & TypeScript**:
  - [x] TypeScript types authored in `web/src/types/critique.ts`.
  - [x] API service client authored in `web/src/services/critiqueService.ts`.
  - [x] `CritiqueAuditDeck.tsx` component mounted in `web/src/components/frameworks/research/ResearchWorkspaceView.tsx`.
- [x] **Quality Gates**:
  - [x] Dedicated test suite `backend/tests/test_critique_engine.py` passes 100% (6/6 passed).
  - [x] Full backend regression suite (`pytest backend/tests/ -m "not live"`) passes 100% (309/309 passed).
  - [x] TypeScript static typing (`npm run typecheck --prefix web`) passes with 0 errors.
  - [x] Next.js production build (`npm run build --prefix web`) succeeds.
  - [x] AST Knowledge Graph synced via `graphify update .`.
