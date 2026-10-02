@echo off
echo ===================================================
echo   Stopping CodeCrest processes (ports 8080 and 3000)
echo ===================================================

echo Stopping port 8080 (Backend)...
for /f "tokens=5" %%a in ('netstat -a -n -o ^| findstr :8080') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Stopping port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -a -n -o ^| findstr :3000') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Done! Both servers stopped.
pause
