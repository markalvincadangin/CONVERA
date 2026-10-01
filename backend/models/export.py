"""
CONVERA DSR Deliverable & Comprehensive Proposal Export Models (SDD-020)
=======================================================================
Pydantic domain models defining export formats, compilation requests,
and multi-format deliverable responses across Stages A through F + Critique Audit.
"""

from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class ExportFormat(str, Enum):
    MARKDOWN = "MARKDOWN"
    LATEX = "LATEX"
    BIBTEX = "BIBTEX"
    HTML = "HTML"
    JSON = "JSON"
    BUNDLE = "BUNDLE"


class ProposalSection(str, Enum):
    COVER_METADATA = "COVER_METADATA"
    PROBLEM_SCOUTING = "PROBLEM_SCOUTING"                     # Stage A
    THEORETICAL_GROUNDING = "THEORETICAL_GROUNDING"           # Stage B & D
    LITERATURE_MATRIX = "LITERATURE_MATRIX"                   # Stage C
    EVALUATION_CIRCUMSCRIPTION = "EVALUATION_CIRCUMSCRIPTION" # Stage E
    ETHICS_FEASIBILITY = "ETHICS_FEASIBILITY"                 # Stage F
    GATE_REVIEWS = "GATE_REVIEWS"                             # Governance
    CRITIQUE_AUDIT = "CRITIQUE_AUDIT"                         # Phase C3 SDD-019
    BIBLIOGRAPHY = "BIBLIOGRAPHY"                             # BibTeX References


class DSRProposalCompilationRequest(BaseModel):
    project_id: str = "default_proj"
    session_id: Optional[str] = None
    problem_id: Optional[str] = None
    format: ExportFormat = ExportFormat.MARKDOWN
    include_sections: Optional[List[ProposalSection]] = None
    target_document_class: str = "article"  # 'article', 'report', 'ieeeconf'
    custom_title: Optional[str] = None
    author_name: Optional[str] = "CONVERA Research Fellow"
    institution: Optional[str] = "Department of Computer Science / Computing Research Concept Development Program"


class DSRProposalCompilationResponse(BaseModel):
    project_id: str
    session_id: Optional[str] = None
    format: ExportFormat
    document_title: str
    content: str
    auxiliary_files: Dict[str, str] = Field(default_factory=dict)
    provenance_hash: str
    section_count: int
    compiled_at: str
    is_degraded: bool = False
