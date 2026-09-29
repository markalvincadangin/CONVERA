#!/usr/bin/env bash
# ===================================================================
# CONVERA Developer Environment Setup Script
# Canonical Path: scripts/dev/setup-env.sh
# Standards: CONVERA-ENG-001 & CONVERA-ENG-002
# ===================================================================

set -e

echo "=========================================================="
echo "   CONVERA: Developer Environment Setup & Standardization "
echo "=========================================================="

if ! REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"; then
    REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi
cd "$REPO_ROOT"

# 1. Git Repository Hygiene
echo "[1/4] Configuring Git repository hygiene settings..."
git config fetch.prune true
git config pull.rebase false
git config core.hooksPath .githooks
echo "      - git config fetch.prune = true"
echo "      - git config pull.rebase = false"
echo "      - git config core.hooksPath = .githooks (version-controlled pre-push hook active)"

# 2. Ensure .githooks permissions
chmod +x .githooks/* 2>/dev/null || true

# 3. Environment Variable Files
echo "[2/4] Verifying environment variable configuration (.env)..."
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "      - Initializing .env from .env.example..."
    cp .env.example .env
fi

if [ ! -f "backend/.env" ]; then
    if [ -f ".env" ]; then
        echo "      - Symlinking root .env to backend/.env..."
        ln -s ../.env backend/.env 2>/dev/null || cp .env backend/.env
    elif [ -f "backend/.env.example" ]; then
        echo "      - Initializing backend/.env from backend/.env.example..."
        cp backend/.env.example backend/.env
    fi
fi
echo "      - Environment files verified."

# 4. Check Backend Python Virtual Environment
echo "[3/4] Verifying Python virtual environment..."
if [ -f "$REPO_ROOT/backend/.venv/bin/python" ]; then
    PY_VER=$("$REPO_ROOT/backend/.venv/bin/python" --version 2>&1)
    echo "      - Backend Python detected: $PY_VER (backend/.venv)"
else
    echo "      [!] Warning: backend/.venv not found."
    echo "          Run: python3 -m venv backend/.venv && ./backend/.venv/bin/pip install -e backend/"
fi

# 5. Check Frontend Node Modules
echo "[4/4] Verifying Next.js frontend dependencies..."
if [ -d "$REPO_ROOT/web/node_modules" ]; then
    echo "      - Frontend node_modules present."
else
    echo "      [!] Warning: web/node_modules not found."
    echo "          Run: npm install --prefix web"
fi

echo "=========================================================="
echo "   Environment successfully configured to CONVERA standards! "
echo "=========================================================="
