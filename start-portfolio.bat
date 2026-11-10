@echo off
cd /d "%~dp0"
start "SOFyini Portfolio Server" /min cmd /k "cd /d ""%~dp0"" && node server.mjs"
timeout /t 2 /nobreak >nul
start "" http://localhost:4175
