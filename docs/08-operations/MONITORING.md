# Monitoring & Epistemic Health Specification

**Document ID**: `CONVERA-OPS-002`  
**Classification**: 4-Tier Observability, Probes & Metric Telemetry  
**Authority Tier**: Tier 2 Operations Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟡 PARTIAL  
**Canonical Path**: `docs/08-operations/MONITORING.md`  
**Upstream Dependencies**: `08-operations/DEPLOYMENT.md, 04-ai/AI_ARCHITECTURE.md`  
**Downstream Dependents**: `08-operations/SYSTEM_CERTIFICATION.md`  

---

## 1. Executive Summary & Core Observability Philosophy

The **Monitoring & Epistemic Health Specification** defines the operational observability architecture, telemetry metrics, health check endpoints, and alert escalation protocols for CONVERA.

Unlike conventional web applications that monitor only generic HTTP liveness and server resource utilization, CONVERA monitors four interrelated operational tiers:
$$\text{Tier 1: Infrastructure Health} \longrightarrow \text{Tier 2: CIIA & AI Health} \longrightarrow \text{Tier 3: Epistemic Health} \longrightarrow \text{Tier 4: Workflow Health}$$

### Governing Observability Axioms
1. **Truthful Telemetry (Constitution Article I & VII)**: Telemetry must reflect actual operational reality. Degraded network egress, provider fallbacks, synthetic generation, and unverified provenance must be explicitly recorded and visible—never masked or inferred.
2. **Epistemic Health is Primary**: A system that is 100% available at the HTTP layer is fundamentally broken if it produces unanchored synthetic claims, accumulates unresolved contradictions, or allows stale decisions to bypass human governance.
3. **Attributable Auditability**: All operational anomalies, rate-limit throttles, model provider failures, and invalidation cascades must generate structured, attributable log entries.

---

## 2. 4-Tier Observability Architecture

```
                       4-TIER OBSERVABILITY ARCHITECTURE
                                       │
 ┌─────────────────────────────────────┼─────────────────────────────────────┐
 │                                     │                                     │
 ▼                                     ▼                                     ▼
[ Tier 1: Infrastructure ]     [ Tier 2: CIIA & AI Gateway ]     [ Tier 3: Epistemic Core ]
• FastAPI Process Liveness     • Gemini / Groq Provider Latency  • Synthetic Fallback Frequency
• Next.js Frontend Availability• Fallback Cascade Activations    • Unresolved Contradictions
• SQLite WAL Disk / Lock Health• Scholarly Connector Rate Limits • Stale Decision Backlog
• RAM & Storage Headroom       • MCP Stdio Daemon Connection     • Blast-Radius Event Queue
                                       │
                                       ▼
                         [ Tier 4: Workflow & Governance ]
                         • Gate Review Pass / Fail Rates
                         • Blocked Milestone Progression
                         • Mentor Signoff Pending Backlog
                         • Traceability Lineage Gaps
```

---

## 3. Detailed Telemetry Tiers & Metrics

### Tier 1: Infrastructure & System Health

| Metric | Target / Normal | Warning Threshold | Critical Threshold | Diagnostic Action |
| :--- | :--- | :--- | :--- | :--- |
| **API Response Latency (`p95`)** | $< 250\text{ms}$ (non-LLM) | $> 800\text{ms}$ | $> 2,000\text{ms}$ | Profile router queries; check SQLite read concurrency. |
| **SQLite WAL Lock Contention** | $0\text{ timeouts}$ | $> 1\text{ timeout / hr}$ | $> 5\text{ timeouts / hr}$ | Check long-running write transactions; verify 30.0s timeout. |
| **Disk Storage Headroom** | $> 20\%\text{ free}$ | $< 15\%\text{ free}$ | $< 5\%\text{ free}$ | Execute WAL checkpointing (`PRAGMA wal_checkpoint(TRUNCATE);`); archive snapshots. |
| **HTTP 5xx Error Rate** | $< 0.1\%$ | $> 1.0\%$ | $> 5.0\%$ | Inspect server traceback logs; check database file permissions. |

### Tier 2: CIIA & Intelligence Integration Health

| Metric | Target / Normal | Warning Threshold | Critical Threshold | Diagnostic Action |
| :--- | :--- | :--- | :--- | :--- |
| **Primary LLM Availability (Gemini)**| $99.5\%$ | $< 95.0\%$ | $< 90.0\%$ | Check API quota; verify `GEMINI_API_KEY`; fallback to Groq. |
| **Fallback Cascade Activations** | $< 5\%\text{ of calls}$ | $> 15\%\text{ of calls}$ | $> 50\%\text{ of calls}$ | Investigate primary provider outages or prompt token overflows. |
| **Scholarly Connector Egress Health**| $100\%\text{ reachable}$ | $\ge 1\text{ connector failing}$ | All connectors failing | Check network proxy; inspect rate-limit headers (429s). |
| **MCP Stdio Server Health** | Connected & active | Reconnecting | Process terminated | Restart `backend/mcp_server.py`; inspect stdio pipe buffers. |

### Tier 3: Epistemic & Knowledge Core Health

| Metric | Target / Normal | Warning Threshold | Critical Threshold | Diagnostic Action |
| :--- | :--- | :--- | :--- | :--- |
| **Synthetic Fallback Ratio (`source=synthetic_fb`)** | $< 10\%$ | $> 25\%$ | $> 60\%$ | **Epistemic Alert**: System is operating in low-grounding degraded mode; prompt user for manual evidence. |
| **Unresolved Claim Contradictions** | $0\text{ critical}$ | $> 3\text{ active}$ | $> 10\text{ active}$ | Notify team to conduct Decision Room consensus resolution. |
| **Stale Decision Accumulation (`STALE_REVIEW_REQUIRED`)** | $0\text{ stale}$ | $> 2\text{ stale}$ | $> 5\text{ stale}$ | Trigger Socratic blast-radius review in active phase views. |
| **Unresolved Invalidation Backlog** | $0\text{ pending}$ | $> 1\text{ event}$ | $> 5\text{ events}$ | Run `ImpactEngine` dependency re-evaluation. |

### Tier 4: Workflow, Gate & Governance Health

| Metric | Target / Normal | Warning Threshold | Critical Threshold | Diagnostic Action |
| :--- | :--- | :--- | :--- | :--- |
| **Gate Review Failure Ratio (`FAIL`/`REVISE`)** | Balanced ($15\text{--}35\%$) | $> 60\%\text{ fail}$ | $> 85\%\text{ fail}$ | Review rubric threshold calibration or student evidence quality. |
| **Pending Mentor Signoff Backlog** | $< 48\text{ hrs}$ | $> 7\text{ days}$ | $> 14\text{ days}$ | Alert faculty advisors to complete milestone review. |
| **Requirements Traceability Coverage** | $100\%\text{ linked}$ | $< 90\%\text{ linked}$ | $< 70\%\text{ linked}$ | Flag orphan requirements; run Traceability Matrix repair. |

---

## 4. Health & Diagnostic Endpoints

CONVERA exposes structured operational and epistemic health probes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          HEALTH & DIAGNOSTIC ENDPOINTS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GET /api/health                                                            │
│  • Reports process status, uptime, storage mode (SQLite WAL), CCDS standard │
│                                                                             │
│  GET /api/models/status                                                     │
│  • Reports active LLM gateway provider, fallback status, model parameters   │
│                                                                             │
│  POST /api/evaluation/calibrate                                             │
│  • Evaluates Tri-Part confidence calibration (C_AI vs S_EVID vs C_DEC)      │
│                                                                             │
│  GET /api/traceability/lineage/{requirement_id}                             │
│  • Audits bidirectional lineage integrity from requirement to evidence      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Structured Logging & Alerting Standards

All backend components must log events in structured JSON format including correlation and governance metadata:

```json
{
  "timestamp": "2026-09-04T13:52:00.000Z",
  "level": "WARNING",
  "tier": "EPISTEMIC_HEALTH",
  "subsystem": "impact_engine",
  "event_type": "IMPACT_INVALIDATION_PROPAGATED",
  "project_id": "proj_948a",
  "session_id": "sess_01bc",
  "actor": "mentor_dr_santos",
  "details": {
    "invalidated_assumption_id": "assump_04",
    "affected_decision_ids": ["dec_02", "dec_05"],
    "affected_requirements": ["REQ-01", "REQ-04"],
    "status": "STALE_REVIEW_REQUIRED"
  }
}
```

### Alert Escalation Protocol
* **INFO**: Normal system operations, phase transitions, and successful model completions.
* **WARNING**: Single provider fallback activations, connector rate limiting, and new assumption refutations.
* **CRITICAL_EPISTEMIC_ALERT**: High synthetic fallback ratio ($>25\%$), accumulated stale decisions ($>3$), or unresolved contradiction backlogs. Surfaces prominent UI banners across active workspaces.
* **DEGRADED_OPERATION**: Total external network outage; system switches to Profile 4 (Local Ollama / offline synthetic fallback) with explicit $0.0$ evidentiary disclaimers.

---

## 6. Monitoring Invariants (MON-01 through MON-10)

| Invariant ID | Formulation | Enforceability & Status |
| :--- | :--- | :--- |
| **MON-01** | **Multi-Tier Health Observability**: Telemetry systems must independently measure and report Infrastructure, CIIA, Epistemic, and Workflow health tiers. | `[NORMATIVE / IMPLEMENTED]`<br>Implemented via health endpoints and evaluation engines. |
| **MON-02** | **Synthetic Fallback Transparency**: Any activation of synthetic fallback generation (`source=synthetic_fb`) must be metered and flagged in operational telemetry. | `[NORMATIVE / IMPLEMENTED]`<br>Tracked in `llm_gateway.py` and evidence pipeline. |
| **MON-03** | **Degraded State Visibility**: Operating in degraded or offline mode must be explicitly indicated in telemetry and UI banners; degradation cannot be silently concealed. | `[NORMATIVE / IMPLEMENTED]`<br>Reported in `/api/models/status` and workspace headers. |
| **MON-04** | **Tri-Part Confidence Telemetry**: Epistemic telemetry must track AI model confidence ($C_{AI}$), evidence strength ($S_{EVID}$), and decision confidence ($C_{DEC}$) as distinct, non-collapsed time-series. | `[NORMATIVE / IMPLEMENTED]`<br>Calculated in `ConveraEvaluationEngine` and scorecard endpoints. |
| **MON-05** | **Blast-Radius Event Monitoring**: Generation of an `ImpactInvalidationEvent` must trigger immediate operational alerting and stale state propagation tracking. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Backend `ImpactEngine` logs events; UI alert badges surface in active views. |
| **MON-06** | **Scholarly Rate-Limit Observability**: Connector health monitoring must track HTTP 429 throttles, latency spikes, and quota exhaustion across all 5 scholarly APIs. | `[NORMATIVE / IMPLEMENTED]`<br>Implemented in `BaseConnector` and `SemanticScholarConnector`. |
| **MON-07** | **SQLite WAL Lock Monitoring**: Database connection managers must log lock timeouts and slow queries exceeding the 30.0s threshold. | `[NORMATIVE / IMPLEMENTED]`<br>Configured in `sqlite_adapter.py` connection factory. |
| **MON-08** | **Gate Review Verdict Tracking**: Gate evaluation telemetry must log passed and failed criteria vectors to detect rubric miscalibrations or systemic student blockers. | `[NORMATIVE / IMPLEMENTED]`<br>Recorded in `gate_reviews` relational storage. |
| **MON-09** | **Traceability Lineage Auditability**: The system must meter orphan requirements and missing evidence links, alerting operators to broken provenance trails. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Supported via `requirements_traceability` lineage queries. |
| **MON-10** | **Immutable Audit Log Integrity**: Operational and epistemic telemetry records must be append-only and attributable to authenticated sessions or actors. | `[NORMATIVE / IMPLEMENTED]`<br>Persisted with ISO-8601 UTC timestamps in SQLite WAL tables. |

---

## 7. Architectural & Operational Boundary Summary

1. **Observability vs Authority**: Monitoring observes, alerts, and meters system and epistemic behavior; it does not unilaterally mutate knowledge entities or grant gate clearance.
2. **Subordination to Constitution**: Telemetry systems are bound by Article I (*Knowledge $
e$ Workflow*) and Article II (*Human Sovereignty*). Automated health alerts serve human operators and faculty mentors.
3. **Audit Continuity**: Historical telemetry and invalidation logs remain preserved across application restarts and database rollbacks.
