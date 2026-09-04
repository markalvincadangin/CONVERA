# CONVERA - Security Architecture, Threat Model & Governance Policy

**Document ID**: `CONVERA-ENG-005`  
**Classification**: Threat Model, Data Isolation & Boundary Controls  
**Authority Tier**: Tier 2 Engineering Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟡 PARTIAL  
**Canonical Path**: `docs/03-engineering/SECURITY.md`  
**Upstream Dependencies**: `02-system/SYSTEM_ARCHITECTURE.md`  
**Downstream Dependents**: `08-operations/DEPLOYMENT.md`  

---

> **Local-First Data Protection, Credential Governance, Threat Model & Audit Tamper-Resistance.**
> This document authoritatively establishes CONVERA's security architecture, threat model, defensive invariants, and vulnerability response protocols. It directly operationalizes `CONSTITUTION.md` (Articles V & VI) and `ENGINEERING_PRINCIPLES.md` into an enforceable security specification.

---

## 1. Security Philosophy & Core Posture

CONVERA is designed as a **local-first, privacy-preserving epistemic governance platform**. Security is governed by the core axiom:

> **"Evidence before assertion; local boundary isolation by default."**

Because CONVERA manages proprietary innovation strategies, clinical research hypotheses, and foundational architectural decisions, protecting data sovereignty, credential isolation, and audit trail integrity is a **constitutional imperative**.

---

## 2. The Five Security Invariants

`	ext
+-----------------------------------------------------------------------------+
|                         CONVERA SECURITY INVARIANTS                         |
+-----+-------------------------------+---------------------------------------+
| #   | Invariant                     | Core Security Mandate                 |
+-----+-------------------------------+---------------------------------------+
| 1   | Local-First Data Sovereignty  | Project intelligence stays local.     |
| 2   | Zero Credential Leakage       | Keys loaded via env; zero in logs.    |
| 3   | Bounded External Egress       | Only public academic APIs & LLM ports.|
| 4   | Injection & Traversal Defense | Parameterized SQL & path confinement. |
| 5   | Audit Trail Tamper-Resistance | Immutable provenance & supersessions. |
+-----+-------------------------------+---------------------------------------+
`

---

## 3. Threat Model & Defensive Mitigations

`	ext
+-----------------------------------------------------------------------------+
|                        THREAT MITIGATION MATRIX                             |
+---------------------+---------------------------+---------------------------+
| Threat Vector       | Risk Scenario             | CONVERA Mitigation Policy |
+---------------------+---------------------------+---------------------------+
| T1: Malicious Paper | Literature abstracts with | * Raw Signal Isolation.   |
|     Injection       | prompt injection attacks. | * Strict parsing bounds.  |
|                     |                           | * Untrusted signal policy.|
+---------------------+---------------------------+---------------------------+
| T2: Credential      | AI gateway keys leaked in | * Environment isolation.  |
|     Exfiltration    | logs or error payloads.   | * Redaction in exception  |
|                     |                           |   handlers and logging.   |
+---------------------+---------------------------+---------------------------+
| T3: Data Poisoning  | Forged provenance to      | * Immutable extraction    |
|     & Fake Citations| artificially boost claims.|   timestamps & connectors.|
|                     |                           | * Human verification gate.|
+---------------------+---------------------------+---------------------------+
| T4: SQL Injection   | Malicious user input in   | * Strict parameterized    |
|                     | claim or query fields.    |   queries in SQLiteAdapter|
|                     |                           | * Zero raw string SQL.    |
+---------------------+---------------------------+---------------------------+
| T5: Path Traversal  | Malicious file paths in   | * Path normalization.     |
|     & FS Escape     | export / import endpoints.| * Confinement within root.|
+---------------------+---------------------------+---------------------------+
| T6: Uncontrolled    | Silent cloud telemetry    | * Zero third-party cloud  |
|     Data Egress     | leaking user problem space|   telemetry or analytics. |
+---------------------+---------------------------+---------------------------+
`

---

## 4. Architectural Area Security Specifications

### A. Presentation Area (rontend/)
* **Content Security:** Strict HTML sanitization on markdown and citation rendering to prevent Cross-Site Scripting (XSS).
* **API Communication:** Communicates exclusively with backend API endpoints over localhost or configured secure domains.
* **State Isolation:** Session and UI state stored in client memory or local browser storage; no credentials stored in client bundle.

### B. Application / Router API Area (backend/routers/)
* **Input Validation:** Strict Pydantic v2 schema validation rejecting malformed or unexpected payloads (HTTP 422).
* **Error Sanitization:** Internal stack traces and database error details are sanitized before returning HTTP 500 error responses.
* **CORS & Binding:** Backend binds to localhost (127.0.0.1) by default, restricting unauthorized network exposure.

### C. Domain Engine Area ((backend/engines/)
* **Epistemic Integrity:** Domain engines enforce contradiction precedence and tri-part confidence decoupling, preventing malicious score inflation.
* **Pure Logic Isolation:** Engines do not perform unmonitored I/O, execute shell commands, or make unverified network requests.

### D. Persistence Area ((backend/storage/)
* **Strict Parameterization:** All SQLite queries executed via BaseStorageAdapter use parameterized SQL statements. Dynamic string formatting in SQL statements is strictly prohibited.
* **WAL Mode & Concurrency:** Write-Ahead Logging (WAL) ensures database consistency and durability during concurrent reads and writes.
* **Non-Destructive Immutability:** Audit tables (audit_logs, invalidation_events, provenance_records) do not support hard delete operations via public API adapters.

### E. CIIA Area ((backend/llm_gateway.py, backend/connectors/, backend/mcp_server.py)
* **Credential Redaction:** API keys (GEMINI_API_KEY, GROQ_API_KEY) are read strictly from environment variables and must never appear in log files or diagnostic exports.
* **Connector Network Scope:** Connectors communicate exclusively with public academic APIs (OpenAlex, Crossref, PubMed, Europe PMC, Semantic Scholar) over HTTPS with strict request timeouts (10s default) and rate-limiting.
* **MCP Interface Boundaries:** The outward-facing Model Context Protocol server exposes governed, read-only or policy-checked tool endpoints. It does **not** expose unrestricted shell execution or file-system deletion tools.

---

## 5. Vulnerability Management & Incident Response

1. **Local Security Defect Identification:** Security defects are treated as highest-priority engineering issues following the SDD Workflow (SDD_WORKFLOW.md).
2. **Safe Rollback & Hotfix Protocol:** In the event of a security regression, the system executes non-destructive rollback (DEVELOPMENT_WORKFLOW.md) and issues an isolated, tested fix.
3. **Zero Secret Commits:** Git pre-commit and automated checks verify that no .env files or hardcoded credential strings are introduced into repository history.
