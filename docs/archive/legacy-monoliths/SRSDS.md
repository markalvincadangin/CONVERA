> [!WARNING]
> **SUPERSEDED / HISTORICAL BASELINE SPECIFICATION**
> This document is an early monolithic Software Requirements & System Design Specification.
> It has been **fully superseded and expanded** by the canonical ratified modular suites:
> - Product & Capabilities: [`docs/01-product/PRODUCT_DEFINITION.md`](01-product/PRODUCT_DEFINITION.md) & [`docs/01-product/CAPABILITIES.md`](01-product/CAPABILITIES.md)
> - System & Domain Model: [`docs/02-system/SYSTEM_ARCHITECTURE.md`](02-system/SYSTEM_ARCHITECTURE.md) & [`docs/02-system/DOMAIN_MODEL.md`](02-system/DOMAIN_MODEL.md)
> - CIIA & AI Architecture: [`docs/04-ai/CIIA.md`](04-ai/CIIA.md) & [`docs/04-ai/AI_ARCHITECTURE.md`](04-ai/AI_ARCHITECTURE.md)
> - Database Schema: [`docs/05-data/DATABASE_SCHEMA.md`](05-data/DATABASE_SCHEMA.md)
>
> In accordance with **Constitution Article VII (Documentation Authority)**, the ratified modular documents take absolute precedence.


---

# Software Requirements & System Design Specification (SRSDS)

**Project:** CONVERA — Evidence-Driven Project Intelligence and Multi-Methodology Validation System  
**Parent Brand:** EMAERX (Technology and Innovation Team)  
**Governing Baseline:** [CONVERA Master Architecture Specification (v1.0)](./CONVERA_MASTER_ARCHITECTURE.md)  
**Standard:** CONVERA Concept Development Standard (CCDS v2.0) / IEEE 830 / ISO/IEC/IEEE 29148 / IEEE 1016-2009 / CHED CICT Standards  
**Version:** 4.1.0 (Dual-Track Venture & DSR Computing Research Platform, 23 Relational Tables, CIIA Hub, Standalone MCP)  
**Status:** Approved / Production Verified  
**Last Updated:** September 4, 2026  

---

## 1. Executive Summary & Brand Identity

### 1.1 Brand Identity & Purpose
**CONVERA** is an **Evidence-Driven Project Intelligence System** developed by **EMAERX**.

- **Brand Tagline:** *WHERE POSSIBILITIES CONVERGE INTO DIRECTION.*
- **Brand Philosophy:** Meaningful innovation and scientific discovery begin by exploring what is not yet understood. CONVERA brings fragmented ideas, research, AI outputs, assumptions, and field evidence together until a team can identify a direction that is empirically justified to pursue.
- **Founders:** Mark Alvin, Mae Daniella Faith, John Emmanuel (EMAERX).

### 1.2 Core Problem Solved
Student technopreneurship teams and computing research candidates suffer from **information fragmentation** and **premature solutioning**. Ideas generated across AI chats, group chats, documents, spreadsheets, and personal notes are lost or debated without evidence. CONVERA bridges the **problem-to-decision gap** by organizing, validating, and translating raw ideas into decision-ready project opportunities.

### 1.3 The Mechanical Ratchet & Dual-Track Governance
CONVERA enforces two distinct, non-interfering methodological tracks across normalized relational storage:

1. **🚀 Innovation & Venture Track (Phases 1–5 & 2 Quality Gates):**
   - **Phase 1 (Discovery):** Regional breadth discovery and Socratic problem interrogation.
   - **Phase 2 (Screening & Gate 1):** Multi-candidate evaluation matrix and Decision Room commitment.
   - **Phase 3 (Validation & Gate 2):** 6-level Socratic Mom Test clinic, customer interview evidence, and pivot loops.
   - **Phase 4 (Ideation):** 15-mechanism concept design and architectural mapping.
   - **Phase 5 (MVP Audit):** Skin-in-the-game commitment verification and prototype milestones.

2. **🔬 Computing Research DSR Track (Stages A–F & 4 Quality Gates):**
   - **Stage A (Scouting & Domains):** 25 Master Computing Domains (`D01`–`D25`), Custom Domain Creator, and AI Empirical Generator.
   - **Stage B (Gate 1 Validation):** Problem Bank stage anchoring, Bordens & Abbott grounding triage, and falsification criteria.
   - **Stage C (Literature Matrix & Gate 2):** Federated multi-database matrix synthesis (OpenAlex, Crossref, PubMed, Semantic Scholar) and AI-assisted gap discrimination.
   - **Stage D (Protocol Formulation):** Empirical metrics operationalization, dataset instrumentation, and experimental controls.
   - **Stage E (Artifact Construction & Gate 3):** Technical architecture specification and telemetry integration.
   - **Stage F (Evaluation & Gate 4):** Statistical significance benchmarking and defense readiness sign-off.

---

## 2. System Architecture & Component Model

CONVERA employs a decoupled **5-Tier Hybrid Architecture**:

```text
========================================================================================
                          CONVERA PLATFORM ARCHITECTURE (v4.1)
========================================================================================

                 [ Web Frontend: Next.js 15 / React 19 / Tailwind ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
[ Innovation Track (Phases 1-5) ]                      [ Research Track (Stages A-F) ]
- Breadth Discovery & Socratic Interrogation           - Stage A Scouting & Problem Bank
- SVB Ideation & Skin-in-the-game MVP                  - Stage C Lit Matrix & Gap Analysis
- Unknowns Map & Traceability Drawer                   - Gates 1-4 Modals & Circumscription
        │                                                                 │
        └────────────────────────────────┬────────────────────────────────┘
                                         │ (REST API via fetchApi)
                                         ▼
                            [ FastAPI Application Server ]
                                         │
    ┌────────────────────────────────────┼────────────────────────────────────┐
    │                                    │                                    │
    ▼                                    ▼                                    ▼
[ Domain Routers (15) ]         [ Domain Engines (25) ]             [ CIIA Subsystem ]
- pipeline.py                   - knowledge_lifecycle.py            - llm_gateway.py (3-tier cascade)
- knowledge.py                  - provenance_engine.py              - research_client.py
- research.py                   - freshness_engine.py               - connectors/ (OpenAlex, Crossref,
- decisions.py                  - contradiction_engine.py             PubMed, Semantic Scholar)
- evaluation.py                 - unknowns_engine.py                - mcp_server.py (JSON-RPC stdio)
- gates.py                      - impact_engine.py
- export.py                     - evaluation_engine.py
- traceability.py               - gate_engine.py
- sessions.py                   - circumscription_engine.py
- frameworks.py                 - proposal_exporter.py
- inbox.py                      - literature_matrix.py
    │                                    │                                    │
    └────────────────────────────────────┼────────────────────────────────────┘
                                         │
                                         ▼
                         [ BaseStorageAdapter Interface ]
                                         │
                                         ▼
                      [ SQLiteStorageAdapter (WAL Mode) ]
                      - 23 Normalized Relational Tables
```

---

## 3. Data Model Specification (23 Relational SQLite WAL Tables)

The underlying storage layer is governed by `BaseStorageAdapter` and implemented in `SQLiteStorageAdapter` across **23 normalized relational tables**:

```text
1. projects                      - Multi-tenant workspace entities, share codes, and passcodes.
2. project_members              - User profiles, roles (Leader, Researcher, Advisor), and avatars.
3. sessions                     - Active workflow sessions, framework selection, and progress flags.
4. session_snapshots            - Checkpoint snapshots for state rollback.
5. problems                     - Problem briefs, pain quantification, sector categories, and scores.
6. problem_sources              - Direct literature citations and empirical field notes.
7. problem_phase_history        - Audit log of problem state changes across workflow phases.
8. problem_claims               - Epistemic claims and confidence ratings.
9. problem_assumptions          - Extracted business, technical, and methodological assumptions.
10. problem_alternatives        - Generated concept alternatives and mechanism variants.
11. decision_records            - Immutable rationale, selected options, and rejected alternatives.
12. problem_comments            - Threaded peer and mentor discussions.
13. mentor_signoffs             - Committee and advisor formal gate sign-offs.
14. claim_evidence_links        - Epistemic edges linking claims to sources (SUPPORTS, CONTRADICTS).
15. assumption_validation_tests - Empirical experiments, test parameters, and results.
16. impact_invalidation_events  - Downstream blast-radius invalidation notifications.
17. evidence_provenance         - Source provenance metadata, extraction models, and verification status.
18. claim_contradictions        - Paired conflicting evidence relations triggering CONTESTED state.
19. project_unknowns            - 3-tier triangulation (What We Know, Think, Don't Know).
20. requirements_traceability   - Multi-hop requirement-to-evidence lineage records.
21. gate_reviews                - Formal rubric reviews and committee sign-offs for Gates 1–4.
22. research_domains            - 25 Master Computing Domains (D01–D25) + Custom user domains.
23. circumscription_iterations  - DSR evaluation failure loopback records.
```

---

## 4. CIIA (Central Intelligence & Integration Architecture)

### 4.1 3-Tier Provider Cascade
- **Primary:** Google Gemini 2.5 / 3.x Flash (`gemini-2.5-flash`, `gemini-3.5-flash`).
- **Secondary Fallback:** Groq Cloud (`llama-3.3-70b-versatile`, `openai/gpt-oss-120b`).
- **Local Fallback:** Ollama Local Inference (`localhost:11434`, `llama3:8b`).

### 4.2 Federated Scholarly Connector Hub
- **OpenAlex Connector:** Millions of open-access papers, citation graphs, and topic concepts.
- **Crossref Connector:** Authoritative DOI resolution and publisher metadata.
- **PubMed Connector:** NCBI biomedical research search and PMID resolution.
- **Semantic Scholar Connector:** Computer science academic graph and influential citation counts.

### 4.3 Model Context Protocol (MCP) Subsystem
- Standalone stdio server (`backend/mcp_server.py`) exposing 7 structured tools:
  1. `convera_query_knowledge`
  2. `convera_query_unknowns`
  3. `convera_query_decisions`
  4. `convera_calibrate_confidence`
  5. `convera_discriminate_gap`
  6. `convera_trace_requirement`
  7. `convera_search_literature`

---

## 5. Non-Negotiable Governance Invariants

1. **Knowledge $
eq$ Workflow:** Canonical knowledge records persist across framework switches.
2. **AI Confidence $
eq$ Evidence Strength $
eq$ Decision Confidence:** Epistemic dimensions are strictly decoupled.
3. **100% Free-First:** Zero mandatory paid subscriptions required for operation.
4. **Immutable Audit Trail:** Decisions and gate reviews cannot be silently deleted or altered.
