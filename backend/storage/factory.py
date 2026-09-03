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

    # Always use absolute path to <pipeline_root>/ratchetai.db
    db_path = os.getenv("SQLITE_PATH", str(PIPELINE_ROOT / "ratchetai.db"))
    _GLOBAL_STORAGE = SQLiteStorageAdapter(db_path=db_path)
    print(f"[OK] SQLite WAL Database Storage initialized at {db_path}.")

    return _GLOBAL_STORAGE
