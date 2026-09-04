# CONVERA — Deployment & Operational Topology Specification

**Document ID**: `CONVERA-OPS-001`  
**Classification**: Deployment Specification & Operational Boundary Contract  
**Authority Tier**: Tier 3 Procedural, governed by Tier 1 Constitution and Tier 2 architecture  
**Status**: Draft for Phase 8 Step 2 ratification  
**Canonical Path**: `docs/08-operations/DEPLOYMENT.md`  
**Upstream Dependencies**: `CONSTITUTION.md` (Articles I–VIII), `SYSTEM_ARCHITECTURE.md`, `SECURITY.md`, `AI_ARCHITECTURE.md`, `CIIA.md`, `CONNECTOR_ARCHITECTURE.md`, `MCP.md`, `DATA_ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `DEVELOPMENT_WORKFLOW.md`  
**Downstream Dependents**: `MONITORING.md`, `BACKUP_DISASTER_RECOVERY.md`, release procedures, deployment automation

---

## 1. Scope, Authority, and Statement Classes

This specification defines how CONVERA is prepared, started, exposed, verified, recovered, and bounded in operational environments. It does not authorize source-code changes, alter canonical data, or redefine the inquiry tracks. SDD remains the engineering method for changing deployment capability; it is not an operational workflow or a research-track stage.

| Class | Meaning in this document |
| :--- | :--- |
| **`[NORMATIVE]`** | A required deployment constraint derived from ratified authority. |
| **`[IMPLEMENTED]`** | Behavior observed in the active repository on 2026-09-04. |
| **`[TARGET]`** | Intended capability or profile that requires a separately verified implementation. |
| **`[VERIFICATION]`** | A repeatable inspection or validation gate; passing it is evidence, not self-ratification. |

When doctrine, documentation, and implementation disagree, the Constitution's Article VII applies: the conflict is a ratification defect. This document records the discrepancy and does not silently upgrade a target into an implemented production feature.

### 1.1 Deployment invariants

- **`[NORMATIVE]` Local-first sovereignty.** The canonical knowledge graph, provenance, decision history, and gate state remain under CONVERA's storage boundary. External providers are compute or retrieval signals, not owners of truth.
- **`[NORMATIVE]` Evidence before assertion.** Runtime health, provider availability, successful startup, and deployment suitability must be measured and reported; they must not be inferred from configuration alone.
- **`[NORMATIVE]` Truthful degradation.** Reduced functionality, failed egress, synthetic output, or unavailable persistence must be visible to the operator and must never be represented as verified evidence.
- **`[NORMATIVE]` Non-destructive lineage.** Deployment, rollback, schema initialization, and recovery procedures must preserve historical provenance and audit records. A rollback restores a known application version; it does not delete or rewrite canonical history.
- **`[NORMATIVE]` SDD orthogonality.** Deployment changes require specification, planning, implementation, and verification through SDD. They do not alter the Innovation or Research Track's canonical entities or gates.

---

## 2. Observed Runtime Topology

```text
Browser
  │  :3000 (development or Next.js production server)
  ▼
Next.js web application
  │  /api/* rewrite when NEXT_PUBLIC_API_URL is empty
  ▼
FastAPI application (:8000)
  ├── SQLiteStorageAdapter → SQLite WAL database
  ├── optional DATABASE_URL branch → PostgreSQL adapter import
  ├── LLM gateway → configured cloud provider endpoints and/or local Ollama
  ├── scholarly connectors → public scholarly APIs
  └── MCP stdio process → external MCP client, when explicitly launched
```

- **`[IMPLEMENTED]`** The backend FastAPI application is `backend/server.py`, exposing `/api/health` and `/api/models/status` plus modular API routers.
- **`[IMPLEMENTED]`** The web application is `web/`, with Next.js `15.2.0`, React `19`, and the scripts `npm run dev`, `npm run build`, and `npm run start`.
- **`[IMPLEMENTED]`** `web/next.config.ts` rewrites `/api/:path*` to `http://127.0.0.1:8000/api/:path*`. `web/src/lib/api-client.ts` uses `NEXT_PUBLIC_API_URL` when set, otherwise relative `/api` paths.
- **`[IMPLEMENTED]`** `backend/mcp_server.py` is a separate JSON-RPC-over-stdio process. It is not mounted as an HTTP route and is not started by the FastAPI or Next.js startup commands.
- **`[TARGET]`** A hardened production reverse-proxy topology, TLS termination, process supervision, and access control require explicit implementation and verification. No Dockerfile, Compose file, Nginx configuration, systemd unit, Vercel configuration, or Render blueprint is present in the repository as of this specification.

---

## 3. Deployment Profiles

### 3.1 Local development

- **`[IMPLEMENTED]`** Intended topology: a FastAPI backend at port `8000` and a Next.js development server at port `3000`.
- **`[IMPLEMENTED]`** Repository commands: from the repository root, `npm run dev:backend` starts `python -m uvicorn server:app --reload --port 8000` from `backend/`; `npm run dev:frontend` starts the web development server.
- **`[NORMATIVE]`** Use a non-production database path for exploratory work when preserving a production lineage matters. Never treat a development database as a backup or production restore point.
- **`[VERIFICATION]`** Confirm `/api/health`, an authenticated/authorized workflow appropriate to the deployment, persistence after restart, and the frontend API path before accepting the environment for use.

### 3.2 Local or on-premise production

- **`[TARGET]`** Run the built web application (`npm run build`, then `npm run start`) and an independently supervised FastAPI process, with database files on local persistent storage and network exposure restricted by an explicit reverse proxy or host firewall.
- **`[NORMATIVE]`** The database path must be local, durable, access-controlled, and excluded from source control. The SQLite database, `-wal`, and `-shm` companion files belong to one persistence unit.
- **`[IMPLEMENTED]`** The current FastAPI CORS middleware allows all origins with credentials, and the application defaults to host `0.0.0.0` when invoked through `backend/server.py`. Treat direct LAN or internet exposure as unapproved until CORS, authentication, TLS, and network policy are hardened through a ratified change.

### 3.3 Self-hosted container or VPS deployment

- **`[TARGET]`** A self-hosted deployment may package the web server and backend as separate services and mount a persistent data directory for SQLite, or use an operational PostgreSQL service after its adapter is implemented and tested.
- **`[TARGET]`** A container/VPS deployment must document image pinning, process health checks, TLS, secret injection, least-privilege runtime users, persistent volumes, egress policy, backup/restore, and upgrade/rollback behavior before it is called supported.
- **`[VERIFICATION]`** No Docker or Compose artifacts currently exist. A container/VPS profile therefore cannot pass an implementation verification gate until those artifacts and their tests are added under SDD.

### 3.4 Offline, air-gapped, or degraded operation

- **`[IMPLEMENTED]`** Canonical SQLite WAL persistence can operate without cloud network access when its local data path is available.
- **`[IMPLEMENTED]`** `LLM_PROVIDER=ollama` selects an OpenAI-compatible endpoint at `OLLAMA_BASE_URL` (default `http://localhost:11434/v1`) using `OLLAMA_MODEL` (default `llama3.2`). This permits local inference only when an Ollama-compatible local service is separately installed, running, and loaded with the selected model.
- **`[NORMATIVE]`** In offline operation, unavailable scholarly retrieval and cloud model capability must be reported as unavailable or degraded; no fabricated citations or implicit cloud fallback is permitted.
- **`[TARGET]`** The ratified AI doctrine requires automatic progression to local Ollama and, if all providers fail, an explicitly marked non-evidentiary synthetic fallback (`is_degraded=true`). The active `generate_with_meta()` implementation instead attempts configured cloud providers and raises an error when they all fail; it does not append Ollama as an automatic fallback and does not implement the documented synthetic terminal fallback. This profile is therefore partial, not fully implemented.

---

## 4. Prerequisites and Build Procedures

### 4.1 Required runtime components

| Component | Requirement | Classification |
| :--- | :--- | :--- |
| Python | Python 3.12-compatible runtime and backend dependencies from `backend/requirements.txt` or `backend/pyproject.toml`. | `[IMPLEMENTED]` |
| Node.js | Node.js version compatible with the checked-in Next.js `15.2.0` application and its lockfile. | `[IMPLEMENTED]` |
| SQLite | Writable local filesystem suitable for SQLite WAL files. | `[IMPLEMENTED]` |
| LLM provider | At least one configured provider credential or a running local Ollama-compatible endpoint for model-backed functions. | `[IMPLEMENTED]` |
| Network egress | Required only for enabled cloud LLMs and scholarly connector APIs. | `[IMPLEMENTED]` |
| TLS/reverse proxy | Needed when serving outside a controlled local boundary. | `[TARGET]` |

### 4.2 Backend startup

```powershell
# from repository root
cd backend
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```

- **`[IMPLEMENTED]`** `server:app` is the HTTP application entry point. `backend/main.py` is a separate interactive CLI entry point and is not the web-service runtime.
- **`[NORMATIVE]`** Do not use reload mode for a production service. The repository development command includes `--reload`; the production command above intentionally does not.
- **`[TARGET]`** Add a service manager or container entry point only with explicit lifecycle, restart, logging, and least-privilege semantics.

### 4.3 Frontend build and startup

```powershell
# from repository root
npm install --prefix web
npm run build --prefix web
npm run start --prefix web
```

- **`[IMPLEMENTED]`** The web package supplies the build and start scripts above.
- **`[NORMATIVE]`** Set build-time public configuration deliberately. `NEXT_PUBLIC_*` values can be embedded in a client build and must never contain secrets.
- **`[VERIFICATION]`** Load the web application and verify a representative API request uses either the configured `NEXT_PUBLIC_API_URL` or the relative rewrite path, without exposing provider credentials in browser assets.

---

## 5. Configuration and Secrets

### 5.1 Configuration matrix

| Variable | Purpose | Observed default or behavior |
| :--- | :--- | :--- |
| `SQLITE_PATH` | SQLite database location. | `<backend>/ratchetai.db` when unset in `storage/factory.py`. |
| `DATABASE_URL` | Requests a PostgreSQL adapter for `postgresql://` or `postgres://` URLs. | Adapter module is absent; import failure falls back to SQLite. |
| `HOST`, `PORT` | Values read by `backend/server.py` when that file is run directly. | `0.0.0.0`, `8000`. |
| `NEXT_PUBLIC_API_URL` | Browser-side backend base URL override. | Empty uses relative `/api` calls; rewrite targets loopback backend. |
| `LLM_PROVIDER` | Preferred provider selection. | `gemini`, `groq`, `openrouter`, or `ollama`; defaults to `gemini`. |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY`, `GEMINI_MODEL` | Gemini credentials and model selection. | Key falls back from `GEMINI_API_KEY` to `GOOGLE_API_KEY`. |
| `GROQ_API_KEY`, `GROQ_MODEL` | Groq credentials and model selection. | Used when configured. |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` | OpenRouter credentials and model selection. | Used when configured. |
| `OLLAMA_BASE_URL`, `OLLAMA_MODEL` | Local OpenAI-compatible Ollama endpoint and model. | `http://localhost:11434/v1`, `llama3.2`. |

### 5.2 Secret controls

- **`[NORMATIVE]`** Store secrets only in a host-level secret manager, protected environment, or local untracked `.env` file with restrictive filesystem permissions. Do not commit actual keys, database credentials, or production connection strings.
- **`[IMPLEMENTED]`** The backend loads `backend/.env`; the LLM gateway also loads backend- and repository-root `.env` files. This broad loading behavior increases the need to scope file permissions and deployment working directories carefully.
- **`[NORMATIVE]`** `NEXT_PUBLIC_*` variables are not secret storage. Provider keys and `DATABASE_URL` must never be prefixed `NEXT_PUBLIC_`.
- **`[VERIFICATION]`** Inspect tracked files, build output, startup logs, error responses, and deployment environment definitions for credential values or connection strings before releasing an environment.

---

## 6. Persistence, Initialization, and Schema Evolution

### 6.1 SQLite WAL

- **`[IMPLEMENTED]`** `SQLiteStorageAdapter` initializes a connection with `PRAGMA journal_mode=WAL`, `PRAGMA synchronous=NORMAL`, and `PRAGMA foreign_keys=ON`; it uses a `30` second timeout.
- **`[IMPLEMENTED]`** Adapter construction calls `_init_db()`, which applies additive `CREATE TABLE IF NOT EXISTS` initialization and selected column checks. This is an initialization mechanism, not a versioned migration framework.
- **`[NORMATIVE]`** Persist the database file and its contemporaneous WAL/SHM files together. Do not place an active SQLite WAL database on storage with uncertain locking or durability semantics.
- **`[NORMATIVE]`** Run schema initialization before accepting writes, and retain a recoverable pre-upgrade snapshot. Schema changes must be additive, traceable, and validated through SDD; destructive manual DDL is prohibited without human authorization and a tested recovery plan.

### 6.2 Optional PostgreSQL

- **`[IMPLEMENTED]`** The storage factory recognizes a PostgreSQL URL and attempts to import `PostgresStorageAdapter`.
- **`[IMPLEMENTED]`** `backend/storage/postgres_adapter.py` is absent from the active repository. The factory catches the resulting error and initializes SQLite instead.
- **`[TARGET]`** PostgreSQL, Neon, Supabase, Render, and other managed-database deployment are not supported production targets until a compatible adapter, schema initialization/migration path, transactional tests, configuration documentation, and operational verification are implemented.
- **`[VERIFICATION]`** A declared PostgreSQL environment must prove that the selected storage adapter is PostgreSQL, that all canonical tables and constraints exist, and that restart/rollback preserve lineage. `/api/health` currently hard-codes `storage: SQLite WAL`; it cannot satisfy that verification by itself.

---

## 7. AI, Connectors, and MCP Boundaries

### 7.1 CIIA provider cascade

- **`[NORMATIVE]`** Provider output is inference, not evidence or ratification. C_AI, S_EVID, and C_DEC remain independent.
- **`[IMPLEMENTED]`** The gateway can call Gemini, Groq, OpenRouter, or an explicitly selected Ollama endpoint. It returns provider/model/latency metadata for successful calls.
- **`[IMPLEMENTED]`** When configured cloud calls fail, the current gateway tries entries already in its constructed cascade and then raises `RuntimeError`; it does not provide a verified system-wide readiness probe.
- **`[TARGET]`** Implement the canonical automatic cascade and terminal synthetic fallback specified in `AI_ARCHITECTURE.md`, with explicit `is_degraded`, non-evidentiary marking, user-visible status, and tests. Until then, operations must surface a provider failure rather than claim synthetic continuity.

### 7.2 Scholarly connectors and egress

- **`[IMPLEMENTED]`** The typed connector package contains OpenAlex, Crossref, PubMed, and Semantic Scholar connectors. Their network calls require outbound HTTPS and depend on the availability and policies of those services.
- **`[IMPLEMENTED]`** A separate `FreeResearchClient` includes Europe PMC retrieval behavior. This differs from the typed connector package and is an architecture/documentation alignment risk.
- **`[NORMATIVE]`** External retrieved material remains an untrusted signal until provenance and verification requirements are met. Network failure, rate limiting, or access restrictions must not create synthetic citations or positive evidence weight.
- **`[VERIFICATION]`** For an egress-enabled profile, test each enabled connector with a benign query, record the observed outcome, and verify failures are visible. For air-gapped mode, confirm no egress is attempted by the selected workflow and that unavailable research is truthfully reported.

### 7.3 MCP daemon

- **`[IMPLEMENTED]`** `backend/mcp_server.py` exposes seven declared tools over stdio, including knowledge, unknowns, decisions, confidence, gap, traceability, and literature operations.
- **`[NORMATIVE]`** Launch the MCP server as a separate, least-privilege process with the same protected storage and secret boundaries as the backend. Do not expose its stdio transport directly to an untrusted network.
- **`[TARGET]`** A managed MCP service, HTTP transport, independent health endpoint, lifecycle supervisor, and client authorization policy are not implemented in this repository.

---

## 8. Routing, Health, and Readiness

### 8.1 Frontend/backend routing

- **`[IMPLEMENTED]`** When `NEXT_PUBLIC_API_URL` is empty, browser API calls are relative and rely on the Next.js rewrite to a loopback FastAPI server. This topology requires both processes to share a host or for the rewrite destination to be changed under an approved deployment design.
- **`[TARGET]`** A split-host frontend/backend deployment requires explicit configuration, TLS, CORS tightening, routing, and browser-origin verification. It must not rely on the fixed loopback rewrite.

### 8.2 Health and readiness gate

| Check | Current evidence | Deployment interpretation |
| :--- | :--- | :--- |
| `GET /api/health` | Returns a static healthy response and metadata. | Liveness indicator only; it does not query database connectivity or provider availability. |
| `GET /api/models/status` | Returns active gateway configuration information. | Configuration/status aid; validate its exact response and never treat it as a successful inference proof. |
| SQLite open/write/restart | Not represented by the HTTP health response. | Required readiness verification for SQLite-backed profiles. |
| Frontend API request | Requires browser validation. | Required routing and CORS verification. |
| Connector/provider call | Requires controlled real or mocked request. | Required only for a profile that enables that egress capability. |

- **`[NORMATIVE]`** Deployment readiness must report distinct state for application process, persistence, frontend routing, provider capability, connector egress, and MCP availability. A single `healthy` string cannot collapse these concerns.
- **`[TARGET]`** Implement structured liveness/readiness endpoints and deployment probes before automated production orchestration is declared supported.

---

## 9. Deployment Validation Gates

An operator may declare a profile operational only after recording the applicable gates below. A passing gate does not ratify architecture changes.

1. **`[VERIFICATION] Build integrity`**: dependency installation and backend/frontend build or startup complete using pinned project artifacts.
2. **`[VERIFICATION] Configuration safety`**: required variables are present; secrets are absent from tracked files, browser output, logs, and diagnostics.
3. **`[VERIFICATION] Persistence integrity`**: active adapter and database path are known; SQLite WAL initializes; a test write is retained after a clean restart; foreign keys operate.
4. **`[VERIFICATION] Routing integrity`**: frontend reaches the intended backend without unintentionally routing public traffic to `127.0.0.1`.
5. **`[VERIFICATION] Capability truthfulness`**: enabled provider and connector behavior is observed; unavailable features are labeled unavailable or degraded.
6. **`[VERIFICATION] Security boundary`**: service binds only to approved interfaces; TLS/proxy policy, CORS, firewall, filesystem permissions, and MCP client boundaries meet the selected profile.
7. **`[VERIFICATION] Lineage safety`**: deployment and rollback tests show no destructive mutation of provenance, decisions, or audit history.

---

## 10. Rollback and Failure Handling

### 10.1 Rollback

- **`[NORMATIVE]`** Prefer an additive, reversible release model: preserve the prior application artifact and a verified pre-change data recovery point before upgrade.
- **`[NORMATIVE]`** Roll back application code/configuration independently from canonical data whenever possible. Do not use source checkout/reset actions to erase a production data path.
- **`[TARGET]`** Automated release rollback is not implemented. Its design belongs in a later SDD change with monitoring and backup/DR evidence.

### 10.2 Failure actions

| Failure | Required operational response |
| :--- | :--- |
| Backend unavailable | Mark API unavailable; preserve diagnostics without secrets; do not claim frontend functionality. |
| SQLite open/lock/write failure | Stop write-dependent operations, retain files for investigation, and follow the later Backup/DR procedure; do not create an empty replacement database over the affected path. |
| PostgreSQL configuration | Treat as failed PostgreSQL selection and verify the actual fallback adapter; do not assume cloud persistence occurred. |
| Cloud provider or connector failure | Surface failure; attempt only verified configured behavior; treat AI output as non-evidence unless provenance and verification requirements are met. |
| Ollama unavailable | Report local inference unavailable. Do not assert an automatic synthetic fallback in the current implementation. |
| Frontend/backend route failure | Validate `NEXT_PUBLIC_API_URL`, Next.js rewrite, host topology, TLS, and CORS; do not expose the backend broadly as an expedient workaround. |
| MCP process failure | Mark MCP tools unavailable while preserving the HTTP application boundary; restart only through the approved process supervisor once implemented. |

---

## 11. Security Boundaries and Operational Limitations

- **`[NORMATIVE]`** Keep public services behind authenticated, authorized, TLS-protected boundaries. The current repository does not establish a complete production authentication or reverse-proxy design in this deployment specification.
- **`[IMPLEMENTED]`** FastAPI CORS is currently permissive (`allow_origins=["*"]` with credentials). This is incompatible with treating the backend as safely public by default.
- **`[IMPLEMENTED]`** The `/api/health` response reports `SQLite WAL` regardless of a requested PostgreSQL path and does not test storage health. It must not be used as evidence that the configured database is active.
- **`[IMPLEMENTED]`** No container, Compose, system-service, managed-platform, formal migration, deployment automation, backup/restore, or observability artifact is present.
- **`[NORMATIVE]`** Do not classify Vercel, Render, or any managed host as supported merely because `DATABASE_URL` examples mention providers. Support requires the verification gates in this document and a ratified implementation.

---

## 12. Unresolved Risks for Subsequent Phase 8 Steps

1. **`[TARGET] Monitoring`**: Replace static health reporting with measured component readiness, provider/connector health, storage status, structured failure signals, and secret-safe operational logs.
2. **`[TARGET] Backup and DR`**: Define consistent SQLite WAL backup, restore, integrity-check, retention, encryption, recovery-point, and recovery-time procedures that preserve lineage.
3. **`[TARGET] PostgreSQL`**: Implement and test the missing adapter, schema strategy, migration path, and truthful health reporting before enabling a managed PostgreSQL target.
4. **`[TARGET] Provider degradation`**: Align the gateway's actual cascade with ratified automatic Ollama and synthetic fallback doctrine, including explicit degraded metadata and tests.
5. **`[TARGET] Production perimeter`**: Define authentication, CORS allow-lists, TLS, reverse proxy, service supervision, network segmentation, and least-privilege execution before public or multi-tenant deployment.
6. **`[TARGET] Connector reconciliation`**: Reconcile the five-service ratified connector doctrine with the four typed connector classes and the separate Europe PMC research client.

---

## 13. Ratification Record

This document is ready for human review as the Phase 8 Step 2 deployment baseline. It deliberately distinguishes current repository evidence from target doctrine and must be revised when the unresolved risks above receive a specified, implemented, and verified resolution.

| Version | Date | Change | Status |
| :--- | :--- | :--- | :--- |
| `0.1.0` | `2026-09-04` | Initial evidence-backed deployment specification; records implementation/doctrine gaps for Phase 8 monitoring and backup/DR. | Draft for ratification |
