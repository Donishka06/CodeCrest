@echo off
echo ===================================================
echo   Starting CodeCrest (Backend + Frontend)
echo ===================================================
echo.

echo [1/2] Starting Spring Boot Backend on http://localhost:8080 ...
start "CodeCrest Backend (Port 8080)" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

echo [2/2] Starting React Frontend on http://localhost:3000 ...
start "CodeCrest Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ===================================================
echo   Both services are launching in separate windows!
echo   - Backend API: http://localhost:8080
echo   - Frontend App: http://localhost:3000
echo ===================================================
echo Keep both terminal windows open while using the app.
echo To stop them later, close the windows or run stop.bat.
pause
