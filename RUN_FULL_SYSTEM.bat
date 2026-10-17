@echo off
title Nexus AI - All-In-One Autonomous Engine
color 0a

echo ========================================================
echo   Starting Nexus AI Full Autonomous Acquisition Engine
echo ========================================================
echo.
echo [1/2] Launching Local Backend Server...
start "Nexus Local Server" cmd /c "node server.js"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Public HTTPS Cloudflare Tunnel...
start "Nexus Cloudflare Tunnel" cmd /c "cloudflared.exe tunnel --url http://localhost:3000"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo   System is LIVE! Opening Agency Dashboard...
echo ========================================================
start http://localhost:3000
