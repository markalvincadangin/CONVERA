"""
Unit & Integration Tests for Methodologies & Frameworks Routers
==============================================================
Governed by: CONVERA Concept Development Standard (CCDS v2.0)
Verification Protocol: SPEC-METHODOLOGY-CONTRACT-003-SDD-03
"""
import pytest
from fastapi.testclient import TestClient
from server import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.mark.unit
def test_list_methodologies_endpoint(client):
    """Verify GET /api/methodologies returns registered contracts."""
    resp = client.get("/api/methodologies")
    assert resp.status_code == 200
    data = resp.json()
    assert "methodologies" in data
    methodologies = data["methodologies"]
    assert len(methodologies) == 2
    ids = {m["id"] for m in methodologies}
    assert ids == {"INNOVATION", "RESEARCH"}

    innovation = next(m for m in methodologies if m["id"] == "INNOVATION")
    assert innovation["category"] == "INNOVATION"
    assert innovation["stage_count"] == 5
    assert innovation["gate_count"] == 3


@pytest.mark.unit
def test_get_methodology_detail_endpoint(client):
    """Verify GET /api/methodologies/{id} returns full contract structure."""
    resp = client.get("/api/methodologies/RESEARCH")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "RESEARCH"
    assert data["category"] == "RESEARCH"
    assert len(data["stages"]) == 6
    assert len(data["gates"]) == 4
    assert data["stages"][0]["icon_key"] == "Search"


@pytest.mark.unit
def test_get_methodology_not_found(client):
    """Verify GET /api/methodologies/{id} returns 404 for invalid ID."""
    resp = client.get("/api/methodologies/NON_EXISTENT")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


@pytest.mark.unit
def test_frameworks_compatibility_endpoint(client):
    """Verify backward-compatible GET /api/frameworks returns contracts data."""
    resp = client.get("/api/frameworks")
    assert resp.status_code == 200
    data = resp.json()
    assert "frameworks" in data
    assert len(data["frameworks"]) == 2


@pytest.mark.unit
def test_get_framework_compatibility_detail(client):
    """Verify backward-compatible GET /api/frameworks/{id} works seamlessly."""
    resp = client.get("/api/frameworks/INNOVATION")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "INNOVATION"
    assert len(data["stages"]) == 5
    assert len(data["gates"]) == 3
