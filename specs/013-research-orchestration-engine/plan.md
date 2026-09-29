# CONVERA SDD-013: Implementation Plan
# Research Orchestration Engine (Unified Intelligence & Research Loop)

**Specification ID**: CONVERA-SDD-013  
**Classification**: Implementation Plan & Component Architecture  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Canonical Path**: `specs/013-research-orchestration-engine/plan.md`  
**Upstream Dependencies**: `specs/013-research-orchestration-engine/spec.md`, `specs/013-research-orchestration-engine/data-model.md`  

---

## 1. Component Architecture & Information Flow

The Research Orchestration Engine acts as the central conductor coordinating specialized engines:

```text
                                CLIENT / UI
                                     │
                 POST /api/orchestrator/evaluate
                 POST /api/orchestrator/dispatch-action
                                     │
                                     ▼
                     ORCHESTRATOR ROUTER & SERVICE
              (backend/routers/orchestrator.py &
               backend/services/research_orchestrator.py)
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼                             ▼                             ▼
1. STATE AGGREGATOR           2. CONTRACT EVALUATOR         3. CRITIQUE ENGINE
 • Fetch session record        • Query active contract       • DevilsAdvocateEngine
 • Fetch problem details       • Check required inputs       • BlindSpotDetector
 • Fetch claims & evidence     • Check required outputs      • ContradictionEngine
 • Fetch decisions & notes     • Compute gate readiness      • Overconfidence check
       │                             │                             │
       └─────────────────────────────┼─────────────────────────────┘
                                     │
                                     ▼
                       4. DETERMINISTIC RECOMMENDER
                        • Priority 1: URGENT (overconfidence, blocking inputs)
                        • Priority 2: HIGH (contradictions, zero evidence)
                        • Priority 3: MEDIUM (blind spots, partial outputs)
                        • Priority 4: LOW (gate review sign-off)
                                     │
                                     ▼
                        5. LLM SYNTHESIZER (OPTIONAL)
                        • "LLM-Last": If API available, generate
                          succinct 2-sentence qualitative guidance.
                        • If offline/degraded: Omit narrative cleanly.
                                     │
                                     ▼
                        6. RELATIONAL EVENT LOGGING
                        • Insert event record to orchestration_events
```

---

## 2. File Modification & Creation Matrix

| Component | Target File | Action | Scope of Work |
|:---|:---|:---|:---|
| **Data Models** | `backend/models/orchestrator.py` | **CREATE** | Pydantic models for stage status, epistemic health, recommendations, and dispatch requests. |
| **Storage Schema** | `backend/storage/sqlite_adapter.py` | **MODIFY** | Add `orchestration_events` schema migration and event insert/query methods in `SQLiteStorageAdapter`. |
| **Core Service** | `backend/services/research_orchestrator.py` | **CREATE** | Implements context aggregation, contract evaluation, critique synthesis, deterministic action ranking, and dispatch execution. |
| **API Router** | `backend/routers/orchestrator.py` | **CREATE** | Exposes `/api/orchestrator/evaluate`, `/api/orchestrator/dispatch-action`, and `/api/orchestrator/session/{session_id}/loop-status`. |
| **App Assembly** | `backend/server.py` | **MODIFY** | Mount `orchestrator.router` under `/api/orchestrator`. |
| **Automated Tests**| `backend/tests/test_research_orchestrator.py` | **CREATE** | Dedicated unit and integration suite testing all 11 loop states, overconfidence triggers, and action dispatching. |

---

## 3. Staged Implementation Sequence

### Stage 1: Data Models & Storage Schema
- Create `backend/models/orchestrator.py`.
- Add `orchestration_events` table creation in `backend/storage/sqlite_adapter.py:_init_db()`.
- Add `record_orchestration_event()` and `get_orchestration_events(session_id)` to `SQLiteStorageAdapter`.

### Stage 2: Research Context Aggregator & Contract Evaluator
- Implement `ContextAggregator` in `backend/services/research_orchestrator.py`:
  - Pulls `Session`, `Problem`, `Claims`, `EvidenceLinks`, and `Decisions`.
  - Resolves active `MethodologyContract` via `backend/services/methodology_contract.py`.
  - Determines stage prerequisite status and identifies missing required outputs.

### Stage 3: Critique Synthesizer & Rule-Based Action Recommender
- Implement critique evaluation:
  - Invokes `DevilsAdvocateEngine` for active assumptions.
  - Invokes `BlindSpotDetector` for perspective coverage.
  - Checks for contradictory evidence pairs in `claim_evidence_links`.
  - Enforces Article II Overconfidence Warning: triggers if AI confidence $\ge 0.80$ while evidence score $\le 0.40$.
- Implement deterministic recommendation ranking (Urgent $\rightarrow$ High $\rightarrow$ Medium $\rightarrow$ Low).

### Stage 4: Orchestrator Router & Action Dispatcher
- Implement `dispatch_action()` in `research_orchestrator.py` for actions:
  - `ACQUIRE_EVIDENCE`: Executes FTS5/connector search and returns candidates.
  - `EXECUTE_CRITIQUE`: Runs deep devil's advocate and records questions to session notes.
  - `SYNTHESIZE_LITERATURE`: Triggers literature matrix compilation.
- Create `backend/routers/orchestrator.py` with standard error handling and mount in `backend/server.py`.

### Stage 5: Verification & Regression Testing
- Implement `backend/tests/test_research_orchestrator.py` verifying:
  - Prerequisite missing condition generates `URGENT` action.
  - Overconfidence scenario triggers `OVERCONFIDENCE_WARNING` action.
  - Complete stage generates `REQUEST_GATE_REVIEW` action.
  - Action dispatch records `orchestration_events` row in SQLite.
  - Offline mode executes 100% deterministically without LLM network access.
- Execute full regression suite: `pytest -m "not live"` ensuring $\ge 266$ tests pass.
