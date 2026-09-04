# CONVERA SDD-005: Architectural Implementation Plan
**Development Environment & Verification Workflow Optimization**

**Specification ID**: CONVERA-SDD-005  
**Classification**: Technical & Architectural Implementation Plan  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [AMENDED PLAN — AWAITING FINAL HUMAN RATIFICATION GATE]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `9e7391f657716f184c1041ca933fcd5e9f1f5d5a`  
**Proposed Feature Branch**: `feature/005-dev-environment-verification-optimization`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/005-dev-environment-verification-optimization/spec.md`  
- `docs/00-foundation/CONSTITUTION.md`  
- `docs/08-operations/DEPLOYMENT.md`  
- `backend/pyproject.toml`  
- `package.json`  

---

## 1. System Boundary & Component Architecture

SDD-005 operates strictly across the development tooling, test framework, and operational deployment preflight layers, leaving the core application runtime, API contracts, database schema, and production container topology 100% untouched:

```text
Developer & CI/CD Tooling Layer
 ├── package.json (Root scripts: test:backend, test:backend:unit, test:backend:integration, test:backend:smoke, test:backend:live, test:backend:all)
 └── scripts/deploy-prod.sh (Stage 1 preflight selection only; Stages 2–5 and rollback strictly preserved)
       │
       ▼
Pytest Execution & Environment Layer
 └── backend/pyproject.toml (pythonpath = ["."], addopts = "-m 'not live'", registered markers: unit, integration, live, smoke)
       │
       ▼
Test Suite Architecture (130 Existing Tests across 32 Files)
 ├── Tier 1 (74 tests) -> Pure unit / deterministic logic (Target < 3.0s)
 ├── Tier 2 (44 tests) -> Local SQLite / router integration / mocked services (Target < 15.0s)
 │    └── Refactored test_research_stage_a_stamps_signal_tier (Mocked LLMGateway -> Tier 2)
 └── Tier 3 (12 tests) -> Risk-triggered live external suite (Target ~3–5 min)
      ├── Smoke Profile (4 existing tests mapped) -> Target < 25.0s
      └── Full Profile (12 existing tests mapped) -> Target ~3–5 min
       │
       ▼
Application Runtime & Persistence Layer
 └── [UNTOUCHED — ZERO BUSINESS LOGIC CHANGES — ZERO SCHEMA MIGRATIONS]
```

---

## 2. Staged Implementation Architecture

### Phase 1: Environment & Tooling Configuration
1. **`backend/pyproject.toml` Standardization**:
   - Specify `pythonpath = ["."]` so module resolution imports `engines`, `routers`, and `storage` seamlessly from any invocation directory.
   - Configure default options to exclude live tests: `addopts = "-ra -q -m 'not live'"`.
   - Register explicit test markers: `unit`, `integration`, `live`, `smoke`.
2. **`package.json` Root Script Standardization**:
   - Define canonical commands targeting the virtual environment at `./backend/.venv/bin/pytest`:
     - `npm run test:backend`: runs offline suite (`-m "not live"`).
     - `npm run test:backend:unit`: runs Tier 1 only (`-m "unit"`).
     - `npm run test:backend:integration`: runs Tier 2 only (`-m "integration"`).
     - `npm run test:backend:smoke`: runs Tier 3 Smoke Profile (`-m "live and smoke"`).
     - `npm run test:backend:live`: runs Full Tier 3 Suite (`-m "live"`).
     - `npm run test:backend:all`: runs all 130 tests (`-o addopts=''`).
     - `npm run test:all`: runs offline backend suite + frontend typecheck.

### Phase 2: Refactoring & Mocking `test_research_stage_a_stamps_signal_tier`
1. Locate `test_research_stage_a_stamps_signal_tier` in `backend/tests/test_llm_gateway.py:485-504`.
2. Apply `unittest.mock.AsyncMock` to `routers.research.generate_response_with_fallback` (or `LLMGateway.generate_object`).
3. Provide a valid mocked JSON payload adhering to the Stage A discovery schema.
4. Verify that the test passes deterministically in < 50ms while rigorously validating the DEF-AI-003 invariant (`evidence_tier == "SIGNAL"`).
5. Mark the test as `@pytest.mark.integration`, moving it into Tier 2.

### Phase 3: Existing-Test Mapping & Test Tier Marking
1. **Mapping Existing Tests (Zero Spurious Test Creation)**:
   - In accordance with the specification constraint, the 12 Tier 3 tests must be mapped directly from existing tests in the repository:
     - `test_research_client.py`: `test_openalex_search`, `test_crossref_search`, `test_europe_pmc_search`, `test_auto_research_problem`.
     - `test_llm_gateway.py`: `test_live_gemini_direct_call`, `test_live_openrouter_fallback_call`, `test_live_gateway_e2e_resilience`.
     - `test_research_discovery.py`: `test_stage_a_discover_endpoint`, `test_stage_a_discover_empty_domains`.
     - `test_research_matrix.py`: `test_literature_matrix_engine`, `test_research_matrix_endpoints`.
     - `test_connectors.py`: `test_federated_search_deduplication`.
   - The implementation agent **MUST NOT** create new live test files or duplicate test harnesses.
2. Apply `@pytest.mark.live` to the 12 live tests.
3. Apply `@pytest.mark.smoke` to the 4 designated smoke tests (`test_openalex_search`, `test_crossref_search`, `test_europe_pmc_search`, `test_live_gemini_direct_call`).
4. Apply `@pytest.mark.unit` to the 74 deterministic unit tests.
5. Apply `@pytest.mark.integration` to the 44 local integration tests.
6. Mechanically verify that:
   - Total collected = 130.
   - Tier 1 (`-m unit`) = 74.
   - Tier 2 (`-m integration`) = 44.
   - Tier 3 (`-m live`) = 12.
   - Offline default (`-m "not live"`) = 118.
   - $74 + 44 + 12 = 130$.

### Phase 4: Operationalizing the Claim-Oriented Evidence Reuse Protocol
1. Document the Change-Impact Authority Protocol within `.agents/skills/convera-verification/SKILL.md` and SDD guidelines.
2. Codify the enhanced Change-Impact Evidence Provenance Record schema requiring commit SHA, command, timestamp, environment state, and claim IDs.
3. Enforce the tightened clean-merge rule: a clean merge may reuse existing evidence only when the merged commit preserves claim-relevant inputs and no environment or dependency changes occurred, confirmed by a Tier 1 smoke test.

### Phase 5: Strictly Bounded Deployment Preflight Optimization
1. Update `scripts/deploy-prod.sh`:
   - Replace exclusively the Stage 1 test command:
     ```bash
     cd backend && ./venv/bin/pytest tests/ -m "not live" -q
     ```
   - **Preserve 100% of the rest of the script**: Stage 2 database backup/migration, Stage 3 docker build, Stage 4 docker compose up, Stage 5 container health probes (`/api/health` and `:3001`), and automatic rollback trap.

---

## 3. Risk Mitigation & Invariant Preservation

| Risk / Failure Mode | Severity | Probability | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Accidental Test Disablement** | High | Low | Invariant check: `pytest --collect-only` must yield exactly 130 tests before and after changes. |
| **Spurious Test Creation Trap** | Medium | Medium | Invariant 6 mandates mapping existing tests first. Zero new test files authorized. |
| **Unintended Deployment Script Drift** | High | Low | Invariant 7 strictly restricts modifications to Stage 1 verification command. Stages 2–5 preserved. |
| **Silent Masking of Real Regressions** | High | Low | Change-Impact Authority rule: any non-empty intersection between changed files and claim dependencies strictly mandates reverification. |
| **False Rejection on Slow Hardware** | Medium | Medium | Performance metrics (< 3s, < 15s) are formally classified as `[ENGINEERING TARGETS]`. |
| **SQLite Worker Contention** | Medium | High | `pytest-xdist` is explicitly deferred, completely eliminating database locking risks. |

---

## 4. Verification & Validation Protocol

The implementation will be verified through five sequential checks:
1. **Mechanical Test Count Collection**:
   - `python -m pytest backend/tests --collect-only -q` $\longrightarrow$ exactly 130 tests.
2. **Tier 1 Isolated Run**:
   - `./backend/.venv/bin/pytest backend/tests -m unit -q` $\longrightarrow$ 74 passed, engineering target < 3.0s.
3. **Tier 2 Isolated Run**:
   - `./backend/.venv/bin/pytest backend/tests -m integration -q` $\longrightarrow$ 44 passed, engineering target < 15.0s.
4. **Offline Default Run**:
   - `./backend/.venv/bin/pytest backend/tests -q` $\longrightarrow$ 118 passed, 12 deselected, engineering target < 10.0s.
5. **Deployment Preflight Verification**:
   - Syntax and command check on `scripts/deploy-prod.sh` confirming only Stage 1 was modified and Stage 5 probes remain intact.
