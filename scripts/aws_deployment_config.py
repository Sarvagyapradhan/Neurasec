import os
from dotenv import load_dotenv
import django
from django.core.wsgi import get_wsgi_application

# Load environment variables
load_dotenv()

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasec.settings')

# Get Django WSGI application
application = get_wsgi_application()

if __name__ == "__main__":
    # For AWS deployment, use Gunicorn with Django WSGI application
    # This file is meant to be used with:
    # gunicorn aws_deployment_config:application
    
    # Import Django app
    import django
    django.setup()
    
    # For local testing
    from django.core.management import execute_from_command_line
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    # Use Django development server for testing
    execute_from_command_line(['manage.py', 'runserver', f'{host}:{port}']) 