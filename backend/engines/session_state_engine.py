"""
CONVERA Research Session State Engine (SDD-021)
================================================
Deterministic canonical state serialization, SHA-256 cryptographic hashing,
milestone checkpointing, state rollback, and session cloning.
"""

import json
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from storage.factory import get_storage


class SessionStateEngine:
    """
    Core engine managing research session lifecycle, checkpointing with SHA-256
    provenance, state rollback, and deep-cloning under Phase D2.
    """

    STAGE_LOOKUP = {
        "scouting": ("Phase A: Scouting & Discovery", 0),
        "contextualization": ("Phase B: Contextualization & Validation", 1),
        "matrix": ("Phase C: Opportunity & Literature Matrix", 2),
        "artifact_design": ("Phase D: Artifact Design & Kernel Theory", 3),
        "evaluation": ("Phase E: Trapping & Evaluation Design", 4),
        "feasibility": ("Phase F: Relevance & Feasibility Synthesis", 5),
    }

    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    @staticmethod
    def serialize_canonical_state(state: Dict[str, Any]) -> str:
        """
        Deterministically serializes state dictionary with sorted keys and
        stable separators to guarantee identical SHA-256 digests.
        """
        return json.dumps(state, sort_keys=True, separators=(",", ":"), default=str)

    @staticmethod
    def compute_state_hash(state: Dict[str, Any]) -> str:
        """Computes deterministic SHA-256 hash over serialized canonical state."""
        canonical_str = SessionStateEngine.serialize_canonical_state(state)
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    @staticmethod
    def verify_state_integrity(state_snapshot: str, expected_hash: str) -> bool:
        """Verifies if state snapshot string matches expected SHA-256 digest."""
        computed = hashlib.sha256(state_snapshot.encode("utf-8")).hexdigest()
        return computed == expected_hash

    def create_checkpoint(
        self,
        session_id: str,
        checkpoint_name: str,
        description: Optional[str] = None,
        created_by: str = "Researcher",
    ) -> Dict[str, Any]:
        """
        Captures full in-memory and relational session state into an immutable
        checkpoint with a deterministic SHA-256 provenance hash.
        """
        session = self.storage.get_session(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found.")

        # Extract active stage
        current_stage = (
            session.get("current_stage_id")
            or session.get("current_research_stage")
            or "scouting"
        )
        _, stage_index = self.STAGE_LOOKUP.get(current_stage, (current_stage, 0))

        # Bundle full state snapshot
        state_data = session.copy()
        state_snapshot = self.serialize_canonical_state(state_data)
        state_hash = hashlib.sha256(state_snapshot.encode("utf-8")).hexdigest()

        checkpoint_id = f"chk_{uuid.uuid4().hex[:12]}"
        rec = self.storage.create_research_session_checkpoint(
            checkpoint_id=checkpoint_id,
            session_id=session_id,
            checkpoint_name=checkpoint_name,
            stage_id=current_stage,
            stage_index=stage_index,
            state_snapshot=state_snapshot,
            state_hash=state_hash,
            description=description,
            created_by=created_by,
        )
        return rec

    def restore_checkpoint(
        self,
        session_id: str,
        checkpoint_id: str,
    ) -> Dict[str, Any]:
        """
        Restores a session to the state captured in a checkpoint after verifying
        cryptographic hash integrity.
        """
        checkpoint = self.storage.get_research_session_checkpoint(checkpoint_id)
        if not checkpoint:
            raise ValueError(f"Checkpoint '{checkpoint_id}' not found.")

        if checkpoint["session_id"] != session_id:
            raise ValueError(
                f"Checkpoint '{checkpoint_id}' belongs to session '{checkpoint['session_id']}', not '{session_id}'."
            )

        # Integrity check
        snapshot_str = checkpoint["state_snapshot"]
        expected_hash = checkpoint["state_hash"]
        if not self.verify_state_integrity(snapshot_str, expected_hash):
            raise ValueError(
                f"Checkpoint '{checkpoint_id}' state integrity verification failed! Hash mismatch."
            )

        # Restore state
        restored_state = json.loads(snapshot_str)
        self.storage.save_session(session_id, restored_state)

        # Sync fast-index columns
        stage_id = checkpoint["stage_id"]
        stage_index = checkpoint["stage_index"]
        stage_pct = restored_state.get("stage_completion_pct", (stage_index + 1) / 6.0 * 100.0)
        prob_id = restored_state.get("active_problem_id") or restored_state.get("problem_id")
        dom_id = restored_state.get("active_domain_id")

        self.storage.update_research_session_stage(
            session_id=session_id,
            stage_id=stage_id,
            stage_index=stage_index,
            stage_completion_pct=stage_pct,
            active_problem_id=prob_id,
            active_domain_id=dom_id,
        )

        return self.storage.get_session(session_id)

    def clone_session(
        self,
        source_session_id: str,
        new_project_name: str,
        include_literature: bool = True,
    ) -> Dict[str, Any]:
        """
        Performs a deep clone of a research session, re-keying all entities
        and optionally preserving literature grounding links.
        """
        source_session = self.storage.get_session(source_session_id)
        if not source_session:
            raise ValueError(f"Source session '{source_session_id}' not found.")

        new_session_id = f"sess_{uuid.uuid4().hex[:12]}"
        cloned_state = json.loads(json.dumps(source_session))
        cloned_state["session_id"] = new_session_id
        cloned_state["project_name"] = new_project_name
        now = datetime.now(timezone.utc).isoformat()
        cloned_state["created_at"] = now
        cloned_state["updated_at"] = now

        # Create new session record
        self.storage.save_session(new_session_id, cloned_state)

        # Copy associated problem if one exists
        source_prob_id = source_session.get("active_problem_id") or source_session.get("problem_id")
        new_prob_id = None
        if source_prob_id:
            problems = self.storage.list_problems(session_id=source_session_id)
            for p in problems:
                if p.get("id") == source_prob_id:
                    new_prob_id = f"prob_{uuid.uuid4().hex[:12]}"
                    new_prob_data = p.copy()
                    new_prob_data["id"] = new_prob_id
                    new_prob_data["session_id"] = new_session_id
                    new_prob_data["created_at"] = now
                    new_prob_data["updated_at"] = now
                    self.storage.add_problem(new_prob_data)
                    break

        # Sync stage metadata
        c_stage = source_session.get("current_research_stage") or "scouting"
        _, stage_idx = self.STAGE_LOOKUP.get(c_stage, (c_stage, 0))
        c_pct = float(source_session.get("stage_completion_pct") or 0.0)

        self.storage.update_research_session_stage(
            session_id=new_session_id,
            stage_id=c_stage,
            stage_index=stage_idx,
            stage_completion_pct=c_pct,
            active_problem_id=new_prob_id,
            active_domain_id=source_session.get("active_domain_id"),
        )

        return self.storage.get_session(new_session_id)

    def assemble_resume_payload(self, session_id: str) -> Dict[str, Any]:
        """
        Assembles a comprehensive, turnkey payload restoring full orchestrator
        evaluation, active problem, and checkpoint history for a session.
        """
        session = self.storage.get_session(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found.")

        # Checkpoints
        checkpoints = self.storage.list_research_session_checkpoints(session_id)

        # Active problem
        active_prob_id = (
            session.get("active_problem_id")
            or session.get("problem_id")
            or session.get("phase3_problem")
        )
        active_problem = None
        if active_prob_id:
            active_problem = self.storage.get_problem(active_prob_id)
            if not active_problem:
                problems = self.storage.list_problems(session_id=session_id)
                for p in problems:
                    if p.get("id") == active_prob_id:
                        active_problem = p
                        break

        # Recent events
        recent_events = self.storage.get_orchestration_events(session_id, limit=10)

        # Summary
        c_stage = (
            session.get("current_research_stage")
            or session.get("current_stage_id")
            or "scouting"
        )
        stage_name, stage_idx = self.STAGE_LOOKUP.get(c_stage, (f"Phase {c_stage.upper()}", 0))

        summary = {
            "session_id": session_id,
            "project_id": session.get("project_id"),
            "project_name": session.get("project_name") or "Research Initiative",
            "framework_id": session.get("active_framework_id") or "RESEARCH",
            "current_stage_id": c_stage,
            "current_stage_name": stage_name,
            "stage_index": stage_idx,
            "stage_completion_pct": float(session.get("stage_completion_pct") or 0.0),
            "active_problem_id": active_prob_id,
            "active_problem_title": active_problem.get("problem_statement") if active_problem else None,
            "active_domain_id": session.get("active_domain_id"),
            "checkpoint_count": len(checkpoints),
            "gate1_cleared": bool(session.get("phase1_complete")),
            "gate2_cleared": bool(session.get("phase2_complete")),
            "gate3_cleared": bool(session.get("phase3_complete")),
            "gate4_cleared": bool(session.get("phase4_complete")),
            "created_at": session.get("created_at", datetime.now(timezone.utc).isoformat()),
            "updated_at": session.get("updated_at", datetime.now(timezone.utc).isoformat()),
        }

        return {
            "session": session,
            "summary": summary,
            "checkpoints": checkpoints,
            "active_problem": active_problem,
            "recent_events": recent_events,
            "orchestration_status": None,
        }
