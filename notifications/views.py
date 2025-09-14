# notifications/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import *

@api_view(["POST"])
def save_device_token(request):
    token = request.data.get("token")
    platform = request.data.get("platform", "web")

    if token:
        DeviceToken.objects.update_or_create(
            token=token, defaults={"platform": platform}
        )
        return Response({"status": "success"})
    return Response({"status": "failed"}, status=400)




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .fcm_service import send_fcm_message


class SendNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        device_token = request.data.get("device_token")
        title = request.data.get("title", "Default Title")
        body = request.data.get("body", "Default Body")

        if not device_token:
            return Response({"error": "Device token is required"}, status=400)

        result = send_fcm_message(device_token, title, body)
        return Response(result)



import firebase_admin
from firebase_admin import credentials, messaging 
import os
from django.shortcuts import render, HttpResponse
import time

def send_data_message(token, title, body, image_url=None):
    
    # print(token, title, body, image_url)
    data = {
        "title":title,
        "body":body,
        "icon":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCj1uO57grh0JddNU0gc13RFPBqZiwmrRFnw&s",
        "timestamp": str(time.time())  
    }
    if image_url:
        data["image"]=image_url
    
    message = messaging.Message(data=data, token=token)

    response = messaging.send(message)
    print("Data message sent: ", response)
     
     
     

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import DeviceToken
from .serializers import DeviceTokenSerializer
from django.db import connection
from django.db import DatabaseError


class RegisterDeviceTokenView(APIView):
    permission_classes = []  # Allow both guests and authenticated users

    def post(self, request):
        # Step 1: Extract Authorization header
        auth_header = request.headers.get('Authorization')
        print("Authorization header:", auth_header)

        access_token = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header.split(' ')[1]
            print("Access token:", access_token)

        # Step 2: Try to authenticate user via JWT
        user = None
        try:
            validated_user = JWTAuthentication().authenticate(request)
            if validated_user:
                user = validated_user[0]
                print("Authenticated user:", user)
        except Exception as e:
            print("JWT authentication failed:", str(e))

        # Step 3: Extract token from request
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Missing token'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 4: Create or update DeviceToken
        instance, created = DeviceToken.objects.get_or_create(token=token)

        instance.device_type = request.data.get('device_type', instance.device_type)
        instance.device_id = request.data.get('device_id', instance.device_id)
        instance.ip_address = request.data.get('ip_address', instance.ip_address)

        # Step 5: Link user if authenticated
        if user and user != instance.user:
            print(f"Linking token to user: {user}")
            instance.user = user

        instance.save()

        # Step 6: Respond with status
        return Response({
            'message': 'Token created' if created else 'Token updated',
            'token': instance.token
        }, status=status.HTTP_200_OK)


# test query
# SELECT DISTINCT id, user_id, device_id
# FROM notifications_useractivity
# WHERE user_id IS NOT NULL
#   AND user_id NOT IN (
#     SELECT user_id
#     FROM notifications_useractivity
#     WHERE path = '/quiz/'
#       AND timestamp >= datetime('now', '-30 days')
#   )

class SegmentUsersView(APIView):
    permission_classes = []  # Add admin-only restriction if needed

    def post(self, request):
        query = request.data.get('query')
        if not query:
            return Response({'error': 'Missing query'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Basic safety check
        if not query.lower().strip().startswith('select') or 'useractivity' not in query.lower():
            return Response({'error': 'Only SELECT queries on UserActivity are allowed'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            queryset = UserActivity.objects.raw(query)
        except DatabaseError as db_err:
            return Response({'error': str(db_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user_ids = set()
        device_ids = set()

        for row in queryset:
            if row.user_id:
                user_ids.add(row.user_id)
            if row.device_id:
                device_ids.add(row.device_id)

        tokens_qs = DeviceToken.objects.filter(
            user_id__in=user_ids
        ) | DeviceToken.objects.filter(
            device_id__in=device_ids
        )

        tokens = tokens_qs.values('token', 'user__username', 'device_id')

        return Response({
            'users': [
                {
                    'token': t['token'],
                    'user': t['user__username'],
                    'device_id': t['device_id']
                } for t in tokens
            ]
        }, status=status.HTTP_200_OK)
        
        
class SendNotificationView(APIView):
    permission_classes = [IsAuthenticated]  # ✅ Restrict to admin users

    def post(self, request):
        tokens = request.data.get('tokens', [])
        title = request.data.get('title')
        body = request.data.get('body')
        image_url = request.data.get('image')
        # print(tokens)
        if not tokens or not title or not body:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        sent = []
        failed = []

        for token in tokens:
            try:
                send_data_message(token, title, body, image_url)
                sent.append(token)
            except Exception as e:
                print(f"Failed to send to {token}: {str(e)}")
                failed.append(token)

        return Response({
            'message': f'Notification sent to {len(sent)} users',
            'sent': sent,
            'failed': failed
        }, status=status.HTTP_200_OK)