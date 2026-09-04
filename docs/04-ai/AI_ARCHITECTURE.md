# AI ARCHITECTURE & LLM GATEWAY SPECIFICATION

**Document ID**: `CONVERA-AI-002`  
**Classification**: AI Subsystem Architecture & Gateway Specification  
**Authority Tier**: Tier 2 Descriptive / Tier 3 Procedural  
**Status**: 🟢 RATIFIED  
**Canonical Path**: `docs/04-ai/AI_ARCHITECTURE.md`  
**Upstream Dependencies**: `CONSTITUTION.md` (Articles I, II, VI, VII), `SYSTEM_ARCHITECTURE.md` (Area 5), `DOMAIN_MODEL.md`, `KNOWLEDGE_MODEL.md`, `EVIDENCE_MODEL.md`, `DECISION_MODEL.md`, `ENGINEERING_PRINCIPLES.md`, `SECURITY.md`, `CIIA.md`  
**Downstream Dependents**: `docs/04-ai/AI_GOVERNANCE.md`, `docs/04-ai/CONNECTOR_ARCHITECTURE.md`, `docs/04-ai/MCP.md`, `backend/llm_gateway.py`  

---

## 1. Executive Summary & Architectural Scope

This document operationalizes the cognitive execution layer of Area 5 (CIIA). It defines the provider abstraction layer, cascade execution engine, provider-neutral error taxonomy, configurable context budgeting, and structured schema validation mechanics of the **CONVERA LLM Gateway**.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     AI ARCHITECTURAL CORE PRINCIPLES                    │
├─────────────────────────────────────────────────────────────────────────┤
│  1. VENDOR-AGNOSTIC PROVIDER ABSTRACTION                                │
│     Unified interface isolating the domain engine from model APIs.      │
│                                                                         │
│  2. DETERMINISTIC CASCADE POLICY & FAULT RESILIENCE                     │
│     Predictable failover across primary, secondary, tertiary, & fallback│
│                                                                         │
│  3. STRICT TYPE-SAFE STRUCTURED OUTPUT ENFORCEMENT                      │
│     Raw provider outputs validated against typed Pydantic domain schemas│
│                                                                         │
│  4. CONFIGURABLE TOKEN & CONTEXT BUDGETING                              │
│     Provider-aware context allocation, prompt isolation, & budget bounds│
│                                                                         │
│  5. TRUTHFUL DEGRADED-STATE SIGNALING                                   │
│     Deterministic local fallback signaling is_degraded = True.          │
└─────────────────────────────────────────────────────────────────────────┘
```

The gateway operationalizes a strict boundary invariant:

```text
AI Gateway
  ├── Produces model inferences
  ├── Normalizes provider responses
  ├── Validates structured domain schemas
  └── Signals degraded operational state
           │
           X  (Non-Authority Boundary)
           │
           ├── Does NOT establish evidence truth (owned by Evidence Model)
           ├── Does NOT mutate decision validity (owned by Decision Model)
           └── Does NOT establish human ratification (owned by Governance)
```

---

## 2. Statement Classification Framework

Following the governance standards established across Phases 1–3, all specifications in this document adhere to four explicit classification markers:

| Class | Definition | Normative Authority |
| :--- | :--- | :--- |
| **`[NORMATIVE]`** | Inviolable architectural law that gateway implementations **MUST** satisfy. | Mandatory baseline constraint. |
| **`[IMPLEMENTED]`** | Architecture verified against the active codebase in `backend/`. | Active code in `backend/`. |
| **`[TARGET]`** | Planned architectural capabilities scheduled for progressive development. | Governed implementation target. |
| **`[VERIFICATION]`** | The explicit test suite or inspection establishing architectural compliance. | Verification contract (`TESTING_STRATEGY.md`). |

---

## 3. Provider Abstraction Architecture

The gateway enforces an Inversion-of-Control (IoC) architecture where high-level domain services depend exclusively on a provider-neutral abstraction, isolating Domain Engine services (Area 3) from third-party vendor SDKs:

```text
                           ┌───────────────────────────┐
                           │    Provider Abstraction   │
                           │  (Provider-Neutral Contract│
                           └─────────────┬─────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
   ┌─────────────▼─────────────┐   ┌─────▼───────────────┐   ┌───▼───────────────────────┐
   │      Gemini Provider      │   │     Groq Provider   │   │      Ollama Provider      │
   │  (Primary Cloud Tier)     │   │ (Secondary Fallback)│   │ (Sovereign Local Tier)    │
   └───────────────────────────┘   └─────────────────────┘   └───────────────────────────┘
```

### 3.1 Provider Contract Requirements
* **`[NORMATIVE]` Abstract Provider Interface**: Every model adapter must implement a common asynchronous generation interface accepting prompts, system directives, optional schema targets, and provider execution parameters.
* **`[NORMATIVE]` Availability & Readiness Mechanism**: Model adapters MUST expose a readiness mechanism allowing the gateway to determine if credentials, network endpoints, or local runtimes are configured and available before dispatching inference requests.
* **`[NORMATIVE]` Normalized Response Envelope**: The gateway must normalize heterogeneous provider responses into a structured internal envelope capturing:
  * Raw generated content string
  * Normalized token usage (prompt and completion tokens, where reported)
  * Invoked provider and model identifiers
  * Degradation flag (`is_degraded: bool`)

---

## 4. Provider-Neutral Error Taxonomy

To prevent vendor-specific exception classes (e.g., Google API exceptions, Groq SDK errors, httpx timeouts) from leaking into the Domain Engine, the gateway normalizes all provider errors into an internal error taxonomy:

```text
                             ┌───────────────────────┐
                             │     ProviderError     │
                             │ (Base Gateway Error)  │
                             └───────────┬───────────┘
                                         │
         ┌───────────────────┬───────────┴───────────┬───────────────────┐
         │                   │                       │                   │
┌────────▼──────────┐ ┌──────▼───────────┐ ┌────────▼───────────┐ ┌──────▼───────────┐
│ ConnectivityError │ │  RateLimitError  │ │UpstreamServiceError│ │AuthenticationError│
│(Timeouts, Connect)│ │ (HTTP 429 Quota) │ │  (HTTP 5xx Errors) │ │(Missing/Bad Keys) │
└───────────────────┘ └──────────────────┘ └───────────────────┘ └───────────────────┘
         │                   │                       │                   │
┌────────▼──────────┐ ┌──────▼───────────┐ ┌────────▼───────────┐ ┌──────▼───────────┐
│ResponseFormatError│ │SchemaValidateErr │ │SecurityBoundaryErr │ │InvalidInputError  │
│ (Malformed JSON)  │ │ (Pydantic Mismatch│ │(Prompt Injection) │ │(Missing Project ID│
└───────────────────┘ └──────────────────┘ └───────────────────┘ └───────────────────┘
```

---

## 5. Multi-Tier Gateway Cascade Execution Policy

When a cognitive operation is requested, the `LLMGateway` evaluates providers according to the configured cascade policy:

```text
 [Request from Domain Engine]
               │
               ▼
   ┌───────────────────────┐
   │ Check Primary Tier    │────── Available ──────► [Invoke Primary Provider]
   │ (Gemini)              │                                │
   └───────────┬───────────┘                                │
               │ Unavailable / Cascade Trigger              ▼
               ▼                                    Success: Normalize & Validate
   ┌───────────────────────┐                        Cascade Trigger: Log & Failover
   │ Check Secondary Tier  │────── Available ──────► [Invoke Secondary Provider]
   │ (Groq)                │                                │
   └───────────┬───────────┘                                │
               │ Unavailable / Cascade Trigger              ▼
               ▼                                    Success: Normalize & Validate
   ┌───────────────────────┐                        Cascade Trigger: Log & Failover
   │ Check Tertiary Tier   │────── Available ──────► [Invoke Tertiary Provider]
   │ (Local Ollama)        │                                │
   └───────────┬───────────┘                                │
               │ Unavailable / Offline                      ▼
               ▼                                    Success: Normalize & Validate
   ┌───────────────────────┐                        Cascade Trigger: Log & Failover
   │ Quaternary Tier:      │
   │ Deterministic         │───────────────────────► [Execute Synthetic Fallback]
   │ Synthetic Fallback    │                                │
   └───────────────────────┘                                ▼
                                                    Return Degraded Response
                                                    (is_degraded=True)
```

### 5.1 Provider Cascade Configuration Profile

| Tier | Provider Identifier | Provider Role | Selection Condition |
| :--- | :--- | :--- | :--- |
| **Primary** | `gemini` | Multi-source synthesis, complex extraction | Standard operation with valid credentials |
| **Secondary** | `groq` | Fast epistemic evaluation, secondary fallback | Primary unavailable, rate-limited, or 5xx outage |
| **Tertiary** | `ollama` | Sovereign offline inference | Offline operation, zero-network mode, or cloud failure |
| **Fallback** | `synthetic` | Deterministic heuristic continuity | All external & local providers unreachable (`is_degraded = True`) |

### 5.2 Failure Action Matrix
* **`[NORMATIVE]` Action Dispatch**:

| Error Classification | Gateway Action |
| :--- | :--- |
| `ConnectivityError` / `UpstreamServiceError` | Log warning; failover to next configured cascade tier. |
| `RateLimitError` | Suppress provider for configured bounded cooldown interval; failover to next tier. |
| `ResponseFormatError` / `SchemaValidationError` | Attempt bounded format repair/retry (max 1 retry); failover to next tier if retry fails. |
| `SecurityBoundaryError` | **TERMINAL**: Immediately halt execution; reject request; log security event; do NOT cascade. |
| `InvalidInputError` | **TERMINAL**: Immediately raise client error (HTTP 422); do NOT cascade. |

* **`[NORMATIVE]` Non-Termination Invariant**: A recoverable provider failure MUST NOT, by itself, terminate the active cognitive operation; the gateway MUST attempt the configured downstream tiers according to cascade policy.

---

## 6. Structured Schema Validation & Domain Enforcement

To prevent unconstrained model hallucination and ensure type-safe integration with Area 3 (Domain Engine), all analytical outputs are validated through Pydantic v2 domain schemas.

### 6.1 Validation Pipeline
```text
  [Raw JSON string from Provider]
              │
              ▼
   [Strip Markdown Code Fences]
              │
              ▼
    [JSON Syntax Deserialization]
              │
              ├── Syntax Error ──────────────► [Format Repair / Bounded Retry]
              ▼
  [Pydantic Model Validation]
              │
              ├── Schema Mismatch ───────────► [Log Validation Diff / Failover]
              ▼
 [Type-Safe Domain Contract to Area 3]
```

### 6.2 Core Analytical Output Schemas
* **`[NORMATIVE]` Analytical Contracts**: Domain extraction models must explicitly capture model confidence ($C_{\text{AI}}$) separately from evidence strength:
  * **Synthesis Contract**: Enforces structured extraction of executive summaries, extracted claims, model confidence ($C_{\text{AI}}$), identified contradictions, and research gaps.
  * **Claim Extraction Contract**: Enforces structured capture of claim statements, domain scopes, model confidence ($C_{\text{AI}}$), source identifiers, and falsification conditions.
* **`[NORMATIVE]` Epistemic Decoupling in Schemas**: Schema fields representing model confidence MUST be explicitly named (e.g., `model_confidence` or `c_ai`) to prevent conflation with evidentiary rigor ($S_{\text{EVID}}$) or decision conviction ($C_{\text{DEC}}$).

---

## 7. Context & Token Management Architecture

The gateway enforces structured, provider-aware context allocation to prevent token overflow and preserve prompt integrity:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                   CONFIGURABLE CONTEXT ALLOCATION                       │
├─────────────────────────────────────────────────────────────────────────┤
│  1. SYSTEM & GOVERNANCE PROMPT BUDGET                                   │
│     Fixed budget allocated for constitutional and epistemic rules.      │
├─────────────────────────────────────────────────────────────────────────┤
│  2. UNTRUSTED EXTERNAL CONTEXT BUDGET                                   │
│     Bounded allocation for demarcated literature abstracts & snippets.  │
├─────────────────────────────────────────────────────────────────────────┤
│  3. TASK INSTRUCTION BUDGET                                             │
│     Dynamic allocation for current user command and query parameters.   │
├─────────────────────────────────────────────────────────────────────────┤
│  4. STRUCTURED COMPLETION BUDGET                                        │
│     Guaranteed output token budget for schema JSON generation.          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Context Management Invariants
1. **`[NORMATIVE]` Provider-Aware Context Budgeting**: The gateway MUST enforce configured context and completion budgets appropriate to the selected provider and model. Budget parameters MUST remain configuration concerns and MUST NOT be treated as hard-coded universal constants.
2. **`[NORMATIVE]` Deterministic Context Truncation**: When external literature context exceeds its allocated budget, the gateway MUST truncate content at paragraph or abstract boundaries, appending an explicit truncation notice (`[TRUNCATED FOR CONTEXT BUDGET]`). System prompts and output schema instructions MUST NEVER be truncated.
3. **`[NORMATIVE]` Untrusted Demarcation**: All external literature text injected into prompt context MUST be encapsulated in untrusted boundary tags as established in `CIIA.md` and `SECURITY.md`.

---

## 8. Degraded-Mode Mechanics (Synthetic Fallback) `[NORMATIVE / TARGET]`

When all configured external and local providers are unreachable, the gateway transitions to the **Deterministic Synthetic Fallback**:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                   SYNTHETIC FALLBACK INVARIANTS                         │
├─────────────────────────────────────────────────────────────────────────┤
│  • Gateway Envelope: is_degraded = True                                 │
│  • Model Confidence: C_AI = Marked uncalibrated / unassigned            │
│  • Evidence Layer Handling: is_evidentiary = False                      │
│  • Source Taxonomy: SourceTaxonomy.SYNTHETIC_FALLBACK                   │
│  • Epistemic Contribution: 0 (Evaluated Evidence Status Forbidden)      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Fallback Execution Principles
1. **`[TARGET]` Deterministic Extraction**: Extracts baseline structural tokens and statements through local rule-based heuristics without network or model dependencies.
2. **`[NORMATIVE]` Explicit User Signaling**: Degraded responses MUST include explicit notification that outputs were generated under synthetic fallback conditions and require empirical verification.
3. **`[NORMATIVE]` Epistemic Invalidation Protection**: Synthetic outputs are treated as unverified candidate proposals and cannot be promoted to `Evaluated Evidence` status without empirical external verification.

---

## 9. Verification & Compliance Checklist

Before any code modification affecting the AI Gateway is accepted, it must satisfy the following verification criteria:

| Check ID | Architectural Requirement | Verification Method | Acceptance Standard |
| :--- | :--- | :--- | :--- |
| **AIGW-01** | Provider abstraction compliance. | Interface conformance test. | Provider adapters adhere to abstract gateway interface. |
| **AIGW-02** | Gateway cascade failover policy. | Simulated provider failure unit tests. | Cascade traverses configured tiers upon recoverable errors. |
| **AIGW-03** | Structured schema validation. | Pydantic validation test suite. | Syntax/schema errors trigger bounded retry or failover. |
| **AIGW-04** | Rate limit cooldown suppression. | Mocked 429 invocation test. | Provider is temporarily bypassed during cooldown interval. |
| **AIGW-05** | Synthetic degradation signaling. | Offline end-to-end gateway test. | Output sets `is_degraded = True`. |
| **AIGW-06** | Prompt demarcation wrapping. | Prompt assembly inspection test. | 100% of external inputs wrapped with demarcation tags. |
| **AIGW-07** | Provider error normalization. | Error taxonomy mapping tests. | Vendor exceptions map to internal `ProviderError` types. |
| **AIGW-08** | Unit and integration test pass rate. | Execution of `tests/llm/`. | 100% applicable tests pass. |

---

## 10. Ratification & Version History

| Version | Date | Author / Governance | Key Changes & Rationale | Status |
| :--- | :--- | :--- | :--- | :--- |
| `1.0.0` | `2026-09-04` | Antigravity AI Engine & Architectural Governance | Initial formal specification establishing provider abstraction, provider-neutral error taxonomy, configurable context budgeting, failure action matrix, and synthetic fallback mechanics. | 🟢 RATIFIED |
