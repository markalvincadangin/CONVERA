# Tasks: Tool Integrations, Progressive Identity & Local Deployment

**Feature**: `012-tool-integrations-and-progressive-identity`  
**Input**: Feature specification (`spec.md`), implementation plan (`plan.md`), and data model (`data-model.md`).

---

## Dependencies & Phase Sequence

```text
Phase 1: Setup & Dependencies
      │
      ▼
Phase 2: Foundational Storage & Cryptographic Vault (Blocking Prerequisite)
      │
      ▼
Phase 3: [US1] Frictionless Problem Formulation & Offline Research (P1 - Core MVP)
      │
      ▼
Phase 4: [US2] Account Registration & Progressive Identity (P2)
      │
      ▼
Phase 5: [US3] Granular Workspace Sharing & RBAC (P3)
      │
      ▼
Phase 6: [US4] Standardized AI Onboarding & Credential Vault (P4)
      │
      ▼
Phase 7: [US5] External Scholarly Tool Integration (P5)
      │
      ▼
Phase 8: [US6] Self-Contained Local Docker Deployment (P6)
      │
      ▼
Phase 9: Polish, Test Suite Integration & Knowledge Graph Sync
```

---

## Phase 1: Setup

- [x] T001 Update backend dependencies with cryptography, passlib[argon2], and pyzotero in backend/requirements.txt
- [x] T002 [P] Create Docker environment template with default configuration in .env.docker
- [x] T003 [P] Create connector contract interface definitions in backend/connectors/contracts/reference.py and backend/connectors/contracts/knowledge.py

---

## Phase 2: Foundational Storage & Cryptographic Vault

- [x] T004 Implement CredentialVault with Fernet AES-128-CBC and master key derivation in backend/engines/credential_vault.py
- [x] T005 Implement unit tests for CredentialVault in backend/tests/test_credential_vault.py
- [x] T006 Extend BaseStorageAdapter abstract contract with identity, workspace, and vault methods in backend/storage/base.py
- [x] T007 Implement 7 new SQLite WAL additive tables and migration idempotence in backend/storage/sqlite_adapter.py
- [x] T008 Implement integration test for 7 additive tables and schema backwards-compatibility in backend/tests/test_storage_schema_012.py

---

## Phase 3: [US1] Frictionless Problem Formulation & Offline Research (MVP Baseline)

**Goal**: Ensure the application remains 100% functional for unauthenticated users, preserving zero-friction access and local session storage.  
**Independent Test**: Load application in fresh browser without credentials, create a workspace and claim, verify anonymous persistence.

- [x] T009 [US1] Verify anonymous default fallback when AUTH_ENABLED=false or no JWT is supplied in backend/routers/sessions.py
- [x] T010 [P] [US1] Ensure existing share_code and 4-digit PIN lookup remains functional without tokens in backend/routers/sessions.py
- [x] T011 [P] [US1] Update client api-client to handle both cookie and header authorization transparently in web/src/lib/api-client.ts
- [x] T012 [US1] Ensure RoomSecurityModal correctly preserves anonymous access flow in web/src/components/auth/RoomSecurityModal.tsx

---

## Phase 4: [US2] Account Registration & Progressive Identity

**Goal**: Allow users to optionally register, upgrading their anonymous workspace into an authenticated, durable account.  
**Independent Test**: Register with email/password; verify Argon2id hash in DB and claim of active workspace as Owner.

- [x] T013 [US2] Implement AuthEngine with Argon2id hashing, JWT access issuance, and refresh token rotation in backend/engines/auth_engine.py
- [x] T014 [US2] Implement AuthMiddleware extracting optional user from HttpOnly cookie or Bearer header in backend/middleware/auth_middleware.py
- [x] T015 [US2] Implement authentication router (/api/auth/register, /api/auth/login, /api/auth/refresh, /api/auth/me) in backend/routers/auth.py
- [x] T016 [US2] Mount auth router and middleware in backend/server.py
- [x] T017 [US2] Implement unit and integration tests for auth routes and token rotation in backend/tests/test_auth_engine.py
- [x] T018 [P] [US2] Create reactive AuthContext and provider for managing user state in web/src/lib/auth-context.tsx
- [x] T019 [P] [US2] Implement LoginForm and RegisterForm components in web/src/components/auth/LoginForm.tsx and web/src/components/auth/RegisterForm.tsx
- [x] T020 [US2] Create login and registration pages in web/src/app/login/page.tsx and web/src/app/register/page.tsx
- [x] T021 [US2] Update authService to interact with backend auth endpoints and synchronize user profiles in web/src/services/authService.ts

---

## Phase 5: [US3] Granular Workspace Sharing & RBAC

**Goal**: Support role-governed invite links (48h TTL) and permission enforcement (Owner, Admin, Member, Advisor, Viewer).  
**Independent Test**: Generate an Advisor invite link, accept in second session, verify sign-off capability while administrative settings remain blocked.

- [x] T022 [US3] Implement WorkspaceEngine managing memberships, invite tokens, and RBAC rules in backend/engines/workspace_engine.py
- [x] T023 [US3] Implement workspace router (/api/workspaces/*, /api/workspaces/{id}/invites, /api/workspaces/invites/{token}/redeem) in backend/routers/workspaces.py
- [x] T024 [US3] Implement role-based dependency guard (require_workspace_role) in backend/middleware/auth_middleware.py
- [x] T025 [US3] Mount workspace router in backend/server.py
- [x] T026 [US3] Implement integration tests for workspace invites, expiration, and role boundaries in backend/tests/test_workspaces.py
- [x] T027 [P] [US3] Implement workspaceService for frontend workspace and invite management in web/src/services/workspaceService.ts
- [x] T028 [P] [US3] Implement WorkspaceSwitcher component in web/src/components/workspaces/WorkspaceSwitcher.tsx
- [x] T029 [P] [US3] Implement InviteMembersModal for generating and revoking invite links in web/src/components/workspaces/InviteMembersModal.tsx
- [x] T030 [P] [US3] Implement MembersList component displaying roster and role management in web/src/components/workspaces/MembersList.tsx
- [x] T031 [US3] Create invite redemption page in web/src/app/invite/[token]/page.tsx

---

## Phase 6: [US4] Standardized AI Onboarding & Credential Vault

**Goal**: Onboard local and cloud AI models with encrypted credentials and dynamic runtime cascade updates.  
**Independent Test**: Save a provider API key via Settings, verify encryption in database, test connection, and execute synthesis via the updated priority.

- [x] T032 [US4] Implement SettingsEngine managing AI providers and encrypted secrets in backend/engines/settings_engine.py
- [x] T033 [US4] Implement settings router (/api/settings/ai-providers/*) in backend/routers/settings.py
- [x] T034 [US4] Update LLMGateway to reload provider cascade dynamically from database without server restart in backend/llm_gateway.py
- [x] T035 [US4] Mount settings router in backend/server.py
- [x] T036 [US4] Implement integration tests for AI provider encryption and dynamic cascade reload in backend/tests/test_settings_api.py
- [x] T037 [P] [US4] Implement settingsService for frontend provider configuration in web/src/services/settingsService.ts
- [x] T038 [P] [US4] Implement OnboardingWizard component for first-run model setup in web/src/components/settings/OnboardingWizard.tsx
- [x] T039 [P] [US4] Implement AIProviderCard component with health status indicator in web/src/components/settings/AIProviderCard.tsx
- [x] T040 [US4] Create AI settings page in web/src/app/settings/ai/page.tsx

---

## Phase 7: [US5] External Scholarly Tool Integration

**Goal**: Ingest bibliographic references and notes from Zotero, Notion, and Hypothesis with verifiable provenance.  
**Independent Test**: Trigger a Zotero sync; verify imported citations appear in the evidence ledger tagged UNVERIFIED with source DOIs.

- [x] T041 [US5] Implement ZoteroConnector using pyzotero for reference and BibTeX ingestion in backend/connectors/reference/zotero_connector.py
- [x] T042 [P] [US5] Implement NotionConnector for literature note ingestion in backend/connectors/knowledge/notion_connector.py
- [x] T043 [P] [US5] Implement HypothesisConnector for web annotation ingestion in backend/connectors/knowledge/hypothesis_connector.py
- [x] T044 [P] [US5] Implement ORCIDConnector for researcher publication ingestion in backend/connectors/identity/orcid_connector.py
- [x] T045 [US5] Implement integrations router (/api/settings/integrations/*) in backend/routers/integrations.py
- [x] T046 [US5] Mount integrations router in backend/server.py
- [x] T047 [US5] Implement connector unit and mock integration tests in backend/tests/test_tool_connectors.py
- [x] T048 [P] [US5] Implement IntegrationCard component in web/src/components/settings/IntegrationCard.tsx
- [x] T049 [US5] Create integrations settings page in web/src/app/settings/integrations/page.tsx

---

## Phase 8: [US6] Self-Contained Local Docker Deployment

**Goal**: Package the full 4-service topology with persistent named volumes and automated model bootstrapping.  
**Independent Test**: Execute docker compose up -d; verify web, backend, and ollama services report healthy within 90 seconds.

- [x] T050 [US6] Update docker-compose.yml to include backend, web, ollama with GPU reservations, and model-bootstrap services
- [x] T051 [US6] Configure healthchecks and network bridge in docker-compose.yml
- [x] T052 [US6] Validate Docker compose configuration syntax and service dependencies with docker compose config

---

## Phase 9: Polish, Test Suite Integration & Knowledge Graph Sync

- [x] T053 Run full Tier 1 deterministic unit suite and Tier 2 local integration suite (npm run test:backend)
- [x] T054 Run frontend TypeScript typecheck and verify zero errors (npm run test:frontend)
- [x] T055 Synchronize knowledge graph AST and update graph index (graphify update .)
- [x] T056 Verify all items in checklist.md pass and update status to complete in specs/012-tool-integrations-and-progressive-identity/checklist.md
