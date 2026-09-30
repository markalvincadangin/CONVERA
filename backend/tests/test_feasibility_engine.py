"""
Integration & Unit Tests for Stage F Feasibility Engine & Proposal Canvas (SDD-018)
===================================================================================
Governed by: CONVERA Constitution Article I (Grounded Cognition),
             Article II (Tri-Part Confidence),
             Article IV (Human Sovereignty),
             Article VII (Anti-Creep Law),
             Article VIII (Degraded-State Resilience)
"""

import os
import tempfile
import pytest
from typing import Generator
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.feasibility_engine import FeasibilityEngine
from engines.proposal_exporter import ProposalExporter
from models.feasibility import (
    EthicsChecklist,
    SDGMapping,
    DOSTPriorityMapping,
    BudgetBreakdown,
    FeasibilityEvaluationRequest,
    IRBStatus,
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
def engine(storage: SQLiteStorageAdapter) -> FeasibilityEngine:
    return FeasibilityEngine(storage=storage)


@pytest.fixture
def exporter(storage: SQLiteStorageAdapter) -> ProposalExporter:
    return ProposalExporter(storage=storage)


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
# 1. Storage & Table 35 Unit Tests
# ==============================================================================

def test_table_35_crud(storage: SQLiteStorageAdapter):
    """Verifies SQLite WAL persistence for research_feasibility_records."""
    # Ensure foreign key records exist
    storage.save_session("session_f_01", {
        "framework_id": "RESEARCH",
        "current_stage_id": "stage_f_feasibility",
        "project_id": "proj_f_01",
    })

    record_data = {
        "session_id": "session_f_01",
        "project_id": "proj_f_01",
        "ethics_checklist": {
            "ra_10173_compliant": True,
            "consent_protocol_defined": True,
            "irb_status": "EXEMPT",
            "data_minimization_enforced": True,
            "safety_risks_identified": [],
        },
        "sdg_alignments": [
            {
                "sdg_number": 2,
                "sdg_name": "Zero Hunger",
                "rationale": "Mitigates post-harvest storage decay.",
                "target_indicator": "2.4",
            }
        ],
        "dost_alignments": [
            {
                "sector": "Agri-Aqua",
                "roadmap_name": "National AI Roadmap",
                "priority_area": "Post-Harvest Edge Telemetry",
                "alignment_notes": "Reduces regional food waste.",
            }
        ],
        "budget": {
            "hardware_cost": 30000.0,
            "cloud_cost": 10000.0,
            "travel_pilot_cost": 5000.0,
            "dataset_acquisition_cost": 0.0,
            "currency": "PHP",
            "total": 45000.0,
        },
        "timeline_weeks": 16,
        "feasibility_score": 88.5,
        "compliance_passed": True,
        "is_cleared": True,
        "advisory_notes": "Compliant with institutional standards.",
        "is_degraded": False,
    }

    saved = storage.save_feasibility_record(record_data)
    assert saved["session_id"] == "session_f_01"
    assert saved["feasibility_score"] == 88.5
    assert saved["compliance_passed"] is True
    assert saved["ethics_checklist"]["ra_10173_compliant"] is True
    assert saved["budget"]["total"] == 45000.0

    retrieved = storage.get_feasibility_record("session_f_01")
    assert retrieved is not None
    assert retrieved["id"] == saved["id"]
    assert len(retrieved["sdg_alignments"]) == 1

    records = storage.list_feasibility_records("proj_f_01")
    assert len(records) == 1
    assert records[0]["id"] == saved["id"]


# ==============================================================================
# 2. Feasibility Engine Deterministic Formula Tests
# ==============================================================================

def test_deterministic_scoring_formula(engine: FeasibilityEngine):
    """Verifies the four-component composite feasibility formula."""
    checklist = EthicsChecklist(
        ra_10173_compliant=True,
        consent_protocol_defined=True,
        irb_status=IRBStatus.EXEMPT,
        data_minimization_enforced=True,
    )
    sdgs = [
        SDGMapping(sdg_number=2, sdg_name="Zero Hunger", rationale="Food security", target_indicator="2.4"),
        SDGMapping(sdg_number=9, sdg_name="Industry & Innovation", rationale="Edge compute", target_indicator="9.5"),
    ]
    dost = [
        DOSTPriorityMapping(
            sector="Agri-Aqua",
            roadmap_name="NAIR",
            priority_area="Smart Agriculture",
            alignment_notes="Regional crops",
        )
    ]
    budget = BudgetBreakdown(
        hardware_cost=40000.0,
        cloud_cost=10000.0,
        travel_pilot_cost=10000.0,
        dataset_acquisition_cost=0.0,
        currency="PHP",
        total=60000.0,
    )

    scores = engine.calculate_deterministic_scores(
        checklist=checklist,
        sdgs=sdgs,
        dost_priorities=dost,
        budget=budget,
        timeline_weeks=16,
    )

    assert scores["compliance_passed"] is True
    assert scores["compliance_score"] == 100.0
    assert scores["alignment_score"] > 80.0
    assert scores["budget_score"] > 70.0
    assert scores["timeline_score"] >= 90.0
    assert 70.0 <= scores["composite_score"] <= 100.0


@pytest.mark.asyncio
async def test_offline_fallback_mode(engine: FeasibilityEngine, storage: SQLiteStorageAdapter):
    """Verifies Article VIII offline fallback when AI credentials are not provided."""
    storage.save_session("session_offline", {
        "framework_id": "RESEARCH",
        "current_stage_id": "stage_f_feasibility",
        "project_id": "proj_offline",
    })

    req = FeasibilityEvaluationRequest(
        session_id="session_offline",
        project_id="proj_offline",
        ethics_checklist=EthicsChecklist(
            ra_10173_compliant=True,
            consent_protocol_defined=True,
            irb_status=IRBStatus.EXEMPT,
        ),
        sdg_alignments=[],
        dost_alignments=[],
        budget=BudgetBreakdown(hardware_cost=10000.0, cloud_cost=5000.0, total=15000.0),
        timeline_weeks=16,
        include_ai_advisory=False,
    )

    rec = await engine.evaluate_feasibility(req)
    assert rec.feasibility_score > 0
    assert rec.is_degraded is True
    assert "• Data Privacy & Ethics:" in rec.advisory_notes


# ==============================================================================
# 3. Dynamic Proposal Exporter Tests
# ==============================================================================

def test_proposal_exporter_live_monograph(exporter: ProposalExporter, storage: SQLiteStorageAdapter):
    """Verifies that ProposalExporter aggregates live data across all stages."""
    storage.save_session("session_prop_01", {
        "framework_id": "RESEARCH",
        "current_stage_id": "stage_f_feasibility",
        "project_id": "proj_prop_01",
        "problem_statement": "Post-harvest onion storage spoilage in Iloilo.",
    })
    storage.add_problem({
        "id": "PROB-EXP-01",
        "project_id": "proj_prop_01",
        "problem_statement": "Post-harvest onion storage spoilage in Iloilo.",
        "sufferer_occupation": "Onion Farmers",
        "sufferer_location": "Miagao, Iloilo",
        "quantified_impact": "40% harvest loss valued at Php 120,000/farmer.",
    })
    storage.record_mentor_signoff(
        project_id="proj_prop_01",
        phase_number=6,
        mentor_name="Dr. Maria Clara",
        notes="Proposal cleared for thesis defense.",
    )

    result = exporter.compile_proposal_canvas(
        project_id="proj_prop_01",
        session_id="session_prop_01",
    )

    assert result["document_type"] == "DSR_CAPSTONE_PROPOSAL"
    md = result["markdown_content"]
    assert "Design Science Research Capstone Proposal" in md
    assert "Post-harvest onion storage spoilage in Iloilo" in md
    assert "Dr. Maria Clara" in md
    assert "Republic Act 10173" in md


# ==============================================================================
# 4. FastAPI Router & Endpoints Tests
# ==============================================================================

def test_feasibility_router_endpoints(client: TestClient, storage: SQLiteStorageAdapter):
    """Verifies /api/feasibility/* endpoints."""
    storage.save_session("session_api_01", {
        "framework_id": "RESEARCH",
        "current_stage_id": "stage_f_feasibility",
        "project_id": "proj_api_01",
    })

    # 1. Evaluate endpoint
    eval_payload = {
        "session_id": "session_api_01",
        "project_id": "proj_api_01",
        "ethics_checklist": {
            "ra_10173_compliant": True,
            "consent_protocol_defined": True,
            "irb_status": "EXEMPT",
            "data_minimization_enforced": True,
            "safety_risks_identified": [],
        },
        "sdg_alignments": [
            {
                "sdg_number": 2,
                "sdg_name": "Zero Hunger",
                "rationale": "Reduces crop loss",
                "target_indicator": "2.4",
            }
        ],
        "dost_alignments": [
            {
                "sector": "Agri-Aqua",
                "roadmap_name": "NAIR",
                "priority_area": "Edge AI",
                "alignment_notes": "Low power compute",
            }
        ],
        "budget": {
            "hardware_cost": 25000.0,
            "cloud_cost": 10000.0,
            "travel_pilot_cost": 5000.0,
            "dataset_acquisition_cost": 0.0,
            "currency": "PHP",
            "total": 40000.0,
        },
        "timeline_weeks": 16,
        "include_ai_advisory": False,
    }

    res_eval = client.post("/api/feasibility/evaluate", json=eval_payload)
    assert res_eval.status_code == 200
    data = res_eval.json()
    assert data["status"] == "success"
    assert data["feasibility"]["feasibility_score"] > 80.0

    # 2. Get session feasibility
    res_get = client.get("/api/feasibility/session/session_api_01")
    assert res_get.status_code == 200
    assert res_get.json()["feasibility"] is not None

    # 3. Compile proposal endpoint
    res_prop = client.post("/api/feasibility/compile-proposal", json={
        "project_id": "proj_api_01",
        "session_id": "session_api_01",
    })
    assert res_prop.status_code == 200
    assert "markdown_content" in res_prop.json()["proposal"]

    # 4. Mentor sign-off endpoint
    res_sign = client.post("/api/feasibility/mentor-signoff", json={
        "project_id": "proj_api_01",
        "phase_number": 6,
        "mentor_name": "Prof. Alan Turing",
        "notes": "Stage F Defense clearance authorized.",
    })
    assert res_sign.status_code == 200
    assert res_sign.json()["status"] == "success"

    # 5. List mentor signoffs
    res_list = client.get("/api/feasibility/mentor-signoff/proj_api_01")
    assert res_list.status_code == 200
    assert res_list.json()["count"] >= 1
    assert res_list.json()["signoffs"][0]["mentor_name"] == "Prof. Alan Turing"


# ==============================================================================
# 5. Research Orchestrator Action Dispatch Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_orchestrator_stage_f_actions(storage: SQLiteStorageAdapter):
    """Verifies that ResearchOrchestrator dispatches Stage F actions cleanly."""
    storage.save_session("session_orch_01", {
        "framework_id": "RESEARCH",
        "current_stage_id": "stage_f_feasibility",
        "project_id": "proj_orch_01",
        "problem_statement": "Post-harvest thermal control in rural Iloilo.",
    })
    orch = ResearchOrchestrator(storage=storage)

    # Dispatch AUDIT_COMPLIANCE_FEASIBILITY
    audit_req = OrchestrationActionDispatchRequest(
        session_id="session_orch_01",
        action_type=ActionType.AUDIT_COMPLIANCE_FEASIBILITY,
        target_engine="feasibility_engine",
        parameters={
            "project_id": "proj_orch_01",
            "timeline_weeks": 16,
            "include_ai_advisory": False,
        },
    )
    audit_res = await orch.dispatch_action(audit_req)
    assert audit_res.status == "SUCCESS"
    assert "feasibility" in audit_res.resulting_artifacts

    # Dispatch COMPILE_PROPOSAL_CANVAS
    prop_req = OrchestrationActionDispatchRequest(
        session_id="session_orch_01",
        action_type=ActionType.COMPILE_PROPOSAL_CANVAS,
        target_engine="proposal_exporter",
        parameters={"project_id": "proj_orch_01"},
    )
    prop_res = await orch.dispatch_action(prop_req)
    assert prop_res.status == "SUCCESS"
    assert "proposal" in prop_res.resulting_artifacts
    assert "markdown_content" in prop_res.resulting_artifacts["proposal"]
