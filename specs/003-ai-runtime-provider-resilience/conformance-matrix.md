# CONVERA SDD-003: Conformance & Traceability Matrix

**Specification ID**: CONVERA-SDD-003  
**Classification**: Specification Conformance & Requirements Traceability Matrix  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [REVISED CONFORMANCE MATRIX — AWAITING HUMAN RATIFICATION]  
**Revision**: 2.0.0 (Post-Phase 2 Conditional Review)  
**Baseline Git Commit**: `2d5bfa3`  
**Feature Branch**: `feature/003-ai-runtime-provider-resilience`  
**Target Integration Branch**: `develop`  

---

## 1. Upstream Normative Traceability

| Upstream Authority | Normative Requirement | Current Baseline Status | SDD-003 Target Conformance | Verification Check |
| :--- | :--- | :--- | :--- | :--- |
| **CONSTITUTION.md**<br>Article II | Tri-Part Confidence Decoupling: $C_{\text{AI}} \ne S_{\text{EVID}} \ne C_{\text{DEC}}$. Model output must not be treated as empirical evidence. | 🔴 **Contaminated**<br>`routers/research.py` stamps LLM output as `OBSERVED`. | 🟢 **Conforming**<br>Remediates `DEF-AI-003`; LLM problem candidates stamped as `SIGNAL` (`weight = 0.0`). Decouples `RuntimeProvenance` from `EpistemicStatus`. | `CHK-003-01`<br>`CHK-003-11` |
| **CONSTITUTION.md**<br>Article III | Evidence Progression & Provenance Integrity: Mandatory metadata; degraded output cannot contribute positive evidence weight. | 🔴 **Deficit**<br>Fallback mock in `research.py` lacked explicit non-evidentiary stamping. | 🟢 **Conforming**<br>`SyntheticFallbackProvider` returns `is_evidentiary = False`, `evidence_weight = 0.0`, and source `SYNTHETIC_FALLBACK`. | `CHK-003-09`<br>`CHK-003-10` |
| **CONSTITUTION.md**<br>Article V | External Boundary Principle: Platform maintains automated fallback chains (Primary $\to$ Secondary $\to$ Local Offline). | 🟡 **Procedural Only**<br>Catch-all `except Exception` loop without typed error routing. | 🟢 **Conforming**<br>Governed cascade routing via `BaseLLMProvider` and two-dimensional `ProviderError` action matrix. | `CHK-003-04`<br>`CHK-003-05` |
| **CONSTITUTION.md**<br>Article VI | Free-First Posture: 100% operational using local storage and free/local services with zero mandatory cost. | 🟢 **Conforming**<br>OpenRouter, Groq, and Ollama supported. | 🟢 **Preserved & Hardened**<br>Suppresses billing-restricted providers (Cerebras 402) without request stall; sovereign Ollama prioritized when offline. | `CHK-003-07`<br>`INV-003-04` |
| **AI_ARCHITECTURE.md**<br>Section 3 | Vendor-Agnostic Provider Abstraction: High-level domain services depend exclusively on neutral provider contract. | 🔴 **Deficit**<br>Two procedural helper functions with hardcoded conditionals. | 🟢 **Conforming**<br>Polymorphic `BaseLLMProvider` protocol implemented with concrete adapters and `ProviderCapabilities`. | `CHK-003-03`<br>`CHK-003-04` |
| **AI_ARCHITECTURE.md**<br>Section 4 | Provider-Neutral Error Taxonomy: Vendor exceptions mapped to typed internal classes. | 🔴 **Non-Existent**<br>No custom error classes in `llm_gateway.py`. | 🟢 **Conforming**<br>`ProviderError` hierarchy implemented (`RateLimitError`, `ConnectivityError`, `BillingExhaustionError`, etc.). | `CHK-003-05` |
| **AI_ARCHITECTURE.md**<br>Section 5.2 | Failure Action Matrix: Non-recoverable errors (security boundary, invalid input) must TERMINATE immediately. | 🔴 **Violated**<br>All exceptions caught by `except Exception` and cascaded indiscriminately. | 🟢 **Conforming**<br>`SecurityBoundaryError` and `InvalidInputError` raise immediate terminal HTTP exceptions (no cascade). | `CHK-003-08` |
| **AI_ARCHITECTURE.md**<br>Section 8 | Degraded-Mode Mechanics: Complete provider exhaustion executes synthetic fallback with `is_degraded = True`. | 🔴 **Deficit**<br>Raises unhandled `RuntimeError` on complete cascade exhaustion. | 🟢 **Conforming**<br>`SyntheticFallbackProvider` returns structured workflow guidance with `is_degraded = True` (no pseudo-research). | `CHK-003-09`<br>`CHK-003-10` |
| **CIIA.md**<br>Section 5 | Explicit Degradation Signaling: If cascade reaches terminal tier, response must flag unverified candidate status. | 🔴 **Non-Existent**<br>Gateway metadata does not expose `is_degraded`. | 🟢 **Conforming**<br>`GatewayResult.is_degraded` exposed canonically and mapped to frontend attribution badge. | `CHK-003-01`<br>`CHK-003-12` |
| **CONVERA_UPGRADE.md**<br>Section 11 | Controlled Provider Fallback: Primary provider, fallback provider, fallback reason, and degraded state recorded. | 🔴 **Deficit**<br>Gateway discards fallback reason and attempts history. | 🟢 **Conforming**<br>`GatewayResult.runtime_provenance` records `primary_provider`, `attempted_providers`, and `fallback_reason`. | `CHK-003-01` |

---

## 2. Classification Summary

- Total Authoritative Upstream Clauses Mapped: 10
- Stated Normative Deficits in Current Baseline: 8
- Conformance Target under SDD-003: 100% Conforming across all 10 clauses
