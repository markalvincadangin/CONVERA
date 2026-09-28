"""
CONVERA Credential Vault
========================
Symmetric-key encryption for API keys and third-party integration secrets at rest.
Uses Fernet (AES-128-CBC with PKCS7 padding and HMAC-SHA256 authentication).
Complies with CONVERA-ENG-012 Security Doctrine.
"""

import os
import base64
import hashlib
import hmac
from pathlib import Path
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken


class CredentialVault:
    """
    Symmetric encryption engine for sensitive secrets at rest.

    Key Hierarchy:
    1. CONVERA_MASTER_KEY env var (base64 Fernet key or passphrase).
    2. Persisted key file at key_file_path (chmod 600).
    3. Auto-generated on first boot and written to disk.
    """

    def __init__(self, key_file_path: Optional[str] = None):
        self._key = self._resolve_or_create_master_key(key_file_path)
        self._fernet = Fernet(self._key)

    def _resolve_or_create_master_key(self, custom_path: Optional[str] = None) -> bytes:
        # 1. Environment variable override
        env_key = os.getenv("CONVERA_MASTER_KEY", "").strip()
        if env_key:
            return self._normalize_to_fernet_key(env_key)

        # 2. Determine file path
        if custom_path:
            target_path = Path(custom_path)
        elif os.path.exists("/data"):
            target_path = Path("/data/.convera_key")
        else:
            base_dir = Path(__file__).resolve().parent.parent
            target_path = base_dir / ".convera_key"

        # 3. Read if exists
        if target_path.exists():
            try:
                content = target_path.read_text(encoding="utf-8").strip()
                if content:
                    return self._normalize_to_fernet_key(content)
            except Exception:
                pass

        # 4. Generate fresh key and persist
        generated = Fernet.generate_key()
        try:
            target_path.parent.mkdir(parents=True, exist_ok=True)
            # Create with 0600 permissions
            flags = os.O_WRONLY | os.O_CREAT | os.O_TRUNC
            fd = os.open(str(target_path), flags, 0o600)
            with open(fd, "w", encoding="utf-8") as f:
                f.write(generated.decode("utf-8"))
        except Exception:
            # Fallback if filesystem write is restricted (e.g., ephemeral in-memory)
            pass

        return generated

    def _normalize_to_fernet_key(self, raw_input: str) -> bytes:
        """Ensures the key is a valid 32-byte urlsafe-base64 Fernet key."""
        raw_bytes = raw_input.encode("utf-8")
        try:
            decoded = base64.urlsafe_b64decode(raw_bytes)
            if len(decoded) == 32:
                return raw_bytes
        except Exception:
            pass

        # Derive 32-byte key via SHA-256 if arbitrary passphrase provided
        digest = hashlib.sha256(raw_bytes).digest()
        return base64.urlsafe_b64encode(digest)

    def encrypt(self, plaintext: str) -> str:
        """Encrypts plaintext string into URL-safe base64 ciphertext."""
        if not plaintext:
            return ""
        return self._fernet.encrypt(plaintext.encode("utf-8")).decode("utf-8")

    def decrypt(self, ciphertext: str) -> str:
        """Decrypts ciphertext string into original plaintext."""
        if not ciphertext:
            return ""
        try:
            return self._fernet.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
        except InvalidToken as exc:
            raise ValueError("Failed to decrypt credential: invalid or corrupted ciphertext") from exc

    def get_jwt_secret(self) -> str:
        """Derives a deterministic 64-char HMAC-SHA256 hex secret from the master key."""
        return hmac.new(self._key, b"convera-jwt-access-token-secret-v1", hashlib.sha256).hexdigest()

    def mask_credential(self, secret: str, visible_chars: int = 4) -> str:
        """Returns a masked display string (e.g. '••••••••abcd')."""
        if not secret:
            return ""
        if len(secret) <= visible_chars:
            return "•" * len(secret)
        return "•" * (len(secret) - visible_chars) + secret[-visible_chars:]


# Global singleton instance
_vault_instance: Optional[CredentialVault] = None


def get_vault() -> CredentialVault:
    global _vault_instance
    if _vault_instance is None:
        _vault_instance = CredentialVault()
    return _vault_instance


get_credential_vault = get_vault
