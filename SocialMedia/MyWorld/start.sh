#!/bin/bash

# MyWorld Development Script
# Start both frontend and backend servers

echo "🚀 Starting MyWorld Application..."
echo ""

# Check if node_modules exist in both directories
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🖥️  Starting Backend on http://localhost:5000..."
echo "🌐 Starting Frontend on http://localhost:3000..."
echo ""

# Start backend and frontend in parallel
cd backend && npm run dev &
BACKEND_PID=$!

cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "🎉 MyWorld is running!"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
