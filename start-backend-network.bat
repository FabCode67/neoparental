@echo off
echo ================================================
echo    NeoParental App - Network Setup (Windows)
echo ================================================
echo.

echo [1/3] Finding your laptop's IP address...
echo.

:: Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)

:found
:: Trim spaces
for /f "tokens=* delims= " %%a in ("%IP%") do set IP=%%a

if "%IP%"=="" (
    echo ERROR: Could not find IP address
    echo Please run 'ipconfig' manually to find your IPv4 Address
    pause
    exit /b 1
)

echo ✓ Your laptop's IP address: %IP%
echo.

echo ================================================
echo    Configuration Steps
echo ================================================
echo.
echo 1. Update the app configuration:
echo    - Open: utils\api-config.ts
echo    - Find line: const LAPTOP_IP = '192.168.1.100';
echo    - Change to: const LAPTOP_IP = '%IP%';
echo.
echo 2. Ensure firewall allows port 8000:
echo    (This script will attempt to add a firewall rule)
echo.
echo 3. Start the backend server:
echo    - The backend will start automatically after firewall setup
echo.

pause

echo.
echo [2/3] Configuring Windows Firewall...
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ Running with administrator privileges
    echo.
    echo Adding firewall rule for port 8000...
    netsh advfirewall firewall add rule name="Python Backend Port 8000" dir=in action=allow protocol=TCP localport=8000 >nul 2>&1
    if %errorLevel% == 0 (
        echo ✓ Firewall rule added successfully
    ) else (
        echo ! Firewall rule may already exist
    )
) else (
    echo ! Not running as administrator
    echo   Firewall rule cannot be added automatically
    echo.
    echo   To add manually:
    echo   1. Open Windows Defender Firewall
    echo   2. Go to Advanced settings
    echo   3. Add inbound rule for TCP port 8000
)

echo.
pause

echo.
echo [3/3] Starting Backend Server...
echo.
echo Server will start with configuration:
echo   - Host: 0.0.0.0 (all network interfaces)
echo   - Port: 8000
echo   - URL: http://%IP%:8000
echo.
echo ================================================
echo    Important: Keep this window open!
echo ================================================
echo.
echo The backend server will start now.
echo Press Ctrl+C to stop the server when done.
echo.
pause

:: Navigate to backend directory
if exist "backend" (
    cd backend
    echo Starting FastAPI backend...
    echo.
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
) else (
    echo ERROR: backend directory not found
    echo Make sure you're running this script from the project root
    pause
)
