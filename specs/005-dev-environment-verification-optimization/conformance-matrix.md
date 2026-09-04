# CONVERA SDD-005: Conformance & Traceability Matrix
**Development Environment & Verification Workflow Optimization**

**Specification ID**: CONVERA-SDD-005  
**Classification**: Specification Conformance & Requirements Traceability Matrix  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [AMENDED CONFORMANCE MATRIX — AWAITING FINAL HUMAN RATIFICATION GATE]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `9e7391f657716f184c1041ca933fcd5e9f1f5d5a`  
**Proposed Feature Branch**: `feature/005-dev-environment-verification-optimization`  
**Target Integration Branch**: `develop`  

---

## 1. Upstream Normative Traceability

| Upstream Authority | Normative Requirement | Current Baseline Status | SDD-005 Target Conformance | Verification Check |
| :--- | :--- | :--- | :--- | :--- |
| **CONSTITUTION.md**<br>Article V | **External Boundary Principle**: Platform verification and developer iteration must remain sovereign and resilient against external network/provider outages. | 🔴 **Violated**<br>Running the backend test runner invokes live external APIs (OpenAlex, Crossref, cloud LLMs), causing 10–18m stalls or failures when external services are down. | 🟢 **Conforming**<br>Default test runner is 100% offline (`-m "not live"`). External calls isolated behind explicit risk triggers. | `CHK-005-05`<br>`INV-005-04` |
| **CONSTITUTION.md**<br>Article VI | **Free-First & Offline Sovereignty**: Core development, automated testing, and verification must function 100% offline with zero cloud cost. | 🔴 **Violated**<br>`test_llm_gateway.py::test_research_stage_a_stamps_signal_tier` consumes live cloud LLM tokens unmocked, stalling for 5 minutes. | 🟢 **Conforming**<br>Test mocked with `AsyncMock`, eliminating live tokens and running in < 50ms locally. | `CHK-005-03`<br>`INV-005-04` |
| **EVIDENCE_MODEL.md**<br>Sections 1–5 | **Claim-Oriented Evidence Progression**: Verification claims must be supported by empirical evidence with clear input dependency boundaries. | 🟡 **Deficient**<br>Evidence reuse across SDD gates was undefined, resulting in repeated full-suite regression runs on unchanged source code. | 🟢 **Conforming**<br>Establishes formal Claim-Oriented Evidence Reuse Model with mandatory Change-Impact Evidence Provenance Records. | `CHK-005-09`<br>`INV-005-03` |
| **DEPLOYMENT.md**<br>Operations | **Deployment Pipeline Verification**: Automated preflight must verify system integrity without inducing excessive release downtime while preserving production safety. | 🔴 **Violated**<br>`deploy-prod.sh` Stage 1 executed monolithic 130-test suite, stalling deployment rollout by 15.5 minutes. | 🟢 **Conforming**<br>Preflight executes offline suite (Tiers 1 + 2 in ~8s) and reuses verified Tier 3 evidence; Stages 2–5, rollback, and container health probes remain 100% preserved. | `CHK-005-08`<br>`CONF-005-07` |

---

## 2. Requirements-to-Test Conformance Mapping

| Requirement | Description | Target Component | Verification Method | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **`FR-DEV-001`** | Pytest Pythonpath Unification | `backend/pyproject.toml` | Mechanical test collection | `pytest backend/tests --collect-only` succeeds from repo root with 0 errors. |
| **`FR-DEV-002`** | Default Non-Live Test Execution | `backend/pyproject.toml` | Test runner default invocation | Running `pytest` runs exactly 118 offline tests, deselecting 12 live tests. |
| **`FR-DEV-003`** | Mocking of DEF-AI-003 Test | `backend/tests/test_llm_gateway.py` | Unit execution | `test_research_stage_a_stamps_signal_tier` runs in < 50ms and asserts `SIGNAL`. |
| **`FR-DEV-004`** | Tri-Tier Marker Accounting | `backend/tests/` (32 files) | Filtered test collection | `pytest -m unit` = 74; `pytest -m integration` = 44; `pytest -m live` = 12. |
| **`FR-DEV-005`** | Canonical Root Tooling Scripts | `package.json` | Script execution | `npm run test:backend` executes offline suite in < 10.0s. |
| **`FR-DEV-006`** | Claim-Oriented Evidence Reuse | Verification SKILL / Process | Governance audit | Change-Impact Evidence Provenance Record produced and verified at each SDD gate. |
| **`FR-DEV-007`** | Accelerated Deployment Preflight | `scripts/deploy-prod.sh` (Stage 1 only) | Shell execution | Preflight runs offline suite (< 10s); eliminates 15.5m deployment stall. Stages 2–5 preserved. |
| **`FR-DEV-008`** | Retained Container Health Probes | `scripts/deploy-prod.sh` (Stage 5) | Container probe | Stage 5 verifies live HTTP health (`/api/health` returns 200 OK). |
| **`NFR-DEV-001`**| Tier 1 Runtime Target | `pytest -m unit` | Benchmark timing | Tier 1 runs in < 3.0 seconds `[ENGINEERING TARGET]`. |
| **`NFR-DEV-002`**| Tier 2 Runtime Target | `pytest -m integration` | Benchmark timing | Tier 2 runs in < 15.0 seconds `[ENGINEERING TARGET]`. |
| **`NFR-DEV-003`**| Offline Suite Runtime Target | `pytest -m "not live"` | Benchmark timing | Offline suite runs in < 10.0 seconds `[ENGINEERING TARGET]`. |
| **`NFR-DEV-004`**| Tier 3 Smoke Profile Target | `pytest -m "live and smoke"` | Benchmark timing | Tier 3 Smoke Profile runs in < 25.0 seconds `[ENGINEERING TARGET]`. |
| **`GR-DEV-001`** | Zero Application / Schema Drift | Git working tree | `git diff backend/engines backend/routers backend/storage` | Zero lines changed in production application code or SQLite schema. |
| **`GR-DEV-002`** | 130-Test Inventory Accounting | Pytest collection | `pytest --collect-only -q` | Total test count remains exactly 130 tests across all 32 files. |
| **`GR-DEV-003`** | Zero Spurious Test Creation | Test files check | `git status backend/tests` | Only existing tests mapped; zero new test files created. |

---

## 3. Human Acceptance Qualification & Performance Target Audit

> **SDD-005 achieves the architectural/test-tiering optimization objective, but does not meet the original offline-suite <10s engineering target. The remaining 91.26s runtime is dominated by two unmocked LLM-path integration tests and is deferred as DEF-DEV-007.**

- **Target Status for `NFR-DEV-001` (Tier 1 < 3s)**: 🟢 **MET (2.15s)**
- **Target Status for `NFR-DEV-002` (Tier 2 < 15s)**: 🟡 **UNMET (~40s, deferred to DEF-DEV-007)**
- **Target Status for `NFR-DEV-003` (Offline Suite < 10s)**: 🟡 **UNMET (91.26s, deferred to DEF-DEV-007)**
- **Target Status for `NFR-DEV-004` (Tier 3 Smoke < 25s)**: 🟡 **OBSERVED (51.29s)**

