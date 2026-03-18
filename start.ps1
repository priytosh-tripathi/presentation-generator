# AI Presentation Generator - Startup Script
# Starts the Azure Static Web Apps emulator with the frontend and API

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "=== AI Presentation Generator ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check for Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Node.js $(node --version)" -ForegroundColor Green

# 2. Check for Azure Functions Core Tools
if (-not (Get-Command func -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Azure Functions Core Tools not found. Install with: npm install -g azure-functions-core-tools@4" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Azure Functions Core Tools found" -ForegroundColor Green

# 3. Check for SWA CLI
if (-not (Get-Command swa -ErrorAction SilentlyContinue)) {
    Write-Host "SWA CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @azure/static-web-apps-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install SWA CLI." -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] SWA CLI found" -ForegroundColor Green

# 4. Install API dependencies
Write-Host ""
Write-Host "Installing API dependencies..." -ForegroundColor Yellow
Push-Location "$root\api"
npm install
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "ERROR: npm install failed." -ForegroundColor Red
    exit 1
}
Pop-Location
Write-Host "[OK] API dependencies installed" -ForegroundColor Green

# 5. Verify API key is configured
$settings = Get-Content "$root\api\local.settings.json" -Raw | ConvertFrom-Json
$apiKey = $settings.Values.AZURE_AI_API_KEY
if (-not $apiKey -or $apiKey -eq "your-api-key-here") {
    Write-Host ""
    Write-Host "WARNING: AZURE_AI_API_KEY is not set in api\local.settings.json" -ForegroundColor Red
    Write-Host "The API will not work until you set a valid key." -ForegroundColor Red
    Write-Host ""
}
else {
    Write-Host "[OK] AZURE_AI_API_KEY is configured" -ForegroundColor Green
}

# 6. Free port 4280 if occupied
$port4280 = Get-NetTCPConnection -LocalPort 4280 -ErrorAction SilentlyContinue
if ($port4280) {
    Write-Host "Port 4280 is in use. Attempting to free it..." -ForegroundColor Yellow
    $port4280 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

# 7. Start the application
Write-Host ""
Write-Host "Starting application..." -ForegroundColor Cyan
Write-Host "  Frontend + API: http://localhost:4280" -ForegroundColor White
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

Set-Location $root
swa start . --api-location ./api
