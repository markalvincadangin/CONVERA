# 🤝 Contributing to CONVERA

Thank you for your interest in contributing to **CONVERA** (Evidence-Driven Project Intelligence and Multi-Methodology Validation System)! We welcome contributions from student developers, researchers, designers, and faculty advisors in computing, agriculture, and technopreneurship.

---

## 🧭 Code of Conduct
Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in discussions or opening pull requests.

---

## 🏗️ Repository Architecture Overview

CONVERA is architected as a modular, decoupled full-stack platform:

```text
CONVERA/
│
├── backend/                       # Python 3.12 / FastAPI Core Engine
│   ├── engines/                   # Core Analytical & Intelligence Engines
│   │   ├── circumscription_engine.py # Kothari Trapping & Circumscription
│   │   ├── research_client.py     # OpenAlex, Crossref, EuropePMC Client
│   │   ├── srs_generator.py       # IEEE 830 Technical SRS Generator
│   │   ├── devils_advocate.py     # Socratic Mom Test Interrogator
│   │   ├── similarity_engine.py   # TF-IDF & Semantic Similarity
│   │   └── problem_parser.py      # 5-Anchor Problem Extraction
│   ├── routers/                   # REST API Endpoints (Phases, Problems, Gates, Lit)
│   ├── storage/                   # SQLite WAL Database Adapter & Schemas
│   ├── llm_gateway.py             # Multi-Provider Failover Gateway (Gemini, Groq, OpenRouter)
│   └── tests/                     # Hermetic Pytest Suite (81 Tests)
│
├── web/                           # Next.js 15 / React 19 / Tailwind CSS v4 Frontend
│   ├── src/
│   │   ├── app/                   # App Router Entry (page.tsx, layout.tsx)
│   │   ├── components/
│   │   │   ├── layout/            # Navbar, PipelineStepper (Dynamic Command Deck)
│   │   │   ├── common/            # CommandPaletteModal (Ctrl+K), Modal, Scorecard, HUD
│   │   │   ├── problem-bank/      # Problem Bank View & Card Grid
│   │   │   ├── frameworks/research/# DSR Research Workspace & Literature Matrix
│   │   │   ├── phases/            # Innovation Track Phase 1-5 Views & Decision Room
│   │   │   └── deliverables/      # Multi-Methodology Deliverables Studio
│   │   └── services/              # Client API Services (session, problem, research)
│   └── package.json
│
├── docs/                          # Master Specifications & Governing Frameworks
│   ├── frameworks/                # Innovation Pipeline & Academic DSR Frameworks
│   └── CONVERA_MASTER_ARCHITECTURE.md
│
└── .github/                       # GitHub Actions CI & Issue/PR Templates
```

---

## 🌿 Git Branching Model & Workflow

We follow a structured **GitHub Flow / Feature Branch** workflow:

| Branch | Purpose | Protection Policy |
| :--- | :--- | :--- |
| `main` | Production-ready stable release | **Protected**: Requires passing GitHub Actions CI checks before merge. |
| `feature/<name>` | New features, engines, or UI components | Branched from `main`, merged via Pull Request. |
| `fix/<name>` | Bug fixes and patches | Branched from `main`, merged via Pull Request. |
| `docs/<name>` | Documentation updates | Branched from `main`, merged via Pull Request. |

```text
main ───────────────────────────────●─────────────────────● (Releases)
          \                        /                     /
           └── feature/lit-matrix ─┘   └── fix/stepper ──┘
```

---

## 📝 Conventional Commit Guidelines

All commit messages MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```text
<type>(<scope>): <short imperative description>

[optional body explaining context or rationale]

[optional footer(s), e.g., Closes #42]
```

### Commit Types:
* `feat`: A new user-facing capability, phase view, or backend engine.
* `fix`: A bug fix or defect correction.
* `docs`: Documentation updates only (`docs/`, `README.md`, `CONTRIBUTING.md`).
* `style`: Formatting, whitespace, or visual styling changes without logic modification.
* `refactor`: Code restructuring without changing external behavior.
* `perf`: Performance optimization.
* `test`: Adding or correcting automated tests.
* `ci`: CI/CD pipeline changes (`.github/workflows/`).
* `chore`: Dependency updates, build configs, or maintenance.

---

## 💻 Local Developer Setup

### 1. Prerequisites
* **Python 3.11+** (Python 3.12 recommended)
* **Node.js 18+** (Node.js 20 recommended) & **npm**
* **Git** & GitHub CLI (`gh`)

### 2. Fork and Clone
```bash
git clone https://github.com/markalvincadangin/CONVERA.git
cd CONVERA
```

### 3. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
```

### 4. Frontend Setup
```bash
cd ../web

# Install dependencies
npm install

# Start Next.js Development Server
npm run dev
```

---

## 🧪 Testing & Quality Assurance Requirements

Before submitting any Pull Request, you **MUST verify that all tests pass locally**:

```bash
# 1. Backend Hermetic Pytest Suite (All 81 tests must pass)
cd backend
python -m pytest tests/ -q

# 2. Frontend Type Safety & Build Check (0 errors)
cd ../web
npx tsc --noEmit
npm run build
```

---

## 🚀 Pull Request Process

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/dynamic-gap-filter main
   ```
2. Make clean, atomic commits with conventional commit messages.
3. Push your branch to GitHub:
   ```bash
   git push -u origin feature/dynamic-gap-filter
   ```
4. Open a Pull Request targeting `main` on [`markalvincadangin/CONVERA`](https://github.com/markalvincadangin/CONVERA).
5. Complete the [Pull Request Template](.github/pull_request_template.md).
6. Ensure that the **CONVERA CI / Automated Quality Gate** passes green on GitHub Actions.

---

## 💡 Questions or Need Help?
- Open an [Issue](https://github.com/markalvincadangin/CONVERA/issues) or start a [Discussion](https://github.com/markalvincadangin/CONVERA/discussions).
- Check the [Master Architecture Blueprint](docs/CONVERA_MASTER_ARCHITECTURE.md).
