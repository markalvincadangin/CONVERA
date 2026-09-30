# CONVERA SDD-016: Relational Data Model Specification
# Structured Ideation & 4 DSR Artifact Formulation Engine

**Specification ID**: CONVERA-SDD-016  
**Classification**: Data Model & Schema Specification  
**Authority Tier**: Tier 2 (Database Schema Contract)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/016-dsr-artifact-ideation`  
**Target Integration Branch**: `develop`  

---

## 1. Relational Schema Expansion (Table 33: `dsr_artifacts`)

CONVERA's SQLite WAL database is extended with table 33:

```sql
CREATE TABLE IF NOT EXISTS dsr_artifacts (
    id TEXT PRIMARY KEY,
    problem_id TEXT NOT NULL,
    session_id TEXT,
    title TEXT NOT NULL,
    dsr_class TEXT NOT NULL CHECK(dsr_class IN ('CONSTRUCT', 'MODEL', 'METHOD', 'INSTANTIATION')),
    description TEXT NOT NULL,
    kernel_theory TEXT NOT NULL,
    targeted_gap_ids TEXT DEFAULT '[]',        -- JSON array: ["GAP-01", "GAP-02"]
    linked_claim_ids TEXT DEFAULT '[]',        -- JSON array of problem_claims IDs
    formal_specification TEXT,                 -- Formula, pseudocode, schema, or system architecture
    simpler_baseline_alternative TEXT,         -- Simpler alternative compared against (Rule 5 & Rule 6)
    contextual_constraints TEXT DEFAULT '[]',  -- JSON array: ["OFFLINE_FIRST", "EDGE_COMPUTE"]
    feasibility_score REAL DEFAULT 0.50,
    novelty_score REAL DEFAULT 0.50,
    status TEXT DEFAULT 'PROPOSED' CHECK(status IN ('PROPOSED', 'SELECTED', 'REFUTED', 'ARCHIVED')),
    provenance TEXT DEFAULT '{}',              -- Generation metadata or human author signature
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dsr_artifacts_problem ON dsr_artifacts(problem_id);
CREATE INDEX IF NOT EXISTS idx_dsr_artifacts_class ON dsr_artifacts(dsr_class);
CREATE INDEX IF NOT EXISTS idx_dsr_artifacts_status ON dsr_artifacts(status);
```

---

## 2. Field Definitions & Integrity Constraints

| Column Name | Type | Nullable | Default | Description / Integrity Rule |
|:---|:---|:---:|:---|:---|
| `id` | `TEXT` | No | - | Canonical ID with prefix `DSR-` or `ART-` (e.g., `DSR-2026-A1B2C3D4`). |
| `problem_id` | `TEXT` | No | - | Foreign Key referencing `problems(id)`. Cascades on delete. |
| `session_id` | `TEXT` | Yes | `NULL` | Optional research session ID. |
| `title` | `TEXT` | No | - | Human-readable title of the computational artifact. |
| `dsr_class` | `TEXT` | No | - | Must match `CONSTRUCT`, `MODEL`, `METHOD`, or `INSTANTIATION` (March & Smith, 1995). |
| `description` | `TEXT` | No | - | Detailed explanation of what the artifact does and its intended utility. |
| `kernel_theory` | `TEXT` | No | - | Natural, computational, or behavioral law grounding the artifact (Gregor & Jones, 2007). |
| `targeted_gap_ids` | `TEXT` | No | `'[]'` | JSON array of gap IDs (e.g., `["GAP-01"]`) synthesized from Literature Matrix. |
| `linked_claim_ids` | `TEXT` | No | `'[]'` | JSON array of problem claims supported or addressed by this artifact. |
| `formal_specification` | `TEXT` | Yes | `NULL` | Mathematical formula, algorithm pseudocode, ontology schema, or hardware block diagram. |
| `simpler_baseline_alternative` | `TEXT` | Yes | `NULL` | Simpler, established alternative audited against (Epistemic Rules 5 & 6). |
| `contextual_constraints` | `TEXT` | No | `'[]'` | JSON array of operational boundary constraints (e.g. `["OFFLINE", "LOW_POWER"]`). |
| `feasibility_score` | `REAL` | No | `0.50` | Estimated technical feasibility (0.00 to 1.00). |
| `novelty_score` | `REAL` | No | `0.50` | Estimated novelty/inventiveness score (0.00 to 1.00). |
| `status` | `TEXT` | No | `'PROPOSED'` | Lifecycle status: `PROPOSED`, `SELECTED`, `REFUTED`, `ARCHIVED`. |
| `provenance` | `TEXT` | No | `'{}'` | JSON metadata recording generation prompt, LLM parameters, or author attribution. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | UTC timestamp of record creation. |
| `updated_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | UTC timestamp of last record update. |

---

## 3. Pydantic Domain Schemas (`backend/models/ideation.py`)

```python
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DSRArtifactClass(str, Enum):
    CONSTRUCT = "CONSTRUCT"
    MODEL = "MODEL"
    METHOD = "METHOD"
    INSTANTIATION = "INSTANTIATION"


class DSRArtifactStatus(str, Enum):
    PROPOSED = "PROPOSED"
    SELECTED = "SELECTED"
    REFUTED = "REFUTED"
    ARCHIVED = "ARCHIVED"


class DSRArtifactModel(BaseModel):
    id: str
    problem_id: str
    session_id: Optional[str] = None
    title: str
    dsr_class: DSRArtifactClass
    description: str
    kernel_theory: str
    targeted_gap_ids: List[str] = Field(default_factory=list)
    linked_claim_ids: List[str] = Field(default_factory=list)
    formal_specification: Optional[str] = None
    simpler_baseline_alternative: Optional[str] = None
    contextual_constraints: List[str] = Field(default_factory=list)
    feasibility_score: float = 0.50
    novelty_score: float = 0.50
    status: DSRArtifactStatus = DSRArtifactStatus.PROPOSED
    provenance: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class GenerateDSRCandidatesRequest(BaseModel):
    problem_id: str
    session_id: Optional[str] = None
    prompt_guidance: Optional[str] = None
    preferred_dsr_class: Optional[DSRArtifactClass] = None


class CreateDSRArtifactRequest(BaseModel):
    problem_id: str
    session_id: Optional[str] = None
    title: str
    dsr_class: DSRArtifactClass
    description: str
    kernel_theory: str
    targeted_gap_ids: List[str] = Field(default_factory=list)
    linked_claim_ids: List[str] = Field(default_factory=list)
    formal_specification: Optional[str] = None
    simpler_baseline_alternative: Optional[str] = None
    contextual_constraints: List[str] = Field(default_factory=list)
    feasibility_score: float = 0.50
    novelty_score: float = 0.50
    status: DSRArtifactStatus = DSRArtifactStatus.PROPOSED


class UpdateDSRArtifactRequest(BaseModel):
    title: Optional[str] = None
    dsr_class: Optional[DSRArtifactClass] = None
    description: Optional[str] = None
    kernel_theory: Optional[str] = None
    targeted_gap_ids: Optional[List[str]] = None
    linked_claim_ids: Optional[List[str]] = None
    formal_specification: Optional[str] = None
    simpler_baseline_alternative: Optional[str] = None
    contextual_constraints: Optional[List[str]] = None
    feasibility_score: Optional[float] = None
    novelty_score: Optional[float] = None
    status: Optional[DSRArtifactStatus] = None
```

---

## 4. Frontend TypeScript Interfaces (`web/src/services/ideationService.ts`)

```typescript
export type DSRArtifactClass = "CONSTRUCT" | "MODEL" | "METHOD" | "INSTANTIATION";
export type DSRArtifactStatus = "PROPOSED" | "SELECTED" | "REFUTED" | "ARCHIVED";

export interface DSRArtifactRecord {
  id: string;
  problem_id: string;
  session_id?: string | null;
  title: string;
  dsr_class: DSRArtifactClass;
  description: string;
  kernel_theory: string;
  targeted_gap_ids: string[];
  linked_claim_ids: string[];
  formal_specification?: string | null;
  simpler_baseline_alternative?: string | null;
  contextual_constraints: string[];
  feasibility_score: number;
  novelty_score: number;
  status: DSRArtifactStatus;
  provenance: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface GenerateCandidatesResponse {
  problem_id: string;
  count: number;
  artifacts: DSRArtifactRecord[];
}

export interface ListArtifactsResponse {
  problem_id: string;
  count: number;
  artifacts: DSRArtifactRecord[];
}
```
