#!/usr/bin/env bash
# ===================================================================
# Forwarding Shim for CONVERA 1-Click Teammate Sharing System
# Canonical Script Location: scripts/ops/share.sh
# ===================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/ops/share.sh" "$@"
