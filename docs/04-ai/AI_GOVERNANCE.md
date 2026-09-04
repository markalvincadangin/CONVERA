# AI GOVERNANCE & EPISTEMIC SAFETY SPECIFICATION

**Document ID**: `CONVERA-AI-003`  
**Classification**: AI Governance, Epistemic Safety & Authority Policy  
**Authority Tier**: Tier 1 Normative  
**Status**: 🟢 RATIFIED  
**Canonical Path**: `docs/04-ai/AI_GOVERNANCE.md`  
**Upstream Dependencies**: `CONSTITUTION.md` (Articles I, II, IV, VI, VII), `SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `KNOWLEDGE_MODEL.md`, `EVIDENCE_MODEL.md`, `DECISION_MODEL.md`, `TRACEABILITY_MODEL.md`, `ENGINEERING_PRINCIPLES.md`, `SECURITY.md`, `CIIA.md`, `AI_ARCHITECTURE.md`  
**Downstream Dependents**: `docs/04-ai/CONNECTOR_ARCHITECTURE.md`, `docs/04-ai/MCP.md`, `docs/08-operations/*`, Spec Kit Governance Checklists  

---

## 1. Executive Summary & Governance Scope

While `CIIA.md` defines *what* the cognitive infrastructure is and `AI_ARCHITECTURE.md` defines *how* execution works, this document establishes **what AI is permitted, prohibited, and required to do epistemically and organizationally**.

CONVERA is built on the foundational premise that generative AI models are powerful inference engines, but fundamentally uncalibrated epistemic actors prone to hallucination, sycophancy, and ungrounded confidence. Therefore, the governance framework enforces strict boundaries:

$$\begin{aligned}
\mathbf{\text{Governance Axiom:}} \quad &\text{AI systems operate strictly in an investigative, advisory, and synthesizing capacity;} \\
&\text{human actors retain final authority over consequential decisions, ratification, governed state transitions, and ratified doctrine.}
\end{aligned}$$

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    THE CONVERA AI GOVERNANCE PILLARS                    │
├─────────────────────────────────────────────────────────────────────────┤
│  1. EPISTEMIC AUTHORITY BOUNDARIES                                      │
│     Clear partition between advisory inference and sovereign truth.     │
│                                                                         │
│  2. SOCRATIC ANTI-SYCOPHANCY MANDATE                                    │
│     Mandatory critique, gap surfacing, and counter-hypothesis probing.  │
│                                                                         │
│  3. ANTI-HALLUCINATION & PROVENANCE INTEGRITY                           │
│     Zero tolerance for fabricated citations or synthetic source claims. │
│                                                                         │
│  4. TRI-PART CONFIDENCE CALIBRATION                                     │
│     Rigid enforcement of C_AI ≠ S_EVID ≠ C_DEC across all workflows.    │
│                                                                         │
│  5. HUMAN RATIFICATION GATES                                            │
│     Consequential state changes require explicit human authorization.   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Statement Classification Framework

Following the governance standards established across Phases 1–3, all specifications in this document adhere to four explicit classification markers:

| Class | Definition | Normative Authority |
| :--- | :--- | :--- |
| **`[NORMATIVE]`** | Inviolable governance rule that all AI interactions **MUST** enforce. | Mandatory baseline constraint. |
| **`[IMPLEMENTED]`** | Governance rule verified against the active codebase in `backend/`. | Active code in `backend/`. |
| **`[TARGET]`** | Planned governance mechanism scheduled for progressive development. | Governed implementation target. |
| **`[VERIFICATION]`** | The explicit test suite or inspection establishing compliance. | Verification contract (`TESTING_STRATEGY.md`). |

---

## 3. Epistemic Permissibility Matrix

To prevent AI systems from overstepping their architectural mandate, CONVERA establishes an explicit boundary between permitted, governed, and strictly prohibited AI actions:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              AI PERMISSIBILITY MATRIX                                  │
├────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│ Permitted Actions (🟢)     │ Governed Actions (🟡)       │ Prohibited Actions (🔴)     │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ • Analyze literature text  │ • Propose new ProblemClaims │ • Unilaterally activate or  │
│ • Extract structured claims│ • Propose DecisionRecord    │   ratify a DecisionRecord   │
│ • Surface contradictions   │ • Propose blast-radius cuts │ • Mutate persistence direct │
│ • Socratic counter-probing │ • Propose claim state pivot │ • Fabricate DOIs/citations  │
│ • Calculate model C_AI     │ • Trigger MCP tool calls    │ • Alter constitutional text │
│ • Synthesize multi-papers  │ • Signal degraded status    │ • Alter requirements trace  │
└────────────────────────────┴─────────────────────────────┴─────────────────────────────┘
```

### 3.1 Permitted Actions (Autonomous Advisory)
* **`[NORMATIVE]` Cognitive Processing**: The AI subsystem is authorized, within its configured scope and applicable security and governance boundaries, to ingest literature, parse user inputs, generate structural summaries, extract candidate claims, identify potential epistemic gaps, and compute model confidence ($C_{\text{AI}}$).

### 3.2 Governed Actions (Candidate Proposal Only)
* **`[NORMATIVE]` State Proposals**: The AI subsystem MAY propose transitions (e.g., suggesting a claim be marked `CONTRADICTED` or a decision marked `STALE_REVIEW_REQUIRED`). Such proposals remain unratified candidate proposals until evaluated by domain services and confirmed by the human user.

### 3.3 Prohibited Actions (Absolute Hard Stops)
* **`[NORMATIVE]` Prohibition 1: Unilateral Ratification**: The AI subsystem MUST NOT unilaterally activate or ratify a `DecisionRecord`, establish or alter a human-ratified requirements baseline, or modify constitutional doctrine.
* **`[NORMATIVE]` Prohibition 2: Direct Persistence Mutation**: The AI subsystem MUST NOT execute direct write operations against the persistence layer (`BaseStorageAdapter` / `SQLiteAdapter`).
* **`[NORMATIVE]` Prohibition 3: Citation Fabrication**: The AI subsystem MUST NOT generate, hallucinate, or extrapolate synthetic source identifiers (`DOI`, `PMID`, URL, registry ID) and present them as empirical evidence.
* **`[NORMATIVE]` Prohibition 4: Doctrine Override**: The AI subsystem MUST NOT modify, bypass, or reinterpret governing principles defined in `CONSTITUTION.md` or `PRINCIPLES.md`.

---

## 4. Socratic Anti-Sycophancy Mandate

A primary vulnerability of generative AI copilots is sycophancy—the tendency to validate user assumptions, agree with flawed hypotheses, and downplay scientific or market risks. CONVERA mandates active Socratic friction:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    SOCRATIC INTERACTION DIRECTIVES                      │
├─────────────────────────────────────────────────────────────────────────┤
│  1. ACTIVE FALSIFICATION PROBING                                        │
│     Prompt pipelines must explicitly search for negative evidence,      │
│     competing approaches, and falsification vectors for any hypothesis. │
├─────────────────────────────────────────────────────────────────────────┤
│  2. CONTRADICTION HIGHLIGHTING                                          │
│     When literature signals conflict, the AI must surface the dispute   │
│     prominently rather than smoothing over discrepancies.               │
├─────────────────────────────────────────────────────────────────────────┤
│  3. ASSUMPTION DECONSTRUCTION                                           │
│     The AI must identify implicit, unstated, or ungrounded assumptions  │
│     underlying the user's venture or research claims.                   │
├─────────────────────────────────────────────────────────────────────────┤
│  4. BIAS MITIGATION                                                     │
│     The AI must challenge confirmation bias by presenting the strongest │
│     possible counter-arguments against the current working hypothesis.  │
└─────────────────────────────────────────────────────────────────────────┘
```

* **`[NORMATIVE]` Non-Agreement Invariant**: Prompt templates for hypothesis evaluation and research analysis MUST NOT include leading or sycophantic instructions. System prompts MUST instruct models to evaluate claims critically, impartially, and with explicit attention to boundary conditions and failure modes.

---

## 5. Anti-Hallucination & Provenance Integrity Rules

To protect the epistemic integrity of CONVERA's knowledge base (Threat $T_3$ in `SECURITY.md`), all AI extractions adhere to strict anti-hallucination protocols:

```text
               [External Literature Search Output]
                               │
                               ▼
               [Extract Paper Title & Abstract]
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
      [Verifiable Source ID]              [No Verifiable ID]
            │                                     │
            ▼                                     ▼
 [Set source_identifier]             [Set source_identifier = None]
 [Assign Empirical Tier]             [Flag: SourceTaxonomy.SYNTHETIC]
            │                                     │
            ▼                                     ▼
 [Passed to Evidence Pipeline]       [Non-Evidentiary Candidate]
 [Verification Required]             [Cannot Support Active Decisions]
```

### Provenance Governance Rules
1. **`[NORMATIVE]` Source Identifier Grounding**: If an AI model cannot identify a verifiable `DOI`, `PMID`, canonical URL, or registry ID in the provided source text, it MUST set `source_identifier = None`. It is strictly forbidden to construct speculative identifiers.
2. **`[NORMATIVE]` Synthetic Fallback Labeling**: Any claim or synthesis generated in degraded mode or without empirical literature grounding MUST comply with `EVIDENCE_MODEL.md` synthetic-source rules and be treated by downstream domain services as non-evidentiary (`is_evidentiary = False`).
3. **`[NORMATIVE]` Provenance Verification**: Before an extracted citation is accepted as empirical evidence, its provenance MUST be verified through an appropriate authoritative source or configured scholarly connector (`OpenAlex`, `Crossref`, `PubMed`, `Europe PMC`, `Semantic Scholar`), according to `EVIDENCE_MODEL.md`.

---

## 6. Tri-Part Confidence Calibration & Anomaly Triggers

The platform enforces strict separation between AI confidence ($C_{\text{AI}}$), evidentiary support ($S_{\text{EVID}}$), and human decision conviction ($C_{\text{DEC}}$) across all user interfaces, schemas, and reports:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    TRI-PART CONFIDENCE SEPARATION                       │
├─────────────────────────────────────────────────────────────────────────┤
│   C_AI (Model Confidence)      │ A model/provider-reported or gateway-  │
│                                │ derived confidence signal representing │
│                                │ the AI system's expressed certainty.   │
├────────────────────────────────┼────────────────────────────────────────┤
│   S_EVID (Evidentiary Support) │ The evidence-derived support measure   │
│                                │ computed according to the governed     │
│                                │ Evidence and Knowledge Models.         │
├────────────────────────────────┼────────────────────────────────────────┤
│   C_DEC (Decision Conviction)  │ Sovereign conviction assigned solely   │
│                                │ by the human decision-maker.           │
└────────────────────────────────┴────────────────────────────────────────┘
```

### 6.1 Calibration Anomaly Triggers
The platform evaluates calibration relationships during applicable cognitive operations and raises governed warnings when configured anomaly conditions are met:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CALIBRATION ANOMALY MATRIX                                │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ Condition                │ Anomaly Classification      │ Governed Action               │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ C_AI ≥ 0.80              │ OVERCONFIDENCE_WARNING      │ Flag model overconfidence;    │
│ AND S_EVID ≤ 0.40        │ (Hallucination / Sycophancy)│ require empirical validation  │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ C_AI ≤ 0.30              │ UNDERCONFIDENCE_ANOMALY     │ Flag model hesitation; prompt │
│ AND S_EVID ≥ 0.70        │ (Configured Policy Anomaly) │ user to inspect strong evidence│
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ Net Balance < 0.0        │ EPISTEMIC_CONTRADICTION     │ Block decision promotion;     │
│ AND Active Claims Exist  │ (Contradiction Precedence)  │ require hypothesis resolution │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

* **`[NORMATIVE]` Overconfidence Warning Trigger**: When the condition ($C_{\text{AI}} \ge 0.80 \land S_{\text{EVID}} \le 0.40$) is detected during analytical evaluation, UI and API responses MUST prominently display an `OVERCONFIDENCE_WARNING`, alerting the user that the AI's assertiveness is not supported by verified empirical literature.
* **`[NORMATIVE]` Configured Calibration Anomalies**: The platform MAY define governed anomaly thresholds for detecting divergence between model confidence and evidence strength. Thresholds MUST be explicitly configured and documented; they MUST NOT be interpreted as universal statistical calibration guarantees.

---

## 7. Human Oversight & Decision Sovereignty

The governance framework establishes human oversight as the ultimate arbiter of system state and organizational truth:

```text
               ┌─────────────────────────────────────────┐
               │          AI Subsystem (Area 5)          │
               │  • Proposes candidate claim extraction  │
               │  • Evaluates Socratic critique & delta  │
               │  • Generates candidate decision pivot   │
               └────────────────────┬────────────────────┘
                                    │ Candidate Proposal
                                    ▼
               ┌─────────────────────────────────────────┐
               │    Domain / Decision / Traceability     │
               │  • Calculates affected blast radius     │
               │  • Enforces domain invariant checks     │
               └────────────────────┬────────────────────┘
                                    │ Governed Context
                                    ▼
               ┌─────────────────────────────────────────┐
               │          Governed Gate Review           │
               │  • Formats evidence, delta, & risks     │
               │  • Prepares ratification checklist      │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
               ┌─────────────────────────────────────────┐
               │           Human Ratification            │
               │  • Sovereign review by decision-maker   │
               │  • Explicit approval, edit, or reject   │
               └────────────────────┬────────────────────┘
                                    │ Explicit Ratification
                                    ▼
               ┌─────────────────────────────────────────┐
               │  Authorized Canonical State Transition  │
               │  (Decision ACTIVE / Baseline RATIFIED)  │
               └─────────────────────────────────────────┘
```

### Human Sovereignty Invariants
1. **`[NORMATIVE]` Consequential Mutation Gate**: Any modification that alters a ratified requirements baseline, activates or pivots a `DecisionRecord`, deprecates architectural doctrine, or releases code MUST pass through human gate review and explicit ratification.
2. **`[NORMATIVE]` Human Override Authority**: The human user possesses absolute authority to override any AI recommendation, reject candidate claim extractions, adjust decision conviction ($C_{\text{DEC}}$), or discard AI-generated proposals.
3. **`[NORMATIVE]` Credential Compromise Response**: If an `AuthenticationError` or credential leakage event occurs, the AI system MUST immediately suspend external calls for the affected provider, alert the user, and require manual re-authentication or key rotation before resuming operations.

---

## 8. Verification & Compliance Checklist

Before any release or modification affecting AI governance is accepted, it must satisfy the following verification criteria:

| Check ID | Architectural Requirement | Verification Method | Acceptance Standard |
| :--- | :--- | :--- | :--- |
| **AIGOV-01** | AI authority boundary enforcement. | Unauthorized mutation integration test. | AI agent is prevented from executing direct database writes or ratifications. |
| **AIGOV-02** | Socratic anti-sycophancy prompts. | Prompt template audit. | 100% of applicable analytical/hypothesis-evaluation prompts include counter-probing / falsification directives. |
| **AIGOV-03** | Source identifier grounding. | Citation extraction test with ungrounded inputs. | Missing identifiers output `source_identifier = None`; zero fabricated DOIs. |
| **AIGOV-04** | Overconfidence warning trigger. | Epistemic calibration unit test. | `OVERCONFIDENCE_WARNING` triggered when $C_{\text{AI}} \ge 0.80 \land S_{\text{EVID}} \le 0.40$. |
| **AIGOV-05** | Human ratification gate. | State machine workflow tests. | Decisions and requirements baselines cannot reach `ACTIVE`/`RATIFIED` without user confirmation. |
| **AIGOV-06** | Epistemic decoupling in UI/API. | Schema & API payload inspection. | $C_{\text{AI}}$, $S_{\text{EVID}}$, and $C_{\text{DEC}}$ are distinct, non-overlapping fields. |
| **AIGOV-07** | Unit and integration test pass rate. | Execution of `tests/governance/`. | 100% applicable tests pass. |

---

## 9. Ratification & Version History

| Version | Date | Author / Governance | Key Changes & Rationale | Status |
| :--- | :--- | :--- | :--- | :--- |
| `1.0.0` | `2026-09-04` | Antigravity AI Engine & Architectural Governance | Initial formal specification establishing AI permissibility matrix, Socratic anti-sycophancy directives, anti-hallucination provenance rules, overconfidence calibration triggers, and human ratification gates. | 🟢 RATIFIED |
