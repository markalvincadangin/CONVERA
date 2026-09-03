<div align="center">

  <img src="docs/about/brand/EMAERX.png" alt="EMAERX Brand" width="140" height="auto" />

  # CONVERA
  ### Evidence-Driven Project Intelligence and Opportunity Validation System (v3.0)
  **A Product of EMAERX**

  *WHERE POSSIBILITIES CONVERGE INTO DIRECTION.*

  [![CI Quality Gate](https://github.com/markalvincadangin/RatchetAI/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/markalvincadangin/RatchetAI/actions/workflows/ci.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
  [![IEEE 830 Compliant](https://img.shields.io/badge/Standard-IEEE%20830%20%2F%20ISO%2029148-cyan.svg)](docs/SRSDS.md)
  [![CHED CICT Aligned](https://img.shields.io/badge/Academic-CHED%20CICT%20Capstone-blue.svg)](docs/SRSDS.md)
  [![UI/UX Standards](https://img.shields.io/badge/UX-WCAG%202.2%20%7C%20NN%2Fg%20Heuristics-purple.svg)](docs/DESIGN_SYSTEM.md)
  [![Python](https://img.shields.io/badge/Python-3.12-blue.svg?logo=python&logoColor=white)](pipeline/)
  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg?logo=next.js&logoColor=white)](web/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](pipeline/)
  [![SQLite WAL](https://img.shields.io/badge/Storage-SQLite%20WAL%20%7C%20Postgres-amber.svg)](pipeline/storage/)

  <p align="center">
    <strong>Transforms fragmented project ideas, research papers, AI-generated outputs, assumptions, and field observations into structured, evidence-backed, validated, and decision-ready project opportunities.</strong>
  </p>

  <p align="center">
    <a href="#-quickstart-guide">Quickstart</a> • 
    <a href="#-the-convera-3-step-framework">3-Step Framework</a> • 
    <a href="#-system-architecture">Architecture</a> • 
    <a href="#-5-phase-validation-pipeline">5-Phase Pipeline</a> • 
    <a href="docs/SRSDS.md">Specifications (SRSDS)</a> • 
    <a href="docs/about/product/CONVERA.md">Product Profile</a>
  </p>

</div>

---

## 🧭 Executive Overview

Student technopreneurship and computing capstone teams often generate project ideas and information faster than they can organize, validate, and decide what is actually worth pursuing. Ideas generated across AI chats, group chats, documents, spreadsheets, and personal notes are lost or debated without evidence.

**CONVERA** bridges the **problem-to-decision gap** by organizing, validating, and translating raw ideas into decision-ready project opportunities:

- **From:** *"I think this is a good idea."*
- **To:** *"We have empirical evidence and structured requirements that this is worth pursuing."*

---

## 🧬 The CONVERA 3-Step Framework

CONVERA layers continuous evidence validation over the 5-phase venture lifecycle:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              The CONVERA Evolution Framework                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   STEP 1 — EVIDENCE FOUNDATION & RELATIONAL KNOWLEDGE GRAPH                            │
│   ├── 4-Claim Evidence Ledger (Friction, Frequency, Workaround, Adoption/Commitment)  │
│   │   • Commercial (WTP) vs Civic/Academic Institutional feasibility toggle            │
│   ├── Prioritized Assumption Radar with Mom Test behavioral interview questions        │
│   └── Crossref, OpenAlex, and Europe PMC DOI Grounding with AI Relevance Gate          │
│                                                                                        │
│   STEP 2 — DECISION INTELLIGENCE & AUDIT TRAIL                                         │
│   ├── Decision Room Workspace with side-by-side Evidence Ledger & Radar comparison     │
│   ├── Explainable AI Judge ranking and candidate pros/cons                             │
│   ├── Immutable Decision Audit Log (`decision_records` table)                          │
│   └── Structured Pivot / Re-Evaluate Learning Loop (Phase 3 -> Phase 2 Rollback)       │
│                                                                                        │
│   STEP 3 — PROJECT TRANSLATION (IDEA-TO-SPECIFICATION)                                 │
│   ├── IEEE 830 / CHED CICT Capstone & Startup MVP Software Requirements Generator      │
│   ├── 6 Core Sections: Scope, Personas, Functional Requirements (FR-001..FR-008),      │
│   │   Non-Functional Constraints (NFRs), Architecture Blueprint, Validation Rubric     │
│   └── Deliverables Studio Integration with 1-Click Markdown & Defense Deck Export       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ System Architecture

CONVERA is built as a decoupled, zero-ops **PC-Powered Hybrid Architecture**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT / MULTI-DEVICE TIER                                │
│  Next.js 16 (App Router) • React 19 • Tailwind CSS • Glassmorphism Design System       │
│  • 5-Phase Progressive Venture Workspace (Desktop, Tablet, Mobile)                     │
│  • Step 1 Evidence Ledger & Assumption Radar Components                                │
│  • Step 2 Decision Room Workspace & Timeline Modal                                     │
│  • Step 3 Technical Capstone SRS Specification Generator                               │
│  • Deliverables Studio (Lean Canvas, SWOT, 10-Slide Pitch Deck, Master Dossier)        │
│  • Multi-User Collaboration & Project Rooms (Share Codes: `CONV-XXXX` / `RATCH-XXXX`)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │ HTTPS / Relative Proxy (`/api/...`)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             API / SERVICE ORCHESTRATION TIER                            │
│  FastAPI (Python 3.12) • Pydantic v2 • Asyncio Service Engine (Host: 0.0.0.0:8000)     │
│  • Assumption & Claim Extraction Engine (pipeline/assumption_engine.py)                │
│  • Multi-Candidate Decision Room & Pivot Engine (pipeline/decision_engine.py)          │
│  • Capstone / MVP Technical SRS Generator (pipeline/srs_generator.py)                  │
│  • Academic Research Client (OpenAlex, Europe PMC, Crossref with AI Relevance Gate)    │
│  • 6-Level Socratic Mom Test Validation Engine                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
                      │                                              │
                      ▼                                              ▼
┌────────────────────────────────────────┐     ┌────────────────────────────────────────┐
│        UNIVERSAL MULTI-PROVIDER GATEWAY│     │       STORAGE ADAPTER SUBSYSTEM        │
│  Dynamic Multi-Model Failover Cascade  │     │  Pluggable Local & Cloud Persistence   │
│  1. Google Gemini (gemini-3.8-flash)   │     │  • SQLite WAL (pipeline/ratchetai.db)  │
│  2. Groq Cloud (llama-3.3-70b @ 500t/s)│     │  • PostgreSQL (Neon / Supabase Cloud)  │
│  3. OpenRouter (Llama 3.3 70B Instruct)│     │  • Relational Schema + Zero-Ops WAL    │
│  4. Local Ollama (qwen2.5 / llama3.2)  │     │  • Cascading Foreign Key Integrity     │
└────────────────────────────────────────┘     └────────────────────────────────────────┘
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** $\ge 18.0.0$
- **Python** $\ge 3.12.0$

### 1-Click Multi-Device Launch (Localhost & Campus Wi-Fi)
```powershell
# Starts FastAPI on 0.0.0.0:8000 and Next.js on 0.0.0.0:3000
.\start.bat
```
- Open on host: `http://localhost:3000`
- Open on mobile/tablet (same Wi-Fi): `http://<YOUR_PC_IP>:3000`

### Worldwide Remote Sharing (Cloudflare Tunnel)
```powershell
# Automatically launches and displays a secure public HTTPS URL
.\share-tunnel.ps1
```

---

## 👥 About EMAERX

**EMAERX** is a technology and innovation team focused on exploring possibilities, engineering intelligent solutions, and advancing ideas into meaningful real-world outcomes.

- **Founders:** Mark Alvin, Mae Daniella Faith, John Emmanuel
- **Tagline:** *WHERE WHAT'S NEXT BEGINS.*
- **Brand Phrase:** *MAKE · EXPLORE · ADVANCE*
- **Profiles:** Read [docs/about/EMAERX.md](docs/about/EMAERX.md) and [docs/about/product/CONVERA.md](docs/about/product/CONVERA.md).

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
