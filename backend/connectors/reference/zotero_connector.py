"""
Zotero Reference Connector
==========================
Governed by: CONVERA Intelligence & Integration Architecture (CIIA v1.0)
Synchronizes references, collections, and BibTeX citations from Zotero libraries.
Provides 100% offline baseline fallback when unconfigured or disconnected.
"""

import os
import time
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

try:
    from connectors.contracts.reference import (
        BaseReferenceConnector,
        ReferenceCollection,
        NormalizedReference,
    )
    from connectors.base import NormalizedScholarlyWork, ProvenanceMetadata
except ImportError:
    from backend.connectors.contracts.reference import (
        BaseReferenceConnector,
        ReferenceCollection,
        NormalizedReference,
    )
    from backend.connectors.base import NormalizedScholarlyWork, ProvenanceMetadata


class ZoteroConnector(BaseReferenceConnector):
    def __init__(
        self,
        library_id: Optional[str] = None,
        api_key: Optional[str] = None,
        library_type: str = "user",
        cache_ttl_seconds: int = 3600,
    ):
        super().__init__(cache_ttl_seconds=cache_ttl_seconds)
        self.library_id = library_id or os.getenv("ZOTERO_LIBRARY_ID") or os.getenv("ZOTERO_USER_ID")
        self.api_key = api_key or os.getenv("ZOTERO_API_KEY")
        self.library_type = library_type
        self._client = None

    @property
    def connector_id(self) -> str:
        return "zotero"

    @property
    def display_name(self) -> str:
        return "Zotero Reference Manager"

    def _get_client(self):
        if not self.library_id or not self.api_key:
            return None
        if self._client is None:
            try:
                from pyzotero import zotero
                self._client = zotero.Zotero(self.library_id, self.library_type, self.api_key)
            except Exception:
                return None
        return self._client

    def _item_to_normalized(self, item: Dict[str, Any]) -> NormalizedReference:
        data = item.get("data", item)
        item_key = data.get("key", item.get("key", "unknown_key"))
        title = data.get("title", "Untitled Reference")
        
        creators = data.get("creators", [])
        authors = []
        for c in creators:
            if "name" in c:
                authors.append(c["name"])
            elif "lastName" in c:
                name = c.get("firstName", "") + " " + c["lastName"]
                authors.append(name.strip())

        year = None
        date_str = data.get("date", "")
        if date_str and len(date_str) >= 4 and date_str[:4].isdigit():
            year = int(date_str[:4])

        doi = data.get("DOI")
        url = data.get("url")
        abstract = data.get("abstractNote")
        venue = data.get("publicationTitle") or data.get("proceedingsTitle") or data.get("publisher")
        tags = [t.get("tag") for t in data.get("tags", []) if isinstance(t, dict) and "tag" in t]

        prov = ProvenanceMetadata(
            source_name="Zotero",
            source_url=f"https://www.zotero.org/{self.library_type}s/{self.library_id}/items/{item_key}" if self.library_id else None,
            doi=doi,
            authority_tier="PEER_REVIEWED",
            methodology_notes="Imported via Zotero API connector",
        )

        return NormalizedReference(
            id=item_key,
            doi=doi,
            title=title,
            authors=authors,
            year=year,
            venue=venue,
            citation_count=0,
            abstract=abstract,
            url=url,
            tags=tags,
            citation_key=data.get("citationKey") or item_key,
            item_type=data.get("itemType", "journalArticle"),
            collection_ids=data.get("collections", []),
            raw_csl_json=data,
            provenance=prov,
            is_offline=False,
        )

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        client = self._get_client()
        if not client:
            return []

        loop = asyncio.get_event_loop()
        try:
            items = await loop.run_in_executor(None, lambda: client.items(q=query, limit=limit))
            return [self._item_to_normalized(it) for it in items if it.get("data", {}).get("itemType") != "attachment"]
        except Exception:
            return []

    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        client = self._get_client()
        if not client:
            return None

        loop = asyncio.get_event_loop()
        try:
            item = await loop.run_in_executor(None, lambda: client.item(identifier))
            if item:
                return self._item_to_normalized(item)
            return None
        except Exception:
            return None

    async def list_collections(self, **kwargs) -> List[ReferenceCollection]:
        client = self._get_client()
        if not client:
            return []

        loop = asyncio.get_event_loop()
        try:
            colls = await loop.run_in_executor(None, lambda: client.collections())
            result = []
            for c in colls:
                data = c.get("data", c)
                result.append(
                    ReferenceCollection(
                        id=data.get("key", ""),
                        name=data.get("name", "Untitled Folder"),
                        parent_id=data.get("parentCollection") or None,
                        item_count=c.get("meta", {}).get("numItems", 0),
                        updated_at=data.get("version", ""),
                    )
                )
            return result
        except Exception:
            return []

    async def fetch_collection_items(
        self, collection_id: str, limit: int = 100, offset: int = 0, **kwargs
    ) -> List[NormalizedReference]:
        client = self._get_client()
        if not client:
            return []

        loop = asyncio.get_event_loop()
        try:
            items = await loop.run_in_executor(
                None, lambda: client.collection_items(collection_id, limit=limit, start=offset)
            )
            return [
                self._item_to_normalized(it)
                for it in items
                if it.get("data", {}).get("itemType") != "attachment"
            ]
        except Exception:
            return []

    async def export_bibtex(self, item_ids: List[str], **kwargs) -> str:
        """Generate BibTeX entries for given item keys."""
        client = self._get_client()
        bib_entries = []

        if client and item_ids:
            loop = asyncio.get_event_loop()
            for key in item_ids:
                try:
                    item = await loop.run_in_executor(None, lambda: client.item(key))
                    norm = self._item_to_normalized(item)
                    author_str = " and ".join(norm.authors) if norm.authors else "Unknown"
                    entry = f"@article{{{norm.citation_key or norm.id},\n"
                    entry += f"  title = {{{norm.title}}},\n"
                    entry += f"  author = {{{author_str}}},\n"
                    if norm.year:
                        entry += f"  year = {{{norm.year}}},\n"
                    if norm.venue:
                        entry += f"  journal = {{{norm.venue}}},\n"
                    if norm.doi:
                        entry += f"  doi = {{{norm.doi}}},\n"
                    entry += "}\n"
                    bib_entries.append(entry)
                except Exception:
                    continue

        return "\n".join(bib_entries)

    async def sync_library(
        self, since_version: Optional[int] = None, **kwargs
    ) -> Dict[str, Any]:
        """Incremental synchronization using Zotero library version."""
        client = self._get_client()
        if not client:
            return {"status": "unconfigured", "synced_count": 0, "library_version": since_version or 0}

        loop = asyncio.get_event_loop()
        try:
            kwargs_call = {"limit": 100}
            if since_version:
                kwargs_call["since"] = since_version

            items = await loop.run_in_executor(None, lambda: client.items(**kwargs_call))
            norm_items = [
                self._item_to_normalized(it).model_dump()
                for it in items
                if it.get("data", {}).get("itemType") != "attachment"
            ]
            
            # Fetch latest library version
            last_version = since_version or 1
            if items:
                versions = [it.get("version", 0) for it in items]
                last_version = max(versions) if versions else last_version

            return {
                "status": "success",
                "synced_count": len(norm_items),
                "library_version": last_version,
                "items": norm_items,
            }
        except Exception as e:
            return {"status": "error", "error": str(e), "synced_count": 0, "library_version": since_version or 0}

    async def health_check(self) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return {
                "status": "unconfigured",
                "connected": False,
                "latency_ms": 0,
                "message": "Zotero credentials (library_id, api_key) not provided",
            }

        start = time.time()
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(None, lambda: client.collections(limit=1))
            latency = int((time.time() - start) * 1000)
            return {
                "status": "healthy",
                "connected": True,
                "latency_ms": latency,
                "message": "Successfully reached Zotero Web API",
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "connected": False,
                "latency_ms": int((time.time() - start) * 1000),
                "message": f"Connection error: {str(e)}",
            }
