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
