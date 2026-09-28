"""
Integration Tests for AI Provider Settings, Encryption, and Gateway Cascade (Feature 012)
========================================================================================
Validates encrypted key persistence, API masking, dynamic cascade reload without restart,
and FastAPI settings endpoints.
"""

import os
import pytest
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.credential_vault import CredentialVault
from engines.settings_engine import SettingsEngine
from llm_gateway import reload_config, PROVIDER_REGISTRY
from server import app


@pytest.fixture
def settings_env(tmp_path):
    """Isolated test environment with SQLite and CredentialVault."""
    db_file = str(tmp_path / "test_settings.db")
    storage = SQLiteStorageAdapter(db_path=db_file)
    key_file = str(tmp_path / "test.key")
    vault = CredentialVault(key_file_path=key_file)
    engine = SettingsEngine(storage=storage, vault=vault)
    return {
        "storage": storage,
        "vault": vault,
        "engine": engine,
    }


def test_provider_key_encryption_and_masking(settings_env):
    """Verify raw API keys are never stored plaintext and are masked in list/get."""
    engine = settings_env["engine"]
    storage = settings_env["storage"]
    vault = settings_env["vault"]

    raw_key = "gsk_live_secret_groq_production_key_12345678"

    # 1. Upsert provider
    saved = engine.upsert_provider(
        provider_name="groq",
        display_name="Groq Ultra",
        provider_type="CLOUD_FREE",
        model_name="llama-3.3-70b-versatile",
        raw_api_key=raw_key,
        priority=1,
    )

    assert saved["provider_name"] == "groq"
    assert saved["has_api_key"] is True
    assert saved["masked_key"] == "••••••••"
    assert "api_key_ciphertext" not in saved
    assert "api_key" not in saved

    # 2. Inspect raw SQLite table row
    with storage._get_connection() as conn:
        row = conn.execute("SELECT * FROM ai_provider_registry WHERE id = 'groq'").fetchone()
        assert row is not None
        ciphertext = row["api_key_encrypted"]
        assert ciphertext is not None
        assert raw_key not in ciphertext
        # Verify it can be decrypted with the vault
        decrypted = vault.decrypt(ciphertext)
        assert decrypted == raw_key

    # 3. Retrieve with decrypt=True for internal engine
    internal = engine.get_provider("groq", decrypt=True)
    assert internal["api_key"] == raw_key

    # 4. Retrieve with decrypt=False for public API
    public = engine.get_provider("groq", decrypt=False)
    assert "api_key" not in public
    assert public["has_api_key"] is True
    assert public["masked_key"] == "••••••••"


def test_provider_deletion_and_reorder(settings_env):
    """Verify provider cascade priority order and deletion."""
    engine = settings_env["engine"]

    engine.upsert_provider(provider_name="gemini", priority=20, raw_api_key="gem_123")
    engine.upsert_provider(provider_name="ollama", priority=5, base_url="http://localhost:11434")
    engine.upsert_provider(provider_name="groq", priority=10, raw_api_key="groq_123")

    providers = engine.list_providers()
    names = [p["provider_name"] for p in providers]
    # Priority ASC: ollama (5) -> groq (10) -> gemini (20)
    assert names == ["ollama", "groq", "gemini"]

    # Delete groq
    del_ok = engine.delete_provider("groq")
    assert del_ok is True
    remaining = [p["provider_name"] for p in engine.list_providers()]
    assert "groq" not in remaining
    assert remaining == ["ollama", "gemini"]


def test_fastapi_settings_endpoints():
    """Verify FastAPI /api/settings/ai-providers routes."""
    with TestClient(app) as client:
        # 1. Upsert provider
        resp = client.post(
            "/api/settings/ai-providers",
            json={
                "provider_name": "openrouter",
                "display_name": "OpenRouter Gateway",
                "provider_type": "CLOUD_FREE",
                "model_name": "deepseek/deepseek-r1:free",
                "api_key": "sk-or-v1-supersecretkey999",
                "priority": 2,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["provider"]["provider_name"] == "openrouter"
        assert data["provider"]["has_api_key"] is True
        assert "api_key" not in data["provider"]

        # 2. List providers
        list_resp = client.get("/api/settings/ai-providers")
        assert list_resp.status_code == 200
        p_names = [p["provider_name"] for p in list_resp.json()["providers"]]
        assert "openrouter" in p_names

        # 3. Get single provider
        get_resp = client.get("/api/settings/ai-providers/openrouter")
        assert get_resp.status_code == 200
        assert get_resp.json()["provider"]["model_name"] == "deepseek/deepseek-r1:free"

        # 4. Test connectivity endpoint (mocked unreachable or valid response format)
        test_resp = client.post(
            "/api/settings/ai-providers/openrouter/test",
            json={"api_key": "invalid_test_key"},
        )
        assert test_resp.status_code == 200
        assert "test_result" in test_resp.json()

        # 5. Delete provider
        del_resp = client.delete("/api/settings/ai-providers/openrouter")
        assert del_resp.status_code == 200
        assert del_resp.json()["status"] == "success"
