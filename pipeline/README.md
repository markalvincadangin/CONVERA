# RatchetAI — Evidence-Ratcheted Venture Engine

**RatchetAI** is an AI-powered, Evidence-Ratcheted Problem-to-Solution Venture Engine designed for startup incubators, founders, and technopreneurship programs. It operationalizes a 5-phase evidence ratchet with Google ADK agents and enforces empirical validation in code.

*Empirical Validation Before Code. Relentless Evidence Over Polite Praise.*

---

## 🏛️ System Architecture

RatchetAI provides both a **Modern Full-Stack Web Application (Next.js 15 + FastAPI)** and an **Interactive Terminal CLI**:

```
                              ┌──────────────────────────────────────────────┐
                              │            RatchetAI Engine Core             │
                              │       (5-Phase Google ADK Multi-Agent)       │
                              └──────────────────────┬───────────────────────┘
                                                     │
                       ┌─────────────────────────────┴─────────────────────────────┐
                       ▼                                                           ▼
         ┌───────────────────────────┐                               ┌───────────────────────────┐
         │     FastAPI Backend       │                               │     Terminal CLI          │
         │   (pipeline/server.py)    │                               │     (pipeline/main.py)    │
         └─────────────┬─────────────┘                               └───────────────────────────┘
                       │ REST / SSE
                       ▼
         ┌───────────────────────────┐
         │   Next.js 15 Web App      │
         │   (web/ on port 3000)     │
         └───────────────────────────┘
```

---

## 🚀 Quick Start (100% Free Tier)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- A Google Gemini API key (**100% free** at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 2. Backend Setup
```bash
cd pipeline
pip install -r requirements.txt
copy .env.example .env
# Edit .env and set: GOOGLE_API_KEY=your_key_here
```

### 3. Running the Full-Stack Web App

**Terminal 1 — Start the FastAPI Agent Backend:**
```bash
cd pipeline
python -m uvicorn server:app --reload --port 8000
```

**Terminal 2 — Start the Next.js Frontend:**
```bash
cd web
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

### 4. Running the Terminal CLI (Alternative)
```bash
cd pipeline
python main.py
```

---

## 📋 5-Phase Evidence Ratchet

| Phase | Agent | Key Enforced Deliverable |
|---|---|---|
| **Phase 1: Discovery** | `phase1_researcher` | Multi-sector problem landscape with local Iloilo source citations |
| **Phase 2: Screening** | `phase2_screener` | 10-column scorecard + ADVANCE shortlist & Winnability advisory |
| **Phase 3: Validation** | `phase3_validator` | 6-level Mom Test clinic + 2-dimension scorecard (`/24` & `/20`) |
| **Phase 4: Ideation** | `phase4_ideator` | 15 Mechanism families, SVB canvas, and P1-P4 Experiment Cards |
| **Phase 5: MVP Testing** | `phase5_validator` | Behavioral Commitment Hierarchy audit (Tiers 1–5) & Pivot Analysis |

---

## 📁 Repository Layout

```
├── Framework - Evidence-Ratcheted Problem-to-Solution Pipeline.md
├── Phase 1 - Startup Problem Discovery.md
├── Phase 2 - Startup Problem Shortlisting.md
├── Phase 3 - Startup Problem Validation.md
├── Phase 4 - Solution Ideation & Hypothesis Formation.md
├── Phase 5 - Solution Validation & MVP Testing.md
│
├── pipeline/                          # Python Backend & ADK Agents
│   ├── server.py                      # FastAPI REST & SSE backend
│   ├── main.py                        # Terminal CLI runner
│   ├── requirements.txt               # Dependencies
│   ├── .env.example                   # API configuration
│   ├── gates/                         # Code-enforced phase rules & level steppers
│   ├── schemas/                       # Pydantic models (Phases 1-5)
│   ├── prompts/                       # Agent system prompts (Phases 1-5)
│   └── sessions/                      # File-based JSON project states
│
└── web/                               # Next.js 15 App Router Frontend
    ├── src/
    │   ├── app/                       # Page routes & global styles
    │   ├── components/                # Modular React UI components
    │   │   ├── common/                # Button, Badge, Card, Modal, Spinner
    │   │   ├── layout/                # Navbar, PipelineStepper, SessionManager, CheatsheetDrawer
    │   │   └── phases/                # Phase 1, 2, 3, 4, 5 Views
    │   ├── hooks/                     # Custom React hooks
    │   ├── lib/                       # Types, constants, formatters, api-client
    │   └── services/                  # Session & Phase API service layer
    ├── package.json
    └── tailwind.config.ts
```


