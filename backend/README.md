# NeuraSec Django Backend

This is the Django backend for the NeuraSec cybersecurity application. The backend API provides authentication, user management, and other services required by the frontend application.

## Migration from FastAPI to Django

This backend has been migrated from FastAPI to Django with Django REST Framework. The API endpoints and functionality remain the same, but the implementation has been updated to use Django's features and capabilities.

## Setup Instructions

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env` and update the environment variables with your own values.

5. Run database migrations:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create an admin user:
   ```
   python manage.py create_admin
   ```
   Or use the environment variables `ADMIN_EMAIL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` to configure the admin user details.

7. Start the development server:
   ```
   python run.py
   ```
   Or use:
   ```
   python manage.py runserver
   ```

## API Endpoints

The API provides the following endpoints:

- **Authentication**:
  - `POST /api/auth/register/`: Register a new user
  - `POST /api/auth/verify-registration/`: Verify user registration with OTP
  - `POST /api/auth/login/`: Login with email/username and password
  - `POST /api/auth/send-otp/`: Send OTP for verification
  - `GET /api/auth/me/`: Get the current user details

## Docker Deployment

To build and run the backend using Docker:

1. Build the Docker image:
   ```
   docker build -t neurasec-backend .
   ```

2. Run the container:
   ```
   docker run -p 8000:8000 --env-file .env neurasec-backend
   ```

## Database

The application uses PostgreSQL as its database. Make sure to configure the database connection details in the `.env` file.

## Contributing

Follow the project's coding standards and workflow for contributing to this backend. 