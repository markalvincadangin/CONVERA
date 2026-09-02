#!/usr/bin/env bash

# RatchetAI 1-Click Development Startup Script (Unix / macOS / WSL)

echo "=========================================================="
echo "   Starting RatchetAI: Full-Stack Venture Engine          "
echo "=========================================================="

if [ ! -f "pipeline/.env" ]; then
    echo "[!] pipeline/.env not found. Copying from .env.example..."
    cp pipeline/.env.example pipeline/.env
    echo "[*] Please verify your GOOGLE_API_KEY in pipeline/.env"
fi

# Start FastAPI Backend in background
echo "[+] Starting FastAPI Agent Backend on http://localhost:8000..."
(cd pipeline && python -m uvicorn server:app --reload --port 8000) &
BACKEND_PID=$!

# Trap exit to kill backend process on Ctrl+C
trap "kill $BACKEND_PID" EXIT

# Start Next.js Frontend
echo "[+] Starting Next.js Frontend on http://localhost:3000..."
cd web && npm run dev
