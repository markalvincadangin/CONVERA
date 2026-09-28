"""
Scholarly Tool Integrations Router (Feature 012)
================================================
Governed by: CONVERA Intelligence & Integration Architecture (CIIA v1.0)
Manages external research connectors (Zotero, Notion, Hypothesis, ORCID) with
AES-128-CBC credential encryption in SQLite Credential Vault and provenance tracking.
"""

import os
import time
import json
from typing import Dict, List, Optional, Any, Tuple
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field

from storage import get_storage
from engines.credential_vault import get_credential_vault
from middleware.auth_middleware import get_optional_user

from connectors.reference.zotero_connector import ZoteroConnector
from connectors.knowledge.notion_connector import NotionConnector
from connectors.knowledge.hypothesis_connector import HypothesisConnector
from connectors.identity.orcid_connector import ORCIDConnector

router = APIRouter(prefix="/api/settings/integrations", tags=["Integrations"])

KNOWN_INTEGRATIONS = {
    "zotero": {
        "display_name": "Zotero Reference Manager",
        "connector_type": "REFERENCE",
        "description": "Sync citations, collections, and BibTeX metadata from Zotero libraries.",
    },
    "notion": {
        "display_name": "Notion Knowledge Base",
        "connector_type": "KNOWLEDGE",
        "description": "Ingest research databases, literature notes, and structured synthesis blocks.",
    },
    "hypothesis": {
        "display_name": "Hypothesis Web & PDF Marginalia",
        "connector_type": "KNOWLEDGE",
        "description": "Ingest web marginalia, highlight quotes, and public/private PDF annotations.",
    },
    "orcid": {
        "display_name": "ORCID Researcher Registry",
        "connector_type": "IDENTITY",
        "description": "Sync verified publication records, author identity, and scholarly works.",
    },
}


class IntegrationUpsertRequest(BaseModel):
    integration_type: str
    display_name: Optional[str] = None
    api_key: Optional[str] = None
    user_identifier: Optional[str] = None
    workspace_id: Optional[str] = None
    is_enabled: Optional[bool] = True
    config: Optional[Dict[str, Any]] = Field(default_factory=dict)


class IntegrationTestRequest(BaseModel):
    api_key: Optional[str] = None
    user_identifier: Optional[str] = None
    config: Optional[Dict[str, Any]] = Field(default_factory=dict)


def _resolve_integration_key(
    itype: str,
    explicit_key: Optional[str] = None,
    encrypted_db_key: Optional[str] = None,
) -> Tuple[Optional[str], str]:
    """
    Resolve API key following the Two-Tier Precedence standard:
    1. Explicit key in request payload -> (key, "explicit")
    2. Encrypted Vault key from SQLite -> (decrypted_key, "vault")
    3. Host Environment variable (.env) -> (env_key, "env")
    4. None -> (None, "none")
    """
    if explicit_key and explicit_key.strip():
        return explicit_key.strip(), "explicit"
    if encrypted_db_key:
        try:
            vault = get_credential_vault()
            decrypted = vault.decrypt(encrypted_db_key)
            if decrypted:
                return decrypted, "vault"
        except Exception:
            pass
    env_keys = [
        f"{itype.upper()}_API_KEY",
        f"{itype.upper()}_TOKEN",
        f"{itype.upper()}_SECRET",
    ]
    for k in env_keys:
        v = os.getenv(k, "").strip()
        if v:
            return v, "env"
    return None, "none"


def _get_workspace_id(req_ws_id: Optional[str]) -> str:
    if req_ws_id and req_ws_id.strip():
        return req_ws_id.strip()
    storage = get_storage()
    with storage._get_connection() as conn:
        row = conn.execute("SELECT id FROM projects ORDER BY created_at ASC LIMIT 1").fetchone()
        if row:
            return row["id"]
    return "proj_default"


def _build_connector_instance(
    integration_type: str,
    api_key: Optional[str] = None,
    user_identifier: Optional[str] = None,
    config: Optional[Dict[str, Any]] = None,
):
    cfg = config or {}
    t = integration_type.lower()

    # Resolve key via precedence if not provided
    resolved_key = api_key
    if not resolved_key:
        resolved_key, _ = _resolve_integration_key(t)

    resolved_user = user_identifier
    if not resolved_user:
        for k in [f"{t.upper()}_LIBRARY_ID", f"{t.upper()}_DATABASE_ID", f"{t.upper()}_USER_ID", f"{t.upper()}_ID"]:
            v = os.getenv(k, "").strip()
            if v:
                resolved_user = v
                break

    if t == "zotero":
        lib_id = resolved_user or cfg.get("library_id")
        lib_type = cfg.get("library_type", "user")
        return ZoteroConnector(library_id=lib_id, api_key=resolved_key, library_type=lib_type)
    elif t == "notion":
        db_id = cfg.get("database_id") or resolved_user
        return NotionConnector(api_key=resolved_key, default_database_id=db_id)
    elif t == "hypothesis":
        group = cfg.get("default_group", "__world__")
        return HypothesisConnector(api_key=resolved_key, user_identifier=resolved_user, default_group=group)
    elif t == "orcid":
        orcid_id = resolved_user or cfg.get("orcid")
        return ORCIDConnector(default_orcid=orcid_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported integration connector: {integration_type}",
        )


@router.get("")
async def list_integrations(
    workspace_id: Optional[str] = Query(None),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """List all available and configured scholarly integrations for workspace."""
    storage = get_storage()
    target_ws = _get_workspace_id(workspace_id)
    configured = storage.list_integrations(target_ws)
    by_type = {c["id"]: c for c in configured}

    result = []
    for itype, meta in KNOWN_INTEGRATIONS.items():
        record = by_type.get(itype)
        resolved_key, secret_source = _resolve_integration_key(
            itype,
            encrypted_db_key=record.get("api_key_encrypted") if record else None,
        )

        cfg = record.get("config", {}) if record else {}
        user_ident = (
            (cfg.get("user_identifier") or cfg.get("library_id") or cfg.get("orcid"))
            if record
            else None
        )
        if not user_ident:
            for k in [f"{itype.upper()}_LIBRARY_ID", f"{itype.upper()}_DATABASE_ID", f"{itype.upper()}_ID"]:
                v = os.getenv(k, "").strip()
                if v:
                    user_ident = v
                    break

        has_secret = bool(resolved_key)
        masked_secret = None
        if secret_source == "vault":
            masked_secret = "••••••••"
        elif secret_source == "env":
            masked_secret = "•••••••• (via .env)"

        is_configured = bool(record) or (bool(resolved_key) and secret_source == "env")

        result.append({
            "integration_type": itype,
            "display_name": record.get("display_name", meta["display_name"]) if record else meta["display_name"],
            "connector_type": meta["connector_type"],
            "description": meta["description"],
            "is_configured": is_configured,
            "has_secret": has_secret,
            "secret_source": secret_source,
            "masked_secret": masked_secret,
            "user_identifier": user_ident,
            "is_enabled": bool(record.get("is_enabled", 1)) if record else (True if has_secret else False),
            "last_sync_at": record.get("last_sync_at") if record else None,
            "last_sync_status": record.get("last_sync_status") if record else None,
            "items_synced_count": record.get("items_synced_count", 0) if record else 0,
            "config": cfg,
        })

    return {"integrations": result, "workspace_id": target_ws}


@router.post("")
async def upsert_integration(
    payload: IntegrationUpsertRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """Save integration credentials with AES-128-CBC encryption."""
    itype = payload.integration_type.lower()
    if itype not in KNOWN_INTEGRATIONS:
        raise HTTPException(status_code=400, detail=f"Unknown integration: {itype}")

    storage = get_storage()
    vault = get_credential_vault()
    workspace_id = _get_workspace_id(payload.workspace_id)
    user_id = current_user.get("id") if current_user else None

    # Merge config
    cfg = payload.config or {}
    if payload.user_identifier:
        cfg["user_identifier"] = payload.user_identifier
        if itype == "zotero":
            cfg["library_id"] = payload.user_identifier
        elif itype == "orcid":
            cfg["orcid"] = payload.user_identifier

    # Handle encryption
    encrypted_key = None
    if payload.api_key and payload.api_key.strip():
        encrypted_key = vault.encrypt(payload.api_key.strip())
    else:
        existing = storage.get_integration(itype)
        if existing:
            encrypted_key = existing.get("api_key_encrypted")

    record_data = {
        "id": itype,
        "workspace_id": workspace_id,
        "user_id": user_id,
        "display_name": payload.display_name or KNOWN_INTEGRATIONS[itype]["display_name"],
        "connector_type": KNOWN_INTEGRATIONS[itype]["connector_type"],
        "api_key_encrypted": encrypted_key,
        "config": cfg,
        "is_enabled": 1 if payload.is_enabled else 0,
    }

    saved = storage.upsert_integration(record_data)
    return {
        "status": "success",
        "integration": {
            "integration_type": itype,
            "display_name": saved.get("display_name"),
            "is_configured": True,
            "has_secret": bool(saved.get("api_key_encrypted")),
            "masked_secret": "••••••••" if saved.get("api_key_encrypted") else None,
            "is_enabled": bool(saved.get("is_enabled")),
            "config": saved.get("config", {}),
        },
    }


@router.delete("/{integration_type}")
async def delete_integration(
    integration_type: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """Remove integration configuration and encrypted secrets."""
    storage = get_storage()
    ok = storage.delete_integration(integration_type.lower())
    return {"status": "success", "deleted": ok}


@router.post("/{integration_type}/test")
async def test_integration_connectivity(
    integration_type: str,
    payload: Optional[IntegrationTestRequest] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """Test connection to the external tool provider."""
    itype = integration_type.lower()
    storage = get_storage()
    vault = get_credential_vault()

    existing = storage.get_integration(itype) or {}
    existing_cfg = existing.get("config", {})

    api_key = None
    if payload and payload.api_key:
        api_key = payload.api_key.strip()
    elif existing.get("api_key_encrypted"):
        api_key = vault.decrypt(existing["api_key_encrypted"])

    user_id = None
    if payload and payload.user_identifier:
        user_id = payload.user_identifier.strip()
    else:
        user_id = existing_cfg.get("user_identifier") or existing_cfg.get("library_id") or existing_cfg.get("orcid")

    cfg = {**existing_cfg, **(payload.config if payload else {})}

    connector = _build_connector_instance(itype, api_key=api_key, user_identifier=user_id, config=cfg)
    test_result = await connector.health_check()
    return {"status": "ok", "test_result": test_result}


@router.post("/{integration_type}/sync")
async def sync_integration(
    integration_type: str,
    workspace_id: Optional[str] = Query(None),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """Trigger inbound sync of references, notes, or annotations."""
    itype = integration_type.lower()
    storage = get_storage()
    vault = get_credential_vault()
    target_ws = _get_workspace_id(workspace_id)

    record = storage.get_integration(itype)
    if not record:
        resolved_key, src = _resolve_integration_key(itype)
        if not resolved_key and itype != "orcid":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Integration '{itype}' is not configured in vault or environment.",
            )
        record = {}

    api_key = None
    if record.get("api_key_encrypted"):
        api_key = vault.decrypt(record["api_key_encrypted"])
    elif not api_key:
        api_key, _ = _resolve_integration_key(itype)

    cfg = record.get("config", {})
    user_id = cfg.get("user_identifier") or cfg.get("library_id") or cfg.get("orcid")

    connector = _build_connector_instance(itype, api_key=api_key, user_identifier=user_id, config=cfg)

    start_time = time.time()
    synced_items: List[Dict[str, Any]] = []
    status_str = "SUCCESS"

    try:
        if itype == "zotero":
            sync_res = await connector.sync_library()
            synced_items = sync_res.get("items", [])
        elif itype == "notion":
            notes_res = await connector.fetch_notes(limit=50)
            synced_items = notes_res.get("notes", [])
        elif itype == "hypothesis":
            hyp_res = await connector.fetch_notes(limit=50)
            synced_items = hyp_res.get("notes", [])
        elif itype == "orcid":
            works = await connector.fetch_works(limit=50)
            synced_items = [w.model_dump() for w in works]
    except Exception as e:
        status_str = f"ERROR: {str(e)}"

    duration_ms = int((time.time() - start_time) * 1000)

    # Log to sync_log
    storage.log_sync_event({
        "integration_id": itype,
        "workspace_id": target_ws,
        "sync_type": "PULL",
        "direction": "INBOUND",
        "items_processed": len(synced_items),
        "items_created": len(synced_items),
        "items_updated": 0,
        "items_failed": 0 if status_str == "SUCCESS" else len(synced_items),
        "duration_ms": duration_ms,
    })

    # Update integration_registry
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    storage.upsert_integration({
        "id": itype,
        "workspace_id": target_ws,
        "display_name": record.get("display_name") or KNOWN_INTEGRATIONS[itype]["display_name"],
        "connector_type": record.get("connector_type") or KNOWN_INTEGRATIONS[itype]["connector_type"],
        "last_sync_at": now_iso,
        "last_sync_status": status_str,
        "items_synced_count": len(synced_items),
        "config": cfg,
        "is_enabled": record.get("is_enabled", 1),
    })

    return {
        "status": "success" if status_str == "SUCCESS" else "error",
        "synced_count": len(synced_items),
        "duration_ms": duration_ms,
        "last_sync_at": now_iso,
        "items": synced_items[:10],  # Return preview sample
    }


@router.get("/{integration_type}/logs")
async def get_integration_logs(
    integration_type: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """Retrieve historical synchronization logs for an integration."""
    storage = get_storage()
    logs = storage.list_sync_logs(integration_type.lower())
    return {"logs": logs}
