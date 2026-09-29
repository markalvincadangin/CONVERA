#!/usr/bin/env bash
# ===================================================================
# CONVERA 1-Click Development Startup Script (Unix / macOS / WSL)
# Canonical Path: scripts/dev/start-dev.sh
# ===================================================================

echo "=========================================================="
echo "   Starting CONVERA: Project Intelligence System          "
echo "=========================================================="

if ! REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"; then
    REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi
cd "$REPO_ROOT"

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "[!] Root .env not found. Initializing from .env.example..."
    cp .env.example .env
fi

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        echo "[!] backend/.env not found. Initializing from backend/.env.example..."
        cp backend/.env.example backend/.env
    elif [ -f ".env" ]; then
        echo "[+] Linking root .env to backend/.env..."
        ln -s ../.env backend/.env 2>/dev/null || cp .env backend/.env
    fi
    echo "[*] Please verify your API keys in backend/.env or .env"
fi

# Detect python executable (prefer backend/.venv)
PYTHON_BIN="python3"
if [ -f "$REPO_ROOT/backend/.venv/bin/python" ]; then
    PYTHON_BIN="$REPO_ROOT/backend/.venv/bin/python"
elif [ -f "$REPO_ROOT/.venv/bin/python" ]; then
    PYTHON_BIN="$REPO_ROOT/.venv/bin/python"
fi

# Start FastAPI Backend in background
echo "[+] Starting FastAPI Agent Backend on http://localhost:8000 using $PYTHON_BIN..."
(cd backend && "$PYTHON_BIN" -m uvicorn server:app --reload --port 8000) &
BACKEND_PID=$!

# Trap exit to kill backend process on Ctrl+C
trap "kill $BACKEND_PID 2>/dev/null" EXIT INT TERM

# Start Next.js Frontend
echo "[+] Starting Next.js Frontend on http://localhost:3000..."
cd web && npm run dev
