# Security Policy

## Supported Versions

We actively maintain and support the following release baselines of CONVERA with security updates:

| Version / Baseline | Status | Description |
| :--- | :--- | :--- |
| **3.0.x (SDD-001 – SDD-023)** | :white_check_mark: **Supported** | Current Active Production Baseline (Research Multi-Engine & Ecosystem Bridge) |
| **2.0.x** | :warning: **Deprecated** | Legacy Venture Track Baseline |
| **< 2.0.x** | :x: **End of Life** | Early Prototype Releases |

---

## Reporting a Vulnerability

The CONVERA engineering team takes platform security, data isolation, and credential hygiene seriously. If you discover a security vulnerability, please report it responsibly:

1. **Do not create a public GitHub issue.**
2. Report the vulnerability privately via [GitHub Private Vulnerability Reporting](https://github.com/markalvincadangin/CONVERA/security/advisories/new) or by contacting the lead maintainer directly.
3. Include:
   - Clear steps to reproduce the issue.
   - Affected subsystem (e.g., LLM Gateway, SQLite WAL Adapter, Ecosystem Sync, or REST API).
   - Sample request payloads or proof of concept.
   - Assessment of potential impact.

---

## Response SLA

* **Initial Acknowledgement:** Within 24–48 hours.
* **Triage & Severity Assessment:** Within 3 business days.
* **Patch & Verification:** Within 7 business days for high/critical vulnerabilities.
* **Public Release & Advisory:** Once verified, patched, and deployed to `main`.

---

## Security Architecture & Best Practices for Deploying CONVERA

CONVERA is built with strict privacy and security invariants (governed by CONVERA Constitution Articles I, IV, VII, and VIII):

1. **Local-First & Offline Resilience (Article VIII)**:
   - CONVERA runs hermetically offline by default. Core research evaluations, evidence scoring, and DAG rendering require zero external telemetry.
2. **Credential Management**:
   - Never commit API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, Notion integration tokens, GitHub PATs) to source control.
   - Always configure environment variables via `backend/.env` using the provided `.env.example` templates.
   - Secret files (`.convera_key`, `*.key`, `.env*`) are strictly excluded in `.gitignore`.
3. **External Ecosystem Isolation (Article IV Human Sovereignty)**:
   - External transmission to Notion, Zotero, or GitHub requires explicit user confirmation in the UI pre-transmission preview modal. CONVERA never sends data outward silently.
4. **Relational Database Protection**:
   - SQLite WAL database files (`*.db`, `*.db-wal`, `*.db-shm`) contain sensitive research ideation state and session history. Ensure file-system permissions restrict read access to authorized host users.
