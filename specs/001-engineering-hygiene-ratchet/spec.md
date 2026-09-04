# Feature Specification: Engineering Hygiene Ratchet (001)

## Context & User Story
As a CONVERA core engineer and researcher, I need the repository baseline to be 100% technically clean, verified, and free of deprecation debt so that future feature engineering on the Dual-Track (Innovation & Research) intelligence platform builds on an unambiguous, defect-free foundation.

## Objectives & Scope
Bring the current CONVERA repository to a clean engineering baseline without changing its fundamental architecture or adding major functionality.

### Key Requirements (P0/P1 Hygiene List):
1. **Fix SQLite Project Seeding Column Order:**
   - In `backend/storage/sqlite_adapter.py:3668`, fix `INSERT INTO projects (id, share_code, name, ...)` to eliminate the SQLite foreign key constraint failure.
   - Achieve **86/86 Pytest tests passing (100%)**.
2. **Consolidate Duplicate Semantic Scholar Connector:**
   - Remove redundant `backend/connectors/semanticscholar_connector.py`.
   - Ensure `backend/connectors/semantic_scholar_connector.py` is the single authoritative implementation registered in `backend/connectors/hub.py`.
3. **Migrate Deprecated Pydantic `.dict()` Calls:**
   - Replace deprecated `.dict()` calls with `.model_dump()` across `routers/traceability.py`, `routers/research.py`, and related modules.
4. **Standardize UTC Datetime Invocations:**
   - Replace deprecated `datetime.utcnow()` with `datetime.now(timezone.utc)` across `storage/sqlite_adapter.py`.
5. **Harmonize Documentation:**
   - Update `README.md` and `docs/SRSDS.md` to accurately reflect CONVERA v4.1 dual-track architecture, 23 relational tables, and 86 OpenAPI routes.
6. **Preserve Invariants:**
   - Zero structural rewrites of storage or engines.
   - Zero paid cloud API dependencies.
   - Zero heavy multi-agent swarms or external vector databases.
