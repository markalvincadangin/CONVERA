# CONVERA Engineering Tasks: SDD-021
# Research Session Persistence & Resume (Phase D2)

**Specification ID**: `CONVERA-SDD-021`  
**Feature Title**: Research Session Persistence & Resume Engine  
**Authority Tier**: Tier 2 (Actionable Engineering Task Manifest)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Target Feature Branch**: `feature/021-research-session-persistence-resume`  

---

## Task Matrix & Dependency Graph

```text
TASK-021-01 (SQLite Schema & Table 37)
    │
    ▼
TASK-021-02 (Pydantic Models & Domain State Engine)
    │
    ▼
TASK-021-03 (FastAPI Router & Endpoints)
    │
    ▼
TASK-021-04 (Backend Pytest Suite)
    │
    ▼
TASK-021-05 (Frontend Service & Type Definitions)
    │
    ▼
TASK-021-06 (Frontend Drawer, Modal & Banner Components)
    │
    ▼
TASK-021-07 (Integration, Regression & Closed-Loop Gate Closure)
```

---

## Detailed Task Specifications

### TASK-021-01: SQLite Schema Migration & Table 37 Implementation
- **Files**: `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Add Table 37 `research_session_checkpoints` to `_create_tables()` with proper indexes.
  2. Implement additive column migration on `sessions` table using `PRAGMA table_info` checks.
  3. Implement storage adapter CRUD methods:
     - `create_research_session_checkpoint()`
     - `list_research_session_checkpoints()`
     - `get_research_session_checkpoint()`
     - `delete_research_session_checkpoint()`
     - `update_research_session_stage()`
  4. Ensure base storage interface in `backend/storage/base.py` declares new checkpoint signatures.
- **Verification**: `python -c "from storage.sqlite_adapter import get_storage; s = get_storage(); print('Storage initialized')"` succeeds.

---

### TASK-021-02: Pydantic Schemas & Session State Engine
- **Files**:
  - `backend/models/research_session.py`
  - `backend/engines/session_state_engine.py`
- **Actions**:
  1. Implement schemas: `ResearchSessionSummary`, `CreateResearchSessionRequest`, `CreateCheckpointRequest`, `ResearchSessionCheckpointRecord`, `ResearchSessionResumePayload`, `CloneResearchSessionRequest`.
  2. Implement `SessionStateEngine`:
     - Deterministic state serialization (sorted keys, ISO timestamps).
     - Cryptographic SHA-256 state hashing.
     - Checkpoint state validation and tamper verification.
     - Deep cloning logic re-keying session ID and associated problem/claims.
- **Verification**: Unit tests on state hashing and serialization pass.

---

### TASK-021-03: FastAPI Research Sessions Router
- **Files**:
  - `backend/routers/research_sessions.py`
  - `backend/server.py`
- **Actions**:
  1. Build router mounted at `/api/research-sessions`:
     - `GET /api/research-sessions` -> List sessions with stage summaries.
     - `POST /api/research-sessions` -> Create new session.
     - `GET /api/research-sessions/{session_id}/resume` -> Full resume payload.
     - `POST /api/research-sessions/{session_id}/sync-stage` -> Sync active stage.
     - `POST /api/research-sessions/{session_id}/checkpoint` -> Create checkpoint.
     - `GET /api/research-sessions/{session_id}/checkpoints` -> List checkpoints.
     - `POST /api/research-sessions/{session_id}/restore/{checkpoint_id}` -> Roll back to checkpoint.
     - `POST /api/research-sessions/{session_id}/clone` -> Clone session.
  2. Register router in `backend/server.py`.
- **Verification**: Endpoints registered and test client returns valid schemas.

---

### TASK-021-04: Backend Pytest Suite
- **Files**: `backend/tests/test_research_sessions.py`
- **Actions**:
  1. Create comprehensive test suite:
     - `test_create_research_session`
     - `test_list_research_sessions`
     - `test_resume_research_session`
     - `test_checkpoint_lifecycle_and_hashing`
     - `test_restore_checkpoint_integrity`
     - `test_clone_research_session`
  2. Run against pytest runner.
- **Verification**: `backend/.venv/bin/pytest backend/tests/test_research_sessions.py -v` passes 100%.

---

### TASK-021-05: Frontend Types & Service Client
- **Files**:
  - `web/src/types/researchSession.ts`
  - `web/src/services/researchSessionService.ts`
- **Actions**:
  1. Define TypeScript interfaces for summaries, checkpoints, and resume payloads.
  2. Implement `researchSessionService` with error handling, fetch wrappers, and local storage fallback.
- **Verification**: `npm run typecheck --prefix web` passes without type errors.

---

### TASK-021-06: Frontend Drawer, Modal & Banner Components
- **Files**:
  - `web/src/components/research/sessions/ResearchSessionDrawer.tsx`
  - `web/src/components/research/sessions/SessionCheckpointModal.tsx`
  - `web/src/components/research/sessions/SessionResumeBanner.tsx`
  - `web/src/components/research/sessions/index.ts`
  - `web/src/app/page.tsx`
- **Actions**:
  1. Implement `ResearchSessionDrawer`:
     - Slide-over panel displaying all research sessions.
     - Stage badges (A–F), completion progress, and gate status chips.
     - One-click "Resume" switch action.
     - Checkpoint and clone shortcuts.
     - "New Research Session" dialog.
  2. Implement `SessionCheckpointModal`:
     - Create named checkpoint with description.
     - List checkpoint history with SHA-256 badge and "Restore" button.
  3. Implement `SessionResumeBanner` in `page.tsx`:
     - Shows current research session, stage name, and instant switch button.
  4. Refactor `page.tsx` to restore stage from server session state instead of browser `localStorage`.
- **Verification**: Interactive UI renders with smooth transitions and zero console errors.

---

### TASK-021-07: Integration, Regression & Closed-Loop Verification
- **Files**:
  - `specs/021-research-session-persistence-resume/audit-trail.md`
  - `specs/021-research-session-persistence-resume/checklist.md`
- **Actions**:
  1. Execute full backend pytest regression (`pytest -m "not live"`).
  2. Execute frontend typecheck (`tsc --noEmit`).
  3. Execute Next.js production build (`npm run build --prefix web`).
  4. Update knowledge graph (`graphify update .`).
  5. Close all verification checklist items.
- **Verification**: All gates passed, 0 errors across entire workspace.
