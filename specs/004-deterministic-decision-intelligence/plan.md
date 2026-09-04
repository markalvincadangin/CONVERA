# CONVERA SDD-004: Architectural Implementation Plan

**Specification ID**: CONVERA-SDD-004  
**Classification**: Technical & Architectural Implementation Plan  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [PROPOSED PLAN — AWAITING HUMAN RATIFICATION GATE]  
**Revision**: 1.0.0  
**Baseline Git Commit**: `de0d652`  
**Proposed Feature Branch**: `feature/004-deterministic-decision-intelligence`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/004-deterministic-decision-intelligence/spec.md`  
- `docs/00-foundation/CONSTITUTION.md`  
- `docs/04-ai/AI_ARCHITECTURE.md`  
- `docs/05-data/DATABASE_SCHEMA.md` (Table T11)  

---

## 1. System Boundary & Component Architecture

SDD-004 operates strictly across Area 2 (Routers), Area 3 (Domain Engines), and Area 5 (Agents / CIIA), leaving Area 4 (Persistence) 100% untouched:

```text
Presentation Layer (web/src/components/phases/phase2/DecisionRoomWorkspace.tsx)
       ▲
       │ [Consumes enriched DecisionSynthesis payload]
       ▼
Router Layer
 ├── backend/routers/decisions.py (Passes candidate models to decision engine)
 └── backend/routers/sessions.py  (Reconciled: resolves arity & async signature bugs)
       ▲
       │
       ▼
Domain Engine Layer
 └── backend/engines/decision_engine.py  <--- PRIMARY ARCHITECTURAL FOCUS
       ├── calculate_candidate_composite_score()
       ├── rank_candidates_deterministically()
       ├── generate_deterministic_fallback_summary()
       ├── calls evidence_scorer.py (calculate_score_breakdown)
       ├── calls knowledge_lifecycle.py (compute_claim_epistemic_balance)
       └── calls llm_gateway.py (generate_with_meta for narrative explanation only)
       │
Subordinate Epistemic Boundary Hardening
 ├── backend/agents/verifier_agent.py (Removes autonomous VERIFIED_EMPIRICAL)
 └── backend/engines/assumption_engine.py (Initializes claims as HYPOTHESIS)
       │
Persistence Layer (backend/storage/sqlite_adapter.py)
 └── [PRESERVED 100% — ZERO SCHEMA MUTATIONS — ZERO MIGRATIONS]
```

---

## 2. Component Design & Implementation Details

### 2.1 `backend/engines/decision_engine.py`

#### A. Data Models & Constants
```python
@dataclass(frozen=True)
class CandidateMetricBreakdown:
    problem_id: str
    composite_score: float
    rubric_score: float
    epistemic_score: float
    impact_score: float
    risk_penalty: float
    rank: int
    verdict: str  # "RECOMMENDED" | "VIABLE_ALTERNATIVE" | "HIGH_RISK"
    pros: List[str]
    risks: List[str]

# [PROPOSED DEFAULT — SUBJECT TO RATIFICATION & TUNING]
# These initial deterministic ranking defaults are engineering heuristics and are NOT
# empirically validated. They are isolated here for transparent versioning and calibration.
RANKING_WEIGHTS_V1 = {
    "rubric": 0.40,
    "epistemic": 0.35,
    "impact": 0.25,
}

# [PROPOSED DEFAULT] Engineering heuristic penalties, not normative epistemic laws
RISK_PENALTY_DEFAULTS_V1 = {
    "falsified_test": 15.0,
    "critical_untested": 10.0,
    "high_untested": 5.0,
    "max_penalty": 50.0,
}

# [PROPOSED DEFAULT] [TUNABLE HEURISTIC] Presentation threshold, not an epistemic truth boundary
VERDICT_THRESHOLD_V1 = {
    "viable_alternative_min": 60.0,
}
```

#### B. Deterministic Metric Calculation Functions
1. `calculate_candidate_composite_score(candidate: Dict[str, Any], storage=None) -> Dict[str, float]`:
   - Calls `calculate_score_breakdown(candidate, candidate.get("sources", []))` to obtain raw rubric score ($0\text{--}100$) and dimension 3 impact score ($0\text{--}20 \times 5.0$).
   - Epistemic Score Normalization: Reuses the existing authoritative `normalized_score` from `backend/engines/knowledge_lifecycle.py:63-69`. No second normalization formula is introduced. Queries `storage.list_claim_evidence_links` (if storage available) or parses attached claims to compute net epistemic balance using `knowledge_lifecycle.compute_claim_epistemic_balance`. For multiple claims, $S_{\text{epistemic}}$ is the mean of per-claim `normalized_score` values (or neutral $50.0$ if zero claims).
   - Calculates assumption risk penalties using `RISK_PENALTY_DEFAULTS_V1` ($-15.0$ per falsified test, $-10.0$ per critical unvalidated assumption, $-5.0$ per high untested assumption, capped at $50.0$).
   - Computes weighted composite score:
     $$\text{Score} = \min(\max(0.40 \cdot S_{\text{rubric}} + 0.35 \cdot S_{\text{epistemic}} + 0.25 \cdot S_{\text{impact}} - R_{\text{penalty}}, 0.0), 100.0)$$

2. `rank_candidates_deterministically(candidates: List[Dict[str, Any]], storage=None) -> List[CandidateMetricBreakdown]`:
   - If `candidates` is empty (`[]`), returns an empty list `[]` deterministically without attempting indexing.
   - If exactly one candidate is provided, assigns `rank = 1` and `verdict = "RECOMMENDED"` with no artificial comparison against nonexistent candidates.
   - Computes metric breakdowns for all candidates.
   - Sorts using deterministic 4-tuple key:
     `(-breakdown.composite_score, -breakdown.epistemic_score, -breakdown.rubric_score, candidate_id)`
   - Assigns 1-based ranks (`rank: 1, 2, ...`).
   - Assigns verdicts: `RECOMMENDED` for rank 1; `VIABLE_ALTERNATIVE` if score $\ge 60.0$; `HIGH_RISK` otherwise (`60.0` is `[PROPOSED DEFAULT] [TUNABLE HEURISTIC]`).

#### C. LLM Inversion & Hardened Synthesis
3. `synthesize_decision_room(candidates: List[Dict[str, Any]], storage=None) -> Dict[str, Any]`:
   - Empty set check: If `not candidates`, return deterministic neutral synthesis with `recommended_winner_id = None`, `candidate_breakdowns = []`, `recommendation_summary = "No candidates provided for decision synthesis."`, and `is_degraded = False`. Never perform arbitrary indexing such as `candidates[0]`.
   - Step 1: Execute `rank_candidates_deterministically(candidates, storage)`.
   - Step 2: Extract `recommended_winner_id = ranked[0].problem_id`.
   - Step 3: Call LLM Gateway with pre-computed rankings, instructing the LLM to generate narrative summary and pros/risks.
   - Step 4: **Enforce Invariant**: If LLM output differs in ranking or winner, the engine overrides with deterministic values.
   - Step 5: On LLM failure or timeout, assemble deterministic fallback summary without throwing exceptions, setting `is_degraded = True`.

---

### 2.2 `backend/routers/sessions.py` Contract Reconciliation (`DEF-AI-008`)

#### Changes in `api_synthesize_decision_room`:
```python
@router.post("/api/decision-room/synthesize")
async def api_synthesize_decision_room(req: DecisionSynthesizeRequest):
    storage = get_storage()
    sess = storage.get_session(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Retrieve candidates from state_data or storage
    state_data = sess.get("state_data", {})
    candidate_ids = state_data.get("candidate_ids") or []
    candidates = [storage.get_problem(cid) for cid in candidate_ids if storage.get_problem(cid)]
    if not candidates:
        # Fallback to session active problem or project problems
        candidates = storage.list_problems(project_id=sess.get("project_id"))[:4]
    
    result = await synthesize_decision_room(candidates, storage=storage)
    return result
```

#### Changes in `api_execute_pivot_loop`:
```python
@router.post("/api/decision-room/pivot")
async def api_execute_pivot_loop(req: DecisionPivotRequest):
    # execute_pivot_loop is synchronous; do not await.
    # Normative contract separation: DecisionPivotRequest.next_candidate_id is a
    # replacement candidate/problem identifier, NOT an assumption identifier.
    # NEVER map next_candidate_id -> invalidated_assumption_id.
    # Leave invalidated_assumption_id unset (None) when not provided by request.
    result = execute_pivot_loop(
        session_id=req.session_id,
        current_problem_id=req.current_problem_id,
        pivot_reason=req.kill_reason,
        invalidated_assumption_id=None,
    )
    return result
```

**Normative Contract Requirement**: `DecisionPivotRequest.next_candidate_id` is a candidate identifier and `invalidated_assumption_id` is an assumption identifier. The two concepts must never be conflated. Passing candidate identifiers into assumption parameters is strictly prohibited.

---

### 2.3 `backend/agents/verifier_agent.py` Epistemic Hardening (`DEF-AI-009`)

#### System Prompt & Fallback Modification:
- Strip `"VERIFIED_EMPIRICAL"` from prompt schema:
  ```python
  '  "verification_verdict": "PLAUSIBLE_SUPPORTED" | "PLAUSIBLE_UNVERIFIED" | "HALLUCINATION_OR_INVALID" | "DIRECTLY_CONTRADICTED",\n'
  ```
- Fallback schema:
  ```python
  "verification_verdict": "PLAUSIBLE_SUPPORTED" if doi_valid else "PLAUSIBLE_UNVERIFIED",
  ```
- Result: Model can only assert plausibility; empirical status requires registry verification.
- **ClaimVerificationReport Documentation Reconciliation**: Update the docstrings and field comments in `backend/agents/verifier_agent.py` (specifically `ClaimVerificationReport`) so that the documented verdict taxonomy exactly matches the post-SDD-004 LLM advisory taxonomy. The LLM must not be documented as having authority to emit `VERIFIED_EMPIRICAL`.

---

### 2.4 `backend/engines/assumption_engine.py` Epistemic Hardening (`DEF-AI-010`)

#### State Transition Reconciliation (`UNKNOWN → HYPOTHESIS`):
AI extraction does not establish support. When the assumption engine identifies a previously unexamined proposition for active investigation, the extraction event establishes:
```text
UNKNOWN → HYPOTHESIS
```
as the post-extraction state. This is a state transition consistent with `KNOWLEDGE_MODEL.md` (which recognizes `UNKNOWN` prior to examination and `HYPOTHESIS` as the initial post-extraction hypothesis state), rather than claiming `HYPOTHESIS` is a universal initial state.

In line 63 of `backend/engines/assumption_engine.py`:
```diff
-       "status": "SUPPORTED",
+       "status": "HYPOTHESIS",
```
All newly extracted friction reality claims initialize as `HYPOTHESIS`, conforming to `KNOWLEDGE_MODEL.md` and `knowledge_lifecycle.py:60`.

---

## 3. Phased Implementation Sequence

```text
Phase 1: Deterministic Engine Core Implementation
 └── Implement CandidateMetricBreakdown dataclass, RANKING_WEIGHTS_V1 [PROPOSED DEFAULT],
     RISK_PENALTY_DEFAULTS_V1 [PROPOSED DEFAULT], and VERDICT_THRESHOLD_V1 [PROPOSED DEFAULT]
 └── Implement calculate_candidate_composite_score() reusing knowledge_lifecycle normalized_score
 └── Implement rank_candidates_deterministically() with 4-tier tie-breaker, empty list handling,
     and single-candidate assignment (rank = 1)

Phase 2: LLM Inversion & Degraded Fallback Assembly
 └── Refactor synthesize_decision_room() with empty candidate guard (never candidates[0])
 └── Pass pre-ranked data to LLM strictly for narrative explanation
 └── Implement post-processing invariant assertion (LLM cannot override ranking or winner)
 └── Implement deterministic fallback narrative generator (is_degraded = True)

Phase 3: Session Router Contract Reconciliation (DEF-AI-008)
 └── Fix parameter arity in api_synthesize_decision_room()
 └── Remove invalid await and align parameter names in api_execute_pivot_loop()
 └── Enforce semantic separation between next_candidate_id and invalidated_assumption_id (set None)

Phase 4: Epistemic Boundary Hardening (DEF-AI-009 & DEF-AI-010)
 └── Replace VERIFIED_EMPIRICAL with PLAUSIBLE_SUPPORTED in verifier_agent.py prompt and fallback
 └── Reconcile ClaimVerificationReport docstring and comments to post-SDD-004 advisory taxonomy
 └── Correct initial status to HYPOTHESIS in assumption_engine.py (UNKNOWN -> HYPOTHESIS transition)

Phase 5: Automated Verification Test Harness
 └── Create backend/tests/test_decision_engine.py (15+ unit tests)
 └── Verify determinism, tie-breaking, degraded fallback, and router contracts
 └── Verify empty candidate set handling (candidate_ids = []) without indexing error
 └── Verify single candidate set handling (rank = 1, RECOMMENDED)
 └── Verify ClaimVerificationReport taxonomy cannot emit VERIFIED_EMPIRICAL
 └── Benchmark latency: normative acceptance < 10ms, aspirational target < 5ms

Phase 6: Full Regression Gate & Knowledge Graph Synchronization
 └── Run full pytest suite (114+ tests)
 └── Run TypeScript check (npx tsc --noEmit)
 └── Run graphify update .
```

---

## 4. Rollback & Risk Mitigation Strategy

| Risk Scenario | Detection Mechanism | Mitigation / Rollback Path |
| :--- | :--- | :--- |
| **Composite Score Weight Imbalance** | Discovered during incubation trials (e.g. impact overweighted) | Weights are cleanly isolated in `RANKING_WEIGHTS_V1` constant; adjustable without code refactoring. |
| **Router Regressions** | Automated pytest in `backend/tests/` | Session router contracts test both legacy and new parameter signatures. |
| **Frontend Rendering Mismatch** | Next.js compilation & browser test | Synthesis schema maintains exact backward compatibility; new metrics are optional additions. |
| **Deterministic Tie Deadlock** | Synthetic test with identical candidates | Lexicographical candidate ID comparison guarantees a strict total ordering. |
