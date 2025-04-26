#!/bin/bash

# Script to start the NeuraSec application (frontend and backend)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}    NeuraSec Startup Script    ${NC}"
echo -e "${GREEN}================================${NC}"

# Check if .env files exist
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}Warning: .env.local file not found. Creating from .env.example...${NC}"
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}Created .env.local from .env.example${NC}"
    echo -e "${YELLOW}Please update the .env.local file with your API keys before proceeding.${NC}"
  else
    echo -e "${RED}Error: .env.example file not found. Please create a .env.local file manually.${NC}"
    exit 1
  fi
fi

if [ ! -f "backend/.env" ]; then
  echo -e "${YELLOW}Warning: backend/.env file not found. Creating from backend/.env.example...${NC}"
  if [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}Created backend/.env from backend/.env.example${NC}"
    echo -e "${YELLOW}Please update the backend/.env file with your API keys before proceeding.${NC}"
  else
    echo -e "${RED}Error: backend/.env.example file not found. Please create a backend/.env file manually.${NC}"
    exit 1
  fi
fi

# Function to start the backend
start_backend() {
  echo -e "\n${GREEN}Starting backend...${NC}"
  cd backend
  
  # Check if virtual environment exists
  if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Python virtual environment not found. Creating...${NC}"
    python3 -m venv venv
  fi
  
  # Activate virtual environment
  source venv/bin/activate
  
  # Install dependencies
  echo -e "${GREEN}Installing backend dependencies...${NC}"
  pip install -r requirements.txt
  
  # Start backend server
  echo -e "${GREEN}Starting backend server...${NC}"
  python run.py &
  BACKEND_PID=$!
  echo -e "${GREEN}Backend server started with PID: ${BACKEND_PID}${NC}"
  cd ..
}

# Function to start the frontend
start_frontend() {
  echo -e "\n${GREEN}Starting frontend...${NC}"
  
  # Install dependencies if node_modules doesn't exist
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Node modules not found. Installing dependencies...${NC}"
    npm install
  fi
  
  # Start Next.js development server
  echo -e "${GREEN}Starting Next.js development server...${NC}"
  npm run dev &
  FRONTEND_PID=$!
  echo -e "${GREEN}Frontend server started with PID: ${FRONTEND_PID}${NC}"
}

# Start both services
start_backend
start_frontend

echo -e "\n${GREEN}Both servers are now running.${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}Backend: http://localhost:8000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Trap Ctrl+C
trap 'kill $BACKEND_PID $FRONTEND_PID; echo -e "\n${RED}Servers stopped.${NC}"; exit' INT

# Keep script running
wait 