#!/usr/bin/env bash
# CONVERA 1-Click Teammate Sharing Script (Cloudflare Quick Tunnel)

# Authority: docs/08-operations/DEPLOYMENT.md (Profile 3)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

PROD_PORT="${PROD_WEB_PORT:-3001}"

echo "=========================================================="
echo "   CONVERA 1-Click Teammate Sharing System               "
echo "=========================================================="

# 0. Ensure environment configuration exists
if [ ! -f .env ] && [ -f backend/.env ]; then
    echo "[+] Linking backend/.env to root .env..."
    ln -s backend/.env .env 2>/dev/null || cp backend/.env .env
fi

# 1. Start production containers in detached mode
echo "[+] Step 1: Ensuring team production containers are active on port ${PROD_PORT}..."
docker compose up -d

# 2. Verify container status
echo "[+] Step 2: Verifying container health..."
docker compose ps

echo "----------------------------------------------------------"
echo "[+] Step 3: Launching secure Cloudflare Quick Tunnel..."
echo "[*] Share the 'https://*.trycloudflare.com' link below with your teammates!"
echo "[*] Press Ctrl+C to close the tunnel when finished."
echo "----------------------------------------------------------"

if [ -t 0 ]; then
    docker run --rm -it --network host cloudflare/cloudflared:latest tunnel --url "http://localhost:${PROD_PORT}"
else
    docker run --rm --network host cloudflare/cloudflared:latest tunnel --url "http://localhost:${PROD_PORT}"
fi

