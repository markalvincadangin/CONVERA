import pytest
from fastapi.testclient import TestClient
from server import app
from engines.literature_matrix import LiteratureMatrixEngine

client = TestClient(app)

@pytest.mark.live
def test_literature_matrix_engine():
    engine = LiteratureMatrixEngine()
    sample_sources = [
        {
            "id": "openalex_w123",
            "title": "Deep learning models for early pest detection in onion crops",
            "authors": ["Santos, J.", "Reyes, M.", "Dela Cruz, A."],
            "year": 2024,
            "venue": "IEEE Access",
            "abstract": "We developed a lightweight CNN to address early pest detection. Results show that our model achieves 94% accuracy. However, this study is limited to laboratory datasets without edge deployment.",
            "doi": "10.1109/ACCESS.2024.123456"
        },
        {
            "id": "crossref_c456",
            "title": "IoT edge sensor architectures for agricultural moisture monitoring",
            "authors": ["Tan, K.", "Lee, H."],
            "year": 2023,
            "venue": "Computers and Electronics in Agriculture",
            "abstract": "This study implemented an edge gateway using LoRaWAN to address rural connectivity constraints. Demonstrated that battery life extends by 40%. Future work includes tropical weather resilience.",
            "doi": "10.1016/j.compag.2023.78910"
        }
    ]

    res = engine.build_literature_matrix(sample_sources)
    assert res["total_studies"] == 2
    assert len(res["matrix_rows"]) == 2
    assert res["matrix_rows"][0]["study_citation"].startswith("Santos, J.")
    assert len(res["synthesized_gaps"]) >= 1

@pytest.mark.live
def test_research_matrix_endpoints():
    res = client.post("/api/research/matrix/generate", json={"query": "edge computing pest detection", "limit": 4})
    assert res.status_code == 200
    data = res.json()
    assert "matrix_rows" in data
    assert "synthesized_gaps" in data

    gaps_res = client.post("/api/research/gaps/synthesize", json={"query": "edge computing pest detection"})
    assert gaps_res.status_code == 200
    assert gaps_res.json()["count"] >= 1
