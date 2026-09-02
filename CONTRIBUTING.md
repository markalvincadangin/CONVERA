# Contributing to RatchetAI

Thank you for your interest in contributing to **RatchetAI**! We welcome contributions from student founders, developers, designers, and researchers in the technopreneurship and startup incubation ecosystem.

---

## 🧭 Code of Conduct
Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in this repository.

---

## 🌳 Git Branching Model

We follow a structured **GitFlow-inspired workflow**:

| Branch | Purpose | Protection Rules |
|---|---|---|
| `main` | Production-ready stable release branch | Protected: Requires PR review + passing CI checks. No direct pushes. |
| `develop` | Integration and staging branch | Active integration branch for incoming features and fixes. |
| `feature/<name>` | New features or UI components | Branched from `develop`, merged back to `develop` via PR. |
| `fix/<name>` | Bug fixes and patches | Branched from `develop`, merged back to `develop` via PR. |
| `docs/<name>` | Documentation improvements | Branched from `develop`, merged back to `develop` via PR. |

```text
main ──────────────────────────────● (v2.0.0 Tagged Release)
       ▲                          ▲
       │ Merge PR (Tagged)        │
develop ──●────────●────────●─────● (Integration & Testing)
            \      /        \    /
  feature/xxx ────●          └──● fix/yyy
```

---

## 📝 Conventional Commit Guidelines

All commit messages MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short imperative summary>

[optional body explaining context or rationale]

[optional footer(s), e.g., Closes #123]
```

### Supported Commit Types:
* `feat`: A new user-facing feature or phase capability
* `fix`: A bug fix or patch
* `docs`: Documentation updates only (`docs/`, `README.md`, etc.)
* `style`: Formatting, missing semi-colons, whitespace changes
* `refactor`: Code restructuring without changing behavior
* `perf`: Performance improvements
* `test`: Adding or correcting tests
* `ci`: CI/CD pipeline changes (`.github/workflows/`)
* `chore`: Maintenance tasks, dependency bumps

---

## 🛠️ Local Development Setup

### 1. Prerequisites
* **Python 3.10+** (Python 3.12 recommended)
* **Node.js 18+** (Node.js 20 recommended) & **npm**
* **Git** and optional **gh** CLI

### 2. Fork and Clone
```bash
git clone https://github.com/<your-username>/RatchetAI.git
cd RatchetAI
git checkout develop
```

### 3. Setup Python Backend
```bash
cd pipeline
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

### 4. Setup Next.js Frontend
```bash
cd ../web
npm install
```

### 5. Run 1-Click Multi-Device Dev Server
```powershell
# From project root:
.\start-dev.ps1
```

---

## 🧪 Testing & Verification Requirements

Before submitting any Pull Request, you **MUST verify that all automated test suites pass**:

```bash
# 1. Run Python pytest suite (10/10 tests must pass)
cd pipeline
python -m pytest tests/

# 2. Run Next.js production build check (0 errors)
cd ../web
npm run build
```

---

## 📬 Pull Request Process

1. Create a descriptive branch from `develop`:
   ```bash
   git checkout -b feature/phase3-socratic-enhancement develop
   ```
2. Make your atomic commits with conventional commit messages.
3. Push your branch to your fork:
   ```bash
   git push origin feature/phase3-socratic-enhancement
   ```
4. Open a Pull Request targeting the **`develop`** branch on `markalvincadangin/RatchetAI`.
5. Fill out the comprehensive [Pull Request Template](.github/pull_request_template.md).
6. Ensure all CI/CD checks pass green.
