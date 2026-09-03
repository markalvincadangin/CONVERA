import pytest
import os
import gc
from engines.framework_engine import (
    list_frameworks,
    get_framework,
    FRAMEWORK_REGISTRY,
    FrameworkCategory
)
from storage.sqlite_adapter import SQLiteStorageAdapter


def test_list_frameworks():
    fws = list_frameworks()
    assert len(fws) >= 4
    ids = {f["id"] for f in fws}
    assert "INNOVATION" in ids
    assert "RESEARCH" in ids
    assert "CAPSTONE" in ids
    assert "PRODUCT" in ids


def test_get_innovation_framework():
    fw = get_framework("INNOVATION")
    assert fw is not None
    assert fw.category == FrameworkCategory.INNOVATION
    assert len(fw.stages) == 5
    assert len(fw.gates) == 2
    assert "4-Claim Evidence Ledger" in fw.required_artifacts
    assert "Decision Records" in fw.required_artifacts


def test_get_research_framework():
    fw = get_framework("RESEARCH")
    assert fw is not None
    assert fw.category == FrameworkCategory.RESEARCH
    assert len(fw.stages) == 6
    assert len(fw.gates) == 4
    # Verify stages A through F
    stage_codes = [s.code for s in fw.stages]
    assert stage_codes == ["Stage A", "Stage B", "Stage C", "Stage D", "Stage E", "Stage F"]
    # Verify 4 gates
    gate_ids = [g.id for g in fw.gates]
    assert "research_gate_1" in gate_ids
    assert "research_gate_2" in gate_ids
    assert "research_gate_3" in gate_ids
    assert "research_gate_4" in gate_ids


def test_sqlite_framework_persistence_and_switch(tmp_path):
    db_path = str(tmp_path / "test_framework.db")
    adapter = SQLiteStorageAdapter(db_path=db_path)
    
    # 1. Create a session with default framework
    session_id = "test_sess_001"
    adapter.save_session(session_id, {
        "session_id": session_id,
        "project_name": "Test Venture Project",
        "framework_id": "INNOVATION"
    })
    
    sess = adapter.get_session(session_id)
    assert sess is not None
    assert sess["framework_id"] == "INNOVATION"
    
    # 2. Switch framework to RESEARCH
    updated = adapter.switch_session_framework(session_id, "RESEARCH")
    assert updated is not None
    assert updated["framework_id"] == "RESEARCH"
    
    reloaded = adapter.get_session(session_id)
    assert reloaded["framework_id"] == "RESEARCH"
