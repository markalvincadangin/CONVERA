# CONVERA Engineering Tasks: SDD-023
# Ecosystem Integrations & Research Dissemination Bridge (Phase E)

**Specification ID**: `CONVERA-SDD-023`  
**Feature Title**: Ecosystem Integrations & Research Dissemination Bridge (Phase E)  
**Authority Tier**: Tier 2 (Actionable Engineering Task Manifest)  
**Document Status**: 🟢 COMPLETED & VERIFIED  
**Target Feature Branch**: `feature/023-ecosystem-integrations`  

---

## Task Matrix & Dependency Graph

```text
[x] TASK-023-01 (Table 38 Migration & Pydantic Ecosystem Models)
        │
        ▼
[x] TASK-023-02 (EcosystemSyncEngine Implementation - Notion, Zotero, GitHub)
        │
        ▼
[x] TASK-023-03 (FastAPI Router & Endpoint Mounting)
        │
        ▼
[x] TASK-023-04 (Backend Pytest Verification Suite - Expanding from 331 Baseline to 338)
        │
        ▼
[x] TASK-023-05 (Frontend Types & Ecosystem Service Client)
        │
        ▼
[x] TASK-023-06 (CCDS v2.0 EcosystemExportModal & Research Cockpit Integration)
        │
        ▼
[x] TASK-023-07 (Integration, Regression & Closed-Loop Verification)
```

---

## Detailed Task Specifications

### [x] TASK-023-01: Table 38 Migration & Pydantic Ecosystem Models
- **Status**: Completed 🟢
- **Files**:
  - `backend/models/ecosystem.py`
  - `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. [x] Add Table 38 `ecosystem_sync_records` schema to `sqlite_adapter.py` with indexes.
  2. [x] Implement helper methods: `create_ecosystem_sync_record()`, `get_ecosystem_sync_record()`, `list_ecosystem_sync_records()`.
  3. [x] Define Pydantic models in `backend/models/ecosystem.py` (`EcosystemProvider`, `SyncActionType`, `SyncStatus`, `NotionExportRequest`, `ZoteroExportRequest`, `GitHubExportRequest`, `NotionImportRequest`, `EcosystemSyncResult`, `EcosystemAuditRecord`).

---

### [x] TASK-023-02: EcosystemSyncEngine Implementation
- **Status**: Completed 🟢
- **Files**:
  - `backend/engines/ecosystem_sync_engine.py`
- **Actions**:
  1. [x] Implement `EcosystemSyncEngine` with methods:
     - `export_to_notion(session_id, request) -> EcosystemSyncResult`: Formats DSR proposal & literature matrix into Notion blocks/Markdown with SHA-256 state hash.
     - `import_from_notion(session_id, request) -> Dict[str, Any]`: Ingests page notes into `problems` table with provenance metadata.
     - `export_to_zotero(session_id, request) -> EcosystemSyncResult`: Formats session `scholarly_works` into BibTeX / CSL-JSON reference bundles.
     - `export_to_github(session_id, request) -> EcosystemSyncResult`: Extracts functional requirements & system architecture into GitHub Issue manifests & Markdown roadmap.
     - `get_sync_history(session_id) -> List[EcosystemAuditRecord]`.
  2. [x] Implement robust offline dry-run preview mode.

---

### [x] TASK-023-03: FastAPI Router & Endpoint Mounting
- **Status**: Completed 🟢
- **Files**:
  - `backend/routers/ecosystem.py`
  - `backend/routers/__init__.py`
  - `backend/server.py`
- **Actions**:
  1. [x] Create router with endpoints:
     - `POST /api/ecosystem/notion/export`
     - `POST /api/ecosystem/notion/import`
     - `POST /api/ecosystem/zotero/export`
     - `POST /api/ecosystem/github/export`
     - `GET /api/ecosystem/audit-trail/{session_id}`
  2. [x] Export in `backend/routers/__init__.py` and mount in `backend/server.py`.

---

### [x] TASK-023-04: Backend Pytest Verification Suite
- **Status**: Completed 🟢
- **Files**:
  - `backend/tests/test_ecosystem_integrations.py`
- **Actions**:
  1. [x] Implement tests for all 5 endpoints, dry-run simulation, payload generation, and audit logging.
  2. [x] Verify 100% offline passing without external network calls (7 new tests added, total 338 tests passing).

---

### [x] TASK-023-05: Frontend Types & Ecosystem Service Client
- **Status**: Completed 🟢
- **Files**:
  - `web/src/types/ecosystem.ts`
  - `web/src/services/ecosystemService.ts`
- **Actions**:
  1. [x] Create TypeScript types matching Pydantic schemas.
  2. [x] Implement `ecosystemService` with methods: `exportNotion()`, `importNotion()`, `exportZotero()`, `exportGitHub()`, `getAuditTrail()`, and client-side browser file download utility.

---

### [x] TASK-023-06: CCDS v2.0 EcosystemExportModal & Research Cockpit Integration
- **Status**: Completed 🟢
- **Files**:
  - `web/src/components/research/ecosystem/EcosystemExportModal.tsx`
  - `web/src/components/research/ecosystem/index.ts`
  - `web/src/components/research/cockpit/ResearchCockpit.tsx`
  - `web/src/app/page.tsx`
- **Actions**:
  1. [x] Implement `EcosystemExportModal` with tabbed preview for Notion, Zotero, and GitHub with live JSON/BibTeX/Markdown viewing, copy-to-clipboard, bundle download, and Table 38 audit history.
  2. [x] Add "Ecosystem Sync" button in `ResearchCockpit` top bar.
  3. [x] Wire modal into page state.

---

### [x] TASK-023-07: Integration, Regression & Closed-Loop Verification
- **Status**: Completed 🟢
- **Files**:
  - `specs/023-ecosystem-integrations/audit-trail.md`
  - `specs/023-ecosystem-integrations/checklist.md`
  - `docs/04-ai/AI_EVOLUTION_ROADMAP.md`
- **Actions**:
  1. [x] Run full backend pytest suite (`pytest -m "not live"` -> 338 passing).
  2. [x] Run frontend typecheck (`tsc --noEmit` -> 0 errors).
  3. [x] Run Next.js production build (`next build` -> 0 errors).
  4. [x] Run `graphify update .` -> 7,986 nodes, 11,858 edges, 608 communities.
  5. [x] Commit, merge to `develop`, promote to `main`, and push to `origin`.
