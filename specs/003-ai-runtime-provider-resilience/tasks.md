# CONVERA SDD-003: AI Runtime Provider Resilience Tasks

**Specification ID**: CONVERA-SDD-003  
**Classification**: Work Breakdown & Implementation Tasks  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [PHASE 3 IMPLEMENTATION COMPLETE — AWAITING HUMAN REVIEW GATE]  
**Revision**: 2.0.0 (Post-Phase 2 Conditional Review)  
**Baseline Git Commit**: `2d5bfa3`  
**Feature Branch**: `feature/003-ai-runtime-provider-resilience`  
**Target Integration Branch**: `develop`  

---

## 1. Task Breakdown & Execution Sequence

```text
[Phase 1: Canonical Contracts & Error Taxonomy]
       │
       ▼
  TASK-003-01: Implement ProviderCapabilities, RuntimeProvenance, EpistemicStatus,
               GatewayResult, and ProviderError Taxonomy
       │
       ▼
[Phase 2: Provider Abstraction & Cooldown Management]
       │
       ▼
  TASK-003-02: Implement BaseLLMProvider Protocol & Concrete Adapters
               (GeminiProvider, GroqProvider, OpenRouterProvider, OllamaProvider)
       │
       ▼
  TASK-003-03: Implement ProviderCooldownTracker (Timed & Configuration Suppression)
       │
       ▼
[Phase 3: Governed Degradation & Canonical Dispatch]
       │
       ▼
  TASK-003-04: Implement SyntheticFallbackProvider (Safe Workflow Continuity Scaffolding)
       │
       ▼
  TASK-003-05: Re-implement Gateway Cascade Returning Canonical GatewayResult &
               Expose Legacy String Adapter
       │
       ▼
[Phase 4: Epistemic Defect Remediation]
       │
       ▼
  TASK-003-06: Rectify Research Router Candidate Tier to SIGNAL (DEF-AI-003)
       │
       ▼
[Phase 5: Frontend Attribution & Degraded Signal]
       │
       ▼
  TASK-003-07: Enrich ModelAttributionBadge with Amber Degraded Warning Pill
       │
       ▼
[Phase 6: Automated Verification & Full Regression Gate]
       │
       ▼
  TASK-003-08: Construct Comprehensive backend/tests/test_llm_gateway.py Test Harness
       │
       ▼
  TASK-003-09: Execute Full Regression Suite (pytest 91 tests + npx tsc --noEmit)
```

---

## 2. Detailed Task Specifications

### Phase 1: Canonical Contracts & Error Taxonomy

#### `TASK-003-01`: Implement Contracts & Error Taxonomy
- **Component**: `backend/llm_gateway.py`
- **Objective**:
  1. Define `ProviderCapabilities` dataclass (`text_generation`, `structured_output`, `tool_calling`, `vision`, `streaming`, `long_context`, `research_suitable`).
  2. Define `RuntimeProvenance` dataclass (`provider`, `model`, `primary_provider`, `attempted_providers`, `fallback_used`, `fallback_reason`, `latency_seconds`, `request_id`, `tokens_used`).
  3. Define `EpistemicStatus` dataclass (`is_evidentiary = False`, `evidence_tier = 'SIGNAL'`, `evidence_weight = 0.0`, `provenance_lineage = None`).
  4. Define canonical `GatewayResult` dataclass (`content`, `is_degraded`, `runtime_provenance`, `epistemic_status`, `error`).
  5. Implement `ProviderError` hierarchy (`ConnectivityError`, `TimeoutError`, `RateLimitError`, `BillingExhaustionError`, `ServiceUnavailableError`, `AuthenticationError`, `EndpointRetiredError`, `ResponseFormatError`, `InvalidInputError`, `SecurityBoundaryError`).
- **Verification**: Import dataclasses and exceptions; verify inheritance and default values.

---

### Phase 2: Provider Abstraction & Cooldown Management

#### `TASK-003-02`: Implement BaseLLMProvider Protocol & Concrete Adapters
- **Component**: `backend/llm_gateway.py`
- **Objective**:
  1. Define `BaseLLMProvider(ABC)` with abstract methods `identity`, `capabilities`, `is_configured()`, `check_health()`, and `generate()`.
  2. Implement `GeminiProvider` using Google GenAI SDK.
  3. Implement `GroqProvider` using OpenAI-compatible async HTTP.
  4. Implement `OpenRouterProvider` using OpenAI-compatible async HTTP.
  5. Implement `OllamaProvider` using sovereign local offline HTTP endpoint.
- **Verification**: Unit test verifies each provider exposes the uniform protocol.

#### `TASK-003-03`: Implement ProviderCooldownTracker
- **Component**: `backend/llm_gateway.py`
- **Objective**: Implement thread-safe cooldown manager:
  - 429 RateLimit: Suppress provider for 30s.
  - 503 ServiceUnavailable: Suppress provider for 15s.
  - 402 BillingExhaustion / 410 EndpointRetired / 401 Auth: Suppress provider until `reload_config()` is invoked.
  - Provide `is_available(provider_id) -> bool` and `mark_cooldown(provider_id, error)`.
- **Verification**: Mock consecutive 429/402 errors; verify provider is bypassed on subsequent calls with zero network calls.

---

### Phase 3: Governed Degradation & Canonical Dispatch

#### `TASK-003-04`: Implement SyntheticFallbackProvider
- **Component**: `backend/llm_gateway.py`
- **Objective**: Implement safe degraded workflow continuity provider:
  - Emits safe guidance explaining AI cascade is unavailable; provides manual entry and verification options.
  - Prohibited from inventing plausible problem statements or fake citations.
  - Enforces `is_degraded = True`, `is_evidentiary = False`, `evidence_weight = 0.0`, `evidence_tier = "SIGNAL"`.
- **Verification**: Trigger synthetic fallback; verify returned `GatewayResult` carries `is_degraded == True`, `is_evidentiary == False`, and contains no fabricated citations.

#### `TASK-003-05`: Re-implement Gateway Cascade Returning Canonical GatewayResult
- **Component**: `backend/llm_gateway.py`
- **Objective**:
  1. Re-implement `generate_with_meta()` as primary gateway entry point returning `GatewayResult`.
  2. Enforce two-dimensional error action matrix (cascade on provider error, terminate immediately on request error).
  3. Provide `generate_response_with_fallback()` marked as `[LEGACY COMPATIBILITY API]` returning `result.content`.
- **Verification**: Mock provider cascade; verify `GatewayResult` returns correct provenance trace and attempted providers list.

---

### Phase 4: Epistemic Defect Remediation

#### `TASK-003-06`: Rectify Research Router Candidate Tier to SIGNAL (DEF-AI-003)
- **Component**: `backend/routers/research.py`
- **Objective**: Change line 129 from `"evidence_tier": "OBSERVED"` to `"evidence_tier": "SIGNAL"`. Ensure LLM-discovered problem candidates default to non-evidentiary signal tier.
- **Verification**: Invoke `/api/research/discover`; verify created SQLite records have `evidence_tier == "SIGNAL"`.

---

### Phase 5: Frontend Attribution & Degraded Signal

#### `TASK-003-07`: Enrich ModelAttributionBadge with Amber Degraded Warning Pill
- **Component**: `web/src/components/common/ModelAttributionBadge.tsx`, `web/src/lib/types.ts`
- **Objective**: Add `is_degraded?: boolean` and `fallback_reason?: string` to `ModelMetadata`. When `is_degraded === true`, render an amber warning pill badge (`Degraded / Synthetic Fallback`) with AlertTriangle icon.
- **Verification**: `npx tsc --noEmit` passes with 0 errors.

---

### Phase 6: Automated Verification & Full Regression Gate

#### `TASK-003-08`: Construct Comprehensive test_llm_gateway.py Test Harness
- **Component**: `backend/tests/test_llm_gateway.py`
- **Objective**: Implement mocked unit tests covering:
  - Provider selection and readiness.
  - 429 30-second cooldown and network bypass.
  - 402/410 configuration suppression.
  - 503 and timeout cascade failover.
  - Terminal failure halt (security injection and invalid schema).
  - Synthetic fallback degraded continuity (safe guidance, no pseudo-research, zero evidence weight).
  - Legacy wrapper backward compatibility.
- **Verification**: `PYTHONPATH=. pytest tests/test_llm_gateway.py -v` passes 100%.

#### `TASK-003-09`: Execute Full Regression Suite
- **Component**: Entire repository
- **Objective**: Execute the full test suite and typechecks to guarantee zero regression across CONVERA.
- **Verification**: `PYTHONPATH=. pytest tests/ -q` (all 91 existing tests pass), `npx tsc --noEmit` (0 errors), `git diff --check` (clean).
