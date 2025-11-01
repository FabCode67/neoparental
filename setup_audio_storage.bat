@echo off
REM Setup Script for Audio Prediction Storage Feature
REM Run this after implementing the new features

echo ========================================
echo  Setting up Audio Prediction Storage
echo ========================================
echo.

REM Navigate to backend directory
cd backend

echo [1/4] Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [2/4] Fixing bcrypt compatibility...
pip install --upgrade bcrypt==4.0.1

echo.
echo [3/4] Creating uploads directory...
if not exist "uploads\audio" mkdir "uploads\audio"

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo  Next Steps
echo ========================================
echo.
echo 1. Update BACKEND_API_URL in utils\api.ts
echo 2. Start backend: python main.py
echo 3. Visit http://localhost:8000/docs
echo 4. Test your Expo app
echo.
echo Read AUDIO_STORAGE_GUIDE.md for details
echo.
pause
