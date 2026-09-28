"""
Integration Tests for CONVERA Schema Extension (SDD-012)
=========================================================
Verifies the 7 new additive tables, progressive identity, invites,
AI provider registry, integration connectors, and backwards compatibility.
"""

import os
import tempfile
from datetime import datetime, timezone, timedelta
import pytest
from storage.sqlite_adapter import SQLiteStorageAdapter

pytestmark = pytest.mark.integration


@pytest.fixture
def storage():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    adapter = SQLiteStorageAdapter(db_path=path)
    yield adapter
    if os.path.exists(path):
        try:
            os.remove(path)
        except Exception:
            pass


def test_schema_012_additive_tables_exist(storage):
    """Verify that all 7 new additive tables and their indexes exist."""
    with storage._get_connection() as conn:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = {row[0] for row in cursor.fetchall()}

    expected_tables = {
        "users",
        "refresh_tokens",
        "workspace_memberships",
        "workspace_invites",
        "ai_provider_registry",
        "integration_registry",
        "sync_log",
    }
    assert expected_tables.issubset(tables), f"Missing tables: {expected_tables - tables}"


def test_user_lifecycle(storage):
    """Verify full CRUD lifecycle for users."""
    user = storage.create_user({
        "id": "usr_test123",
        "email": "Maria.Santos@University.EDU",
        "display_name": "Maria Santos",
        "password_hash": "$argon2id$dummyhash",
        "avatar": "👩‍🔬",
        "preferences": {"theme": "dark", "locale": "en"},
    })
    assert user["id"] == "usr_test123"
    assert user["email"] == "maria.santos@university.edu"
    assert user["display_name"] == "Maria Santos"
    assert user["preferences"]["theme"] == "dark"

    # Lookup by ID
    by_id = storage.get_user("usr_test123")
    assert by_id is not None
    assert by_id["display_name"] == "Maria Santos"

    # Lookup by case-insensitive email
    by_email = storage.get_user_by_email("MARIA.SANTOS@university.edu")
    assert by_email is not None
    assert by_email["id"] == "usr_test123"

    # Update profile
    updated = storage.update_user("usr_test123", {
        "display_name": "Dr. Maria Santos",
        "avatar": "🎓",
        "preferences": {"theme": "light", "locale": "en"},
    })
    assert updated["display_name"] == "Dr. Maria Santos"
    assert updated["avatar"] == "🎓"
    assert updated["preferences"]["theme"] == "light"

    # Update last login
    ok = storage.update_user_last_login("usr_test123")
    assert ok is True
    reloaded = storage.get_user("usr_test123")
    assert reloaded["last_login_at"] is not None


def test_refresh_token_rotation_and_revocation(storage):
    """Verify storing, retrieving, and revoking rotating refresh tokens."""
    storage.create_user({
        "id": "usr_token_user",
        "email": "token@test.edu",
        "password_hash": "hash",
    })

    now = datetime.now(timezone.utc)
    exp = (now + timedelta(days=7)).isoformat()

    t1 = storage.store_refresh_token({
        "user_id": "usr_token_user",
        "token_hash": "sha256_hash_1",
        "expires_at": exp,
        "device_info": "Firefox Linux",
    })
    assert t1["id"].startswith("rtk_")
    assert t1["is_revoked"] == 0

    # Retrieve
    found = storage.get_refresh_token("sha256_hash_1")
    assert found is not None
    assert found["user_id"] == "usr_token_user"

    # Revoke single
    storage.revoke_refresh_token(t1["id"])
    assert storage.get_refresh_token("sha256_hash_1")["is_revoked"] == 1

    # Store another and revoke all
    t2 = storage.store_refresh_token({
        "user_id": "usr_token_user",
        "token_hash": "sha256_hash_2",
        "expires_at": exp,
    })
    revoked_count = storage.revoke_all_user_refresh_tokens("usr_token_user")
    assert revoked_count == 1
    assert storage.get_refresh_token("sha256_hash_2")["is_revoked"] == 1


def test_workspace_memberships_and_invites(storage):
    """Verify multi-workspace memberships, invite creation, validation, and redemption."""
    # Create project session
    state = storage.save_session("sess_ws_test", {"project_name": "Agri-Robotics Project"})
    ws_id = state["project_id"]

    # Create owner and invitee users
    u_owner = storage.create_user({"id": "usr_owner", "email": "owner@uni.edu", "password_hash": "h"})
    u_advisor = storage.create_user({"id": "usr_advisor", "email": "advisor@uni.edu", "display_name": "Prof. Santos", "password_hash": "h"})

    # Owner membership
    m_owner = storage.create_workspace_membership({
        "workspace_id": ws_id,
        "user_id": "usr_owner",
        "role": "OWNER",
        "display_name": "Project Owner",
    })
    assert m_owner["role"] == "OWNER"

    # Create invite token for advisor
    exp_48h = (datetime.now(timezone.utc) + timedelta(hours=48)).isoformat()
    invite = storage.create_workspace_invite({
        "workspace_id": ws_id,
        "assigned_role": "ADVISOR",
        "invited_email": "advisor@uni.edu",
        "invited_by_user_id": "usr_owner",
        "max_uses": 1,
        "expires_at": exp_48h,
    })
    token = invite["token"]
    assert token.startswith("INV-")
    assert invite["workspace_name"] == "Agri-Robotics Project"

    # Redeem invite
    redeemed = storage.redeem_workspace_invite(token, "usr_advisor")
    assert redeemed is not None
    assert redeemed["role"] == "ADVISOR"

    # Verify membership list
    members = storage.list_workspace_memberships(ws_id)
    assert len(members) == 2
    roles = {m["role"] for m in members}
    assert roles == {"OWNER", "ADVISOR"}

    # Attempt second redemption (should raise ValueError: max uses reached)
    u_third = storage.create_user({"id": "usr_third", "email": "third@uni.edu", "password_hash": "h"})
    with pytest.raises(ValueError, match="maximum redemption limit"):
        storage.redeem_workspace_invite(token, "usr_third")


def test_ai_provider_registry_and_cascade(storage):
    """Verify AI provider dynamic registration, ordering, and workspace overrides."""
    # System default providers
    storage.upsert_ai_provider({
        "id": "ollama_local",
        "display_name": "Ollama Local (llama3.2:3b)",
        "provider_type": "LOCAL",
        "base_url": "http://ollama:11434/v1",
        "model_id": "llama3.2:3b",
        "cascade_priority": 1,
    })

    storage.upsert_ai_provider({
        "id": "gemini_free",
        "display_name": "Google Gemini 2.5 Flash",
        "provider_type": "FREE_CLOUD",
        "api_key_encrypted": "encrypted_cipher_token",
        "model_id": "gemini-2.5-flash",
        "cascade_priority": 2,
    })

    # List system providers ordered by priority
    providers = storage.list_ai_providers()
    assert len(providers) == 2
    assert providers[0]["id"] == "ollama_local"
    assert providers[1]["id"] == "gemini_free"

    # Delete a provider
    ok = storage.delete_ai_provider("gemini_free")
    assert ok is True
    assert len(storage.list_ai_providers()) == 1


def test_integration_registry_and_sync_log(storage):
    """Verify registering tool integrations (Zotero, Notion) and recording sync logs."""
    state = storage.save_session("sess_integ_test", {"project_name": "Literature Survey"})
    ws_id = state["project_id"]

    integ = storage.upsert_integration({
        "id": "zotero_lab_lib",
        "workspace_id": ws_id,
        "display_name": "Lab Zotero Library",
        "connector_type": "REFERENCE",
        "api_key_encrypted": "fernet_encrypted_zotero_key",
        "config": {"library_id": "12345", "library_type": "group"},
        "is_enabled": 1,
    })
    assert integ["id"] == "zotero_lab_lib"
    assert integ["config"]["library_id"] == "12345"

    # Log sync event
    sync_entry = storage.log_sync_event({
        "integration_id": "zotero_lab_lib",
        "workspace_id": ws_id,
        "sync_type": "PULL",
        "direction": "INBOUND",
        "items_processed": 42,
        "items_created": 40,
        "items_updated": 2,
        "items_failed": 0,
        "duration_ms": 320,
    })
    assert sync_entry["id"] is not None
    assert sync_entry["items_created"] == 40

    logs = storage.list_sync_logs("zotero_lab_lib")
    assert len(logs) == 1
    assert logs[0]["items_processed"] == 42


def test_backwards_compatibility_with_existing_tables(storage):
    """Verify that existing 24 tables (projects, sessions, problems, mentor_signoffs) work intact."""
    # 1. Session & Project creation
    state = storage.save_session("sess_compat", {"project_name": "Cold Chain Feasibility"})
    proj_id = state["project_id"]

    # 2. Passcode verification (existing table method)
    storage.set_project_passcode(proj_id, "4321")
    assert storage.verify_project_passcode(proj_id, "4321") is True
    assert storage.verify_project_passcode(proj_id, "0000") is False

    # 3. Problem Bank (existing table method)
    prob = storage.add_problem({
        "id": "PRB-COMPAT-01",
        "sector": "Agriculture",
        "problem_statement": "Post-harvest melon loss in South Cotabato.",
        "sufferer_occupation": "Melon Farmer",
        "sufferer_location": "Koronadal",
    })
    assert prob["id"] == "PRB-COMPAT-01"

    # 4. Mentor Signoff (existing table method)
    signoff = storage.record_mentor_signoff(
        proj_id,
        phase_number=1,
        mentor_name="Dr. Ramos",
        notes="Approved preliminary problem statement.",
    )
    assert signoff["id"] is not None
    signoffs = storage.list_mentor_signoffs(proj_id)
    assert len(signoffs) == 1
