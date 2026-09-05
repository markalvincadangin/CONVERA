# CONVERA SDD-006: Conformance & Traceability Matrix
**Scholarly Evidence Persistence & Native Lexical Retrieval (SQLite FTS5 / BM25)**

**Specification ID**: CONVERA-SDD-006  
**Classification**: Specification Conformance & Requirements Traceability Matrix  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [RATIFIED & AUTHORIZED FOR IMPLEMENTATION]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `dac0f0f6e7e252dbcf036417441dd92b4d56d2cd`  
**Proposed Feature Branch**: `feature/006-scholarly-evidence-persistence-fts5`  
**Target Integration Branch**: `develop`  

---

## 1. Upstream Normative Traceability

| Upstream Authority | Normative Requirement | Current Baseline Status | SDD-006 Target Conformance | Verification Check |
| :--- | :--- | :--- | :--- | :--- |
| **CONSTITUTION.md**<br>Article I | **Epistemic Integrity**: Claims and decisions must be grounded in empirical, verifiable evidence rather than transient model hallucinations. | 🟡 **Compromised**<br>Academic literature is fetched ephemerally and discarded; abstracts are truncated to 50 words `[MEASURED PREFLIGHT FACT]`. | 🟢 **Conforming**<br>All fetched scholarly works are persisted permanently with full, untruncated abstracts and complete source metadata. | `CHK-006-01`<br>`CHK-006-09` |
| **CONSTITUTION.md**<br>Article V | **External Boundary Principle**: Core platform intelligence and inquiry must remain resilient against external service outages. | 🔴 **Violated**<br>Research discovery halts completely if external APIs (OpenAlex, Crossref, Semantic Scholar) rate-limit or fail. | 🟢 **Conforming**<br>`ConnectorHub` automatically falls back to local FTS5 BM25 search over cached literature with epistemic non-elevation. | `CHK-006-08`<br>`INV-006-04` |
| **CONSTITUTION.md**<br>Article VI | **Free-First & Offline Sovereignty**: Core operations must run 100% offline with zero cloud runtime cost. | 🔴 **Violated**<br>Scholarly search requires live internet connections on every request; zero local literature indexing exists. | 🟢 **Conforming**<br>Native SQLite FTS5 runs 100% locally with sub-millisecond lexical queries and zero external cloud egress. | `CHK-006-02`<br>`CONF-006-02` |
| **CONSTITUTION.md**<br>Article VII | **Anti-Creep Law**: Do not adopt complex infrastructure (FAISS, DuckDB, vector DBs) when simple native methods suffice. | 🟢 **Adhering**<br>Rejects heavy embeddings, FAISS, and DuckDB; achieves BM25 retrieval using native SQLite C-extension. | 🟢 **Conforming**<br>Zero new pip dependencies; 100% standard library `sqlite3` FTS5. | `CHK-006-12`<br>`INV-006-05` |
| **AI_ARCHITECTURE.md**<br>Section 2.1 | **"LLM Last, Not LLM First"**: Deterministic logic and retrieval must precede generative model invocation. | 🟡 **Deficient**<br>Connectors pass truncated snippets directly to LLM without intermediate local retrieval or indexing. | 🟢 **Conforming**<br>Implements Stage 2 (Retrieval/Search) of the canonical AI progression before passing full context to the LLM. | `CHK-006-07`<br>`CONF-006-01` |

---

## 2. Requirements-to-Test Conformance Mapping

| Requirement ID | Requirement Description | Target Component | Verification Method | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **`FR-RET-001`** | `scholarly_works` Schema Creation | `backend/storage/sqlite_adapter.py` | Table inspection pragma | Table exists with `id`, `doi`, `title`, `abstract`, `authors`, `year`, `venue`, `citation_count`, `source_connector`. |
| **`FR-RET-002`** | `scholarly_works_fts` External Content Table | `backend/storage/sqlite_adapter.py` | Virtual table pragma | Virtual table exists referencing `content='scholarly_works'`. |
| **`FR-RET-003`** | Triggers for FTS5 Index Lifecycle | `backend/storage/sqlite_adapter.py` | DB trigger verification | Insert, update, and delete in `scholarly_works` reflect immediately in `scholarly_works_fts`. |
| **`FR-RET-004`** | Two-Stage Idempotent Upsert (DOI + DOI-less) | `backend/storage/sqlite_adapter.py` | Upsert unit test | Inserts without DOIs update on title-year hash `ON CONFLICT(id)`; newly discovered DOIs enrich records. |
| **`FR-RET-005`** | Native BM25 Relevance Search | `backend/storage/sqlite_adapter.py` | Search execution | Query returns ranked results using composite $(-\text{bm25}) \times \log(10 + \text{citations})$. |
| **`FR-RET-006`** | FTS5 Index Rebuild Execution | `backend/storage/sqlite_adapter.py` | Rebuild test | Executing `'rebuild'` completely restores FTS5 index from base relational rows. |
| **`FR-RET-007`** | ConnectorHub Auto-Persistence | `backend/connectors/hub.py` | Integration test | `federated_search()` stores all returned works in SQLite. |
| **`FR-RET-008`** | Offline Fallback with Epistemic Non-Elevation | `backend/connectors/hub.py` | Mocked network outage | On connector exception, returns local FTS5 results with `is_offline = True`, `is_cached = True`, preserving tier. |
| **`FR-RET-009`** | Research Agent Full Abstract Retention | `backend/agents/research_agent.py` | Dossier text inspection | Dossier text contains full abstract (> 400 chars). |
| **`FR-RET-010`** | Problem Sources Historical Backfill | `backend/storage/sqlite_adapter.py` | Migration execution | 180 measured rows in `problem_sources` backfill into `scholarly_works` cleanly. |
| **`NFR-RET-001`**| Sub-Millisecond Local Retrieval Target | `search_scholarly_works_fts` | Benchmark timing | 100 queries against 1,000 papers complete in $< 50$ ms total `[ENGINEERING TARGET]`. |
| **`NFR-RET-002`**| Zero Package Manifest Expansion | `backend/pyproject.toml` | Manifest check | `git diff backend/pyproject.toml` shows zero dependency additions `[MEASURED FACT]`. |
| **`GR-RET-001`** | Anti-Creep Boundary Isolation | Project scope | Scope audit | `DEF-DATA-001` (Problem Bank bypass) and `DEF-DEV-007` remain strictly excluded `[MEASURED FACT]`. |
