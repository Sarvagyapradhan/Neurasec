from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from jose import jwt, JWTError
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from datetime import datetime
import os
import hashlib
import binascii

User = get_user_model()

class EmailBackend(ModelBackend):
    """
    Custom authentication backend for the 'users' table.
    """
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        """Authenticate a user with email/username and password."""
        print(f"EmailBackend.authenticate called with username={username}, email={email}")
        
        try:
            # If email is provided directly, use that
            if email:
                print(f"Attempting to find user with email: {email}")
                user = User.objects.get(email=email)
            # If username looks like an email, treat it as such
            elif username and '@' in username:
                print(f"Username contains @, treating as email: {username}")
                user = User.objects.get(email=username)
            # Otherwise look up by username
            elif username:
                print(f"Looking up by username: {username}")
                user = User.objects.get(username=username)
            else:
                print("No username or email provided")
                return None
            
            # Check password with custom verification method for 'users' table
            if self.verify_password(password, user.password):
                print(f"Password check passed for user: {user.username}")
                return user
            else:
                print(f"Password check failed for user: {user.username}")
                return None
                
        except User.DoesNotExist:
            print(f"User.DoesNotExist for email/username lookup")
            return None
    
    def verify_password(self, password, stored_password):
        """
        Verify password against stored hash.
        This handles multiple hash formats for compatibility.
        """
        try:
            import bcrypt
            
            # Handle bcrypt passwords (starting with $2b$ or $2a$)
            if stored_password.startswith(('$2b$', '$2a$')):
                return bcrypt.checkpw(
                    password.encode('utf-8'),
                    stored_password.encode('utf-8')
                )
            
            # Handle Django's PBKDF2 passwords
            if stored_password.startswith('pbkdf2_sha256$'):
                from django.contrib.auth.hashers import check_password
                return check_password(password, stored_password)
            
            # For plain text passwords (not recommended but for compatibility)
            if stored_password == password:
                return True
                
            # For SHA-256 hashed passwords
            hashed = hashlib.sha256(password.encode()).hexdigest()
            return hashed == stored_password
            
        except Exception as e:
            print(f"Password verification error: {e}")
            return False

class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT Authentication for API views.
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
            
        # Extract the token from the header
        try:
            token_type, token = auth_header.split(' ')
            if token_type.lower() != 'bearer':
                return None
        except ValueError:
            return None
            
        try:
            # Decode and verify the token
            secret_key = os.getenv("SECRET_KEY", "default-insecure-key")
            algorithm = os.getenv("ALGORITHM", "HS256")
            payload = jwt.decode(token, secret_key, algorithms=[algorithm])
            
            # Check if token is expired
            if 'exp' in payload:
                exp = datetime.fromtimestamp(payload['exp'])
                if datetime.utcnow() > exp:
                    raise AuthenticationFailed('Token has expired', code=status.HTTP_401_UNAUTHORIZED)
                
            # Get the user from the 'users' table
            user_id = payload.get('user_id')
            try:
                user = User.objects.get(id=user_id)
                return (user, token)
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found', code=status.HTTP_404_NOT_FOUND)
                
        except JWTError as e:
            raise AuthenticationFailed('Invalid token', code=status.HTTP_401_UNAUTHORIZED) 