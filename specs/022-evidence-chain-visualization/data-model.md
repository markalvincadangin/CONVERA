# CONVERA Data Model: SDD-022
# Interactive Evidence Chain Visualization & Provenance Graph (Phase D2)

**Specification ID**: `CONVERA-SDD-022`  
**Feature Title**: Interactive Evidence Chain Visualization & Provenance Graph Engine  
**Authority Tier**: Tier 2 (Domain & Data Schema Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Target Feature Branch**: `feature/022-evidence-chain-visualization`  

---

## 1. Domain Entities & Type Definitions

### 1.1 Epistemic Tiers
```python
from enum import Enum, IntEnum

class EpistemicTier(IntEnum):
    TIER_0_SOURCE = 0          # scholarly_works, problem_sources
    TIER_1_CLAIM = 1           # problem_claims, claim_evidence_links
    TIER_2_ASSUMPTION = 2      # problem_assumptions
    TIER_3_DSR_ARTIFACT = 3    # dsr_artifacts (Title, Problem, Framework, Method)
    TIER_4_CONCEPT_EVAL = 4    # concept_evaluations, decision_records
    TIER_5_FEASIBILITY = 5     # research_feasibility_records, proposal_canvas
```

### 1.2 Node Types
```python
class ProvenanceNodeType(str, Enum):
    SCHOLARLY_WORK = "scholarly_work"
    EMPIRICAL_CLAIM = "empirical_claim"
    RESEARCH_ASSUMPTION = "research_assumption"
    DSR_ARTIFACT = "dsr_artifact"
    CONCEPT_EVALUATION = "concept_evaluation"
    FEASIBILITY_PROPOSAL = "feasibility_proposal"
```

### 1.3 Edge Types & Evidentiary Relationships
```python
class ProvenanceEdgeType(str, Enum):
    SUPPORTS = "supports"              # Source directly supports Claim
    CONTRADICTS = "contradicts"        # Source or Claim contradicts another
    EXTENDS = "extends"                # Claim builds on existing literature
    DERIVES = "derives"                # Assumption derived from Claim
    GROUNDS = "grounds"                # Claim / Assumption grounds DSR Artifact
    EVALUATES = "evaluates"            # Evaluation assesses DSR Artifact
    SYNTHESIZES = "synthesizes"        # Feasibility synthesizes Evaluated Concept
```

---

## 2. Core Pydantic Models (`backend/models/provenance.py`)

```python
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ProvenanceNode(BaseModel):
    id: str = Field(..., description="Unique node identifier matching entity primary key")
    type: ProvenanceNodeType = Field(..., description="Semantic entity type")
    tier: int = Field(..., ge=0, le=5, description="Hierarchical tier (0 to 5)")
    label: str = Field(..., description="Display label / concise title")
    description: Optional[str] = Field(None, description="Detailed text or summary excerpt")
    stage_id: str = Field(..., description="Associated research methodology stage ('stage_a' - 'stage_f')")
    confidence_score: float = Field(1.0, ge=0.0, le=1.0, description="Epistemic confidence / weight")
    status: str = Field("active", description="Status: 'active', 'validated', 'contradicted', 'hypothetical'")
    doi: Optional[str] = Field(None, description="DOI if scholarly work")
    year: Optional[int] = Field(None, description="Publication year")
    authors: Optional[List[str]] = Field(default_factory=list, description="Authors if applicable")
    citation_count: Optional[int] = Field(None, description="Citation count")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary entity metadata")
    created_at: str = Field(..., description="ISO 8601 timestamp")

class ProvenanceEdge(BaseModel):
    id: str = Field(..., description="Unique edge identifier (e.g., 'src_tgt_type')")
    source: str = Field(..., description="ID of source node")
    target: str = Field(..., description="ID of target node")
    edge_type: ProvenanceEdgeType = Field(..., description="Evidentiary relationship type")
    weight: float = Field(1.0, ge=0.0, le=1.0, description="Relationship strength / confidence")
    is_contradiction: bool = Field(False, description="Flag indicating adversarial tension")
    evidence_excerpt: Optional[str] = Field(None, description="Verbatim text fragment linking source to target")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Edge metadata")

class ProvenanceMetrics(BaseModel):
    total_nodes: int = Field(0)
    total_edges: int = Field(0)
    tier_distribution: Dict[int, int] = Field(default_factory=dict)
    contradiction_count: int = Field(0)
    average_confidence: float = Field(0.0)
    grounded_artifacts_ratio: float = Field(0.0, description="Percentage of DSR artifacts linked to literature")
    orphaned_nodes_count: int = Field(0)

class ProvenanceGraphPayload(BaseModel):
    session_id: str = Field(..., description="Research session identifier")
    nodes: List[ProvenanceNode] = Field(default_factory=list)
    edges: List[ProvenanceEdge] = Field(default_factory=list)
    metrics: ProvenanceMetrics = Field(default_factory=ProvenanceMetrics)
    state_hash: str = Field(..., description="Cryptographic SHA-256 state hash of the graph structure")
    generated_at: str = Field(..., description="ISO 8601 generation timestamp")

class ProvenanceFilterQuery(BaseModel):
    session_id: str
    min_confidence: float = Field(0.0, ge=0.0, le=1.0)
    stages: Optional[List[str]] = None
    tiers: Optional[List[int]] = None
    include_orphans: bool = True
    search_term: Optional[str] = None
```

---

## 3. Frontend TypeScript Interfaces (`web/src/types/provenanceGraph.ts`)

```typescript
export type EpistemicTier = 0 | 1 | 2 | 3 | 4 | 5;

export type ProvenanceNodeType =
  | 'scholarly_work'
  | 'empirical_claim'
  | 'research_assumption'
  | 'dsr_artifact'
  | 'concept_evaluation'
  | 'feasibility_proposal';

export type ProvenanceEdgeType =
  | 'supports'
  | 'contradicts'
  | 'extends'
  | 'derives'
  | 'grounds'
  | 'evaluates'
  | 'synthesizes';

export interface ProvenanceNode {
  id: string;
  type: ProvenanceNodeType;
  tier: EpistemicTier;
  label: string;
  description?: string;
  stage_id: string;
  confidence_score: number;
  status: string;
  doi?: string;
  year?: number;
  authors?: string[];
  citation_count?: number;
  metadata?: Record<string, any>;
  created_at: string;
  // Computed layout coordinates for SVG rendering
  x?: number;
  y?: number;
}

export interface ProvenanceEdge {
  id: string;
  source: string;
  target: string;
  edge_type: ProvenanceEdgeType;
  weight: number;
  is_contradiction: boolean;
  evidence_excerpt?: string;
  metadata?: Record<string, any>;
}

export interface ProvenanceMetrics {
  total_nodes: number;
  total_edges: number;
  tier_distribution: Record<number, number>;
  contradiction_count: number;
  average_confidence: number;
  grounded_artifacts_ratio: number;
  orphaned_nodes_count: number;
}

export interface ProvenanceGraphPayload {
  session_id: string;
  nodes: ProvenanceNode[];
  edges: ProvenanceEdge[];
  metrics: ProvenanceMetrics;
  state_hash: string;
  generated_at: string;
}
```
