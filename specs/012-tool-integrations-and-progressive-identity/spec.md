# Feature Specification: Tool Integrations, Progressive Identity & Local Deployment

**Feature Branch**: `012-tool-integrations-and-progressive-identity`
**Created**: 2026-09-27
**Status**: 🟢 Complete (Implemented & Verified)
**Input**: User description: "I want this system as a tool that utilizes existing systems like Notion, Zotero, etc., that relevant research tools. This system will not replace existing systems that do the same function but instead connect with those existing solutions and take advantage of it and use it. For the AI models, please have it standardized where there is an onboarding and system's settings that set API keys, local or free or paid cloud APIs. Please do also the deployment using Docker local deployment, account/user management, workspace sharing, and progressive identity."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Frictionless Problem Formulation & Offline Research (Priority: P1)

A student or researcher opens CONVERA for the first time on their laptop. Without encountering any registration walls, mandatory email verification, or payment requests, they can immediately create a local research workspace, formulate a problem statement, decompose claims, and synthesize scholarly literature using local or free computational resources.

**Why this priority**: Directly satisfies Constitution Article VI (Free-First Posture). Core research capabilities must work out of the box with zero barrier to entry.

**Independent Test**: Can be fully tested by opening the application in an incognito window without network access to cloud APIs; user can create a workspace, input a research question, and export an initial analysis.

**Acceptance Scenarios**:
1. **Given** a user with no registered account, **When** they access the application, **Then** they can create a new workspace immediately and enter data without being prompted for credentials.
2. **Given** an anonymous workspace, **When** the researcher inputs claims and assumptions, **Then** all progress is preserved locally.
3. **Given** an anonymous workspace, **When** a user shares the unique 8-character share code and 4-digit PIN, **Then** a peer collaborator can open the workspace and view its contents without creating an account.

---

### User Story 2 - Account Registration & Capability Unlocking (Priority: P2)

When a researcher decides to collaborate formally with their thesis advisor or synchronize configurations across devices, they register for an account. Registering does not reset their existing workspace; instead, it establishes an account that links their workspace, attributes their actions, and unlocks invite links, private credential vaults, and multi-workspace ownership.

**Why this priority**: Bridges anonymous exploration to persistent, multi-tenant collaboration while maintaining complete backward compatibility.

**Independent Test**: An anonymous user registers their account; their active workspace is claimed as their owned workspace, actions transition from "Anonymous" to their verified name, and the "Invite Collaborators" link generator becomes active.

**Acceptance Scenarios**:
1. **Given** an anonymous user in an existing workspace, **When** they submit registration details (email, password, display name), **Then** their account is created, an authenticated session is established, and the current workspace is assigned to their ownership.
2. **Given** an authenticated user, **When** they make revisions to claims or decisions, **Then** the audit log explicitly records their authenticated identity instead of an anonymous tag.
3. **Given** an authenticated user who logs out, **When** they log back in with valid credentials, **Then** their workspaces, profiles, and saved preferences are restored.

---

### User Story 3 - Granular Workspace Sharing & Role-Based Collaboration (Priority: P3)

A primary researcher invites a faculty advisor to review their project. The researcher generates a secure, one-time invite link with the role pre-assigned as "Advisor". The advisor accepts the link and gains dedicated mentor privileges (such as signing off on stage reviews and adding evaluations) without having administrative power to delete the workspace or modify API provider settings.

**Why this priority**: Critical for institutional academic workflows (mentor-student governance, peer reviews, thesis defense).

**Independent Test**: Primary researcher issues an Advisor invite link to a second user; the second user accepts and verifies they can perform mentor sign-offs while administrative controls remain hidden or disabled.

**Acceptance Scenarios**:
1. **Given** a workspace owner, **When** they create an invite link specifying an email and role (e.g., Advisor), **Then** a secure, time-limited invite link (expiring in 48 hours) is generated.
2. **Given** a valid invite link, **When** the invitee opens the link and authenticates, **Then** they are added to the workspace roster with the exact pre-assigned role.
3. **Given** an invite link that has expired or exceeded its usage limit, **When** a user attempts to redeem it, **Then** access is denied with a clear explanatory notice.
4. **Given** an owner who enables "Public View", **When** external visitors access the public link, **Then** they can view research summaries and evidence graphs in read-only mode without write permissions.

---

### User Story 4 - Standardized AI Onboarding & Credential Vault (Priority: P4)

A researcher configures their preferred AI models for problem synthesis. They can choose between free cloud providers, sovereign local models, or paid cloud APIs. When entering private API keys, credentials are encrypted and stored safely. The researcher can define fallback cascades (e.g., attempt Local Model first, then Free Cloud, then Degraded Fallback) so that research synthesis never abruptly crashes due to provider downtime or rate limits.

**Why this priority**: Eliminates vendor lock-in, fulfills Constitution Article V (Provider Agnosticism), and allows researchers to control costs and data sovereignty.

**Independent Test**: The user navigates to the AI Onboarding wizard, enters an API key, tests connectivity, and changes the priority cascade; subsequent synthesis requests execute according to the updated priority chain.

**Acceptance Scenarios**:
1. **Given** a newly deployed system, **When** an administrator navigates to Settings, **Then** an onboarding wizard presents provider options (Local Sovereign, Free Cloud, Paid Cloud) with clear setup instructions.
2. **Given** an API key input, **When** the user saves the key, **Then** the key is encrypted at rest and is never exposed in plaintext in subsequent read queries or client responses.
3. **Given** an active provider that encounters a rate limit or timeout, **When** synthesis is requested, **Then** the system automatically cascades to the configured fallback provider and records the fallback execution path.

---

### User Story 5 - External Scholarly Tool Integration (Priority: P5)

A researcher integrates their existing reference library (Zotero) and literature notes (Notion, Hypothesis) into CONVERA. Ingested items are imported as traceable evidence records with complete bibliographic provenance (DOI, author, extraction timestamp). CONVERA does not alter or replace the external library, but uses it to score epistemic balance and validate problem claims.

**Why this priority**: Meets the user's explicit requirement that CONVERA acts as an orchestration and evaluation layer that leverages existing tools rather than rebuilding them.

**Independent Test**: User connects a Zotero collection; items from the collection appear in the evidence ledger with their DOI, title, and citation key, ready to be linked to claims.

**Acceptance Scenarios**:
1. **Given** a connected reference source (Zotero), **When** a synchronization is executed, **Then** collection metadata and citations are imported into the workspace evidence pool without duplicating existing records.
2. **Given** an imported reference, **When** viewed in the evidence explorer, **Then** complete provenance (source ID, timestamp, external URL) is visible and verifiable.
3. **Given** a connected notes tool (Notion/Hypothesis), **When** notes are imported, **Then** annotations are linked to claims as initial unverified signals pending researcher evaluation.

---

### User Story 6 - Self-Contained Local Docker Deployment (Priority: P6)

A university lab or independent researcher deploys CONVERA on a local workstation using a single command. The container stack starts the user interface, the API intelligence engine, and a local open-weight model runtime with automated model acquisition, isolated networking, and persistent storage.

**Why this priority**: Enables reproducible, zero-configuration local deployment for non-cloud or air-gapped institutional environments.

**Independent Test**: Running the standard launch command starts all services; navigating to the local address opens the application with the local model ready to synthesize queries.

**Acceptance Scenarios**:
1. **Given** a host machine with container tooling installed, **When** the deployment command is executed, **Then** the web interface and backend API start and report healthy status within 60 seconds.
2. **Given** a deployed local stack, **When** data is created and the containers are restarted, **Then** all workspaces, accounts, and credentials persist intact in local storage volumes.
3. **Given** a machine with compatible hardware acceleration, **When** the local model runtime starts, **Then** it automatically utilizes available acceleration without manual library compilation.

---

### Edge Cases

- **Account deletion with shared workspaces**: When a user account is deleted, workspaces they created remain intact if other members exist (ownership transfers to the next senior administrator), or data is retained in soft-deleted state to preserve research citation integrity.
- **Multiple simultaneous share-code edits**: If two anonymous collaborators edit the same claim concurrently, the system uses last-write-wins with an optimistic concurrency timestamp and logs a conflict event.
- **Network loss during third-party tool synchronization**: If a Zotero or Notion sync fails midway due to a network drop, the sync log marks the batch as "Partially Complete", records the error message, and resumes from the last successful item on retry.
- **AI provider quota exhaustion**: When all configured external and local AI providers are unavailable, the system safely degrades into deterministic scaffolding mode (Constitution Article II/V), providing structural guidance without crashing.
- **Compromised invite link**: If an invite link is leaked or sent to the wrong recipient, the workspace owner can instantly revoke the link from the member management dashboard, immediately invalidating the token.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support anonymous workspace creation and full research workflow operations without requiring user registration or login.
- **FR-002**: System MUST allow anonymous users to register an account using an email, display name, and password, seamlessly claiming ownership of their active workspace.
- **FR-003**: System MUST store passwords using a memory-hard, brute-force resistant hashing algorithm (Argon2id) and never store plaintext passwords.
- **FR-004**: System MUST issue short-lived session access credentials (15-minute maximum lifetime) alongside rotating, revokable refresh credentials.
- **FR-005**: System MUST provide three independent workspace sharing methods: Anonymous Share Code with optional PIN, Role-Based Cryptographic Invite Links, and Read-Only Public View Links.
- **FR-006**: System MUST enforce a Role-Based Access Control (RBAC) model supporting at least six distinct roles: Owner, Admin, Member, Advisor, Viewer, and Anonymous Peer.
- **FR-007**: System MUST provide a secure credential vault that encrypts private API keys and integration tokens at rest using symmetric authenticated encryption.
- **FR-008**: System MUST provide an AI onboarding wizard and settings dashboard allowing administrators to configure, test, and prioritize AI providers (Local, Free Cloud, Paid Cloud).
- **FR-009**: System MUST allow dynamic, in-memory updates to AI provider cascades and API keys without requiring application restarts or filesystem edits to `.env` files.
- **FR-010**: System MUST support external reference integration (Zotero) for importing bibliographic metadata, collections, and BibTeX citations.
- **FR-011**: System MUST support external knowledge and annotation integrations (Notion, Hypothesis) for ingesting structured research notes and web marginalia.
- **FR-012**: System MUST support researcher identity integration (ORCID) for importing verified publication records.
- **FR-013**: System MUST preserve historical provenance metadata on every imported external item, marking imported items as initial signals (`UNVERIFIED`) until evaluated by a researcher.
- **FR-014**: System MUST provide a self-contained containerized local deployment topology orchestrating the web interface, API engine, and local model runtime.
- **FR-015**: System MUST automatically download and prepare the default local open-weight model on first container startup without requiring manual command-line intervention.

---

### Key Entities

- **User**: Represents a registered human researcher with an email, hashed credentials, system-level authority, and linked workspace memberships.
- **Workspace Membership**: Associates a user (or anonymous session) with a workspace, binding them to an explicit RBAC role and tracking join provenance.
- **Workspace Invite**: A time-limited, cryptographic single-use or multi-use token granting pre-assigned role access to a specific workspace.
- **API Vault Record**: An encrypted credential item storing external AI or tool authentication secrets associated with a workspace or system scope.
- **Tool Integration**: A persistent connector configuration tracking the state, sync schedule, and authentication status of an external tool (Zotero, Notion, etc.).
- **Sync Log Record**: An immutable audit entry documenting each data synchronization event, tracking items processed, successes, failures, and execution duration.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can launch the application and create an active problem formulation in under 60 seconds without encountering account or payment barriers.
- **SC-002**: Anonymous users can convert their session into a registered account in under 90 seconds while retaining 100% of their existing workspace data.
- **SC-003**: Workspace owners can generate and dispatch a role-governed invite link in under 3 clicks or 15 seconds.
- **SC-004**: 100% of stored API keys and third-party access tokens are encrypted at rest; zero plaintext credentials appear in database backups, logs, or API payloads.
- **SC-005**: The system successfully executes AI synthesis requests using 100% local sovereign runtime without requiring an active internet connection or paid cloud subscription.
- **SC-006**: External library synchronization (Zotero) successfully ingests collections of up to 500 references in under 30 seconds with complete bibliographic provenance preserved.
- **SC-007**: The entire local container stack initializes from a cold start to a fully operational state in under 3 minutes on standard consumer hardware.

---

## Assumptions

- **Local Storage Reliability**: Local SQLite WAL mode is sufficiently performant and reliable for concurrent reads and writes in small research groups (up to 20 concurrent team members).
- **Network Environment for Local Dev**: Local development and container deployments have port availability for standard HTTP services (ports 3000, 8000, and 11434).
- **Third-Party API Policies**: Zotero, Notion, and ORCID public APIs maintain backward compatibility with their v1/v3 REST interfaces and permit personal/academic rate limits.
- **Hardware Capability**: Host machines running the local model stack possess at least 8 GB of RAM for CPU execution, or 6 GB VRAM for accelerated GPU execution.
