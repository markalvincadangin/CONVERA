# CONVERA Security Rules

Preserve all security and data isolation controls:

## Database Security
- 100% Parameterized SQL queries via SQLite WAL adapter.
- No raw string concatenation or dynamic table names from user input.

## Multi-Tenant Isolation
- Strict `project_id` scoping on all CRUD queries, session lookups, and knowledge retrieval.

## Secrets Management
- API keys (Gemini, Groq, OpenAlex, Semantic Scholar) loaded strictly from server `.env`.
- Secrets must never be logged, printed to console, or returned over API responses.

## Input Sanitization & Request Validation
- Strict Pydantic v2 schemas for all API payloads.
- Sanitize identifiers using `clean_problem_id` and string normalization.
- Outbound connector requests strictly allowlisted to verified scholarly domains.
