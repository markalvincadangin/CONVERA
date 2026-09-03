from evidence_scorer import calculate_score_breakdown

def test_evidence_scorer_high_confidence():
    problem = {
        "id": "HW-001",
        "sector": "Health & Wellness",
        "sufferer_occupation": "Pregnant women in rural areas",
        "sufferer_location": "Miagao, Iloilo",
        "problem_statement": "Delayed emergency obstetric transport causes fatal risks",
        "evidence_tier": "STRONGLY_DOCUMENTED",
        "workaround": "Hiring private tricycles at ₱1,500 emergency fare to travel to Guimbal hospital",
        "quantified_impact": "₱15,000 yearly emergency expenses and 3-hour transfer delays",
        "evidence_types": ["Official", "News"],
        "sources": [
            {
                "source_name": "PSA",
                "source_url": "https://psa.gov.ph",
                "source_tier": "A",
                "evidence_type": "Official Statistic"
            },
            {
                "source_name": "Panay News",
                "source_url": "https://www.panaynews.net",
                "source_tier": "B",
                "evidence_type": "News Report"
            }
        ]
    }

    breakdown = calculate_score_breakdown(problem, problem["sources"])
    assert breakdown["total_score"] >= 80.0
    assert breakdown["confidence"] == "HIGH"
    assert "dimensions" in breakdown
    assert breakdown["dimensions"]["source_tier_quality"]["score"] == 25.0
    assert breakdown["dimensions"]["quantified_impact"]["score"] == 20.0
    assert breakdown["dimensions"]["geographic_precision"]["score"] == 15.0

def test_evidence_scorer_weak_confidence():
    weak_problem = {
        "id": "GEN-001",
        "sector": "General",
        "sufferer_occupation": "People",
        "sufferer_location": "Philippines",
        "problem_statement": "Bad service",
        "evidence_tier": "SIGNAL",
        "workaround": "",
        "quantified_impact": "",
        "sources": []
    }

    breakdown = calculate_score_breakdown(weak_problem, [])
    assert breakdown["total_score"] < 40.0
    assert breakdown["confidence"] == "WEAK"
    assert len(breakdown["recommendations"]) >= 3
