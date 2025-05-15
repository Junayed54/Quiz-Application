from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import (
    SubscriptionPlanTier,
    SubscriptionPlanPrice,
    PlanExamAccessLimit,
    UserSubscription,
    UserExamAccess,
)

from django.contrib.auth import get_user_model
User = get_user_model()


# 1. SubscriptionPlanTier Serializer
class SubscriptionPlanTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlanTier
        fields = '__all__'


# 2. SubscriptionPlanPrice Serializer
class SubscriptionPlanPriceSerializer(serializers.ModelSerializer):
    plan_tier = serializers.SlugRelatedField(slug_field='name', queryset=SubscriptionPlanTier.objects.all())

    class Meta:
        model = SubscriptionPlanPrice
        fields = '__all__'


# 3. PlanExamAccessLimit Serializer
class PlanExamAccessLimitSerializer(serializers.ModelSerializer):
    plan_tier = serializers.SlugRelatedField(slug_field='name', queryset=SubscriptionPlanTier.objects.all())
    content_type = serializers.SlugRelatedField(slug_field='model', queryset=ContentType.objects.all())

    class Meta:
        model = PlanExamAccessLimit
        fields = '__all__'


# 4. UserSubscription Serializer
class UserSubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    plan = serializers.SlugRelatedField(slug_field='name', queryset=SubscriptionPlanTier.objects.all())

    class Meta:
        model = UserSubscription
        fields = '__all__'


# 5. UserExamAccess Serializer
class UserExamAccessSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    content_type = serializers.SlugRelatedField(slug_field='model', queryset=ContentType.objects.all())

    class Meta:
        model = UserExamAccess
        fields = ['id', 'user', 'content_type', 'object_id', 'accessed_at']
