"""
CONVERA Authentication & RBAC Middleware
========================================
Extracts authenticated user from HttpOnly cookies or Bearer headers.
Provides dependency injection guards for routes requiring authentication
or workspace-scoped role permissions.
"""

from typing import Optional, Dict, Any, List, Union
from fastapi import Request, HTTPException, Depends

try:
    from storage import get_storage
    from engines.auth_engine import get_auth_engine
except ImportError:
    from backend.storage import get_storage
    from backend.engines.auth_engine import get_auth_engine


ROLE_HIERARCHY: Dict[str, int] = {
    "OWNER": 5,
    "ADMIN": 4,
    "MEMBER": 3,
    "ADVISOR": 2,
    "VIEWER": 1,
}


async def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    """
    Extract current user from either 'convera_access' HttpOnly cookie
    or 'Authorization: Bearer <token>' header.
    Returns sanitized user dict (without password_hash) or None.
    """
    token: Optional[str] = request.cookies.get("convera_access")

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if not token:
        return None

    try:
        engine = get_auth_engine()
        claims = engine.verify_access_token(token)
        if not claims or "sub" not in claims:
            return None

        storage = get_storage()
        user = storage.get_user(claims["sub"])
        if not user or not user.get("is_active", 1):
            return None

        # Return sanitized user
        sanitized = {k: v for k, v in user.items() if k != "password_hash"}
        return sanitized
    except Exception:
        return None


async def require_user(request: Request) -> Dict[str, Any]:
    """
    Dependency guard enforcing authenticated human user.
    Raises HTTP 401 if unauthenticated.
    """
    user = await get_optional_user(request)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please log in or provide a valid access token."
        )
    return user


def require_workspace_role(
    allowed_roles: Union[str, List[str]],
    workspace_id_param: str = "workspace_id",
    allow_anonymous: bool = False,
):
    """
    Dependency factory verifying that the active user possesses an appropriate
    role in the target workspace.

    Args:
        allowed_roles: Single role name or list of allowed roles.
        workspace_id_param: Name of the route parameter identifying the workspace.
        allow_anonymous: If True and request has no user, anonymous access is permitted.
    """
    if isinstance(allowed_roles, str):
        target_roles = [allowed_roles.upper()]
    else:
        target_roles = [r.upper() for r in allowed_roles]

    async def _workspace_guard(request: Request) -> Dict[str, Any]:
        user = await get_optional_user(request)

        # 1. Handle anonymous request
        if not user:
            if allow_anonymous or "ANONYMOUS" in target_roles:
                return {
                    "is_anonymous": True,
                    "user": None,
                    "role": "ANONYMOUS",
                    "workspace_id": request.path_params.get(workspace_id_param),
                }
            raise HTTPException(
                status_code=401,
                detail="Authentication required to perform this workspace action."
            )

        # 2. Superadmin bypass
        if user.get("system_role") == "SUPERADMIN":
            return {
                "is_anonymous": False,
                "user": user,
                "role": "SUPERADMIN",
                "workspace_id": request.path_params.get(workspace_id_param),
            }

        # 3. Extract workspace ID
        ws_id = (
            request.path_params.get(workspace_id_param)
            or request.path_params.get("session_id")
            or request.path_params.get("project_id")
            or request.path_params.get("id")
            or request.query_params.get("workspace_id")
            or request.query_params.get("project_id")
        )

        if not ws_id:
            # If no workspace id was specified, permit if authenticated
            return {"is_anonymous": False, "user": user, "role": "USER", "workspace_id": None}

        storage = get_storage()
        membership = storage.get_workspace_membership(ws_id, user["id"])

        if not membership or not membership.get("is_active", 1):
            raise HTTPException(
                status_code=403,
                detail="Access denied: You are not an active member of this workspace."
            )

        user_role = membership.get("role", "VIEWER").upper()

        # Check membership against allowed roles
        # If target_roles is a list of exact roles, check membership
        if user_role not in target_roles:
            # Also evaluate rank-based threshold if min role was provided
            user_rank = ROLE_HIERARCHY.get(user_role, 0)
            required_ranks = [ROLE_HIERARCHY.get(r, 999) for r in target_roles]
            min_required = min(required_ranks) if required_ranks else 999

            if user_rank < min_required:
                raise HTTPException(
                    status_code=403,
                    detail=f"Insufficient permissions: role '{user_role}' does not satisfy required roles {target_roles}."
                )

        return {
            "is_anonymous": False,
            "user": user,
            "membership": membership,
            "role": user_role,
            "workspace_id": ws_id,
        }

    return _workspace_guard
