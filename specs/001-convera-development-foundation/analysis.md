# CONVERA SDD-001: Conformance & Implementation Analysis

**Specification ID**: `CONVERA-SDD-001`  
**Status**: 🟢 ANALYSIS COMPLETE  

---

## 1. Conformance Matrix

| Subsystem | Specified Requirement | Implemented Reality | Conformance Classification | Evidence |
|---|---|---|---|---|
| **Repository Identity** | `convera-monorepo` v1.1.0 | `package.json` root | 🟢 **CONFORMANT** | `package.json` line 2 |
| **Backend Runtime** | Python 3.12+, FastAPI, 15 Routers | 15 REST routers, 25 engines | 🟢 **CONFORMANT** | `backend/routers/`, `backend/engines/` |
| **Database Schema** | 23 Relational Tables (WAL mode) | 23 SQLite tables | 🟢 **CONFORMANT** | `sqlite_adapter.py` lines 42–380 |
| **Frontend Stack** | Next.js 15.2.0, React 19, TS 5.8 | `web/package.json` | 🟢 **CONFORMANT** | `web/package.json` lines 12–22 |
| **Frontend Services** | 10 Typed Client Services | 10 modules in `services/` | 🟢 **CONFORMANT** | `web/src/services/` |
| **AI LLM Gateway** | Multi-provider with CoT stripping | Gemini, Groq, OpenRouter, Ollama | 🟢 **CONFORMANT** | `llm_gateway.py` lines 1–381 |
| **Synthetic Fallback** | Deterministic fallback on outage | Raises `RuntimeError` | ⚪ **TARGET** | `llm_gateway.py` line 370 |
| **Ollama Fallback** | Automatic failover on cloud timeout | Manual provider selection | ⚪ **TARGET** | `llm_gateway.py` lines 321–338 |
| **Scholarly Connectors** | 5 Scholarly Sources | 4 in hub + Europe PMC in client | 🟢 **CONFORMANT (CAPABILITY)** | `backend/connectors/`, `research_client.py` |
| **Security Perimeter** | Local/lab passcode gating | Permissive CORS, client passcode | 🟡 **PARTIAL / TARGET** | `server.py` line 44, `authService.ts` |
| **Test Harness** | 30 test modules, 86 test cases | 86/86 passed in 146.6s | 🟢 **VERIFIED** | `pytest backend/tests` execution |
| **Frontend Build** | Next.js static production build | Compiled 0 errors, 4 routes | 🟢 **VERIFIED** | `npm run build` execution |

---

## 2. Risk Assessment & Accepted Limitations

1. **Security Perimeter (P2 - Accepted Limitation)**:
   - *Current State*: Backend uses wildcard CORS (`allow_origins=["*"]`) and client-side passcode gating.
   - *Assessment*: Sufficient for Local Desktop (P1) and Lab Server (P2) deployment profiles defined in SDD-001.
   - *Remediation*: Production multi-user authentication (JWT/RBAC) is designated as a future hardening target for Enterprise (P3) / Cloud (P4) profiles.

2. **Synthetic Fallback Generator (P3 - Accepted Limitation)**:
   - *Current State*: Runtime raises `RuntimeError` on total outage.
   - *Assessment*: Handled gracefully by client error banners; does not block development workflows.
   - *Remediation*: Rule-based generator to be implemented in a dedicated AI engine sprint.

3. **Pytest Working Directory Dependency (P3 - Informational)**:
   - *Current State*: Absolute imports require `pytest` execution from `backend/` or `PYTHONPATH=backend`.
   - *Assessment*: Fully operational when running standard `npm run test:backend` or `cd backend && pytest`.
