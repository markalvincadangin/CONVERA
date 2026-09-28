"""
Tests for Contract-Driven Session Lifecycle & Canonical Progress Hydration
==========================================================================
Governed by: CONVERA Concept Development Standard (CCDS v2.0)
Verification Protocol: SPEC-METHODOLOGY-CONTRACT-002-SDD-02-REV-01
"""
import pytest
from fastapi.testclient import TestClient

from server import app
from storage.sqlite_adapter import (
    SQLiteStorageAdapter,
    WorkflowStateCorruptedError,
    derive_legacy_phase_projection,
    synthesize_canonical_stage_progress,
)
from contracts.methodology import (
    INNOVATION_CONTRACT,
    RESEARCH_CONTRACT,
    get_methodology_contract,
    METHODOLOGY_REGISTRY,
)


@pytest.fixture
def temp_adapter(tmp_path):
    """Isolated SQLite adapter fixture that does not mutate convera.db."""
    db_file = tmp_path / "lifecycle_contracts_test.db"
    return SQLiteStorageAdapter(db_path=str(db_file))


@pytest.fixture
def test_client():
    return TestClient(app)


# ===========================================================================
# 1. Contract Method Tests
# ===========================================================================

class TestContractMethodPrimitives:
    """Tests pure MethodologyContract methods create_initial_stage_progress and synthesize_stage_progress."""

    def test_innovation_create_initial_stage_progress(self):
        progress = INNOVATION_CONTRACT.create_initial_stage_progress()
        assert progress["schema_version"] == 1
        assert progress["framework_id"] == "INNOVATION"
        assert progress["current_stage_id"] == "p1_discovery"
        stages = progress["stages"]
        assert len(stages) == 5
        assert "studio" not in stages

        # Stage 0 is IN_PROGRESS with gate_id None, NOT_REQUIRED
        assert stages["p1_discovery"]["status"] == "IN_PROGRESS"
        assert stages["p1_discovery"]["gate_id"] is None
        assert stages["p1_discovery"]["gate_status"] == "NOT_REQUIRED"

        # Subsequent stages are LOCKED
        assert stages["p2_screening"]["status"] == "LOCKED"
        assert stages["p2_screening"]["gate_id"] == "GATE_1"
        assert stages["p2_screening"]["gate_status"] == "NOT_REQUIRED"

        assert stages["p3_mom_test"]["status"] == "LOCKED"
        assert stages["p3_mom_test"]["gate_id"] == "GATE_2"
        assert stages["p3_mom_test"]["gate_status"] == "NOT_REQUIRED"

        assert stages["p4_mechanism"]["status"] == "LOCKED"
        assert stages["p4_mechanism"]["gate_id"] is None
        assert stages["p4_mechanism"]["gate_status"] == "NOT_REQUIRED"

        assert stages["p5_economics"]["status"] == "LOCKED"
        assert stages["p5_economics"]["gate_id"] == "GATE_3"
        assert stages["p5_economics"]["gate_status"] == "NOT_REQUIRED"

    def test_research_create_initial_stage_progress(self):
        progress = RESEARCH_CONTRACT.create_initial_stage_progress()
        assert progress["schema_version"] == 1
        assert progress["framework_id"] == "RESEARCH"
        assert progress["current_stage_id"] == "stage_a_scouting"
        stages = progress["stages"]
        assert len(stages) == 6
        assert "studio" not in stages

        # Stage A is IN_PROGRESS
        assert stages["stage_a_scouting"]["status"] == "IN_PROGRESS"
        assert stages["stage_a_scouting"]["gate_id"] is None
        assert stages["stage_a_scouting"]["gate_status"] == "NOT_REQUIRED"

        # Stages B-F are LOCKED with correct gates
        assert stages["stage_b_validation"]["status"] == "LOCKED"
        assert stages["stage_b_validation"]["gate_id"] == "GATE_1"

        assert stages["stage_c_opportunity"]["status"] == "LOCKED"
        assert stages["stage_c_opportunity"]["gate_id"] == "GATE_2"

        assert stages["stage_d_formulation"]["status"] == "LOCKED"
        assert stages["stage_d_formulation"]["gate_id"] is None

        assert stages["stage_e_evaluation"]["status"] == "LOCKED"
        assert stages["stage_e_evaluation"]["gate_id"] == "GATE_3"

        assert stages["stage_f_feasibility"]["status"] == "LOCKED"
        assert stages["stage_f_feasibility"]["gate_id"] == "GATE_4"

    def test_innovation_synthesize_all_false(self):
        synthesized = INNOVATION_CONTRACT.synthesize_stage_progress([False, False, False, False, False])
        initial = INNOVATION_CONTRACT.create_initial_stage_progress()
        assert synthesized == initial

    def test_research_synthesize_all_false(self):
        synthesized = RESEARCH_CONTRACT.synthesize_stage_progress([False, False, False, False, False])
        initial = RESEARCH_CONTRACT.create_initial_stage_progress()
        assert synthesized == initial

    def test_innovation_synthesize_partial(self):
        # p1 and p2 complete
        synthesized = INNOVATION_CONTRACT.synthesize_stage_progress([True, True, False, False, False])
        stages = synthesized["stages"]
        assert stages["p1_discovery"]["status"] == "COMPLETED"
        assert stages["p2_screening"]["status"] == "COMPLETED"
        assert stages["p2_screening"]["gate_status"] == "PASSED"
        assert stages["p3_mom_test"]["status"] == "IN_PROGRESS"
        assert stages["p4_mechanism"]["status"] == "LOCKED"
        assert stages["p5_economics"]["status"] == "LOCKED"
        assert synthesized["current_stage_id"] == "p3_mom_test"

    def test_research_synthesize_partial(self):
        # stage A and B complete
        synthesized = RESEARCH_CONTRACT.synthesize_stage_progress([True, True, False, False, False])
        stages = synthesized["stages"]
        assert stages["stage_a_scouting"]["status"] == "COMPLETED"
        assert stages["stage_b_validation"]["status"] == "COMPLETED"
        assert stages["stage_b_validation"]["gate_status"] == "PASSED"
        assert stages["stage_c_opportunity"]["status"] == "IN_PROGRESS"
        assert stages["stage_d_formulation"]["status"] == "LOCKED"
        assert stages["stage_e_evaluation"]["status"] == "LOCKED"
        assert stages["stage_f_feasibility"]["status"] == "LOCKED"
        assert synthesized["current_stage_id"] == "stage_c_opportunity"

    def test_innovation_synthesize_all_complete(self):
        synthesized = INNOVATION_CONTRACT.synthesize_stage_progress([True, True, True, True, True])
        assert synthesized["current_stage_id"] == "studio"
        for s in synthesized["stages"].values():
            assert s["status"] == "COMPLETED"

    def test_research_synthesize_all_complete(self):
        synthesized = RESEARCH_CONTRACT.synthesize_stage_progress([True, True, True, True, True])
        assert synthesized["current_stage_id"] == "studio"
        for s in synthesized["stages"].values():
            assert s["status"] == "COMPLETED"


# ===========================================================================
# 2. Legacy Projection Parity Tests
# ===========================================================================

class TestLegacyProjectionParity:
    """Verifies derive_legacy_phase_projection behavior across both tracks."""

    def test_legacy_projection_innovation_fresh(self):
        sp = INNOVATION_CONTRACT.create_initial_stage_progress()
        proj = derive_legacy_phase_projection("INNOVATION", sp)
        assert proj == {f"phase{i}_complete": False for i in range(1, 6)}

    def test_legacy_projection_research_fresh(self):
        sp = RESEARCH_CONTRACT.create_initial_stage_progress()
        proj = derive_legacy_phase_projection("RESEARCH", sp)
        assert proj == {f"phase{i}_complete": False for i in range(1, 6)}

    def test_legacy_projection_research_compound_terminal(self):
        # Both Stage E and Stage F completed
        sp = RESEARCH_CONTRACT.synthesize_stage_progress([True, True, True, True, True])
        proj = derive_legacy_phase_projection("RESEARCH", sp)
        assert proj["phase1_complete"] is True
        assert proj["phase2_complete"] is True
        assert proj["phase3_complete"] is True
        assert proj["phase4_complete"] is True
        assert proj["phase5_complete"] is True

    def test_legacy_projection_research_e_only(self):
        # Explicit progress with Stage E completed but Stage F not completed
        sp = RESEARCH_CONTRACT.create_initial_stage_progress()
        sp["stages"]["stage_a_scouting"]["status"] = "COMPLETED"
        sp["stages"]["stage_b_validation"]["status"] = "COMPLETED"
        sp["stages"]["stage_c_opportunity"]["status"] = "COMPLETED"
        sp["stages"]["stage_d_formulation"]["status"] = "COMPLETED"
        sp["stages"]["stage_e_evaluation"]["status"] = "COMPLETED"
        sp["stages"]["stage_f_feasibility"]["status"] = "IN_PROGRESS"

        proj = derive_legacy_phase_projection("RESEARCH", sp)
        assert proj["phase1_complete"] is True
        assert proj["phase2_complete"] is True
        assert proj["phase3_complete"] is True
        assert proj["phase4_complete"] is True
        # Compound terminal condition requires BOTH E and F completed
        assert proj["phase5_complete"] is False

    def test_legacy_projection_unknown_framework(self):
        sp = {"stages": {}}
        proj = derive_legacy_phase_projection("UNKNOWN_TRACK", sp)
        assert proj == {f"phase{i}_complete": False for i in range(1, 6)}


# ===========================================================================
# 3. Contract Resolution Tests
# ===========================================================================

class TestContractRegistryStrictness:
    """Verifies exact registry lookup and prefix-matching removal."""

    def test_registry_exact_innovation(self):
        assert get_methodology_contract("INNOVATION") is INNOVATION_CONTRACT

    def test_registry_exact_research(self):
        assert get_methodology_contract("RESEARCH") is RESEARCH_CONTRACT

    def test_registry_ratchet(self):
        assert get_methodology_contract("INNOVATION_RATCHET") is INNOVATION_CONTRACT

    def test_registry_unknown_returns_none(self):
        assert get_methodology_contract("HYPOTHETICAL") is None

    def test_registry_prefix_no_longer_resolves(self):
        # Prefix matching was removed in Slice 2
        assert get_methodology_contract("INNOVATION_V9") is None
        assert get_methodology_contract("RESEARCH_PILOT") is None

    def test_registry_none_returns_none(self):
        assert get_methodology_contract(None) is None

    def test_registry_empty_returns_none(self):
        assert get_methodology_contract("") is None
        assert get_methodology_contract("   ") is None


# ===========================================================================
# 4. Session Creation Validation Tests
# ===========================================================================

class TestSessionCreationValidation:
    """Verifies POST /api/sessions request validation."""

    def test_create_session_valid_innovation(self, test_client):
        res = test_client.post("/api/sessions", json={"framework_id": "INNOVATION"})
        assert res.status_code == 200
        data = res.json()
        assert data["framework_id"] == "INNOVATION"

    def test_create_session_valid_research(self, test_client):
        res = test_client.post("/api/sessions", json={"framework_id": "RESEARCH"})
        assert res.status_code == 200
        data = res.json()
        assert data["framework_id"] == "RESEARCH"

    def test_create_session_null_framework(self, test_client):
        res = test_client.post("/api/sessions", json={"framework_id": None})
        assert res.status_code == 400
        assert "framework_id is required" in res.json()["detail"]

    def test_create_session_empty_framework(self, test_client):
        res = test_client.post("/api/sessions", json={"framework_id": ""})
        assert res.status_code == 400
        assert "framework_id is required" in res.json()["detail"]

    def test_create_session_whitespace_framework(self, test_client):
        res = test_client.post("/api/sessions", json={"framework_id": "   "})
        assert res.status_code == 400
        assert "framework_id is required" in res.json()["detail"]

    def test_create_session_unknown_framework(self, test_client):
        res = test_client.post("/api/sessions", json={"framework_id": "UNKNOWN_V9"})
        assert res.status_code == 400
        assert "Unknown framework" in res.json()["detail"]

    def test_create_session_default_omitted(self, test_client):
        # When omitted, Pydantic defaults to INNOVATION
        res = test_client.post("/api/sessions", json={"project_name": "Test Omitted"})
        assert res.status_code == 200
        assert res.json()["framework_id"] == "INNOVATION"


# ===========================================================================
# 5. Framework Switching Tests
# ===========================================================================

class TestFrameworkSwitchingIsolation:
    """Verifies switch_session_framework stage_progress isolation and restoration."""

    def test_switch_innovation_to_research(self, temp_adapter):
        session_id = "sess_switch_1"
        temp_adapter.save_session(session_id, {
            "session_id": session_id,
            "project_id": "proj_1",
            "framework_id": "INNOVATION",
            "phase1_complete": True,
        })

        switched = temp_adapter.switch_session_framework(session_id, "RESEARCH")
        assert switched["framework_id"] == "RESEARCH"
        assert switched["stage_progress"]["framework_id"] == "RESEARCH"
        assert switched["stage_progress"]["current_stage_id"] == "stage_a_scouting"

        # Check framework_progress preserved Innovation
        fp = switched["framework_progress"]
        assert "INNOVATION" in fp
        assert fp["INNOVATION"]["stage_progress"]["framework_id"] == "INNOVATION"
        assert fp["INNOVATION"]["phase1_complete"] is True

    def test_switch_roundtrip(self, temp_adapter):
        session_id = "sess_switch_roundtrip"
        # 1. Start in Innovation with p1 and p2 complete
        temp_adapter.save_session(session_id, {
            "session_id": session_id,
            "project_id": "proj_1",
            "framework_id": "INNOVATION",
            "phase1_complete": True,
            "phase2_complete": True,
        })
        s1 = temp_adapter.get_session(session_id)
        assert s1["stage_progress"]["current_stage_id"] == "p3_mom_test"

        # 2. Switch to Research (fresh start)
        temp_adapter.switch_session_framework(session_id, "RESEARCH")
        s2 = temp_adapter.get_session(session_id)
        assert s2["framework_id"] == "RESEARCH"
        assert s2["stage_progress"]["current_stage_id"] == "stage_a_scouting"

        # 3. Progress Research stage A
        s2["phase1_complete"] = True
        temp_adapter.save_session(session_id, s2)
        s2_prog = temp_adapter.get_session(session_id)
        assert s2_prog["stage_progress"]["current_stage_id"] == "stage_b_validation"

        # 4. Switch back to Innovation
        temp_adapter.switch_session_framework(session_id, "INNOVATION")
        s3 = temp_adapter.get_session(session_id)
        assert s3["framework_id"] == "INNOVATION"
        # Innovation progress must be restored intact!
        assert s3["stage_progress"]["current_stage_id"] == "p3_mom_test"
        assert s3["stage_progress"]["stages"]["p1_discovery"]["status"] == "COMPLETED"
        assert s3["stage_progress"]["stages"]["p2_screening"]["status"] == "COMPLETED"
        # Research progress must be preserved in framework_progress!
        assert s3["framework_progress"]["RESEARCH"]["stage_progress"]["current_stage_id"] == "stage_b_validation"

    def test_switch_same_noop(self, temp_adapter):
        session_id = "sess_switch_noop"
        temp_adapter.save_session(session_id, {
            "session_id": session_id,
            "project_id": "proj_1",
            "framework_id": "INNOVATION",
        })
        res = temp_adapter.switch_session_framework(session_id, "INNOVATION")
        assert res["framework_id"] == "INNOVATION"

    def test_switch_unknown_raises(self, temp_adapter):
        session_id = "sess_switch_err"
        temp_adapter.save_session(session_id, {
            "session_id": session_id,
            "project_id": "proj_1",
            "framework_id": "INNOVATION",
        })
        with pytest.raises(ValueError, match="unknown framework 'UNKNOWN_TRACK'"):
            temp_adapter.switch_session_framework(session_id, "UNKNOWN_TRACK")

    def test_switch_old_format_compat(self, temp_adapter):
        # Pre-slice 2 format: framework_progress entry has only legacy booleans, no stage_progress
        session_id = "sess_switch_old_fmt"
        temp_adapter.save_session(session_id, {
            "session_id": session_id,
            "project_id": "proj_1",
            "framework_id": "INNOVATION",
            "framework_progress": {
                "RESEARCH": {
                    "phase1_complete": True,
                    "phase2_complete": False,
                    # Note: stage_progress missing
                }
            }
        })
        switched = temp_adapter.switch_session_framework(session_id, "RESEARCH")
        assert switched["framework_id"] == "RESEARCH"
        # Should initialize fresh valid stage_progress
        assert switched["stage_progress"]["framework_id"] == "RESEARCH"
        assert switched["stage_progress"]["current_stage_id"] == "stage_a_scouting"


# ===========================================================================
# 6. Backward Compatibility & Hydration Tests
# ===========================================================================

class TestBackwardCompatibilityAndHydration:
    """Verifies historical immutability and lazy migration."""

    def test_save_without_framework(self, temp_adapter):
        # Caller omits framework_id: must default to INNOVATION (INV-METHODOLOGY-005)
        saved = temp_adapter.save_session("sess_no_fw", {
            "session_id": "sess_no_fw",
            "project_name": "Legacy Session",
        })
        assert saved["framework_id"] == "INNOVATION"
        assert saved["stage_progress"]["framework_id"] == "INNOVATION"
        assert saved["stage_progress"]["current_stage_id"] == "p1_discovery"

    def test_save_explicit_unknown_raises(self, temp_adapter):
        # Explicit unknown framework without stage_progress raises ValueError
        with pytest.raises(ValueError, match="unknown framework 'HYPOTHETICAL_UNKNOWN'"):
            temp_adapter.save_session("sess_unknown", {
                "session_id": "sess_unknown",
                "framework_id": "HYPOTHETICAL_UNKNOWN",
            })

    def test_get_legacy_hydration(self, temp_adapter):
        # Insert a raw legacy row directly into SQLite without stage_progress in state_data
        session_id = "sess_raw_legacy"
        with temp_adapter._get_connection() as conn:
            conn.execute(
                "INSERT INTO projects (id, share_code, name) VALUES (?, ?, ?)",
                ("p_raw", "SHARE123", "Raw Legacy")
            )
            conn.execute("""
                INSERT INTO sessions (
                    session_id, project_id, project_name, state_data,
                    phase1_complete, phase2_complete, phase3_complete, phase4_complete, phase5_complete,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (session_id, "p_raw", "Raw Legacy", '{"project_name": "Raw Legacy", "phase1_complete": true}', 1, 0, 0, 0, 0, "2026-01-01T00:00:00Z"))

        hydrated = temp_adapter.get_session(session_id)
        assert hydrated["framework_id"] == "INNOVATION"
        assert "stage_progress" in hydrated
        assert hydrated["stage_progress"]["framework_id"] == "INNOVATION"
        assert hydrated["stage_progress"]["stages"]["p1_discovery"]["status"] == "COMPLETED"
        assert hydrated["stage_progress"]["stages"]["p2_screening"]["status"] == "IN_PROGRESS"
        assert hydrated["current_stage_id"] == "p2_screening"
