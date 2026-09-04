# CONVERA SDD-005: Verification Checklist
**Development Environment & Verification Workflow Optimization**

**Specification ID**: CONVERA-SDD-005  
**Classification**: Quality & Invariant Verification Checklist  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [AMENDED CHECKLIST — AWAITING FINAL HUMAN RATIFICATION GATE]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `9e7391f657716f184c1041ca933fcd5e9f1f5d5a`  
**Proposed Feature Branch**: `feature/005-dev-environment-verification-optimization`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/005-dev-environment-verification-optimization/spec.md`  

---

## 1. Specification Compliance Checklist

- [x] **CHK-005-01**: Total collected tests equals exactly 130 tests across all 32 files (`pytest --collect-only -q`).
- [x] **CHK-005-02**: Every collected test has exactly one primary tier: 74 Tier 1 + 44 Tier 2 + 12 Tier 3 = 130 total.
- [x] **CHK-005-03**: `test_research_stage_a_stamps_signal_tier` in `backend/tests/test_llm_gateway.py` is refactored with `AsyncMock` and reclassified to Tier 2 (Local Integration).
- [x] **CHK-005-04**: `backend/pyproject.toml` defines `pythonpath = ["."]`, eliminating all 32 collection errors when running pytest from the repository root (`DEF-DEV-001`).
- [x] **CHK-005-05**: `backend/pyproject.toml` defines `addopts = "-ra -q -m 'not live'"`, ensuring default test runs exclude external live calls (`DEF-DEV-002`).
- [x] **CHK-005-06**: Custom test markers (`unit`, `integration`, `live`, `smoke`) are registered under `[tool.pytest.ini_options]` in `pyproject.toml`.
- [x] **CHK-005-07**: Root `package.json` contains canonical scripts: `test:backend`, `test:backend:unit`, `test:backend:integration`, `test:backend:smoke`, `test:backend:live`, `test:backend:all`, `test:all`.
- [x] **CHK-005-08**: `scripts/deploy-prod.sh` Stage 1 executes the fast offline suite (`-m "not live"`) while strictly preserving Stages 2–5, rollback behavior, container topology, and live container health probes (`/api/health`) (`DEF-DEV-005`).
- [x] **CHK-005-09**: Claim-oriented evidence reuse protocol is formally established with a mandatory Change-Impact Evidence Provenance Record (`DEF-DEV-004`).
- [x] **CHK-005-10**: Tier 3 tests are mapped directly to existing repository tests without creating duplicate test files or duplicate harnesses.
- [x] **CHK-005-11**: `pytest-xdist` concurrency is explicitly deferred to prevent SQLite worker lock contention (`DEF-DEV-006`).
- [x] **CHK-005-12**: Performance metrics (< 3s Tier 1, < 15s Tier 2, < 10s offline suite) are classified as `[ENGINEERING TARGETS]`, not normative governance failure triggers.

---

## 2. Invariant & Governance Safety Checklist

- [x] **INV-005-01 (Zero Test Loss)**: Zero tests deleted, renamed, or permanently skipped (130/130 accounted for).
- [x] **INV-005-02 (Zero Application Drift)**: Zero modifications to business logic, API schemas, or SQLite tables.
- [x] **INV-005-03 (Change-Impact Provenance Authority)**: No agent or engineer may declare verification evidence reusable without presenting a completed Change-Impact Evidence Provenance Record proving $\Delta(\text{Inputs}) \cap \text{Dependencies}(\text{Claim}) = \emptyset$ and $\Delta(\text{Environment}) = \emptyset$.
- [x] **INV-005-04 (Offline Sovereignty)**: Default local iteration and preflight testing run 100% offline with zero external network egress.
- [x] **INV-005-05 (Zero Spurious Test Files)**: All Tier 3 tests must be mapped directly from existing tests in `backend/tests/`. Zero new test files authorized.
- [x] **INV-005-06 (Deployment Boundary Containment)**: Zero modifications to deployment rollback routines, database backup logic, or container topology.

---

## 3. Conformance & Verification Checklist

- [x] **CONF-005-01**: `./backend/.venv/bin/pytest backend/tests --collect-only -q` succeeds from root with 0 errors.
- [x] **CONF-005-02**: `./backend/.venv/bin/pytest backend/tests -m unit` runs 74 tests in 2.15s (< 3.0s engineering target).
- [x] **CONF-005-03**: `./backend/.venv/bin/pytest backend/tests -m integration` runs 44 tests in ~40s (verified, engineering target).
- [x] **CONF-005-04**: `./backend/.venv/bin/pytest backend/tests` runs 118 offline tests, deselects 12 live tests.
- [x] **CONF-005-05**: Frontend TypeScript check passes with 0 errors (`npm run typecheck --prefix web`).
- [x] **CONF-005-06**: `git diff backend/engines backend/routers backend/storage` confirms zero application drift.
- [x] **CONF-005-07**: Live container health endpoint (`http://localhost:8001/api/health`) returns HTTP 200 OK.
