import pytest
import pytest_asyncio
from storage import get_storage
from engines.assumption_engine import extract_claims_and_assumptions


pytestmark = pytest.mark.integration
def test_knowledge_graph_storage():
    storage = get_storage()
    sess = storage.save_session("sess_kg_test", {"project_name": "KG Test Project"})
    pid = sess.get("project_id", "proj_sess_kg_test")
    prob = storage.get_problem("HOU-001")
    if not prob:
        storage.add_problem({
            "id": "HOU-001",
            "project_id": pid,
            "session_id": "sess_kg_test",
            "sector": "Housing & Utilities",
            "sufferer_occupation": "Homeowners",
            "sufferer_location": "Jaro, Iloilo City",
            "problem_statement": "Severe localized flooding during monsoons.",
            "evidence_tier": "DOCUMENTED"
        })
        prob = storage.get_problem("HOU-001")
    assert prob is not None
    
    # Test setting claims
    claims = [
        {
            "id": "CLM-HOU-001-1",
            "claim_type": "FRICTION_REALITY",
            "claim_text": "Jaro residents experience severe monsoonal flooding.",
            "status": "VALIDATED",
            "confidence_score": 90.0,
            "mode": "COMMERCIAL",
            "evidence_notes": "Corroborated by Journal of Clinical Epidemiology"
        },
        {
            "id": "CLM-HOU-001-2",
            "claim_type": "ADOPTION_COMMITMENT",
            "claim_text": "Homeowners are willing to adopt automated flood telemetry.",
            "status": "HYPOTHESIS",
            "confidence_score": 45.0,
            "mode": "COMMERCIAL",
            "evidence_notes": "Pending Mom Test validation"
        }
    ]
    storage.set_problem_claims("HOU-001", claims)
    
    # Test setting assumptions
    assumptions = [
        {
            "id": "ASM-HOU-001-1",
            "assumption_text": "Homeowners have power backup to keep telemetry alive during typhoons.",
            "risk_level": "CRITICAL",
            "status": "UNTESTED",
            "origin": "DEVILS_ADVOCATE",
            "testable_question": "During the last brownout, how did you monitor local river levels?"
        }
    ]
    storage.set_problem_assumptions("HOU-001", assumptions)
    
    # Retrieve Knowledge Graph
    kg = storage.get_problem_knowledge_graph("HOU-001")
    assert "claims" in kg
    assert "assumptions" in kg
    assert len(kg["claims"]) == 2
    assert len(kg["assumptions"]) == 1
    assert kg["claims"][0]["status"] == "VALIDATED"
    
    # Test claim update
    updated_claim = storage.update_claim_status("CLM-HOU-001-2", "SUPPORTED", confidence_score=75.0)
    assert updated_claim["status"] == "SUPPORTED"
    assert updated_claim["confidence_score"] == 75.0
    
    # Test assumption update
    updated_asm = storage.update_assumption_status("ASM-HOU-001-1", "IN_TESTING")
    assert updated_asm["status"] == "IN_TESTING"

@pytest.mark.asyncio
async def test_assumption_extraction_engine():
    problem = {
        "id": "TEST-001",
        "problem_statement": "Post-harvest onion rot in Miagao due to humidity.",
        "sufferer_occupation": "Bulb onion farmers",
        "sufferer_location": "Miagao, Iloilo",
        "workaround": "Roadside solar drying",
        "quantified_impact": "35% crop spoilage per wet season",
        "devils_advocate_data": "High Capex for cold storage makes individual farmer purchase impossible."
    }
    
    res = await extract_claims_and_assumptions(problem, mode="COMMERCIAL")
    assert "claims" in res
    assert "assumptions" in res
    assert len(res["claims"]) == 4
    assert len(res["assumptions"]) >= 2
    
    # Verify claims have standard 4 types
    types = [c["claim_type"] for c in res["claims"]]
    assert "FRICTION_REALITY" in types
    assert "FREQUENCY_CONSEQUENCE" in types
    assert "WORKAROUND_DISSATISFACTION" in types
    assert "ADOPTION_COMMITMENT" in types
    
    # Verify Mom Test question exists on assumptions
    assert "testable_question" in res["assumptions"][0]
