# CONVERA Frontend Architecture Specification

**Document ID**: `CONVERA-FE-001`  
**Classification**: Next.js 15.2.0 App Router & Client Architecture  
**Authority Tier**: Tier 2 Frontend Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/06-frontend/FRONTEND_ARCHITECTURE.md`  
**Upstream Dependencies**: `02-system/SYSTEM_ARCHITECTURE.md, 01-product/CAPABILITIES.md`  
**Downstream Dependents**: `06-frontend/DESIGN_SYSTEM.md, 06-frontend/INFORMATION_ARCHITECTURE.md`  

---

`[AUTHORITATIVE PRESENTATION LAYER SPECIFICATION]`
*Document Version: 1.0.0*  
*Last Verified: 2026-09-04*  
*Target Application: `web/` (Next.js 15.2.0 App Router, React 19, TypeScript 5.8, Tailwind CSS v4)*  
*Authority Boundary: Subordinate to SYSTEM_ARCHITECTURE.md (Area 1 / Area 4) and SECURITY.md; Governs all web presentation components and client-side orchestration*

---

## 1. Document Authority & Scope

This specification authoritatively documents the **presentation-layer architecture** for the CONVERA platform, based directly on verified implementation evidence from the `web/` codebase.

### Core Architectural Boundaries

* **Subordinate to Core Architecture**: The frontend represents Area 1 (Presentation & Interaction) and client-side endpoints of Area 4 (System Integration). Backend domain logic, epistemic validation rules, persistence invariants, and AI governance are authoritatively defined in `SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `EVIDENCE_MODEL.md`, and `AI_GOVERNANCE.md`.
* **No Secondary Domain Logic**: The frontend MUST NOT re-implement or fork backend domain logic (e.g., Net Epistemic Balance computation, blast-radius propagation algorithms). The frontend acts as a structured presentation and epistemic interaction interface.
* **Separation of Concerns**: Presentation state (active phase view, drawer toggles, modal visibility) is strictly separated from canonical backend entity state.

---

## 2. Frontend Architectural Position

The frontend occupies the outermost client layer of the CONVERA topology:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. USER & HUMAN GATEKEEPERS (Founders, Researchers, Mentors, Evaluators)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Interactive Input & Visual State
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. PRESENTATION LAYER (`web/`)                                              │
│ • Next.js 15 App Router (`web/src/app/`)                                    │
│ • Component Hierarchy: Atoms, Domain Cards, Workspaces (`web/src/components/`)│
│ • State Hooks (`useSession.ts`) & UI Sanitizers (`sanitize.ts`)             │
│ • Domain Services & API Transport (`web/src/services/`, `api-client.ts`)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Strict HTTP/REST API Boundary (`/api/*`)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. APPLICATION & ROUTER API (`backend/routers/`)                            │
│ • FastAPI HTTP Endpoints (`/api/research`, `/api/knowledge`, etc.)          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. DOMAIN ENGINES & PERSISTENCE (`backend/engines/`, `backend/storage/`)     │
│ • Epistemic Calibration, Impact Propagation, SQLite WAL (23 Tables), CIIA  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Isolation Invariants

* **Direct Persistence Isolation**: The frontend has **zero direct access** to SQLite databases, raw SQL drivers, or backend persistence adapters.
* **Direct AI Isolation**: The frontend has **zero direct access** to upstream AI provider SDKs (OpenAI, Anthropic, Gemini, Ollama); all cognitive processing is routed through backend CIIA gateways.
* **Direct Connector Isolation**: The frontend has **zero direct access** to external scholarly connector APIs (OpenAlex, Crossref, PubMed); all ingestion passes through backend connector hubs.

---

## 3. Technology Baseline

Based directly on `web/package.json`, `web/tsconfig.json`, and `web/postcss.config.mjs`:

| Technology / Library | Verified Version | Architectural Role | Implementation Scope |
| :--- | :--- | :--- | :--- |
| **Next.js** | `15.2.0` | Application Framework & Server Engine | App Router (`web/src/app/`) |
| **React** | `^19.0.0` | UI Component & Rendering Engine | Client & Server Components |
| **React DOM** | `^19.0.0` | DOM Rendering & Hydration | Root Hydration & Portals |
| **TypeScript** | `^5.8.2` | Static Type System | Strict Mode (`tsconfig.json`) |
| **Tailwind CSS** | `^4.0.9` | Utility-First Styling Framework | `@import "tailwindcss";` (`globals.css`) |
| **PostCSS** | `^8.5.3` | CSS Processing Pipeline | `@tailwindcss/postcss ^4.0.9` |
| **Framer Motion** | `^13.2.0` | Animation & Micro-Interactions | Modal transitions, drawer slides, accordion unfolds |
| **Lucide React** | `^1.16.0` | Iconography | Semantic status & navigation icons |
| **React Markdown** | `^10.1.0` | Safe Markdown Rendering | Formatted literature snippets & dossiers |
| **Rehype Raw / Remark GFM** | `^7.0.0` / `^4.0.1` | Markdown AST & Table Plugins | Literature synthesis & Markdown tables |
| **Tailwind Merge / Clsx** | `^3.0.2` / `^2.1.1` | Dynamic Class Composition | Class name deduplication and variant switching |

---

## 4. Application & Routing Architecture

### 4.1 Route Topology (`web/src/app/`)

The application is structured around a centralized Single-Page Stepper Architecture:

```text
web/src/app/
├── layout.tsx       # Root Server Component (HTML/Body, Fonts, Metadata)
├── page.tsx         # Central Client Orchestrator ("use client", Stepper Router)
└── globals.css      # Tailwind v4 Root Directives & CSS Custom Properties
```

* **Root Layout (`layout.tsx`)**: Server Component configuring global metadata, `GeistSans` and `GeistMono` typography, viewport constraints, and base HTML structure.
* **Central Page Orchestrator (`page.tsx`)**: Client Component (`"use client"`) managing the active phase stepper, global modal states (Command Palette, Help Center, Presentation Mode), drawer panels, and active session context.
* **View Mounting Strategy**: Rather than traditional multi-page route segment navigation, CONVERA implements an epistemic phase pipeline where active phase views (`Phase1View` through `Phase5View`) are mounted conditionally based on `currentPhase` state managed by `useSession.ts`.

### 4.2 Modal & Drawer Navigation

Secondary and tertiary epistemic operations are decoupled from primary stage progression through overlay architecture:
* **Global SlideOver Drawers**: `TraceabilityDrawer` (Requirements & Graph Edges), `UnknownsMap` (Active Inquiries), `IntelligenceScorecardDrawer` (Epistemic Balance & Metrics), `CheatsheetDrawer` (Guidance & Shortcuts).
* **Focused Workspace Modals**: `DecisionRoomWorkspace` (Phase 2 Multi-criteria Evaluation), `GateReviewModal` (Stage-Gate Governance Review), `BlindSpotModal` (Unchecked Assumptions), `CitationVerifierModal` (Source Provenance Auditing).

---

## 5. Component Architecture & Hierarchy

The component library (`web/src/components/`, 75+ modules) is organized into four clean structural layers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 4: PAGE / WORKSPACE COMPOSITION (`web/src/app/page.tsx`)              │
│ Orchestrates Stepper, Session Context, Drawers, and View Mounting          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 3: COMPLEX WORKSPACES (`components/phases/`, `components/deliverables/`)│
│ • Phase1View .. Phase5View, DecisionRoomWorkspace, DeliverablesStudio        │
│ • CircumscriptionLoopView, ResearchWorkspaceView, ProblemBankView           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: DOMAIN WIDGETS (`components/problem-bank/`, `components/knowledge/`)│
│ • AssumptionRadarCard, EvidenceLedgerCard, ImpactAlertBanner                │
│ • TraceabilityDrawer, UnknownsMap, GateReviewModal                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: FOUNDATION / PRIMITIVE ATOMS (`components/common/`, `auth/`)       │
│ • Card, Badge, Button, Input, Modal, SlideOver, Tabs, ProgressBar           │
│ • Skeleton, EmptyState, AlertBanner, Tooltip, RadialProgress                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

* **Layer 1 (Primitives)**: Pure presentation atoms with zero business knowledge. Enforce design tokens, focus states, ARIA roles, and micro-interactions.
* **Layer 2 (Domain Widgets)**: Context-aware components bound to specific canonical entities (`ProblemClaim`, `LiteratureSource`, `ProblemAssumption`, `KnownUnknown`). Render epistemic status badges, corroboration indicators, and action triggers.
* **Layer 3 (Workspaces)**: Stateful orchestrators managing complex user workflows (e.g., pairwise problem screening, empirical test iteration loops, automated SRS export generation).
* **Layer 4 (Page Composition)**: Single entry-point layout connecting global session management, navigation bar, status banners, and active phase rendering.

---

## 6. API & Backend Communication Architecture

### 6.1 Transport Layer (`web/src/lib/api-client.ts`)

All HTTP communication is unified under `fetchApi<T>()`:

```
UI Component / Workspace
       │
       ▼ Calls Domain Function
Frontend Service Module (`web/src/services/*.ts`)
       │
       ▼ Invokes
`fetchApi<T>()` (`web/src/lib/api-client.ts`)
       │
       ▼ Standardized Headers (Content-Type, Bypass-Tunnel-Reminder, Auth)
HTTP/REST Request (`/api/*`)
       │
       ▼ Error Normalization (`ApiError` with HTTP status & payload)
Backend FastAPI Router (`backend/routers/*.py`)
```

### 6.2 Verified Service Modules (10 Services in `web/src/services/`)

| Service Module | Target Domain | Core Operations |
| :--- | :--- | :--- |
| `sessionService.ts` | Sessions & Projects | Create/load session, snapshot save/restore, project share-code lookup |
| `problemService.ts` | Problem Conception | Fetch problem bank, create/update problem statements, add comments |
| `phaseService.ts` | SDD Lifecycle | Phase 1–5 generation, phase transitions, stage execution |
| `knowledgeService.ts` | Epistemic Intelligence | Link evidence, compute epistemic balance, fetch tree, resolve alerts |
| `researchService.ts` | Track 2 Computing | Research workspace, hypothesis generation, paper analysis |
| `frameworkService.ts` | Iteration & Governance | Circumscription test runs, metric recording, gate review sign-offs |
| `deliverableService.ts` | Asset Generation | Export SRS, Lean Canvas, Pitch Deck, SWOT matrix dossiers |
| `connectorService.ts` | Scholarly Connectors | Trigger OpenAlex / Crossref / PubMed literature searches |
| `authService.ts` | Access & Roles | Verify passcode, project member role assignment |
| `agentService.ts` | Socratic Guidance | Socratic critique generation, devil's advocate challenges |

---

## 7. State Management & Data Flow Architecture

### 7.1 State Categorization & Boundary Matrix

CONVERA distinguishes four classes of state:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. EPHEMERAL UI STATE (React `useState` / `useReducer`)                     │
│ • Active tab, modal open/close, accordion expanded, search query filter.    │
│ • Lifetime: Component mount / user interaction.                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. SESSION & WORKSPACE STATE (`web/src/hooks/useSession.ts`)                │
│ • Active `sessionId`, `projectId`, `currentPhase`, `researchTrack`.         │
│ • Lifetime: Research session; synced with browser `localStorage`.           │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. CACHED DOMAIN STATE (Service Response Data)                              │
│ • Ingested problems, linked claims, assumption tests, contradiction alerts. │
│ • Fetched on phase mount; invalidated on mutation.                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. CANONICAL SYSTEM STATE (Backend SQLite Database)                         │
│ • Supreme source of truth: 23 Relational Tables in `backend/convera.db`.     │
│ • Uniquely authoritative for all epistemic, audit, and decision records.    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 State Management Invariant

* **No Global Store Bloat**: The application avoids external heavy state managers (Redux, Zustand) in favor of cohesive React 19 functional state, custom composition hooks (`useSession`), and direct service invocations.
* **Local Storage Scope**: `localStorage` is strictly restricted to caching session identification (`convera_session_id`, `convera_project_id`, share codes) and offline draft resilience. It NEVER serves as canonical truth.

---

## 8. Data Ownership Boundary

| Entity / Concern | Frontend Ownership | Backend Ownership | Authority & Invariant |
| :--- | :---: | :---: | :--- |
| **Active UI View & Modals** | 🟢 Sole Owner | ❌ None | Ephemeral presentation state |
| **Form Inputs & Draft Edits** | 🟢 Temporary | ❌ None | Unsubmitted local buffer |
| **Canonical Problem Statements** | ❌ Consumer | 🟢 Authoritative | Stored in Table `T05: problems` |
| **Epistemic Balance Scores** | ❌ Display Only | 🟢 Authoritative | Calculated by `knowledge_lifecycle.py` |
| **Evidence Provenance & Lineage** | ❌ Display Only | 🟢 Authoritative | Managed by `ProvenanceEngine` (Table T17) |
| **Decision Records & Gate Reviews** | ❌ Display Only | 🟢 Authoritative | Recorded via Human Authorization (T11/T21) |
| **Impact Invalidation Blast-Radius**| ❌ Alert Consumer | 🟢 Authoritative | Propagated by `impact_engine.py` |

---

## 9. Rendering & Client/Server Boundaries

### 9.1 Component Distribution

An analysis of the `web/src/` codebase reveals:
* **Client Components (`"use client"`)**: **63 modules** (including `page.tsx`, all Phase views, interactive domain cards, drawers, and modals).
* **Server Components / Utility Modules**: **28 modules** (including `layout.tsx`, static types, API client utilities, and design constants).

### 9.2 Client Dominance Rationale

Because CONVERA operates as an **interactive, highly reactive epistemic workbench** requiring continuous state mutation, live Socratic dialogue, dynamic graph rendering, and rich modal workflows, the primary interactive application tree is intentionally client-rendered within the Next.js App Router boundary.

---

## 10. Responsive Architecture & Viewport Targets

* **Primary Target**: Desktop Epistemic Workbench ($\ge 1024	ext{px}$, `lg:` and `xl:` breakpoints).
* **Breakpoints**:
  * `sm:` ($640	ext{px}$): Single-column stacked layouts, full-width inputs.
  * `md:` ($768	ext{px}$): 2-column problem comparison grids, compact navbar.
  * `lg:` ($1024	ext{px}$): Standard 3-column workbench, visible multi-pane drawers.
  * `xl:` ($1280	ext{px}$): Expanded matrix tables, side-by-side decision workspace.
  * `2xl:` ($1536	ext{px}$): Max container constraint `max-w-7xl` with generous guttering.
* **Drawer Behavior**: Slide-over panels (`SlideOver.tsx`) span `w-full max-w-md` on desktop and collapse to full-screen mobile drawers on viewports $<768	ext{px}$.

---

## 11. Loading, Error & Empty-State Architecture

| State Class | Reusable Component | Visual Representation | Epistemic Role |
| :--- | :--- | :--- | :--- |
| **Loading** | `Skeleton.tsx`, `RadialProgress.tsx` | Shimmer pulse cards & progress arcs | Non-blocking asynchronous query feedback |
| **General Error** | `AlertBanner.tsx` | Bordered red/amber dismissible banner | Transport failures, validation errors |
| **Epistemic Invalidation** | `ImpactAlertBanner.tsx` | Rose-tinted pulsing alert with blast count | Notifies user that an upstream claim falsification requires downstream recalibration |
| **Empty State** | `EmptyState.tsx` | Centered icon, title, description, and CTA | Guides researcher to initiate ingestion or add first claim |
| **Degraded AI Mode** | `ContextualAiHint.tsx` | Amber-tagged fallback badge | Transparently signals cached or degraded AI heuristics |

---

## 12. Security Boundary & Client Protection

Cross-referencing `docs/03-engineering/SECURITY.md`:

* **SEC-FE-01: Zero Client Secret Storage**: No API private keys, database credentials, or LLM provider tokens are bundled or exposed in frontend code.
* **SEC-FE-02: Input & Output Sanitization**: All user-rendered strings and Markdown outputs pass through `sanitize.ts` (`sanitizeText()`, `cleanExcerpt()`) to strip dangerous HTML and malformed injection sequences.
* **SEC-FE-03: Authorization Propagation**: Project passcodes and session tokens are transmitted strictly via HTTP request headers (`x-passcode`, `Authorization: Bearer <token>`).
* **SEC-FE-04: Secure Linkage**: All external citation and literature URLs rendered in `EvidenceLedgerCard` enforce `target="_blank" rel="noopener noreferrer"`.

---

## 13. Accessibility (a11y) Architecture

* **`[IMPLEMENTED]`**:
  * Semantic HTML structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`).
  * Keyboard navigation for modal dismissal (`Escape` listener) and Global Command Palette (`Cmd+K` / `Ctrl+K`).
  * ARIA attributes across interactive components (`aria-label`, `aria-expanded`, `aria-hidden`, `role="dialog"`).
  * High-contrast foreground/background token pairing (`#f8fafc` text on `#030712` canvas).
* **`[TARGET]`**: Complete WCAG 2.1 AAA certification across all complex interactive SVG graphs.
* **`[VERIFICATION]`**: Formal accessibility compliance requires automated Axe-core test suites and manual screen-reader auditing.

---

## 14. Performance & Optimization Architecture

* **Code Splitting**: Dynamic imports for heavy workspace modals (`DecisionRoomWorkspace`, `PresentationModal`, `DeliverablesStudio`).
* **Tree-Shaking**: Modular imports from `lucide-react` and `@headlessui/react` primitives.
* **Font Optimization**: Next.js built-in zero-layout-shift font optimization for `GeistSans` and `GeistMono`.
* **Fast Bundling**: Local development powered by Next.js 15 Turbopack compiler.

---

## 15. Failure & Degraded-Mode Architecture

The frontend maps system health into discrete, truthful visual states:

```
[SYSTEM STATUS]
       │
       ├─► ONLINE (Green)      ──► Full AI generation, real-time connector search, live impact calculation.
       │
       ├─► DEGRADED (Amber)    ──► Cached AI fallback, offline heuristic scoring; UI displays `ContextualAiHint` warning.
       │
       ├─► OFFLINE (Gray)      ──► Read-only session review from `localStorage`; mutations queued or disabled.
       │
       └─► ERROR (Rose)        ──► Action blocked; retry trigger displayed via `AlertBanner`.
```

> [!IMPORTANT]
> **Truthful Epistemic Degradation**: The frontend MUST NEVER visually disguise degraded or synthetic AI outputs as verified evidence. All synthetic fallbacks carry explicit visual indicators.

---

## 16. Architectural Invariants

* **FE-01: Governed Communication Boundary** `[NORMATIVE / IMPLEMENTED]`: Frontend communicates with backend services strictly via `/api/*` HTTP/REST interfaces.
* **FE-02: Non-Sovereignty Over Truth** `[NORMATIVE / IMPLEMENTED]`: Frontend never computes or overrides canonical epistemic balance or validation status.
* **FE-03: No Engine Bypassing** `[NORMATIVE / IMPLEMENTED]`: Frontend never directly queries persistence or LLM providers.
* **FE-04: Presentation / Data State Decoupling** `[NORMATIVE / IMPLEMENTED]`: Local UI presentation state is strictly isolated from canonical backend entities.
* **FE-05: Truthful Visual Degradation** `[NORMATIVE / IMPLEMENTED]`: Degraded AI modes and unverified claims are distinctly badged in the UI.
* **FE-06: Zero Secret Exposure** `[NORMATIVE / IMPLEMENTED]`: No backend credentials exist in client bundles.
* **FE-07: Non-Color Dependent Semantics** `[NORMATIVE / TARGET]`: Epistemic status badges pair color with text and icons (e.g., Checkmark + Emerald + "VERIFIED").
* **FE-08: Desktop-First Workbench Priority** `[IMPLEMENTED]`: Complex comparative matrices and decision workspaces prioritize desktop viewport ergonomics ($\ge 1024	ext{px}$).
* **FE-09: Human Governance Gate Prominence** `[NORMATIVE / IMPLEMENTED]`: Mentor sign-off and gate review triggers are prominently rendered in stage navigation.
* **FE-10: Architecture Integrity** `[NORMATIVE]`: All future frontend feature additions must adhere to the 4-layer component hierarchy and domain service pattern.

---

## 17. Architectural Dependency Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONVERA PRESENTATION LAYER                        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Layer 4: Page Orchestration (`web/src/app/page.tsx`)                   │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Layer 3: Workspaces (`Phases 1-5`, `DecisionRoom`, `Deliverables`)     │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Layer 2: Domain Widgets (`ProblemBank`, `EvidenceLedger`, `Unknowns`) │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Layer 1: Foundation Atoms (`Card`, `Button`, `Badge`, `Modal`, `Tabs`) │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │ Service Invocations
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Frontend Domain Services (10 Modules in `web/src/services/*.ts`)             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Standardized Requests
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ API Transport Client (`web/src/lib/api-client.ts`)                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP/REST (`/api/*`)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Backend FastAPI Routers (`backend/routers/*.py`)                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 18. Architectural Drift & Implementation Findings

| Item / Finding | Discovered Implementation State | Canonical Status & Recommendation |
| :--- | :--- | :--- |
| **Brand Name Drift** | Legacy docstrings in `design-system.ts` reference "RatchetAI". | Mark as documentation drift; update references to CONVERA in future refactoring pass. |
| **Missing `docs/06-frontend/`** | No frontend architecture documentation existed prior to this phase. | Formally baselined by `FRONTEND_ARCHITECTURE.md`. |
| **Accessibility Verification** | WCAG 2.1 AAA is a stated target but unverified by formal audit. | Classified as `[TARGET]` with verification requirement in Section 13. |
| **Routing Paradigm** | Implementation is a Single-Page Stepper application rather than multi-segment router. | Documented accurately in Section 4. |

---

## 19. Architectural Verification Matrix

| Invariant / Claim | Architectural Statement | Implemented Evidence File | Status |
| :--- | :--- | :--- | :--- |
| **FE-01** | Governed API boundary | `web/src/lib/api-client.ts`, `web/src/services/` | 🟢 **VERIFIED** |
| **FE-02** | Non-sovereignty over truth | `web/src/services/knowledgeService.ts` | 🟢 **VERIFIED** |
| **FE-03** | No engine/DB bypassing | `web/package.json` (zero direct DB/AI SDK deps) | 🟢 **VERIFIED** |
| **FE-04** | Presentation/Data Decoupling | `web/src/hooks/useSession.ts` | 🟢 **VERIFIED** |
| **FE-05** | Truthful degraded mode | `web/src/components/common/ContextualAiHint.tsx` | 🟢 **VERIFIED** |
| **FE-06** | Zero client secrets | `web/src/lib/api-client.ts` | 🟢 **VERIFIED** |
| **FE-07** | Non-color accessibility | `web/src/components/common/Badge.tsx` | 🟡 **PARTIALLY VERIFIED** |
| **FE-08** | Desktop workbench layout | `web/src/app/page.tsx`, `web/src/components/phases/` | 🟢 **VERIFIED** |
| **FE-09** | Governance gate prominence | `web/src/components/frameworks/research/GateReviewModal.tsx` | 🟢 **VERIFIED** |
| **FE-10** | 4-layer component structure | `web/src/components/` directory structure | 🟢 **VERIFIED** |
