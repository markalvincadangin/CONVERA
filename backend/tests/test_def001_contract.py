"""
CONVERA Targeted Verification: DEF-001
======================================
Tests the Frontend to Backend Scholarly Search Contract.
Verifies problemService.ts contract alignment with POST /api/connectors/search.
"""

import pathlib
import pytest
from fastapi.testclient import TestClient
from server import app


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_def001_no_stale_research_query_in_frontend():
    """Verify problemService.ts has no /api/research/query calls."""
    project_root = pathlib.Path(__file__).resolve().parent.parent.parent
    target_file = project_root / "web" / "src" / "services" / "problemService.ts"
    with open(target_file, "r", encoding="utf-8") as f:
        ps_text = f.read()

    assert "/api/research/query" not in ps_text, "Found stale /api/research/query endpoint in problemService.ts"
    assert "/api/connectors/search" in ps_text, "Missing canonical /api/connectors/search in problemService.ts"


def test_def001_federated_search_all_connectors(client):
    """Verify POST /api/connectors/search handles engine=ALL (connector_ids=None)."""
    resp = client.post(
        "/api/connectors/search",
        json={"query": "post-harvest rice drying losses", "limit_per_source": 2}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "query" in data
    assert "count" in data
    assert "results" in data
    assert isinstance(data["results"], list)


def test_def001_federated_search_specific_engine(client):
    """Verify POST /api/connectors/search handles specific connector_ids."""
    resp = client.post(
        "/api/connectors/search",
        json={"query": "tilapia water salinity", "limit_per_source": 2, "connector_ids": ["openalex"]}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    assert isinstance(data["results"], list)


def test_def001_empty_query_validation(client):
    """Verify empty query returns HTTP 400 with descriptive error detail."""
    resp = client.post(
        "/api/connectors/search",
        json={"query": "   ", "limit_per_source": 5}
    )
    assert resp.status_code == 400
    assert "Search query cannot be empty" in resp.json()["detail"]


def test_def001_no_alias_route(client):
    """Verify no unauthorized alias route exists at /api/research/query."""
    resp = client.post("/api/research/query", json={"query": "test"})
    assert resp.status_code == 404
