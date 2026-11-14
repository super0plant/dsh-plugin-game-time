@echo off
set STAMP=%~1
if "%STAMP%"=="" set /p STAMP=Restore which backup (Enter = newest): 
if "%STAMP%"=="" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\restore.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\restore.ps1" -Stamp %STAMP%
)
pause
