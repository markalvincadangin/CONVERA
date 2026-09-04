# CONVERA SDD-004: Defect Register

**Specification ID**: CONVERA-SDD-004  
**Classification**: Architectural & Implementation Defect Register  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [PROPOSED DEFECT REGISTER — AWAITING HUMAN RATIFICATION GATE]  
**Revision**: 1.0.0  
**Baseline Git Commit**: `de0d652`  
**Proposed Feature Branch**: `feature/004-deterministic-decision-intelligence`  
**Target Integration Branch**: `develop`  

---

## 1. Triaged Defect Inventory

| Defect ID | Severity | Category | Title & Summary | Remediation in SDD-004 | Scope Status | Proposed Resolution Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`DEF-AI-007`** | **CRITICAL** | Architecture | **Decision Engine Ranking Inversion**<br>`backend/engines/decision_engine.py:43-93` prompts an LLM to pick `recommended_winner_id` and assign ordinal `rank`. On error, it arbitrarily picks `candidates[0]`. | Invert architecture: compute composite scores and ordinal ranks deterministically using `evidence_scorer.py` and reusing `knowledge_lifecycle.py`'s authoritative `normalized_score`. Classify weights, risk deductions, and verdict threshold ($60.0$) as `[PROPOSED DEFAULT]`. Handle empty candidate set (`[]`) and single candidate deterministically. Restrict LLM to narrative explanation; prevent LLM winner override; assemble structured fallback summary with `is_degraded = True`. | **IN-SCOPE (Core)** | 🟡 **SPECIFIED (Ready for Implementation)** |
| **`DEF-AI-008`** | **HIGH** | Contract | **Session Router Decision Endpoint Signature Mismatch**<br>`backend/routers/sessions.py:325` passes 3 arguments to 1-argument `synthesize_decision_room()`. Line 332 awaits synchronous `execute_pivot_loop()` with mismatched argument names. | Reconcile contracts: retrieve candidate list from session state and pass to `synthesize_decision_room()`. Remove `await` on `execute_pivot_loop()` and align argument names. Preserve strict semantic separation: `DecisionPivotRequest.next_candidate_id` is a candidate identifier and must NOT be mapped to `invalidated_assumption_id` (pass `None`). | **IN-SCOPE (Contract)** | 🟡 **SPECIFIED (Ready for Implementation)** |
| **`DEF-AI-009`** | **CRITICAL** | Epistemic | **Autonomous Empirical Verification Assertion in Verifier Agent**<br>`backend/agents/verifier_agent.py:68,99` prompts the LLM to output `"verification_verdict": "VERIFIED_EMPIRICAL"`, conflating model prose with empirical proof. | Strip `"VERIFIED_EMPIRICAL"` from prompt and fallback schemas. Restrict model verdicts to advisory evaluations (`"PLAUSIBLE_SUPPORTED"`, etc.). Restrict empirical status to registry verification and human review. Reconcile `ClaimVerificationReport` docstrings and comments to match post-SDD-004 advisory taxonomy. | **IN-SCOPE (Boundary)** | 🟡 **SPECIFIED (Ready for Implementation)** |
| **`DEF-AI-010`** | **HIGH** | Epistemic | **Premature Claim Status Inflation in Assumption Engine**<br>`backend/engines/assumption_engine.py:63` prompt template hardcodes newly extracted friction reality claims with `"status": "SUPPORTED"`. | Change prompt template to initialize claims with `"status": "HYPOTHESIS"`, encoding the `UNKNOWN → HYPOTHESIS` extraction transition conforming to `KNOWLEDGE_MODEL.md` and `knowledge_lifecycle.py:60`. | **IN-SCOPE (Boundary)** | 🟡 **SPECIFIED (Ready for Implementation)** |
| **`DEF-AI-011`** | **MEDIUM** | Research Track | **Static Mock Research Gaps in Literature Matrix**<br>`backend/engines/literature_matrix.py:93-108` returns hardcoded static mock gap dictionaries (`GAP-01`, `GAP-02`) during Stage C literature synthesis. | Defer to dedicated Research Track Stage C synthesis specification. Does not participate in Phase 2 Decision Room candidate ranking. | **DEFERRED** | ⏸️ **DEFERRED TO FUTURE RESEARCH SDD** |
| **`DEF-AI-012`** | **LOW** | Documentation | **Decision Record Model Schema Drift**<br>`DECISION_MODEL.md` lists conceptual fields (`chosen_concept`, `validity_status`) not present in `DATABASE_SCHEMA.md` Table T11 or `backend/storage/sqlite_adapter.py`. | Maintain zero database migrations in SDD-004. Reconcile documentation post-implementation. Existing SQLite schema remains 100% stable. | **DEFERRED (Drift)** | ⏸️ **DEFERRED (Zero Migration Boundary)** |

---

## 2. Scope Reconciliation & Boundary Rationale

### Why `DEF-AI-007` through `DEF-AI-010` are Bundled:
1. `DEF-AI-007` (Decision Engine Inversion) is the primary architectural defect. Resolving it requires an authoritative mathematical definition of candidate scores.
2. `DEF-AI-008` (Session Router Mismatch) directly calls `decision_engine.py`. Leaving it broken would cause runtime crashes whenever users interact with the Decision Room via session endpoints.
3. `DEF-AI-009` and `DEF-AI-010` represent epistemic boundary breaches that directly corrupt the inputs to the decision engine. If an LLM can mint `VERIFIED_EMPIRICAL` or if assumption claims start as `SUPPORTED`, the deterministic epistemic balance engine will calculate fraudulent scores. Sealing these boundaries is strictly necessary for deterministic decision integrity.

### Why `DEF-AI-011` and `DEF-AI-012` are Excluded:
1. `DEF-AI-011` operates in Stage C literature synthesis, which is far downstream from Phase 2 incubation candidate selection.
2. `DEF-AI-012` involves database schema changes. CONVERA's governance policy strictly mandates that database migrations require separate risk assessment and explicit authorization. The current SQLite schema is functional and matches `DATABASE_SCHEMA.md`.
