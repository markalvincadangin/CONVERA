"""
CONVERA Connector Contracts
"""

from .reference import (
    BaseReferenceConnector,
    NormalizedReference,
    ReferenceCollection,
)
from .knowledge import (
    BaseKnowledgeConnector,
    KnowledgeItem,
)

__all__ = [
    "BaseReferenceConnector",
    "NormalizedReference",
    "ReferenceCollection",
    "BaseKnowledgeConnector",
    "KnowledgeItem",
]
