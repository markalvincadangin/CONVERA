import pytest
import asyncio
from mcp_server import handle_tool_call, MCP_TOOLS


pytestmark = pytest.mark.unit
@pytest.mark.asyncio
async def test_mcp_tools_list():
    assert len(MCP_TOOLS) >= 6
    tool_names = [t["name"] for t in MCP_TOOLS]
    assert "convera_query_knowledge" in tool_names
    assert "convera_query_unknowns" in tool_names
    assert "convera_query_decisions" in tool_names
    assert "convera_calibrate_confidence" in tool_names
    assert "convera_discriminate_gap" in tool_names
    assert "convera_trace_requirement" in tool_names

@pytest.mark.asyncio
async def test_mcp_calibrate_confidence():
    res = await handle_tool_call("convera_calibrate_confidence", {
        "ai_model_confidence": 0.95,
        "evidence_items": [],
        "risk_level": "CRITICAL"
    })
    assert res["overconfidence_risk"] is True
    assert res["calibration_status"] == "CALIBRATED"

@pytest.mark.asyncio
async def test_mcp_discriminate_gap():
    res = await handle_tool_call("convera_discriminate_gap", {
        "statement": "Lack of real-time multi-spectral feature quantization under hardware constraints."
    })
    assert res["is_authentic_research_gap"] is True
    assert res["classification"] == "AUTHENTIC_RESEARCH_GAP"

@pytest.mark.asyncio
async def test_mcp_query_decisions():
    res = await handle_tool_call("convera_query_decisions", {"project_id": "default_proj"})
    assert "total_decisions" in res
    assert "audited_records" in res
