# CONVERA SDD-015: Atomic Task Breakdown
# Scholarly Ingestion & Live Connectors Engineering Execution

**Specification ID**: CONVERA-SDD-015  
**Classification**: Implementation Tasks & Dependency Ordering  
**Authority Tier**: Tier 2 (Execution Tasks)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/015-scholarly-ingestion-connectors`  
**Target Integration Branch**: `develop`  

---

## 1. Task Dependency Graph

```
[TASK-015-01: Connector Verification & Hardening]
                      │
       ┌──────────────┴──────────────┐
       ▼                             ▼
[TASK-015-02: Ingestion & Linking] [TASK-015-03: Orchestrator Integration]
       │                             │
       └──────────────┬──────────────┘
                      ▼
[TASK-015-04: TypeScript Service Client]
                      │
                      ▼
[TASK-015-05: UI Live Discovery & Ingestion]
                      │
                      ▼
[TASK-015-06: Verification, Regression & Sync]
```

---

## 2. Atomic Task Breakdown

### `TASK-015-01`: Connector Verification & Hardening
- **Target Files**:
  - `backend/connectors/base.py`
  - `backend/connectors/openalex_connector.py`
  - `backend/connectors/semantic_scholar_connector.py`
  - `backend/connectors/hub.py`
- **Actions**:
  1. Verify HTTP client configurations in `OpenAlexConnector` and `SemanticScholarConnector`, ensuring explicit polite user-agents and timeout handling (capped at 3.5s).
  2. Ensure abstract reconstruction in `OpenAlexConnector` handles sparse or empty inverted index entries gracefully.
  3. Ensure `ConnectorHub.federated_search()` properly handles parallel connector failures without raising unhandled exceptions.
  4. Ensure auto-upsert into `storage.upsert_scholarly_works()` correctly resolves IDs and populates `is_cached`/`is_offline` flags.
- **Verification**: Isolated connector mock tests pass.

---

### `TASK-015-02`: Ingestion & Claim-Linking API Endpoints
- **Target Files**:
  - `backend/routers/connectors.py`
  - `backend/storage/sqlite_adapter.py`
- **Actions**:
  1. Add `POST /api/connectors/ingest`:
     - Accepts `IngestScholarlyWorkRequest` with `problem_id`, `scholarly_work_id` (or full payload), `source_tier`, and summary.
     - Adds record to `problem_sources` referencing `scholarly_work_id`.
     - Returns created source record with id.
  2. Add `POST /api/connectors/link-claim`:
     - Accepts `LinkClaimEvidenceRequest` with `claim_id`, `source_id`, `relation_type`, `evidence_strength`, and `rationale`.
     - Inserts record into `claim_evidence_links`.
     - Updates claim epistemic validation status if applicable.
  3. Add `GET /api/connectors/problem/{problem_id}/sources`:
     - Returns all ingested problem sources linked to scholarly works along with their associated claim evidence links.
- **Verification**: Pytest tests for ingestion and claim linking pass.

---

### `TASK-015-03`: Orchestrator Dispatch Live Ingestion Integration
- **Target Files**:
  - `backend/services/research_orchestrator.py`
- **Actions**:
  1. In `ResearchOrchestrator.dispatch_action()`, enhance the `ActionType.ACQUIRE_EVIDENCE` branch:
     - Check if live discovery is enabled or requested.
     - Invoke `connector_hub.federated_search(query=query, limit_per_source=limit)`.
     - Persist works into `scholarly_works` via SQLite storage.
     - If `problem_id` is present, record candidate sources or return works for user-confirmed attachment.
     - Fall back seamlessly to `storage.search_scholarly_works_fts()` if offline or external query returns zero results.
     - Record full action dispatch metadata in `orchestration_events`.
- **Verification**: `test_research_orchestrator.py` and new acquisition tests pass.

---

### `TASK-015-04`: Frontend TypeScript API Service
- **Target Files**:
  - `web/src/services/connectorService.ts`
- **Actions**:
  1. Author `connectorService.ts` with complete TypeScript interfaces:
     - `NormalizedScholarlyWork`, `ProvenanceMetadata`, `IngestWorkRequest`, `LinkClaimRequest`, `ConnectorHealthReport`.
  2. Implement exported client methods:
     - `searchScholarlyWorks(query, limitPerSource, connectorIds)`
     - `ingestScholarlyWork(request)`
     - `linkClaimEvidence(request)`
     - `getProblemSources(problemId)`
     - `checkConnectorsHealth()`
- **Verification**: `npm run typecheck --prefix web` passes.

---

### `TASK-015-05`: UI Live Discovery & Evidence Ingestion
- **Target Files**:
  - `web/src/components/research/LiteratureMatrixTable.tsx`
  - `web/src/components/research/cockpit/ResearchCockpit.tsx`
- **Actions**:
  1. Add live search capability to the Literature Matrix / Cockpit interface.
  2. Display candidate papers with source badges (`OpenAlex`, `Semantic Scholar`), citation counts, DOI links, and abstract preview.
  3. Add 1-click "Attach as Evidence" action: opens a concise modal/popover to select the problem claim and relation type (`SUPPORTS` / `CONTRADICTS` / `CONTEXTUALIZES`).
  4. After linking, refresh Cockpit epistemic health meter to reflect the verified source.
- **Verification**: Frontend builds with 0 errors; interactive flow verified.

---

### `TASK-015-06`: Pytest Suite, Regression Verification & Graphify Sync
- **Target Files**:
  - `backend/tests/test_scholarly_ingestion_connectors.py`
- **Actions**:
  1. Author unit and integration tests covering:
     - Mocked OpenAlex and Semantic Scholar responses.
     - ConnectorHub federated search, DOI deduplication, and citation ranking.
     - Offline FTS5 fallback when connectors fail.
     - Ingest endpoint creating `problem_sources` with foreign keys.
     - Link-claim endpoint creating `claim_evidence_links`.
     - Orchestrator `ACQUIRE_EVIDENCE` live dispatch.
  2. Execute full offline test suite (`pytest backend/tests -m "not live"`).
  3. Run `npm run typecheck --prefix web` and `npm run build --prefix web`.
  4. Synchronize knowledge graph with `graphify update .`.
- **Verification**: 100% test pass rate across backend and frontend.
