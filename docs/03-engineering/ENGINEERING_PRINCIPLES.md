# CONVERA - Engineering Principles & Implementation Invariants

**Document ID**: `CONVERA-ENG-001`  
**Classification**: Clean Architecture & Hygiene Axioms  
**Authority Tier**: Tier 2 Engineering Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/03-engineering/ENGINEERING_PRINCIPLES.md`  
**Upstream Dependencies**: `00-foundation/PRINCIPLES.md, 02-system/SYSTEM_ARCHITECTURE.md`  
**Downstream Dependents**: `03-engineering/DEVELOPMENT_WORKFLOW.md, 03-engineering/SDD_WORKFLOW.md`  

---

> **Architectural Constraints, Epistemic Safety, IoC Contracts & Engineering Rules.**
> This document authoritatively establishes the engineering rules and implementation invariants governing all CONVERA codebase modifications. It directly projects the supreme law of `CONSTITUTION.md` and the ratified specifications of `SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `KNOWLEDGE_MODEL.md`, `EVIDENCE_MODEL.md`, `DECISION_MODEL.md`, and `TRACEABILITY_MODEL.md` into actionable engineering mandates.

---

## 1. Governing Axiom & Engineering Philosophy

Every technical change in CONVERA is governed by the core axiom:

> **"Evidence before assertion; traceability before transformation."**
> **"Architecture before implementation."**

CONVERA is an epistemic governance platform. Software bugs that corrupt data, conflate confidence, or bypass audit trails are not mere UI defects - they represent **constitutional defects**. All engineering work must prioritize structural correctness, epistemic safety, and auditable permanence over expedient shortcuts.

---

## 2. The Ten Engineering Invariants

`	ext
+-----------------------------------------------------------------------------+
|                     CONVERA TEN ENGINEERING INVARIANTS                      |
+-----+-------------------------------+---------------------------------------+
| #   | Invariant                     | Core Engineering Rule                 |
+-----+-------------------------------+---------------------------------------+
| 1   | Architecture Preservation     | Respect 5-area boundaries; no leaks.  |
| 2   | Separation of Concerns        | Decouple domain from transport & UI.  |
| 3   | Inversion of Control (IoC)    | Depend on abstract storage & AI ports.|
| 4   | Epistemic Safety              | AI signals != authoritative evidence. |
| 5   | Non-Destructive Persistence   | Invalidation updates state, not delete|
| 6   | Type & Contract Rigor         | Strict Pydantic v2 & TypeScript types.|
| 7   | Truthful Failure Semantics    | Explicit degraded flags; no false ack.|
| 8   | Tests as Epistemic Evidence   | Invariant testing, not just mocks.    |
| 9   | Reversible Atomic Changes     | Spec before code; no silent drift.    |
| 10  | AI Development Boundaries     | AI proposes; human ratifies doctrine. |
+-----+-------------------------------+---------------------------------------+
`

---

### Invariant 1: Architecture Preservation & Boundary Discipline
* **5 Topological Areas:** Code must strictly reside within its assigned architectural area defined in `SYSTEM_ARCHITECTURE.md`:
  1. *Presentation Area:* Next.js 15.2.0 App Router UI (`web/`).
  2. *Application / Router API Area:* FastAPI routers & controllers (`backend/routers/`).
  3. *Domain Engine Area:* Business & epistemic domain logic (`backend/engines/`).
  4. *Persistence Area:* Storage adapters & database drivers (`backend/storage/`).
  5. *CIIA Area:* Continuous Intelligence & Interaction Agent area, including the multi-provider cascade gateway (`backend/llm_gateway.py`), scholarly literature connectors (`backend/connectors/`), and the outward-facing Model Context Protocol server (`backend/mcp_server.py`).
* **No Leaky Dependencies:** Domain engines (`backend/engines/`) must **never** import SQLite drivers directly, execute raw SQL, or invoke external AI vendor SDKs directly.
* **No Circular Dependencies:** Package dependencies must flow strictly inward toward core domain definitions.

---

### Invariant 2: Strict Separation of Concerns
* **Domain Engine Isolation:** Domain logic must remain independent of transport, database-driver, and vendor-SDK concerns and must expose deterministic, independently testable domain operations wherever practical.
* **Presentation Isolation:** The frontend communicates with CONVERA through its HTTP/REST API boundary. It does not directly access persistence, server-internal state, vendor SDKs, or the MCP server.

---

### Invariant 3: Dependency Inversion & Abstract Interfaces
* **Storage Abstraction:** All persistence operations must be executed through `BaseStorageAdapter`. Concrete drivers (e.g., `SQLiteStorageAdapter`) implement the interface; callers must never depend on database-specific idiosyncrasies.
* **AI Provider Agnosticism:** Core application logic interacts exclusively with the unified `LLMGateway`. Code outside the gateway must never bind directly to provider-specific AI SDKs. Current providers operate across a resilient free-first cascade (Gemini -> Groq -> Ollama -> synthetic degraded fallback).
* **Connector Isolation:** Data connectors (OpenAlex, Crossref, PubMed, Europe PMC, Semantic Scholar) must implement the standard connector interface, isolating rate-limiting, error handling, and payload parsing.

---

### Invariant 4: Epistemic Safety & Provenance Integrity
* **Raw Signal != Evidence:** AI-generated text, web scraper dumps, and unparsed documents are raw signals with **zero epistemic weight**. They become `EvidenceItem` records only upon binding a preserved `ProvenanceRecord`.
* **Decoupled Confidence Metrics:** Engineers must never blend or equate the three independent confidence dimensions:
  C_{text{AI}} `(Model Fluency)` \neq S_{text{EVID}} `(Evidence Balance)` \neq C_{text{DEC}} `(Human Conviction)`
* **Contradiction Precedence:** A positive mathematical Net Epistemic Balance must never suppress or bypass an active contradiction pair.

---

### Invariant 5: Non-Destructive Persistence & Audit Lineage
* **No Silent Deletions:** Historical records, rejected alternatives, contested claims, and invalidated decisions are never deleted or overwritten in place.
* **State Invalidation Over Destruction:** When evidence is retracted or a premise fails, status fields transition (e.g., `STALE_REVIEW_REQUIRED`, `VERIFICATION_STALE`), preserving the audit trail.
* **Explicit Supersession:** Decision changes create a new `DecisionRecord` pointing to the prior version via `superseded_by_id`.

---

### Invariant 6: Strict Type Safety & Contract Enforcement
* **Boundary Type Safety:** External/API-facing data contracts must use explicitly typed **Pydantic v2 schemas**. Internal domain and storage interfaces must use explicit typed contracts appropriate to their responsibility and must not rely on unconstrained `dict[str, Any]` as public interfaces.
* **TypeScript Frontend:** Strict TypeScript (`strict: true`) must be maintained across all Next.js components. Explicit `any` usage is prohibited in production application code unless an explicitly documented and reviewed interoperability exception exists.
* **Explicit Errors:** APIs and internal methods must return typed error responses or raise domain-specific exceptions, avoiding generic unhandled 500 exceptions.

---

### Invariant 7: Truthful Failure Semantics & Degraded Operation
* **Never Acknowledge Unsaved State:** The persistence layer must never return a success status if a database transaction fails or is rolled back.
* **Explicit Degradation Signaling:** When external AI providers are unreachable and the system falls back to synthetic mock templates, responses must explicitly declare:
  text{source} = "synthetic_fb" \quad | \quad text{is_degraded} = text{true} \quad | \quad text{is_evidentiary} = text{false}
  Degraded operation must never be disguised as live empirical or AI-generated intelligence.

---

### Invariant 8: Testing as Epistemic Verification
* **Invariant-Driven Testing:** Test suites must verify architectural, epistemic, and constitutional invariants - such as Net Balance calculations, contradiction triggers, and impact blast-radius cascades - not merely happy-path unit execution.
* **Test Isolation:** Unit and integration tests must run deterministically using isolated test persistence, such as temporary or dedicated SQLite databases, without requiring live paid external services.

---

### Invariant 9: Small, Reversible & Spec-Driven Changes
* **Spec Before Transformation:** Consequential changes that alter requirements, architecture, domain semantics, epistemic behavior, persistence semantics, security boundaries, or externally observable contracts require formal specification before implementation (following the SDD workflow). Non-consequential edits (e.g., trivial bug fixes, typos, styling tweaks) do not require a new formal specification.
* **Atomic & Reversible Commits:** Changes must be scoped to single coherent objectives. Unsolicited, large-scale refactoring bundled with bug fixes is strictly prohibited.

---

### Invariant 10: AI-Assisted Engineering Boundaries
* **Permitted AI Capabilities:** AI assistants (including Antigravity and CIIA) may inspect code, analyze dependencies, propose architectural designs, generate implementations, write tests, and repair verified defects.
* **Forbidden AI Actions:** AI assistants must **never silently**:
  1. Alter constitutional invariants or principles.
  2. Modify ratified architectural doctrine or domain models.
  3. Forge or fabricate evidence provenance records.
  4. Overwrite or bypass human-ratified decisions.
  5. Claim runtime implementation behavior without verifiable code evidence.
