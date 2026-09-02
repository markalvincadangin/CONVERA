import os
import glob
import json
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

    # Run auto-migration from legacy JSON files
    sessions_dir = str(PIPELINE_ROOT / "sessions")
    migrate_legacy_json_files(_GLOBAL_STORAGE, sessions_dir=sessions_dir)

    return _GLOBAL_STORAGE

def migrate_legacy_json_files(storage: BaseStorageAdapter, sessions_dir: Optional[str] = None):
    """Automatically import existing JSON files into the database if not already present."""
    if not sessions_dir:
        sessions_dir = str(PIPELINE_ROOT / "sessions")

    if not os.path.exists(sessions_dir):
        return

    json_files = glob.glob(os.path.join(sessions_dir, "*.json"))
    if not json_files:
        return

    migrated_count = 0
    for fpath in json_files:
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                state = json.load(f)
            session_id = state.get("session_id") or os.path.splitext(os.path.basename(fpath))[0]
            existing = storage.get_session(session_id)
            if not existing:
                state["session_id"] = session_id
                if "project_name" not in state or not state["project_name"]:
                    if session_id == "20260902_225017":
                        state["project_name"] = "Iloilo Bulb Onion & Cold-Chain Venture"
                        state["project_id"] = "proj_iloilo_agri"
                    else:
                        state["project_name"] = "Iloilo Technopreneurship Project"
                storage.save_session(session_id, state)
                migrated_count += 1
        except Exception as err:
            print(f"[!] Warning: Could not migrate {fpath}: {err}")

    if migrated_count > 0:
        print(f"[OK] Auto-migrated {migrated_count} existing sessions into the SQLite database.")
