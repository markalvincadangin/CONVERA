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

load_dotenv(Path(__file__).parent / ".env")

# Initialize Storage Engine (SQLite WAL)
from storage import get_storage
storage = get_storage()

# Import Modular Routers
from routers import (
    traceability_router,
    knowledge_router,
    connectors_router,
    inbox_router,
    agents_router,
    frameworks_router,
    problems_router,
    research_router,
    evaluation_router,
    sessions_router,
    pipeline_router,
    decisions_router,
)

app = FastAPI(
    title="CONVERA Intelligence Engine",
    description="Evidence-Driven Project Intelligence Platform API (CCDS / CIIA v1.0)",
    version="3.0.0"
)

# Configure CORS for multi-device LAN access and Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Domain Routers
app.include_router(connectors_router)
app.include_router(inbox_router)
app.include_router(agents_router)
app.include_router(frameworks_router)
app.include_router(problems_router)
app.include_router(research_router)
app.include_router(evaluation_router)
app.include_router(sessions_router)
app.include_router(pipeline_router)
app.include_router(knowledge_router)
app.include_router(decisions_router)
app.include_router(traceability_router)


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
