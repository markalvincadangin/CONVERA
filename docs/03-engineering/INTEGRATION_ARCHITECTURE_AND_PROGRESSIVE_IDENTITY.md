# CONVERA - Integration Architecture & Progressive Identity Specification

**Document ID**: `CONVERA-ENG-012`  
**Classification**: System Architecture, Identity, External Connectors & Deployment  
**Authority Tier**: Tier 2 Engineering Specification  
**Document Status**: 🟢 RATIFIED FOR IMPLEMENTATION  
**Implementation Status**: 🟡 SPECIFIED (SDD-012)  
**Canonical Path**: `docs/03-engineering/INTEGRATION_ARCHITECTURE_AND_PROGRESSIVE_IDENTITY.md`  
**Upstream Dependencies**:  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, IV, V, VI, VII, VIII)
- `docs/03-engineering/ENGINEERING_PRINCIPLES.md` (Principles 1–8)
- `docs/03-engineering/DEVELOPMENT_WORKFLOW.md`
- `docs/03-engineering/SDD_WORKFLOW.md`
- `docs/03-engineering/SECURITY.md`
- `docs/02-system/SYSTEM_ARCHITECTURE.md`

---

## 1. Executive Summary & Design Rationale

CONVERA is an epistemic research formulation and decision engine. It does not seek to replace established scholarly tools (such as Zotero, Notion, Hypothesis, or ORCID); instead, it acts as an **orchestration, synthesis, and epistemic evaluation layer** that connects to existing research ecosystems.

This specification authoritatively ratifies four foundational capabilities for the platform:
1. **Progressive Identity Model**: Workspaces remain usable without friction or mandatory account walls (preserving Constitution Article VI: Free-First Posture). Registration is an opt-in *capability unlock* that enables durable identity, workspace sharing, encrypted credential vaults, and multi-workspace management.
2. **Workspace Sharing & Multi-Tenancy**: Three distinct sharing mechanisms (Anonymous Share Code, Granular Role-Based Invite Links, and Read-Only Public View Links) governed by a 6-role permission matrix (RBAC).
3. **Encrypted Credential Vault & AI Provider Onboarding**: Symmetric cryptographic storage (Fernet AES-128-CBC + HMAC-SHA256) for AI provider keys and third-party integration tokens, with an in-memory dynamic cascade reload mechanism replacing flat `.env` file restarts.
4. **Docker Local Deployment**: A 4-service Docker Compose topology (`convera-backend`, `convera-web`, `convera-ollama`, `convera-model-bootstrap`) enabling zero-cost local execution with optional GPU acceleration.

---

## 2. Progressive Identity Architecture

### 2.1 The Progressive Identity Axiom
In alignment with **Constitution Article VI** (*"every core capability must be 100% operational using local storage"*), registration is **not** an access gate; it is a **capability unlock**.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                       CONVERA IDENTITY SPECTRUM                        │
│                                                                        │
│   Layer 1: ANONYMOUS (Zero-Friction Default)                          │
│   ├── No registration, no password, no email required                  │
│   ├── UserProfile saved in client localStorage                         │
│   ├── Access workspaces via share_code + optional passcode             │
│   ├── Full access to problem modeling, claims, evidence, and export    │
│   └── Actions attributed to "Anonymous (self-declared name)"           │
│                                                                        │
│                    ▲ User chooses to register (Opt-In)                 │
│                    │                                                   │
│   Layer 2: REGISTERED (Durable Account)                               │
│   ├── Email + Argon2id password hash in SQLite WAL                     │
│   ├── JWT Access Token (15-min TTL) in HttpOnly/Secure/Lax cookie      │
│   ├── Opaque Refresh Token (7-day TTL) with SHA-256 hash & rotation   │
│   ├── Actions durably attributed in immutable audit logs               │
│   ├── Unlocks Encrypted Credential Vault (saving private API keys)     │
│   ├── Unlocks generation of granular Workspace Invite Links            │
│   └── Unlocks multi-workspace ownership and switching                 │
│                                                                        │
│                    ▲ Promoted or Workspace Creator                     │
│                    │                                                   │
│   Layer 3: WORKSPACE OWNER / ADMIN (Governance Authority)             │
│   ├── Manage member roster and assign granular roles                   │
│   ├── Configure workspace-level AI provider cascade overrides          │
│   ├── Connect and synchronize third-party tools (Zotero, Notion)       │
│   └── Oversee phase transitions and formal gate sign-offs              │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Workspace Sharing Modalities

| Sharing Mode | Registration Required? | Access Token / Key | Primary Use Case | Governance & Audit Level |
|:---|:---:|:---|:---|:---|
| **Share Code** | No | 8-character code + optional 4-digit PIN | Capstone team collaboration, quick peer review | Self-declared identity; logged as anonymous peer |
| **Invite Link** | Yes | Cryptographic 32-byte single-use token (`INV-...`) | Faculty mentor, research co-author, co-investigator | Verified user identity; strict RBAC role enforcement |
| **Public View** | No | Read-only workspace slug / token | Thesis defense presentation, open science showcase | Strictly unauthenticated read-only; zero mutation |

---

## 3. Role-Based Access Control (RBAC) Matrix

| Capability | OWNER | ADMIN | MEMBER | ADVISOR | VIEWER | ANONYMOUS |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Workspace Settings & Deletion** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Invite / Remove Members** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Transfer Ownership** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AI Provider Cascade Config** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Connect Integration (Zotero/Notion)**| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create / Edit Problems & Claims** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (if passcode matches) |
| **Add Evidence / Academic Sources** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (if passcode matches) |
| **Execute AI Synthesis** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (if passcode matches) |
| **Advance Quality Gates (1–4)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mentor Sign-off / Review Endorsement**| ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Read Workspace Content** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (if passcode matches) |
| **Export Synthesis & Reports** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (if passcode matches) |

---

## 4. Cryptographic Security & Vault Architecture

### 4.1 Master Key & Symmetric Encryption
CONVERA enforces encryption-at-rest for all sensitive credentials (AI provider keys, Notion Integration Tokens, Zotero API Keys):
- **Cipher Suite**: Fernet symmetric encryption specification (AES-128-CBC encryption, PKCS7 padding, HMAC-SHA256 message authentication).
- **Key Derivation & Hierarchy**:
  1. Primary key loaded from `CONVERA_MASTER_KEY` environment variable.
  2. If unset, key auto-generated on first boot and persisted to `/data/.convera_key` with strict filesystem permissions (`chmod 600`).
  3. The encryption master key is never committed to Git, logged, or returned across API boundaries.

### 4.2 Authentication Token Lifecycle
- **Access Tokens**: Short-lived (15 minutes), signed using HMAC-SHA256 (`HS256`). Delivered exclusively via `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookies to mitigate Cross-Site Scripting (XSS).
- **Refresh Tokens**: Opaque 48-byte cryptographically secure random strings. Stored as SHA-256 hashes in `refresh_tokens`. Implements **mandatory token rotation**: every refresh request consumes the existing token and issues a fresh pair, detecting and invalidating replayed tokens.
- **Password Hashing**: Argon2id via `passlib[argon2]` (OWASP recommendation: $m=65536$ KiB, $t=3$ iterations, $p=4$ parallelism lanes).

---

## 5. Relational Persistence Schema (Additive Extension)

In compliance with **Architecture Invariant 4** and **Constitution Article I**, all 24 existing SQLite WAL tables are untouched. Exactly 7 new tables are introduced:

```sql
-- 1. Persistent User Accounts
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT '👩‍💻',
    system_role TEXT NOT NULL DEFAULT 'USER',
    is_active INTEGER DEFAULT 1,
    preferences_json TEXT DEFAULT '{}',
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. Rotating Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    device_info TEXT,
    is_revoked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- 3. Granular Workspace Memberships
CREATE TABLE IF NOT EXISTS workspace_memberships (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    user_id TEXT,
    role TEXT NOT NULL DEFAULT 'MEMBER',
    display_name TEXT,
    invited_by TEXT,
    joined_via TEXT DEFAULT 'SHARE_CODE',
    is_active INTEGER DEFAULT 1,
    last_active_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (workspace_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(workspace_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_ws_memberships_workspace ON workspace_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ws_memberships_user ON workspace_memberships(user_id);

-- 4. Cryptographic Workspace Invite Tokens
CREATE TABLE IF NOT EXISTS workspace_invites (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    invited_email TEXT,
    assigned_role TEXT NOT NULL DEFAULT 'MEMBER',
    invited_by_user_id TEXT,
    max_uses INTEGER DEFAULT 1,
    use_count INTEGER DEFAULT 0,
    expires_at TEXT NOT NULL,
    is_revoked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (workspace_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_ws_invites_token ON workspace_invites(token);
CREATE INDEX IF NOT EXISTS idx_ws_invites_workspace ON workspace_invites(workspace_id);

-- 5. AI Provider Dynamic Registry
CREATE TABLE IF NOT EXISTS ai_provider_registry (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    display_name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    base_url TEXT,
    api_key_encrypted TEXT,
    model_id TEXT NOT NULL,
    is_enabled INTEGER DEFAULT 1,
    cascade_priority INTEGER DEFAULT 99,
    max_tokens INTEGER DEFAULT 8192,
    temperature REAL DEFAULT 0.7,
    last_health_check_at TEXT,
    last_health_status TEXT,
    config_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (workspace_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 6. External Tool Integrations Registry
CREATE TABLE IF NOT EXISTS integration_registry (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    user_id TEXT,
    display_name TEXT NOT NULL,
    connector_type TEXT NOT NULL,
    api_key_encrypted TEXT,
    config_json TEXT NOT NULL DEFAULT '{}',
    is_enabled INTEGER DEFAULT 0,
    last_sync_at TEXT,
    last_sync_status TEXT,
    items_synced_count INTEGER DEFAULT 0,
    sync_interval_minutes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (workspace_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Integration Audit & Synchronization Log
CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    integration_id TEXT NOT NULL,
    workspace_id TEXT,
    sync_type TEXT NOT NULL,
    direction TEXT NOT NULL,
    items_processed INTEGER DEFAULT 0,
    items_created INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    duration_ms INTEGER,
    FOREIGN KEY (integration_id) REFERENCES integration_registry(id) ON DELETE CASCADE
);
```

---

## 6. External Tool Connectors & Taxonomy

CONVERA does not replicate external workflows; it establishes an extensible **Connector Hub** that ingests items with verified provenance (Constitution Article III):

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CIIA CONNECTOR TAXONOMY                         │
│                                                                        │
│   1. Reference Connectors (BaseReferenceConnector)                     │
│      └── ZoteroConnector: Ingests collections, BibTeX citations, DOIs │
│                                                                        │
│   2. Knowledge Connectors (BaseKnowledgeConnector)                     │
│      └── NotionConnector: Ingests research logs, tables, blocks        │
│                                                                        │
│   3. Annotation Connectors (BaseAnnotationConnector)                   │
│      └── HypothesisConnector: Ingests web & PDF marginalia notes      │
│                                                                        │
│   4. Identity Connectors (BaseIdentityConnector)                       │
│      └── ORCIDConnector: Ingests researcher credentials & publications │
│                                                                        │
│   5. Scholarly Literature Connectors (Existing Tier 3)                 │
│      └── OpenAlex, CrossRef, PubMed, Semantic Scholar                  │
└────────────────────────────────────────────────────────────────────────┘
```

All ingested external items enter CONVERA as `EvidenceRecord` or `ProblemSource` instances stamped with strict provenance:
- Connector ID (`connector_id`)
- Authoritative Identifier (`doi`, `uri`, `zotero_key`)
- Ingestion Timestamp (UTC ISO-8601)
- Initial Epistemic State: `UNVERIFIED` (requires researcher verification before contributing positive epistemic balance).

---

## 7. Local Docker Deployment Topology

The system deploys via Docker Compose v2 as four decoupled, containerized services:

```yaml
services:
  backend:
    build: { context: ./backend, dockerfile: Dockerfile }
    container_name: convera-backend
    ports: ["${BACKEND_PORT:-8000}:8000"]
    environment:
      - SQLITE_PATH=/data/convera.db
      - OLLAMA_BASE_URL=http://ollama:11434/v1
      - AUTH_ENABLED=${AUTH_ENABLED:-true}
    volumes: [convera-data:/data]
    networks: [convera-net]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    depends_on:
      ollama: { condition: service_started }

  web:
    build: { context: ./web, dockerfile: Dockerfile }
    container_name: convera-web
    ports: ["${WEB_PORT:-3000}:3000"]
    environment:
      - BACKEND_INTERNAL_URL=http://backend:8000
    networks: [convera-net]
    depends_on:
      backend: { condition: service_healthy }

  ollama:
    image: ollama/ollama:latest
    container_name: convera-ollama
    ports: ["${OLLAMA_PORT:-11434}:11434"]
    volumes: [ollama-models:/root/.ollama]
    networks: [convera-net]
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/"]
      interval: 15s
      timeout: 5s
      retries: 3

  model-bootstrap:
    image: curlimages/curl:latest
    container_name: convera-model-bootstrap
    depends_on:
      ollama: { condition: service_healthy }
    networks: [convera-net]
    entrypoint: >
      sh -c "curl -s http://ollama:11434/api/pull -d '{\"name\": \"${OLLAMA_MODEL:-llama3.2:3b}\"}' && echo 'Model ready.'"
    restart: "no"

networks:
  convera-net: { name: convera-net, driver: bridge }

volumes:
  convera-data: { name: convera-data }
  ollama-models: { name: convera-ollama-models }
```

---

## 8. Governance & Ratification Sign-Off

This document constitutes the canonical Tier 2 specification for CONVERA Feature 012. Execution proceeds under the Spec-Driven Development (SDD) process detailed in `specs/012-tool-integrations-and-progressive-identity/`.
