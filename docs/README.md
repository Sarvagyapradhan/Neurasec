# NeuraSec - URL Security Scanner

NeuraSec is a comprehensive URL security scanning platform that helps users identify potential threats in web links before clicking them.

## Project Structure

The project has been organized into the following directories:

- `/src` - Frontend Next.js application
- `/backend` - Backend Django application
- `/public` - Static assets
- `/prisma` - Database schema
- `/docs` - Documentation files
- `/scripts` - Utility scripts
- `/config` - Configuration files

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.10 or higher)
- PostgreSQL (for local development)
- Supabase account (for production)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/neurasec.git
   cd neurasec
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the required values
   - Copy `backend/.env.example` to `backend/.env` and fill in the required values

5. Start the development servers:
   ```
   # Start frontend
   npm run dev
   
   # Start backend (in a separate terminal)
   cd backend
   python manage.py runserver
   ```

## Deployment

For deployment instructions, refer to the documentation in the `/docs` directory:

- `docs/AWS_DEPLOYMENT_GUIDE.md` - AWS deployment guide
- `docs/EC2_DEPLOYMENT_GUIDE.md` - EC2 deployment guide
- `docs/DEPLOYMENT_CHECKLIST.md` - Deployment checklist

## Authentication

The application supports multiple authentication methods:

- Email/Password
- Google OAuth
- Direct login

For more details, refer to `docs/AUTHENTICATION.md`.

## Security

All API keys and credentials are stored in `project_credentials.txt`. This file is not committed to version control and should be kept secure.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- VirusTotal API for URL scanning
- Google Gemini API for AI-powered analysis
- AlienVault OTX for threat intelligence
- Clerk for authentication
- Supabase for database hosting 