# CONVERA Specification: SDD-021
# Research Session Persistence & Resume (Phase D2)

**Specification ID**: `CONVERA-SDD-021`  
**Feature Title**: Research Session Persistence & Resume Engine  
**Authority Tier**: Tier 2 (Feature Specification Dossier)  
**Document Status**: 🟢 RATIFIED / IMPLEMENTATION AUTHORIZED  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VI, VII, VIII  
**Target Feature Branch**: `feature/021-research-session-persistence-resume`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `95f4e3d` (develop/main synchronized baseline)  
**Canonical Upstream**:  
- `docs/00-foundation/CONSTITUTION.md`  
- `docs/04-ai/AI_EVOLUTION_ROADMAP.md` (§4.3 Phase D2: End-to-End Research Loop Hardening)  
- `specs/013-research-orchestration-engine/spec.md`  
- `specs/014-research-cockpit-ui/spec.md`  
- `specs/020-dsr-deliverable-proposal-export/spec.md`  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Operational Context
CONVERA has delivered a multi-stage research intelligence platform spanning six rigorous methodology stages:
- **Stage A**: Scouting & Empirical Discovery
- **Stage B**: Contextualization & Problem Validation (Gate 1)
- **Stage C**: Scholarly Opportunity & Literature Matrix (Gate 2)
- **Stage D**: 4 DSR Artifact Ideation & Kernel Theory
- **Stage E**: Concept Evaluation & Experimental Trapping (Gate 3)
- **Stage F**: Relevance, Feasibility Synthesis & Proposal Export (Gate 4)

These capabilities are powered by 36 relational SQLite WAL tables, deterministic multi-criteria scoring rubrics, an orchestration action-dispatch loop, cross-stage adversarial critique, and multi-format proposal export with cryptographic provenance.

### 1.2 The Defect / Usability Gap
Despite this backend depth, **research session lifecycle state management suffers from architectural fragmentation**:
1. **Brittle Client-Side State**: Current active stepper state (`activePhase`) is cached in browser `localStorage` (`convera_active_phase_${sessionId}`). If a researcher clears browser storage, opens an incognito window, or accesses CONVERA from another workstation, stage progress and UI context are lost.
2. **Legacy Table Schema Overload**: The backend `sessions` table retains legacy fields from the original 5-phase Innovation wizard (`phase1_complete` through `phase5_complete`). Research sessions store stage state as unstructured JSON in `state_data`, preventing efficient querying, sorting, and portfolio filtering.
3. **Missing Session Management UI**: There is no interactive session drawer or manager in the frontend. Researchers cannot easily:
   - Switch between multiple parallel research topics (e.g., "Edge AI in Healthcare" vs. "Federated Learning for IoT").
   - View high-level progress indicators (current stage, completion %, gate clearance status, epistemic balance).
   - Create named snapshots/checkpoints before major exploratory pivots or adversarial reviews.
   - Restore a session to an earlier milestone checkpoint.
   - Clone an existing session to explore alternative artifact designs.

---

## 2. User Stories

### US-021-01: Research Portfolio Overview & Session Switcher
**As a** Computing researcher or faculty mentor,  
**I want to** view a slide-over Research Session Manager displaying all active and archived research initiatives with current stage badges, completion percentages, and gate clearances,  
**So that** I can seamlessly switch contexts between different research topics without losing work.

### US-021-02: Complete Server-Side Session Resume
**As a** Researcher returning to an existing investigation,  
**I want to** resume a research session and have CONVERA restore my exact active stage, active problem, selected research domain, search filter parameters, ideation canvases, evaluation matrices, and critique threads,  
**So that** I can immediately pick up where I left off across any browser or device.

### US-021-03: Immutable Milestone Checkpoints & Rollback
**As a** Lead researcher preparing for an adversarial critique or stage gate defense,  
**I want to** create a named, timestamped checkpoint (e.g., "Pre-Gate 3 Revision") with a cryptographic state hash,  
**So that** I can fearlessly explore experimental formulations and restore previous verified states if needed.

### US-021-04: Session Forking / Cloning
**As a** Researcher formulating competing design artifacts,  
**I want to** clone an existing session at Stage C or D,  
**So that** I can explore two alternative architectural hypotheses in parallel while retaining the underlying literature matrix and empirical evidence.

---

## 3. Functional Requirements

### 3.1 Relational Schema Enhancement (Table 37)
- **FR-021-01**: Implement Table 37 `research_session_checkpoints`:
  ```sql
  CREATE TABLE IF NOT EXISTS research_session_checkpoints (
      checkpoint_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      checkpoint_name TEXT NOT NULL,
      stage_id TEXT NOT NULL,
      stage_index INTEGER NOT NULL,
      state_snapshot TEXT NOT NULL,
      state_hash TEXT NOT NULL,
      created_by TEXT DEFAULT 'Researcher',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON research_session_checkpoints(session_id);
  ```
- **FR-021-02**: Add additive schema columns to `sessions` if not present:
  - `active_framework_id TEXT DEFAULT 'RESEARCH'`
  - `current_research_stage TEXT DEFAULT 'scouting'`
  - `stage_completion_pct REAL DEFAULT 0.0`
  - `active_problem_id TEXT`
  - `active_domain_id TEXT`

### 3.2 Backend Service & API Router
- **FR-021-03**: Create `backend/routers/research_sessions.py` providing:
  - `GET /api/research-sessions`: List research sessions with stage badges, completion %, problem title, and gate flags.
  - `POST /api/research-sessions`: Create new research session with initial Stage A context.
  - `GET /api/research-sessions/{session_id}/resume`: Comprehensive resume endpoint assembling orchestrator status, problem details, active stage, and checkpoint count.
  - `POST /api/research-sessions/{session_id}/sync-stage`: Persist stage transition and update `current_research_stage` & `stage_completion_pct`.
  - `POST /api/research-sessions/{session_id}/checkpoint`: Create named checkpoint with SHA-256 state hash.
  - `GET /api/research-sessions/{session_id}/checkpoints`: List all checkpoints for a session.
  - `POST /api/research-sessions/{session_id}/restore/{checkpoint_id}`: Roll back session state to selected checkpoint.
  - `POST /api/research-sessions/{session_id}/clone`: Deep-clone session state and associated problem/claims into a new session.

### 3.3 Frontend Cockpit & Session Navigation
- **FR-021-04**: Build `ResearchSessionDrawer.tsx` slide-over drawer accessible from the TopNav and `ResearchCockpit.tsx`:
  - Searchable list of research sessions with stage stepper badges (A–F).
  - Quick action buttons: "Resume", "Checkpoint", "Clone", "Delete".
  - "New Research Session" creation modal with framework selection.
- **FR-021-05**: Build `SessionCheckpointModal.tsx` for checkpoint creation and rollback confirmation.
- **FR-021-06**: Build `SessionResumeBanner.tsx` in `web/src/app/page.tsx` showing active research session title, current stage, and instant switch button.
- **FR-021-07**: Refactor `page.tsx` to source active stage from server session state instead of ungrounded browser `localStorage`.

---

## 4. Constitutional Compliance & Invariant Assertions

| Invariant ID | Constitutional Article | Assertion Standard |
|:---|:---|:---|
| **`INV-021-01`** | **Article VII (Anti-Creep Law)** | **0 new third-party dependencies**. Implemented strictly using existing Python standard library (`hashlib`, `json`, `sqlite3`, `uuid`) and existing frontend libraries (`lucide-react`, `framer-motion`, Tailwind). |
| **`INV-021-02`** | **Article I & II (Grounding & Cryptographic Provenance)** | Every session checkpoint calculates a deterministic SHA-256 hash over serialized canonical state. |
| **`INV-021-03`** | **Article IV (Human Sovereignty)** | Checkpoint rollback and session cloning require explicit human confirmation. |
| **`INV-021-04`** | **Article VIII (Degraded Resilience)** | 100% offline operation backed by local SQLite WAL storage without external cloud dependency. |

---

## 5. Acceptance Criteria

1. Backend pytest suite passes with all new and existing tests (`test_research_sessions.py` + full offline regression).
2. Frontend typecheck (`tsc --noEmit`) passes with 0 errors.
3. Switching sessions in `ResearchSessionDrawer` updates the active session, cockpit, and workspace seamlessly.
4. Checkpoints can be saved, listed, and restored with verifiable state hash integrity.
5. Session cloning creates an independent copy with unique IDs and preserves evidence links.
