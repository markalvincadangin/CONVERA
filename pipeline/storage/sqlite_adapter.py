import json
import sqlite3
import os
import random
import string
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from .base import BaseStorageAdapter

def generate_share_code(prefix: str = "RATCH") -> str:
    """Generate a clean 6-character room share code like RATCH-7K9."""
    chars = "".join(random.choices(string.ascii_uppercase + "23456789", k=4))
    return f"{prefix}-{chars}"

class SQLiteStorageAdapter(BaseStorageAdapter):
    """High-concurrency SQLite WAL storage adapter for RatchetAI."""

    def __init__(self, db_path: str = "pipeline/ratchetai.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        # Enable Write-Ahead Logging (WAL) for high concurrency and zero locks
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    share_code TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    created_by TEXT DEFAULT 'Founder',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    project_id TEXT,
                    project_name TEXT,
                    state_data TEXT NOT NULL,
                    phase1_complete INTEGER DEFAULT 0,
                    phase2_complete INTEGER DEFAULT 0,
                    phase3_complete INTEGER DEFAULT 0,
                    phase4_complete INTEGER DEFAULT 0,
                    phase5_complete INTEGER DEFAULT 0,
                    last_edited_by TEXT DEFAULT 'Founder',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
                );

                CREATE TABLE IF NOT EXISTS session_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    label TEXT NOT NULL,
                    phase_number INTEGER NOT NULL,
                    state_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_projects_share_code ON projects(share_code);
                CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC);
                CREATE INDEX IF NOT EXISTS idx_snapshots_session ON session_snapshots(session_id, created_at DESC);
            """)

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT state_data, project_name, updated_at, created_at FROM sessions WHERE session_id = ?",
                (session_id,)
            ).fetchone()
            if not row:
                return None
            try:
                state = json.loads(row["state_data"])
                if "project_name" not in state or not state["project_name"]:
                    state["project_name"] = row["project_name"]
                return state
            except Exception:
                return None

    def save_session(self, session_id: str, state: Dict[str, Any]) -> Dict[str, Any]:
        project_name = state.get("project_name") or "Venture Project"
        project_id = state.get("project_id")

        p1 = 1 if state.get("phase1_complete") or state.get("phase1_response") else 0
        p2 = 1 if state.get("phase2_complete") or state.get("phase2_response") else 0
        p3 = 1 if state.get("phase3_complete") or (state.get("completed_levels") and len(state.get("completed_levels", [])) >= 6) else 0
        p4 = 1 if state.get("phase4_complete") or state.get("phase4_response") else 0
        p5 = 1 if state.get("phase5_complete") or state.get("phase5_response") else 0

        state_json = json.dumps(state)
        now = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            # Ensure project exists if project_id is given
            if project_id:
                proj = conn.execute("SELECT id FROM projects WHERE id = ?", (project_id,)).fetchone()
                if not proj:
                    code = generate_share_code()
                    conn.execute(
                        "INSERT INTO projects (id, share_code, name) VALUES (?, ?, ?)",
                        (project_id, code, project_name)
                    )

            conn.execute("""
                INSERT INTO sessions (
                    session_id, project_id, project_name, state_data,
                    phase1_complete, phase2_complete, phase3_complete, phase4_complete, phase5_complete,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(session_id) DO UPDATE SET
                    project_name = excluded.project_name,
                    state_data = excluded.state_data,
                    phase1_complete = excluded.phase1_complete,
                    phase2_complete = excluded.phase2_complete,
                    phase3_complete = excluded.phase3_complete,
                    phase4_complete = excluded.phase4_complete,
                    phase5_complete = excluded.phase5_complete,
                    updated_at = excluded.updated_at
            """, (session_id, project_id, project_name, state_json, p1, p2, p3, p4, p5, now))

        return state

    def list_sessions(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT 
                    s.session_id, s.project_id, s.project_name,
                    s.phase1_complete, s.phase2_complete, s.phase3_complete, s.phase4_complete, s.phase5_complete,
                    s.created_at, s.updated_at,
                    p.share_code
                FROM sessions s
                LEFT JOIN projects p ON s.project_id = p.id
                ORDER BY s.updated_at DESC
                LIMIT ?
            """, (limit,)).fetchall()

            results = []
            for r in rows:
                results.append({
                    "session_id": r["session_id"],
                    "project_id": r["project_id"],
                    "project_name": r["project_name"] or "Venture Project",
                    "share_code": r["share_code"],
                    "phase1_complete": bool(r["phase1_complete"]),
                    "phase2_complete": bool(r["phase2_complete"]),
                    "phase3_complete": bool(r["phase3_complete"]),
                    "phase4_complete": bool(r["phase4_complete"]),
                    "phase5_complete": bool(r["phase5_complete"]),
                    "created_at": r["created_at"],
                    "updated_at": r["updated_at"],
                })
            return results

    def delete_session(self, session_id: str) -> bool:
        with self._get_connection() as conn:
            cur = conn.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
            return cur.rowcount > 0

    def create_snapshot(self, session_id: str, label: str, phase_number: int) -> Dict[str, Any]:
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")

        state_json = json.dumps(session)
        with self._get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO session_snapshots (session_id, label, phase_number, state_data)
                VALUES (?, ?, ?, ?)
            """, (session_id, label, phase_number, state_json))
            snapshot_id = cur.lastrowid

            return {
                "id": snapshot_id,
                "session_id": session_id,
                "label": label,
                "phase_number": phase_number,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

    def list_snapshots(self, session_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT id, session_id, label, phase_number, created_at
                FROM session_snapshots
                WHERE session_id = ?
                ORDER BY created_at DESC
            """, (session_id,)).fetchall()
            return [dict(r) for r in rows]

    def restore_snapshot(self, session_id: str, snapshot_id: int) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute("""
                SELECT state_data FROM session_snapshots
                WHERE id = ? AND session_id = ?
            """, (snapshot_id, session_id)).fetchone()
            if not row:
                return None
            state = json.loads(row["state_data"])
            self.save_session(session_id, state)
            return state

    def get_project_by_code(self, share_code: str) -> Optional[Dict[str, Any]]:
        clean_code = share_code.strip().upper()
        with self._get_connection() as conn:
            row = conn.execute("""
                SELECT p.id, p.share_code, p.name, p.created_at, s.session_id
                FROM projects p
                LEFT JOIN sessions s ON s.project_id = p.id
                WHERE p.share_code = ?
                LIMIT 1
            """, (clean_code,)).fetchone()
            if not row:
                return None
            return dict(row)
