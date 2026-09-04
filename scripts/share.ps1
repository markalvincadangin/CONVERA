# CONVERA 1-Click Teammate Sharing Script (Windows PowerShell)
# Authority: docs/08-operations/DEPLOYMENT.md (Profile 3)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CONVERA: 1-Click Teammate Sharing System               " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

# 0. Ensure environment configuration exists
if (-not (Test-Path ".env") -and (Test-Path "backend/.env")) {
    Copy-Item "backend/.env" ".env"
}

# 1. Start production containers in detached mode
Write-Host "[+] Step 1: Ensuring team production containers are active on port 3001..." -ForegroundColor Green
docker compose up -d

# 2. Verify container status
Write-Host "[+] Step 2: Verifying container health..." -ForegroundColor Green
docker compose ps

Write-Host "----------------------------------------------------------" -ForegroundColor Gray
Write-Host "[+] Step 3: Launching secure Cloudflare Quick Tunnel..." -ForegroundColor Green
Write-Host "[*] Share the 'https://*.trycloudflare.com' link below with your teammates!" -ForegroundColor Yellow
Write-Host "[*] Press Ctrl+C to close the tunnel when finished." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Gray

docker run --rm -it --network host cloudflare/cloudflared:latest tunnel --url http://localhost:3001
