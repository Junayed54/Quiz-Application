# root urls.py
import nested_admin
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from django.views.static import serve
from quiz.routing import websocket_urlpatterns
from django.views.generic import TemplateView


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
    path('', include('news.urls')),
    
    path('', include("notifications.urls")),
    
    # Expose firebase-messaging-sw.js at root
    re_path(r'^firebase-messaging-sw.js$', serve, {
        'path': 'firebase-messaging-sw.js',
        'document_root': settings.BASE_DIR,
    }),
    
    path("robots.txt", TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
    path("sitemap.xml", TemplateView.as_view(template_name="sitemap.xml", content_type="application/xml")),
]



# urlpatterns += websocket_urlpatterns
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)