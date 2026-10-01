# CONVERA Engineering Implementation Plan: SDD-023
# Ecosystem Integrations & Research Dissemination Bridge (Phase E)

**Specification ID**: `CONVERA-SDD-023`  
**Feature Title**: Ecosystem Integrations & Research Dissemination Bridge (Phase E)  
**Authority Tier**: Tier 2 (Engineering Execution Plan)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Target Feature Branch**: `feature/023-ecosystem-integrations`  

---

## 1. Technical Architecture & Integration Topology

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CONVERA Research Client                         │
│  [ ResearchCockpit / ExportModal ] ──> [ EcosystemExportModal (CCDS) ] │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Human Confirmation Trigger)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Ecosystem Router                        │
│                   (/api/ecosystem/* / FastAPI)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       EcosystemSyncEngine                              │
│       (Unified Orchestration, Rate-Limiting & State Hashing)           │
│                                                                        │
│   ┌─────────────────────┬─────────────────────┬────────────────────┐   │
│   │   Notion Bridge     │   Zotero Bridge     │   GitHub Bridge    │   │
│   │ (Blocks & Pages)    │ (BibTeX & CSL-JSON) │ (Issues & Roadmaps)│   │
│   └──────────┬──────────┴──────────┬──────────┴──────────┬─────────┘   │
└──────────────┼─────────────────────┼─────────────────────┼─────────────┘
               │                     │                     │
               ▼                     ▼                     ▼
        [ Notion API ]         [ Zotero API ]        [ GitHub API ]
       (or Offline Mock)      (or Offline Mock)     (or Offline Mock)
```

---

## 2. Implementation Phases

### Phase 1: Data Models & SQLite Sync Audit Trail
- Define Pydantic models in `backend/models/ecosystem.py`:
  - `EcosystemProvider` ("notion", "zotero", "github").
  - `EcosystemExportRequest`, `EcosystemImportRequest`.
  - `NotionExportPayload`, `ZoteroExportPayload`, `GitHubExportPayload`.
  - `EcosystemSyncResult`, `EcosystemAuditRecord`.
- Add SQLite sync audit logging in `backend/storage/sqlite_adapter.py` (Table `ecosystem_sync_records`).

### Phase 2: EcosystemSyncEngine Implementation
- Implement `backend/engines/ecosystem_sync_engine.py`:
  - `export_to_notion(session_id, request) -> EcosystemSyncResult`
  - `import_from_notion(session_id, request) -> Dict[str, Any]`
  - `export_to_zotero(session_id, request) -> EcosystemSyncResult`
  - `export_to_github(session_id, request) -> EcosystemSyncResult`
  - `get_sync_history(session_id) -> List[EcosystemAuditRecord]`
  - Offline dry-run simulation when credentials are unconfigured or when offline flag is passed.
  - Deterministic SHA-256 state hash logging per sync event.

### Phase 3: REST API Router & Server Mounting
- Implement `backend/routers/ecosystem.py` with endpoints:
  - `POST /api/ecosystem/notion/export`
  - `POST /api/ecosystem/notion/import`
  - `POST /api/ecosystem/zotero/export`
  - `POST /api/ecosystem/github/export`
  - `GET /api/ecosystem/audit-trail/{session_id}`
- Mount router in `backend/routers/__init__.py` and `backend/server.py`.

### Phase 4: Backend Pytest Verification Suite
- Implement `backend/tests/test_ecosystem_integrations.py`:
  - Test Notion export payload compilation and offline fallback.
  - Test Notion note import and problem intake creation.
  - Test Zotero BibTeX and CSL-JSON bundle generation.
  - Test GitHub issue manifest generation with milestone tags.
  - Test sync audit logging and SHA-256 checksum verification.
  - Expand baseline test suite from 331 tests.

### Phase 5: Frontend Service & CCDS v2.0 Export Modal
- Implement `web/src/types/ecosystem.ts` and `web/src/services/ecosystemService.ts`.
- Implement `web/src/components/research/ecosystem/EcosystemExportModal.tsx`:
  - Multi-tab layout (Notion, Zotero, GitHub).
  - Live preview of markdown/BibTeX payload before sending (Article IV).
  - Status indicators (Connected, Token Missing, Offline Preview).
  - One-click export and download fallback.
- Wire into `web/src/components/research/cockpit/ResearchCockpit.tsx` and main app.

### Phase 6: Closed-Loop Verification & Promotion
- Full pytest regression (`pytest -m "not live"`).
- Frontend typecheck (`tsc --noEmit`).
- Next.js production build (`next build`).
- Update knowledge graph AST (`graphify update .`).
- Close checklist and promote to `develop` and `main`.
