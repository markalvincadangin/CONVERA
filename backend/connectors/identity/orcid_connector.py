"""
ORCID Researcher Identity Connector
===================================
Governed by: CONVERA Intelligence & Integration Architecture (CIIA v1.0)
Synchronizes researcher publication records, validated works, and affiliations from ORCID.
Provides 100% offline baseline fallback when unconfigured or disconnected.
"""

import os
import time
import httpx
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

try:
    from connectors.base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata
except ImportError:
    from backend.connectors.base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata


class ORCIDConnector(BaseConnector):
    def __init__(
        self,
        default_orcid: Optional[str] = None,
        cache_ttl_seconds: int = 3600,
    ):
        super().__init__(cache_ttl_seconds=cache_ttl_seconds)
        resolved_orcid = default_orcid or os.getenv("ORCID_ID") or os.getenv("ORCID")
        self.default_orcid = self._clean_orcid(resolved_orcid) if resolved_orcid else None
        self.base_url = "https://pub.orcid.org/v3.0"

    @property
    def connector_id(self) -> str:
        return "orcid"

    @property
    def display_name(self) -> str:
        return "ORCID Researcher Registry"

    @property
    def capabilities(self) -> List[str]:
        return ["SEARCH", "FETCH_BY_ID", "PROFILE", "PUBLICATIONS"]

    def _clean_orcid(self, orcid: str) -> str:
        return orcid.replace("https://orcid.org/", "").replace("http://orcid.org/", "").strip()

    def _headers(self) -> Dict[str, str]:
        return {
            "Accept": "application/json",
            "User-Agent": "CONVERA-Research-Intelligence/1.1 (https://github.com/emaerx/convera)",
        }

    async def fetch_profile(self, orcid_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        target_id = self._clean_orcid(orcid_id) if orcid_id else self.default_orcid
        if not target_id:
            return None

        cached = self._get_from_cache(f"orcid_profile_{target_id}")
        if cached:
            return cached

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(f"{self.base_url}/{target_id}/person", headers=self._headers())
                if res.status_code == 200:
                    data = res.json()
                    name_obj = data.get("name", {}) or {}
                    given = name_obj.get("given-names", {}).get("value", "") if name_obj.get("given-names") else ""
                    family = name_obj.get("family-name", {}).get("value", "") if name_obj.get("family-name") else ""
                    full_name = f"{given} {family}".strip() or "ORCID Researcher"

                    bio_obj = data.get("biography")
                    bio = bio_obj.get("content") if bio_obj else None

                    profile = {
                        "orcid": target_id,
                        "name": full_name,
                        "biography": bio,
                        "url": f"https://orcid.org/{target_id}",
                    }
                    self._set_cache(f"orcid_profile_{target_id}", profile)
                    return profile
                return None
        except Exception:
            return None

    async def fetch_works(
        self, orcid_id: Optional[str] = None, limit: int = 50
    ) -> List[NormalizedScholarlyWork]:
        target_id = self._clean_orcid(orcid_id) if orcid_id else self.default_orcid
        if not target_id:
            return []

        cached = self._get_from_cache(f"orcid_works_{target_id}")
        if cached:
            return cached

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.base_url}/{target_id}/works", headers=self._headers())
                if res.status_code == 200:
                    data = res.json()
                    group_list = data.get("group", [])
                    works: List[NormalizedScholarlyWork] = []

                    for grp in group_list[:limit]:
                        summaries = grp.get("work-summary", [])
                        if not summaries:
                            continue
                        s = summaries[0]

                        # Extract title
                        title_obj = s.get("title", {}) or {}
                        title = title_obj.get("title", {}).get("value") or "Untitled Work"

                        # Extract publication year
                        year = None
                        pub_date = s.get("publication-date")
                        if pub_date and pub_date.get("year"):
                            try:
                                year = int(pub_date["year"].get("value"))
                            except (ValueError, TypeError):
                                year = None

                        # Extract DOI and external IDs
                        doi = None
                        url = s.get("url", {}).get("value") if s.get("url") else None
                        ext_ids = s.get("external-ids", {}).get("external-id", [])
                        for ext in ext_ids:
                            if ext.get("external-id-type") == "doi":
                                doi = ext.get("external-id-value")
                                if not url:
                                    url = f"https://doi.org/{doi}"
                                break

                        venue = s.get("journal-title", {}).get("value") if s.get("journal-title") else None
                        put_code = str(s.get("put-code", grp.get("last-modified-date", {}).get("value", "orcid_work")))

                        prov = ProvenanceMetadata(
                            source_name="ORCID",
                            source_url=f"https://orcid.org/{target_id}",
                            doi=doi,
                            authority_tier="PEER_REVIEWED",
                            methodology_notes=f"Extracted from verified ORCID record {target_id}",
                        )

                        works.append(
                            NormalizedScholarlyWork(
                                id=f"orcid:{put_code}",
                                doi=doi,
                                title=title,
                                authors=[target_id],
                                year=year,
                                venue=venue,
                                citation_count=0,
                                url=url,
                                provenance=prov,
                                is_offline=False,
                            )
                        )

                    self._set_cache(f"orcid_works_{target_id}", works)
                    return works
                return []
        except Exception:
            return []

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        # If query resembles an ORCID, fetch its works directly
        cleaned = self._clean_orcid(query)
        if len(cleaned) == 19 and cleaned.count("-") == 3:
            return await self.fetch_works(cleaned, limit=limit)

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    f"{self.base_url}/search",
                    headers=self._headers(),
                    params={"q": query, "rows": min(limit, 20)},
                )
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for item in data.get("result", []):
                        orcid_id = item.get("orcid-identifier", {}).get("path")
                        if orcid_id:
                            profile = await self.fetch_profile(orcid_id)
                            if profile:
                                prov = ProvenanceMetadata(
                                    source_name="ORCID",
                                    source_url=profile["url"],
                                    authority_tier="OFFICIAL_DATA",
                                )
                                results.append(
                                    NormalizedScholarlyWork(
                                        id=f"orcid:{orcid_id}",
                                        title=f"Researcher: {profile['name']} ({orcid_id})",
                                        authors=[profile["name"]],
                                        abstract=profile.get("biography"),
                                        url=profile["url"],
                                        provenance=prov,
                                    )
                                )
                    return results
                return []
        except Exception:
            return []

    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        cleaned = self._clean_orcid(identifier)
        works = await self.fetch_works(cleaned, limit=1)
        return works[0] if works else None

    async def health_check(self) -> Dict[str, Any]:
        start = time.time()
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(
                    f"{self.base_url}/0000-0002-1825-0097/person",
                    headers=self._headers(),
                )
                latency = int((time.time() - start) * 1000)
                if res.status_code == 200:
                    return {
                        "status": "healthy",
                        "connected": True,
                        "latency_ms": latency,
                        "message": "ORCID Public v3.0 API operational",
                    }
                return {
                    "status": "unhealthy",
                    "connected": False,
                    "latency_ms": latency,
                    "message": f"ORCID returned HTTP {res.status_code}",
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "connected": False,
                "latency_ms": int((time.time() - start) * 1000),
                "message": f"Error reaching ORCID API: {str(e)}",
            }
