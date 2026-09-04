import os
from pathlib import Path
from typing import Optional
from .base import BaseStorageAdapter
from .sqlite_adapter import SQLiteStorageAdapter

_GLOBAL_STORAGE: Optional[BaseStorageAdapter] = None

PIPELINE_ROOT = Path(__file__).resolve().parent.parent

def get_storage() -> BaseStorageAdapter:
    """Retrieve or initialize the global storage adapter instance."""
    global _GLOBAL_STORAGE
    if _GLOBAL_STORAGE is not None:
        return _GLOBAL_STORAGE

    db_url = os.getenv("DATABASE_URL", "").strip()

    if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
        try:
            from .postgres_adapter import PostgresStorageAdapter
            _GLOBAL_STORAGE = PostgresStorageAdapter(db_url)
            print("[OK] Connected to PostgreSQL Cloud Database (Neon/Supabase).")
            return _GLOBAL_STORAGE
        except Exception as e:
            print(f"[!] Warning: PostgreSQL connection failed ({e}). Falling back to SQLite WAL.")

    # Always use absolute path to <pipeline_root>/convera.db with legacy fallback
    env_path = os.getenv("SQLITE_PATH", "").strip()
    if env_path:
        # If relative path supplied in env, resolve relative to PIPELINE_ROOT
        db_path = str(Path(env_path) if Path(env_path).is_absolute() else (PIPELINE_ROOT / env_path))
    else:
        canonical_path = PIPELINE_ROOT / "convera.db"
        legacy_path = PIPELINE_ROOT / "ratchetai.db"
        if not canonical_path.exists() and legacy_path.exists():
            print(f"[!] Notice: Found legacy database at {legacy_path}. Using fallback.")
            db_path = str(legacy_path)
        else:
            db_path = str(canonical_path)

    _GLOBAL_STORAGE = SQLiteStorageAdapter(db_path=db_path)
    print(f"[OK] SQLite WAL Database Storage initialized at {db_path}.")

    return _GLOBAL_STORAGE

