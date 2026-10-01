## 📋 Pull Request Description

### Summary of Changes
<!-- Provide a clear, concise summary of what this PR accomplishes and why it is needed. -->

### Specification & Roadmap Alignment
<!-- Every non-trivial change must trace to a ratified SDD specification or recorded defect. -->
- **SDD Specification Dossier**: `specs/XXX-.../` (or Closes #)
- **Roadmap Phase**: [ ] Phase A (Evidence)  [ ] Phase B (Orchestration)  [ ] Phase C (Intelligence)  [ ] Phase D (Loop Hardening)  [ ] Phase E (Ecosystem)  [ ] Other / Defect Patch
- **Subsystem**: [ ] Backend Engines  [ ] Storage (SQLite WAL / Tables)  [ ] REST API Router  [ ] Web UI (CCDS v2.0)  [ ] Documentation

---

## 🛡️ Constitutional Invariants & Quality Checklist

### 1. Constitutional Compliance
- [ ] **Article I (Evidence Grounding)**: Outputs, decisions, and claims are empirically or scholastically grounded.
- [ ] **Article IV (Human Sovereignty)**: All destructive actions and external pushes (Notion/Zotero/GitHub) require explicit user preview and confirmation.
- [ ] **Article VII (Anti-Creep Law)**: Exactly 0 new unauthorized dependencies added to `pyproject.toml` or `package.json`.
- [ ] **Article VIII (Degraded & Offline Resilience)**: Core workflows run hermetically offline; dry-run/preview modes operational.
- [ ] **Security**: Zero hardcoded secrets, API keys, or private tokens committed.

### 2. Automated Testing & Verification
- [ ] `PYTHONPATH=backend pytest backend/tests/ -m "not live"` passes with 100% success rate (338+ offline baseline).
- [ ] `npm run typecheck --prefix web` passes with 0 TypeScript errors.
- [ ] `npm run build --prefix web` passes clean Next.js production build.
- [ ] `graphify update .` was run to keep knowledge graph AST synchronized (if code files changed).

---

## 🖼️ Visual Verification (Screenshots / UI Demos)
<!-- If this PR alters user interfaces, attach screenshots or recordings demonstrating the CCDS v2.0 UI. -->

---

## 📌 Reviewer Notes
<!-- Highlight any schema migrations, deterministic mathematical assertions, or edge cases. -->
