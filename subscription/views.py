from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from .models import (
    SubscriptionPlanTier, SubscriptionPlanPrice,
    PlanExamAccessLimit, UserSubscription, UserExamAccess
)
from .serializers import (
    SubscriptionPlanTierSerializer, SubscriptionPlanPriceSerializer,
    PlanExamAccessLimitSerializer, UserSubscriptionSerializer,
    UserExamAccessSerializer
)
from quiz.models import Exam, PastExam  # adjust import as needed


class SubscriptionPlanTierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlanTier.objects.all()
    serializer_class = SubscriptionPlanTierSerializer
    permission_classes = [permissions.AllowAny]


class SubscriptionPlanPriceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlanPrice.objects.select_related('plan_tier').all()
    serializer_class = SubscriptionPlanPriceSerializer
    permission_classes = [permissions.AllowAny]


class PlanExamAccessLimitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlanExamAccessLimit.objects.select_related('plan_tier', 'content_type').all()
    serializer_class = PlanExamAccessLimitSerializer
    permission_classes = [permissions.AllowAny]


class UserSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserExamAccessViewSet(viewsets.ModelViewSet):
    serializer_class = UserExamAccessSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserExamAccess.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        content_type = serializer.validated_data['content_type']
        object_id = serializer.validated_data['object_id']
        content_model = content_type.model_class()
        instance = get_object_or_404(content_model, pk=object_id)

        plan = UserSubscription.objects.filter(user=self.request.user, is_active=True).first()
        if not plan:
            return Response({"error": "No active subscription"}, status=400)

        access_limit = PlanExamAccessLimit.objects.filter(
            plan_tier=plan.plan,
            content_type=content_type
        ).first()

        if access_limit:
            access_count = UserExamAccess.objects.filter(
                user=self.request.user,
                content_type=content_type
            ).count()
            if access_count >= access_limit.max_access_count:
                return Response({"error": "Access limit reached"}, status=403)

        serializer.save(user=self.request.user)
