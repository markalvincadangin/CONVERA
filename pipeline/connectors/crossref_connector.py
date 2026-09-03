"""
Crossref Research Connector
===========================
Fetches authoritative publisher metadata and resolves DOIs from the Crossref scholarly index.
"""

import time
import httpx
from typing import Dict, List, Optional, Any
from .base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata


class CrossrefConnector(BaseConnector):
    def __init__(self, mailto: str = "convera@emaerx.org", cache_ttl_seconds: int = 3600):
        super().__init__(cache_ttl_seconds=cache_ttl_seconds)
        self.mailto = mailto
        self.base_url = "https://api.crossref.org"

    @property
    def connector_id(self) -> str:
        return "crossref"

    @property
    def display_name(self) -> str:
        return "Crossref DOI Resolver"

    @property
    def capabilities(self) -> List[str]:
        return ["SEARCH", "FETCH_BY_ID", "DOI_RESOLUTION", "PROVENANCE"]

    def _normalize_work(self, item: Dict[str, Any]) -> NormalizedScholarlyWork:
        # Extract authors
        authors = []
        for a in item.get("author", []):
            given = a.get("given", "")
            family = a.get("family", "")
            name = f"{given} {family}".strip()
            if name:
                authors.append(name)

        # Extract year
        pub_year = None
        date_parts = item.get("published", {}).get("date-parts", []) or item.get("published-print", {}).get("date-parts", []) or item.get("published-online", {}).get("date-parts", [])
        if date_parts and date_parts[0]:
            pub_year = date_parts[0][0]

        # Titles
        titles = item.get("title", [])
        title = titles[0] if titles else "Untitled Paper"

        # Container / Venue
        containers = item.get("container-title", [])
        venue = containers[0] if containers else item.get("publisher")

        doi = item.get("DOI")
        url = item.get("URL") or (f"https://doi.org/{doi}" if doi else None)

        return NormalizedScholarlyWork(
            doi=doi,
            title=title,
            authors=authors,
            year=pub_year,
            venue=venue,
            citation_count=item.get("is-referenced-by-count", 0),
            abstract=item.get("abstract"),
            url=url,
            provenance=ProvenanceMetadata(
                source_name="Crossref Metadata Registry",
                source_url=url,
                doi=doi,
                authority_tier="PEER_REVIEWED",
                methodology_notes="Authoritative DOI publisher record retrieved from Crossref."
            )
        )

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        cache_key = f"crossref:search:{query}:{limit}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        params = {
            "query": query,
            "rows": limit,
            "mailto": self.mailto,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/works", params=params)
                if resp.status_code != 200:
                    return []
                data = resp.json()
                items = data.get("message", {}).get("items", [])
                results = [self._normalize_work(w) for w in items]
                self._set_cache(cache_key, results)
                return results
        except Exception:
            return []

    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        clean_doi = identifier.replace("https://doi.org/", "")
        cache_key = f"crossref:doi:{clean_doi}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/works/{clean_doi}", params={"mailto": self.mailto})
                if resp.status_code != 200:
                    return None
                data = resp.json()
                work = self._normalize_work(data.get("message", {}))
                self._set_cache(cache_key, work)
                return work
        except Exception:
            return None

    async def health_check(self) -> Dict[str, Any]:
        t0 = time.time()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/works?rows=1&mailto={self.mailto}")
                latency = round((time.time() - t0) * 1000, 2)
                return {
                    "connector_id": self.connector_id,
                    "status": "HEALTHY" if resp.status_code == 200 else "DEGRADED",
                    "latency_ms": latency,
                    "status_code": resp.status_code
                }
        except Exception as e:
            return {
                "connector_id": self.connector_id,
                "status": "UNAVAILABLE",
                "latency_ms": round((time.time() - t0) * 1000, 2),
                "error": str(e)
            }
