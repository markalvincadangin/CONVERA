import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from server import app

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest.mark.asyncio
async def test_stage_a_discover_endpoint(client: AsyncClient):
    payload = {
        "domains": ["Precision Agriculture & Edge AI", "Disaster Mesh Networks"],
        "field_observations": "Farmers in Miagao experience high sensor failure in rice paddies.",
        "project_id": "test_proj_research"
    }
    response = await client.post("/api/research/stage-a/discover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "success"
    assert "raw_output" in data
    assert isinstance(data.get("discovered_problems"), list)
    assert data.get("domains") == ["Precision Agriculture & Edge AI", "Disaster Mesh Networks"]

@pytest.mark.asyncio
async def test_stage_a_discover_empty_domains(client: AsyncClient):
    payload = {
        "domains": [],
        "field_observations": "Testing telemetry drop.",
        "project_id": "test_proj_research"
    }
    response = await client.post("/api/research/stage-a/discover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "success"