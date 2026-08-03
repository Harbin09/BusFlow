# BusFlow - Start All Services Script
# Simple version for Windows PowerShell 5.1

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "BusFlow Dashboard Launcher" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if running from correct directory
if (-not (Test-Path "BusFlow")) {
    Write-Host "ERROR: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Red
    exit 1
}

Write-Host "Checking Node.js installation..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "ERROR: Node.js not found. Please install Node.js v18+" -ForegroundColor Red
    exit 1
}

Write-Host "Node.js $nodeVersion found" -ForegroundColor Green
Write-Host ""

# Check directories
Write-Host "Verifying project structure..." -ForegroundColor Cyan

if (-not (Test-Path "BusFlow/backend")) {
    Write-Host "ERROR: Backend directory not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "BusFlow/frontend/admin-dashboard-frontend")) {
    Write-Host "ERROR: Admin Dashboard directory not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "BusFlow/frontend/student-dashboard-frontend/apps/student-portal")) {
    Write-Host "ERROR: Student Dashboard directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "All directories verified" -ForegroundColor Green
Write-Host ""
Write-Host "Starting services in new windows..." -ForegroundColor Cyan
Write-Host ""

# Start Backend API
Write-Host "Launching Backend API (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PWD\BusFlow\backend`"; npm run start:dev"
Start-Sleep -Seconds 2

# Start Admin Dashboard
Write-Host "Launching Admin Dashboard (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PWD\BusFlow\frontend\admin-dashboard-frontend`"; npm run dev"
Start-Sleep -Seconds 2

# Start Student Dashboard
Write-Host "Launching Student Dashboard (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PORT=3001; cd `"$PWD\BusFlow\frontend\student-dashboard-frontend\apps\student-portal`"; npm start"

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "All services launched!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Student Dashboard:  http://localhost:3001 (auto-login enabled)" -ForegroundColor Green
Write-Host "  Admin Dashboard:    http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend API:        http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    CTU1001@busflow.com" -ForegroundColor White
Write-Host "  Password: demo-password" -ForegroundColor White
Write-Host ""
Write-Host "Services are starting in new windows..." -ForegroundColor Cyan
Write-Host "It may take 30-60 seconds for all services to be ready" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to close this window"
