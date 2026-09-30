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

- [ ] **`INV-019-01` (Article VII Anti-Creep Law)**:
  - [ ] Zero new packages added to `backend/pyproject.toml`.
  - [ ] Zero new packages added to `web/package.json`.
- [ ] **`INV-019-02` (Article II Tri-Part Confidence & Deterministic Supremacy)**:
  - [ ] Consistency score calculated exclusively via mathematical formula:
    $$\text{Score} = \max(0.0, 100.0 - (25.0 \times N_{\text{fatal}} + 15.0 \times N_{\text{critical}} + 8.0 \times N_{\text{warning}} + 3.0 \times N_{\text{advisory}}))$$
  - [ ] AI critique text is strictly advisory and cannot manipulate the numeric score.
- [ ] **`INV-019-03` (Article IV Human Sovereignty)**:
  - [ ] Critique status transitions from `OPEN` to `RESOLVED` or `DISMISSED` mandate human rationale (`resolution_notes >= 5 chars`).
  - [ ] No autonomous AI dismissal of critique records.
- [ ] **`INV-019-04` (Article VIII Degraded Resilience & Offline Autonomy)**:
  - [ ] Engine produces complete heuristic critique records and consistency scores when offline or when LLM API keys are unset.
  - [ ] `is_degraded = True` flagged transparently in degraded operation.

---

## 2. Engineering Verification Protocol

- [ ] **Database & Storage**:
  - [ ] Table 36 (`research_critiques`) created with foreign keys and indices in `backend/storage/sqlite_adapter.py`.
  - [ ] CRUD methods `save_critique_record`, `get_critique_record`, `list_critique_records`, `update_critique_status` implemented in `SQLiteStorageAdapter` and declared in `BaseStorageAdapter`.
- [ ] **Backend Engine & API**:
  - [ ] `CrossStageCritiqueEngine` parses relational state from Stages A, C, D, E, F.
  - [ ] Heuristic rules flag unmitigated circumscription failures, budget discordances, and empirical tensions.
  - [ ] FastAPI router `/api/critique/*` mounted in `server.py`.
  - [ ] Orchestrator actions `CROSS_EXAMINE_EVIDENCE` and `STRESS_TEST_PROBLEM` upgraded.
- [ ] **Frontend & TypeScript**:
  - [ ] TypeScript types authored in `web/src/types/critique.ts`.
  - [ ] API service client authored in `web/src/services/critiqueService.ts`.
  - [ ] `CritiqueAuditDeck.tsx` component mounted in `web/src/components/frameworks/research/ResearchWorkspaceView.tsx`.
- [ ] **Quality Gates**:
  - [ ] Dedicated test suite `backend/tests/test_critique_engine.py` passes 100%.
  - [ ] Full backend regression suite (`pytest backend/tests/ -m "not live"`) passes 100%.
  - [ ] TypeScript static typing (`npm run typecheck --prefix web`) passes with 0 errors.
  - [ ] Next.js production build (`npm run build --prefix web`) succeeds.
  - [ ] AST Knowledge Graph synced via `graphify update .`.
