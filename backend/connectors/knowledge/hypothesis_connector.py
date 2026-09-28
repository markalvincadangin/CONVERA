"""
Hypothesis Annotation Connector
===============================
Governed by: CONVERA Intelligence & Integration Architecture (CIIA v1.0)
Ingests web and PDF marginalia, highlight quotes, and scholarly annotations from hypothes.is.
Provides 100% offline baseline fallback when unconfigured or disconnected.
"""

import os
import time
import httpx
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

try:
    from connectors.contracts.knowledge import (
        BaseKnowledgeConnector,
        KnowledgeItem,
    )
    from connectors.base import NormalizedScholarlyWork, ProvenanceMetadata
except ImportError:
    from backend.connectors.contracts.knowledge import (
        BaseKnowledgeConnector,
        KnowledgeItem,
    )
    from backend.connectors.base import NormalizedScholarlyWork, ProvenanceMetadata


class HypothesisConnector(BaseKnowledgeConnector):
    def __init__(
        self,
        api_key: Optional[str] = None,
        user_identifier: Optional[str] = None,
        default_group: str = "__world__",
        cache_ttl_seconds: int = 3600,
    ):
        super().__init__(cache_ttl_seconds=cache_ttl_seconds)
        self.api_key = api_key or os.getenv("HYPOTHESIS_API_KEY") or os.getenv("HYPOTHESIS_TOKEN")
        self.user_identifier = user_identifier or os.getenv("HYPOTHESIS_USER_ID") or os.getenv("HYPOTHESIS_ID")
        self.default_group = default_group or os.getenv("HYPOTHESIS_GROUP", "__world__")
        self.base_url = "https://hypothes.is/api"

    @property
    def connector_id(self) -> str:
        return "hypothesis"

    @property
    def display_name(self) -> str:
        return "Hypothesis Web & PDF Marginalia"

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _extract_exact_quote(self, annotation: Dict[str, Any]) -> Optional[str]:
        targets = annotation.get("target", [])
        if targets and isinstance(targets, list):
            selectors = targets[0].get("selector", [])
            for s in selectors:
                if s.get("type") == "TextQuoteSelector" and "exact" in s:
                    return s["exact"]
        return None

    def _annotation_to_item(self, ann: Dict[str, Any]) -> KnowledgeItem:
        ann_id = ann.get("id", "unknown_ann")
        comment_text = ann.get("text", "")
        quote = self._extract_exact_quote(ann)
        uri = ann.get("uri", "")

        content = f"Quote: \"{quote}\"\nAnnotation: {comment_text}" if quote else comment_text
        title = f"Marginalia on {uri[:40]}..." if uri else "Marginalia Annotation"
        tags = ann.get("tags", [])
        author = ann.get("user", "").split("acct:")[-1].split("@")[0] if "acct:" in ann.get("user", "") else ann.get("user")

        prov = ProvenanceMetadata(
            source_name="Hypothesis",
            source_url=ann.get("links", {}).get("html", uri),
            authority_tier="FIELD_INTERVIEW",
            methodology_notes=f"Ingested from Hypothesis annotation on {uri}",
        )

        return KnowledgeItem(
            id=ann_id,
            title=title,
            content_text=content,
            item_type="MARGINALIA_ANNOTATION",
            url=ann.get("links", {}).get("html", uri),
            target_uri=uri,
            tags=tags,
            author_name=author,
            created_at=ann.get("created"),
            updated_at=ann.get("updated"),
            provenance=prov,
            raw_payload=ann,
        )

    async def list_containers(self, **kwargs) -> List[Dict[str, Any]]:
        """List groups the user belongs to on Hypothesis."""
        if not self.api_key:
            return [{"id": "__world__", "name": "Public (__world__)", "type": "public_group"}]

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(f"{self.base_url}/groups", headers=self._headers())
                if res.status_code == 200:
                    groups = res.json()
                    return [
                        {"id": g.get("id"), "name": g.get("name"), "type": g.get("type", "group")}
                        for g in groups
                    ]
                return [{"id": "__world__", "name": "Public (__world__)", "type": "public_group"}]
        except Exception:
            return [{"id": "__world__", "name": "Public (__world__)", "type": "public_group"}]

    async def fetch_notes(
        self, container_id: Optional[str] = None, limit: int = 50, cursor: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        """Fetch annotations belonging to a group or user."""
        group = container_id or self.default_group
        params: Dict[str, Any] = {"limit": min(limit, 100)}
        if group and group != "all":
            params["group"] = group
        if self.user_identifier:
            params["user"] = f"acct:{self.user_identifier}@hypothes.is" if "@" not in self.user_identifier else self.user_identifier
        if cursor:
            params["offset"] = cursor

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.base_url}/search", headers=self._headers(), params=params)
                if res.status_code == 200:
                    data = res.json()
                    rows = data.get("rows", [])
                    items = [self._annotation_to_item(r).model_dump() for r in rows]
                    total = data.get("total", len(rows))
                    next_offset = str(int(cursor or 0) + len(rows)) if len(rows) == limit else None
                    return {
                        "notes": items,
                        "next_cursor": next_offset,
                        "has_more": next_offset is not None,
                        "total": total,
                    }
                return {"notes": [], "next_cursor": None, "has_more": False, "error": res.text}
        except Exception as e:
            return {"notes": [], "next_cursor": None, "has_more": False, "error": str(e)}

    async def search_knowledge(
        self, query: str, limit: int = 20, **kwargs
    ) -> List[KnowledgeItem]:
        """Search annotations containing text or tags."""
        params: Dict[str, Any] = {"q": query, "limit": min(limit, 50)}
        if self.default_group and self.default_group != "__world__":
            params["group"] = self.default_group

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.base_url}/search", headers=self._headers(), params=params)
                if res.status_code == 200:
                    data = res.json()
                    return [self._annotation_to_item(r) for r in data.get("rows", [])]
                return []
        except Exception:
            return []

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        items = await self.search_knowledge(query, limit=limit)
        return [
            NormalizedScholarlyWork(
                id=item.id,
                title=item.title,
                authors=[item.author_name] if item.author_name else ["Hypothesis Reader"],
                abstract=item.content_text,
                url=item.url,
                provenance=item.provenance,
                is_offline=False,
            )
            for item in items
        ]

    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(f"{self.base_url}/annotations/{identifier}", headers=self._headers())
                if res.status_code == 200:
                    ann = res.json()
                    item = self._annotation_to_item(ann)
                    return NormalizedScholarlyWork(
                        id=item.id,
                        title=item.title,
                        abstract=item.content_text,
                        url=item.url,
                        provenance=item.provenance,
                    )
                return None
        except Exception:
            return None

    async def health_check(self) -> Dict[str, Any]:
        start = time.time()
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                if self.api_key:
                    res = await client.get(f"{self.base_url}/profile", headers=self._headers())
                    latency = int((time.time() - start) * 1000)
                    if res.status_code == 200:
                        profile = res.json()
                        user_id = profile.get("userid", "unknown")
                        return {
                            "status": "healthy",
                            "connected": True,
                            "latency_ms": latency,
                            "message": f"Connected to Hypothesis as {user_id}",
                        }
                    return {
                        "status": "unhealthy",
                        "connected": False,
                        "latency_ms": latency,
                        "message": f"Hypothesis authentication error: HTTP {res.status_code}",
                    }
                else:
                    # Public ping check
                    res = await client.get(f"{self.base_url}/search", params={"limit": 1})
                    latency = int((time.time() - start) * 1000)
                    return {
                        "status": "healthy" if res.status_code == 200 else "unhealthy",
                        "connected": res.status_code == 200,
                        "latency_ms": latency,
                        "message": "Public Hypothesis API reachable (no API token configured)",
                    }
        except Exception as e:
            return {
                "status": "unhealthy",
                "connected": False,
                "latency_ms": int((time.time() - start) * 1000),
                "message": f"Error reaching Hypothesis: {str(e)}",
            }
