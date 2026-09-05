"""
CONVERA Connector Hub
=====================
Orchestrates connector registrations, health monitors, and federated scholarly discovery.
"""

import asyncio
from typing import Dict, List, Optional, Any
from .base import BaseConnector, NormalizedScholarlyWork, EvidenceCandidate, ProvenanceMetadata
from .openalex_connector import OpenAlexConnector
from .semantic_scholar_connector import SemanticScholarConnector
from .crossref_connector import CrossrefConnector
from .pubmed_connector import PubMedConnector


class ConnectorHub:
    def __init__(self):
        self._connectors: Dict[str, BaseConnector] = {}
        self._register_default_connectors()

    def _register_default_connectors(self):
        self.register(OpenAlexConnector())
        self.register(SemanticScholarConnector())
        self.register(CrossrefConnector())
        self.register(PubMedConnector())

    def register(self, connector: BaseConnector):
        self._connectors[connector.connector_id] = connector

    def get_connector(self, connector_id: str) -> Optional[BaseConnector]:
        return self._connectors.get(connector_id)

    async def list_connectors(self) -> List[Dict[str, Any]]:
        results = []
        for cid, conn in self._connectors.items():
            results.append({
                "connector_id": conn.connector_id,
                "display_name": conn.display_name,
                "capabilities": [c.value if hasattr(c, "value") else str(c) for c in conn.capabilities],
            })
        return results

    async def check_all_health(self) -> List[Dict[str, Any]]:
        tasks = [conn.health_check() for conn in self._connectors.values()]
        return await asyncio.gather(*tasks, return_exceptions=True)

    async def federated_search(
        self,
        query: str,
        limit_per_source: int = 5,
        connector_ids: Optional[List[str]] = None
    ) -> List[NormalizedScholarlyWork]:
        """Perform parallel search across selected or all connectors and deduplicate results."""
        target_connectors = (
            [self._connectors[cid] for cid in connector_ids if cid in self._connectors]
            if connector_ids
            else list(self._connectors.values())
        )

        if not target_connectors:
            return []

        tasks = [conn.search(query=query, limit=limit_per_source) for conn in target_connectors]
        raw_results = await asyncio.gather(*tasks, return_exceptions=True)

        deduped_works: Dict[str, NormalizedScholarlyWork] = {}
        title_index: Dict[str, str] = {}

        for batch in raw_results:
            if isinstance(batch, list):
                for work in batch:
                    # Key by DOI if present
                    if work.doi:
                        key = work.doi.lower().strip()
                        if key not in deduped_works:
                            deduped_works[key] = work
                    else:
                        # Normalize title key
                        clean_title = "".join(c for c in work.title.lower() if c.isalnum())
                        if clean_title and clean_title not in title_index:
                            title_index[clean_title] = work.title
                            deduped_works[clean_title] = work

        # Sort by citation count descending
        sorted_works = sorted(
            list(deduped_works.values()),
            key=lambda x: (x.citation_count, x.year or 0),
            reverse=True
        )

        # Auto-persist online results to local SQLite storage (SDD-006)
        storage = None
        try:
            from storage import get_storage
            storage = get_storage()
        except Exception:
            pass

        if storage and sorted_works:
            payloads = []
            for w in sorted_works:
                connector_name = getattr(w.provenance, "source_name", "unknown").lower().replace(" ", "_")
                payloads.append({
                    "doi": w.doi,
                    "title": w.title,
                    "abstract": w.abstract,
                    "authors": w.authors,
                    "year": w.year,
                    "venue": w.venue,
                    "citation_count": w.citation_count,
                    "source_connector": connector_name,
                    "source_url": w.url or getattr(w.provenance, "source_url", None),
                    "raw_metadata": w.model_dump()
                })
            try:
                persisted = storage.upsert_scholarly_works(payloads)
                persisted_by_doi = {p["doi"]: p["id"] for p in persisted if p.get("doi")}
                persisted_by_title = {p["title"].lower(): p["id"] for p in persisted if p.get("title")}
                for w in sorted_works:
                    norm_doi = w.doi.lower().strip() if w.doi else None
                    w.id = persisted_by_doi.get(norm_doi) or persisted_by_title.get(w.title.lower())
            except Exception:
                pass

        # Offline / Degradation Fallback: if zero works returned from online APIs, search local FTS5 cache (SDD-006)
        if not sorted_works and storage:
            try:
                cached_rows = storage.search_scholarly_works_fts(query=query, limit=limit_per_source * 3)
                for cr in cached_rows:
                    sorted_works.append(NormalizedScholarlyWork(
                        id=cr["id"],
                        doi=cr.get("doi"),
                        title=cr["title"],
                        authors=cr.get("authors") or [],
                        year=cr.get("year"),
                        venue=cr.get("venue"),
                        citation_count=cr.get("citation_count") or 0,
                        abstract=cr.get("abstract"),
                        url=cr.get("source_url"),
                        provenance=ProvenanceMetadata(
                            source_name=f"Local Cache ({cr.get('source_connector', 'offline')})",
                            source_url=cr.get("source_url"),
                            doi=cr.get("doi"),
                            retrieval_timestamp=cr.get("created_at") or "",
                            authority_tier="BENCHMARK",
                            methodology_notes="Retrieved from local SQLite FTS5 cache during offline or degraded connectivity."
                        ),
                        is_offline=True,
                        is_cached=True
                    ))
            except Exception:
                pass

        return sorted_works


# Global ConnectorHub Singleton
connector_hub = ConnectorHub()
