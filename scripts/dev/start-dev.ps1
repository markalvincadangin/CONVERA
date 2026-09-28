# ===================================================================
# CONVERA 1-Click Multi-Device Startup Script (Windows PowerShell)
# Canonical Path: scripts/dev/start-dev.ps1
# ===================================================================

$RootDir = (git rev-parse --show-toplevel 2>$null)
if (-not $RootDir) {
    $RootDir = (Resolve-Path "$PSScriptRoot\..\..").Path
}

# Detect local IPv4 address
$LocalIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*", "Ethernet*" -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notmatch "^127\.|^169\.254\." } | Select-Object -First 1).IPAddress
if (-not $LocalIP) {
    $LocalIP = "localhost"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CONVERA: Project Intelligence System                   " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[*] Project Root: $RootDir" -ForegroundColor Gray
Write-Host "[*] Local Access: http://localhost:3000" -ForegroundColor Green
Write-Host "[*] Teammates on same Wi-Fi: http://$($LocalIP):3000" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if .env files exist
$RootEnvPath = "$RootDir\.env"
$RootEnvExamplePath = "$RootDir\.env.example"
if (-not (Test-Path $RootEnvPath) -and (Test-Path $RootEnvExamplePath)) {
    Write-Host "[!] Root .env not found. Initializing from .env.example..." -ForegroundColor Yellow
    Copy-Item $RootEnvExamplePath $RootEnvPath
}

$EnvPath = "$RootDir\backend\.env"
$EnvExamplePath = "$RootDir\backend\.env.example"
if (-not (Test-Path $EnvPath)) {
    if (Test-Path $EnvExamplePath) {
        Write-Host "[!] backend\.env not found. Initializing from .env.example..." -ForegroundColor Yellow
        Copy-Item $EnvExamplePath $EnvPath
        Write-Host "[*] Please verify your API keys in backend\.env" -ForegroundColor Yellow
    } elseif (Test-Path $RootEnvPath) {
        Copy-Item $RootEnvPath $EnvPath
    }
}

# Start FastAPI Backend with 0.0.0.0 host binding for multi-device support
Write-Host "[+] Launching FastAPI Agent Backend on 0.0.0.0:8000 (SQLite WAL)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootDir\backend'; Write-Host 'FastAPI Backend Running on port 8000...' -ForegroundColor Cyan; if (Test-Path '.\.venv\Scripts\uvicorn.exe') { .\.venv\Scripts\uvicorn.exe server:app --reload --host 0.0.0.0 --port 8000 } elseif (Test-Path '.\.venv\bin\uvicorn') { .\.venv\bin\uvicorn server:app --reload --host 0.0.0.0 --port 8000 } else { python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000 }"

# Start Next.js Frontend bound to 0.0.0.0 for LAN access
Write-Host "[+] Launching Next.js Frontend on 0.0.0.0:3000..." -ForegroundColor Green
Set-Location "$RootDir\web"
npx next dev -H 0.0.0.0 -p 3000
