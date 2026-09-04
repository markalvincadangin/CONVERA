# CONVERA SDD-005: Work Breakdown & Implementation Tasks
**Development Environment & Verification Workflow Optimization**

**Specification ID**: CONVERA-SDD-005  
**Classification**: Work Breakdown & Implementation Tasks  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [AMENDED TASKS — AWAITING FINAL HUMAN RATIFICATION GATE]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `9e7391f657716f184c1041ca933fcd5e9f1f5d5a`  
**Proposed Feature Branch**: `feature/005-dev-environment-verification-optimization`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/005-dev-environment-verification-optimization/spec.md`  
- `specs/005-dev-environment-verification-optimization/plan.md`  

---

## 1. Task Breakdown & Execution Sequence

```text
[Phase 1: Environment & Tooling Standardization]
       │
       ▼
   TASK-005-01: Update backend/pyproject.toml (pythonpath, addopts, markers) [DEF-DEV-001]
       │
       ▼
[Phase 2: Test Mocking & Reclassification]
       │
       ▼
   TASK-005-02: Refactor test_research_stage_a_stamps_signal_tier with AsyncMock [DEF-DEV-003]
       │
       ▼
[Phase 3: Existing-Test Mapping & Test Tier Marking]
       │
       ▼
   TASK-005-03: Map Existing Repository Tests to Tier 3 Profiles (No Spurious Test Creation)
       │
       ▼
   TASK-005-04: Apply Tier Markers across 32 Test Files (74 T1, 44 T2, 12 T3 = 130 total) [DEF-DEV-002]
       │
       ▼
[Phase 4: Developer Scripts & Deployment Preflight]
       │
       ▼
   TASK-005-05: Standardize Root package.json Scripts (test:backend, test:backend:unit, etc.)
       │
       ▼
   TASK-005-06: Optimize scripts/deploy-prod.sh Stage 1 Only (Preserve Stages 2–5 & Health Probes) [DEF-DEV-005]
       │
       ▼
[Phase 5: Evidence Reuse Protocol & Provenance]
       │
       ▼
   TASK-005-07: Codify Claim-Oriented Evidence Reuse Protocol with Full Provenance [DEF-DEV-004]
       │
       ▼
[Phase 6: Verification & Conformance Audit]
       │
       ▼
   TASK-005-08: Execute Verification Conformance Suite & Mechanical Test Accounting Audit
```

---

## 2. Detailed Task Specifications

### Phase 1: Environment & Tooling Standardization

#### `TASK-005-01`: Standardize Pytest Configuration & Pythonpath [COMPLETED & VERIFIED]
- **Target File**: `backend/pyproject.toml`
- **Objective**: Configure `pythonpath = ["."]`, `addopts = "-ra -q -m 'not live'"`, and register custom markers (`unit`, `integration`, `live`, `smoke`).
- **Defect Addressed**: `DEF-DEV-001` (specifies configuration to resolve 32 collection errors when running pytest from repository root).
- **Verification**: Running `./backend/.venv/bin/pytest backend/tests --collect-only -q` from repository root succeeds with zero errors and collects 130 tests.

---

### Phase 2: Test Mocking & Reclassification

#### `TASK-005-02`: Refactor `test_research_stage_a_stamps_signal_tier` with `AsyncMock` [COMPLETED & VERIFIED]
- **Target File**: `backend/tests/test_llm_gateway.py`
- **Objective**: Mock `generate_response_with_fallback` (or `LLMGateway`) using `unittest.mock.AsyncMock` so that the route `/api/research/stage-a/discover` executes deterministically in memory without invoking external cloud LLMs.
- **Defect Addressed**: `DEF-DEV-003` (eliminates 5-minute stall in backend test runner).
- **Reclassification**: Tag with `@pytest.mark.integration`, moving it from Tier 3 to Tier 2.
- **Verification**: Test executes in < 50ms and asserts `evidence_tier == "SIGNAL"` for DEF-AI-003 compliance.

---

### Phase 3: Existing-Test Mapping & Test Tier Marking

#### `TASK-005-03`: Map Existing Repository Tests to Tier 3 Profiles [COMPLETED & VERIFIED]
- **Target Files**: `backend/tests/test_research_client.py`, `backend/tests/test_llm_gateway.py`, `backend/tests/test_research_discovery.py`, `backend/tests/test_research_matrix.py`, `backend/tests/test_connectors.py`.
- **Objective**: Map existing test functions directly to the Tier 3 Smoke and Full profiles.
- **Strict Boundary**: Zero new test files or duplicate live test harnesses shall be created.
- **Verification**: Existing 12 test functions match the table in `spec.md` Section 4.5.2.

#### `TASK-005-04`: Apply Tier Markers across 32 Test Files [COMPLETED & VERIFIED]
- **Target Files**: All 32 test files in `backend/tests/`.
- **Objective**: Add module-level or function-level markers:
  - `@pytest.mark.unit` to 74 unit tests.
  - `@pytest.mark.integration` to 44 integration tests.
  - `@pytest.mark.live` to 12 live tests.
  - `@pytest.mark.smoke` to the 4 designated smoke tests.
- **Defect Addressed**: `DEF-DEV-002` (enables isolated tier execution).
- **Verification**:
  - `pytest -m unit` collects and runs exactly 74 tests.
  - `pytest -m integration` collects and runs exactly 44 tests.
  - `pytest -m live` collects and runs exactly 12 tests.
  - `pytest -m "not live"` collects and runs exactly 118 tests.
  - $74 + 44 + 12 = 130$.

---

### Phase 4: Developer Scripts & Deployment Preflight

#### `TASK-005-05`: Standardize Root `package.json` Scripts [COMPLETED & VERIFIED]
- **Target File**: `package.json`
- **Objective**: Add canonical scripts:
  - `test:backend`: runs offline suite (`pytest -m "not live"`).
  - `test:backend:unit`: runs Tier 1 only (`pytest -m "unit"`).
  - `test:backend:integration`: runs Tier 2 only (`pytest -m "integration"`).
  - `test:backend:smoke`: runs Tier 3 Smoke Profile (`pytest -m "live and smoke"`).
  - `test:backend:live`: runs Full Tier 3 Suite (`pytest -m "live"`).
  - `test:backend:all`: runs all 130 tests (`pytest -o addopts=''`).
  - `test:all`: runs offline backend suite + frontend typecheck.
- **Verification**: `npm run test:backend` executes in < 10.0s.

#### `TASK-005-06`: Optimize `scripts/deploy-prod.sh` Stage 1 Only [COMPLETED & VERIFIED]
- **Target File**: `scripts/deploy-prod.sh`
- **Objective**: Update Stage 1 preflight test command exclusively to run `./venv/bin/pytest tests/ -m "not live" -q`.
- **Strict Boundary**: Preserve Stages 2, 3, 4, 5, backup/migration checks, container topology, rollback routines, and live health probes (`/api/health`).
- **Defect Addressed**: `DEF-DEV-005` (eliminates 15.5-minute deployment delay).
- **Verification**: Shell syntax check (`bash -n scripts/deploy-prod.sh`) passes cleanly.

---

### Phase 5: Evidence Reuse Protocol & Provenance

#### `TASK-005-07`: Codify Claim-Oriented Evidence Reuse Protocol with Provenance [COMPLETED & VERIFIED]
- **Target Files**: `.agents/skills/convera-verification/SKILL.md`, `docs/08-operations/`
- **Objective**: Add authoritative guidelines and templates for the mandatory Change-Impact Evidence Provenance Record at SDD gates.
- **Defect Addressed**: `DEF-DEV-004` (prevents blind regression re-runs across clean gates).
- **Verification**: Schema enforces commit SHA, command, result, timestamp, environment state, and applicable claim IDs.

---

### Phase 6: Verification & Conformance Audit

#### `TASK-005-08`: Execute Verification Conformance Suite & Mechanical Accounting Audit [COMPLETED & VERIFIED]
- **Target Files**: Workspace-wide audit.
- **Objective**: Execute:
  1. Mechanical test accounting: exactly 130 collected tests.
  2. Performance benchmark: Tier 1 < 3s, Tier 2 verified, offline suite verified.
  3. Frontend typecheck: 0 errors.
  4. Git diff check: clean working tree.
  5. Container health check verification.
- **Verification**: All items pass and meet engineering targets.
