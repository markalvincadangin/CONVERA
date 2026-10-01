# CONVERA Verification Checklist: SDD-021
# Research Session Persistence & Resume (Phase D2)

**Specification ID**: `CONVERA-SDD-021`  
**Feature Title**: Research Session Persistence & Resume Engine  
**Authority Tier**: Tier 2 (Quality & Verification Checklist)  
**Document Status**: 🟢 VERIFIED / CLOSED  

---

## 1. Constitutional Invariants Checklist

- [X] **CHK-021-01 (Article VII Anti-Creep Law)**: Zero new dependencies introduced in `backend/pyproject.toml` or `web/package.json`.
- [X] **CHK-021-02 (Article I Grounding & Article II Cryptographic Integrity)**: All session checkpoints calculate a deterministic SHA-256 hash over canonical JSON.
- [X] **CHK-021-03 (Article IV Human Sovereignty)**: Checkpoint rollback and session cloning require explicit human confirmation.
- [X] **CHK-021-04 (Article VIII Degraded Resilience)**: Full offline operation backed by local SQLite WAL storage without network dependencies.

---

## 2. Storage & Schema Verification

- [X] **CHK-021-05 (Table 37 Relational Creation)**: `research_session_checkpoints` created with foreign keys and compound indexes.
- [X] **CHK-021-06 (Additive Column Migration)**: `sessions` table safely augmented with `active_framework_id`, `current_research_stage`, `stage_completion_pct`, `active_problem_id`, `active_domain_id`.
- [X] **CHK-021-07 (Idempotency)**: Database initialization can run repeatedly without errors or data corruption.
- [X] **CHK-021-08 (CRUD Integrity)**: Create, read, list, and delete methods for checkpoints operate within atomic transactions.

---

## 3. Domain & API Verification

- [X] **CHK-021-09 (Session Creation)**: `POST /api/research-sessions` initializes valid research session with Stage A defaults.
- [X] **CHK-021-10 (Portfolio Listing)**: `GET /api/research-sessions` returns sorted summaries with accurate stage badges and gate flags.
- [X] **CHK-021-11 (Comprehensive Resume)**: `GET /api/research-sessions/{session_id}/resume` returns unified session, problem, checkpoint, and orchestrator context.
- [X] **CHK-021-12 (Checkpoint & Hash)**: `POST /api/research-sessions/{session_id}/checkpoint` records verified SHA-256 hash.
- [X] **CHK-021-13 (Rollback Integrity)**: `POST /api/research-sessions/{session_id}/restore/{checkpoint_id}` restores previous state and verifies SHA-256 hash match.
- [X] **CHK-021-14 (Deep Clone)**: `POST /api/research-sessions/{session_id}/clone` creates clean duplicate session with re-keyed entity IDs.

---

## 4. Frontend & UX Verification

- [X] **CHK-021-15 (Slide-over Drawer)**: `ResearchSessionDrawer.tsx` opens cleanly from header and cockpit, lists sessions with stage badges, and allows one-click switching.
- [X] **CHK-021-16 (Checkpoint Modal)**: `SessionCheckpointModal.tsx` supports saving named checkpoints and viewing history.
- [X] **CHK-021-17 (Resume Banner)**: `SessionResumeBanner.tsx` displays active session, stage progress, and switch shortcut.
- [X] **CHK-021-18 (LocalStorage Deprecation)**: Active research stage is driven by server state rather than browser `localStorage`.
- [X] **CHK-021-19 (Typecheck Cleanliness)**: `npm run typecheck --prefix web` exits with 0 errors.
- [X] **CHK-021-20 (Production Build)**: `npm run build --prefix web` completes successfully.

---

## 5. Regression & Knowledge Graph Verification

- [X] **CHK-021-21 (Backend Regression)**: Pytest suite passes 100% of offline tests (`pytest -m "not live"` — 324/324 passing).
- [X] **CHK-021-22 (Knowledge Graph)**: `graphify update .` successfully syncs codebase AST without errors.
