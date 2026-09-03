"""
OpenAlex Research Connector
===========================
Fetches scholarly literature, citation counts, topics, and authors from the OpenAlex scholarly index.
"""

import time
import httpx
from typing import Dict, List, Optional, Any
from .base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata


class OpenAlexConnector(BaseConnector):
    def __init__(self, mailto: str = "convera@emaerx.org", cache_ttl_seconds: int = 3600):
        super().__init__(cache_ttl_seconds=cache_ttl_seconds)
        self.mailto = mailto
        self.base_url = "https://api.openalex.org"

    @property
    def connector_id(self) -> str:
        return "openalex"

    @property
    def display_name(self) -> str:
        return "OpenAlex Scholarly Graph"

    @property
    def capabilities(self) -> List[str]:
        return ["SEARCH", "FETCH_BY_ID", "CITATIONS", "TOPICS", "PROVENANCE"]

    def _reconstruct_abstract(self, inverted_index: Optional[Dict[str, List[int]]]) -> Optional[str]:
        if not inverted_index:
            return None
        words: List[tuple[int, str]] = []
        for word, positions in inverted_index.items():
            for pos in positions:
                words.append((pos, word))
        words.sort(key=lambda x: x[0])
        return " ".join(w[1] for w in words)

    def _normalize_work(self, item: Dict[str, Any]) -> NormalizedScholarlyWork:
        # Extract authors
        authorships = item.get("authorships", [])
        authors = [
            a.get("author", {}).get("display_name")
            for a in authorships
            if a.get("author", {}).get("display_name")
        ]

        # Extract topics
        topics = [
            t.get("display_name")
            for t in item.get("topics", [])
            if t.get("display_name")
        ]

        # Extract open access url
        oa = item.get("open_access", {})
        oa_pdf = oa.get("oa_url") if oa.get("is_oa") else None

        # Clean DOI
        raw_doi = item.get("doi")
        clean_doi = raw_doi.replace("https://doi.org/", "") if raw_doi else None

        # Venue
        host_venue = item.get("primary_location", {}).get("source", {}).get("display_name")

        return NormalizedScholarlyWork(
            doi=clean_doi,
            title=item.get("title") or "Untitled Paper",
            authors=authors,
            year=item.get("publication_year"),
            venue=host_venue,
            citation_count=item.get("cited_by_count", 0),
            abstract=self._reconstruct_abstract(item.get("abstract_inverted_index")),
            url=raw_doi or item.get("id"),
            open_access_pdf_url=oa_pdf,
            topics=topics,
            provenance=ProvenanceMetadata(
                source_name="OpenAlex Scholarly Graph",
                source_url=raw_doi or item.get("id"),
                doi=clean_doi,
                authority_tier="PEER_REVIEWED",
                methodology_notes="Indexed academic publication verified via OpenAlex API."
            )
        )

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        cache_key = f"openalex:search:{query}:{limit}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        params = {
            "search": query,
            "per_page": limit,
            "mailto": self.mailto,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/works", params=params)
                if resp.status_code != 200:
                    return []
                data = resp.json()
                results = [self._normalize_work(w) for w in data.get("results", [])]
                self._set_cache(cache_key, results)
                return results
        except Exception:
            return []

    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        clean_id = identifier.replace("https://doi.org/", "")
        cache_key = f"openalex:work:{clean_id}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        try:
            url = f"{self.base_url}/works/https://doi.org/{clean_id}" if "10." in clean_id else f"{self.base_url}/works/{clean_id}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, params={"mailto": self.mailto})
                if resp.status_code != 200:
                    return None
                work = self._normalize_work(resp.json())
                self._set_cache(cache_key, work)
                return work
        except Exception:
            return None

    async def health_check(self) -> Dict[str, Any]:
        t0 = time.time()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/works?per_page=1&mailto={self.mailto}")
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
