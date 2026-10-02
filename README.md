<div align="center">

  <p align="center">
    <img src="web/public/brand/logo.png" alt="CONVERA Logo" width="380" />
  </p>

  ### Evidence-Driven Research Intelligence & Workflow Validation Engine
  **Project Intelligence & Research Validation Platform (v3.0) · EMAERX**

  *WHERE POSSIBILITIES CONVERGE INTO DIRECTION.*

  [![CI Quality Gate](https://github.com/markalvincadangin/CONVERA/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/markalvincadangin/CONVERA/actions/workflows/ci.yml)
  [![Tests: 338 Offline Passing](https://img.shields.io/badge/Pytest-338%20Passed%20(100%25%20Offline)-emerald.svg)](backend/tests/)
  [![Database: SQLite WAL (38 Tables)](https://img.shields.io/badge/Storage-SQLite%20WAL%20(38%20Tables)-amber.svg)](backend/storage/)
  [![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg?logo=python&logoColor=white)](backend/)
  [![Next.js 15](https://img.shields.io/badge/Next.js-15%20%7C%20React%2019-black.svg?logo=next.js&logoColor=white)](web/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](backend/)
  [![Design System](https://img.shields.io/badge/UI%2FUX-CCDS%20v2.0-purple.svg)](web/src/components/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
  [![IEEE 830 Compliant](https://img.shields.io/badge/Standard-IEEE%20830%20%2F%20ISO%2029148-cyan.svg)](docs/SRSDS.md)

  <p align="center">
    <strong>Transforms fragmented problem claims, scholarly literature, AI-generated outputs, field observations, and user assumptions into structured, evidence-backed, methodology-governed, and decision-ready research and venture opportunities.</strong>
  </p>

  <p align="center">
    <a href="#-quickstart-guide">Quickstart</a> •
    <a href="#-core-operating-doctrine">Core Doctrine</a> •
    <a href="#-dual-governing-frameworks">Dual Frameworks</a> •
    <a href="#-key-platform-capabilities">Platform Features</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-testing--verification">Verification</a> •
    <a href="docs/04-ai/AI_EVOLUTION_ROADMAP.md">AI Roadmap</a>
  </p>

</div>

---

## 🧭 Executive Overview

Student technopreneurship teams, computing thesis candidates, and project innovators frequently generate ideas and unstructured data faster than they can organize, validate, and prove what is actually worth pursuing. Promising insights generated across AI chats, group chats, literature reviews, spreadsheets, and field notes are frequently lost, misdirected, or debated without empirical backing.

**CONVERA** bridges the **problem-to-decision gap** through a closed-loop epistemic ratcheting engine:

- **From:** *"I think this is a good idea."*
- **To:** *"We have empirical field evidence, dual-literature grounding, isolated scholarly gaps, verified feasibility metrics, and structured requirements proving this problem is worth solving."*

---

## ⚖️ Core Operating Doctrine: *"LLM Last, Not LLM First"*

Under the [CONVERA Constitution](docs/00-foundation/CONSTITUTION.md) (Articles I, II, IV, VII, and VIII), intelligence mechanisms are selected according to a strict order of precedence:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                 INTELLIGENCE SELECTION ORDER OF PRECEDENCE              │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Can deterministic logic solve it?                                   │
│     └─► YES: Use pure mathematical formulas, rules, constraints, DAGs.  │
│  2. If no: Can retrieval/search solve it?                               │
│     └─► YES: Use SQLite FTS5 / BM25 lexical or federated search.         │
│  3. If no: Can statistics or classical analytics solve it?              │
│     └─► YES: Use statistical testing, distributions, or aggregations.    │
│  4. If no: Can a specialized lightweight ML model solve it?             │
│     └─► YES: Use dedicated classification or topic clustering models.   │
│  5. If no: Use a Generative Large Language Model (LLM).                 │
│     └─► Restricted to qualitative synthesis, explanation, & reasoning.  │
└─────────────────────────────────────────────────────────────────────────┘
```

Deterministic candidate rankings, epistemic scores, tie-breakers, and gate thresholds are calculated with **pure mathematics** before any LLM is queried. LLMs are prohibited from crowning winners or altering numerical outcomes.

---

## 🏛️ Dual Governing Frameworks

CONVERA provides first-class, dynamic methodology governance tailored to the active workspace:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DYNAMIC COMMAND DECK TRACKS                                    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚀 INNOVATION & TECHNOPRENEURSHIP TRACK (7 Slots / 2 Gates):                                     │
│ [0: Problem Bank] → [1: Discovery] → [2: Screening (G1)] → [3: Validation (G2)] →               │
│ [4: Ideation] → [5: MVP Audit] → [6: Studio: Venture Hub]                                        │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔬 COMPUTING RESEARCH DSR TRACK (8 Slots / 4 Gates):                                             │
│ [0: Problem Bank] → [1: Stage A (Scouting)] → [2: Stage B (Validation G1)] →                     │
│ [3: Stage C (Opportunity G2)] → [4: Stage D (Formulation)] → [5: Stage E (Evaluation G3)] →      │
│ [6: Stage F (Feasibility G4)] → [7: Studio: Proposal Suite]                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Venture Innovation Pipeline
Governed by [`Evidence-Ratcheted Problem-to-Solution Pipeline Framework.md`](docs/frameworks/Evidence-Ratcheted%20Problem-to-Solution%20Pipeline%20Framework.md):
- **Phase 1: Regional Problem Landscape Discovery** (Agriculture, Healthcare, MSME, Governance).
- **Phase 2: Problem Screening & Sizing Matrix** (`Gate 1: Opportunity Worthiness`).
- **Phase 3: Socratic Mom Test Validation Clinic** (`Gate 2: Empirical Validation`).
- **Phase 4: Mechanism Ideation & Solution Validation Board (SVB)**.
- **Phase 5: MVP Validation & Skin-in-the-Game Commitment Audit**.

### 2. Computing Research Concept Development (Academic DSR / CRCDP)
Governed by [`Computing Research Concept Development Framework.md`](docs/frameworks/Computing%20Research%20Concept%20Development%20Framework.md):
- **Stage A: Problem Discovery & Scouting Mechanism** (Bordens & Abbott).
- **Stage B: Problem Validation & Grounding** (`Gate 1: Problem Significance`).
- **Stage C: Research Opportunity & Gap Matrix** (`Gate 2: Research Gap Quality`).
- **Stage D: Solution Formulation & 4 DSR Artifact Classes** (Constructs, Models, Methods, Instantiations — March & Smith).
- **Stage E: Trapping & Evaluation Design** (`Gate 3: Evaluation Rigor & Circumscription`).
- **Stage F: Relevance, Ethics & Proposal Readiness** (`Gate 4: Proposal Readiness` — DOST-PCIEERD / SDGs / RA 10173).

---

## ⚡ Key Platform Capabilities

| Capability | Subsystem | Description |
| :--- | :--- | :--- |
| **Research Cockpit UI (CCDS v2.0)** | `web/src/components/research/cockpit/` | Real-time multi-panel research workspace with stage stepper, artifact panels, and centralized orchestrator feedback. |
| **Deterministic Decision Engine** | `backend/engines/decision_engine.py` | Strict formula $0.40 \times S_{\text{rubric}} + 0.35 \times S_{\text{epistemic}} + 0.25 \times S_{\text{impact}} - R_{\text{assumptions}}$ with 4-tier tie-breaking hierarchy. |
| **Federated CIIA Ingestion** | `backend/connectors/hub.py` | 5 academic harvesters (OpenAlex, Crossref, PubMed, Europe PMC, Semantic Scholar) with DOI deduplication. |
| **Scholarly Persistence & FTS5** | `backend/storage/sqlite_adapter.py` | SQLite FTS5 full-text search with BM25 ranking over ingested literature. |
| **Source-Mediated Epistemic Bridge** | `backend/engines/evidence_scorer.py` | Verifiable provenance chain: empirical/scholarly evidence $\rightarrow$ claims $\rightarrow$ decisions. |
| **DSR Artifact Ideation Engine** | `backend/engines/ideation_engine.py` | Formulates 4 DSR artifact classes (Constructs, Models, Methods, Instantiations) grounded in research gaps. |
| **Multi-Criteria Concept Evaluation** | `backend/engines/concept_evaluation_engine.py` | Deterministic rubric evaluation assessing feasibility, technical depth, and novelty. |
| **Stage F Feasibility & Gate 4 Canvas** | `backend/engines/feasibility_engine.py` | DOST-PCIEERD alignment, SDG mapping, budget estimation, and Gate 4 Proposal Canvas generation. |
| **Cross-Stage Critique & Blind-Spots** | `backend/engines/cross_stage_critique_engine.py` | Adversarial devil's advocate, tension detection, and assumption consistency scoring. |
| **Multi-Format Proposal Exporter** | `backend/engines/proposal_exporter.py` | Multi-format compilation (Markdown, LaTeX, HTML) with cryptographic SHA-256 provenance hashing. |
| **Research Session Persistence** | `backend/engines/session_state_engine.py` | Relational checkpointing across 38 SQLite tables (Table 37: `research_session_checkpoints`) with tamper detection. |
| **Interactive Evidence DAG Canvas** | `web/src/components/research/provenance/` | Native SVG Sugiyama layered DAG canvas with cubic Bézier connectors across 6 epistemic tiers. |
| **Ecosystem Dissemination Bridge** | `backend/engines/ecosystem_sync_engine.py` | Bi-directional Notion export/import, RFC-compliant Zotero reference bundles (`.bib`/CSL-JSON), and GitHub Issue manifests. |
| **Governed Multi-Provider LLM Gateway** | `backend/llm_gateway.py` | Resilient cascade (Gemini, Groq, Cerebras, Ollama) with truthful zero-weight synthetic fallback (`is_degraded = True`). |

---

## 🏗️ System Architecture

```text
CONVERA PLATFORM
│
├── PRESENTATION LAYER (Next.js 15 / React 19 / CCDS v2.0)
│     ├── Unified Command Deck (Adaptive Stepper: 7 vs 8 slots)
│     ├── Research Cockpit (Multi-panel stage execution workspace)
│     ├── Interactive Provenance DAG Canvas (Native SVG Sugiyama graph)
│     ├── Ecosystem Export Modal (Notion, Zotero, GitHub sync)
│     ├── Research Session Drawer (Snapshot persistence & resume)
│     └── Global Command Palette (Ctrl+K spotlight launcher)
│
├── INTELLIGENCE ORCHESTRATION LAYER (FastAPI / Python 3.12+)
│     ├── Research Orchestration Engine (Action dispatch loop)
│     ├── Methodology Contract Engine (Framework-agnostic stage governance)
│     ├── Deterministic Decision Engine (Mathematical candidate scoring)
│     ├── DSR Ideation & Concept Evaluation Engines
│     ├── Cross-Stage Critique & Blind-Spot Engine
│     ├── Stage F Feasibility & Proposal Exporter
│     ├── Provenance Graph & Cryptographic Hashing Engine
│     └── Ecosystem Sync Engine (Notion / Zotero / GitHub)
│
├── DATA INGESTION & FEDERATED CONNECTORS (CIIA Framework)
│     ├── Normalized Connectors: OpenAlex, Crossref, PubMed, Europe PMC, Semantic Scholar
│     ├── DOI Deduplication & Metadata Normalizer
│     └── Lexical Search (SQLite FTS5 + BM25 ranking)
│
└── PERSISTENCE LAYER (SQLite WAL / 38 Relational Tables)
      ├── Problem Bank & 4-Claim Ledgers
      ├── Scholarly Works & Literature Citations (FTS5 indexed)
      ├── Epistemic Claims, Assumptions & Contradictions
      ├── DSR Artifacts & Rubric Concept Evaluations
      ├── Research Session Checkpoints (Table 37)
      └── Ecosystem Sync Audit Trail (Table 38)
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.12+**
- **Node.js 20+** & **npm**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/markalvincadangin/CONVERA.git
cd CONVERA
```

### 2. Setup and Launch Backend
```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Launch FastAPI Server
uvicorn server:app --reload --port 8000
```
*Backend API docs are live at `http://localhost:8000/docs`.*

### 3. Setup and Launch Frontend
```bash
cd ../web

# Install dependencies
npm install

# Start Next.js Development Server
npm run dev
```
*Frontend application is live at `http://localhost:3000`.*

---

## 🧪 Testing & Verification

CONVERA is built with strict hermetic verification guarantees (Article VIII):

```bash
# 1. Run the Full Hermetic Backend Pytest Suite (338 tests, 100% offline passing)
PYTHONPATH=backend pytest backend/tests/ -m "not live" -v

# 2. Run Frontend Type-Checking (0 errors)
npm run typecheck --prefix web

# 3. Run Next.js Production Build (clean compilation)
npm run build --prefix web

# 4. Update Knowledge Graph AST
graphify update .
```

---

## 📜 Governing Standards & Compliance

CONVERA is designed and engineered to comply with recognized academic, technical, and regulatory frameworks:

- **IEEE 830 / ISO 29148**: Software Requirements Specifications & Epistemic Traceability.
- **Design Science Research (DSR)**: March & Smith (1995) 4-Artifact Taxonomy (Constructs, Models, Methods, Instantiations).
- **Academic Capstone Alignment**: Commission on Higher Education (CHED) CICT Capstone Standards.
- **Regional Feasibility**: DOST-PCIEERD Priority Areas, UN Sustainable Development Goals (SDGs), and RA 10173 (Data Privacy Act).
- **Design Heuristics**: WCAG 2.2 AA & Nielsen Norman 10 Usability Heuristics (CCDS v2.0).

---

## 📄 License & Attribution

CONVERA is licensed under the [MIT License](LICENSE).  
Designed and engineered by **Mark Alvin Cadangin** and **CONVERA Contributors / EMAERX** in collaboration with computing, research, and technopreneurship stakeholders.
