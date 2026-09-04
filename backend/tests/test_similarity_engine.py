import pytest
from engines.similarity_engine import calculate_similarity, check_portfolio_similarity


pytestmark = pytest.mark.unit
def test_similarity_identical_and_close_statements():
    s1 = "Post-harvest fish spoilage in Concepcion Iloilo due to lack of ice plants and cold chain."
    s2 = "Post-harvest fish spoilage in Northern Iloilo caused by lack of cold chain infrastructure."
    
    score = calculate_similarity(s1, s2, candidate_sector="Agriculture & Fisheries", target_sector="Agriculture & Fisheries")
    assert score >= 0.65  # High similarity
    
def test_similarity_different_statements():
    s1 = "High maternal mortality in mountainous barangays due to delayed transport."
    s2 = "Manual inventory tracking causes stockouts in retail sari-sari stores."
    
    score = calculate_similarity(s1, s2, candidate_sector="Health", target_sector="Retail")
    assert score <= 0.20  # Low similarity

def test_check_portfolio_similarity_duplicate_and_unique():
    portfolio = [
        {"id": "AGR-001", "sector": "Agriculture & Fisheries", "problem_statement": "Post-harvest onion spoilage in Miagao due to high humidity."},
        {"id": "HEA-001", "sector": "Health & Wellness", "problem_statement": "Delayed emergency ambulance transport across rural Panay."}
    ]
    
    # Test candidate that is duplicate/similar to AGR-001
    cand_dup = {
        "id": "CAND-01",
        "sector": "Agriculture & Fisheries",
        "problem_statement": "Post-harvest onion spoilage and rot in Miagao farm storages."
    }
    res_dup = check_portfolio_similarity(cand_dup, portfolio)
    assert res_dup["overall_verdict"] in ["DUPLICATE", "POTENTIALLY_SIMILAR"]
    assert len(res_dup["matches"]) >= 1
    assert res_dup["matches"][0]["problem_id"] == "AGR-001"
    
    # Test candidate that is completely unique
    cand_uniq = {
        "id": "CAND-02",
        "sector": "Education",
        "problem_statement": "Lack of offline interactive coding curriculum for high school teachers."
    }
    res_uniq = check_portfolio_similarity(cand_uniq, portfolio)
    assert res_uniq["overall_verdict"] == "UNIQUE"
    assert res_uniq["is_unique"] is True
