# CONVERA SDD-002: Specification ↔ Implementation Conformance Matrix

**Specification ID**: `CONVERA-SDD-002`  
**Status**: 🟢 PHASE 7.5 AUDITED & RATIFIED (FULL 9-LAYER CONFORMANCE BASELINE)  

---

## Conformance Classification Key
- **CONFORMANT**: Implemented and verified matching authoritative specification.
- **PARTIALLY CONFORMANT**: Partially implemented; contains minor deviations or missing secondary states.
- **NON-CONFORMANT**: Implemented in conflict with authoritative specification (Triaged into Defect Register).
- **TARGET**: Documented planned capability; intentionally not implemented in current profile.
- **OVERSTATED**: Documentation claims implementation exceeding actual code reality.
- **UNDERSPECIFIED**: Code exists without clear specification backing.
- **UNVERIFIED**: Implementation exists but requires empirical test assertion.

---

## 1. Foundation & Governance (`docs/00-foundation/`)

| Requirement ID | Spec Document | Requirement Description | Implementation Path | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FND-01** | `CONSTITUTION.md` | Human sovereignty & clearance boundaries | `backend/routers/gates.py`, `sessions.py` | **CONFORMANT** | Mentor signoff and gate review endpoints enforce explicit human confirmation |
| **FND-02** | `PRINCIPLES.md` | Free-first & local-first operational default | `backend/storage/sqlite_adapter.py` | **CONFORMANT** | SQLite WAL local storage, zero mandatory external paid services |
| **FND-03** | `GLOSSARY.md` | Standardized terminology across UI & backend | Entire repository corpus | **CONFORMANT** | Terminology unified across all 38 specifications in SDD-001 |
| **FND-04** | `CONVERA.md` | Dual-track inquiry engine positioning | `web/src/components/layout/` | **CONFORMANT** | Visual framework selector and track badges active |

---

## 2. Product & Capabilities (`docs/01-product/`)

| Requirement ID | Spec Document | Requirement Description | Implementation Path | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PRD-01** | `PRODUCT_DEFINITION.md` | Dual-track inquiry engine (Venture & Research) | `web/src/components/layout/` | **CONFORMANT** | Track selector modal and header badges verified |
| **PRD-02** | `CAPABILITIES.md` | Problem Bank management with 34 starter concepts | `backend/routers/problems.py` | **CONFORMANT** | `POST /api/problems/seed-starter` verified in pytest |
| **PRD-03** | `CAPABILITIES.md` | Automated Unknowns Map decomposition | `backend/engines/knowledge_graph_engine.py` | **CONFORMANT** | `GET /api/knowledge/unknowns` verified |
| **PRD-04** | `CAPABILITIES.md` | Socratic critique & devil's advocate challenges | `backend/routers/problems.py` | **CONFORMANT** | `POST /api/problems/{id}/challenge` verified in `test_decision_engine.py` |

---

## 3. System Architecture & Models (`docs/02-system/`)

| Requirement ID | Spec Document | Requirement Description | Implementation Path | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SYS-01** | `SYSTEM_ARCHITECTURE.md` | Clean layer separation (Presentation, Router, Engine, Adapter) | Monorepo topology | **CONFORMANT** | Architectural isolation verified |
| **SYS-02** | `DOMAIN_MODEL.md` | Typed Pydantic domain models | `backend/models/` | **CONFORMANT** | Typed schemas validated in `test_schemas.py` |
| **SYS-03** | `EVIDENCE_MODEL.md` | Tri-part confidence scoring ($[0.0, 1.0]$) | `backend/engines/knowledge_graph_engine.py` | **CONFORMANT** | Pytest verified in `test_knowledge_graph.py` |
| **SYS-04** | `DECISION_MODEL.md` | Decision records with rationale and commitment trails | `backend/routers/decisions.py` | **CONFORMANT** | `POST /api/decisions/commit` verified |
| **SYS-05** | `TRACEABILITY_MODEL.md` | Bidirectional lineage between problems and requirements | `backend/routers/traceability.py` | **CONFORMANT** | `GET /api/traceability/graph` verified |

---

## 4. Engineering & Workflows (`docs/03-engineering/`)

| Requirement ID | Spec Document | Requirement Description | Implementation Path | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ENG-01** | `DEVELOPMENT_WORKFLOW.md` | Git strategy `feature/*` -> `develop` -> `main` | Git branch topology | **CONFORMANT** | Standardized and verified in SDD-001 |
| **ENG-02** | `ENGINEERING_PRINCIPLES.md` | Domain engine isolation & zero mock leakage | `backend/engines/` | **CONFORMANT** | Engine pure functional methods verified |
| **ENG-03** | `TESTING_STRATEGY.md` | Pytest harness with isolated SQLite databases | `backend/tests/` | **CONFORMANT** | 86 passing tests in 89.1s |
| **ENG-04** | `SECURITY.md` | Passcode protection & local/lab security profile | `backend/routers/sessions.py` | **CONFORMANT** | Passcode check verified in `test_storage.py` |
| **ENG-05** | `SECURITY.md` | Production JWT / RBAC / Whitelist CORS | `backend/server.py` | **TARGET** | Retained as future target profile |

---

## 5. AI & Intelligence Architecture (`docs/04-ai/`)

| Requirement ID | Spec Document | Requirement Description | Implementation Path | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AI-01** | `AI_ARCHITECTURE.md` | Multi-provider fallback gateway (Groq, Gemini, Ollama) | `backend/llm_gateway.py` | **CONFORMANT** | Multi-provider fallback tested in `test_research_discovery.py` |
| **AI-02** | `AI_ARCHITECTURE.md` | Synthetic terminal fallback (`source=synthetic_fb`) | `backend/llm_gateway.py` | **TARGET** | Normative target capability |
| **AI-03** | `AI_GOVERNANCE.md` | Response sanitization & schema validation | `backend/llm_gateway.py` | **CONFORMANT** | `clean_llm_response` passes in unit tests |
| **AI-04** | `CONNECTOR_ARCHITECTURE.md`| Federated scholarly search across 4 connectors | `backend/connectors/hub.py` | **NON-CONFORMANT** | Frontend called stale `/api/research/query` instead of canonical `POST /api/connectors/search` (DEF-001) |
| **AI-05** | `MCP.md` | Standalone stdio JSON-RPC 2.0 daemon | `backend/mcp_server.py` | **CONFORMANT** | Exposes 7 ratified tools |

---

## 6. Data Architecture & Schema (`docs/05-data/`)

| Requirement ID | Spec Document | Requirement Description | Implementation Path | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DAT-01** | `DATABASE_SCHEMA.md` | 23 physical relational tables in SQLite WAL mode | `backend/storage/sqlite_adapter.py` | **CONFORMANT** | 23 physical tables verified |
| **DAT-02** | `DATA_ARCHITECTURE.md` | Atomic transaction safety & foreign key cascades | `backend/storage/sqlite_adapter.py` | **CONFORMANT** | Foreign keys and transaction rollbacks verified |
| **DAT-03** | `PROVENANCE.md` | Immutable source hashes and citation links | `backend/routers/knowledge.py` | **CONFORMANT** | `POST /api/knowledge/provenance` verified |

---

## 7. Frontend & UI/UX (`docs/06-frontend/`)

| Requirement ID | Spec Document | Requirement Description | Implementation Path | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FE-01** | `FRONTEND_ARCHITECTURE.md` | Next.js 15.2.0 App Router, React 19 Client State | `web/package.json` | **CONFORMANT** | `npm run build` compiles with 0 errors |
| **FE-02** | `DESIGN_SYSTEM.md` | 60-30-10 palette, `#0066FF`, obsidian background | `web/src/app/globals.css` | **CONFORMANT** | CSS design tokens verified |
| **FE-03** | `ACCESSIBILITY.md` | WCAG 2.2 AA modal dialog roles & aria attributes | `web/src/components/` | **NON-CONFORMANT** | Modals missing `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (DEF-002) |
| **FE-04** | `ACCESSIBILITY.md` | Keyboard navigation on interactive cards | `web/src/components/` | **NON-CONFORMANT** | 15 clickable tags missing `role="button"`/`onKeyDown` (DEF-003) |
| **FE-05** | `UI_UX_PRINCIPLES.md` | Inline error feedback and state resilience | `web/src/components/` | **NON-CONFORMANT** | Missing error banners in research modals (DEF-004) |
| **FE-06** | `INFORMATION_ARCHITECTURE.md` | Progressive disclosure & Command Palette (`Ctrl+K`) | `web/src/components/common/` | **CONFORMANT** | Command palette modal and shortcut active |

---

## 8. Domain Tracks (`docs/07-tracks/`)

| Requirement ID | Spec Document | Requirement Description | Implementation Path | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TRK-01** | `INNOVATION_TRACK.md` | Technopreneurship 5-Phase Venture Ratchet | `backend/routers/pipeline.py` | **CONFORMANT** | Phases 1–5 turn and audit verified |
| **TRK-02** | `RESEARCH_TRACK.md` | Computing Research DSR Stages A–F & Matrix | `backend/routers/research.py` | **CONFORMANT** | Matrix generation & gaps verified |
| **TRK-03** | `TRACK_INTEROPERABILITY.md`| Framework transition protocol with progress isolation | `backend/storage/sqlite_adapter.py` | **CONFORMANT** | `switch_session_framework` verified |
| **TRK-04** | `TRACK_GOVERNANCE.md` | Two-tier clearance & human gate review | `backend/routers/gates.py` | **CONFORMANT** | Gate evaluation verified |

---

## 9. Operations & Deployment (`docs/08-operations/`)

| Requirement ID | Spec Document | Requirement Description | Implementation Path | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OPS-01** | `DEPLOYMENT.md` | Local dev scripts (`start-dev.ps1`, `start-dev.sh`) | Root scripts | **CONFORMANT** | Script syntax and execution verified |
| **OPS-02** | `MONITORING.md` | `/api/health` system telemetry endpoint | `backend/server.py` | **CONFORMANT** | Responds 200 OK |
| **OPS-03** | `BACKUP_DISASTER_RECOVERY.md`| SessionSnapshot rollback & SQLite backup | `backend/routers/sessions.py` | **CONFORMANT** | Snapshot create & restore verified in pytest |
| **OPS-04** | `SYSTEM_CERTIFICATION.md` | Master system certification criteria | SDD-002 Dossier | **UNVERIFIED** | Active subject of SDD-002 verification |
