"""
Notion Knowledge Connector
==========================
Governed by: CONVERA Intelligence & Integration Architecture (CIIA v1.0)
Ingests research databases, literature notes, and synthesis blocks from Notion.
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


class NotionConnector(BaseKnowledgeConnector):
    def __init__(
        self,
        api_key: Optional[str] = None,
        default_database_id: Optional[str] = None,
        cache_ttl_seconds: int = 3600,
    ):
        super().__init__(cache_ttl_seconds=cache_ttl_seconds)
        self.api_key = api_key or os.getenv("NOTION_API_KEY") or os.getenv("NOTION_TOKEN")
        self.default_database_id = default_database_id or os.getenv("NOTION_DATABASE_ID")
        self.base_url = "https://api.notion.com/v1"

    @property
    def connector_id(self) -> str:
        return "notion"

    @property
    def display_name(self) -> str:
        return "Notion Knowledge Workspace"

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key or ''}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
        }

    def _extract_title(self, page: Dict[str, Any]) -> str:
        props = page.get("properties", {})
        for prop_name, prop_data in props.items():
            if prop_data.get("type") == "title":
                title_list = prop_data.get("title", [])
                if title_list:
                    return "".join(t.get("plain_text", "") for t in title_list)
        return "Untitled Page"

    def _extract_text_content(self, page: Dict[str, Any]) -> str:
        # Extract plain text from properties if rich text or summary exists
        props = page.get("properties", {})
        snippets = []
        for prop_name, prop_data in props.items():
            p_type = prop_data.get("type")
            if p_type == "rich_text":
                texts = [t.get("plain_text", "") for t in prop_data.get("rich_text", [])]
                if texts:
                    snippets.append(f"{prop_name}: {''.join(texts)}")
            elif p_type == "select" and prop_data.get("select"):
                snippets.append(f"{prop_name}: {prop_data['select'].get('name')}")
            elif p_type == "multi_select":
                names = [m.get("name") for m in prop_data.get("multi_select", [])]
                if names:
                    snippets.append(f"{prop_name}: {', '.join(names)}")
        return "\n".join(snippets)

    async def list_containers(self, **kwargs) -> List[Dict[str, Any]]:
        """List accessible Notion databases."""
        if not self.api_key:
            return []

        cached = self._get_from_cache("notion_containers")
        if cached:
            return cached

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/search",
                    headers=self._headers(),
                    json={"filter": {"value": "database", "property": "object"}},
                )
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for db in data.get("results", []):
                        title_objs = db.get("title", [])
                        title = "".join(t.get("plain_text", "") for t in title_objs) or "Untitled Database"
                        results.append({
                            "id": db.get("id"),
                            "title": title,
                            "type": "database",
                            "url": db.get("url"),
                        })
                    self._set_cache("notion_containers", results)
                    return results
                return []
        except Exception:
            return []

    async def fetch_notes(
        self, container_id: Optional[str] = None, limit: int = 50, cursor: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        """Query pages in a Notion database."""
        db_id = container_id or self.default_database_id
        if not self.api_key or not db_id:
            return {"notes": [], "next_cursor": None, "has_more": False}

        payload: Dict[str, Any] = {"page_size": min(limit, 100)}
        if cursor:
            payload["start_cursor"] = cursor

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/databases/{db_id}/query",
                    headers=self._headers(),
                    json=payload,
                )
                if res.status_code == 200:
                    data = res.json()
                    notes = []
                    for page in data.get("results", []):
                        page_id = page.get("id")
                        title = self._extract_title(page)
                        content = self._extract_text_content(page)
                        url = page.get("url")
                        created_time = page.get("created_time")
                        last_edited = page.get("last_edited_time")

                        prov = ProvenanceMetadata(
                            source_name="Notion",
                            source_url=url,
                            authority_tier="FIELD_INTERVIEW",
                            methodology_notes=f"Ingested from Notion Database {db_id}",
                        )

                        item = KnowledgeItem(
                            id=page_id,
                            title=title,
                            content_text=content,
                            item_type="DATABASE_RECORD",
                            url=url,
                            created_at=created_time,
                            updated_at=last_edited,
                            provenance=prov,
                            raw_payload=page,
                        )
                        notes.append(item.model_dump())

                    return {
                        "notes": notes,
                        "next_cursor": data.get("next_cursor"),
                        "has_more": data.get("has_more", False),
                    }
                return {"notes": [], "next_cursor": None, "has_more": False, "error": res.text}
        except Exception as e:
            return {"notes": [], "next_cursor": None, "has_more": False, "error": str(e)}

    async def search_knowledge(
        self, query: str, limit: int = 20, **kwargs
    ) -> List[KnowledgeItem]:
        """Full-text search across connected Notion pages."""
        if not self.api_key:
            return []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/search",
                    headers=self._headers(),
                    json={"query": query, "page_size": min(limit, 50)},
                )
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for p in data.get("results", []):
                        page_id = p.get("id")
                        title = self._extract_title(p)
                        content = self._extract_text_content(p)
                        url = p.get("url")

                        prov = ProvenanceMetadata(
                            source_name="Notion",
                            source_url=url,
                            authority_tier="FIELD_INTERVIEW",
                            methodology_notes="Imported via Notion Search",
                        )

                        results.append(
                            KnowledgeItem(
                                id=page_id,
                                title=title,
                                content_text=content,
                                item_type="PAGE",
                                url=url,
                                created_at=p.get("created_time"),
                                updated_at=p.get("last_edited_time"),
                                provenance=prov,
                                raw_payload=p,
                            )
                        )
                    return results
                return []
        except Exception:
            return []

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        items = await self.search_knowledge(query, limit=limit)
        return [
            NormalizedScholarlyWork(
                id=item.id,
                title=item.title,
                authors=[item.author_name] if item.author_name else ["Notion Contributor"],
                abstract=item.content_text,
                url=item.url,
                provenance=item.provenance,
                is_offline=False,
            )
            for item in items
        ]

    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        if not self.api_key:
            return None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    f"{self.base_url}/pages/{identifier}",
                    headers=self._headers(),
                )
                if res.status_code == 200:
                    page = res.json()
                    title = self._extract_title(page)
                    content = self._extract_text_content(page)
                    return NormalizedScholarlyWork(
                        id=page.get("id"),
                        title=title,
                        abstract=content,
                        url=page.get("url"),
                        provenance=ProvenanceMetadata(
                            source_name="Notion",
                            source_url=page.get("url"),
                            authority_tier="FIELD_INTERVIEW",
                        ),
                    )
                return None
        except Exception:
            return None

    async def health_check(self) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "status": "unconfigured",
                "connected": False,
                "latency_ms": 0,
                "message": "Notion API key not configured",
            }

        start = time.time()
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(f"{self.base_url}/users/me", headers=self._headers())
                latency = int((time.time() - start) * 1000)
                if res.status_code == 200:
                    bot_data = res.json()
                    name = bot_data.get("name", "Notion Bot")
                    return {
                        "status": "healthy",
                        "connected": True,
                        "latency_ms": latency,
                        "message": f"Connected as '{name}'",
                    }
                return {
                    "status": "unhealthy",
                    "connected": False,
                    "latency_ms": latency,
                    "message": f"Notion authentication error: HTTP {res.status_code}",
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "connected": False,
                "latency_ms": int((time.time() - start) * 1000),
                "message": f"Network error reaching Notion API: {str(e)}",
            }
