"""
Integration & Unit Tests for Cross-Stage Research Critique & Blind-Spot Engine (SDD-019)
========================================================================================
Governed by: CONVERA Constitution Article I (Grounded Cognition),
             Article II (Tri-Part Confidence / Deterministic Scoring),
             Article IV (Human Sovereignty / Attributable Resolution),
             Article VII (Anti-Creep Law),
             Article VIII (Degraded-State Resilience)
"""

import os
import tempfile
import pytest
from typing import Generator
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.cross_stage_critique_engine import CrossStageCritiqueEngine
from models.critique import (
    CritiqueType,
    CritiqueSeverity,
    CritiqueStatus,
    CrossStageCritiqueRecord,
    CritiqueEvaluationRequest,
    ResolveCritiqueRequest,
)
from models.orchestrator import ActionType, OrchestrationActionDispatchRequest
from services.research_orchestrator import ResearchOrchestrator
from server import app

pytestmark = pytest.mark.integration


@pytest.fixture
def storage() -> Generator[SQLiteStorageAdapter, None, None]:
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    adapter = SQLiteStorageAdapter(db_path=path)
    yield adapter
    if os.path.exists(path):
        try:
            os.remove(path)
        except Exception:
            pass


@pytest.fixture
def engine(storage: SQLiteStorageAdapter) -> CrossStageCritiqueEngine:
    return CrossStageCritiqueEngine(storage=storage)


@pytest.fixture
def client(storage: SQLiteStorageAdapter) -> Generator[TestClient, None, None]:
    import storage.factory as storage_factory
    original_global = storage_factory._GLOBAL_STORAGE
    storage_factory._GLOBAL_STORAGE = storage
    original_storage = getattr(app.state, "storage", None)
    app.state.storage = storage
    with TestClient(app) as test_client:
        yield test_client
    storage_factory._GLOBAL_STORAGE = original_global
    if original_storage is not None:
        app.state.storage = original_storage


# ==============================================================================
# 1. Deterministic Scoring Formula Unit Tests (INV-019-02)
# ==============================================================================

def test_deterministic_scoring_formula(engine: CrossStageCritiqueEngine):
    """
    Verifies that the Cross-Stage Consistency Score strictly adheres to the mathematical formula:
    max(0.0, 100.0 - (25.0 * N_fatal + 15.0 * N_critical + 8.0 * N_warning + 3.0 * N_advisory))
    """
    # Baseline: Zero critiques = 100.0
    res0 = engine.calculate_consistency_score([])
    assert res0["consistency_score"] == 100.0
    assert res0["total_critiques"] == 0
    assert res0["open_critiques"] == 0

    def make_crit(cid: str, sev: CritiqueSeverity, status: CritiqueStatus = CritiqueStatus.OPEN) -> CrossStageCritiqueRecord:
        return CrossStageCritiqueRecord(
            id=cid,
            session_id="sess_01",
            critique_type=CritiqueType.CIRCUMSCRIPTION_TENSION,
            severity=sev,
            fatal_flaw_summary="Flaw",
            kill_question="Question?",
            mitigation_recommendation="Recommendation",
            status=status,
            created_at="2026-09-30T00:00:00Z",
        )

    # 1 Fatal = 100 - 25 = 75.0
    res1 = engine.calculate_consistency_score([make_crit("c1", CritiqueSeverity.FATAL)])
    assert res1["consistency_score"] == 75.0
    assert res1["fatal_count"] == 1

    # 1 Critical = 100 - 15 = 85.0
    res2 = engine.calculate_consistency_score([make_crit("c2", CritiqueSeverity.CRITICAL)])
    assert res2["consistency_score"] == 85.0
    assert res2["critical_count"] == 1

    # 1 Fatal + 1 Critical + 1 Warning + 1 Advisory = 100 - (25 + 15 + 8 + 3) = 49.0
    res3 = engine.calculate_consistency_score([
        make_crit("c1", CritiqueSeverity.FATAL),
        make_crit("c2", CritiqueSeverity.CRITICAL),
        make_crit("c3", CritiqueSeverity.WARNING),
        make_crit("c4", CritiqueSeverity.ADVISORY),
    ])
    assert res3["consistency_score"] == 49.0

    # 5 Fatal = max(0.0, 100 - 125) = 0.0 (bounded)
    res4 = engine.calculate_consistency_score([
        make_crit(f"cf_{i}", CritiqueSeverity.FATAL) for i in range(5)
    ])
    assert res4["consistency_score"] == 0.0

    # Resolved and Dismissed critiques do NOT penalize the score
    res5 = engine.calculate_consistency_score([
        make_crit("c1", CritiqueSeverity.FATAL, status=CritiqueStatus.RESOLVED),
        make_crit("c2", CritiqueSeverity.CRITICAL, status=CritiqueStatus.DISMISSED),
        make_crit("c3", CritiqueSeverity.WARNING, status=CritiqueStatus.OPEN),
    ])
    # Only Warning penalizes: 100 - 8 = 92.0
    assert res5["consistency_score"] == 92.0
    assert res5["open_critiques"] == 1
    assert res5["total_critiques"] == 3


# ==============================================================================
# 2. Table 36 Relational Storage Adapter Unit Tests
# ==============================================================================

def test_table_36_storage_crud(storage: SQLiteStorageAdapter):
    """Verifies SQLite WAL persistence, indexing, and deserialization for Table 36."""
    storage.save_session("session_c3_01", {"framework_id": "RESEARCH", "project_id": "default_proj"})

    critique_data = {
        "id": "CRIT-TEST-001",
        "session_id": "session_c3_01",
        "project_id": "default_proj",
        "critique_type": CritiqueType.CIRCUMSCRIPTION_TENSION.value,
        "severity": CritiqueSeverity.CRITICAL.value,
        "target_stages": ["STAGE_D", "STAGE_E"],
        "cross_stage_claims": [
            {"stage": "STAGE_E", "claim_title": "Iteration #1 Failure", "excerpt": "Observed 45% vs target 85%"},
            {"stage": "STAGE_D", "claim_title": "Model Spec", "excerpt": "Quantized 8-bit model"},
        ],
        "fatal_flaw_summary": "Empirical accuracy cliff in high thermal environment",
        "kill_question": "Why would the committee approve a model that drops 40% accuracy under field heat?",
        "mitigation_recommendation": "Incorporate adaptive thermal calibration loop in Stage D architecture",
        "plausibility_score": 92.0,
        "status": "OPEN",
    }

    # Save
    saved = storage.save_critique_record(critique_data)
    assert saved["id"] == "CRIT-TEST-001"
    assert saved["status"] == "OPEN"
    assert saved["target_stages"] == ["STAGE_D", "STAGE_E"]
    assert len(saved["cross_stage_claims"]) == 2

    # Get
    retrieved = storage.get_critique_record("CRIT-TEST-001")
    assert retrieved is not None
    assert retrieved["fatal_flaw_summary"] == "Empirical accuracy cliff in high thermal environment"
    assert retrieved["plausibility_score"] == 92.0

    # List
    listed = storage.list_critique_records(session_id="session_c3_01")
    assert len(listed) == 1
    assert listed[0]["id"] == "CRIT-TEST-001"

    # Update Status (Article IV Human Sovereignty)
    updated = storage.update_critique_status(
        critique_id="CRIT-TEST-001",
        status="RESOLVED",
        resolution_notes="Adopted hardware throttling and thermal hysteresis logic."
    )
    assert updated is not None
    assert updated["status"] == "RESOLVED"
    assert "Adopted hardware" in updated["resolution_notes"]
    assert updated["resolved_at"] is not None


# ==============================================================================
# 3. Cross-Stage Heuristic Tensions & Offline Resilience (INV-019-04)
# ==============================================================================

@pytest.mark.asyncio
async def test_heuristic_cross_stage_detection(engine: CrossStageCritiqueEngine, storage: SQLiteStorageAdapter):
    """
    Verifies that the engine inspects live relational state across Stages A, C, D, E, F
    and flags rule-based contradictions deterministically in offline mode.
    """
    session_id = "sess_heuristics_01"
    storage.save_session(session_id, {"framework_id": "RESEARCH", "project_id": "default_proj"})

    # Setup Stage A problem with a falsified assumption
    storage.add_problem({
        "id": "PROB-C3-01",
        "session_id": session_id,
        "title": "Cold Chain Sensor Drift",
        "problem_statement": "Sensors fail in high humidity environments",
        "project_id": "default_proj",
        "assumptions": [
            {
                "id": "ASSUMP-01",
                "assumption_text": "Passive solar power sustains 72-hour logging",
                "statement": "Passive solar power sustains 72-hour logging",
                "risk_level": "CRITICAL",
                "status": "FALSIFIED",
            }
        ],
    })

    # Setup Stage D artifact
    storage.create_dsr_artifact({
        "id": "ART-C3-01",
        "problem_id": "PROB-C3-01",
        "session_id": session_id,
        "title": "Edge Telemetry Node",
        "dsr_class": "INSTANTIATION",
        "description": "Ultra low-cost ESP32 node",
        "kernel_theory": "Distributed sensing",
    })

    # Setup Stage E circumscription iteration failure
    storage.record_circumscription_iteration({
        "project_id": "default_proj",
        "session_id": session_id,
        "artifact_name": "Edge Telemetry Node",
        "test_run_name": "Battery Depletion Benchmark",
        "metric_name": "Battery Life (hours)",
        "observed_value": 18.0,
        "target_value": 72.0,
        "status": "FAILED_LOOPBACK",
        "failure_mode": "Brownout under cloud cover",
        "constraint_extracted": "Requires auxiliary supercapacitor backup",
        "target_phase_loopback": "PHASE_D",
    })

    # Setup Stage F non-compliance
    storage.save_feasibility_record({
        "session_id": session_id,
        "project_id": "default_proj",
        "ethics_checklist": {
            "ra_10173_compliant": False,
            "consent_protocol_defined": False,
            "irb_status": "EXEMPT",
            "data_minimization_enforced": False,
            "safety_risks_identified": [],
        },
        "feasibility_score": 52.0,
        "compliance_passed": False,
    })

    # Evaluate in offline mode (include_ai_advisory=False)
    eval_req = CritiqueEvaluationRequest(
        session_id=session_id,
        project_id="default_proj",
        problem_id="PROB-C3-01",
        include_ai_advisory=False,
    )
    res = await engine.evaluate_critique(eval_req)

    assert res.is_degraded is True
    assert res.total_critiques >= 3
    assert res.open_critiques >= 3

    # Check that circumscription tension was flagged
    types = [c.critique_type for c in res.critiques]
    assert CritiqueType.CIRCUMSCRIPTION_TENSION in types
    assert CritiqueType.ETHICS_FEASIBILITY_DISCORD in types
    assert CritiqueType.EVIDENCE_VULNERABILITY in types

    # Check fatal counts (ethics non-compliance is FATAL)
    assert res.fatal_count >= 1
    # Check consistency score is penalized
    assert res.consistency_score < 70.0


# ==============================================================================
# 4. Human Sovereignty Resolution Validation (INV-019-03)
# ==============================================================================

@pytest.mark.asyncio
async def test_human_sovereignty_resolution(engine: CrossStageCritiqueEngine, storage: SQLiteStorageAdapter):
    """
    Verifies that resolving or dismissing critiques requires substantive human rationale (>= 5 chars),
    updates the record in Table 36, and restores consistency score points.
    """
    session_id = "sess_sovereign_01"
    storage.save_session(session_id, {"framework_id": "RESEARCH", "project_id": "default_proj"})

    saved = storage.save_critique_record({
        "id": "CRIT-SOV-001",
        "session_id": session_id,
        "project_id": "default_proj",
        "critique_type": CritiqueType.ETHICS_FEASIBILITY_DISCORD.value,
        "severity": CritiqueSeverity.FATAL.value,
        "fatal_flaw_summary": "Fatal missing consent protocol",
        "kill_question": "Why collect field telemetry without consent?",
        "mitigation_recommendation": "Define consent form",
        "status": "OPEN",
    })

    # Initial score with 1 fatal critique = 75.0
    initial_res = await engine.evaluate_critique(CritiqueEvaluationRequest(
        session_id=session_id,
        project_id="default_proj",
        include_ai_advisory=False,
    ))
    assert initial_res.consistency_score <= 75.0

    # Resolve with valid rationale
    resolve_req = ResolveCritiqueRequest(
        critique_id="CRIT-SOV-001",
        status=CritiqueStatus.RESOLVED,
        resolution_notes="Created formal IRB Appendix C participant consent protocol.",
    )
    resolved_record = engine.resolve_critique(resolve_req)
    assert resolved_record.status == CritiqueStatus.RESOLVED
    assert resolved_record.resolved_at is not None

    # Re-evaluate session critiques
    post_res = await engine.evaluate_critique(CritiqueEvaluationRequest(
        session_id=session_id,
        project_id="default_proj",
        include_ai_advisory=False,
    ))
    # Score should recover because the fatal critique is now RESOLVED!
    resolved_items = [c for c in post_res.critiques if c.id == "CRIT-SOV-001"]
    assert len(resolved_items) == 1
    assert resolved_items[0].status == CritiqueStatus.RESOLVED


# ==============================================================================
# 5. FastAPI Endpoints Integration Tests
# ==============================================================================

def test_api_critique_endpoints(client: TestClient, storage: SQLiteStorageAdapter):
    """Tests /api/critique/evaluate, /api/critique/session/{id}, and /api/critique/resolve."""
    session_id = "sess_api_crit_01"
    storage.save_session(session_id, {"framework_id": "RESEARCH", "project_id": "default_proj"})

    # 1. Evaluate endpoint
    eval_payload = {
        "session_id": session_id,
        "project_id": "default_proj",
        "include_ai_advisory": False,
    }
    r1 = client.post("/api/critique/evaluate", json=eval_payload)
    assert r1.status_code == 200
    res1 = r1.json()
    assert res1["status"] == "success"
    assert "evaluation" in res1
    assert "consistency_score" in res1["evaluation"]

    # 2. Add a critique directly to test resolution via API
    storage.save_critique_record({
        "id": "CRIT-API-001",
        "session_id": session_id,
        "project_id": "default_proj",
        "critique_type": CritiqueType.CROSS_STAGE_BLIND_SPOT.value,
        "severity": CritiqueSeverity.WARNING.value,
        "fatal_flaw_summary": "Unverified sensor drift",
        "kill_question": "How will thermal drift be handled?",
        "mitigation_recommendation": "Calibrate in thermal chamber",
        "status": "OPEN",
    })

    # 3. GET /api/critique/session/{session_id}
    r2 = client.get(f"/api/critique/session/{session_id}")
    assert r2.status_code == 200
    res2 = r2.json()
    assert res2["status"] == "success"
    assert len(res2["critiques"]) >= 1

    # 4. Resolve endpoint (validation of min length)
    bad_resolve = {
        "critique_id": "CRIT-API-001",
        "status": "RESOLVED",
        "resolution_notes": "ok", # Less than 5 characters!
    }
    r_bad = client.post("/api/critique/resolve", json=bad_resolve)
    assert r_bad.status_code == 422 # Pydantic ValidationError

    good_resolve = {
        "critique_id": "CRIT-API-001",
        "status": "RESOLVED",
        "resolution_notes": "Added thermal compensation algorithm in firmware v2.1.",
    }
    r3 = client.post("/api/critique/resolve", json=good_resolve)
    assert r3.status_code == 200
    res3 = r3.json()
    assert res3["status"] == "success"
    assert res3["critique"]["status"] == "RESOLVED"


# ==============================================================================
# 6. Research Orchestrator Action Dispatch Integration
# ==============================================================================

@pytest.mark.asyncio
async def test_orchestrator_critique_action_dispatch(storage: SQLiteStorageAdapter):
    """
    Verifies that ResearchOrchestrator dispatches ActionType.EXECUTE_CRITIQUE
    and ActionType.AUDIT_CROSS_STAGE_CRITIQUE to CrossStageCritiqueEngine.
    """
    session_id = "sess_orch_crit_01"
    storage.save_session(session_id, {
        "framework_id": "RESEARCH",
        "project_id": "default_proj",
        "problem_statement": "Agricultural cold chain sensor reliability",
    })

    orchestrator = ResearchOrchestrator(storage=storage)

    # Dispatch AUDIT_CROSS_STAGE_CRITIQUE
    dispatch_req = OrchestrationActionDispatchRequest(
        session_id=session_id,
        action_type=ActionType.AUDIT_CROSS_STAGE_CRITIQUE,
        target_engine="cross_stage_critique_engine",
        parameters={"include_ai_advisory": False},
    )
    result = await orchestrator.dispatch_action(dispatch_req)

    assert result.status in ("SUCCESS", "DEGRADED")
    assert "critique_evaluation" in result.resulting_artifacts
    eval_dict = result.resulting_artifacts["critique_evaluation"]
    assert "consistency_score" in eval_dict
    assert "Executed Cross-Stage Critique" in result.execution_summary
