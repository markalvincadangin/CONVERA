"""
PubMed / NCBI E-utilities Connector for CONVERA CIIA
Implements BaseConnector for biomedical, life sciences, and health literature.
Uses NCBI E-utilities API (esearch + esummary).
"""

from __future__ import annotations
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import re

from .base import (
    BaseConnector,
    NormalizedScholarlyWork,
    ProvenanceMetadata,
)

class PubMedConnector(BaseConnector):
    """
    NCBI PubMed API Connector.
    Provides biomedical literature discovery, clinical evidence extraction, and DOI resolution.
    """

    def __init__(self, api_key: Optional[str] = None, email: str = "markalvincadangin@gmail.com", cache_ttl_seconds: int = 3600):
        super().__init__(cache_ttl_seconds=cache_ttl_seconds)
        self.api_key = api_key
        self.email = email
        self.base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

    @property
    def connector_id(self) -> str:
        return "pubmed"

    @property
    def display_name(self) -> str:
        return "PubMed (National Library of Medicine)"

    @property
    def capabilities(self) -> List[str]:
        return ["SEARCH", "FETCH_BY_ID", "PROVENANCE"]

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        cache_key = f"search_{query}_{limit}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        params = {
            "db": "pubmed",
            "term": query,
            "retmax": min(limit, 25),
            "retmode": "json",
            "tool": "CONVERA",
            "email": self.email
        }
        if self.api_key:
            params["api_key"] = self.api_key

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                search_resp = await client.get(f"{self.base_url}/esearch.fcgi", params=params)
                if search_resp.status_code != 200:
                    return []
                
                search_data = search_resp.json()
                id_list = search_data.get("esearchresult", {}).get("idlist", [])
                if not id_list:
                    return []

                summary_params = {
                    "db": "pubmed",
                    "id": ",".join(id_list),
                    "retmode": "json",
                    "tool": "CONVERA",
                    "email": self.email
                }
                if self.api_key:
                    summary_params["api_key"] = self.api_key

                sum_resp = await client.get(f"{self.base_url}/esummary.fcgi", params=summary_params)
                if sum_resp.status_code != 200:
                    return []

                sum_data = sum_resp.json().get("result", {})
                results = []

                for pmid in id_list:
                    item = sum_data.get(pmid)
                    if not item or not isinstance(item, dict):
                        continue
                    work = self.normalize(item)
                    results.append(work)

                self._set_cache(cache_key, results)
                return results
        except Exception as e:
            print(f"[!] PubMed search error: {e}")
            return []

    async def fetch_by_id(self, item_id: str) -> Optional[NormalizedScholarlyWork]:
        pmid = item_id.replace("PMID:", "").strip()
        cache_key = f"fetch_{pmid}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        params = {
            "db": "pubmed",
            "id": pmid,
            "retmode": "json",
            "tool": "CONVERA",
            "email": self.email
        }
        if self.api_key:
            params["api_key"] = self.api_key

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/esummary.fcgi", params=params)
                if resp.status_code == 200:
                    sum_data = resp.json().get("result", {})
                    item = sum_data.get(pmid)
                    if item and isinstance(item, dict):
                        work = self.normalize(item)
                        self._set_cache(cache_key, work)
                        return work
        except Exception as e:
            print(f"[!] PubMed fetch error: {e}")
        return None

    def normalize(self, raw_item: Dict[str, Any]) -> NormalizedScholarlyWork:
        pmid = str(raw_item.get("uid", raw_item.get("id", "")))
        title = raw_item.get("title", "Untitled PubMed Article").rstrip(".")
        
        doi = None
        article_ids = raw_item.get("articleids", [])
        for aid in article_ids:
            if isinstance(aid, dict) and aid.get("idtype") == "doi":
                doi = aid.get("value")
                break

        pubdate = raw_item.get("pubdate", "")
        year_match = re.search(r"\b(19\d\d|20\d\d)\b", pubdate)
        publication_year = int(year_match.group(1)) if year_match else None

        raw_authors = raw_item.get("authors", [])
        authors = [a.get("name") for a in raw_authors if isinstance(a, dict) and "name" in a]

        venue = raw_item.get("source", raw_item.get("fulljournalname", "PubMed Indexed Journal"))
        uri = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else (f"https://doi.org/{doi}" if doi else "https://pubmed.ncbi.nlm.nih.gov/")

        provenance = ProvenanceMetadata(
            source_name="PubMed (National Library of Medicine)",
            source_url=uri,
            doi=doi,
            authority_tier="PEER_REVIEWED",
            methodology_notes=f"Retrieved from PubMed PMID:{pmid}"
        )

        return NormalizedScholarlyWork(
            doi=doi,
            title=title,
            authors=authors,
            year=publication_year,
            venue=venue,
            citation_count=0,
            abstract="",
            url=uri,
            topics=["Biomedical & Health Sciences"],
            provenance=provenance
        )

    async def health_check(self) -> Dict[str, Any]:
        try:
            params = {"db": "pubmed", "term": "health", "retmax": 1, "retmode": "json", "tool": "CONVERA", "email": self.email}
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/esearch.fcgi", params=params)
                return {
                    "connector_id": self.connector_id,
                    "status": "HEALTHY" if resp.status_code == 200 else "DEGRADED",
                    "http_status": resp.status_code,
                }
        except Exception as e:
            return {
                "connector_id": self.connector_id,
                "status": "UNAVAILABLE",
                "error": str(e)
            }
