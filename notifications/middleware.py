from django.utils.deprecation import MiddlewareMixin
from .models import UserActivity
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.request import Request as DRFRequest

# class ActivityLoggerMiddleware(MiddlewareMixin):
#     def process_request(self, request):
#         # Skip DRF API views
#         if isinstance(request, DRFRequest) or request.path.startswith('/api/'):
#             return

#         device_id = request.COOKIES.get('device_id')
#         ip_address = self.get_client_ip(request)
#         fcm_token = self.get_fcm_token(request)
#         jwt_token = self.get_jwt_token(request)
#         path = request.path
#         method = request.method

#         user = None
#         if jwt_token:
#             try:
#                 from rest_framework_simplejwt.authentication import JWTAuthentication
#                 validated_user = JWTAuthentication().authenticate(request)
#                 if validated_user:
#                     user = validated_user[0]
#                     request.user = user
#             except Exception:
#                 pass

#         if device_id:
#             UserActivity.objects.create(
#                 user=user,
#                 device_id=device_id,
#                 token=fcm_token,
#                 ip_address=ip_address,
#                 path=path,
#                 method=method
#             )

#     def get_fcm_token(self, request):
#         token = request.headers.get('X-FCM-Token')
#         if token:
#             return token.strip()
#         return request.COOKIES.get('fcm_token')

#     def get_jwt_token(self, request):
#         auth_header = request.META.get('HTTP_AUTHORIZATION', '')
#         if auth_header.startswith('Bearer '):
#             return auth_header.split(' ')[1].strip()
#         return request.COOKIES.get('access_token')

#     def get_client_ip(self, request):
#         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             return x_forwarded_for.split(',')[0].strip()
#         return request.META.get('REMOTE_ADDR')


class ActivityLoggerMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip API views
        if request.path.startswith('/api/'):
            return
        
        if request.path.startswith('/admin/') or  request.path.startswith('/media/') or   request.path.startswith('/auth/'):
            return

        device_id = request.COOKIES.get('device_id')
        fcm_token = request.COOKIES.get('fcm_token')
        jwt_token = request.COOKIES.get('access_token')
        ip_address = self.get_client_ip(request)
        path = request.path
        method = request.method

        user = None
        if jwt_token:
            try:
                # Manually authenticate using JWT from cookie
                validated_user = JWTAuthentication().authenticate(request)
                if validated_user:
                    user = validated_user[0]
                    request.user = user  # Optional override
            except Exception:
                pass  # Invalid token, treat as guest

        if device_id:
            UserActivity.objects.create(
                user=user,
                device_id=device_id,
                token=fcm_token,
                ip_address=ip_address,
                path=path,
                method=method
            )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
    
    
class ActivityLoggerMixin:
    def log_activity(self, request):
        device_id = request.COOKIES.get('device_id')
        ip_address = request.META.get('REMOTE_ADDR')
        path = request.path
        method = request.method

        if device_id:
            UserActivity.objects.create(
                user=request.user if request.user.is_authenticated else None,
                device_id=device_id,
                ip_address=ip_address,
                path=path,
                method=method
            )
