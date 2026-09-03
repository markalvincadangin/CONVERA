"""
CONVERA Routers Subsystem
=========================
Exports all domain-specific routers for FastAPI application mounting.
"""

from .connectors import router as connectors_router
from .inbox import router as inbox_router
from .agents import router as agents_router
from .frameworks import router as frameworks_router
from .problems import router as problems_router, research_router
from .sessions import router as sessions_router
from .pipeline import router as pipeline_router
from .knowledge import router as knowledge_router
from .decisions import router as decisions_router
from .traceability import router as traceability_router

__all__ = [
    "connectors_router",
    "inbox_router",
    "agents_router",
    "frameworks_router",
    "problems_router",
    "research_router",
    "sessions_router",
    "pipeline_router",
    "knowledge_router",
    "decisions_router",
    "traceability_router",
]
