from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('verify-registration/', views.VerifyRegistrationView.as_view(), name='verify-registration'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('send-otp/', views.SendOTPView.as_view(), name='send-otp'),
    path('me/', views.UserDetailView.as_view(), name='user-detail'),
] 