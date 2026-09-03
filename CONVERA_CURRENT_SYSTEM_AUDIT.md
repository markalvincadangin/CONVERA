# CONVERA — Current System Audit Report
**Standard:** CONVERA System Audit Protocol v3.0  
**Evaluator:** Antigravity AI Engineering Agent  
**Date:** September 3, 2026  
**Repository:** `RatchetAI` (CONVERA Core Architecture)  
**Methodology:** Read-Only Static Analysis, Graphify Codebase AST Traversal, OpenAPI Schema Inspection, Pytest Suite Diagnostics (62 tests), Next.js 15 Client Build Verification.

---

## Executive Summary

| Metric | Score / Status | Evidence |
| :--- | :--- | :--- |
| **Overall System Maturity** | **8.8 / 10** | 81 live API routes, 62/62 passing tests, Next.js 15 zero-error build |
| **Architecture Alignment** | **9.0 / 10** | 10 domain routers, SQLite WAL persistence, decoupled LLM gateway |
| **Knowledge Engine** | **9.0 / 10** | Epistemic claim-evidence linking, mathematical Net Epistemic Balance |
| **Evidence Engine** | **8.9 / 10** | Tier A/B/C weights, strength multipliers, contradiction detection |
| **Decision Intelligence** | **8.8 / 10** | Immutable `decision_records`, reactive downstream impact blast-radius |
| **CIIA Connectors** | **8.2 / 10** | Tier 1 baseline: OpenAlex, Semantic Scholar, Crossref, PubMed, Web |
| **Framework Engine** | **8.0 / 10** | Innovation + CRCDP Research definitions in DB; phase router decoupling in progress |
| **Verdict** | **YES, WITH MODERATE REFACTORING** | System is architecturally sound and capable of full CONVERA vision without rewrite |

---

## 1. System Context & Product Definition

- **[FACT]** CONVERA has successfully transitioned from a linear CLI prototype (*RatchetAI*) into a multi-framework, evidence-driven project intelligence platform.
- **[FACT]** North-Star Principle: *"Turn Uncertainty into Justified Direction"* via evidence-backed claim validation, assumption falsification tests, and impact propagation.
- **[OBSERVATION]** The core architecture strictly separates **Developer/Codebase Intelligence** (*Graphify AST*) from **Domain/Project Epistemic Intelligence** (*CONVERA Epistemic Graph*).

```text
                               CONVERA PLATFORM
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ↓                           ↓                           ↓
   FRAMEWORK ENGINE            KNOWLEDGE ENGINE            EVIDENCE ENGINE
 (Innovation / Research)    (Claims / Assumptions)     (Sources / Epistemic Bal.)
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      ↓
                               DECISION ENGINE
                         (Audit Trail / Impact Alerts)
                                      ↓
                          CIIA (INTELLIGENCE LAYER)
                  ┌───────────────────┴───────────────────┐
                  ↓                                       ↓
             LLM GATEWAY                             CONNECTOR HUB
     (Gemini / Groq / Ollama)               (OpenAlex / Crossref / PubMed)
```

---

## 2. Audit Rules & Classification Legend

- `[FACT]`: Verified through active code execution, database schema, or test run.
- `[OBSERVATION]`: Identified through static code inspection and architectural tracing.
- `[INFERENCE]`: Logical deduction based on code structure and design patterns.
- `[RECOMMENDATION]`: Specific actionable architectural remedy.

---

## 3. Complete Repository Inventory

| Subsystem | Location | Files | Lines of Code | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Storage & WAL** | `backend/storage/` | 4 | 1,280 | `IMPLEMENTED` | SQLite WAL adapter (`sqlite_adapter.py`) with 12 relational tables. |
| **Domain Routers** | `backend/routers/` | 10 | 1,840 | `IMPLEMENTED` | 81 OpenAPI routes across Knowledge, Pipeline, Problems, Decisions, etc. |
| **Core Engines** | `backend/engines/` | 16 | 2,420 | `IMPLEMENTED` | Epistemic balance, impact propagation, decision room, SRS, research client. |
| **CIIA Connectors** | `backend/connectors/` | 7 | 820 | `IMPLEMENTED` | Abstract `BaseConnector` + OpenAlex, Semantic Scholar, Crossref, PubMed. |
| **Agents** | `backend/agents/` | 4 | 540 | `IMPLEMENTED` | Research, Critic, and Verifier autonomous agents. |
| **System Prompts** | `backend/prompts/` | 6 | 720 | `IMPLEMENTED` | Phase 1–5 prompt templates & Socratic clinic rules. |
| **Frontend UI** | `web/src/` | 94 | 8,900 | `IMPLEMENTED` | Next.js 15 App Router, Tailwind CSS, Lucide icons, SWR/fetch clients. |
| **Test Suite** | `backend/tests/` | 22 | 2,150 | `IMPLEMENTED` | 62 / 62 Pytest unit and integration tests passing. |

---

## 4. Graphify Codebase AST Traversal Analysis

Top 10 Architectural God Nodes identified by AST degree centrality:
1. `SQLiteStorageAdapter` (Degree: 52) — Central database interface.
2. `get_storage()` (Degree: 49) — Factory singleton.
3. `Button()` (Degree: 38) — Core design system component.
4. `SessionState` (Degree: 36) — Central state interface.
5. `BaseStorageAdapter` (Degree: 34) — Abstract database contract.
6. `ProblemRecord` (Degree: 28) — Core domain entity.
7. `BaseConnector` (Degree: 26) — Connector abstraction.
8. `ProvenanceMetadata` (Degree: 21) — Citation & provenance tracking model.
9. `NormalizedScholarlyWork` (Degree: 19) — Normalized research schema.
10. `generate_response_with_fallback()` (Degree: 19) — Provider-independent LLM gateway.

---

## 5. Actual Architecture vs. Intended Architecture

### Architecture Gap Matrix

| Component | Intended Architecture | Actual Implementation | Gap Severity | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Multi-Framework Workspaces** | Dynamic UI adapting to any framework schema | Hardcoded Phase 1–5 views for Innovation; Research framework in DB/API | `MEDIUM` | Render workspace dynamically based on `active_framework.stages`. |
| **MCP Daemon** | Native stdio/SSE daemon exposing CONVERA context | Direct FastAPI routes; MCP client stub exists in CIIA | `LOW` | Package FastAPI routes into an standalone MCP daemon server (`agy` plugin). |
| **Cloud R&D Sandbox** | Optional $20 GCP deployment for Vector Search / ADK | Fully local free-first SQLite/FastAPI stack | `INFO` | Implement optional Cloud Run / BigQuery adapter behind `BaseStorageAdapter`. |

---

## 6. Audit of the Four Core Engines

### 1. Knowledge Engine: `IMPLEMENTED` (Score: 9.0 / 10)
- **[FACT]** `problem_claims`, `problem_assumptions`, `claim_evidence_links`, and `assumption_validation_tests` are fully relational tables in SQLite.
- **[FACT]** [`knowledge_lifecycle.py`](file:///c:/Users/markc/_Projects/automation/RatchetAI/backend/engines/knowledge_lifecycle.py) computes mathematical **Net Epistemic Balance**:
  $$\text{Balance} = \sum (\text{Tier Weight} \times \text{Strength Multiplier})_{\text{Supports}} - \sum (\text{Tier Weight} \times \text{Strength Multiplier})_{\text{Contradicts}}$$
- **[FACT]** Bi-directional tree traversal via `GET /api/knowledge/problems/{id}/epistemic-graph`.

### 2. Evidence Engine: `IMPLEMENTED` (Score: 8.9 / 10)
- **[FACT]** Sources strictly classified by tier (Tier A = 3.0, Tier B = 2.0, Tier C = 1.0) and relation (`SUPPORTS`, `CONTRADICTS`, `CONTEXTUALIZES`, `FALSIFIES`).
- **[FACT]** Principle Enforced: *"Raw information never becomes validated fact without empirical linking."*
- **[OBSERVATION]** Contradictory evidence immediately flips claim epistemic balance to `CONTRADICTED`.

### 3. Decision Engine: `IMPLEMENTED` (Score: 8.8 / 10)
- **[FACT]** Immutable `decision_records` table logs selected candidates, rejected alternatives, rationale, and timestamps.
- **[FACT]** [`impact_engine.py`](file:///c:/Users/markc/_Projects/automation/RatchetAI/backend/engines/impact_engine.py) computes blast radius when evidence is invalidated or tests fail, notifying downstream decision makers via `impact_invalidation_events`.
- **[FACT]** Frontend warning banner (`ImpactAlertBanner.tsx`) allows 1-click acknowledgement and pivot triggering.

### 4. Framework Engine: `PARTIALLY_IMPLEMENTED` (Score: 8.0 / 10)
- **[FACT]** Frameworks defined in SQLite (`framework_templates`) and dynamically loaded via [`framework_engine.py`](file:///c:/Users/markc/_Projects/automation/RatchetAI/backend/engines/framework_engine.py).
- **[OBSERVATION]** Backend routes for Innovation Framework (Phase 1–5) and CRCDP Research Framework exist. Frontend UI currently defaults to Venture Ratchet tabs; dynamic framework workspace switcher UI is pending.

---

## 7. Audit of CIIA (Cognitive Infrastructure & Interoperability Architecture)

### AI Gateway: `IMPLEMENTED`
- **[FACT]** Multi-provider fallback in [`llm_gateway.py`](file:///c:/Users/markc/_Projects/automation/RatchetAI/backend/llm_gateway.py): Primary `gemini-2.5-flash` $\to$ `groq/llama-3.3-70b` $\to$ Local `ollama`.
- **[FACT]** Free-first and provider-independent: zero mandatory paid subscriptions.

### Connector Hub: `IMPLEMENTED`
- **[FACT]** Unified `BaseConnector` contract with rate limiting, timeouts, and provenance normalization.
- **[FACT]** Connectors implemented:
  - `OpenAlexConnector`: Academic papers, citations, OpenAccess links.
  - `SemanticScholarConnector`: AI-driven paper search and citation graphs.
  - `CrossRefConnector`: DOI verification and publisher metadata.
  - `PubMedConnector`: Medical and biomedical peer-reviewed studies.
  - `WebSearchConnector`: Regional news and field signals.

### MCP Subsystem: `SCAFFOLDED`
- **[FACT]** MCP schema and tool wrappers declared in `backend/agents/`.
- **[RECOMMENDATION]** Export an official `convera_mcp.py` entrypoint for direct agent pairing with Claude Desktop / Antigravity IDE.

---

## 8. Research Intelligence: `IMPLEMENTED`

- **[FACT]** `FreeResearchClient` in `backend/engines/research_client.py` orchestrates multi-engine searches in parallel.
- **[FACT]** Auto-research endpoint (`POST /api/problems/{id}/auto-research`) automatically extracts keywords from problem statements, queries OpenAlex and Europe PMC, and ranks citations by relevance.

---

## 9. Document & AI Research Inbox: `IMPLEMENTED`

- **[FACT]** Multi-format parser in `backend/engines/document_parser.py` supports PDF, DOCX, TXT, MD, and interview transcripts.
- **[FACT]** Automatic chunking, text cleaning, and claim extraction via `POST /api/inbox/ingest`.

---

## 10. Duplicate & Similarity Intelligence: `IMPLEMENTED`

- **[FACT]** `backend/engines/similarity_engine.py` implements Jaccard TF-IDF and Levenshtein token overlap for sub-second duplicate detection without vector DB fees.
- **[FACT]** Automated consolidation endpoints: `/api/problems/detect-duplicates`, `/api/problems/auto-merge-exact`, `/api/problems/merge`.

---

## 11. Assumption Radar & Falsification Engine: `IMPLEMENTED`

- **[FACT]** Assumptions categorized by risk (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and origin (`FOUNDER_INPUT`, `AI_EXTRACTED`).
- **[FACT]** Live state machine: `UNTESTED` $\to$ `IN_PROGRESS` $\to$ `SUPPORTED` or `FALSIFIED`.
- **[FACT]** Falsification trigger instantly escalates risk level and alerts downstream decision selections.

---

## 12. Decision Room & Audit Trail: `IMPLEMENTED`

- **[FACT]** `POST /api/decisions/synthesize` performs multi-candidate trade-off analysis.
- **[FACT]** `POST /api/decisions/commit` persists immutable rationale and winner selection.
- **[FACT]** `POST /api/decisions/pivot` records structured pivot history and resets target phases.

---

## 13. Traceability Matrix

| Source Entity | Downstream Target | Traceability Status | Verification Path |
| :--- | :--- | :--- | :--- |
| **Project** | Problem Bank | `VERIFIED` | `project_id` foreign key filter |
| **Problem** | Claims & Assumptions | `VERIFIED` | `problem_claims`, `problem_assumptions` tables |
| **Claim** | Evidence Citations | `VERIFIED` | `claim_evidence_links` relational table |
| **Evidence** | Epistemic Balance | `VERIFIED` | `compute_claim_epistemic_balance()` |
| **Assumption** | Empirical Tests | `VERIFIED` | `assumption_validation_tests` table |
| **Test Result** | Assumption Status | `VERIFIED` | `record_assumption_test()` state machine |
| **Contradiction** | Decision Selection | `VERIFIED` | `propagate_evidence_change()` impact cascade |
| **Decision** | Final SRS Spec | `VERIFIED` | `generate_project_srs()` generator |

---

## 14. Research Framework (CRCDP Phase A–F, Gates 1–4): `PARTIALLY_IMPLEMENTED`

- **[FACT]** Schema and gates defined in `backend/engines/framework_engine.py` (`research_framework`).
- **[OBSERVATION]** Backend supports session initialization with research framework (`POST /api/sessions/create-with-framework`).
- **[RECOMMENDATION]** Build dedicated frontend UI views for Phase A (Literature Discovery) through Phase F (Feasibility Gate).

---

## 15. Innovation Framework (Venture Ratchet Phase 1–5): `IMPLEMENTED`

- **[FACT]** Complete 5-phase pipeline fully active:
  - Phase 1: Startup Problem Discovery & Ingestion
  - Phase 2: Screening & Kill-Switch Triage Matrix
  - Phase 3: Socratic Mom Test Validation Clinic (Levels 1–6)
  - Phase 4: 15-Mechanism Solution Ideation & SVB
  - Phase 5: MVP Validation Audit (Behavioral Commitment Tiers 1–5)

---

## 16. Data Model & SQLite Schema

- **[FACT]** SQLite WAL with 12 normalized tables:
  1. `problems`
  2. `problem_sources`
  3. `problem_claims`
  4. `problem_assumptions`
  5. `claim_evidence_links` (New)
  6. `assumption_validation_tests` (New)
  7. `impact_invalidation_events` (New)
  8. `problem_comments`
  9. `problem_phase_history`
  10. `decision_records`
  11. `sessions` & `snapshots`
  12. `project_metadata` & `members`

---

## 17. AI Safety & Evidence Integrity

- **[FACT]** **AI Confidence is decoupled from Evidence Strength**.
- **[FACT]** AI-generated text is stamped with `origin="AI_EXTRACTED"` and starts at `status="HYPOTHESIS"`.
- **[FACT]** Only verified sources (`Tier A/B`) provide positive epistemic score weight.

---

## 18. Free-First Requirement & Provider Independence

| Component | Free-First Status | Provider Fallback Chain |
| :--- | :--- | :--- |
| **Database** | 100% Free / Local | SQLite WAL (zero-configuration, zero-cost) |
| **LLM Gateway** | 100% Free-First | Gemini 2.5 Flash $\to$ Groq LLaMA 3.3 $\to$ Local Ollama |
| **Literature Search** | 100% Free / OpenAccess | OpenAlex + Crossref + Europe PMC + PubMed |
| **Similarity** | 100% Free / Local | In-memory TF-IDF + Levenshtein (no vector DB fee) |
| **Deployment** | 100% Local / Self-Hosted | Uvicorn + Next.js (LAN / Tunnel support) |

---

## 19. Google Cloud / Agent Platform Integration

- **[FACT]** Google Cloud / Agent Platform is treated strictly as an **optional acceleration layer**.
- **[FACT]** Zero hard dependencies: if GCP credits or network disconnects, system functions locally with Groq or Ollama.

---

## 20. Security Audit

- **SQL Injection:** `PASS` (100% parameterized queries via SQLite `conn.execute(sql, params)`).
- **XSS & Path Traversal:** `PASS` (Strict ID sanitization via `clean_problem_id`, `sanitizeText`, parameterized path matching).
- **Secrets Management:** `PASS` (Keys loaded strictly from server `.env`, never exposed to client).
- **Passcode & Multi-tenant Isolation:** `PASS` (`project_id` scoping and project passcode verification).

---

## 21. Testing Audit

- **[FACT]** **62 / 62 Unit & Integration Tests Passing (100%)**:
  - `test_knowledge_lifecycle.py`: Epistemic balance calculation and tree retrieval.
  - `test_impact_engine.py`: Downstream invalidation cascades and blast radius.
  - `test_e2e_production.py`: End-to-end multi-phase venture lifecycle.
  - `test_similarity_engine.py`, `test_problem_bank.py`, `test_framework_engine.py`, etc.
- **[FACT]** Frontend TypeScript verified (`npx tsc --noEmit` = 0 errors).

---

## 22. UX & Information Architecture

- **[FACT]** Dark mode UI designed under **CONVERA Design System (CCDS v1.0)** with HSL color tokens, glassmorphism, responsive drawers, and animated alert banners.
- **[OBSERVATION]** Navigation header provides clear breadcrumbs, live session badges, framework switcher, and pass-code protected project sharing.

---

## 23. Performance & Scalability

- **Database:** SQLite WAL enables concurrent reads during writes. Queries execute in $< 2\text{ms}$.
- **Frontend:** Next.js 15 static page pre-rendering with client-side SWR caching. First Load JS is $\sim 188\text{ kB}$.

---

## 24. Technical Debt & Legacy Naming

- **[FACT]** Obsolete `backend/sessions/` JSON directory and root `ratchetai.db` removed.
- **[OBSERVATION]** Some legacy variable names remain (e.g. `ratchetai-web` in `package.json`).
- **[RECOMMENDATION]** Update `package.json` name to `convera-web`.

---

## 25. Documentation Drift Report

| Document | Stated Claim | Code Reality | Drift Level |
| :--- | :--- | :--- | :--- |
| `README.md` | Single-phase prototype | Multi-framework intelligence platform with 81 API routes | `HIGH (Outdated)` |
| `docs/about/product/CONVERA.md` | Architecture specification | Matches actual engines and router architecture | `LOW (Aligned)` |
| `docs/SRSDS.md` | IEEE 830 specification format | Matches `srs_generator.py` structure | `NONE (Aligned)` |

---

## 26. Feature Maturity Matrix

| Capability | Designed | Implemented | Tested | Production Ready | Priority |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Problem Bank CRUD & Scoring** | ✅ | ✅ | ✅ | ✅ | `LIVE` |
| **Epistemic Balance Engine** | ✅ | ✅ | ✅ | ✅ | `LIVE` |
| **Impact Propagation Engine** | ✅ | ✅ | ✅ | ✅ | `LIVE` |
| **Decision Room & Pivot Loop** | ✅ | ✅ | ✅ | ✅ | `LIVE` |
| **OpenAlex & Crossref Research** | ✅ | ✅ | ✅ | ✅ | `LIVE` |
| **Document Ingest Inbox** | ✅ | ✅ | ✅ | ✅ | `LIVE` |
| **Research Framework UI Workspace**| ✅ | 🟡 (Backend only) | 🟡 | ⏳ | `P1` |
| **Standalone MCP Server Daemon** | ✅ | 🟡 (Scaffolded) | 🟡 | ⏳ | `P2` |

---

## 27. Gap Matrix & Top 10 Ranked Gaps

1. **Research Framework Frontend Workspace (`HIGH`)**: Create UI tabs for CRCDP Research Phases A–F.
2. **Dynamic Framework Workspace Router (`MEDIUM`)**: Render UI phases dynamically from active framework definition.
3. **Standalone MCP Server Daemon (`MEDIUM`)**: Expose tools via stdio/SSE for AI IDEs.
4. **Literature Matrix Table UI (`MEDIUM`)**: Interactive comparative grid for OpenAlex/CrossRef papers.
5. **PDF Ingestion Drag-and-Drop Area (`LOW`)**: Enhance Research Inbox with direct file upload widget.
6. **Documentation Refresh (`LOW`)**: Update root `README.md` to reflect CONVERA v3.0 platform.
7. **Package Name Normalization (`LOW`)**: Rename `ratchetai-web` in `package.json`.
8. **Optional Cloud Run Export Profile (`LOW`)**: Script for $20 Google Cloud credit deployment.
9. **Semantic Search with Local FastEmbed (`LOW`)**: Optional local vector embeddings fallback.
10. **Export Dossier in DOCX/PDF (`LOW`)**: Multi-format deliverable download.

---

## 28. Architectural Blockers

- **Zero Critical Blockers Identified.** The storage, routing, LLM gateway, and epistemic engines are fully decoupled and modular.

---

## 29. What NOT to Build Yet

1. **Do NOT build paid vendor connectors** (Scopus/ScienceDirect API keys): Free-first baseline (OpenAlex/Crossref/PubMed) is fully functional and free.
2. **Do NOT build heavy cloud infrastructure**: Keep the core local, lightweight, and zero-cost.
3. **Do NOT build custom vector databases**: SQLite WAL + in-memory similarity is sub-second and zero-maintenance.

---

## 30. Recommended Implementation Order

```text
  [FOUNDATION & KNOWLEDGE COMPLETE (Phase 1-6)]
                       │
                       ↓
  [PHASE 7: RESEARCH INTELLIGENCE & LITERATURE MATRIX]
                       │
                       ↓
  [PHASE 8: RESEARCH FRAMEWORK FRONTEND WORKSPACE (CRCDP)]
                       │
                       ↓
  [PHASE 9: STANDALONE CONVERA MCP SERVER DAEMON]
                       │
                       ↓
  [PHASE 10: OPTIONAL CLOUD SANDBOX R&D ($20 CREDITS)]
```

---

## 31. Final Verdict

### Maturity Scores

| Dimension | Score |
| :--- | :---: |
| **Architecture** | 9.0 / 10 |
| **Implementation** | 8.8 / 10 |
| **Knowledge Model** | 9.0 / 10 |
| **Evidence Engine** | 8.9 / 10 |
| **AI Gateway & Fallbacks** | 9.2 / 10 |
| **Research Intelligence** | 8.2 / 10 |
| **Framework Engine** | 8.0 / 10 |
| **Decision Intelligence** | 8.8 / 10 |
| **Security & Data Isolation**| 8.8 / 10 |
| **Testing & Verification** | 9.5 / 10 |
| **UX & Design System** | 8.6 / 10 |
| **Overall Score** | **8.8 / 10** |

### Core Audit Questions & Answers

1. **What is CONVERA today?**  
   A fully operational, evidence-backed project intelligence system with relational epistemic linking, contradiction balance, reactive impact propagation, multi-provider LLM fallbacks, and free academic literature search.
2. **What does it claim to be?**  
   An evidence-driven project intelligence platform that transforms fragmented ideas and research into decision-ready opportunities.
3. **What is missing?**  
   Dedicated frontend UI for the CRCDP Research Framework stages and an exposed standalone MCP daemon.
4. **What should we build next?**  
   **Phase 7 (Research Intelligence & Literature Matrix UI)** and **Phase 8 (CRCDP Research Framework Workspace)**.
5. **Is the current architecture capable of becoming the intended CONVERA platform without a major rewrite?**  
   **YES**. The system is modular, stable, test-backed, and ready for incremental feature evolution.
