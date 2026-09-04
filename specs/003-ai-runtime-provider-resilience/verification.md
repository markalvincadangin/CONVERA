# CONVERA SDD-003: Verification Plan & Test Strategy

**Specification ID**: CONVERA-SDD-003  
**Classification**: Test Verification Plan & Benchmark Strategy  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [REVISED VERIFICATION PLAN — AWAITING HUMAN RATIFICATION]  
**Revision**: 2.0.0 (Post-Phase 2 Conditional Review)  
**Baseline Git Commit**: `2d5bfa3`  
**Feature Branch**: `feature/003-ai-runtime-provider-resilience`  
**Target Integration Branch**: `develop`  

---

## 1. Test Harness Architecture (`backend/tests/test_llm_gateway.py`)

The verification harness isolates `LLMGateway` from external internet endpoints using Python's `unittest.mock` and `pytest`. It tests deterministic routing, error classification, cooldown tracking, and epistemic degraded-state invariants:

```text
                               ┌───────────────────────────┐
                               │  test_llm_gateway.py Test │
                               └─────────────┬─────────────┘
                                             │
      ┌──────────────────────┬───────────────┼───────────────┬──────────────────────┐
      │                      │               │               │                      │
┌─────▼─────────────┐ ┌──────▼────────┐ ┌────▼─────────┐ ┌───▼────────────┐ ┌──────▼─────────────┐
│ 1. Provider State │ │ 2. Cooldown   │ │ 3. Cascade   │ │ 4. Terminal    │ │ 5. Epistemic &      │
│ (Config, Health)  │ │ (429, 402/410)│ │ (503, Timeout│ │ (Security, 422)│ │ Synthetic Fallback  │
└───────────────────┘ └───────────────┘ └──────────────┘ └────────────────┘ └─────────────────────┘
```

---

## 2. Expanded Test Suite Specifications

### Test Suite 1: Provider Selection, Configuration & Health
- `test_configured_provider_selected()`: Verify that when Gemini is configured, it is selected as the primary provider.
- `test_unconfigured_provider_skipped()`: Verify that providers with empty API keys are omitted from the cascade.
- `test_provider_health_check_failure()`: Mock an endpoint failure on `.check_health()`; verify provider reports unavailable status.
- `test_provider_capability_representation()`: Verify each provider accurately reports its `ProviderCapabilities` flags.

### Test Suite 2: Recoverable Failures & Cooldown Tracking
- `test_rate_limit_429_triggers_30s_cooldown()`: Mock an HTTP 429 response from Tier 1; verify gateway cascades to Tier 2 and registers Tier 1 in `ProviderCooldownTracker` with a 30-second expiry.
- `test_cooldown_bypasses_network_call()`: Call the gateway immediately following a 429; verify Tier 1 is bypassed with zero network dispatch.
- `test_service_unavailable_503_cascades()`: Mock a 503 capacity spike on Tier 1; verify gateway cascades to Tier 2 and sets a 15-second cooldown.
- `test_timeout_cascades_cleanly()`: Mock an `httpx.TimeoutException` exceeding provider timeout; verify clean cascade progression.
- `test_billing_402_suppresses_until_reload()`: Mock an HTTP 402 Payment Required; verify provider is suppressed until `reload_config()` is invoked.
- `test_retirement_410_suppresses_until_reload()`: Mock an HTTP 410 Endpoint Retired; verify provider is suppressed without stalling the user session.
- `test_malformed_json_response_retries_once()`: Mock a malformed JSON response; verify provider executes bounded 1x format repair retry before cascading.

### Test Suite 3: Terminal Failures (Zero Cascade)
- `test_security_boundary_injection_terminates_immediately()`: Pass a detected prompt-injection token; verify gateway immediately raises `SecurityBoundaryError` (HTTP 400) without attempting downstream providers.
- `test_invalid_input_payload_terminates_immediately()`: Pass a malformed parameter; verify gateway immediately raises `InvalidInputError` (HTTP 422) without cascading.

### Test Suite 4: Cascade Failover Order
- `test_cascade_tier1_success()`: Tier 1 succeeds $\to$ return Tier 1 output (`fallback_used = False`).
- `test_cascade_tier1_fails_tier2_succeeds()`: Tier 1 fails (503) $\to$ Tier 2 succeeds $\to$ return Tier 2 output (`fallback_used = True`, `fallback_reason = "503"`).
- `test_cascade_tier1_tier2_fail_tier3_succeeds()`: Tiers 1–2 fail $\to$ Tier 3 succeeds $\to$ return Tier 3 output.
- `test_cascade_all_fail_triggers_synthetic_fallback()`: All providers fail $\to$ execute `SyntheticFallbackProvider` (`is_degraded = True`).

### Test Suite 5: Runtime Provenance Contract
- `test_gateway_result_captures_runtime_provenance()`: Verify `GatewayResult.runtime_provenance` contains `provider`, `model`, `primary_provider`, `attempted_providers`, `fallback_used`, and `latency_seconds`.
- `test_legacy_wrapper_backward_compatibility()`: Call `generate_response_with_fallback()`; verify it returns identical `result.content` string without signature breakage.

### Test Suite 6: Epistemic Invariants & Anti-Pseudo-Research
- `test_synthetic_fallback_sets_degraded_and_non_evidentiary()`: When all models fail, verify:
  - `result.is_degraded == True`
  - `result.runtime_provenance.provider == "synthetic_fallback"`
  - `result.epistemic_status.is_evidentiary == False`
  - `result.epistemic_status.evidence_weight == 0.0`
  - `result.epistemic_status.evidence_tier == "SIGNAL"`
- `test_synthetic_fallback_contains_no_fabricated_citations()`: Verify synthetic fallback content contains safe workflow continuity scaffolding, not fabricated DOIs, simulated statistics, or plausible pseudo-research.
- `test_synthetic_output_never_stamped_observed_or_documented()`: Verify synthetic fallback output is never permitted to enter `OBSERVED`, `DOCUMENTED`, or `STRONGLY_DOCUMENTED` tiers.
- `test_research_stage_a_stamps_signal_tier()`: Invoke `/api/research/discover`; verify created SQLite problem records have `evidence_tier == "SIGNAL"`.

---

## 3. Execution Commands & Acceptance Gates

```bash
# 1. Gateway Unit & Epistemic Tests
cd backend
PYTHONPATH=. .venv/bin/pytest tests/test_llm_gateway.py -v

# 2. Full Backend Regression Suite (91 existing tests)
PYTHONPATH=. .venv/bin/pytest tests/ -q

# 3. Frontend TypeScript Integrity
cd ../web
npx tsc --noEmit

# 4. Whitespace & Formatting
cd ..
git diff --check
```

### Acceptance Standard:
- 100% of tests in `test_llm_gateway.py` pass.
- 100% of existing 91 backend tests pass with zero regressions.
- Frontend builds cleanly with zero TypeScript errors.
- Whitespace and formatting pass cleanly.
