import pytest
from httpx import AsyncClient, ASGITransport
from server import app
from storage.factory import get_storage
from engines.impact_engine import (
    propagate_evidence_change,
    propagate_test_result,
)

pytestmark = pytest.mark.integration


def test_impact_propagation_cascade_and_falsification():
    storage = get_storage()
    prob_id = "IMPACT-PROB-001"
    claim_id = "IMPACT-CLM-001"
    asm_id = "IMPACT-ASM-001"
    session_id = "IMPACT-SESS-001"

    # 1. Clean up & Create Problem with Claim and Assumption
    storage.delete_problem(prob_id)
    storage.delete_session(session_id)

    storage.add_problem({
        "id": prob_id,
        "sector": "Logistics",
        "problem_statement": "High logistics overhead for inter-island produce transport",
        "claims": [
            {
                "id": claim_id,
                "claim_type": "BEHAVIORAL_EVIDENCE",
                "claim_text": "Trucking co-ops spend 30% of revenue on RoRo demurrage delays",
                "status": "HYPOTHESIS",
            }
        ],
        "assumptions": [
            {
                "id": asm_id,
                "assumption_text": "Trucking co-ops will adopt GPS queue reservation software",
                "risk_level": "HIGH",
                "status": "UNTESTED",
            }
        ],
        "sources": [
            {
                "source_name": "PPA Port Congestion Study",
                "source_url": "https://ppa.gov.ph",
                "source_tier": "A",
                "quote_or_summary": "RoRo terminal delays average 18 hours",
            }
        ]
    })

    # 2. Record a decision selecting this candidate
    storage.save_session(session_id, {"session_id": session_id, "project_name": "Test Port Logistics"})
    with storage._get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO decision_records (id, session_id, stage, selected_problem_id, decision_rationale)
            VALUES (?, ?, ?, ?, ?)
            """,
            ("DEC-TEST-001", session_id, "PHASE2_SCREENING", prob_id, "Selected due to high demurrage cost claim"),
        )

    prob = storage.get_problem(prob_id)
    source_id = prob["sources"][0]["id"]

    # 3. Trigger Contradicting Link via Impact Engine
    storage.link_claim_evidence(
        claim_id=claim_id,
        source_id=source_id,
        relation_type="CONTRADICTS",
        evidence_strength="STRONG",
        rationale="New port audit shows delays reduced to under 1 hour in 2026",
    )

    impact_res = propagate_evidence_change(
        problem_id=prob_id,
        source_id=source_id,
        relation_type="CONTRADICTS",
        storage=storage,
        session_id=session_id,
    )

    assert impact_res["has_impact"] is True
    assert impact_res["severity"] == "CRITICAL"
    assert len(impact_res["affected_decisions"]) >= 1
    assert impact_res["affected_decisions"][0]["selected_problem_id"] == prob_id
    assert impact_res["impact_event"] is not None

    # Verify active alerts listed in storage
    active_alerts = storage.list_active_impact_alerts(session_id=session_id)
    assert len(active_alerts) >= 1
    assert active_alerts[0]["severity"] == "CRITICAL"

    # 4. Record a FAILED validation test on the assumption
    storage.record_assumption_test(
        assumption_id=asm_id,
        test_type="PROTOTYPE_EXPERIMENT",
        target_metric="8/10 co-ops agree to deposit",
        actual_result="0/10 co-ops agreed to adopt",
        test_status="FAILED",
        conducted_by="Lead Founder",
    )

    test_impact = propagate_test_result(
        problem_id=prob_id,
        assumption_id=asm_id,
        test_status="FAILED",
        storage=storage,
        session_id=session_id,
    )

    assert test_impact["has_impact"] is True
    assert test_impact["test_status"] == "FAILED"
    assert len(test_impact["affected_decisions"]) >= 1

    # Check that assumption status transitioned to FALSIFIED in DB
    updated_prob = storage.get_problem(prob_id)
    target_asm = next(a for a in updated_prob["assumptions"] if a["id"] == asm_id)
    assert target_asm["status"] == "FALSIFIED"
    assert target_asm["risk_level"] == "CRITICAL"

    # Clean up
    storage.delete_problem(prob_id)
    storage.delete_session(session_id)

@pytest.mark.asyncio
async def test_knowledge_api_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Fetch active alerts endpoint
        alerts_res = await client.get("/api/knowledge/impact-alerts")
        assert alerts_res.status_code == 200
        assert "alerts" in alerts_res.json()
