# NeuraSec Project Structure

This document outlines the structure of the NeuraSec project, describing the purpose of each directory and important files.

## Root Directory

- `src/`: Contains the Next.js frontend application
- `backend/`: Contains the Flask backend API server
- `public/`: Static assets for the frontend
- `prisma/`: Database schema and migrations for Prisma ORM
- `tests/`: Test files for the frontend
- `backend/tests/`: Test files for the backend

## Frontend Structure (src/)

```
src/
├── app/             # Next.js App Router pages and routes
│   ├── api/         # API routes for Next.js
│   ├── auth/        # Authentication-related pages
│   ├── dashboard/   # Dashboard and main application pages
│   ├── layout.tsx   # Root layout component
│   └── page.tsx     # Homepage component
├── components/      # Reusable UI components
│   ├── ui/          # Basic UI components like buttons, inputs, etc.
│   ├── auth/        # Authentication-related components
│   ├── dashboard/   # Dashboard-specific components
│   └── scanner/     # URL scanner components
├── lib/             # Utility functions and shared code
│   ├── api/         # API client functions
│   ├── auth/        # Authentication utilities
│   ├── utils/       # General utility functions
│   └── types/       # TypeScript type definitions
└── middleware.ts    # Next.js middleware for authentication and routing
```

## Backend Structure (backend/)

```
backend/
├── app/                # Main application code
│   ├── __init__.py     # Flask application initialization
│   ├── config.py       # Configuration settings
│   ├── api/            # API routes and controllers
│   ├── models/         # Database models
│   ├── services/       # Business logic services
│   └── utils/          # Utility functions
├── migrations/         # Database migration files
├── tests/              # Test files
└── run.py              # Application entry point
```

## Configuration Files

- `.env.example`: Template for environment variables (frontend)
- `backend/.env.example`: Template for environment variables (backend)
- `api_keys.json`: Central location for all API keys (for reference only, not used in production)
- `.gitignore`: Specifies files to exclude from version control
- `package.json`: Node.js dependencies and scripts
- `requirements.txt`: Python dependencies

## Setup and Start Scripts

- `start.sh`: Unix/Linux/macOS startup script
- `start.ps1`: Windows PowerShell startup script
- `cleanup.js`: Cleanup script to organize test files and remove unnecessary files

## Documentation

- `README.md`: Main project documentation
- `DEPLOYMENT_CHECKLIST.md`: Checklist for deployment tasks
- `AWS_DEPLOYMENT_GUIDE.md`: Guide for deploying on AWS