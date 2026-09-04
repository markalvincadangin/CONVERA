# CONVERA — Master Documentation Architecture Suite

> **Status**: 🟢 **RATIFIED & FULLY CERTIFIED**  
> **Version**: `2.0.0` (Modular Architecture Ratchet)  
> **Authority**: Tier 1 Governance under the [CONVERA Constitution](00-foundation/CONSTITUTION.md)

Welcome to the central documentation repository for **CONVERA** (Convergence Analysis Engine) — a dual-track technopreneurial inquiry platform and epistemic knowledge ratchet for computing research and high-tech venture creation.

---

## 🏛️ Documentation Authority Hierarchy

All documentation across the CONVERA repository conforms to the following strict 3-tier authority cascade established by Article VII of the Constitution:

```text
┌───────────────────────────────────────────────────────────────────┐
│ TIER 1: CONSTITUTIONAL PRIMACY                                    │
│ 00-foundation/CONSTITUTION.md                                     │
│ Invariant axioms: Epistemic Primacy, Human Sovereignty, Provenance│
└─────────────────────────────────┬─────────────────────────────────┘
                                  │ Governs
┌─────────────────────────────────▼─────────────────────────────────┐
│ TIER 2: CANONICAL ARCHITECTURAL SPECIFICATIONS (Layers 00–08)     │
│ 38 Ratified Specifications across Foundation, Product, System,    │
│ Engineering, AI, Data, Frontend, Tracks, and Operations           │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │ Governs
┌─────────────────────────────────▼─────────────────────────────────┐
│ TIER 3: PROCEDURAL & SUPPLEMENTARY REFERENCE                      │
│ Frameworks, Prompts, About/Brand, and Archive/Legacy Datasets     │
└───────────────────────────────────────────────────────────────────┘
```

* **Tier 1 (Constitutional)** overrides all lower specifications in the event of an ambiguity.
* **Tier 2 (Canonical Specifications)** define the authoritative, immutable system requirements and models.
* Any discrepancy between legacy notes and ratified layer documents resolves strictly in favor of the ratified modular specifications.

---

## 🗺️ Master Documentation Directory & Ratification Matrix

```text
CONVERA DOCUMENTATION ARCHITECTURE (38 RATIFIED SPECIFICATIONS)

├── 00-foundation/ ───────── Operating Constitution, Brand Axioms & Glossaries [🟢 RATIFIED]
├── 01-product/ ──────────── Product Definition, Target Users & Capabilities [🟢 RATIFIED]
├── 02-system/ ───────────── 5-Tier System Architecture & Canonical Epistemic Models [🟢 RATIFIED]
├── 03-engineering/ ──────── Engineering Principles, SDD Workflow & Security [🟢 RATIFIED]
├── 04-ai/ ───────────────── CIIA, LLM Gateway, Scholarly Connectors & MCP [🟢 RATIFIED]
├── 05-data/ ─────────────── SQLite WAL Data Architecture, Schema (23 Tables) [🟢 RATIFIED]
├── 06-frontend/ ─────────── Next.js 15.2.0 Client Architecture, Design System & WCAG [🟢 RATIFIED]
├── 07-tracks/ ───────────── Innovation Track, Research Track & Governance [🟢 RATIFIED]
├── 08-operations/ ───────── Deployment (P1-P4), Monitoring, DR & Certification [🟢 RATIFIED]
├── about/ ───────────────── Brand Identity, Product Overview & EMAERX Context [🟢 REFERENCE]
├── frameworks/ ──────────── Concept Development & UX Framework Guides [🟢 REFERENCE]
├── prompts/ ─────────────── Socratic Prompt Templates (Innovation & Research) [🟢 REFERENCE]
└── archive/ ─────────────── Legacy Monolithic Drafts & Exploration Datasets [📦 ARCHIVE]
```

### 1. Foundation Layer (`docs/00-foundation/`)
* [**`CONSTITUTION.md`**](00-foundation/CONSTITUTION.md) — The 8 Constitutional Articles governing epistemic primacy, human sovereignty, provenance, Socratic inquiry, gate clearance, invalidation, documentation authority, and formal amendment.
* [**`CONVERA.md`**](00-foundation/CONVERA.md) — Master product identity, core philosophy, and foundational axioms.
* [**`PRINCIPLES.md`**](00-foundation/PRINCIPLES.md) — Epistemic, provenance, and human-in-the-loop invariants.
* [**`GLOSSARY.md`**](00-foundation/GLOSSARY.md) — Canonical terminology, entity definitions, and cross-layer references.

### 2. Product & System Layer (`docs/01-product/`, `docs/02-system/`)
* [**`PRODUCT_DEFINITION.md`**](01-product/PRODUCT_DEFINITION.md) — Target user personas, value propositions, and core inquiry archetypes.
* [**`CAPABILITIES.md`**](01-product/CAPABILITIES.md) — Functional capability matrix (F-01 through F-10).
* [**`SYSTEM_ARCHITECTURE.md`**](02-system/SYSTEM_ARCHITECTURE.md) — 5-Tier layered system blueprint, boundaries, and communication topologies.
* [**`DOMAIN_MODEL.md`**](02-system/DOMAIN_MODEL.md) — 16 Canonical domain entities, entity identifiers (E01–E20), and relational lifecycles.
* [**`KNOWLEDGE_MODEL.md`**](02-system/KNOWLEDGE_MODEL.md) — Epistemic maturity states, claim lifecycles, unknowns mapping, and contradictions.
* [**`EVIDENCE_MODEL.md`**](02-system/EVIDENCE_MODEL.md) — Empirical evidence scoring, Tri-Part Confidence ($C_{AI} 
e S_{EVID} 
e C_{DEC}$), and decay heuristics.
* [**`DECISION_MODEL.md`**](02-system/DECISION_MODEL.md) — Decision records, pivot mechanics, attributable deciders, and blast-radius triggers.
* [**`TRACEABILITY_MODEL.md`**](02-system/TRACEABILITY_MODEL.md) — End-to-end forward and backward lineage from problems to deliverables.

### 3. Engineering Governance (`docs/03-engineering/`)
* [**`ENGINEERING_PRINCIPLES.md`**](03-engineering/ENGINEERING_PRINCIPLES.md) — Code quality standards, clean architecture, and modularity rules.
* [**`DEVELOPMENT_WORKFLOW.md`**](03-engineering/DEVELOPMENT_WORKFLOW.md) — Git workflow, branch naming, pull requests, and CI/CD conventions.
* [**`SDD_WORKFLOW.md`**](03-engineering/SDD_WORKFLOW.md) — 8-Phase Spec-Driven Development (`SPECIFY` $
ightarrow$ `CONVERGE`).
* [**`TESTING_STRATEGY.md`**](03-engineering/TESTING_STRATEGY.md) — Unit, contract, blast-radius, and epistemic decay test suites.
* [**`SECURITY.md`**](03-engineering/SECURITY.md) — Data isolation, passcodes, encryption, and secure connector egress.

### 4. AI, Connectors & Architecture (`docs/04-ai/`)
* [**`CIIA.md`**](04-ai/CIIA.md) — Context Injection & Intelligence Adapter specification and core integration doctrines.
* [**`AI_ARCHITECTURE.md`**](04-ai/AI_ARCHITECTURE.md) — Universal task-routed LLM gateway, provider cascades, and prompt templates.
* [**`AI_GOVERNANCE.md`**](04-ai/AI_GOVERNANCE.md) — Socratic inquiry mandate, zero self-approval, and advisory-only AI weight ($0.0$).
* [**`CONNECTOR_ARCHITECTURE.md`**](04-ai/CONNECTOR_ARCHITECTURE.md) — 5 Scholarly connectors (Semantic Scholar, OpenAlex, Crossref, PubMed, Europe PMC).
* [**`MCP.md`**](04-ai/MCP.md) — Model Context Protocol tools, JSON-RPC stdio daemon, and IDE integrations.

### 5. Data & Persistence Layer (`docs/05-data/`)
* [**`DATA_ARCHITECTURE.md`**](05-data/DATA_ARCHITECTURE.md) — SQLite Write-Ahead Logging (WAL), storage factory, and hybrid cloud fallback.
* [**`DATABASE_SCHEMA.md`**](05-data/DATABASE_SCHEMA.md) — Complete 23-table relational schema with physical constraints and indices.
* [**`PROVENANCE.md`**](05-data/PROVENANCE.md) — Source verification lifecycle, immutable audit hashes, and citation trails.

### 6. Frontend & Presentation Layer (`docs/06-frontend/`)
* [**`FRONTEND_ARCHITECTURE.md`**](06-frontend/FRONTEND_ARCHITECTURE.md) — Next.js 15.2.0 App Router, React 19 Client State, and optimistic UI updates.
* [**`DESIGN_SYSTEM.md`**](06-frontend/DESIGN_SYSTEM.md) — Curated HSL color tokens, 60-30-10 palette, typography, and micro-interactions.
* [**`UI_UX_PRINCIPLES.md`**](06-frontend/UI_UX_PRINCIPLES.md) — Socratic UI interaction paradigms and Tri-Part confidence rendering.
* [**`INFORMATION_ARCHITECTURE.md`**](06-frontend/INFORMATION_ARCHITECTURE.md) — Navigation models, phase steppers, and progressive disclosure views.
* [**`ACCESSIBILITY.md`**](06-frontend/ACCESSIBILITY.md) — WCAG 2.2 AA conformance matrix, non-color semantic channels, and focus management.

### 7. Domain Tracks & Inquiry Systems (`docs/07-tracks/`)
* [**`INNOVATION_TRACK.md`**](07-tracks/INNOVATION_TRACK.md) — Technopreneurship Venture Ratchet (Phases 1–5), 15 Mechanism Families, and Mom Test.
* [**`RESEARCH_TRACK.md`**](07-tracks/RESEARCH_TRACK.md) — Computing Research & DSR Ratchet (Stages A–F), Literature Matrix, and Circumscription.
* [**`TRACK_INTEROPERABILITY.md`**](07-tracks/TRACK_INTEROPERABILITY.md) — Framework transition protocol, progress isolation, and dual-track synthesis.
* [**`TRACK_GOVERNANCE.md`**](07-tracks/TRACK_GOVERNANCE.md) — Governance precedence hierarchy, two-tier clearance, and human sovereignty.

### 8. Operations & Deployment (`docs/08-operations/`)
* [**`DEPLOYMENT.md`**](08-operations/DEPLOYMENT.md) — Build packaging, Docker compose, and operational deployment profiles (Profiles 1–4).
* [**`MONITORING.md`**](08-operations/MONITORING.md) — 4-Tier observability (Infrastructure, CIIA, Epistemic, and Workflow health).
* [**`BACKUP_DISASTER_RECOVERY.md`**](08-operations/BACKUP_DISASTER_RECOVERY.md) — SQLite WAL backup, SessionSnapshot rollback, and lineage-preserving recovery.
* [**`SYSTEM_CERTIFICATION.md`**](08-operations/SYSTEM_CERTIFICATION.md) — Master System Certification across all 8 architectural pillars.

---

## 📚 Supplementary Reference & Tooling Guides

* [**`about/`**](about/EMAERX.md) — EMAERX brand philosophy, organizational context, and [brand logo](about/brand/EMAERX.png).
* [**`frameworks/`**](frameworks/) — Methodological frameworks including:
  - [Computing Research Concept Development Framework](frameworks/Computing%20Research%20Concept%20Development%20Framework.md)
  - [Evidence-Ratcheted Problem-to-Solution Pipeline Framework](frameworks/Evidence-Ratcheted%20Problem-to-Solution%20Pipeline%20Framework.md)
  - [UI/UX Design Framework](frameworks/UIUX%20Design%20Framework.md)
* [**`prompts/`**](prompts/) — Structured Socratic prompt templates:
  - [**Innovation Track Prompts**](prompts/innovation/) (Phases 1 through 5)
  - [**Thesis Research Track Prompts**](prompts/thesis/) (Phases A through F)

---

## 📦 Historical Archive & Datasets (`docs/archive/`)

The following files represent historical baselines and exploratory datasets, preserved for lineage tracking:
* [**`archive/legacy-monoliths/`**](archive/legacy-monoliths/) — Early monolithic specifications (superseded under Constitution Article VII):
  - [`SRSDS.md`](archive/legacy-monoliths/SRSDS.md) *(Superseded by `01-`, `02-`, `04-`, `05-`)*
  - [`CONVERA_INTELLIGENCE_INTEGRATION_ARCHITECTURE.md`](archive/legacy-monoliths/CONVERA_INTELLIGENCE_INTEGRATION_ARCHITECTURE.md) *(Superseded by `04-ai/`)*
  - [`CONVERA_MASTER_ARCHITECTURE.md`](archive/legacy-monoliths/CONVERA_MASTER_ARCHITECTURE.md) *(Superseded by `00-`, `01-`, `02-`)*
  - [`CONVERA_METHODOLOGY_GOVERNED_ARCHITECTURE.md`](archive/legacy-monoliths/CONVERA_METHODOLOGY_GOVERNED_ARCHITECTURE.md) *(Superseded by `07-tracks/`)*
  - [`DESIGN_SYSTEM_ROOT_LEGACY.md`](archive/legacy-monoliths/DESIGN_SYSTEM_ROOT_LEGACY.md) *(Superseded by `06-frontend/DESIGN_SYSTEM.md`)*
* [**`archive/datasets/`**](archive/datasets/) — Historical domain concept exploration spreadsheets:
  - [`01_Domain_Explorer.csv`](archive/datasets/01_Domain_Explorer.csv)
  - [`02_Problem_Bank.csv`](archive/datasets/02_Problem_Bank.csv)
