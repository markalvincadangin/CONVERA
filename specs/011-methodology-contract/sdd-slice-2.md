# SOFTWARE DESIGN DOCUMENT (SDD) — VERTICAL SLICE 2 (REVISION 01)
## Document Identifier: SPEC-METHODOLOGY-CONTRACT-002-SDD-02-REV-01
**Title**: Methodology Contract Architecture — Vertical Slice 2: Contract-Driven Session Lifecycle & Canonical Progress Hydration  
**Classification**: Tier 2 Software Design Document (SDD Candidate)  
**Governing Standard**: CONVERA Concept Development Standard (CCDS v2.0) — *"Knowledge != Workflow"*  
**Parent Architectural Authority**: [`ADR-METHODOLOGY-CONTRACT-001-REV-01`](file:///home/markc/.gemini/antigravity-ide/brain/882f87f3-936c-4f17-a33c-850e59c66fc7/ADR-METHODOLOGY-CONTRACT-001-REV-01.md)  
**Predecessor SDD**: [`SPEC-METHODOLOGY-CONTRACT-001-SDD-01-REV-01`](file:///home/markc/.gemini/antigravity-ide/brain/882f87f3-936c-4f17-a33c-850e59c66fc7/SPEC-METHODOLOGY-CONTRACT-001-SDD-01-REV-01.md) (Vertical Slice 1 — Ratified, Implemented, Promoted to `main`)  
**Predecessor Discovery**: [`ARCH-DISCOVERY-METHODOLOGY-CONTRACT-002-REV-01`](file:///home/markc/.gemini/antigravity-ide/brain/882f87f3-936c-4f17-a33c-850e59c66fc7/ARCH-DISCOVERY-METHODOLOGY-CONTRACT-002-REV-01.md)  
**Predecessor SDD**: [`SPEC-METHODOLOGY-CONTRACT-002-SDD-02`](file:///home/markc/.gemini/antigravity-ide/brain/882f87f3-936c-4f17-a33c-850e59c66fc7/SPEC-METHODOLOGY-CONTRACT-002-SDD-02.md) (Pre-revision candidate)  
**Baseline Git Commit**: `main @ 0c90cb8`  
**Document Status**: 🟡 CANDIDATE — PENDING HUMAN LEADERSHIP REVIEW (IMPLEMENTATION NOT AUTHORIZED)  
**Working Branch**: None (Branch creation NOT authorized)  

---

## 1. GOVERNANCE MANDATE & IMPLEMENTATION NOTICE

```text
================================================================================
CRITICAL GOVERNANCE NOTICE: CANDIDATE SPECIFICATION ONLY
================================================================================
This document is a READ-ONLY Software Design Document candidate derived from the
human-accepted ADR-METHODOLOGY-CONTRACT-001-REV-01 and grounded in verified
discovery evidence ARCH-DISCOVERY-METHODOLOGY-CONTRACT-002-REV-01.

IT DOES NOT CONSTITUTE AUTHORIZATION TO WRITE CODE, CREATE BRANCHES, MODIFY
DATABASES, ALTER APIS, MUTATE WORKFLOW RUNTIMES, OR DEPLOY.

Implementation remains strictly unauthorized until Human Leadership formally
ratifies this SDD and issues explicit Human Implementation Authorization.
================================================================================
```

### Epistemic Categorization Framework
- **`[VERIFIED FACT]`**: Empirical truth directly verified in baseline commit `main @ 0c90cb8`.
- **`[ARCHITECTURAL INFERENCE]`**: Logical deduction derived from verified facts and design rules.
- **`[DESIGN DECISION]`**: Binding design choice within SDD-02 scope, contingent on human ratification.
- **`[CONTRADICTION FOUND]`**: Material error discovered during precision review of the predecessor SDD-02.
- **`[UNKNOWN]`**: Open design question deferred to future specifications.

---

## 2. PRECISION REVIEW FINDINGS — CONTRADICTIONS RESOLVED

> [!IMPORTANT]
> The following material contradictions/imprecisions were discovered during the precision review of `SPEC-METHODOLOGY-CONTRACT-002-SDD-02` and are resolved in this revision.

### FINDING-01: `get_methodology_contract()` Prefix-Matching Creates Silent Resolution

[CONTRADICTION FOUND]  
SDD-02 Section 7.1 states that when `synthesize_canonical_stage_progress()` receives an unknown `framework_id`, `get_methodology_contract()` will return `None` and the function should fall back to `INNOVATION_CONTRACT` for legacy compatibility.

**Actual behavior at baseline `0c90cb8`** ([`methodology.py:300-303`](file:///home/markc/projects/active/CONVERA/backend/contracts/methodology.py#L300-L303)):
```python
if normalized.startswith("INNOVATION"):
    return INNOVATION_CONTRACT
if normalized.startswith("RESEARCH"):
    return RESEARCH_CONTRACT
return None
```

This prefix-matching means `get_methodology_contract("INNOVATION_HYPOTHETICAL_V9")` silently resolves to `INNOVATION_CONTRACT`. Only strings that don't start with `"INNOVATION"` or `"RESEARCH"` return `None`. This contradicts the SDD-02 claim that unknown frameworks will return `None` for controlled failure.

**Resolution**: SDD-02 REV-01 adds a **prerequisite change** to `get_methodology_contract()`: remove prefix-matching and restrict resolution to exact registry lookup only. This is necessary to enforce deterministic failure for unknown methodology identities — the foundational invariant established in Slice 1.

### FINDING-02: Pydantic Default vs. HTTP 400 Semantic Contradiction

[CONTRADICTION FOUND]  
SDD-02 Section 8.1 states: "Missing/empty `framework_id` returns HTTP 400." However, SDD-02 Section 13 Q1 acknowledges that `SessionCreateRequest.framework_id: Optional[str] = "INNOVATION"` causes Pydantic to fill in `"INNOVATION"` when the field is **omitted** from the JSON body. The handler never sees a missing value.

**Actual behavior at baseline `0c90cb8`** ([`sessions.py:33`](file:///home/markc/projects/active/CONVERA/backend/routers/sessions.py#L33)):
```python
framework_id: Optional[str] = "INNOVATION"
```

**Actual frontend behavior**:
- [`sessionService.ts:34`](file:///home/markc/projects/active/CONVERA/web/src/services/sessionService.ts#L34): `frameworkId: string = "INNOVATION"` — always sends `"INNOVATION"` if not specified.
- [`frameworkService.ts:71`](file:///home/markc/projects/active/CONVERA/web/src/services/frameworkService.ts#L71): `frameworkId: string = "INNOVATION"` — always sends `"INNOVATION"`.

The frontend **always** supplies `framework_id`. The Pydantic default is a server-side safety net.

**Resolution**: Section 4 of this revision provides a complete 6-case semantic table that explicitly resolves this contradiction. The Pydantic default is **preserved** for backward compatibility.

### FINDING-03: "Byte-for-Byte Identical" is Technically Ambiguous

[CONTRADICTION FOUND]  
SDD-02 uses "byte-for-byte identical" for Python dictionary outputs. Python dictionaries have no canonical byte serialization — `json.dumps(d)` output depends on insertion order, and `repr(d)` is implementation-defined.

**Resolution**: Replaced with "structurally and semantically identical" — same keys, same values, same types, verified via deep equality (`==`).

### FINDING-04: Research 6→5 Projection is NOT Generic Positional

[CONTRADICTION FOUND]  
SDD-02 Section 7.2 proposed a generic positional `derive_legacy_phase_projection()` loop: "stages beyond index 4 must also be COMPLETED for phase5." While this happens to produce the correct output, it masks the actual semantic: **`phase5_complete` requires BOTH `stage_e_evaluation` AND `stage_f_feasibility` to be `COMPLETED`**. This is a compound terminal condition, not a generic overflow.

**Actual behavior** ([`sqlite_adapter.py:95-98`](file:///home/markc/projects/active/CONVERA/backend/storage/sqlite_adapter.py#L95-L98)):
```python
"phase5_complete": bool(
    stages.get("stage_e_evaluation", {}).get("status") == "COMPLETED"
    and stages.get("stage_f_feasibility", {}).get("status") == "COMPLETED"
),
```

**Resolution**: Section 8.2 of this revision explicitly documents the compound terminal mapping and classifies it as `LEGACY COMPATIBILITY BEHAVIOR`, not core methodology semantics.

### FINDING-05: Legacy Hydration Field Inference Not Classified

[CONTRADICTION FOUND]  
SDD-02 Section 6.2 proposed that `MethodologyContract.synthesize_stage_progress()` accept `legacy_state` containing historical field names (`phase1_response`, `phase2_scorecard`, `completed_levels`, etc.). This couples contract semantics to legacy application-layer field names.

**Resolution**: Section 7 of this revision explicitly classifies this as `LEGACY COMPATIBILITY ADAPTER BEHAVIOR` — the flag enrichment logic remains in the module-level `synthesize_canonical_stage_progress()` wrapper in `sqlite_adapter.py`, NOT in `MethodologyContract`. The contract method receives only clean boolean flags.

### FINDING-06: `stage_f_feasibility` AVAILABLE Logic Asymmetry

[VERIFIED FACT]  
At [`sqlite_adapter.py:157`](file:///home/markc/projects/active/CONVERA/backend/storage/sqlite_adapter.py#L157):
```python
"status": "COMPLETED" if p5 else ("AVAILABLE" if (p4 and not p5) else "LOCKED"),
```

Stage F becomes `AVAILABLE` when `p4` (phase4_complete) is `True` AND `p5` is `False`. But Stage E also becomes `AVAILABLE` when `p4` is `True`. This means **both E and F become AVAILABLE simultaneously** when `p4` is `True` — they are **parallel**, not sequential. This is pre-existing behavior, not introduced by Slice 2. The SDD must preserve this exact behavior.

### FINDING-07: Snapshot Creation Classification

[VERIFIED FACT]  
Snapshot creation in `switch_session_framework` ([`sqlite_adapter.py:2562-2570`](file:///home/markc/projects/active/CONVERA/backend/storage/sqlite_adapter.py#L2562-L2570)) is **existing behavior**, not new behavior introduced by Slice 2. The `try/except` makes it best-effort. SDD-02 must classify this as `EXISTING COMPATIBILITY BEHAVIOR` — not a new requirement.

---

## 3. VERTICAL SLICE 2: BOUNDARY & OBJECTIVES

### 3.1 Architectural Justification

[ARCHITECTURAL INFERENCE]  
Vertical Slice 1 parameterized workflow *transitions* through `MethodologyContract`. Workflow *initialization* (session creation, initial `stage_progress` synthesis, legacy hydration, and framework switching) remains hardcoded in [`sqlite_adapter.py`](file:///home/markc/projects/active/CONVERA/backend/storage/sqlite_adapter.py). This creates an asymmetry where the contract governs mid-lifecycle transitions but has no authority over lifecycle birth.

Slice 2 closes this loop by bringing session initialization, legacy session hydration, and framework switching under the same contract abstraction.

### 3.2 Scope Boundary

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     VERTICAL SLICE 2 SCOPE BOUNDARY                     │
├────────────────────────────────────┬────────────────────────────────────┤
│           IN SCOPE (Tier 2)        │       EXCLUDED / DEFERRED          │
├────────────────────────────────────┼────────────────────────────────────┤
│ 1. MethodologyContract methods:    │ 1. Frontend layout / PipelineStepper│
│    create_initial_stage_progress() │ 2. /api/methodologies endpoint     │
│    synthesize_stage_progress()     │ 3. framework_engine.py retirement  │
│ 2. sqlite_adapter.py delegation   │ 4. Gate criteria/rubric engine     │
│    of stage_progress synthesis     │ 5. Database schema alterations     │
│    to resolved MethodologyContract │ 6. Dynamic UI / Form generation    │
│ 3. derive_legacy_phase_projection  │ 7. Non-linear workflow topology    │
│    contract-driven parameterization│ 8. Workspace component registry   │
│ 4. Session router validation       │ 9. Epistemic/AI/LLM changes       │
│    (HTTP 400 on invalid framework) │ 10. Deployment                     │
│ 5. Framework switching progress    │ 11. Third methodology impl.        │
│    isolation bug fix               │ 12. Plugin runtime / sandboxing    │
│ 6. get_methodology_contract()      │                                    │
│    prefix-matching removal         │                                    │
│ 7. Comprehensive test suite        │                                    │
└────────────────────────────────────┴────────────────────────────────────┘
```

### 3.3 Core Objectives

1. **Delegate Stage Progress Synthesis to Contract**: Replace hardcoded stage dictionaries in `synthesize_canonical_stage_progress()` with method calls on `MethodologyContract`.
2. **Parameterize Legacy Phase Projection**: Replace hardcoded stage name references in `derive_legacy_phase_projection()` with contract-driven mapping.
3. **Enforce Strict Session Creation Validation**: Reject empty, null, or unknown `framework_id` at the API boundary with HTTP 400.
4. **Fix Framework Switching Progress Isolation**: Store and restore full `stage_progress` in `framework_progress`.
5. **Remove Prefix-Matching from `get_methodology_contract()`**: Enforce exact registry lookup only.
6. **Behavioral Parity**: Preserve exact `stage_progress` output structure for Innovation and Research.
7. **Zero Consumer Impact**: Zero changes to frontend components, HTTP API response schemas, or SQLite database tables.

---

## 4. FRAMEWORK IDENTITY VALIDATION SEMANTIC TABLE

[DESIGN DECISION]  
The following table defines the **complete, exhaustive** behavior for `framework_id` across all entry points:

### 4.1 API Boundary: `POST /api/sessions` (Router Validation)

| Case | Input | Pydantic Processing | Handler Behavior | Result |
| :--- | :--- | :--- | :--- | :--- |
| **1. Field omitted** | `{"project_name": "X"}` | Pydantic fills `framework_id = "INNOVATION"` | Valid — resolves to `INNOVATION_CONTRACT` | ✅ 200, Innovation session created |
| **2. Explicit null** | `{"framework_id": null}` | Pydantic sets `framework_id = None` | `(req.framework_id or "").strip().upper()` → empty → **reject** | ❌ HTTP 400: "framework_id is required" |
| **3. Empty string** | `{"framework_id": ""}` | Pydantic sets `framework_id = ""` | `.strip().upper()` → empty → **reject** | ❌ HTTP 400: "framework_id is required" |
| **4. Whitespace** | `{"framework_id": "  "}` | Pydantic sets `framework_id = "  "` | `.strip().upper()` → empty → **reject** | ❌ HTTP 400: "framework_id is required" |
| **5. Valid known** | `{"framework_id": "RESEARCH"}` | Pydantic sets `framework_id = "RESEARCH"` | `get_methodology_contract("RESEARCH")` → `RESEARCH_CONTRACT` | ✅ 200, Research session created |
| **6. Unknown** | `{"framework_id": "HYPOTHETICAL_V9"}` | Pydantic sets `framework_id = "HYPOTHETICAL_V9"` | `get_methodology_contract(...)` → `None` → **reject** | ❌ HTTP 400: "Unknown framework" |

### 4.2 Persistence Boundary: `save_session()` (Storage Layer)

| Case | Input | Behavior | Invariant |
| :--- | :--- | :--- | :--- |
| **A. `framework_id` present and resolvable** | `merged_state["framework_id"] = "INNOVATION"` | Resolve contract; delegate synthesis | Normal path |
| **B. `framework_id` absent from `state_data`** | Internal caller omits `framework_id` | **Legacy compatibility characterization**: default to `"INNOVATION"` | `INV-METHODOLOGY-005` |
| **C. `framework_id` present but unknown** | `merged_state["framework_id"] = "HYPOTHETICAL"` | `get_methodology_contract()` returns `None` → **raise `ValueError`** | `INV-METHODOLOGY-001` |

### 4.3 Read Boundary: `get_session()` (Hydration Layer)

| Case | Session State | Behavior | Invariant |
| :--- | :--- | :--- | :--- |
| **CASE A: Migrated** | `stage_progress` present, `framework_id` present and resolvable | Read-only hydration; canonical `stage_progress` authoritative | `INV-METHODOLOGY-006` |
| **CASE A-ERR: Migrated + corrupt** | `stage_progress` present, `framework_id` unknown | **Raise `WorkflowStateCorruptedError`** | `INV-METHODOLOGY-001` |
| **CASE B: Legacy** | `stage_progress` absent, `framework_id` present and resolvable | Lazy migration via contract | `INV-METHODOLOGY-003` |
| **CASE B-COMPAT: Legacy + no identity** | `stage_progress` absent, `framework_id` absent | **Legacy compatibility characterization**: resolve to `INNOVATION` v3.0.0 | `INV-METHODOLOGY-005` |
| **CASE B-ERR: Legacy + explicit unknown** | `stage_progress` absent, `framework_id` = explicit unknown string | **Raise `WorkflowStateCorruptedError`** | `INV-METHODOLOGY-001` |

### 4.4 Critical Distinction: Historical Absence vs. Explicit Unknown

[DESIGN DECISION]  
```text
A. HISTORICAL ABSENCE (no framework_id key in state_data):
   → Legacy session predating methodology contract.
   → Deterministic compatibility resolution to INNOVATION v3.0.0.
   → Governed by INV-METHODOLOGY-005 (Historical Immutability).
   → Applied ONLY in save_session() and get_session() CASE B-COMPAT.

B. EXPLICIT UNKNOWN (framework_id key present, value unresolvable):
   → Data corruption or invalid client input.
   → Deterministic controlled failure (ValueError or WorkflowStateCorruptedError).
   → Applied at ALL boundaries.

C. MIGRATED SESSION WITH INVALID IDENTITY (stage_progress present, framework_id unresolvable):
   → Data corruption of previously migrated session.
   → Raise WorkflowStateCorruptedError.
   → NEVER silently resolve to INNOVATION.
```

---

## 5. INVARIANT PRESERVATION ANALYSIS

| Invariant | ID | Status | Evidence |
| :--- | :--- | :--- | :--- |
| **Primitive Agnosticism** | `INV-METHODOLOGY-001` | 🟢 **PRESERVED & ENHANCED** | Removes 150+ lines of hardcoded stage names from `sqlite_adapter.py`. Removes prefix-matching from `get_methodology_contract()`. |
| **Epistemic Superiority** | `INV-METHODOLOGY-002` | 🟢 **PRESERVED** | Zero changes to claims, evidence, confidence scoring, gate criteria rubrics, or LLM governance. Gate criteria deferred to Slice 4. |
| **Governed Workflow Transitions** | `INV-METHODOLOGY-003` | 🟢 **PRESERVED** | New sessions initialize at stage 0 (`IN_PROGRESS`), subsequent stages `LOCKED`. Monotonic progression guaranteed. |
| **Craftsmanship Preservation** | `INV-METHODOLOGY-004` | 🟢 **PRESERVED** | Zero changes to presentation layer, PipelineStepper, or workspace components. |
| **Historical Immutability** | `INV-METHODOLOGY-005` | 🟢 **PRESERVED** | Legacy sessions without `framework_id` deterministically resolve to `INNOVATION` v3.0.0 via explicit compatibility characterization. No destructive mutations on read. |
| **Authoritative Persistence Boundary** | `INV-METHODOLOGY-006` | 🟢 **PRESERVED** | `save_session()` remains sole writer. Contract provides only in-memory blueprint. No reverse synchronization from legacy flags after migration. |

---

## 6. FILE MANIFEST

| File | Action | Blast Radius | Purpose |
| :--- | :--- | :--- | :--- |
| [`backend/contracts/methodology.py`](file:///home/markc/projects/active/CONVERA/backend/contracts/methodology.py) | **MODIFY** | Low | Add `create_initial_stage_progress()` and `synthesize_stage_progress()` methods; remove prefix-matching from `get_methodology_contract()` |
| [`backend/storage/sqlite_adapter.py`](file:///home/markc/projects/active/CONVERA/backend/storage/sqlite_adapter.py) | **MODIFY** | Medium | Delegate stage synthesis to contract; parameterize legacy projection; fix framework switching |
| [`backend/routers/sessions.py`](file:///home/markc/projects/active/CONVERA/backend/routers/sessions.py) | **MODIFY** | Low | Add framework_id validation on session creation |
| `backend/tests/test_session_lifecycle_contracts.py` | **NEW** | None | Dedicated contract-driven lifecycle test suite |

No other files modified. Zero SQLite schema changes. Zero frontend changes. Zero API response schema changes.

---

## 7. CHANGE SPECIFICATION: `backend/contracts/methodology.py`

### 7.1 Prerequisite: Remove Prefix-Matching from `get_methodology_contract()`

[DESIGN DECISION]  
Remove lines 300-303 from [`get_methodology_contract()`](file:///home/markc/projects/active/CONVERA/backend/contracts/methodology.py#L285-L304):

**Current behavior** (baseline `0c90cb8`):
```python
if normalized in METHODOLOGY_REGISTRY:
    return METHODOLOGY_REGISTRY[normalized]
if normalized.startswith("INNOVATION"):    # ← REMOVE
    return INNOVATION_CONTRACT              # ← REMOVE
if normalized.startswith("RESEARCH"):      # ← REMOVE
    return RESEARCH_CONTRACT                # ← REMOVE
return None
```

**Required behavior** (SDD-02 REV-01):
```python
if normalized in METHODOLOGY_REGISTRY:
    return METHODOLOGY_REGISTRY[normalized]
return None
```

**Rationale**: Prefix-matching silently resolves unknown framework identities (e.g., `"INNOVATION_HYPOTHETICAL_V9"` → `INNOVATION_CONTRACT`), which directly contradicts the Slice 1 invariant of "no silent fallback." The `METHODOLOGY_REGISTRY` already maps `"INNOVATION"`, `"INNOVATION_RATCHET"`, and `"RESEARCH"` to the correct contracts. Any framework identity not in the registry must return `None` for caller-enforced deterministic failure.

**Backward Compatibility**: The registry key `"INNOVATION_RATCHET"` already covers the only known variant. All existing test callers pass exact registry keys.

### 7.2 New Method: `MethodologyContract.create_initial_stage_progress()`

[DESIGN DECISION]  
Add a pure, deterministic method to `MethodologyContract`:

```python
def create_initial_stage_progress(self) -> Dict[str, Any]:
    """
    Generate canonical initial stage_progress for a new session.
    Pure function: zero I/O, zero side effects.
    
    Rules:
    - Stage 0 in stage_sequence begins as IN_PROGRESS.
    - All subsequent stages begin as LOCKED.
    - gate_id is resolved from self.gate_map.
    - gate_status initialized to NOT_REQUIRED.
    - Terminal "studio" is excluded from the stages dict.
    """
```

**Implementation Specification:**

1. Iterate `self.stage_sequence`, excluding `"studio"`.
2. For each stage at index `i`:
   - `status`: `"IN_PROGRESS"` if `i == 0`, else `"LOCKED"`.
   - `gate_id`: `self.gate_map.get(stage_id)` (returns `None` for ungated stages).
   - `gate_status`: `"NOT_REQUIRED"`.
3. Return `{"schema_version": 1, "framework_id": self.id, "current_stage_id": self.stage_sequence[0], "stages": {...}}`.

**Equivalence Requirement:**  
The output must be **structurally and semantically identical** (deep equality via `==`) to the current output of `synthesize_canonical_stage_progress()` when called with all-`False` legacy flags, for both Innovation and Research.

Expected output for **INNOVATION** (fresh session):
```json
{
  "schema_version": 1,
  "framework_id": "INNOVATION",
  "current_stage_id": "p1_discovery",
  "stages": {
    "p1_discovery": { "status": "IN_PROGRESS", "gate_id": null, "gate_status": "NOT_REQUIRED" },
    "p2_screening": { "status": "LOCKED", "gate_id": "GATE_1", "gate_status": "NOT_REQUIRED" },
    "p3_mom_test": { "status": "LOCKED", "gate_id": "GATE_2", "gate_status": "NOT_REQUIRED" },
    "p4_mechanism": { "status": "LOCKED", "gate_id": null, "gate_status": "NOT_REQUIRED" },
    "p5_economics": { "status": "LOCKED", "gate_id": "GATE_3", "gate_status": "NOT_REQUIRED" }
  }
}
```

Expected output for **RESEARCH** (fresh session):
```json
{
  "schema_version": 1,
  "framework_id": "RESEARCH",
  "current_stage_id": "stage_a_scouting",
  "stages": {
    "stage_a_scouting": { "status": "IN_PROGRESS", "gate_id": null, "gate_status": "NOT_REQUIRED" },
    "stage_b_validation": { "status": "LOCKED", "gate_id": "GATE_1", "gate_status": "NOT_REQUIRED" },
    "stage_c_opportunity": { "status": "LOCKED", "gate_id": "GATE_2", "gate_status": "NOT_REQUIRED" },
    "stage_d_formulation": { "status": "LOCKED", "gate_id": null, "gate_status": "NOT_REQUIRED" },
    "stage_e_evaluation": { "status": "LOCKED", "gate_id": "GATE_3", "gate_status": "NOT_REQUIRED" },
    "stage_f_feasibility": { "status": "LOCKED", "gate_id": "GATE_4", "gate_status": "NOT_REQUIRED" }
  }
}
```

### 7.3 New Method: `MethodologyContract.synthesize_stage_progress()`

[DESIGN DECISION]  
Add a pure method that reconstructs canonical `stage_progress` from **clean boolean completion flags** (NOT raw legacy field names):

```python
def synthesize_stage_progress(self, completion_flags: List[bool]) -> Dict[str, Any]:
    """
    Synthesize canonical stage_progress from an ordered list of completion booleans.
    Pure function: zero I/O, zero side effects.
    
    RESPONSIBILITY BOUNDARY (LEGACY COMPATIBILITY ADAPTER BEHAVIOR):
    This method receives CLEAN, pre-processed boolean flags.
    The caller (synthesize_canonical_stage_progress in sqlite_adapter.py) is
    responsible for inferring completion from historical field names
    (phase1_response, phase2_scorecard, completed_levels, etc.).
    This method does NOT understand legacy application field names.
    
    Args:
        completion_flags: Ordered booleans [stage_0_complete, stage_1_complete, ...]
                          Length must equal len(stage_sequence) - 1 (excluding studio).
                          For Research (6 stages), both E and F use the same p5 flag.
    """
```

**Key Design Constraint — Responsibility Separation:**

The `MethodologyContract` **MUST NOT** directly understand historical field names such as `phase1_response`, `phase2_scorecard`, `completed_levels`, `phase4_concepts`, or `phase5_metrics`. These are legacy application-layer field names that belong to the **LEGACY COMPATIBILITY ADAPTER** layer — specifically, the module-level `synthesize_canonical_stage_progress()` function in `sqlite_adapter.py`.

**Classification**: The flag enrichment logic (lines 123-127 of baseline `sqlite_adapter.py`) is explicitly classified as:

> **`LEGACY COMPATIBILITY ADAPTER BEHAVIOR`** — not core methodology semantics.

The contract receives clean booleans; the adapter performs historical inference.

---

## 8. CHANGE SPECIFICATION: `backend/storage/sqlite_adapter.py`

### 8.1 `synthesize_canonical_stage_progress()` — Refactored to Delegate

[DESIGN DECISION]  
The module-level function retains its existing signature and **all** legacy field inference logic. It delegates only the stage dictionary construction to the contract:

```python
def synthesize_canonical_stage_progress(
    framework_id: str,
    legacy_state: Dict[str, Any],
    row_flags: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    LEGACY COMPATIBILITY ADAPTER BEHAVIOR:
    Deterministically synthesizes canonical stage_progress from legacy session flags.
    
    This function performs two responsibilities:
    1. LEGACY INFERENCE (adapter behavior): Extracts completion booleans from
       historical field names (phase1_response, completed_levels, etc.)
    2. CONTRACT DELEGATION (methodology behavior): Delegates stage dictionary
       construction to MethodologyContract.synthesize_stage_progress().
    """
    from contracts.methodology import get_methodology_contract, INNOVATION_CONTRACT
    
    fw = str(framework_id or legacy_state.get("framework_id") or "").upper()
    
    # LEGACY COMPATIBILITY ADAPTER BEHAVIOR: Historical field inference
    # This logic is NOT part of core methodology semantics.
    flags = dict(row_flags or {})
    p1 = bool(legacy_state.get("phase1_complete") or flags.get("phase1_complete")
              or legacy_state.get("phase1_response"))
    p2 = bool(legacy_state.get("phase2_complete") or flags.get("phase2_complete")
              or legacy_state.get("phase2_response") or legacy_state.get("phase2_scorecard"))
    p3 = bool(legacy_state.get("phase3_complete") or flags.get("phase3_complete")
              or (legacy_state.get("completed_levels")
                  and len(legacy_state.get("completed_levels", [])) >= 6))
    p4 = bool(legacy_state.get("phase4_complete") or flags.get("phase4_complete")
              or legacy_state.get("phase4_response") or legacy_state.get("phase4_concepts"))
    p5 = bool(legacy_state.get("phase5_complete") or flags.get("phase5_complete")
              or legacy_state.get("phase5_response") or legacy_state.get("phase5_metrics"))
    
    # CONTRACT RESOLUTION
    contract = get_methodology_contract(fw)
    if contract is None:
        if not fw:
            # HISTORICAL ABSENCE: No framework_id in legacy state (INV-METHODOLOGY-005)
            contract = INNOVATION_CONTRACT
        else:
            # EXPLICIT UNKNOWN: framework_id is present but unresolvable
            raise ValueError(
                f"Cannot synthesize stage_progress: unknown framework '{fw}'"
            )
    
    # METHODOLOGY DELEGATION: Clean flags → contract
    completion_flags = [p1, p2, p3, p4, p5]
    return contract.synthesize_stage_progress(completion_flags)
```

**Key changes from baseline:**
1. Flag enrichment logic preserved **exactly** (lines 123-127 baseline behavior).
2. Contract resolution replaces hardcoded `if is_research:` / `else:` branching.
3. **HISTORICAL ABSENCE** (empty/missing `framework_id`) → `INNOVATION_CONTRACT` for `INV-METHODOLOGY-005`.
4. **EXPLICIT UNKNOWN** (non-empty unresolvable `framework_id`) → `ValueError`.

### 8.2 `derive_legacy_phase_projection()` — Contract-Driven with Explicit Research Compound Mapping

[DESIGN DECISION]  
Replace hardcoded stage names with contract-driven mapping, but explicitly preserve the Research compound terminal condition:

```python
def derive_legacy_phase_projection(framework_id: str, stage_progress: dict) -> Dict[str, bool]:
    """
    LEGACY COMPATIBILITY BEHAVIOR:
    Pure projection from canonical stage_progress to legacy boolean columns.
    Single-writer: Called ONLY during persistence.
    
    Legacy phase flags are COMPATIBILITY PROJECTIONS and are NOT authoritative
    workflow state. The canonical authority is stage_progress.
    """
    from contracts.methodology import get_methodology_contract
    
    stages = stage_progress.get("stages", {}) if isinstance(stage_progress, dict) else {}
    fw = str(framework_id or "").upper()
    contract = get_methodology_contract(fw)
    
    if contract is None:
        return {f"phase{i}_complete": False for i in range(1, 6)}
    
    # Non-terminal stages (excluding "studio" sentinel)
    non_terminal = [s for s in contract.stage_sequence if s != "studio"]
    
    # INNOVATION (5 stages → 5 flags): Direct 1:1 positional mapping
    if len(non_terminal) <= 5:
        projection = {}
        for i in range(5):
            if i < len(non_terminal):
                stage_id = non_terminal[i]
                projection[f"phase{i+1}_complete"] = bool(
                    stages.get(stage_id, {}).get("status") == "COMPLETED"
                )
            else:
                projection[f"phase{i+1}_complete"] = False
        return projection
    
    # RESEARCH (6 stages → 5 flags): Explicit compound terminal mapping
    # Stages A-D map 1:1 to phases 1-4.
    # Phase 5 = (stage_e_evaluation COMPLETED) AND (stage_f_feasibility COMPLETED).
    # This is a COMPOUND TERMINAL CONDITION, not a generic positional overflow.
    projection = {}
    for i in range(4):  # Stages 0-3 → phases 1-4
        stage_id = non_terminal[i]
        projection[f"phase{i+1}_complete"] = bool(
            stages.get(stage_id, {}).get("status") == "COMPLETED"
        )
    projection["phase5_complete"] = all(
        stages.get(non_terminal[j], {}).get("status") == "COMPLETED"
        for j in range(4, len(non_terminal))
    )
    return projection
```

**Explicit Research 6→5 Mapping:**

```text
CANONICAL (stage_progress)              LEGACY (SQLite boolean columns)
─────────────────────────────           ─────────────────────────────────
stage_a_scouting.COMPLETED         →    phase1_complete = True
stage_b_validation.COMPLETED       →    phase2_complete = True
stage_c_opportunity.COMPLETED      →    phase3_complete = True
stage_d_formulation.COMPLETED      →    phase4_complete = True
stage_e_evaluation.COMPLETED       ┐
  AND                              ├→   phase5_complete = True
stage_f_feasibility.COMPLETED      ┘

Legacy phase flags are COMPATIBILITY PROJECTIONS.
They are NOT authoritative workflow state.
The canonical authority is stage_progress.
```

### 8.3 `save_session()` — Framework Identity Resolution

[DESIGN DECISION]  
Line 1209 in baseline:
```python
fw = merged_state.get("framework_id") or "INNOVATION"
```

**Required behavior** (SDD-02 REV-01):
```python
fw = merged_state.get("framework_id") or ""
contract = get_methodology_contract(fw)
if contract is None:
    if not fw:
        # HISTORICAL ABSENCE: legacy internal caller without framework_id
        # Compatibility characterization (INV-METHODOLOGY-005)
        from contracts.methodology import INNOVATION_CONTRACT
        contract = INNOVATION_CONTRACT
        fw = "INNOVATION"
        merged_state["framework_id"] = fw
    else:
        raise ValueError(
            f"Cannot save session {session_id}: unknown framework '{fw}'"
        )
```

**Distinction:**
- **Empty/absent `framework_id`**: Legacy compatibility → `INNOVATION` (`INV-METHODOLOGY-005`).
- **Non-empty unresolvable `framework_id`**: Deterministic `ValueError` → no silent resolution.

### 8.4 `get_session()` — CASE A Strict Validation

[DESIGN DECISION]  
In CASE A (migrated session) at line 1142:

**Current behavior** (baseline):
```python
fw = state.get("framework_id") or state["stage_progress"].get("framework_id") or "INNOVATION"
```

**Required behavior** (SDD-02 REV-01):
```python
fw = state.get("framework_id") or state["stage_progress"].get("framework_id") or ""
if fw:
    contract = get_methodology_contract(fw)
    if contract is None:
        raise WorkflowStateCorruptedError(
            f"Session {session_id} references unknown framework '{fw}' — cannot hydrate."
        )
else:
    # HISTORICAL ABSENCE: Migrated session without framework_id
    # (Should not occur — migration always sets framework_id — but handle defensively)
    fw = "INNOVATION"
```

### 8.5 `switch_session_framework()` — Full Progress Isolation

[DESIGN DECISION]  
Update to store and restore full `stage_progress` in `framework_progress`.

**Behavioral changes from baseline:**
1. **Target framework validation**: Unknown frameworks raise `ValueError`.
2. **Full progress isolation**: `framework_progress[old]` includes `stage_progress` alongside legacy flags.
3. **Restore-or-initialize**: Returning to a previously visited framework restores saved `stage_progress`; switching to a never-visited framework generates fresh progress via `contract.create_initial_stage_progress()`.
4. **`stage_progress` synchronization**: `session_data["stage_progress"]` is explicitly set to the target framework's progress before `save_session()`.
5. **Backward compatibility with old `framework_progress` format**: If `saved_target` exists but lacks `stage_progress` key (old format with only legacy flags), treat as first visit → initialize fresh.

**Snapshot creation classification**: `EXISTING COMPATIBILITY BEHAVIOR` — the `try/except` best-effort snapshot is retained unchanged from baseline. It is not a new SDD-02 requirement.

**Cross-methodology isolation guarantees** (per `TRACK_INTEROPERABILITY.md`):
- Current methodology progress is preserved in `framework_progress[old]`.
- Target methodology progress is restored if previously visited, otherwise initialized fresh.
- No progress is merged across methodologies.
- No epistemic state is reinterpreted.
- No stage is translated from one methodology into another.
- Target methodology must resolve to a registered contract.
- Unknown target methodology fails deterministically (`ValueError`).

---

## 9. CHANGE SPECIFICATION: `backend/routers/sessions.py`

### 9.1 Session Creation Validation

[DESIGN DECISION]  
Add framework_id validation in [`create_session()`](file:///home/markc/projects/active/CONVERA/backend/routers/sessions.py#L102-L130):

```python
@router.post("/api/sessions")
async def create_session(req: SessionCreateRequest):
    """Create a new session with initial state."""
    from contracts.methodology import get_methodology_contract
    
    # ... existing session_id, project_name, project_id logic ...
    
    # SDD-02: Strict framework validation — no silent defaulting
    framework_id = (req.framework_id or "").strip().upper()
    if not framework_id:
        raise HTTPException(
            status_code=400,
            detail="framework_id is required and cannot be empty."
        )
    
    contract = get_methodology_contract(framework_id)
    if contract is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown framework '{req.framework_id}': no methodology contract registered."
        )
    
    initial_state = {
        # ... existing fields ...
        "framework_id": contract.id,  # Use canonical contract ID
        # ...
    }
    
    storage.save_session(session_id, initial_state)
    return initial_state
```

### 9.2 Pydantic Default Behavior — Preserved

[DESIGN DECISION]  
`SessionCreateRequest.framework_id: Optional[str] = "INNOVATION"` is **preserved**.

**Justification**:
- [VERIFIED FACT] Both frontend callers ([`sessionService.ts:34`](file:///home/markc/projects/active/CONVERA/web/src/services/sessionService.ts#L34), [`frameworkService.ts:71`](file:///home/markc/projects/active/CONVERA/web/src/services/frameworkService.ts#L71)) always send `framework_id`.
- The Pydantic default is a server-side safety net for API clients that omit the field.
- When `framework_id` is omitted from JSON, Pydantic fills `"INNOVATION"` → handler sees `"INNOVATION"` → resolves to `INNOVATION_CONTRACT` → HTTP 200. This is **expected backward-compatible behavior**.
- Only **explicit** `null`, `""`, or unknown values trigger HTTP 400.

### 9.3 Framework Switching Router — Dual Validation

[DESIGN DECISION]  
The existing router validation via `get_framework()` (from `framework_engine.py`) at [`sessions.py:187-189`](file:///home/markc/projects/active/CONVERA/backend/routers/sessions.py#L187-L189) is **preserved unchanged**.

The new contract validation in `sqlite_adapter.py:switch_session_framework()` provides a belt-and-suspenders check at the persistence boundary. The router-level `get_framework()` dependency is deferred to Slice 3 when `framework_engine.py` retirement begins.

---

## 10. TEST SPECIFICATION: `backend/tests/test_session_lifecycle_contracts.py`

### 10.1 Contract Method Tests

| Test ID | Description | Assertion |
| :--- | :--- | :--- |
| `test_innovation_create_initial_stage_progress` | `INNOVATION_CONTRACT.create_initial_stage_progress()` | Output structurally identical to expected Innovation JSON |
| `test_research_create_initial_stage_progress` | `RESEARCH_CONTRACT.create_initial_stage_progress()` | Output structurally identical to expected Research JSON |
| `test_innovation_synthesize_all_false` | `INNOVATION_CONTRACT.synthesize_stage_progress([F,F,F,F,F])` | Equals `create_initial_stage_progress()` |
| `test_research_synthesize_all_false` | `RESEARCH_CONTRACT.synthesize_stage_progress([F,F,F,F,F])` | Equals `create_initial_stage_progress()` |
| `test_innovation_synthesize_partial` | `INNOVATION_CONTRACT.synthesize_stage_progress([T,T,F,F,F])` | p1/p2=COMPLETED, p3=IN_PROGRESS, p4/p5=LOCKED |
| `test_research_synthesize_partial` | `RESEARCH_CONTRACT.synthesize_stage_progress([T,T,F,F,F])` | A/B=COMPLETED, C=IN_PROGRESS, D/E/F=LOCKED |
| `test_innovation_synthesize_all_complete` | `INNOVATION_CONTRACT.synthesize_stage_progress([T,T,T,T,T])` | All COMPLETED, current="studio" |
| `test_research_synthesize_all_complete` | `RESEARCH_CONTRACT.synthesize_stage_progress([T,T,T,T,T])` | All COMPLETED, current="studio" |

### 10.2 Legacy Projection Parity Tests

| Test ID | Description | Assertion |
| :--- | :--- | :--- |
| `test_legacy_projection_innovation_fresh` | Fresh Innovation progress | All 5 flags `False` |
| `test_legacy_projection_research_fresh` | Fresh Research progress | All 5 flags `False` |
| `test_legacy_projection_research_compound_terminal` | Research E+F both COMPLETED | `phase5_complete = True` |
| `test_legacy_projection_research_e_only` | Research E COMPLETED, F not | `phase5_complete = False` |
| `test_legacy_projection_unknown_framework` | Unknown framework | All 5 flags `False` |

### 10.3 Contract Resolution Tests

| Test ID | Description | Assertion |
| :--- | :--- | :--- |
| `test_registry_exact_innovation` | `get_methodology_contract("INNOVATION")` | Returns `INNOVATION_CONTRACT` |
| `test_registry_exact_research` | `get_methodology_contract("RESEARCH")` | Returns `RESEARCH_CONTRACT` |
| `test_registry_ratchet` | `get_methodology_contract("INNOVATION_RATCHET")` | Returns `INNOVATION_CONTRACT` |
| `test_registry_unknown_returns_none` | `get_methodology_contract("HYPOTHETICAL")` | Returns `None` |
| `test_registry_prefix_no_longer_resolves` | `get_methodology_contract("INNOVATION_V9")` | Returns `None` |
| `test_registry_none_returns_none` | `get_methodology_contract(None)` | Returns `None` |
| `test_registry_empty_returns_none` | `get_methodology_contract("")` | Returns `None` |

### 10.4 Session Creation Validation Tests

| Test ID | Description | Assertion |
| :--- | :--- | :--- |
| `test_create_session_valid_innovation` | `POST /api/sessions` with `"INNOVATION"` | 200 |
| `test_create_session_valid_research` | `POST /api/sessions` with `"RESEARCH"` | 200 |
| `test_create_session_null_framework` | `{"framework_id": null}` | HTTP 400 |
| `test_create_session_empty_framework` | `{"framework_id": ""}` | HTTP 400 |
| `test_create_session_unknown_framework` | `{"framework_id": "HYPOTHETICAL"}` | HTTP 400 |
| `test_create_session_default_omitted` | No `framework_id` field | 200, defaults to Innovation |

### 10.5 Framework Switching Tests

| Test ID | Description | Assertion |
| :--- | :--- | :--- |
| `test_switch_innovation_to_research` | Switch → Research progress initialized | Innovation progress in `framework_progress` |
| `test_switch_research_to_innovation` | Switch → Innovation progress initialized | Research progress in `framework_progress` |
| `test_switch_roundtrip` | Inn → Res → Inn | Innovation progress restored, not reinitialized |
| `test_switch_same_noop` | Inn → Inn | Returns unchanged |
| `test_switch_unknown_raises` | Switch to "HYPOTHETICAL" | Raises `ValueError` |
| `test_switch_stage_progress_sync` | After switch | `stage_progress.framework_id == session.framework_id` |
| `test_switch_old_format_compat` | `framework_progress[X]` has only legacy flags (no `stage_progress`) | Treats as first visit, initializes fresh |

### 10.6 Backward Compatibility & Regression Tests

| Test ID | Description | Assertion |
| :--- | :--- | :--- |
| `test_save_without_framework` | `save_session("id", {"project_name": "X"})` | Synthesizes Innovation progress |
| `test_save_explicit_unknown_raises` | `save_session("id", {"framework_id": "HYPOTHETICAL"})` | Raises `ValueError` |
| `test_get_legacy_hydration` | Session with no `stage_progress` | Lazy migration produces correct output |
| `test_get_corrupted_migrated` | Session with `stage_progress` + unknown `framework_id` | Raises `WorkflowStateCorruptedError` |

---

## 11. IMPLEMENTATION SEQUENCING

```text
Step 1: Remove prefix-matching from get_methodology_contract()
        ↓ Run existing test_methodology_contracts.py + test_workflow_transition_service_contracts.py
Step 2: Add create_initial_stage_progress() to MethodologyContract
        ↓ Unit test in isolation
Step 3: Add synthesize_stage_progress() to MethodologyContract
        ↓ Unit test parity with existing synthesize_canonical_stage_progress()
Step 4: Refactor derive_legacy_phase_projection() to use contract
        ↓ Run test_workflow_safety_matrix.py for projection parity
Step 5: Refactor synthesize_canonical_stage_progress() to delegate to contract
        ↓ Run full backend regression (187+ tests)
Step 6: Add save_session() strict unknown-framework failure
        ↓ Run full backend regression
Step 7: Add get_session() CASE A strict validation
        ↓ Run full backend regression
Step 8: Update switch_session_framework() with full progress isolation
        ↓ Run framework switching tests
Step 9: Add session creation validation to routers/sessions.py
        ↓ Run session validation tests
Step 10: Run full regression + new lifecycle test suite
Step 11: Run frontend typecheck + production build
```

---

## 12. RISK ANALYSIS

| Risk | Severity | Likelihood | Mitigation |
| :--- | :--- | :--- | :--- |
| Prefix-matching removal breaks unknown callers | Medium | Low | Only registry keys used in tests and production. `INNOVATION_RATCHET` already in registry. |
| Existing tests break when `save_session` rejects unknown framework | Medium | Low | Legacy compatibility characterization preserves empty-to-Innovation default. Only non-empty unknowns rejected. |
| Research legacy projection drift | Medium | Low | Explicit compound terminal test: `test_legacy_projection_research_compound_terminal` |
| Framework switching old `framework_progress` format | Low | Low | `test_switch_old_format_compat` verifies graceful handling of pre-Slice 2 format |

---

## 13. EXPLICITLY DEFERRED WORK

| Deferred Item | Target Slice | Rationale |
| :--- | :--- | :--- |
| Frontend PipelineStepper & View Routing | Slice 3 | Requires stable methodology metadata endpoint |
| `/api/methodologies` read-only endpoint | Slice 3 | Frontend parameterization prerequisite |
| `framework_engine.py` retirement | Slice 3 | Requires frontend migration |
| Gate Criteria & Rubric Engine | Slice 4 | Threatens `INV-METHODOLOGY-002` |
| Database Schema Alterations | Out of scope | 23 SQLite WAL tables remain stable |
| Non-Linear Workflow Topologies | Out of scope | Neither methodology requires |
| Future 3rd methodology | Out of scope | Working hypothesis: map first 5 stages or all-False legacy flags |

---

## 14. SPEC KIT INTEGRATION AUDIT

### 14.1 Findings

[VERIFIED FACT]  
Spec Kit is **installed and configured** in the repository:
- **Directory**: [`.specify/`](file:///home/markc/projects/active/CONVERA/.specify/)
- **Manifest**: [`.specify/integrations/speckit.manifest.json`](file:///home/markc/projects/active/CONVERA/.specify/integrations/speckit.manifest.json) — version `1.0.1`, installed 2026-09-04.
- **Constitution**: [`.specify/memory/constitution.md`](file:///home/markc/projects/active/CONVERA/.specify/memory/constitution.md) — operational projection of `docs/00-foundation/CONSTITUTION.md`.
- **Templates**: `spec-template.md`, `plan-template.md`, `tasks-template.md`, `checklist-template.md`, `constitution-template.md`.
- **Skills**: 10 Spec Kit skills installed under `.agents/skills/speckit-*`.

### 14.2 Existing Spec Kit Artifacts

Spec Kit artifacts (spec.md, plan.md, tasks.md) exist for specs 001-009. Spec 010 has only `spec.md`. **Spec 011 (methodology-contract) has NO Spec Kit artifacts** — only `sdd-slice-1.md` and `audit-trail.md`.

### 14.3 Governance Hierarchy Determination

[DESIGN DECISION]  
The following hierarchy is established for methodology contract work:

```text
CONVERA CONSTITUTION (docs/00-foundation/CONSTITUTION.md)
    ↓ governs
RATIFIED ARCHITECTURAL DECISION (ADR-METHODOLOGY-CONTRACT-001-REV-01)
    ↓ governs
RATIFIED SDD (SPEC-METHODOLOGY-CONTRACT-002-SDD-02-REV-01)
    ↓ governs
SPEC KIT WORKFLOW ARTIFACTS (if used for implementation)
    ↓ governs
IMPLEMENTATION CODE
    ↓ verified by
VERIFICATION (pytest, typecheck, build)
    ↓ accepted by
HUMAN ACCEPTANCE
    ↓ integrated via
MERGE / PROMOTION
```

### 14.4 Should Spec Kit Be Used for SDD-02?

[ARCHITECTURAL INFERENCE]  
Spec Kit may optionally be used as an **implementation workflow tool beneath the ratified SDD**, but:

1. **Spec Kit's `specify` → `plan` → `tasks` workflow does NOT replace the CONVERA SDD**. The SDD is the authoritative design document.
2. If Spec Kit is used, its `spec.md` would be a derivative projection of the ratified SDD, not the other way around.
3. **`/speckit.specify` is NOT appropriate now** — governance reconciliation (this document) must be completed and ratified first. Spec Kit implementation workflow may be invoked after SDD ratification and human implementation authorization.
4. Spec Kit must not become a competing authority or bypass the SDD ratification gate.

### 14.5 Recommendation

- **Do NOT invoke `/speckit.specify`**, `/speckit.plan`, or `/speckit.tasks` until this SDD is ratified.
- **After ratification**, Spec Kit may optionally be used to generate a `tasks.md` from the ratified SDD scope for implementation tracking. This is a tooling convenience, not a governance requirement.
- **The SDD remains the authoritative specification**. Spec Kit artifacts, if created, are subordinate projections.

---

## 15. ACCEPTANCE CRITERIA

### 15.1 Mandatory Pass Criteria

1. All 187+ existing backend tests pass with 0 failures.
2. New `test_session_lifecycle_contracts.py`: all tests pass.
3. `npm run typecheck` in `web/`: 0 errors.
4. `npm run build` in `web/`: 0 errors.
5. `create_initial_stage_progress()`: output **structurally and semantically identical** (deep `==`) to expected JSON for both Innovation and Research.
6. `synthesize_stage_progress()`: output matches current `synthesize_canonical_stage_progress()` for all tested flag combinations.
7. `derive_legacy_phase_projection()`: output matches current function for all tested inputs, including Research compound terminal.
8. `get_methodology_contract()`: prefix-matching removed; unknown strings return `None`.
9. Session creation: missing/empty/null/unknown `framework_id` returns HTTP 400. Omitted field defaults to Innovation.
10. `save_session()`: absent `framework_id` → Innovation (compatibility); explicit unknown → `ValueError`.
11. `get_session()`: migrated session with unknown `framework_id` → `WorkflowStateCorruptedError`.
12. Framework switching: full `stage_progress` stored and restored. Round-trip preservation verified. Unknown target → `ValueError`.
13. Zero SQLite schema changes. Zero frontend changes.
14. `graphify update .` succeeds.

### 15.2 Governance Gate Sequence

```text
Human SDD Ratification ← YOU ARE HERE
  ↓
Implementation Authorization
  ↓
Feature Branch Creation (feature/012-methodology-contract-slice-2)
  ↓
Implementation Execution (sequencing per Section 11)
  ↓
Automated Verification (pytest + typecheck + build)
  ↓
Human Acceptance Review
  ↓
Merge Gate (feature → develop)
  ↓
Promotion Gate (develop → main)
  ↓
Deployment Gate ⏸ (awaiting deployment authorization)
```

---

## 16. OPEN QUESTIONS FOR HUMAN LEADERSHIP

> [!IMPORTANT]
> **Q1: Prefix-Matching Removal Scope**
> 
> The `METHODOLOGY_REGISTRY` currently contains `"INNOVATION_RATCHET"` → `INNOVATION_CONTRACT`. After removing prefix-matching, only exact registry keys will resolve. Are there any other known variant strings (e.g., in existing SQLite session data) that should be added to the registry before prefix-matching is removed?
> 
> **Recommendation**: Conduct a one-time read-only audit of existing `convera.db` session `framework_id` values before implementation to identify any non-standard variants that would need registry entries.

---

## 17. REMAINING UNKNOWNS

| ID | Unknown | Working Hypothesis | Impact on Slice 2 |
| :--- | :--- | :--- | :--- |
| `UNK-01` | Future 3rd methodology legacy column semantics | Map first 5 stages or all-False | None |
| `UNK-02` | Non-standard `framework_id` values in production SQLite | Audit required before prefix removal | Low — mitigated by pre-implementation audit |

---

## 18. GOVERNANCE STATUS

- **Discovery Status**: 🟢 **COMPLETE**
- **SDD-02 REV-01 Status**: 🟡 **CANDIDATE — PENDING HUMAN LEADERSHIP REVIEW**
- **Implementation Status**: 🛑 **NOT AUTHORIZED**
- **Branch Creation**: 🛑 **NOT AUTHORIZED**
- **Spec Kit Workflow**: 🛑 **NOT AUTHORIZED** (pending SDD ratification)
- **Merge / Promotion / Deployment**: 🛑 **NOT AUTHORIZED**

*Awaiting Human Leadership review and ratification of this SDD-02 REV-01 candidate.*
