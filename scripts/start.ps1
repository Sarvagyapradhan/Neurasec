# Script to start the NeuraSec application (frontend and backend)

# Print header
Write-Host "================================" -ForegroundColor Green
Write-Host "    NeuraSec Startup Script    " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if .env files exist
if (!(Test-Path ".env.local")) {
    Write-Host "Warning: .env.local file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" -Destination ".env.local"
        Write-Host "Created .env.local from .env.example" -ForegroundColor Green
        Write-Host "Please update the .env.local file with your API keys before proceeding." -ForegroundColor Yellow
    } else {
        Write-Host "Error: .env.example file not found. Please create a .env.local file manually." -ForegroundColor Red
        exit
    }
}

if (!(Test-Path "backend\.env")) {
    Write-Host "Warning: backend\.env file not found. Creating from backend\.env.example..." -ForegroundColor Yellow
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" -Destination "backend\.env"
        Write-Host "Created backend\.env from backend\.env.example" -ForegroundColor Green
        Write-Host "Please update the backend\.env file with your API keys before proceeding." -ForegroundColor Yellow
    } else {
        Write-Host "Error: backend\.env.example file not found. Please create a backend\.env file manually." -ForegroundColor Red
        exit
    }
}

# Function to start the backend
function Start-Backend {
    Write-Host "`nStarting backend..." -ForegroundColor Green
    Set-Location -Path "backend"
    
    # Check if virtual environment exists
    if (!(Test-Path "venv")) {
        Write-Host "Python virtual environment not found. Creating..." -ForegroundColor Yellow
        python -m venv venv
    }
    
    # Activate virtual environment
    Write-Host "Activating virtual environment..." -ForegroundColor Green
    & .\venv\Scripts\Activate.ps1
    
    # Install dependencies
    Write-Host "Installing backend dependencies..." -ForegroundColor Green
    pip install -r requirements.txt
    
    # Start backend server
    Write-Host "Starting backend server..." -ForegroundColor Green
    Start-Process python -ArgumentList "run.py" -NoNewWindow
    
    Set-Location -Path ".."
}

# Function to start the frontend
function Start-Frontend {
    Write-Host "`nStarting frontend..." -ForegroundColor Green
    
    # Install dependencies if node_modules doesn't exist
    if (!(Test-Path "node_modules")) {
        Write-Host "Node modules not found. Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start Next.js development server
    Write-Host "Starting Next.js development server..." -ForegroundColor Green
    Start-Process npm -ArgumentList "run", "dev" -NoNewWindow
}

# Start both services
Start-Backend
Start-Frontend

Write-Host "`nBoth servers are now running." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
Write-Host "Please close this window when you want to stop the servers." -ForegroundColor Yellow

# Keep script running until user closes window
Read-Host "Press Enter to stop the servers" 