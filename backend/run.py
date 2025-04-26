#!/usr/bin/env python
"""
Django development server startup script
"""
import os
import sys
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Start the Django development server with migrations"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasec.settings')
    
    # Get host and port from environment variables or use defaults
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
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