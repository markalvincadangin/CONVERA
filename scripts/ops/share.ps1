# ===================================================================
# CONVERA 1-Click Teammate Sharing Script (Windows PowerShell)
# Canonical Path: scripts/ops/share.ps1
# Authority: docs/08-operations/DEPLOYMENT.md (Profile 3)
# ===================================================================

$RootDir = (git rev-parse --show-toplevel 2>$null)
if (-not $RootDir) {
    $RootDir = (Resolve-Path "$PSScriptRoot\..\..").Path
}
Set-Location "$RootDir"

$ProdPort = if ($env:PROD_WEB_PORT) { $env:PROD_WEB_PORT } else { "3001" }

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CONVERA 1-Click Teammate Sharing System (Windows)      " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

# 0. Ensure environment configuration exists
if (-not (Test-Path "$RootDir\.env") -and (Test-Path "$RootDir\backend\.env")) {
    Write-Host "[+] Linking backend\.env to root .env..." -ForegroundColor Yellow
    Copy-Item "$RootDir\backend\.env" "$RootDir\.env"
}

# 1. Start production containers in detached mode
Write-Host "[+] Step 1: Ensuring team production containers are active on port $ProdPort..." -ForegroundColor Green
docker compose up -d

# 2. Verify container status
Write-Host "[+] Step 2: Verifying container health..." -ForegroundColor Green
docker compose ps

Write-Host "----------------------------------------------------------" -ForegroundColor Cyan
Write-Host "[+] Step 3: Launching secure Cloudflare Quick Tunnel..." -ForegroundColor Green
Write-Host "[*] Share the 'https://*.trycloudflare.com' link below with your teammates!" -ForegroundColor Yellow
Write-Host "[*] Press Ctrl+C to close the tunnel when finished." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan

docker run --rm -it --network host cloudflare/cloudflared:latest tunnel --url "http://localhost:$ProdPort"
