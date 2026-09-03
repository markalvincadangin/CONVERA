"""
CONVERA Connectors Package
==========================
Governed by: CONVERA Intelligence & Integration Architecture (CIIA v1.0)
"""

from .base import (
    BaseConnector,
    ProvenanceMetadata,
    NormalizedScholarlyWork,
    EvidenceCandidate
)
from .openalex_connector import OpenAlexConnector
from .semantic_scholar_connector import SemanticScholarConnector
from .crossref_connector import CrossrefConnector
from .hub import ConnectorHub, connector_hub

__all__ = [
    "BaseConnector",
    "ProvenanceMetadata",
    "NormalizedScholarlyWork",
    "EvidenceCandidate",
    "OpenAlexConnector",
    "SemanticScholarConnector",
    "CrossrefConnector",
    "ConnectorHub",
    "connector_hub",
]
