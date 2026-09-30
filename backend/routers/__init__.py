"""
CONVERA Routers Subsystem
=========================
Exports all domain-specific routers for FastAPI application mounting.
"""

from .connectors import router as connectors_router
from .inbox import router as inbox_router
from .agents import router as agents_router
from .frameworks import router as frameworks_router
from .methodologies import router as methodologies_router
from .problems import router as problems_router
from .research import router as research_router
from .sessions import router as sessions_router
from .pipeline import router as pipeline_router
from .knowledge import router as knowledge_router
from .decisions import router as decisions_router
from .traceability import router as traceability_router
from .evaluation import router as evaluation_router
from .gates import router as gates_router
from .export import router as export_router
from .auth import router as auth_router
from .workspaces import router as workspaces_router
from .settings import router as settings_router
from .integrations import router as integrations_router
from .orchestrator import router as orchestrator_router
from .ideation import router as ideation_router
from .evaluations import router as concept_evaluation_router

__all__ = [
    "auth_router",
    "workspaces_router",
    "settings_router",
    "integrations_router",
    "connectors_router",
    "inbox_router",
    "agents_router",
    "frameworks_router",
    "methodologies_router",
    "problems_router",
    "research_router",
    "sessions_router",
    "pipeline_router",
    "knowledge_router",
    "decisions_router",
    "traceability_router",
    "evaluation_router",
    "gates_router",
    "export_router",
    "orchestrator_router",
    "ideation_router",
    "concept_evaluation_router",
]
