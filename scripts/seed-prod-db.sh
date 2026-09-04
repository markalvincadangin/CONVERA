#!/usr/bin/env bash
# CONVERA: Seed Team Production Database with Local Dev Snapshot
# Authority: docs/08-operations/DEPLOYMENT.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

SOURCE_DB="backend/convera.db"

echo "=========================================================="
echo "   CONVERA: Seed Team Production Database                 "
echo "=========================================================="

if [ ! -f "$SOURCE_DB" ]; then
    echo "ERROR: Source database '$SOURCE_DB' not found." >&2
    exit 1
fi

# Ensure backend container is running
echo "[+] Step 1: Ensuring backend container is running..."
docker compose up -d backend

# Wait a moment for container to initialize
sleep 2

# Copy source database into persistent Docker volume
echo "[+] Step 2: Copying $SOURCE_DB to convera-backend:/data/convera.db..."
docker cp "$SOURCE_DB" convera-backend:/data/convera.db

# Verify integrity inside container
echo "[+] Step 3: Verifying database integrity inside container..."
INTEGRITY=$(docker exec convera-backend sqlite3 /data/convera.db "PRAGMA integrity_check;")
PROBLEM_COUNT=$(docker exec convera-backend sqlite3 /data/convera.db "SELECT COUNT(*) FROM problems;")

echo "=========================================================="
echo "[OK] Production database seeded successfully!"
echo "     Integrity Check: ${INTEGRITY}"
echo "     Problems Seeded: ${PROBLEM_COUNT}"
echo "=========================================================="
