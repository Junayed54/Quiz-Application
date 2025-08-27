from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import *
from .serializers import *
from quiz.permissions import *


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
