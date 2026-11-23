# Git Initialization & GitHub Push Script
# Double-click to run, or right-click -> "Run with PowerShell"
# Run this AFTER installing Git for Windows from: https://git-scm.com/download/win

$ErrorActionPreference = "Continue"
$projectDir = $PSScriptRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Bloom Analytics - GitHub Setup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check git
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found! Please install Git for Windows first:" -ForegroundColor Red
    Write-Host "   https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Prompt for GitHub info
Write-Host ""
$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter repository name (e.g. bloom-analytics-portal)"
$userName = Read-Host "Enter your name for git commits"
$userEmail = Read-Host "Enter your email for git commits"

# Configure git user
git config --global user.name $userName
git config --global user.email $userEmail

# Change to project directory
Set-Location $projectDir

# Initialize repo if not already
if (-not (Test-Path ".git")) {
    Write-Host ""
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
} else {
    Write-Host "✅ Git repository already initialized." -ForegroundColor Green
}

# Stage all files
Write-Host ""
Write-Host "Staging files (respecting .gitignore)..." -ForegroundColor Yellow
git add .

# Initial commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Bloom's Taxonomy Learning Analysis & Recommendation System

- Flask + React full-stack web application
- 6-level Bloom's Taxonomy assessment engine
- AI question generation via Google Gemini API
- Faculty & Student portals with JWT authentication
- PostgreSQL (Render) + SQLite (local) database support
- Green Valley Academy dashboard UI theme
- Render deployment configuration (render.yaml)"

Write-Host ""
Write-Host "✅ Local git commit done!" -ForegroundColor Green
Write-Host ""
Write-Host "Now creating GitHub repository and pushing..." -ForegroundColor Yellow
Write-Host ""

# Try gh CLI first
$ghAvailable = $null
try { $ghAvailable = gh --version 2>&1 } catch {}

if ($ghAvailable) {
    Write-Host "Using GitHub CLI (gh)..." -ForegroundColor Cyan
    gh repo create $repoName --public --source=. --remote=origin --push
    Write-Host ""
    Write-Host "✅ Repository created and pushed!" -ForegroundColor Green
    Write-Host "   https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
} else {
    Write-Host "GitHub CLI (gh) not found. Using manual git remote..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor Cyan
    Write-Host "2. Create a repository named: $repoName" -ForegroundColor Cyan
    Write-Host "3. Set it to Public, do NOT initialize with README" -ForegroundColor Cyan
    Write-Host "4. Then press Enter here to push..." -ForegroundColor Cyan
    Read-Host "Press Enter when the GitHub repo is created"

    git remote add origin "https://github.com/$githubUsername/$repoName.git"
    git push -u origin main

    Write-Host ""
    Write-Host "✅ Pushed to GitHub!" -ForegroundColor Green
    Write-Host "   https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  NEXT: Deploy to Render" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Click New -> Blueprint" -ForegroundColor White
Write-Host "3. Connect your GitHub account" -ForegroundColor White
Write-Host "4. Select: $githubUsername/$repoName" -ForegroundColor White
Write-Host "5. Render reads render.yaml automatically" -ForegroundColor White
Write-Host "6. Add GEMINI_API_KEY in the env vars panel" -ForegroundColor White
Write-Host "7. Click Apply -> Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "Get a free Gemini API key at: https://aistudio.google.com/app/apikey" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to close"
