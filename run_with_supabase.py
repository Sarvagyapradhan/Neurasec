#!/usr/bin/env python
"""
Django development server startup script with hardcoded Supabase credentials
"""
import os
import sys
import subprocess

def main():
    """Start the Django development server with Supabase database"""
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasec.settings')
    
    # Set Supabase credentials directly
    os.environ["POSTGRES_HOST"] = "aws-0-ap-south-1.pooler.supabase.com"
    os.environ["POSTGRES_PORT"] = "6543"
    os.environ["POSTGRES_DATABASE"] = "postgres"
    os.environ["POSTGRES_USER"] = "postgres.laapgnufkuqnmiympscm"
    os.environ["POSTGRES_PASSWORD"] = "Shorya80$"
    os.environ["DB_NAME"] = "postgres"
    os.environ["DB_USER"] = "postgres.laapgnufkuqnmiympscm"
    os.environ["DB_PASSWORD"] = "Shorya80$"
    os.environ["DB_HOST"] = "aws-0-ap-south-1.pooler.supabase.com"
    os.environ["DB_PORT"] = "6543"
    
    # Email settings
    os.environ["EMAIL_HOST"] = "smtp.gmail.com"
    os.environ["EMAIL_PORT"] = "587"
    os.environ["EMAIL_HOST_USER"] = "neurasec.team@gmail.com"
    os.environ["EMAIL_PASSWORD"] = "hpsg wvlo wyxu iiru"
    os.environ["DEFAULT_FROM_EMAIL"] = "neurasec.team@gmail.com"
    
    # Other settings
    os.environ["SECRET_KEY"] = "This_is_a_secret_key_for_jwt_token_generation"
    os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "1440"
    os.environ["ALGORITHM"] = "HS256"
    
    # Get host and port from environment variables or use defaults
    host = os.environ.get("API_HOST", "0.0.0.0")
    port = int(os.environ.get("API_PORT", "8000"))
    
    try:
        # Run migrations
        print("Running migrations...")
        subprocess.run([sys.executable, "manage.py", "makemigrations"], check=True)
        subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
        
        # Start the Django server
        print(f"Starting Django server on {host}:{port}...")
        subprocess.run([
            sys.executable, "manage.py", "runserver",
            f"{host}:{port}"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running Django commands: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main() 