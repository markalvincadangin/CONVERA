# CONVERA Engineering Tasks: SDD-023
# Ecosystem Integrations & Research Dissemination Bridge (Phase E)

**Specification ID**: `CONVERA-SDD-023`  
**Feature Title**: Ecosystem Integrations & Research Dissemination Bridge (Phase E)  
**Authority Tier**: Tier 2 (Actionable Engineering Task Manifest)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Target Feature Branch**: `feature/023-ecosystem-integrations`  

---

## Task Matrix & Dependency Graph

```text
TASK-023-01 (Table 38 Migration & Pydantic Ecosystem Models)
    │
    ▼
TASK-023-02 (EcosystemSyncEngine Implementation - Notion, Zotero, GitHub)
    │
    ▼
TASK-023-03 (FastAPI Router & Endpoint Mounting)
    │
    ▼
TASK-023-04 (Backend Pytest Verification Suite - Expanding from 331 Baseline)
    │
    ▼
TASK-023-05 (Frontend Types & Ecosystem Service Client)
    │
    ▼
TASK-023-06 (CCDS v2.0 EcosystemExportModal & Research Cockpit Integration)
    │
    ▼
TASK-023-07 (Integration, Regression & Closed-Loop Verification)
```

---

## Detailed Task Specifications

### TASK-023-01: Table 38 Migration & Pydantic Ecosystem Models
- **Files**:
  - `backend/models/ecosystem.py`
  - `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Add Table 38 `ecosystem_sync_records` schema to `sqlite_adapter.py` with indexes.
  2. Implement helper methods: `create_sync_record()`, `get_sync_records()`.
  3. Define Pydantic models in `backend/models/ecosystem.py` (`EcosystemProvider`, `SyncActionType`, `SyncStatus`, `NotionExportRequest`, `ZoteroExportRequest`, `GitHubExportRequest`, `NotionImportRequest`, `EcosystemSyncResult`, `EcosystemAuditRecord`).

---

### TASK-023-02: EcosystemSyncEngine Implementation
- **Files**:
  - `backend/engines/ecosystem_sync_engine.py`
- **Actions**:
  1. Implement `EcosystemSyncEngine` with methods:
     - `export_to_notion(session_id, request) -> EcosystemSyncResult`: Formats DSR proposal & literature matrix into Notion blocks/Markdown with SHA-256 state hash.
     - `import_from_notion(session_id, request) -> Dict[str, Any]`: Ingests page notes into `problems` table with provenance metadata.
     - `export_to_zotero(session_id, request) -> EcosystemSyncResult`: Formats session `scholarly_works` into BibTeX / CSL-JSON reference bundles.
     - `export_to_github(session_id, request) -> EcosystemSyncResult`: Extracts functional requirements & system architecture into GitHub Issue manifests & Markdown roadmap.
     - `get_sync_history(session_id) -> List[EcosystemAuditRecord]`.
  2. Implement robust offline dry-run preview mode.

---

### TASK-023-03: FastAPI Router & Endpoint Mounting
- **Files**:
  - `backend/routers/ecosystem.py`
  - `backend/routers/__init__.py`
  - `backend/server.py`
- **Actions**:
  1. Create router with endpoints:
     - `POST /api/ecosystem/notion/export`
     - `POST /api/ecosystem/notion/import`
     - `POST /api/ecosystem/zotero/export`
     - `POST /api/ecosystem/github/export`
     - `GET /api/ecosystem/audit-trail/{session_id}`
  2. Export in `backend/routers/__init__.py` and mount in `backend/server.py`.

---

### TASK-023-04: Backend Pytest Verification Suite
- **Files**:
  - `backend/tests/test_ecosystem_integrations.py`
- **Actions**:
  1. Implement tests for all 5 endpoints, dry-run simulation, payload generation, and audit logging.
  2. Verify 100% offline passing without external network calls.

---

### TASK-023-05: Frontend Types & Ecosystem Service Client
- **Files**:
  - `web/src/types/ecosystem.ts`
  - `web/src/services/ecosystemService.ts`
- **Actions**:
  1. Create TypeScript types matching Pydantic schemas.
  2. Implement `ecosystemService` with methods: `exportNotion()`, `importNotion()`, `exportZotero()`, `exportGitHub()`, `getAuditTrail()`.

---

### TASK-023-06: CCDS v2.0 EcosystemExportModal & Research Cockpit Integration
- **Files**:
  - `web/src/components/research/ecosystem/EcosystemExportModal.tsx`
  - `web/src/components/research/ecosystem/index.ts`
  - `web/src/components/research/cockpit/ResearchCockpit.tsx`
  - `web/src/app/page.tsx`
- **Actions**:
  1. Implement `EcosystemExportModal` with tabbed preview for Notion, Zotero, and GitHub.
  2. Add "Ecosystem Sync" button in `ResearchCockpit` top bar.
  3. Wire modal into page state.

---

### TASK-023-07: Integration, Regression & Closed-Loop Verification
- **Files**:
  - `specs/023-ecosystem-integrations/audit-trail.md`
  - `specs/023-ecosystem-integrations/checklist.md`
  - `docs/04-ai/AI_EVOLUTION_ROADMAP.md`
- **Actions**:
  1. Run full backend pytest suite (`pytest -m "not live"`).
  2. Run frontend typecheck (`tsc --noEmit`).
  3. Run Next.js production build (`next build`).
  4. Run `graphify update .`.
  5. Commit, merge to `develop`, promote to `main`, and push to `origin`.
