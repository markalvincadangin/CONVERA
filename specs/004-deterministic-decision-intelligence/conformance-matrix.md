# CONVERA SDD-004: Conformance & Traceability Matrix

**Specification ID**: CONVERA-SDD-004  
**Classification**: Specification Conformance & Requirements Traceability Matrix  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [PROPOSED CONFORMANCE MATRIX — AWAITING HUMAN RATIFICATION GATE]  
**Revision**: 1.0.0  
**Baseline Git Commit**: `de0d652`  
**Proposed Feature Branch**: `feature/004-deterministic-decision-intelligence`  
**Target Integration Branch**: `develop`  

---

## 1. Upstream Normative Traceability

| Upstream Authority | Normative Requirement | Current Baseline Status | SDD-004 Target Conformance | Verification Check |
| :--- | :--- | :--- | :--- | :--- |
| **CONSTITUTION.md**<br>Article II | Tri-Part Confidence Decoupling: $C_{\text{AI}} \ne S_{\text{EVID}} \ne C_{\text{DEC}}$. Model prose cannot decide rankings or winners. | 🔴 **Violated**<br>`decision_engine.py` delegates ranking calculation and winner selection directly to LLM prompt. | 🟢 **Conforming**<br>Deterministic multi-criteria scoring computes ranking and winner; LLM restricted strictly to narrative explanation. | `CHK-004-01`<br>`CHK-004-05` |
| **CONSTITUTION.md**<br>Article III | Evidence Progression & Epistemic Integrity: Unverified AI generation cannot claim empirical verification. | 🔴 **Violated**<br>`verifier_agent.py` outputs `VERIFIED_EMPIRICAL`; `assumption_engine.py` generates claims as `SUPPORTED`. | 🟢 **Conforming**<br>Verifier agent verdicts restricted to advisory status (`PLAUSIBLE_SUPPORTED`); assumption claims initialize as `HYPOTHESIS`. | `CHK-004-09`<br>`CHK-004-10` |
| **CONSTITUTION.md**<br>Article V | External Boundary Principle: Platform maintains internal deterministic decision computation independent of external models. | 🔴 **Violated**<br>Ranking logic collapses into arbitrary `candidates[0]` if external model fails. | 🟢 **Conforming**<br>100% deterministic ranking calculation remains available offline with zero external network calls. | `CHK-004-06`<br>`INV-004-04` |
| **CONSTITUTION.md**<br>Article VI | Free-First Posture: Complete decision room functionality operational with zero mandatory cloud billing. | 🟡 **Partial**<br>Fallback operates but returns arbitrary unevidenced winner. | 🟢 **Conforming**<br>Deterministic ranking and structured fallback narrative function 100% locally with zero cloud API keys. | `CHK-004-06`<br>`INV-004-04` |
| **AI_ARCHITECTURE.md**<br>Section 2 | Deterministic Core & Bounded AI: Math & business rules computed by Python; LLMs explain and summarize. | 🔴 **Violated**<br>Math and ranking outsourced to prompt. | 🟢 **Conforming**<br>Pure Python composite formula computes candidate rank; LLM provides explanation. | `CHK-004-01`<br>`CHK-004-04` |
| **AI_ARCHITECTURE.md**<br>Section 8 | Degraded Mode Resilience: Gateway failures preserve workflow continuity and surface degraded state. | 🟡 **Partial**<br>SDD-003 gateway handles errors, but decision engine uses crude `candidates[0]`. | 🟢 **Conforming**<br>Decision engine surfaces full deterministic breakdown and sets `is_degraded = True`. | `CHK-004-06` |
| **CIIA.md**<br>Section 4 | Decision Room Advisor: AI acts as advisory analyst, never sovereign judge. | 🔴 **Violated**<br>Prompt instructions command LLM: "You are an Expert Incubation Decision Judge." | 🟢 **Conforming**<br>Prompt commands LLM to act as advisory analyst explaining pre-computed metrics. | `CHK-004-04` |
| **TRACK_GOVERNANCE.md**<br>GOV-06 | Attributable Rationale & Authorship: Human commits decision record; AI provides advisory input. | 🟢 **Conforming**<br>Preserved: `commit_decision` requires explicit user action in UI. | 🟢 **Preserved & Hardened**<br>Human retains exclusive authority to commit decision record; AI cannot auto-commit. | `INV-004-03` |
| **DATABASE_SCHEMA.md**<br>Table T11 | `decision_records` table schema integrity. | 🟢 **Conforming**<br>Schema matches Table T11. | 🟢 **Preserved**<br>Zero database schema changes, zero migrations. | `INV-004-01` |
| **SDD-003 Spec**<br>Section 3.1 | Canonical `GatewayResult` and `RuntimeProvenance` contracts. | 🟢 **Conforming**<br>Gateway outputs typed result. | 🟢 **Preserved**<br>Decision engine consumes `GatewayResult` and preserves provenance. | `CHK-004-06` |

---

## 2. Requirements-to-Test Conformance Mapping

| Requirement | Description | Verification Method | Automated Test / Verification Evidence | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **`FR-001`** | Deterministic Decision Ranking | Unit Test | `test_decision_engine.py::test_deterministic_ranking` | Candidate ranking matches exact composite score order. |
| **`FR-002`** | Composite Formula Calculation | Unit Test | `test_decision_engine.py::test_composite_formula_values` | Computed scores match $0.40 S_{\text{rub}} + 0.35 S_{\text{epi}} + 0.25 S_{\text{imp}} - R$, reusing authoritative `knowledge_lifecycle.py` `normalized_score`. |
| **`FR-003`** | 4-Tier Tie-Breaking | Unit Test | `test_decision_engine.py::test_tie_breaking_hierarchy` | Tied composite scores broken by epistemic balance, then rubric, then impact, then ID. |
| **`FR-004`** | LLM Invariant Enforcement | Unit Test | `test_decision_engine.py::test_llm_cannot_override_winner` | Injected mock LLM picking candidate #2 is overridden by deterministic winner #1. |
| **`FR-005`** | Degraded Fallback Narrative | Unit Test | `test_decision_engine.py::test_degraded_fallback_synthesis` | LLM failure returns valid synthesis with deterministic summary and `is_degraded = True`. |
| **`FR-006`** | Session Router Reconciliation | Integration Test | `test_decision_engine.py::test_session_router_contracts` | `/api/decision-room/synthesize` and `/pivot` execute without `TypeError`; `/pivot` preserves semantic separation between `next_candidate_id` and `invalidated_assumption_id`. |
| **`FR-007`** | Verifier Agent Boundary | Unit Test & Doc Check | `test_decision_engine.py::test_verifier_agent_verdict_taxonomy` | LLM response cannot set `verification_verdict = "VERIFIED_EMPIRICAL"`; `ClaimVerificationReport` docstrings match post-SDD-004 advisory taxonomy. |
| **`FR-008`** | Assumption Claim Initial Status | Unit Test | `test_decision_engine.py::test_assumption_claim_initial_hypothesis` | Extracted friction reality claims initialize with `status == "HYPOTHESIS"`, encoding `UNKNOWN → HYPOTHESIS` extraction transition. |
| **`AC-08`** | Empty Candidate Set Handling | Unit Test | `test_decision_engine.py::test_empty_candidate_set` | `candidate_ids = []` returns deterministic neutral synthesis with 0 candidates without arbitrary indexing `candidates[0]`. |
| **`AC-09`** | Single Candidate Handling | Unit Test | `test_decision_engine.py::test_single_candidate` | Exactly 1 candidate receives `rank = 1` and `verdict = "RECOMMENDED"` with no artificial comparisons. |
| **`AC-10`** | Verdict Taxonomy Integrity | Unit Test | `test_decision_engine.py::test_verdict_taxonomy_integrity` | Automated test confirms LLM prompt schema and fallback cannot emit `VERIFIED_EMPIRICAL`. |
| **`NFR-001`** | Latency $< 10\text{ms}$ | Benchmark Test | `test_decision_engine.py::test_deterministic_latency_benchmark` | Execution time for pure mathematical ranking of 4 candidates $< 10\text{ms}$ (normative acceptance threshold; $< 5\text{ms}$ aspirational target). |
| **`NFR-002`** | 100% Reproducibility | Stress Test | `test_decision_engine.py::test_reproducibility_across_iterations` | 50 consecutive runs produce bit-identical ranks and floating-point scores. |
| **`NFR-005`** | Backward Compatibility | Contract Test | `test_decision_engine.py::test_frontend_payload_contract` | Payload satisfies `DecisionSynthesis` interface fields. |
| **`GR-003`** | Zero Database Migrations | Schema Inspection | `git diff backend/storage/sqlite_adapter.py` | Zero changes to SQLite table creation queries. |
