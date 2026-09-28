"""
CONVERA Reference Connector Contract
====================================
Governed by: CONVERA Intelligence & Integration Architecture (CIIA v1.0)
Focus: Bibliographic libraries, reference managers, citation metadata (e.g. Zotero, Mendeley).
"""

from abc import abstractmethod
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
try:
    from connectors.base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata
except ImportError:
    from backend.connectors.base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata


class ReferenceCollection(BaseModel):
    id: str
    name: str
    parent_id: Optional[str] = None
    item_count: int = 0
    updated_at: Optional[str] = None


class NormalizedReference(NormalizedScholarlyWork):
    citation_key: Optional[str] = None
    item_type: str = "journalArticle"
    collection_ids: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    bibtex: Optional[str] = None
    raw_csl_json: Optional[Dict[str, Any]] = None


class BaseReferenceConnector(BaseConnector):
    """Abstract base class for reference manager connectors (e.g., Zotero)."""

    @property
    def capabilities(self) -> List[str]:
        return ["SEARCH", "FETCH_BY_ID", "COLLECTIONS", "BIBTEX_EXPORT", "SYNC"]

    @abstractmethod
    async def list_collections(self, **kwargs) -> List[ReferenceCollection]:
        """List folders / collections in the user's reference library."""
        pass

    @abstractmethod
    async def fetch_collection_items(
        self, collection_id: str, limit: int = 100, offset: int = 0, **kwargs
    ) -> List[NormalizedReference]:
        """Fetch items belonging to a specific collection."""
        pass

    @abstractmethod
    async def export_bibtex(self, item_ids: List[str], **kwargs) -> str:
        """Export specified items as a formatted BibTeX string."""
        pass

    @abstractmethod
    async def sync_library(
        self, since_version: Optional[int] = None, **kwargs
    ) -> Dict[str, Any]:
        """Synchronize library changes incrementally."""
        pass
