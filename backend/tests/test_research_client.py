import pytest
import pytest_asyncio
from engines.research_client import FreeResearchClient, extract_keywords
from storage import get_storage

@pytest.mark.unit
def test_extract_keywords():
    text = "Post-harvest bulb onion spoilage up to 40% due to continuous seasonal humidity."
    kw = extract_keywords(text, max_words=4)
    assert "post" in kw.lower()
    assert "onion" in kw.lower()
    assert "due" not in kw.lower()

@pytest.mark.asyncio
@pytest.mark.live
@pytest.mark.smoke
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
@pytest.mark.live
@pytest.mark.smoke
async def test_crossref_search():
    client = FreeResearchClient(timeout=10.0)
    results = await client.search_crossref("Iloilo flood disaster", limit=2)
    assert isinstance(results, list)
    if results:
        paper = results[0]
        assert "title" in paper
        assert "engine" in paper
        assert paper["engine"] == "CROSSREF"
        assert paper["source_tier"] == "A"

@pytest.mark.asyncio
@pytest.mark.live
@pytest.mark.smoke
async def test_europe_pmc_search():
    client = FreeResearchClient(timeout=10.0)
    results = await client.search_europe_pmc("Philippines rice yield", limit=2)
    assert isinstance(results, list)
    if results:
        paper = results[0]
        assert "title" in paper
        assert "engine" in paper

@pytest.mark.asyncio
@pytest.mark.live
async def test_auto_research_problem():
    client = FreeResearchClient(timeout=12.0)
    res = await client.auto_research_problem({
        "problem_statement": "Severe localized flooding during heavy monsoons in Jaro and Mandurriao Districts, Iloilo City.",
        "sector": "Housing & Utilities",
        "sufferer_location": "Jaro and Mandurriao Districts, Iloilo City",
        "sufferer_occupation": "Residential Homeowners"
    })
    assert "openalex" in res
    assert "crossref" in res
    assert "all_combined" in res
