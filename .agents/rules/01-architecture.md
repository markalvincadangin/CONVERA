# CONVERA Architecture Rules

## Architecture Topology
CONVERA consists of:
- **Frontend:** Next.js 15 App Router, React 19, Tailwind CSS, CCDS v2.0 Dark Mode.
- **Backend:** FastAPI application server with 15 domain routers.
- **Domain Engines:** 25 decoupled domain engines (`backend/engines/`).
- **CIIA Integration Layer:** 3-tier LLM fallback gateway (`llm_gateway.py`) + Federated Connector Hub (`connectors/`).
- **Persistence:** `BaseStorageAdapter` interface + `SQLiteStorageAdapter` (WAL Mode with 23 relational tables).
- **Interoperability:** Standalone JSON-RPC 2.0 stdio server (`mcp_server.py`).

## Storage Rules
- Access persistence exclusively via `get_storage()` or `BaseStorageAdapter`.
- Do not bypass the storage adapter or embed raw SQL strings directly in API routes.
- Preserve SQLite WAL performance and multi-tenant `project_id` scoping.

## Connector Rules
- All scholarly and external data providers must inherit from `BaseConnector`.
- Do not create duplicate connector implementations for the same provider.
- Enforce memory TTL caching, rate limiting, and normalized provenance metadata.

## Domain Engine Boundaries
- Business logic belongs in domain engines (`backend/engines/`), not in API route handlers.
- Keep domain engines decoupled from specific transport frameworks.

## CIIA Invocation Rules
- All external LLM requests must pass through `generate_response_with_fallback()`.
- Direct unabstracted third-party API calls from domain engines are strictly prohibited.
