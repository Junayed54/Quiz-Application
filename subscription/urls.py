from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionPlanTierViewSet, SubscriptionPlanPriceViewSet,
    PlanExamAccessLimitViewSet, UserSubscriptionViewSet,
    UserExamAccessViewSet
)

router = DefaultRouter()

router.register(r'subscription-plans', SubscriptionPlanTierViewSet)
router.register(r'plan-prices', SubscriptionPlanPriceViewSet)
router.register(r'access-limits', PlanExamAccessLimitViewSet)
router.register(r'user-subscriptions', UserSubscriptionViewSet, basename='user-subscription')
router.register(r'user-exam-accesses', UserExamAccessViewSet, basename='user-exam-access')

urlpatterns = router.urls
