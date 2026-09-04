#!/usr/bin/env bash

# CONVERA 1-Click Development Startup Script (Unix / macOS / WSL)

echo "=========================================================="
echo "   Starting CONVERA: Project Intelligence System          "
echo "=========================================================="

# Ensure script runs from project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f "backend/.env" ]; then
    echo "[!] backend/.env not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "[*] Please verify your API keys in backend/.env"
fi

# Detect python executable (prefer backend/.venv)
PYTHON_BIN="python3"
if [ -f "$SCRIPT_DIR/backend/.venv/bin/python" ]; then
    PYTHON_BIN="$SCRIPT_DIR/backend/.venv/bin/python"
elif [ -f "$SCRIPT_DIR/.venv/bin/python" ]; then
    PYTHON_BIN="$SCRIPT_DIR/.venv/bin/python"
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

