"""
CONVERA PubMed Open-Access Connector
====================================
Fetches and normalizes biomedical and healthcare research papers from NCBI E-Utilities API.
"""
from typing import List, Optional, Dict, Any
import httpx
import time
from datetime import datetime, timezone

from connectors.base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata

class PubMedConnector(BaseConnector):
    @property
    def connector_id(self) -> str:
        return "pubmed"

    @property
    def display_name(self) -> str:
        return "PubMed (NCBI)"

    @property
    def capabilities(self) -> List[str]:
        return ["SEARCH", "FETCH_BY_ID", "PROVENANCE"]

    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

    def normalize(self, raw: Dict[str, Any]) -> NormalizedScholarlyWork:
        title = (raw.get("title") or "Untitled PubMed Article").rstrip(".")
        pubdate = raw.get("pubdate", "")
        year = int(pubdate[:4]) if len(pubdate) >= 4 and pubdate[:4].isdigit() else datetime.now().year
        authors = [a.get("name") for a in raw.get("authors", []) if a.get("name")]
        
        article_ids = raw.get("articleids", [])
        doi = None
        pmid = str(raw.get("uid") or "")
        for aid in article_ids:
            if aid.get("idtype") == "doi":
                doi = aid.get("value")
            elif aid.get("idtype") == "pubmed":
                pmid = str(aid.get("value"))

        prov = ProvenanceMetadata(
            source_name="PubMed (NCBI)",
            source_url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None,
            doi=doi,
            retrieval_timestamp=datetime.now(timezone.utc).isoformat(),
            authority_tier="PEER_REVIEWED",
            methodology_notes=f"Retrieved via NCBI E-Utilities for PMID {pmid}"
        )

        return NormalizedScholarlyWork(
            title=title,
            abstract=None,
            authors=authors,
            year=year,
            venue=raw.get("source"),
            citation_count=0,
            doi=doi,
            url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None,
            open_access_pdf_url=None,
            topics=[],
            provenance=prov
        )

    async def search(self, query: str, limit: int = 5, **kwargs) -> List[NormalizedScholarlyWork]:
        cache_key = f"search:{query}:{limit}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        results: List[NormalizedScholarlyWork] = []
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                esearch_url = f"{self.base_url}/esearch.fcgi"
                esearch_params = {
                    "db": "pubmed",
                    "term": query,
                    "retmax": str(limit),
                    "retmode": "json"
                }
                resp = await client.get(esearch_url, params=esearch_params)
                if resp.status_code != 200:
                    return results

                id_list = resp.json().get("esearchresult", {}).get("idlist", [])
                if not id_list:
                    return results

                esummary_url = f"{self.base_url}/esummary.fcgi"
                esummary_params = {
                    "db": "pubmed",
                    "id": ",".join(id_list),
                    "retmode": "json"
                }
                sum_resp = await client.get(esummary_url, params=esummary_params)
                if sum_resp.status_code != 200:
                    return results

                result_dict = sum_resp.json().get("result", {})
                for pmid in id_list:
                    item = result_dict.get(pmid)
                    if not item:
                        continue
                    item["uid"] = pmid
                    work = self.normalize(item)
                    results.append(work)

            self._set_cache(cache_key, results)
        except Exception as e:
            print(f"[PubMedConnector] Search error: {e}")

        return results

    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        pmid = identifier.replace("pmid:", "").strip()
        works = await self.search(pmid, limit=1)
        return works[0] if works else None

    async def health_check(self) -> Dict[str, Any]:
        start = time.time()
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{self.base_url}/einfo.fcgi?retmode=json")
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
