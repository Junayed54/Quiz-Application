# root urls.py
import nested_admin
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from quiz.routing import websocket_urlpatterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('nested_admin/', include('nested_admin.urls')),
    path('', include('frontend.urls')),
    path("api-auth/", include("rest_framework.urls")),
    path('auth/', include('users.urls')),
    path('accounts/', include('allauth.urls')),
    path('quiz/', include('quiz.urls')),  # Quiz-related URLs
    path('api/', include('invitation.urls')),
    path('', include('subscription.urls')), # Subcription-related URLs
    path('', include('govt_jobs.urls')),
    path('', include('quickquiz.urls')),
    path('', include('written_exam.urls')),
]
# urlpatterns += websocket_urlpatterns
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)