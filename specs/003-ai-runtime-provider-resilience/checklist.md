# CONVERA SDD-003: Verification Checklist

**Specification ID**: CONVERA-SDD-003  
**Classification**: Quality & Invariant Verification Checklist  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [PHASE 3 VERIFIED — AWAITING HUMAN REVIEW GATE]  
**Revision**: 2.0.0 (Post-Phase 2 Conditional Review)  
**Baseline Git Commit**: `2d5bfa3`  
**Feature Branch**: `feature/003-ai-runtime-provider-resilience`  
**Target Integration Branch**: `develop`  

---

## 1. Specification Compliance Checklist

- [x] **CHK-003-01**: `GatewayResult` is established as the canonical gateway return contract with decoupled `RuntimeProvenance` and `EpistemicStatus`.
- [x] **CHK-003-02**: `generate_response_with_fallback()` is marked `[LEGACY COMPATIBILITY API - DO NOT USE FOR NEW COMPONENTS]` and delegates internally to `GatewayResult.content`.
- [x] **CHK-003-03**: `ProviderCapabilities` contract is defined on `BaseLLMProvider` (`text_generation`, `structured_output`, `tool_calling`, `vision`, `streaming`, `long_context`, `research_suitable`).
- [x] **CHK-003-04**: Decoupled concrete adapters exist for `GeminiProvider`, `GroqProvider`, `OpenRouterProvider`, `OllamaProvider`, and `SyntheticFallbackProvider`.
- [x] **CHK-003-05**: Custom error taxonomy rooted in `ProviderError` differentiates provider-level failures from request-level failures.
- [x] **CHK-003-06**: HTTP 429 errors trigger a 30-second cooldown in `ProviderCooldownTracker`, bypassing subsequent network requests during the cooldown window.
- [x] **CHK-003-07**: HTTP 402 and 410 errors suppress affected providers until configuration reload or restart, preventing request stalls.
- [x] **CHK-003-08**: Malicious prompt injections (`SecurityBoundaryError`) and invalid inputs (`InvalidInputError`) terminate immediately without cascading.
- [x] **CHK-003-09**: Complete cascade exhaustion transitions to `SyntheticFallbackProvider`, which returns safe degraded workflow continuity guidance with `is_degraded = True`, `is_evidentiary = False`, and `evidence_weight = 0.0`.
- [x] **CHK-003-10**: Synthetic fallback is strictly incapable of fabricating citations, asserting external facts, or pretending to have performed empirical research.
- [x] **CHK-003-11**: Research Stage A router saves discovered problems with `evidence_tier = 'SIGNAL'` instead of `OBSERVED`, remediating `DEF-AI-003`.
- [x] **CHK-003-12**: Frontend `ModelAttributionBadge` renders an amber warning pill when `is_degraded === true`.

---

## 2. Epistemic & Invariant Safety Checklist

- [x] **INV-003-01 (Knowledge $\ne$ Workflow)**: Zero mutations to canonical database schemas; SQLite WAL 23 tables preserved intact.
- [x] **INV-003-02 (Tri-Part Decoupling)**: AI linguistic output is never treated as empirical evidence; $C_{\text{AI}} \ne S_{\text{EVID}} \ne C_{\text{DEC}}$.
- [x] **INV-003-03 (Anti-Pseudo-Research)**: Synthetic fallback never outputs claims classified as `OBSERVED`, `DOCUMENTED`, or `STRONGLY_DOCUMENTED`.
- [x] **INV-003-04 (Free-First Posture)**: The system functions 100% offline using local Ollama or Synthetic Fallback with zero required cloud API billing cards.
- [x] **INV-003-05 (Zero Secret Leaks)**: Zero `.env` credentials hardcoded or committed into source control.
- [x] **INV-003-06 (Backward Compatibility)**: Existing callers of `generate_response_with_fallback()` continue functioning without signature regressions.

---

## 3. Regression & Test Gate Checklist

- [x] **REG-003-01**: `backend/tests/test_llm_gateway.py` passes 100% across all provider, cascade, terminal error, provenance, and epistemic test suites (23/23 tests passed).
- [x] **REG-003-02**: All existing backend pytest tests pass without failure (114/114 total passed, zero regressions).
- [x] **REG-003-03**: Frontend TypeScript check passes with zero type errors (`npx tsc --noEmit`).
- [x] **REG-003-04**: Whitespace and formatting clean (`git diff --check`).
- [x] **REG-003-05**: Knowledge graph synchronized (`graphify update .`).
