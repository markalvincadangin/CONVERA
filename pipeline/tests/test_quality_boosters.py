import pytest
from unittest.mock import patch, AsyncMock
from engines.devils_advocate import challenge_problem_with_agent
from engines.blind_spot_detector import detect_portfolio_blind_spots

@pytest.mark.asyncio
async def test_challenge_problem_with_agent():
    mock_llm_json = """
    {
      "problem_id": "TEST-01",
      "plausibility_score": 65,
      "verdict": "VULNERABLE",
      "assumption_attacks": ["Assumes midwives lack emergency phones"],
      "evidence_gaps": ["No data from Miagao RHU"],
      "fatal_kill_question": "Why hasn't the LGU ambulance service responded?",
      "status_quo_inertia": "Families rely on neighbors",
      "hardened_reframing": "Lack of rapid rural ambulance dispatch protocol",
      "recommended_field_action": "Interview Miagao municipal health officer"
    }
    """
    with patch("engines.devils_advocate.generate_response_with_fallback", new=AsyncMock(return_value=mock_llm_json)):
        critique = await challenge_problem_with_agent({
            "id": "TEST-01",
            "sector": "Health & Wellness",
            "problem_statement": "Delayed obstetric transport",
        })
        assert critique["problem_id"] == "TEST-01"
        assert critique["plausibility_score"] == 65
        assert len(critique["assumption_attacks"]) == 1
        assert "fatal_kill_question" in critique

@pytest.mark.asyncio
async def test_detect_portfolio_blind_spots():
    mock_blind_json = """
    {
      "total_problems_analyzed": 2,
      "sector_distribution": {"Health & Wellness": 2},
      "coverage_rating": "CRITICAL_GAPS",
      "identified_blind_spots": [
        {
          "area": "Agriculture & Fisheries",
          "severity": "HIGH",
          "observation": "Zero problems in agriculture",
          "why_it_matters": "Iloilo is 60% agricultural economy"
        }
      ],
      "cognitive_biases_flagged": [
        {"bias_type": "Availability Bias", "manifestation": "Health over-indexing"}
      ],
      "suggested_explorations": []
    }
    """
    with patch("engines.blind_spot_detector.generate_response_with_fallback", new=AsyncMock(return_value=mock_blind_json)):
        analysis = await detect_portfolio_blind_spots([
            {"id": "HW-01", "sector": "Health & Wellness"},
            {"id": "HW-02", "sector": "Health & Wellness"}
        ])
        assert analysis["coverage_rating"] == "CRITICAL_GAPS"
        assert len(analysis["identified_blind_spots"]) == 1
