# CONVERA AI EVOLUTION ROADMAP & MULTI-ENGINE CAPABILITY MATRIX

**Document ID**: `CONVERA-AI-006`  
**Classification**: AI Subsystem Evolution Roadmap & Capability Tracking  
**Authority Tier**: Tier 2 (Architectural Roadmap & Current-State Tracking)  
**Status**: 🟢 RATIFIED DRAFT / PENDING HUMAN RATIFICATION  
**Canonical Path**: `docs/04-ai/AI_EVOLUTION_ROADMAP.md`  
**Strategic Upstream**:  
- `docs/00-foundation/IDENTITY.md` (`CONVERA-FND-005` — Core System Identity & Boundaries)  
- `docs/01-product/CONVERA_UPGRADE_CHARTER.md` (Strategic Evolution Charter)  
- `convera_revised_roadmap.md` (Ratified Phased Execution Roadmap)  
**Canonical Upstream**:  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, V, VI, VII, VIII)  
- `docs/04-ai/AI_ARCHITECTURE.md` (`CONVERA-AI-002`)  
- `docs/04-ai/AI_GOVERNANCE.md` (`CONVERA-AI-003`)  
- `docs/02-system/EVIDENCE_MODEL.md`  
- `docs/02-system/DECISION_MODEL.md`  
- SDD Release Baselines (`001`–`020`)  

---

## 1. Executive Summary & Core Doctrine

This document serves as the canonical tracking baseline for evolving CONVERA from an LLM-centric inquiry platform into a governed **Multi-Engine Research Intelligence System**.

It operationalizes the strategic vision defined in `docs/01-product/CONVERA_UPGRADE_CHARTER.md` while reconciling it with the actual verified state of the codebase.

```text
docs/01-product/CONVERA_UPGRADE_CHARTER.md (Strategic Evolution Charter)
         │
         ▼
docs/04-ai/AI_ARCHITECTURE.md (Canonical AI Architecture & LLM Gateway)
         │
         ▼
docs/04-ai/AI_EVOLUTION_ROADMAP.md (Canonical Capability & Roadmap Matrix)
         │
         ▼
Active Codebase (backend/, web/) ── verified against ── Completed SDDs (001–020)
```

### The Core Operating Doctrine: "LLM Last, Not LLM First"
For every intelligence responsibility across the platform, mechanisms must be evaluated and selected according to this strict hierarchy:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                 INTELLIGENCE SELECTION ORDER OF PRECEDENCE              │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Can deterministic logic solve it?                                   │
│     └─► YES: Use pure formulas, rules, constraints, or total ordering.   │
│  2. If no: Can retrieval/search solve it?                               │
│     └─► YES: Use lexical, semantic, or federated search.                │
│  3. If no: Can statistics or classical analytics solve it?              │
│     └─► YES: Use statistical testing, distributions, or aggregations.    │
│  4. If no: Can a specialized lightweight ML model solve it?             │
│     └─► YES: Use dedicated classification, clustering, or NER models.   │
│  5. If no: Use a Generative Large Language Model (LLM).                 │
│     └─► Restricted to qualitative synthesis, explanation, & reasoning.  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Statement Classification Framework

To maintain strict epistemic discipline and avoid claiming unbuilt capabilities as existing architecture, all capabilities in this roadmap adhere to four normative markers:

| Marker | Definition | Verification Standard |
| :--- | :--- | :--- |
| **`[IMPLEMENTED]`** | Fully built, runtime-verified, and present in the active codebase. | Verified by passing tests and code inspection. |
| **`[AUTHORIZED]`** | Formally approved for implementation under an authorized SDD specification. | Ratified SDD specification dossier exists. |
| **`[TARGET — NOT YET AUTHORIZED]`** | Strategically desired architectural capability on the horizon. | Awaits discovery and human authorization. |
| **`[PROPOSED]`** | Candidate technology or concept under exploratory evaluation. | Subject to demonstrated need and trade-off audit. |

---

## 3. Master Multi-Engine Capability Matrix

The following matrix represents the reconciled ground-truth state of CONVERA's intelligence capabilities:

| Subsystem / Capability | Classification | Current Code Reference | SDD / Authority | Ground-Truth Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Vendor-Agnostic LLM Provider Abstraction** | `[IMPLEMENTED]` | `backend/llm_gateway.py:433` | **SDD-003** | `BaseLLMProvider` isolates domain logic from individual vendor SDKs. |
| **Cloud LLM Providers (Gemini, Groq, OpenRouter)** | `[IMPLEMENTED]` | `backend/llm_gateway.py:472-764` | **SDD-003** | Concrete providers for Gemini, Groq, and OpenRouter with cooldowns and rate-limit tracking. |
| **Local LLM Provider (`OllamaProvider`)** | `[IMPLEMENTED]` | `backend/llm_gateway.py:767-775` | **SDD-003** | Implemented as `BaseOpenAICompatibleProvider` (`http://localhost:11434/v1`, default model `llama3.2`). |
| **Specialized API Providers (Cerebras, GitHub)** | `[IMPLEMENTED]` | `backend/llm_gateway.py:777-800` | **SDD-003** | Registered in provider registry (`BaseOpenAICompatibleProvider`). |
| **Multi-Provider Fallback Cascade Engine** | `[IMPLEMENTED]` | `backend/llm_gateway.py:900-1120`| **SDD-003** | Configurable fallback order across primary, secondary, and tertiary providers. |
| **Truthful Synthetic Fallback (`weight = 0`)** | `[IMPLEMENTED]` | `backend/llm_gateway.py:801-860` | **SDD-003** | Sets `is_degraded = True`, `is_evidentiary = False`, `evidence_tier = "SYNTHETIC"`. |
| **Runtime Provenance Capture (`GatewayResult`)** | `[IMPLEMENTED]` | `backend/llm_gateway.py:98-135` | **SDD-003** | Captures provider, model, latency_ms, tokens, error, and fallback history. |
| **Deterministic Candidate Scoring Formula** | `[IMPLEMENTED]` | `backend/engines/decision_engine.py:102-208`| **SDD-004** | Formula: $0.40 \times S_{\text{rubric}} + 0.35 \times S_{\text{epistemic}} + 0.25 \times S_{\text{impact}} - R_{\text{assumptions}}$. |
| **Deterministic 4-Tier Tie-Breaking Hierarchy** | `[IMPLEMENTED]` | `backend/engines/decision_engine.py:265-330`| **SDD-004** | Ties broken strictly: Composite $\rightarrow$ Epistemic $\rightarrow$ Impact $\rightarrow$ Lexicographical ID. |
| **Immutable Winner Invariant (`llm_cannot_override_winner`)** | `[IMPLEMENTED]` | `backend/engines/decision_engine.py:450-490`| **SDD-004** | Post-processing assertion overrides any LLM attempts to crown non-deterministic winners. |
| **Closed-Loop Decision Invalidation (`execute_pivot_loop`)** | `[IMPLEMENTED]` | `backend/engines/decision_engine.py:516-565`| **SDD-004** | Invalidated assumptions update candidate status and record structured rationale. |
| **Federated External Academic Connectors** | `[IMPLEMENTED]` | `backend/connectors/hub.py` | **Phase 1 / SDD-002**| Normalized connectors for OpenAlex, Crossref, PubMed, Europe PMC, Semantic Scholar. |
| **Test Suite Tiering (316 offline tests)** | `[IMPLEMENTED]` | `backend/pyproject.toml` | **SDD-005** | Strict tiering; default test runner runs 100% offline (`-m "not live"`). |
| **Claim-Oriented Evidence Reuse Protocol** | `[IMPLEMENTED]` | `.agents/skills/convera-verification/` | **SDD-005** | Formal change-impact provenance record required for evidence reuse across SDD gates. |
| **Mocking Unmocked Integration Tests (`DEF-DEV-007`)** | `[DEFERRED DEFECT]` | `test_knowledge_graph.py`, `test_srs_generator.py` | **DEF-DEV-007** | Known and recorded. Not automatically authorized for implementation. |
| **Methodology Contract Architecture** | `[IMPLEMENTED]` | `backend/routers/methodologies.py`, `backend/services/methodology_contract.py` | **SDD-011** | Declarative framework-agnostic research stages, required inputs/outputs, and validation contracts. |
| **Tool Integrations & Progressive Identity** | `[IMPLEMENTED]` | `backend/routers/integrations.py`, `backend/models/integration.py` | **SDD-012** | External tool capability registry and progressive identity tracking. |
| **Scholarly Evidence Persistence (FTS5/BM25)** | `[IMPLEMENTED]` | `backend/storage/sqlite_adapter.py` | **SDD-006** | SQLite FTS5 full-text search with BM25 ranking over ingested literature. |
| **Source-Mediated Epistemic Bridge** | `[IMPLEMENTED]` | `backend/connectors/hub.py`, `backend/engines/evidence_scorer.py` | **SDD-007** | Evidence → claims → decisions end-to-end provenance chain. |
| **Research Orchestration Engine** | `[IMPLEMENTED]` | `backend/services/research_orchestrator.py`, `backend/routers/orchestrator.py` | **SDD-013** | Centralized intelligence routing: Understand → Contextualize → Investigate → Critique → Decide → Act. |
| **Research Cockpit UI** | `[IMPLEMENTED]` | `web/src/components/research/cockpit/` | **SDD-014** | Multi-panel research workspace with stage stepper and artifact panels. |
| **Scholarly Ingestion Connectors (CIIA)** | `[IMPLEMENTED]` | `backend/connectors/hub.py`, `backend/connectors/contracts/` | **SDD-015** | Pluggable connector contracts with OpenAlex, Crossref, PubMed, Europe PMC, Semantic Scholar. |
| **Structured DSR Artifact Ideation Engine** | `[IMPLEMENTED]` | `backend/engines/ideation_engine.py`, `backend/routers/ideation.py` | **SDD-016** | 4 DSR artifact formulation: Title, Objectives, Conceptual Framework, Methodology skeleton. |
| **Concept Evaluation Framework** | `[IMPLEMENTED]` | `backend/engines/concept_evaluation_engine.py`, `backend/routers/evaluation.py` | **SDD-017** | Deterministic multi-criteria concept scoring with rubric matrix evaluation. |
| **Research Stage F Feasibility Engine** | `[IMPLEMENTED]` | `backend/engines/feasibility_engine.py`, `backend/routers/feasibility.py` | **SDD-018** | Feasibility scoring, compliance audit, budget estimation, and Gate 4 proposal canvas. |
| **Cross-Stage Research Critique & Blind-Spot Engine** | `[IMPLEMENTED]` | `backend/engines/cross_stage_critique_engine.py`, `backend/routers/critique.py` | **SDD-019** | Heuristic tension detection, adversarial critique, deterministic consistency scoring. |
| **DSR Deliverable & Comprehensive Proposal Export** | `[IMPLEMENTED]` | `backend/engines/proposal_exporter.py`, `backend/routers/export.py` | **SDD-020** | Multi-format (Markdown, LaTeX, HTML) proposal export with SHA-256 provenance hash. |
| **Dense Semantic Embeddings (`sentence-transformers`)**| `[TARGET — NOT YET AUTHORIZED]` | N/A | *Future Scope* | Local dense embeddings for conceptual and contextual similarity. |
| **Local Vector Indexing (FAISS / Vector Store)** | `[TARGET — NOT YET AUTHORIZED]` | N/A | *Future Scope* | High-efficiency local vector similarity search over ingested literature and claims. |
| **Neural / CrossEncoder Reranker** | `[TARGET — NOT YET AUTHORIZED]` | N/A | *Future Scope* | Two-stage reranking between hybrid retrieval candidates and generative prompts. |
| **Embedded Analytical Layer (`DuckDB`)** | `[TARGET — NOT YET AUTHORIZED]` | N/A (SQLite WAL handles all queries) | *Future Scope* | Columnar execution layer for complex aggregations, cross-project portfolio trends. |
| **Statistical / Time-Series Anomaly Detection** | `[PROPOSED]` | N/A | *Future Scope* | Quantitative statistical distributions, frequency trend analysis. |
| **Classical Machine Learning Models (`scikit-learn`)**| `[PROPOSED]` | N/A | *Future Scope* | Specialized lightweight classification and clustering models. |

---

## 4. Current State Reconciliation: What CONVERA Has Today

To clearly answer the governance question:

### 4.1 What CONVERA Actually Has Today (`[IMPLEMENTED]`)
1. **Governed Multi-Provider LLM Gateway**:
   - Resilient multi-provider abstraction supporting Gemini, Groq, Cerebras, GitHub, OpenRouter, and local Ollama.
   - Automatic cascade on 429 rate limits, 503 outages, or timeouts.
   - Synthetic fallback with zero epistemic weight (`is_degraded = True`, `is_evidentiary = False`).
   - Full runtime metadata and provenance tracking per request.
2. **Deterministic Research Decision Intelligence**:
   - Inverted Architecture: All problem rankings and composite scores are calculated with pure deterministic math before any LLM is invoked.
   - Ratified Scoring Formula:
     $$S_{\text{composite}} = 0.40 \times S_{\text{rubric}} + 0.35 \times S_{\text{epistemic}} + 0.25 \times S_{\text{impact}} - R_{\text{assumptions}}$$
   - 4-Tier Tie-Breaking Algorithm (Composite $\rightarrow$ Epistemic $\rightarrow$ Impact $\rightarrow$ Lexicographical Problem ID).
   - Invariant Post-Assertion: The deterministic winner is immutable; LLMs are restricted strictly to narrative explanations and qualitative pros/risks.
   - Closed-loop evidence invalidation (`execute_pivot_loop`).
3. **Federated External Connectors**:
   - Normalized connectors for OpenAlex, Crossref, PubMed, Europe PMC, and Semantic Scholar with deduplication in `ConnectorHub`.
4. **Governed Development & Verification Environment**:
   - Reconciled 316 passing tests across unit, integration, contract, and workflow safety suites.
   - 100% offline default verification (`-m "not live"`).
   - Claim-Oriented Evidence Reuse Model with mandatory Change-Impact Evidence Provenance Records.
5. **Methodology Contract Architecture (SDD-011)**:
   - Declarative methodology framework defining stages, required inputs, allowed actions, outputs, and validation rules (`backend/services/methodology_contract.py`, `backend/routers/methodologies.py`).
   - Dynamic UI pipeline stepper adapting to active contract without page reload (`web/src/lib/contracts/methodology.ts`, `web/src/components/frameworks/WorkspaceRegistry.tsx`).
6. **Tool Integrations Framework (SDD-012)**:
   - Registered tool capabilities and progressive identity state management (`backend/routers/integrations.py`, `backend/models/integration.py`).
   - Foundation for external ecosystem orchestration (Notion, Zotero, GitHub).
7. **Scholarly Evidence Persistence & Lexical Retrieval (SDD-006)**:
   - SQLite FTS5 full-text index with BM25 ranking over ingested academic literature.
   - Deduplication and persistence layer in `backend/storage/sqlite_adapter.py`.
8. **Source-Mediated Epistemic Bridge (SDD-007)**:
   - End-to-end provenance chain: evidence → claims → decisions.
   - Evidence scoring and freshness assessment (`backend/engines/evidence_scorer.py`, `backend/engines/freshness_engine.py`).
9. **Unified Research Orchestration Engine (SDD-013)**:
   - Centralized action-dispatch loop: `EXECUTE_SEARCH`, `EXECUTE_IDEATION`, `EVALUATE_CONCEPT`, `EXECUTE_FEASIBILITY`, `EXECUTE_CRITIQUE`, `COMPILE_PROPOSAL_CANVAS`, `EXPORT_PROPOSAL`.
   - Full audit trail with timestamped action history (`backend/services/research_orchestrator.py`).
10. **Research Cockpit UI (SDD-014)**:
    - Multi-panel workspace with stage stepper, artifact panels, and real-time orchestrator feedback.
    - TypeScript service layer (`web/src/services/orchestratorService.ts`) driving reactive UI.
11. **Scholarly Ingestion Connectors & CIIA Framework (SDD-015)**:
    - Pluggable connector architecture with normalized contracts.
    - Five production connectors: OpenAlex, Crossref, PubMed, Europe PMC, Semantic Scholar.
12. **DSR Artifact Ideation & Structured Research Intelligence (SDD-016, 017)**:
    - Structured ideation engine producing 4 DSR artifacts (SDD-016).
    - Deterministic multi-criteria concept evaluation with rubric matrix (SDD-017).
13. **Research Stage F, Critique & Export Pipeline (SDD-018, 019, 020)**:
    - Stage F feasibility engine with compliance audit, budget estimation, and Gate 4 proposal canvas (SDD-018).
    - Cross-stage critique engine with blind-spot detection and adversarial analysis (SDD-019).
    - Multi-format proposal export (Markdown, LaTeX, HTML) with SHA-256 provenance (SDD-020).
14. **Research Session Persistence & Resume Engine (SDD-021)**:
    - Deterministic session serialization with cryptographic SHA-256 state hashing and tamper detection (`backend/engines/session_state_engine.py`).
    - SQLite WAL relational checkpointing via Table 37 `research_session_checkpoints` and additive column migration (`backend/storage/sqlite_adapter.py`).
    - RESTful session portfolio management and resume endpoints (`backend/routers/research_sessions.py`).
    - CCDS v2.0 UI components: `ResearchSessionDrawer`, `SessionCheckpointModal`, and `SessionResumeBanner` (`web/src/components/research/sessions/`).
15. **Interactive Evidence Chain Visualization & Provenance Graph Engine (SDD-022)**:
    - Multi-tier epistemic DAG engine across 6 epistemic tiers (Tier 0: Literature, Tier 1: Claims, Tier 2: Assumptions, Tier 3: DSR Artifacts, Tier 4: Concept Evaluations, Tier 5: Feasibility & Canvas) (`backend/engines/provenance_graph_engine.py`).
    - Evidentiary edge semantics (`SUPPORTS`, `CONTRADICTS`, `EXTENDS`, `DERIVES`, `GROUNDS`, `EVALUATES`, `SYNTHESIZES`) with adversarial contradiction flags and SHA-256 state hashing.
    - FastAPI provenance router with `/graph`, `/node/{node_id}`, and `/export/{session_id}` (`backend/routers/provenance.py`).
    - Native SVG interactive DAG canvas with Sugiyama-style layered column layout, cubic Bézier curved connectors, pan/zoom, node cards, and slide-out node inspector (`web/src/components/research/provenance/`).
    - Research Cockpit and Session Resume Banner integration with JSON export.

---

### 4.2 What Is Authorized Today (`[AUTHORIZED]` / Critical Path)
- **All SDD-001 through SDD-022 are IMPLEMENTED and CLOSED.**
- Baseline regression test suite expanded to **331 offline tests** (100% passing).
- Phase D2 (End-to-End Research Loop Hardening) is completely delivered.
- Next candidate SDDs require formal Discovery Authorization under Article VII (Anti-Creep Law).

---

### 4.3 What Is Merely Planned or Proposed (`[TARGET]` / `[PROPOSED]`)
1. **Phase D2: End-to-End Research Loop Hardening**:
   - Research session persistence & resume across browser sessions (`[IMPLEMENTED — SDD-021]`).
   - Evidence chain visualization (interactive provenance graph) (`[IMPLEMENTED — SDD-022]`).
   - *Status*: Phase D2 complete. Both SDD-021 and SDD-022 delivered with 0 new dependencies.
2. **Dense Vector Embeddings & Neural Reranking**:
   - Dense vector embeddings (`sentence-transformers`) + FAISS vector indexing + CrossEncoder reranking.
   - *Status*: `[TARGET — NOT YET AUTHORIZED]`. Evaluated during SDD-006 discovery and deferred under Article VII (Anti-Creep Law); subject to future evaluation.
3. **Statistical / Analytical Layer (DuckDB)**:
   - Columnar execution for portfolio-wide aggregations and trends.
   - *Status*: `[TARGET — NOT YET AUTHORIZED]`. Subject to demonstrated workload need (Article VII / Anti-Creep Rule).
4. **Specialized Machine Learning (`scikit-learn`)**:
   - Non-generative classification, clustering, or named-entity recognition.
   - *Status*: `[PROPOSED]`. Under exploratory review.

---

## 5. Architectural Alignment & Governance Constraints

1. **Hierarchy Integrity**:
   - `docs/01-product/CONVERA_UPGRADE_CHARTER.md` remains the strategic evolution charter in Layer 01.
   - `docs/04-ai/AI_EVOLUTION_ROADMAP.md` is the canonical current-state tracking artifact.
   - SDD specifications are created only when a specific milestone is authorized for discovery and implementation.
2. **No Automatic SDD Number Assignment**:
   - Future architectural upgrades must NOT be pre-assigned SDD numbers (e.g. "SDD-006", "SDD-007") until human authorization is formally granted.
   - Next candidate initiatives must begin with formal Discovery Authorization.
3. **Anti-Creep Law**:
   - No technology candidate (BM25, FAISS, Sentence Transformers, DuckDB, scikit-learn) shall be adopted without an established problem, compatibility analysis, benchmark, and ratified SDD specification.
