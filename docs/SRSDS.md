# Software Requirements & System Design Specification (SRSDS)

**Project:** RatchetAI — Evidence-Ratcheted Problem-to-Solution Venture Engine  
**Version:** 2.0.0 (High-Concurrency SQLite WAL & Multi-Device Team Collaboration)  
**Standard Compliance:** IEEE 830 / ISO/IEC/IEEE 29148 / IEEE 1016-2009 / Nielsen Norman Heuristics  
**Status:** Approved / Production Verified  
**Last Updated:** September 3, 2026  

---

## 1. Executive Summary & System Vision

### 1.1 Purpose & Scope
RatchetAI is an **evidence-ratcheted technopreneurship validation platform** engineered to eliminate premature solutioning. It enforces strict empirical validation gates across 5 progressive venture development phases, guiding student founders and technopreneurs in building viable, locally grounded ventures in the Western Visayas / Philippine ecosystem.

### 1.2 The Mechanical Ratchet Invariant
The fundamental governing invariant of RatchetAI is the **one-way mechanical ratchet**:
$$\text{Phase}_{k+1} \text{ Unlocked} \iff \text{Gate}(\text{Phase}_k) = \text{PASSED}$$
Downstream solution ideation and prototyping (Phases 4 & 5) are strictly locked until upstream problem definition and customer discovery (Phases 1, 2, & 3) pass empirical rigor checks.

---

## 2. System Architecture & Component Model

RatchetAI employs a decoupled **PC-Powered High-Performance Hybrid Architecture** supporting zero-latency local development, LAN multi-device access, zero-config worldwide remote tunnels, and cloud database deployment:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT / MULTI-DEVICE TIER                                │
│  Next.js 15 (App Router) • React 19 • Tailwind CSS • Glassmorphism Design System       │
│  • 5-Phase Interactive Workspace (Mobile, Tablet, Desktop)                             │
│  • Team Room Collaboration & Live Project Join (Share Codes: `RATCH-XXXX`)             │
│  • Interactive 6-Slide Pitch Presentation Deck Canvas (`PresentationModal`)           │
│  • Access: Localhost (`:3000`), Campus Wi-Fi (`0.0.0.0:3000`), or Cloudflare Tunnel    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / Relative Proxy (`/api/...`)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             API / SERVICE ORCHESTRATION TIER                            │
│  FastAPI (Python 3.12) • Pydantic v2 • Asyncio Service Engine (Host: 0.0.0.0:8000)     │
│  • Socratic Mom Test Validation Engine                                                 │
│  • 10-Column Screening & Triage Pipeline                                               │
│  • 15-Mechanism SVB Matrix Generator                                                   │
│  • Milestone Snapshot & Historical Rollback Manager                                    │
└─────────────────────┬──────────────────────────────────────────────┬───────────────────┘
                      │                                              │
┌─────────────────────▼────────────────────────┐ ┌───────────────────▼───────────────────┐
│        UNIVERSAL MULTI-PROVIDER GATEWAY       │ │          STORAGE ADAPTER SUBSYSTEM    │
│  Dynamic Multi-Model Failover Cascade        │ │  Pluggable Local & Cloud Persistence  │
│  1. Google Gemini (gemini-3.5-flash) [Free]  │ │  • SQLite WAL (`pipeline/ratchetai.db`)│
│  2. Groq Cloud (llama-3.3-70b @ 500t/s)[Free]│ │  • PostgreSQL (Neon/Supabase Cloud)   │
│  3. OpenRouter (Llama 3.3 70B Instruct)[Free]│ │  • Automatic Legacy JSON Migration    │
│  4. Local Ollama (qwen2.5 / llama3.2) [Free] │ │  • Relational Schema + JSONB Storage  │
└──────────────────────────────────────────────┘ └───────────────────────────────────────┘
```

---

## 3. Storage Architecture & Relational Schema Specification

### 3.1 Pluggable Storage Adapter Subsystem (`pipeline/storage/`)
The storage subsystem adheres to the **Open-Closed Principle (OCP)** via an abstract interface, allowing runtime selection via environment variables:

$$\text{StorageEngine} = \begin{cases} 
\text{PostgresStorageAdapter} & \text{if } \text{DATABASE\_URL starts with } \text{"postgresql"} \\
\text{SQLiteStorageAdapter (WAL Mode)} & \text{otherwise (Default Local Engine)}
\end{cases}$$

### 3.2 Relational & JSONB Schema Definition

#### A. Table `projects`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Global unique project identifier (e.g. `proj_iloilo_agri`) |
| `share_code` | `TEXT` | `UNIQUE, INDEX` | Human-friendly room code (e.g. `RATCH-AGRI`, `RATCH-7K9`) |
| `name` | `TEXT` | `NOT NULL` | Friendly venture project name |
| `created_by` | `TEXT` | `DEFAULT 'Founder'` | Creator username or student identifier |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Project initialization timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last modification timestamp |

#### B. Table `sessions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `session_id` | `TEXT` | `PRIMARY KEY` | Unique session token (`YYYYMMDD_HHMMSS`) |
| `project_id` | `TEXT` | `REFERENCES projects(id)` | Parent project workspace |
| `project_name` | `TEXT` | `NOT NULL` | Human-readable venture title |
| `state_data` | `TEXT` | `NOT NULL` | Complete 5-phase `SessionState` payload (JSON) |
| `phase1_complete`| `INTEGER` | `DEFAULT 0` | Phase 1 gate status |
| `phase2_complete`| `INTEGER` | `DEFAULT 0` | Phase 2 gate status |
| `phase3_complete`| `INTEGER` | `DEFAULT 0` | Phase 3 gate status |
| `phase4_complete`| `INTEGER` | `DEFAULT 0` | Phase 4 gate status |
| `phase5_complete`| `INTEGER` | `DEFAULT 0` | Phase 5 gate status |
| `last_edited_by` | `TEXT` | `DEFAULT 'Founder'` | Last editor attribution |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last synchronization timestamp |

#### C. Table `session_snapshots` (Pivot History & Milestone Rollbacks)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Snapshot record identifier |
| `session_id` | `TEXT` | `REFERENCES sessions(session_id)` | Target session |
| `label` | `TEXT` | `NOT NULL` | e.g. "Pre-Phase 3 Gate", "Post-Pivot Branch" |
| `phase_number` | `INTEGER` | `CHECK (1 <= phase_number <= 5)` | Active phase at snapshot |
| `state_data` | `TEXT` | `NOT NULL` | Frozen `SessionState` copy |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Snapshot creation timestamp |

---

## 4. Software Requirements Specification (SRS)

### 4.1 Functional Requirements

- **FR-01 (Problem Discovery Matrix):** Scans 8 regional economic sectors in Western Visayas, extracting verified sufferers, friction, and existing workarounds while translating solutions-in-disguise into root problems.
- **FR-02 (10-Column Screening Scorecard):** Evaluates problem batches across 5 criteria (Pain, Frequency, Market Size, Sacrifice, Access) on a 1–5 scale, assigning `ADVANCE TO VALIDATION`, `SECOND LOOK (CONDITIONAL)`, or `PARK / SHELVED` verdicts.
- **FR-03 (Socratic Mom Test Defense Clinic):** Conducts 6-level conversational interview validation, demanding concrete figures, past behaviors, and actual monetary/time sacrifices while rejecting hypothetical promises and polite praise.
- **FR-04 (Multi-Mechanism SVB Ideation):** Forces 4 divergent solution hypotheses across 15 Mechanism Families (Software, Hardware, Physical, Financial, Logistics, Social) and identifies the single Riskiest Assumption ($P_1$).
- **FR-05 (Behavioral Commitment MVP Audit):** Audits test results against the 5-Tier Commitment Hierarchy (Financial, Time, Reputation, Attention, Verbal), recommending `SCALE`, `PIVOT`, or `PERSEVERE`.
- **FR-06 (Shared Project Collaboration):** Allows multiple groupmates to access and edit the same venture project in real time using a 6-character room code (`RATCH-XXXX`).
- **FR-07 (Snapshot & Rollback Management):** Enables 1-click branching or rollback to any prior milestone if a customer interview invalidates an assumption.
- **FR-08 (Venture Dossier & Pitch Presentation Export):** Compiles complete venture artifacts into downloadable Markdown, printable PDF, and interactive full-screen pitch presentation slides.

### 4.2 Non-Functional Requirements

- **NFR-01 (Zero-Cost Operation):** The complete platform operates on 100% free local hardware and free cloud tiers (Vercel Hobby, Cloudflare Quick Tunnels, Google AI Studio / Groq Free APIs).
- **NFR-02 (Resilient LLM Failover):** If the primary LLM returns HTTP 429 / 503, the gateway automatically cascades to secondary providers within 1.5s without crashing the client request.
- **NFR-03 (Nielsen Norman Heuristic #2 Alignment):** Employs natural, human-centered language and regional Philippine concepts (*Barangays, Municipalities, Biyaheros, Farmgate prices, MSMEs*) across all UI views and microcopy.
- **NFR-04 (High-Concurrency Read Performance):** SQLite Write-Ahead Logging (`WAL`) mode ensures zero database lock contention when multiple teammates query the workspace simultaneously.

---

## 5. Multi-Device & Remote Team Sharing Blueprint

```
====================================================================================================
ACCESS METHOD       COMMAND                       NETWORK SCOPE               BEST FOR
====================================================================================================
1. Localhost        `.\start-dev.ps1`             Host PC (`localhost:3000`)  Fastest local editing
2. Campus Wi-Fi     `.\start-dev.ps1`             Same Wi-Fi (`192.168.1.X`)  Classroom & lab group work
3. Cloudflare Tunnel`.\share-tunnel.ps1`          Worldwide HTTPS Public Link Remote teamwork at home
====================================================================================================
```

---

## 6. Verification & Test Suite Status

- **Backend Pytest Suite:** `python -m pytest pipeline/tests/` ➔ **10 / 10 Tests Passed (100%)**
  - `tests/test_gates.py` (Mechanical Ratchet & Concept Minimums)
  - `tests/test_schemas.py` (Pydantic Data Models)
  - `tests/test_storage.py` (SQLite WAL, CRUD, Snapshots, Share Codes)
- **Frontend Production Build:** `npm run build` ➔ **4 / 4 Static Pages Compiled (0 Errors)**
- **UI/UX Standard Compliance:** Certified 100% compliant with Nielsen Norman Usability Heuristics and UI/UX Design Framework v3.0.
