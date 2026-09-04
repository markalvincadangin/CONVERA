# CONVERA SDD-003: Architectural Impact & Pre-Flight Analysis

**Specification ID**: CONVERA-SDD-003  
**Classification**: Architectural Impact & Pre-Flight Analysis  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [REVISED ANALYSIS — AWAITING HUMAN RATIFICATION]  
**Revision**: 2.0.0 (Post-Phase 2 Conditional Review)  
**Baseline Git Commit**: `2d5bfa3`  
**Feature Branch**: `feature/003-ai-runtime-provider-resilience`  
**Target Integration Branch**: `develop`  

---

## 1. System Boundary Analysis

SDD-003 modifies the runtime execution engine in Area 5 (CIIA / AI Infrastructure) while keeping persistence and domain decision boundaries strictly untouched:

```text
Area 1: Presentation (web/)
      ▲
      │ (Consumes ModelMetadata with optional is_degraded flag)
Area 2: Routers (backend/routers/)
      │
      ▼
Area 3: Domain Engines (backend/engines/)
      │
      ▼
Area 5: AI Gateway (backend/llm_gateway.py)  <--- BOUNDARY OF SDD-003
      │
      ├── Primary: Google Gemini
      ├── Secondary: Groq Cloud
      ├── Tertiary: OpenRouter
      ├── Sovereign: Local Ollama
      └── Terminal: Synthetic Fallback (Continuity Scaffolding Only)
      │
Area 4: Persistence (backend/storage/sqlite_adapter.py)
      ▲
      │ (Preserved: Zero schema changes, zero migrations)
```

---

## 2. Critical Epistemic Analysis: Research Candidates & Evidence Invariants

### 2.1 The Invalidation of `OBSERVED`
In `backend/routers/research.py` line 129, unverified problem candidates were stamped with:
```python
"evidence_tier": "OBSERVED"
```
This is a critical epistemic defect (`DEF-AI-003`):
1. **Canonical Schema**: In `backend/storage/sqlite_adapter.py` line 123, the column is `evidence_tier TEXT DEFAULT 'SIGNAL'`. The valid domain values are `SIGNAL`, `DOCUMENTED`, and `STRONGLY_DOCUMENTED`. `OBSERVED` does not exist in the database schema or glossary.
2. **Epistemic Invariant**: An LLM discovery generation is a computational hypothesis, never an empirical observation. Claiming an LLM "observed" a phenomenon conflates linguistic certainty with empirical reality, violating Constitution Article II ($C_{\text{AI}} \ne S_{\text{EVID}}$).
3. **Remediation**: Setting `evidence_tier = 'SIGNAL'` correctly classifies candidate problems as unverified entry-level signals with zero empirical weight until validated in Stage B.

### 2.2 The Anti-Pseudo-Research Doctrine for Synthetic Fallback
The greatest risk of degraded-mode generation is **synthetic pseudo-research**—generating plausible-sounding but completely fabricated problem statements, metrics, or citations.
- **Prohibited Behavior**: When cloud LLMs fail, the gateway must NEVER simulate empirical field findings or pretend to extract research literature.
- **Governed Behavior**: The `SyntheticFallbackProvider` acts strictly as an **epistemic safety buffer**. It provides clear workflow guidance stating that automated AI synthesis is offline, presents manual entry and connector verification alternatives, and returns an explicit degraded status (`is_degraded = True`, `is_evidentiary = False`, `evidence_weight = 0.0`).

---

## 3. Two-Dimensional Error Classification Matrix

Failure handling is decomposed into two distinct orthogonal concerns:
1. **Provider-Level Consequence**: Does this failure indicate a temporary or persistent issue with the specific model provider?
2. **Request-Level Consequence**: Can this request be safely retried against another provider, or must the entire operation be terminated?

```text
                                  Error Event
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        Provider-Level Consequence            Request-Level Consequence
        ├── Retry current provider?           ├── Cascade to next provider?
        └── Provider cooldown / disable?      └── Terminate entire request?
```

| Error Event | Trigger Condition | Provider Consequence | Request Consequence | Behavioral Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **`ConnectivityError`** | DNS failure, socket drop, connection reset. | No retry on same provider. | **CASCADE** | Network issue specific to provider endpoint. |
| **`TimeoutError`** | Gateway timeout exceeded (10s cloud / 5s Ollama). | No retry on same provider. | **CASCADE** | Provider slow or compute hung; failover. |
| **`RateLimitError`** | HTTP 429 Quota or burst rate exceeded. | **30s Timed Cooldown**. | **CASCADE** | Temporarily suppress provider; avoid repeated network calls. |
| **`ServiceUnavailableError`**| HTTP 502, 503, 504 server errors. | **15s Timed Cooldown**. | **CASCADE** | Upstream cloud capacity spike or temporary restart. |
| **`BillingExhaustionError`** | HTTP 402 Payment Required. | **Configuration Suppression** until reload/restart. | **CASCADE** | Billing card required; prevent request stalls. |
| **`AuthenticationError`** | HTTP 401, 403 Invalid API Key. | **Configuration Suppression** until reload/restart. | **CASCADE** | Bad key; suppress provider and warn. |
| **`EndpointRetiredError`** | HTTP 410 Brownout or deprecated endpoint. | **Configuration Suppression** until reload/restart. | **CASCADE** | Model retired; suppress provider and warn. |
| **`ResponseFormatError`** | Provider output fails JSON deserialization. | **Retry ONCE** with format repair prompt. | **CASCADE** if retry fails | Transient parsing glitch; bounded 1x retry. |
| **`InvalidInputError`** | Missing required query, malformed payload. | No provider penalty. | **TERMINATE REQUEST (HTTP 422)** | Client request error; cascading is useless. |
| **`SecurityBoundaryError`** | Prompt injection, jailbreak signature. | No provider penalty. | **TERMINATE REQUEST (HTTP 400)** | Malicious payload; cascading risks spreading threat. |

---

## 4. Contract Migration & Backward Compatibility Strategy

To transition CONVERA from a raw-string architecture to a typed result architecture without breaking existing routers and engines:
1. **`GatewayResult` as Primary Contract**: `generate_with_meta()` returns a typed `GatewayResult` carrying decoupled `RuntimeProvenance` and `EpistemicStatus`.
2. **`generate_response_with_fallback()` as Legacy Adapter**:
   ```python
   # [LEGACY COMPATIBILITY API - DO NOT USE FOR NEW COMPONENTS]
   async def generate_response_with_fallback(...) -> str:
       result = await generate_with_meta(...)
       return result.content
   ```
3. **Caller Migration Plan**: Existing callers continue functioning without breakage. When routers are updated in track-specific SDDs (e.g. SDD-004), they will migrate to consuming `GatewayResult` directly.
