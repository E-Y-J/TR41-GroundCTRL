@echo off
REM ============================================================
REM Close All Servers - GroundCTRL Helper Script
REM ============================================================
REM This script terminates all running Node.js processes
REM Useful for stopping development servers (frontend, backend)
REM ============================================================

echo.
echo ================================================
echo   GroundCTRL - Close All Servers
echo ================================================
echo.
echo Terminating all Node.js processes...
echo.

taskkill /F /IM node.exe 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [32mSUCCESS:[0m All Node.js servers have been terminated.
) else (
    echo.
    echo [33mINFO:[0m No Node.js processes were running.
)

echo.
echo ================================================
echo   Done!
echo ================================================
echo.

REM Pause so user can see the results
timeout /t 3 >nul
