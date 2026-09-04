# CONVERA SDD-004: Verification Checklist

**Specification ID**: CONVERA-SDD-004  
**Classification**: Quality & Invariant Verification Checklist  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [IMPLEMENTED & VERIFIED]  
**Revision**: 1.0.0  
**Baseline Git Commit**: `de0d652`  
**Proposed Feature Branch**: `feature/004-deterministic-decision-intelligence`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/004-deterministic-decision-intelligence/spec.md`  

---

## 1. Specification Compliance Checklist

- [x] **CHK-004-01**: `synthesize_decision_room` computes mathematical candidate scores and rankings deterministically before invoking any external LLM call.
- [x] **CHK-004-02**: Composite scoring formula balances Rubric Score ($0.40$), Epistemic Score ($0.35$), and Impact Score ($0.25$) using `[PROPOSED DEFAULT]` weights, reusing `knowledge_lifecycle.py`'s `normalized_score` directly (no competing formula), and subtracting unvalidated/falsified assumption penalties (`[PROPOSED DEFAULT]` deductions).
- [x] **CHK-004-03**: Strict 4-tier tie-breaker is implemented: Epistemic Score $\to$ Rubric Score $\to$ Impact Score $\to$ Lexicographical Candidate ID.
- [x] **CHK-004-04**: The LLM prompt is restricted strictly to generating narrative executive summaries and qualitative pros/risks.
- [x] **CHK-004-05**: Programmatic invariant enforcement ensures an LLM response cannot alter the deterministic ranking or replace the winning candidate ID.
- [x] **CHK-004-06**: When the LLM Gateway fails or times out, complete deterministic rankings and structured fallback summaries are returned with `is_degraded = True`.
- [x] **CHK-004-07**: `backend/routers/sessions.py` parameter arity mismatch in `api_synthesize_decision_room` is fully resolved (`DEF-AI-008`).
- [x] **CHK-004-08**: `backend/routers/sessions.py` invalid `await` on synchronous `execute_pivot_loop` is fully removed, and semantic separation between `DecisionPivotRequest.next_candidate_id` and `invalidated_assumption_id` is preserved (`DEF-AI-008`).
- [x] **CHK-004-09**: `backend/agents/verifier_agent.py` removes `"VERIFIED_EMPIRICAL"` from LLM prompt verdicts, replacing it with advisory evaluations (`DEF-AI-009`), and reconciles `ClaimVerificationReport` docstrings/comments to the post-SDD-004 advisory taxonomy.
- [x] **CHK-004-10**: `backend/engines/assumption_engine.py` initializes newly generated friction reality claims as `status: "HYPOTHESIS"`, encoding the `UNKNOWN → HYPOTHESIS` extraction transition (`DEF-AI-010`).
- [x] **CHK-004-11**: Decision Room API contract maintains full backward compatibility for existing frontend consumers (`DecisionSynthesis`).
- [x] **CHK-004-12**: Full-text search (FTS5), vector embeddings, and database schema mutations are strictly excluded from SDD-004 scope.
- [x] **CHK-004-13**: `synthesize_decision_room` handles empty candidate set (`candidate_ids = []`) deterministically without raising `IndexError` (`candidates[0]`).
- [x] **CHK-004-14**: Single candidate evaluation assigns `rank = 1` and `verdict = "RECOMMENDED"` with no artificial comparisons against nonexistent candidates.
- [x] **CHK-004-15**: Pure deterministic candidate ranking completes in $< 10\text{ms}$ normative acceptance threshold ($< 5\text{ms}$ aspirational target) for 4 candidates.
- [x] **CHK-004-16**: Automated test verifies that the LLM-facing verdict taxonomy in `verifier_agent.py` does not grant autonomous empirical verification authority (no `VERIFIED_EMPIRICAL`).

---

## 2. Epistemic & Invariant Safety Checklist

- [x] **INV-004-01 (Zero Schema Mutations)**: Zero alterations to SQLite WAL database tables (`convera.db` 23 tables preserved intact).
- [x] **INV-004-02 (Tri-Part Confidence Decoupling)**: AI linguistic fluency is never treated as empirical ground truth; $C_{\text{AI}} \ne S_{\text{EVID}} \ne C_{\text{DEC}}$.
- [x] **INV-004-03 (Human Sovereign Authority)**: The system computes recommendations; committing a winning candidate to Phase 3 requires explicit human ratification.
- [x] **INV-004-04 (Offline Sovereignty)**: Decision ranking and candidate evaluations function 100% offline with zero cloud API keys required.
- [x] **INV-004-05 (Zero Pseudo-Research)**: Fallback summaries do not fabricate citations or claim unperformed empirical field observations.
- [x] **INV-004-06 (Zero Secret Leaks)**: Zero API keys or secrets hardcoded into codebase.

---

## 3. Regression & Test Gate Checklist

- [x] **REG-004-01**: `backend/tests/test_decision_engine.py` passes 100% across all scoring, ranking, tie-breaking, fallback, and router tests (19/19 passed).
- [x] **REG-004-02**: All existing backend pytest tests pass without regression (130/130 total tests passed).
- [x] **REG-004-03**: Frontend TypeScript check passes with zero type errors (`npx tsc --noEmit`).
- [x] **REG-004-04**: Whitespace and formatting clean (`git diff --check`).
- [x] **REG-004-05**: Knowledge graph synchronized (`graphify update .`).
