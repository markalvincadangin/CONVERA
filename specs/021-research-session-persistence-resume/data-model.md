# CONVERA Data Model: SDD-021
# Research Session Persistence & Resume (Phase D2)

**Specification ID**: `CONVERA-SDD-021`  
**Feature Title**: Research Session Persistence & Resume Data Model  
**Authority Tier**: Tier 2 (Data Architecture Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  

---

## 1. Relational Schema Architecture (SQLite WAL)

### 1.1 Table 37: `research_session_checkpoints`

```sql
CREATE TABLE IF NOT EXISTS research_session_checkpoints (
    checkpoint_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    checkpoint_name TEXT NOT NULL,
    description TEXT,
    stage_id TEXT NOT NULL,
    stage_index INTEGER NOT NULL,
    state_snapshot TEXT NOT NULL,       -- Complete canonical JSON snapshot
    state_hash TEXT NOT NULL,           -- SHA-256 deterministic digest
    created_by TEXT DEFAULT 'Researcher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON research_session_checkpoints(session_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_stage ON research_session_checkpoints(session_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_created ON research_session_checkpoints(created_at DESC);
```

### 1.2 Additive Migration to Table 3 (`sessions`)

```sql
-- Executed idempotently via PRAGMA table_info check:
ALTER TABLE sessions ADD COLUMN active_framework_id TEXT DEFAULT 'RESEARCH';
ALTER TABLE sessions ADD COLUMN current_research_stage TEXT DEFAULT 'scouting';
ALTER TABLE sessions ADD COLUMN stage_completion_pct REAL DEFAULT 0.0;
ALTER TABLE sessions ADD COLUMN active_problem_id TEXT;
ALTER TABLE sessions ADD COLUMN active_domain_id TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_framework ON sessions(active_framework_id);
CREATE INDEX IF NOT EXISTS idx_sessions_stage ON sessions(current_research_stage);
```

---

## 2. Pydantic Domain & API Models (`backend/models/research_session.py`)

```python
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ResearchSessionSummary(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    project_name: str
    framework_id: str = "RESEARCH"
    current_stage_id: str = "scouting"
    current_stage_name: str = "Scouting & Discovery"
    stage_index: int = 0
    stage_completion_pct: float = 0.0
    active_problem_id: Optional[str] = None
    active_problem_title: Optional[str] = None
    active_domain_id: Optional[str] = None
    checkpoint_count: int = 0
    gate1_cleared: bool = False
    gate2_cleared: bool = False
    gate3_cleared: bool = False
    gate4_cleared: bool = False
    created_at: str
    updated_at: str


class CreateResearchSessionRequest(BaseModel):
    project_name: str = Field(..., min_length=3, max_length=150)
    project_id: Optional[str] = None
    domain_id: Optional[str] = None
    initial_topic: Optional[str] = None


class CreateCheckpointRequest(BaseModel):
    checkpoint_name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    created_by: str = "Researcher"


class ResearchSessionCheckpointRecord(BaseModel):
    checkpoint_id: str
    session_id: str
    checkpoint_name: str
    description: Optional[str] = None
    stage_id: str
    stage_index: int
    state_hash: str
    created_by: str
    created_at: str


class ResearchSessionResumePayload(BaseModel):
    session: Dict[str, Any]
    summary: ResearchSessionSummary
    checkpoints: List[ResearchSessionCheckpointRecord]
    active_problem: Optional[Dict[str, Any]] = None
    recent_events: List[Dict[str, Any]] = Field(default_factory=list)
    orchestration_status: Optional[Dict[str, Any]] = None


class CloneResearchSessionRequest(BaseModel):
    new_project_name: str = Field(..., min_length=3, max_length=150)
    include_literature: bool = True
    include_checkpoints: bool = False
```

---

## 3. TypeScript Interfaces (`web/src/types/researchSession.ts`)

```typescript
export interface ResearchSessionSummary {
  session_id: string;
  project_id: string | null;
  project_name: string;
  framework_id: string;
  current_stage_id: string;
  current_stage_name: string;
  stage_index: number;
  stage_completion_pct: number;
  active_problem_id: string | null;
  active_problem_title: string | null;
  active_domain_id: string | null;
  checkpoint_count: number;
  gate1_cleared: boolean;
  gate2_cleared: boolean;
  gate3_cleared: boolean;
  gate4_cleared: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchSessionCheckpoint {
  checkpoint_id: string;
  session_id: string;
  checkpoint_name: string;
  description: string | null;
  stage_id: string;
  stage_index: number;
  state_hash: string;
  created_by: string;
  created_at: string;
}

export interface ResearchSessionResumePayload {
  session: any;
  summary: ResearchSessionSummary;
  checkpoints: ResearchSessionCheckpoint[];
  active_problem: any | null;
  recent_events: any[];
  orchestration_status: any | null;
}
```
