# CONVERA SDD-013: Verification & Governance Checklist
# Research Orchestration Engine (Unified Intelligence & Research Loop)

**Specification ID**: CONVERA-SDD-013  
**Classification**: Quality Assurance, Invariant Enforcement & Governance Checklist  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 RATIFIED & VERIFIED  
**Revision**: 1.1.0  
**Canonical Path**: `specs/013-research-orchestration-engine/checklist.md`  
**Upstream Dependencies**: `specs/013-research-orchestration-engine/spec.md`, `specs/013-research-orchestration-engine/plan.md`  

---

## 1. Specification Compliance Checklist

- [x] **CHK-013-01**: Pydantic models for `OrchestrationStageStatus`, `EpistemicHealthSummary`, `CritiqueSummary`, `RecommendedAction`, `OrchestrationEvaluationResult`, and dispatch request/response authored in `backend/models/orchestrator.py`.
- [x] **CHK-013-02**: `orchestration_events` relational table and indices created in `backend/storage/sqlite_adapter.py` under WAL journal mode.
- [x] **CHK-013-03**: `record_orchestration_event()` and `get_orchestration_events()` methods added to `SQLiteStorageAdapter` with referential integrity.
- [x] **CHK-013-04**: `ResearchOrchestrator` service implements context aggregation extracting active session, problem, claims, evidence links, and decisions.
- [x] **CHK-013-05**: Active methodology contract is queried via `MethodologyContractService` and evaluated for stage prerequisites, missing required outputs, and gate readiness.
- [x] **CHK-013-06**: Critique engine synthesis coordinates `DevilsAdvocateEngine` and `BlindSpotDetector` to generate active challenge questions without crashing.
- [x] **CHK-013-07**: Overconfidence guardrail triggers an `URGENT` action if AI certainty $\ge 0.80$ while empirical evidence score $\le 0.40$.
- [x] **CHK-013-08**: Deterministic action recommender sorts recommendations strictly: `URGENT` $\rightarrow$ `HIGH` $\rightarrow$ `MEDIUM` $\rightarrow$ `LOW`.
- [x] **CHK-013-09**: Action dispatcher executes supported actions (`ACQUIRE_EVIDENCE`, `EXECUTE_CRITIQUE`, `SYNTHESIZE_LITERATURE`) and persists an `orchestration_events` audit record.
- [x] **CHK-013-10**: Endpoints `POST /api/orchestrator/evaluate` and `POST /api/orchestrator/dispatch-action` exposed and mounted in `backend/server.py`.

---

## 2. Invariant & Governance Safety Checklist

- [x] **INV-013-01 (LLM-Last Invariant)**: Stage gate evaluation, missing output detection, and action ranking compute 100% deterministically without LLM calls.
- [x] **INV-013-02 (Human Sovereignty Invariant)**: The Orchestrator never auto-promotes a session stage or commits irreversible decisions without human confirmation.
- [x] **INV-013-03 (Canonical Independence Invariant)**: All state queries and event logs interact strictly with canonical SQLite tables; zero ephemeral in-memory state bypasses storage.
- [x] **INV-013-04 (Zero Dependency Growth)**: `git diff backend/pyproject.toml` shows zero dependency additions.
- [x] **INV-013-05 (Offline Sovereignty)**: When disconnected from cloud LLM APIs, `/api/orchestrator/evaluate` completes with zero errors, returning deterministic stage status and recommendations.

---

## 3. Conformance & Verification Acceptance Checklist

- [x] **CONF-013-01**: `pytest backend/tests/test_research_orchestrator.py` passes 100% of test cases (7/7 passed).
- [x] **CONF-013-02**: Evaluation latency for deterministic check completes in $\le 50\text{ ms}$ (average ~2ms).
- [x] **CONF-013-03**: Evaluating an ungrounded problem triggers `ACQUIRE_EVIDENCE` recommendation.
- [x] **CONF-013-04**: Evaluating an overconfident claim triggers `CHALLENGE_ASSUMPTION` recommendation with `URGENT` priority.
- [x] **CONF-013-05**: Evaluating a stage with all outputs satisfied triggers `REQUEST_GATE_REVIEW` recommendation.
- [x] **CONF-013-06**: Dispatching an action creates a persistent row in `orchestration_events` verifiable via SQL.
- [x] **CONF-013-07**: Full offline regression suite (`pytest -m "not live"`) passes with $\ge 266$ tests (273 passed, 0 failures).
- [x] **CONF-013-08**: TypeScript typecheck passes with 0 errors (`npm run typecheck --prefix web`).
