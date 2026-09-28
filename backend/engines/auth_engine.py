"""
CONVERA Progressive Identity & Authentication Engine
===================================================
Handles Argon2id password hashing, short-lived JWT access tokens,
and rotating opaque refresh tokens.
Complies with CONVERA-ENG-012 Security Doctrine.
"""

import os
import uuid
import secrets
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

import jwt
from passlib.context import CryptContext

try:
    from storage.base import BaseStorageAdapter
    from engines.credential_vault import CredentialVault, get_vault
except ImportError:
    from backend.storage.base import BaseStorageAdapter
    from backend.engines.credential_vault import CredentialVault, get_vault


class AuthEngine:
    """Progressive identity and authentication engine."""

    def __init__(
        self,
        storage: BaseStorageAdapter,
        vault: Optional[CredentialVault] = None,
        access_ttl_minutes: int = 15,
        refresh_ttl_days: int = 7,
    ):
        self._storage = storage
        self._vault = vault or get_vault()
        self._hasher = CryptContext(schemes=["argon2"], deprecated="auto")
        self._jwt_secret = os.getenv("JWT_SECRET") or self._vault.get_jwt_secret()
        self._access_ttl = timedelta(minutes=access_ttl_minutes)
        self._refresh_ttl = timedelta(days=refresh_ttl_days)

    def hash_password(self, password: str) -> str:
        """Hash plaintext password using Argon2id."""
        return self._hasher.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify plaintext password against stored Argon2id hash."""
        return self._hasher.verify(plain_password, hashed_password)

    def register(
        self,
        email: str,
        password: str,
        display_name: str,
        active_project_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a new user account.
        If active_project_id is provided, automatically binds the user as OWNER.
        """
        norm_email = email.strip().lower()
        if not norm_email or "@" not in norm_email:
            raise ValueError("A valid email address is required")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")

        existing = self._storage.get_user_by_email(norm_email)
        if existing:
            raise ValueError("An account with this email address already exists")

        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        password_hash = self.hash_password(password)

        user = self._storage.create_user({
            "id": user_id,
            "email": norm_email,
            "display_name": display_name.strip() or "Researcher",
            "password_hash": password_hash,
            "system_role": "USER",
            "is_active": 1,
        })

        claimed_membership = None
        # Claim existing anonymous workspace if user was actively working on one
        if active_project_id:
            try:
                proj = self._storage.get_project(active_project_id)
                if not proj:
                    sess = self._storage.get_session(active_project_id) or {}
                    proj_name = sess.get("project_name") or f"Venture {active_project_id[:8]}"
                    share_code = sess.get("share_code") or f"P-{uuid.uuid4().hex[:6].upper()}"
                    try:
                        with self._storage._get_connection() as conn:
                            conn.execute(
                                "INSERT OR IGNORE INTO projects (id, share_code, name, created_by) VALUES (?, ?, ?, ?)",
                                (active_project_id, share_code, proj_name, user["display_name"]),
                            )
                    except Exception:
                        pass

                claimed_membership = self._storage.create_workspace_membership({
                    "workspace_id": active_project_id,
                    "user_id": user_id,
                    "role": "OWNER",
                    "display_name": user["display_name"],
                    "joined_via": "CLAIMED_ANONYMOUS",
                })
            except Exception:
                pass

        tokens = self._issue_token_pair(user)
        sanitized_user = {k: v for k, v in user.items() if k != "password_hash"}
        return {
            "user": sanitized_user,
            "claimed_workspace": claimed_membership,
            **tokens,
        }

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user by email and password, returning new token pair."""
        norm_email = email.strip().lower()
        user = self._storage.get_user_by_email(norm_email)
        if not user or not self.verify_password(password, user["password_hash"]):
            raise ValueError("Invalid email or password")

        if not user.get("is_active", 1):
            raise ValueError("This account has been deactivated")

        self._storage.update_user_last_login(user["id"])
        tokens = self._issue_token_pair(user)
        sanitized_user = {k: v for k, v in user.items() if k != "password_hash"}
        return {"user": sanitized_user, **tokens}

    authenticate = login


    def _issue_token_pair(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Issue access JWT and persist rotating refresh token."""
        now = datetime.now(timezone.utc)
        exp_access = now + self._access_ttl
        payload = {
            "sub": user["id"],
            "email": user["email"],
            "name": user.get("display_name", "Researcher"),
            "role": user.get("system_role", "USER"),
            "iat": int(now.timestamp()),
            "exp": int(exp_access.timestamp()),
            "iss": "convera",
        }
        access_token = jwt.encode(payload, self._jwt_secret, algorithm="HS256")

        raw_refresh = secrets.token_urlsafe(48)
        refresh_hash = hashlib.sha256(raw_refresh.encode("utf-8")).hexdigest()
        exp_refresh = (now + self._refresh_ttl).isoformat()

        self._storage.store_refresh_token({
            "user_id": user["id"],
            "token_hash": refresh_hash,
            "expires_at": exp_refresh,
            "device_info": "CONVERA Web Session",
        })

        return {
            "access_token": access_token,
            "refresh_token": raw_refresh,
            "access_expires_at": exp_access.isoformat(),
            "refresh_expires_at": exp_refresh,
        }

    def rotate_refresh_token(self, raw_refresh_token: str) -> Dict[str, Any]:
        """
        Validate and consume an existing refresh token, issuing a fresh pair.
        Implements mandatory token rotation to mitigate replay attacks.
        """
        refresh_hash = hashlib.sha256(raw_refresh_token.encode("utf-8")).hexdigest()
        record = self._storage.get_refresh_token(refresh_hash)
        if not record:
            raise ValueError("Invalid refresh token")

        if record.get("is_revoked"):
            # Potential replay attempt: revoke all user sessions
            self._storage.revoke_all_user_refresh_tokens(record["user_id"])
            raise ValueError("Refresh token revoked; session terminated")

        now = datetime.now(timezone.utc).isoformat()
        if record.get("expires_at", "") < now:
            raise ValueError("Refresh token has expired; please log in again")

        # Invalidate old token immediately (rotation)
        self._storage.revoke_refresh_token(record["id"])

        user = self._storage.get_user(record["user_id"])
        if not user or not user.get("is_active", 1):
            raise ValueError("User account is inactive or not found")

        tokens = self._issue_token_pair(user)
        return {"user": user, **tokens}

    def revoke_token(self, raw_refresh_token: str) -> bool:
        """Revoke a refresh token on logout."""
        refresh_hash = hashlib.sha256(raw_refresh_token.encode("utf-8")).hexdigest()
        record = self._storage.get_refresh_token(refresh_hash)
        if record:
            return self._storage.revoke_refresh_token(record["id"])
        return False

    def verify_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify access token and return token claims, or None if invalid/expired."""
        try:
            payload = jwt.decode(token, self._jwt_secret, algorithms=["HS256"])
            return payload
        except jwt.PyJWTError:
            return None


_AUTH_ENGINE_INSTANCE: Optional[AuthEngine] = None


def get_auth_engine(storage=None, vault=None) -> AuthEngine:
    """Retrieve or initialize the AuthEngine singleton."""
    global _AUTH_ENGINE_INSTANCE
    if _AUTH_ENGINE_INSTANCE is None or storage is not None:
        if storage is None:
            try:
                from storage import get_storage
            except ImportError:
                from backend.storage import get_storage
            storage = get_storage()
        _AUTH_ENGINE_INSTANCE = AuthEngine(storage=storage, vault=vault)
    return _AUTH_ENGINE_INSTANCE

