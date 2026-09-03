import pytest
import pytest_asyncio
from research_client import FreeResearchClient, extract_keywords
from storage import get_storage

def test_extract_keywords():
    text = "Post-harvest bulb onion spoilage up to 40% due to continuous seasonal humidity."
    kw = extract_keywords(text, max_words=4)
    assert "post" in kw.lower()
    assert "onion" in kw.lower()
    assert "due" not in kw.lower()

@pytest.mark.asyncio
async def test_openalex_search():
    client = FreeResearchClient(timeout=10.0)
    results = await client.search_academic_openalex("Philippines agriculture", limit=2)
    assert isinstance(results, list)
    if results:
        paper = results[0]
        assert "title" in paper
        assert "engine" in paper
        assert paper["engine"] == "OPENALEX"
        assert paper["source_tier"] == "A"

@pytest.mark.asyncio
async def test_europe_pmc_search():
    client = FreeResearchClient(timeout=10.0)
    results = await client.search_europe_pmc("Philippines rice yield", limit=2)
    assert isinstance(results, list)
    if results:
        paper = results[0]
        assert "title" in paper
        assert "engine" in paper
        assert paper["engine"] == "EUROPE_PMC"

@pytest.mark.asyncio
async def test_regional_news_search():
    client = FreeResearchClient(timeout=10.0)
    results = await client.search_regional_news("Iloilo farmers onion", limit=2)
    assert isinstance(results, list)
    if results:
        news = results[0]
        assert "title" in news
        assert "source_url" in news
        assert news["engine"] == "REGIONAL_NEWS"

@pytest.mark.asyncio
async def test_auto_research_problem():
    client = FreeResearchClient(timeout=10.0)
    res = await client.auto_research_problem({
        "problem_statement": "Cold storage deficit in Panay fish ports causing post-harvest melt",
        "sector": "Agriculture & Fisheries",
        "sufferer_location": "Estancia, Iloilo",
        "sufferer_occupation": "Small-scale Fishers"
    })
    assert "openalex" in res
    assert "europe_pmc" in res
    assert "regional_news" in res
    assert "all_combined" in res
