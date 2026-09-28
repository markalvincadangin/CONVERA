#!/usr/bin/env bash
# ===================================================================
# Forwarding Shim for CONVERA Seed Team Production Database
# Canonical Script Location: scripts/ops/seed-prod-db.sh
# ===================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/ops/seed-prod-db.sh" "$@"
