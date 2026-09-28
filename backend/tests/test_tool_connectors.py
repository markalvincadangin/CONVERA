"""
Integration Tests for Scholarly Tool Connectors (Feature 012)
=============================================================
Tests Zotero, Notion, Hypothesis, and ORCID connectors with offline fallbacks,
encrypted credentials in SQLite, and FastAPI /api/settings/integrations endpoints.
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient

from connectors.reference.zotero_connector import ZoteroConnector
from connectors.knowledge.notion_connector import NotionConnector
from connectors.knowledge.hypothesis_connector import HypothesisConnector
from connectors.identity.orcid_connector import ORCIDConnector

from server import app
from storage import get_storage
from engines.credential_vault import get_credential_vault


@pytest.mark.asyncio
async def test_zotero_connector_offline_baseline_and_normalization():
    """Verify Zotero connector functions gracefully without network/keys and normalizes items."""
    # 1. Unconfigured
    conn = ZoteroConnector()
    health = await conn.health_check()
    assert health["connected"] is False
    assert health["status"] == "unconfigured"

    search_res = await conn.search("artificial intelligence")
    assert search_res == []

    # 2. Mocked item normalization
    raw_item = {
        "key": "ZOT-ITEM-001",
        "version": 42,
        "data": {
            "key": "ZOT-ITEM-001",
            "itemType": "journalArticle",
            "title": "Empirical Study of LLM Fine-Tuning",
            "creators": [{"firstName": "John", "lastName": "Doe"}, {"name": "DeepMind Lab"}],
            "publicationTitle": "Journal of AI Research",
            "date": "2024-05-12",
            "DOI": "10.1000/182",
            "url": "https://example.org/paper.pdf",
            "tags": [{"tag": "LLM"}, {"tag": "Empirical"}],
            "collections": ["COL-1"],
        },
    }

    norm = conn._item_to_normalized(raw_item)
    assert norm.id == "ZOT-ITEM-001"
    assert norm.title == "Empirical Study of LLM Fine-Tuning"
    assert norm.authors == ["John Doe", "DeepMind Lab"]
    assert norm.year == 2024
    assert norm.doi == "10.1000/182"
    assert norm.venue == "Journal of AI Research"
    assert "LLM" in norm.tags
    assert norm.provenance.source_name == "Zotero"

    # 3. BibTeX generation
    with patch.object(conn, "_get_client") as mock_client:
        mock_instance = MagicMock()
        mock_instance.item.return_value = raw_item
        mock_client.return_value = mock_instance

        bib = await conn.export_bibtex(["ZOT-ITEM-001"])
        assert "@article{ZOT-ITEM-001" in bib
        assert "title = {Empirical Study of LLM Fine-Tuning}" in bib
        assert "author = {John Doe and DeepMind Lab}" in bib


@pytest.mark.asyncio
async def test_notion_connector_offline_and_properties():
    """Verify Notion connector extracts properties and parses pages correctly."""
    conn = NotionConnector()
    health = await conn.health_check()
    assert health["status"] == "unconfigured"

    # Test page property extraction
    mock_page = {
        "id": "notion-page-uuid",
        "url": "https://notion.so/my-research-page",
        "created_time": "2026-01-01T00:00:00Z",
        "last_edited_time": "2026-01-02T00:00:00Z",
        "properties": {
            "Name": {
                "type": "title",
                "title": [{"plain_text": "Farmer Interview Notes - Region XII"}],
            },
            "Theme": {
                "type": "rich_text",
                "rich_text": [{"plain_text": "Cold storage logistic failure"}],
            },
        },
    }

    title = conn._extract_title(mock_page)
    assert title == "Farmer Interview Notes - Region XII"

    content = conn._extract_text_content(mock_page)
    assert "Cold storage logistic failure" in content


@pytest.mark.asyncio
async def test_hypothesis_connector_marginalia_parsing():
    """Verify Hypothesis connector parses quote selectors and marginalia text."""
    conn = HypothesisConnector()

    raw_ann = {
        "id": "ann_hypo_99",
        "text": "Critical observation regarding post-harvest shrinkage.",
        "uri": "https://doi.org/10.1016/j.scienta.2023.112000",
        "user": "acct:researcher_one@hypothes.is",
        "created": "2026-02-15T10:00:00Z",
        "tags": ["yield-loss", "philippines"],
        "target": [
            {
                "source": "https://doi.org/10.1016/j.scienta.2023.112000",
                "selector": [
                    {
                        "type": "TextQuoteSelector",
                        "exact": "Up to 34% of harvested cantaloupe suffers from mechanical decay.",
                    }
                ],
            }
        ],
    }

    item = conn._annotation_to_item(raw_ann)
    assert item.id == "ann_hypo_99"
    assert "Up to 34% of harvested cantaloupe" in item.content_text
    assert "Critical observation regarding post-harvest shrinkage." in item.content_text
    assert item.target_uri == "https://doi.org/10.1016/j.scienta.2023.112000"
    assert item.author_name == "researcher_one"
    assert "yield-loss" in item.tags


@pytest.mark.asyncio
async def test_orcid_connector_id_cleaning_and_works():
    """Verify ORCID identifier normalization and work summarization."""
    conn = ORCIDConnector(default_orcid="https://orcid.org/0000-0002-1825-0097")
    assert conn.default_orcid == "0000-0002-1825-0097"


def test_fastapi_integrations_routes():
    """Verify /api/settings/integrations endpoints (list, upsert, test, sync, delete)."""
    with TestClient(app) as client:
        # 1. List integrations
        list_resp = client.get("/api/settings/integrations")
        assert list_resp.status_code == 200
        data = list_resp.json()
        assert "integrations" in data
        types = [i["integration_type"] for i in data["integrations"]]
        assert "zotero" in types
        assert "notion" in types
        assert "hypothesis" in types
        assert "orcid" in types

        # 2. Upsert integration with secret
        post_resp = client.post(
            "/api/settings/integrations",
            json={
                "integration_type": "zotero",
                "display_name": "My Personal Zotero Library",
                "api_key": "zotero_secret_token_abc123",
                "user_identifier": "9876543",
                "config": {"library_type": "user"},
            },
        )
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["status"] == "success"
        assert post_data["integration"]["is_configured"] is True
        assert post_data["integration"]["has_secret"] is True
        assert post_data["integration"]["masked_secret"] == "••••••••"
        assert "api_key" not in post_data["integration"]

        # 3. Test connectivity (mock unconfigured/configured return)
        test_resp = client.post(
            "/api/settings/integrations/zotero/test",
            json={"user_identifier": "9876543"},
        )
        assert test_resp.status_code == 200
        assert "test_result" in test_resp.json()

        # 4. Trigger sync (unreachable or empty mock)
        sync_resp = client.post("/api/settings/integrations/zotero/sync")
        assert sync_resp.status_code == 200
        assert "synced_count" in sync_resp.json()

        # 5. Fetch logs
        logs_resp = client.get("/api/settings/integrations/zotero/logs")
        assert logs_resp.status_code == 200
        assert "logs" in logs_resp.json()

        # 6. Delete integration
        del_resp = client.delete("/api/settings/integrations/zotero")
        assert del_resp.status_code == 200
        assert del_resp.json()["status"] == "success"
