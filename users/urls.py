from django.urls import path
from .views import SignupView, LogoutView, UserRoleView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import UserDetailView, RequestOTPView, VerifyOTPView
from django.views.generic import TemplateView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user-role/', UserRoleView.as_view(), name='get_user_role'),
    path('request-otp/', RequestOTPView.as_view(), name='request_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    
    path('user/me/', UserDetailView.as_view(), name='user_detail'),
    
    
    path('user_profile/', TemplateView.as_view(template_name='Html/custom/user/profile.html'), name='profile'),
    path('reset_password/', TemplateView.as_view(template_name='Html/custom/user/reset_password.html'), name='reset_password'),
]

