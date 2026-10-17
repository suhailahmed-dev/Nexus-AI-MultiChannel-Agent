@echo off
title Nexus AI - Share Online Link (Cloudflare Tunnel)
color 0b
echo ========================================================
echo   Nexus AI Agent Engine - Public Internet Link Generator
echo ========================================================
echo.
echo Starting secure HTTPS tunnel to http://localhost:3000 ...
echo Share the generated https://*.trycloudflare.com URL with clients!
echo.
echo Press Ctrl+C anytime to stop sharing.
echo ========================================================
echo.

"%~dp0cloudflared.exe" tunnel --url http://localhost:3000
pause
