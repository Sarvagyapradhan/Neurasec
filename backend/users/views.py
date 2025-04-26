from rest_framework import status, viewsets, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import OTP
from .serializers import (
    UserSerializer, UserCreateSerializer, OTPSerializer, 
    LoginSerializer, TokenSerializer, PasswordChangeSerializer
)
from .utils import generate_otp, create_access_token, send_otp_email
from .authentication import EmailBackend

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = True
            user.is_verified = False
            user.save()
            
            # Generate OTP
            otp_code = generate_otp()
            otp = OTP.objects.create(
                email=user.email,
                otp=otp_code,
                user=user,
                expiry=OTP.create_expiry()
            )
            
            # Send OTP email
            send_otp_email(user.email, otp_code)
            
            return Response(
                {"message": "Registration successful. Please verify your email with the OTP sent."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        
        if not email or not otp_code:
            return Response(
                {"error": "Email and OTP are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find the OTP
        try:
            otp = OTP.objects.filter(
                email=email,
                otp=otp_code,
                used=False
            ).latest('created_at')
            
            if otp.is_expired():
                return Response(
                    {"error": "OTP has expired"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Mark OTP as used
            otp.used = True
            otp.save()
            
            # Verify the user
            user = otp.user
            if user:
                user.is_verified = True
                user.save()
                
                # Create JWT token
                token_data = {
                    "sub": user.email,
                    "user_id": user.id,
                    "role": user.role
                }
                access_token = create_access_token(data=token_data)
                
                return Response(
                    {"access_token": access_token, "token_type": "bearer"},
                    status=status.HTTP_200_OK
                )
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        except OTP.DoesNotExist:
            return Response(
                {"error": "Invalid OTP"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        print("LoginView.post(): Request data:", request.data)
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            username_or_email = serializer.validated_data['username_or_email']
            password = serializer.validated_data['password']
            
            print(f"Attempting to authenticate: {username_or_email}")
            
            # Use the EmailBackend directly
            backend = EmailBackend()
            user = backend.authenticate(
                request, 
                username=username_or_email if '@' not in username_or_email else None,
                email=username_or_email if '@' in username_or_email else None,
                password=password
            )
            
            if user:
                if not user.is_verified:
                    return Response(
                        {"error": "Account not verified. Please check your email for verification code."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                # Update last login
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])
                
                # Generate JWT token
                token = create_access_token({"user_id": str(user.id)})
                
                serializer = TokenSerializer({
                    'access_token': token,
                    'token_type': 'bearer'
                })
                
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "Email is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            
            # Generate OTP
            otp_code = generate_otp()
            OTP.objects.create(
                email=email,
                otp=otp_code,
                user=user,
                expiry=OTP.create_expiry()
            )
            
            # Send OTP email
            send_otp_email(email, otp_code)
            
            return Response(
                {"message": "OTP sent to your email"}, 
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class UserDetailView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data) 