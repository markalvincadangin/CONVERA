# Implementation Plan: Tool Integrations, Progressive Identity & Local Deployment

**Branch**: `012-tool-integrations-and-progressive-identity` | **Date**: 2026-09-27 | **Spec**: [specs/012-tool-integrations-and-progressive-identity/spec.md](file:///home/markc/projects/active/CONVERA/specs/012-tool-integrations-and-progressive-identity/spec.md)

**Input**: Feature specification from `specs/012-tool-integrations-and-progressive-identity/spec.md` and Canonical Engineering Architecture `docs/03-engineering/INTEGRATION_ARCHITECTURE_AND_PROGRESSIVE_IDENTITY.md`.

---

## Summary

This feature implements the orchestration layer connecting CONVERA to external research systems (Zotero, Notion, Hypothesis, ORCID), adds a progressive identity model (anonymous-first with opt-in account registration), establishes a symmetric-key credential vault for API keys, introduces dynamic in-memory AI provider cascades, and containerizes the stack into a 4-service local Docker Compose deployment.

---

## Technical Context

**Language/Version**: Python 3.12+ (Backend), TypeScript 5.0+ / Node.js 20+ (Frontend)  
**Primary Dependencies**: 
- Backend: FastAPI, Pydantic v2, PyJWT, passlib[argon2], cryptography (Fernet), pyzotero, notion-client, httpx, slowapi
- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React, Framer Motion
- Local AI: Ollama container image with llama3.2:3b default  
**Storage**: SQLite 3 with Write-Ahead Logging (WAL mode), 24 existing tables + 7 new additive tables  
**Testing**: 
- Backend: pytest (Tier 1 unit <3s, Tier 2 integration <15s, Tier 3 live)
- Frontend: TypeScript compiler (`tsc --noEmit`), Jest/Vitest  
**Target Platform**: Linux/WSL2, macOS, Windows with Docker Engine 24+ or native Python/Node  
**Project Type**: Decoupled Web Application & Intelligence API Engine  
**Performance Goals**:
- Token verification latency < 1.5ms
- SQLite read/write transaction latency < 5ms
- API key decryption latency < 0.5ms
- External connector sync batch processing: 100 items / sec  
**Constraints**:
- Strict compliance with Constitution Articles I-VIII
- 100% offline-capable (Free-First baseline)
- Zero schema breaking changes to the 24 existing SQLite tables  
**Scale/Scope**:
- Workspaces: Up to 50 active workspaces per local node
- Members: 1 to 20 concurrent collaborators per workspace
- Stored References: Up to 5,000 academic references per workspace

---

## Constitution Check

*GATE: Must pass before implementation. Evaluated against `docs/00-foundation/CONSTITUTION.md`.*

| Constitutional Article | Requirement | Compliance Status | Justification / Architectural Guardrail |
|:---|:---|:---:|:---|
| **Article I: Knowledge ≠ Workflow** | Canonical entities independent of workflow lens. | ✅ PASS | External Zotero/Notion items map directly into canonical `EvidenceRecord` and `ProblemSource` entities; identity does not partition persistent domain truth. |
| **Article II: Tri-Part Decoupling** | $C_{\text{AI}} \ne S_{\text{EVID}} \ne C_{\text{DEC}}$. | ✅ PASS | Provider selection and onboarding maintain explicit separation between model linguistic fluency and empirical evidence weight. |
| **Article III: Provenance Integrity** | 3-stage lifecycle: Signal $\to$ Traceable $\to$ Evaluated. | ✅ PASS | All items imported from external connectors are stamped with connector ID, source URL/DOI, and tagged `UNVERIFIED` until reviewed by a human researcher. |
| **Article IV: Non-Destructive Invalidation** | Immutable audit logs, reactive validity. | ✅ PASS | All user actions, sharing modifications, and sync events are appended to immutable audit and sync logs; deletion cascades preserve soft references. |
| **Article V: External Boundary Principle** | CONVERA owns context; external providers are signals. | ✅ PASS | Third-party tools (Zotero, Notion, LLM APIs) provide external data and computation; persistent epistemic state and claim graphs remain solely in CONVERA. |
| **Article VI: Free-First Posture** | Zero mandatory cloud cost; 100% operational offline. | ✅ PASS | Registration is progressive (optional); default Docker configuration runs sovereign Ollama models; all core functionality works without paid keys. |
| **Article VII: Two-Way Consistency** | No phantom claims, no dark architectures. | ✅ PASS | All 7 new tables, API routers, and docker services are authoritatively documented in `CONVERA-ENG-012` and tracked in `RequirementsTraceability`. |
| **Article VIII: Human Ratification** | Critical decisions require human review. | ✅ PASS | Quality gates, stage transitions, mentor sign-offs, and ownership transfers strictly require authenticated human action. |

---

## Project Structure

### Documentation & Specifications (this feature)

```text
specs/012-tool-integrations-and-progressive-identity/
├── spec.md              # Operational feature specification (WHAT & WHY)
├── plan.md              # Technical implementation plan (HOW)
├── data-model.md        # 7 new SQLite tables, relationships & constraints
├── quickstart.md        # Step-by-step local validation & Docker guide
├── checklist.md         # Verification criteria & quality gates
└── tasks.md             # Sequenced, atomic implementation tasks
```

### Source Code Impact

```text
backend/
├── engines/
│   ├── auth_engine.py                  # [NEW] Progressive auth, Argon2id, JWT issuance
│   ├── credential_vault.py             # [NEW] Fernet symmetric key encryption
│   ├── workspace_engine.py             # [NEW] Multi-workspace logic, invites, RBAC
│   ├── settings_engine.py              # [NEW] AI provider & integration registry
│   └── bibliography_engine.py          # [NEW] BibTeX/CSL-JSON parser & mapper
├── routers/
│   ├── auth.py                         # [NEW] /api/auth/* routes
│   ├── workspaces.py                   # [NEW] /api/workspaces/* routes
│   ├── settings.py                     # [NEW] /api/settings/* routes
│   └── integrations.py                 # [NEW] /api/integrations/* routes
├── middleware/
│   └── auth_middleware.py              # [NEW] JWT extraction & optional user injector
├── connectors/
│   ├── contracts/                      # [NEW] Connector ABC definitions
│   │   ├── reference.py               # BaseReferenceConnector
│   │   ├── knowledge.py               # BaseKnowledgeConnector
│   │   ├── annotation.py              # BaseAnnotationConnector
│   │   └── identity.py                # BaseIdentityConnector
│   ├── reference/
│   │   └── zotero_connector.py        # [NEW] Pyzotero integration
│   ├── knowledge/
│   │   ├── notion_connector.py        # [NEW] Notion SDK integration
│   │   └── hypothesis_connector.py    # [NEW] Hypothesis API integration
│   └── identity/
│       └── orcid_connector.py         # [NEW] ORCID v3 API integration
├── storage/
│   ├── base.py                         # [MODIFY] Add user & workspace methods
│   └── sqlite_adapter.py               # [MODIFY] Implement 7 new tables & queries
├── llm_gateway.py                      # [MODIFY] Dynamic DB-backed cascade reload
├── server.py                           # [MODIFY] Mount new routers and auth middleware
└── requirements.txt                    # [MODIFY] Add cryptography, passlib, pyzotero

web/src/
├── app/
│   ├── login/page.tsx                  # [NEW] Login view
│   ├── register/page.tsx               # [NEW] Register view
│   ├── invite/[token]/page.tsx         # [NEW] Invite redemption view
│   └── settings/
│       ├── page.tsx                    # [NEW] Settings layout
│       ├── profile/page.tsx           # [NEW] Profile preferences
│       ├── ai/page.tsx                # [NEW] AI provider config & priority
│       └── integrations/page.tsx      # [NEW] Zotero, Notion, Hypothesis status
├── components/
│   ├── auth/
│   │   ├── AuthGuard.tsx              # [NEW] Role-aware route wrapper
│   │   ├── LoginForm.tsx              # [NEW] Login modal/form
│   │   └── RegisterForm.tsx           # [NEW] Registration form
│   ├── settings/
│   │   ├── OnboardingWizard.tsx       # [NEW] First-run AI setup wizard
│   │   ├── AIProviderCard.tsx         # [NEW] Provider card with status badge
│   │   └── IntegrationCard.tsx        # [NEW] Connector configuration card
│   └── workspaces/
│       ├── WorkspaceSwitcher.tsx       # [NEW] Multi-workspace dropdown
│       ├── InviteMembersModal.tsx      # [NEW] Invite link & role generator
│       └── MembersList.tsx            # [NEW] Workspace member management
├── services/
│   ├── authService.ts                 # [MODIFY] Support JWT HttpOnly cookies
│   ├── workspaceService.ts            # [NEW] Workspace & invite API client
│   └── settingsService.ts             # [NEW] AI provider & connector API client
└── lib/
    ├── api-client.ts                  # [MODIFY] Pass credentials for cookie auth
    └── auth-context.tsx               # [NEW] Reactive AuthContext provider

docker-compose.yml                      # [MODIFY] Add Ollama and Model Bootstrap
.env.docker                             # [NEW] Docker environment configuration template
```

---

## Phase Execution Strategy

- **Phase 1: Security & Identity Subsystem** (Storage adapter schema migrations, `auth_engine.py`, `credential_vault.py`, JWT cookies, `/api/auth/*` router, login/register UI).
- **Phase 2: Workspaces & Collaboration Subsystem** (`workspace_engine.py`, memberships, invite tokens, `/api/workspaces/*`, RBAC middleware, workspace UI switcher, invite modal).
- **Phase 3: Standardized AI Onboarding & Dynamic Cascade** (`settings_engine.py`, `/api/settings/ai-providers/*`, LLM gateway dynamic reload, Onboarding Wizard UI).
- **Phase 4: Tool Connectors & Ingestion Hub** (`BaseReferenceConnector`, `ZoteroConnector`, `NotionConnector`, `HypothesisConnector`, `ORCIDConnector`, `/api/integrations/*`, integration UI).
- **Phase 5: Docker Orchestration & Verification Convergence** (4-service `docker-compose.yml`, local model bootstrap, automated pytest suites, TypeScript typecheck, graphify sync).

---

## Complexity Tracking

| Architectural Mechanism | Why Needed | Simpler Alternative Rejected Because |
|:---|:---|:---|
| **Argon2id + Passlib** | OWASP/NIST 2026 recommended password hashing; resistant to GPU brute-forcing. | Standard bcrypt or SHA-256 lacks modern memory-hardness and side-channel resistance. |
| **Fernet Symmetric Encryption** | Zero-dependency, tamper-proof authenticated encryption for stored API keys. | Storing keys in plaintext in SQLite violates security doctrine; asymmetric RSA adds key management overhead for local secrets. |
| **Opaque Rotating Refresh Tokens** | Prevents token replay and session hijacking while maintaining short-lived JWT access tokens. | Long-lived JWTs cannot be revoked without maintaining a bloated distributed blocklist. |
| **Progressive Identity** | Respects Free-First posture; zero friction for new researchers. | Hard login-first gate discourages student adoption and violates Constitution Article VI. |
