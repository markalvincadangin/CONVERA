"""
Semantic Scholar Research Connector
====================================
Fetches scholarly literature, citation graphs, and influential citation counts from Semantic Scholar.
"""

import time
import httpx
from typing import Dict, List, Optional, Any
from .base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata


class SemanticScholarConnector(BaseConnector):
    def __init__(self, api_key: Optional[str] = None, cache_ttl_seconds: int = 3600):
        super().__init__(cache_ttl_seconds=cache_ttl_seconds)
        self.api_key = api_key
        self.base_url = "https://api.semanticscholar.org/graph/v1"

    @property
    def connector_id(self) -> str:
        return "semantic_scholar"

    @property
    def display_name(self) -> str:
        return "Semantic Scholar Academic Graph"

    @property
    def capabilities(self) -> List[str]:
        return ["SEARCH", "FETCH_BY_ID", "INFLUENTIAL_CITATIONS", "PROVENANCE"]

    def _get_headers(self) -> Dict[str, str]:
        headers = {"User-Agent": "CONVERA/3.0 (EMAERX Research)"}
        if self.api_key:
            headers["x-api-key"] = self.api_key
        return headers

    def _normalize_work(self, item: Dict[str, Any]) -> NormalizedScholarlyWork:
        authors = [a.get("name") for a in item.get("authors", []) if a.get("name")]
        ext_ids = item.get("externalIds", {})
        doi = ext_ids.get("DOI")

        oa_pdf = item.get("openAccessPdf", {})
        oa_pdf_url = oa_pdf.get("url") if oa_pdf else None

        return NormalizedScholarlyWork(
            doi=doi,
            title=item.get("title") or "Untitled Paper",
            authors=authors,
            year=item.get("year"),
            venue=item.get("venue"),
            citation_count=item.get("citationCount") or 0,
            influential_citation_count=item.get("influentialCitationCount") or 0,
            abstract=item.get("abstract"),
            url=item.get("url") or (f"https://doi.org/{doi}" if doi else None),
            open_access_pdf_url=oa_pdf_url,
            provenance=ProvenanceMetadata(
                source_name="Semantic Scholar Academic Graph",
                source_url=item.get("url"),
                doi=doi,
                authority_tier="PEER_REVIEWED",
                methodology_notes="Indexed via Semantic Scholar Academic Graph with citation impact metrics."
            )
        )

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        cache_key = f"s2:search:{query}:{limit}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        params = {
            "query": query,
            "limit": limit,
            "fields": "title,authors,year,venue,citationCount,influentialCitationCount,abstract,externalIds,url,openAccessPdf"
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/paper/search", params=params, headers=self._get_headers())
                if resp.status_code != 200:
                    return []
                data = resp.json()
                results = [self._normalize_work(w) for w in data.get("data", [])]
                self._set_cache(cache_key, results)
                return results
        except Exception:
            return []

    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        clean_id = identifier.replace("https://doi.org/", "")
        paper_id = f"DOI:{clean_id}" if "10." in clean_id else clean_id
        cache_key = f"s2:work:{paper_id}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        params = {
            "fields": "title,authors,year,venue,citationCount,influentialCitationCount,abstract,externalIds,url,openAccessPdf"
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/paper/{paper_id}", params=params, headers=self._get_headers())
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
                resp = await client.get(
                    f"{self.base_url}/paper/search?query=computing&limit=1",
                    headers=self._get_headers()
                )
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
