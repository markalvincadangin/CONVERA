#!/usr/bin/env bash
# ===================================================================
# CONVERA 1-Click Development Startup (Forwarding Shim)
# Canonical Script Location: scripts/dev/start-dev.sh
# ===================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/dev/start-dev.sh" "$@"
