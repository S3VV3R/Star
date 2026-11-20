@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js 22 or newer, then run START.cmd again.
  pause
  exit /b 1
)
start "" http://127.0.0.1:4173
node serve.mjs
pause
