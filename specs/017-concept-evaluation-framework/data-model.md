# CONVERA SDD-017: Relational Data Model Specification
# Concept Evaluation Framework (Table 34: `concept_evaluations`)

**Specification ID**: CONVERA-SDD-017  
**Classification**: Data Model & Schema Specification  
**Authority Tier**: Tier 2 (Database Schema Contract)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Revision**: 1.0.0  
**Target Feature Branch**: `feature/017-concept-evaluation-framework`  
**Target Integration Branch**: `develop`  

---

## 1. Relational Schema Expansion (Table 34: `concept_evaluations`)

CONVERA's SQLite WAL database is extended with table 34:

```sql
CREATE TABLE IF NOT EXISTS concept_evaluations (
    id TEXT PRIMARY KEY,
    concept_id TEXT NOT NULL,
    session_id TEXT,
    evaluator_type TEXT NOT NULL CHECK(evaluator_type IN ('DETERMINISTIC_RUBRIC', 'AI_CRITIC', 'HUMAN_EXPERT')),
    composite_score REAL NOT NULL,             -- Normalized score [0.0, 100.0]
    dimension_scores TEXT NOT NULL,            -- JSON object: {problem_relevance, evidence_grounding, gap_validity, stakeholder_impact, technical_feasibility, novelty_contribution, methodology_fit}
    strengths TEXT NOT NULL,                   -- JSON array of strings
    vulnerabilities TEXT NOT NULL,             -- JSON array of strings
    falsification_advisory TEXT,               -- Specific empirical test or experiment required
    recommendation TEXT NOT NULL CHECK(recommendation IN ('RECOMMENDED', 'VIABLE_WITH_REFINEMENT', 'HIGH_RISK_REVISE', 'REJECT')),
    narrative_summary TEXT,                    -- Qualitative synthesis / critique rationale
    is_degraded INTEGER DEFAULT 0,             -- 1 if LLM fallback used, 0 if full AI synthesis
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (concept_id) REFERENCES dsr_artifacts(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_concept_evals_concept ON concept_evaluations(concept_id);
CREATE INDEX IF NOT EXISTS idx_concept_evals_session ON concept_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_concept_evals_rec ON concept_evaluations(recommendation);
```

---

## 2. Field Definitions & Integrity Constraints

| Column Name | Type | Nullable | Default | Description / Integrity Rule |
|:---|:---|:---:|:---|:---|
| `id` | `TEXT` | No | - | Canonical ID with prefix `EVAL-` (e.g., `EVAL-2026-A1B2C3D4`). |
| `concept_id` | `TEXT` | No | - | Foreign Key referencing `dsr_artifacts(id)`. Cascades on delete. |
| `session_id` | `TEXT` | Yes | `NULL` | Foreign Key referencing `sessions(session_id)`. |
| `evaluator_type` | `TEXT` | No | - | Must be `DETERMINISTIC_RUBRIC`, `AI_CRITIC`, or `HUMAN_EXPERT`. |
| `composite_score` | `REAL` | No | - | Weighted sum of the 7 dimension scores $[0.0, 100.0]$. |
| `dimension_scores` | `TEXT` | No | - | JSON object storing the 7 dimension scores. Each score $\in [0.0, 100.0]$. |
| `strengths` | `TEXT` | No | `'[]'` | JSON array of observed advantages and evidence endorsements. |
| `vulnerabilities` | `TEXT` | No | `'[]'` | JSON array of critical assumptions, ungrounded steps, or risk factors. |
| `falsification_advisory` | `TEXT` | Yes | `NULL` | Empirical test protocol or benchmark threshold needed to falsify the concept. |
| `recommendation` | `TEXT` | No | - | Recommendation tier: `RECOMMENDED`, `VIABLE_WITH_REFINEMENT`, `HIGH_RISK_REVISE`, `REJECT`. |
| `narrative_summary` | `TEXT` | Yes | `NULL` | Qualitative explanatory narrative. |
| `is_degraded` | `INTEGER` | No | `0` | `1` if generated via deterministic fallback, `0` if full AI synthesis succeeded. |
| `created_at` | `TIMESTAMP`| No | `CURRENT_TIMESTAMP` | ISO-8601 creation timestamp. |

---

## 3. The 7 Dimension Models & Default Weights

$$\text{Composite Score} = \sum_{i=1}^{7} w_i \cdot d_i$$

```python
EVALUATION_WEIGHTS = {
    "problem_relevance": 0.20,      # Alignment with validated root cause
    "evidence_grounding": 0.15,     # Literature, citations, and empirical backing
    "gap_validity": 0.15,           # Novelty and precision relative to literature gap
    "stakeholder_impact": 0.15,     # Adoption feasibility and real-world benefit
    "technical_feasibility": 0.15,  # Mechanism complexity and computational bounds
    "novelty_contribution": 0.10,   # Design knowledge contribution over baselines
    "methodology_fit": 0.10,        # Testability, benchmark readiness, falsifiability
}
```

---

## 4. Python Domain Models (`backend/models/concept_evaluation.py`)

```python
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class EvaluatorType(str, Enum):
    DETERMINISTIC_RUBRIC = "DETERMINISTIC_RUBRIC"
    AI_CRITIC = "AI_CRITIC"
    HUMAN_EXPERT = "HUMAN_EXPERT"

class EvaluationRecommendation(str, Enum):
    RECOMMENDED = "RECOMMENDED"
    VIABLE_WITH_REFINEMENT = "VIABLE_WITH_REFINEMENT"
    HIGH_RISK_REVISE = "HIGH_RISK_REVISE"
    REJECT = "REJECT"

class DimensionScores(BaseModel):
    problem_relevance: float = Field(..., ge=0.0, le=100.0)
    evidence_grounding: float = Field(..., ge=0.0, le=100.0)
    gap_validity: float = Field(..., ge=0.0, le=100.0)
    stakeholder_impact: float = Field(..., ge=0.0, le=100.0)
    technical_feasibility: float = Field(..., ge=0.0, le=100.0)
    novelty_contribution: float = Field(..., ge=0.0, le=100.0)
    methodology_fit: float = Field(..., ge=0.0, le=100.0)

class ConceptEvaluationRecord(BaseModel):
    id: str
    concept_id: str
    session_id: Optional[str] = None
    evaluator_type: EvaluatorType
    composite_score: float = Field(..., ge=0.0, le=100.0)
    dimension_scores: DimensionScores
    strengths: List[str] = Field(default_factory=list)
    vulnerabilities: List[str] = Field(default_factory=list)
    falsification_advisory: Optional[str] = None
    recommendation: EvaluationRecommendation
    narrative_summary: Optional[str] = None
    is_degraded: bool = False
    created_at: str

class ConceptComparisonResult(BaseModel):
    session_id: Optional[str] = None
    rankings: List[ConceptEvaluationRecord]
    tradeoff_matrix: Dict[str, Dict[str, str]]
    recommended_winner_id: Optional[str] = None
    winner_rationale: str
```

---

## 5. TypeScript Interfaces (`web/src/types/evaluation.ts`)

```typescript
export type EvaluatorType = 'DETERMINISTIC_RUBRIC' | 'AI_CRITIC' | 'HUMAN_EXPERT';

export type EvaluationRecommendation = 
  | 'RECOMMENDED' 
  | 'VIABLE_WITH_REFINEMENT' 
  | 'HIGH_RISK_REVISE' 
  | 'REJECT';

export interface DimensionScores {
  problem_relevance: number;
  evidence_grounding: number;
  gap_validity: number;
  stakeholder_impact: number;
  technical_feasibility: number;
  novelty_contribution: number;
  methodology_fit: number;
}

export interface ConceptEvaluationRecord {
  id: string;
  concept_id: string;
  session_id?: string;
  evaluator_type: EvaluatorType;
  composite_score: number;
  dimension_scores: DimensionScores;
  strengths: string[];
  vulnerabilities: string[];
  falsification_advisory?: string;
  recommendation: EvaluationRecommendation;
  narrative_summary?: string;
  is_degraded: boolean;
  created_at: string;
}

export interface ConceptComparisonResult {
  session_id?: string;
  rankings: ConceptEvaluationRecord[];
  tradeoff_matrix: Record<string, Record<string, string>>;
  recommended_winner_id?: string;
  winner_rationale: string;
}
```
