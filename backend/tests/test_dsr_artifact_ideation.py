"""
CONVERA SDD-016 DSR Artifact Ideation Test Suite
================================================
Comprehensive verification suite for Design Science Research (DSR) artifact formulation:
1. SQLite WAL Table 33 (dsr_artifacts) Schema & CRUD Adapter
2. IdeationEngine 4-Class Candidate Formulation (Construct, Model, Method, Instantiation)
3. Epistemic Rules 5 (Simpler Baseline Alternative) & 6 (No Buzzword Novelty)
4. FastApi Router Endpoints (/api/ideation/*)
5. Research Orchestrator Action Recommendation & Dispatch Integration
"""

import os
import json
import pytest
import tempfile
from typing import Generator
from fastapi.testclient import TestClient

from unittest.mock import patch, AsyncMock
from storage.sqlite_adapter import SQLiteStorageAdapter
import storage.factory as factory
from engines.ideation_engine import IdeationEngine
from services.research_orchestrator import ResearchOrchestrator
from models.orchestrator import ActionType, ActionPriority, OrchestrationActionDispatchRequest
from server import app

MOCK_LLM_DSR_RESPONSE = json.dumps({
    "artifacts": [
        {
            "title": "Hierarchical State Ontology & Feature Vocabulary for Aquaculture",
            "dsr_class": "CONSTRUCT",
            "description": "Taxonomy of aquatic hypoxia zones and diurnal thermal layers.",
            "kernel_theory": "Hydrodynamic Stratification Theory (Wetzel, 2001)",
            "targeted_gap_ids": ["GAP-01"],
            "linked_claim_ids": ["CLM-01"],
            "formal_specification": "HypoxiaZone = {z in Z | DO(z, t) < 3.0 mg/L}",
            "simpler_baseline_alternative": "Manual spot sampling with handheld chemical titration kits.",
            "contextual_constraints": ["Brackish water corrosion resistance", "Low maintenance"],
            "feasibility_score": 0.85,
            "novelty_score": 0.70
        },
        {
            "title": "Stochastic Dissolved Oxygen Predictive Degradation Model",
            "dsr_class": "MODEL",
            "description": "Dynamic mathematical model formalizing state transitions and hypoxia probabilities.",
            "kernel_theory": "Markov Decision Processes & Stochastic Control Theory (Puterman, 1994)",
            "targeted_gap_ids": ["GAP-01", "GAP-02"],
            "linked_claim_ids": ["CLM-01"],
            "formal_specification": "M = (S, A, P, R, gamma) over nocturnal intervals.",
            "simpler_baseline_alternative": "Static rule-based thresholding without predictive decay estimation.",
            "contextual_constraints": ["Sub-100ms convergence"],
            "feasibility_score": 0.82,
            "novelty_score": 0.72
        },
        {
            "title": "Adaptive Aeration Optimization & Heuristic Inference Method",
            "dsr_class": "METHOD",
            "description": "Bounded polynomial-time optimization for automated aerator scheduling.",
            "kernel_theory": "Algorithmic Information Theory & Primal-Dual Approximation (Vazirani, 2001)",
            "targeted_gap_ids": ["GAP-02"],
            "linked_claim_ids": ["CLM-01"],
            "formal_specification": "Algorithm A: Computes min energy subject to DO >= 4.0 mg/L.",
            "simpler_baseline_alternative": "Greedy fixed timer without closed-loop oxygen feedback.",
            "contextual_constraints": ["Low compute overhead"],
            "feasibility_score": 0.85,
            "novelty_score": 0.78
        },
        {
            "title": "Edge-Native Telemetry & Field Execution Testbed Prototype",
            "dsr_class": "INSTANTIATION",
            "description": "Physical testbed with solar-powered microcontroller and optical DO probe array.",
            "kernel_theory": "Distributed Systems Architecture & Cyber-Physical Systems Theory (Lee & Seshia, 2017)",
            "targeted_gap_ids": ["GAP-01", "GAP-02"],
            "linked_claim_ids": ["CLM-01"],
            "formal_specification": "ARM Cortex-M4 with FreeRTOS and LoRaWAN telemetry transceiver.",
            "simpler_baseline_alternative": "Monolithic cloud-dependent web application requiring constant 4G uplink.",
            "contextual_constraints": ["Solar/battery powered (<500mW)"],
            "feasibility_score": 0.75,
            "novelty_score": 0.82
        }
    ]
})


@pytest.fixture(autouse=True)
def mock_llm_gateway():
    """Ensure tests run offline deterministically without remote API latency or quota exhaustion."""
    with patch("engines.ideation_engine.generate_response_with_fallback", new=AsyncMock(return_value=MOCK_LLM_DSR_RESPONSE)):
        yield


@pytest.fixture
def temp_db() -> Generator[SQLiteStorageAdapter, None, None]:
    with tempfile.NamedTemporaryFile(suffix=".db") as tf:
        adapter = SQLiteStorageAdapter(tf.name)
        # Seed foundational project and problem
        with adapter._get_connection() as conn:
            conn.execute("""
                INSERT INTO projects (id, share_code, name)
                VALUES ('PROJ-DSR-TEST', 'CONV-TEST', 'DSR Test Project')
            """)
            conn.execute("""
                INSERT INTO problems (id, project_id, sector, sufferer_occupation, sufferer_location, problem_statement, quantified_impact)
                VALUES (
                    'PROB-DSR-01',
                    'PROJ-DSR-TEST',
                    'Aquaculture',
                    'Tilapia Pond Operators',
                    'Leganes, Iloilo',
                    'Dissolved oxygen depletion causing mass fish mortality during nocturnal thermal inversions.',
                    'PHP 250,000 seasonal crop loss per fishpond'
                )
            """)
        yield adapter


@pytest.fixture
def client(temp_db: SQLiteStorageAdapter) -> Generator[TestClient, None, None]:
    original_storage = factory._GLOBAL_STORAGE
    factory._GLOBAL_STORAGE = temp_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        factory._GLOBAL_STORAGE = original_storage


# ==============================================================================
# 1. STORAGE CRUD & RELATIONAL INTEGRITY
# ==============================================================================

def test_dsr_artifact_storage_crud(temp_db: SQLiteStorageAdapter):
    """Verify complete CRUD lifecycle on SQLite WAL table 33 dsr_artifacts."""
    # Create
    created = temp_db.create_dsr_artifact({
        "problem_id": "PROB-DSR-01",
        "title": "Dissolved Oxygen Spatial Ontology",
        "dsr_class": "CONSTRUCT",
        "description": "Taxonomy of aquatic hypoxia zones and diurnal thermal layers.",
        "kernel_theory": "Hydrodynamic Stratification Theory (Wetzel, 2001)",
        "targeted_gap_ids": ["GAP-01"],
        "linked_claim_ids": ["CLM-01"],
        "formal_specification": "HypoxiaZone = {z in Z | DO(z, t) < 3.0 mg/L}",
        "simpler_baseline_alternative": "Manual spot sampling with handheld chemical titration kits.",
        "contextual_constraints": ["Brackish water corrosion resistance", "Low maintenance"],
        "feasibility_score": 0.85,
        "novelty_score": 0.70,
        "status": "PROPOSED",
        "provenance": {"source": "unit_test"}
    })

    assert created["id"].startswith("ART-")
    assert created["dsr_class"] == "CONSTRUCT"
    assert created["targeted_gap_ids"] == ["GAP-01"]
    assert created["linked_claim_ids"] == ["CLM-01"]
    assert created["contextual_constraints"] == ["Brackish water corrosion resistance", "Low maintenance"]
    assert created["provenance"] == {"source": "unit_test"}
    art_id = created["id"]

    # Read
    fetched = temp_db.get_dsr_artifact(art_id)
    assert fetched is not None
    assert fetched["title"] == "Dissolved Oxygen Spatial Ontology"
    assert fetched["feasibility_score"] == 0.85

    # Update (Selection)
    updated = temp_db.update_dsr_artifact(art_id, {
        "status": "SELECTED",
        "novelty_score": 0.82
    })
    assert updated is not None
    assert updated["status"] == "SELECTED"
    assert updated["novelty_score"] == 0.82

    # List by problem and class
    all_artifacts = temp_db.list_dsr_artifacts("PROB-DSR-01")
    assert len(all_artifacts) == 1

    constructs = temp_db.list_dsr_artifacts("PROB-DSR-01", dsr_class="CONSTRUCT")
    assert len(constructs) == 1

    models = temp_db.list_dsr_artifacts("PROB-DSR-01", dsr_class="MODEL")
    assert len(models) == 0

    # Delete
    deleted = temp_db.delete_dsr_artifact(art_id)
    assert deleted is True
    assert temp_db.get_dsr_artifact(art_id) is None


def test_dsr_artifact_foreign_key_cascade(temp_db: SQLiteStorageAdapter):
    """Verify DSR artifacts are cascade deleted when parent problem is removed."""
    art = temp_db.create_dsr_artifact({
        "problem_id": "PROB-DSR-01",
        "title": "Cascade Test Model",
        "dsr_class": "MODEL",
        "description": "Test model for cascade",
        "kernel_theory": "Dynamical Systems",
        "status": "PROPOSED",
    })
    art_id = art["id"]
    assert temp_db.get_dsr_artifact(art_id) is not None

    with temp_db._get_connection() as conn:
        conn.execute("DELETE FROM problems WHERE id = 'PROB-DSR-01'")

    assert temp_db.get_dsr_artifact(art_id) is None


# ==============================================================================
# 2. DOMAIN ENGINE & EPISTEMIC RULES 5 & 6
# ==============================================================================

@pytest.mark.asyncio
async def test_ideation_engine_generates_4_classes(temp_db: SQLiteStorageAdapter):
    """Verify IdeationEngine generates candidates across all 4 DSR classes."""
    engine = IdeationEngine(storage=temp_db)
    result = await engine.generate_dsr_candidates(
        problem_id="PROB-DSR-01",
        classes=["CONSTRUCT", "MODEL", "METHOD", "INSTANTIATION"],
        max_candidates_per_class=1
    )

    assert result["total_generated"] == 4
    assert len(result["kernel_theories_explored"]) >= 1
    assert len(result["baseline_alternatives_considered"]) >= 1

    persisted = temp_db.list_dsr_artifacts("PROB-DSR-01")
    assert len(persisted) == 4

    classes_found = {a["dsr_class"] for a in persisted}
    assert classes_found == {"CONSTRUCT", "MODEL", "METHOD", "INSTANTIATION"}

    for a in persisted:
        # Gregor & Jones (2007) Kernel Theory Grounding
        assert a["kernel_theory"] and len(a["kernel_theory"]) > 5
        # Epistemic Rule 5 (Simpler Baseline Alternative)
        assert a["simpler_baseline_alternative"] and len(a["simpler_baseline_alternative"]) > 10
        # Article II Decoupled Scores
        assert 0.0 <= a["feasibility_score"] <= 1.0
        assert 0.0 <= a["novelty_score"] <= 1.0
        # Article IV Human Sovereignty (Default Proposed)
        assert a["status"] == "PROPOSED"


@pytest.mark.asyncio
async def test_ideation_engine_filtered_classes(temp_db: SQLiteStorageAdapter):
    """Verify IdeationEngine respects class subsets (e.g. METHOD and INSTANTIATION only)."""
    engine = IdeationEngine(storage=temp_db)
    result = await engine.generate_dsr_candidates(
        problem_id="PROB-DSR-01",
        classes=["METHOD", "INSTANTIATION"],
        max_candidates_per_class=1
    )

    assert result["total_generated"] == 2
    persisted = temp_db.list_dsr_artifacts("PROB-DSR-01")
    classes_found = {a["dsr_class"] for a in persisted}
    assert classes_found == {"METHOD", "INSTANTIATION"}


# ==============================================================================
# 3. REST API ENDPOINTS (/api/ideation/*)
# ==============================================================================

def test_api_generate_and_manage_artifacts(client: TestClient):
    """Test full REST endpoint workflow for ideation candidate generation and management."""
    # 1. Generate Candidates
    gen_res = client.post("/api/ideation/generate", json={
        "problem_id": "PROB-DSR-01",
        "classes": ["MODEL", "METHOD"],
        "max_candidates_per_class": 1
    })
    assert gen_res.status_code == 200
    gen_data = gen_res.json()
    assert gen_data["total_generated"] == 2
    assert len(gen_data["generated_artifacts"]) == 2

    first_art = gen_data["generated_artifacts"][0]
    art_id = first_art["id"]

    # 2. Get artifact by ID
    get_res = client.get(f"/api/ideation/artifacts/{art_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == art_id

    # 3. Patch artifact (Select as primary thesis)
    patch_res = client.patch(f"/api/ideation/artifacts/{art_id}", json={
        "status": "SELECTED",
        "feasibility_score": 0.95
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "SELECTED"
    assert patch_res.json()["feasibility_score"] == 0.95

    # 4. List artifacts with filter
    list_res = client.get(f"/api/ideation/problem/PROB-DSR-01/artifacts?dsr_class={first_art['dsr_class']}")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 5. Create Custom Artifact
    create_res = client.post("/api/ideation/artifacts", json={
        "problem_id": "PROB-DSR-01",
        "title": "Custom LoRa Aerator Controller",
        "dsr_class": "INSTANTIATION",
        "description": "Embedded solar controller actuating paddlewheel aerators based on predictive oxygen drops.",
        "kernel_theory": "Cyber-Physical Systems Control Theory (Lee & Seshia, 2017)",
        "simpler_baseline_alternative": "Manual mechanical clock timer operating aerators continuously overnight.",
        "feasibility_score": 0.88,
        "novelty_score": 0.79,
        "status": "PROPOSED"
    })
    assert create_res.status_code == 201
    custom_id = create_res.json()["id"]

    # 6. Delete Artifact
    del_res = client.delete(f"/api/ideation/artifacts/{custom_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 7. 404 for deleted
    del_check = client.get(f"/api/ideation/artifacts/{custom_id}")
    assert del_check.status_code == 404


# ==============================================================================
# 4. RESEARCH ORCHESTRATOR INTEGRATION
# ==============================================================================

@pytest.mark.asyncio
async def test_orchestrator_recommends_and_dispatches_dsr(temp_db: SQLiteStorageAdapter):
    """
    Verify ResearchOrchestrator:
    1. Recommends FORMULATE_DSR_ARTIFACT in stage_d_formulation when 0 selected artifacts exist.
    2. Successfully executes dispatch_action with target_engine='ideation_engine'.
    """
    # Create session at Phase D (stage_d_formulation)
    state = {
        "framework_id": "RESEARCH",
        "stage_progress": {
            "schema_version": 1,
            "framework_id": "RESEARCH",
            "current_stage_id": "stage_d_formulation",
            "stages": {
                "stage_a_scouting": {"status": "COMPLETED"},
                "stage_b_validation": {"status": "COMPLETED"},
                "stage_c_opportunity": {"status": "COMPLETED"},
                "stage_d_formulation": {"status": "IN_PROGRESS"}
            }
        }
    }
    with temp_db._get_connection() as conn:
        conn.execute("""
            INSERT INTO sessions (session_id, project_id, state_data)
            VALUES ('SESS-ORCH-DSR', 'PROJ-DSR-TEST', ?)
        """, (json.dumps(state),))

    orch = ResearchOrchestrator(storage=temp_db)

    # 1. Evaluate session
    eval_res = await orch.evaluate(session_id="SESS-ORCH-DSR", problem_id="PROB-DSR-01")
    dsr_recs = [r for r in eval_res.recommended_actions if r.action_type == ActionType.FORMULATE_DSR_ARTIFACT]

    assert len(dsr_recs) == 1
    rec = dsr_recs[0]
    assert rec.priority == ActionPriority.HIGH
    assert rec.blocking_stage_progression is True
    assert rec.target_engine == "ideation_engine"

    # 2. Dispatch Action
    dispatch_req = OrchestrationActionDispatchRequest(
        session_id="SESS-ORCH-DSR",
        problem_id="PROB-DSR-01",
        action_type=ActionType.FORMULATE_DSR_ARTIFACT,
        target_engine="ideation_engine",
        parameters={"classes": ["CONSTRUCT", "MODEL", "METHOD", "INSTANTIATION"]}
    )
    dispatch_res = await orch.dispatch_action(dispatch_req)

    assert dispatch_res.status == "SUCCESS"
    assert dispatch_res.resulting_artifacts["total_generated"] == 4

    # 3. Verify event recorded in SQLite
    events = temp_db.get_orchestration_events("SESS-ORCH-DSR")
    assert any(e["event_type"] == "ACTION_DISPATCHED" for e in events)

    # 4. Select one artifact and re-evaluate -> recommendation should disappear
    arts = temp_db.list_dsr_artifacts("PROB-DSR-01")
    temp_db.update_dsr_artifact(arts[0]["id"], {"status": "SELECTED"})

    eval_after = await orch.evaluate(session_id="SESS-ORCH-DSR", problem_id="PROB-DSR-01")
    dsr_recs_after = [r for r in eval_after.recommended_actions if r.action_type == ActionType.FORMULATE_DSR_ARTIFACT]
    assert len(dsr_recs_after) == 0
