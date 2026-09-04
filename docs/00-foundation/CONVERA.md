# CONVERA — Evidence-Driven Project Intelligence Platform

**Document ID**: `CONVERA-FND-002`  
**Classification**: System Philosophy & Strategic Identity  
**Authority Tier**: Tier 1 Foundational  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/00-foundation/CONVERA.md`  
**Upstream Dependencies**: `CONSTITUTION.md`  
**Downstream Dependents**: `PRODUCT_DEFINITION.md, SYSTEM_ARCHITECTURE.md`  

---

> **"Turn Uncertainty into Justified Direction."**  
> CONVERA transforms fragmented ideas, empirical signals, active assumptions, and scientific literature into validated, traceable, and decision-ready project direction.

---

## 1. System Definition & Identity

**CONVERA** is an open, evidence-driven project intelligence platform that maintains an authoritative, relational knowledge graph of:
1. **What a team knows** (Verified empirical facts and baseline constants)
2. **What a team assumes** (Active working hypotheses and unmeasured risks)
3. **What evidence supports or refutes those beliefs** (First-class source provenance, citation tiers, and contradiction pairs)
4. **Why decisions were made** (Immutable audit history, chosen candidates, rejected alternatives, and reactive causal blast-radius invalidation)

CONVERA is **framework-agnostic** and **free-first**, operating seamlessly across both entrepreneurial venture development and academic computing research without requiring proprietary cloud infrastructure or paid third-party subscriptions.

---

## 2. Core Problems Solved

| Pathology | Conventional Failure Mode | CONVERA Remediation |
| :--- | :--- | :--- |
| **Premature Solutioning** | Teams build products or software systems before validating that the underlying problem actually exists or matters. | **Socratic Interrogation & Stage A Empirical Discovery** gate problem statements against quantified pain and stakeholder impact before ideation begins. |
| **Hallucinated Consensus** | Teams confuse AI-generated text or unverified intuition with validated factual truth. | **Tri-Part Confidence Calibration** strictly decouples $\text{AI Confidence} \neq \text{Evidence Strength} \neq \text{Decision Confidence}$. |
| **Silent Invalidation** | When a foundational assumption is disproven, downstream software specs and architectural decisions remain unchanged. | **Causal Impact Propagation Engine** automatically traverses downstream dependency graphs and marks dependent decisions as `STALE_REVIEW_REQUIRED`. |
| **Literature Disconnect** | Capstone, thesis, and R&D projects cite papers superficially without comparing methodologies, limitations, or authentic gaps. | **Federated Literature Matrix & Gap Discriminator** query open scholarly graphs (OpenAlex, CrossRef, PubMed, Europe PMC, Semantic Scholar) and enforce comparative synthesis. |
| **Workflow Coupling** | Switching development frameworks destroys or duplicates recorded domain knowledge. | **Knowledge $\neq$ Workflow Separation**: Canonical knowledge entities (Problems, Claims, Evidence, Decisions) persist independently in relational SQLite WAL storage. |

---

## 3. Conceptual Backbone & Dual-Track Product Architecture

CONVERA is architecturally organized into three core pillars:

```text
                                     CONVERA PLATFORM
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      ▼                                      ▼                                      ▼
CANONICAL KNOWLEDGE                  TRACK WORKFLOWS                         CIIA INFRASTRUCTURE
• Problems & Statements              ├── Innovation Track (Phases 1–5)       ├── 3-Tier LLM Gateway
• Claims & Assumptions               └── Research Track (Stages A–F)         ├── Scholarly Connector Hub
• Evidence & Provenance                      │                               └── Standalone MCP Server
• Decisions & Lineage                        │
      │                                      │
      └──────────────────────────────────────┘
            (Workflows operate on, enrich, and test Canonical Knowledge)
```

### Track A: Innovation Track (Venture Ratchet)
* **Goal:** Guide early-stage founders and technopreneurship teams from raw market observations to validated, scalable venture opportunities.
* **Workflow:**
  - **Phase 1: Startup Problem Discovery** (Regional sector scouting & raw pain intake)
  - **Phase 2: Screening & Triage Matrix** (Multi-criteria feasibility & market sizing)
  - **Phase 3: Socratic Mom Test Validation Clinic** (Levels 1–6 behavioral interview logging)
  - **Phase 4: 15-Mechanism Solution Ideation** (Mechanism family mapping & SVB ideation)
  - **Phase 5: Skin-in-the-game MVP Validation** (Behavioral commitment tiers & SRS generation)

### Track B: Computing Research Track (CRCDP / DSR)
* **Goal:** Guide undergraduate, graduate, and faculty researchers through rigorous Design Science Research (DSR) and computing research methodologies (*Bordens & Abbott, 2018*).
* **Workflow:**
  - **Stage A: Empirical Scouting & Problem Bank** (25 Database Master Domains `D01`–`D25` + Custom Domains + AI Empirical Problem Generator)
  - **Stage B: Gate 1 Lit Grounding & Falsification** (Bordens & Abbott Lit Grounding Triage & Gate 1 Review)
  - **Stage C: Literature Matrix & Gap Analysis** (Federated OpenAlex, CrossRef, PubMed, Europe PMC, Semantic Scholar comparative grid)
  - **Stage D: Research Protocol & Variable Design** (Variable operationalization & experimental control design)
  - **Stage E: Artifact Construction & Telemetry** (System architectural specification & evaluation telemetry)
  - **Stage F: Evaluation, Feasibility & Circumscription** (Statistical evaluation, Gate 4 sign-off, Circumscription failure loopback, and `/api/export/dsr-proposal` export)

---

## 4. The Five Core Architectural Principles

```text
 1. KNOWLEDGE ≠ WORKFLOW       Domain truth exists independently of the active UI framework.
 2. EVIDENCE BEFORE ASSERTION  Raw statements never graduate to justified direction without provenance.
 3. DECOUPLED CONFIDENCE       AI linguistic fluency must never be confused with empirical validity.
 4. REACTIVE INVALIDATION      Causal blast-radius triggers when assumptions or evidence are refuted.
 5. FREE-FIRST POSTURE         Full functionality is guaranteed with local storage and free-tier models.
```

---

## 5. System Architecture Summary

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           1. PRESENTATION TIER (UI/UX)                          │
│        Next.js 15 App Router · CCDS v2.0 Dark Mode · Command Center Navigation  │
│        Dynamic Unknowns Map · Literature Matrix Grid · Stage Anchor Banners     │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ REST API / JSON-RPC
┌────────────────────────────────────────▼────────────────────────────────────────┐
│                        2. APPLICATION & ROUTER TIER                             │
│        15 FastAPI Domain Routers (86+ OpenAPI Endpoints)                        │
│        Pipeline · Knowledge · Research · Decisions · Gates · Traceability · Export │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼────────────────────────────────────────┐
│                          3. DOMAIN ENGINE TIER                                  │
│   ├── Knowledge Lifecycle (Net Balance)   ├── Impact Engine (Blast Radius)      │
│   ├── Evaluation Engine (Gap vs Limit)   ├── Gate Engine (Gates 1–4 Rubrics)   │
│   ├── Freshness Engine (Decay Scoring)   ├── Circumscription Engine (DSR Loop) │
│   └── Similarity Engine (TF-IDF/Cosine)   └── Proposal Exporter (DSR Compiler)  │
└───────────────────┬─────────────────────────────────────────┬───────────────────┘
                    │                                         │
┌───────────────────▼─────────────────────┐ ┌─────────────────▼───────────────────┐
│     4. PERSISTENT STORAGE TIER          │ │   5. CIIA (COGNITIVE LAYER)         │
│  SQLite WAL Mode (23 Relational Tables) │ │  ├── Multi-Provider LLM Gateway     │
│  ├── Normalized Schema & Integrity      │ │  │   (Gemini → Groq → Ollama)       │
│  ├── In-Memory Fallback Adapter         │ │  ├── Scholarly Connector Hub        │
│  └── Immutable Snapshots & Audit Trails │ │  │   (OpenAlex, Crossref, PubMed)   │
│                                         │ │  └── Standalone MCP Server Daemon   │
│                                         │ │      (JSON-RPC 2.0 stdio / 7 Tools) │
└─────────────────────────────────────────┘ └─────────────────────────────────────┘
```

---

## 6. How AI, Evidence, Knowledge, and Decisions Relate

```text
  [ RAW SIGNALS ]            [ EVIDENCE ]             [ KNOWLEDGE ]             [ DECISION ]
  • Web searches        ──>  • Tiers A / B / C   ──>  • Claims             ──>  • Chosen Concept
  • Scholarly APIs           • DOI / PMID             • Assumptions             • Alternatives
  • External LLMs            • Provenance             • Unknowns Map            • Blast Radius
  (Signals only)             (Empirical weight)       (Epistemic state)         (Immutable log)
```

1. **Signals are not Evidence:** An external LLM output or raw search result is an untrusted signal. It only becomes a **Provenance-Bearing Evidence Item** when stamped with connector ID, timestamp, source identifier (DOI/PMID), and extracting model.
2. **Evidence is not Knowledge:** An evidence item becomes **Evaluated Evidence** when linked to a **Claim** with an explicit relationship (`SUPPORTS`, `CONTRADICTS`, `CONTEXTUALIZES`, `FALSIFIES`) and assigned a mathematical weight.
3. **Knowledge is not a Decision:** Validated claims inform decision candidates. A **Decision** is an explicit, human-ratified commitment that records chosen candidates, rejected alternatives, rationale, and causal dependencies. While decision history logs are immutable, decision validity is reactive and revisable.

---

## 7. Authoritative Documentation Architecture Map

CONVERA’s documentation is organized into three distinct authority levels:

```text
docs/
├── 00-foundation/             ← NORMATIVE (What MUST be true across CONVERA)
│   ├── CONVERA.md             ← Master System Overview & Entry Point (This Document)
│   ├── CONSTITUTION.md        ← Immutable Laws & Development Constraints
│   ├── PRINCIPLES.md          ← Architectural & Epistemic Philosophy
│   └── GLOSSARY.md            ← Canonical Definitions of Domain Terminology
│
├── 01-product/                ← DESCRIPTIVE (What CONVERA does conceptually)
│   ├── PRODUCT_DEFINITION.md  ← Technology-Independent Transformation Model
│   └── CAPABILITIES.md        ← Catalog of Platform Capabilities
│
├── 02-system/                 ← DESCRIPTIVE (How CONVERA is designed technically)
│   ├── SYSTEM_ARCHITECTURE.md ← Complete 5-Tier Technical Topology
│   ├── DOMAIN_MODEL.md        ← Canonical Entity Graph & Relationships
│   ├── KNOWLEDGE_MODEL.md     ← Epistemic Lifecycle & Mathematical Formulas
│   ├── EVIDENCE_MODEL.md      ← Provenance, Decay & Contradiction Detection
│   ├── DECISION_MODEL.md      ← Decision Records, Invalidation & Blast Radius
│   └── TRACEABILITY_MODEL.md  ← Multi-Hop Requirement-to-Evidence Lineage
│
├── 03-engineering/            ← PROCEDURAL (How we build and verify CONVERA)
│   ├── ENGINEERING_PRINCIPLES.md ← Minimal Change, Clean IoC, Decoupling
│   ├── DEVELOPMENT_WORKFLOW.md   ← Git Branches, PR Gates, Fast-Forward Sync
│   ├── SDD_WORKFLOW.md           ← Spec Kit + Antigravity SDD Cycle
│   ├── TESTING_STRATEGY.md       ← 5-Tier Verification Pyramid & CI Gates
│   └── SECURITY.md               ← Parameterized Queries, Workspace Isolation
│
├── 04-ai/                     ← NORMATIVE & DESCRIPTIVE (CIIA Subsystem)
│   ├── CIIA.md                   ← Cognitive Infrastructure & Gateway Architecture
│   ├── AI_ARCHITECTURE.md        ← 3-Tier Fallback Cascade & Synthetic Generator
│   ├── AI_GOVERNANCE.md          ← Safety, Anti-Hallucination & Human Sign-off
│   ├── CONNECTOR_ARCHITECTURE.md ← BaseConnector & Academic Connectors
│   └── MCP.md                    ← Standalone MCP Server & 7 Active Tools
│
├── 05-data/                   ← DESCRIPTIVE (Persistent Storage Architecture)
│   ├── DATA_ARCHITECTURE.md      ← SQLite WAL Engine, Session Boundaries
│   ├── DATABASE_SCHEMA.md        ← Complete 23 Normalized Relational Tables
│   └── PROVENANCE.md             ← Lineage Stamping & Verification Standards
│
├── 06-frontend/               ← DESCRIPTIVE (UI/UX Architecture)
│   ├── UX_PRINCIPLES.md          ← Progressive Disclosure & Epistemic HUD
│   ├── DESIGN_SYSTEM.md          ← CCDS v2.0 Dark Mode & Component Tokens
│   └── FRONTEND_ARCHITECTURE.md        ← Next.js 15 App Router & React 19 Client State & Native Fetch Data Flow
│
├── 07-tracks/                 ← PROCEDURAL (Track Execution Guides)
│   ├── INNOVATION_TRACK.md       ← Phases 1–5 Venture Ratchet Execution
│   └── RESEARCH_TRACK.md         ← Stages A–F DSR Computing Execution
│
└── 08-operations/             ← PROCEDURAL (Operational & Maintenance Runbooks)
    ├── SETUP.md                  ← Quickstart Guide
    ├── DEPLOYMENT.md             ← Self-Hosted & VPS Deployment
    └── TROUBLESHOOTING.md        ← Database Recovery, CI Diagnostics & FAQs
```
