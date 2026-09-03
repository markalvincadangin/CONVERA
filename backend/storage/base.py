from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class BaseStorageAdapter(ABC):
    """Abstract base class for RatchetAI persistence storage adapters."""

    @abstractmethod
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a session by its session_id."""
        pass

    @abstractmethod
    def save_session(self, session_id: str, state: Dict[str, Any]) -> Dict[str, Any]:
        """Insert or update a session state."""
        pass

    @abstractmethod
    def list_sessions(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List metadata for all active sessions."""
        pass

    @abstractmethod
    def rename_session(self, session_id: str, new_name: str) -> Optional[Dict[str, Any]]:
        """Rename a session's project name."""
        pass

    @abstractmethod
    def delete_session(self, session_id: str) -> bool:
        """Delete a session by its session_id."""
        pass

    @abstractmethod
    def create_snapshot(self, session_id: str, label: str, phase_number: int) -> Dict[str, Any]:
        """Save a frozen snapshot of the session state for rollback/forking."""
        pass

    @abstractmethod
    def list_snapshots(self, session_id: str) -> List[Dict[str, Any]]:
        """List all snapshots for a given session."""
        pass

    @abstractmethod
    def restore_snapshot(self, session_id: str, snapshot_id: int) -> Optional[Dict[str, Any]]:
        """Restore a session to the state captured in a snapshot."""
        pass

    @abstractmethod
    def get_project_by_code(self, share_code: str) -> Optional[Dict[str, Any]]:
        """Find a project workspace by its human-friendly share code."""
        pass

    # ------------------------------------------------------------------
    # Problem Bank Storage Operations
    # ------------------------------------------------------------------

    @abstractmethod
    def add_problem(self, problem_data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert or update a problem record in the problem bank."""
        pass

    @abstractmethod
    def get_problem(self, problem_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a problem record with its sources and phase history."""
        pass

    @abstractmethod
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
        """List and filter problem bank records."""
        pass

    @abstractmethod
    def update_problem(self, problem_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update problem fields, notes, tags, or status."""
        pass

    @abstractmethod
    def delete_problem(self, problem_id: str) -> bool:
        """Delete or archive a problem."""
        pass

    @abstractmethod
    def add_problem_sources(self, problem_id: str, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Attach evidence sources to a problem."""
        pass

    @abstractmethod
    def record_problem_history(
        self,
        problem_id: str,
        phase_number: int,
        action: str,
        verdict: Optional[str] = None,
        llm_response: Optional[str] = None,
        model_used: Optional[str] = None
    ) -> Dict[str, Any]:
        """Record an audit trail event for a problem across phases."""
        pass

    @abstractmethod
    def bulk_upsert_problems(self, problems: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Batch insert or update multiple problem records."""
        pass

    @abstractmethod
    def vote_problem(self, problem_id: str, vote_type: str = "up") -> Dict[str, Any]:
        """Record an upvote, downvote, or priority dot on a problem."""
        pass

    # ------------------------------------------------------------------
    # Team Members, Roles, Passcodes & Comments (Option A)
    # ------------------------------------------------------------------

    @abstractmethod
    def verify_project_passcode(self, project_id: str, passcode: str) -> bool:
        """Verify if the entered passcode matches the project passcode."""
        pass

    @abstractmethod
    def set_project_passcode(self, project_id: str, passcode: Optional[str]) -> bool:
        """Set or update a 4-digit PIN/passcode for a project room."""
        pass

    @abstractmethod
    def list_project_members(self, project_id: str) -> List[Dict[str, Any]]:
        """List all team members registered in a project workspace."""
        pass

    @abstractmethod
    def upsert_project_member(self, project_id: str, member_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add or update a team member profile in a project."""
        pass

    @abstractmethod
    def add_problem_comment(self, problem_id: str, comment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a discussion or mentor review comment to a problem."""
        pass

    @abstractmethod
    def list_problem_comments(self, problem_id: str) -> List[Dict[str, Any]]:
        """List all threaded comments on a problem."""
        pass

    @abstractmethod
    def record_mentor_signoff(self, project_id: str, phase_number: int, mentor_name: str, notes: str) -> Dict[str, Any]:
        """Record an official mentor/professor sign-off on a phase gate."""
        pass

    @abstractmethod
    def list_mentor_signoffs(self, project_id: str) -> List[Dict[str, Any]]:
        """List all mentor approvals/sign-offs for a project."""
        pass

    # -----------------------------------------------------------------------
    # Provenance, Contradictions, Unknowns, and Traceability
    # -----------------------------------------------------------------------
    @abstractmethod
    def record_provenance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Record first-class provenance metadata for a source or claim."""
        pass

    @abstractmethod
    def get_provenance(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Get provenance record by source_id."""
        pass

    @abstractmethod
    def record_contradiction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Record a contested contradiction relationship between two evidence items."""
        pass

    @abstractmethod
    def list_assumptions(self, problem_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List problem assumptions."""
        pass

    @abstractmethod
    def list_contradictions(self, claim_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List contradiction records."""
        pass

    @abstractmethod
    def add_unknown(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Add an item to the Unknowns Map (WHAT_WE_KNOW, WHAT_WE_THINK, WHAT_WE_DONT_KNOW)."""
        pass

    @abstractmethod
    def list_unknowns(self, project_id: Optional[str] = None, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List items in the Unknowns Map."""
        pass

    @abstractmethod
    def add_traceability_link(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Record a full lineage traceability link from Problem to Requirement."""
        pass

    @abstractmethod
    def get_traceability_lineage(self, requirement_id: Optional[str] = None, problem_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve end-to-end traceability lineage chain."""
        pass
    @abstractmethod
    def record_gate_review(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Record a formal Gate review evaluation and sign-off."""
        pass

    @abstractmethod
    def get_gate_review(self, project_id: str, gate_id: str) -> Optional[Dict[str, Any]]:
        """Get gate review by project_id and gate_id."""
        pass

    @abstractmethod
    def list_gate_reviews(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all recorded gate reviews for a project."""
        pass
    @abstractmethod
    def record_circumscription_iteration(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Record a DSR evaluation circumscription iteration."""
        pass

    @abstractmethod
    def list_circumscription_iterations(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all recorded circumscription iterations."""
        pass
