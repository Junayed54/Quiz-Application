from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from quiz.permissions import *

class GovernmentJobViewSet(viewsets.ModelViewSet):
    queryset = GovernmentJob.objects.all().order_by('-posted_on')
    serializer_class = GovernmentJobSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsOperator()]
        return super().get_permissions()

