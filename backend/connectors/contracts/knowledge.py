"""
CONVERA Knowledge & Annotation Connector Contract
=================================================
Governed by: CONVERA Intelligence & Integration Architecture (CIIA v1.0)
Focus: Personal knowledge bases, literature notes, web marginalia (e.g. Notion, Hypothesis).
"""

from abc import abstractmethod
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
try:
    from connectors.base import BaseConnector, ProvenanceMetadata
except ImportError:
    from backend.connectors.base import BaseConnector, ProvenanceMetadata


class KnowledgeItem(BaseModel):
    id: str
    title: str
    content_text: str
    item_type: str = "PAGE"  # PAGE, DATABASE_RECORD, BLOCK, MARGINALIA_ANNOTATION
    url: Optional[str] = None
    target_uri: Optional[str] = None  # URL or DOI annotated (for Hypothesis)
    tags: List[str] = Field(default_factory=list)
    author_name: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    provenance: ProvenanceMetadata
    raw_payload: Optional[Dict[str, Any]] = None


class BaseKnowledgeConnector(BaseConnector):
    """Abstract base class for knowledge management and annotation connectors."""

    @property
    def capabilities(self) -> List[str]:
        return ["SEARCH", "FETCH_BY_ID", "LIST_CONTAINERS", "INGEST_NOTES", "SYNC"]

    @abstractmethod
    async def list_containers(self, **kwargs) -> List[Dict[str, Any]]:
        """List databases, notebooks, or annotation groups."""
        pass

    @abstractmethod
    async def fetch_notes(
        self, container_id: str, limit: int = 50, cursor: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        """Fetch notes or pages with pagination cursor."""
        pass

    @abstractmethod
    async def search_knowledge(
        self, query: str, limit: int = 20, **kwargs
    ) -> List[KnowledgeItem]:
        """Full-text search across connected notes or marginalia."""
        pass
