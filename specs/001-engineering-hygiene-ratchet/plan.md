# Implementation Plan: Engineering Hygiene Ratchet (001)

## Architecture Compliance & Pre-Execution Verification
- Adheres strictly to the CONVERA Constitution (`.specify/memory/constitution.md`) and Rules (`.agents/rules/`).
- Operates entirely within existing abstractions (`SQLiteStorageAdapter`, `BaseConnector`, `FastAPI` routers).

## Technical Strategy

### Phase 1: Database Adapter Bugfix
- Modify `backend/storage/sqlite_adapter.py`:
  - Fix `INSERT OR IGNORE INTO projects (id, share_code, name, created_at, updated_at)` argument mapping in `seed_master_research_problems`.
  - Replace all occurrences of `datetime.utcnow()` with `datetime.now(timezone.utc)`.

### Phase 2: Connector Consolidation
- Delete redundant `backend/connectors/semanticscholar_connector.py`.
- Verify `backend/connectors/hub.py` and `backend/tests/test_connectors.py` reference `semantic_scholar_connector.py`.

### Phase 3: Pydantic v2 Modernization
- Update `backend/routers/traceability.py` and `backend/routers/research.py`:
  - Replace `req.dict()` with `req.model_dump()`.

### Phase 4: Documentation Synchronization
- Update `README.md` to reflect CONVERA v4.1 Dual-Track intelligence positioning.
- Update `docs/SRSDS.md` to document the 23 SQLite tables and MCP subsystem.

### Phase 5: Automated Verification & Regression Suite
- Run `python -m pytest tests -v` in `backend/` $	o$ verify 86/86 passing.
- Run `npx tsc --noEmit` in `web/` $	o$ verify 0 TypeScript errors.
- Run `graphify update .` to keep knowledge graph synchronized.
