# CONVERA SDD-018: Implementation & Architecture Plan
# Research Stage F Proposal Canvas & Feasibility Engine

**Specification ID**: CONVERA-SDD-018  
**Classification**: Implementation Plan & Architectural Roadmap  
**Authority Tier**: Tier 2 (Engineering Execution Plan)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/018-research-stage-f-proposal-canvas`  
**Target Integration Branch**: `develop`  

---

## 1. System Architecture Overview

**Research Stage F** provides the culminating synthesis, regulatory compliance verification, feasibility assessment, and Gate 4 proposal defense clearance for the 6-stage Computing Research & DSR Ratchet.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Research Cockpit / Stage F                      │
│     (web/src/components/research/feasibility/StageFFeasibilityView.tsx)│
│     - Ethics & Compliance Checklist (RA 10173 & IRB Protocol)         │
│     - Priority Roadmap Alignment (UN SDGs & DOST-PCIEERD NAIR)         │
│     - Resource Budget & Timeline Calculator                            │
│     - Living DSR Proposal Canvas & Markdown/Document Exporter          │
│     - Attributable Gate 4 Advisor Defense Clearance & Sign-off         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Frontend Service (feasibilityService.ts)                 │
│    evaluateFeasibility()              getFeasibilityRecord()           │
│    compileDSRProposal()               submitMentorSignoff()            │
│    listMentorSignoffs()                                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             API Router (backend/routers/feasibility.py)                │
│    POST /api/feasibility/evaluate                                      │
│    GET  /api/feasibility/session/{session_id}                          │
│    POST /api/feasibility/compile-proposal                              │
│    POST /api/feasibility/mentor-signoff                                │
│    GET  /api/feasibility/mentor-signoff/{project_id}                   │
└─────────────────┬────────────────────────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│ FeasibilityEngine & ProposalExporter │ │     ResearchOrchestrator      │
│ (backend/engines/)                   │ │ (AUDIT_COMPLIANCE_FEASIBILITY │
│ - Regulatory & Privacy Audit Matrix  │ │  & COMPILE_PROPOSAL_CANVAS)   │
│ - Deterministic Budget & Scoring     │ └───────────────────────────────┘
│ - Full 6-Stage Reactive Monograph    │
│ - Degraded Fallback Diagnostics      │
└─────────────────┬────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│           SQLite Storage Adapter (backend/storage/sqlite_adapter.py)   │
│             New Table: research_feasibility_records (Table 35)         │
│             Integrated Table: mentor_signoffs & gate_reviews           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Stack & Invariants

| Layer | Component | Language / Framework | Constraints |
|:---|:---|:---|:---|
| **Presentation** | `StageFFeasibilityView.tsx` and sub-panes | Next.js 15, React 19, Tailwind CSS | Strictly 0 new npm packages (Article VII) |
| **Frontend API** | `feasibilityService.ts` | TypeScript 5 | Native Fetch API |
| **API Transport** | `routers/feasibility.py` | FastAPI, Pydantic v2 | Standard Starlette routing |
| **Domain Logic** | `engines/feasibility_engine.py`, `engines/proposal_exporter.py` | Python 3.13 | Deterministic core + LLM Gateway |
| **Workflow Routing** | `services/research_orchestrator.py` | Python 3.13 | Methodology Contracts & Provenance |
| **Persistence** | `storage/sqlite_adapter.py` | SQLite 3 (WAL mode) | Parameterized SQL, Table 35 |

---

## 3. Detailed Component Plan

### 3.1 Relational Storage Layer (`backend/storage/`)
1. Create table `research_feasibility_records` (Table 35) in `backend/storage/sqlite_adapter.py`:
   - Primary key `id` (UUID), `session_id`, `project_id`.
   - Store structured JSON columns for:
     - `ethics_checklist_json` (RA 10173 items, consent protocol, IRB tier, data minimization).
     - `sdg_alignments_json` (Target SDGs, rationale, specific targets).
     - `dost_alignments_json` (DOST-PCIEERD / NAIR priority sector, alignment rationale).
     - `budget_breakdown_json` (Hardware, cloud compute, dataset acquisition, pilot travel).
   - Numerical metrics: `timeline_weeks` (int), `feasibility_score` (float 0.0–100.0).
   - Governance status: `is_cleared` (bool), `cleared_at` (timestamp), `created_at`, `updated_at`.
2. Add abstract storage contract methods in `backend/storage/base.py`:
   - `save_feasibility_record(data: Dict[str, Any]) -> Dict[str, Any]`
   - `get_feasibility_record(session_id: str) -> Optional[Dict[str, Any]]`
3. Implement parameterized SQL queries in `backend/storage/sqlite_adapter.py`.

### 3.2 Domain Engines (`backend/engines/`)

#### 3.2.1 `FeasibilityEngine` (`backend/engines/feasibility_engine.py`)
1. **Deterministic Compliance & Scoring**:
   - `evaluate_feasibility(request: FeasibilityEvaluationRequest) -> FeasibilityEvaluationResult`:
     - Evaluates mandatory compliance criteria:
       - Data Privacy Act 2012 compliance (telemetry anonymization, data subject consent, minimal collection).
       - Institutional review status (REC / IRB exemption or clearance).
       - National roadmap alignment (at least 1 validated SDG + 1 DOST-PCIEERD sector).
       - Budget and timeline sanity bounds (e.g., timeline $\le$ 24 weeks for undergraduate/master thesis; budget items positive).
     - Calculates deterministic composite feasibility score:
       $$S_{\text{feasibility}} = 0.35 \times S_{\text{compliance}} + 0.25 \times S_{\text{alignment}} + 0.25 \times S_{\text{budget}} + 0.15 \times S_{\text{timeline}}$$
2. **Advisory AI Synthesis**:
   - Invokes `generate_response_with_fallback` with task category `TaskCategory.ETHICAL_REVIEW` to generate constructive ethics advisory, potential dual-use risks, and institutional defense tips.
   - Enforces Article II Tri-Part Confidence: AI commentary cannot alter deterministic feasibility score or override regulatory compliance failures.
3. **Degraded Offline Fallback**:
   - Generates deterministic rule-based ethics advisories if LLM providers are unreachable, setting `is_degraded = True`.

#### 3.2.2 `ProposalExporter` Dynamic Upgrade (`backend/engines/proposal_exporter.py`)
1. Connect directly to live relational state:
   - Queries `problems` for Stage A variables, sufferer context, quantified friction.
   - Queries `claim_evidence_links` and `scholarly_works` for Stages B & C empirical grounding and literature matrix.
   - Queries `dsr_artifacts` for Stage D artifact classification, algorithmic architecture, and kernel theories.
   - Queries `concept_evaluations` and `circumscription_iterations` for Stage E rigor scores, benchmark metrics, and loopback lineage.
   - Queries `research_feasibility_records` and `mentor_signoffs` for Stage F compliance, budget, and attributable defense clearance.
2. Returns structured JSON containing:
   - `proposal_markdown`: Full formatted publication-ready Markdown proposal.
   - `section_data`: Deconstructed section-by-section JSON payloads for frontend canvas rendering.
   - `readiness_audit`: Gate 1–4 compliance checklist summary.

### 3.3 Orchestrator Integration (`backend/services/research_orchestrator.py`)
1. Extend `ActionType`:
   - `AUDIT_COMPLIANCE_FEASIBILITY`: Runs feasibility audit and attaches results to session.
   - `COMPILE_PROPOSAL_CANVAS`: Triggers full dynamic 6-stage proposal compilation.
2. Extend `dispatch_action` handler to execute these actions and persist orchestration events.

### 3.4 API Router (`backend/routers/feasibility.py`)
1. `POST /api/feasibility/evaluate`: Evaluates and persists feasibility record.
2. `GET /api/feasibility/session/{session_id}`: Fetches current session's feasibility state.
3. `POST /api/feasibility/compile-proposal`: Compiles and returns full 6-stage DSR Proposal Canvas.
4. `POST /api/feasibility/mentor-signoff`: Records formal mentor/advisor defense authorization.
5. `GET /api/feasibility/mentor-signoff/{project_id}`: Retrieves sign-off history.
6. Register router in `backend/server.py`.

### 3.5 Frontend Service & Presentation Layer (`web/src/`)
1. **Frontend Service Client** (`web/src/services/feasibilityService.ts`):
   - TypeScript definitions for feasibility records, SDG mappings, budget items, and proposal payloads.
   - API client methods with error handling and fallback support.
2. **Stage F Workspace View** (`web/src/components/research/feasibility/StageFFeasibilityView.tsx`):
   - Sub-tab 1: *Regulatory & Ethics Checklist* (RA 10173, consent, IRB status).
   - Sub-tab 2: *Roadmap Alignment* (interactive SDG cards, DOST-PCIEERD sectors, WVSU core values).
   - Sub-tab 3: *Feasibility Budget & Timeline* (hardware, compute, sample size, Gantt schedule).
   - Sub-tab 4: *Living DSR Proposal Canvas* (interactive tabbed monograph with Copy/Download Markdown).
   - Sub-tab 5: *Gate 4 Defense Clearance* (rubric verification + attributable mentor sign-off card).
3. **Mount in Workspace Layout**:
   - Replace placeholder card in `web/src/components/frameworks/research/ResearchWorkspaceView.tsx` with `<StageFFeasibilityView />`.

---

## 4. Verification & Testing Strategy

1. **Backend Unit & Integration Tests** (`backend/tests/test_feasibility_engine.py`):
   - Table 35 schema creation, CRUD, and session linkage.
   - Deterministic feasibility score calculations.
   - RA 10173 and ethics compliance rule evaluation.
   - Dynamic `ProposalExporter` end-to-end compilation with all 6 stages populated.
   - Orchestrator action dispatch for `AUDIT_COMPLIANCE_FEASIBILITY` and `COMPILE_PROPOSAL_CANVAS`.
   - API router endpoints status 200 verification.
2. **Frontend Typecheck & Build**:
   - `npm run typecheck --prefix web` exiting 0 with zero type errors.
   - `npm run build --prefix web` compiling cleanly without SSR hydration or bundle issues.
3. **Full Regression Suite**:
   - `PYTHONPATH=backend pytest backend/tests -m "not live"` ensuring 100% passing tests (zero regression across SDD-001 through SDD-017).
4. **Knowledge Graph Synchronization**:
   - Run `graphify update .` to index new AST symbols and maintain graph completeness.
