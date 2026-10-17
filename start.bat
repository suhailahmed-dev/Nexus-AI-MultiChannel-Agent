@echo off
title Nexus AI Agent Engine - Local Server
color 0a
echo ========================================================
echo   Starting Nexus AI Agent Engine Backend
echo ========================================================
echo.
echo Local URL: http://localhost:3000
echo Voice Call Lab: http://localhost:3000/call-lab.html
echo WhatsApp Demo Lab: http://localhost:3000/demo-lab.html
echo.
echo Leave this window open while testing or sharing links!
echo ========================================================
echo.

node server.js
pause
