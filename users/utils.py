import os
import random
import string
from datetime import datetime, timedelta
from jose import jwt
from django.core.mail import send_mail
from django.conf import settings


def generate_otp(length=6):
    """Generate a random OTP of specified length"""
    return ''.join(random.choices(string.digits, k=length))


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a JWT token with expiry"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 1440))))
    to_encode.update({"exp": expire})
    secret_key = os.getenv("SECRET_KEY", "default-insecure-key")
    algorithm = os.getenv("ALGORITHM", "HS256")
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt


def send_otp_email(email, otp_code):
    """Send OTP to user's email using Django's email functionality"""
    try:
        send_mail(
            subject='NeuraSec Account Verification',
            message=f'Your verification code is: {otp_code}. This code will expire in 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
            html_message=f"""
            <h2>Welcome to NeuraSec!</h2>
            <p>Your verification code is: <strong>{otp_code}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            """
        )
        return True
    except Exception as e:
        print(f"Email sending error: {e}")
        return False 