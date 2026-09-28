"""
Unit Tests for CONVERA Credential Vault
=======================================
Verifies Fernet encryption, key derivation, tamper detection, and masking.
"""

import os
import tempfile
import pytest
try:
    from engines.credential_vault import CredentialVault
except ImportError:
    from backend.engines.credential_vault import CredentialVault

pytestmark = pytest.mark.unit


def test_vault_encrypt_decrypt_roundtrip():
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp_path = tmp.name

    try:
        vault = CredentialVault(key_file_path=tmp_path)
        secret = "AIzaSyD-Secret-API-Key-12345"

        ciphertext = vault.encrypt(secret)
        assert ciphertext != secret
        assert len(ciphertext) > len(secret)

        decrypted = vault.decrypt(ciphertext)
        assert decrypted == secret
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_vault_key_persistence_and_permissions():
    temp_dir = tempfile.mkdtemp()
    key_file = os.path.join(temp_dir, "test.key")

    try:
        # First instance creates the key
        vault1 = CredentialVault(key_file_path=key_file)
        assert os.path.exists(key_file)

        # Check permissions: 0600 on POSIX
        mode = os.stat(key_file).st_mode & 0o777
        assert mode == 0o600

        secret = "sk-ant-api-key-9999"
        ct = vault1.encrypt(secret)

        # Second instance reuses the persisted key
        vault2 = CredentialVault(key_file_path=key_file)
        assert vault2.decrypt(ct) == secret
    finally:
        if os.path.exists(key_file):
            os.remove(key_file)
        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)


def test_vault_tamper_detection():
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp_path = tmp.name

    try:
        vault = CredentialVault(key_file_path=tmp_path)
        ct = vault.encrypt("important-notion-token")

        # Corrupt ciphertext
        tampered = ct[:-4] + "XXXX"
        with pytest.raises(ValueError, match="Failed to decrypt"):
            vault.decrypt(tampered)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_vault_jwt_secret_derivation():
    vault = CredentialVault()
    jwt_secret1 = vault.get_jwt_secret()
    jwt_secret2 = vault.get_jwt_secret()

    assert jwt_secret1 == jwt_secret2
    assert len(jwt_secret1) == 64  # SHA-256 hex string


def test_vault_masking():
    vault = CredentialVault()
    assert vault.mask_credential("1234567890", visible_chars=4) == "••••••7890"
    assert vault.mask_credential("abc", visible_chars=4) == "•••"
    assert vault.mask_credential("") == ""
