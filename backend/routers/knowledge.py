from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from storage.factory import get_storage
from engines.knowledge_lifecycle import (
    compute_claim_epistemic_balance,
    get_problem_epistemic_tree,
)
from engines.impact_engine import (
    propagate_evidence_change,
    propagate_test_result,
)

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge & Epistemic Intelligence"])

class LinkEvidenceRequest(BaseModel):
    source_id: int
    problem_id: str
    relation_type: str = Field("SUPPORTS", description="SUPPORTS, CONTRADICTS, CONTEXTUALIZES")
    evidence_strength: str = Field("STRONG", description="STRONG, MODERATE, WEAK")
    rationale: Optional[str] = None
    session_id: Optional[str] = None
    project_id: Optional[str] = None

class RecordTestRequest(BaseModel):
    problem_id: str
    test_type: str = Field("FIELD_INTERVIEW", description="FIELD_INTERVIEW, PROTOTYPE_EXPERIMENT, SMOKE_TEST, DATA_AUDIT")
    target_metric: str
    actual_result: Optional[str] = None
    test_status: str = Field("PLANNED", description="PLANNED, IN_PROGRESS, PASSED, FAILED")
    conducted_by: Optional[str] = None
    session_id: Optional[str] = None
    project_id: Optional[str] = None

class ResolveAlertRequest(BaseModel):
    resolution_status: str = Field("RESOLVED_BY_PIVOT", description="RESOLVED_BY_PIVOT, ACKNOWLEDGED")

@router.post("/claims/{claim_id}/link-evidence")
async def link_claim_to_evidence(claim_id: str, req: LinkEvidenceRequest):
    """
    Link an empirical evidence source to a claim and trigger reactive Impact Propagation.
    """
    storage = get_storage()
    
    # 1. Create relational link
    link = storage.link_claim_evidence(
        claim_id=claim_id,
        source_id=req.source_id,
        relation_type=req.relation_type,
        evidence_strength=req.evidence_strength,
        rationale=req.rationale,
    )
    
    # 2. Calculate updated epistemic balance for the claim
    balance = compute_claim_epistemic_balance(claim_id=claim_id, storage=storage)
    
    # 3. Propagate impact cascade downstream
    impact = propagate_evidence_change(
        problem_id=req.problem_id,
        source_id=req.source_id,
        relation_type=req.relation_type,
        storage=storage,
        session_id=req.session_id,
        project_id=req.project_id,
    )

    return {
        "status": "success",
        "link": link,
        "epistemic_balance": balance,
        "impact_report": impact,
    }

@router.delete("/links/{link_id}")
async def delete_claim_link(link_id: str):
    """Delete an epistemic relationship link."""
    storage = get_storage()
    success = storage.delete_claim_evidence_link(link_id)
    if not success:
        raise HTTPException(status_code=404, detail="Epistemic link not found")
    return {"status": "success", "deleted": True}

@router.get("/problems/{problem_id}/epistemic-graph")
async def get_epistemic_graph(problem_id: str):
    """Retrieve the full epistemic tree (Claims, Evidence Links, Assumptions, Tests)."""
    storage = get_storage()
    tree = get_problem_epistemic_tree(problem_id=problem_id, storage=storage)
    if not tree:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")
    return tree

@router.post("/assumptions/{assumption_id}/tests")
async def record_assumption_experiment(assumption_id: str, req: RecordTestRequest):
    """Record an empirical validation test and trigger reactive impact calculation."""
    storage = get_storage()
    test = storage.record_assumption_test(
        assumption_id=assumption_id,
        test_type=req.test_type,
        target_metric=req.target_metric,
        actual_result=req.actual_result,
        test_status=req.test_status,
        conducted_by=req.conducted_by,
    )
    
    impact = propagate_test_result(
        problem_id=req.problem_id,
        assumption_id=assumption_id,
        test_status=req.test_status,
        storage=storage,
        session_id=req.session_id,
        project_id=req.project_id,
    )

    return {
        "status": "success",
        "test": test,
        "impact_report": impact,
    }

@router.get("/assumptions/{assumption_id}/tests")
async def list_tests_for_assumption(assumption_id: str):
    """List empirical validation tests for an assumption."""
    storage = get_storage()
    tests = storage.list_assumption_tests(assumption_id=assumption_id)
    return {"assumption_id": assumption_id, "tests": tests}

@router.get("/impact-alerts")
async def get_active_impact_alerts(
    session_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
):
    """List active downstream invalidation alerts."""
    storage = get_storage()
    alerts = storage.list_active_impact_alerts(project_id=project_id, session_id=session_id)
    return {"count": len(alerts), "alerts": alerts}

@router.post("/impact-alerts/{alert_id}/acknowledge")
async def acknowledge_impact_alert(alert_id: str, req: ResolveAlertRequest):
    """Acknowledge or resolve an active impact invalidation alert."""
    storage = get_storage()
    success = storage.resolve_impact_event(alert_id, req.resolution_status)
    if not success:
        raise HTTPException(status_code=404, detail="Impact alert not found")
    return {"status": "success", "resolved": True}


from engines.provenance_engine import ProvenanceEngine
from engines.freshness_engine import FreshnessEngine
from engines.contradiction_engine import ContradictionEngine
from engines.unknowns_engine import UnknownsEngine

class RecordProvenanceRequest(BaseModel):
    source_id: str
    connector: str = "manual"
    original_identifier: Optional[str] = None
    extraction_model: Optional[str] = None
    extraction_prompt: Optional[str] = None
    human_verified: bool = False

class RecordContradictionRequest(BaseModel):
    claim_id: str
    supporting_evidence_id: str
    contradicting_evidence_id: str
    investigation_notes: Optional[str] = None

class AddUnknownRequest(BaseModel):
    project_id: str = "default_proj"
    category: str = Field("WHAT_WE_THINK", description="WHAT_WE_KNOW, WHAT_WE_THINK, WHAT_WE_DONT_KNOW")
    statement: str
    risk_level: str = "MEDIUM"
    session_id: Optional[str] = None
    linked_claim_id: Optional[str] = None
    linked_assumption_id: Optional[str] = None
    resolution_test_id: Optional[str] = None

@router.post("/provenance")
async def record_provenance(req: RecordProvenanceRequest):
    engine = ProvenanceEngine()
    record = engine.record_evidence_provenance(
        source_id=req.source_id,
        connector=req.connector,
        original_identifier=req.original_identifier,
        extraction_model=req.extraction_model,
        extraction_prompt=req.extraction_prompt,
        human_verified=req.human_verified
    )
    return {"status": "recorded", "provenance": record}

@router.get("/provenance/{source_id}")
async def get_provenance(source_id: str):
    engine = ProvenanceEngine()
    prov = engine.get_provenance_dossier(source_id)
    if not prov:
        raise HTTPException(status_code=404, detail=f"Provenance record for source '{source_id}' not found")
    return {"provenance": prov}

@router.get("/freshness")
async def get_project_freshness(project_id: Optional[str] = None):
    storage = get_storage()
    sources = storage.list_sources(project_id=project_id) if hasattr(storage, "list_sources") else []
    engine = FreshnessEngine()
    result = engine.evaluate_project_freshness(sources)
    return result

@router.post("/contradictions")
async def register_contradiction(req: RecordContradictionRequest):
    engine = ContradictionEngine()
    record = engine.register_contradiction(
        claim_id=req.claim_id,
        supporting_evidence_id=req.supporting_evidence_id,
        contradicting_evidence_id=req.contradicting_evidence_id,
        investigation_notes=req.investigation_notes or ""
    )
    return {"status": "contested", "contradiction": record}

@router.get("/contradictions")
async def list_contradictions(claim_id: Optional[str] = None):
    engine = ContradictionEngine()
    return {"contradictions": engine.list_project_contradictions(claim_id=claim_id)}

@router.post("/unknowns")
async def add_unknown(req: AddUnknownRequest):
    engine = UnknownsEngine()
    res = engine.add_unknown_item(
        project_id=req.project_id,
        category=req.category,
        statement=req.statement,
        risk_level=req.risk_level,
        session_id=req.session_id,
        linked_claim_id=req.linked_claim_id,
        linked_assumption_id=req.linked_assumption_id,
        resolution_test_id=req.resolution_test_id
    )
    return {"status": "added", "item": res}

@router.get("/unknowns")
async def get_unknowns_map(project_id: str = "default_proj", session_id: Optional[str] = None):
    engine = UnknownsEngine()
    return engine.generate_project_unknowns_map(project_id=project_id, session_id=session_id)
