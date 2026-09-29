"""
Unit and Integration Tests for SDD-015: Scholarly Ingestion & Live Connectors
Governed by: CIIA v1.0 and Article I/II/IV/VII
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from connectors.base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata
from connectors.openalex_connector import OpenAlexConnector
from connectors.semantic_scholar_connector import SemanticScholarConnector
from connectors.hub import ConnectorHub
from storage.sqlite_adapter import SQLiteStorageAdapter
from server import app


@pytest.fixture
def mock_storage(tmp_path):
    db_file = str(tmp_path / "test_convera.db")
    storage = SQLiteStorageAdapter(db_path=db_file)
    return storage


@pytest.fixture
def client(mock_storage):
    with patch("routers.connectors._get_storage", return_value=mock_storage), \
         patch("routers.orchestrator.get_storage", return_value=mock_storage):
        with TestClient(app) as test_client:
            yield test_client



# =====================================================================
# 1. OpenAlex Connector Tests
# =====================================================================

def test_openalex_abstract_reconstruction():
    connector = OpenAlexConnector()
    inv_index = {
        "Deep": [0],
        "learning": [1],
        "in": [2],
        "agriculture": [3],
    }
    abstract = connector._reconstruct_abstract(inv_index)
    assert abstract == "Deep learning in agriculture"

    # Malformed inverted index test
    assert connector._reconstruct_abstract(None) is None
    assert connector._reconstruct_abstract({}) is None
    assert connector._reconstruct_abstract("invalid") is None


def test_openalex_normalize_work():
    connector = OpenAlexConnector()
    raw_item = {
        "id": "https://openalex.org/W123456789",
        "doi": "https://doi.org/10.1016/j.agwat.2023.108000",
        "title": "Smart Irrigation Telemetry Using Edge Computing",
        "publication_year": 2023,
        "cited_by_count": 42,
        "authorships": [
            {"author": {"display_name": "Maria Santos"}},
            {"author": {"display_name": "Juan Dela Cruz"}},
        ],
        "primary_location": {
            "source": {"display_name": "Agricultural Water Management"}
        },
        "topics": [{"display_name": "Precision Agriculture"}],
        "open_access": {"is_oa": True, "oa_url": "https://example.org/paper.pdf"},
        "abstract_inverted_index": {"Smart": [0], "irrigation": [1]},
    }

    work = connector._normalize_work(raw_item)
    assert work.doi == "10.1016/j.agwat.2023.108000"
    assert work.title == "Smart Irrigation Telemetry Using Edge Computing"
    assert work.year == 2023
    assert work.citation_count == 42
    assert len(work.authors) == 2
    assert work.venue == "Agricultural Water Management"
    assert work.open_access_pdf_url == "https://example.org/paper.pdf"
    assert work.provenance.authority_tier == "PEER_REVIEWED"


@pytest.mark.asyncio
async def test_openalex_search_mocked():
    connector = OpenAlexConnector()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "results": [
            {
                "id": "W1",
                "doi": "https://doi.org/10.1000/1",
                "title": "OpenAlex Paper 1",
                "publication_year": 2022,
                "cited_by_count": 10,
                "authorships": [{"author": {"display_name": "Alice"}}],
            }
        ]
    }

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_resp):
        works = await connector.search(query="agriculture", limit=5)
        assert len(works) == 1
        assert works[0].title == "OpenAlex Paper 1"
        assert works[0].doi == "10.1000/1"


# =====================================================================
# 2. Semantic Scholar Connector Tests
# =====================================================================

def test_semantic_scholar_normalize_work():
    connector = SemanticScholarConnector()
    raw_item = {
        "externalIds": {"DOI": "10.1109/ACCESS.2024.12345"},
        "title": "IoT Edge Optimization for Tropical Crop Disease Detection",
        "year": 2024,
        "venue": "IEEE Access",
        "citationCount": 25,
        "influentialCitationCount": 7,
        "abstract": "We propose a low-power edge model for tropical crops.",
        "url": "https://www.semanticscholar.org/paper/123",
        "authors": [{"name": "Roberto Ramos"}],
        "openAccessPdf": {"url": "https://arxiv.org/pdf/2401.12345.pdf"},
    }

    work = connector._normalize_work(raw_item)
    assert work.doi == "10.1109/ACCESS.2024.12345"
    assert work.title == "IoT Edge Optimization for Tropical Crop Disease Detection"
    assert work.citation_count == 25
    assert work.influential_citation_count == 7
    assert len(work.authors) == 1
    assert work.authors[0] == "Roberto Ramos"
    assert work.venue == "IEEE Access"


@pytest.mark.asyncio
async def test_semantic_scholar_search_mocked():
    connector = SemanticScholarConnector()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "data": [
            {
                "externalIds": {"DOI": "10.2000/s2"},
                "title": "Semantic Scholar Paper",
                "year": 2023,
                "citationCount": 50,
                "influentialCitationCount": 12,
                "authors": [{"name": "Bob"}],
            }
        ]
    }

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_resp):
        works = await connector.search(query="crop disease", limit=5)
        assert len(works) == 1
        assert works[0].title == "Semantic Scholar Paper"
        assert works[0].citation_count == 50


# =====================================================================
# 3. ConnectorHub Federated Search & Deduplication Tests
# =====================================================================

@pytest.mark.asyncio
async def test_connector_hub_federated_deduplication(mock_storage):
    hub = ConnectorHub()

    # Create two mocked connectors that return duplicate works by DOI and title
    conn_a = MagicMock(spec=BaseConnector)
    conn_a.connector_id = "mock_a"
    conn_a.display_name = "Mock A"
    conn_a.capabilities = ["SEARCH"]
    work_1 = NormalizedScholarlyWork(
        doi="10.1000/shared_doi",
        title="Shared Paper Title",
        authors=["Author 1"],
        year=2023,
        citation_count=100,
        provenance=ProvenanceMetadata(source_name="Mock A"),
    )
    conn_a.search = AsyncMock(return_value=[work_1])

    conn_b = MagicMock(spec=BaseConnector)
    conn_b.connector_id = "mock_b"
    conn_b.display_name = "Mock B"
    conn_b.capabilities = ["SEARCH"]
    # Same DOI, lower citation count
    work_2 = NormalizedScholarlyWork(
        doi="10.1000/shared_doi",
        title="Shared Paper Title (Duplicate)",
        authors=["Author 1", "Author 2"],
        year=2023,
        citation_count=80,
        provenance=ProvenanceMetadata(source_name="Mock B"),
    )
    # Distinct paper
    work_3 = NormalizedScholarlyWork(
        doi="10.1000/distinct_doi",
        title="Distinct Paper Title",
        authors=["Author 3"],
        year=2024,
        citation_count=15,
        provenance=ProvenanceMetadata(source_name="Mock B"),
    )
    conn_b.search = AsyncMock(return_value=[work_2, work_3])

    hub._connectors = {"mock_a": conn_a, "mock_b": conn_b}

    results = await hub.federated_search(
        query="shared",
        limit_per_source=5,
        storage_override=mock_storage
    )

    # Must deduplicate by DOI: 2 unique papers total
    assert len(results) == 2
    # Ranked by citation count: work_1 (100) first, work_3 (15) second
    assert results[0].doi == "10.1000/shared_doi"
    assert results[0].citation_count == 100
    assert results[1].doi == "10.1000/distinct_doi"

    # Verify auto-persistence into SQLite
    persisted_rows = mock_storage.search_scholarly_works_fts(query="shared", limit=10)
    assert len(persisted_rows) >= 1
    assert persisted_rows[0]["doi"] == "10.1000/shared_doi"


@pytest.mark.asyncio
async def test_connector_hub_offline_fallback(mock_storage):
    # Seed local SQLite storage with a benchmark paper
    mock_storage.upsert_scholarly_works([
        {
            "doi": "10.1234/offline.benchmark",
            "title": "Offline Ground Truth Benchmark Study",
            "abstract": "A comprehensive analysis of agricultural edge compute resilience under disconnected networks.",
            "authors": ["Offline Researcher"],
            "year": 2021,
            "venue": "Journal of Resilient Systems",
            "citation_count": 210,
            "source_connector": "benchmark_corpus",
        }
    ])

    hub = ConnectorHub()
    # Connectors that fail / return empty (offline simulation)
    failing_conn = MagicMock(spec=BaseConnector)
    failing_conn.connector_id = "failing"
    failing_conn.display_name = "Failing Connector"
    failing_conn.capabilities = ["SEARCH"]
    failing_conn.search = AsyncMock(side_effect=Exception("Network unreachable"))
    hub._connectors = {"failing": failing_conn}

    results = await hub.federated_search(
        query="agricultural edge compute resilience",
        limit_per_source=5,
        storage_override=mock_storage
    )

    # Must fall back to local SQLite FTS5 index
    assert len(results) >= 1
    assert results[0].doi == "10.1234/offline.benchmark"
    assert results[0].is_offline is True
    assert results[0].is_cached is True


# =====================================================================
# 4. API Router Endpoints Tests
# =====================================================================

def test_router_list_and_health(client):
    res = client.get("/api/connectors")
    assert res.status_code == 200
    connectors = res.json().get("connectors", [])
    assert len(connectors) >= 2
    c_ids = [c["connector_id"] for c in connectors]
    assert "openalex" in c_ids
    assert "semantic_scholar" in c_ids

    # Health check endpoint
    with patch("connectors.hub.connector_hub.check_all_health", new_callable=AsyncMock, return_value=[
        {"connector_id": "openalex", "status": "HEALTHY", "latency_ms": 120.0},
        {"connector_id": "semantic_scholar", "status": "HEALTHY", "latency_ms": 95.0},
    ]):
        res_health = client.get("/api/connectors/health")
        assert res_health.status_code == 200
        health = res_health.json().get("health", [])
        assert len(health) == 2


def test_router_ingest_and_link_claim(client, mock_storage):
    # 1. Create a problem in SQLite
    problem = mock_storage.add_problem({
        "id": "PROB-INGEST-001",
        "domain": "Computing & Agriculture",
        "problem_statement": "Post-harvest rice moisture sensors fail under tropical monsoons.",
        "sufferer_occupation": "Warehouse Operators in Iloilo",
        "quantified_impact": "40% spoilage loss",
        "workaround": "Manual probe testing",
    })
    prob_id = problem["id"]

    # 2. Add a claim to the problem
    mock_storage.set_problem_claims(prob_id, [
        {"claim_text": "Monsoon humidity causes capacitive sensor drift exceeding 15% error.", "claim_type": "FRICTION_REALITY"}
    ])
    prob_after_claim = mock_storage.get_problem(prob_id)
    claim_id = prob_after_claim["claims"][0]["id"]

    # 3. Ingest a scholarly work
    ingest_payload = {
        "problem_id": prob_id,
        "work_payload": {
            "doi": "10.1016/j.compag.2024.108999",
            "title": "Dielectric Sensor Calibration under High Humidity Tropical Conditions",
            "authors": ["Elena Bautista", "Carlos Santos"],
            "year": 2024,
            "venue": "Computers and Electronics in Agriculture",
            "citation_count": 33,
            "abstract": "We quantify 18.2% humidity drift in capacitive soil and grain moisture probes.",
            "url": "https://doi.org/10.1016/j.compag.2024.108999",
            "provenance": {
                "source_name": "OpenAlex",
                "authority_tier": "PEER_REVIEWED"
            }
        },
        "source_tier": "A",
        "evidence_type": "PEER_REVIEWED_LITERATURE",
        "quote_or_summary": "18.2% humidity drift observed in grain probes.",
    }

    res_ingest = client.post("/api/connectors/ingest", json=ingest_payload)
    assert res_ingest.status_code == 200
    ingest_data = res_ingest.json()
    assert ingest_data["success"] is True
    source_id = ingest_data["source"]["id"]
    assert source_id is not None
    assert ingest_data["source"]["scholarly_doi"] == "10.1016/j.compag.2024.108999"

    # 4. Link ingested source to claim
    link_payload = {
        "claim_id": claim_id,
        "source_id": source_id,
        "relation_type": "SUPPORTS",
        "evidence_strength": "STRONG",
        "rationale": "Empirically measures 18.2% drift, validating our 15% claim.",
    }
    res_link = client.post("/api/connectors/link-claim", json=link_payload)
    assert res_link.status_code == 200
    link_data = res_link.json()
    assert link_data["success"] is True
    assert link_data["link"]["relation_type"] == "SUPPORTS"

    # 5. Fetch problem sources and verify joined links
    res_sources = client.get(f"/api/connectors/problem/{prob_id}/sources")
    assert res_sources.status_code == 200
    sources_data = res_sources.json()
    assert sources_data["count"] >= 1
    src = sources_data["sources"][0]
    assert src["scholarly_title"] == "Dielectric Sensor Calibration under High Humidity Tropical Conditions"
    assert len(src["claim_links"]) == 1
    assert src["claim_links"][0]["claim_id"] == claim_id


# =====================================================================
# 5. Orchestrator Live ACQUIRE_EVIDENCE Dispatch Test
# =====================================================================

@pytest.mark.asyncio
async def test_orchestrator_live_acquire_evidence_dispatch(mock_storage):
    from services.research_orchestrator import ResearchOrchestrator
    from models.orchestrator import OrchestrationActionDispatchRequest, ActionType

    # Create problem and session
    prob = mock_storage.add_problem({
        "id": "PROB-ORCH-ACQ-001",
        "problem_statement": "Post-harvest fungal contamination in grain silos.",
    })
    session = mock_storage.save_session("session_acq_001", {
        "framework_id": "RESEARCH",
        "current_stage": "stage_a",
        "problem_id": prob["id"],
    })


    orchestrator = ResearchOrchestrator(storage_adapter=mock_storage)

    # Seed mock scholarly works into ConnectorHub
    mock_work = NormalizedScholarlyWork(
        doi="10.1000/fungal_silos_2024",
        title="Fungal Contamination Control in Tropical Grain Silos",
        authors=["Dr. A. Tan"],
        year=2024,
        citation_count=45,
        provenance=ProvenanceMetadata(source_name="OpenAlex"),
    )

    with patch("connectors.hub.connector_hub.federated_search", new_callable=AsyncMock, return_value=[mock_work]):
        dispatch_req = OrchestrationActionDispatchRequest(
            session_id="session_acq_001",
            problem_id=prob["id"],
            action_type=ActionType.ACQUIRE_EVIDENCE,
            target_engine="connector_hub",
            parameters={"query": "fungal contamination grain silos", "limit": 5, "live": True},
        )
        res = await orchestrator.dispatch_action(dispatch_req)

        assert res.status == "SUCCESS"
        assert "scholarly_works" in res.resulting_artifacts
        works = res.resulting_artifacts["scholarly_works"]
        assert len(works) == 1
        assert works[0]["doi"] == "10.1000/fungal_silos_2024"
        assert "Acquired 1 scholarly works" in res.execution_summary


        # Check that event was recorded in SQLite
        events = mock_storage.get_orchestration_events("session_acq_001")
        assert len(events) >= 1
        assert events[0]["event_type"] == "ACTION_DISPATCHED"

