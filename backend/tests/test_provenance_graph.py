"""
Integration & Unit Tests for Interactive Evidence Chain & Provenance Graph (SDD-022)
====================================================================================
Governed by: CONVERA Constitution Article I (Evidence Grounding),
             Article II (Tri-Part Confidence),
             Article IV (Human Sovereignty),
             Article VII (Anti-Creep Law),
             Article VIII (Degraded Resilience)
"""

import os
import json
import tempfile
import pytest
from typing import Generator, Dict, Any
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.provenance_graph_engine import ProvenanceGraphEngine
from models.provenance import (
    ProvenanceFilterQuery,
    ProvenanceNodeType,
    ProvenanceEdgeType,
    EpistemicTier,
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
def engine(storage: SQLiteStorageAdapter) -> ProvenanceGraphEngine:
    return ProvenanceGraphEngine(storage=storage)


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


def _seed_multi_tier_research_data(storage: SQLiteStorageAdapter, session_id: str = "sess_prov_test") -> Dict[str, str]:
    """Helper to populate ground-truth relational records across all 6 epistemic tiers."""
    project_id = "proj_prov_test"
    with storage._get_connection() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO projects (id, name, share_code) VALUES (?, ?, ?)",
            (project_id, "Provenance Test Lab", "PROVLAB"),
        )

    # 1. Active Problem & Session
    problem_id = "PROB_PROV_001"
    with storage._get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO problems (
                id, project_id, sector, problem_statement, evidence_tier, status
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                problem_id,
                project_id,
                "Healthcare IoT",
                "Patient health data leakage during distributed gradient aggregation.",
                "EMPIRICAL",
                "ACTIVE",
            ),
        )

    from contracts.methodology import RESEARCH_CONTRACT
    initial_stage_progress = RESEARCH_CONTRACT.create_initial_stage_progress()

    storage.save_session(
        session_id=session_id,
        state_data={"active_phase": "contextualization", "stage_progress": initial_stage_progress},
        project_id=project_id,
    )
    with storage._get_connection() as conn:
        conn.execute(
            "UPDATE sessions SET active_problem_id = ?, current_research_stage = ? WHERE session_id = ?",
            (problem_id, "stage_c", session_id),
        )

    # 2. Tier 0: Scholarly Works & Problem Sources
    sw_id = "sw_prov_001"
    source_id = 9001
    with storage._get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO scholarly_works (
                id, title, authors, year, venue, doi, abstract, citation_count, source_connector
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sw_id,
                "Differential Privacy in Distributed Clinical Trials",
                json.dumps(["Dr. Alice Chen", "Dr. Bob Miller"]),
                2024,
                "IEEE Trans Med Robotics",
                "10.1109/TMED.2024.101",
                "We establish empirical bounds on gradient leakage in medical IoT sensors.",
                42,
                "openalex",
            ),
        )
        conn.execute(
            """
            INSERT OR REPLACE INTO problem_sources (
                id, problem_id, source_name, source_url, source_tier, evidence_type, scholarly_work_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                source_id,
                problem_id,
                "Differential Privacy in Distributed Clinical Trials",
                "https://doi.org/10.1109/TMED.2024.101",
                "A",
                "ACADEMIC_PAPER",
                sw_id,
            ),
        )

    # 3. Tier 1: Problem Claims & Evidence Links
    claim_id_1 = "claim_prov_001"
    claim_id_2 = "claim_prov_002"
    with storage._get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO problem_claims (
                id, problem_id, claim_type, claim_text, status, confidence_score
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                claim_id_1,
                problem_id,
                "VULNERABILITY",
                "Gradient aggregation without clipping leaks 28% of patient biosignals.",
                "VALIDATED",
                88.0,
            ),
        )
        conn.execute(
            """
            INSERT OR REPLACE INTO problem_claims (
                id, problem_id, claim_type, claim_text, status, confidence_score
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                claim_id_2,
                problem_id,
                "FEASIBILITY",
                "Homomorphic encryption adds unacceptable latency to battery-powered nodes.",
                "HYPOTHESIS",
                62.0,
            ),
        )
        # Link Tier 0 -> Tier 1
        conn.execute(
            """
            INSERT OR REPLACE INTO claim_evidence_links (
                id, claim_id, source_id, relation_type, evidence_strength, rationale
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                "link_prov_001",
                claim_id_1,
                source_id,
                "SUPPORTS",
                "STRONG",
                "Figure 4 proves 28% signal recovery from raw gradient norm analysis.",
            ),
        )

    # 4. Tier 2: Problem Assumptions
    asm_id = "asm_prov_001"
    with storage._get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO problem_assumptions (
                id, problem_id, assumption_text, risk_level, status, origin
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                asm_id,
                problem_id,
                "Clinical sensor hardware lacks dedicated cryptographic coprocessors.",
                "HIGH",
                "VALIDATED",
                "DEVILS_ADVOCATE",
            ),
        )

    # 5. Tier 3: DSR Artifacts
    art_id = "art_prov_001"
    with storage._get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO dsr_artifacts (
                id, problem_id, session_id, title, dsr_class, description,
                kernel_theory, linked_claim_ids, feasibility_score, novelty_score, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                art_id,
                problem_id,
                session_id,
                "Adaptive Quantization Noise Protocol (AQNP)",
                "METHOD",
                "A dynamic differential noise injection method for low-power biometric streams.",
                "Information-Theoretic Privacy & Shannon Equivocation",
                json.dumps([claim_id_1]),
                0.85,
                0.78,
                "SELECTED",
            ),
        )

    # 6. Tier 4: Concept Evaluations
    eval_id = "eval_prov_001"
    with storage._get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO concept_evaluations (
                id, concept_id, session_id, evaluator_type, composite_score,
                dimension_scores, strengths, vulnerabilities, recommendation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                eval_id,
                art_id,
                session_id,
                "DETERMINISTIC_RUBRIC",
                0.87,
                json.dumps({"methodology": 0.90, "novelty": 0.85, "feasibility": 0.86}),
                json.dumps(["Strong mathematical grounding", "Fits target edge devices"]),
                json.dumps(["Requires empirical validation in clinical testbed"]),
                "RECOMMENDED",
            ),
        )

    # 7. Tier 5: Feasibility Records
    feas_id = "feas_prov_001"
    with storage._get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO research_feasibility_records (
                id, session_id, project_id, ethics_checklist_json, sdg_alignments_json,
                dost_alignments_json, budget_breakdown_json, timeline_weeks,
                feasibility_score, compliance_passed, is_cleared, advisory_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                feas_id,
                session_id,
                project_id,
                json.dumps({"irb_approved": True}),
                json.dumps(["SDG-3 Good Health"]),
                json.dumps(["Health Research Program"]),
                json.dumps({"total": 75000}),
                24,
                0.89,
                1,
                1,
                "Cleared for Gate 4 proposal submission.",
            ),
        )

    return {
        "problem_id": problem_id,
        "sw_id": sw_id,
        "source_id": str(source_id),
        "claim_id_1": claim_id_1,
        "claim_id_2": claim_id_2,
        "asm_id": asm_id,
        "art_id": art_id,
        "eval_id": eval_id,
        "feas_id": feas_id,
    }


def test_provenance_graph_empty_session(engine: ProvenanceGraphEngine):
    """Test graph construction on an unpopulated research session."""
    payload = engine.build_provenance_graph("sess_nonexistent_empty")
    assert payload.session_id == "sess_nonexistent_empty"
    assert len(payload.nodes) == 0
    assert len(payload.edges) == 0
    assert payload.metrics.total_nodes == 0
    assert payload.metrics.total_edges == 0
    assert isinstance(payload.state_hash, str)
    assert len(payload.state_hash) == 64


def test_provenance_graph_multi_tier_traversal(storage: SQLiteStorageAdapter, engine: ProvenanceGraphEngine):
    """Test full multi-tier topological graph assembly across Tiers 0-5."""
    session_id = "sess_traversal_test"
    ids = _seed_multi_tier_research_data(storage, session_id)

    payload = engine.build_provenance_graph(session_id)
    assert payload.session_id == session_id
    assert len(payload.nodes) >= 6

    # Verify presence of nodes across distinct tiers
    tiers_present = {n.tier for n in payload.nodes}
    assert int(EpistemicTier.TIER_0_SOURCE) in tiers_present
    assert int(EpistemicTier.TIER_1_CLAIM) in tiers_present
    assert int(EpistemicTier.TIER_2_ASSUMPTION) in tiers_present
    assert int(EpistemicTier.TIER_3_DSR_ARTIFACT) in tiers_present
    assert int(EpistemicTier.TIER_4_CONCEPT_EVAL) in tiers_present
    assert int(EpistemicTier.TIER_5_FEASIBILITY) in tiers_present

    # Verify edges exist connecting tiers
    edge_types = {e.edge_type for e in payload.edges}
    assert ProvenanceEdgeType.SUPPORTS in edge_types or ProvenanceEdgeType.EXTENDS in edge_types
    assert ProvenanceEdgeType.DERIVES in edge_types
    assert ProvenanceEdgeType.GROUNDS in edge_types
    assert ProvenanceEdgeType.EVALUATES in edge_types
    assert ProvenanceEdgeType.SYNTHESIZES in edge_types

    # Metrics
    assert payload.metrics.total_nodes == len(payload.nodes)
    assert payload.metrics.total_edges == len(payload.edges)
    assert payload.metrics.grounded_artifacts_ratio > 0.0


def test_provenance_contradiction_detection(storage: SQLiteStorageAdapter, engine: ProvenanceGraphEngine):
    """Test that adversarial contradiction relationships are flagged."""
    session_id = "sess_contra_test"
    ids = _seed_multi_tier_research_data(storage, session_id)

    # Insert a contradicting evidence link
    with storage._get_connection() as conn:
        conn.execute(
            """
            INSERT INTO claim_evidence_links (
                id, claim_id, source_id, relation_type, evidence_strength, rationale
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                "link_contra_001",
                ids["claim_id_2"],
                int(ids["source_id"]),
                "CONTRADICTS",
                "STRONG",
                "Empirical measurements refute the claims of excessive latency.",
            ),
        )

    payload = engine.build_provenance_graph(session_id)
    contra_edges = [e for e in payload.edges if e.is_contradiction]
    assert len(contra_edges) >= 1
    assert payload.metrics.contradiction_count >= 1
    assert any(e.edge_type == ProvenanceEdgeType.CONTRADICTS for e in payload.edges)


def test_provenance_filtering_confidence_and_stages(storage: SQLiteStorageAdapter, engine: ProvenanceGraphEngine):
    """Test filtering by minimum confidence, stages, and orphan nodes."""
    session_id = "sess_filter_test"
    _seed_multi_tier_research_data(storage, session_id)

    # Filter by min_confidence
    filter_high_conf = ProvenanceFilterQuery(
        session_id=session_id,
        min_confidence=0.80,
    )
    high_conf_graph = engine.build_provenance_graph(session_id, filter_high_conf)
    assert all(n.confidence_score >= 0.80 for n in high_conf_graph.nodes)

    # Filter by stages
    filter_stage_d = ProvenanceFilterQuery(
        session_id=session_id,
        stages=["stage_d"],
    )
    stage_d_graph = engine.build_provenance_graph(session_id, filter_stage_d)
    assert all(n.stage_id == "stage_d" for n in stage_d_graph.nodes)
    assert any(n.type == ProvenanceNodeType.DSR_ARTIFACT for n in stage_d_graph.nodes)


def test_provenance_state_hash_determinism(storage: SQLiteStorageAdapter, engine: ProvenanceGraphEngine):
    """Verify that state hashing produces identical SHA-256 digests on identical state."""
    session_id = "sess_hash_test"
    _seed_multi_tier_research_data(storage, session_id)

    graph_1 = engine.build_provenance_graph(session_id)
    graph_2 = engine.build_provenance_graph(session_id)

    assert graph_1.state_hash == graph_2.state_hash
    assert len(graph_1.state_hash) == 64


def test_provenance_node_lineage(storage: SQLiteStorageAdapter, engine: ProvenanceGraphEngine):
    """Test ancestor and descendant extraction for a specific artifact node."""
    session_id = "sess_lineage_test"
    ids = _seed_multi_tier_research_data(storage, session_id)

    lineage = engine.get_node_lineage(session_id, ids["art_id"])
    assert "error" not in lineage
    assert lineage["node"]["id"] == ids["art_id"]
    # Ancestors should include claim or source
    assert len(lineage["ancestor_ids"]) >= 1
    # Descendants should include evaluation or feasibility
    assert len(lineage["descendant_ids"]) >= 1


def test_provenance_api_endpoints(client: TestClient, storage: SQLiteStorageAdapter):
    """Test FastAPI REST endpoints for graph retrieval, node inspection, and export."""
    session_id = "sess_api_prov_test"
    ids = _seed_multi_tier_research_data(storage, session_id)

    # 1. GET /api/provenance/graph
    resp = client.get(f"/api/provenance/graph?session_id={session_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["session_id"] == session_id
    assert len(data["nodes"]) >= 6
    assert len(data["edges"]) >= 4
    assert "state_hash" in data

    # 2. GET /api/provenance/node/{id}
    node_id = ids["art_id"]
    node_resp = client.get(f"/api/provenance/node/{node_id}?session_id={session_id}")
    assert node_resp.status_code == 200
    node_data = node_resp.json()
    assert node_data["node"]["id"] == node_id
    assert "ancestors" in node_data
    assert "descendants" in node_data

    # 3. GET /api/provenance/export/{session_id}
    export_resp = client.get(f"/api/provenance/export/{session_id}")
    assert export_resp.status_code == 200
    assert "attachment" in export_resp.headers.get("content-disposition", "")
    assert "X-CONVERA-State-Hash" in export_resp.headers
    export_json = export_resp.json()
    assert export_json["session_id"] == session_id
