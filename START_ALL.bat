@echo off
REM BusFlow - Start All Services Batch Script
REM Usage: Double-click this file or run: START_ALL.bat

echo.
echo ================================
echo BusFlow Dashboard Launcher
echo ================================
echo.

REM Check if running from correct directory
if not exist "BusFlow" (
    echo ERROR: Please run this script from the project root directory
    echo Current directory: %cd%
    pause
    exit /b 1
)

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js v18+
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js %NODE_VERSION% found
echo.

REM Check directories
if not exist "BusFlow\backend" (
    echo ERROR: Backend directory not found
    pause
    exit /b 1
)

if not exist "BusFlow\frontend\admin-dashboard-frontend" (
    echo ERROR: Admin Dashboard directory not found
    pause
    exit /b 1
)

if not exist "BusFlow\frontend\student-dashboard-frontend\apps\student-portal" (
    echo ERROR: Student Dashboard directory not found
    pause
    exit /b 1
)

echo All directories verified
echo.
echo Opening service terminals...
echo.

REM Start Backend
start "BusFlow Backend (Port 5000)" cmd /k "cd BusFlow\backend && npm run start:dev"
timeout /t 2 /nobreak

REM Start Admin Dashboard
start "BusFlow Admin Dashboard (Port 3000)" cmd /k "cd BusFlow\frontend\admin-dashboard-frontend && npm run dev"
timeout /t 2 /nobreak

REM Start Student Dashboard
start "BusFlow Student Dashboard (Port 3001)" cmd /k "cd BusFlow\frontend\student-dashboard-frontend\apps\student-portal && set PORT=3001 && npm start"

echo.
echo ================================
echo Services launched!
echo ================================
echo.
echo Access URLs:
echo   - Admin Dashboard:    http://localhost:3000
echo   - Student Dashboard:  http://localhost:3001 (auto-login)
echo   - Backend API:        http://localhost:5000
echo.
echo Test Credentials:
echo   - Email:    CTU1001@busflow.com
echo   - Password: demo-password
echo.
echo NOTE: Closing each window individually will stop that service
echo.
pause
