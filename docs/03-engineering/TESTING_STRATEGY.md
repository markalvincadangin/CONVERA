# CONVERA - Testing Strategy & Epistemic Verification Contract

**Document ID**: `CONVERA-ENG-004`  
**Classification**: Epistemic Invariant & Multi-Tier Test Suite  
**Authority Tier**: Tier 2 Engineering Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟡 PARTIAL  
**Canonical Path**: `docs/03-engineering/TESTING_STRATEGY.md`  
**Upstream Dependencies**: `03-engineering/SDD_WORKFLOW.md, 02-system/DECISION_MODEL.md`  
**Downstream Dependents**: `08-operations/SYSTEM_CERTIFICATION.md`  

---

> **Test Taxonomy, Epistemic Invariant Suites, Execution Isolation & Acceptance Gates.**
> This document authoritatively establishes CONVERA's testing strategy, verification categories, execution environments, and quality gates. It operationalizes `ENGINEERING_PRINCIPLES.md`, `DEVELOPMENT_WORKFLOW.md`, and `SDD_WORKFLOW.md` into a concrete, reproducible verification specification.

---

## 1. Testing Philosophy & Verification Axiom

Testing in CONVERA is the primary vehicle for empirical software verification. It is governed by the core axiom:

> **"Evidence before assertion; testing as verification evidence."**

In CONVERA, tests do not establish universal scientific truth or absolute proof; they provide **verifiable software-engineering evidence** that specified behaviors, constitutional mandates, domain logic, and traceability invariants hold under defined test conditions.

---

## 2. Verified Implementation Baseline

CONVERA's testing framework is grounded in its active repository baseline:
* **Backend Test Runner:** pytest executing across unit, domain engine, API router, storage adapter, and connector suites.
* **Frontend Type & Static Check:** Next.js / TypeScript compiler (	sc --noEmit) enforcing strict type safety.
* **Architecture & Dependency Check:** Automated import-cycle and boundary verification scripts.
* **Free-First & Offline Boundary:**
  - The **required automated verification suite** must execute cleanly without paid external API credentials.
  - Deterministic unit, integration, architecture, security, and connector-mock tests must operate locally and offline.
  - Optional live external-service tests may require network access but are supplementary and are **never** required for core acceptance gates unless explicitly governed.

---

## 3. The Ten Verification Categories

`	ext
+-----------------------------------------------------------------------------+
|                     CONVERA TEN VERIFICATION CATEGORIES                     |
+-----+-------------------------------+---------------------------------------+
| #   | Category                      | Verification Target                   |
+-----+-------------------------------+---------------------------------------+
| 1   | Static Type & Contract Safety | Pydantic v2 schemas & TypeScript types|
| 2   | Unit & Component Isolation    | Pure logic & isolated module functions|
| 3   | Epistemic & Knowledge Invar.  | Net Balance, states, & contradiction. |
| 4   | Persistence & Audit Integrity | SQLite WAL, schema, non-destructive.  |
| 5   | API Router & Endpoint Security| FastAPI status codes, models, errors. |
| 6   | CIIA & Degraded Fallbacks     | Provider cascade & synthetic mock test|
| 7   | Traceability & Blast Radius   | Forward impact & backward provenance. |
| 8   | Security & Boundary Isolation | Requirements defined in SECURITY.md.  |
| 9   | Architectural Hygiene         | Zero circular imports & area leaks.   |
| 10  | Documentation Consistency     | Cross-reference & projection sync.    |
+-----+-------------------------------+---------------------------------------+
`

---

## 4. Category-by-Category Verification Specifications

### 1. Static Type & Contract Safety
* **Python:** Strict Pydantic v2 validation on all external/API data models. No unconstrained dict[str, Any] in public router/engine signatures.
* **TypeScript:** 	sc --noEmit with strict: true. Explicit ny is prohibited in production application code unless covered by an explicitly reviewed interoperability exception.

### 2. Unit & Component Isolation Tests
* Fast, deterministic tests verifying utility functions, date parsers, string formatters, and mathematical helpers in complete isolation from external I/O.

### 3. Epistemic & Knowledge Invariant Tests
* **Net Epistemic Balance:** Verifies mathematical formula precision across Tier A (3.0), Tier B (2.0), Tier C (1.0), characterization multipliers, and temporal decay.
* **Neutral Context Test:** Verifies that `CONTEXTUALIZES` evidence contributes exactly 0.0 to Net Balance.
* **Contradiction Precedence Test:** Verifies that linking refuting evidence (`CONTRADICTS`/`FALSIFIES`) forces claim state to `CONTESTED` regardless of positive Net Balance.
* **Tri-Part Confidence Decoupling:** Verifies that C_AI, S_EVID, and C_DEC are calculated independently and raises OVERCONFIDENCE_WARNING when triggered.

### 4. Persistence & Audit Integrity Tests
* **Database Initialization:** Verifies clean bootstrap of all normalized SQLite tables in WAL mode.
* **Non-Destructive Supersession:** Verifies that replacing or pivoting an active decision creates a new versioned `DecisionRecord` linked through `superseded_by_id`, leaving historical records immutable.
* **Provenance Preservation:** Verifies that evidence extraction lineage cannot be overwritten.

### 5. API Router & Endpoint Security Tests
* Executes the configured FastAPI test client against all active API routers/endpoints applicable to the change, verifying status codes, schema validation errors (422), not-found behavior (404), and error response models.

### 6. CIIA & Degraded Fallback Tests
* **Cascade Fallback:** Tests graceful progression: Gemini -> Groq -> Ollama -> Synthetic Mock.
* **Truthful Degradation Invariant:** Verifies that synthetic fallback outputs explicitly set `is_degraded = True`, `source = "synthetic_fb"`, and contribute 0.0 evidentiary score.
* **Connector Mock Boundary:** Mocked HTTP fixtures for all five literature connectors (OpenAlex, Crossref, PubMed, Europe PMC, Semantic Scholar) verify adapter parsing, normalization, and failure handling; mock tests **do not** assert the scientific truth of external citation content.

### 7. Traceability & Blast Radius Invariant Tests
* **Forward Invalidation Cascade:** Tests that invalidating an `EvidenceItem` or marking a `ProblemClaim` as `CONTESTED` triggers the `ImpactEngine` to flag downstream `DecisionRecord` entities as `STALE_REVIEW_REQUIRED` and dependent requirements as `VERIFICATION_STALE`.
* **Backward Provenance Traversal:** Tests that traversing from a requirement retrieves its governing decision, underlying claims, and original evidence provenance identifiers.

### 8. Security & Boundary Isolation Tests
* Executes the applicable security verification suites governed by `SECURITY.md` (credential redaction, path traversal protection, read-only state guards).

### 9. Architectural & Dependency Hygiene Tests
* Verifies zero circular import dependencies across backend/.
* Verifies that domain engines (`backend/engines/`) do not import SQLite drivers or vendor AI SDKs directly.

### 10. Documentation Consistency Tests
* Validates that canonical specifications in `docs/` are faithfully projected into `.specify/memory/` and `.agents/`, detecting missing, stale, or conflicting projections without treating projections as competing authorities.

---

## 5. Test Execution Isolation & Free-First Posture

* **Zero Paid External API Dependency:** All automated tests must run successfully in an offline or local environment without requiring paid API credits.
* **Test Database Isolation:** Tests execute against isolated SQLite database files (e.g., in a temporary test directory or fixture-managed file), ensuring zero mutation of development or production databases.
* **Deterministic Mocking:** External HTTP requests are intercepted with deterministic fixtures, preventing flaky network dependencies.

---

## 6. Verification States & Traceability Binding

Test execution results bind directly into the **Traceability Model** (`TRACEABILITY_MODEL.md`) via a result-dependent flow:

`	ext
  [Test Execution Completed]
              |
              v
  [Evaluate Verification Result]
              |
        +-----+-----+-------------------+
        |           |                   |
        v (PASS)    v (FAIL)            v (BLOCKED / STALE)
  [VERIFIED_PASS] [VERIFIED_FAIL] [BLOCKED / VERIFICATION_STALE]
        |           |                   |
        +-----+-----+-------------------+
              |
              v
  [Record Verification Artifact in RequirementsTraceability]
`

> **Governance Invariant:**  
> A verification artifact records the result of a defined verification activity. VERIFIED_PASS may be assigned only when the applicable verification criteria have passed. Failed, blocked, or invalidated verification must not be represented as VERIFIED_PASS.

> **Epistemic Distinctions on Verification:**
> * $\\text{VERIFIED_PASS} \\neq \\text{Universal Requirement Truth}$
> * $\\text{VERIFIED_PASS} \\neq \\text{Permanent Decision Validity}$
> * $\\text{VERIFIED_PASS} \\neq \\text{Scientific Validity}$
> * $\\text{VERIFIED_PASS} \\neq \\text{Absence of Unmeasured Edge Cases}$
> VERIFIED_PASS denotes solely that the defined verification activity associated with the requirement passed against the active implementation under specified test conditions.

---

## 7. Acceptance & Release Criteria Gate

A code change or release candidate is accepted only when it satisfies the **Convergence Quality Gate**:
1. **100% Applicable Pass Rate:** All required verification suites applicable to the change pass without failures or unhandled errors.
2. **Zero TypeScript Errors:** 	sc --noEmit completes with zero errors.
3. **Zero Architectural Violations:** Dependency hygiene tests confirm zero circular imports and zero layer leaks.
4. **Zero Required Test Bypasses:** No required verification may be skipped, suppressed, commented out, or bypassed to obtain acceptance. (Optional non-required tests must be explicitly labeled and not counted toward required verification).
5. **Traceability Linked:** Consequential requirements possess bound verification artifact references.
6. **Documentation Synchronized:** Canonical docs in `docs/` and operational projections in `.specify/` and `.agents/` are consistent.
