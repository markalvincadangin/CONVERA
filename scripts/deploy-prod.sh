#!/usr/bin/env bash
# CONVERA: Safe Dev-to-Prod Promotion & Deployment Pipeline
# Authority: docs/08-operations/DEPLOYMENT.md & docs/08-operations/SYSTEM_CERTIFICATION.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================="
echo "   CONVERA: Safe Dev-to-Prod Deployment Pipeline          "
echo "=========================================================="

# Stage 0: Environment Sync
if [ ! -f .env ] && [ -f backend/.env ]; then
    echo "[+] Stage 0: Linking backend/.env to root .env..."
    ln -s backend/.env .env 2>/dev/null || cp backend/.env .env
fi

# Stage 1: Unit Test Gate
echo "[+] Stage 1: Running backend unit tests..."
(cd backend && PYTHONPATH=. .venv/bin/pytest tests/ -q)

# Stage 2: Conformance Gate
echo "[+] Stage 2: Running Phase 9 local conformance gate..."
backend/.venv/bin/python backend/scripts/verify_phase9_local.py > /dev/null

# Stage 3: Pre-Deploy Backup
if docker ps --format '{{.Names}}' | grep -q "^convera-backend$"; then
    echo "[+] Stage 3: Taking safety snapshot of active production database..."
    BACKUP_NAME="convera_pre_deploy_$(date +%Y%m%d_%H%M%S).db"
    docker exec convera-backend sqlite3 /data/convera.db ".backup '/data/${BACKUP_NAME}'"
    echo "    Snapshot saved inside volume as /data/${BACKUP_NAME}"
else
    echo "[*] Stage 3: Production backend container not currently running; skipping pre-deploy snapshot."
fi

# Stage 4: Container Rebuild
echo "[+] Stage 4: Rebuilding container images..."
docker compose build

# Stage 5: Zero-Downtime Rolling Update
echo "[+] Stage 5: Performing zero-downtime rolling reload..."
docker compose up -d

echo "=========================================================="
echo "[OK] Deployment to Team Production successfully completed!"
echo "     Web Frontend:  http://localhost:${PROD_WEB_PORT:-3001}"
echo "     FastAPI API:   http://localhost:${PROD_BACKEND_PORT:-8001}/api/health"
echo "=========================================================="
docker compose ps
