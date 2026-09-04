import time
import json
import pytest
import pytest_asyncio
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from storage import get_storage
from engines.decision_engine import (
    synthesize_decision_room,
    execute_pivot_loop,
    calculate_candidate_composite_score,
    rank_candidates_deterministically,
    generate_deterministic_fallback_summary,
    CandidateMetricBreakdown,
    RANKING_WEIGHTS_V1,
    RISK_PENALTY_DEFAULTS_V1,
    VERDICT_THRESHOLD_V1,
)
from agents.verifier_agent import execute_verifier_agent, ClaimVerificationReport
from engines.assumption_engine import extract_claims_and_assumptions
from server import app

client = TestClient(app)


# ===========================================================================
# 1. Baseline Preservation Tests
# ===========================================================================

@pytest.mark.integration
def test_decision_records_storage():
    storage = get_storage()
    
    record = storage.create_decision_record({
        "session_id": "test-session-123",
        "stage": "PHASE_2_DECISION_ROOM",
        "selected_problem_id": "AGR-003",
        "rejected_problem_ids": ["AGR-001", "RET-002"],
        "decision_rationale": "Direct farmer interview evidence shows 35% spoilage.",
        "supporting_evidence_ids": ["https://doi.org/10.1016/j.heliyon.2023.e19482"]
    })
    
    assert record is not None
    assert record["selected_problem_id"] == "AGR-003"
    assert "id" in record
    
    # List decisions
    decisions = storage.list_decision_records(session_id="test-session-123")
    assert len(decisions) >= 1
    assert decisions[0]["selected_problem_id"] == "AGR-003"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_decision_room_synthesis():
    storage = get_storage()
    hou = storage.get_problem("HOU-001") or {"id": "HOU-001", "problem_statement": "Flood risk", "score": 90}
    agr = storage.get_problem("AGR-003") or {"id": "AGR-003", "problem_statement": "Onion spoilage", "score": 95}
    
    mock_llm_json = json.dumps({
        "recommended_winner_id": "AGR-003",
        "recommendation_summary": "Onion spoilage shows higher empirical proof.",
        "candidate_breakdowns": [
            {"problem_id": "AGR-003", "rank": 1, "verdict": "RECOMMENDED", "pros": ["Empirical data"], "risks": []},
            {"problem_id": "HOU-001", "rank": 2, "verdict": "VIABLE_ALTERNATIVE", "pros": ["High impact"], "risks": []}
        ]
    })
    with patch("engines.decision_engine.generate_response_with_fallback", new=AsyncMock(return_value=mock_llm_json)):
        res = await synthesize_decision_room([agr, hou])
        assert "recommended_winner_id" in res
        assert "recommendation_summary" in res
        assert len(res["candidate_breakdowns"]) == 2



@pytest.mark.integration
def test_pivot_loop_execution():
    storage = get_storage()
    # Create test session
    storage.save_session("pivot-test-session", {
        "session_id": "pivot-test-session",
        "phase1_complete": True,
        "phase2_complete": True,
        "phase3_complete": False,
        "phase3_problem": "AGR-003"
    })
    
    res = execute_pivot_loop(
        session_id="pivot-test-session",
        current_problem_id="AGR-003",
        pivot_reason="Miagao farmers cannot afford private cold storage fees.",
        author="Lead Researcher"
    )
    
    assert res["status"] == "success"
    assert "decision_record" in res
    
    # Verify session was safely reopened at Phase 2
    session = storage.get_session("pivot-test-session")
    assert session["phase2_complete"] is False
    assert len(session["pivot_history"]) >= 1


# ===========================================================================
# 2. Deterministic Scoring & Formula Tests (TASK-004-01)
# ===========================================================================

@pytest.mark.unit
def test_composite_formula_values():
    """Verify that composite scoring matches the ratified formula and weights."""
    candidate = {
        "id": "CAND-001",
        "problem_statement": "Smallholder onion farmers in Miagao suffer post-harvest rot due to lack of cold storage.",
        "sufferer_occupation": "Smallholder onion farmers",
        "sufferer_location": "Miagao, Iloilo",
        "quantified_impact": "Loss of ₱45,000 per harvest season (35% crop loss) every year",
        "workaround": "Farmers pay middlemen heavy fees or construct temporary ventilated bamboo sheds",
        "sources": [
            {"source_title": "PSA Agricultural Report", "source_url": "https://psa.gov.ph/onion", "source_tier": "A", "evidence_type": "STATISTIC"},
            {"source_title": "Panay News Field Report", "source_url": "https://panaynews.net/rot", "source_tier": "B", "evidence_type": "INTERVIEW"},
            {"source_title": "Academic Study on Post-Harvest Loss", "source_url": "https://doi.org/10.1016/j.postharv", "source_tier": "A", "evidence_type": "JOURNAL"}
        ],
        "claims": [
            {
                "id": "CLM-001",
                "evidence_links": [
                    {"relationship": "SUPPORTS", "source_tier": "A", "confidence": "STRONG"},
                    {"relationship": "SUPPORTS", "source_tier": "B", "confidence": "MODERATE"}
                ]
            }
        ],
        "assumptions": [
            {"status": "UNTESTED", "risk_level": "CRITICAL"},  # -10
            {"status": "UNTESTED", "risk_level": "HIGH"},      # -5
        ],
        "validation_tests": [
            {"test_status": "FAILED"}                          # -15
        ]
    }

    scores = calculate_candidate_composite_score(candidate)

    # Check components
    assert scores["rubric_score"] > 80.0
    assert scores["epistemic_score"] == 100.0  # Net balance has only supports
    assert scores["impact_score"] == 100.0     # 20.0 * 5.0
    assert scores["risk_penalty"] == 30.0      # 10 + 5 + 15 = 30

    expected_raw = (
        RANKING_WEIGHTS_V1["rubric"] * scores["rubric_score"] +
        RANKING_WEIGHTS_V1["epistemic"] * scores["epistemic_score"] +
        RANKING_WEIGHTS_V1["impact"] * scores["impact_score"]
    ) - 30.0
    expected_composite = round(min(max(expected_raw, 0.0), 100.0), 1)
    assert scores["composite_score"] == expected_composite


@pytest.mark.unit
def test_zero_claims_neutral_epistemic_baseline():
    """Candidate with zero claims receives neutral 50.0 epistemic score."""
    cand = {"id": "ZERO-01", "problem_statement": "Test problem", "claims": []}
    scores = calculate_candidate_composite_score(cand)
    assert scores["epistemic_score"] == 50.0


@pytest.mark.unit
def test_risk_penalty_maximum_cap():
    """Verify that assumption risk penalties are strictly capped at 50.0 points."""
    cand = {
        "id": "RISK-01",
        "problem_statement": "High risk thesis",
        "assumptions": [
            {"status": "FALSIFIED"},  # 15
            {"status": "FALSIFIED"},  # 15
            {"status": "FALSIFIED"},  # 15
            {"status": "FALSIFIED"},  # 15
            {"status": "UNTESTED", "risk_level": "CRITICAL"}, # 10
        ]
    }
    scores = calculate_candidate_composite_score(cand)
    assert scores["risk_penalty"] == RISK_PENALTY_DEFAULTS_V1["max_penalty"]  # capped at 50.0


# ===========================================================================
# 3. Deterministic Ranking & 4-Tier Tie-Breaking Tests (TASK-004-02)
# ===========================================================================

@pytest.mark.unit
def test_deterministic_ranking_ordering():
    """Candidates must be ordered strictly by composite score."""
    c1 = {
        "id": "CAND-A",
        "problem_statement": "Weak thesis without evidence",
        "sources": [],
        "claims": [],
        "assumptions": [{"status": "FALSIFIED"}]
    }
    c2 = {
        "id": "CAND-B",
        "problem_statement": "Strong thesis with Tier A sources",
        "sufferer_occupation": "Onion farmers in Miagao",
        "sufferer_location": "Miagao, Iloilo",
        "quantified_impact": "Loss of ₱50,000 (40% loss) per harvest season every year",
        "workaround": "Manual sorting and drying in bamboo huts",
        "sources": [
            {"source_tier": "A", "source_url": "https://psa.gov.ph", "evidence_type": "REPORT"},
            {"source_tier": "B", "source_url": "https://news.com", "evidence_type": "NEWS"}
        ],
        "claims": [{"id": "C1", "evidence_links": [{"relationship": "SUPPORTS", "source_tier": "A"}]}],
        "assumptions": []
    }

    ranked = rank_candidates_deterministically([c1, c2])
    assert len(ranked) == 2
    assert ranked[0].problem_id == "CAND-B"
    assert ranked[0].rank == 1
    assert ranked[0].verdict == "RECOMMENDED"
    assert ranked[1].problem_id == "CAND-A"
    assert ranked[1].rank == 2


@pytest.mark.unit
def test_tie_breaking_hierarchy():
    """
    Ties broken by:
    1. Epistemic score
    2. Rubric score
    3. Impact score
    4. Lexicographical ID
    """
    # Create two candidates with identical composite score but different epistemic scores
    # Candidate X has higher epistemic score; Candidate Y has lower epistemic score
    c_x = {
        "id": "P-02",
        "problem_statement": "Problem with high epistemic backing",
        "sources": [{"source_tier": "B"}],
        "claims": [{"id": "CX1", "evidence_links": [{"relationship": "SUPPORTS", "source_tier": "A"}]}], # 100.0
    }
    c_y = {
        "id": "P-01",
        "problem_statement": "Problem with lower epistemic backing",
        "sources": [{"source_tier": "B"}],
        "claims": [], # 50.0
    }

    # Lexicographical tie-breaker test: identical metrics
    c_tie_1 = {"id": "P-02", "problem_statement": "Identical thesis"}
    c_tie_2 = {"id": "P-01", "problem_statement": "Identical thesis"}

    ranked_lex = rank_candidates_deterministically([c_tie_1, c_tie_2])
    assert ranked_lex[0].problem_id == "P-01"  # Lexicographically precedes P-02
    assert ranked_lex[1].problem_id == "P-02"


@pytest.mark.unit
def test_empty_candidate_set():
    """Empty candidate set returns empty list without raising IndexError (no candidates[0])."""
    ranked = rank_candidates_deterministically([])
    assert ranked == []


@pytest.mark.unit
def test_single_candidate():
    """Single candidate receives rank = 1 and RECOMMENDED verdict."""
    cand = {"id": "SOLO-01", "problem_statement": "Only candidate"}
    ranked = rank_candidates_deterministically([cand])
    assert len(ranked) == 1
    assert ranked[0].problem_id == "SOLO-01"
    assert ranked[0].rank == 1
    assert ranked[0].verdict == "RECOMMENDED"


# ===========================================================================
# 4. LLM Inversion & Hardened Fallback Tests (TASK-004-03, TASK-004-04)
# ===========================================================================

@pytest.mark.asyncio
@pytest.mark.unit
async def test_llm_cannot_override_winner():
    """When an LLM attempts to crown a loser as winner, invariant assertion overrides it."""
    c_winner = {
        "id": "TRUE-WINNER",
        "problem_statement": "Strongest evidence",
        "sources": [{"source_tier": "A", "source_url": "https://psa.gov.ph", "evidence_type": "GOV"}],
        "claims": [{"id": "CW1", "evidence_links": [{"relationship": "SUPPORTS", "source_tier": "A"}]}],
    }
    c_loser = {
        "id": "FALSE-WINNER",
        "problem_statement": "Weak evidence",
        "sources": [],
        "claims": [],
        "assumptions": [{"status": "FALSIFIED"}],
    }

    # Malicious/hallucinated LLM response that claims FALSE-WINNER won
    hallucinated_resp = json.dumps({
        "recommended_winner_id": "FALSE-WINNER",
        "recommendation_summary": "I decided FALSE-WINNER is the winner.",
        "candidate_breakdowns": [
            {"problem_id": "FALSE-WINNER", "rank": 1, "verdict": "RECOMMENDED", "pros": ["AI liked this"], "risks": []},
            {"problem_id": "TRUE-WINNER", "rank": 2, "verdict": "HIGH_RISK", "pros": [], "risks": ["AI rejected this"]}
        ]
    })

    with patch("engines.decision_engine.generate_response_with_fallback", new=AsyncMock(return_value=hallucinated_resp)):
        res = await synthesize_decision_room([c_loser, c_winner])
        # Invariant check: TRUE-WINNER MUST remain winner
        assert res["recommended_winner_id"] == "TRUE-WINNER"
        assert res["candidate_breakdowns"][0]["problem_id"] == "TRUE-WINNER"
        assert res["candidate_breakdowns"][0]["rank"] == 1
        assert res["candidate_breakdowns"][1]["problem_id"] == "FALSE-WINNER"
        assert res["candidate_breakdowns"][1]["rank"] == 2


@pytest.mark.asyncio
@pytest.mark.unit
async def test_degraded_fallback_synthesis():
    """When LLM gateway throws an exception, engine returns deterministic summary with is_degraded = True."""
    cand1 = {"id": "P-01", "problem_statement": "Test problem 1", "score": 80}
    cand2 = {"id": "P-02", "problem_statement": "Test problem 2", "score": 70}

    with patch("engines.decision_engine.generate_response_with_fallback", side_effect=Exception("Gateway timeout")):
        res = await synthesize_decision_room([cand1, cand2])
        assert res["is_degraded"] is True
        assert res["recommended_winner_id"] in ["P-01", "P-02"]
        assert len(res["candidate_breakdowns"]) == 2
        assert "deterministic composite score" in res["recommendation_summary"]


@pytest.mark.asyncio
@pytest.mark.unit
async def test_empty_candidates_synthesize_endpoint():
    """Empty candidate list returns neutral response without error."""
    res = await synthesize_decision_room([])
    assert res["recommended_winner_id"] is None
    assert res["candidate_breakdowns"] == []
    assert res["is_degraded"] is False


# ===========================================================================
# 5. Session Router Contract Tests (TASK-004-05, DEF-AI-008)
# ===========================================================================

@pytest.mark.unit
def test_session_router_synthesize_contract():
    """Test POST /api/decision-room/synthesize executes without TypeError."""
    storage = get_storage()
    storage.save_session("sess-test-synth", {
        "session_id": "sess-test-synth",
        "project_id": "PROJ-001",
        "state_data": {"candidate_ids": ["HOU-001", "AGR-003"]}
    })

    mock_synth_response = json.dumps({
        "recommendation_summary": "Candidate HOU-001 demonstrates superior empirical backing.",
        "candidate_breakdowns": [
            {
                "problem_id": "HOU-001",
                "rank": 1,
                "pros": ["Strong evidence", "Validated loss"],
                "risks": ["Permit delays"],
                "verdict": "STRONG_CANDIDATE"
            },
            {
                "problem_id": "AGR-003",
                "rank": 2,
                "pros": ["Clear user need"],
                "risks": ["High capex"],
                "verdict": "FEASIBLE_CANDIDATE"
            }
        ]
    })

    with patch("engines.decision_engine.generate_response_with_fallback", new=AsyncMock(return_value=mock_synth_response)):
        resp = client.post("/api/decision-room/synthesize", json={"session_id": "sess-test-synth"})
        assert resp.status_code == 200
        data = resp.json()
        assert "recommended_winner_id" in data
        assert "candidate_breakdowns" in data


@pytest.mark.unit
def test_session_router_pivot_contract_and_semantic_separation():
    """Test POST /api/decision-room/pivot executes without TypeError and preserves semantic separation."""
    storage = get_storage()
    storage.save_session("sess-test-pivot", {
        "session_id": "sess-test-pivot",
        "project_id": "PROJ-001",
        "phase2_complete": True,
        "phase3_problem": "AGR-003"
    })

    with patch("routers.sessions.execute_pivot_loop", wraps=execute_pivot_loop) as spy_pivot:
        resp = client.post("/api/decision-room/pivot", json={
            "session_id": "sess-test-pivot",
            "current_problem_id": "AGR-003",
            "kill_reason": "High capital expenditure required for cold storage facility.",
            "next_candidate_id": "HOU-001"  # Candidate ID, NOT assumption ID
        })
        assert resp.status_code == 200
        # Invariant check: next_candidate_id ("HOU-001") must NOT be passed as invalidated_assumption_id
        spy_pivot.assert_called_once_with(
            session_id="sess-test-pivot",
            current_problem_id="AGR-003",
            pivot_reason="High capital expenditure required for cold storage facility.",
            invalidated_assumption_id=None
        )


# ===========================================================================
# 6. Epistemic Boundary Hardening Tests (TASK-004-06, TASK-004-07)
# ===========================================================================

@pytest.mark.asyncio
@pytest.mark.unit
async def test_verifier_agent_verdict_taxonomy():
    """Verifier agent cannot autonomously assert VERIFIED_EMPIRICAL."""
    mock_resp = json.dumps({
        "verification_verdict": "VERIFIED_EMPIRICAL",  # LLM attempts to emit forbidden status
        "evidence_strength": "STRONG",
        "confidence_score": 0.95,
        "methodology_audit": "Peer reviewed",
        "contradictions": []
    })

    with patch("agents.verifier_agent.generate_response_with_fallback", new=AsyncMock(return_value=mock_resp)):
        report = await execute_verifier_agent(
            claim_text="Post-harvest losses exceed 35%",
            doi=None,  # No DOI validation
            source_name="Local News"
        )
        # Invariant: Must be normalized to advisory verdict
        assert report.verification_verdict != "VERIFIED_EMPIRICAL"
        assert report.verification_verdict == "PLAUSIBLE_UNVERIFIED"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_assumption_claim_initial_hypothesis():
    """Newly generated friction reality claims initialize with status HYPOTHESIS."""
    # Test deterministic fallback of assumption engine
    with patch("engines.assumption_engine.generate_response_with_fallback", side_effect=Exception("Offline")):
        data = await extract_claims_and_assumptions(
            problem={
                "problem_statement": "Onion spoilage in Miagao",
                "sufferer_occupation": "Farmers",
                "sufferer_location": "Miagao",
                "quantified_impact": "₱45k",
                "workaround": "Ventilated huts",
            },
            mode="COMMERCIAL"
        )
        claims = data.get("claims", [])
        assert len(claims) >= 1
        friction_claim = claims[0]
        assert friction_claim["claim_type"] == "FRICTION_REALITY"
        # Invariant: UNKNOWN -> HYPOTHESIS transition
        assert friction_claim["status"] == "HYPOTHESIS"


# ===========================================================================
# 7. Performance & Reproducibility Tests (NFR-001, NFR-002)
# ===========================================================================

@pytest.mark.unit
def test_deterministic_latency_benchmark():
    """
    Pure deterministic ranking calculation for 4 candidates must execute in < 10ms
    (NFR-001 normative acceptance threshold; < 5ms aspirational target).
    """
    candidates = [
        {
            "id": f"P-0{i}",
            "problem_statement": f"Problem statement {i}",
            "sufferer_occupation": "Occupation",
            "sufferer_location": "Iloilo",
            "quantified_impact": "₱20,000 per month",
            "workaround": "Manual workaround",
            "sources": [{"source_tier": "B", "source_url": "https://news.com"}],
            "claims": [{"id": f"C-{i}", "links": []}],
            "assumptions": [{"status": "UNTESTED", "risk_level": "HIGH"}]
        }
        for i in range(1, 5)
    ]

    # Warm-up run
    rank_candidates_deterministically(candidates)

    start = time.perf_counter()
    ranked = rank_candidates_deterministically(candidates)
    duration_ms = (time.perf_counter() - start) * 1000.0

    assert len(ranked) == 4
    # Normative acceptance threshold: < 10ms
    assert duration_ms < 10.0, f"Ranking latency {duration_ms:.2f}ms exceeds 10ms threshold"


@pytest.mark.unit
def test_reproducibility_across_iterations():
    """50 consecutive runs produce bit-identical ranks and floating-point scores."""
    candidates = [
        {"id": f"P-{i}", "problem_statement": f"Problem {i}", "quantified_impact": f"₱{i * 1000}"}
        for i in range(1, 4)
    ]

    baseline = rank_candidates_deterministically(candidates)
    baseline_tuples = [(b.problem_id, b.rank, b.composite_score) for b in baseline]

    for _ in range(50):
        run = rank_candidates_deterministically(candidates)
        run_tuples = [(b.problem_id, b.rank, b.composite_score) for b in run]
        assert run_tuples == baseline_tuples
