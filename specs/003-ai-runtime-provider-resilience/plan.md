# CONVERA SDD-003: AI Runtime Provider Resilience Plan

**Specification ID**: CONVERA-SDD-003  
**Classification**: Technical Implementation Plan  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [REVISED PLAN — AWAITING HUMAN RATIFICATION]  
**Revision**: 2.0.0 (Post-Phase 2 Conditional Review)  
**Baseline Git Commit**: `2d5bfa3`  
**Feature Branch**: `feature/003-ai-runtime-provider-resilience`  
**Target Integration Branch**: `develop`  

---

## 1. Technical Architecture & Inversion of Control

This plan refactors `backend/llm_gateway.py` to establish `GatewayResult` as the canonical gateway return contract, isolates provider APIs behind `BaseLLMProvider`, enforces a two-dimensional error action matrix, and governs degraded workflow continuity.

```text
                               ┌────────────────────────┐
                               │     GatewayRouter      │
                               │  (Cascade Coordinator) │
                               └───────────┬────────────┘
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             │                             │                             │
    ┌────────▼────────┐           ┌────────▼────────┐           ┌────────▼────────┐
    │ GeminiProvider  │           │  GroqProvider   │           │OpenRouterProvider│
    │(Google GenAI SDK│           │(httpx async API)│           │(httpx open pool)│
    └─────────────────┘           └─────────────────┘           └─────────────────┘
             │                             │                             │
             └─────────────────────────────┼─────────────────────────────┘
                                           │
                                  ┌────────▼────────┐
                                  │ OllamaProvider  │
                                  │(Sovereign Local)│
                                  └────────┬────────┘
                                           │ (All Models Exhausted)
                                  ┌────────▼────────────────────┐
                                  │   SyntheticFallbackProvider │
                                  │(Workflow Continuity Only;   │
                                  │ is_degraded=True; weight=0) │
                                  └─────────────────────────────┘
                                           │
                                           ▼
                                    [GatewayResult]
                                    ├── content
                                    ├── is_degraded: bool
                                    ├── runtime_provenance: RuntimeProvenance
                                    └── epistemic_status: EpistemicStatus
```

---

## 2. Component File Modifications

### 2.1 Backend AI Runtime Layer

#### `[MODIFY] backend/llm_gateway.py`
1. **Core Data Contracts**:
   - Define `RuntimeProvenance` dataclass (`provider`, `model`, `primary_provider`, `attempted_providers`, `fallback_used`, `fallback_reason`, `latency_seconds`, `request_id`, `tokens_used`).
   - Define `EpistemicStatus` dataclass (`is_evidentiary = False`, `evidence_tier = 'SIGNAL'`, `evidence_weight = 0.0`, `provenance_lineage = None`).
   - Define `GatewayResult` dataclass holding `content`, `is_degraded`, `runtime_provenance`, `epistemic_status`, and `error`.
   - Define `ProviderCapabilities` dataclass (`text_generation`, `structured_output`, `tool_calling`, `vision`, `streaming`, `long_context`, `research_suitable`).
2. **Error Taxonomy Hierarchy**:
   - Root: `ProviderError(Exception)`
   - Recoverable: `ConnectivityError`, `TimeoutError`, `RateLimitError`, `BillingExhaustionError`, `ServiceUnavailableError`, `AuthenticationError`, `EndpointRetiredError`, `ResponseFormatError`.
   - Terminal: `InvalidInputError`, `SecurityBoundaryError`.
3. **Provider Abstraction Protocol (`BaseLLMProvider`)**:
   - Abstract methods: `identity`, `capabilities`, `is_configured()`, `check_health()`, `generate()`.
   - Concrete implementations: `GeminiProvider`, `GroqProvider`, `OpenRouterProvider`, `OllamaProvider`, `SyntheticFallbackProvider`.
4. **Deterministic Cooldown Tracker (`ProviderCooldownTracker`)**:
   - In-memory thread-safe dictionary tracking cooldown expiry and configuration suppression.
   - Timed cooldown: 30s for 429, 15s for 503.
   - Configuration suppression: 402, 410, 401 suppressed until `reload_config()` is invoked.
5. **Governed Synthetic Fallback Engine**:
   - Implements safe degraded workflow continuity.
   - Emits structured guidance informing user that AI generation is offline; provides manual entry and verification options.
   - Prohibited from synthesizing fake problem statements or fabricated citations.
   - Sets `is_degraded = True`, `is_evidentiary = False`, `evidence_weight = 0.0`.
6. **Canonical Dispatch Pipeline (`generate_with_meta`)**:
   - Accepts prompt, system instruction, optional schema, and history.
   - Routes through configured, healthy, non-cooldown providers.
   - Differentiates provider failure (cascade) vs request failure (terminate).
   - Returns canonical `GatewayResult`.
7. **Legacy Compatibility Wrapper**:
   - Retains `generate_response_with_fallback()` marked with docstring `[LEGACY COMPATIBILITY API - DO NOT USE FOR NEW COMPONENTS]`.
   - Calls `generate_with_meta()` and returns `result.content`.

#### `[MODIFY] backend/routers/research.py`
- Remediate `DEF-AI-003`: In line 129, replace hardcoded `"evidence_tier": "OBSERVED"` with `"evidence_tier": "SIGNAL"`.
- Candidate problem records discovered in Stage A are persisted as unverified signals with zero empirical weight until Stage B validation.

#### `[NEW] backend/tests/test_llm_gateway.py`
- Dedicated unit test suite with 100% mocked providers.
- Test suites:
  1. Provider selection and configuration detection.
  2. Cooldown management (429 30s cooldown, 402/410 configuration suppression).
  3. Failover cascade (503 and timeout failover).
  4. Terminal failure halt (security injection and invalid inputs terminate immediately without cascade).
  5. Synthetic fallback degraded continuity (`is_degraded = True`, `is_evidentiary = False`, `weight = 0.0`, no fake citations).
  6. Legacy wrapper backward compatibility.

---

### 2.2 Frontend Presentation Layer

#### `[MODIFY] web/src/components/common/ModelAttributionBadge.tsx`
- Extend `ModelMetadata` props with optional `is_degraded?: boolean` and `fallback_reason?: string`.
- When `is_degraded === true`, render an amber warning badge (`Degraded / Synthetic Fallback`) with AlertTriangle icon and explanatory tooltip.

#### `[MODIFY] web/src/lib/types.ts`
- Update `ModelMetadata` interface:
  ```typescript
  export interface ModelMetadata {
    provider?: string;
    model?: string;
    display_name?: string;
    latency_seconds?: number;
    is_degraded?: boolean;
    primary_provider?: string;
    fallback_reason?: string;
  }
  ```

---

## 3. Explicit Non-Goals & Architectural Boundaries

1. **`DEF-AI-007` (Deterministic Inversion in Decision Engine)**: Deferred to **SDD-004**.
2. **Hybrid Retrieval (BM25 + Semantic Search)**: Deferred to **SDD-005**.
3. **Database Migrations**: Zero schema changes to the 23 SQLite tables.
4. **Third-Party Orchestration Frameworks**: Zero new dependencies in `requirements.txt`.
