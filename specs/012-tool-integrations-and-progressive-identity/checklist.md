# Quality & Verification Checklist: Feature 012

**Feature**: `012-tool-integrations-and-progressive-identity`  
**Classification**: Specification Compliance, Invariant Safety & Regression Checklist  
**Document Status**: 🟢 COMPLETE (Post-Implementation Verification Gate)  

---

## 1. Specification Compliance Checklist

- [x] **CHK-012-01 (Progressive Identity Baseline)**: Anonymous users can create workspaces and perform all core research actions without encountering any login or registration prompt.
- [x] **CHK-012-02 (Seamless Account Claiming)**: Anonymous users can register an account, and their active workspace is automatically bound to their registered account with `role='OWNER'`.
- [x] **CHK-012-03 (Argon2id Password Security)**: All user passwords are encrypted using `passlib[argon2]` with parameters conforming to OWASP 2026 standards ($m=65536, t=3, p=4$); zero plaintext passwords stored.
- [x] **CHK-012-04 (Token Rotation & Cookies)**: Access tokens expire in 15 minutes; refresh tokens are opaque random strings stored as SHA-256 hashes and rotated upon each refresh; delivered in `HttpOnly; SameSite=Lax` cookies.
- [x] **CHK-012-05 (Workspace Sharing Tri-Model)**: The system supports Anonymous Share Code, Single-Use Invite Link (48h TTL), and Read-Only Public View.
- [x] **CHK-012-06 (6-Role RBAC Enforcement)**: Endpoint and UI controls strictly enforce permissions for `OWNER`, `ADMIN`, `MEMBER`, `ADVISOR`, `VIEWER`, and `ANONYMOUS`.
- [x] **CHK-012-07 (Symmetric Key Vault)**: API keys and integration tokens are encrypted using Fernet (AES-128-CBC + HMAC-SHA256); zero plaintext keys appear in SQLite tables or API response payloads.
- [x] **CHK-012-08 (Master Key Derivation)**: Master key is sourced from `CONVERA_MASTER_KEY` or auto-generated at `/data/.convera_key` with `chmod 600` permissions.
- [x] **CHK-012-09 (Dynamic AI Cascade Reload)**: Modifying AI provider priority or keys updates the gateway in memory immediately without requiring server restarts.
- [x] **CHK-012-10 (Zotero Reference Connector)**: `ZoteroConnector` ingests collections, DOIs, and BibTeX citations into `literature_evidence` / `problem_sources`.
- [x] **CHK-012-11 (Notion & Hypothesis Connectors)**: Structured notes and web annotations are ingested as traceable problem signals.
- [x] **CHK-012-12 (ORCID Identity Connector)**: Verified academic works are imported read-only using ORCID Public API v3.
- [x] **CHK-012-13 (Docker Compose v2 Topology)**: 4-service compose topology (`backend`, `web`, `ollama`, `model-bootstrap`) runs cleanly with internal network isolation and persistent named volumes.

---

## 2. Constitutional & Epistemic Safety Checklist

- [x] **INV-012-01 (Knowledge ≠ Workflow - Art. I)**: Zero mutations to existing 24 relational tables; 7 new tables added purely additively.
- [x] **INV-012-02 (Tri-Part Decoupling - Art. II)**: External AI provider configuration does not alter the decoupling between model certainty ($C_{\text{AI}}$), evidence strength ($S_{\text{EVID}}$), and decision conviction ($C_{\text{DEC}}$).
- [x] **INV-012-03 (Provenance Lineage - Art. III)**: Every item imported via Zotero, Notion, or Hypothesis carries source ID, author, extraction timestamp, and initial status `UNVERIFIED`.
- [x] **INV-012-04 (Non-Destructive Audit - Art. IV)**: Account deletions do not destroy shared workspace historical records; sync events are immutably logged in `sync_log`.
- [x] **INV-012-05 (External Boundary - Art. V)**: External services supply ephemeral signals; CONVERA exclusively owns context, claims, and decision records.
- [x] **INV-012-06 (Free-First Baseline - Art. VI)**: System executes 100% offline using local Ollama model (`llama3.2:3b`) without requiring paid cloud API keys.
- [x] **INV-012-07 (No Dark Architectures - Art. VII)**: All tables, routers, and docker containers match the canonical specification `CONVERA-ENG-012`.
- [x] **INV-012-08 (Human Sovereignty - Art. VIII)**: Quality gates, ownership transfers, and mentor sign-offs require authenticated human action.

---

## 3. Regression & Test Gate Checklist

- [x] **REG-012-01 (Tier 1 Unit Suite)**: `backend/tests/test_credential_vault.py` passes 100% (`npm run test:backend:unit`).
- [x] **REG-012-02 (Tier 2 Integration Suite)**: `backend/tests/test_storage_schema_012.py` passes 100% against isolated test SQLite WAL database.
- [x] **REG-012-03 (Baseline Regression)**: All 218 backend tests pass with zero failures (218 passed in 39.81s via `npm run test:backend`).
- [x] **REG-012-04 (Frontend Typecheck)**: Next.js 15 TypeScript typecheck passes with zero errors (`npm run test:frontend`).
- [x] **REG-012-05 (Docker Healthcheck)**: Docker Compose configuration syntax and dependencies validated with `docker compose config`.
- [x] **REG-012-06 (Knowledge Graph Sync)**: Knowledge graph updated cleanly with 6,060 nodes and 8,820 edges (`graphify update .`).
