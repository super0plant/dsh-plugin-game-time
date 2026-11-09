@echo off
setlocal

rem Fallback quit when the tray icon is hidden in the Windows 11 overflow:
rem asks the collector to stop cleanly (synchronous save), then closes.

curl.exe -s -X POST http://127.0.0.1:45917/api/game-time/shutdown >nul 2>nul
if errorlevel 1 (
  echo Game Time is not running on port 45917.
) else (
  echo Game Time stopped.
)

timeout /t 2 >nul
exit /b 0
