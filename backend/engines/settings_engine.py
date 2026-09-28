"""
CONVERA Settings & AI Provider Engine (Feature 012)
===================================================
Manages system & workspace AI provider configurations with AES-128-CBC
credential encryption via CredentialVault, dynamic cascade ordering,
and connectivity health checks.
"""

from __future__ import annotations

import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

try:
    from storage.base import BaseStorageAdapter
    from engines.credential_vault import CredentialVault, get_credential_vault
except ImportError:
    from backend.storage.base import BaseStorageAdapter
    from backend.engines.credential_vault import CredentialVault, get_credential_vault

logger = logging.getLogger("convera.settings_engine")


def mask_secret(secret: Optional[str]) -> Optional[str]:
    """Return a safely redacted representation of a secret string."""
    if not secret:
        return None
    s = secret.strip()
    if len(s) <= 8:
        return "••••••••"
    return f"{s[:3]}••••••••{s[-3:]}"


class SettingsEngine:
    """
    Coordinates AI provider configurations, encrypted credential persistence,
    and runtime priority cascades.
    """

    def __init__(self, storage: BaseStorageAdapter, vault: Optional[CredentialVault] = None):
        self._storage = storage
        self._vault = vault or get_credential_vault()

    def upsert_provider(
        self,
        provider_name: str,
        display_name: Optional[str] = None,
        provider_type: str = "CLOUD_FREE",
        model_name: Optional[str] = None,
        base_url: Optional[str] = None,
        raw_api_key: Optional[str] = None,
        priority: int = 10,
        is_enabled: bool = True,
        is_default: bool = False,
        workspace_id: Optional[str] = None,
        custom_headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Create or update an AI provider entry with encrypted credentials.
        """
        p_name = provider_name.strip().lower()
        now = datetime.now(timezone.utc).isoformat()

        # Check for existing record
        existing = self._storage.get_ai_provider(p_name, workspace_id)

        ciphertext = None
        has_key = 0

        if raw_api_key and raw_api_key.strip():
            # Encrypt new API key
            ciphertext = self._vault.encrypt(raw_api_key.strip())
            has_key = 1
        elif existing and existing.get("api_key_ciphertext"):
            # Retain existing encrypted key
            ciphertext = existing["api_key_ciphertext"]
            has_key = 1

        pid = existing["id"] if existing else (f"{workspace_id}_{p_name}" if workspace_id else p_name)

        payload = {
            "id": pid,
            "workspace_id": workspace_id,
            "provider_name": p_name,
            "display_name": display_name or p_name.capitalize(),
            "provider_type": provider_type.upper(),
            "model_name": model_name or (existing.get("model_name") if existing else ""),
            "base_url": base_url or (existing.get("base_url") if existing else None),
            "api_key_ciphertext": ciphertext,
            "custom_headers": custom_headers,
            "priority": priority,
            "is_enabled": 1 if is_enabled else 0,
            "is_default": 1 if is_default else 0,
            "config": {"provider_name": p_name, "custom_headers": custom_headers or {}},
            "updated_at": now,
        }

        saved = self._storage.upsert_ai_provider(payload)
        res = self._sanitize_provider(saved)
        res["provider_name"] = p_name
        return res

    def get_provider(
        self,
        provider_name: str,
        workspace_id: Optional[str] = None,
        decrypt: bool = False,
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve provider config. Plaintext API key is included ONLY when decrypt=True.
        """
        p_name = provider_name.strip().lower()
        provider = self._storage.get_ai_provider(p_name, workspace_id)
        if not provider:
            return None

        if decrypt:
            decrypted = dict(provider)
            ciphertext = provider.get("api_key_ciphertext")
            if ciphertext:
                try:
                    decrypted["api_key"] = self._vault.decrypt(ciphertext)
                except Exception as e:
                    logger.error(f"Failed to decrypt credentials for provider {p_name}: {e}")
                    decrypted["api_key"] = None
            else:
                decrypted["api_key"] = None
            return decrypted

        return self._sanitize_provider(provider)

    def list_providers(
        self,
        workspace_id: Optional[str] = None,
        decrypt: bool = False,
    ) -> List[Dict[str, Any]]:
        """
        List all configured AI providers ordered by priority.
        """
        providers = self._storage.list_ai_providers(workspace_id)
        if decrypt:
            result = []
            for p in providers:
                dec = dict(p)
                ciphertext = p.get("api_key_ciphertext")
                if ciphertext:
                    try:
                        dec["api_key"] = self._vault.decrypt(ciphertext)
                    except Exception:
                        dec["api_key"] = None
                else:
                    dec["api_key"] = None
                result.append(dec)
            return result

        return [self._sanitize_provider(p) for p in providers]

    def delete_provider(self, provider_name: str, workspace_id: Optional[str] = None) -> bool:
        """Remove a provider configuration."""
        p_name = provider_name.strip().lower()
        return self._storage.delete_ai_provider(p_name, workspace_id)

    async def test_connectivity(
        self,
        provider_name: str,
        raw_api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model_name: Optional[str] = None,
        workspace_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Lightweight health check against the requested or saved provider credentials.
        """
        import httpx

        p_name = provider_name.strip().lower()
        api_key = raw_api_key

        if not api_key:
            saved = self.get_provider(p_name, workspace_id, decrypt=True)
            if saved:
                api_key = saved.get("api_key")
                if not base_url:
                    base_url = saved.get("base_url")
                if not model_name:
                    model_name = saved.get("model_name")

        if p_name == "ollama":
            url = (base_url or "http://localhost:11434").rstrip("/") + "/api/tags"
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        models = [m.get("name") for m in resp.json().get("models", [])]
                        return {
                            "status": "healthy",
                            "provider": "ollama",
                            "available_models": models,
                            "message": f"Ollama daemon responsive with {len(models)} models available.",
                        }
                    return {"status": "unhealthy", "provider": "ollama", "error": f"HTTP {resp.status_code}"}
            except Exception as e:
                return {"status": "unreachable", "provider": "ollama", "error": str(e)}

        if not api_key:
            return {"status": "unconfigured", "provider": p_name, "error": "No API key provided or configured"}

        # Validate with simple API probe
        if p_name == "gemini":
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        return {"status": "healthy", "provider": "gemini", "message": "Google Gemini API key valid."}
                    return {"status": "unhealthy", "provider": "gemini", "error": f"HTTP {resp.status_code}: {resp.text[:120]}"}
            except Exception as e:
                return {"status": "error", "provider": "gemini", "error": str(e)}

        elif p_name in ("groq", "cerebras", "openrouter", "github"):
            endpoint_map = {
                "groq": "https://api.groq.com/openai/v1/models",
                "cerebras": "https://api.cerebras.ai/v1/models",
                "openrouter": "https://openrouter.ai/api/v1/models",
                "github": "https://models.inference.ai.azure.com/models",
            }
            target_url = endpoint_map.get(p_name, "https://api.groq.com/openai/v1/models")
            try:
                headers = {"Authorization": f"Bearer {api_key}"}
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(target_url, headers=headers)
                    if resp.status_code in (200, 201):
                        return {"status": "healthy", "provider": p_name, "message": f"{p_name.capitalize()} API key verified."}
                    return {"status": "unhealthy", "provider": p_name, "error": f"HTTP {resp.status_code}: {resp.text[:120]}"}
            except Exception as e:
                return {"status": "error", "provider": p_name, "error": str(e)}

        return {"status": "unknown_provider", "provider": p_name, "error": f"Provider '{p_name}' probe not supported"}

    def _sanitize_provider(self, p: Dict[str, Any]) -> Dict[str, Any]:
        """Strip raw ciphertext and replace with safe metadata."""
        sanitized = dict(p)
        has_key = bool(sanitized.pop("api_key_ciphertext", None) or sanitized.pop("api_key_encrypted", None))
        sanitized["has_api_key"] = has_key
        sanitized["masked_key"] = "••••••••" if has_key else None
        # Normalize provider_name
        cfg = sanitized.get("config") or {}
        if cfg.get("provider_name"):
            sanitized["provider_name"] = cfg["provider_name"]
        elif sanitized.get("id"):
            raw_id = sanitized["id"]
            if "_" in raw_id and raw_id.startswith("aip_"):
                parts = raw_id.split("_")
                sanitized["provider_name"] = parts[1]
            else:
                sanitized["provider_name"] = raw_id
        return sanitized


_GLOBAL_SETTINGS_ENGINE: Optional[SettingsEngine] = None


def get_settings_engine() -> SettingsEngine:
    """Singleton getter for SettingsEngine."""
    global _GLOBAL_SETTINGS_ENGINE
    if _GLOBAL_SETTINGS_ENGINE is None:
        try:
            from storage import get_storage
        except ImportError:
            from backend.storage import get_storage
        _GLOBAL_SETTINGS_ENGINE = SettingsEngine(storage=get_storage(), vault=get_credential_vault())
    return _GLOBAL_SETTINGS_ENGINE
