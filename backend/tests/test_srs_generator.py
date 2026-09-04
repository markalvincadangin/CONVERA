import pytest
import pytest_asyncio
from engines.srs_generator import generate_project_srs, format_srs_markdown

@pytest.mark.asyncio
@pytest.mark.integration
async def test_srs_generator_flow():
    session_data = {
        "project_name": "AgriCool Iloilo",
        "phase3_problem": "Bulb onion farmers in Miagao lose 35% of harvest due to wet season humidity and absence of municipal cold storage.",
        "phase1_response": "Observed 4 farming barangays in Miagao with severe post-harvest rot.",
        "phase4_response": "Mechanism: Solar-powered decentralized cold-storage pod with IoT temperature/humidity telemetry and local SMS alert trigger.",
        "phase5_response": "Unit Economics: 1,500 PHP per cubic meter per month, payback period 14 months."
    }
    
    res = await generate_project_srs(session_data, mode="CAPSTONE")
    assert "project_title" in res
    assert "executive_summary" in res
    assert "scope" in res
    assert len(res["scope"]["in_scope"]) >= 1
    assert "primary_persona" in res
    assert "functional_requirements" in res
    assert len(res["functional_requirements"]) >= 2
    assert "non_functional_requirements" in res
    assert "architecture_blueprint" in res
    assert "mvp_validation_metrics" in res
    assert "markdown_document" in res
    assert "# Software Requirements Specification" in res["markdown_document"]

@pytest.mark.unit
def test_srs_markdown_formatter():
    mock_srs = {
        "project_title": "Test System",
        "executive_summary": "Test Summary",
        "scope": {"in_scope": ["Feature A"], "out_of_scope": ["Feature B"]},
        "primary_persona": {"name": "Test User", "context": "Iloilo", "primary_goal": "Goal", "core_frustration": "Frustration"},
        "functional_requirements": [
            {
                "id": "FR-001",
                "title": "Telemetry Logging",
                "user_story": "As a user...",
                "acceptance_criteria": ["Given X, when Y, then Z"]
            }
        ],
        "non_functional_requirements": [
            {"id": "NFR-001", "category": "Performance", "requirement": "Fast", "metric": "< 200ms"}
        ],
        "architecture_blueprint": {"frontend": "Next.js", "backend": "FastAPI", "database": "SQLite", "offline_sync_strategy": "IndexedDB"},
        "mvp_validation_metrics": [{"metric_name": "Completion", "target_threshold": "> 90%", "verification_method": "Trial"}]
    }
    
    md = format_srs_markdown(mock_srs)
    assert "FR-001: Telemetry Logging" in md
    assert "NFR-001" in md
    assert "Next.js" in md
