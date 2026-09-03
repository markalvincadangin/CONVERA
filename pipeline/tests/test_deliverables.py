import pytest
from unittest.mock import patch, AsyncMock
from deliverables_generator import generate_lean_canvas, generate_swot_analysis, generate_pitch_deck

@pytest.mark.asyncio
async def test_generate_lean_canvas():
    mock_canvas = """
    {
      "project_name": "Panay Cold Chain",
      "problem": {"top_frictions": ["Ice spoilage"], "existing_alternatives": ["Middlemen"]},
      "customer_segments": {"target_customers": ["Fishermen"], "early_adopters": ["Concepcion port"]},
      "unique_value_proposition": {"headline": "Solar crushed ice on demand", "high_level_concept": "Uber for Ice"},
      "solution": {"core_mechanisms": ["Micro-cold storage hub"]},
      "channels": {"distribution_paths": ["Fisherfolk cooperatives"]},
      "revenue_streams": {"monetization_model": "Per kilo ice fee", "pricing_structure": "₱3.50/kg"},
      "cost_structure": {"fixed_costs": ["Solar hub"], "variable_costs": ["Maintenance"]},
      "key_metrics": {"primary_metric": "Daily ice off-take", "empirical_phase5_proof": "42% conversion in pilot"},
      "unfair_advantage": {"moat_description": "First-mover municipal docking contract"}
    }
    """
    with patch("deliverables_generator.generate_response_with_fallback", new=AsyncMock(return_value=mock_canvas)):
        canvas = await generate_lean_canvas({"project_name": "Panay Cold Chain"})
        assert canvas["project_name"] == "Panay Cold Chain"
        assert "problem" in canvas
        assert "unique_value_proposition" in canvas

@pytest.mark.asyncio
async def test_generate_swot_analysis():
    mock_swot = """
    {
      "strengths": ["Proprietary solar ice tech"],
      "weaknesses": ["Capital intensive hardware"],
      "opportunities": ["Expansion to Estancia port"],
      "threats": ["Diesel ice distributor price war"],
      "competitor_grid": [
        {
          "competitor_name": "Commercial Diesel Ice Plant",
          "competitor_type": "Incumbent",
          "their_advantage": "High volume capacity",
          "our_differentiation": "Zero transit melt loss at municipal port"
        }
      ],
      "strategic_recommendations": ["Lock 1-year co-op supply agreement"]
    }
    """
    with patch("deliverables_generator.generate_response_with_fallback", new=AsyncMock(return_value=mock_swot)):
        swot = await generate_swot_analysis({"project_name": "Panay Cold Chain"})
        assert len(swot["strengths"]) == 1
        assert len(swot["competitor_grid"]) == 1

@pytest.mark.asyncio
async def test_generate_pitch_deck():
    mock_deck = """
    {
      "presentation_title": "Panay Cold Chain Tech",
      "tagline": "Stopping Fish Spoilage in Northern Iloilo",
      "slides": [
        {
          "slide_number": 1,
          "title": "Title Slide",
          "headline": "Empowering Municipal Fishermen",
          "bullet_points": ["Concepcion, Iloilo", "Solar Ice"],
          "speaker_notes": "Good morning judges..."
        }
      ]
    }
    """
    with patch("deliverables_generator.generate_response_with_fallback", new=AsyncMock(return_value=mock_deck)):
        deck = await generate_pitch_deck({"project_name": "Panay Cold Chain"})
        assert len(deck["slides"]) == 1
        assert deck["slides"][0]["title"] == "Title Slide"
