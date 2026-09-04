---
name: convera-verification
description: Engineering verification protocol for CONVERA. Use to execute pytest suites, TypeScript typechecks, schema checks, and closed-loop regression tests.
---

# CONVERA Verification Skill

## Canonical Verification Commands
CONVERA enforces strict 3-tier test separation (74 Tier 1 Unit, 44 Tier 2 Integration, 12 Tier 3 Live = 130 total).

```bash
# 1. Standard Offline Suite (Tiers 1 + 2: 118 tests, ~8.0s) [Default Run]
npm run test:backend

# 2. Tier 1 Deterministic Unit Suite (74 tests, Target < 3.0s)
npm run test:backend:unit

# 3. Tier 2 Local Integration Suite (44 tests, Target < 15.0s)
npm run test:backend:integration

# 4. Tier 3 Preflight Smoke Probe (4 tests, Target < 25.0s)
npm run test:backend:smoke

# 5. Full Tier 3 Suite (12 tests, Target ~3-5 min) [Risk-Triggered / Nightly]
npm run test:backend:live

# 6. Complete Monolithic Suite (All 130 tests)
npm run test:backend:all

# 7. Frontend TypeScript Typecheck
npm run test:frontend

# 8. Complete Offline Verification (Backend Tiers 1+2 + Frontend Typecheck, ~11s)
npm run test:all
```

---

## Claim-Oriented Evidence Reuse Protocol (SDD-005)

### Core Governance Rule
Verification evidence is reusable across SDD gates (Feature Verification, Human Acceptance, develop integration, Promotion, Release, Deployment) if and only if:
$$\Delta(\text{Inputs}) \cap \text{Dependencies}(\text{Claim}) = \emptyset \quad \text{AND} \quad \Delta(\text{Environment}) = \emptyset$$

### Domain Dependency Matrix
- **Domain A (Pure Logic / Engines):** `backend/engines/decision/`, `backend/models/decision.py` $\to$ Tier 1 Unit tests.
- **Domain B (Database & Local Storage):** `backend/storage/`, migrations, route handlers $\to$ Tier 2 Integration tests.
- **Domain C (CIIA Academic Connectors):** `backend/ciia/`, `backend/connectors/` $\to$ Tier 3 Academic Live tests.
- **Domain D (LLM Gateway & Prompts):** `backend/llm_gateway.py`, prompt templates $\to$ Tier 3 Gateway Live tests.
- **Domain E (Frontend UI):** `web/src/` $\to$ Frontend Typecheck (`npm run test:frontend`). Zero backend test invalidation.
- **Domain F (Documentation / Specs):** `docs/`, `specs/`, `*.md` $\to$ Zero code invalidation. All evidence reusable.

### Tightened Clean-Merge Rule
A clean merge may reuse existing evidence when the merged commit preserves previously verified claim-relevant inputs and zero environment, configuration, or dependency changes occurred. The Tier 1 smoke test (`npm run test:backend:unit`, < 3s) serves as the lightweight empirical confirmation of runtime continuity.

### Mandatory Gate Change-Impact Provenance Record
At every SDD gate review, the executing agent or engineer must record:

```markdown
### Change-Impact Evidence Provenance Record
- **Gate Baseline Commit:** `<baseline-sha>`
- **Gate Target Commit:** `<target-sha>`
- **Changed Files (`git diff --name-only <baseline-sha> <target-sha>`):** `[...]`

#### Verification Provenance Trace:
- **Baseline Evidence SHA:** `<commit-where-tests-ran>`
- **Execution Command:** `pytest -m "not live" -q`
- **Execution Result:** `118 passed, 12 deselected, 0 failed in 7.95s`
- **Execution Timestamp:** `<ISO-8601-UTC>`
- **Environment State:** `Python 3.13.14, Linux x86_64, backend/.venv`
- **Applicable Claim IDs:** `[CLAIM-DECISION-DETERMINISM, CLAIM-STORAGE-WAL, ...]`
- **Evidence Tier:** `Tier 1 + Tier 2 (Offline Deterministic)`

#### Impact Assessment:
| Domain | Relevant Tier | Impacted by Changed Files? | Environment Delta? | Gate Decision | Reason for Continued Reusability |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Pure Logic | Tier 1 | No | No | REUSE | Zero diff in engines/ |
| Storage & Routes | Tier 2 | No | No | REUSE | Zero diff in schema/routers |
| Connectors & Gateway | Tier 3 | No | No | REUSE | Zero diff in connectors/gateway |
```

