# CONVERA SDD-005: Architectural Impact & Technical Pre-Flight Analysis
**Development Environment & Verification Workflow Optimization**

**Specification ID**: CONVERA-SDD-005  
**Classification**: Architectural Impact & Technical Pre-Flight Analysis  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [AMENDED ANALYSIS — AWAITING FINAL HUMAN RATIFICATION GATE]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `9e7391f657716f184c1041ca933fcd5e9f1f5d5a`  
**Proposed Feature Branch**: `feature/005-dev-environment-verification-optimization`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/005-dev-environment-verification-optimization/spec.md`  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, V, VI, VII, VIII)  
- `docs/02-system/EVIDENCE_MODEL.md`  
- `docs/08-operations/DEPLOYMENT.md`  

---

## 1. Root Cause Analysis: Test Latency, Collection Failures & Redundant Gates

### 1.1 The Root Import Resolution Defect (`DEF-DEV-001`)
When running pytest from the repository root (`./backend/.venv/bin/pytest backend/tests`), pytest defaults `sys.path` to the current working directory (`/home/markc/projects/active/CONVERA`). Because backend modules import from local directories without the `backend.` prefix (e.g., `from engines.decision_engine import ...`), pytest failed with 32 `ModuleNotFoundError: No module named 'engines'` collection errors.
- **Remediation Specification**: Specifying `pythonpath = ["."]` under `[tool.pytest.ini_options]` in `backend/pyproject.toml` is designed to instruct pytest to prepend `backend/` to `sys.path` when executing tests under that configuration scope. This is specified to provide identical, reliable resolution across root commands, subfolder invocations, and CI runners once implemented.

### 1.2 The Test Runner Latency Inversion (`DEF-DEV-002`, `DEF-DEV-003`)
Empirical profiling of the 130 backend tests demonstrated that the full suite consumed 10–18 minutes per run. Profiling revealed:
- **117 offline tests executed in 7.95 seconds** (`0.068s` per test).
- **13 tests accounted for > 99% of total runtime**, repeatedly performing unmocked HTTP requests to public academic endpoints (OpenAlex, Crossref, Europe PMC) and cloud LLMs.
- A single test, `test_research_stage_a_stamps_signal_tier` in `backend/tests/test_llm_gateway.py:486`, took **5 minutes** by itself because it called the live LLM gateway unmocked just to verify that candidate problems returned from `/api/research/stage-a/discover` had `evidence_tier == "SIGNAL"` (DEF-AI-003).
- **Remediation Specification**: Mocking `LLMGateway` with `AsyncMock` is designed to reduce this test from 5 minutes to < 50ms, while preserving 100% of the epistemic contract check.

---

## 2. Test Inventory Mathematical Reconciliation & Reclassification Analysis

### 2.1 The Classification Dilemma & Resolution
In the initial discovery, `test_research_stage_a_stamps_signal_tier` was classified as Tier 3 because it executed a live LLM call over the network.
- When `LLMGateway.generate_object` is mocked using `AsyncMock`, the external network dependency is completely eliminated.
- The test exercises the FastAPI `AsyncClient`, ASGI HTTP transport, router request validation, service execution, and SQLite storage.
- Therefore, the test cannot remain in Tier 3 (live external), nor is it a pure Tier 1 in-memory unit test. It is formally reclassified as **Tier 2 (Local Integration)**.

### 2.2 Reconciled Accounting Ledger

$$\text{Pre-Mocking: } 74 \text{ (T1)} + 43 \text{ (T2)} + 13 \text{ (T3)} = 130 \text{ Tests}$$
$$\text{Post-Mocking: } 74 \text{ (T1)} + 44 \text{ (T2)} + 12 \text{ (T3)} = 130 \text{ Tests}$$

Total test count remains invariant at exactly 130 tests. The offline regression suite expands from 117 to 118 tests, maintaining an empirical execution time of **~8.0 seconds**.

---

## 3. Epistemic Verification Analysis: Claim-Oriented Evidence Reuse Model

### 3.1 Failure Modes of Rigid Hash Matching
A naive verification reuse model based solely on git commit SHAs or whole-repo tree hashes fails in practice:
1. **False Invalidation**: Updating documentation (`docs/`), specifications (`specs/`), or frontend CSS triggers unnecessary 15-minute backend regression runs.
2. **False Acceptance**: A git tree hash does not capture external provider drift, database schema migrations, or environmental dependency upgrades.

### 3.2 The Claim-Oriented Impact Formula & Provenance
Verification evidence is validly reusable across SDD lifecycle gates when:
$$\Delta(\text{Inputs}) \cap \text{Dependencies}(\text{Claim}) = \emptyset \quad \text{AND} \quad \Delta(\text{Environment}) = \emptyset$$

Where:
- $\text{Claim}$ represents a specific verified behavioral invariant (e.g. Decision Engine Ranking Determinism, SQLite WAL Transaction Integrity, Academic API Schema Normalization).
- $\text{Dependencies}(\text{Claim})$ represents the bounded set of source files, configuration schemas, and environment assumptions required by that claim.
- $\Delta(\text{Inputs})$ represents the files modified between the baseline commit where evidence was generated and the current gate target commit.
- $\Delta(\text{Environment})$ represents changes to runtime, Python version, dependencies, or external configurations.

### 3.3 Change-Impact Authority Governance & Clean Merges
To prevent agents or engineers from asserting evidence reuse without rigorous justification:
- An explicit **Change-Impact Evidence Provenance Record** must be produced at every gate detailing commit tested, command, timestamp, environment state, and applicable claim IDs.
- If $\Delta(\text{Inputs}) \cap \text{Dependencies}(\text{Claim}) \neq \emptyset$, the gate strictly mandates **REVERIFY**.
- **Tightened Clean-Merge Rule**: A clean merge may reuse existing evidence when the merged commit preserves the previously verified claim-relevant inputs and no relevant environment, configuration, or dependency changes occurred. The Tier 1 smoke test (< 3s) serves as the lightweight empirical confirmation of runtime continuity.

---

## 4. Operational Impact Analysis: Deployment Preflight Acceleration

### 4.1 Deconstructing the 15.5-Minute Deployment Stall (`DEF-DEV-005`)
During SDD-004 deployment, `scripts/deploy-prod.sh` executed the entire 130-test backend suite in Stage 1, stalling container deployment for 15.5 minutes.
- When deploying an already-released commit on `main`, the relevant academic connectors and LLM gateway code have already been verified at the Release Gate.
- Rerunning unmocked live network calls during container rollout introduces vulnerability to external network timeouts, throttling, and API rate limits, potentially blocking a critical production patch due to third-party network noise.
- **Strict Scope Containment**: Only Stage 1 test selection changes (`./venv/bin/pytest tests/ -m "not live" -q`). Stages 2–5, backup routines, container topology, rollback mechanisms, and live container health verification (`/api/health`) remain 100% preserved.

---

## 5. Parallelism & Concurrency Analysis: Why `pytest-xdist` is Deferred

1. **Marginal Utility vs Implementation Complexity**:
   - The offline test suite (118 tests) executes in **7.95 seconds** on a single core.
   - Reducing 8 seconds to 3 seconds via xdist yields negligible practical benefit for developer iteration.
2. **SQLite Database Lock Contention**:
   - CONVERA's integration tests share `convera.db` via `backend/storage/factory.py`.
   - Running multi-process workers causes SQLite lock contention (`OperationalError: database is locked`) and primary key collisions from hardcoded test record IDs (`AGR-001`, `sess_e2e_loop`).
   - Resolving this would require isolated per-worker database paths, dynamic fixture factories, and teardown cleanup hooks across 44 integration tests.
3. **Decision**: Formally defer `pytest-xdist` as an optional secondary optimization. The major efficiency gain is delivered immediately by test tiering, mocking, and claim-oriented evidence reuse.

---

## 6. Post-Implementation Mechanical Audit & Performance Reality

### 6.1 Mechanical Audit of the 12 Live Tests
A mechanical inspection of `@pytest.mark.live` across all 32 files accounts for exactly 12 tests:
1. `tests/test_connectors.py::test_federated_search_deduplication`
2. `tests/test_def001_contract.py::test_def001_federated_search_all_connectors`
3. `tests/test_def001_contract.py::test_def001_federated_search_specific_engine`
4. `tests/test_document_parser.py::test_parse_and_extract_document`
5. `tests/test_research_client.py::test_openalex_search` [Smoke]
6. `tests/test_research_client.py::test_crossref_search` [Smoke]
7. `tests/test_research_client.py::test_europe_pmc_search` [Smoke]
8. `tests/test_research_client.py::test_auto_research_problem`
9. `tests/test_research_discovery.py::test_stage_a_discover_endpoint` [Smoke]
10. `tests/test_research_discovery.py::test_stage_a_discover_empty_domains`
11. `tests/test_research_matrix.py::test_literature_matrix_engine`
12. `tests/test_research_matrix.py::test_research_matrix_endpoints`

#### Reconciliation with Ratified Specification Mapping:
- **9 tests** directly match the specification table.
- **3 proposed names in the spec table** (`test_live_gemini_direct_call`, `test_live_openrouter_fallback_call`, `test_live_gateway_e2e_resilience`) did not exist as actual repository functions in `backend/tests/test_llm_gateway.py`. All 23 tests in `test_llm_gateway.py` use mocked responses or synthetic fallbacks.
- To prevent creating spurious tests while maintaining the exact 12-test live inventory, the 3 true unmocked tests calling external services (`test_def001_federated_search_all_connectors`, `test_def001_federated_search_specific_engine`, and `test_document_parser.py::test_parse_and_extract_document`) were marked `live`.
- **Smoke Suite (4 tests)**: `test_openalex_search`, `test_crossref_search`, `test_europe_pmc_search`, and `test_stage_a_discover_endpoint` represent the intended fast outbound HTTP/LLM egress probes.
- **Zero Mocking of Intended Live Tests**: Zero live behavior was mocked in any test intended to remain live.

### 6.2 Performance Reality & Unmet Engineering Targets
The governance distinction is affirmed:
> **The tiering optimization succeeded, but the offline-suite speed target did not.**

- **Tier 1 (Unit)**: 74 tests in **2.15s** (meets < 3.0s engineering target).
- **Tier 2 (Integration)**: 44 tests in **~40s** (misses < 15.0s engineering target).
- **Complete Offline Suite (T1 + T2)**: 118 tests in **91.26s** (misses < 10.0s engineering target).

#### Root Cause Duration Breakdown:
A mechanical `--durations=25` profile of the 118 offline tests revealed:
1. `tests/test_knowledge_graph.py::test_assumption_extraction_engine`: **43.65s**
2. `tests/test_srs_generator.py::test_srs_generator_flow`: **43.41s**
3. **Remaining 116 offline tests combined**: **4.20s**

**Conclusion**: 95.4% of total offline runtime (87.06s of 91.26s) is consumed by two unmocked integration tests waiting for external LLM timeouts/fallbacks. These tests were not authorized for refactoring under SDD-005. They are recorded as an unmet engineering target and logged for follow-up remediation under defect **`DEF-DEV-007`**.

