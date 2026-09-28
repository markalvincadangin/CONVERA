"""
CONVERA Settings & AI Configuration Router
==========================================
Endpoints for onboarding local, free, and paid AI model providers,
managing encrypted API keys, and dynamically reordering provider cascades.
"""

from __future__ import annotations

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, Field

try:
    from engines.settings_engine import get_settings_engine
    from middleware.auth_middleware import get_optional_user, require_user
except ImportError:
    from backend.engines.settings_engine import get_settings_engine
    from backend.middleware.auth_middleware import get_optional_user, require_user

router = APIRouter(prefix="/api/settings/ai-providers", tags=["AI Settings & Providers"])


class UpsertProviderRequest(BaseModel):
    provider_name: str = Field(..., description="Provider identifier: gemini, groq, cerebras, github, openrouter, ollama")
    display_name: Optional[str] = None
    provider_type: str = Field("CLOUD_FREE", description="LOCAL, CLOUD_FREE, or CLOUD_PAID")
    model_name: Optional[str] = None
    base_url: Optional[str] = None
    api_key: Optional[str] = Field(None, description="Plaintext API key (will be encrypted with AES-128-CBC before storage)")
    priority: int = Field(10, description="Cascade order priority (lower runs first)")
    is_enabled: bool = True
    is_default: bool = False
    workspace_id: Optional[str] = None


class TestConnectionRequest(BaseModel):
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    model_name: Optional[str] = None
    workspace_id: Optional[str] = None


@router.get("")
async def list_ai_providers(
    workspace_id: Optional[str] = None,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    List all configured AI providers with masked secrets and active priority ordering.
    """
    engine = get_settings_engine()
    providers = engine.list_providers(workspace_id=workspace_id, decrypt=False)
    return {
        "status": "success",
        "providers": providers,
        "count": len(providers),
    }


@router.get("/{provider_name}")
async def get_ai_provider(
    provider_name: str,
    workspace_id: Optional[str] = None,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Retrieve single provider configuration with masked credentials.
    """
    engine = get_settings_engine()
    provider = engine.get_provider(provider_name, workspace_id=workspace_id, decrypt=False)
    if not provider:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_name}' not configured")
    return {"status": "success", "provider": provider}


@router.post("", status_code=status.HTTP_200_OK)
async def upsert_ai_provider(
    req: UpsertProviderRequest,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Add or update an AI provider.
    Encrypts API key via CredentialVault before persisting to database.
    Immediately updates dynamic LLM Gateway cascade without server restart.
    """
    engine = get_settings_engine()
    try:
        saved = engine.upsert_provider(
            provider_name=req.provider_name,
            display_name=req.display_name,
            provider_type=req.provider_type,
            model_name=req.model_name,
            base_url=req.base_url,
            raw_api_key=req.api_key,
            priority=req.priority,
            is_enabled=req.is_enabled,
            is_default=req.is_default,
            workspace_id=req.workspace_id,
        )
        return {"status": "success", "provider": saved}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{provider_name}")
async def delete_ai_provider(
    provider_name: str,
    workspace_id: Optional[str] = None,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Remove an AI provider configuration.
    """
    engine = get_settings_engine()
    deleted = engine.delete_provider(provider_name, workspace_id=workspace_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_name}' not found")
    return {"status": "success", "message": f"Provider '{provider_name}' deleted"}


@router.post("/{provider_name}/test")
async def test_provider_connectivity(
    provider_name: str,
    req: Optional[TestConnectionRequest] = None,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Perform a lightweight connectivity health check against the requested provider.
    Can test in-flight credentials prior to saving, or test existing configured credentials.
    """
    engine = get_settings_engine()
    api_key = req.api_key if req else None
    base_url = req.base_url if req else None
    model_name = req.model_name if req else None
    workspace_id = req.workspace_id if req else None

    result = await engine.test_connectivity(
        provider_name=provider_name,
        raw_api_key=api_key,
        base_url=base_url,
        model_name=model_name,
        workspace_id=workspace_id,
    )
    return {"status": "success", "test_result": result}
