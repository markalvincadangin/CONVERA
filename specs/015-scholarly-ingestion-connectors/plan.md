# CONVERA SDD-015: Implementation Plan
# Scholarly Ingestion & Live Connectors Architecture & Execution Plan

**Specification ID**: CONVERA-SDD-015  
**Classification**: Implementation Plan & Engineering Design  
**Authority Tier**: Tier 2 (Technical Plan)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/015-scholarly-ingestion-connectors`  
**Target Integration Branch**: `develop`  

---

## 1. System Architecture & End-to-End Ingestion Flow

The following sequence illustrates the multi-tier academic ingestion architecture under CIIA v1.0:

```
[ Active Research Cockpit UI ]
             │
             │ 1. POST /api/connectors/search or Dispatch ACQUIRE_EVIDENCE
             ▼
[ Research Orchestrator Engine ] / [ Connectors API Router ]
             │
             │ 2. ConnectorHub.federated_search(query, limit_per_source)
             ▼
      [ ConnectorHub ]
        ├── OpenAlexConnector (HTTPX polite pool: mailto)
        ├── SemanticScholarConnector (HTTPX graph API)
        ├── CrossrefConnector (HTTPX works search)
        └── PubMedConnector (HTTPX esearch/esummary)
             │
             │ 3. Parallel Async Query (asyncio.gather)
             │    - Timeout: 3.5s per connector
             │    - Normalize to NormalizedScholarlyWork
             │    - Deduplicate by DOI / normalized title
             │
             ├───► [ ONLINE SUCCESS ]
             │         │
             │         ├─► SQLite: upsert_scholarly_works(works)
             │         │      └─► Trigger: sync to scholarly_works_fts
             │         └─► Return live deduplicated results
             │
             └───► [ DEGRADED / OFFLINE ]
                       │
                       └─► Fallback: SQLite search_scholarly_works_fts(query)
                              └─► Return cached results with is_offline=True
```

---

## 2. Ingestion & Claim-Evidence Binding Flow

```
[ Researcher in UI ]
       │
       │ Selects candidate scholarly work W from search results
       │ Clicks "Attach to Problem as Evidence"
       │
       ▼
[ POST /api/connectors/ingest ]
       │
       │ Inputs: { problem_id, scholarly_work_id, source_tier, evidence_type, quote }
       ▼
[ SQLiteStorageAdapter.add_problem_sources ]
       │
       │ Inserts into problem_sources with scholarly_work_id FK
       │ Returns source_id
       │
       ▼
[ POST /api/connectors/link-claim ]
       │
       │ Inputs: { claim_id, source_id, relation_type, evidence_strength, rationale }
       ▼
[ SQLiteStorageAdapter.link_evidence_to_claim ]
       │
       │ Inserts into claim_evidence_links
       │ Updates Claim epistemic status (PENDING_REVIEW -> VALIDATED)
       ▼
[ Re-evaluate Epistemic Health in Cockpit ]
       │
       └─► Epistemic Balance Meter updates automatically
```

---

## 3. Component Architecture Breakdown

### 3.1 Connector Layer (`backend/connectors/`)
- `base.py`:
  - Contains `NormalizedScholarlyWork`, `ProvenanceMetadata`, `EvidenceCandidate`, `BaseConnector`.
  - Enforces uniform data normalization, cache keys, and capability tags.
- `openalex_connector.py`:
  - Connects to `https://api.openalex.org/works`.
  - Reconstructs abstracts from OpenAlex `abstract_inverted_index`.
  - Formats author display names and topics.
- `semantic_scholar_connector.py`:
  - Connects to `https://api.semanticscholar.org/graph/v1/paper/search`.
  - Queries `citationCount`, `influentialCitationCount`, `openAccessPdf`, and DOI external IDs.
- `hub.py`:
  - Implements `ConnectorHub` singleton (`connector_hub`).
  - Implements `federated_search()`: parallel execution, DOI/title deduplication, automatic SQLite upsert, and FTS5 offline fallback.
  - Implements `check_all_health()`.

### 3.2 Router Layer (`backend/routers/connectors.py`)
- `GET /api/connectors`: List all registered connectors and their capabilities.
- `GET /api/connectors/health`: Concurrent health checks across all connectors.
- `POST /api/connectors/search`: Perform deduplicated federated academic search.
- `POST /api/connectors/ingest`: Ingest a scholarly work into `problem_sources`.
- `POST /api/connectors/link-claim`: Bind an ingested source to a problem claim.
- `GET /api/connectors/problem/{problem_id}/sources`: Retrieve all ingested scholarly sources and claim links for a problem.

### 3.3 Orchestrator Integration (`backend/services/research_orchestrator.py`)
- Enhance `ResearchOrchestrator.dispatch_action`:
  - For `ActionType.ACQUIRE_EVIDENCE`:
    - Check if online queries are enabled (default: `True`).
    - Invoke `connector_hub.federated_search(query=query, limit_per_source=limit)`.
    - Persist works into `scholarly_works`.
    - Return works and count in `resulting_artifacts`.
    - Record full audit trail in `orchestration_events`.

### 3.4 Frontend Layer (`web/src/`)
- `web/src/services/connectorService.ts`:
  - Type definitions for `NormalizedScholarlyWork`, `ConnectorInfo`, `IngestWorkRequest`, `LinkClaimRequest`.
  - API functions: `searchScholarlyWorks()`, `ingestScholarlyWork()`, `linkClaimEvidence()`, `getConnectorsHealth()`.
- `web/src/components/research/LiteratureMatrixTable.tsx` & Cockpit:
  - Add "Live Academic Discovery" search input and action button.
  - Render search results with authority badges (`PEER_REVIEWED`), citation count, DOI link, open access indicator.
  - Allow 1-click ingestion and claim linking.

---

## 4. Implementation Phases

| Phase | Description | Deliverables | Target Timeline |
|:---|:---|:---|:---|
| **Phase 1** | **Connector Verification & Hardening** | Verify `openalex_connector`, `semantic_scholar_connector`, and `hub.py`; ensure resilient timeouts and error handling. | Day 1 |
| **Phase 2** | **Ingestion & Linking Endpoints** | Implement `/api/connectors/ingest`, `/api/connectors/link-claim`, and problem source querying in `connectors.py`. | Day 1 |
| **Phase 3** | **Orchestrator Action Dispatch Integration** | Connect `ResearchOrchestrator` `ACQUIRE_EVIDENCE` handler directly to `ConnectorHub.federated_search()`. | Day 2 |
| **Phase 4** | **Frontend Service & Cockpit UI Ingestion** | Author `connectorService.ts`, integrate live discovery in Cockpit & Literature Matrix UI. | Day 2 |
| **Phase 5** | **Testing, Verification & Governance Promotion** | Unit/integration tests (`test_scholarly_ingestion_connectors.py`), full regression run, promotion to `main`. | Day 3 |

---

## 5. Risk Analysis & Mitigation Matrix

| Risk ID | Risk Description | Severity | Likelihood | Mitigation Strategy |
|:---|:---|:---|:---|:---|
| **RSK-015-01** | External API rate limiting or temporary 429/500 errors | Medium | Medium | Polite pool headers (`mailto`), 3.5s HTTP timeouts, and immediate fallback to local SQLite FTS5 index. |
| **RSK-015-02** | External API schema changes or missing abstract/authors | Low | Medium | Defensive normalization in `_normalize_work()`, defaulting missing fields to empty lists or None. |
| **RSK-015-03** | Ingestion duplicates creating bloat in `scholarly_works` | Medium | High | `upsert_scholarly_works()` keys strictly by lowercase normalized DOI, with secondary normalized title matching. |
| **RSK-015-04** | Breaking Article VII (Anti-Creep Law) | High | Low | Strictly 0 new dependencies. Use existing `httpx` and `pydantic`. |
| **RSK-015-05** | Network timeouts blocking Orchestrator dispatch | High | Medium | Connector queries wrapped in `asyncio.gather(..., return_exceptions=True)` with 3.5s timeout. |
