@echo off
title Launching PharmaDist ERP...
echo ========================================================
echo   Stopping any old running instances...
echo ========================================================
powershell -Command "Stop-Process -Name 'electron','PharmaDist Wholesale ERP','node' -Force -ErrorAction SilentlyContinue"
timeout /t 1 /nobreak >nul

echo Starting PharmaDist Wholesale ERP...
start "" "%~dp0dist\win-unpacked\PharmaDist Wholesale ERP.exe"
exit
