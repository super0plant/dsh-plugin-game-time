@echo off
setlocal
cd /d "%~dp0"

if not exist "%~dp0launcher.ps1" (
  echo launcher.ps1 is missing next to this file.
  pause
  exit /b 1
)

rem Starts the hidden tray helper; this window closes immediately.
start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0launcher.ps1"
exit /b 0
