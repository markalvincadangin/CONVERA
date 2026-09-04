#!/usr/bin/env bash
# CONVERA Safe Live Backup Script (CCDS-OPS-002)
# Authority: docs/08-operations/BACKUP_DISASTER_RECOVERY.md
set -euo pipefail

# Ensure script runs from project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

DB_PATH="${SQLITE_PATH:-backend/convera.db}"
DATE_STR="$(date +%Y%m%d)"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="backups/${DATE_STR}"
BACKUP_FILE="${BACKUP_DIR}/convera_backup_${TIMESTAMP}.db"

echo "=========================================================="
echo "   CONVERA Safe Live SQLite Backup (CCDS-OPS-002)         "
echo "=========================================================="
echo "[*] Source Database: ${DB_PATH}"
echo "[*] Backup Archive:  ${BACKUP_FILE}.gz"

if [ ! -f "${DB_PATH}" ]; then
    echo "ERROR: Source database not found at ${DB_PATH}" >&2
    exit 1
fi

mkdir -p "${BACKUP_DIR}"

# 1. Execute safe online backup using sqlite3 CLI
echo "[+] Step 1: Performing online SQLite backup via online backup API..."
sqlite3 "${DB_PATH}" ".backup '${BACKUP_FILE}'"

# 2. Verify backup database integrity
echo "[+] Step 2: Verifying backup database integrity..."
INTEGRITY=$(sqlite3 "${BACKUP_FILE}" "PRAGMA integrity_check;")
if [ "${INTEGRITY}" != "ok" ]; then
    echo "ERROR: Backup integrity check failed: ${INTEGRITY}" >&2
    rm -f "${BACKUP_FILE}"
    exit 1
fi

FK_CHECK=$(sqlite3 "${BACKUP_FILE}" "PRAGMA foreign_key_check;")
if [ -n "${FK_CHECK}" ]; then
    echo "WARNING: Foreign key violations detected: ${FK_CHECK}" >&2
fi

# 3. Compress and archive
echo "[+] Step 3: Compressing backup archive..."
gzip -9 "${BACKUP_FILE}"

FILE_SIZE=$(ls -lh "${BACKUP_FILE}.gz" | awk '{print $5}')
echo "=========================================================="
echo "[OK] CONVERA live backup completed and verified!"
echo "     Archive:   ${BACKUP_FILE}.gz (${FILE_SIZE})"
echo "     Integrity: ${INTEGRITY}"
echo "=========================================================="
