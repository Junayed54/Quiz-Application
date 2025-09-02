# news/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewsViewSet
from django.views.generic import TemplateView

router = DefaultRouter()
router.register(r'news', NewsViewSet, basename='news')

urlpatterns = [
    path('api/', include(router.urls)),
]


# Template

urlpatterns +=[
    path('news/create/', TemplateView.as_view(template_name="Html/custom/news/news_create.html")),
    
]
