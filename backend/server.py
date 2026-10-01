from __future__ import annotations

"""
CONVERA FastAPI Backend Server
==============================
Evidence-Driven Project Intelligence Platform (CCDS v1.0 / CIIA v1.0)
Universal Task-Routed LLM Gateway (Gemini, Groq, Ollama)
High-Concurrency SQLite WAL Database Engine
Modular Subsystem Architecture (Routers, Specialized Engines, Autonomous Agents)
"""

import os
import sys
import warnings
import logging
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Suppress internal genai warnings
warnings.filterwarnings("ignore")
logging.getLogger("google.genai").setLevel(logging.ERROR)
logging.getLogger("google.adk").setLevel(logging.ERROR)

# Load environment variables: baseline from root .env, overlaid by backend/.env if present
root_env = Path(__file__).resolve().parent.parent / ".env"
backend_env = Path(__file__).resolve().parent / ".env"

if root_env.exists():
    load_dotenv(root_env)
if backend_env.exists():
    load_dotenv(backend_env, override=True)
elif not root_env.exists():
    load_dotenv()

# Initialize Storage Engine (SQLite WAL)
from storage import get_storage
storage = get_storage()

# Import Modular Routers
from routers import (
    auth_router,
    workspaces_router,
    settings_router,
    integrations_router,
    traceability_router,
    knowledge_router,
    connectors_router,
    inbox_router,
    agents_router,
    frameworks_router,
    methodologies_router,
    problems_router,
    research_router,
    evaluation_router,
    gates_router,
    export_router,
    sessions_router,
    pipeline_router,
    decisions_router,
    orchestrator_router,
    ideation_router,
    concept_evaluation_router,
    feasibility_router,
    critique_router,
    research_sessions_router,
)

app = FastAPI(
    title="CONVERA Intelligence Engine",
    description="Evidence-Driven Project Intelligence Platform API (CCDS / CIIA v1.0)",
    version="3.0.0"
)

# Configure CORS with credential support for cookie-based authentication
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000")
cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Domain Routers
app.include_router(auth_router)
app.include_router(workspaces_router)
app.include_router(settings_router)
app.include_router(integrations_router)
app.include_router(connectors_router)
app.include_router(inbox_router)
app.include_router(agents_router)
app.include_router(frameworks_router)
app.include_router(methodologies_router)
app.include_router(problems_router)
app.include_router(research_router)
app.include_router(evaluation_router)
app.include_router(gates_router)
app.include_router(export_router)
app.include_router(sessions_router)
app.include_router(pipeline_router)
app.include_router(knowledge_router)
app.include_router(decisions_router)
app.include_router(traceability_router)
app.include_router(orchestrator_router)
app.include_router(ideation_router)
app.include_router(concept_evaluation_router)
app.include_router(feasibility_router)
app.include_router(critique_router)
app.include_router(research_sessions_router)



# ---------------------------------------------------------------------------
# Health & Model Status Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    """Health check endpoint reporting database and subsystem status."""
    return {
        "status": "healthy",
        "engine": "CONVERA Intelligence Engine",
        "version": "3.0.0",
        "storage": "SQLite WAL",
        "standard": "CCDS v1.0 / CIIA v1.0",
        "timestamp": os.environ.get("SERVER_START_TIME", "active")
    }


@app.get("/api/models/status")
async def models_status():
    """Report LLM gateway provider status and active configuration."""
    from llm_gateway import get_active_provider_info
    info = get_active_provider_info()
    return info


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", 8000)),
        reload=True
    )
