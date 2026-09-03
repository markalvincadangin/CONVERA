<div align="center">

  <img src="web/public/brand/brandmark.png" alt="RatchetAI Logo" width="120" height="120" />

  # RatchetAI ⚙️
  ### Evidence-Ratcheted Problem-to-Solution Technopreneurship Engine (v3.1)

  [![CI Quality Gate](https://github.com/markalvincadangin/RatchetAI/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/markalvincadangin/RatchetAI/actions/workflows/ci.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
  [![IEEE 830 Compliant](https://img.shields.io/badge/Standard-IEEE%20830%20%2F%20ISO%2029148-cyan.svg)](docs/SRSDS.md)
  [![UI/UX Standards](https://img.shields.io/badge/UX-NN%2Fg%20Heuristics%20Certified-purple.svg)](docs/DESIGN_SYSTEM.md)
  [![Python](https://img.shields.io/badge/Python-3.12-blue.svg?logo=python&logoColor=white)](pipeline/)
  [![Next.js](https://img.shields.io/badge/Next.js-15.2-black.svg?logo=next.js&logoColor=white)](web/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](pipeline/)
  [![SQLite WAL](https://img.shields.io/badge/Storage-SQLite%20WAL%20%7C%20Postgres-amber.svg)](pipeline/storage/)

  <p align="center">
    <strong>A multi-agent validation platform that eliminates premature solutioning in student startups through strict, one-way empirical evidence gates.</strong>
  </p>

  <p align="center">
    <a href="#-quickstart-guide">Quickstart</a> •
    <a href="#-the-mechanical-ratchet-invariant">Methodology</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-5-phase-validation-pipeline">5-Phase Pipeline</a> •
    <a href="#-remote-sharing--collaboration">Team Sharing</a> •
    <a href="docs/SRSDS.md">Specifications</a>
  </p>

</div>

---

## 📖 Table of Contents

- [Executive Overview](#-executive-overview)
- [The Mechanical Ratchet Invariant](#-the-mechanical-ratchet-invariant)
- [System Architecture](#-system-architecture)
- [The 5-Phase Validation Pipeline](#-the-5-phase-validation-pipeline)
- [Key Features (v3.1.0)](#-key-features-v200)
- [Quickstart Guide](#-quickstart-guide)
  - [Prerequisites](#prerequisites)
  - [1-Click Multi-Device Launch](#1-click-multi-device-launch)
  - [Worldwide Remote Sharing (Cloudflare Tunnel)](#worldwide-remote-sharing-cloudflare-tunnel)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Automated Testing & Quality Gates](#-automated-testing--quality-gates)
- [Project Structure](#-project-structure)
- [Master Documentation Index](#-master-documentation-index)
- [Contributing & Community](#-contributing--community)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🎯 Executive Overview

Over **90% of student startups and incubator ventures fail** because founders build products based on hypothetical opinions rather than verified customer friction. Founders often fall into the *"Solution in Disguise"* trap—rushing into app development without proving that real customers suffer, have attempted workarounds, or made financial sacrifices.

**RatchetAI** is an **evidence-ratcheted technopreneurship engine** engineered specifically for university startup incubators, technopreneurship courses, and founder teams. It combines multi-agent LLM orchestration with behavioral validation protocols (Rob Fitzpatrick's *The Mom Test* and the *Lean Validation Board*) to enforce empirical rigor at every step.

---

## 🔒 The Mechanical Ratchet Invariant

The fundamental governing law of RatchetAI is the **one-way mechanical ratchet**:

$$\text{Phase}_{k+1} \text{ Unlocked} \iff \text{Gate}(\text{Phase}_k) = \text{PASSED}$$

```text
[ Phase 1: Problem Discovery ]
              │ Passed Secondary Landscape Gate
              ▼
[ Phase 2: 10-Column Screening ]
              │ Passed 5-Criteria Winnability Gate
              ▼
[ Phase 3: Socratic Mom Test Clinic ] ◄─── Strict Qualitative Gate
              │ Passed All 6 Empirical Levels (Facts & Sacrifices)
              ▼ (UNLOCKS SOLUTION DESIGN)
[ Phase 4: Multi-Mechanism SVB Canvas ]
              │ Formulated 15 Mechanism Hypotheses + Riskiest Assumption (P1)
              ▼
[ Phase 5: MVP Behavioral Validation Audit ]
              │ Evaluated on 5-Tier Skin-in-the-Game Commitment Hierarchy
              ▼
[ SCALE / PIVOT / PERSEVERE DECISION ]
```

Downstream solution ideation (Phase 4) and prototyping (Phase 5) are **mechanically locked** until upstream problem definition and customer discovery survive rigorous empirical examination.

---

## 🏛️ System Architecture

RatchetAI employs a decoupled **3-Tier PC-Powered Local/Cloud Hybrid Architecture**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT / MULTI-DEVICE TIER                                │
│  Next.js 15 (App Router) • React 19 • Tailwind CSS • Glassmorphism Design System       │
│  • 5-Phase Interactive Workspace (Mobile, Tablet, Desktop Viewports)                   │
│  • Team Room Collaboration & Live Join via 6-Character Codes (`RATCH-XXXX`)            │
│  • Interactive 6-Slide Pitch Presentation Deck (`PresentationModal`)                   │
│  • Searchable Help & User Guide Center (`HelpCenterModal`)                             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / Relative Proxy (`/api/...`)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             API / SERVICE ORCHESTRATION TIER                            │
│  FastAPI (Python 3.12) • Pydantic v2 • Asyncio Service Engine (Host: 0.0.0.0:8000)     │
│  • Multi-Phase Pipeline Controller & Mechanical Gatekeeper                             │
│  • Socratic Mom Test Validation Engine                                                 │
│  • 10-Column Screening & Triage Scorecard Engine                                       │
│  • Milestone Snapshot & Historical Rollback Manager                                    │
└─────────────────────┬──────────────────────────────────────────────┬───────────────────┘
                      │                                              │
┌─────────────────────▼────────────────────────┐ ┌───────────────────▼───────────────────┐
│        UNIVERSAL MULTI-PROVIDER GATEWAY       │ │          STORAGE ADAPTER SUBSYSTEM    │
│  Dynamic Multi-Model Failover Cascade        │ │  Pluggable Local & Cloud Persistence  │
│  1. Google Gemini (gemini-3.5-flash) [Free]  │ │  • SQLite WAL (`pipeline/ratchetai.db`)│
│  2. Groq Cloud (llama-3.3-70b @ 500t/s)[Free]│ │  • PostgreSQL (Neon / Supabase Cloud) │
│  3. OpenRouter (Llama 3.3 70B Instruct)[Free]│ │  • Automatic Legacy JSON Migration    │
│  4. Local Ollama (qwen2.5 / llama3.2) [Free] │ │  • Relational Schema + Snapshot BLOBs │
└──────────────────────────────────────────────┘ └───────────────────────────────────────┘
```

---

## 🗺️ 5-Phase Validation Pipeline

| Phase | Methodology | Key Output | Gate Rule |
|---|---|---|---|
| **Phase 1: Problem Discovery** | Secondary landscape scan of 8 economic sectors in Western Visayas (PSA, DTI, LGUs). | Discovered Problem Matrix & unaddressed friction. | Sufferer identified; solution-in-disguise eliminated. |
| **Phase 2: Screening & Triage** | 10-Column Screening Scorecard evaluating 5 criteria on a 1–5 scale. | Batch Scorecard + `ADVANCE TO VALIDATION` verdict. | Total score $\ge 18/25$ with no fatal red flags. |
| **Phase 3: Socratic Mom Test Clinic** | 6-Level conversational interrogation demanding past actions and monetary spend. | Empirical validation transcript & Level 1–6 clearances. | All 6 levels cleared with concrete figures & sacrifices. |
| **Phase 4: Multi-Mechanism SVB Ideation** | Divergent ideation across 15 Mechanism Families (Software, Hardware, Physical, Financial, Logistics, Social). | Simplified Validation Board (SVB) & Riskiest Assumption ($P_1$). | At least 4 non-overlapping mechanism hypotheses. |
| **Phase 5: MVP Experimentation Audit** | Evaluates empirical test results against the 5-Tier Commitment Hierarchy. | Venture Verdict (`SCALE`, `PIVOT`, or `PERSEVERE`). | Actual conversion vs. pre-set pass/fail thresholds. |

---

## ✨ Key Features (v3.1.0)

* **⚡ High-Concurrency SQLite WAL Database:** Instant persistence with zero lock contention (`pipeline/ratchetai.db`) and PostgreSQL (Neon/Supabase) cloud readiness.
* **👥 Multi-Device Team Collaboration:** Connect groupmates over campus Wi-Fi or share worldwide with zero-config Cloudflare Quick Tunnels.
* **🔑 6-Character Project Room Codes:** Teammates join shared venture workspaces instantly using share codes (e.g., `RATCH-AGRI`).
* **⏪ Milestone Snapshots & Pivot Safety:** 1-Click "time travel" rollback to prior checkpoints if customer interviews disprove a hypothesis.
* **📊 Interactive Pitch Presentation Deck:** Full-screen 6-slide presentation canvas ready for faculty grading and investor defense.
* **📖 Searchable Help & User Guide Center:** Interactive user manual with 0-to-1 onboarding, phase playbooks, FAQs, and glossary.
* **🛡️ Multi-LLM Resilient Gateway:** Dynamic failover cascade across Google Gemini 3.5 Flash, Groq Llama 3.3 70B, OpenRouter, and Local Ollama.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** (Node.js 20 recommended) & **npm**
- Free API Key from [Google AI Studio](https://aistudio.google.com/) or [Groq Cloud](https://console.groq.com/)

### 1-Click Multi-Device Launch
Clone the repository and launch the full-stack system:

```powershell
# Clone the repository
git clone https://github.com/markalvincadangin/RatchetAI.git
cd RatchetAI

# 1-Click Launch (Host on your PC, Multi-device LAN enabled)
.\start-dev.ps1
```

- 🖥️ **Local Dashboard:** [http://localhost:3000](http://localhost:3000)
- 📱 **Campus Wi-Fi / LAN Access:** `http://<your-local-ip>:3000` (printed in terminal)
- ⚙️ **FastAPI Agent Backend:** `http://localhost:8000` (Bound to `0.0.0.0:8000`)

### Worldwide Remote Sharing (Cloudflare Tunnel)
To collaborate with remote groupmates without port forwarding or complex network setup:

```powershell
.\share-tunnel.ps1
```
Generates a secure, 100% free public HTTPS link (e.g. `https://xxxx-xxxx.trycloudflare.com`) to share with your team anywhere in the world!

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `pipeline/.env` and insert your free API keys:

```bash
cp .env.example pipeline/.env
```

```ini
# Primary Free LLM Provider (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# High-Speed Secondary Free LLM Provider (Groq Cloud)
GROQ_API_KEY=your_groq_api_key_here

# Fallback Multi-Model Free Provider (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional Cloud PostgreSQL (Leave blank to use SQLite WAL)
# DATABASE_URL=postgresql://user:password@ep-host.neon.tech/neondb?sslmode=require
```

---

## 🧪 Automated Testing & Quality Gates

RatchetAI maintains strict automated testing across all architecture tiers:

```bash
# 1. Run Python pytest suite (10/10 tests)
cd pipeline
python -m pytest tests/ -v

# 2. Run Next.js production build & typecheck (0 errors)
cd ../web
npm run build
```

```text
============================= test session starts =============================
pipeline/tests/test_gates.py::test_phase1_gate_enforcement PASSED        [ 10%]
pipeline/tests/test_gates.py::test_phase2_screening_minimums PASSED      [ 20%]
pipeline/tests/test_gates.py::test_phase3_mom_test_clearance PASSED      [ 30%]
pipeline/tests/test_gates.py::test_phase4_mechanism_diversity PASSED     [ 40%]
pipeline/tests/test_schemas.py::test_pydantic_schema_validation PASSED   [ 50%]
pipeline/tests/test_storage.py::test_sqlite_wal_initialization PASSED    [ 60%]
pipeline/tests/test_storage.py::test_session_crud_lifecycle PASSED       [ 70%]
pipeline/tests/test_storage.py::test_snapshot_and_rollback PASSED        [ 80%]
pipeline/tests/test_storage.py::test_share_code_lookup PASSED            [ 90%]
pipeline/tests/test_storage.py::test_legacy_json_migration PASSED        [100%]
============================== 10 passed in 0.85s =============================
```

---

## 📂 Project Structure

```text
RatchetAI/
├── .github/
│   ├── workflows/ci.yml         # GitHub Actions automated CI/CD quality gate
│   ├── ISSUE_TEMPLATE/          # Bug report & feature request templates
│   └── pull_request_template.md # Standard PR checklist template
├── assets/branding/             # Master high-resolution brand assets
├── docs/                        # Comprehensive documentation suite
│   ├── SRSDS.md                 # IEEE 830 / ISO 29148 System Design Specification
│   ├── DESIGN_SYSTEM.md         # 60-30-10 Design System & NN/g Heuristics Manual
│   └── frameworks/              # Theoretical venture frameworks
├── pipeline/                    # FastAPI Backend & Agent Service Subsystem
│   ├── agents/                  # Specialized phase agents
│   ├── gates/                   # Mechanical ratchet invariant evaluators
│   ├── prompts/                 # System instructions & Socratic rubrics
│   ├── schemas/                 # Pydantic v2 data models
│   ├── storage/                 # Pluggable SQLite WAL & PostgreSQL adapters
│   ├── tests/                   # Pytest test suite (10/10 tests)
│   └── server.py                # FastAPI async application routes
├── web/                         # Next.js 15 Frontend Web Application
│   ├── public/brand/            # Official brandmark, logo, and favicon
│   └── src/
│       ├── app/                 # Next.js App Router pages & metadata
│       ├── components/
│       │   ├── common/          # Reusable UI primitives (Buttons, Badges, Modals)
│       │   ├── layout/          # Navbar, Stepper, Help Center, Pitch Deck
│       │   └── phases/          # Phase 1–5 Interactive workspaces
│       └── services/            # Client API adapters
├── start-dev.ps1                # 1-Click Multi-Device LAN startup script
├── share-tunnel.ps1             # 1-Click Cloudflare remote sharing tunnel
├── CONTRIBUTING.md              # Contributor guidelines & GitFlow standards
├── CODE_OF_CONDUCT.md           # Contributor Covenant v2.1
├── SECURITY.md                  # Security vulnerability reporting policy
└── LICENSE                      # MIT Open Source License
```

---

## 📑 Master Documentation Index

- **[docs/SRSDS.md](docs/SRSDS.md)** — Software Requirements & System Design Specification (IEEE 830 / ISO 29148 / IEEE 1016).
- **[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** — RatchetAI 60-30-10 Design System & Nielsen Norman Heuristics Manual.
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Contributor guidelines, GitFlow branching, and Conventional Commits.
- **[SECURITY.md](SECURITY.md)** — Security disclosure policy and supported versions.

---

## 🤝 Contributing & Community

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct, branch conventions (`main`, `develop`, `feature/*`), and PR submission process.

---

## 📄 License & Acknowledgments

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

### Acknowledgments & Intellectual Foundations
- **Rob Fitzpatrick** — Author of *The Mom Test*, for establishing the conversational rules prohibiting opinion validation.
- **Trevor Owens & Lean Startup Machine** — Creators of the *Validation Board (Javelin)* framework.
- **Western Visayas Regional Innovation Ecosystem** — For ground-level agricultural, fisheries, and MSME problem datasets.

---

<div align="center">
  <sub>Built with ❤️ for student technopreneurs and startup incubators.</sub>
</div>
