"""
CONVERA Workspaces & Collaboration Router
========================================
Endpoints for workspace memberships, RBAC privilege enforcement,
and cryptographic invite generation/redemption.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, Field

try:
    from storage import get_storage
    from engines.workspace_engine import get_workspace_engine, VALID_ROLES
    from middleware.auth_middleware import get_optional_user, require_user, require_workspace_role
except ImportError:
    from backend.storage import get_storage
    from backend.engines.workspace_engine import get_workspace_engine, VALID_ROLES
    from backend.middleware.auth_middleware import get_optional_user, require_user, require_workspace_role

router = APIRouter(prefix="/api/workspaces", tags=["Workspaces & RBAC"])


# --- Schemas ---

class CreateInviteRequest(BaseModel):
    role: str = Field("MEMBER", description="Role to grant: ADMIN, MEMBER, ADVISOR, VIEWER")
    expires_in_hours: int = Field(48, ge=1, le=720, description="Invite TTL in hours")
    max_uses: int = Field(1, ge=1, le=1000, description="Maximum number of redemptions")


class UpdateRoleRequest(BaseModel):
    user_id: str
    role: str


class TransferOwnershipRequest(BaseModel):
    new_owner_id: str


# --- Endpoints ---

@router.get("")
async def list_user_workspaces(user: Dict[str, Any] = Depends(require_user)):
    """List all workspaces the authenticated user belongs to."""
    storage = get_storage()
    workspaces = storage.list_user_workspaces(user["id"])
    return {"workspaces": workspaces}


@router.get("/{workspace_id}")
async def get_workspace_details(
    workspace_id: str,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Retrieve workspace metadata, user role, and session state."""
    storage = get_storage()
    project = storage.get_project(workspace_id) or storage.get_project_by_share_code(workspace_id)
    if not project:
        # Check session
        sess = storage.get_session(workspace_id)
        if not sess:
            raise HTTPException(status_code=404, detail="Workspace not found")
        project = {"id": workspace_id, "project_name": sess.get("project_name", "Venture Project")}

    role = "ANONYMOUS"
    membership = None
    if user:
        if user.get("system_role") == "SUPERADMIN":
            role = "SUPERADMIN"
        else:
            membership = storage.get_workspace_membership(workspace_id, user["id"])
            if membership:
                role = membership.get("role", "VIEWER")

    return {
        "workspace": project,
        "role": role,
        "membership": membership,
    }


@router.get("/{workspace_id}/members")
async def list_workspace_members(
    workspace_id: str,
    guard: Dict[str, Any] = Depends(require_workspace_role(
        allowed_roles=["OWNER", "ADMIN", "MEMBER", "ADVISOR", "VIEWER"],
        allow_anonymous=True,
    ))
):
    """List roster of members belonging to this workspace."""
    engine = get_workspace_engine()
    members = engine.list_members(workspace_id)
    return {"workspace_id": workspace_id, "members": members}


@router.post("/{workspace_id}/invites")
async def create_workspace_invite(
    workspace_id: str,
    req: CreateInviteRequest,
    user: Dict[str, Any] = Depends(require_user),
    guard: Dict[str, Any] = Depends(require_workspace_role(["OWNER", "ADMIN"]))
):
    """Generate a cryptographic invite link for a specific role (TTL: 48h default)."""
    engine = get_workspace_engine()
    try:
        invite = engine.create_invite(
            workspace_id=workspace_id,
            inviter_user_id=user["id"],
            role=req.role,
            expires_in_hours=req.expires_in_hours,
            max_uses=req.max_uses,
        )
        return {"status": "success", "invite": invite}
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}/invites")
async def list_workspace_invites(
    workspace_id: str,
    user: Dict[str, Any] = Depends(require_user),
    guard: Dict[str, Any] = Depends(require_workspace_role(["OWNER", "ADMIN"]))
):
    """List active, unrevoked invites for this workspace."""
    engine = get_workspace_engine()
    invites = engine.list_invites(workspace_id)
    return {"workspace_id": workspace_id, "invites": invites}


@router.delete("/{workspace_id}/invites/{invite_id}")
async def revoke_workspace_invite(
    workspace_id: str,
    invite_id: str,
    user: Dict[str, Any] = Depends(require_user),
    guard: Dict[str, Any] = Depends(require_workspace_role(["OWNER", "ADMIN"]))
):
    """Revoke an active workspace invite token."""
    engine = get_workspace_engine()
    try:
        ok = engine.revoke_invite(invite_id=invite_id, actor_user_id=user["id"], workspace_id=workspace_id)
        return {"status": "success", "revoked": ok}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/invites/{token}")
async def inspect_invite(token: str):
    """Inspect invite token details before redeeming (unauthenticated safe preview)."""
    engine = get_workspace_engine()
    invite = engine.get_invite(token)
    if not invite:
        raise HTTPException(status_code=404, detail="Invite link is invalid, expired, or revoked.")

    storage = get_storage()
    project = storage.get_project(invite["workspace_id"]) or {}
    project_name = project.get("project_name", "CONVERA Research Workspace")

    return {
        "valid": True,
        "token": token,
        "role": invite["role"],
        "workspace_id": invite["workspace_id"],
        "workspace_name": project_name,
        "expires_at": invite["expires_at"],
    }


@router.post("/invites/{token}/redeem")
async def redeem_workspace_invite(
    token: str,
    user: Dict[str, Any] = Depends(require_user)
):
    """Redeem an invite token and bind authenticated user to the workspace."""
    engine = get_workspace_engine()
    try:
        result = engine.redeem_invite(
            token=token,
            user_id=user["id"],
            display_name=user.get("display_name"),
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{workspace_id}/members/role")
async def update_member_role(
    workspace_id: str,
    req: UpdateRoleRequest,
    user: Dict[str, Any] = Depends(require_user),
    guard: Dict[str, Any] = Depends(require_workspace_role(["OWNER", "ADMIN"]))
):
    """Update role of an existing member in the workspace."""
    engine = get_workspace_engine()
    try:
        updated = engine.update_member_role(
            workspace_id=workspace_id,
            target_user_id=req.user_id,
            new_role=req.role,
            actor_user_id=user["id"],
        )
        return {"status": "success", "member": updated}
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{workspace_id}/members/{target_user_id}")
async def remove_workspace_member(
    workspace_id: str,
    target_user_id: str,
    user: Dict[str, Any] = Depends(require_user)
):
    """Remove member from workspace or self-leave."""
    engine = get_workspace_engine()
    try:
        ok = engine.remove_member(
            workspace_id=workspace_id,
            target_user_id=target_user_id,
            actor_user_id=user["id"],
        )
        return {"status": "success", "removed": ok}
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{workspace_id}/transfer-ownership")
async def transfer_workspace_ownership(
    workspace_id: str,
    req: TransferOwnershipRequest,
    user: Dict[str, Any] = Depends(require_user),
    guard: Dict[str, Any] = Depends(require_workspace_role(["OWNER"]))
):
    """Transfer workspace OWNER status to another member."""
    engine = get_workspace_engine()
    try:
        result = engine.transfer_ownership(
            workspace_id=workspace_id,
            current_owner_id=user["id"],
            new_owner_id=req.new_owner_id,
        )
        return result
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=400, detail=str(e))
