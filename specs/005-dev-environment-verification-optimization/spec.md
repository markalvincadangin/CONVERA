# CONVERA SDD-005: Development Environment & Verification Workflow Optimization Specification

**Specification ID**: CONVERA-SDD-005  
**Classification**: Development Environment, Test Tiering & Verification Efficiency  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [RATIFIED & HUMAN ACCEPTED — AWAITING INTEGRATION AUTHORIZATION]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `9e7391f657716f184c1041ca933fcd5e9f1f5d5a`  
**Proposed Feature Branch**: `feature/005-dev-environment-verification-optimization`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, V, VI, VII, VIII)
- `docs/02-system/EVIDENCE_MODEL.md` (Sections 1–5: Epistemic Evidence Tiers)
- `docs/08-operations/DEPLOYMENT.md` (Deployment Pipeline & Health Verification)
- `backend/pyproject.toml` (Pytest Configuration)
- `package.json` (Root Tooling & Script Registry)
- SDD-004 Post-Promotion & Deployment Verification Records (`9e7391f`)

---

## 1. Executive Summary & Purpose

The purpose of **SDD-005** is to eliminate the primary productivity and verification bottlenecks in CONVERA's software delivery lifecycle without compromising epistemic rigor, governance safety, or test completeness.

During the SDD-004 lifecycle, four operational friction points were empirically established:
1. **Monolithic Backend Test Execution Latency**: Executing the 130-test backend suite repeatedly consumed 10–18 minutes per run. This was caused by mixing fast deterministic unit/integration tests with slow, unmocked external network calls to academic APIs and cloud LLMs. In particular, a single test (`test_research_stage_a_stamps_signal_tier`) stalled the runner for 5 minutes due to unmocked external calls.
2. **Redundant Regression Runs Across Intermediate SDD Gates**: Identical 10–18 minute test suites were executed sequentially across Feature Verification, Human Acceptance, develop integration, Promotion, and Deployment gates—even when zero source code had changed and the relevant verification claims remained identical.
3. **Deployment Pipeline Stalls**: `scripts/deploy-prod.sh` Stage 1 executed the full monolithic test suite, causing deployment rollouts to stall for ~15.5 minutes before container building even began.
4. **Environment Inconsistency**: Running `./backend/.venv/bin/pytest backend/tests` directly from the repository root failed with 32 `ModuleNotFoundError: No module named 'engines'` collection errors because `backend/pyproject.toml` lacked `pythonpath = ["."]`.

SDD-005 operationalizes four fundamental principles:
- **Strict Test Tiering (74 Tier 1 + 44 Tier 2 + 12 Tier 3 = 130 tests)**: Disentangles fast offline verification (< 8 seconds) from live external API integration (~3–5 minutes).
- **Default Offline Verification**: Default test invocations execute only Tiers 1 and 2, guaranteeing fast, deterministic local iteration.
- **Claim-Oriented Evidence Reuse with Full Provenance**: Formalizes the transition from naive hash matching to impact-based evidence reuse across SDD gates, backed by complete execution provenance.
- **Strictly Bounded Deployment Preflight Acceleration**: Streamlines `scripts/deploy-prod.sh` Stage 1 to run offline preflight (Tiers 1 + 2) and reuse prior valid Tier 3 evidence, while strictly preserving all deployment stages, rollback mechanisms, container topology, and live container health verification.

---

## 2. Specification Precedence & Governing Invariants

All agents, auditors, and engineers working on SDD-005 are governed by the strict constitutional precedence hierarchy:

```text
CONSTITUTION (docs/00-foundation/CONSTITUTION.md)
       ↓
AUTHORITATIVE SPECIFICATIONS (docs/00 through docs/08)
       ↓
SDD-005 SPECIFICATION (specs/005-dev-environment-verification-optimization/spec.md)
       ↓
CURRENT IMPLEMENTATION (backend/pyproject.toml, package.json, scripts/deploy-prod.sh, backend/tests/)
       ↓
AGENT REASONING
```

### Invariant Rules for SDD-005:

1. **`[NORMATIVE]` 130-Test Inventory Accounting Invariant**:
   - Total collected test count in the backend test suite **MUST** remain exactly 130 tests across all 32 test files.
   - Zero tests may be deleted, renamed, or silently disabled.
   - Every collected test **MUST** belong to exactly one primary tier:
     $$\text{Tier 1 (74)} + \text{Tier 2 (44)} + \text{Tier 3 (12)} = 130 \text{ Total Tests}$$

2. **`[NORMATIVE]` Reclassification After Mocking**:
   - `test_research_stage_a_stamps_signal_tier` in `backend/tests/test_llm_gateway.py` **MUST** be refactored to mock the external `LLMGateway` using `unittest.mock.AsyncMock`.
   - Because it exercises the FastAPI test client, router dispatch, request validation, and SQLite storage, it is formally reclassified from Tier 3 (live external) to **Tier 2 (local integration)**.
   - This moves 1 test from Tier 3 to Tier 2, establishing the final inventory of 74 / 44 / 12.

3. **`[NORMATIVE]` Default Non-Live Test Execution Boundary**:
   - Default pytest invocation (`pytest`, `npm run test:backend`) **MUST** exclude Tier 3 live tests by configuring `addopts = "-m 'not live'"` in `backend/pyproject.toml`.
   - The default test run **MUST** execute exclusively Tiers 1 and 2 (118 tests), running in a completely offline, deterministic environment.

4. **`[NORMATIVE]` Claim-Oriented Evidence Reuse & Clean-Merge Rule**:
   - Verification evidence is reusable across SDD lifecycle gates if and only if the changes introduced since the evidence was generated cannot materially affect the claims supported by that evidence:
     $$\text{CLAIM} \longrightarrow \text{EVIDENCE} \longrightarrow \text{RELEVANT INPUTS} \longrightarrow \text{CHANGE IMPACT} \longrightarrow \text{REUSE OR REVERIFY}$$
   - No agent or engineer may declare evidence reusable without producing an explicit, documented **Change-Impact Assessment Record** with full verification provenance.
   - **Clean-Merge Rule**: A clean merge may reuse existing evidence when the merged commit preserves the previously verified claim-relevant inputs and no relevant environment, configuration, or dependency changes occurred. The Tier 1 smoke test serves as the lightweight empirical confirmation of runtime continuity.

5. **`[NORMATIVE]` Risk-Triggered Tier 3 Execution**:
   - Tier 3 live tests **MUST NOT** run unconditionally during local development, feature iterations, or clean merges.
   - Tier 3 execution is triggered exclusively by explicit risk events: connector modifications, LLM gateway modifications, prompt changes, suspected upstream API drift, release smoke preflight, or scheduled nightly health regression.

6. **`[NORMATIVE]` Existing-Test Mapping First (No Spurious Test Creation)**:
   - Existing tests shall be mapped to the specified profiles first.
   - The implementation agent **MUST NOT** create duplicate live-test infrastructure or new test files merely to satisfy abstract profile names.
   - New smoke tests may only be created where an existing test provides no suitable coverage and the task explicitly authorizes their creation.

7. **`[NORMATIVE]` Strictly Bounded Deployment Modification**:
   - Only **Stage 1 verification selection** in `scripts/deploy-prod.sh` shall change (to execute Tiers 1 + 2 offline).
   - The deployment script **MUST** strictly preserve:
     - All existing deployment stages (preflight, container build, migration, compose rollout, health probes)
     - Backup and rollback behavior (`backups/`)
     - Container topology (`convera-backend`, `convera-web`, `convera-db`)
     - Stage 5 container health probes (`/api/health` and `:3001` web probe)
     - Production environment configuration and SQLite database persistence.

8. **`[NORMATIVE]` Engineering Targets vs Normative Governance**:
   - Performance metrics (e.g. Tier 1 < 3s, Tier 2 < 15s, Tier 3 smoke < 25s) are formal **`[ENGINEERING TARGETS]`**, not rigid governance failure triggers. A minor deviation on slower development hardware does not constitute a governance violation.

9. **`[NORMATIVE]` Deferred Concurrency (`pytest-xdist`)**:
   - Parallel test execution via `pytest-xdist` is **DEFERRED** and excluded from SDD-005 core scope. The offline suite already executes in ~8.0 seconds; introducing multi-process SQLite locking complexity is premature optimization.

10. **`[NORMATIVE]` Zero Application Runtime Regressions**:
    - SDD-005 strictly governs developer tooling, test marking, pytest configuration, test mocking, and deployment preflight.
    - Zero changes to production business logic, API schemas, or the 23-table SQLite WAL database are authorized.

---

## 3. Scope Reconciliation & Defect Register

| Defect ID | Severity | Category | Target Component | Triage Decision | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`DEF-DEV-001`** | **HIGH** | Tooling | `backend/pyproject.toml` | **IN-SCOPE (Core)** | Root test invocation fails with 32 `ModuleNotFoundError: No module named 'engines'` collection errors; configuring `pythonpath = ["."]` shall resolve root import pathing. |
| **`DEF-DEV-002`** | **HIGH** | Verification | `backend/pyproject.toml`, `backend/tests/` | **IN-SCOPE (Core)** | Monolithic test execution causes 10–18m regression runs by executing live external network calls on every test pass. |
| **`DEF-DEV-003`** | **HIGH** | Test Design | `backend/tests/test_llm_gateway.py` | **IN-SCOPE (Core)** | `test_research_stage_a_stamps_signal_tier` calls cloud LLMs unmocked to verify local claim stamping (`SIGNAL`), stalling the runner for 5 minutes. |
| **`DEF-DEV-004`** | **MEDIUM** | Governance | SDD Gate Protocol & Documentation | **IN-SCOPE (Process)** | Lack of a formal claim-oriented evidence reuse model forces blind rerunning of the full suite across clean merges and reviews. |
| **`DEF-DEV-005`** | **HIGH** | Operations | `scripts/deploy-prod.sh` | **IN-SCOPE (Ops)** | Deployment Stage 1 runs un-tiered monolithic tests, stalling container deployments for 15.5 minutes. |
| **`DEF-DEV-006`** | **LOW** | Performance | Test Runner Parallelism | **DEFERRED (xdist)** | Shared SQLite database lock contention (`convera.db`) requires per-worker isolation. Defer xdist to maintain simplicity. |

---

## 4. Detailed Architectural & Technical Design

### 4.1 Pytest Configuration & Pythonpath Unification (`DEF-DEV-001`)

To guarantee identical test behavior regardless of current working directory or virtual environment invocation:
1. `backend/pyproject.toml` shall define `pythonpath = ["."]`. This configuration is specified to resolve module discovery so tests import `engines`, `routers`, and `storage` seamlessly from any invocation directory.
2. Standard test markers shall be formally registered under `[tool.pytest.ini_options]`:
   - `unit`: Pure in-memory deterministic unit tests with zero external dependencies.
   - `integration`: Local integration tests utilizing SQLite, FastAPI test clients, or mocked services.
   - `live`: Tests making real outbound network calls to external academic APIs or cloud LLM gateways.
   - `smoke`: Lightweight subset of live tests for pre-flight connectivity and authentication validation.
3. Default execution options shall be configured:
   ```toml
   [tool.pytest.ini_options]
   minversion = "7.0"
   addopts = "-ra -q -m 'not live'"
   pythonpath = ["."]
   testpaths = ["tests"]
   asyncio_mode = "auto"
   markers = [
       "unit: Pure deterministic offline unit tests",
       "integration: Local integration tests with SQLite or mocked services",
       "live: External network tests requiring real API connectivity",
       "smoke: Lightweight egress and connectivity probe subset of live tests",
   ]
   ```

### 4.2 Tri-Tier Test Classification & Marking Architecture (`DEF-DEV-002`)

The 130 backend tests are partitioned into three mutually exclusive tiers:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CONVERA TEST SUITE                            │
│                             (130 Total Tests)                           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│      TIER 1      │        │      TIER 2      │        │      TIER 3      │
│   Unit Tests     │        │ Integration Tests│        │    Live Tests    │
│    (74 Tests)    │        │    (44 Tests)    │        │    (12 Tests)    │
│                  │        │                  │        │                  │
│  - Pure logic    │        │  - SQLite WAL    │        │  - Academic APIs │
│  - Decision eng. │        │  - FastAPI router│        │  - Cloud LLMs    │
│  - Formulas      │        │  - Mocked gateway│        │  - Egress probes │
│  - Parsers       │        │  - Session state │        │  - Fallbacks     │
│                  │        │                  │        │                  │
│ [Target: < 3.0s] │        │ [Target: < 15.0s]│        │[Target: ~3–5 min]│
└──────────────────┘        └──────────────────┘        └──────────────────┘
         │                           │                           │
         └─────────────┬─────────────┘                           │
                       ▼                                         ▼
            ┌─────────────────────┐                   ┌─────────────────────┐
            │    OFFLINE SUITE    │                   │   EXPLICIT SUITE    │
            │   (118 Total Tests) │                   │  (Risk-Triggered)   │
            │  [Target: < 10.0s]  │                   │                     │
            │   DEFAULT RUNNER    │                   │ - Smoke (4 tests)   │
            │  `pytest -m 'not    │                   │ - Full (12 tests)   │
            │       live'`        │                   │                     │
            └─────────────────────┘                   └─────────────────────┘
```

### 4.3 Refactoring & Mocking of `test_research_stage_a_stamps_signal_tier` (`DEF-DEV-003`)

In `backend/tests/test_llm_gateway.py`:
- Refactor lines 485–504:
```python
@pytest.mark.asyncio
@pytest.mark.integration
async def test_research_stage_a_stamps_signal_tier(client: AsyncClient):
    """Invoke /api/research/stage-a/discover; verify candidate problems have evidence_tier == 'SIGNAL' (DEF-AI-003)."""
    mock_llm_json = """
    {
      "discovered_problems": [
        {
          "id": "PROB-MOCK-001",
          "statement": "Tropical sensor humidity corrosion in rice paddies.",
          "sector": "Precision Agriculture & Edge AI",
          "sufferer": "Smallholder farmers",
          "location": "Miagao, Iloilo",
          "quantified_loss": "35% sensor failure rate",
          "status": "SIGNAL"
        }
      ]
    }
    """
    with patch("routers.research.generate_response_with_fallback", new=AsyncMock(return_value=mock_llm_json)):
        payload = {
            "domains": ["Precision Agriculture & Edge AI"],
            "field_observations": "Sensors corrode rapidly in tropical climates.",
            "project_id": "test_proj_sdd003_signal"
        }
        response = await client.post("/api/research/stage-a/discover", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"
        problems = data.get("discovered_problems", [])
        assert len(problems) > 0
        for prob in problems:
            assert prob.get("evidence_tier") == "SIGNAL"
            assert prob.get("evidence_tier") != "OBSERVED"
```
* **Impact**: Eliminates the 5-minute cloud LLM stall, transforming the test into a ~40ms deterministic Tier 2 integration test.

### 4.4 Claim-Oriented Evidence Reuse Model & Provenance Protocol (`DEF-DEV-004`)

#### 4.4.1 Domain Dependency Matrix
The following authoritative matrix governs whether changed files materially affect verification claims:

| Domain | File Paths / Subsystems | Claims Supported | Invalidation Boundary |
| :--- | :--- | :--- | :--- |
| **A. Pure Logic & Algorithms** | `backend/engines/decision/`, `backend/models/decision.py`, standalone utils | Deterministic ranking, scoring, tie-breaking, epistemic gating | Invalidates **Tier 1** unit tests for modified components. |
| **B. Database & Local Storage** | `backend/storage/`, migrations, SQLite schema, route handlers | Relational schema integrity, transaction consistency, WAL | Invalidates **Tier 2** integration & route tests. |
| **C. External Academic Connectors** | `backend/ciia/`, `backend/connectors/` | Upstream REST API schema compliance, rate limits, normalization | Invalidates **Tier 3** academic live tests. |
| **D. External LLM Gateway** | `backend/llm_gateway.py`, provider SDKs, prompt templates | Live provider fallback cascade, structured schema generation | Invalidates **Tier 3** gateway live tests. |
| **E. Frontend UI & State** | `web/src/`, Tailwind/CCDS styles | UI rendering, client routing, TypeScript types | Invalidates **Frontend Typecheck & UI tests** (Zero backend impact). |
| **F. Documentation & Governance** | `docs/`, `specs/`, `*.md` | Architectural documentation, SDD compliance | Zero code impact (All test evidence reusable across all tiers). |

#### 4.4.2 Enhanced Verification-Evidence Provenance Record
At every SDD gate, the executing agent or engineer **must** produce an explicit Change-Impact Assessment containing full evidence provenance:

```markdown
### Change-Impact Evidence Provenance Record
- **Gate Baseline Commit:** `<baseline-sha>`
- **Gate Target Commit:** `<target-sha>`
- **Changed Files (`git diff --name-only <baseline-sha> <target-sha>`):** `[...]`

#### Verification Provenance Trace:
- **Baseline Evidence SHA:** `<commit-where-tests-ran>`
- **Execution Command:** `pytest -m "not live" -q`
- **Execution Result:** `118 passed, 12 deselected, 0 failed in 7.95s`
- **Execution Timestamp:** `2026-09-05T00:15:00Z`
- **Environment State:** `Python 3.13.14, Linux x86_64, backend/.venv`
- **Applicable Claim IDs:** `[CLAIM-DECISION-DETERMINISM, CLAIM-STORAGE-WAL, CLAIM-ROUTER-CONTRACTS]`
- **Evidence Tier:** `Tier 1 + Tier 2 (Offline Deterministic)`

#### Claim-Impact Analysis Table:
| Domain / Claim Scope | Relevant Tier | Impacted by Changed Files? | Environment Delta? | Gate Decision | Reason for Continued Reusability |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Pure Logic / Decision Eng | Tier 1 | No | No | **REUSE** | Zero diff in `backend/engines/` or formulas. |
| Storage & API Routes | Tier 2 | No | No | **REUSE** | Zero diff in SQLite schema or routers. |
| Academic & LLM Egress | Tier 3 | No | No | **REUSE** | Zero diff in connectors, gateway, or prompts. |
```

* **Reuse Authority Rule**: Evidence reuse is permitted if and only if:
  $$\Delta(\text{Inputs}) \cap \text{Dependencies}(\text{Claim}) = \emptyset \quad \text{AND} \quad \Delta(\text{Environment}) = \emptyset$$
* **Tightened Clean-Merge Rule**: A clean merge may reuse existing evidence when the merged commit preserves the previously verified claim-relevant inputs and no relevant environment, configuration, or dependency changes occurred. The Tier 1 smoke test serves as the lightweight empirical confirmation of runtime continuity.

### 4.5 Risk-Triggered Tier 3 Profiles & Existing-Test Mapping

#### 4.5.1 Mapping Existing Tests to Profiles
In accordance with Invariant 6, **all 12 live tests already exist in the repository** and shall be mapped directly to the profiles without creating duplicate test files:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXISTING TEST TO PROFILE MAPPING                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│      TIER 3 SMOKE PROFILE        │    │       FULL TIER 3 SUITE          │
│     (Outbound Egress Probe)      │    │ (Deep Enrichment & Resilience)   │
│            (4 Tests)             │    │            (12 Tests)            │
│       [Target: 15–25 sec]        │    │        [Target: 3–5 min]         │
│                                  │    │                                  │
│ - test_openalex_search           │    │ - All 4 Smoke Probe Tests        │
│ - test_crossref_search           │    │ - test_auto_research_problem     │
│ - test_europe_pmc_search         │    │ - test_live_openrouter_fallback  │
│ - test_live_gemini_direct_call   │    │ - test_live_gateway_e2e          │
│                                  │    │ - test_stage_a_discover_endpoint │
│ Triggers:                        │    │ - test_stage_a_discover_empty    │
│ - Release gate verification      │    │ - test_literature_matrix_engine  │
│ - Post-deployment egress probe   │    │ - test_research_matrix_endpoints │
│ - Preflight with unchanged code  │    │ - test_federated_search_dedup    │
└──────────────────────────────────┘    └──────────────────────────────────┘
```

#### 4.5.2 Authoritative Existing Test Mapping Table

| Profile | Existing Repository Test Identifier | File Path | Existing Function Name |
| :--- | :--- | :--- | :--- |
| **Smoke (Probe 1)** | OpenAlex Live HTTP Search | `backend/tests/test_research_client.py` | `test_openalex_search` |
| **Smoke (Probe 2)** | Crossref Live HTTP Search | `backend/tests/test_research_client.py` | `test_crossref_search` |
| **Smoke (Probe 3)** | Europe PMC Live HTTP Search | `backend/tests/test_research_client.py` | `test_europe_pmc_search` |
| **Smoke (Probe 4)** | Gemini Live Direct Call | `backend/tests/test_llm_gateway.py` | `test_live_gemini_direct_call` |
| **Full (Enrichment)**| Auto Research Problem Pipeline | `backend/tests/test_research_client.py` | `test_auto_research_problem` |
| **Full (Gateway 1)** | OpenRouter Fallback Call | `backend/tests/test_llm_gateway.py` | `test_live_openrouter_fallback_call` |
| **Full (Gateway 2)** | E2E Gateway Resilience Cascade | `backend/tests/test_llm_gateway.py` | `test_live_gateway_e2e_resilience` |
| **Full (Research 1)**| Stage A Discover Endpoint | `backend/tests/test_research_discovery.py` | `test_stage_a_discover_endpoint` |
| **Full (Research 2)**| Stage A Empty Domains Fallback | `backend/tests/test_research_discovery.py` | `test_stage_a_discover_empty_domains` |
| **Full (Matrix 1)** | Literature Matrix Engine Build | `backend/tests/test_research_matrix.py` | `test_literature_matrix_engine` |
| **Full (Matrix 2)** | Research Matrix Endpoints | `backend/tests/test_research_matrix.py` | `test_research_matrix_endpoints` |
| **Full (Connectors)**| Federated Search Deduplication | `backend/tests/test_connectors.py` | `test_federated_search_deduplication` |

* **Zero Spurious Tests Constraint**: The 12 tests listed above constitute the entire Tier 3 inventory. No additional live tests or duplicate live test files shall be created during implementation.

### 4.6 Deployment Verification Optimization (`DEF-DEV-005`)

#### 4.6.1 Strict Scope Containment for `scripts/deploy-prod.sh`
To prevent broad or unintended operational changes, the modification to `scripts/deploy-prod.sh` is strictly constrained:
- **ONLY Stage 1 verification command selection shall change.**
- Current Stage 1:
  ```bash
  echo "--- Stage 1: Running Pre-Deployment Automated Tests ---"
  cd backend && pytest tests/ -q
  ```
- Specified Stage 1:
  ```bash
  echo "--- Stage 1: Running Pre-Deployment Automated Tests ---"
  cd backend && ./venv/bin/pytest tests/ -m "not live" -q
  ```
- **Strictly Preserved Elements**:
  - Stage 2: Database backup (`backups/`) and schema migration check.
  - Stage 3: Container image building (`docker compose build`).
  - Stage 4: Container deployment and service restart (`docker compose up -d`).
  - Stage 5: Production health probes (`curl -f http://localhost:8001/api/health` and `curl -f http://localhost:3001`).
  - Rollback trap: Automatic execution of rollback routines on any stage failure.

### 4.7 Root Developer Tooling Standardization

`package.json` shall provide canonical, standardized scripts executable from the repository root:
- `npm run test:backend` $\rightarrow$ runs offline suite (Tiers 1 + 2, ~8.0s).
- `npm run test:backend:unit` $\rightarrow$ runs Tier 1 only (~2.8s).
- `npm run test:backend:integration` $\rightarrow$ runs Tier 2 only (~5.1s).
- `npm run test:backend:smoke` $\rightarrow$ runs Tier 3 Smoke Profile (~20s).
- `npm run test:backend:live` $\rightarrow$ runs Full Tier 3 Suite (~3–5m).
- `npm run test:backend:all` $\rightarrow$ runs all 130 tests across all tiers.
- `npm run test:all` $\rightarrow$ runs offline backend tests + frontend typecheck (~11s).

---

## 5. Test Inventory & Classification Ledger

### 5.1 Test Breakdown by File (130 Tests Total)

| Test File | Total Tests | Tier 1 (Unit) | Tier 2 (Integration) | Tier 3 (Live) | Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `test_agents.py` | 5 | 5 | 0 | 0 | Fully mocked agents |
| `test_api_endpoints.py` | 3 | 0 | 3 | 0 | FastAPI test client |
| `test_auth_roles.py` | 4 | 0 | 4 | 0 | SQLite passcode & roles |
| `test_circumscription_and_export.py` | 3 | 0 | 3 | 0 | Export endpoints & lifecycle |
| `test_connectors.py` | 5 | 4 | 0 | 1 | Hub registry & normalization; 1 federated live |
| `test_decision_engine.py` | 19 | 19 | 0 | 0 | SDD-004 deterministic ranking & math |
| `test_def001_contract.py` | 5 | 2 | 3 | 0 | Frontend-backend search contract |
| `test_deliverables.py` | 3 | 3 | 0 | 0 | Pure markdown deliverable generators |
| `test_document_parser.py` | 2 | 2 | 0 | 0 | Text chunking & extraction |
| `test_e2e_closed_loop_intelligence.py` | 3 | 0 | 3 | 0 | Closed-loop evaluation engine |
| `test_e2e_production.py` | 1 | 0 | 1 | 0 | Production lifecycle integration |
| `test_evidence_scorer.py` | 2 | 2 | 0 | 0 | Pure evidence scoring logic |
| `test_framework_engine.py` | 4 | 2 | 2 | 0 | SQLite framework persistence |
| `test_gate_engine.py` | 2 | 0 | 2 | 0 | Gate engine routing |
| `test_gates.py` | 3 | 3 | 0 | 0 | Gate sequence evaluation |
| `test_impact_engine.py` | 2 | 0 | 2 | 0 | Impact propagation cascade |
| `test_knowledge_graph.py` | 2 | 0 | 2 | 0 | Knowledge graph storage & extraction |
| `test_knowledge_lifecycle.py` | 1 | 1 | 0 | 0 | Epistemic balance calculation |
| `test_llm_gateway.py` | 23 | 19 | 1 | 3 | 19 mocked unit; 1 mocked DEF-AI-003; 3 live |
| `test_mcp_server.py` | 4 | 4 | 0 | 0 | FastMCP tool bindings |
| `test_phase1_knowledge_integrity.py` | 5 | 0 | 5 | 0 | Integrity engines & endpoints |
| `test_problem_bank.py` | 4 | 0 | 4 | 0 | Problem bank SQLite CRUD |
| `test_problem_parser.py` | 1 | 1 | 0 | 0 | Markdown parser |
| `test_quality_boosters.py` | 2 | 2 | 0 | 0 | Fully mocked devil's advocate |
| `test_research_client.py` | 5 | 1 | 0 | 4 | 1 keyword parser; 4 live academic calls |
| `test_research_discovery.py` | 2 | 0 | 0 | 2 | Stage A live discover calls |
| `test_research_domains.py` | 3 | 0 | 3 | 0 | Domain bank SQLite CRUD |
| `test_research_matrix.py` | 2 | 0 | 0 | 2 | Matrix synthesis & gaps endpoints |
| `test_schemas.py` | 3 | 3 | 0 | 0 | Pydantic schema validation |
| `test_similarity_engine.py` | 3 | 3 | 0 | 0 | Levenshtein/TF-IDF text similarity |
| `test_srs_generator.py` | 2 | 2 | 0 | 0 | SRS document formatter |
| `test_storage.py` | 4 | 0 | 4 | 0 | SQLite session & snapshot CRUD |
| **TOTALS** | **130** | **74** | **44** | **12** | **74 + 44 + 12 = 130** |

---

## 6. Verification & Conformance Protocol

### 6.1 Engineering Verification Targets

| Metric / Check | Engineering Target | Verification Command | Governance Classification |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Unit)** | < 3.0 seconds | `pytest -m unit` | `[ENGINEERING TARGET]` |
| **Tier 2 (Integration)** | < 15.0 seconds | `pytest -m integration` | `[ENGINEERING TARGET]` |
| **Offline Suite (T1 + T2)** | < 10.0 seconds | `pytest -m "not live"` | `[ENGINEERING TARGET]` |
| **Tier 3 Smoke Profile** | < 25.0 seconds | `pytest -m "live and smoke"` | `[ENGINEERING TARGET]` |
| **Total Test Count** | Exactly 130 tests | `pytest --collect-only -q` | `[NORMATIVE INVARIANT]` |
| **Working Tree Cleanliness** | Clean git state | `git status --porcelain` | `[NORMATIVE INVARIANT]` |
| **Frontend Typecheck** | 0 errors | `npm run typecheck` in `web/` | `[NORMATIVE INVARIANT]` |
| **Container Health Probes** | HTTP 200 OK | `curl -f http://localhost:8001/api/health` | `[NORMATIVE INVARIANT]` |

---

## 7. Next Steps & Governance Gates

Following CONVERA's strict SDD governance sequence:
1. **Current Step**: SDD-005 Specification Amended.
2. **Next Gate**: **Final Human Ratification Gate** for this Amended Specification Dossier.
3. **Subsequent Step**: Implementation Authorization (only granted after explicit human ratification).
