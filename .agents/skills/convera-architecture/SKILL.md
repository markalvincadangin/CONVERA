---
name: convera-architecture
description: Architectural navigation and inspection skill for CONVERA. Use to determine where domain logic, storage tables, API routes, and CIIA connectors belong.
---

# CONVERA Architecture Skill

## Purpose
Guide agents in inspecting and respecting CONVERA's decoupled 5-tier architecture before modifying code.

## Architecture Inspection Checklist
Before modifying or creating code:
1. **Identify User Capability:** Is this Innovation Track (Phases 1-5) or Research Track (Stages A-F)?
2. **Identify Domain Router:** Check `backend/routers/` for existing route declarations.
3. **Identify Domain Engine:** Check `backend/engines/` for business logic and scoring rules.
4. **Identify Storage Dependencies:** Check `backend/storage/sqlite_adapter.py` for relevant relational tables (23 tables).
5. **Identify CIIA Connectors:** Check `backend/connectors/` for external scholarly APIs.
6. **Identify Downstream Impact:** Check if modifying a claim, assumption, or decision impacts requirements traceability.
7. **Identify Test Coverage:** Locate corresponding test file in `backend/tests/`.

## Architecture Invariants
- Routers handle HTTP transport and validation; domain logic lives in engines.
- Domain engines call `get_storage()`; they never write raw SQL.
- LLM calls use `generate_response_with_fallback()`; never raw client SDKs.
