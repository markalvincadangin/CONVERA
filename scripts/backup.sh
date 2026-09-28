#!/usr/bin/env bash
# ===================================================================
# Forwarding Shim for CONVERA Safe Live SQLite Backup (CCDS-OPS-002)
# Canonical Script Location: scripts/ops/backup.sh
# ===================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/ops/backup.sh" "$@"
