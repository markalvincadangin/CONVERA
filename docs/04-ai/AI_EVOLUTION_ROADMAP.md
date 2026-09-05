# CONVERA AI EVOLUTION ROADMAP & MULTI-ENGINE CAPABILITY MATRIX

**Document ID**: `CONVERA-AI-006`  
**Classification**: AI Subsystem Evolution Roadmap & Capability Tracking  
**Authority Tier**: Tier 2 (Architectural Roadmap & Current-State Tracking)  
**Status**: 🟢 RATIFIED DRAFT / PENDING HUMAN RATIFICATION  
**Canonical Path**: `docs/04-ai/AI_EVOLUTION_ROADMAP.md`  
**Strategic Upstream**: `CONVERA_UPGRADE.md` (Strategic Evolution Charter)  
**Canonical Upstream**:  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, V, VI, VII, VIII)  
- `docs/04-ai/AI_ARCHITECTURE.md` (`CONVERA-AI-002`)  
- `docs/04-ai/AI_GOVERNANCE.md` (`CONVERA-AI-003`)  
- `docs/02-system/EVIDENCE_MODEL.md`  
- `docs/02-system/DECISION_MODEL.md`  
- SDD Release Baselines (`001`, `002`, `003`, `004`, `005`)  

---

## 1. Executive Summary & Core Doctrine

This document serves as the canonical tracking baseline for evolving CONVERA from an LLM-centric inquiry platform into a governed **Multi-Engine Research Intelligence System**.

It operationalizes the strategic vision defined in `CONVERA_UPGRADE.md` while reconciling it with the actual verified state of the codebase.

```text
CONVERA_UPGRADE.md (Root Strategic Evolution Charter)
         │
         ▼
docs/04-ai/AI_ARCHITECTURE.md (Canonical AI Architecture & LLM Gateway)
         │
         ▼
docs/04-ai/AI_EVOLUTION_ROADMAP.md (Canonical Capability & Roadmap Matrix)
         │
         ▼
Active Codebase (backend/, web/) ── verified against ── Completed SDDs (001–005)
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
| **Test Suite Tiering (74 T1, 44 T2, 12 T3 = 130)** | `[IMPLEMENTED]` | `backend/pyproject.toml` | **SDD-005** | Strict tiering; default test runner runs 100% offline (`-m "not live"`). |
| **Claim-Oriented Evidence Reuse Protocol** | `[IMPLEMENTED]` | `.agents/skills/convera-verification/` | **SDD-005** | Formal change-impact provenance record required for evidence reuse across SDD gates. |
| **Mocking Unmocked Integration Tests (`DEF-DEV-007`)** | `[DEFERRED DEFECT]` | `test_knowledge_graph.py`, `test_srs_generator.py` | **DEF-DEV-007** | Known and recorded. Not automatically authorized for implementation. |
| **Local Lexical Retrieval Engine (BM25 Index)** | `[AUTHORIZED — SDD-006]` | `backend/storage/sqlite_adapter.py`, `backend/connectors/hub.py` | **SDD-006** | Ratified SDD-006: Local SQLite FTS5/BM25 literature persistence & retrieval. |
| **Dense Semantic Embeddings (`sentence-transformers`)**| `[TARGET — NOT YET AUTHORIZED]` | N/A | *Future Scope* | Local dense embeddings for conceptual and contextual similarity. |
| **Local Vector Indexing (FAISS / Vector Store)** | `[TARGET — NOT YET AUTHORIZED]` | N/A | *Future Scope* | High-efficiency local vector similarity search over ingested literature and claims. |
| **Neural / CrossEncoder Reranker** | `[TARGET — NOT YET AUTHORIZED]` | N/A | *Future Scope* | Two-stage reranking between hybrid retrieval candidates and generative prompts. |
| **Embedded Analytical Layer (`DuckDB`)** | `[TARGET — NOT YET AUTHORIZED]` | N/A (SQLite WAL handles all queries) | *Future Scope* | Columnar execution layer for complex aggregations, cross-project portfolio trends. |
| **Statistical / Time-Series Anomaly Detection** | `[PROPOSED]` | N/A | *Future Scope* | Quantitative statistical distributions, frequency trend analysis. |
| **Classical Machine Learning Models (`scikit-learn`)**| `[PROPOSED]` | N/A | *Future Scope* | Specialized lightweight classification and clustering models. |
| **Unified Intelligence Request Orchestrator** | `[TARGET — NOT YET AUTHORIZED]` | N/A (Individual routers call engines) | *Future Scope* | Centralized capability-based router delegating tasks to specific engines. |

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
   - Mechanically reconciled 130 tests (74 Unit, 44 Integration, 12 Live).
   - 100% offline default verification (`-m "not live"`).
   - Claim-Oriented Evidence Reuse Model with mandatory Change-Impact Evidence Provenance Records.

---

### 4.2 What Is Authorized Today (`[AUTHORIZED]`)
- **Currently Active Scope**: **SDD-006** (*Scholarly Evidence Persistence & Native Lexical Retrieval (SQLite FTS5 / BM25)*) is formally ratified and authorized for implementation.
- SDD-005 is deployed and closed at commit `dac0f0f`.
- Implementation branch: `feature/006-scholarly-evidence-persistence-fts5` (branched from `develop`).

---

### 4.3 What Is Merely Planned or Proposed (`[TARGET]` / `[PROPOSED]`)
1. **Dense Vector Embeddings & Neural Reranking**:
   - Dense vector embeddings (`sentence-transformers`) + FAISS vector indexing + CrossEncoder reranking.
   - *Status*: `[TARGET — NOT YET AUTHORIZED]`. Evaluated during SDD-006 discovery and deferred under Article VII (Anti-Creep Law); subject to future evaluation post-SDD-006.
2. **Offline Test Optimization (`DEF-DEV-007`)**:
   - Mocking unmocked LLM egress in `test_knowledge_graph.py` and `test_srs_generator.py` to reduce offline runtime from ~91s to ~4.5s.
   - *Status*: `[DEFERRED DEFECT]`. Known and recorded. Not automatically authorized for implementation; must enter discovery/specification under anti-creep rules unless direct remediation is explicitly authorized.
3. **Statistical / Analytical Layer (DuckDB)**:
   - Columnar execution for portfolio-wide aggregations and trends.
   - *Status*: `[TARGET — NOT YET AUTHORIZED]`. Subject to demonstrated workload need (Article VII / Anti-Creep Rule).
4. **Unified Intelligence Orchestrator**:
   - Centralized task classifier routing requests dynamically to Deterministic, Retrieval, Analytics, ML, or LLM engines.
   - *Status*: `[TARGET — NOT YET AUTHORIZED]`. Architectural target to be introduced once multiple non-LLM engines exist.
5. **Specialized Machine Learning (`scikit-learn`)**:
   - Non-generative classification, clustering, or named-entity recognition.
   - *Status*: `[PROPOSED]`. Under exploratory review.

---

## 5. Architectural Alignment & Governance Constraints

1. **Hierarchy Integrity**:
   - `CONVERA_UPGRADE.md` remains the strategic evolution charter at the workspace root.
   - `docs/04-ai/AI_EVOLUTION_ROADMAP.md` is the canonical current-state tracking artifact.
   - SDD specifications are created only when a specific milestone is authorized for discovery and implementation.
2. **No Automatic SDD Number Assignment**:
   - Future architectural upgrades must NOT be pre-assigned SDD numbers (e.g. "SDD-006", "SDD-007") until human authorization is formally granted.
   - Next candidate initiatives must begin with formal Discovery Authorization.
3. **Anti-Creep Law**:
   - No technology candidate (BM25, FAISS, Sentence Transformers, DuckDB, scikit-learn) shall be adopted without an established problem, compatibility analysis, benchmark, and ratified SDD specification.
