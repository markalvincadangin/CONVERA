import pytest
import asyncio
from connectors.base import BaseConnector, NormalizedScholarlyWork, ProvenanceMetadata, EvidenceCandidate
from connectors.openalex_connector import OpenAlexConnector
from connectors.semantic_scholar_connector import SemanticScholarConnector
from connectors.crossref_connector import CrossrefConnector
from connectors.pubmed_connector import PubMedConnector
from connectors.hub import ConnectorHub, connector_hub


def test_connector_hub_registry():
    hub = ConnectorHub()
    conn_list = asyncio.run(hub.list_connectors())
    assert len(conn_list) >= 3
    ids = {c["connector_id"] for c in conn_list}
    assert "openalex" in ids
    assert "semantic_scholar" in ids
    assert "crossref" in ids
    assert "pubmed" in ids


def test_openalex_normalization():
    conn = OpenAlexConnector()
    mock_data = {
        "id": "https://openalex.org/W12345",
        "doi": "https://doi.org/10.1145/12345.67890",
        "title": "Design Science Research in Information Systems",
        "publication_year": 2024,
        "cited_by_count": 42,
        "authorships": [
            {"author": {"display_name": "Alan Hevner"}},
            {"author": {"display_name": "Salvatore March"}}
        ],
        "primary_location": {
            "source": {"display_name": "MIS Quarterly"}
        },
        "abstract_inverted_index": {
            "Design": [0],
            "science": [1],
            "creates": [2],
            "artifacts": [3]
        },
        "open_access": {
            "is_oa": True,
            "oa_url": "https://example.org/hevner2024.pdf"
        }
    }
    work = conn._normalize_work(mock_data)
    assert work.title == "Design Science Research in Information Systems"
    assert work.doi == "10.1145/12345.67890"
    assert work.year == 2024
    assert work.authors == ["Alan Hevner", "Salvatore March"]
    assert work.venue == "MIS Quarterly"
    assert work.citation_count == 42
    assert work.abstract == "Design science creates artifacts"
    assert work.open_access_pdf_url == "https://example.org/hevner2024.pdf"
    assert work.provenance.source_name == "OpenAlex Scholarly Graph"


def test_crossref_normalization():
    conn = CrossrefConnector()
    mock_item = {
        "DOI": "10.1016/j.jss.2023.111800",
        "URL": "http://dx.doi.org/10.1016/j.jss.2023.111800",
        "title": ["Empirical Evaluation of Software Architecture Traceability"],
        "author": [
            {"given": "Jane", "family": "Doe"},
            {"given": "John", "family": "Smith"}
        ],
        "published": {"date-parts": [[2023, 10, 15]]},
        "container-title": ["Journal of Systems and Software"],
        "is-referenced-by-count": 18
    }
    work = conn._normalize_work(mock_item)
    assert work.title == "Empirical Evaluation of Software Architecture Traceability"
    assert work.doi == "10.1016/j.jss.2023.111800"
    assert work.authors == ["Jane Doe", "John Smith"]
    assert work.year == 2023
    assert work.venue == "Journal of Systems and Software"
    assert work.citation_count == 18


def test_federated_search_deduplication():
    hub = ConnectorHub()
    
    # Custom mock connector A
    class MockConnA(BaseConnector):
        @property
        def connector_id(self): return "mock_a"
        @property
        def display_name(self): return "Mock A"
        @property
        def capabilities(self): return ["SEARCH"]
        async def search(self, query, limit=5, **kwargs):
            return [
                NormalizedScholarlyWork(
                    doi="10.1109/test.001",
                    title="Distributed Consensus in Edge Computing",
                    authors=["Alice"],
                    citation_count=50,
                    provenance=ProvenanceMetadata(source_name="Mock A")
                )
            ]
        async def fetch_by_id(self, id): return None
        async def health_check(self): return {"status": "HEALTHY"}

    # Custom mock connector B (returns same paper + new paper)
    class MockConnB(BaseConnector):
        @property
        def connector_id(self): return "mock_b"
        @property
        def display_name(self): return "Mock B"
        @property
        def capabilities(self): return ["SEARCH"]
        async def search(self, query, limit=5, **kwargs):
            return [
                NormalizedScholarlyWork(
                    doi="10.1109/test.001",  # duplicate DOI
                    title="Distributed Consensus in Edge Computing (Duplicate)",
                    authors=["Alice"],
                    citation_count=50,
                    provenance=ProvenanceMetadata(source_name="Mock B")
                ),
                NormalizedScholarlyWork(
                    doi="10.1109/test.002",
                    title="Zero-Knowledge Proofs for IoT",
                    authors=["Bob"],
                    citation_count=80,
                    provenance=ProvenanceMetadata(source_name="Mock B")
                )
            ]
        async def fetch_by_id(self, id): return None
        async def health_check(self): return {"status": "HEALTHY"}

    hub._connectors = {"mock_a": MockConnA(), "mock_b": MockConnB()}
    results = asyncio.run(hub.federated_search("computing"))
    
    # Must contain exactly 2 deduplicated works, sorted by citation count descending
    assert len(results) == 2
    assert results[0].doi == "10.1109/test.002"  # 80 citations
    assert results[1].doi == "10.1109/test.001"  # 50 citations


def test_pubmed_normalization():
    conn = PubMedConnector()
    mock_summary = {
        "uid": "38123456",
        "title": "Cold Chain Logistics and Post-Harvest Losses in Rural Agriculture.",
        "pubdate": "2024 Jan 15",
        "authors": [
            {"name": "Santos M"},
            {"name": "Reyes D"}
        ],
        "source": "Journal of Agricultural Food Systems",
        "articleids": [
            {"idtype": "pubmed", "value": "38123456"},
            {"idtype": "doi", "value": "10.1016/j.jafs.2024.01.005"}
        ]
    }
    work = conn.normalize(mock_summary)
    assert work.doi == "10.1016/j.jafs.2024.01.005"
    assert work.title == "Cold Chain Logistics and Post-Harvest Losses in Rural Agriculture"
    assert work.authors == ["Santos M", "Reyes D"]
    assert work.year == 2024
    assert work.venue == "Journal of Agricultural Food Systems"
    assert "PubMed" in work.provenance.source_name
