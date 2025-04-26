import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from dotenv import load_dotenv

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates an admin user if it does not exist'

    def handle(self, *args, **options):
        # Load environment variables
        load_dotenv()
        
        # Get admin credentials from environment variables
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@neurasec.com')
        admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        admin_password = os.getenv('ADMIN_PASSWORD', 'neurasec123')
        
        # Check if the admin already exists
        if User.objects.filter(email=admin_email).exists():
            self.stdout.write(self.style.WARNING(f'Admin user with email {admin_email} already exists'))
            return
        
        # Create the admin user
        admin_user = User.objects.create_superuser(
            email=admin_email,
            username=admin_username,
            password=admin_password,
            full_name='Administrator'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Admin user {admin_username} created successfully!')) 