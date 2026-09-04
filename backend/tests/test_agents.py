import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient, ASGITransport
from server import app

from agents.research_agent import execute_research_agent
from agents.critic_agent import execute_critic_agent
from agents.verifier_agent import execute_verifier_agent
from connectors.base import NormalizedScholarlyWork, ProvenanceMetadata


pytestmark = pytest.mark.unit
@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.asyncio
async def test_research_agent_execution():
    mock_papers = [
        NormalizedScholarlyWork(
            doi="10.1016/j.foodsys.2024.01",
            title="Cold Chain Deficits in Municipal Fisheries",
            authors=["Santos M", "Reyes D"],
            year=2024,
            venue="Journal of Agricultural Food Systems",
            citation_count=45,
            abstract="Post-harvest fish spoilage reaches 35% in Western Visayas due to transport delays.",
            provenance=ProvenanceMetadata(source_name="OpenAlex")
        )
    ]
    
    mock_llm_json = """
    {
      "synthesized_summary": "High consensus that cold storage deficits cause 35% spoilage in rural fisheries.",
      "macro_statistics": ["35% post-harvest loss in Western Visayas"],
      "extracted_claims": [
        {
          "claim_text": "Post-harvest fish spoilage reaches 35% in Western Visayas due to transport delays.",
          "claim_type": "FRICTION_REALITY",
          "evidence_tier": "VALIDATION_EVIDENCE",
          "evidence_strength": "STRONG",
          "ai_confidence": 0.95,
          "supporting_quote": "Post-harvest fish spoilage reaches 35% in Western Visayas",
          "doi": "10.1016/j.foodsys.2024.01"
        }
      ],
      "contradictions_found": [],
      "recommended_next_queries": ["Cold chain solar refrigeration Panay"]
    }
    """
    
    with patch("connectors.hub.connector_hub.federated_search", new=AsyncMock(return_value=mock_papers)):
        with patch("agents.research_agent.generate_response_with_fallback", new=AsyncMock(return_value=mock_llm_json)):
            report = await execute_research_agent(
                query="Post-harvest fish spoilage",
                sector="Agriculture & Fisheries",
                location="Iloilo"
            )
            assert report.query == "Post-harvest fish spoilage"
            assert report.sources_discovered == 1
            assert len(report.evidence_candidates) == 1
            assert report.evidence_candidates[0].claim_type == "FRICTION_REALITY"
            assert "35% post-harvest loss" in report.macro_statistics[0]

@pytest.mark.asyncio
async def test_critic_agent_execution():
    mock_critic_json = """
    {
      "plausibility_score": 62,
      "verdict": "VULNERABLE",
      "fatal_kill_question": "Why hasn't the local municipal government funded ice plant transport subsidies?",
      "status_quo_inertia": "Fishermen sell catch immediately at deep discounts rather than buying cold units.",
      "assumption_attacks": ["Assumes fishermen have upfront capital for monthly subscriptions"],
      "cognitive_biases_flagged": ["Solution-Premature Bias"],
      "evidence_gaps": ["No interviews with Concepcion fish brokers"],
      "hardened_reframing": "Municipal fishers lack decentralized chilling at landing docks, forcing distress pricing.",
      "recommended_field_action": "Interview 5 fish brokers at Concepcion port at 5:00 AM."
    }
    """
    
    with patch("agents.critic_agent.generate_response_with_fallback", new=AsyncMock(return_value=mock_critic_json)):
        critique = await execute_critic_agent(
            problem_statement="Fish spoilage due to lack of ice plants",
            sector="Agriculture & Fisheries",
            target_user="Municipal Fishermen"
        )
        assert critique.plausibility_score == 62
        assert critique.verdict == "VULNERABLE"
        assert "fatal_kill_question" in critique.model_dump()
        assert len(critique.assumption_attacks) == 1

@pytest.mark.asyncio
async def test_verifier_agent_execution():
    mock_verifier_json = """
    {
      "verification_verdict": "PLAUSIBLE_SUPPORTED",
      "evidence_strength": "STRONG",
      "confidence_score": 0.92,
      "methodology_audit": "Peer-reviewed survey of 120 smallholder vessels with quantified empirical loss data.",
      "contradictions": []
    }
    """
    
    mock_crossref_work = NormalizedScholarlyWork(
        doi="10.1016/j.heliyon.2023.e19482",
        title="Postharvest loss assessment in small-scale fisheries",
        venue="Heliyon",
        citation_count=12,
        provenance=ProvenanceMetadata(source_name="Crossref")
    )
    
    with patch("connectors.crossref_connector.CrossrefConnector.fetch_by_id", new=AsyncMock(return_value=mock_crossref_work)):
        with patch("agents.verifier_agent.generate_response_with_fallback", new=AsyncMock(return_value=mock_verifier_json)):
            verif = await execute_verifier_agent(
                claim_text="Smallholder vessels lose 30-40% of fish before reaching provincial market.",
                doi="10.1016/j.heliyon.2023.e19482"
            )
            assert verif.citation_valid is True
            assert verif.verification_verdict == "PLAUSIBLE_SUPPORTED"
            assert verif.evidence_strength == "STRONG"
            assert verif.verified_source_title == "Postharvest loss assessment in small-scale fisheries"
