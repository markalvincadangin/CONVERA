# CONVERA SDD-015: Verification & Governance Checklist
# Scholarly Ingestion & Live Connectors Quality Assurance

**Specification ID**: CONVERA-SDD-015  
**Classification**: Quality Assurance, Verification & Invariant Enforcement  
**Authority Tier**: Tier 2 (Engineering Checklist)  
**Document Status**: 🟢 VERIFIED & RATIFIED  
**Revision**: 1.1.0  
**Canonical Path**: `specs/015-scholarly-ingestion-connectors/checklist.md`  

---

## 1. Specification Compliance Checklist

- [x] **CHK-015-01**: `OpenAlexConnector` and `SemanticScholarConnector` verified for correct endpoint URLs, query construction, polite pool parameters, and error handling.
- [x] **CHK-015-02**: `ConnectorHub.federated_search()` queries external connectors in parallel, deduplicates by DOI and normalized title, and sorts results by citation impact.
- [x] **CHK-015-03**: Federated search automatically upserts discovered works into the SQLite `scholarly_works` table and synchronizes them to `scholarly_works_fts`.
- [x] **CHK-015-04**: When offline or if external connectors return errors, `ConnectorHub` seamlessly falls back to local SQLite FTS5 search without raising exceptions.
- [x] **CHK-015-05**: `backend/routers/connectors.py` exposes `POST /api/connectors/search`, `POST /api/connectors/ingest`, `POST /api/connectors/link-claim`, `GET /api/connectors/problem/{problem_id}/sources`, `GET /api/connectors/problem/{problem_id}/claims`, and `GET /api/connectors/health`.
- [x] **CHK-015-06**: `ResearchOrchestrator._dispatch_acquire_evidence` executes live federated search via `ConnectorHub`, persisting results and logging an orchestration event.
- [x] **CHK-015-07**: `web/src/services/connectorService.ts` authored with typed functions for search, ingestion, and claim linking.
- [x] **CHK-015-08**: Frontend UI (Literature Matrix and/or Cockpit) allows live academic queries, candidate inspection, and 1-click evidence attachment.

---

## 2. CCDS v2.0 Design Tokens & UX Standards Checklist

- [x] **DES-015-01**: Obsidian dark mode styling applied to academic search cards and results table (`bg-neutral-900`, `border-neutral-800`, `text-neutral-100`).
- [x] **DES-015-02**: Authority badges (`PEER_REVIEWED`, `OFFICIAL_DATA`) rendered with distinct semantic colors (Emerald / Sky / Amber).
- [x] **DES-015-03**: Action buttons specify `whitespace-nowrap inline-flex items-center justify-center gap-1.5` to avoid awkward wrapping.
- [x] **DES-015-04**: External links (DOI, Open Access PDF) open safely in new tabs with `rel="noopener noreferrer"`.
- [x] **DES-015-05**: Loading and offline states rendered clearly with subtle pulse animations or badges.

---

## 3. Invariant & Governance Safety Checklist

- [x] **INV-015-01 (Article VII Anti-Creep Law)**: Zero new third-party dependencies added to `backend/pyproject.toml` or `web/package.json`.
- [x] **INV-015-02 (Article II Tri-Part Confidence)**: Academic citation counts and evidence tiers are strictly decoupled from AI model confidence scores.
- [x] **INV-015-03 (Article IV Human Sovereignty)**: No automatic silent modification of problem claims or stage gate approvals; all ingestion requires human initiation or confirmation.
- [x] **INV-015-04 (Offline Sovereignty)**: System operates smoothly when offline, falling back directly to local FTS5 BM25 search.

---

## 4. Conformance & Build Acceptance Checklist

- [x] **CONF-015-01**: Comprehensive pytest suite (`backend/tests/test_scholarly_ingestion_connectors.py`) passes with 100% assertions (10/10 passed).
- [x] **CONF-015-02**: Full offline regression test suite (`pytest backend/tests -m "not live"`) passes (283 passed, 12 deselected, 0 failed).
- [x] **CONF-015-03**: Frontend TypeScript check (`npm run typecheck --prefix web`) passes with 0 errors.
- [x] **CONF-015-04**: Next.js production build (`npm run build --prefix web`) succeeds with 0 compile errors.
- [x] **CONF-015-05**: Codebase knowledge graph synchronized via `graphify update .`.
