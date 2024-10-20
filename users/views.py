from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics
from django.contrib.auth import logout
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer, UserSerializer
from django.core.exceptions import ObjectDoesNotExist 
from .models import CustomUser
from .serializers import UserSerializer
User = get_user_model()

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        # First, create the user by calling the serializer's `create` method
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the newly created user
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)   
        
        
class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        # Assuming you're using JWT and you want to invalidate tokens client-side
        # There's no built-in JWT token invalidation in SimpleJWT; typically, tokens are cleared on the client side.
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


class UserRoleView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.user.role
        # role = role.capitalize()
        return Response({'role': role, 'username': request.user.username})
    
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        # print(request.data)
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)  # partial=True allows updating some fields only

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)  # This will help pinpoint the exact field(s) causing issues.
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
class RequestOTPView(APIView):
    """
    View to request an OTP for password reset.
    """
    permission_classes = [AllowAny]
    def post(self, request):
        phone_number = request.data.get('phone_number')
        try:
            user = User.objects.get(phone_number=phone_number)
            user.generate_otp()  # Generate OTP
            user.send_otp_email()  # Send OTP to email
            return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({"error": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)
        
        
class VerifyOTPView(APIView):
    """
    View to verify the OTP and reset the password.
    """
    permission_classes = [AllowAny]
    def post(self, request):
        phone_number = request.data.get('phone_number')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        try:
            user = User.objects.get(phone_number=phone_number)

            if user.otp_is_valid() and user.otp == otp:
                # Reset password
                user.set_password(new_password)
                user.otp = None  # Invalidate OTP after use
                user.otp_created_at = None
                user.save()

                return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        except ObjectDoesNotExist:
            return Response({"error": "Phone number does not exist."}, status=status.HTTP_404_NOT_FOUND)