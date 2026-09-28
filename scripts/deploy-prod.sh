#!/usr/bin/env bash
# ===================================================================
# Forwarding Shim for CONVERA Safe Dev-to-Prod Promotion Pipeline
# Canonical Script Location: scripts/ops/deploy-prod.sh
# ===================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/ops/deploy-prod.sh" "$@"
