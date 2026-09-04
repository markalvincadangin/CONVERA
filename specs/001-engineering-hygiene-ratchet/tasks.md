# Actionable Tasks: Engineering Hygiene Ratchet (001)

- [ ] **TASK-001 (Storage Fix):** Fix column order in `backend/storage/sqlite_adapter.py` for project insert in `seed_master_research_problems`.
- [ ] **TASK-002 (Storage Modernization):** Replace `datetime.utcnow()` with `datetime.now(timezone.utc)` across `backend/storage/sqlite_adapter.py`.
- [ ] **TASK-003 (Connector Deduplication):** Remove `backend/connectors/semanticscholar_connector.py` and ensure `backend/connectors/hub.py` imports `semantic_scholar_connector.py`.
- [ ] **TASK-004 (Pydantic Modernization):** Update `backend/routers/traceability.py` and `backend/routers/research.py` to use `.model_dump()`.
- [ ] **TASK-005 (Test Suite Verification):** Execute `python -m pytest tests -v` and confirm all 86 tests pass.
- [ ] **TASK-006 (Documentation Update):** Synchronize `README.md` and `docs/SRSDS.md` with CONVERA v4.1 architecture.
- [ ] **TASK-007 (Frontend Verification):** Run TypeScript type check on `web/`.
- [ ] **TASK-008 (Graphify Refresh):** Execute `graphify update .`.
