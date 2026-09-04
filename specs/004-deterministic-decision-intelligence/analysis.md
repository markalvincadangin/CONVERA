# CONVERA SDD-004: Architectural Impact & Pre-Flight Analysis

**Specification ID**: CONVERA-SDD-004  
**Classification**: Architectural Impact & Pre-Flight Analysis  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [PROPOSED ANALYSIS — AWAITING HUMAN RATIFICATION GATE]  
**Revision**: 1.0.0  
**Baseline Git Commit**: `de0d652`  
**Proposed Feature Branch**: `feature/004-deterministic-decision-intelligence`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/004-deterministic-decision-intelligence/spec.md`  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, V, VI, VII, VIII)  
- `docs/04-ai/AI_ARCHITECTURE.md`  

---

## 1. Root Cause Analysis: LLM-First Decision Ranking Inversion (`DEF-AI-007`)

### 1.1 The Inversion
In CONVERA's original Decision Room design (`backend/engines/decision_engine.py:43-93`), the candidate selection logic suffered from an inversion of computational responsibility:
- **Actual System Capabilities**: CONVERA already possessed mature, deterministic evaluation engines:
  - `backend/engines/evidence_scorer.py`: Computes 5-dimension rubric scores ($0\text{--}100$) based on source diversity, tier quality, impact quantification, workaround specificity, and geographic precision in $< 1\text{ms}$.
  - `backend/engines/knowledge_lifecycle.py`: Computes exact mathematical net epistemic balances ($\sum \text{Support} - \sum \text{Contradict}$) across empirical claim links.
  - `backend/engines/impact_engine.py`: Tracks downstream falsification impacts and compromised assumptions.
- **The Defect**: Despite having these deterministic engines, `decision_engine.py` formatted candidate metadata into a plain text prompt and asked an external LLM ("Expert Technopreneurship Investment & Incubation Decision Judge") to invent ordinal rankings (`rank: 1, 2, ...`) and pick a winner (`recommended_winner_id`).
- **The Degraded Catastrophe**: When the LLM provider encountered a network error or rate limit, the exception handler executed:
  ```python
  winner = candidates[0]
  ```
  This arbitrarily crowned the first candidate in the list as the incubation winner, ignoring all empirical evidence, source tiers, and quantified metrics.

### 1.2 Constitutional Violations
1. **Constitution Article II (Tri-Part Decoupling)**: $C_{\text{AI}} \ne S_{\text{EVID}} \ne C_{\text{DEC}}$. Asking an LLM to decide the winner treats model linguistic confidence as empirical fact.
2. **Constitution Article V (External Boundary Principle)**: System core logic becomes dependent on non-deterministic external cloud APIs.
3. **Constitution Article VI (Free-First Posture)**: Without internet connectivity or cloud credits, ranking calculation collapses into arbitrary array indexing.

---

## 2. Mathematical Design of the Deterministic Scoring Formula

### 2.1 Formula Formulation & Epistemic Normalization
$$\text{Score}_{\text{composite}}(P) = \text{clamp}\left( w_{\text{rubric}} \cdot S_{\text{rubric}}(P) + w_{\text{epistemic}} \cdot S_{\text{epistemic}}(P) + w_{\text{impact}} \cdot S_{\text{impact}}(P) - R_{\text{assumptions}}(P), 0.0, 100.0 \right)$$

- **Authoritative Epistemic Normalization**: $S_{\text{epistemic}}$ strictly reuses the existing authoritative `normalized_score` calculation from `backend/engines/knowledge_lifecycle.py:63-69`. No competing or secondary normalization formula (e.g. $50 + 10 \cdot \text{Balance}$) is introduced. For candidates with multiple claims, $S_{\text{epistemic}}$ is the mean of per-claim normalized scores (defaulting to neutral $50.0$ for candidates with zero claims).

### 2.2 Weight Selection, Sensitivity Analysis & Classification
- **Classification of Weights**: `[PROPOSED DEFAULT — SUBJECT TO RATIFICATION & TUNING]`. These weights are initial engineering defaults for SDD-004 and are NOT empirically validated. No article of the CONVERA Constitution or AI Governance documents prescribes these specific values. They remain subject to future calibration based on incubation trial evidence and are isolated in `RANKING_WEIGHTS_V1`:
  - **$w_{\text{rubric}} = 0.40$ (Documentation & Rubric Rigor)**: Evaluates concrete verifiable attributes: source tier (Tier A gov/academic vs Tier B news), source diversity, workaround detail, actor specificity. Acts as the primary anchor for foundational thesis quality.
  - **$w_{\text{epistemic}} = 0.35$ (Empirical Grounding & Contradiction Absence)**: Evaluates actual claim-evidence linkage. A thesis with contradicted claims is heavily penalized; a thesis with validated empirical citations is boosted.
  - **$w_{\text{impact}} = 0.25$ (Quantified Sufferer Loss)**: Evaluates economic and operational pain. Prevents mathematically rigorous but economically trivial problem theses from winning over high-impact opportunities.
- **Classification of Risk Deductions**: `[PROPOSED DEFAULT]`. The deduction values ($-15$ pts falsified, $-10$ pts critical untested, $-5$ pts high untested, max penalty $50.0$) are engineering heuristics rather than normative epistemic laws. They are isolated in `RISK_PENALTY_DEFAULTS_V1`. Subtractive point deductions maintain transparent auditability without distorting lower-range scores.
- **Classification of Verdict Threshold**: `[PROPOSED DEFAULT] [TUNABLE HEURISTIC]`. The $\theta_{\text{viable}} = 60.0$ threshold is a configurable presentation heuristic for Decision Room UI display, NOT an epistemic truth boundary or normative acceptance requirement. A composite score $\ge 60.0$ does not imply objective viability, nor does $< 60.0$ imply objective high risk; the score is an advisory decision-support signal.

### 2.3 Strict Tie-Breaking Hierarchy & Edge Cases
To guarantee bit-identical determinism:
1. $S_{\text{epistemic}}$: A thesis backed by empirical proof breaks ties over unvalidated theses.
2. $S_{\text{rubric}}$: More rigorously documented theses break ties over sparsely documented ones.
3. $S_{\text{impact}}$: Higher quantified loss breaks ties over lower quantified loss.
4. Lexicographical Candidate ID: Guarantees a total mathematical ordering with zero non-deterministic random selection.

**Edge Cases**:
- **Empty Candidate Set**: When `candidate_ids = []`, `synthesize_decision_room` must deterministically return a neutral response with zero candidates ranked. It must never perform arbitrary indexing such as `candidates[0]`.
- **Single Candidate**: When exactly one candidate exists, it receives `rank = 1` and `verdict = "RECOMMENDED"` without artificial comparisons against nonexistent candidates.

### 2.4 Latency Requirements
- **Normative Acceptance Threshold**: Pure deterministic ranking of 4 candidates must execute in $< 10\text{ms}$ (`NFR-001`).
- **Aspirational Performance Target**: Benchmark target is $< 5\text{ms}$. The distinction between normative acceptance and aspirational target is strictly maintained.

---

## 3. Epistemic Boundary Hardening Analysis

### 3.1 Remediation of `DEF-AI-009` (Verifier Agent Autonomous Empirical Verification)
- **Problem**: In `backend/agents/verifier_agent.py:68`, the LLM is asked to output `"verification_verdict": "VERIFIED_EMPIRICAL"`. In line 99, fallback logic also assigns `"VERIFIED_EMPIRICAL" if doi_valid else ...`.
- **Constitutional Conflict**: An LLM cannot autonomously verify empirical reality. Only an authoritative registry (e.g. Crossref metadata match) and human researcher audit can confirm empirical verification.
- **Remediation**: Valid LLM verdicts are restricted to advisory text audits: `"PLAUSIBLE_SUPPORTED"`, `"PLAUSIBLE_UNVERIFIED"`, `"UNVERIFIED_CITATION"`, `"POTENTIAL_CONTRADICTION"`.
- **Documentation Reconciliation**: The docstrings and comments in `backend/agents/verifier_agent.py` (specifically `ClaimVerificationReport`) must be updated to align with the post-SDD-004 advisory verdict taxonomy. The LLM must not be documented as having authority to emit `VERIFIED_EMPIRICAL`.

### 3.2 Remediation of `DEF-AI-010` (Assumption Engine Premature Claim Inflation)
- **Problem**: In `backend/engines/assumption_engine.py:63`, newly generated friction reality claims are hardcoded in the prompt template as `"status": "SUPPORTED"`.
- **Architectural Conflict**: In `backend/engines/knowledge_lifecycle.py:60` and `KNOWLEDGE_MODEL.md`, claims with zero attached empirical evidence links must initialize as `"HYPOTHESIS"`. Stamping an unvalidated AI extraction as `"SUPPORTED"` inflates project confidence fraudulently.
- **State Transition Reconciliation (`UNKNOWN → HYPOTHESIS`)**: AI extraction does not establish support. When the assumption engine identifies a previously unexamined proposition for active investigation, the extraction event establishes `UNKNOWN → HYPOTHESIS` as the post-extraction state. This is a state transition consistent with `KNOWLEDGE_MODEL.md`, rather than claiming `HYPOTHESIS` is a universal initial epistemic state.
- **Remediation**: Correct prompt template to initialize newly generated claims with `"status": "HYPOTHESIS"`.

### 3.3 Remediation of `DEF-AI-008` (Session Router Contract Reconciliation)
- **Problem**: `backend/routers/sessions.py:325` passes 3 arguments to `synthesize_decision_room(candidates)` which only accepts 1 argument. Line 332 calls `await execute_pivot_loop(...)` on a synchronous function and uses invalid parameter names (`kill_reason`, `next_candidate_id`).
- **Semantic Separation of Pivot Contract**: `DecisionPivotRequest.next_candidate_id` is a *replacement candidate/problem identifier*, while `invalidated_assumption_id` is an *assumption identifier*. These represent distinct semantic concepts and must never be conflated. Mapping `next_candidate_id → invalidated_assumption_id` is prohibited. If the pivot endpoint does not have sufficient information to identify an invalidated assumption, `invalidated_assumption_id` must be left unset (`None`).
- **Remediation**: Reconcile call signatures, retrieve candidates from session state, remove invalid `await`, pass `invalidated_assumption_id=None`, and map parameter names cleanly.

---

## 4. Scope Containment & Deferral Rationale

### 4.1 Deferral of FTS5 / BM25 Search
- Full-text search is an information retrieval capability, not a decision intelligence capability.
- Decision Room ranking operates on candidate problem records already selected or active within a session ($N = 2\text{ to }4$ candidates). Full-text search across large document corpora does not participate in this ranking.
- Combining FTS5 into SDD-004 would introduce unnecessary SQLite compile-time dependency checks and index migrations, violating the zero-migration boundary. FTS5 is cleanly deferred to SDD-005.

### 4.2 Deferral of Database Schema Expansion (`DEF-AI-012`)
- Inspection of `backend/storage/sqlite_adapter.py:215-224` confirmed that Table T11 `decision_records` perfectly matches canonical `DATABASE_SCHEMA.md`.
- Discrepancies noted in `DECISION_MODEL.md` represent conceptual documentation drift.
- Alleviating this drift via schema alteration would require database migrations, risking user data in `convera.db`. Deferring schema alterations maintains a zero-risk persistence boundary.

### 4.3 Deferral of Literature Matrix Mock Gaps (`DEF-AI-011`)
- Mock gaps in `literature_matrix.py:93-108` relate to Stage C literature matrix synthesis in the Research Track. They do not interact with Phase 2 Decision Room candidate ranking.
