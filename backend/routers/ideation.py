"""
CONVERA DSR Artifact Ideation Router (SDD-016)
==============================================
Exposes REST endpoints for Design Science Research (DSR) artifact formulation:
- POST /api/ideation/generate: Generates grounded DSR candidates across the 4 canonical classes.
- GET  /api/ideation/problem/{problem_id}/artifacts: Lists candidate and selected artifacts.
- POST /api/ideation/artifacts: Manually authors a custom DSR candidate artifact.
- GET  /api/ideation/artifacts/{artifact_id}: Retrieves a specific DSR artifact.
- PATCH /api/ideation/artifacts/{artifact_id}: Updates candidate fields or lifecycle status.
- DELETE /api/ideation/artifacts/{artifact_id}: Removes a candidate artifact.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status

from storage.factory import get_storage
from engines.ideation_engine import IdeationEngine
from models.ideation import (
    DSRArtifactClass,
    DSRArtifactCreate,
    DSRArtifactUpdate,
    DSRArtifactResponse,
    IdeationGenerationRequest,
    IdeationGenerationResponse,
)

router = APIRouter(prefix="/api/ideation", tags=["DSR Artifact Ideation Engine"])


@router.post(
    "/generate",
    response_model=IdeationGenerationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate candidate DSR artifacts across requested classes",
)
async def generate_dsr_candidates(request: IdeationGenerationRequest) -> IdeationGenerationResponse:
    """
    Formulates grounded candidate DSR artifacts (Construct, Model, Method, Instantiation)
    anchored to Gregor & Jones (2007) Kernel Theories and Epistemic Rules 5 & 6.
    """
    storage = get_storage()
    engine = IdeationEngine(storage=storage)
    try:
        class_names = [c.value for c in request.classes] if request.classes else None
        result = await engine.generate_dsr_candidates(
            problem_id=request.problem_id,
            session_id=request.session_id,
            classes=class_names,
            prompt_guidance=request.prompt_guidance,
            max_candidates_per_class=request.max_candidates_per_class,
        )
        return IdeationGenerationResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ideation generation failed: {str(e)}",
        )


@router.get(
    "/problem/{problem_id}/artifacts",
    response_model=List[DSRArtifactResponse],
    status_code=status.HTTP_200_OK,
    summary="List all DSR artifacts for a problem",
)
async def list_artifacts_for_problem(
    problem_id: str,
    dsr_class: Optional[DSRArtifactClass] = Query(None, description="Filter by DSR class"),
) -> List[DSRArtifactResponse]:
    """Retrieve all formulated DSR artifacts for a specific problem."""
    storage = get_storage()
    class_filter = dsr_class.value if dsr_class else None
    artifacts = storage.list_dsr_artifacts(problem_id=problem_id, dsr_class=class_filter)
    return [DSRArtifactResponse(**a) for a in artifacts]


@router.post(
    "/artifacts",
    response_model=DSRArtifactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Manually create a candidate DSR artifact",
)
async def create_custom_artifact(request: DSRArtifactCreate) -> DSRArtifactResponse:
    """Creates a custom DSR artifact authored directly by the researcher."""
    storage = get_storage()
    problem = storage.get_problem(request.problem_id)
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Problem '{request.problem_id}' does not exist.",
        )

    created = storage.create_dsr_artifact(request.model_dump())
    return DSRArtifactResponse(**created)


@router.get(
    "/artifacts/{artifact_id}",
    response_model=DSRArtifactResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve a specific DSR artifact by ID",
)
async def get_artifact(artifact_id: str) -> DSRArtifactResponse:
    storage = get_storage()
    art = storage.get_dsr_artifact(artifact_id)
    if not art:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DSR artifact '{artifact_id}' not found.",
        )
    return DSRArtifactResponse(**art)


@router.patch(
    "/artifacts/{artifact_id}",
    response_model=DSRArtifactResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a DSR artifact's details or lifecycle status",
)
async def update_artifact(artifact_id: str, updates: DSRArtifactUpdate) -> DSRArtifactResponse:
    """
    Updates artifact content or lifecycle status (PROPOSED, SELECTED, REFUTED, ARCHIVED).
    Selecting an artifact designates it as an accepted solution contribution for Phase D.
    """
    storage = get_storage()
    existing = storage.get_dsr_artifact(artifact_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DSR artifact '{artifact_id}' not found.",
        )

    dumped = updates.model_dump(exclude_unset=True)
    if "status" in dumped and dumped["status"] is not None:
        dumped["status"] = dumped["status"].value if hasattr(dumped["status"], "value") else dumped["status"]

    updated = storage.update_dsr_artifact(artifact_id, dumped)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DSR artifact '{artifact_id}' not found.",
        )
    return DSRArtifactResponse(**updated)


@router.delete(
    "/artifacts/{artifact_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a candidate DSR artifact",
)
async def delete_artifact(artifact_id: str) -> Dict[str, Any]:
    storage = get_storage()
    success = storage.delete_dsr_artifact(artifact_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DSR artifact '{artifact_id}' not found.",
        )
    return {"success": True, "id": artifact_id}
