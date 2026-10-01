# CONVERA SDD-019: Data Model & Schema Specifications
# Cross-Stage Research Critique & Blind-Spot Engine (Phase C3)

**Specification ID**: CONVERA-SDD-019  
**Feature Title**: Cross-Stage Research Critique & Blind-Spot Engine  
**Authority Tier**: Tier 2 (Data Architecture & Schema Reference)  
**Governing Standard**: CCDS v2.0, Constitution Article II, SQLite WAL Relational Schema  
**Target Feature Branch**: `feature/019-research-critique-blindspot-engine`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `8ada2a7`  

---

## 1. Relational Database Schema (Table 36: `research_critiques`)

```sql
CREATE TABLE IF NOT EXISTS research_critiques (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    project_id TEXT,
    critique_type TEXT NOT NULL, -- CROSS_STAGE_BLIND_SPOT, EVIDENCE_VULNERABILITY, CIRCUMSCRIPTION_TENSION, ETHICS_FEASIBILITY_DISCORD
    severity TEXT NOT NULL,      -- FATAL, CRITICAL, WARNING, ADVISORY
    target_stages_json TEXT NOT NULL DEFAULT '[]',
    cross_stage_claims_json TEXT NOT NULL DEFAULT '[]',
    fatal_flaw_summary TEXT NOT NULL,
    kill_question TEXT NOT NULL,
    mitigation_recommendation TEXT NOT NULL,
    plausibility_score REAL NOT NULL DEFAULT 50.0,
    status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, RESOLVED, DISMISSED
    resolution_notes TEXT,
    is_degraded INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    FOREIGN KEY(session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_critiques_session_id ON research_critiques(session_id);
CREATE INDEX IF NOT EXISTS idx_critiques_project_id ON research_critiques(project_id);
CREATE INDEX IF NOT EXISTS idx_critiques_status ON research_critiques(status);
```

---

## 2. Backend Pydantic Domain Schemas (`backend/models/critique.py`)

```python
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CritiqueType(str, Enum):
    CROSS_STAGE_BLIND_SPOT = "CROSS_STAGE_BLIND_SPOT"
    EVIDENCE_VULNERABILITY = "EVIDENCE_VULNERABILITY"
    CIRCUMSCRIPTION_TENSION = "CIRCUMSCRIPTION_TENSION"
    ETHICS_FEASIBILITY_DISCORD = "ETHICS_FEASIBILITY_DISCORD"

class CritiqueSeverity(str, Enum):
    FATAL = "FATAL"
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    ADVISORY = "ADVISORY"

class CritiqueStatus(str, Enum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"

class CrossStageCritiqueRecord(BaseModel):
    id: str
    session_id: str
    project_id: Optional[str] = None
    critique_type: CritiqueType
    severity: CritiqueSeverity
    target_stages: List[str] = Field(default_factory=list)
    cross_stage_claims: List[Dict[str, Any]] = Field(default_factory=list)
    fatal_flaw_summary: str
    kill_question: str
    mitigation_recommendation: str
    plausibility_score: float = Field(default=50.0, ge=0.0, le=100.0)
    status: CritiqueStatus = CritiqueStatus.OPEN
    resolution_notes: Optional[str] = None
    is_degraded: bool = False
    created_at: str
    resolved_at: Optional[str] = None

class CritiqueEvaluationRequest(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    problem_id: Optional[str] = None
    include_ai_advisory: bool = True

class CritiqueEvaluationResponse(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    consistency_score: float
    total_critiques: int
    open_critiques: int
    fatal_count: int
    critical_count: int
    warning_count: int
    advisory_count: int
    critiques: List[CrossStageCritiqueRecord]
    evaluated_at: str
    is_degraded: bool = False

class ResolveCritiqueRequest(BaseModel):
    critique_id: str
    status: CritiqueStatus # RESOLVED or DISMISSED
    resolution_notes: str = Field(min_length=5, description="Human rationale required per Article IV Human Sovereignty")
```

---

## 3. Frontend TypeScript Interfaces (`web/src/types/critique.ts`)

```typescript
export type CritiqueType = 
  | "CROSS_STAGE_BLIND_SPOT" 
  | "EVIDENCE_VULNERABILITY" 
  | "CIRCUMSCRIPTION_TENSION" 
  | "ETHICS_FEASIBILITY_DISCORD";

export type CritiqueSeverity = "FATAL" | "CRITICAL" | "WARNING" | "ADVISORY";

export type CritiqueStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export interface CrossStageClaimExcerpt {
  stage: string;
  claim_title: string;
  excerpt: string;
}

export interface CrossStageCritiqueRecord {
  id: string;
  session_id: string;
  project_id?: string;
  critique_type: CritiqueType;
  severity: CritiqueSeverity;
  target_stages: string[];
  cross_stage_claims: CrossStageClaimExcerpt[];
  fatal_flaw_summary: string;
  kill_question: string;
  mitigation_recommendation: string;
  plausibility_score: number;
  status: CritiqueStatus;
  resolution_notes?: string;
  is_degraded: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface CritiqueEvaluationSummary {
  session_id: string;
  project_id?: string;
  consistency_score: number;
  total_critiques: number;
  open_critiques: number;
  fatal_count: number;
  critical_count: number;
  warning_count: number;
  advisory_count: number;
  critiques: CrossStageCritiqueRecord[];
  evaluated_at: string;
  is_degraded: boolean;
}
```
