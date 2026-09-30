# CONVERA SDD-018: Relational Data Model Specification
# Research Stage F Feasibility & Proposal Engine (Table 35: `research_feasibility_records`)

**Specification ID**: CONVERA-SDD-018  
**Classification**: Data Model & Schema Specification  
**Authority Tier**: Tier 2 (Database Schema Contract)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/018-research-stage-f-proposal-canvas`  
**Target Integration Branch**: `develop`  

---

## 1. Relational Schema Expansion (Table 35: `research_feasibility_records`)

CONVERA's SQLite WAL database is extended with Table 35:

```sql
CREATE TABLE IF NOT EXISTS research_feasibility_records (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    ethics_checklist_json TEXT NOT NULL,       -- JSON: {ra_10173_compliant, consent_protocol, irb_status, data_minimization, risks_identified}
    sdg_alignments_json TEXT NOT NULL,         -- JSON array: [{sdg_number, sdg_name, rationale, target_indicator}]
    dost_alignments_json TEXT NOT NULL,        -- JSON array: [{sector, roadmap_name, priority_area, alignment_notes}]
    budget_breakdown_json TEXT NOT NULL,       -- JSON: {hardware_cost, cloud_cost, travel_pilot_cost, dataset_acquisition_cost, currency, total}
    timeline_weeks INTEGER NOT NULL,           -- Planned research execution duration (e.g. 16, 24)
    feasibility_score REAL NOT NULL,           -- Normalized deterministic score [0.0, 100.0]
    compliance_passed INTEGER DEFAULT 0,       -- 1 if all mandatory compliance criteria pass, 0 otherwise
    is_cleared INTEGER DEFAULT 0,              -- 1 if Gate 4 cleared & approved, 0 otherwise
    advisory_notes TEXT,                       -- AI synthesis & ethical guidance
    is_degraded INTEGER DEFAULT 0,             -- 1 if fallback used, 0 if full AI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feasibility_session ON research_feasibility_records(session_id);
CREATE INDEX IF NOT EXISTS idx_feasibility_project ON research_feasibility_records(project_id);
CREATE INDEX IF NOT EXISTS idx_feasibility_cleared ON research_feasibility_records(is_cleared);
```

---

## 2. Field Definitions & Integrity Constraints

| Column Name | Type | Nullable | Default | Description / Integrity Rule |
|:---|:---|:---:|:---|:---|
| `id` | `TEXT` | No | - | Canonical ID with prefix `FEAS-` (e.g., `FEAS-2026-F1E2D3C4`). |
| `session_id` | `TEXT` | No | - | Foreign Key referencing `sessions(session_id)`. Cascades on delete. |
| `project_id` | `TEXT` | No | - | Foreign Key referencing `projects(id)`. Cascades on delete. |
| `ethics_checklist_json` | `TEXT` | No | `'{}'` | JSON object tracking regulatory and IRB compliance items. |
| `sdg_alignments_json` | `TEXT` | No | `'[]'` | JSON array of 1–3 target UN Sustainable Development Goals. |
| `dost_alignments_json`| `TEXT` | No | `'[]'` | JSON array of DOST-PCIEERD / NAIR strategic roadmap alignments. |
| `budget_breakdown_json`| `TEXT` | No | `'{}'` | Structured resource budget breakdown. |
| `timeline_weeks` | `INTEGER` | No | `16` | Planned research execution duration in weeks. |
| `feasibility_score` | `REAL` | No | - | Deterministic composite score $[0.0, 100.0]$. |
| `compliance_passed` | `INTEGER` | No | `0` | Flag (0 or 1) indicating mandatory compliance clearance. |
| `is_cleared` | `INTEGER` | No | `0` | Flag (0 or 1) indicating final Gate 4 defense readiness clearance. |
| `advisory_notes` | `TEXT` | Yes | `NULL` | AI-guided ethics and risk mitigation advisory notes. |
| `is_degraded` | `INTEGER` | No | `0` | `1` if generated via deterministic fallback, `0` if full AI synthesis. |
| `created_at` | `TIMESTAMP`| No | `CURRENT_TIMESTAMP` | ISO-8601 creation timestamp. |
| `updated_at` | `TIMESTAMP`| No | `CURRENT_TIMESTAMP` | ISO-8601 last update timestamp. |

---

## 3. Pydantic Domain Schemas (`backend/models/feasibility.py`)

```python
from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class IRBStatus(str, Enum):
    EXEMPT = "EXEMPT"
    EXPEDITED = "EXPEDITED"
    FULL_REVIEW = "FULL_REVIEW"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class EthicsChecklist(BaseModel):
    ra_10173_compliant: bool = Field(True, description="Complies with Data Privacy Act of 2012 (anonymization & consent)")
    consent_protocol_defined: bool = Field(True, description="Informed consent protocol established for human participants")
    irb_status: IRBStatus = Field(IRBStatus.EXEMPT, description="Institutional review committee clearance status")
    data_minimization_enforced: bool = Field(True, description="Only necessary research telemetry collected")
    safety_risks_identified: List[str] = Field(default_factory=list, description="Observed computational safety or dual-use risks")


class SDGMapping(BaseModel):
    sdg_number: int = Field(..., ge=1, le=17, description="UN SDG number (1 to 17)")
    sdg_name: str = Field(..., description="Official SDG title")
    rationale: str = Field(..., description="Direct operational connection to thesis artifact")
    target_indicator: Optional[str] = Field(None, description="Specific target indicator (e.g. 2.4, 9.5)")


class DOSTPriorityMapping(BaseModel):
    sector: str = Field(..., description="DOST-PCIEERD / NICER Priority Sector")
    roadmap_name: str = Field(..., description="e.g. National AI Roadmap (NAIR), Smart Cities")
    priority_area: str = Field(..., description="Specific thematic area")
    alignment_notes: str = Field(..., description="How the thesis addresses national priorities")


class BudgetBreakdown(BaseModel):
    hardware_cost: float = Field(0.0, ge=0.0, description="Cost for microcontrollers, sensors, GPUs")
    cloud_cost: float = Field(0.0, ge=0.0, description="Cloud API and hosting credits")
    travel_pilot_cost: float = Field(0.0, ge=0.0, description="Field deployment & travel budget")
    dataset_acquisition_cost: float = Field(0.0, ge=0.0, description="Licensing or access fees")
    currency: str = Field("PHP", description="Currency denomination")
    total: float = Field(0.0, ge=0.0, description="Total budget requirement")


class FeasibilityEvaluationRequest(BaseModel):
    session_id: str
    project_id: str = "default_proj"
    ethics_checklist: EthicsChecklist
    sdg_alignments: List[SDGMapping] = Field(default_factory=list)
    dost_alignments: List[DOSTPriorityMapping] = Field(default_factory=list)
    budget: BudgetBreakdown
    timeline_weeks: int = Field(16, ge=1, le=52)
    include_ai_advisory: bool = True


class FeasibilityRecord(BaseModel):
    id: str
    session_id: str
    project_id: str
    ethics_checklist: EthicsChecklist
    sdg_alignments: List[SDGMapping]
    dost_alignments: List[DOSTPriorityMapping]
    budget: BudgetBreakdown
    timeline_weeks: int
    feasibility_score: float
    compliance_passed: bool
    is_cleared: bool
    advisory_notes: Optional[str] = None
    is_degraded: bool = False
    created_at: str
    updated_at: str


class MentorSignoffRequest(BaseModel):
    project_id: str
    phase_number: int = 6  # Stage F is Phase 6 in numerical mapping
    mentor_name: str
    notes: Optional[str] = ""
    gate_verdict: str = "PASS"


class ProposalCompilationRequest(BaseModel):
    project_id: str
    session_id: Optional[str] = None
```

---

## 4. API Endpoints Contract

### 4.1 `POST /api/feasibility/evaluate`
- **Request Body**: `FeasibilityEvaluationRequest`
- **Response**: `{"status": "success", "feasibility": FeasibilityRecord}`

### 4.2 `GET /api/feasibility/session/{session_id}`
- **Response**: `{"status": "success", "feasibility": Optional[FeasibilityRecord]}`

### 4.3 `POST /api/feasibility/compile-proposal`
- **Request Body**: `ProposalCompilationRequest`
- **Response**: `{"status": "success", "proposal_markdown": str, "metadata": Dict[str, Any]}`

### 4.4 `POST /api/feasibility/mentor-signoff`
- **Request Body**: `MentorSignoffRequest`
- **Response**: `{"status": "recorded", "signoff_id": int, "project_id": str, "mentor_name": str}`

### 4.5 `GET /api/feasibility/mentor-signoff/{project_id}`
- **Response**: `{"status": "success", "signoffs": List[Dict[str, Any]]}`
