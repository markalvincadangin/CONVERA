# CONVERA — Empirical Audits & System Health Registry

> **Classification**: Empirical Evaluation & Baseline Verification Reports  
> **Authority**: Point-in-time operational audit records under [CONVERA Constitution Article VII (Two-Way Consistency)](../docs/00-foundation/CONSTITUTION.md)  
> **Canonical Path**: `audits/`

This directory serves as the centralized, immutable registry for all empirical evaluations, heuristic usability audits, security scans, and runtime conformance assessments conducted across the CONVERA platform.

---

## 🏛️ Empirical Audits vs. Canonical Specifications

In adherence to industry standards and CONVERA's documentation hierarchy:
- **`docs/` (Canonical Architecture)**: Living, normative specifications (Layers 00–08) that define what the system *must be*.
- **`audits/` (Empirical Evidence)**: Point-in-time snapshots and baseline findings grounded in empirical testing against specific git revisions and dates.
- **`specs/` (Spec-Driven Development)**: Targeted feature specifications, checklists, tasks, and governance audit trails that remediate gaps discovered during audits.

---

## 📋 Audit Campaign Registry

| Campaign ID | Date | Target Revision | Scope / Subject | Score / Outcome | Directory Path |
|---|---|---|---|---|---|
| `AUDIT-USABILITY-001` | 2026-09-04 | `301448c` (Clean Tree) | Comprehensive System Usability & Methodology (12 Hard Gates) | **Conditional Pass** (85.05 / 100) | [`audits/2026-09-system-usability/`](2026-09-system-usability/) |
| `AUDIT-UIUX-001` | 2026-09-04 | `301448c` | Frontend Visual, Navigation, Design System & Accessibility | **Empirical Defect Register** | [`audits/2026-09-system-usability/`](2026-09-system-usability/) |
| `AUDIT-PROBLEM-DISCOVERY-001` | 2026-09-05 | `ac3584c` | Phase 1 Problem Discovery, Intake Usability & Problem Bank | **Empirical Baseline for UX-BATCH-001** | [`audits/2026-09-problem-discovery-ux/`](2026-09-problem-discovery-ux/) |
| `AUDIT-STABILIZATION-001` | 2026-09-05 | `2c5b99f` | Runtime Conformance, Provider Fallback & Component Inventory | **Partially Degraded (Functional with Fallbacks)** | [`audits/2026-09-problem-discovery-ux/`](2026-09-problem-discovery-ux/) |

---

## 📂 Audit Campaigns Overview

### 1. 2026-09-system-usability
Comprehensive whole-system and UI/UX usability evaluation that grounded `specs/008-usability-remediation-dual-track/`:
* [**`CONVERA_SYSTEM_USABILITY_AUDIT_PLAN.md`**](2026-09-system-usability/CONVERA_SYSTEM_USABILITY_AUDIT_PLAN.md) — The 100-point audit methodology across 12 Hard Gates.
* [**`CONVERA_CURRENT_SYSTEM_AUDIT.md`**](2026-09-system-usability/CONVERA_CURRENT_SYSTEM_AUDIT.md) — Empirical scoring report and Hard Gate analysis.
* [**`CONVERA_CURRENT_UIUX_AUDIT.md`**](2026-09-system-usability/CONVERA_CURRENT_UIUX_AUDIT.md) — Heuristic visual and interaction usability evaluation.

### 2. 2026-09-problem-discovery-ux
Focused empirical evaluation of Phase 1 Problem Intake and runtime feature conformance that grounded `specs/009-ux-iteration-problem-discovery/` (`UX-BATCH-001`):
* [**`CONVERA_PROBLEM_DISCOVERY_UX_AUDIT.md`**](2026-09-problem-discovery-ux/CONVERA_PROBLEM_DISCOVERY_UX_AUDIT.md) — Baseline empirical audit of manual entry, notes import, and card CTAs.
* [**`CONVERA_RUNTIME_FEATURE_AUDIT.md`**](2026-09-problem-discovery-ux/CONVERA_RUNTIME_FEATURE_AUDIT.md) — Runtime feature conformance audit and active vs. dormant component inventory.
