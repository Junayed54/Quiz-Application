from django.urls import path
from .views import SubscriptionPackageListCreateView, SubscriptionPackageDetailView, SubscriptionPackageActionView
from django.views.generic import TemplateView

urlpatterns = [
    path('packages/', SubscriptionPackageListCreateView.as_view(), name='subscription-package-list-create'),
    path('packages/<int:pk>/', SubscriptionPackageDetailView.as_view(), name='subscription-package-detail'),
    path('packages/<int:pk>/actions/', SubscriptionPackageActionView.as_view(), name='subscription-package-actions'),
    
    
    
    path('create_package/', TemplateView.as_view(template_name='Html/custom/package/create_package.html'), name='create_package'),
    path('all_packages/', TemplateView.as_view(template_name='Html/custom/package/all_packages.html'), name = 'all_packages'),
]