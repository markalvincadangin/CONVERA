"""
CONVERA Model Context Protocol (MCP) Server
===========================================
Exposes CONVERA's Knowledge Graph, Evidence Links, Unknowns Map, Decision Room,
and Intelligence Evaluation tools to external AI coding agents and IDEs via JSON-RPC stdio.
"""
import sys
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from storage.factory import get_storage
from engines.evaluation_engine import ConveraEvaluationEngine
from engines.research_client import FreeResearchClient
from engines.gate_engine import GateEngine

STORAGE = get_storage()
EVAL_ENGINE = ConveraEvaluationEngine(STORAGE)
RESEARCH_CLIENT = FreeResearchClient()
GATE_ENGINE = GateEngine(STORAGE)

MCP_TOOLS = [
    {
        "name": "convera_query_knowledge",
        "description": "Query CONVERA's relational knowledge graph for project claims, epistemic states (SUPPORTED, CONTESTED, HYPOTHESIS), and evidence links.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string", "description": "Project identifier (default: 'default_proj')"},
                "problem_id": {"type": "string", "description": "Optional specific problem ID to filter claims"}
            }
        }
    },
    {
        "name": "convera_query_unknowns",
        "description": "Retrieve project epistemic triangulation: What We Know (Validated), What We Think (Assumptions), and What We Don't Know (Critical Risks).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string", "description": "Project identifier"}
            }
        }
    },
    {
        "name": "convera_query_decisions",
        "description": "Retrieve all decision records, rationale, chosen concepts, and check for STALE_REVIEW_REQUIRED alerts caused by contradicted claims.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string", "description": "Project identifier"}
            }
        }
    },
    {
        "name": "convera_calibrate_confidence",
        "description": "Compute tri-part calibrated confidence (AI Model Confidence != Evidence Strength != Decision Confidence) and detect overconfidence risk.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "ai_model_confidence": {"type": "number", "description": "Model linguistic certainty 0.0 - 1.0"},
                "evidence_items": {"type": "array", "items": {"type": "object"}, "description": "List of evidence items with tiers and freshness"},
                "risk_level": {"type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"]},
                "passed_validation_tests": {"type": "integer", "description": "Number of empirical field tests passed"}
            },
            "required": ["ai_model_confidence"]
        }
    },
    {
        "name": "convera_discriminate_gap",
        "description": "Classify whether a problem statement represents an Authentic Research Gap, an Observed Study Limitation, or Premature Solutioning.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "statement": {"type": "string", "description": "The research problem or limitation statement to analyze"}
            },
            "required": ["statement"]
        }
    },
    {
        "name": "convera_trace_requirement",
        "description": "Trace the full end-to-end multi-hop lineage for a system requirement (Requirement -> Decision -> Assumption -> Evidence -> Claim -> Problem).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "requirement_id": {"type": "string", "description": "Requirement ID (e.g. 'FR-001')"}
            },
            "required": ["requirement_id"]
        }
    },
    {
        "name": "convera_search_literature",
        "description": "Perform federated multi-source search across OpenAlex, Crossref, PubMed, and Semantic Scholar.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query keywords"},
                "limit": {"type": "integer", "description": "Max papers per source (default: 5)"}
            },
            "required": ["query"]
        }
    }
]

async def handle_tool_call(name: str, arguments: Dict[str, Any]) -> Any:
    if name == "convera_query_knowledge":
        proj_id = arguments.get("project_id", "default_proj")
        problems = STORAGE.list_problems(project_id=proj_id)
        return {"project_id": proj_id, "total_problems": len(problems), "problems": problems}

    elif name == "convera_query_unknowns":
        proj_id = arguments.get("project_id", "default_proj")
        unknowns = STORAGE.list_unknowns(project_id=proj_id)
        know = [u for u in unknowns if u.get("epistemic_category") == "KNOW"]
        think = [u for u in unknowns if u.get("epistemic_category") == "THINK"]
        dont_know = [u for u in unknowns if u.get("epistemic_category") == "DONT_KNOW"]
        return {
            "project_id": proj_id,
            "total": len(unknowns),
            "what_we_know": know,
            "what_we_think": think,
            "what_we_dont_know": dont_know
        }

    elif name == "convera_query_decisions":
        proj_id = arguments.get("project_id", "default_proj")
        audit = EVAL_ENGINE.audit_project_decision_integrity(project_id=proj_id)
        return audit

    elif name == "convera_calibrate_confidence":
        ai_conf = float(arguments.get("ai_model_confidence", 0.90))
        evid_items = arguments.get("evidence_items", [])
        risk = arguments.get("risk_level", "MEDIUM")
        tests = int(arguments.get("passed_validation_tests", 0))
        return EVAL_ENGINE.calibrate_confidence(ai_conf, evid_items, risk, tests)

    elif name == "convera_discriminate_gap":
        stmt = arguments.get("statement", "")
        return EVAL_ENGINE.discriminate_gap_vs_limitation(stmt)

    elif name == "convera_trace_requirement":
        req_id = arguments.get("requirement_id", "")
        traces = STORAGE.list_traceability_links(requirement_id=req_id)
        return {"requirement_id": req_id, "trace_records": traces}

    elif name == "convera_search_literature":
        q = arguments.get("query", "")
        lim = int(arguments.get("limit", 5))
        papers = await RESEARCH_CLIENT.search_all_async(q, limit=lim)
        return {"query": q, "total_results": len(papers), "papers": [p.dict() for p in papers]}

    else:
        raise ValueError(f"Unknown MCP tool: {name}")

async def run_stdio_server():
    """Reads JSON-RPC messages from stdin and writes responses to stdout."""
    loop = asyncio.get_event_loop()
    reader = asyncio.StreamReader()
    protocol = asyncio.StreamReaderProtocol(reader)
    await loop.connect_read_pipe(lambda: protocol, sys.stdin)

    while True:
        line = await reader.readline()
        if not line:
            break
        try:
            msg = json.loads(line.decode("utf-8"))
            msg_id = msg.get("id")
            method = msg.get("method")

            if method == "tools/list":
                resp = {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {"tools": MCP_TOOLS}
                }
            elif method == "tools/call":
                params = msg.get("params", {})
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})
                try:
                    res = await handle_tool_call(tool_name, tool_args)
                    resp = {
                        "jsonrpc": "2.0",
                        "id": msg_id,
                        "result": {
                            "content": [{"type": "text", "text": json.dumps(res, indent=2)}]
                        }
                    }
                except Exception as e:
                    resp = {
                        "jsonrpc": "2.0",
                        "id": msg_id,
                        "error": {"code": -32000, "message": str(e)}
                    }
            else:
                resp = {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {"status": "ok"}
                }

            sys.stdout.write(json.dumps(resp) + chr(10))
            sys.stdout.flush()

        except Exception as err:
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": f"Parse error: {err}"}
            }
            sys.stdout.write(json.dumps(err_resp) + chr(10))
            sys.stdout.flush()

if __name__ == "__main__":
    asyncio.run(run_stdio_server())
