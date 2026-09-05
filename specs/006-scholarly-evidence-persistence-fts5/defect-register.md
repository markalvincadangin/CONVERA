# CONVERA SDD-006: Defect & Scope Boundary Register
**Scholarly Evidence Persistence & Native Lexical Retrieval (SQLite FTS5 / BM25)**

**Specification ID**: CONVERA-SDD-006  
**Classification**: Architectural & Operational Defect Register  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [RATIFIED & AUTHORIZED FOR IMPLEMENTATION]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `dac0f0f6e7e252dbcf036417441dd92b4d56d2cd`  
**Proposed Feature Branch**: `feature/006-scholarly-evidence-persistence-fts5`  
**Target Integration Branch**: `develop`  

---

## 1. Triaged Defect Inventory

| Defect ID | Severity | Category | Title & Summary | Remediation in SDD-006 | Scope Status | Proposed Resolution Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`DEF-RET-001`** | **HIGH** | Architecture | **Ephemeral Academic Literature Discovery**<br>Academic literature fetched from OpenAlex, Semantic Scholar, Crossref, and PubMed is discarded upon request completion; zero persistent corpus exists in SQLite `[MEASURED FACT]`. | Implement `scholarly_works` table and hook `ConnectorHub.federated_search()` to auto-persist all discovered works. | **IN-SCOPE (Core)** | 🟡 **SPECIFIED (SDD-006)** |
| **`DEF-RET-002`** | **HIGH** | Knowledge Loss | **400-Character Abstract Truncation in Research Agent**<br>`backend/agents/research_agent.py:82` truncates abstracts to exactly 400 characters (~50 words), stripping empirical findings, methodology, and metrics from LLM claim extraction `[MEASURED FACT]`. | Eliminate truncation; store full abstract in `scholarly_works.abstract` and format full abstract in research agent dossier. | **IN-SCOPE (Core)** | 🟡 **SPECIFIED (SDD-006)** |
| **`DEF-RET-003`** | **HIGH** | Resilience | **Zero Offline Fallback for Research Discovery**<br>Any network failure, API outage, or HTTP 429 rate limit on external academic connectors completely halts research scouting and matrix synthesis. | Implement automatic fallback in `ConnectorHub` to local SQLite FTS5 BM25 search over cached literature with epistemic non-elevation. | **IN-SCOPE (Core)** | 🟡 **SPECIFIED (SDD-006)** |
| **`DEF-RET-004`** | **MEDIUM** | Data Integrity | **SQLite UNIQUE NULL Ineffectiveness on DOI-less Literature**<br>SQLite treats multiple `NULL` values as distinct in a `UNIQUE(doi)` column. A naive `ON CONFLICT(doi)` fails to detect duplicates among DOI-less papers. | Specified two-stage preflight lookup and universal idempotent upsert targeting deterministic primary key `ON CONFLICT(id)`. | **IN-SCOPE (Design)** | 🟡 **SPECIFIED (SDD-006)** |
| **`DEF-DATA-001`** | **HIGH** | Data Integrity | **Problem Bank Deduplication Storage Bypass**<br>`sqlite_adapter.py:1258` bypasses `find_matching_problem` whenever `raw_id` is present, causing 922 duplicate rows across 997 Problem Bank records `[MEASURED FACT]`. | **STRICTLY EXCLUDED** under Article VII (Anti-Creep Rule). Resolving Problem Bank deduplication requires dedicated problem clustering and merge workflows independent of literature persistence. | **EXCLUDED (Separate Scope)** | ⏸️ **LOGGED FOR DEDICATED DATA SDD** |
| **`DEF-DEV-007`** | **MEDIUM** | Performance | **Unmocked LLM Gateway Egress in Integration Tests**<br>`test_assumption_extraction_engine` (43.65s) and `test_srs_generator_flow` (43.41s) consume 87s of 91s offline suite duration `[MEASURED FACT]`. | Known and recorded deferred defect from SDD-005. Not authorized for implementation in SDD-006 per scope isolation rules. | **DEFERRED DEFECT** | 📋 **LOGGED (Not Authorized)** |
| **`DEF-SCORE-001`**| **HIGH** | Heuristics | **Evidence Scorer Superficial Metric Gaming**<br>`evidence_scorer.py` awards maximum impact points (20/20) to any string with `₱` and digits, and restricts geography to 24 Iloilo towns. | Identified as Candidate B in discovery. Sequenced to follow immediately after SDD-006 once persistent evidence foundation is operational. | **FUTURE SCOPE** | 📋 **SEQUENCED FOR SUBSEQUENT SDD** |

---

## 2. Scope Reconciliation & Anti-Creep Justification

### Why `DEF-DATA-001` (Problem Bank Deduplication) is Excluded from SDD-006:
1. **Separation of Concerns**: SDD-006 provides **external literature persistence and local lexical search**. The Problem Bank duplicate issue concerns **user/seed problem record ingestion** in `sqlite_adapter.py`.
2. **Blast Radius & Migration Risk**: De-duplicating 922 problem records requires foreign key remapping across `problem_sources`, `problem_phase_history`, `decision_records`, and `requirements_traceability`. Coupling this complex relational surgery with FTS5 literature indexing would drastically increase implementation risk and compromise deployment safety.
3. **Strict Adherence to Anti-Creep Law (Article VII)**: The user explicitly directed: *"Do not assume that the Problem Bank deduplication issue must be included merely because it was discovered during this investigation. Apply the anti-creep rule and establish the dependency explicitly."* By isolating `DEF-DATA-001` to its own dedicated scope, SDD-006 remains bounded, testable, and low-risk.

### Why `DEF-SCORE-001` (Evidence Scoring Hardening) is Sequenced After SDD-006:
1. `evidence_scorer.py` evaluates evidence attached to problems.
2. Persisting scholarly literature in `scholarly_works` via SDD-006 ensures that founders and automated agents have an authentic, persistent local evidence repository from which to attach valid sources.
3. Hardening the scoring rules once persistent evidence exists creates a cohesive, grounded decision pipeline.
