"""
CONVERA DSR Proposal Exporter Engine Test Suite (SDD-020)
=========================================================
Verifies multi-format proposal compilation, BibTeX generation,
printable HTML generation, SHA-256 cryptographic provenance hashing,
FastAPI export endpoints, and research orchestrator action dispatch.
Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
"""

import pytest
import re
import json
from typing import Dict, Any

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.proposal_exporter import ProposalExporter
from models.export import (
    ExportFormat,
    ProposalSection,
    DSRProposalCompilationRequest,
    DSRProposalCompilationResponse,
)
from models.orchestrator import (
    ActionType,
    OrchestrationActionDispatchRequest,
)
from services.research_orchestrator import ResearchOrchestrator
from starlette.testclient import TestClient
from server import app


import tempfile
import os
from typing import Generator

@pytest.fixture
def storage() -> Generator[SQLiteStorageAdapter, None, None]:
    """Provides a fresh temporary SQLite storage adapter for tests."""
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
def exporter(storage: SQLiteStorageAdapter) -> ProposalExporter:
    """Provides an initialized ProposalExporter instance."""
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
    app.state.storage = original_storage


# ==============================================================================
# 1. Multi-Format Proposal Compilation Tests
# ==============================================================================

def test_markdown_proposal_compilation(exporter: ProposalExporter, storage: SQLiteStorageAdapter):
    """
    Verifies that the engine generates publication-grade Markdown with all 7 sections,
    including Stage F compliance and Section 7 Critique & Blind-Spot Audit.
    """
    session_id = "sess_export_md_01"
    storage.save_session(session_id, {"framework_id": "RESEARCH", "project_id": "proj_export_01"})

    storage.add_problem({
        "id": "PROB-EXP-01",
        "session_id": session_id,
        "project_id": "proj_export_01",
        "title": "Cold Chain Spoilage",
        "problem_statement": "Post-harvest vegetable decay due to temperature drift in rural Iloilo.",
        "sufferer_occupation": "Onion & Tomato Farmers",
        "sufferer_location": "Iloilo Province",
        "quantified_impact": "Php 150,000 seasonal crop loss per farm cluster.",
    })

    storage.create_dsr_artifact({
        "id": "ART-EXP-01",
        "problem_id": "PROB-EXP-01",
        "session_id": session_id,
        "title": "Distributed Cold Storage Micro-Hub",
        "dsr_class": "INSTANTIATION",
        "description": "Solar-driven IoT node regulating thermal drift",
        "kernel_theory": "Thermal Dynamic Decay Models",
    })

    req = DSRProposalCompilationRequest(
        project_id="proj_export_01",
        session_id=session_id,
        problem_id="PROB-EXP-01",
        format=ExportFormat.MARKDOWN,
    )
    res = exporter.compile_proposal(req)

    assert res.format == ExportFormat.MARKDOWN
    assert "Design Science Research" in res.content
    assert "1. Problem Definition & Scouting" in res.content
    assert "2. Theoretical Grounding & Kernel Theory" in res.content
    assert "3. Literature Matrix & Scholarly Research Gaps" in res.content
    assert "4. Evaluation Trapping & Circumscription Loop" in res.content
    assert "5. Institutional & Ethical Compliance" in res.content
    assert "6. Formal Quality Gate Review Sign-offs" in res.content
    assert "7. Cross-Stage Critique & Blind-Spot Audit" in res.content
    assert res.provenance_hash is not None
    assert len(res.provenance_hash) == 64
    assert res.section_count == 7


def test_latex_and_bibtex_compilation(exporter: ProposalExporter, storage: SQLiteStorageAdapter):
    """
    Verifies that the engine generates valid, compilable LaTeX markup (.tex)
    with standard packages, booktabs, math equations, and matching BibTeX (.bib).
    """
    session_id = "sess_export_tex_01"
    storage.save_session(session_id, {"framework_id": "RESEARCH", "project_id": "proj_export_02"})

    storage.add_problem({
        "id": "PROB-EXP-02",
        "session_id": session_id,
        "project_id": "proj_export_02",
        "title": "Solar MPPT Inefficiency",
        "problem_statement": "Battery brownouts during monsoon seasons in off-grid rural clinics.",
        "sufferer_occupation": "Rural Health Officers",
        "sufferer_location": "Antique, Philippines",
        "quantified_impact": "Loss of temperature-sensitive vaccines valued at Php 500,000.",
    })

    req = DSRProposalCompilationRequest(
        project_id="proj_export_02",
        session_id=session_id,
        problem_id="PROB-EXP-02",
        format=ExportFormat.LATEX,
        target_document_class="article",
    )
    res = exporter.compile_proposal(req)

    assert res.format == ExportFormat.LATEX
    tex = res.content

    # LaTeX Structure Checks
    assert r"\documentclass[11pt,a4paper]{article}" in tex
    assert r"\usepackage{booktabs}" in tex
    assert r"\usepackage{amsmath,amssymb,amsfonts}" in tex
    assert r"\begin{document}" in tex
    assert r"\maketitle" in tex
    assert r"\begin{abstract}" in tex
    assert r"\section{Problem Scouting \& Context (Stage A)}" in tex
    assert r"\section{Literature Matrix \& Research Gaps (Stage C)}" in tex
    assert r"\begin{table}[ht]" in tex
    assert r"\toprule" in tex
    assert r"\bottomrule" in tex
    assert r"\bibliography{references}" in tex
    assert r"\end{document}" in tex

    # Auxiliary BibTeX Check
    assert "references.bib" in res.auxiliary_files
    bib = res.auxiliary_files["references.bib"]
    assert "@article{" in bib or "@inproceedings{" in bib
    assert "author =" in bib
    assert "title =" in bib
    assert "year =" in bib


def test_standalone_printable_html_compilation(exporter: ProposalExporter, storage: SQLiteStorageAdapter):
    """
    Verifies that the engine generates a self-contained HTML deliverable
    with embedded responsive CSS and @media print rules for browser PDF printing.
    """
    session_id = "sess_export_html_01"
    storage.save_session(session_id, {"framework_id": "RESEARCH", "project_id": "proj_export_03"})

    storage.add_problem({
        "id": "PROB-EXP-03",
        "session_id": session_id,
        "project_id": "proj_export_03",
        "title": "Fish Larvae Water Quality Degradation",
        "problem_statement": "Turbidity and hypoxia spikes cause 50% fry mortality in coastal hatcheries.",
        "sufferer_occupation": "Aquaculture Technicians",
        "sufferer_location": "Guimaras Strait",
        "quantified_impact": "Php 300,000 monthly hatchery operational deficit.",
    })

    req = DSRProposalCompilationRequest(
        project_id="proj_export_03",
        session_id=session_id,
        problem_id="PROB-EXP-03",
        format=ExportFormat.HTML,
    )
    res = exporter.compile_proposal(req)

    assert res.format == ExportFormat.HTML
    html = res.content

    # HTML Structure Checks
    assert "<!DOCTYPE html>" in html
    assert '<meta name="convera-provenance-sha256"' in html
    assert "@media print" in html
    assert "page-break-before: always" in html
    assert "Research Rigor &amp; Defense Metrics" in html
    assert "Turbidity and hypoxia spikes" in html
    assert "</html>" in html


def test_json_monograph_and_bundle_compilation(exporter: ProposalExporter, storage: SQLiteStorageAdapter):
    """
    Verifies that JSON monograph exports the full structured data tree
    and BUNDLE compiles coordinated files (.tex, .bib, .html, .json, .md).
    """
    session_id = "sess_export_json_01"
    storage.save_session(session_id, {"framework_id": "RESEARCH", "project_id": "proj_export_04"})

    storage.add_problem({
        "id": "PROB-EXP-04",
        "session_id": session_id,
        "project_id": "proj_export_04",
        "title": "Mangrove Reforestation Biomass Estimation",
        "problem_statement": "Manual quadrat surveys fail to track canopy density across tidal flats.",
        "sufferer_occupation": "Coastal Conservation Officers",
        "sufferer_location": "Bacolod Coastal Zone",
        "quantified_impact": "Inaccurate carbon credit validation costing 40% in international donor funding.",
    })

    # JSON Monograph
    req_json = DSRProposalCompilationRequest(
        project_id="proj_export_04",
        session_id=session_id,
        format=ExportFormat.JSON,
    )
    res_json = exporter.compile_proposal(req_json)
    assert res_json.format == ExportFormat.JSON
    parsed = json.loads(res_json.content)
    assert parsed["project_id"] == "proj_export_04"
    assert "section_data" in parsed
    assert "provenance_hash" in parsed

    # Full Bundle
    req_bundle = DSRProposalCompilationRequest(
        project_id="proj_export_04",
        session_id=session_id,
        format=ExportFormat.BUNDLE,
    )
    res_bundle = exporter.compile_proposal(req_bundle)
    assert res_bundle.format == ExportFormat.BUNDLE
    assert "proposal.tex" in res_bundle.auxiliary_files
    assert "references.bib" in res_bundle.auxiliary_files
    assert "proposal.html" in res_bundle.auxiliary_files
    assert "monograph.json" in res_bundle.auxiliary_files


# ==============================================================================
# 2. Cryptographic Provenance Integrity Tests (INV-020-02)
# ==============================================================================

def test_deterministic_provenance_hashing(exporter: ProposalExporter, storage: SQLiteStorageAdapter):
    """
    Verifies that the SHA-256 provenance hash is deterministic, reproducible,
    and changes if underlying problem thesis changes.
    """
    session_id = "sess_export_prov_01"
    storage.save_session(session_id, {"framework_id": "RESEARCH", "project_id": "proj_prov_01"})

    storage.add_problem({
        "id": "PROB-PROV-01",
        "session_id": session_id,
        "project_id": "proj_prov_01",
        "title": "Telemetry Power Drift",
        "problem_statement": "Batteries freeze under high elevation sensor masts.",
        "sufferer_occupation": "Highland Agroforesters",
        "sufferer_location": "Mount Kanlaon",
        "quantified_impact": "Lost telemetry logs over 90 days.",
    })

    req1 = DSRProposalCompilationRequest(project_id="proj_prov_01", session_id=session_id)
    res1 = exporter.compile_proposal(req1)
    hash1 = res1.provenance_hash

    # Re-compilation of identical state must yield identical hash
    res2 = exporter.compile_proposal(req1)
    hash2 = res2.provenance_hash
    assert hash1 == hash2

    # Different problem state must yield different hash
    storage.save_session("sess_export_prov_02", {"framework_id": "RESEARCH", "project_id": "proj_prov_02"})
    storage.add_problem({
        "id": "PROB-PROV-02",
        "session_id": "sess_export_prov_02",
        "project_id": "proj_prov_02",
        "title": "Completely Different Problem",
        "problem_statement": "Urban wastewater overflow into drainage canals.",
        "sufferer_occupation": "City Sanitation Workers",
        "sufferer_location": "Iloilo City",
        "quantified_impact": "Health hazards affecting 20,000 residents.",
    })
    req3 = DSRProposalCompilationRequest(project_id="proj_prov_02", session_id="sess_export_prov_02")
    res3 = exporter.compile_proposal(req3)
    assert res3.provenance_hash != hash1


# ==============================================================================
# 3. FastAPI Router Integration Tests
# ==============================================================================

def test_export_fastapi_endpoints(storage: SQLiteStorageAdapter):
    """
    Verifies that GET /api/export/dsr-proposal, POST /api/export/compile,
    and GET /api/export/bibtex behave correctly.
    """
    session_id = "sess_api_exp_01"
    storage.save_session(session_id, {"framework_id": "RESEARCH", "project_id": "proj_api_exp"})

    storage.add_problem({
        "id": "PROB-API-EXP",
        "session_id": session_id,
        "project_id": "proj_api_exp",
        "title": "Agricultural Cold Chain Monograph",
        "problem_statement": "Cold locker outages cause onion rot in Western Visayas.",
    })

    client = TestClient(app)

    # 1. GET /api/export/dsr-proposal (Markdown)
    r1 = client.get(f"/api/export/dsr-proposal?project_id=proj_api_exp&session_id={session_id}&format=MARKDOWN")
    assert r1.status_code == 200
    res1 = r1.json()
    assert "markdown_content" in res1
    assert "provenance_hash" in res1
    assert "Design Science Research" in res1["content"]

    # 2. POST /api/export/compile (LaTeX)
    r2 = client.post("/api/export/compile", json={
        "project_id": "proj_api_exp",
        "session_id": session_id,
        "format": "LATEX",
        "target_document_class": "article",
        "custom_title": "Custom Overleaf DSR Monograph",
    })
    assert r2.status_code == 200
    res2 = r2.json()
    assert res2["format"] == "LATEX"
    assert r"\documentclass[11pt,a4paper]{article}" in res2["content"]
    assert "references.bib" in res2["auxiliary_files"]

    # 3. GET /api/export/bibtex
    r3 = client.get(f"/api/export/bibtex?project_id=proj_api_exp&session_id={session_id}")
    assert r3.status_code == 200
    assert "@article{" in r3.text or "@inproceedings{" in r3.text
    assert "references_proj_api_exp.bib" in r3.headers.get("content-disposition", "")


# ==============================================================================
# 4. Research Orchestrator Action Dispatch Integration
# ==============================================================================

@pytest.mark.asyncio
async def test_orchestrator_proposal_action_dispatch(storage: SQLiteStorageAdapter):
    """
    Verifies that ResearchOrchestrator dispatches ActionType.EXPORT_PROPOSAL
    and ActionType.COMPILE_PROPOSAL_CANVAS to ProposalExporter.
    """
    session_id = "sess_orch_exp_01"
    storage.save_session(session_id, {
        "framework_id": "RESEARCH",
        "project_id": "proj_orch_exp",
        "problem_statement": "Off-grid telemetry node resilience in typhoon regions",
    })

    orchestrator = ResearchOrchestrator(storage=storage)

    # Dispatch EXPORT_PROPOSAL with LaTeX format
    dispatch_req = OrchestrationActionDispatchRequest(
        session_id=session_id,
        action_type=ActionType.EXPORT_PROPOSAL,
        target_engine="proposal_exporter",
        parameters={
            "format": "LATEX",
            "custom_title": "Typhoon Telemetry Node Monograph",
        },
    )
    result = await orchestrator.dispatch_action(dispatch_req)

    assert result.status == "SUCCESS"
    assert "proposal" in result.resulting_artifacts
    assert "provenance_hash" in result.resulting_artifacts
    assert "Compiled publication-ready DSR proposal" in result.execution_summary
    assert "LATEX" in result.execution_summary
