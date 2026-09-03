
def tokenize_statement(text: str) -> set:
    if not text:
        return set()
    words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
    stops = {"and", "the", "for", "with", "due", "causes", "lack", "from", "into", "their", "that", "this", "during", "requiring", "leads", "across", "severe", "high", "many"}
    return {w for w in words if w not in stops}

import json
import sqlite3
import os
import random
import string
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from .base import BaseStorageAdapter
from engines.evidence_scorer import calculate_score_breakdown
import re

def clean_text(val: Optional[str]) -> str:
    if not val:
        return ""
    s = re.sub(r"<br\s*/?>", " ", str(val), flags=re.IGNORECASE)
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"\*\*([^\*]+)\*\*", r"\1", s)
    s = re.sub(r"\*([^\*]+)\*", r"\1", s)
    s = re.sub(r"__([^_]+)__", r"\1", s)
    s = re.sub(r"_([^_]+)_", r"\1", s)
    s = s.replace("**", "").replace("*", "").replace("`", "").replace("##", "").replace("#", "")
    s = re.sub(r"\s+", " ", s).strip()
    return s

def clean_problem_id(val: str) -> str:
    s = clean_text(val)
    s = re.sub(r"[^A-Za-z0-9\-]", "", s).upper()
    return s


def generate_share_code(prefix: str = "RATCH") -> str:
    """Generate a clean 6-character room share code like RATCH-7K9."""
    chars = "".join(random.choices(string.ascii_uppercase + "23456789", k=4))
    return f"{prefix}-{chars}"


class SQLiteStorageAdapter(BaseStorageAdapter):
    """High-concurrency SQLite WAL storage adapter with full Problem Bank support for RatchetAI."""

    def __init__(self, db_path: str = "pipeline/ratchetai.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
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
                    passcode TEXT,
                    created_by TEXT DEFAULT 'Founder',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS project_members (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'RESEARCHER',
                    avatar TEXT DEFAULT '👩‍💻',
                    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
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

                -- -----------------------------------------------------------
                -- Problem Bank Tables
                -- -----------------------------------------------------------
                CREATE TABLE IF NOT EXISTS problems (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    session_id TEXT,
                    sector TEXT NOT NULL,
                    sufferer_occupation TEXT,
                    sufferer_location TEXT,
                    problem_statement TEXT NOT NULL,
                    evidence_tier TEXT DEFAULT 'SIGNAL',
                    workaround TEXT,
                    quantified_impact TEXT,
                    evidence_types TEXT DEFAULT '[]',
                    source TEXT DEFAULT 'llm_phase1',
                    source_detail TEXT,
                    tags TEXT DEFAULT '[]',
                    status TEXT DEFAULT 'discovered',
                    phase2_verdict TEXT,
                    phase3_verdict TEXT,
                    notes TEXT,
                    score REAL DEFAULT 0.0,
                    votes INTEGER DEFAULT 0,
                    devils_advocate_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
                    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL
                );

                CREATE TABLE IF NOT EXISTS problem_sources (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    problem_id TEXT NOT NULL,
                    source_name TEXT NOT NULL,
                    source_url TEXT,
                    source_tier TEXT DEFAULT 'B',
                    evidence_type TEXT,
                    quote_or_summary TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS problem_phase_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    problem_id TEXT NOT NULL,
                    phase_number INTEGER NOT NULL,
                    action TEXT NOT NULL,
                    verdict TEXT,
                    llm_response TEXT,
                    model_used TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                                -- -----------------------------------------------------------
                -- Relational Knowledge Graph Tables (Step 1 Foundation)
                -- -----------------------------------------------------------
                CREATE TABLE IF NOT EXISTS problem_claims (
                    id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    claim_type TEXT NOT NULL,
                    claim_text TEXT NOT NULL,
                    status TEXT DEFAULT 'HYPOTHESIS',
                    confidence_score REAL DEFAULT 50.0,
                    mode TEXT DEFAULT 'COMMERCIAL',
                    evidence_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS problem_assumptions (
                    id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    assumption_text TEXT NOT NULL,
                    risk_level TEXT DEFAULT 'HIGH',
                    status TEXT DEFAULT 'UNTESTED',
                    origin TEXT DEFAULT 'DEVILS_ADVOCATE',
                    testable_question TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS problem_alternatives (
                    id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    alternative_name TEXT NOT NULL,
                    category TEXT DEFAULT 'MANUAL_WORKAROUND',
                    why_it_fails TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS decision_records (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    stage TEXT NOT NULL,
                    selected_problem_id TEXT NOT NULL,
                    rejected_problem_ids TEXT DEFAULT '[]',
                    decision_rationale TEXT NOT NULL,
                    supporting_evidence_ids TEXT DEFAULT '[]',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS problem_comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    problem_id TEXT NOT NULL,
                    user_name TEXT NOT NULL,
                    user_role TEXT NOT NULL DEFAULT 'RESEARCHER',
                    user_avatar TEXT DEFAULT '👩‍💻',
                    comment TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
                );
            


                CREATE TABLE IF NOT EXISTS mentor_signoffs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id TEXT NOT NULL,
                    phase_number INTEGER NOT NULL,
                    mentor_name TEXT NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                );

                -- Indices
                CREATE INDEX IF NOT EXISTS idx_projects_share_code ON projects(share_code);
                CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC);
                CREATE INDEX IF NOT EXISTS idx_snapshots_session ON session_snapshots(session_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_problems_sector ON problems(sector);
                CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
                CREATE INDEX IF NOT EXISTS idx_problems_project ON problems(project_id);
                CREATE INDEX IF NOT EXISTS idx_problems_tier ON problems(evidence_tier);
                CREATE INDEX IF NOT EXISTS idx_problems_updated ON problems(updated_at DESC);
                CREATE INDEX IF NOT EXISTS idx_problem_sources_pid ON problem_sources(problem_id);
                CREATE INDEX IF NOT EXISTS idx_problem_phase_history_pid ON problem_phase_history(problem_id);

                -- Phase 6: Epistemic Links, Assumption Tests & Impact Invalidation
                CREATE TABLE IF NOT EXISTS claim_evidence_links (
                    id TEXT PRIMARY KEY,
                    claim_id TEXT NOT NULL,
                    source_id INTEGER NOT NULL,
                    relation_type TEXT NOT NULL DEFAULT 'SUPPORTS',
                    evidence_strength TEXT NOT NULL DEFAULT 'STRONG',
                    rationale TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (claim_id) REFERENCES problem_claims(id) ON DELETE CASCADE,
                    FOREIGN KEY (source_id) REFERENCES problem_sources(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS assumption_validation_tests (
                    id TEXT PRIMARY KEY,
                    assumption_id TEXT NOT NULL,
                    test_type TEXT NOT NULL DEFAULT 'FIELD_INTERVIEW',
                    target_metric TEXT NOT NULL,
                    actual_result TEXT,
                    test_status TEXT NOT NULL DEFAULT 'PLANNED',
                    conducted_by TEXT,
                    completed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (assumption_id) REFERENCES problem_assumptions(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS impact_invalidation_events (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    session_id TEXT,
                    trigger_entity_type TEXT NOT NULL,
                    trigger_entity_id TEXT NOT NULL,
                    trigger_action TEXT NOT NULL,
                    severity TEXT NOT NULL DEFAULT 'WARNING',
                    affected_entities TEXT NOT NULL DEFAULT '[]',
                    resolution_status TEXT NOT NULL DEFAULT 'ACTIVE_ALERT',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON claim_evidence_links(claim_id);
                CREATE INDEX IF NOT EXISTS idx_claim_evidence_source ON claim_evidence_links(source_id);
                CREATE INDEX IF NOT EXISTS idx_assumption_tests ON assumption_validation_tests(assumption_id);
                CREATE INDEX IF NOT EXISTS idx_impact_events_status ON impact_invalidation_events(resolution_status, created_at DESC);
            """)

            # Migration safe check for newly added columns if table already existed
            try:
                conn.execute("ALTER TABLE problems ADD COLUMN votes INTEGER DEFAULT 0")
            except Exception:
                pass
            try:
                conn.execute("ALTER TABLE problems ADD COLUMN devils_advocate_data TEXT")
            except Exception:
                pass

    # ------------------------------------------------------------------
    # Session Management Methods
    # ------------------------------------------------------------------


            try:
                conn.execute("ALTER TABLE projects ADD COLUMN passcode TEXT;")
            except sqlite3.OperationalError:
                pass

            try:
                conn.execute("ALTER TABLE problems ADD COLUMN created_by TEXT DEFAULT 'Founder';")
            except sqlite3.OperationalError:
                pass

            try:
                conn.execute("ALTER TABLE problems ADD COLUMN updated_by TEXT DEFAULT 'Founder';")
            except sqlite3.OperationalError:
                pass

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT session_id, project_id, state_data, project_name, updated_at, created_at FROM sessions WHERE session_id = ?",
                (session_id,)
            ).fetchone()
            if not row:
                return None
            try:
                state = json.loads(row["state_data"])
                state["session_id"] = row["session_id"]
                state["project_id"] = row["project_id"]
                if "project_name" not in state or not state["project_name"]:
                    state["project_name"] = row["project_name"]
                if row["project_id"]:
                    p_row = conn.execute("SELECT share_code, passcode FROM projects WHERE id = ?", (row["project_id"],)).fetchone()
                    if p_row:
                        state["share_code"] = p_row["share_code"]
                        state["has_passcode"] = bool(p_row["passcode"])
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

        now = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            if not project_id:
                existing_sess = conn.execute("SELECT project_id FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
                if existing_sess and existing_sess["project_id"]:
                    project_id = existing_sess["project_id"]
                else:
                    project_id = f"proj_{uuid.uuid4().hex[:8]}"
                    code = generate_share_code()
                    conn.execute(
                        "INSERT INTO projects (id, share_code, name) VALUES (?, ?, ?)",
                        (project_id, code, project_name)
                    )
            else:
                proj = conn.execute("SELECT id FROM projects WHERE id = ?", (project_id,)).fetchone()
                if not proj:
                    code = generate_share_code()
                    conn.execute(
                        "INSERT INTO projects (id, share_code, name) VALUES (?, ?, ?)",
                        (project_id, code, project_name)
                    )

            state["project_id"] = project_id
            state["session_id"] = session_id
            state_json = json.dumps(state)

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

    def rename_session(self, session_id: str, new_name: str) -> Optional[Dict[str, Any]]:
        state = self.get_session(session_id)
        if not state:
            return None
        clean_name = new_name.strip()
        state["project_name"] = clean_name
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                "UPDATE sessions SET project_name = ?, updated_at = ? WHERE session_id = ?",
                (clean_name, now, session_id)
            )
            proj_id = state.get("project_id")
            if proj_id:
                conn.execute(
                    "UPDATE projects SET name = ?, updated_at = ? WHERE id = ?",
                    (clean_name, now, proj_id)
                )
        return self.save_session(session_id, state)

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

    # ------------------------------------------------------------------

    # ------------------------------------------------------------------
    # Team Members, Passcodes, and Comments Operations
    # ------------------------------------------------------------------

    def verify_project_passcode(self, project_id: str, passcode: str) -> bool:
        with self._get_connection() as conn:
            # Check direct project record
            row = conn.execute(
                "SELECT passcode FROM projects WHERE id = ?",
                (project_id,)
            ).fetchone()
            
            # If not found directly, check if project_id is a session_id
            if not row:
                s_row = conn.execute(
                    "SELECT p.passcode FROM sessions s LEFT JOIN projects p ON s.project_id = p.id WHERE s.session_id = ? OR s.project_id = ?",
                    (project_id, project_id)
                ).fetchone()
                if s_row and s_row["passcode"] is not None:
                    row = s_row

            if not row or not row["passcode"]:
                return True # No passcode set yet
            return str(row["passcode"]).strip() == str(passcode).strip()

    def set_project_passcode(self, project_id: str, passcode: Optional[str]) -> bool:
        with self._get_connection() as conn:
            clean_pin = passcode.strip() if passcode else None
            share_code = generate_share_code()
            # Always ensure a project row exists
            conn.execute("""
                INSERT INTO projects (id, name, passcode, share_code)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET passcode = excluded.passcode
            """, (project_id, "Venture Project", clean_pin, share_code))

            # Also check if project_id links to a session
            raw_sess_id = project_id.replace("proj_", "")
            conn.execute("""
                UPDATE sessions SET project_id = ? 
                WHERE session_id = ? OR session_id = ? OR project_id = ?
            """, (project_id, project_id, raw_sess_id, project_id))
            return True

    def list_project_members(self, project_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT * FROM project_members
                WHERE project_id = ?
                ORDER BY created_at ASC
            """, (project_id,)).fetchall()
            return [dict(r) for r in rows]

    def upsert_project_member(self, project_id: str, member_data: Dict[str, Any]) -> Dict[str, Any]:
        member_id = member_data.get("id") or f"mem_{uuid.uuid4().hex[:8]}"
        name = member_data.get("name", "Team Member")
        role = member_data.get("role", "RESEARCHER")
        avatar = member_data.get("avatar", "👩‍💻")
        now = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO project_members (id, project_id, name, role, avatar, last_active_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name=excluded.name,
                    role=excluded.role,
                    avatar=excluded.avatar,
                    last_active_at=excluded.last_active_at
            """, (member_id, project_id, name, role, avatar, now, now))

            row = conn.execute("SELECT * FROM project_members WHERE id = ?", (member_id,)).fetchone()
            return dict(row)

    def add_problem_comment(self, problem_id: str, comment_data: Dict[str, Any]) -> Dict[str, Any]:
        user_name = comment_data.get("user_name", "Team Member")
        user_role = comment_data.get("user_role", "RESEARCHER")
        user_avatar = comment_data.get("user_avatar", "👩‍💻")
        comment = comment_data.get("comment", "").strip()
        now = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO problem_comments (problem_id, user_name, user_role, user_avatar, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (problem_id, user_name, user_role, user_avatar, comment, now))
            cid = cur.lastrowid
            return {
                "id": cid,
                "problem_id": problem_id,
                "user_name": user_name,
                "user_role": user_role,
                "user_avatar": user_avatar,
                "comment": comment,
                "created_at": now
            }

    def list_problem_comments(self, problem_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT * FROM problem_comments
                WHERE problem_id = ?
                ORDER BY created_at ASC
            """, (problem_id,)).fetchall()
            return [dict(r) for r in rows]

    def record_mentor_signoff(self, project_id: str, phase_number: int, mentor_name: str, notes: str) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO mentor_signoffs (project_id, phase_number, mentor_name, notes, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (project_id, phase_number, mentor_name, notes, now))
            sid = cur.lastrowid
            return {
                "id": sid,
                "project_id": project_id,
                "phase_number": phase_number,
                "mentor_name": mentor_name,
                "notes": notes,
                "created_at": now
            }

    def list_mentor_signoffs(self, project_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT * FROM mentor_signoffs
                WHERE project_id = ?
                ORDER BY created_at DESC
            """, (project_id,)).fetchall()
            return [dict(r) for r in rows]

    # Problem Bank Methods
    # ------------------------------------------------------------------

    def find_matching_problem(self, p: Dict[str, Any], threshold: float = 0.65) -> Optional[Dict[str, Any]]:
        """Find an existing problem in the database that describes the same core issue."""
        sector = p.get("sector")
        stmt = clean_text(p.get("problem_statement") or "").lower()
        if not stmt:
            return None
            
        with self._get_connection() as conn:
            query = "SELECT * FROM problems"
            params = []
            if sector:
                query += " WHERE sector = ?"
                params.append(sector)
            rows = [dict(r) for r in conn.execute(query, params).fetchall()]
            
        for existing in rows:
            ex_stmt = clean_text(existing.get("problem_statement") or "").lower()
            if ex_stmt and (ex_stmt == stmt or ex_stmt in stmt or stmt in ex_stmt):
                return existing
                
            t1 = tokenize_statement(stmt + " " + (p.get("sufferer_occupation") or ""))
            t2 = tokenize_statement(ex_stmt + " " + (existing.get("sufferer_occupation") or ""))
            if t1 and t2:
                inter = len(t1.intersection(t2))
                union = len(t1.union(t2))
                min_len = min(len(t1), len(t2))
                jaccard = inter / union if union > 0 else 0
                overlap = inter / min_len if min_len > 0 else 0
                if jaccard >= 0.50 or overlap >= 0.70:
                    return existing
                    
        return None

    def add_problem(self, problem_data: Dict[str, Any]) -> Dict[str, Any]:
        p = dict(problem_data)
        sector = p.get("sector") or "Agriculture & Fisheries"
        stmt = clean_text(p.get("problem_statement") or "")
        p["problem_statement"] = stmt
        p["sufferer_occupation"] = clean_text(p.get("sufferer_occupation") or "")
        p["sufferer_location"] = clean_text(p.get("sufferer_location") or "")
        p["workaround"] = clean_text(p.get("workaround") or "")
        p["quantified_impact"] = clean_text(p.get("quantified_impact") or "")
        p["source_detail"] = clean_text(p.get("source_detail") or "")
        raw_id = p.get("id") or p.get("problem_id")

        sources = p.get("sources") or []
        breakdown = calculate_score_breakdown(p, sources)
        score = p.get("score") if p.get("score") is not None else breakdown["total_score"]
        p["score"] = score
        now = datetime.now(timezone.utc).isoformat()

        # 1. If explicit ID provided, check if that ID exists in DB
        existing_by_id = self.get_problem(clean_problem_id(raw_id)) if raw_id else None
        
        # 2. Check semantic overlap if not an explicit custom ID update
        matching_problem = existing_by_id
        if not matching_problem and not raw_id:
            matching_problem = self.find_matching_problem(p)

        if matching_problem:
            target_id = matching_problem["id"]
            if sources:
                self.add_problem_sources(target_id, sources)
            with self._get_connection() as conn:
                conn.execute("""
                    UPDATE problems SET
                        score = max(score, ?),
                        workaround = CASE WHEN length(?) > length(coalesce(workaround, '')) THEN ? ELSE workaround END,
                        quantified_impact = CASE WHEN length(?) > length(coalesce(quantified_impact, '')) THEN ? ELSE quantified_impact END,
                        source_detail = CASE WHEN length(?) > length(coalesce(source_detail, '')) THEN ? ELSE source_detail END,
                        updated_at = ?
                    WHERE id = ?
                """, (
                    score,
                    p["workaround"], p["workaround"],
                    p["quantified_impact"], p["quantified_impact"],
                    p["source_detail"], p["source_detail"],
                    now, target_id
                ))
                claims = p.get("claims") or []
                for c in claims:
                    cid = c.get("id") or f"clm_{uuid.uuid4().hex[:8]}"
                    conn.execute("""
                        INSERT INTO problem_claims (id, problem_id, claim_type, claim_text, status, confidence_score, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            claim_type = excluded.claim_type,
                            claim_text = excluded.claim_text,
                            status = excluded.status
                    """, (cid, target_id, c.get("claim_type") or "FRICTION_REALITY", c.get("claim_text") or "", c.get("status") or "HYPOTHESIS", c.get("confidence_score") or 50.0, now))

                assumptions = p.get("assumptions") or []
                for a in assumptions:
                    aid = a.get("id") or f"asm_{uuid.uuid4().hex[:8]}"
                    conn.execute("""
                        INSERT INTO problem_assumptions (id, problem_id, assumption_text, risk_level, status, origin, testable_question, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            assumption_text = excluded.assumption_text,
                            risk_level = excluded.risk_level,
                            status = excluded.status
                    """, (aid, target_id, a.get("assumption_text") or "", a.get("risk_level") or "HIGH", a.get("status") or "UNTESTED", a.get("origin") or "FOUNDER_INPUT", a.get("testable_question"), now))

            return self.get_problem(target_id) or matching_problem

        # 3. Determine ID: use sanitized explicit ID if given, else assign sequential canonical ID
        if raw_id:
            problem_id = clean_problem_id(raw_id)
        else:
            sector_prefixes = {
                "Agriculture & Fisheries": "AGR",
                "Health & Wellness": "HLT",
                "MSMEs & Retail": "RET",
                "Education & Youth": "EDU",
                "Transport & Logistics": "LOG",
                "Housing & Utilities": "UTL",
                "Government Services & Compliance": "GOV",
                "Finance & Credit": "FIN",
            }
            prefix = sector_prefixes.get(sector, "PRB")
            with self._get_connection() as conn:
                row = conn.execute("SELECT COUNT(*) FROM problems WHERE sector = ?", (sector,)).fetchone()
                count = (row[0] if row else 0) + 1
                problem_id = f"{prefix}-{count:03d}"
                while conn.execute("SELECT id FROM problems WHERE id = ?", (problem_id,)).fetchone():
                    count += 1
                    problem_id = f"{prefix}-{count:03d}"

        evidence_types_json = json.dumps(p.get("evidence_types") or p.get("evidence_type_list") or [])
        tags_json = json.dumps(p.get("tags") or [])
        da_json = json.dumps(p.get("devils_advocate_data")) if p.get("devils_advocate_data") else None

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO problems (
                    id, project_id, session_id, sector, sufferer_occupation,
                    sufferer_location, problem_statement, evidence_tier, workaround,
                    quantified_impact, evidence_types, source, source_detail,
                    tags, status, phase2_verdict, phase3_verdict, notes, score,
                    votes, devils_advocate_data, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    project_id = coalesce(excluded.project_id, problems.project_id),
                    session_id = coalesce(excluded.session_id, problems.session_id),
                    sector = excluded.sector,
                    sufferer_occupation = excluded.sufferer_occupation,
                    sufferer_location = excluded.sufferer_location,
                    problem_statement = excluded.problem_statement,
                    evidence_tier = excluded.evidence_tier,
                    workaround = excluded.workaround,
                    quantified_impact = excluded.quantified_impact,
                    evidence_types = excluded.evidence_types,
                    source = excluded.source,
                    source_detail = excluded.source_detail,
                    tags = excluded.tags,
                    status = excluded.status,
                    phase2_verdict = coalesce(excluded.phase2_verdict, problems.phase2_verdict),
                    phase3_verdict = coalesce(excluded.phase3_verdict, problems.phase3_verdict),
                    notes = coalesce(excluded.notes, problems.notes),
                    score = excluded.score,
                    votes = coalesce(excluded.votes, problems.votes),
                    devils_advocate_data = coalesce(excluded.devils_advocate_data, problems.devils_advocate_data),
                    updated_at = excluded.updated_at
            """, (
                problem_id,
                p.get("project_id"),
                p.get("session_id"),
                sector,
                p["sufferer_occupation"],
                p["sufferer_location"],
                p["problem_statement"],
                p.get("evidence_tier") or "SIGNAL",
                p["workaround"],
                p["quantified_impact"],
                evidence_types_json,
                p.get("source") or "Phase 1 Discovery",
                p["source_detail"],
                tags_json,
                p.get("status") or "discovered",
                p.get("phase2_verdict"),
                p.get("phase3_verdict"),
                p.get("notes") or "",
                score,
                p.get("votes") or 0,
                da_json,
                now,
                now
            ))

        if sources:
            self.add_problem_sources(problem_id, sources)

        # Persist explicit claims if provided
        claims = p.get("claims") or []
        if claims:
            with self._get_connection() as conn:
                for c in claims:
                    cid = c.get("id") or f"clm_{uuid.uuid4().hex[:8]}"
                    conn.execute("""
                        INSERT INTO problem_claims (id, problem_id, claim_type, claim_text, status, confidence_score, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            claim_type = excluded.claim_type,
                            claim_text = excluded.claim_text,
                            status = excluded.status
                    """, (
                        cid,
                        problem_id,
                        c.get("claim_type") or "FRICTION_REALITY",
                        c.get("claim_text") or "",
                        c.get("status") or "HYPOTHESIS",
                        c.get("confidence_score") or 50.0,
                        now
                    ))

        # Persist explicit assumptions if provided
        assumptions = p.get("assumptions") or []
        if assumptions:
            with self._get_connection() as conn:
                for a in assumptions:
                    aid = a.get("id") or f"asm_{uuid.uuid4().hex[:8]}"
                    conn.execute("""
                        INSERT INTO problem_assumptions (id, problem_id, assumption_text, risk_level, status, origin, testable_question, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            assumption_text = excluded.assumption_text,
                            risk_level = excluded.risk_level,
                            status = excluded.status
                    """, (
                        aid,
                        problem_id,
                        a.get("assumption_text") or "",
                        a.get("risk_level") or "HIGH",
                        a.get("status") or "UNTESTED",
                        a.get("origin") or "FOUNDER_INPUT",
                        a.get("testable_question"),
                        now
                    ))

        return self.get_problem(problem_id) or p

    def add_problem_sources(self, problem_id: str, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            for s in sources:
                conn.execute("""
                    INSERT INTO problem_sources (
                        problem_id, source_name, source_url, source_tier, evidence_type, quote_or_summary
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    problem_id,
                    s.get("source_name") or s.get("description") or "Source",
                    s.get("source_url") or s.get("url"),
                    s.get("source_tier") or "B",
                    s.get("evidence_type") or "Reference",
                    s.get("quote_or_summary") or ""
                ))
        p = self.get_problem(problem_id)
        return p.get("sources", []) if p else []


    def get_problem(self, problem_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,)).fetchone()
            if not row:
                return None
            p = dict(row)
            try:
                p["evidence_types"] = json.loads(p.get("evidence_types") or "[]")
            except Exception:
                p["evidence_types"] = []
            try:
                p["tags"] = json.loads(p.get("tags") or "[]")
            except Exception:
                p["tags"] = []
            try:
                p["devils_advocate_data"] = json.loads(p.get("devils_advocate_data") or "null")
            except Exception:
                p["devils_advocate_data"] = None

            sources = conn.execute(
                "SELECT * FROM problem_sources WHERE problem_id = ? ORDER BY id ASC",
                (problem_id,)
            ).fetchall()
            p["sources"] = [dict(s) for s in sources]
            p["score_breakdown"] = calculate_score_breakdown(p, p["sources"])

            history_rows = conn.execute(
                "SELECT * FROM problem_phase_history WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,)
            ).fetchall()
            p["phase_history"] = [dict(h) for h in history_rows]

            comment_rows = conn.execute(
                "SELECT * FROM problem_comments WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,)
            ).fetchall()
            p["comments"] = [dict(c) for c in comment_rows]

            claim_rows = conn.execute(
                "SELECT * FROM problem_claims WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,)
            ).fetchall()
            p["claims"] = [dict(c) for c in claim_rows]

            assumption_rows = conn.execute(
                "SELECT * FROM problem_assumptions WHERE problem_id = ? ORDER BY created_at ASC",
                (problem_id,)
            ).fetchall()
            p["assumptions"] = [dict(a) for a in assumption_rows]

            return p

    def list_problems(
        self,
        project_id: Optional[str] = None,
        session_id: Optional[str] = None,
        sector: Optional[str] = None,
        evidence_tier: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        query = "SELECT * FROM problems WHERE 1=1"
        params: List[Any] = []

        if project_id:
            query += " AND (project_id = ? OR project_id IS NULL)"
            params.append(project_id)
        if session_id:
            query += " AND (session_id = ? OR session_id IS NULL)"
            params.append(session_id)
        if sector and sector != "All":
            query += " AND sector = ?"
            params.append(sector)
        if evidence_tier and evidence_tier != "All":
            query += " AND evidence_tier = ?"
            params.append(evidence_tier)
        if status and status != "All":
            query += " AND status = ?"
            params.append(status)
        if search and search.strip():
            like_term = f"%{search.strip()}%"
            query += " AND (problem_statement LIKE ? OR sufferer_occupation LIKE ? OR sufferer_location LIKE ? OR notes LIKE ? OR id LIKE ?)"
            params.extend([like_term, like_term, like_term, like_term, like_term])

        query += " ORDER BY votes DESC, score DESC, updated_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        with self._get_connection() as conn:
            rows = conn.execute(query, params).fetchall()
            results = []
            for row in rows:
                p = dict(row)
                try:
                    p["evidence_types"] = json.loads(p.get("evidence_types") or "[]")
                except Exception:
                    p["evidence_types"] = []
                try:
                    p["tags"] = json.loads(p.get("tags") or "[]")
                except Exception:
                    p["tags"] = []
                try:
                    p["devils_advocate_data"] = json.loads(p.get("devils_advocate_data") or "null")
                except Exception:
                    p["devils_advocate_data"] = None

                sources = conn.execute(
                    "SELECT id, source_name, source_url, source_tier, evidence_type, quote_or_summary FROM problem_sources WHERE problem_id = ?",
                    (p["id"],)
                ).fetchall()
                p["sources"] = [dict(s) for s in sources]
                results.append(p)
            return results

    def update_problem(self, problem_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        existing = self.get_problem(problem_id)
        if not existing:
            return None

        allowed_fields = [
            "sector", "sufferer_occupation", "sufferer_location", "problem_statement",
            "evidence_tier", "workaround", "quantified_impact", "evidence_types",
            "source", "source_detail", "tags", "status", "phase2_verdict", "phase3_verdict",
            "notes", "score", "votes", "devils_advocate_data", "project_id"
        ]

        set_clauses = []
        params = []

        for field in allowed_fields:
            if field in updates:
                val = updates[field]
                if field in ("evidence_types", "tags", "devils_advocate_data") and not isinstance(val, str) and val is not None:
                    val = json.dumps(val)
                set_clauses.append(f"{field} = ?")
                params.append(val)

        if "sources" in updates:
            sources = updates["sources"]
            with self._get_connection() as conn:
                conn.execute("DELETE FROM problem_sources WHERE problem_id = ?", (problem_id,))
                for s in sources:
                    conn.execute("""
                        INSERT INTO problem_sources (
                            problem_id, source_name, source_url, source_tier, evidence_type, quote_or_summary
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        problem_id,
                        s.get("source_name") or s.get("description") or "Source",
                        s.get("source_url") or s.get("url"),
                        s.get("source_tier") or "B",
                        s.get("evidence_type") or "Reference",
                        s.get("quote_or_summary") or ""
                    ))
            merged = {**existing, **updates}
            breakdown = calculate_score_breakdown(merged, sources)
            set_clauses.append("score = ?")
            params.append(breakdown["total_score"])

        if set_clauses:
            now = datetime.now(timezone.utc).isoformat()
            set_clauses.append("updated_at = ?")
            params.append(now)
            params.append(problem_id)

            with self._get_connection() as conn:
                conn.execute(
                    f"UPDATE problems SET {', '.join(set_clauses)} WHERE id = ?",
                    params
                )

        return self.get_problem(problem_id)

    def delete_problem(self, problem_id: str) -> bool:
        with self._get_connection() as conn:
            cur = conn.execute("DELETE FROM problems WHERE id = ?", (problem_id,))
            return cur.rowcount > 0

    def record_problem_history(
        self,
        problem_id: str,
        phase_number: int,
        action: str,
        verdict: Optional[str] = None,
        llm_response: Optional[str] = None,
        model_used: Optional[str] = None
    ) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO problem_phase_history (
                    problem_id, phase_number, action, verdict, llm_response, model_used
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (problem_id, phase_number, action, verdict, llm_response, model_used))
            history_id = cur.lastrowid
            return {
                "id": history_id,
                "problem_id": problem_id,
                "phase_number": phase_number,
                "action": action,
                "verdict": verdict,
                "model_used": model_used,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

    def bulk_upsert_problems(self, problems: List[Dict[str, Any]]) -> Dict[str, Any]:
        results = []
        created_ids = []
        merged_ids = []
        for p in problems:
            raw_id = p.get("id") or p.get("problem_id")
            existing_by_id = self.get_problem(clean_problem_id(raw_id)) if raw_id else None
            matching = existing_by_id or self.find_matching_problem(p)
            
            res = self.add_problem(p)
            results.append(res)
            
            if matching:
                merged_ids.append(res["id"])
            else:
                created_ids.append(res["id"])
                
        return {
            "problems": results,
            "created_ids": created_ids,
            "merged_ids": merged_ids,
            "total_count": len(results),
            "new_created_count": len(created_ids),
            "merged_count": len(merged_ids),
        }

    def vote_problem(self, problem_id: str, vote_type: str = "up") -> Dict[str, Any]:
        delta = 1 if vote_type == "up" else -1
        with self._get_connection() as conn:
            conn.execute("UPDATE problems SET votes = max(0, coalesce(votes, 0) + ?) WHERE id = ?", (delta, problem_id))
        p = self.get_problem(problem_id)
        return p or {"id": problem_id, "votes": 0}


    def normalize_problem_ids(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Re-indexes all problem IDs into clean sequential codes: AGR-001, HLT-001, RET-001, etc."""
        sector_prefixes = {
            "Agriculture & Fisheries": "AGR",
            "Health & Wellness": "HLT",
            "MSMEs & Retail": "RET",
            "Education & Youth": "EDU",
            "Transport & Logistics": "LOG",
            "Housing & Utilities": "UTL",
            "Government Services & Compliance": "GOV",
            "Finance & Credit": "FIN",
        }
        
        with self._get_connection() as conn:
            conn.execute("PRAGMA foreign_keys = OFF;")
            query = "SELECT * FROM problems"
            params = []
            if project_id:
                query += " WHERE project_id = ?"
                params.append(project_id)
            query += " ORDER BY sector ASC, score DESC, votes DESC, id ASC"
            
            rows = [dict(r) for r in conn.execute(query, params).fetchall()]
            
            sector_counters: Dict[str, int] = {}
            id_mapping: Dict[str, str] = {}
            
            # Temporary prefix to avoid unique constraint collisions during rename
            temp_prefix = f"TEMP_{uuid.uuid4().hex[:4]}_"
            for r in rows:
                conn.execute("UPDATE problems SET id = ? WHERE id = ?", (temp_prefix + r["id"], r["id"]))
                conn.execute("UPDATE problem_sources SET problem_id = ? WHERE problem_id = ?", (temp_prefix + r["id"], r["id"]))
                conn.execute("UPDATE problem_comments SET problem_id = ? WHERE problem_id = ?", (temp_prefix + r["id"], r["id"]))
                conn.execute("UPDATE problem_phase_history SET problem_id = ? WHERE problem_id = ?", (temp_prefix + r["id"], r["id"]))
            
            # Now assign clean permanent sequential IDs
            for r in rows:
                old_id = r["id"]
                temp_id = temp_prefix + old_id
                sec = r["sector"]
                prefix = sector_prefixes.get(sec, "PRB")
                count = sector_counters.get(sec, 0) + 1
                sector_counters[sec] = count
                new_id = f"{prefix}-{count:03d}"
                id_mapping[old_id] = new_id
                
                conn.execute("UPDATE problems SET id = ? WHERE id = ?", (new_id, temp_id))
                conn.execute("UPDATE problem_sources SET problem_id = ? WHERE problem_id = ?", (new_id, temp_id))
                conn.execute("UPDATE problem_comments SET problem_id = ? WHERE problem_id = ?", (new_id, temp_id))
                conn.execute("UPDATE problem_phase_history SET problem_id = ? WHERE problem_id = ?", (new_id, temp_id))
            
            conn.commit()
            
        return self.list_problems(project_id=project_id)

    def merge_problems(self, primary_id: str, duplicate_ids: List[str]) -> Optional[Dict[str, Any]]:
        """Merges multiple duplicate problems into a primary problem record."""
        clean_primary = clean_problem_id(primary_id)
        clean_dups = [clean_problem_id(d) for d in duplicate_ids if clean_problem_id(d) != clean_primary]
        
        if not clean_dups:
            return self.get_problem(clean_primary)
            
        primary = self.get_problem(clean_primary)
        if not primary:
            return None
            
        total_votes = primary.get("votes", 0)
        combined_sources = list(primary.get("sources", []))
        existing_urls = {s.get("source_url") for s in combined_sources if s.get("source_url")}
        
        with self._get_connection() as conn:
            for dup_id in clean_dups:
                dup = self.get_problem(dup_id)
                if not dup:
                    continue
                total_votes += dup.get("votes", 0)
                
                # Merge sources
                for s in dup.get("sources", []):
                    url = s.get("source_url")
                    if not url or url not in existing_urls:
                        combined_sources.append(s)
                        if url:
                            existing_urls.add(url)
                        conn.execute("""
                            INSERT INTO problem_sources (problem_id, source_name, source_type, source_url, notes, tier)
                            VALUES (?, ?, ?, ?, ?, ?)
                        """, (clean_primary, s.get("source_name", "Cited Source"), s.get("source_type", "FIELD_NOTE"), s.get("source_url", ""), s.get("notes", ""), s.get("tier", "SIGNAL")))
                
                # Move comments
                conn.execute("UPDATE problem_comments SET problem_id = ? WHERE problem_id = ?", (clean_primary, dup_id))
                
                # Delete duplicate record
                conn.execute("DELETE FROM problems WHERE id = ?", (dup_id,))
                conn.execute("DELETE FROM problem_sources WHERE problem_id = ?", (dup_id,))
            
            # Update primary votes and updated_at
            now = datetime.now(timezone.utc).isoformat()
            conn.execute("UPDATE problems SET votes = ?, updated_at = ? WHERE id = ?", (total_votes, now, clean_primary))
            conn.commit()
            
        return self.get_problem(clean_primary)

    def bulk_delete_problems(self, problem_ids: List[str]) -> int:
        """Bulk deletes problems and their associated sources."""
        clean_ids = [clean_problem_id(pid) for pid in problem_ids]
        if not clean_ids:
            return 0
            
        with self._get_connection() as conn:
            placeholders = ",".join("?" for _ in clean_ids)
            cur = conn.execute(f"DELETE FROM problems WHERE id IN ({placeholders})", clean_ids)
            conn.execute(f"DELETE FROM problem_sources WHERE problem_id IN ({placeholders})", clean_ids)
            conn.commit()
            return cur.rowcount


    def find_duplicates(self, project_id: Optional[str] = None, threshold: float = 0.5) -> List[Dict[str, Any]]:
        """Detects pairs of duplicate or highly overlapping problem records."""
        problems = self.list_problems(project_id=project_id)
        
        def tokenize(text: str) -> set:
            if not text:
                return set()
            words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
            stops = {"and", "the", "for", "with", "due", "causes", "lack", "from", "into", "their", "that", "this", "during", "requiring", "leads", "across", "severe"}
            return {w for w in words if w not in stops}

        pairs = []
        for i in range(len(problems)):
            for j in range(i + 1, len(problems)):
                p1 = problems[i]
                p2 = problems[j]
                
                # Check exact statement match
                exact = p1.get("problem_statement", "").strip().lower() == p2.get("problem_statement", "").strip().lower()
                
                t1 = tokenize(p1.get("problem_statement", "") + " " + (p1.get("sufferer_occupation") or ""))
                t2 = tokenize(p2.get("problem_statement", "") + " " + (p2.get("sufferer_occupation") or ""))
                
                if exact:
                    sim = 1.0
                elif not t1 or not t2:
                    sim = 0.0
                else:
                    inter = len(t1.intersection(t2))
                    union = len(t1.union(t2))
                    sim = inter / union if union > 0 else 0.0
                    if p1.get("sector") == p2.get("sector"):
                        sim += 0.15
                        
                sim = min(round(sim, 2), 1.0)
                
                if sim >= threshold or exact:
                    # Choose primary (higher score or more votes)
                    p1_score = (p1.get("score") or 0) + (p1.get("votes") or 0) * 10
                    p2_score = (p2.get("score") or 0) + (p2.get("votes") or 0) * 10
                    primary = p1 if p1_score >= p2_score else p2
                    duplicate = p2 if primary == p1 else p1
                    
                    pairs.append({
                        "primary_id": primary["id"],
                        "duplicate_id": duplicate["id"],
                        "primary_statement": primary["problem_statement"],
                        "duplicate_statement": duplicate["problem_statement"],
                        "sector": primary["sector"],
                        "similarity_score": int(sim * 100),
                        "is_exact_match": exact or sim >= 0.90
                    })
                    
        return pairs

    def auto_merge_exact_duplicates(self, project_id: Optional[str] = None) -> int:
        """Automatically merges all 90%+ and 100% exact duplicate problem records."""
        dups = self.find_duplicates(project_id=project_id, threshold=0.85)
        merged_count = 0
        seen_deleted = set()
        
        for d in dups:
            dup_id = d["duplicate_id"]
            primary_id = d["primary_id"]
            if dup_id in seen_deleted or primary_id in seen_deleted:
                continue
            self.merge_problems(primary_id, [dup_id])
            seen_deleted.add(dup_id)
            merged_count += 1
            
        return merged_count

    # ------------------------------------------------------------------------
    # Relational Knowledge Graph Methods (Step 1 Foundation)
    # ------------------------------------------------------------------------

    def get_problem_knowledge_graph(self, problem_id: str) -> Dict[str, Any]:
        """Retrieve complete relational knowledge graph for a problem."""
        problem = self.get_problem(problem_id)
        if not problem:
            return {}

        with self._get_connection() as conn:
            claims = [
                dict(r) for r in conn.execute(
                    "SELECT * FROM problem_claims WHERE problem_id = ? ORDER BY created_at ASC", (problem_id,)
                ).fetchall()
            ]
            assumptions = [
                dict(r) for r in conn.execute(
                    "SELECT * FROM problem_assumptions WHERE problem_id = ? ORDER BY CASE risk_level WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, created_at ASC", (problem_id,)
                ).fetchall()
            ]
            alternatives = [
                dict(r) for r in conn.execute(
                    "SELECT * FROM problem_alternatives WHERE problem_id = ? ORDER BY created_at ASC", (problem_id,)
                ).fetchall()
            ]

        return {
            "problem": problem,
            "claims": claims,
            "assumptions": assumptions,
            "alternatives": alternatives,
            "sources": problem.get("sources", []),
        }

    def set_problem_claims(self, problem_id: str, claims: List[Dict[str, Any]]):
        """Save or replace claims for a problem."""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM problem_claims WHERE problem_id = ?", (problem_id,))
            for idx, c in enumerate(claims, 1):
                cid = c.get("id") or f"CLM-{problem_id}-{idx}"
                conn.execute(
                    """INSERT INTO problem_claims (id, problem_id, claim_type, claim_text, status, confidence_score, mode, evidence_notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        cid,
                        problem_id,
                        c.get("claim_type", "FRICTION_REALITY"),
                        c.get("claim_text", ""),
                        c.get("status", "HYPOTHESIS"),
                        c.get("confidence_score", 50.0),
                        c.get("mode", "COMMERCIAL"),
                        c.get("evidence_notes", ""),
                    )
                )

    def set_problem_assumptions(self, problem_id: str, assumptions: List[Dict[str, Any]]):
        """Save or replace assumptions for a problem."""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM problem_assumptions WHERE problem_id = ?", (problem_id,))
            for idx, a in enumerate(assumptions, 1):
                aid = a.get("id") or f"ASM-{problem_id}-{idx}"
                conn.execute(
                    """INSERT INTO problem_assumptions (id, problem_id, assumption_text, risk_level, status, origin, testable_question)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (
                        aid,
                        problem_id,
                        a.get("assumption_text", ""),
                        a.get("risk_level", "HIGH"),
                        a.get("status", "UNTESTED"),
                        a.get("origin", "DEVILS_ADVOCATE"),
                        a.get("testable_question", ""),
                    )
                )

    def set_problem_alternatives(self, problem_id: str, alternatives: List[Dict[str, Any]]):
        """Save or replace alternatives for a problem."""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM problem_alternatives WHERE problem_id = ?", (problem_id,))
            for idx, alt in enumerate(alternatives, 1):
                alt_id = alt.get("id") or f"ALT-{problem_id}-{idx}"
                conn.execute(
                    """INSERT INTO problem_alternatives (id, problem_id, alternative_name, category, why_it_fails)
                       VALUES (?, ?, ?, ?, ?)""",
                    (
                        alt_id,
                        problem_id,
                        alt.get("alternative_name", ""),
                        alt.get("category", "MANUAL_WORKAROUND"),
                        alt.get("why_it_fails", ""),
                    )
                )

    def update_claim_status(self, claim_id: str, status: str, confidence_score: Optional[float] = None, evidence_notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Update claim validation status and confidence."""
        with self._get_connection() as conn:
            set_clauses = ["status = ?"]
            params = [status]
            if confidence_score is not None:
                set_clauses.append("confidence_score = ?")
                params.append(confidence_score)
            if evidence_notes is not None:
                set_clauses.append("evidence_notes = ?")
                params.append(evidence_notes)
            params.append(claim_id)

            conn.execute(f"UPDATE problem_claims SET {', '.join(set_clauses)} WHERE id = ?", params)
            row = conn.execute("SELECT * FROM problem_claims WHERE id = ?", (claim_id,)).fetchone()
            return dict(row) if row else None

    def update_assumption_status(self, assumption_id: str, status: str) -> Optional[Dict[str, Any]]:
        """Update assumption test status."""
        with self._get_connection() as conn:
            conn.execute("UPDATE problem_assumptions SET status = ? WHERE id = ?", (status, assumption_id))
            row = conn.execute("SELECT * FROM problem_assumptions WHERE id = ?", (assumption_id,)).fetchone()
            return dict(row) if row else None

    # ------------------------------------------------------------------------
    # Decision Intelligence & Audit Trail (Step 2 Foundation)
    # ------------------------------------------------------------------------

    def create_decision_record(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an immutable decision audit record."""
        import uuid
        did = data.get("id") or f"DEC-{str(uuid.uuid4())[:8].upper()}"
        rejected = data.get("rejected_problem_ids", [])
        if not isinstance(rejected, str):
            rejected = json.dumps(rejected)

        evidence = data.get("supporting_evidence_ids", [])
        if not isinstance(evidence, str):
            evidence = json.dumps(evidence)

        with self._get_connection() as conn:
            conn.execute(
                """INSERT INTO decision_records 
                   (id, session_id, stage, selected_problem_id, rejected_problem_ids, decision_rationale, supporting_evidence_ids)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    did,
                    data.get("session_id"),
                    data.get("stage", "PHASE_2_SELECTION"),
                    data.get("selected_problem_id", ""),
                    rejected,
                    data.get("decision_rationale", ""),
                    evidence,
                )
            )
            row = conn.execute("SELECT * FROM decision_records WHERE id = ?", (did,)).fetchone()
            return dict(row) if row else {}

    def list_decision_records(self, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List chronological decision records for a session or global workspace."""
        with self._get_connection() as conn:
            query = "SELECT * FROM decision_records"
            params = []
            if session_id:
                query += " WHERE session_id = ? OR session_id IS NULL"
                params.append(session_id)
            query += " ORDER BY created_at DESC"
            rows = conn.execute(query, params).fetchall()
            results = []
            for r in rows:
                item = dict(r)
                if isinstance(item.get("rejected_problem_ids"), str):
                    try:
                        item["rejected_problem_ids"] = json.loads(item["rejected_problem_ids"])
                    except Exception:
                        pass
                if isinstance(item.get("supporting_evidence_ids"), str):
                    try:
                        item["supporting_evidence_ids"] = json.loads(item["supporting_evidence_ids"])
                    except Exception:
                        pass
                results.append(item)
            return results


    def switch_session_framework(self, session_id: str, framework_id: str) -> Optional[Dict[str, Any]]:
        """Switch the active framework methodology for a session while preserving all knowledge entities."""
        session_data = self.get_session(session_id)
        if not session_data:
            return None
        session_data["framework_id"] = framework_id.upper()
        return self.save_session(session_id, session_data)

    # Phase 6: Knowledge Intelligence & Epistemic Link Storage Methods
    # ------------------------------------------------------------------

    def link_claim_evidence(
        self,
        claim_id: str,
        source_id: int,
        relation_type: str = "SUPPORTS",
        evidence_strength: str = "STRONG",
        rationale: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Link a source to a claim as supporting, contradicting, or contextualizing."""
        link_id = f"link_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO claim_evidence_links (id, claim_id, source_id, relation_type, evidence_strength, rationale, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (link_id, claim_id, source_id, relation_type.upper(), evidence_strength.upper(), rationale, now),
            )
        return {
            "id": link_id,
            "claim_id": claim_id,
            "source_id": source_id,
            "relation_type": relation_type.upper(),
            "evidence_strength": evidence_strength.upper(),
            "rationale": rationale,
            "created_at": now,
        }

    def list_claim_evidence_links(
        self, claim_id: Optional[str] = None, problem_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List all epistemic links for a claim or across all claims of a problem."""
        with self._get_connection() as conn:
            if claim_id:
                rows = conn.execute(
                    """
                    SELECT l.*, s.source_name, s.source_url, s.source_tier, s.quote_or_summary
                    FROM claim_evidence_links l
                    LEFT JOIN problem_sources s ON l.source_id = s.id
                    WHERE l.claim_id = ?
                    ORDER BY l.created_at DESC
                    """,
                    (claim_id,),
                ).fetchall()
            elif problem_id:
                rows = conn.execute(
                    """
                    SELECT l.*, s.source_name, s.source_url, s.source_tier, s.quote_or_summary, c.claim_text, c.claim_type
                    FROM claim_evidence_links l
                    JOIN problem_claims c ON l.claim_id = c.id
                    LEFT JOIN problem_sources s ON l.source_id = s.id
                    WHERE c.problem_id = ?
                    ORDER BY l.created_at DESC
                    """,
                    (problem_id,),
                ).fetchall()
            else:
                rows = conn.execute("""
                    SELECT l.*, s.source_name, s.source_url, s.source_tier
                    FROM claim_evidence_links l
                    LEFT JOIN problem_sources s ON l.source_id = s.id
                    ORDER BY l.created_at DESC
                """).fetchall()
            return [dict(r) for r in rows]

    def delete_claim_evidence_link(self, link_id: str) -> bool:
        """Delete an epistemic link."""
        with self._get_connection() as conn:
            cur = conn.execute("DELETE FROM claim_evidence_links WHERE id = ?", (link_id,))
            return cur.rowcount > 0

    def record_assumption_test(
        self,
        assumption_id: str,
        test_type: str,
        target_metric: str,
        actual_result: Optional[str] = None,
        test_status: str = "PLANNED",
        conducted_by: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Record an empirical test experiment on an assumption."""
        test_id = f"test_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO assumption_validation_tests (
                    id, assumption_id, test_type, target_metric, actual_result, test_status, conducted_by, completed_at, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    test_id,
                    assumption_id,
                    test_type.upper(),
                    target_metric,
                    actual_result,
                    test_status.upper(),
                    conducted_by,
                    now if test_status.upper() in ["PASSED", "FAILED"] else None,
                    now,
                ),
            )
            # If test is PASSED or FAILED, update the assumption status directly
            if test_status.upper() == "PASSED":
                conn.execute(
                    "UPDATE problem_assumptions SET status = 'VALIDATED' WHERE id = ?",
                    (assumption_id,),
                )
            elif test_status.upper() == "FAILED":
                conn.execute(
                    "UPDATE problem_assumptions SET status = 'FALSIFIED', risk_level = 'CRITICAL' WHERE id = ?",
                    (assumption_id,),
                )
            elif test_status.upper() == "IN_PROGRESS":
                conn.execute(
                    "UPDATE problem_assumptions SET status = 'IN_TESTING' WHERE id = ?",
                    (assumption_id,),
                )

        return {
            "id": test_id,
            "assumption_id": assumption_id,
            "test_type": test_type.upper(),
            "target_metric": target_metric,
            "actual_result": actual_result,
            "test_status": test_status.upper(),
            "conducted_by": conducted_by,
            "created_at": now,
        }

    def list_assumption_tests(self, assumption_id: str) -> List[Dict[str, Any]]:
        """List validation experiments for an assumption."""
        with self._get_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM assumption_validation_tests WHERE assumption_id = ? ORDER BY created_at DESC",
                (assumption_id,),
            ).fetchall()
            return [dict(r) for r in rows]

    def record_impact_event(
        self,
        trigger_entity_type: str,
        trigger_entity_id: str,
        trigger_action: str,
        affected_entities: List[Dict[str, Any]],
        project_id: Optional[str] = None,
        session_id: Optional[str] = None,
        severity: str = "WARNING",
    ) -> Dict[str, Any]:
        """Log an impact propagation invalidation event."""
        event_id = f"evt_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        affected_json = json.dumps(affected_entities, ensure_ascii=False)
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO impact_invalidation_events (
                    id, project_id, session_id, trigger_entity_type, trigger_entity_id, trigger_action, severity, affected_entities, resolution_status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE_ALERT', ?)
                """,
                (
                    event_id,
                    project_id,
                    session_id,
                    trigger_entity_type.upper(),
                    trigger_entity_id,
                    trigger_action.upper(),
                    severity.upper(),
                    affected_json,
                    now,
                ),
            )
        return {
            "id": event_id,
            "project_id": project_id,
            "session_id": session_id,
            "trigger_entity_type": trigger_entity_type.upper(),
            "trigger_entity_id": trigger_entity_id,
            "trigger_action": trigger_action.upper(),
            "severity": severity.upper(),
            "affected_entities": affected_entities,
            "resolution_status": "ACTIVE_ALERT",
            "created_at": now,
        }

    def list_active_impact_alerts(
        self, project_id: Optional[str] = None, session_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List active invalidation alerts for a session or project."""
        with self._get_connection() as conn:
            query = "SELECT * FROM impact_invalidation_events WHERE resolution_status = 'ACTIVE_ALERT'"
            params = []
            if project_id:
                query += " AND (project_id = ? OR project_id IS NULL)"
                params.append(project_id)
            if session_id:
                query += " AND (session_id = ? OR session_id IS NULL)"
                params.append(session_id)
            query += " ORDER BY created_at DESC"
            rows = conn.execute(query, params).fetchall()
            results = []
            for r in rows:
                item = dict(r)
                if isinstance(item.get("affected_entities"), str):
                    try:
                        item["affected_entities"] = json.loads(item["affected_entities"])
                    except Exception:
                        pass
                results.append(item)
            return results

    def resolve_impact_event(
        self, event_id: str, resolution_status: str = "RESOLVED_BY_PIVOT"
    ) -> bool:
        """Acknowledge or resolve an impact invalidation alert."""
        with self._get_connection() as conn:
            cur = conn.execute(
                "UPDATE impact_invalidation_events SET resolution_status = ? WHERE id = ?",
                (resolution_status.upper(), event_id),
            )
            return cur.rowcount > 0
