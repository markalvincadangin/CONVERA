# RatchetAI 1-Click Worldwide Remote Sharing Tunnel (Powered by Cloudflare)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   RatchetAI: 1-Click Worldwide Remote Sharing Tunnel     " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[*] Creating ultra-fast, secure Cloudflare HTTPS tunnel..." -ForegroundColor Gray
Write-Host "[*] Share the generated https://*.trycloudflare.com link with your groupmates!" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

cloudflared tunnel --url http://localhost:3000
