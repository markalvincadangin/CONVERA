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
    def update_problem(self, problem_id: str, updates: Dict[str, Any], cascade_confirmed: bool = False) -> Optional[Dict[str, Any]]:
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
    def add_problem_source(self, problem_id: str, source: Dict[str, Any]) -> Dict[str, Any]:
        """Attach a single evidence source to a problem and return the created record."""
        pass

    @abstractmethod
    def get_problem_sources_with_links(self, problem_id: str) -> List[Dict[str, Any]]:
        """Retrieve all sources for a problem with joined scholarly metadata and claim links."""
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

    # ------------------------------------------------------------------
    # Scholarly Evidence Persistence & FTS5 Retrieval (SDD-006)
    # ------------------------------------------------------------------

    @abstractmethod
    def upsert_scholarly_works(self, works: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Idempotently persist normalized scholarly works into relational storage."""
        pass

    @abstractmethod
    def search_scholarly_works_fts(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search persisted scholarly works using native SQLite FTS5 BM25 ranking."""
        pass

    @abstractmethod
    def get_scholarly_work(self, work_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a persisted scholarly work by its canonical ID."""
        pass

    @abstractmethod
    def rebuild_scholarly_fts(self) -> bool:
        """Rebuild the FTS5 virtual table index from relational storage."""
        pass

    # ------------------------------------------------------------------
    # Identity, Progressive Auth, Workspaces & Integrations (SDD-012)
    # ------------------------------------------------------------------

    # Users
    @abstractmethod
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new registered user account."""
        pass

    @abstractmethod
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve user profile by user_id."""
        pass

    @abstractmethod
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Retrieve user profile by email address."""
        pass

    @abstractmethod
    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user display name, avatar, or preferences."""
        pass

    @abstractmethod
    def update_user_last_login(self, user_id: str) -> bool:
        """Stamp last login timestamp on user account."""
        pass

    # Refresh Tokens
    @abstractmethod
    def store_refresh_token(self, token_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store a hashed rotating refresh token."""
        pass

    @abstractmethod
    def get_refresh_token(self, token_hash: str) -> Optional[Dict[str, Any]]:
        """Retrieve refresh token record by token_hash."""
        pass

    @abstractmethod
    def revoke_refresh_token(self, token_id: str) -> bool:
        """Mark a specific refresh token as revoked."""
        pass

    @abstractmethod
    def revoke_all_user_refresh_tokens(self, user_id: str) -> int:
        """Revoke all refresh tokens for a user (logout all sessions)."""
        pass

    # Workspace Memberships & Invites
    @abstractmethod
    def create_workspace_membership(self, membership_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add or bind a user to a workspace with a role."""
        pass

    @abstractmethod
    def get_workspace_membership(self, workspace_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get membership record for a specific user in a workspace."""
        pass

    @abstractmethod
    def list_workspace_memberships(self, workspace_id: str) -> List[Dict[str, Any]]:
        """List all members and their roles for a given workspace."""
        pass

    @abstractmethod
    def list_user_workspaces(self, user_id: str) -> List[Dict[str, Any]]:
        """List all workspaces a user belongs to."""
        pass

    @abstractmethod
    def update_workspace_membership_role(self, membership_id: str, new_role: str) -> Optional[Dict[str, Any]]:
        """Change a member's role in a workspace."""
        pass

    @abstractmethod
    def delete_workspace_membership(self, membership_id: str) -> bool:
        """Remove a member from a workspace."""
        pass

    @abstractmethod
    def create_workspace_invite(self, invite_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a cryptographic invite token."""
        pass

    @abstractmethod
    def get_workspace_invite(self, token: str) -> Optional[Dict[str, Any]]:
        """Retrieve an invite token record."""
        pass

    @abstractmethod
    def redeem_workspace_invite(self, token: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Redeem an invite token and grant membership."""
        pass

    @abstractmethod
    def revoke_workspace_invite(self, invite_id: str) -> bool:
        """Revoke an active invite token."""
        pass

    @abstractmethod
    def list_workspace_invites(self, workspace_id: str) -> List[Dict[str, Any]]:
        """List pending invites for a workspace."""
        pass

    # AI Provider Registry
    @abstractmethod
    def upsert_ai_provider(self, provider_data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert or update an AI provider configuration."""
        pass

    @abstractmethod
    def get_ai_provider(self, provider_id: str, workspace_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieve an AI provider configuration."""
        pass

    @abstractmethod
    def list_ai_providers(self, workspace_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all AI providers ordered by cascade priority."""
        pass

    @abstractmethod
    def delete_ai_provider(self, provider_id: str, workspace_id: Optional[str] = None) -> bool:
        """Delete an AI provider configuration."""
        pass

    # Integrations & Sync Log
    @abstractmethod
    def upsert_integration(self, integration_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register or update an external tool integration."""
        pass

    @abstractmethod
    def get_integration(self, integration_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve integration configuration."""
        pass

    @abstractmethod
    def list_integrations(self, workspace_id: str) -> List[Dict[str, Any]]:
        """List integrations for a workspace."""
        pass

    @abstractmethod
    def delete_integration(self, integration_id: str) -> bool:
        """Remove an integration configuration."""
        pass

    @abstractmethod
    def log_sync_event(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """Record an ingestion or synchronization audit event."""
        pass

    @abstractmethod
    def list_sync_logs(self, integration_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """List synchronization history for an integration."""
        pass

    # ------------------------------------------------------------------
    # Research Orchestrator Events (SDD-013)
    # ------------------------------------------------------------------

    @abstractmethod
    def record_orchestration_event(self, event_data: Dict[str, Any]) -> str:
        """Record an auditable orchestration event."""
        pass

    @abstractmethod
    def get_orchestration_events(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent orchestration events for a research session."""
        pass

    # ------------------------------------------------------------------
    # DSR Artifacts & Ideation (SDD-016)
    # ------------------------------------------------------------------

    @abstractmethod
    def create_dsr_artifact(self, artifact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a candidate DSR artifact (Construct, Model, Method, Instantiation)."""
        pass

    @abstractmethod
    def get_dsr_artifact(self, artifact_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific DSR artifact by ID."""
        pass

    @abstractmethod
    def list_dsr_artifacts(self, problem_id: str, dsr_class: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all DSR artifacts for a problem, optionally filtered by class."""
        pass

    @abstractmethod
    def update_dsr_artifact(self, artifact_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update fields or lifecycle status of a DSR artifact."""
        pass

    @abstractmethod
    def delete_dsr_artifact(self, artifact_id: str) -> bool:
        """Delete a DSR artifact by ID."""
        pass

    # ------------------------------------------------------------------
    # Concept Evaluation Framework (SDD-017)
    # ------------------------------------------------------------------

    @abstractmethod
    def save_concept_evaluation(self, evaluation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a concept evaluation record (deterministic, AI critic, or human review)."""
        pass

    @abstractmethod
    def get_concept_evaluation(self, evaluation_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific concept evaluation record by ID."""
        pass

    @abstractmethod
    def list_concept_evaluations(self, concept_id: Optional[str] = None, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List concept evaluations filtered by concept_id and/or session_id."""
        pass

    # ------------------------------------------------------------------
    # Research Stage F Feasibility & Proposal Canvas (SDD-018)
    # ------------------------------------------------------------------

    @abstractmethod
    def save_feasibility_record(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Save or update a research feasibility & compliance record."""
        pass

    @abstractmethod
    def get_feasibility_record(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve the research feasibility record for a given session."""
        pass

    @abstractmethod
    def list_feasibility_records(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List research feasibility records, optionally filtered by project_id."""
        pass



