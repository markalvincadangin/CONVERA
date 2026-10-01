# CONVERA Engineering Implementation Plan: SDD-021
# Research Session Persistence & Resume (Phase D2)

**Specification ID**: `CONVERA-SDD-021`  
**Feature Title**: Research Session Persistence & Resume Engine  
**Authority Tier**: Tier 2 (Engineering Plan)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Target Feature Branch**: `feature/021-research-session-persistence-resume`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `95f4e3d`  

---

## 1. Architectural Strategy & Design Principles

### 1.1 Separation of Concerns
1. **Storage Layer (`backend/storage/sqlite_adapter.py`)**:
   - Table 37 `research_session_checkpoints` manages checkpoint persistence.
   - Additive columns on `sessions` provide fast indexing and querying for research session portfolios without parsing bloated `state_data` JSON on every request.
2. **Domain Layer (`backend/engines/session_state_engine.py`)**:
   - Encapsulates canonical state serialization, SHA-256 state hashing, checkpoint comparison, session cloning, and deep copy of problem/claim records.
3. **API Layer (`backend/routers/research_sessions.py`)**:
   - REST endpoints registered under `/api/research-sessions/*` mounted in `backend/server.py`.
4. **Client Layer (`web/src/services/researchSessionService.ts`)**:
   - Typed client managing API calls with optimistic UI updates and error boundaries.
5. **Presentation Layer (`web/src/components/research/sessions/`)**:
   - CCDS v2.0 compliant slide-over drawer, checkpoint modal, and session resume header badge.

---

## 2. Component Breakdown & Target File Manifest

### 2.1 Backend Deliverables

| File Path | Purpose |
|:---|:---|
| `backend/storage/sqlite_adapter.py` | Table 37 schema, additive column migration, and CRUD adapter methods for research sessions and checkpoints. |
| `backend/models/research_session.py` | Pydantic models for session summaries, checkpoint requests, resume payloads, and clone configurations. |
| `backend/engines/session_state_engine.py` | Deterministic state serialization, cryptographic hashing, and deep-clone logic. |
| `backend/routers/research_sessions.py` | FastAPI router mounted at `/api/research-sessions`. |
| `backend/server.py` | Router registration. |
| `backend/tests/test_research_sessions.py` | Comprehensive test suite covering creation, checkpointing, restore, and cloning. |

### 2.2 Frontend Deliverables

| File Path | Purpose |
|:---|:---|
| `web/src/types/researchSession.ts` | TypeScript interfaces for session summaries, resume payloads, and checkpoints. |
| `web/src/services/researchSessionService.ts` | Frontend API client. |
| `web/src/components/research/sessions/ResearchSessionDrawer.tsx` | Slide-over drawer listing all research initiatives with stage progress badges and action buttons. |
| `web/src/components/research/sessions/SessionCheckpointModal.tsx` | Dialog for creating named checkpoints and viewing history. |
| `web/src/components/research/sessions/SessionResumeBanner.tsx` | Header bar showing active research session, active stage, and switch button. |
| `web/src/components/research/sessions/index.ts` | Public export barrel. |
| `web/src/app/page.tsx` | Integration of session drawer, resume banner, and server-synced stage restoration. |

---

## 3. Migration & Backward Compatibility Strategy

- **Additive Schema Migration**: SQLite table alterations will check column existence via `PRAGMA table_info` before executing `ALTER TABLE`, ensuring legacy sessions remain 100% operational without data loss.
- **Graceful Fallback**: If a legacy session has not yet recorded `current_research_stage`, the adapter derives it dynamically from `state_data.stage_progress` using existing methodology contract utilities.
- **Local Mode / Offline Resilience**: If the backend is unreachable, the client falls back cleanly to the existing offline in-memory session mode with a clear degraded badge.

---

## 4. Verification & Testing Strategy

1. **Unit & Engine Tests (`test_research_sessions.py`)**:
   - `test_create_research_session`: Verify clean creation with Stage A initialization.
   - `test_list_research_sessions`: Verify portfolio summary retrieval and sorting.
   - `test_create_and_list_checkpoints`: Verify SHA-256 hash generation and persistence.
   - `test_restore_checkpoint`: Verify that restoring state updates `state_data` and stage flags correctly.
   - `test_clone_research_session`: Verify deep clone creates isolated IDs and clones associated claims/assumptions.
   - `test_checkpoint_hash_tamper_detection`: Verify tamper assertion when state JSON does not match hash.
2. **Regression Testing**: Full offline backend regression (`pytest -m "not live"`).
3. **Frontend Typecheck & Build**: `npm run typecheck --prefix web` and `npm run build --prefix web`.
4. **Knowledge Graph Sync**: Run `graphify update .`.
