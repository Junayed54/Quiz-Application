from rest_framework import viewsets, permissions
from django.utils import timezone
from .models import News
from .serializers import NewsSerializer

class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", None) == "Admin"


class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all().order_by("-created_at")
    serializer_class = NewsSerializer

    # def get_permissions(self):
    #     if self.action in ["create", "update", "partial_update", "destroy"]:
    #         # return [IsAdminUserRole()]
    #     return [permissions.AllowAny()]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            # Require authentication for creating, updating, and deleting.
            return [permissions.IsAuthenticated()]
        # Allow any user (authenticated or not) to view news details or list.
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user, published_date=timezone.now())
