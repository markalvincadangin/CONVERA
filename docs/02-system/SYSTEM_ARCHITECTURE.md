# CONVERA — System Architecture Specification

**Document ID**: `CONVERA-SYS-001`  
**Classification**: 5-Tier Layered Architecture Blueprint  
**Authority Tier**: Tier 2 System Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/02-system/SYSTEM_ARCHITECTURE.md`  
**Upstream Dependencies**: `00-foundation/CONSTITUTION.md, 01-product/CAPABILITIES.md`  
**Downstream Dependents**: `03-engineering/ENGINEERING_PRINCIPLES.md, 04-ai/AI_ARCHITECTURE.md, 05-data/DATA_ARCHITECTURE.md`  

---

> **Technical Architecture Blueprint & Component Contracts.**  
> This document authoritatively specifies the technical topology, subsystem boundaries, data flows, dependency directions, and failure-handling mechanisms of CONVERA.

---

## 1. System Architecture Topology

CONVERA is structured into decoupled architectural areas where domain logic is strictly isolated from concrete infrastructure implementations:

```text
========================================================================================
                          CONVERA TECHNICAL TOPOLOGY
========================================================================================

                         ┌─────────────────────────────┐
                         │   1. PRESENTATION LAYER     │
                         │ Next.js 15.2.0 App Router · SWR │
                         │ CCDS v2.0 Dark Mode Tokens  │
                         └──────────────┬──────────────┘
                                        │ HTTP REST / JSON
                         ┌──────────────▼──────────────┐
                         │ 2. APPLICATION & ROUTER API │
                         │ FastAPI (15 Domain Routers) │
                         │ Pydantic Validation Schemas │
                         └──────────────┬──────────────┘
                                        │ Pure Python DTOs
                         ┌──────────────▼──────────────┐
                         │    3. DOMAIN ENGINE LAYER   │
                         │ Knowledge Lifecycle · Impact│
                         │ Gates · Freshness · Export  │
                         └──────────┬────────┬─────────┘
                                    │        │
             ┌──────────────────────┘        └──────────────────────┐
             │ Contract: BaseStorageAdapter                         │ Contract: BaseConnector / Gateway
             ▼                                                      ▼
┌─────────────────────────────┐                        ┌─────────────────────────────┐
│ 4. PERSISTENCE SUBSYSTEM    │                        │ 5. CIIA COGNITIVE LAYER     │
│ • SQLiteStorageAdapter      │                        │ • LLM Gateway (Gemini/Groq/ │
│ • SQLite Database (WAL Mode)│                        │   Ollama Provider Cascade)  │
│ • 23 Relational Tables      │                        │ • Connector Hub (OpenAlex,  │
│ • Foreign Key Constraints   │                        │   Crossref, PubMed, etc.)   │
│                             │                        │ • MCP Server (JSON-RPC stdio│
└─────────────────────────────┘                        └─────────────────────────────┘
```

---

## 2. Component Boundaries & Inversion of Control (IoC)

Domain logic owns neither persistence implementation nor AI provider clients. The domain interacts exclusively with abstract contracts:

```text
    PRESENTATION (web/)
           │
           ▼
    API ROUTERS (backend/routers/)
           │
           ▼
    CORE ENGINES (backend/engines/)
           │
    ┌──────┴──────────────────────────┐
    ▼                                 ▼
STORAGE CONTRACT (BaseStorageAdapter) CIIA CONTRACTS (BaseConnector / LLM Gateway)
    │                                 │
    ▼                                 ▼
CONCRETE SQLITE WAL               CONCRETE PROVIDERS / OPEN APIS
```

### Architectural Dependency Invariants:
1. **Presentation Boundary:** The web client communicates with backend subsystems strictly via HTTP REST endpoints (`fetchApi` client with client-side query cache).
2. **Storage Decoupling:** Engines never import physical database drivers (`sqlite3`) directly; all persistence operations invoke `BaseStorageAdapter` methods through the `get_storage()` singleton.
3. **AI Decoupling:** Engines never invoke proprietary vendor SDKs directly; model inference is requested through `llm_gateway.generate_response_with_fallback()`.
4. **Zero Circular Dependencies:** Routers import engines and storage contracts; engines import storage contracts; persistence adapters and connectors do not import routers or engines.

---

## 3. Data Flow & Transaction Lifecycle

User operations execute through a structured, observable pipeline:

```text
  [ User Interaction / Request ]
                │
                ▼
  1. Frontend Client Request (HTTP JSON)
                │
                ▼
  2. FastAPI Domain Router (Pydantic Schema Validation)
                │
                ▼
  3. Domain Engine Execution (Epistemic Balance / Impact Tracing / Gate Evaluation)
                │
                ▼
  4. BaseStorageAdapter → SQLite WAL Transaction (Parameterized SQL Execution)
                │
                ▼
  5. Reactive Invalidation Evaluation (If Evidence / Assumption mutated)
                │
                ▼
  6. HTTP JSON Response (DTO + Event Metadata)
                │
                ▼
  7. Client State Mutation & UI State Synchronization
```

---

## 4. CIIA Subsystem & External Boundary

The **Cognitive Infrastructure & Interoperability Architecture (CIIA)** governs all external intelligence, search, and agentic interactions:

```text
                                   CIIA SUBSYSTEM
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  [ LLM GATEWAY ]               [ CONNECTOR HUB ]                [ MCP SERVER ]
  Inference Cascade:            Scholarly Ingestion:             Agent Interface:
  1. Gemini 2.5 Flash (Primary) • OpenAlexConnector              • JSON-RPC 2.0 (stdio)
  2. Groq LLaMA 3.3-70B (Sec.)  • CrossRefConnector              • Exposes 7 Knowledge,
  3. Local Ollama (Local)       • PubMedConnector                  Decision, and Literature
                                • EuropePMCConnector               Tools to External AI IDEs
  [ DEGRADED FALLBACK ]         • SemanticScholarConnector
  Synthetic Generator
  (Non-Evidentiary Mock)
```

### A. LLM Provider Cascade & Synthetic Degraded Fallback
* **Provider Cascade:** Requests attempt the primary cloud provider (Gemini). If unavailable or rate-limited (HTTP 429), execution falls back to the secondary provider (Groq), then to the local offline runtime (Ollama).
* **Synthetic Fallback (Degraded Mode):** If all external and local providers fail or are unconfigured, a deterministic mock generator produces synthetic candidate structures.
* **Epistemic Constraint:** Synthetic generator outputs are tagged with `source="synthetic_fallback"` and are **strictly non-evidentiary**; they cannot be promoted to evaluated evidence.

### B. Scholarly Connector Contract (`BaseConnector`)
Every academic search adapter inherits from `backend/connectors/base.py`:
* `search(query: str, limit: int) -> List[NormalizedScholarlyWork]`
* `get_by_id(identifier: str) -> Optional[NormalizedScholarlyWork]`
* `health_check() -> bool`
* Integrated in-memory response caching and rate-limiting.
* Standardized provenance metadata encapsulation (`ProvenanceMetadata`).

### C. Model Context Protocol (MCP) Server
`backend/mcp_server.py` implements a standalone stdio JSON-RPC 2.0 daemon. Rather than ingesting external data, it operates as an **outward-facing interface**, exposing CONVERA's internal knowledge graph, decision history, and literature search tools to external AI development environments (e.g., Antigravity IDE, Claude Desktop).

---

## 5. Persistence Subsystem & SQLite WAL Architecture

Physical data storage is managed by `SQLiteStorageAdapter` (`backend/storage/sqlite_adapter.py`):

* **Concurrency Model:** SQLite runs with `PRAGMA journal_mode = WAL` (Write-Ahead Logging) and `PRAGMA synchronous = NORMAL`, allowing concurrent reader processes alongside active writes.
* **Schema Integrity:** 23 normalized relational tables enforcing foreign key constraints (`PRAGMA foreign_keys = ON`).
* **Multi-Tenant Isolation:** Project data is partitioned and filtered using `project_id` foreign keys and access passcodes.
* **Additive Schema Initialization:** `init_db()` executes idempotent table creation and column verification routines at startup.

---

## 6. Offline-Core vs. External-Connectivity Capabilities

CONVERA distinguishes between core local capabilities and external network dependencies:

| Capability | Offline Core Operation | Requires Network Connectivity |
| :--- | :---: | :---: |
| **Existing Problem & Knowledge Browsing** | ✅ Available | ❌ Not Needed |
| **Epistemic Balance Calculations** | ✅ Available | ❌ Not Needed |
| **Unknowns Map Triangulation** | ✅ Available | ❌ Not Needed |
| **Decision Logging & Blast-Radius Traversal** | ✅ Available | ❌ Not Needed |
| **Quality Gate Rubrics & Sign-offs** | ✅ Available | ❌ Not Needed |
| **SQLite WAL Persistence & Snapshots** | ✅ Available | ❌ Not Needed |
| **Local LLM Inference (via Ollama)** | ✅ Available (if local daemon running) | ❌ Not Needed |
| **Synthetic Mock Discovery Fallback** | ✅ Available (Non-evidentiary) | ❌ Not Needed |
| **Cloud LLM Generation (Gemini / Groq)** | ❌ Unavailable | ✅ Required |
| **Scholarly Literature Retrieval (OpenAlex/CrossRef/etc.)**| ❌ Unavailable | ✅ Required |

---

## 7. Failure Modes & Resilience Semantics

| Subsystem | Failure Condition | Resilience Behavior |
| :--- | :--- | :--- |
| **LLM Inference** | Cloud provider rate-limit (429) or network outage | Automatically falls back through the provider cascade (Gemini $\to$ Groq $\to$ Ollama $\to$ Synthetic generator). Surfaces degraded status in response metadata. |
| **Scholarly Connectors** | Remote API timeout or endpoint error | Logs connector warning, bypasses unreachable source, and returns partial aggregated results from available connectors. |
| **Database Locks** | Transient SQLite busy/lock contention | Executes bounded retry with exponential backoff before failing. |
| **Persistent Storage I/O** | Disk write failure or physical storage failure | Fails safely without claiming successful persistence; preserves existing on-disk database state and raises an explicit storage-unavailable error. |
| **Evidence Invalidation** | Refuting evidence links to foundational claim | Impact engine marks downstream decisions as `STALE_REVIEW_REQUIRED` without deleting historical audit records. |

---

## 8. Security & Isolation Boundaries

1. **SQL Injection Mitigation:** Database queries use parameterized SQL tuples (`conn.execute(sql, params)`). Dynamic string concatenation into SQL statements is prohibited.
2. **Identifier Validation:** Problem and entity identifiers are validated and normalized (e.g., via `clean_problem_id`) to mitigate path traversal and malformed inputs.
3. **XSS & Content Security:** Cross-site scripting (XSS) mitigation relies on React/Next.js output encoding, strict component property types, and application-layer content sanitization.
4. **Secrets Isolation:** External API credentials reside strictly in server-side environment variables (`.env`) and are never exposed to client-side bundles.

---

## 9. Architectural Authority & Implementation Status

To preserve the documentation consistency invariant, this table categorizes the architectural status of each subsystem:

| Subsystem / Feature | Architectural Classification | Notes |
| :--- | :--- | :--- |
| **Knowledge $\neq$ Workflow Separation** | `RATIFIED_INVARIANT` | Core constitutional law governing data persistence across frameworks. |
| **Tri-Part Confidence Decoupling** | `RATIFIED_INVARIANT` | Mathematical and conceptual rule isolating AI, evidence, and decision confidence. |
| **SQLite WAL Persistence (23 Tables)** | `CURRENT_IMPLEMENTATION` | Implemented in `sqlite_adapter.py` and validated by test suite. |
| **3-Tier LLM Cascade + Synthetic Fallback** | `CURRENT_IMPLEMENTATION` | Implemented in `llm_gateway.py` with multi-provider fallbacks. |
| **Federated Scholarly Connector Hub** | `CURRENT_IMPLEMENTATION` | Implemented in `connectors/` (OpenAlex, CrossRef, PubMed, Europe PMC, Semantic Scholar). |
| **Standalone JSON-RPC MCP Server** | `CURRENT_IMPLEMENTATION` | Implemented in `backend/mcp_server.py` exposing 7 tools. |
| **Quality Gates 1–4 Engine** | `CURRENT_IMPLEMENTATION` | Implemented in `gate_engine.py` and `GateReviewModal.tsx`. |
| **Dual Framework Workspace UI** | `CURRENT_IMPLEMENTATION` | Implemented in `Innovation Workspace` and `ResearchWorkspaceView.tsx`. |
| **Cloud R&D Deployment Profiles** | `TARGET_ARCHITECTURE` | Non-authoritative optional exploration only; zero-cost local posture remains primary. |
