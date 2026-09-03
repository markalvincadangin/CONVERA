"""
CONVERA Connector Hub
=====================
Orchestrates connector registrations, health monitors, and federated scholarly discovery.
"""

import asyncio
from typing import Dict, List, Optional, Any
from .base import BaseConnector, NormalizedScholarlyWork, EvidenceCandidate
from .openalex_connector import OpenAlexConnector
from .semantic_scholar_connector import SemanticScholarConnector
from .crossref_connector import CrossrefConnector


class ConnectorHub:
    def __init__(self):
        self._connectors: Dict[str, BaseConnector] = {}
        self._register_default_connectors()

    def _register_default_connectors(self):
        self.register(OpenAlexConnector())
        self.register(SemanticScholarConnector())
        self.register(CrossrefConnector())

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
                "capabilities": conn.capabilities,
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
        return sorted_works


# Global ConnectorHub Singleton
connector_hub = ConnectorHub()
