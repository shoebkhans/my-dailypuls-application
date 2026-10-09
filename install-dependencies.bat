@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 20.19.4 or newer is required. Install Node.js 22 LTS, then run this file again.
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js with the npm option enabled, then run this file again.
  exit /b 1
)

echo Installing DailyPulse dependencies. This can take several minutes.
call npm install
if errorlevel 1 (
  echo Dependency installation failed. Check the messages above and your internet connection.
  exit /b 1
)

echo.
echo Dependencies are installed. Run npm start to open the app.
exit /b 0
