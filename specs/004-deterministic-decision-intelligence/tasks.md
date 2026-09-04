# CONVERA SDD-004: Work Breakdown & Implementation Tasks

**Specification ID**: CONVERA-SDD-004  
**Classification**: Work Breakdown & Implementation Tasks  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [IMPLEMENTED & VERIFIED]  
**Revision**: 1.0.0  
**Baseline Git Commit**: `de0d652`  
**Proposed Feature Branch**: `feature/004-deterministic-decision-intelligence`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/004-deterministic-decision-intelligence/spec.md`  
- `specs/004-deterministic-decision-intelligence/plan.md`  

---

## 1. Task Breakdown & Execution Sequence

```text
[Phase 1: Deterministic Engine Core & Data Models]
       │
       ▼
   TASK-004-01: Implement CandidateMetricBreakdown & calculate_candidate_composite_score()
       │
       ▼
   TASK-004-02: Implement rank_candidates_deterministically() with 4-Tier Tie-Breaking
       │
       ▼
[Phase 2: LLM Inversion & Hardened Fallback]
       │
       ▼
   TASK-004-03: Refactor synthesize_decision_room() for LLM Inversion & Invariant Overrides
       │
       ▼
   TASK-004-04: Implement generate_deterministic_fallback_summary()
       │
       ▼
[Phase 3: Router Contract Reconciliation]
       │
       ▼
   TASK-004-05: Reconcile backend/routers/sessions.py Parameter Mismatches (DEF-AI-008)
       │
       ▼
[Phase 4: Epistemic Boundary Hardening]
       │
       ▼
   TASK-004-06: Harden backend/agents/verifier_agent.py Verdict Taxonomy (DEF-AI-009)
       │
       ▼
   TASK-004-07: Correct Claim Initialization to HYPOTHESIS in assumption_engine.py (DEF-AI-010)
       │
       ▼
[Phase 5: Automated Test Harness & Verification]
       │
       ▼
   TASK-004-08: Construct Comprehensive backend/tests/test_decision_engine.py
       │
       ▼
[Phase 6: Full Regression & Knowledge Graph Gate]
       │
       ▼
   TASK-004-09: Execute Complete Regression Gate (pytest, tsc, graphify)
```

---

## 2. Detailed Task Specifications

### Phase 1: Deterministic Engine Core & Data Models

#### `TASK-004-01`: Implement Candidate Metric Breakdown & Composite Scoring [COMPLETED]
- **Target File**: `backend/engines/decision_engine.py`
- **Objective**: Introduce typed `CandidateMetricBreakdown` and `calculate_candidate_composite_score()` combining rubric scores (`evidence_scorer.py`), epistemic net balances reusing `knowledge_lifecycle.py`'s `normalized_score`, quantified impact scores, and assumption risk penalties.
- **Formula**:
  $$\text{Score}_{\text{composite}} = \text{clamp}(0.40 \cdot S_{\text{rubric}} + 0.35 \cdot S_{\text{epistemic}} + 0.25 \cdot S_{\text{impact}} - R_{\text{assumptions}}, 0.0, 100.0)$$
- **Normative Rules**:
  - Isolate weights in `RANKING_WEIGHTS_V1` and classify as `[PROPOSED DEFAULT — SUBJECT TO RATIFICATION & TUNING]`.
  - Isolate deduction penalties in `RISK_PENALTY_DEFAULTS_V1` and classify as `[PROPOSED DEFAULT]`.
  - Epistemic score $S_{\text{epistemic}}$ must reuse the existing authoritative `normalized_score` calculation from `backend/engines/knowledge_lifecycle.py:63-69`. Do NOT introduce a second normalization formula.
  - Zero database queries if storage adapter not provided; pure deterministic calculation.
- **Verification**: Unit test scoring with mock candidates yields expected numerical values.

#### `TASK-004-02`: Implement Deterministic Ranking & 4-Tier Tie-Breaker [COMPLETED]
- **Target File**: `backend/engines/decision_engine.py`
- **Objective**: Implement `rank_candidates_deterministically(candidates, storage=None)`.
- **Tie-Breaking Hierarchy**:
  1. Primary: $\text{Score}_{\text{composite}}$ (descending)
  2. Secondary: $S_{\text{epistemic}}$ (descending)
  3. Tertiary: $S_{\text{rubric}}$ (descending)
  4. Quaternary: Candidate ID lexicographical sort
- **Verdicts**: `RECOMMENDED` (rank 1), `VIABLE_ALTERNATIVE` (rank > 1, score $\ge 60.0$), `HIGH_RISK` (rank > 1, score $< 60.0$). Classify threshold 60.0 as `[PROPOSED DEFAULT] [TUNABLE HEURISTIC]`.
- **Single Candidate**: When exactly 1 candidate is provided, assign `rank = 1` and `verdict = "RECOMMENDED"` without artificial comparisons.
- **Verification**: Test with synthetic tied candidates verifies deterministic ordering; single-candidate test verifies rank 1.

---

### Phase 2: LLM Inversion & Hardened Fallback

#### `TASK-004-03`: Refactor `synthesize_decision_room()` for LLM Inversion [COMPLETED]
- **Target File**: `backend/engines/decision_engine.py`
- **Objective**: Invert the intelligence relationship. Pre-calculate rankings deterministically, format candidate metrics into prompt, invoke LLM solely for `recommendation_summary` and qualitative `pros`/`risks`.
- **Empty Candidate Set Guard**: If `candidates` is empty (`candidate_ids = []`), return deterministic neutral synthesis with `recommended_winner_id = None`, `candidate_breakdowns = []`, and neutral summary. Never perform arbitrary indexing such as `candidates[0]`.
- **Invariant Enforcement**: Programmatically assert `recommended_winner_id == deterministic_winner_id` and enforce deterministic ranks on all returned breakdowns.
- **Verification**: Injected mock LLM with conflicting winner is programmatically overridden; empty candidate list returns valid neutral response without `IndexError`.

#### `TASK-004-04`: Implement Deterministic Fallback Summary Generator [COMPLETED]
- **Target File**: `backend/engines/decision_engine.py`
- **Objective**: When LLM gateway raises an exception or returns degraded output, assemble structured summary from top candidate's rubric score, attached paper count, and quantified impact, setting `is_degraded = True`.
- **Verification**: Simulating LLM timeout returns complete ranking and deterministic summary with `is_degraded = True`.

---

### Phase 3: Router Contract Reconciliation

#### `TASK-004-05`: Reconcile Session Router Parameter Mismatches (`DEF-AI-008`) [COMPLETED]
- **Target File**: `backend/routers/sessions.py`
- **Objective**:
  1. Fix `api_synthesize_decision_room`: Resolve 3-argument call to `synthesize_decision_room(candidates)`.
  2. Fix `api_execute_pivot_loop`: Remove invalid `await` on synchronous `execute_pivot_loop()`, and align parameter names (`kill_reason` $\to$ `pivot_reason`).
  3. **Preserve Semantic Separation**: `DecisionPivotRequest.next_candidate_id` is a candidate identifier and MUST NOT be mapped to `invalidated_assumption_id`. Pass `invalidated_assumption_id=None` when not provided by request.
- **Verification**: API tests for both endpoints pass without raising `TypeError`, and verify `next_candidate_id` is never passed into `invalidated_assumption_id`.

---

### Phase 4: Epistemic Boundary Hardening

#### `TASK-004-06`: Verifier Agent Epistemic Hardening (`DEF-AI-009`) [COMPLETED]
- **Target File**: `backend/agents/verifier_agent.py`
- **Objective**: Strip `"VERIFIED_EMPIRICAL"` from the LLM verification prompt and fallback schema. Replace with advisory verdict `"PLAUSIBLE_SUPPORTED"`. Restrict empirical verification to registry grounding and human review.
- **Docstring Reconciliation**: Update `ClaimVerificationReport` docstrings and comments to match the post-SDD-004 advisory taxonomy (no autonomous empirical verification authority).
- **Verification**: Verifier agent unit test confirms no LLM output can mint `VERIFIED_EMPIRICAL`; docstring check verifies taxonomy alignment.

#### `TASK-004-07`: Assumption Engine Claim Status Initialization (`DEF-AI-010`) [COMPLETED]
- **Target File**: `backend/engines/assumption_engine.py`
- **Objective**: Clarify `UNKNOWN → HYPOTHESIS` state transition: AI extraction does not establish support. When assumption engine identifies a previously unexamined proposition for active investigation, extraction establishes `HYPOTHESIS` post-extraction state per `KNOWLEDGE_MODEL.md`. Change newly generated friction reality claims in prompt template line 63 from `"status": "SUPPORTED"` to `"status": "HYPOTHESIS"`.
- **Verification**: Generated claims initialize with status `HYPOTHESIS`.

---

### Phase 5: Automated Test Harness

#### `TASK-004-08`: Comprehensive Decision Intelligence Test Suite [COMPLETED]
- **Target File**: `backend/tests/test_decision_engine.py`
- **Objective**: Construct complete automated test harness covering:
  - Metric computation & composite formula calculations (reusing `knowledge_lifecycle.py` `normalized_score`).
  - Multi-candidate deterministic sorting & 4-tier tie-breaking.
  - Empty candidate set handling (`candidate_ids = []`) returning deterministic neutral response without `IndexError`.
  - Single candidate set handling (`rank = 1`, `verdict = "RECOMMENDED"`).
  - Winner invariant enforcement against hallucinated LLM responses.
  - Degraded mode fallback synthesis.
  - Session router synthesis & pivot contract compliance (ensuring semantic separation of candidate ID and assumption ID).
  - Verifier agent verdict restriction & `ClaimVerificationReport` taxonomy validation (no `VERIFIED_EMPIRICAL`).
  - Assumption engine claim initial status (`HYPOTHESIS`).
  - Latency benchmark: pure deterministic ranking of 4 candidates runs in $< 10\text{ms}$ (normative acceptance threshold; $< 5\text{ms}$ aspirational target).
- **Pass Threshold**: 100% of new tests pass.

---

### Phase 6: Regression & Documentation Gate

#### `TASK-004-09`: Full Regression & Verification Gate [COMPLETED]
- **Objective**: Run complete system verification:
  - `pytest tests/ backend/tests/` (114+ baseline + new tests pass).
  - Latency benchmark verifies $< 10\text{ms}$ normative threshold.
  - `npx tsc --noEmit` in `web/` (zero type errors).
  - `git diff --check` (clean formatting, zero trailing whitespace).
  - `graphify update .` (knowledge graph synchronized).
