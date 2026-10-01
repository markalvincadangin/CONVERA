"""
CONVERA Provenance Graph Models (SDD-022)
Pydantic domain models for interactive evidence chain visualization and topological graph analysis.
"""

from enum import Enum, IntEnum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class EpistemicTier(IntEnum):
    """Hierarchical epistemic tier in the research reasoning chain."""
    TIER_0_SOURCE = 0          # scholarly_works, problem_sources
    TIER_1_CLAIM = 1           # problem_claims, claim_evidence_links
    TIER_2_ASSUMPTION = 2      # problem_assumptions
    TIER_3_DSR_ARTIFACT = 3    # dsr_artifacts (Title, Problem, Framework, Method)
    TIER_4_CONCEPT_EVAL = 4    # concept_evaluations, decision_records
    TIER_5_FEASIBILITY = 5     # research_feasibility_records, proposal_canvas


class ProvenanceNodeType(str, Enum):
    """Semantic category of nodes in the provenance graph."""
    SCHOLARLY_WORK = "scholarly_work"
    EMPIRICAL_CLAIM = "empirical_claim"
    RESEARCH_ASSUMPTION = "research_assumption"
    DSR_ARTIFACT = "dsr_artifact"
    CONCEPT_EVALUATION = "concept_evaluation"
    FEASIBILITY_PROPOSAL = "feasibility_proposal"


class ProvenanceEdgeType(str, Enum):
    """Semantic relationship connecting nodes in the provenance DAG."""
    SUPPORTS = "supports"              # Source directly supports Claim
    CONTRADICTS = "contradicts"        # Source or Claim contradicts another
    EXTENDS = "extends"                # Claim builds on existing literature
    DERIVES = "derives"                # Assumption derived from Claim
    GROUNDS = "grounds"                # Claim / Assumption grounds DSR Artifact
    EVALUATES = "evaluates"            # Evaluation assesses DSR Artifact
    SYNTHESIZES = "synthesizes"        # Feasibility synthesizes Evaluated Concept


class ProvenanceNode(BaseModel):
    """A node in the research provenance graph."""
    id: str = Field(..., description="Unique entity ID")
    type: ProvenanceNodeType = Field(..., description="Semantic entity type")
    tier: int = Field(..., ge=0, le=5, description="Epistemic tier index (0 to 5)")
    label: str = Field(..., description="Short display label or title")
    description: Optional[str] = Field(None, description="Detailed text or summary excerpt")
    stage_id: str = Field(..., description="Research methodology stage (e.g., 'stage_a', 'stage_b')")
    confidence_score: float = Field(1.0, ge=0.0, le=1.0, description="Epistemic confidence / weight")
    status: str = Field("active", description="Status: 'active', 'validated', 'contradicted', 'hypothetical'")
    doi: Optional[str] = Field(None, description="DOI if scholarly work")
    year: Optional[int] = Field(None, description="Publication year")
    authors: Optional[List[str]] = Field(default_factory=list, description="Author list")
    citation_count: Optional[int] = Field(None, description="Citation count")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary entity metadata")
    created_at: str = Field(..., description="ISO 8601 creation timestamp")


class ProvenanceEdge(BaseModel):
    """A directed edge in the research provenance graph."""
    id: str = Field(..., description="Unique edge identifier (e.g. 'src_tgt_type')")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    edge_type: ProvenanceEdgeType = Field(..., description="Evidentiary relationship type")
    weight: float = Field(1.0, ge=0.0, le=1.0, description="Relationship strength / confidence")
    is_contradiction: bool = Field(False, description="Flag indicating adversarial tension")
    evidence_excerpt: Optional[str] = Field(None, description="Verbatim text fragment linking source to target")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Edge metadata")


class ProvenanceMetrics(BaseModel):
    """Summary metrics evaluating epistemic chain health."""
    total_nodes: int = Field(0)
    total_edges: int = Field(0)
    tier_distribution: Dict[int, int] = Field(default_factory=dict)
    contradiction_count: int = Field(0)
    average_confidence: float = Field(0.0)
    grounded_artifacts_ratio: float = Field(0.0, description="Ratio of DSR artifacts grounded in literature")
    orphaned_nodes_count: int = Field(0)


class ProvenanceGraphPayload(BaseModel):
    """Full serialized graph payload returned by API."""
    session_id: str = Field(..., description="Research session identifier")
    nodes: List[ProvenanceNode] = Field(default_factory=list)
    edges: List[ProvenanceEdge] = Field(default_factory=list)
    metrics: ProvenanceMetrics = Field(default_factory=ProvenanceMetrics)
    state_hash: str = Field(..., description="Cryptographic SHA-256 state hash of the graph structure")
    generated_at: str = Field(..., description="ISO 8601 generation timestamp")


class ProvenanceFilterQuery(BaseModel):
    """Query parameters for filtering provenance graph."""
    session_id: str
    min_confidence: float = Field(0.0, ge=0.0, le=1.0)
    stages: Optional[List[str]] = None
    tiers: Optional[List[int]] = None
    include_orphans: bool = True
    search_term: Optional[str] = None
