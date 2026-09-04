# CONVERA SDD-004: Deterministic Decision Intelligence & Epistemic Boundary Hardening Specification

**Specification ID**: CONVERA-SDD-004  
**Classification**: Decision Intelligence, Deterministic Ranking & Epistemic Boundary Hardening  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [PROPOSED SPECIFICATION — AWAITING HUMAN RATIFICATION GATE]  
**Revision**: 1.0.0  
**Baseline Git Commit**: `de0d652`  
**Proposed Feature Branch**: `feature/004-deterministic-decision-intelligence`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, V, VI, VII, VIII)
- `docs/04-ai/AI_ARCHITECTURE.md` (Sections 1–10)
- `docs/04-ai/AI_GOVERNANCE.md` (Sections 1–6)
- `docs/04-ai/CIIA.md` (Sections 1–8)
- `docs/02-system/EVIDENCE_MODEL.md` (Sections 1–5)
- `docs/02-system/KNOWLEDGE_MODEL.md` (Sections 1–6)
- `docs/05-data/PROVENANCE.md` (Sections 1–4)
- `docs/05-data/DATABASE_SCHEMA.md` (Table T11: `decision_records`)
- `docs/07-tracks/INNOVATION_TRACK.md` (Phases 2 & 3)
- `docs/07-tracks/TRACK_GOVERNANCE.md` (GOV-06)
- `CONVERA_UPGRADE.md` (Sections 1–30)
- `specs/003-ai-runtime-provider-resilience/spec.md` (SDD-003 Gateway Contracts)

---

## 1. Executive Summary & Purpose

The purpose of **SDD-004** is to resolve the fundamental architectural defect in CONVERA's Decision Room intelligence layer: **LLM-First Decision Ranking Inversion (`DEF-AI-007`)**, and harden the epistemic boundaries governing claim and verification states (`DEF-AI-008`, `DEF-AI-009`, `DEF-AI-010`).

Currently, `backend/engines/decision_engine.py` delegates candidate problem ranking, ordinal sorting, and winner recommendation directly to an external LLM prompt ("Expert Technopreneurship Investment & Incubation Decision Judge"). When the LLM provider fails or is degraded, the engine blindly falls back to picking the first candidate in the list (`candidates[0]`), ignoring all empirical evidence. Furthermore, epistemic boundaries have leaked across the codebase: `verifier_agent.py` prompts the LLM to autonomously mint empirical evidence (`VERIFIED_EMPIRICAL`), `assumption_engine.py` inflates newly generated claims directly to `SUPPORTED` without validation, and `routers/sessions.py` crashes due to broken function signatures when calling the decision engine.

SDD-004 operationalizes four supreme constitutional invariants:
1. **Tri-Part Confidence Decoupling (Constitution Art. II)**: $\text{AI Linguistic Certainty } (C_{\text{AI}}) \ne \text{Empirical Evidence Strength } (S_{\text{EVID}}) \ne \text{Decision Conviction } (C_{\text{DEC}})$. Numerical ranking and winner recommendation must be derived from mathematical evidence scoring, not model prose.
2. **External Boundary Principle (Constitution Art. V)**: Decision intelligence computation is internal, deterministic, and sovereign. External LLMs serve exclusively as advisory narrative explainers and context summarizers.
3. **Epistemic Provenance & Integrity (Constitution Art. III)**: Synthetic or model-generated assessments cannot autonomously declare empirical verification. Newly extracted hypotheses start in `HYPOTHESIS` state until empirically corroborated.
4. **Free-First & Offline Sovereignty (Constitution Art. VI)**: Decision ranking and comparative candidate evaluation remain 100% operational offline with zero network calls and zero mandatory cloud costs.

---

## 2. Specification Precedence & Governing Invariants

All agents, auditors, and engineers working on SDD-004 are governed by the strict constitutional precedence hierarchy:

```text
CONSTITUTION (docs/00-foundation/CONSTITUTION.md)
       ↓
AUTHORITATIVE SPECIFICATIONS (docs/00 through docs/08)
       ↓
SDD-004 REVISED SPECIFICATION (specs/004-deterministic-decision-intelligence/spec.md)
       ↓
CURRENT IMPLEMENTATION (backend/engines/decision_engine.py, backend/routers/)
       ↓
AGENT REASONING
```

### Invariant Rules for SDD-004:
1. **`[NORMATIVE]` Architectural Responsibility Separation**: Decision intelligence is divided strictly into two sequential phases:
   - **Phase A (Deterministic Computation)**: Mathematical scoring, multi-criteria weighting, ordinal sorting, and baseline winner recommendation are computed deterministically by CONVERA domain engines.
   - **Phase B (Advisory LLM Explanation)**: The deterministic ranking and breakdowns are passed to the LLM Gateway solely to generate a narrative executive summary and trade-off comparison.
2. **`[NORMATIVE]` Decision Sovereignty Boundary**:
   - The LLM **MUST NOT** modify candidate rankings, change ordinal positions, or select a winner different from the deterministic calculation.
   - The deterministic engine **MUST NOT** silently make final human commitments; the founder or researcher in the Decision Room retains exclusive sovereign authority to commit a decision (`commit_decision`).
3. **`[NORMATIVE]` Epistemic Verification Boundary**:
   - The LLM **MUST NOT** autonomously assert `VERIFIED_EMPIRICAL` status. Empirical verification requires external registry validation (e.g. Crossref DOI match) and/or human researcher ratification.
   - Unverified assumption claims generated by AI analysis **MUST** initialize with `status = 'HYPOTHESIS'`. Initializing newly generated claims as `'SUPPORTED'` is strictly prohibited.
4. **`[NORMATIVE]` Deterministic Offline Fallback**:
   - If the LLM provider cascade is unavailable, throttled, or degraded, the Decision Room **MUST** remain 100% functional.
   - Fallback narrative summaries **MUST** be generated deterministically from candidate metrics (rubric breakdown, DOI counts, and quantified impact) without throwing runtime exceptions or picking arbitrary winners.
5. **`[NORMATIVE]` Zero Database Migrations**:
   - SDD-004 operates strictly within the existing 23-table SQLite WAL schema (`DATABASE_SCHEMA.md` Table T11: `decision_records`). No database schema alterations or migrations are authorized.
6. **`[NORMATIVE]` Explicit Scope Containment**:
   - FTS5 full-text search, BM25 retrieval, vector embeddings, and literature matrix heuristic expansions are explicitly **OUT OF SCOPE** and deferred to future specifications.

---

## 3. Scope Reconciliation & Defect Triage

| Defect ID | Severity | Category | Target Component | Triage Decision | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`DEF-AI-007`** | **CRITICAL** | Architecture | `backend/engines/decision_engine.py` | **IN-SCOPE (Core)** | Central architectural defect: LLM prompt computes candidate ranking & winner directly. Fallback is arbitrary `candidates[0]`. |
| **`DEF-AI-008`** | **HIGH** | Contract | `backend/routers/sessions.py` | **IN-SCOPE (Contract)** | Broken API contract: 3 arguments passed to 1-argument `synthesize_decision_room()`, and synchronous `execute_pivot_loop()` awaited with mismatched arguments. |
| **`DEF-AI-009`** | **CRITICAL** | Epistemic | `backend/agents/verifier_agent.py` | **IN-SCOPE (Boundary)** | Epistemic breach: LLM prompted to autonomously assert `VERIFIED_EMPIRICAL` status, violating Constitution Art. II & III ($C_{\text{AI}} \ne S_{\text{EVID}}$). |
| **`DEF-AI-010`** | **HIGH** | Epistemic | `backend/engines/assumption_engine.py` | **IN-SCOPE (Boundary)** | Epistemic inflation: LLM prompt template hardcodes `status: "SUPPORTED"` for newly generated friction reality claims, contradicting `knowledge_lifecycle.py` (`HYPOTHESIS`). |
| **`DEF-AI-011`** | **MEDIUM** | Research Track | `backend/engines/literature_matrix.py` | **DEFERRED** | Hardcoded mock research gaps (`GAP-01`, `GAP-02`) belong to future Research Track Stage C synthesis evolution, not Decision Room ranking. |
| **`DEF-AI-012`** | **LOW** | Documentation | `docs/05-data/DECISION_MODEL.md` | **DEFERRED (Drift)** | Discrepancy between concept doc and SQLite schema. SQLite matches canonical `DATABASE_SCHEMA.md` Table T11. Defer to maintain zero database migrations. |

---

## 4. Problem Definition & Architectural Discrepancy

### 4.1 Current Behavior
In `backend/engines/decision_engine.py:43-93`:
1. `synthesize_decision_room(candidates)` formats candidate fields into text and sends a prompt to `generate_response_with_fallback()`:
   > "You are an Expert Technopreneurship Investment & Incubation Decision Judge. Evaluate and rank the following candidate problem theses... OUTPUT FORMAT: recommended_winner_id, candidate_breakdowns with rank..."
2. The LLM parses the text and invents ordinal rankings (`rank: 1, 2, ...`) and selects `recommended_winner_id` based on ephemeral stochastic weights.
3. If an error occurs (e.g. network timeout, rate limit, parse error), the exception handler executes:
   ```python
   winner = candidates[0]
   return {
       "recommended_winner_id": winner.get("id"),
       ...
   }
   ```
   The first candidate in the list is blindly declared the recommended winner regardless of evidence or impact!

### 4.2 Expected Behavior
1. `synthesize_decision_room()` invokes CONVERA's deterministic scoring engine.
2. For every candidate, a composite mathematical score is computed from verified rubric dimensions (`evidence_scorer.py`), epistemic net balances (`knowledge_lifecycle.py`), quantified loss specificity, and unvalidated assumption risk penalties.
3. Candidates are sorted deterministically using unambiguous mathematical ordering and tie-breaking rules.
4. The winning candidate is selected deterministically based on the highest composite score.
5. The pre-calculated ranking, scores, and breakdowns are passed to the LLM Gateway solely to generate a narrative executive summary and qualitative trade-off analysis.
6. If the LLM call fails or is degraded, the deterministic ranking and winner recommendation remain 100% available and intact, accompanied by a deterministic template summary.

### 4.3 Why an SDD is Required
This is not a cosmetic bug fix. It rectifies a systemic architectural inversion:
- Restores constitutional compliance with Article II ($C_{\text{AI}} \ne S_{\text{EVID}} \ne C_{\text{DEC}}$).
- Re-aligns CONVERA's existing domain engines (`evidence_scorer`, `knowledge_lifecycle`, `impact_engine`) into the core decision pipeline.
- Reconciles conflicting API router contracts (`routers/sessions.py` vs `routers/decisions.py`).
- Seals epistemic leaks where LLM generation was masquerading as empirical ground truth.

---

## 5. Architectural Responsibility & Authority Boundary

```text
Evidence & Candidate Data (ProblemRecord, Sources, Claims, Assumptions)
                           │
                           ▼
  Phase A: Deterministic Intelligence Engine (Pure Python / Domain Engines)
  ├── calculate_score_breakdown() (Rubric Score: Diversity, Tier, Specificity)
  ├── compute_claim_epistemic_balance() (Empirical Net Balance & Contradictions)
  ├── calculate_quantified_impact_score() (Economic & Operational Friction)
  └── calculate_assumption_risk_penalty() (Unvalidated & Falsified Risks)
                           │
                           ▼
             Deterministic Ranking & Ordering
             ├── Mathematical Composite Scoring
             ├── Strict Tie-Breaking Hierarchy
             └── Deterministic Winner Selection
                           │
                           ▼
      Phase B: LLM Narrative Explainer (Advisory Only)
      ├── Consumes Pre-Ranked Candidates & Scores
      ├── Generates Narrative Executive Summary
      ├── Generates Qualitative Pros & Risks
      └── [CONSTITUTIONAL CONSTRAINT]: Cannot alter winner or ordinal rank
                           │
                           ▼
             Decision Synthesis Envelope (API)
                           │
                           ▼
  Phase C: Human Decision Sovereignty (Founder / Researcher Ratification)
  ├── Explores Candidate Breakdown & Rubric Scores
  ├── Reviews LLM Trade-Off Commentary
  └── Manually Commits Decision Record (Lock for Phase 3 Mom Test)
```

### Tri-Part Decoupling Operationalization:
- **$\text{AI Fluency } (C_{\text{AI}})$**: Generates narrative explanations; assigned $0.0$ evidentiary weight.
- **$\text{Evidence Strength } (S_{\text{EVID}})$**: Computed mathematically from source tiers, DOIs, claim links, and rubric dimensions.
- **$\text{Decision Conviction } (C_{\text{DEC}})$**: Formally owned and asserted by the human founder/researcher upon committing a decision record.

---

## 6. Deterministic Decision Intelligence Engine

### 6.1 Participating Deterministic Metrics

| Metric | Source Engine | Range | Missing Data Handling | Authoritative Status | Ranking Effect |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rubric Score ($S_{\text{rubric}}$)** | `backend/engines/evidence_scorer.py` (`calculate_score_breakdown`) | $[0.0, 100.0]$ | Fallback to problem fields; defaults to base score $\ge 0.0$ | Authoritative | Positive linear contribution |
| **Epistemic Score ($S_{\text{epistemic}}$)** | `backend/engines/knowledge_lifecycle.py` (`compute_claim_epistemic_balance`) | $[0.0, 100.0]$ | If candidate has no linked claims, defaults to neutral $50.0$ (`HYPOTHESIS` baseline) | Authoritative | Positive linear contribution; heavily penalizes contradictions |
| **Impact Score ($S_{\text{impact}}$)** | Dimension 3 of `calculate_score_breakdown` ($0\text{--}20 \text{ pts} \times 5.0$) | $[0.0, 100.0]$ | If unquantified or empty, evaluates to $0.0$ | Authoritative | Positive linear contribution |
| **Risk Penalty ($R_{\text{assumptions}}$)** | Problem assumptions & validation tests | $[0.0, 50.0]$ | If no assumptions or tests, penalty is $0.0$ | Authoritative | Subtractive penalty on composite score |

### 6.2 Component Metric Definitions

#### 1. Rubric Score ($S_{\text{rubric}}$)
Computed via `calculate_score_breakdown(candidate, sources)` across 5 dimensions:
- Source Diversity ($0\text{--}20$ pts)
- Source Tier Quality ($0\text{--}25$ pts: Tier A, Tier B, Tier C)
- Quantified Impact ($0\text{--}20$ pts)
- Workaround Specificity ($0\text{--}20$ pts)
- Actor & Geographic Precision ($0\text{--}15$ pts)
$$\text{Raw Rubric Score} \in [0.0, 100.0]$$

#### 2. Epistemic Balance Score ($S_{\text{epistemic}}$)
For each claim $c_i \in \text{claims}(P)$:
$$\text{NetBalance}(c_i) = \sum \text{Points}(\text{SUPPORTS}) - \sum \text{Points}(\text{CONTRADICTS})$$
Where:
- $\text{Tier A} = 3.0$, $\text{Tier B} = 2.0$, $\text{Tier C} = 1.0$
- $\text{Multiplier}: \text{STRONG} = 1.0, \text{MODERATE} = 0.7, \text{WEAK} = 0.4$

**Normalization**: $S_{\text{epistemic}}$ reuses the existing authoritative `normalized_score` calculation from `backend/engines/knowledge_lifecycle.py:63-69`. No second normalization formula is introduced.

The existing normalization is a ratio-based mapping:
$$\text{ratio} = \text{clamp}\left( \frac{\text{net\_score} + \text{total\_magnitude}}{2 \cdot \text{total\_magnitude}}, 0.0, 1.0 \right)$$
$$\text{normalized\_score} = \text{round}(\text{ratio} \times 100.0, 1)$$

For a candidate with multiple claims, the aggregate epistemic score is the mean of per-claim `normalized_score` values:
$$S_{\text{epistemic}}(P) = \begin{cases}
\frac{1}{N} \sum_{i=1}^N \text{normalized\_score}(c_i), & N > 0 \\
50.0, & N = 0
\end{cases}$$

- A candidate with no claims receives $50.0$ (neutral `HYPOTHESIS` baseline).
- The `normalized_score` is already $\in [0.0, 100.0]$ by construction, so no additional clamping is required.
- **Rationale**: Reusing the existing authoritative engine ensures a single normalization path, avoids introducing competing formulas, and guarantees consistency with `KNOWLEDGE_MODEL.md` and existing epistemic lifecycle computations.

#### 3. Quantified Impact Score ($S_{\text{impact}}$)
Directly normalized from Dimension 3 of `calculate_score_breakdown`:
$$S_{\text{impact}}(P) = \text{Dimension3\_Score}(P) \times 5.0 \in [0.0, 100.0]$$

#### 4. Assumption Risk Penalty ($R_{\text{assumptions}}$)
For candidate assumptions and validation tests:
$$R_{\text{assumptions}}(P) = \min\left( \sum_{\text{asm} \in \text{assumptions}} \text{RiskPoints}(\text{asm}) + \sum_{\text{test} \in \text{tests}} \text{FailurePoints}(\text{test}), 50.0 \right)$$
- **`[PROPOSED DEFAULT]`** Falsified Assumption / Failed Validation Test: $+15.0$ pts deduction.
- **`[PROPOSED DEFAULT]`** Untested Critical Risk Assumption: $+10.0$ pts deduction.
- **`[PROPOSED DEFAULT]`** Untested High Risk Assumption: $+5.0$ pts deduction.
- **`[PROPOSED DEFAULT]`** Total penalty capped at $50.0$ points.

**Classification**: These deduction values are engineering heuristics, NOT empirically validated constants. They are initial defaults subject to calibration based on incubation trial evidence. They must not be described as normative epistemic laws. They are isolated in `RISK_PENALTY_DEFAULTS_V1` to facilitate transparent versioning.

---

## 7. Composite Ranking Formula

$$\text{Score}_{\text{composite}}(P) = \text{clamp}\left( w_{\text{rubric}} \cdot S_{\text{rubric}}(P) + w_{\text{epistemic}} \cdot S_{\text{epistemic}}(P) + w_{\text{impact}} \cdot S_{\text{impact}}(P) - R_{\text{assumptions}}(P), 0.0, 100.0 \right)$$

### 7.1 Weight Calibration
- **`[PROPOSED DEFAULT]` Weights**:
  - $w_{\text{rubric}} = 0.40$ (Documentation rigor & source tier quality)
  - $w_{\text{epistemic}} = 0.35$ (Empirical claim grounding & contradiction absence)
  - $w_{\text{impact}} = 0.25$ (Quantified sufferer pain & financial/time friction)
  - $\sum w = 1.00$
- **Weight Classification**: `[PROPOSED DEFAULT — SUBJECT TO RATIFICATION & TUNING]`. These weights are initial deterministic ranking defaults for SDD-004. They are NOT empirically validated and must not be described as empirically established. No CONVERA Constitution article, AI Governance specification, or existing ratified document prescribes these specific values. They remain subject to future calibration based on incubation trial evidence. They are isolated in a configuration dictionary (`RANKING_WEIGHTS_V1`) to facilitate transparent versioning and calibration.

### 7.2 Strict Tie-Breaking Hierarchy
When two candidates $P_A$ and $P_B$ produce identical $\text{Score}_{\text{composite}}$ (within $\epsilon = 0.01$):
1. **Primary Tie-Breaker**: Higher $S_{\text{epistemic}}$ (greater empirical validation wins).
2. **Secondary Tie-Breaker**: Higher $S_{\text{rubric}}$ (higher multi-dimensional documentation rigor wins).
3. **Tertiary Tie-Breaker**: Higher $S_{\text{impact}}$ (greater quantified economic/temporal loss wins).
4. **Quaternary Deterministic Tie-Breaker**: Lower lexicographical candidate ID (`P-01` precedes `P-02`).

### 7.3 Verdict Classification Thresholds
- $\text{Rank } 1$: `RECOMMENDED`
- $\text{Rank } > 1 \text{ and } \text{Score}_{\text{composite}} \ge \theta_{\text{viable}}$: `VIABLE_ALTERNATIVE`
- $\text{Rank } > 1 \text{ and } \text{Score}_{\text{composite}} < \theta_{\text{viable}}$: `HIGH_RISK`

**`[PROPOSED DEFAULT]` `[TUNABLE HEURISTIC]`** $\theta_{\text{viable}} = 60.0$. This threshold is a configurable decision-room presentation heuristic, NOT a normative acceptance requirement or epistemic truth boundary. The composite score is an advisory decision-support signal; scores $\ge 60.0$ do not imply objective viability, and scores $< 60.0$ do not imply objective high risk. The threshold is isolated in `VERDICT_THRESHOLD_V1` to facilitate transparent tuning.

---

## 8. LLM Advisory Role & Epistemic Boundary Hardening

### 8.1 LLM Advisory Role
After Phase A computes the deterministic ranking and score breakdowns:
1. The LLM Gateway is invoked with a constrained prompt containing:
   - The pre-computed winner ID (`recommended_winner_id`).
   - The pre-computed ranking order and candidate scores.
   - The specific rubric and risk breakdowns for each candidate.
2. The LLM is tasked **exclusively** with:
   - Synthesizing a 2-3 sentence executive recommendation summary explaining *why* the deterministic metrics favor the winner.
   - Generating 1-2 concise qualitative pros and 1-2 key risks for each candidate.
3. **Enforcement**: If the LLM generates a response containing a different winner ID or altered ordinal ranks, the engine programmatically overrides the LLM's ranking with the deterministic ranking.

### 8.2 Fallback Narrative Synthesis (Degraded Mode)
If the LLM Gateway fails, times out, or enters synthetic fallback:
1. Deterministic ranking, scores, breakdowns, and winner selection remain 100% active.
2. A deterministic narrative summary is assembled:
   ```text
   "Candidate [WINNER_ID] is recommended based on a deterministic composite score of [SCORE]%, exhibiting superior [HIGHEST_DIMENSION] and [NUM_PAPERS] attached research sources with [NUM_CLAIMS] verified claims."
   ```
3. Candidate pros and risks are generated deterministically from candidate fields (sufferer occupation, active workaround, unvalidated assumptions).
4. Returned synthesis includes `is_deterministic: True`, `is_degraded: True`.

### 8.3 Epistemic Boundary Hardening Requirements

#### DEF-AI-009 Remediation (`backend/agents/verifier_agent.py`)
- **`[NORMATIVE]` Prohibition of Autonomous Empirical Verification**: The LLM prompt in `verifier_agent.py` must NOT allow the model to output `"VERIFIED_EMPIRICAL"`.
- Valid LLM verification verdicts are strictly limited to advisory evaluations:
  - `"PLAUSIBLE_SUPPORTED"` (text matches source abstract/metadata)
  - `"PLAUSIBLE_UNVERIFIED"` (source cited but context insufficient)
  - `"UNVERIFIED_CITATION"` (DOI or source missing)
  - `"POTENTIAL_CONTRADICTION"` (source text contradicts claim)
- Setting `verification_verdict = "VERIFIED_EMPIRICAL"` is restricted exclusively to automated Crossref DOI verification + human researcher confirmation.
- **`[NORMATIVE]` ClaimVerificationReport Model Reconciliation**: The `ClaimVerificationReport` Pydantic model at `backend/agents/verifier_agent.py:20-30` documents `VERIFIED_EMPIRICAL` in its `verification_verdict` field comment. This comment/documentation must be updated to reflect the post-SDD-004 advisory verdict taxonomy. The LLM must not be documented as having authority to emit `VERIFIED_EMPIRICAL`.

#### DEF-AI-010 Remediation (`backend/engines/assumption_engine.py`)
- **`[NORMATIVE]` Prohibition of Premature Claim Inflation**: In `assumption_engine.py:63`, the prompt template must NOT hardcode `"status": "SUPPORTED"`.
- All newly extracted problem claims must initialize as `"status": "HYPOTHESIS"`, conforming to `KNOWLEDGE_MODEL.md` and `knowledge_lifecycle.py:60`.
- **Knowledge State Transition Justification**: Per `KNOWLEDGE_MODEL.md` Section 2, the canonical epistemic lifecycle begins at `UNKNOWN` ("Unexamined proposition") and transitions to `HYPOTHESIS` ("Identified for active investigation") when a proposition is prioritized for investigation. The AI assumption extraction event constitutes this `UNKNOWN → HYPOTHESIS` transition: the engine is actively identifying and structuring previously unexamined propositions for investigation. Therefore, `HYPOTHESIS` is the correct post-extraction initial state — not the universal initial epistemic state, but the governed post-identification state. AI extraction does NOT establish empirical support.
- Transition to `SUPPORTED` occurs exclusively after empirical evidence links are recorded in `claim_evidence_links` with net positive score $\ge 2.0$.

---

## 9. API Contracts & Compatibility

### 9.1 Decision Synthesis API (`/api/decisions/synthesize`)
Endpoint: `POST /api/decisions/synthesize`  
Consumer: `web/src/services/problemService.ts:59`, `DecisionRoomWorkspace.tsx`

**Request Payload** (Unchanged):
```json
{
  "candidate_ids": ["P-01", "P-02", "P-03"]
}
```

**Response Payload** (Backward-Compatible Extension):
```json
{
  "status": "success",
  "synthesis": {
    "recommended_winner_id": "P-01",
    "recommendation_summary": "Candidate P-01 exhibits the strongest empirical foundation...",
    "candidate_breakdowns": [
      {
        "problem_id": "P-01",
        "rank": 1,
        "pros": ["Documented for smallholder farmers in Pototan", "3 Tier-A sources attached"],
        "risks": ["Requires Mom Test validation on transport costs"],
        "verdict": "RECOMMENDED",
        "composite_score": 84.5,
        "rubric_score": 82.0,
        "epistemic_score": 90.0,
        "impact_score": 85.0,
        "risk_penalty": 0.0
      },
      {
        "problem_id": "P-02",
        "rank": 2,
        "pros": ["Clear operational friction"],
        "risks": ["Contradicting market study linked"],
        "verdict": "VIABLE_ALTERNATIVE",
        "composite_score": 62.0,
        "rubric_score": 68.0,
        "epistemic_score": 50.0,
        "impact_score": 70.0,
        "risk_penalty": 5.0
      }
    ],
    "is_deterministic": true,
    "ranking_version": "v1.0.0",
    "is_degraded": false
  }
}
```
*Backward Compatibility Note*: All existing frontend consumers accessing `synthesis.recommended_winner_id`, `synthesis.recommendation_summary`, and `synthesis.candidate_breakdowns[i].rank` continue functioning without any changes.

### 9.2 Session Router Contract Reconciliation (`DEF-AI-008`)
In `backend/routers/sessions.py`:
1. `POST /api/decision-room/synthesize`:
   - Resolve parameter mismatch: Fetch candidate problems associated with the session from storage and invoke `await synthesize_decision_room(candidates)`.
2. `POST /api/decision-room/pivot`:
   - Remove invalid `await` on synchronous `execute_pivot_loop()`.
   - Align argument mapping:
     - `current_problem_id` $\to$ `current_problem_id`
     - `kill_reason` $\to$ `pivot_reason`
   - **`[NORMATIVE]` Pivot Parameter Semantic Separation**: `DecisionPivotRequest.next_candidate_id` is a *replacement candidate/problem identifier* and MUST NOT be mapped to `invalidated_assumption_id`, which is an *assumption identifier*. These represent semantically distinct concepts. If the pivot endpoint does not have sufficient information to identify a specific assumption to invalidate, the `invalidated_assumption_id` parameter must be left unset (`None`) rather than receiving a candidate ID. The `next_candidate_id` value may be logged in the decision rationale or stored in the pivot history for audit purposes.

---

## 10. Database Boundary & Zero Migration Guarantee

- **`[NORMATIVE]` Database Impact**: **ZERO SCHEMA CHANGES**.
- Table T11 `decision_records` in `backend/storage/sqlite_adapter.py:215-224` is preserved intact:
  - `id TEXT PRIMARY KEY`
  - `session_id TEXT`
  - `stage TEXT NOT NULL`
  - `selected_problem_id TEXT NOT NULL`
  - `rejected_problem_ids TEXT DEFAULT '[]'`
  - `decision_rationale TEXT NOT NULL`
  - `supporting_evidence_ids TEXT DEFAULT '[]'`
  - `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `DEF-AI-012` is recognized as conceptual documentation drift and deferred. The existing SQLite WAL schema remains untouched and fully compatible.

---

## 11. Technology Boundary & Non-Goals

### 11.1 Technology Boundary
- **Allowed**:
  - Python 3.13 Standard Library (`math`, `typing`, `re`, `json`, `dataclasses`)
  - Existing SQLite WAL storage adapters (`backend/storage/`)
  - Existing CONVERA domain engines (`backend/engines/`)
  - Existing LLM Gateway & Provider Cascade (`backend/llm_gateway.py`)
- **Strictly Prohibited**:
  - No new external package dependencies (no `scikit-learn`, `numpy`, `pandas`).
  - No AI/agent frameworks (no `LangChain`, `LlamaIndex`, `CrewAI`, `AutoGen`).
  - No vector databases or embedding models (no `FAISS`, `Chroma`, `DuckDB`).

### 11.2 Explicit Non-Goals
1. **No Gateway Redesign**: SDD-003 gateway cascade and provider cooldown tracking are preserved as-is.
2. **No FTS5 / BM25 Search**: Full-text search and keyword retrieval are explicitly deferred to SDD-005.
3. **No Database Migrations**: SQLite schema remains 100% frozen.
4. **No Frontend UI Overhaul**: CCDS v2.0 Decision Room components consume enriched data without structural redesign.
5. **No Literature Matrix Refactoring**: Mock research gaps in `literature_matrix.py` (`DEF-AI-011`) are deferred.
6. **No Vector Embeddings / Semantic Rerankers**: Decision ranking is purely rubric- and epistemic-driven.

---

## 12. Requirements Register

### 12.1 Functional Requirements

- **`FR-001`**: `synthesize_decision_room` must compute mathematical candidate rankings and winner recommendation deterministically using `evidence_scorer.py`, `knowledge_lifecycle.py`, and assumption risk penalties before invoking any LLM call.
- **`FR-002`**: The composite ranking formula must combine Rubric Score ($0.40$), Epistemic Score ($0.35$), Impact Score ($0.25$), and subtract Assumption Risk Penalties, clamped to $[0.0, 100.0]$.
- **`FR-003`**: Candidate ties must be broken using the strict 4-tier hierarchy: Epistemic Score $\to$ Rubric Score $\to$ Impact Score $\to$ Lexicographical Candidate ID.
- **`FR-004`**: The LLM prompt must be restricted strictly to generating a narrative executive summary and qualitative pros/risks. The LLM must not alter deterministic candidate rankings or change the winner ID.
- **`FR-005`**: When the LLM Gateway fails or enters degraded mode, `synthesize_decision_room` must return the complete deterministic ranking with a deterministically generated narrative summary, preserving SDD-003 `is_degraded` metadata.
- **`FR-006`**: `backend/routers/sessions.py:317-338` must be reconciled to resolve arity and async/sync mismatches with `decision_engine.py` (`DEF-AI-008`).
- **`FR-007`**: `backend/agents/verifier_agent.py` must prohibit the LLM from outputting `VERIFIED_EMPIRICAL`; valid LLM verdicts must be restricted to advisory evaluations (`DEF-AI-009`).
- **`FR-008`**: `backend/engines/assumption_engine.py` prompt template must initialize newly extracted friction reality claims with `status = "HYPOTHESIS"` (`DEF-AI-010`).

### 12.2 Non-Functional Requirements

- **`NFR-001` (Latency)**: Deterministic ranking calculation for 4 candidates must complete in $< 10\text{ms}$ (excluding LLM narrative generation). This is the **normative acceptance threshold**. An aspirational performance target of $< 5\text{ms}$ is recorded for benchmarking purposes but is NOT a mandatory requirement.
- **`NFR-002` (Reproducibility)**: Identical candidate sets, evidence links, and assumptions must produce bit-identical rankings and scores across 100% of runs.
- **`NFR-003` (Zero Memory Leaks)**: Pure stateless mathematical evaluation without persistent cache bloat.
- **`NFR-004` (Offline Sovereignty)**: Full ranking and decision synthesis must function 100% offline without cloud internet connectivity.
- **`NFR-005` (Backward Compatibility)**: Existing frontend consumers of `/api/decisions/synthesize` must continue functioning without code alterations.

### 12.3 Governance & Safety Requirements

- **`GR-001` (Tri-Part Confidence Decoupling)**: $C_{\text{AI}} \ne S_{\text{EVID}} \ne C_{\text{DEC}}$. Model output must never be treated as empirical ground truth.
- **`GR-002` (Human Decision Authority)**: AI synthesis is strictly advisory; committing a decision record requires explicit human action (`commit_decision`).
- **`GR-003` (Zero Database Migrations)**: SQLite WAL schema must remain 100% unchanged.
- **`GR-004` (Zero New Dependencies)**: No new libraries or external services added to `requirements.txt`.

---

## 13. Acceptance Criteria

1. **`AC-01` (Deterministic Ordering)**: Given 3 candidates with varying evidence scores, `synthesize_decision_room` produces identical ordinal rankings across 10 consecutive executions.
2. **`AC-02` (Winner Invariant)**: Injected malicious or hallucinated LLM responses cannot change `recommended_winner_id` from the deterministically highest-scoring candidate.
3. **`AC-03` (Zero Network Offline Functionality)**: When all network interfaces are simulated down, `synthesize_decision_room` returns a valid synthesis with deterministic ranks and template summary.
4. **`AC-04` (Epistemic Cleanliness)**: Newly generated assumption claims in `assumption_engine.py` have `status == "HYPOTHESIS"`.
5. **`AC-05` (Verifier Rigor)**: `verifier_agent.py` never outputs `VERIFIED_EMPIRICAL` from an LLM prompt response. The `ClaimVerificationReport` model documentation reflects the post-SDD-004 advisory verdict taxonomy.
6. **`AC-06` (Session Router Stability)**: Calling `POST /api/decision-room/synthesize` and `POST /api/decision-room/pivot` succeeds without `TypeError`. Pivot endpoint does not conflate `next_candidate_id` with `invalidated_assumption_id`.
7. **`AC-07` (Full Regression Pass)**: All existing 114 backend tests pass with zero regressions.
8. **`AC-08` (Empty Candidate Set)**: When `candidate_ids = []`, `synthesize_decision_room` returns a deterministic, well-defined response with zero candidates ranked. It must NOT attempt arbitrary indexing such as `candidates[0]`.
9. **`AC-09` (Single Candidate)**: When exactly one candidate exists, it receives `rank = 1` and `verdict = "RECOMMENDED"` with no artificial comparison against nonexistent candidates.
10. **`AC-10` (Verdict Taxonomy Integrity)**: The LLM-facing verdict taxonomy in `verifier_agent.py` does not grant autonomous empirical verification authority. A test confirms that `VERIFIED_EMPIRICAL` cannot appear in LLM prompt output options.
