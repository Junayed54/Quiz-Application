from django.urls import path
from .views import *
from django.views.generic import TemplateView


urlpatterns = [
    path("api/save-device-token/", save_device_token, name="save_device_token"),
    path("api/notifications/send/", SendNotificationView.as_view(), name="send_notification"),
    path('api/device-token/', RegisterDeviceTokenView.as_view()),
    path('api/segment-users/', SegmentUsersView.as_view(), name='segment-users'),
    path('api/send-notification/', SendNotificationView.as_view(), name='send-notification'),
]



# Templates

urlpatterns += [
    path('segment-dashboard/', TemplateView.as_view(template_name="Html/custom/notifications/send_notification.html")),
]