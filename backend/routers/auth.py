"""
CONVERA Progressive Identity & Authentication Router
===================================================
Endpoints for registration, login, token refresh, logout, and current user profile.
Supports both HttpOnly cookies and Bearer authorization headers.
"""

import os
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Response, Request, Depends, status
from pydantic import BaseModel, EmailStr, Field

try:
    from storage import get_storage
    from engines.auth_engine import get_auth_engine
    from middleware.auth_middleware import get_optional_user, require_user
except ImportError:
    from backend.storage import get_storage
    from backend.engines.auth_engine import get_auth_engine
    from backend.middleware.auth_middleware import get_optional_user, require_user

router = APIRouter(prefix="/api/auth", tags=["Authentication & Identity"])

COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() in ("true", "1", "yes")
ACCESS_COOKIE_MAX_AGE = 15 * 60  # 15 minutes
REFRESH_COOKIE_MAX_AGE = 7 * 24 * 3600  # 7 days


# --- Schemas ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    display_name: str = Field(..., min_length=1, max_length=100)
    active_project_id: Optional[str] = Field(None, description="Optional active anonymous workspace to claim")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    email: str
    display_name: str
    avatar: Optional[str] = None
    system_role: str = "USER"
    is_active: int = 1
    preferences_json: Optional[str] = "{}"
    created_at: Optional[str] = None


# --- Helper to set auth cookies ---

def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="convera_access",
        value=access_token,
        max_age=ACCESS_COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/",
    )
    response.set_cookie(
        key="convera_refresh",
        value=refresh_token,
        max_age=REFRESH_COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/api/auth",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key="convera_access", path="/")
    response.delete_cookie(key="convera_refresh", path="/api/auth")


# --- Endpoints ---

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, response: Response):
    """
    Register a new user account with Argon2id password hashing.
    Optionally claims an existing anonymous workspace as OWNER.
    Sets HttpOnly auth cookies and returns user and token payload.
    """
    engine = get_auth_engine()
    try:
        result = engine.register(
            email=str(req.email).strip().lower(),
            password=req.password,
            display_name=req.display_name.strip(),
            active_project_id=req.active_project_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    _set_auth_cookies(
        response=response,
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
    )

    return {
        "status": "success",
        "user": result["user"],
        "tokens": {
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "access_expires_at": result["access_expires_at"],
            "refresh_expires_at": result["refresh_expires_at"],
        },
        "claimed_workspace": result.get("claimed_workspace"),
    }


@router.post("/login")
async def login(req: LoginRequest, response: Response):
    """
    Authenticate user with email and password.
    Returns access/refresh tokens and sets HttpOnly cookies.
    """
    engine = get_auth_engine()
    try:
        result = engine.authenticate(
            email=str(req.email).strip().lower(),
            password=req.password,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    _set_auth_cookies(
        response=response,
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
    )

    return {
        "status": "success",
        "user": result["user"],
        "tokens": {
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "access_expires_at": result["access_expires_at"],
            "refresh_expires_at": result["refresh_expires_at"],
        },
    }


@router.post("/refresh")
async def refresh_tokens(request: Request, response: Response, req: Optional[RefreshRequest] = None):
    """
    Rotate refresh token and issue a new access/refresh token pair.
    Mitigates replay attacks by invalidating the prior token immediately.
    """
    raw_token = (req.refresh_token if req else None) or request.cookies.get("convera_refresh")
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required either in request body or as cookie."
        )

    engine = get_auth_engine()
    try:
        result = engine.rotate_refresh_token(raw_token)
    except ValueError as e:
        _clear_auth_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    _set_auth_cookies(
        response=response,
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
    )

    return {
        "status": "success",
        "user": result["user"],
        "tokens": {
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "access_expires_at": result["access_expires_at"],
            "refresh_expires_at": result["refresh_expires_at"],
        },
    }


@router.post("/logout")
async def logout(request: Request, response: Response, req: Optional[RefreshRequest] = None):
    """
    Revoke current refresh token and clear authentication cookies.
    """
    raw_token = (req.refresh_token if req else None) or request.cookies.get("convera_refresh")
    if raw_token:
        engine = get_auth_engine()
        engine.revoke_token(raw_token)

    _clear_auth_cookies(response)
    return {"status": "success", "message": "Successfully logged out"}


@router.get("/me")
async def get_current_user_profile(request: Request):
    """
    Retrieve currently authenticated user profile and associated workspaces.
    Returns authenticated: false if unauthenticated without 401 exception.
    """
    user = await get_optional_user(request)
    if not user:
        return {"authenticated": False, "user": None, "workspaces": []}

    storage = get_storage()
    workspaces = storage.list_user_workspaces(user["id"])

    return {
        "authenticated": True,
        "user": user,
        "workspaces": workspaces,
    }
