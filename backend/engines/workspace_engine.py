"""
CONVERA Workspace Engine & RBAC Manager
======================================
Handles collaborative workspace memberships, cryptographic invite token lifecycle,
role-based access control (RBAC), and ownership transfers.
Complies with CONVERA-ENG-012 Security Doctrine.
"""

import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

try:
    from storage.base import BaseStorageAdapter
except ImportError:
    from backend.storage.base import BaseStorageAdapter

VALID_ROLES = {"OWNER", "ADMIN", "MEMBER", "ADVISOR", "VIEWER"}

ROLE_RANKS: Dict[str, int] = {
    "OWNER": 5,
    "ADMIN": 4,
    "MEMBER": 3,
    "ADVISOR": 2,
    "VIEWER": 1,
}


class WorkspaceEngine:
    """Manages workspace collaboration, role privileges, and invite redemption."""

    def __init__(self, storage: BaseStorageAdapter):
        self._storage = storage

    def create_invite(
        self,
        workspace_id: str,
        inviter_user_id: str,
        role: str = "MEMBER",
        expires_in_hours: int = 48,
        max_uses: int = 1,
    ) -> Dict[str, Any]:
        """
        Create a cryptographic, role-governed workspace invite token.
        Default TTL: 48 hours. Default max_uses: 1 (single-use).
        """
        role_upper = role.upper()
        if role_upper not in VALID_ROLES:
            raise ValueError(f"Invalid role '{role}'. Must be one of {list(VALID_ROLES)}")

        if role_upper == "OWNER":
            raise ValueError("Direct invite as OWNER is disallowed; use ownership transfer instead")

        # Verify inviter has authority (OWNER or ADMIN)
        inviter_membership = self._storage.get_workspace_membership(workspace_id, inviter_user_id)
        if not inviter_membership or inviter_membership.get("role") not in ("OWNER", "ADMIN"):
            # Check if inviter is SUPERADMIN
            user = self._storage.get_user(inviter_user_id)
            if not user or user.get("system_role") != "SUPERADMIN":
                raise PermissionError("Only workspace OWNER or ADMIN may generate invite links")

        token = secrets.token_urlsafe(32)
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=expires_in_hours)).isoformat()

        invite_record = self._storage.create_workspace_invite({
            "workspace_id": workspace_id,
            "invited_by": inviter_user_id,
            "role": role_upper,
            "token": token,
            "expires_at": expires_at,
            "max_uses": max(1, max_uses),
        })

        return invite_record

    def get_invite(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate and return invite metadata with workspace details."""
        invite = self._storage.get_workspace_invite(token)
        if not invite:
            return None

        if invite.get("is_revoked"):
            return None

        now = datetime.now(timezone.utc).isoformat()
        if invite.get("expires_at", "") < now:
            return None

        if invite.get("use_count", 0) >= invite.get("max_uses", 1):
            return None

        return invite

    def redeem_invite(
        self,
        token: str,
        user_id: str,
        display_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Redeem an invite token, binding the user to the workspace with the specified role.
        Atomically increments use_count and revokes token if max uses reached.
        """
        invite = self.get_invite(token)
        if not invite:
            raise ValueError("Invite link is invalid, expired, or has already reached maximum uses")

        user = self._storage.get_user(user_id)
        if not user or not user.get("is_active", 1):
            raise ValueError("User account is inactive or not found")

        workspace_id = invite["workspace_id"]
        role = invite["role"]
        name = display_name or user.get("display_name", "Collaborator")

        # Check existing membership
        existing = self._storage.get_workspace_membership(workspace_id, user_id)
        if existing:
            # Upgrade role if invited with higher privilege
            current_rank = ROLE_RANKS.get(existing.get("role", "VIEWER"), 1)
            invite_rank = ROLE_RANKS.get(role, 1)
            if invite_rank > current_rank:
                self._storage.update_workspace_membership_role(workspace_id, user_id, role)
                existing["role"] = role
            membership = existing
        else:
            membership = self._storage.create_workspace_membership({
                "workspace_id": workspace_id,
                "user_id": user_id,
                "role": role,
                "display_name": name,
                "invited_by": invite.get("invited_by"),
                "joined_via": "INVITE_LINK",
            })

        # Record redemption in storage
        self._storage.redeem_workspace_invite(token, user_id)

        return {
            "status": "success",
            "workspace_id": workspace_id,
            "role": role,
            "membership": membership,
        }

    def list_members(self, workspace_id: str) -> List[Dict[str, Any]]:
        """List active members for a workspace."""
        return self._storage.list_workspace_members(workspace_id)

    def list_invites(self, workspace_id: str) -> List[Dict[str, Any]]:
        """List unrevoked invites for a workspace."""
        return self._storage.list_workspace_invites(workspace_id)

    def revoke_invite(self, invite_id: str, actor_user_id: str, workspace_id: str) -> bool:
        """Revoke a workspace invite token."""
        membership = self._storage.get_workspace_membership(workspace_id, actor_user_id)
        if not membership or membership.get("role") not in ("OWNER", "ADMIN"):
            user = self._storage.get_user(actor_user_id)
            if not user or user.get("system_role") != "SUPERADMIN":
                raise PermissionError("Only OWNER or ADMIN may revoke invite links")

        return self._storage.revoke_workspace_invite(invite_id)

    def update_member_role(
        self,
        workspace_id: str,
        target_user_id: str,
        new_role: str,
        actor_user_id: str,
    ) -> Dict[str, Any]:
        """Update role of an existing workspace member."""
        role_upper = new_role.upper()
        if role_upper not in VALID_ROLES:
            raise ValueError(f"Invalid role '{new_role}'")

        if role_upper == "OWNER":
            raise ValueError("Cannot promote to OWNER via role update; use transfer_ownership instead")

        actor_mem = self._storage.get_workspace_membership(workspace_id, actor_user_id)
        if not actor_mem or actor_mem.get("role") not in ("OWNER", "ADMIN"):
            raise PermissionError("Only OWNER or ADMIN may modify member roles")

        target_mem = self._storage.get_workspace_membership(workspace_id, target_user_id)
        if not target_mem:
            raise ValueError("Target user is not a member of this workspace")

        if target_mem.get("role") == "OWNER":
            raise ValueError("Cannot change the role of the workspace OWNER")

        # Admin cannot promote or demote someone to/from ADMIN unless actor is OWNER
        if (target_mem.get("role") == "ADMIN" or role_upper == "ADMIN") and actor_mem.get("role") != "OWNER":
            raise PermissionError("Only the workspace OWNER can assign or revoke ADMIN privileges")

        updated = self._storage.update_workspace_membership_role(workspace_id, target_user_id, role_upper)
        return updated or target_mem

    def remove_member(
        self,
        workspace_id: str,
        target_user_id: str,
        actor_user_id: str,
    ) -> bool:
        """Remove a member from the workspace."""
        target_mem = self._storage.get_workspace_membership(workspace_id, target_user_id)
        if not target_mem:
            return True

        if target_mem.get("role") == "OWNER":
            raise ValueError("Cannot remove the workspace OWNER")

        # Allow user to remove themselves (leave workspace)
        if target_user_id == actor_user_id:
            return self._storage.remove_workspace_membership(workspace_id, target_user_id)

        actor_mem = self._storage.get_workspace_membership(workspace_id, actor_user_id)
        if not actor_mem or actor_mem.get("role") not in ("OWNER", "ADMIN"):
            raise PermissionError("Only OWNER or ADMIN may remove members")

        if target_mem.get("role") == "ADMIN" and actor_mem.get("role") != "OWNER":
            raise PermissionError("Only the workspace OWNER can remove an ADMIN")

        return self._storage.remove_workspace_membership(workspace_id, target_user_id)

    def transfer_ownership(
        self,
        workspace_id: str,
        current_owner_id: str,
        new_owner_id: str,
    ) -> Dict[str, Any]:
        """Transfer workspace OWNER role to another member, demoting current owner to ADMIN."""
        owner_mem = self._storage.get_workspace_membership(workspace_id, current_owner_id)
        if not owner_mem or owner_mem.get("role") != "OWNER":
            raise PermissionError("Only the current OWNER may transfer workspace ownership")

        target_mem = self._storage.get_workspace_membership(workspace_id, new_owner_id)
        if not target_mem:
            raise ValueError("New owner must already be an active member of the workspace")

        # Promote target to OWNER
        self._storage.update_workspace_membership_role(workspace_id, new_owner_id, "OWNER")
        # Demote previous owner to ADMIN
        self._storage.update_workspace_membership_role(workspace_id, current_owner_id, "ADMIN")

        return {
            "status": "success",
            "workspace_id": workspace_id,
            "new_owner_id": new_owner_id,
            "previous_owner_id": current_owner_id,
        }


_WORKSPACE_ENGINE_INSTANCE: Optional[WorkspaceEngine] = None


def get_workspace_engine(storage=None) -> WorkspaceEngine:
    """Retrieve or initialize the WorkspaceEngine singleton."""
    global _WORKSPACE_ENGINE_INSTANCE
    if _WORKSPACE_ENGINE_INSTANCE is None or storage is not None:
        if storage is None:
            try:
                from storage import get_storage
            except ImportError:
                from backend.storage import get_storage
            storage = get_storage()
        _WORKSPACE_ENGINE_INSTANCE = WorkspaceEngine(storage=storage)
    return _WORKSPACE_ENGINE_INSTANCE
