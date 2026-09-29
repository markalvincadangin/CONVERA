# CONVERA SDD-015: Feature Specification
# Scholarly Ingestion & Live Connectors (CIIA v1.0 Standardized Academic Retrieval)

**Specification ID**: CONVERA-SDD-015  
**Classification**: Scholarly Ingestion, External Academic Connectors & Epistemic Persistence  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Baseline Git Commit**: `70a5ada` (Ratified SDD-014 Promotion to `main`)  
**Proposed Feature Branch**: `feature/015-scholarly-ingestion-connectors`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, IV, VII, VIII)  
- `docs/00-foundation/IDENTITY.md` (`CONVERA-FND-005` — Core System Identity & Boundaries, §1, §2, §4, §13, §14, §15, §16, §17, §19, §21)  
- `convera_revised_roadmap.md` (Phase C: Scholarly Ingestion & Live Connectors)  
- `specs/006-scholarly-evidence-persistence-fts5/` (Scholarly Works FTS5 & BM25 Scoring)  
- `specs/007-source-mediated-epistemic-bridge/` (Epistemic Links & Authority Tiers)  
- `specs/013-research-orchestration-engine/` (Research Orchestrator Core)  
- `specs/014-research-cockpit-ui/` (Active Research Cockpit UI)  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Operational Problem
CONVERA's foundational architecture establishes that **empirical evidence must ground every research claim, assumption, and design decision** (Article I & Article II of the Constitution). 

In Phase A (SDD-006 & SDD-007), CONVERA built:
1. The persistent relational tables `scholarly_works` and the FTS5 virtual table `scholarly_works_fts` with BM25 composite ranking.
2. The `claim_evidence_links` table mediating between problem claims, problem sources, and scholarly works.

In Phase B (SDD-013 & SDD-014), CONVERA built:
1. The `ResearchOrchestrator` engine recommending and dispatching actions such as `ACQUIRE_EVIDENCE`.
2. The Active Research Cockpit UI presenting epistemic health meters, stage monitors, and action dispatch buttons.

However, a critical gap remains:
- **Connector Disconnection**: While initial connector contracts and adapters exist in `backend/connectors/` (`OpenAlexConnector`, `SemanticScholarConnector`, `CrossrefConnector`, `PubMedConnector`, and `ConnectorHub`), they are not fully integrated into the end-to-end ingestion and claim-evidence linking workflows.
- **Orchestrator Isolation**: The `ResearchOrchestrator.dispatch_action()` handler for `ACQUIRE_EVIDENCE` currently only queries the local SQLite FTS5 table, meaning new external academic literature cannot be discovered or ingested during live orchestration cycles without manual database seeding.
- **UI Ingestion Deficit**: Researchers lack a streamlined, CCDS v2.0 interface within the Cockpit / Literature Matrix to execute multi-source academic queries, view normalized citation metadata, ingest selected papers into active problem sources, and link them to claims with explicit epistemic relationships (`SUPPORTS`, `CONTRADICTS`, `CONTEXTUALIZES`).

### 1.2 The Solution: SDD-015 Scholarly Ingestion & Live Connectors
SDD-015 operationalizes the **CONVERA Intelligence & Integration Architecture (CIIA v1.0)** for live academic discovery:
1. **Hardened Multi-Source Connectors**: Standardize and verify `OpenAlexConnector` and `SemanticScholarConnector` with polite pool identification, structured abstract reconstruction, topic extraction, and robust rate-limiting.
2. **Federated Discovery & Auto-Deduplication**: Strengthen `ConnectorHub` to query external connectors in parallel via `asyncio.gather()`, normalize disparate schemas into `NormalizedScholarlyWork`, deduplicate by DOI and normalized title, and automatically persist discovered literature into the canonical `scholarly_works` SQLite table.
3. **Seamless Offline Fallback**: Ensure that when external APIs are unreachable, rate-limited, or network is offline, all queries gracefully degrade to local SQLite FTS5 BM25 search without throwing unhandled exceptions.
4. **Direct Orchestrator Dispatch**: Wire `ResearchOrchestrator._dispatch_acquire_evidence` to invoke `ConnectorHub.federated_search()`, persisting new works into SQLite and returning structured literature artifacts directly to the Cockpit.
5. **Ingestion & Claim-Linking Endpoints**: Expose robust API endpoints:
   - `POST /api/connectors/search`: Multi-source federated search with deduplication.
   - `POST /api/connectors/ingest`: Direct ingestion of selected works into `problem_sources`.
   - `POST /api/connectors/link-claim`: Binding ingested sources to specific claims with explicit authority tiering and relation types.
6. **Frontend Cockpit Integration**: Empower researchers to trigger live literature discovery, inspect citation counts and open-access PDF links, and bind evidence to problem claims directly in the UI.

---

## 2. Governing Invariants & Constitutional Constraints

All implementations of SDD-015 must strictly conform to these invariants:

1. **`INV-015-01` (Article VII Anti-Creep Law)**:
   Zero new third-party dependencies shall be added to `backend/pyproject.toml` or `web/package.json`. All HTTP communication must utilize the existing `httpx` async client; validation must utilize existing `pydantic` models.
2. **`INV-015-02` (Article II Tri-Part Confidence Invariant)**:
   Academic citation counts, venue prestige, and evidence tiers (`PEER_REVIEWED`, `OFFICIAL_DATA`) must **never be conflated with LLM generation confidence**. External literature metrics represent objective bibliographic signals, completely decoupled from model self-assessment.
3. **`INV-015-03` (Article IV Human Sovereignty Invariant)**:
   Ingesting an external paper into a problem's evidence base or linking it to a claim requires explicit human initiation or confirmation. The system shall never silently alter claim validation statuses without human-visible audit records.
4. **`INV-015-04` (Offline Sovereignty & Graceful Degradation)**:
   External network failure must never cause an application crash or block research workflows. When external academic APIs timeout or return errors, the system must immediately and transparently fall back to local SQLite FTS5 search.
5. **`INV-015-05` (Canonical Relational Persistence)**:
   All newly retrieved academic works must be persisted to the SQLite WAL database (`scholarly_works` and synchronized to `scholarly_works_fts`). No ephemeral memory-only caches may serve as the system of record.

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 — Multi-Source Federated Academic Search (Priority: P1)
As a researcher investigating computational agricultural breakdowns,  
I want to execute a federated search across OpenAlex and Semantic Scholar,  
So that I receive deduplicated, normalized academic papers with citation counts, DOIs, and abstracts.

**Acceptance Criteria**:
1. **Given** an active search query (e.g., `"cassava bacterial blight remote sensing"`),  
   **When** `POST /api/connectors/search` is executed with `limit_per_source=5`,  
   **Then** the response contains deduplicated `NormalizedScholarlyWork` objects:
   - Deduplicated by DOI (primary) or normalized alphanumeric title (fallback).
   - Ranked primarily by citation count descending.
   - Each work includes complete provenance metadata (`source_name`, `retrieval_timestamp`, `authority_tier`).
   - All retrieved works are asynchronously or synchronously upserted into the SQLite `scholarly_works` table.

### User Story 2 — Offline Fallback Search (Priority: P1)
As a field researcher working with intermittent internet connectivity,  
I want academic searches to return relevant results from my local database if external APIs are unreachable,  
So that my research progress is never blocked by network loss.

**Acceptance Criteria**:
1. **Given** the backend environment has no internet access or external APIs return timeouts,  
   **When** `POST /api/connectors/search` is called,  
   **Then** the system catches the connection errors, queries the local SQLite `scholarly_works_fts` table via BM25 ranking, and returns the cached works flagged with `is_offline: true` and `is_cached: true`.

### User Story 3 — Ingestion & Claim-Evidence Linking (Priority: P1)
As a researcher evaluating problem claims in Stage A/B,  
I want to ingest selected academic papers into my problem's evidence repository and link them to specific claims,  
So that my problem's Epistemic Health Meter reflects verified empirical backing.

**Acceptance Criteria**:
1. **Given** a problem $P$ and a retrieved scholarly work $W$,  
   **When** `POST /api/connectors/ingest` is called with `{ problem_id: P.id, scholarly_work_id: W.id }`,  
   **Then** a record is created in `problem_sources` referencing `scholarly_work_id`.
2. **Given** an ingested source $S$ and a problem claim $C$,  
   **When** `POST /api/connectors/link-claim` is called with `{ claim_id: C.id, source_id: S.id, relation_type: "SUPPORTS", evidence_strength: "STRONG" }`,  
   **Then** an entry is created in `claim_evidence_links` and returned with full relational metadata.

### User Story 4 — Orchestrator Live Evidence Acquisition (Priority: P1)
As a researcher clicking "Acquire Evidence" in the Active Research Cockpit,  
I want the orchestrator to fetch live literature if online and link relevant papers to my problem,  
So that missing evidence gaps identified in Stage Gate evaluation are actively resolved.

**Acceptance Criteria**:
1. **Given** an active research session $S$ with recommended action `ACQUIRE_EVIDENCE`,  
   **When** `POST /api/orchestrator/action/dispatch` is invoked,  
   **Then** the orchestrator queries `ConnectorHub.federated_search()`, persists new papers into SQLite, records an `orchestration_events` record with type `ACTION_DISPATCH`, and returns the newly acquired works in the response payload.

### User Story 5 — Cockpit UI Search & Ingestion Flow (Priority: P2)
As a researcher in the CONVERA web interface,  
I want to interactively search literature, inspect open-access badges, and attach evidence to claims,  
So that my workflow is frictionless and adheres to the CCDS v2.0 design system.

**Acceptance Criteria**:
1. **Given** the Research Cockpit or Literature Matrix view,  
   **When** the user enters a search query or clicks "Acquire Live Evidence",  
   **Then** the UI displays live academic candidates with badges (`PEER_REVIEWED`, citation count, venue, year, open access link).
2. The user can click "Attach as Evidence" to bind the paper to an active problem claim.

---

## 4. Non-Functional Requirements & Performance Targets

1. **Search Latency**: Federated search across all online connectors must complete within $\le 3,500\text{ms}$ under standard broadband; timeouts per connector capped at $3.0\text{s}$.
2. **Offline Fallback Latency**: Local FTS5 fallback query must complete within $\le 50\text{ms}$.
3. **Database Concurrency**: Ingestion writes must leverage SQLite WAL mode to avoid database locks during concurrent reads.
4. **API Safety**: Strict user-agent and polite email headers sent on all OpenAlex and Semantic Scholar requests to prevent IP blocking.
