import pytest
from storage.factory import get_storage
from engines.knowledge_lifecycle import (
    compute_claim_epistemic_balance,
    get_problem_epistemic_tree,
)

pytestmark = pytest.mark.unit


def test_claim_epistemic_balance_and_lifecycle():
    storage = get_storage()
    prob_id = "EPIS-PROB-001"
    claim_id = "EPIS-CLM-001"

    # 1. Clean up & Create test problem with claim
    storage.delete_problem(prob_id)
    prob = storage.add_problem({
        "id": prob_id,
        "sector": "Agriculture & Fisheries",
        "problem_statement": "Post-harvest cold chain deficit in onion farming",
        "claims": [
            {
                "id": claim_id,
                "claim_type": "FRICTION_REALITY",
                "claim_text": "Farmers lose 40% of harvest within 30 days due to lack of cold storage",
                "status": "HYPOTHESIS",
            }
        ],
        "sources": [
            {
                "source_name": "DA Region VI Report",
                "source_url": "https://da.gov.ph",
                "source_tier": "A",
                "quote_or_summary": "40% post-harvest loss verified",
            },
            {
                "source_name": "Private Cold Storage Survey 2025",
                "source_url": "https://agri-survey.com",
                "source_tier": "A",
                "quote_or_summary": "Storage availability is adequate in northern districts",
            }
        ]
    })

    # Fetch sources from DB to get assigned integer IDs
    created_prob = storage.get_problem(prob_id)
    sources = created_prob.get("sources", [])
    assert len(sources) >= 2
    src_support = sources[0]["id"]
    src_contradict = sources[1]["id"]

    # Initial balance with no links
    init_balance = compute_claim_epistemic_balance(claim_id, storage)
    assert init_balance["epistemic_status"] == "HYPOTHESIS"
    assert init_balance["net_score"] == 0.0

    # 2. Add Supporting Link (Tier A, Strong = +3.0)
    storage.link_claim_evidence(
        claim_id=claim_id,
        source_id=src_support,
        relation_type="SUPPORTS",
        evidence_strength="STRONG",
        rationale="Official regional government baseline"
    )

    sup_balance = compute_claim_epistemic_balance(claim_id, storage)
    assert sup_balance["epistemic_status"] == "SUPPORTED"
    assert sup_balance["net_score"] == 3.0
    assert sup_balance["supporting_count"] == 1

    # 3. Add Contradicting Link (Tier A, Strong = -3.0)
    storage.link_claim_evidence(
        claim_id=claim_id,
        source_id=src_contradict,
        relation_type="CONTRADICTS",
        evidence_strength="STRONG",
        rationale="Contradicts deficit claim in northern districts"
    )

    contra_balance = compute_claim_epistemic_balance(claim_id, storage)
    assert contra_balance["epistemic_status"] == "CONTRADICTED"
    assert contra_balance["net_score"] == 0.0
    assert contra_balance["contradicting_count"] == 1

    # 4. Check epistemic tree retrieval
    tree = get_problem_epistemic_tree(prob_id, storage)
    assert tree["problem_id"] == prob_id
    assert len(tree["claims"]) == 1
    assert tree["claims"][0]["epistemic_balance"]["epistemic_status"] == "CONTRADICTED"

    # Clean up
    storage.delete_problem(prob_id)
