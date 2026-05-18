@echo off
REM MyWorld Development Script for Windows
REM Start both frontend and backend servers

echo.
echo 🚀 Starting MyWorld Application...
echo.

REM Check if node_modules exist and install if needed
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

echo.
echo ✅ Dependencies installed!
echo.
echo 🖥️  Starting Backend on http://localhost:5000...
echo 🌐 Starting Frontend on http://localhost:3000...
echo.

REM Start backend and frontend in separate windows
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"

echo 🎉 MyWorld is running in separate terminal windows!
echo.
echo Close the terminal windows to stop the servers.
