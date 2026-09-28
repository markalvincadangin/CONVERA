"""
Unit and Integration Tests for CONVERA Progressive Identity & Auth Engine
========================================================================
Validates Argon2id hashing, JWT access tokens, rotating refresh tokens,
replay attack invalidation, workspace claiming, and FastAPI auth routes.
"""

import os
import pytest
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.credential_vault import CredentialVault
from engines.auth_engine import AuthEngine
from server import app


@pytest.fixture
def auth_test_env(tmp_path):
    """Fixture providing isolated temporary DB, CredentialVault, and AuthEngine."""
    db_file = str(tmp_path / "test_auth.db")
    storage = SQLiteStorageAdapter(db_path=db_file)
    key_file = str(tmp_path / "test.key")
    vault = CredentialVault(key_file_path=key_file)
    engine = AuthEngine(storage=storage, vault=vault, access_ttl_minutes=5, refresh_ttl_days=1)
    return {"storage": storage, "vault": vault, "engine": engine}


def test_password_hashing(auth_test_env):
    """Verify Argon2id password hashing and verification."""
    engine = auth_test_env["engine"]
    pwd = "SecureResearchPassphrase123!"
    hashed = engine.hash_password(pwd)

    assert hashed.startswith("$argon2")
    assert engine.verify_password(pwd, hashed) is True
    assert engine.verify_password("WrongPassword!", hashed) is False


def test_user_registration_and_duplicate_prevention(auth_test_env):
    """Verify user registration and unique email constraint."""
    engine = auth_test_env["engine"]
    storage = auth_test_env["storage"]

    result = engine.register(
        email="researcher@iloilo.edu.ph",
        password="ValidPassword2026!",
        display_name="Prof. Santos",
    )

    user = result["user"]
    assert user["email"] == "researcher@iloilo.edu.ph"
    assert user["display_name"] == "Prof. Santos"
    assert "password_hash" not in user
    assert result["access_token"]
    assert result["refresh_token"]

    # Verify user in database
    db_user = storage.get_user_by_email("researcher@iloilo.edu.ph")
    assert db_user is not None
    assert db_user["id"] == user["id"]
    assert db_user["password_hash"].startswith("$argon2")

    # Duplicate registration must fail
    with pytest.raises(ValueError, match="already exists"):
        engine.register(
            email="RESEARCHER@iloilo.edu.ph",  # Case-insensitive duplicate
            password="AnotherPassword!",
            display_name="Prof. Santos Clone",
        )


def test_registration_claims_active_workspace(auth_test_env):
    """Verify progressive identity: registering user claims active anonymous project."""
    engine = auth_test_env["engine"]
    storage = auth_test_env["storage"]

    # Create anonymous workspace
    ws_id = "proj_anonymous_iloilo_123"
    storage.save_session(
        session_id="sess_123",
        state={"project_id": ws_id, "project_name": "Fisheries AI Project"}
    )

    result = engine.register(
        email="lead@fisheries.ph",
        password="SecureLeadPassword2026!",
        display_name="Dr. Lead",
        active_project_id=ws_id,
    )

    claimed = result.get("claimed_workspace")
    assert claimed is not None
    assert claimed["workspace_id"] == ws_id
    assert claimed["role"] == "OWNER"

    # Verify membership row
    membership = storage.get_workspace_membership(ws_id, result["user"]["id"])
    assert membership is not None
    assert membership["role"] == "OWNER"
    assert membership["joined_via"] == "CLAIMED_ANONYMOUS"


def test_authentication_flow(auth_test_env):
    """Verify successful login and credential rejection."""
    engine = auth_test_env["engine"]

    engine.register(
        email="fellow@convera.ph",
        password="CorrectPassword123!",
        display_name="Research Fellow",
    )

    # Valid login
    login_res = engine.authenticate("fellow@convera.ph", "CorrectPassword123!")
    assert login_res["user"]["email"] == "fellow@convera.ph"
    assert login_res["access_token"]
    assert login_res["refresh_token"]

    # Invalid password
    with pytest.raises(ValueError, match="Invalid email or password"):
        engine.authenticate("fellow@convera.ph", "WrongPassword!")

    # Nonexistent user
    with pytest.raises(ValueError, match="Invalid email or password"):
        engine.authenticate("nonexistent@convera.ph", "AnyPassword!")


def test_refresh_token_rotation_and_replay_detection(auth_test_env):
    """Verify refresh token rotation and replay invalidation."""
    engine = auth_test_env["engine"]

    reg = engine.register(
        email="analyst@iloilo.gov.ph",
        password="AnalystPassword2026!",
        display_name="Data Analyst",
    )

    original_refresh = reg["refresh_token"]

    # 1. First rotation: should succeed and issue fresh token pair
    rot_res = engine.rotate_refresh_token(original_refresh)
    new_refresh = rot_res["refresh_token"]
    assert new_refresh != original_refresh
    assert rot_res["access_token"]

    # 2. Replay attack: presenting the consumed token MUST fail and terminate sessions
    with pytest.raises(ValueError, match="Refresh token revoked; session terminated"):
        engine.rotate_refresh_token(original_refresh)

    # 3. Even the newest token should now be invalidated because all sessions were revoked
    with pytest.raises(ValueError, match="Refresh token revoked; session terminated"):
        engine.rotate_refresh_token(new_refresh)


def test_auth_routes_e2e():
    """Verify FastAPI end-to-end endpoints for register, me, refresh, and logout."""
    with TestClient(app) as client:
        test_email = f"e2e_{os.urandom(4).hex()}@university.edu.ph"
        test_password = "E2EPassword2026!"

        # 1. Register
        reg_resp = client.post(
            "/api/auth/register",
            json={
                "email": test_email,
                "password": test_password,
                "display_name": "E2E Researcher",
            },
        )
        assert reg_resp.status_code == 201
        data = reg_resp.json()
        assert data["status"] == "success"
        assert data["user"]["email"] == test_email
        assert "convera_access" in reg_resp.cookies
        assert "convera_refresh" in reg_resp.cookies

        # 2. /api/auth/me with cookies persisted in client
        me_resp = client.get("/api/auth/me")
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["authenticated"] is True
        assert me_data["user"]["email"] == test_email

        # 3. /api/auth/refresh
        refresh_resp = client.post("/api/auth/refresh")
        assert refresh_resp.status_code == 200
        ref_data = refresh_resp.json()
        assert ref_data["status"] == "success"
        assert "access_token" in ref_data["tokens"]
        assert "convera_access" in refresh_resp.cookies

        # 4. /api/auth/logout
        logout_resp = client.post("/api/auth/logout")
        assert logout_resp.status_code == 200
        assert logout_resp.json()["status"] == "success"

        # 5. /api/auth/me unauthenticated
        with TestClient(app) as fresh_client:
            anon_resp = fresh_client.get("/api/auth/me")
            assert anon_resp.status_code == 200
            assert anon_resp.json()["authenticated"] is False
            assert anon_resp.json()["user"] is None

