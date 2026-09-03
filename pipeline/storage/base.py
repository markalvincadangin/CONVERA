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
