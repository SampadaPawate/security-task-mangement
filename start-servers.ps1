# Start both backend and frontend servers
Write-Host "🚀 Starting Task Management System..." -ForegroundColor Green

# Start backend in background
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/backend'; npm run start:dev"

# Wait a moment
Start-Sleep 3

# Start frontend in background
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/frontend'; npm start"

Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "🌐 Frontend will be available at: http://localhost:4200" -ForegroundColor Cyan
Write-Host "🔧 Backend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⏳ Please wait for both servers to fully load..." -ForegroundColor Yellow

Read-Host "Press Enter to continue..."

