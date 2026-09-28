"""
Unit & Integration Tests for Two-Tier Secret Precedence Standard
=================================================================
Validates CONVERA's architectural mandate:
  Workspace DB Vault > System DB Vault > Host .env > Sovereign Offline Ollama

Verifies:
1. Database Vault keys override host environment variables.
2. Unset database keys seamlessly fall back to environment variables.
3. Offline Ollama fallback persists when no cloud keys are provided.
4. Zero plaintext secrets are exposed over API list endpoints.
5. Connectors automatically read environment variables when unconfigured.
"""

import os
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.credential_vault import CredentialVault
from engines.settings_engine import SettingsEngine
from llm_gateway import reload_config
from routers.integrations import _resolve_integration_key
from connectors.reference.zotero_connector import ZoteroConnector
from connectors.knowledge.notion_connector import NotionConnector
from connectors.knowledge.hypothesis_connector import HypothesisConnector
from connectors.identity.orcid_connector import ORCIDConnector
from connectors.semantic_scholar_connector import SemanticScholarConnector
from server import app


@pytest.fixture
def isolated_vault(tmp_path):
    """Provides an isolated SQLite database and CredentialVault instance."""
    db_file = str(tmp_path / "test_precedence.db")
    storage = SQLiteStorageAdapter(db_path=db_file)
    key_file = str(tmp_path / "test_precedence.key")
    vault = CredentialVault(key_file_path=key_file)
    engine = SettingsEngine(storage=storage, vault=vault)
    # Ensure default project exists for foreign key constraints
    storage.save_session("sess_init", {"project_name": "Default Project"})
    return {
        "storage": storage,
        "vault": vault,
        "engine": engine,
    }


def test_llm_gateway_precedence_db_overrides_env(isolated_vault):
    """Verify encrypted DB vault key takes precedence over host environment variable."""
    engine = isolated_vault["engine"]

    # 1. Upsert groq key into database
    engine.upsert_provider(
        provider_name="groq",
        display_name="Groq Vault Key",
        provider_type="CLOUD_FREE",
        model_name="llama-3.3-70b-versatile",
        raw_api_key="vault_groq_secret_key_12345",
        priority=1,
    )

    # 2. Set environment variable to a conflicting key
    with patch.dict(os.environ, {"GROQ_API_KEY": "env_groq_fallback_key_99999"}):
        with patch("engines.settings_engine.get_settings_engine", return_value=engine):
            with patch("backend.engines.settings_engine.get_settings_engine", return_value=engine):
                with patch("llm_gateway.load_dotenv"):
                    cfg = reload_config()
                    assert cfg["groq_key"] == "vault_groq_secret_key_12345"


def test_llm_gateway_fallback_to_env(isolated_vault):
    """Verify that when no DB provider is configured, the system falls back to .env."""
    engine = isolated_vault["engine"]

    # No groq provider in database
    with patch.dict(os.environ, {"GROQ_API_KEY": "env_groq_fallback_key_99999"}):
        with patch("engines.settings_engine.get_settings_engine", return_value=engine):
            with patch("backend.engines.settings_engine.get_settings_engine", return_value=engine):
                with patch("llm_gateway.load_dotenv"):
                    cfg = reload_config()
                    assert cfg["groq_key"] == "env_groq_fallback_key_99999"


def test_llm_gateway_offline_fallback(isolated_vault):
    """Verify that when neither DB nor .env has keys, Ollama sovereign offline is used."""
    engine = isolated_vault["engine"]

    with patch.dict(os.environ, {
        "GEMINI_API_KEY": "",
        "GOOGLE_API_KEY": "",
        "GROQ_API_KEY": "",
        "CEREBRAS_API_KEY": "",
        "GITHUB_TOKEN": "",
        "OPENROUTER_API_KEY": "",
    }, clear=False):
        with patch("engines.settings_engine.get_settings_engine", return_value=engine):
            with patch("backend.engines.settings_engine.get_settings_engine", return_value=engine):
                with patch("llm_gateway.load_dotenv"):
                    cfg = reload_config()
                    assert cfg["ollama_base"] == "http://localhost:11434/v1"
                    assert cfg["ollama_model"] == "llama3.2"


def test_resolve_integration_key_hierarchy(isolated_vault):
    """Verify _resolve_integration_key adheres strictly to the Two-Tier Precedence standard."""
    vault = isolated_vault["vault"]
    encrypted_key = vault.encrypt("vault_encrypted_zotero_key")

    with patch("routers.integrations.get_credential_vault", return_value=vault):
        # Case 1: Explicit key takes priority 1
        key, src = _resolve_integration_key("zotero", explicit_key="explicit_payload_key", encrypted_db_key=encrypted_key)
        assert key == "explicit_payload_key"
        assert src == "explicit"

        # Case 2: Vault key takes priority 2 over .env
        with patch.dict(os.environ, {"ZOTERO_API_KEY": "env_zotero_key"}):
            key, src = _resolve_integration_key("zotero", encrypted_db_key=encrypted_key)
            assert key == "vault_encrypted_zotero_key"
            assert src == "vault"

        # Case 3: Host .env takes priority 3 when no vault key exists
        with patch.dict(os.environ, {"ZOTERO_API_KEY": "env_zotero_key"}):
            key, src = _resolve_integration_key("zotero", encrypted_db_key=None)
            assert key == "env_zotero_key"
            assert src == "env"

        # Case 4: None when no key is configured anywhere
        with patch.dict(os.environ, {"ZOTERO_API_KEY": "", "ZOTERO_TOKEN": "", "ZOTERO_SECRET": ""}):
            key, src = _resolve_integration_key("zotero", encrypted_db_key=None)
            assert key is None
            assert src == "none"


def test_connectors_environment_fallback():
    """Verify connectors automatically fall back to os.getenv when initialized without args."""
    env_vars = {
        "ZOTERO_API_KEY": "test_zot_key",
        "ZOTERO_LIBRARY_ID": "123456",
        "NOTION_API_KEY": "test_notion_key",
        "NOTION_DATABASE_ID": "db_987",
        "HYPOTHESIS_API_KEY": "test_hyp_key",
        "HYPOTHESIS_USER_ID": "user_hyp",
        "ORCID_ID": "0000-0002-1825-0097",
        "SEMANTIC_SCHOLAR_API_KEY": "s2_key_xyz",
    }
    with patch.dict(os.environ, env_vars):
        zot = ZoteroConnector()
        assert zot.api_key == "test_zot_key"
        assert zot.library_id == "123456"

        notion = NotionConnector()
        assert notion.api_key == "test_notion_key"
        assert notion.default_database_id == "db_987"

        hyp = HypothesisConnector()
        assert hyp.api_key == "test_hyp_key"
        assert hyp.user_identifier == "user_hyp"

        orcid = ORCIDConnector()
        assert orcid.default_orcid == "0000-0002-1825-0097"

        s2 = SemanticScholarConnector()
        assert s2.api_key == "s2_key_xyz"

        # Explicit overrides take precedence
        explicit_zot = ZoteroConnector(api_key="explicit_key", library_id="explicit_id")
        assert explicit_zot.api_key == "explicit_key"
        assert explicit_zot.library_id == "explicit_id"


def test_zero_secret_leakage_in_api(isolated_vault):
    """Verify that neither Vault nor .env secrets are ever exposed in public list endpoints."""
    storage = isolated_vault["storage"]
    vault = isolated_vault["vault"]

    # Retrieve existing project ID
    with storage._get_connection() as conn:
        row = conn.execute("SELECT id FROM projects LIMIT 1").fetchone()
        ws_id = row["id"]

    # Store encrypted zotero key in storage
    storage.upsert_integration({
        "id": "zotero",
        "workspace_id": ws_id,
        "display_name": "Zotero Reference Manager",
        "connector_type": "REFERENCE",
        "api_key_encrypted": vault.encrypt("super_sensitive_zotero_key"),
        "config": {"library_id": "12345"},
        "is_enabled": 1,
    })

    client = TestClient(app)

    with patch("routers.integrations.get_storage", return_value=storage):
        with patch("routers.integrations.get_credential_vault", return_value=vault):
            with patch.dict(os.environ, {"NOTION_API_KEY": "super_sensitive_notion_env_key"}):
                res = client.get(f"/api/settings/integrations?workspace_id={ws_id}")
                assert res.status_code == 200
                data = res.json()
                integrations = {i["integration_type"]: i for i in data["integrations"]}

                # Check Zotero (from Vault)
                zot = integrations["zotero"]
                assert zot["is_configured"] is True
                assert zot["secret_source"] == "vault"
                assert zot["masked_secret"] == "••••••••"
                assert "super_sensitive_zotero_key" not in res.text

                # Check Notion (from .env)
                notion = integrations["notion"]
                assert notion["is_configured"] is True
                assert notion["secret_source"] == "env"
                assert notion["masked_secret"] == "•••••••• (via .env)"
                assert "super_sensitive_notion_env_key" not in res.text
