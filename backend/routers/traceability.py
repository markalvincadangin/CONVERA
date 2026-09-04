"""
Requirements Traceability Router for CONVERA.
Tracks multi-hop lineage: Problem -> Claim -> Evidence -> Need -> Decision -> Requirement -> Feature.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from storage.factory import get_storage

router = APIRouter(prefix="/api/traceability", tags=["Requirements Traceability"])

class RecordTraceabilityLinkRequest(BaseModel):
    requirement_id: str = Field(..., description="e.g. REQ-01, FR-07")
    requirement_text: str
    category: str = Field("FUNCTIONAL", description="FUNCTIONAL, QUALITY, CONSTRAINTS, DATA, ETHICS")
    linked_decision_id: Optional[str] = None
    linked_assumption_id: Optional[str] = None
    linked_claim_id: Optional[str] = None
    linked_evidence_id: Optional[str] = None
    linked_problem_id: Optional[str] = None

@router.post("/link")
async def add_traceability_link(req: RecordTraceabilityLinkRequest):
    storage = get_storage()
    record = storage.add_traceability_link(req.model_dump())
    return {"status": "linked", "traceability_record": record}

@router.get("/graph")
async def get_traceability_graph(
    requirement_id: Optional[str] = None,
    problem_id: Optional[str] = None
):
    storage = get_storage()
    records = storage.get_traceability_lineage(
        requirement_id=requirement_id,
        problem_id=problem_id
    )

    # Hydrate nodes with rich metadata from underlying tables
    hydrated_lineage = []
    for r in records:
        prob = storage.get_problem(r["linked_problem_id"]) if r.get("linked_problem_id") else None
        chain = {
            "requirement_id": r["requirement_id"],
            "requirement_text": r["requirement_text"],
            "category": r["category"],
            "lineage": {
                "problem": {
                    "id": r.get("linked_problem_id"),
                    "statement": prob.get("problem_statement") if prob else "Problem Context"
                },
                "claim": {
                    "id": r.get("linked_claim_id"),
                },
                "evidence": {
                    "id": r.get("linked_evidence_id"),
                },
                "assumption": {
                    "id": r.get("linked_assumption_id"),
                },
                "decision": {
                    "id": r.get("linked_decision_id"),
                }
            },
            "created_at": r["created_at"]
        }
        hydrated_lineage.append(chain)

    return {
        "count": len(hydrated_lineage),
        "traceability_records": hydrated_lineage
    }


@router.get("/lineage/{requirement_id}")
async def get_traceability_lineage(requirement_id: str):
    """
    Epistemic Traceability Lineage Endpoint (CONVERA-OPS-002 / MONITORING.md Section 4).
    Audits bidirectional lineage integrity from requirement to evidence.
    """
    return await get_traceability_graph(requirement_id=requirement_id)
