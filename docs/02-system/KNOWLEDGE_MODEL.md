# CONVERA — Knowledge Model Specification

**Document ID**: `CONVERA-SYS-003`  
**Classification**: Epistemic Maturity & Claim State Machine  
**Authority Tier**: Tier 2 System Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/02-system/KNOWLEDGE_MODEL.md`  
**Upstream Dependencies**: `00-foundation/CONSTITUTION.md (Article I), 02-system/DOMAIN_MODEL.md`  
**Downstream Dependents**: `02-system/EVIDENCE_MODEL.md, 04-ai/CIIA.md`  

---

> **Epistemic Mechanics, Mathematical Net Balance & State Transitions.**  
> This document authoritatively specifies how knowledge behaves epistemically within CONVERA. It formalizes epistemic states, mathematical evidence weighting, Net Epistemic Balance formulas, confidence decoupling, contradiction dynamics, and the Epistemic Triangulation framework, operating strictly upon the entities established in `DOMAIN_MODEL.md`.

---

## 1. Epistemic Model Scope & Governing Axioms

The Knowledge Model defines how claims progress toward justified direction through empirical evaluation. It is governed by four epistemic axioms:
1. **Empirical Grounding:** A claim possesses zero intrinsic factual weight until associated with provenance-bearing evidence items.
2. **Mathematical Balance:** Epistemic status is computed from the balance of supporting versus refuting evidence, not subjective opinion or simple citation volume.
3. **Continuous Revisability:** No validated state is permanent; the arrival of refuting empirical evidence recalculates claim status while preserving past evaluation history.
4. **Decoupled Confidence:** Linguistic expression from AI models is mathematically isolated from empirical evidence strength and human decision conviction.

---

## 2. Epistemic Lifecycle & State Transition Mechanics

The epistemic lifecycle of a `ProblemClaim` moves across six canonical states:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EPISTEMIC STATE MATRIX                                │
├────────────┬─────────────────────────────┬──────────────────────────────────────┤
│ State      │ Semantic Meaning            │ Recalculation Condition              │
├────────────┼─────────────────────────────┼──────────────────────────────────────┤
│ UNKNOWN    │ Unexamined proposition      │ Initial state upon formulation       │
│ HYPOTHESIS │ Working proposition         │ Identified for active investigation  │
│ SUPPORTED  │ Positive empirical support  │ Net Balance > 0 and no material unresolved contradiction │
│ VALIDATED  │ High empirical justification│ Net Balance ≥ Threshold, Tier A ev.  │
│ CONTESTED  │ Opposed by refuting evidence│ Active contradiction pair attached   │
│ FALSIFIED  │ Formally disproven          │ Authoritative refutation / tests fail│
└────────────┴─────────────────────────────┴──────────────────────────────────────┘
```

### Complete State Transition Table

| Current State | Target State | Triggering Condition | Mathematical / Epistemic Criteria |
| :--- | :--- | :--- | :--- |
| **`UNKNOWN`** | `HYPOTHESIS` | Proposition prioritized | Stated as working hypothesis; 0 evidence links. |
| **`HYPOTHESIS`** | `SUPPORTED` | Positive evidence linked | $\text{Net Balance} > 0$; 0 unresolved refuting links. |
| **`HYPOTHESIS`** | `CONTESTED` | Opposing evidence linked | Refuting evidence added (`CONTRADICTS` or `FALSIFIES`). |
| **`HYPOTHESIS`** | `FALSIFIED` | Definitive falsification linked | $\text{FALSIFIES}$ link from high-tier source or failed validation test. |
| **`SUPPORTED`** | `VALIDATED` | Rigorous empirical grounding | $\text{Net Balance} \ge \theta_{\text{valid}}$ ($\theta_{\text{valid}} = 6.0$ operational calibration); $\ge 1$ Tier A source; 0 active contradictions. |
| **`SUPPORTED`** | `CONTESTED` | Refuting evidence introduced | Refuting evidence added; contradiction pair registered. |
| **`VALIDATED`** | `CONTESTED` | Refuting study published | Refuting evidence introduced; claim downgraded to `CONTESTED`. |
| **`CONTESTED`** | `SUPPORTED` | Contradiction resolved empirically| New higher-tier evidence resolves conflict ($\text{Balance} > 0$, tension reconciled). |
| **`CONTESTED`** | `FALSIFIED` | Falsification confirmed | Refuting evidence confirmed authoritative; balance falls below negative threshold. |
| **`FALSIFIED`** | *(Historical)* | Reformulation required | Proposition remains permanently `FALSIFIED` in audit logs; a narrower proposition is versioned as a **new** `HYPOTHESIS`. |

### Contradiction Precedence Rule
> **Contradiction Precedence:**  
> The presence of material unresolved refuting evidence takes precedence over positive Net Balance when determining whether a claim is `CONTESTED`. A positive numerical balance (e.g., $+7.0$) does not automatically resolve an active contradiction or permit advancement to `VALIDATED`.

### Operational Validation Boundary
> **Operational Validation Boundary:**  
> Within CONVERA, `VALIDATED` denotes that a claim has satisfied the system's configured evidentiary criteria. It does not assert universal scientific truth, causal certainty, or external institutional validation.

---

## 3. Mathematical Net Epistemic Balance Engine

The core quantitative signal for evaluating claim support is the **Net Epistemic Balance**, implemented in `backend/engines/knowledge_lifecycle.py`:

$$\text{Net Balance}(C) = \sum_{e \in S(C)} \Big( W(e) \cdot M(e) \cdot F(e) \Big) - \sum_{e \in R(C)} \Big( W(e) \cdot M(e) \cdot F(e) \Big)$$

> **Epistemic Role of Net Balance:**  
> The Net Epistemic Balance is CONVERA's operational quantitative signal for evaluating the current evidentiary support of a claim. It does not constitute a proof of truth and must be interpreted alongside evidence provenance, methodological characterization, source independence, contradiction status, and human verification where required.

Where:
* $S(C) = \{ e \in \text{Evidence}(C) \mid \text{relationship} = \text{SUPPORTS} \}$ (Supporting evidence set).
* $R(C) = \{ e \in \text{Evidence}(C) \mid \text{relationship} \in \{\text{CONTRADICTS}, \text{FALSIFIES}\} \}$ (Refuting evidence set).
* **Neutral Evidence:** Evidence items linked with `CONTEXTUALIZES` provide background context or boundary framing and contribute **zero ($0.0$)** to the mathematical Net Balance.
* $W(e)$ = **Evidence Tier Weight** (Source Quality).
* $M(e)$ = **Evidence Characterization Multiplier** (Methodological Strength).
* $F(e)$ = **Freshness Decay Factor** (Temporal Relevance).

---

### A. Evidence Tier Weights $W(e)$ (Source Quality Dimension)

> **Epistemic Note:** Tier classification reflects the methodological rigor and review standards of the source container; it does **not** guarantee intrinsic factual truth.

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Tier            │ Weight │ Source Criteria                                      │
├─────────────────┼────────┼──────────────────────────────────────────────────────┤
│ Tier A (High)   │  3.0   │ Peer-reviewed journal paper, systematic review,      │
│                 │        │ official institutional dataset, clinical trial.      │
│ Tier B (Medium) │  2.0   │ Conference proceeding, academic preprint, technical  │
│                 │        │ whitepaper, structured field interview transcript.   │
│ Tier C (Low)    │  1.0   │ Industry news article, secondary web signal, blog.   │
└─────────────────┴────────┴──────────────────────────────────────────────────────┘
```

---

### B. Evidence Characterization Multipliers $M(e)$ (Methodological Strength)

The multiplier characterizes how directly an evidence item measures the specific proposition:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Characterization  │ Multiplier │ Semantic Meaning                               │
├───────────────────┼────────────┼────────────────────────────────────────────────┤
│ DIRECT_EMPIRICAL  │    1.00    │ Direct primary measurement or experiment.      │
│ CORROBORATIVE     │    0.75    │ Indirect, secondary, or contextual study.      │
│ ANECDOTAL         │    0.50    │ Single unverified observation or field note.   │
│ DIRECT_FALSIFY    │    1.50    │ Explicit, verified empirical disproof of claim.│
└───────────────────┴────────────┴────────────────────────────────────────────────┘
```

---

### C. Freshness Decay Factor $F(e)$ (Operational Heuristic)

To account for domain velocity, evidence weight decays exponentially over elapsed time:

$$F(e) = e^{-\lambda \cdot \Delta t} \quad \text{where} \quad \lambda = \frac{\ln(2)}{t_{1/2}}$$

* $\Delta t$ = Elapsed time in years between source publication/extraction and evaluation.
* **Domain Half-Lives ($t_{1/2}$):** These are **CONVERA operational calibration parameters**, not claims about the intrinsic half-life of human knowledge:
  - **AI & Fast-Moving Computing:** $t_{1/2} = 2.5 \text{ years}$ ($\lambda \approx 0.277$)
  - **Market & Economic Telemetry:** $t_{1/2} = 2.0 \text{ years}$ ($\lambda \approx 0.347$)
  - **Biomedical & Agronomy Systems:** $t_{1/2} = 5.0 \text{ years}$ ($\lambda \approx 0.139$)
  - **Historical Canon / Mathematical Theorems:** $t_{1/2} = \infty$ ($F(e) = 1.0$, flagged as `HISTORICAL_CANON`)

---

### D. Operational Validation Threshold $\theta_{\text{valid}}$

The Net Balance threshold required for the `VALIDATED` state ($\theta_{\text{valid}} = 6.0$ with $\ge 1$ Tier A source) represents an **operational baseline calibration**. It requires approximately two fresh, high-quality supporting studies ($3.0 \times 1.0 + 3.0 \times 1.0 = 6.0$) in the absence of refuting evidence. This parameter is subject to empirical tuning during project pilot trials.

---

### E. Evidence Independence Rule

> **Evidence Independence Rule:**  
> Net Balance aggregation assumes evidence items are sufficiently independent for scoring purposes. Where multiple evidence items share a common dataset, population, experiment, source document, or citation lineage, their contributions must be flagged as correlated and must not be interpreted as equivalent to independent replications. Independence assessment is a governed verification attribute and may require researcher adjudication.

---

## 4. Tri-Part Confidence Calibration & Decoupling

CONVERA strictly decouples three independent confidence metrics:

```text
  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
  │  AI MODEL CONFIDENCE   │  │   EVIDENCE STRENGTH    │  │  DECISION CONFIDENCE   │
  │     C_AI ∈ [0.0, 1.0]  │  │   S_EVID ∈ [0.0, 1.0]  │  │    C_DEC ∈ [0.0, 1.0]  │
  ├────────────────────────┤  ├────────────────────────┤  ├────────────────────────┤
  │ Model-generated output │  │ Normalized Net Balance │  │ Human-ratified         │
  │ fluency/certainty      │  │ of empirical citations │  │ conviction in choice   │
  └────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

### 1. AI Model Confidence ($C_{\text{AI}}$)
A model-generated or system-derived confidence signal about output consistency. It is **not** a calibrated objective probability that the underlying proposition is true.

### 2. Evidence Strength Normalization ($S_{\text{EVID}}$)
Normalized bounded mapping of Net Epistemic Balance into $[0.0, 1.0]$:
$$S_{\text{EVID}} = \text{clamp}\left( \frac{\text{Net Balance}(C)}{\theta_{\text{max}}}, 0.0, 1.0 \right) \quad \text{where } \theta_{\text{max}} = 10.0$$
If $\text{Net Balance} \le 0$, $S_{\text{EVID}} = 0.0$.

### 3. The Overconfidence Risk Guardrail
$$\text{If } \Big( C_{\text{AI}} \ge 0.80 \quad \text{AND} \quad S_{\text{EVID}} \le 0.40 \Big) \implies \text{Raise } \mathbf{OVERCONFIDENCE\_WARNING}$$

---

## 5. Contradiction Dynamics & Claim Reformulation

When refuting evidence is attached to a claim:
1. A `ClaimContradiction` entity is established.
2. The claim state immediately transitions to **`CONTESTED`** (enforcing Contradiction Precedence).
3. Downstream decisions depending on the claim are flagged with **`STALE_REVIEW_REQUIRED`**.

### Governed Resolution Pathways:
* **Pathway A (Empirical Corroboration):** Introducing higher-tier evidence resolving the tension ($\text{State} \to \text{SUPPORTED}$).
* **Pathway B (Scope Reformulation):** The original claim is closed as `CONTESTED`/`FALSIFIED` under its original scope. A reformulated proposition with narrower boundary conditions is created as a **new versioned claim** in `HYPOTHESIS` state, preserving the original contradiction in the audit log.
* **Pathway C (Falsification):** Acknowledging definitive disproof ($\text{State} \to \text{FALSIFIED}$), triggering a structured pivot.
* **Pathway D (Explicit Testing):** Formulating an `AssumptionValidationTest` to empirically test the conflict.

---

## 6. The Epistemic Triangulation Framework

The Epistemic Triangulation framework organizes a project's problem space into three dynamic, reclassifiable categories:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    EPISTEMIC TRIANGULATION FRAMEWORK                            │
├───────────────────────┬─────────────────────────┬───────────────────────────────┤
│ WHAT WE KNOW          │ WHAT WE THINK           │ WHAT WE DON'T KNOW            │
│ (Verified Constants)  │ (Working Hypotheses)    │ (Critical Unmeasured Risks)   │
├───────────────────────┼─────────────────────────┼───────────────────────────────┤
│ • Validated Claims    │ • Active Hypotheses     │ • Critical Assumptions        │
│ • Replicated Baselines│ • Unverified Models     │ • Unknown Failure Modes       │
│ • High-Tier Facts     │ • Market Hypotheses     │ • Missing Datasets            │
└───────────────────────┴─────────────────────────┴───────────────────────────────┘
```

### Dynamic Bidirectional Reclassification
Triangulation is a **continuous, bidirectional reclassification model**, not a one-way ladder:
* As empirical evidence is verified: $\text{What We Don't Know} \longrightarrow \text{What We Think} \longrightarrow \text{What We Know}$.
* When contradictory evidence or new failure modes emerge: $\text{What We Know} \longrightarrow \text{What We Think} \longrightarrow \text{What We Don't Know}$.
