from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SubscriptionPackage
from .serializers import SubscriptionPackageSerializer
from quiz.permissions import IsAdmin
from rest_framework_simplejwt.authentication import JWTAuthentication
class SubscriptionPackageListCreateView(generics.ListCreateAPIView):
    queryset = SubscriptionPackage.objects.all()
    serializer_class = SubscriptionPackageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]
    
    def create(self, request, *args, **kwargs):
        # print("hello")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Validate percentages before saving
            try:
                # Collect percentages
                package = SubscriptionPackage(**serializer.validated_data)
                package.validate_percentages()  # Validate total percentage
                package.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionPackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubscriptionPackage.objects.all()
    serializer_class = SubscriptionPackageSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            # Validate percentages before updating
            try:
                package = SubscriptionPackage(**serializer.validated_data)
                package.validate_percentages()  # Validate total percentage
                self.perform_update(serializer)
                return Response(serializer.data)
            except ValueError as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubscriptionPackageActionView(generics.GenericAPIView):
    queryset = SubscriptionPackage.objects.all()
    serializer_class = SubscriptionPackageSerializer

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a subscription package."""
        package = self.get_object()
        package.is_active = True  # Assuming there's an 'is_active' field
        package.save()
        return Response({"detail": "Package activated successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a subscription package."""
        package = self.get_object()
        package.is_active = False  # Assuming there's an 'is_active' field
        package.save()
        return Response({"detail": "Package deactivated successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def apply_discount(self, request, pk=None):
        """Apply a discount to the subscription package."""
        package = self.get_object()
        discount_percentage = request.data.get("discount_percentage", 0)

        if 0 <= discount_percentage <= 100:
            discount_amount = (discount_percentage / 100) * package.price
            package.price -= discount_amount
            package.save()
            return Response({"detail": f"Discount applied successfully. New price: ${package.price}"}, status=status.HTTP_200_OK)
        return Response({"detail": "Invalid discount percentage."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        """Generate a report for the subscription package."""
        package = self.get_object()
        report_data = {
            "name": package.name,
            "price": package.price,
            "duration": package.duration_in_days,
            "max_exams": package.max_exams,
            "difficulty_distribution": {
                "very_easy": package.very_easy_percentage,
                "easy": package.easy_percentage,
                "medium": package.medium_percentage,
                "hard": package.hard_percentage,
                "very_hard": package.very_hard_percentage,
                "expert": package.expert_percentage,
            },
        }
        return Response(report_data, status=status.HTTP_200_OK)
