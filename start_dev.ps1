# BloomAnalytics Startup Script
$env:PATH = "C:\Users\Navya\AppData\Local\Programs\nodejs;C:\Users\Navya\AppData\Local\Programs\Python\Python311;$env:PATH"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " BloomAnalytics: AI-Powered Learning Ability & Recommendation System" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Yellow
Write-Host "  Faculty: faculty@demo.edu / Faculty@123" -ForegroundColor White
Write-Host "  Student: student@demo.edu / Student@123" -ForegroundColor White
Write-Host ""
Write-Host "Starting BloomAnalytics Server at http://localhost:5000..." -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\backend"
& "C:\Users\Navya\AppData\Local\Programs\Python\Python311\python.exe" app.py
