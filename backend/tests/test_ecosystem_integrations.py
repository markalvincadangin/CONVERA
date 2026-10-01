"""
Integration & Unit Tests for Ecosystem Integrations & Research Dissemination Bridge (SDD-023)
==============================================================================================
Governed by: CONVERA Constitution Article I (Evidence Grounding),
             Article II (Tri-Part Confidence),
             Article IV (Human Sovereignty),
             Article VII (Anti-Creep Law - 0 new dependencies),
             Article VIII (Degraded Resilience - 100% offline dry run)
"""

import os
import json
import tempfile
import pytest
from typing import Generator, Dict, Any
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.ecosystem_sync_engine import EcosystemSyncEngine
from models.ecosystem import (
    EcosystemProvider,
    SyncActionType,
    SyncStatus,
    NotionExportRequest,
    NotionImportRequest,
    ZoteroExportRequest,
    GitHubExportRequest,
)
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
def engine(storage: SQLiteStorageAdapter) -> EcosystemSyncEngine:
    return EcosystemSyncEngine(storage=storage)


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


def _seed_ecosystem_test_session(storage: SQLiteStorageAdapter, session_id: str = "sess_eco_test") -> Dict[str, str]:
    """Helper to populate session, project, problem, artifacts, and scholarly works."""
    project_id = "proj_eco_001"
    problem_id = "prob_eco_001"

    with storage._get_connection() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO projects (id, name, share_code) VALUES (?, ?, ?)",
            (project_id, "Island Cold Chain DSR", "ICCDSR"),
        )
        conn.execute(
            """
            INSERT OR REPLACE INTO problems (
                id, project_id, sector, problem_statement, evidence_tier, status
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                problem_id,
                project_id,
                "Agriculture & Cold Chain",
                "High post-harvest loss in mango transit between Guimaras and Iloilo.",
                "Tier 1",
                "active",
            ),
        )

    from contracts.methodology import RESEARCH_CONTRACT
    initial_stage_progress = RESEARCH_CONTRACT.create_initial_stage_progress()

    storage.save_session(
        session_id=session_id,
        state_data={"active_phase": "feasibility", "stage_progress": initial_stage_progress},
        project_id=project_id,
    )

    with storage._get_connection() as conn:
        conn.execute(
            "UPDATE sessions SET active_problem_id = ?, current_research_stage = ? WHERE session_id = ?",
            (problem_id, "stage_f", session_id),
        )
        # Seed DSR artifact
        conn.execute(
            """
            INSERT OR REPLACE INTO dsr_artifacts (
                id, problem_id, session_id, dsr_class, title, description, kernel_theory, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (
                "art_eco_001",
                problem_id,
                session_id,
                "INSTANTIATION",
                "IoT Telemetry Capsule & Phase-Change Transit Box",
                "Thermal insulated maritime container with real-time LoRaWAN beacon.",
                "Design Theory for Resilient Archipelago Logistics",
            ),
        )
        # Seed Feasibility record
        conn.execute(
            """
            INSERT OR REPLACE INTO research_feasibility_records (
                id, session_id, project_id, ethics_checklist_json, sdg_alignments_json,
                dost_alignments_json, budget_breakdown_json, timeline_weeks,
                feasibility_score, compliance_passed, is_cleared, advisory_notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (
                "feas_eco_001",
                session_id,
                project_id,
                json.dumps({"irb_approved": True}),
                json.dumps(["SDG-12", "SDG-14"]),
                json.dumps(["DOST-NICER"]),
                json.dumps({"hardware": 50000}),
                10,
                0.88,
                1,
                1,
                "Ready for inter-island field trials under MARINA maritime guidelines.",
            ),
        )
        # Seed Scholarly work
        conn.execute(
            """
            INSERT OR REPLACE INTO scholarly_works (
                id, title, authors, year, venue, doi, abstract, citation_count, source_connector
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "sw_eco_001",
                "Phase Change Thermal Buffering for Tropical Archipelagos",
                json.dumps(["Cadangin, M. A.", "Santos, E."]),
                2025,
                "Journal of Postharvest Technology",
                "10.1016/j.jpt.2025.01.005",
                "Passive phase change thermal buffering prevents fruit softening.",
                14,
                "openalex",
            ),
        )

    return {"project_id": project_id, "problem_id": problem_id, "session_id": session_id}


def test_notion_export_dry_run(client: TestClient, storage: SQLiteStorageAdapter):
    """Test exporting Gate 4 proposal canvas to Notion in offline dry-run mode."""
    data = _seed_ecosystem_test_session(storage, "sess_notion_test")
    session_id = data["session_id"]

    payload = {
        "session_id": session_id,
        "include_literature_matrix": True,
        "dry_run": True,
    }

    res = client.post("/api/ecosystem/notion/export", json=payload)
    assert res.status_code == 200, res.text
    result = res.json()

    assert result["session_id"] == session_id
    assert result["provider"] == "notion"
    assert result["action_type"] == "export_proposal"
    assert result["status"] == "dry_run"
    assert len(result["state_hash"]) == 64
    assert "# CONVERA Research Dossier" in result["preview_content"]
    assert "High post-harvest loss in mango transit" in result["preview_content"]
    assert "Composite Feasibility Score" in result["preview_content"]

    # Verify Table 38 record
    records = storage.list_ecosystem_sync_records(session_id)
    assert len(records) >= 1
    assert records[0]["provider"] == "notion"
    assert records[0]["state_hash"] == result["state_hash"]


def test_notion_import_offline(client: TestClient, storage: SQLiteStorageAdapter):
    """Test importing field notes from Notion into CONVERA Problem Bank in offline mode."""
    data = _seed_ecosystem_test_session(storage, "sess_notion_import")
    session_id = data["session_id"]

    payload = {
        "session_id": session_id,
        "sector": "Maritime Transport",
        "limit": 5,
    }

    res = client.post("/api/ecosystem/notion/import", json=payload)
    assert res.status_code == 200, res.text
    result = res.json()

    assert result["session_id"] == session_id
    assert result["imported_count"] >= 1
    assert len(result["state_hash"]) == 64
    assert len(result["problems"]) >= 1

    # Verify problem exists in problems table
    with storage._get_connection() as conn:
        cursor = conn.execute(
            "SELECT * FROM problems WHERE session_id = ? AND sector = ?",
            (session_id, "Maritime Transport"),
        )
        saved = cursor.fetchall()
        assert len(saved) >= 1


def test_zotero_export_bibtex_and_csl(client: TestClient, storage: SQLiteStorageAdapter):
    """Test exporting scholarly literature to Zotero in BibTeX and CSL-JSON formats."""
    data = _seed_ecosystem_test_session(storage, "sess_zotero_test")
    session_id = data["session_id"]

    # 1. BibTeX format
    bib_payload = {
        "session_id": session_id,
        "format": "bibtex",
        "collection_name": "Tropical Cold Chain",
        "dry_run": True,
    }
    res_bib = client.post("/api/ecosystem/zotero/export", json=bib_payload)
    assert res_bib.status_code == 200, res_bib.text
    bib_result = res_bib.json()

    assert bib_result["provider"] == "zotero"
    assert "@article{" in bib_result["preview_content"]
    assert "Phase Change Thermal Buffering" in bib_result["preview_content"]
    assert len(bib_result["state_hash"]) == 64

    # 2. CSL-JSON format
    csl_payload = {
        "session_id": session_id,
        "format": "csl_json",
        "collection_name": "Tropical Cold Chain",
        "dry_run": True,
    }
    res_csl = client.post("/api/ecosystem/zotero/export", json=csl_payload)
    assert res_csl.status_code == 200, res_csl.text
    csl_result = res_csl.json()

    assert csl_result["provider"] == "zotero"
    parsed_csl = json.loads(csl_result["preview_content"])
    assert isinstance(parsed_csl, list)
    assert len(parsed_csl) >= 1
    assert parsed_csl[0]["title"] == "Phase Change Thermal Buffering for Tropical Archipelagos"


def test_github_export_issue_manifest(client: TestClient, storage: SQLiteStorageAdapter):
    """Test translating DSR artifacts into GitHub Issue batch manifests."""
    data = _seed_ecosystem_test_session(storage, "sess_gh_test")
    session_id = data["session_id"]

    payload = {
        "session_id": session_id,
        "repository": "markalvincadangin/CONVERA",
        "milestone_title": "Phase E Release",
        "dry_run": True,
    }

    res = client.post("/api/ecosystem/github/export", json=payload)
    assert res.status_code == 200, res.text
    result = res.json()

    assert result["provider"] == "github"
    assert result["action_type"] == "export_issues"
    assert result["items_count"] == 3
    assert "# GitHub Issue Manifest: Phase E Release" in result["preview_content"]
    assert "IoT Telemetry Capsule" in result["preview_content"]
    assert len(result["state_hash"]) == 64


def test_ecosystem_audit_trail(client: TestClient, storage: SQLiteStorageAdapter):
    """Test retrieving session ecosystem sync audit trail with SHA-256 state hashes."""
    data = _seed_ecosystem_test_session(storage, "sess_audit_test")
    session_id = data["session_id"]

    # Perform multiple sync operations
    client.post("/api/ecosystem/notion/export", json={"session_id": session_id, "dry_run": True})
    client.post("/api/ecosystem/zotero/export", json={"session_id": session_id, "dry_run": True})
    client.post("/api/ecosystem/github/export", json={"session_id": session_id, "dry_run": True})

    res = client.get(f"/api/ecosystem/audit-trail/{session_id}")
    assert res.status_code == 200, res.text
    history = res.json()

    assert len(history) == 3
    providers = {h["provider"] for h in history}
    assert providers == {"notion", "zotero", "github"}
    for h in history:
        assert len(h["state_hash"]) == 64
        assert h["status"] == "dry_run"


def test_deterministic_state_hash(client: TestClient, storage: SQLiteStorageAdapter):
    """Article I & II: Verify cryptographic reproducibility of preview state hash."""
    data = _seed_ecosystem_test_session(storage, "sess_hash_test")
    session_id = data["session_id"]

    res1 = client.post("/api/ecosystem/github/export", json={"session_id": session_id, "dry_run": True})
    res2 = client.post("/api/ecosystem/github/export", json={"session_id": session_id, "dry_run": True})

    assert res1.status_code == 200
    assert res2.status_code == 200
    assert res1.json()["state_hash"] == res2.json()["state_hash"]


def test_degraded_resilience_unseeded_session(client: TestClient, storage: SQLiteStorageAdapter):
    """Article VIII: Verify graceful dry-run payload generation when session is newly created without research artifacts."""
    empty_session_id = "sess_empty_001"
    from contracts.methodology import RESEARCH_CONTRACT
    initial_stage_progress = RESEARCH_CONTRACT.create_initial_stage_progress()
    storage.save_session(
        session_id=empty_session_id,
        state_data={"active_phase": "contextualization", "stage_progress": initial_stage_progress},
    )

    res = client.post("/api/ecosystem/notion/export", json={"session_id": empty_session_id, "dry_run": True})
    assert res.status_code == 200
    result = res.json()
    assert result["status"] == "dry_run"
    assert "CONVERA Research Dossier" in result["preview_content"]
    assert len(result["state_hash"]) == 64

