"""
CONVERA Semantic Scholar Connector
==================================
Fetches computer science, AI, and computing research papers from the Semantic Scholar Academic Graph API.
"""
from typing import List, Optional, Dict, Any
import httpx
import time
from datetime import datetime, timezone

from connectors.base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata

class SemanticScholarConnector(BaseConnector):
    @property
    def connector_id(self) -> str:
        return "semantic_scholar"

    @property
    def display_name(self) -> str:
        return "Semantic Scholar"

    @property
    def capabilities(self) -> List[str]:
        return ["SEARCH", "FETCH_BY_ID", "CITATIONS", "PROVENANCE"]

    base_url = "https://api.semanticscholar.org/graph/v1"

    async def search(self, query: str, limit: int = 5, **kwargs) -> List[NormalizedScholarlyWork]:
        cache_key = f"search:{query}:{limit}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        results: List[NormalizedScholarlyWork] = []
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                url = f"{self.base_url}/paper/search"
                params = {
                    "query": query,
                    "limit": str(limit),
                    "fields": "paperId,title,abstract,year,authors,venue,citationCount,externalIds,url,fieldsOfStudy"
                }
                resp = await client.get(url, params=params)
                if resp.status_code != 200:
                    return results

                data = resp.json().get("data", [])
                for item in data:
                    paper_id = item.get("paperId")
                    title = item.get("title", "Untitled Semantic Scholar Paper")
                    abstract = item.get("abstract")
                    year = item.get("year") or datetime.now().year
                    authors = [a.get("name") for a in item.get("authors", []) if a.get("name")]
                    venue = item.get("venue")
                    citations = item.get("citationCount") or 0
                    doi = item.get("externalIds", {}).get("DOI")
                    paper_url = item.get("url") or f"https://www.semanticscholar.org/paper/{paper_id}"
                    topics = item.get("fieldsOfStudy") or []

                    prov = ProvenanceMetadata(
                        source_name="Semantic Scholar",
                        source_url=paper_url,
                        doi=doi,
                        retrieval_timestamp=datetime.now(timezone.utc).isoformat(),
                        authority_tier="PEER_REVIEWED",
                        methodology_notes=f"Retrieved via Semantic Scholar API for paper {paper_id}"
                    )

                    work = NormalizedScholarlyWork(
                        title=title,
                        abstract=abstract,
                        authors=authors,
                        year=int(year),
                        venue=venue,
                        citation_count=int(citations),
                        doi=doi,
                        url=paper_url,
                        open_access_pdf_url=None,
                        topics=topics,
                        provenance=prov
                    )
                    results.append(work)

            self._set_cache(cache_key, results)
        except Exception as e:
            print(f"[SemanticScholarConnector] Search error: {e}")

        return results

    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        paper_id = identifier.replace("s2:", "").strip()
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                url = f"{self.base_url}/paper/{paper_id}"
                params = {"fields": "paperId,title,abstract,year,authors,venue,citationCount,externalIds,url,fieldsOfStudy"}
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    item = resp.json()
                    doi = item.get("externalIds", {}).get("DOI")
                    prov = ProvenanceMetadata(
                        source_name="Semantic Scholar",
                        source_url=item.get("url") or f"https://www.semanticscholar.org/paper/{paper_id}",
                        doi=doi,
                        retrieval_timestamp=datetime.now(timezone.utc).isoformat(),
                        authority_tier="PEER_REVIEWED"
                    )
                    return NormalizedScholarlyWork(
                        title=item.get("title", "Untitled"),
                        abstract=item.get("abstract"),
                        authors=[a.get("name") for a in item.get("authors", []) if a.get("name")],
                        year=int(item.get("year") or datetime.now().year),
                        venue=item.get("venue"),
                        citation_count=int(item.get("citationCount") or 0),
                        doi=doi,
                        url=item.get("url"),
                        topics=item.get("fieldsOfStudy") or [],
                        provenance=prov
                    )
        except Exception as e:
            print(f"[SemanticScholarConnector] Fetch error: {e}")
        return None

    async def health_check(self) -> Dict[str, Any]:
        start = time.time()
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{self.base_url}/paper/search?query=AI&limit=1")
                latency_ms = round((time.time() - start) * 1000, 1)
                return {
                    "connector_id": self.connector_id,
                    "status": "HEALTHY" if resp.status_code == 200 else "DEGRADED",
                    "latency_ms": latency_ms
                }
        except Exception as e:
            return {
                "connector_id": self.connector_id,
                "status": "UNHEALTHY",
                "error": str(e)
            }
