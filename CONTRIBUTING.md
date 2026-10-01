# 🤝 Contributing to CONVERA

Thank you for your interest in contributing to **CONVERA** (Evidence-Driven Research Intelligence and Multi-Methodology Workflow Orchestration System)! We welcome contributions from researchers, software engineers, methodologists, and thesis candidates in computing, technopreneurship, and applied sciences.

---

## 🧭 Code of Conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in discussions, reporting issues, or opening pull requests.

---

## 🏛️ Development Philosophy: Spec-Driven Agentic Development (SDD)

CONVERA adheres strictly to **Spec-Driven Agentic Development (SDD)** governed by the [CONVERA Constitution](docs/00-foundation/CONSTITUTION.md):

1. **"LLM Last, Not LLM First"**: Never delegate to generative models what can be solved with deterministic logic, rules, search, or classical mathematics.
2. **Article VII Anti-Creep Law**: No new dependencies, technologies, or architectural components may be added without an established problem, trade-off benchmark, and ratified SDD specification.
3. **Hermetic Verification (Article VIII)**: All core capabilities and unit/integration tests must pass 100% offline without mandatory network access or live API tokens.
4. **Epistemic Traceability (Article I & II)**: Every decision, score, and deliverable must be cryptographically hashed (SHA-256) and grounded in verifiable empirical or scholarly evidence.

---

## 🏗️ Repository Architecture Overview

CONVERA is engineered as a decoupled, multi-engine research intelligence platform:

```text
CONVERA/
│
├── backend/                                # Python 3.12+ / FastAPI Intelligence Core
│   ├── connectors/                         # CIIA Academic Harvesters (OpenAlex, Crossref, PubMed, etc.)
│   ├── engines/                            # Multi-Engine Intelligence Subsystems
│   │   ├── decision_engine.py             # Deterministic 4-tier candidate ranking & tie-breaker
│   │   ├── ideation_engine.py             # 4 DSR artifact formulations (March & Smith)
│   │   ├── concept_evaluation_engine.py   # Multi-criteria concept evaluation matrix
│   │   ├── feasibility_engine.py          # Stage F DOST-PCIEERD / SDG compliance & Gate 4 canvas
│   │   ├── cross_stage_critique_engine.py # Adversarial critique & tension detection
│   │   ├── proposal_exporter.py           # Multi-format proposal compilation (MD, LaTeX, HTML)
│   │   ├── session_state_engine.py        # Relational session serialization & resume
│   │   ├── provenance_graph_engine.py     # Multi-tier epistemic DAG engine (6 tiers)
│   │   ├── ecosystem_sync_engine.py       # Notion, Zotero, and GitHub bridge
│   │   ├── evidence_scorer.py             # Dual-literature grounding & freshness scoring
│   │   └── llm_gateway.py                 # Governed multi-provider gateway with synthetic fallback
│   ├── models/                             # Pydantic data schemas & methodology contracts
│   ├── routers/                            # REST API routers (sessions, orchestrator, ecosystem, etc.)
│   ├── storage/                            # SQLite WAL adapter (38 relational tables)
│   ├── tests/                              # Hermetic Pytest Verification Suite (338 tests)
│   └── server.py                           # Canonical FastAPI Application Entrypoint
│
├── web/                                    # Next.js 15 / React 19 / TypeScript / CCDS v2.0
│   ├── src/
│   │   ├── app/                            # App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/
│   │   │   ├── research/cockpit/           # Unified Research Cockpit & Orchestrator HUD
│   │   │   ├── research/provenance/        # Native SVG Interactive Evidence DAG Canvas
│   │   │   ├── research/ecosystem/         # Ecosystem Export Modal (Notion, Zotero, GitHub)
│   │   │   ├── research/sessions/          # Session Persistence Drawer & Resume Banners
│   │   │   ├── problem-bank/               # Problem Bank grid & 4-claim intake modals
│   │   │   └── common/                     # CCDS v2.0 design system components
│   │   ├── services/                       # Type-safe API client layer
│   │   └── types/                          # Canonical TypeScript interfaces matching Pydantic
│   └── package.json
│
├── specs/                                  # Canonical 6-Document SDD Specification Dossiers (001–023)
├── docs/                                   # Architectural Constitutions, Roadmaps & Frameworks
└── .github/                                # GitHub Actions CI & Issue/PR Templates
```

---

## 🌿 Git Branching Model & Workflow

We follow a disciplined **Gitflow / Specification Delivery** model:

| Branch | Purpose | Merge Target | Protection Policy |
| :--- | :--- | :--- | :--- |
| `main` | Production release baseline | N/A | **Protected**: Releases promoted from `develop` only with full regression passing. |
| `develop` | Active integration branch | `main` | **Protected**: All feature branches merge here via non-fast-forward (`--no-ff`). |
| `feature/<sdd>-<name>` | Feature development branch | `develop` | Branched from `develop`. Accompanies a ratified SDD specification. |
| `fix/<name>` | Defect resolution | `develop` | Branched from `develop`. Accompanies regression test. |
| `docs/<name>` | Documentation refresh | `develop` | Branched from `develop`. |

```text
main    ──────────────────────────────────────────────────● (Release SDD-023)
                                                         /
develop ────────────────────────●───────────────────────●
                               /                       /
feature/023-ecosystem ────────┘                       /
                                                     /
docs/portfolio-refresh ─────────────────────────────┘
```

---

## 📝 Conventional Commit Guidelines

All commit messages MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```text
<type>(<scope>): <short imperative description>

[optional body explaining context or rationale]

[optional footer(s), e.g., Refs: SDD-023]
```

### Commit Types:
* `feat`: A new user-facing capability, backend engine, or UI subsystem.
* `fix`: A defect correction accompanied by a regression test.
* `docs`: Documentation updates only (`docs/`, `specs/`, `README.md`).
* `refactor`: Code restructuring without external behavioral changes.
* `test`: Adding or updating automated tests.
* `ci`: CI/CD workflow adjustments (`.github/workflows/`).
* `chore`: Dependency-neutral maintenance.

---

## 💻 Local Developer Setup

### 1. Prerequisites
* **Python 3.12+**
* **Node.js 20+** & **npm**
* **Git**

### 2. Fork and Clone
```bash
git clone https://github.com/markalvincadangin/CONVERA.git
cd CONVERA
```

### 3. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Launch FastAPI development server
uvicorn server:app --reload --port 8000
```
*Backend API docs are live at `http://localhost:8000/docs`.*

### 4. Frontend Setup
```bash
cd ../web

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
*Frontend application is live at `http://localhost:3000`.*

---

## 🧪 Testing & Quality Assurance Requirements

Before opening a Pull Request, you **MUST verify that all verification gates pass cleanly locally**:

```bash
# 1. Full Hermetic Pytest Suite (338 tests, 100% offline passing)
PYTHONPATH=backend pytest backend/tests/ -m "not live" -v

# 2. Frontend TypeScript Typecheck (0 errors)
npm run typecheck --prefix web

# 3. Frontend Production Build (clean compilation)
npm run build --prefix web

# 4. Knowledge Graph AST Synchronization (if code was modified)
graphify update .
```

---

## 🚀 Pull Request Process

1. Create your feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/<sdd-number>-<feature-name>
   ```
2. Implement your changes adhering strictly to the ratified SDD specification dossier under `specs/`.
3. Verify that the test suite passes with 0 regressions.
4. Push your branch and open a Pull Request targeting `develop` on [`markalvincadangin/CONVERA`](https://github.com/markalvincadangin/CONVERA).
5. Complete all items in the [Pull Request Template](.github/pull_request_template.md).
6. Ensure that GitHub Actions CI checks pass green.

---

## 💡 Questions or Need Help?
- Open an [Issue](https://github.com/markalvincadangin/CONVERA/issues) or start a [Discussion](https://github.com/markalvincadangin/CONVERA/discussions).
- Review the [Master Upgrade Charter](docs/01-product/CONVERA_UPGRADE_CHARTER.md) and [AI Evolution Roadmap](docs/04-ai/AI_EVOLUTION_ROADMAP.md).
