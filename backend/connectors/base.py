"""
CONVERA Universal Connector Contract
=====================================
Governed by: CONVERA Intelligence & Integration Architecture (CIIA v1.0)
Core Doctrine: External systems provide information and capabilities;
CONVERA provides the persistent context, evidence structure, governance, and decision intelligence.
"""

import time
import asyncio
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class ProvenanceMetadata(BaseModel):
    source_name: str
    source_url: Optional[str] = None
    doi: Optional[str] = None
    retrieval_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    authority_tier: str = "PEER_REVIEWED"  # PEER_REVIEWED, OFFICIAL_DATA, FIELD_INTERVIEW, WEB_SIGNAL
    methodology_notes: Optional[str] = None


class NormalizedScholarlyWork(BaseModel):
    doi: Optional[str] = None
    title: str
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    venue: Optional[str] = None
    citation_count: int = 0
    influential_citation_count: Optional[int] = 0
    abstract: Optional[str] = None
    url: Optional[str] = None
    open_access_pdf_url: Optional[str] = None
    topics: List[str] = Field(default_factory=list)
    provenance: ProvenanceMetadata


class EvidenceCandidate(BaseModel):
    id: str
    problem_id: Optional[str] = None
    claim_text: str
    claim_type: str = "FRICTION_REALITY"  # FRICTION_REALITY, FREQUENCY_CONSEQUENCE, WORKAROUND_DISSATISFACTION, ADOPTION_COMMITMENT
    evidence_tier: str = "DISCOVERY_SIGNAL"  # DISCOVERY_SIGNAL, CONTEXTUAL_EVIDENCE, VALIDATION_EVIDENCE
    evidence_strength: str = "MODERATE"  # WEAK, MODERATE, STRONG, CONTRADICTED
    ai_confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    supporting_quote: Optional[str] = None
    extracted_from: Optional[str] = None
    provenance: ProvenanceMetadata
    status: str = "PENDING_REVIEW"  # PENDING_REVIEW, VALIDATED, REFUTED


class BaseConnector(ABC):
    """Abstract base class governing all external data connectors in CONVERA."""

    def __init__(self, cache_ttl_seconds: int = 3600):
        self._cache: Dict[str, Any] = {}
        self._cache_timestamps: Dict[str, float] = {}
        self.cache_ttl_seconds = cache_ttl_seconds

    @property
    @abstractmethod
    def connector_id(self) -> str:
        """Unique string identifier (e.g. 'openalex', 'semantic_scholar', 'crossref')."""
        pass

    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable name for the connector."""
        pass

    @property
    @abstractmethod
    def capabilities(self) -> List[str]:
        """Declared capabilities: ['SEARCH', 'FETCH_BY_ID', 'CITATIONS', 'PROVENANCE']."""
        pass

    def _get_from_cache(self, key: str) -> Optional[Any]:
        if key in self._cache:
            if time.time() - self._cache_timestamps.get(key, 0) < self.cache_ttl_seconds:
                return self._cache[key]
            else:
                del self._cache[key]
                del self._cache_timestamps[key]
        return None

    def _set_cache(self, key: str, value: Any):
        self._cache[key] = value
        self._cache_timestamps[key] = time.time()

    @abstractmethod
    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        """Search external source and return standardized scholarly works."""
        pass

    @abstractmethod
    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        """Fetch a single work by DOI or provider-specific ID."""
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Verify connectivity, latency, and quota health."""
        pass
