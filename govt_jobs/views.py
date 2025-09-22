from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import *
from .serializers import *
from quiz.permissions import *
from rest_framework.response import Response
from rest_framework import status

class GovernmentJobViewSet(viewsets.ModelViewSet):
    queryset = GovernmentJob.objects.all().order_by('-posted_on')
    serializer_class = GovernmentJobSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        # Allow any user (authenticated or not) to view the list and detail pages
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        # Require authentication for all other actions
        else:
            permission_classes = [IsAuthenticated]
            # If you want to require a specific permission for creation, you can add it here.
            # For example: if self.action == 'create': permission_classes = [IsAuthenticated, IsOperator]
        
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        print("🔎 Raw request.data:", request.data)       # Shows raw data
        print("🔎 Request.FILES:", request.FILES)        # Shows uploaded files
        print("🔎 Request.user:", request.user)          # Shows user info

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        print("✅ Validated data:", serializer.validated_data)  # Shows serializer-cleaned data

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)