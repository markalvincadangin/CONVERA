# CONVERA SDD-003: Defect Register

**Specification ID**: CONVERA-SDD-003  
**Classification**: Architectural & Implementation Defect Register  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [PHASE 3 VERIFIED — AWAITING HUMAN REVIEW GATE]  
**Revision**: 2.0.0 (Post-Phase 2 Conditional Review)  
**Baseline Git Commit**: `2d5bfa3`  
**Feature Branch**: `feature/003-ai-runtime-provider-resilience`  
**Target Integration Branch**: `develop`  

---

## 1. Triaged Defect Inventory

| Defect ID | Severity | Category | Title & Summary | Remediation in SDD-003 | Scope Status | Resolution Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`DEF-AI-001`** | **CRITICAL** | AI Runtime | **Unbounded Error Cascading on Terminal Exceptions**<br>Catch-all `except Exception` in `llm_gateway.py` blindly retries prompt-injection violations and bad client inputs across all downstream providers. | Implement two-dimensional `ProviderError` action matrix. Restrict cascade to recoverable errors (`ConnectivityError`, `RateLimitError`, `ServiceUnavailableError`). Terminate immediately on `SecurityBoundaryError` and `InvalidInputError`. | **IN SCOPE (SDD-003)** | 🟢 **RESOLVED & VERIFIED** |
| **`DEF-AI-002`** | **HIGH** | Observability | **Provenance Stripping & String-Centric Contract**<br>`generate_response_with_fallback()` returns raw text, discarding provider, model, latency, and fallback metadata before reaching domain engines. | Establish `GatewayResult` as canonical runtime contract with decoupled `RuntimeProvenance` and `EpistemicStatus`. Retain string wrapper strictly as `[LEGACY COMPATIBILITY API]`. | **IN SCOPE (SDD-003)** | 🟢 **RESOLVED & VERIFIED** |
| **`DEF-AI-003`** | **CRITICAL** | Epistemic | **Epistemic Contamination in Research Router**<br>`backend/routers/research.py` stamps unverified LLM problem candidates with `evidence_tier = 'OBSERVED'`, violating Constitution Articles II & III. | Update `routers/research.py` line 129 to stamp candidates with `evidence_tier = 'SIGNAL'`, ensuring unverified candidates have zero empirical weight until validated in Stage B. | **IN SCOPE (SDD-003)** | 🟢 **RESOLVED & VERIFIED** |
| **`DEF-AI-004`** | **HIGH** | Verification | **Absence of Automated AI Gateway Test Suite**<br>No dedicated unit test directory `tests/llm/` exists. All existing tests mock `generate_response_with_fallback`, leaving cascade and fallback logic completely unverified. | Create `backend/tests/test_llm_gateway.py` with 100% mocked provider test coverage for readiness, cooldown, failover, terminal errors, provenance separation, and synthetic degradation. | **IN SCOPE (SDD-003)** | 🟢 **RESOLVED & VERIFIED** |
| **`DEF-AI-005`** | **MEDIUM** | Performance | **Absence of Provider Cooldown Suppression**<br>Throttled (429), payment-required (402), or brownout (410) providers are repeatedly attempted over the network on every request, adding 30–60s latency. | Implement `ProviderCooldownTracker` to suppress 429 providers for 30s, 503 providers for 15s, and suppress 402/410 providers until configuration reload or process restart. | **IN SCOPE (SDD-003)** | 🟢 **RESOLVED & VERIFIED** |
| **`DEF-AI-006`** | **HIGH** | Resilience | **Unhandled RuntimeError on Complete Cascade Exhaustion**<br>When all external and local providers fail, `llm_gateway.py` raises an unhandled `RuntimeError`, crashing the user's active workflow session. | Implement `SyntheticFallbackProvider` setting `is_degraded = True`, returning safe workflow continuity guidance (no pseudo-research, no fake citations) without crashing the session. | **IN SCOPE (SDD-003)** | 🟢 **RESOLVED & VERIFIED** |
| **`DEF-AI-007`** | **HIGH** | Architecture | **LLM-First Decision Ranking / Deterministic Inversion**<br>`backend/engines/decision_engine.py` delegates problem candidate ranking calculation directly to an LLM prompt instead of calculating multi-criteria formulas mathematically. | Refactor `decision_engine.py` to calculate evidence scoring, weighted ranking, and threshold rules deterministically before invoking an LLM for optional narrative explanation. | **DEFERRED TO SDD-004**<br>(Deterministic Intelligence) | 🟡 **DEFERRED TO SDD-004** |

---

## 2. Governance Defect Triaging & Resolution Plan

1. **Phase 1 & 2**: Resolved `DEF-AI-001`, `DEF-AI-002`, and `DEF-AI-005` via `GatewayResult`, `ProviderError` taxonomy, and `ProviderCooldownTracker`.
2. **Phase 3**: Resolved `DEF-AI-006` via `SyntheticFallbackProvider` (safe workflow continuity, zero pseudo-research).
3. **Phase 4**: Resolved `DEF-AI-003` via one-line correction in `backend/routers/research.py`.
4. **Phase 6**: Resolved `DEF-AI-004` via `backend/tests/test_llm_gateway.py` (23 passing unit tests).
5. **Future Work**: `DEF-AI-007` is formally isolated and scheduled for remediation under **SDD-004 (Deterministic Research Intelligence)**.
