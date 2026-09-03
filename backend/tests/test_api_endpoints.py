import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from server import app

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest.mark.asyncio
async def test_problem_bank_api_crud(client: AsyncClient):
    # 1. Create a problem
    payload = {
        "id": "API-TEST-001",
        "sector": "Agriculture & Fisheries",
        "sufferer_occupation": "Fish vendors",
        "sufferer_location": "Estancia, Iloilo",
        "problem_statement": "Post-harvest fish spoilage due to lack of cold storage",
        "evidence_tier": "DOCUMENTED",
        "workaround": "Selling at 50% discount before noon",
        "quantified_impact": "₱20,000 monthly loss per vendor",
        "sources": [
            {
                "source_name": "BFAR Western Visayas",
                "source_url": "https://www.bfar.da.gov.ph",
                "source_tier": "A",
                "quote_or_summary": "Cold storage deficit report"
            }
        ]
    }
    create_res = await client.post("/api/problems", json=payload)
    assert create_res.status_code == 200
    created = create_res.json()["problem"]
    assert created["id"] == "API-TEST-001"
    assert created["score"] > 40.0

    # 2. Get problem detail
    get_res = await client.get("/api/problems/API-TEST-001")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["sector"] == "Agriculture & Fisheries"
    assert len(fetched["sources"]) == 1

    # 3. List & Filter
    list_res = await client.get("/api/problems", params={"sector": "Agriculture & Fisheries"})
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(p["id"] == "API-TEST-001" for p in items)

    # 4. Vote
    vote_res = await client.post("/api/problems/API-TEST-001/vote", json={"vote_type": "up"})
    assert vote_res.status_code == 200
    assert vote_res.json()["problem"]["votes"] >= 1

    # 5. Score breakdown
    score_res = await client.get("/api/problems/API-TEST-001/score-breakdown")
    assert score_res.status_code == 200
    assert "dimensions" in score_res.json()

    # 6. Update problem
    update_res = await client.put("/api/problems/API-TEST-001", json={"status": "shortlisted", "notes": "High priority"})
    assert update_res.status_code == 200
    updated = update_res.json()["problem"]
    assert updated["status"] == "shortlisted"

    # 7. Delete problem
    del_res = await client.delete("/api/problems/API-TEST-001")
    assert del_res.status_code == 200


@pytest.mark.asyncio
async def test_similarity_check_api(client: AsyncClient):
    # Test checking a candidate problem statement
    res = await client.post("/api/similarity/check", json={
        "problem_statement": "Severe onion spoilage in Miagao farming communities due to lack of cold storage.",
        "sector": "Agriculture & Fisheries"
    })
    assert res.status_code == 200
    data = res.json()
    assert "overall_verdict" in data
    assert "matches" in data
    assert "is_unique" in data
