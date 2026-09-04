# CONVERA SDD-001: Development Foundation Specification

**Specification ID**: `CONVERA-SDD-001`  
**Title**: CONVERA Development Foundation  
**Classification**: Foundational Development & Governance Baseline  
**Authority Tier**: Tier 2 Procedural / Development Specification  
**Status**: 🟢 REVIEW & RECONCILIATION COMPLETE (CONDITIONALLY READY)  
**Directory**: `specs/001-convera-development-foundation/`  
**Preferred Branch**: `feature/001-convera-development-foundation`  
**Upstream Authority**: `docs/00-foundation/CONSTITUTION.md` (Articles I–VIII)  
**Downstream Dependents**: All future SDD features (`specs/002-*` through `specs/NNN-*`)  

---

## 1. Executive Mission & Scope

`CONVERA-SDD-001` establishes the foundational development environment, repository topology, specification infrastructure, testing harnesses, and governance baselines required for CONVERA's **Spec-Driven Agentic Development (SDD)** lifecycle.

This specification does not represent generic engineering hygiene. It defines the formal contract governing:
1. The **Repository Topology & Monorepo Infrastructure** (`backend/`, `web/`, `docs/`, `specs/`, `.specify/`, `.agents/`).
2. The **Verified Technology Baseline** (Python 3.12.2, FastAPI, Next.js 15.2.0, React 19, TypeScript 5.8, Tailwind CSS 4, SQLite WAL).
3. The **9-Layer Modular Documentation Architecture** (`docs/00-foundation/` through `docs/08-operations/`).
4. The **Physical Persistence Tier** (23 SQLite WAL relational tables).
5. The **AI & Scholarly Connector Baseline** (Multi-provider gateway, response sanitization, 5 scholarly data sources).
6. The **Dual-Track Epistemic Foundation** (Innovation Track Phases 1–5, Research Track Stages A–F & DSR Circumscription).
7. The **Development Security & Profile Boundaries** (Local/Lab development profile, client security contracts, explicit target classifications).
8. The **Git Workflow & Promotion Lifecycle** (`feature/*` → `develop` → `main`).

---

## 2. Non-Negotiable Epistemic Classifications

Every requirement, statement, and capability in SDD-001 is categorized under one of four epistemic classes:

```text
[NORMATIVE]    - Binding requirement derived from the Constitution or ratified specifications.
[IMPLEMENTED]  - Observable, verified behavior present in active repository source code.
[TARGET]       - Specified architectural objective not yet implemented or verified in runtime.
[VERIFICATION] - Repeatable, documented verification procedure or test execution evidence.
```

### Mandatory Invariant Distinctions
* **Specified ≠ Implemented**: Architectural doctrine in documentation does not constitute working code.
* **Implemented ≠ Verified**: Existing code does not constitute proven correctness until verified by executable tests.
* **Verified ≠ Ratified**: Automated test passes do not constitute human authorization or formal ratification.
* **Provider Support ≠ Provider Fallback**: Supporting `LLM_PROVIDER=ollama` does not equal automatic cloud-to-local failover cascades.
* **Lineage / History ≠ Backup / Disaster Recovery**: SQLite immutable audit tables do not equal point-in-time disaster recovery pipelines.
* **Agent Recommendation ≠ Human Authority**: Agents analyze, propose, and verify; human actors retain exclusive authorization over gates, ratifications, and branch promotions.

---

## 3. Verified Technology Baseline

The authoritative, verified technology stack for CONVERA is defined as:

```text
CONVERA TECHNOLOGY BASELINE
├── Backend Runtime:       Python 3.12.2 (FastAPI >= 0.115.0, Uvicorn >= 0.34.0, Pydantic v2)
├── Persistence Engine:    SQLite 3 (WAL Mode, PRAGMA foreign_keys = ON, 23 Relational Tables)
├── Frontend Framework:    Next.js 15.2.0 (App Router, Turbopack, React 19.0.0, TypeScript 5.8.2)
├── Styling & Design:      Tailwind CSS 4.0.9 (Curated HSL Color Tokens, Emerald/Slate Palette)
├── AI Gateway:            Multi-Provider Gateway (Google Gemini, Groq Cloud, OpenRouter, Local Ollama)
├── Scholarly Connectors:  OpenAlex, Crossref, PubMed, Semantic Scholar (Typed Hub) + Europe PMC
├── Agent Daemon:          Model Context Protocol (MCP) JSON-RPC 2.0 over stdio (backend/mcp_server.py)
└── Test Harness:          Pytest 8.0+ (30 test modules, 86 unit/integration test cases)
```

---

## 4. Repository Topology

```text
convera/
├── backend/                    # FastAPI REST & Epistemic Engine Backend
│   ├── agents/                 # Multi-agent coordinators & Socratic probers
│   ├── connectors/             # Scholarly search connectors (Base, Crossref, Hub, OpenAlex, PubMed, Semantic Scholar)
│   ├── engines/                # 25 Epistemic & Domain Engines (Gate, Circumscription, Literature Matrix, etc.)
│   ├── gates/                  # Gate evaluation interfaces
│   ├── prompts/                # Socratic prompt templates & system instructions
│   ├── routers/                # 15 FastAPI REST routers (Problems, Research, Decisions, Traceability, etc.)
│   ├── schemas/                # Pydantic v2 domain schemas (Phase outputs, Research schemas, etc.)
│   ├── storage/                # Persistence tier (base.py, factory.py, sqlite_adapter.py)
│   ├── tests/                  # Pytest test harness (30 test files, 86 test cases)
│   ├── llm_gateway.py          # Universal Multi-Provider LLM Gateway
│   ├── mcp_server.py           # Model Context Protocol stdio JSON-RPC daemon
│   ├── requirements.txt        # Python dependencies
│   └── server.py               # FastAPI entrypoint (uvicorn)
├── web/                        # Next.js 15.2.0 App Router Client
│   ├── src/app/                # App router (layout.tsx, page.tsx)
│   ├── src/components/         # 65 UI components across 8 domain folders
│   ├── src/hooks/              # Custom React hooks (useSession.ts, etc.)
│   ├── src/lib/                # Client utilities, API client, theme tokens
│   ├── src/services/           # 10 typed client services (agent, auth, connector, deliverable, etc.)
│   └── package.json            # Client dependencies & scripts
├── docs/                       # 38 Canonical Specifications across Layers 00–08 + Master README + Archive
│   ├── 00-foundation/          # Constitution, Product Identity, Principles, Glossary (4 docs)
│   ├── 01-product/             # Product Definition, Capabilities (2 docs)
│   ├── 02-system/              # System Architecture, Domain, Knowledge, Evidence, Decision, Traceability (6 docs)
│   ├── 03-engineering/         # Engineering Principles, SDD Workflow, Dev Workflow, Testing, Security (5 docs)
│   ├── 04-ai/                  # CIIA, AI Architecture, Governance, Connectors, MCP (5 docs)
│   ├── 05-data/                # Data Architecture, 23-Table WAL Schema, Provenance Spec (3 docs)
│   ├── 06-frontend/            # Frontend Arch, Design System, UI/UX Principles, IA, Accessibility (5 docs)
│   ├── 07-tracks/              # Innovation Track, Research Track, Interoperability, Governance (4 docs)
│   ├── 08-operations/          # Deployment Profiles (P1-P4), Monitoring, DR/Backup, Certification (4 docs)
│   ├── about/                  # Brand & product narrative profiles (EMAERX.md, PRODUCT_PROFILE.md)
│   ├── frameworks/             # Supplementary methodological framework guides
│   ├── prompts/                # Socratic prompt templates (Innovation phases 1-5, Thesis phases A-F)
│   ├── archive/                # Archived monolithic specs & historical exploration datasets
│   └── README.md               # Master Navigation Hub & Documentation Index
├── specs/                      # Spec-Driven Development (SDD) Feature Dossiers
│   └── 001-convera-development-foundation/ # Current foundational dossier
├── .specify/                   # Spec-Kit agent operational constitution & templates
├── .agents/                    # Antigravity agent rules (00–04) & specialized skills
├── .env.example                # Environment configuration template
└── package.json                # Unified root monorepo scripts
```

---

## 5. Physical Database Schema (23 Tables)

`[IMPLEMENTED & VERIFIED]` `backend/storage/sqlite_adapter.py` constructs and maintains exactly 23 physical relational tables:

1. `projects` — Primary project container and workspace isolation.
2. `project_members` — Collaborator profiles, workspace permissions, and audit attribution.
3. `sessions` — Ephemeral session state and active phase/stage tracking.
4. `session_snapshots` — Point-in-time serialized state checkpoints for rollback.
5. `problems` — Dual-track problem statements and friction definitions.
6. `problem_sources` — Ingested brainstorm text and external signal references.
7. `problem_phase_history` — State transition audit trail across phases/stages.
8. `problem_claims` — Epistemic claims extracted from problems.
9. `problem_assumptions` — Market and scientific assumptions requiring validation.
10. `problem_alternatives` — Competing solution mechanisms and architectural tradeoffs.
11. `decision_records` — Formal governed decisions with rationale and validity states.
12. `problem_comments` — Inline collaboration and mentor feedback threads.
13. `mentor_signoffs` — Attributable human milestone authorizations.
14. `claim_evidence_links` — Bipartite graph linking claims to backing evidence.
15. `assumption_validation_tests` — Empirical validation and Mom Test records.
16. `impact_invalidation_events` — Blast-radius invalidation logs upon falsification.
17. `evidence_provenance` — SHA-256 hashed lineage, citation trails, and tier weights.
18. `claim_contradictions` — Epistemic contradictions and dialetheic tensions.
19. `project_unknowns` — Explicitly mapped knowledge gaps and blind spots.
20. `requirements_traceability` — Forward and backward requirement-to-evidence graph.
21. `gate_reviews` — Objective rubric evaluations for quality gates.
22. `research_domains` — Canonical computing domains (D01–D25) and keywords.
23. `circumscription_iterations` — March & Smith DSR failure logs and extracted constraints.

---

## 6. AI Gateway, Scholarly Connectors & Fallback Truth

### 6.1 Multi-Provider Gateway
* `[IMPLEMENTED]` Active failover cascade across configured cloud providers (Gemini, Groq, OpenRouter).
* `[IMPLEMENTED]` 4-stage response sanitization (`clean_llm_response`) stripping chain-of-thought and reasoning preambles.
* `[IMPLEMENTED]` Model attribution telemetry returned with every generation (provider, model, display name, latency).
* `[IMPLEMENTED]` Explicit local Ollama execution when configured via `LLM_PROVIDER=ollama`.

### 6.2 Fallback Truth Classifications
* `[TARGET]` **Automatic Cloud-to-Ollama Cascade**: Automatically falling back to local Ollama upon cloud provider timeout is an architectural target.
* `[NORMATIVE / TARGET]` **Synthetic Terminal Fallback**: Returning a deterministic rule-based response with `source = "synthetic_fb"`, `is_degraded = True`, `weight = 0.0` upon total outage is a normative specification; the current runtime raises `RuntimeError`.

### 6.3 Scholarly Connectors
* `[IMPLEMENTED]` 4 typed connectors in `backend/connectors/` (`hub.py` registering OpenAlex, Crossref, PubMed, Semantic Scholar).
* `[IMPLEMENTED]` Europe PMC search capability embedded inside `backend/engines/research_client.py`.

---

## 7. Security & Deployment Profile Boundaries

* `[IMPLEMENTED]` **Local & Lab Profile**: Full local execution via `start-develop.ps1`, `start-develop.sh`, SQLite WAL, and single host binding (`0.0.0.0:8000`).
* `[IMPLEMENTED]` **Client-Side Security Contracts**: `x-passcode` verification via `POST /api/projects/{share_code}/verify-passcode` and `web/src/services/authService.ts`.
* `[TARGET]` **Production Security Perimeter**: Route-level dependency injection token guards, JWT session signing, and restricted CORS origins (`allow_origins=["*"]` → domain whitelist) represent future hardening targets for multi-tenant production profiles.

---

## 8. Git Workflow & Branch Governance

```text
feature/001-convera-development-foundation
                  │
        [Local Verification Gate]
                  │
                  ▼
            develop / develop
                  │
      [Integration Verification Gate]
                  │
                  ▼
           [Human Review Gate]
                  │
                  ▼
                main
```

1. **`feature/*`**: Isolated SDD work. Merges require 100% test pass, build pass, and complete dossier.
2. **`develop` / `develop`**: Integrated development baseline.
3. **`main`**: Ratified production baseline governed by explicit human approval.
