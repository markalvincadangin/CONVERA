"""
Integration and RBAC Tests for CONVERA Workspaces Subsystem
===========================================================
Validates workspace invites (TTL, single/multi-use, revocation),
membership management, role hierarchy, ownership transfer, and FastAPI endpoints.
"""

import os
from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient

from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.credential_vault import CredentialVault
from engines.auth_engine import AuthEngine
from engines.workspace_engine import WorkspaceEngine
from server import app


@pytest.fixture
def ws_env(tmp_path):
    """Isolated environment with storage, vault, auth, and workspace engines."""
    db_file = str(tmp_path / "test_ws.db")
    storage = SQLiteStorageAdapter(db_path=db_file)
    key_file = str(tmp_path / "test.key")
    vault = CredentialVault(key_file_path=key_file)
    auth_engine = AuthEngine(storage=storage, vault=vault)
    ws_engine = WorkspaceEngine(storage=storage)

    # Create test owner user
    owner_user = auth_engine.register(
        email="owner@venture.ph",
        password="OwnerPassword2026!",
        display_name="Venture Owner",
    )["user"]

    # Create test member user
    member_user = auth_engine.register(
        email="collab@venture.ph",
        password="CollabPassword2026!",
        display_name="Venture Collab",
    )["user"]

    # Create workspace
    ws_id = "proj_test_workspace_alpha"
    storage.save_session(
        session_id="sess_alpha",
        state={"project_id": ws_id, "project_name": "Alpha Venture"}
    )
    storage.create_workspace_membership({
        "workspace_id": ws_id,
        "user_id": owner_user["id"],
        "role": "OWNER",
        "display_name": owner_user["display_name"],
        "joined_via": "CLAIMED_ANONYMOUS",
    })

    return {
        "storage": storage,
        "auth_engine": auth_engine,
        "ws_engine": ws_engine,
        "workspace_id": ws_id,
        "owner": owner_user,
        "collab": member_user,
    }


def test_invite_creation_and_role_validation(ws_env):
    """Verify OWNER/ADMIN can generate invites and invalid roles are rejected."""
    ws_engine = ws_env["ws_engine"]
    ws_id = ws_env["workspace_id"]
    owner = ws_env["owner"]
    collab = ws_env["collab"]

    # Valid invite for ADVISOR
    invite = ws_engine.create_invite(
        workspace_id=ws_id,
        inviter_user_id=owner["id"],
        role="ADVISOR",
        expires_in_hours=24,
    )
    assert invite["token"]
    assert invite["role"] == "ADVISOR"
    assert invite["workspace_id"] == ws_id

    # Non-member cannot generate invites
    with pytest.raises(PermissionError):
        ws_engine.create_invite(
            workspace_id=ws_id,
            inviter_user_id=collab["id"],
            role="MEMBER",
        )

    # Cannot invite directly as OWNER
    with pytest.raises(ValueError, match="Direct invite as OWNER is disallowed"):
        ws_engine.create_invite(
            workspace_id=ws_id,
            inviter_user_id=owner["id"],
            role="OWNER",
        )


def test_invite_redemption_and_single_use(ws_env):
    """Verify invite token redemption and single-use enforcement."""
    ws_engine = ws_env["ws_engine"]
    auth_engine = ws_env["auth_engine"]
    ws_id = ws_env["workspace_id"]
    owner = ws_env["owner"]
    collab = ws_env["collab"]

    invite = ws_engine.create_invite(
        workspace_id=ws_id,
        inviter_user_id=owner["id"],
        role="MEMBER",
        max_uses=1,
    )

    # 1. Redeem invite
    res = ws_engine.redeem_invite(invite["token"], collab["id"])
    assert res["status"] == "success"
    assert res["role"] == "MEMBER"

    # Verify roster
    members = ws_engine.list_members(ws_id)
    user_ids = [m["user_id"] for m in members]
    assert collab["id"] in user_ids

    # 2. Second user attempting to use single-use invite must be rejected
    second_user = auth_engine.register(
        email="second@venture.ph",
        password="SecondPassword2026!",
        display_name="Second Collab",
    )["user"]

    with pytest.raises(ValueError, match="invalid, expired, or has already reached maximum uses"):
        ws_engine.redeem_invite(invite["token"], second_user["id"])


def test_invite_revocation_and_expiration(ws_env):
    """Verify revoked or expired invites cannot be redeemed."""
    ws_engine = ws_env["ws_engine"]
    storage = ws_env["storage"]
    ws_id = ws_env["workspace_id"]
    owner = ws_env["owner"]
    collab = ws_env["collab"]

    # 1. Revocation test
    invite = ws_engine.create_invite(
        workspace_id=ws_id,
        inviter_user_id=owner["id"],
        role="VIEWER",
    )
    ws_engine.revoke_invite(invite["id"], owner["id"], ws_id)

    with pytest.raises(ValueError, match="invalid, expired"):
        ws_engine.redeem_invite(invite["token"], collab["id"])

    # 2. Expiration test
    expired_invite = ws_engine.create_invite(
        workspace_id=ws_id,
        inviter_user_id=owner["id"],
        role="VIEWER",
        expires_in_hours=1,
    )
    # Artificially expire the token in DB
    past_iso = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    with storage._get_connection() as conn:
        conn.execute("UPDATE workspace_invites SET expires_at = ? WHERE id = ?", (past_iso, expired_invite["id"]))

    with pytest.raises(ValueError, match="invalid, expired"):
        ws_engine.redeem_invite(expired_invite["token"], collab["id"])


def test_member_role_updates_and_ownership_transfer(ws_env):
    """Verify role governance and ownership transfer."""
    ws_engine = ws_env["ws_engine"]
    ws_id = ws_env["workspace_id"]
    owner = ws_env["owner"]
    collab = ws_env["collab"]

    # Add collab as MEMBER
    ws_env["storage"].create_workspace_membership({
        "workspace_id": ws_id,
        "user_id": collab["id"],
        "role": "MEMBER",
        "display_name": collab["display_name"],
    })

    # Owner promotes collab to ADMIN
    updated = ws_engine.update_member_role(
        workspace_id=ws_id,
        target_user_id=collab["id"],
        new_role="ADMIN",
        actor_user_id=owner["id"],
    )
    assert updated["role"] == "ADMIN"

    # Transfer ownership from owner to collab
    xfer = ws_engine.transfer_ownership(
        workspace_id=ws_id,
        current_owner_id=owner["id"],
        new_owner_id=collab["id"],
    )
    assert xfer["status"] == "success"
    assert xfer["new_owner_id"] == collab["id"]

    # Verify new roles: collab is OWNER, previous owner is ADMIN
    collab_mem = ws_env["storage"].get_workspace_membership(ws_id, collab["id"])
    owner_mem = ws_env["storage"].get_workspace_membership(ws_id, owner["id"])
    assert collab_mem["role"] == "OWNER"
    assert owner_mem["role"] == "ADMIN"


def test_workspaces_fastapi_e2e():
    """Verify FastAPI end-to-end endpoints for workspace invites and membership."""
    with TestClient(app) as client:
        # Register user
        unique = os.urandom(4).hex()
        owner_email = f"ws_e2e_owner_{unique}@domain.ph"
        ws_id = f"proj_e2e_{unique}"

        reg_resp = client.post(
            "/api/auth/register",
            json={
                "email": owner_email,
                "password": "Password123!",
                "display_name": "E2E Owner",
                "active_project_id": ws_id,
            },
        )
        assert reg_resp.status_code == 201

        # 1. Create invite
        inv_resp = client.post(
            f"/api/workspaces/{ws_id}/invites",
            json={"role": "ADVISOR", "expires_in_hours": 48, "max_uses": 1},
        )
        assert inv_resp.status_code == 200
        inv_data = inv_resp.json()
        assert inv_data["status"] == "success"
        token = inv_data["invite"]["token"]

        # 2. Inspect invite anonymously
        with TestClient(app) as anon_client:
            insp_resp = anon_client.get(f"/api/workspaces/invites/{token}")
            assert insp_resp.status_code == 200
            assert insp_resp.json()["valid"] is True
            assert insp_resp.json()["role"] == "ADVISOR"

        # 3. Register invitee and redeem invite
        with TestClient(app) as invitee_client:
            invitee_email = f"ws_e2e_invitee_{unique}@domain.ph"
            reg_inv = invitee_client.post(
                "/api/auth/register",
                json={
                    "email": invitee_email,
                    "password": "Password123!",
                    "display_name": "Dr. Mentor Advisor",
                },
            )
            assert reg_inv.status_code == 201

            redeem_resp = invitee_client.post(f"/api/workspaces/invites/{token}/redeem")
            assert redeem_resp.status_code == 200
            assert redeem_resp.json()["status"] == "success"
            assert redeem_resp.json()["role"] == "ADVISOR"

            # Check membership
            detail_resp = invitee_client.get(f"/api/workspaces/{ws_id}")
            assert detail_resp.status_code == 200
            assert detail_resp.json()["role"] == "ADVISOR"
